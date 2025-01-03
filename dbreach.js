const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

const scrapeDbreach = async (email) => {
  puppeteer.use(StealthPlugin());

  const browser = await puppeteer.launch({
    headless: false,
    args: [
      '--window-size=1920,1080', // Set window size
      '--window-position=-10000,0', // Move the browser off-screen (simulate minimization)
    ],
  });

  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36');

  const URL = 'https://haveibeenpwned.com/'

  try {
    await page.goto(URL, { waitUntil: 'networkidle2' });

    await page.evaluate(() => {
      window.scrollBy(0, window.innerHeight);
    });

    await page.evaluate(() => {
      window.scrollBy(0, -1 * window.innerHeight);
    });

    // Fill out the form fields
    await page.type('#Account', email);

    // Click the button
    await page.click('#searchPwnage'); // Replace #submit-button with the actual selector

    const resultSelector = "#pwnedWebsiteBanner.in"
    const noResultSelector = "#noPwnage.in"

    const elementHandle = await Promise.race([
      page.waitForSelector(resultSelector, { visible: true }),
      page.waitForSelector(noResultSelector, { visible: true }),
    ]);

    if (!elementHandle) {
      console.log('No selector appeared within the timeout.');

      await browser.close();
      throw new Error("scrapping failed: selectors are not found")
    }

    const { output, id } = await elementHandle.evaluate(el => {

      if (el.id == "pwnedWebsiteBanner") {
        const resultElements = document.querySelectorAll("#pwnedSites > div")
        const result = []
        for (let e of resultElements) {
          let descElement = e.querySelector("p")
          const desc = descElement.textContent.trim().replace(/\s+/g, ' ').replace(/\n/g, '')

          let dataElement = e.querySelector("p.dataClasses")
          const data = dataElement.textContent.trim()

          let imgElement = e.querySelector("img")
          const imgUrl = imgElement.src

          result.push({
            desc, data, imgUrl
          })
        }

        return {
          output: {
            status: "success",
            email,
            result
          },
          id: el.id
        }
      } else if (el.id == "noPwnage") {
        return {
          output: {
            status: "success",
            email,
            result: []
          },
          id: el.id
        }
      } else {
        return {
          status: "error"
        }
      }
    })
    console.log(`id selector: ${id}`)
    console.log(output)

    await browser.close();
    return output.result
  } catch (error) {
    await browser.close();
    throw new Error(error.message)
  }

};


module.exports = {
  scrapeDbreach
}
