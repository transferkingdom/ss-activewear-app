import { useState, useEffect } from 'react';
import ProductDetails from '../components/ProductDetails';

export default function Home() {
  const [productData, setProductData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/ss-activewear/18000')
      .then(res => res.json())
      .then(data => {
        setProductData(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Yükleniyor...</div>;
  if (error) return <div>Hata: {error}</div>;
  if (!productData) return <div>Ürün bulunamadı</div>;

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold my-6">Ürün Detayları</h1>
      <ProductDetails data={productData} />
    </div>
  );
}