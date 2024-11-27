export default function ProductDetails({ data }) {
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
            {data.variants.map((variant, index) => (
              <div key={index} className="border rounded p-4">
                <div className="mb-2">
                  <img 
                    src={variant.colorFrontImage} 
                    alt={variant.colorName}
                    className="w-full h-auto"
                  />
                </div>
                <p className="font-semibold">{variant.colorName}</p>
                <div className="flex items-center gap-2 mb-2">
                  <span>Renk:</span>
                  <div 
                    className="w-6 h-6 rounded border" 
                    style={{ backgroundColor: variant.colorHex }}
                  />
                </div>
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
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }