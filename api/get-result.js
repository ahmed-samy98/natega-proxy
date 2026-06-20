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
        const targetUrl = 'https://natiga.edudk.net/P20262026/public/search'; 
        
        const response = await axios.post(targetUrl, {
            seat_no: seat_no
        });

        const $ = cheerio.load(response.data);
        
        // استخراج البيانات (يمكن تعديل الكلاسات لاحقاً لتطابق كود موقع المديرية الفعلي)
        const studentName = $('.student-name').text().trim() || 'غير معروف';
        const totalScore = $('.total-score').text().trim() || 'غير معروف';

        return res.status(200).json({
            name: studentName,
            total: totalScore,
            grade: 'الصف الثالث الإعدادي'
        });

    } catch (error) {
        return res.status(500).json({ error: 'حدث خطأ أثناء الاتصال بسيرفر المديرية لجلب البيانات' });
    }
};
