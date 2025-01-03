const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');


const scrapeIOCHash = async (hash) => {
  puppeteer.use(StealthPlugin());

  const url = `https://www.virustotal.com/gui/file/${hash}`
  const browser = await puppeteer.launch();

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  try {
    console.log("browsing the web")
    await page.goto(url, { waitUntil: ['networkidle0', 'load'] });
    console.log("web has been retrieved")


    let { cs, lbl, tc, fl } = await page.evaluate(() => {
      // Community Score
      // /html/body / vt - ui - shell / div[2] / file - view//vt-ui-main-generic-report/vt-ui-file-card//div/div[1]/div[1]/text()
      let vtShell = document.querySelector("vt-ui-shell");
      let fileView = vtShell.querySelector("file-view").shadowRoot;
      let genericReport = fileView.querySelector("vt-ui-main-generic-report");

      // /html/body/vt-ui-shell/div[2]/file-view//vt-ui-main-generic-report//div/div[1]/div[1]/vt-ioc-score-widget//div/vt-ioc-score-widget-detections-chart//div/div/div[1]
      let genReportShadow = genericReport.shadowRoot
      let iocScoreWidget = genReportShadow.querySelector("vt-ioc-score-widget").shadowRoot
      let iocScoreChart = iocScoreWidget.querySelector("vt-ioc-score-widget-detections-chart").shadowRoot
      let csp = iocScoreChart.querySelectorAll(".w-100.h-100.rounded-circle.bg-body-secondary.text-body-tertiary.text-center.vstack.justify-content-center > div")

      let css = []

      for (let e of csp)
        css.push(e.textContent.trim())

      let cs = css.join("").replace(/\s+/g, "")

      // Label
      ///html/body/vt-ui-shell/div[2]/file-view//vt-ui-main-generic-report/span/div/div[1]/a/text()
      lbl = genericReport.querySelector(".link-danger.hstack.gap-1").textContent.trim()


      // Threat Categories
      // /html/body/vt-ui-shell/div[2]/file-view//vt-ui-main-generic-report/span/div/div[2]/div/a
      let tcparent = genericReport.querySelectorAll(".tags.hstack.gap-2")[0]
      let tce = tcparent.querySelectorAll(".badge.rounded-pill.bg-body-tertiary.text-body")
      tc = []
      for (let e of tce)
        tc.push(e.textContent.trim())

      // Family Labels
      // /html/body/vt-ui-shell/div[2]/file-view//vt-ui-main-generic-report/span/div/div[3]/div/a[1]
      let flparent = genericReport.querySelectorAll(".tags.hstack.gap-2")[1]
      let fle = flparent.querySelectorAll(".badge.rounded-pill.bg-body-tertiary.text-body")
      let fl = []
      for (let e of fle)
        fl.push(e.textContent.trim())

      return {
        cs, lbl, tc, fl
      }
    });

    const data = {
      cs,
      lbl,
      tc,
      fl,
      link: url,
      type: "h"

    }

    console.log(data);

    await browser.close();

    return data
  } catch (error) {
    await browser.close();
    throw new Error(error.message)
  }

};

module.exports = {
  scrapeIOCHash
}