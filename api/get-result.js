const axios = require('axios');
const cheerio = require('cheerio');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    try {
        const targetUrl = 'https://natiga.edudk.net/P20262026/public/index.html'; 
        
        const response = await axios.get(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            timeout: 10000
        });

        const $ = cheerio.load(response.data);
        
        const formAction = $('form').attr('action') || 'لا يوجد أكشن مباشر للفورم';
        const formMethod = $('form').attr('method') || 'لا يوجد ميثود';
        const formInputs = [];
        $('form input').each((i, el) => {
            formInputs.push({
                name: $(el).attr('name'),
                type: $(el).attr('type'),
                value: $(el).attr('value')
            });
        });

        const scripts = [];
        $('script').each((i, el) => {
            const src = $(el).attr('src');
            const content = $(el).html();
            if (src) {
                scripts.push({ type: 'ملف خارجي', src: src });
            } else if (content && (content.includes('seat') || content.includes('ajax') || content.includes('fetch') || content.includes('post'))) {
                // تعديل فني: إرجاع كود الجافا سكريبت بالكامل بدون أي اقتطاع
                scripts.push({ type: 'كود داخلي', content: content }); 
            }
        });

        return res.status(200).json({
            formAction: formAction,
            formMethod: formMethod,
            formInputs: formInputs,
            scripts: scripts,
            htmlSnippet: response.data.substring(0, 1000)
        });

    } catch (error) {
        return res.status(500).json({ 
            error: 'حدث خطأ أثناء فحص وتتبع الصفحة', 
            details: error.message 
        });
    }
};
