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

    const url = `https://api.ssactivewear.com/v2/products/?style=${sku}`;
    
    console.log('API İsteği:', url);

    const response = await axios({
      method: 'get',
      url: url,
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    if (!response.data || !Array.isArray(response.data) || response.data.length === 0) {
      return res.status(404).json({
        error: 'Ürün bulunamadı',
        message: 'Style ID için ürün bulunamadı'
      });
    }

    const products = response.data;
    const styleInfo = products[0];

    const variants = products.reduce((acc, product) => {
      if (!product.colorName || !product.colorCode) return acc;

      const colorKey = `${product.colorName}-${product.colorCode}`;
      
      if (!acc[colorKey]) {
        acc[colorKey] = {
          colorName: product.colorName,
          colorCode: product.colorCode,
          colorHex: product.color1,
          colorSwatchImage: product.colorSwatchImage,
          colorFrontImage: product.colorFrontImage,
          colorBackImage: product.colorBackImage,
          sizes: []
        };
      }

      if (product.sizeName) {
        acc[colorKey].sizes.push({
          size: product.sizeName,
          sku: product.sku,
          price: product.customerPrice,
          stock: product.qty
        });
      }

      return acc;
    }, {});

    const formattedResponse = {
      styleId: styleInfo.styleID,
      styleName: styleInfo.styleName,
      brand: styleInfo.brandName,
      brandId: styleInfo.brandID,
      variants: Object.values(variants)
    };

    console.log('Formatlanmış Yanıt:', formattedResponse);

    return res.status(200).json(formattedResponse);

  } catch (error) {
    console.error('API Hatası:', error);
    return res.status(500).json({
      error: 'API hatası',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}