import axios from 'axios';

export default async function handler(req, res) {
  try {
    const { sku } = req.query;
    
    console.log('Starting API request for SKU:', sku);

    const auth = Buffer.from(
      `${process.env.SS_API_USERNAME}:${process.env.SS_API_KEY}`
    ).toString('base64');
    
    const styleResponse = await axios.get(
      `${process.env.NEXT_PUBLIC_SS_API_BASE_URL}/products`, 
      {
        params: { 
          style: '18000',
          limit: 100
        },
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const filteredProducts = styleResponse.data.filter(product => 
      product.sku === sku || 
      product.styleNumber === sku ||
      product.id === sku
    );

    if (!filteredProducts || filteredProducts.length === 0) {
      return res.status(404).json({
        error: 'Product not found',
        message: `No product found with SKU: ${sku}`,
        requestedSku: sku,
        styleNumber: '18000'
      });
    }

    const processedProducts = filteredProducts.map(product => ({
      ...product,
      sizes: Object.entries(product.sizes || {}).reduce((acc, [size, data]) => ({
        ...acc,
        [size]: {
          ...data,
          price: data.price ? parseFloat(data.price) + 1.50 : null
        }
      }), {}),
      supplierSku: sku,
      styleId: '372',
      brandName: 'Gildan',
      styleName: '18000'
    }));

    console.log('Found products:', processedProducts.length);
    res.status(200).json(processedProducts);

  } catch (error) {
    console.error('API Error:', {
      status: error.response?.status,
      message: error.message,
      data: error.response?.data,
      sku: req.query.sku
    });
    
    res.status(500).json({
      error: 'API request failed',
      message: error.message,
      details: error.response?.data || 'Unknown error',
      requestInfo: {
        sku: req.query.sku,
        styleNumber: '18000',
        brandName: 'Gildan'
      }
    });
  }
}