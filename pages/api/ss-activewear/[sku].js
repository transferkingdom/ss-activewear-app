import axios from 'axios';

export default async function handler(req, res) {
  try {
    const { sku } = req.query;
    
    if (!process.env.SS_API_USERNAME || !process.env.SS_API_KEY) {
      throw new Error('API kimlik bilgileri eksik');
    }

    const auth = Buffer.from(
      `${process.env.SS_API_USERNAME}:${process.env.SS_API_KEY}`
    ).toString('base64');

    // Doğrudan ürün numarası ile sorgulama yapalım
    const url = `https://api.ssactivewear.com/v2/products/${sku}`;
    
    console.log('API İsteği yapılıyor:', url);

    const response = await axios({
      method: 'get',
      url: url,
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    // Yanıt boş ise veya data yoksa
    if (!response.data || response.data.length === 0) {
      return res.status(404).json({
        error: 'Ürün bulunamadı',
        requestedSku: sku
      });
    }

    return res.status(200).json(response.data);

  } catch (error) {
    console.error('API Hatası:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url
    });

    // Özel hata mesajları
    if (error.response?.status === 404) {
      return res.status(404).json({
        error: 'Ürün bulunamadı',
        details: error.response.data,
        requestedSku: sku
      });
    }

    if (error.response?.status === 401) {
      return res.status(401).json({
        error: 'API kimlik doğrulama hatası',
        message: 'Lütfen API kimlik bilgilerini kontrol edin'
      });
    }

    return res.status(500).json({
      error: 'API hatası',
      message: error.message,
      requestInfo: {
        sku: sku,
        endpoint: url
      }
    });
  }
}