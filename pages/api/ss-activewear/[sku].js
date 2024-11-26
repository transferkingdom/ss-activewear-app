import axios from 'axios';

export default async function handler(req, res) {
  try {
    const { sku } = req.query;
    
    // API kimlik bilgilerini kontrol et
    if (!process.env.SS_API_USERNAME || !process.env.SS_API_KEY) {
      throw new Error('API kimlik bilgileri eksik');
    }

    // Basic auth için kimlik bilgilerini hazırla
    const auth = Buffer.from(
      `${process.env.SS_API_USERNAME}:${process.env.SS_API_KEY}`
    ).toString('base64');

    // API isteğini yap
    const response = await axios({
      method: 'get',
      url: `https://api.ssactivewear.com/v2/products/?style=${sku}`,
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      }
    });

    // Başarılı yanıt
    return res.status(200).json(response.data);

  } catch (error) {
    // Hata detaylarını logla
    console.error('SS Activewear API Hatası:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });

    // API'den gelen hata yanıtını kontrol et
    if (error.response?.status === 404) {
      return res.status(404).json({
        error: 'Ürün bulunamadı',
        details: error.response.data
      });
    }

    // Genel hata yanıtı
    return res.status(500).json({
      error: 'API isteği başarısız oldu',
      message: error.message
    });
  }
}