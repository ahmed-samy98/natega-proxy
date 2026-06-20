const axios = require('axios');

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
        // الرابط الفعلي والنشط للـ API الحكومي الذي اصطدته بنجاح!
        const targetUrl = `https://natiga.edudk.net/P20262026/public/api_result.php?seat=${encodeURIComponent(seat_no)}`; 
        
        const response = await axios.get(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            timeout: 10000
        });

        // إرجاع بيانات الـ JSON الرسمية المستلمة من المديرية مباشرة لموقعك
        return res.status(200).json(response.data);

    } catch (error) {
        return res.status(500).json({ 
            error: 'حدث خطأ أثناء الاتصال بسيرفر المديرية', 
            details: error.message 
        });
    }
};
