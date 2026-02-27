const express = require('express');
const { PastPapersScraper, CREATOR } = require('./scraper');

const app = express();
app.use(express.json());

const scraper = new PastPapersScraper();

const asciiArt = `
  _____            _               _    ____ _____ 
 |  __ \\          (_)             | |  / __ \\_   _|
 | |__) |__ ___   ___   _  __ _   | | | |  | || |  
 |  _  // _\` \\ \\ / / | | |/ _\` |  | | | |  | || |  
 | | \\ \\ (_| |\\ V /| | |_| (_| |  | | | |__| || |_ 
 |_|  \\_\\__,_| \\_/ |_|\\__, |\\__,_|  |_|  \\____/_____|
                       __/ |                       
                      |___/  Created by @Raviya
`;

// Home Route
app.get('/', (req, res) => {
    res.json({
        message: "RAVIYA Past Papers API",
        creator: CREATOR,
        status: "Public (No API Key Required)",
        endpoints: { 
            search: "/api/search?q=maths&page=1",
            recent: "/api/recent?page=1",
            details: "/api/details?url=paper_url",
            download: "/api/download?url=direct_file_url_here" 
        }
    });
});

// Search Endpoint
app.get('/api/search', async (req, res) => {
    const q = req.query.q || req.query.text;
    const page = req.query.page || 1;
    
    if (!q) {
        return res.status(400).json({ status: false, creator: CREATOR, message: "Query parameter 'q' is missing!" });
    }

    const result = await scraper.searchPapers(q, page);
    res.json(result);
});

// Recent Papers Endpoint
app.get('/api/recent', async (req, res) => {
    const page = req.query.page || 1;
    const result = await scraper.getRecentPapers(page);
    res.json(result);
});

// Paper Details Endpoint
app.get('/api/details', async (req, res) => {
    const url = req.query.url;
    
    if (!url) {
        return res.status(400).json({ status: false, creator: CREATOR, message: "Query parameter 'url' is missing!" });
    }

    const result = await scraper.getPaperDetails(url);
    res.json(result);
});

// Download Endpoint
app.get('/api/download', async (req, res) => {
    const url = req.query.url;
    
    if (!url) {
        return res.status(400).json({ status: false, creator: CREATOR, message: "Query parameter 'url' is missing! Give a direct PDF/ZIP url." });
    }
    
    await scraper.downloadStream(url, res);
});

if (process.env.NODE_ENV !== 'production') {
    app.listen(3000, () => {
        console.log('\x1b[36m%s\x1b[0m', asciiArt);
        console.log(`✅ API running on port 3000`);
    });
}

module.exports = app;
