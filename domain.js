const puppeteer = require('puppeteer');
// const fs = require('fs');

const scrapeIOCdomain = async (domain) => {
  const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay))
  const browser = await puppeteer.launch();

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  const url = `https://www.virustotal.com/gui/domain/${domain}`

  console.log(`URL: ${url}`)

  try {
    await page.goto(url, { waitUntil: ['networkidle0', 'load'] });

    await sleep(3000)

    let { status, result } = await page.evaluate(() => {
      // Community Score
      // /html/body/vt-ui-shell/div[2]/domain-view//vt-ui-main-generic-report//div/div[1]/div[1]/vt-ioc-score-widget//div/vt-ioc-score-widget-detections-chart//div/div
      let vtShell = document.querySelector("vt-ui-shell");
      let domainView = vtShell.querySelector("domain-view").shadowRoot;
      let genericReport = domainView.querySelector("vt-ui-main-generic-report");
      // let ipCard = genericReport.querySelector("vt-ui-ip-card").shadowRoot;

      // /html/body/vt-ui-shell/div[2]/ip-address-view//vt-ui-main-generic-report//div/div[1]/div[1]/vt-ioc-score-widget//div/vt-ioc-score-widget-detections-chart//div/div/div[1]

      let genReportShadow = genericReport.shadowRoot
      let iocScoreWidget = genReportShadow.querySelector("vt-ioc-score-widget").shadowRoot
      let iocScoreChart = iocScoreWidget.querySelector("vt-ioc-score-widget-detections-chart").shadowRoot
      let csp = iocScoreChart.querySelectorAll(".w-100.h-100.rounded-circle.bg-body-secondary.text-body-tertiary.text-center.vstack.justify-content-center > div")

      let css = []

      for (let e of csp)
        css.push(e.textContent.trim())

      let cs = css.join("").replace(/\s+/g, "")

      // registrar
      // /html/body/vt-ui-shell/div[2]/domain-view//vt-ui-main-generic-report/vt-ui-domain-card//div/div[2]/div/div/div[1]
      let domainCard = genericReport.querySelector("vt-ui-domain-card").shadowRoot
      let reg = domainCard.querySelector(".vstack.gap-2.my-auto > .hstack.gap-4 > div:nth-child(3) > a").textContent.trim()

      return {
        status: 'success',
        result: {
          cs,
          reg
        }

      }
    });
    const data = {
      status, result,
      link: url,
      type: "d"
    }
    console.log(data);

    await browser.close();
    return data
  } catch (error) {
    await browser.close();
    throw new Error(error.message)
  }
};

module.exports = { scrapeIOCdomain }