const axios = require('axios');
const cheerio = require('cheerio');
const CREATOR = "@Raviya";

class PastPapersScraper {
    constructor() {
        this.baseUrl = 'https://pastpapers.wiki';
        this.axiosInstance = axios.create({
            baseURL: this.baseUrl,
            timeout: 15000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
    }

    async searchPapers(searchTerm, page = 1) {
        try {
            const url = `/page/${page}/?s=${encodeURIComponent(searchTerm)}`;
            const response = await this.axiosInstance.get(url);
            const $ = cheerio.load(response.data);
          
            const papers = [];
            $('.post-item, .search-result-item, article').each((i, elem) => {
                const title = $(elem).find('h2 a, .post-title a, h3 a').first().text().trim();
                const link = $(elem).find('h2 a, .post-title a, h3 a').first().attr('href');
                const image = $(elem).find('img').first().attr('src');
              
                if (title && link) {
                    papers.push({ title, url: link, image: image || null });
                }
            });
            return { status: true, creator: CREATOR, data: papers };
        } catch (error) {
            return { status: false, creator: CREATOR, message: error.message || "Search error" };
        }
    }

    async getPaperDetails(url) {
        try {
            const response = await this.axiosInstance.get(url);
            const $ = cheerio.load(response.data);
          
            const details = {
                title: $('h1, .post-title').first().text().trim(),
                description: $('.post-content p').first().text().trim(),
                downloadLinks: [],
                images: []
            };

            $('a[href*=".pdf"], a[href*=".zip"], a[href*="download"], .download-btn, .btn-download')
                .each((i, elem) => {
                    const href = $(elem).attr('href');
                    const text = $(elem).text().trim();
                  
                    if (href && (href.includes('.pdf') || href.includes('.zip') || text.toLowerCase().includes('download'))) {
                        details.downloadLinks.push({
                            text: text || 'Download',
                            url: this.isAbsoluteUrl(href) ? href : new URL(href, this.baseUrl).href,
                            type: href.includes('.pdf') ? 'pdf' : href.includes('.zip') ? 'zip' : 'link'
                        });
                    }
                });

            return { status: true, creator: CREATOR, data: details };
        } catch (error) {
            return { status: false, creator: CREATOR, message: error.message || "Details fetch error" };
        }
    }

    async getRecentPapers(page = 1) {
        try {
            const url = `/page/${page}/`;
            const response = await this.axiosInstance.get(url);
            const $ = cheerio.load(response.data);
          
            const papers = [];
            $('.post-item, article, .search-result-item').each((i, elem) => {
                const title = $(elem).find('h2 a, .entry-title a').first().text().trim();
                const link = $(elem).find('h2 a, .entry-title a').first().attr('href');
              
                if (title && link) {
                    papers.push({
                        title,
                        url: link,
                        image: $(elem).find('img').first().attr('src') || null
                    });
                }
            });
            return { status: true, creator: CREATOR, data: papers };
        } catch (error) {
            return { status: false, creator: CREATOR, message: error.message || "Recent papers error" };
        }
    }

    async downloadStream(fileUrl, res) {
        try {
            const response = await axios({
                method: 'GET',
                url: fileUrl,
                responseType: 'stream',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });

            const contentType = response.headers['content-type'];
            const contentDisposition = response.headers['content-disposition'];

            if (contentType) res.setHeader('Content-Type', contentType);
            
            if (contentDisposition) {
                res.setHeader('Content-Disposition', contentDisposition);
            } else {
                let ext = contentType && contentType.includes('zip') ? 'zip' : 'pdf';
                res.setHeader('Content-Disposition', `attachment; filename="Raviya-PastPaper.${ext}"`);
            }

            response.data.pipe(res);
        } catch (error) {
            if (!res.headersSent) {
                res.status(500).json({ status: false, creator: CREATOR, message: "Download failed! Please check the direct URL." });
            }
        }
    }

    isAbsoluteUrl(url) {
        return url.startsWith('http://') || url.startsWith('https://');
    }
}

module.exports = { PastPapersScraper, CREATOR };
