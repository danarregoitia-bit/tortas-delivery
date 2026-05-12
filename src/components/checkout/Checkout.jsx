import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../../store/cartStore';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import '../../styles/Checkout.css';
import L from 'leaflet';

// Fix para los iconos de Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function Checkout() {
  const navigate = useNavigate();
  const { items, getTotal, clearCart } = useCartStore();
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    colonia: '',
    references: '',
    deliveryType: 'delivery',
    paymentMethod: 'cash',
    notes: ''
  });

  const [location, setLocation] = useState({
    lat: 19.6497,
    lng: -99.2178
  });

  // Coordenadas del restaurante
  const restaurantLocation = {
    lat: 19.6497,
    lng: -99.2178
  };

  // Calcular distancia en kilómetros (fórmula Haversine)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radio de la Tierra en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const subtotal = getTotal();

  // Calcular costo de envío basado en distancia
  let deliveryFee = 0;
  let deliveryZone = '';
  
  if (formData.deliveryType === 'delivery') {
    if (subtotal >= 1200) {
      deliveryFee = 0; // Envío gratis
      deliveryZone = 'free';
    } else {
      const distance = calculateDistance(
        restaurantLocation.lat,
        restaurantLocation.lng,
        location.lat,
        location.lng
      );
      
      if (distance <= 6) {
        deliveryFee = 45; // Zona 1: 0-6km
        deliveryZone = 'zone1';
      } else {
        deliveryFee = 75; // Zona 2: 7+ km
        deliveryZone = 'zone2';
      }
    }
  }

  const total = subtotal + deliveryFee;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.phone) {
      alert('Por favor completa los campos obligatorios');
      return;
    }

    if (formData.deliveryType === 'delivery' && !formData.address) {
      alert('Por favor ingresa tu dirección de entrega');
      return;
    }

    const distance = calculateDistance(
      restaurantLocation.lat,
      restaurantLocation.lng,
      location.lat,
      location.lng
    );

    const order = {
      items: items.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      })),
      customer: {
        name: formData.name,
        phone: formData.phone,
        email: formData.email || ''
      },
      delivery: {
        type: formData.deliveryType,
        address: formData.deliveryType === 'delivery' ? formData.address : 'Pickup en restaurante',
        colonia: formData.colonia || '',
        references: formData.references || '',
        distance: distance.toFixed(1)
      },
      location: {
        lat: location.lat,
        lng: location.lng
      },
      payment: {
        method: formData.paymentMethod,
        total: total
      },
      notes: formData.notes || '',
      status: 'pending',
      createdAt: serverTimestamp()
    };

    try {
      const docRef = await addDoc(collection(db, 'orders'), order);
      
      alert(`¡Pedido confirmado!

Número de pedido: ${docRef.id.slice(-6).toUpperCase()}

Nombre: ${formData.name}
Teléfono: ${formData.phone}
Total: $${total}

${formData.deliveryType === 'delivery' 
  ? `Se enviará a: ${formData.address}\nDistancia: ${distance.toFixed(1)} km\nCosto de envío: $${deliveryFee}`
  : 'Recogerá en el restaurante'}

Método de pago: ${formData.paymentMethod === 'cash' ? 'Efectivo' : 'Transferencia'}

¡Gracias por tu pedido!`);

      clearCart();
      navigate('/');
      
    } catch (error) {
      console.error('Error al guardar pedido:', error);
      alert('Hubo un error al procesar tu pedido. Por favor intenta de nuevo.');
    }
  };

  if (items.length === 0) {
    return (
      <div className="checkout-empty">
        <h2>No hay productos en el carrito</h2>
        <button onClick={() => navigate('/')} className="btn-primary">
          Ver Menú
        </button>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <div className="checkout-header">
          <button onClick={() => navigate('/cart')} className="back-button">
            ← Volver al Carrito
          </button>
          <h1>Finalizar Pedido</h1>
        </div>

        <div className="checkout-content">
          <div className="checkout-form">
            <form onSubmit={handleSubmit}>
              <section className="form-section">
                <h2>Tus Datos</h2>
                
                <div className="form-group">
                  <label>Nombre completo *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Juan Pérez"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Teléfono *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="5512345678"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Email (opcional)</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="correo@ejemplo.com"
                  />
                </div>
              </section>

              <section className="form-section">
                <h2>Tipo de Entrega</h2>
                
                <div className="delivery-options">
                  <label className={formData.deliveryType === 'delivery' ? 'active' : ''}>
                    <input
                      type="radio"
                      name="deliveryType"
                      value="delivery"
                      checked={formData.deliveryType === 'delivery'}
                      onChange={handleChange}
                    />
                    🏍️ Delivery (${deliveryFee > 0 ? deliveryFee : 'GRATIS'})
                  </label>

                  <label className={formData.deliveryType === 'pickup' ? 'active' : ''}>
                    <input
                      type="radio"
                      name="deliveryType"
                      value="pickup"
                      checked={formData.deliveryType === 'pickup'}
                      onChange={handleChange}
                    />
                    🏪 Recoger en Restaurante
                  </label>
                </div>
              </section>

              {formData.deliveryType === 'delivery' && (
                <section className="form-section">
                  <h2>Dirección de Entrega</h2>
                  
                  <div className="form-group">
                    <label>Calle y número *</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Av. Insurgentes 123"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Colonia *</label>
                    <input
                      type="text"
                      name="colonia"
                      value={formData.colonia}
                      onChange={handleChange}
                      placeholder="Roma Norte"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Referencias</label>
                    <input
                      type="text"
                      name="references"
                      value={formData.references}
                      onChange={handleChange}
                      placeholder="Casa azul, portón negro"
                    />
                  </div>
                </section>
              )}

              <section className="form-section">
                <h2>Método de Pago</h2>
                
                <div className="payment-options">
                  <label className={formData.paymentMethod === 'cash' ? 'active' : ''}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cash"
                      checked={formData.paymentMethod === 'cash'}
                      onChange={handleChange}
                    />
                    💵 Efectivo
                  </label>

                  <label className={formData.paymentMethod === 'transfer' ? 'active' : ''}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="transfer"
                      checked={formData.paymentMethod === 'transfer'}
                      onChange={handleChange}
                    />
                    🏦 Transferencia/SPEI
                  </label>
                </div>
              </section>

              <section className="form-section">
                <h2>Notas Adicionales (opcional)</h2>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Ejemplo: Sin cebolla, bien picante, etc."
                  rows="3"
                />
              </section>

              <button type="submit" className="submit-btn">
                Confirmar Pedido - ${total}
              </button>
            </form>
          </div>

          <div className="order-summary-checkout">
            <h2>Resumen del Pedido</h2>

            <div className="summary-items">
              {items.map((item) => (
                <div key={item.cartId} className="summary-item">
                  <span>{item.quantity}x {item.name}</span>
                  <span>${item.price * item.quantity}</span>
                </div>
              ))}
            </div>

            <div className="summary-totals">
              <div className="summary-line">
                <span>Subtotal:</span>
                <span>${subtotal}</span>
              </div>

              <div className="summary-line">
                <span>Envío:</span>
                <span className={deliveryFee === 0 ? 'free' : ''}>
                  {deliveryFee === 0 ? '¡GRATIS!' : `$${deliveryFee}`}
                </span>
              </div>

              {subtotal < 1200 && subtotal > 0 && formData.deliveryType === 'delivery' && (
                <div className="promo-message">
                  💡 Agrega ${1200 - subtotal} más para envío gratis
                </div>
              )}

              <div className="summary-line total">
                <span>Total:</span>
                <span>${total}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;