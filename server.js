// server.js
const { scrapeTheHackerNews } = require('./news')
const { scrapeDbreach } = require('./dbreach')
const { scrapeIOCHash } = require('./hash')
const { scrapeIOCIP } = require("./ip")
const { scrapeIOCdomain } = require("./domain")

const express = require('express');
const cors = require('cors');

// Create an Express app
const app = express();
const port = 8080;
app.use(cors());  // This will allow all origins by default


app.get("/scrape-ioc-hash", async (req, res) => {
  try {
    const hash = req.query.hash
    const data = await scrapeIOCHash(hash)

    res.json({ success: true, data })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
})

app.get("/scrape-ioc-ip", async (req, res) => {
  try {
    const ip = req.query.ip

    const ipv4Regex = /^(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]|[0-9])\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]|[0-9])\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]|[0-9])\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]|[0-9])$/;

    // Validate format
    if (ipv4Regex.test(ip)) {
      const data = await scrapeIOCIP(ip)
      res.json({ success: true, data })
    } else {
      res.status(400).json({ success: false, error: "IP is not in valid format" })
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
})

app.get("/scrape-ioc-domain", async (req, res) => {
  try {
    const domain = req.query.domain

    const domainRegex = /^(?!-)[A-Za-z0-9-]{1,63}(?<!-)(\.[A-Za-z]{2,})+$/;

    // Validate format
    if (domainRegex.test(domain)) {
      const data = await scrapeIOCdomain(domain)
      res.json({ success: true, data })
    } else {
      res.status(400).json({ success: false, error: "Domain is not in valid format" })
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
})



app.get('/scrape-news', async (_, res) => {
  try {
    const news = await scrapeTheHackerNews();
    res.json({ success: true, news }); // Return the scraped news as JSON
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/scrape-dbreach', async (req, res) => {
  const email = req.query.email
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (emailRegex.test(email)) {
    try {
      const result = await scrapeDbreach(email)
      res.json({ success: true, result })
    } catch (error) {
      res.status(500).json({ success: false, error: error.message })
    }

  } else {
    res.status(400).json({ success: false, error: "email is not in valid format" })
  }

})

// Start the Express server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
