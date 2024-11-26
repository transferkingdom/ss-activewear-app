import axios from 'axios';

export default async function handler(req, res) {
  try {
    const { sku } = req.query;
    
    console.log('Starting API request for style:', sku);

    const auth = Buffer.from(
      `${process.env.SS_API_USERNAME}:${process.env.SS_API_KEY}`
    ).toString('base64');
    
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_SS_API_BASE_URL}/products`, 
      {
        params: { 
          style: '18000',
          fields: 'sku,gtin,styleID,brandName,styleName,colorName,colorFrontImage,colorBackImage,colorSideImage,color1,color2,sizeName,customerPrice,qty,warehouses'
        },
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.data || response.data.length === 0) {
      return res.status(404).json({
        error: 'Product not found',
        message: `No product found with style: 18000`,
        requestedSku: sku
      });
    }

    const processedProducts = response.data.map(product => ({
      ...product,
      price: product.customerPrice ? parseFloat(product.customerPrice) + 1.50 : null,
      stock: product.qty || 0,
      supplierSku: sku,
      images: {
        front: product.colorFrontImage ? `https://www.ssactivewear.com/${product.colorFrontImage}` : null,
        back: product.colorBackImage ? `https://www.ssactivewear.com/${product.colorBackImage}` : null,
        side: product.colorSideImage ? `https://www.ssactivewear.com/${product.colorSideImage}` : null
      }
    }));

    console.log('Found products:', processedProducts.length);
    res.status(200).json(processedProducts);

  } catch (error) {
    console.error('API Error:', {
      status: error.response?.status,
      message: error.message,
      data: error.response?.data
    });
    
    res.status(500).json({
      error: 'API request failed',
      message: error.message,
      details: error.response?.data || 'Unknown error'
    });
  }
}