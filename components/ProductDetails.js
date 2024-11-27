export default function ProductDetails({ data }) {
  // Veri kontrolü
  if (!data || !data.variants) {
    return (
      <div className="p-4">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          Ürün bilgileri yüklenemedi.
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Ürün Detayları</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p><span className="font-semibold">Style ID:</span> {data.styleId}</p>
            <p><span className="font-semibold">Stil:</span> {data.styleName}</p>
            <p><span className="font-semibold">Marka:</span> {data.brand}</p>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Renk Seçenekleri</h2>
        <div className="grid grid-cols-3 gap-4">
          {Array.isArray(data.variants) && data.variants.map((variant, index) => (
            <div key={index} className="border rounded p-4">
              {variant.colorFrontImage && (
                <div className="mb-2">
                  <img 
                    src={variant.colorFrontImage} 
                    alt={variant.colorName || 'Ürün görseli'}
                    className="w-full h-auto"
                  />
                </div>
              )}
              <p className="font-semibold">{variant.colorName}</p>
              {variant.colorHex && (
                <div className="flex items-center gap-2 mb-2">
                  <span>Renk:</span>
                  <div 
                    className="w-6 h-6 rounded border" 
                    style={{ backgroundColor: variant.colorHex }}
                  />
                </div>
              )}
              {Array.isArray(variant.sizes) && variant.sizes.length > 0 && (
                <div className="text-sm">
                  <p className="font-semibold">Bedenler:</p>
                  {variant.sizes.map((size, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span>{size.size}</span>
                      <span>${size.price}</span>
                      <span>Stok: {size.stock}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}