import { useState, useEffect } from 'react';

const SIZES = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'];

export default function SSActivewearProduct() {
  const [products, setProducts] = useState([]);
  const [selectedColor, setSelectedColor] = useState(null);
  const [quantities, setQuantities] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const config = window.ssActivewearConfig;
    if (config?.product?.sku) {
      fetchProductBySku(config.product.sku);
    }
  }, []);

  const fetchProductBySku = async (sku) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/ss-activewear/${sku}`);
      const data = await response.json();

      if (!response.ok) throw new Error(data.message);

      setProducts(data);
      setSelectedColor(data[0]?.colorName);
      setError(null);
    } catch (err) {
      setError(err.message);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async () => {
    try {
      const items = Object.entries(quantities)
        .filter(([_, qty]) => qty > 0)
        .map(([key, qty]) => {
          const [colorName, size] = key.split('-');
          const product = products.find(p => p.colorName === colorName);
          const sizeData = product.sizes[size];

          return {
            quantity: parseInt(qty),
            id: window.ssActivewearConfig.product.variantId,
            properties: {
              'Color': colorName,
              'Size': size,
              '_ss_sku': product.sku
            }
          };
        });

      if (items.length === 0) {
        throw new Error('Please select quantity');
      }

      const response = await fetch('/cart/add.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items })
      });

      if (!response.ok) throw new Error('Failed to add to cart');

      window.location.href = '/cart';

    } catch (err) {
      setError(err.message);
    }
  };

  const selectedProduct = selectedColor 
    ? products.find(p => p.colorName === selectedColor) 
    : products[0];

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      {selectedProduct && (
        <div className="bg-white shadow rounded-lg p-8">
          <div className="flex flex-col md:flex-row gap-12">
            {/* Sol Taraf - Ürün Görseli */}
            <div className="w-full md:w-1/2">
              <img 
                src={`https://www.ssactivewear.com/${selectedProduct.colorFrontImage}`}
                alt={`${selectedProduct.brandName} ${selectedProduct.styleName} - ${selectedProduct.colorName}`}
                className="w-full h-auto object-contain"
              />
            </div>

            {/* Sağ Taraf - Ürün Detayları */}
            <div className="w-full md:w-1/2">
              <div className="text-sm text-gray-500 uppercase mb-1">
                {selectedProduct.brandName}
              </div>
              <h1 className="text-3xl font-bold mb-6">
                {selectedProduct.styleName}
              </h1>

              {/* Renk Seçimi */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <span className="font-semibold">Selected Color:</span>
                  <div 
                    className="w-6 h-6 rounded-full border-2 border-gray-300"
                    style={{ backgroundColor: selectedProduct.color1 }}
                  />
                  <span>{selectedProduct.colorName}</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {products.map((product) => (
                    <button
                      key={product.colorName}
                      onClick={() => setSelectedColor(product.colorName)}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        selectedProduct.colorName === product.colorName 
                          ? 'border-blue-500 scale-110' 
                          : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: product.color1 }}
                      title={product.colorName}
                    />
                  ))}
                </div>
              </div>

              {/* Size ve Fiyat Tablosu */}
              <div className="mb-8">
                <h2 className="font-semibold mb-4">Quantity</h2>
                <div className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-9 gap-2">
                  {SIZES.map((size) => {
                    const sizeData = selectedProduct.sizes[size];
                    return sizeData ? (
                      <div key={size} className="text-center p-2 border rounded-lg bg-gray-50">
                        <div className="font-medium text-gray-800">{size}</div>
                        <div className="text-green-600 my-1 text-sm">
                          ${sizeData.price.toFixed(2)}
                        </div>
                        <input 
                          type="text"
                          className="w-full border rounded p-1 text-center text-sm"
                          placeholder="0"
                          value={quantities[`${selectedProduct.colorName}-${size}`] || ''}
                          onChange={(e) => setQuantities({
                            ...quantities,
                            [`${selectedProduct.colorName}-${size}`]: e.target.value
                          })}
                        />
                        <div className="text-xs text-gray-500 mt-1">
                          Stock: {sizeData.stock}
                        </div>
                      </div>
                    ) : null;
                  })}
                </div>
              </div>

              {/* Add to Cart Button */}
              <button 
                onClick={addToCart}
                className="w-full bg-orange-400 hover:bg-orange-500 text-white font-bold py-3 px-6 rounded transition duration-200"
              >
                ADD TO CART
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}