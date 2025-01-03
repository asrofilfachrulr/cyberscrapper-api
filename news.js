const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');


// Use StealthPlugin with puppeteer
puppeteer.use(StealthPlugin());

// Define the scraping function
const scrapeTheHackerNews = async () => {
  // Launch Puppeteer browser
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  // Set viewport size
  await page.setViewport({ width: 1920, height: 1080 });

  console.log('Browsing the web...');
  await page.goto('https://thehackernews.com/', { waitUntil: 'networkidle2' });

  await autoScroll(page);

  let news = [];

  try {
    // Wait for the element to load (e.g., popular list)
    await page.waitForSelector('#popular-list', { timeout: 5000 });

    // Scraping data from the page
    news = await page.evaluate(() => {
      const newsP = document.querySelectorAll('#popular-list > div');
      let newsArray = [];

      newsP.forEach((e) => {
        const link = e.querySelector('a').href;
        const imgLink = e.querySelector('img').src;
        const title = e.querySelector('.pop-title').textContent;

        newsArray.push({ title, link, imgLink });
      });

      return newsArray;
    });

    console.log(`${news.length} news items found.`);
  } catch (error) {
    console.log('Scraping failed:', error.message);
  } finally {
    await browser.close(); // Close the browser
  }

  return news; // Return the scraped data
};


async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      var totalHeight = 0;
      var distance = 100;
      var timer = setInterval(() => {
        var scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight - window.innerHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
}

module.exports = { scrapeTheHackerNews }