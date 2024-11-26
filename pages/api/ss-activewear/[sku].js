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

    const response = await axios({
      method: 'get',
      url: `https://api.ssactivewear.com/v2/products/${sku}`,
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 10000
    });

    // Başarılı yanıt
    return res.status(200).json(response.data);

  } catch (error) {
    console.error('API Hatası:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });

    return res.status(error.response?.status || 500).json({
      error: 'API hatası',
      message: error.message
    });
  }
}