import axios from 'axios';

export default async function handler(req, res) {
  try {
    const { sku } = req.query;
    
    console.log('Starting API request for SKU:', sku);

    const auth = Buffer.from(
      `${process.env.SS_API_USERNAME}:${process.env.SS_API_KEY}`
    ).toString('base64');
    
    const searchResponse = await axios.get(
      `${process.env.NEXT_PUBLIC_SS_API_BASE_URL}/products/search`,
      {
        params: { 
          q: sku,
          limit: 100
        },
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!searchResponse.data || searchResponse.data.length === 0) {
      return res.status(404).json({
        error: 'Product not found',
        message: `No product found with SKU: ${sku}`,
        requestedSku: sku
      });
    }

    console.log('API request successful, found products:', searchResponse.data.length);
    
    const processedProducts = searchResponse.data.map(product => ({
      ...product,
      sizes: Object.entries(product.sizes || {}).reduce((acc, [size, data]) => ({
        ...acc,
        [size]: {
          ...data,
          price: data.price ? parseFloat(data.price) + 1.50 : null
        }
      }), {})
    }));

    res.status(200).json(processedProducts);

  } catch (error) {
    console.error('API Error:', {
      status: error.response?.status,
      message: error.message,
      data: error.response?.data,
      sku: req.query.sku
    });
    
    if (error.response?.status === 404) {
      res.status(404).json({
        error: 'Product not found',
        message: `No product found with SKU: ${req.query.sku}`,
        details: error.response.data
      });
    } else if (error.response?.status === 401) {
      res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid API credentials',
        details: error.response.data
      });
    } else {
      res.status(500).json({
        error: 'API request failed',
        message: error.message,
        details: error.response?.data || 'Unknown error',
        requestInfo: {
          sku,
          baseUrl: process.env.NEXT_PUBLIC_SS_API_BASE_URL
        }
      });
    }
  }
}