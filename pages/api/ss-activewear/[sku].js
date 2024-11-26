import axios from 'axios';

export default async function handler(req, res) {
  try {
    const { sku } = req.query;
    
    // API kimlik bilgilerini kontrol et
    if (!process.env.SS_API_USERNAME || !process.env.SS_API_KEY) {
      console.error('API Kimlik Bilgileri Eksik:', {
        username: process.env.SS_API_USERNAME ? 'Mevcut' : 'Eksik',
        key: process.env.SS_API_KEY ? 'Mevcut' : 'Eksik'
      });
      
      return res.status(500).json({
        error: 'API yapılandırma hatası',
        message: 'API kimlik bilgileri eksik veya hatalı'
      });
    }

    // Basic auth için kimlik bilgilerini hazırla
    const auth = Buffer.from(
      `${process.env.SS_API_USERNAME}:${process.env.SS_API_KEY}`
    ).toString('base64');

    // API endpoint'ini oluştur
    const baseUrl = 'https://api.ssactivewear.com/v2';
    const endpoint = `/products/${sku}`;
    const url = `${baseUrl}${endpoint}`;

    console.log('API İsteği Başlatılıyor:', {
      url: url,
      sku: sku,
      hasAuth: !!auth
    });

    // API isteğini yap
    const response = await axios({
      method: 'get',
      url: url,
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      // Timeout ekle
      timeout: 10000,
      // Hata detaylarını al
      validateStatus: null
    });

    console.log('API Yanıtı:', {
      status: response.status,
      hasData: !!response.data,
      dataLength: Array.isArray(response.data) ? response.data.length : 'N/A'
    });

    // Yanıt kontrolü
    if (response.status !== 200) {
      throw new Error(`API ${response.status} durum kodu döndürdü`);
    }

    if (!response.data || (Array.isArray(response.data) && response.data.length === 0)) {
      return res.status(404).json({
        error: 'Ürün bulunamadı',
        sku: sku,
        timestamp: new Date().toISOString()
      });
    }

    // Başarılı yanıt
    return res.status(200).json(response.data);

  } catch (error) {
    // Detaylı hata loglaması
    console.error('API Hatası:', {
      message: error.message,
      stack: error.stack,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers ? 'Mevcut' : 'Eksik'
      },
      response: {
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers
      },
      timestamp: new Date().toISOString()
    });

    // Hata yanıtı
    return res.status(500).json({
      error: 'API isteği başarısız',
      details: {
        message: error.message,
        status: error.response?.status || 500,
        timestamp: new Date().toISOString()
      },
      requestInfo: {
        sku: sku,
        url: error.config?.url || 'URL bilgisi yok'
      }
    });
  }
}