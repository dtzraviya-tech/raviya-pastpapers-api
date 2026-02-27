const axios = require("axios");
const https = require("https");
const FormData = require("form-data");

const CREATOR = "@Raviya";

async function generateImage(prompt, size = "1024x1024") {
    try {
        const formData = new FormData();
        formData.append("Prompt", prompt);
        formData.append("Size", size);
        formData.append("Upscale", 0);
        formData.append("Language", "eng_Latn");
        formData.append("Batch_Index", 0);

        const { data } = await axios.post(
            "https://api.zonerai.com/zoner-ai/txt2img",
            formData,
            {
                headers: {
                    "Origin": "https://zonerai.com",
                    "Referer": "https://zonerai.com/",
                    "User-Agent": "Mozilla/5.0",
                    "X-Client-Platform": "web",
                    ...formData.getHeaders()
                },
                responseType: "arraybuffer", // Buffer එකක් විදිහට ගන්නවා
                httpsAgent: new https.Agent({ rejectUnauthorized: false }),
                timeout: 60000 // Image හැදෙන්න වෙලා යන නිසා තත්පර 60ක් දෙනවා
            }
        );

        // Buffer එක Base64 වලට හරවනවා
        const base64Image = Buffer.from(data, 'binary').toString('base64');
        const finalBase64 = `data:image/png;base64,${base64Image}`;

        return {
            status: true,
            creator: CREATOR,
            prompt: prompt,
            size: size,
            result_base64: finalBase64
        };
    } catch (error) {
        return { status: false, creator: CREATOR, message: error.message };
    }
}

module.exports = { generateImage };