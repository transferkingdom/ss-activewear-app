import axios from 'axios';

export default async function handler(req, res) {
  try {
    const { sku } = req.query; // Bu aslında style ID olacak
    
    if (!process.env.SS_API_USERNAME || !process.env.SS_API_KEY) {
      throw new Error('API kimlik bilgileri eksik');
    }

    const auth = Buffer.from(
      `${process.env.SS_API_USERNAME}:${process.env.SS_API_KEY}`
    ).toString('base64');

    // Style ID ile ürünleri getir
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

    // Yanıtı grupla ve düzenle
    const products = response.data;
    const styleInfo = products[0]; // Ana ürün bilgileri

    // Renk ve beden varyantlarını grupla
    const variants = products.reduce((acc, product) => {
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

      acc[colorKey].sizes.push({
        size: product.sizeName,
        sku: product.sku,
        price: product.customerPrice,
        stock: product.qty
      });

      return acc;
    }, {});

    // Yanıtı formatla
    const formattedResponse = {
      styleId: styleInfo.styleID,
      styleName: styleInfo.styleName,
      brand: styleInfo.brandName,
      brandId: styleInfo.brandID,
      variants: Object.values(variants)
    };

    return res.status(200).json(formattedResponse);

  } catch (error) {
    console.error('API Hatası:', error);
    return res.status(500).json({
      error: 'API hatası',
      message: error.message
    });
  }
}