import React from 'react';

export default function ProductDetails({ data }) {
  return (
    <div className="p-4">
      {/* Ürün Bilgileri */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Ürün Detayları</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p><span className="font-semibold">SKU:</span> {data.productInfo.sku}</p>
            <p><span className="font-semibold">Marka:</span> {data.productInfo.brand}</p>
            <p><span className="font-semibold">Stil:</span> {data.productInfo.style}</p>
            <p><span className="font-semibold">Beden:</span> {data.productInfo.size}</p>
          </div>
          <div>
            <p><span className="font-semibold">Renk:</span> {data.productInfo.color.name}</p>
            <div className="flex items-center gap-2">
              <span className="font-semibold">Renk Örneği:</span>
              <div 
                className="w-6 h-6 rounded" 
                style={{ backgroundColor: data.productInfo.color.hex }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Fiyatlandırma */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Fiyatlandırma</h2>
        <div className="grid grid-cols-2 gap-4">
          <p><span className="font-semibold">Perakende:</span> ${data.pricing.retail}</p>
          <p><span className="font-semibold">İndirimli:</span> ${data.pricing.sale}</p>
          <p><span className="font-semibold">İndirim Bitiş:</span> {data.pricing.saleEnds}</p>
        </div>
      </div>

      {/* Stok Bilgisi */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Stok Durumu</h2>
        <p className="mb-4"><span className="font-semibold">Toplam Stok:</span> {data.inventory.total}</p>
        <div className="grid grid-cols-3 gap-4">
          {data.inventory.warehouses.map((wh, index) => (
            <div key={index} className="p-3 border rounded">
              <p className="font-semibold">{wh.location}</p>
              <p>Stok: {wh.quantity}</p>
              <p className="text-sm">Sipariş: {wh.onOrder}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Kargo Bilgileri */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Kargo Detayları</h2>
        <div className="grid grid-cols-2 gap-4">
          <p><span className="font-semibold">Koli Adedi:</span> {data.shipping.caseQuantity}</p>
          <p><span className="font-semibold">Koli Ağırlığı:</span> {data.shipping.caseWeight} kg</p>
          <p><span className="font-semibold">Boyutlar:</span> {data.shipping.dimensions.width}" x {data.shipping.dimensions.length}" x {data.shipping.dimensions.height}"</p>
        </div>
      </div>
    </div>
  );
}