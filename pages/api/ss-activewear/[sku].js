import axios from 'axios';

export default async function handler(req, res) {
  try {
    const { sku } = req.query;
    
    console.log('API Request:', {
      sku,
      username: process.env.SS_API_USERNAME,
      baseUrl: process.env.NEXT_PUBLIC_SS_API_BASE_URL
    });

    const auth = Buffer.from(
      `${process.env.SS_API_USERNAME}:${process.env.SS_API_KEY}`
    ).toString('base64');
    
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_SS_API_BASE_URL}/products`, 
      {
        params: { style: sku },
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.status(200).json(response.data);

  } catch (error) {
    console.error('API Error:', {
      message: error.message,
      response: error.response?.data
    });
    
    res.status(500).json({ 
      error: 'API request failed',
      message: error.message,
      details: error.response?.data
    });
  }
}