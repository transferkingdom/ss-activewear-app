import axios from 'axios';

// Veriyi işleyecek yardımcı fonksiyon
const formatProductData = (data) => {
  const product = data[0]; // İlk ürünü al
  
  return {
    productInfo: {
      sku: product.sku,
      brand: product.brandName,
      style: product.styleName,
      color: {
        name: product.colorName,
        hex: product.color1,
        family: product.colorFamily
      },
      size: product.sizeName
    },
    pricing: {
      retail: product.customerPrice,
      sale: product.salePrice,
      saleEnds: new Date(product.saleExpiration).toLocaleDateString('tr-TR'),
      mapPrice: product.mapPrice
    },
    inventory: {
      total: product.qty,
      warehouses: product.warehouses.map(w => ({
        location: w.warehouseAbbr,
        quantity: w.qty,
        onOrder: w.expectedInventory
      }))
    },
    shipping: {
      caseQuantity: product.caseQty,
      caseWeight: product.caseWeight,
      dimensions: {
        width: product.caseWidth,
        length: product.caseLength,
        height: product.caseHeight
      }
    }
  };
};

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
        'Content-Type': 'application/json'
      }
    });

    // Veriyi formatla ve gönder
    const formattedData = formatProductData(response.data);
    return res.status(200).json(formattedData);

  } catch (error) {
    console.error('API Hatası:', error.message);
    return res.status(500).json({
      error: 'API hatası',
      message: error.message
    });
  }
}