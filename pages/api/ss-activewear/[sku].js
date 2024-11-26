import axios from 'axios';

export default async function handler(req, res) {
  try {
    const { sku } = req.query;
    const brand = 'Gildan'; // Marka sabit olarak ayarlandı
    
    // API kimlik bilgilerini kontrol et
    if (!process.env.SS_API_USERNAME || !process.env.SS_API_KEY) {
      throw new Error('API kimlik bilgileri eksik');
    }

    // Basic auth için kimlik bilgilerini hazırla
    const auth = Buffer.from(
      `${process.env.SS_API_USERNAME}:${process.env.SS_API_KEY}`
    ).toString('base64');

    // URL'yi oluştur ve encode et
    const encodedBrand = encodeURIComponent(brand);
    const encodedStyle = encodeURIComponent(sku);
    const url = `https://api.ssactivewear.com/v2/products/?style=${encodedStyle}&brand=${encodedBrand}`;

    // API isteğini yap
    const response = await axios({
      method: 'get',
      url: url,
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    // Başarılı yanıt
    return res.status(200).json(response.data);

  } catch (error) {
    // Hata detaylarını logla
    console.error('SS Activewear API Hatası:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      url: error.config?.url
    });

    // API'den gelen hata yanıtını kontrol et
    if (error.response?.status === 404) {
      return res.status(404).json({
        error: 'API request failed',
        message: error.message,
        details: error.response.data,
        requestInfo: {
          url: 'https://api.ssactivewear.com/v2/products',
          style: sku,
          brand: brand,
          credentials: {
            username: process.env.SS_API_USERNAME ? 'Set' : 'Not set',
            key: process.env.SS_API_KEY ? 'Set' : 'Not set'
          }
        }
      });
    }

    // Genel hata yanıtı
    return res.status(500).json({
      error: 'API isteği başarısız oldu',
      message: error.message,
      requestInfo: {
        url: error.config?.url,
        style: sku,
        brand: brand
      }
    });
  }
}