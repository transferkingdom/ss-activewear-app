import axios from 'axios';
import rateLimitMiddleware from '../../../lib/rateLimit';

export default async function handler(req, res) {
  try {
    const { sku } = req.query;
    
    // API credentials'ları kontrol et
    if (!process.env.SS_API_USERNAME || !process.env.SS_API_KEY) {
      throw new Error('API credentials are missing');
    }

    const baseURL = 'https://api.ssactivewear.com/v2';
    const auth = Buffer.from(`${process.env.SS_API_USERNAME}:${process.env.SS_API_KEY}`).toString('base64');
    
    console.log('Making API request for SKU:', sku); // Debug log

    const response = await axios.get(`${baseURL}/products`, {
      params: { style: sku },
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      }
    });

    res.status(200).json(response.data);

  } catch (error) {
    console.error('API Error:', error.message); // Debug log
    
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      details: process.env.SS_API_USERNAME ? 'Credentials exist' : 'No credentials'
    });
  }
}