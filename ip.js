const puppeteer = require('puppeteer');
// const fs = require('fs');

const scrapeIOCIP = async (ip) => {
  const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay))
  const browser = await puppeteer.launch();

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  const url = `https://www.virustotal.com/gui/ip-address/${ip}`
  try {
    await page.goto(url, { waitUntil: ['networkidle0', 'load'] });

    await sleep(3000)

    let { cs, as, img } = await page.evaluate(() => {
      // Community Score
      // /html/body / vt - ui - shell / div[2] / file - view//vt-ui-main-generic-report/vt-ui-file-card//div/div[1]/div[1]/text()
      // /html/body/vt-ui-shell/div[2]/ip-address-view//vt-ui-main-generic-report/vt-ui-ip-card//div/div[1]/div[1]/text()
      let vtShell = document.querySelector("vt-ui-shell");
      let ipView = vtShell.querySelector("ip-address-view").shadowRoot;
      let genericReport = ipView.querySelector("vt-ui-main-generic-report");
      let ipCard = genericReport.querySelector("vt-ui-ip-card").shadowRoot;

      // /html/body/vt-ui-shell/div[2]/ip-address-view//vt-ui-main-generic-report//div/div[1]/div[1]/vt-ioc-score-widget//div/vt-ioc-score-widget-detections-chart//div/div/div[1]

      let genReportShadow = genericReport.shadowRoot
      let iocScoreWidget = genReportShadow.querySelector("vt-ioc-score-widget").shadowRoot
      let iocScoreChart = iocScoreWidget.querySelector("vt-ioc-score-widget-detections-chart").shadowRoot
      let csp = iocScoreChart.querySelectorAll(".w-100.h-100.rounded-circle.bg-body-secondary.text-body-tertiary.text-center.vstack.justify-content-center > div")

      let css = []

      for (let e of csp)
        css.push(e.textContent.trim())

      let cs = css.join("").replace(/\s+/g, "")

      // AS
      // /html/body/vt-ui-shell/div[2]/ip-address-view//vt-ui-main-generic-report/vt-ui-ip-card//div/div[2]/div/div[1]/div[1]/div[2]
      let asp = ipCard.querySelectorAll(".vstack.gap-2.align-self-center.text-truncate.me-auto > .hstack.gap-2")

      let ASResult = []
      for (let e of asp)
        ASResult.push(e.textContent)

      let as = ASResult[1].trim()

      // Country img URL
      // /html/body/vt-ui-shell/div[2]/ip-address-view//vt-ui-main-generic-report/vt-ui-ip-card//div/div[2]/div/div[1]/a/img
      let img = ipCard.querySelector("#flag").src

      return {
        cs,
        as,
        img
      }
    });

    const data = {
      cs,
      as,
      img,
      link: url,
      type: "i"
    }

    console.log(data);

    await browser.close();
    return data

  } catch (error) {
    await browser.close();
    throw new Error(error.message)
  }

};

module.exports = { scrapeIOCIP }