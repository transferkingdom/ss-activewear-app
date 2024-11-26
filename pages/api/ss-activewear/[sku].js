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
      url: 'https://api.ssactivewear.com/v2/products',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      params: {
        style: '18000',
        brand: 'Gildan',
        format: 'json',
        limit: 100
      }
    });

    console.log('API Response Headers:', response.headers);
    console.log('API Response Status:', response.status);
    console.log('API Response Data Length:', response.data?.length);

    if (!response.data || response.data.length === 0) {
      return res.status(404).json({
        error: 'Product not found',
        message: `No product found with style: ${sku}`,
        requestedSku: sku
      });
    }

    const processedProducts = response.data.map(product => ({
      id: product.id,
      sku: product.sku,
      styleNumber: product.styleNumber || '18000',
      brandName: product.brandName || 'Gildan',
      styleName: product.styleName,
      colorName: product.colorName,
      sizes: product.sizes || {},
      images: {
        front: product.colorFrontImage ? `https://www.ssactivewear.com/${product.colorFrontImage}` : null,
        back: product.colorBackImage ? `https://www.ssactivewear.com/${product.colorBackImage}` : null
      }
    }));

    res.status(200).json({
      success: true,
      products: processedProducts,
      total: processedProducts.length,
      requestedStyle: '18000',
      requestedBrand: 'Gildan'
    });

  } catch (error) {
    console.error('API Error Details:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      headers: error.response?.headers,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        params: error.config?.params
      }
    });
    
    res.status(500).json({
      error: 'API request failed',
      message: error.message,
      details: error.response?.data,
      requestInfo: {
        url: 'https://api.ssactivewear.com/v2/products',
        style: '18000',
        brand: 'Gildan',
        credentials: {
          username: process.env.SS_API_USERNAME ? 'Set' : 'Not set',
          key: process.env.SS_API_KEY ? 'Set' : 'Not set'
        }
      }
    });
  }
}