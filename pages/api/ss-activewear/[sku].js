import axios from 'axios';

export default async function handler(req, res) {
  try {
    const { sku } = req.query;
    
    console.log('Starting API request for style:', sku);

    const auth = Buffer.from(
      `${process.env.SS_API_USERNAME}:${process.env.SS_API_KEY}`
    ).toString('base64');
    
    const response = await axios({
      method: 'get',
      url: 'https://api.ssactivewear.com/v2/Products.aspx',
      params: { 
        Style: '18000',
        Brand: 'Gildan'
      },
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    console.log('API Response:', {
      status: response.status,
      headers: response.headers,
      data: response.data
    });

    if (!response.data || response.data.length === 0) {
      return res.status(404).json({
        error: 'Product not found',
        message: `No product found with style: 18000`,
        requestedSku: sku
      });
    }

    res.status(200).json(response.data);

  } catch (error) {
    console.error('API Error:', {
      status: error.response?.status,
      message: error.message,
      data: error.response?.data,
      headers: error.response?.headers
    });
    
    res.status(500).json({
      error: 'API request failed',
      message: error.message,
      details: error.response?.data,
      requestInfo: {
        url: 'https://api.ssactivewear.com/v2/Products.aspx',
        style: '18000',
        brand: 'Gildan',
        hasAuth: !!process.env.SS_API_USERNAME && !!process.env.SS_API_KEY
      }
    });
  }
}