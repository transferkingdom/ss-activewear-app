import axios from 'axios';
import rateLimitMiddleware from '../../../lib/rateLimit';

// API response cache
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 dakika

export default async function handler(req, res) {
  // Rate limit kontrolü
  if (!(await rateLimitMiddleware(req, res))) return;

  const { sku } = req.query;

  try {
    // Cache kontrolü
    const cachedData = cache.get(sku);
    if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
      return res.status(200).json(cachedData.data);
    }

    const baseURL = 'https://api.ssactivewear.com/v2';
    const auth = Buffer.from(`${process.env.SS_API_USERNAME}:${process.env.SS_API_KEY}`).toString('base64');
    
    // SS Activewear API isteği
    const response = await axios.get(`${baseURL}/products`, {
      params: { style: sku, limit: 100 },
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      }
    });

    // Veriyi işle ve markup ekle
    const processedProducts = response.data.map(product => ({
      ...product,
      sizes: Object.entries(product.sizes).reduce((acc, [size, data]) => ({
        ...acc,
        [size]: {
          ...data,
          price: parseFloat(data.price) + 1.50 // Markup ekleniyor
        }
      }), {})
    }));

    // Cache'e kaydet
    cache.set(sku, {
      data: processedProducts,
      timestamp: Date.now()
    });

    res.status(200).json(processedProducts);

  } catch (error) {
    console.error('SS Activewear API Error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });

    if (error.response?.status === 404) {
      res.status(404).json({ 
        error: 'Product not found',
        details: 'The requested SKU does not exist'
      });
    } else if (error.response?.status === 429) {
      res.status(429).json({ 
        error: 'Rate limit exceeded',
        retryAfter: error.response.headers['retry-after'] || 60
      });
    } else {
      res.status(500).json({ 
        error: 'Internal server error',
        message: error.message
      });
    }
  }
}