import { useState, useEffect } from 'react';
import ProductDetails from '../components/ProductDetails';

export default function Home() {
  const [productData, setProductData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sku, setSku] = useState('18000');

  const fetchProduct = async (productSku) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/ss-activewear/${productSku}`);
      const data = await res.json();
      setProductData(data);
      setError(null);
    } catch (err) {
      setError('Ürün bilgileri alınamadı: ' + err.message);
      setProductData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct(sku);
  }, []);

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-4">SS Activewear Ürün Arama</h1>
        
        {/* Arama Formu */}
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            placeholder="SKU numarası girin"
            className="border p-2 rounded flex-1"
          />
          <button
            onClick={() => fetchProduct(sku)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Ara
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      ) : productData ? (
        <ProductDetails data={productData} />
      ) : null}
    </div>
  );
}