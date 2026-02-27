const express = require('express');
const { generateImage } = require('./scraper');

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
    res.json({
        message: "RAVIYA Zoner AI API",
        creator: "@Raviya",
        status: "Public",
        endpoints: { generate: "/api/text2img?prompt=cat&size=1024x1024" }
    });
});

app.get('/api/text2img', async (req, res) => {
    const prompt = req.query.prompt || req.query.q;
    const size = req.query.size || "1024x1024";
    
    if (!prompt) {
        return res.status(400).json({ status: false, creator: "@Raviya", message: "Query parameter 'prompt' is missing!" });
    }

    try {
        const result = await generateImage(prompt, size);
        res.json(result);
    } catch (error) {
        res.status(500).json({ status: false, creator: "@Raviya", message: error.message || "Server Error" });
    }
});

if (process.env.NODE_ENV !== 'production') {
    app.listen(3000, () => console.log(`✅ Zoner AI API running on port 3000`));
}
module.exports = app;