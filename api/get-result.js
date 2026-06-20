const axios = require('axios');
const cheerio = require('cheerio');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { seat_no } = req.query;
    if (!seat_no) {
        return res.status(400).json({ error: 'يرجى إرسال رقم الجلوس' });
    }

    try {
        // التوجيه المباشر لملف المعالجة index.php لتجاوز حظر الـ 405 للسيرفر تماماً ومراسلة قاعدة البيانات
        const targetUrl = 'https://natiga.edudk.net/P20262026/public/index.php'; 
        
        // صياغة البيانات بالشكل الصحيح والسيرفر مستعد لاستقبالها كـ POST
        const params = new URLSearchParams();
        params.append('seat_no', seat_no);
        
        const response = await axios.post(targetUrl, params, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            timeout: 10000 // مهلة الاتصال 10 ثوانٍ
        });

        const $ = cheerio.load(response.data);
        
        let studentName = 'غير معروف';
        let totalScore = 'غير معروف';

        // كود استخراج البيانات الذكي من الجداول
        $('td, th, span, div, p').each((index, element) => {
            const text = $(element).text().trim();
            
            if (text.includes('الاسم') || text.includes('اسم الطالب')) {
                const nextText = $(element).next().text().trim() || $(element).parent().find('td').eq(1).text().trim();
                if (nextText && nextText !== text) {
                    studentName = nextText;
                }
            }
            
            if (text.includes('المجموع') || text.includes('المجموع الكلي')) {
                const nextText = $(element).next().text().trim() || $(element).parent().find('td').eq(1).text().trim();
                if (nextText && nextText !== text) {
                    totalScore = nextText;
                }
            }
        });

        const bodyText = $('body').text();
        if (studentName === 'غير معروف') {
            const nameMatch = bodyText.match(/(?:الاسم|اسم الطالب)\s*[:：\-]?\s*([^\n\t\r]+)/);
            if (nameMatch) studentName = nameMatch[1].trim();
        }
        if (totalScore === 'غير معروف') {
            const scoreMatch = bodyText.match(/(?:المجموع|المجموع الكلي)\s*[:：\-]?\s*([0-9.]+)/);
            if (scoreMatch) totalScore = scoreMatch[1].trim();
        }

        return res.status(200).json({
            name: studentName,
            total: totalScore,
            grade: 'الصف الثالث الإعدادي'
        });

    } catch (error) {
        return res.status(500).json({ 
            error: 'حدث خطأ أثناء الاتصال بسيرفر المديرية', 
            details: error.message 
        });
    }
};
