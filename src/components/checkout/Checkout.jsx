import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../../store/cartStore';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
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

// Icono personalizado para el restaurante (rojo)
const restaurantIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Icono para ubicación del cliente (verde)
const customerIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Componente para capturar clicks en el mapa
function LocationMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition({
        lat: e.latlng.lat,
        lng: e.latlng.lng
      });
    },
  });

  return position.lat && position.lng ? (
    <Marker position={[position.lat, position.lng]} icon={customerIcon}>
      <Popup>Tu ubicación de entrega</Popup>
    </Marker>
  ) : null;
}

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
    lat: null,
    lng: null
  });

  const [searchAddress, setSearchAddress] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Coordenadas del restaurante (Tortas Ahogadas Guadalajara - Google Maps)
  // Av. Amazonas esq. Orión, Colonia Ensueños, Cuautitlán Izcalli, CP 54740
  const restaurantLocation = {
    lat: 19.659390,
    lng: -99.214017
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

  // Geocodificar dirección usando Google Maps Geocoding API
  const searchLocation = async () => {
    if (!searchAddress.trim()) {
      alert('Por favor ingresa una dirección para buscar');
      return;
    }

    setIsSearching(true);
    
    try {
      // Construir query con contexto de México y Cuautitlán Izcalli
      const fullAddress = `${searchAddress}, Cuautitlán Izcalli, Estado de México, México`;
      
      // Llamar a Google Maps Geocoding API
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(fullAddress)}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&region=mx&language=es`
      );
      
      const data = await response.json();
      
      if (data.status === 'OK' && data.results && data.results.length > 0) {
        const result = data.results[0];
        const resultLat = result.geometry.location.lat;
        const resultLng = result.geometry.location.lng;
        
        // Verificar que esté en un radio razonable de Cuautitlán Izcalli (15km)
        const distanceFromCenter = calculateDistance(
          restaurantLocation.lat,
          restaurantLocation.lng,
          resultLat,
          resultLng
        );
        
        if (distanceFromCenter <= 15) {
          setLocation({
            lat: resultLat,
            lng: resultLng
          });
          
          // Extraer nombre de colonia si está disponible
          let coloniaName = '';
          for (const component of result.address_components) {
            if (component.types.includes('sublocality') || component.types.includes('neighborhood')) {
              coloniaName = component.long_name;
              break;
            }
          }
          
          alert(`✅ ¡Ubicación encontrada!\n\n📍 ${result.formatted_address}${coloniaName ? `\n🏘️ Colonia: ${coloniaName}` : ''}\n\nVerifica el marcador verde en el mapa y ajusta si es necesario haciendo clic.`);
        } else {
          alert(`⚠️ La dirección encontrada está muy lejos de Cuautitlán Izcalli (${distanceFromCenter.toFixed(1)} km).\n\n💡 Intenta con:\n• Solo el nombre de tu colonia\n• Una calle principal conocida\n• O haz clic directo en el mapa`);
        }
      } else if (data.status === 'ZERO_RESULTS') {
        alert(`❌ No se encontró la dirección.\n\n💡 Intenta con:\n• Solo la colonia (ej: "Ensueños")\n• Calle principal (ej: "Av. Amazonas")\n• O haz clic directo en el mapa`);
      } else {
        console.error('Error de Google Maps API:', data.status);
        alert('Error al buscar la dirección. Por favor intenta de nuevo.');
      }
    } catch (error) {
      console.error('Error al buscar ubicación:', error);
      alert('Error al buscar la dirección. Por favor intenta de nuevo.');
    } finally {
      setIsSearching(false);
    }
  };

  const subtotal = getTotal();

  // Calcular costo de envío basado en distancia REAL
  let deliveryFee = 0;
  let deliveryZone = '';
  let distance = 0;
  
  if (formData.deliveryType === 'delivery' && location.lat && location.lng) {
    distance = calculateDistance(
      restaurantLocation.lat,
      restaurantLocation.lng,
      location.lat,
      location.lng
    );
    
    // Aplicar tarifas según zonas definidas
    // Radio ajustado según límites reales de Colonia Ensueños
    if (distance <= 0.8) {
      deliveryFee = 0; // Solo Colonia Ensueños (hasta 800m)
      deliveryZone = 'Colonia Ensueños - GRATIS';
    } else if (distance <= 2) {
      deliveryFee = 25; // 0.8-2 km (colonias vecinas: Cumbria, San Antonio, etc.)
      deliveryZone = '0.8-2 km';
    } else if (distance <= 4) {
      deliveryFee = 40; // 2-4 km
      deliveryZone = '2-4 km';
    } else if (distance <= 8) {
      deliveryFee = 80; // 4-8 km
      deliveryZone = '4-8 km';
    } else {
      deliveryFee = 130; // 8+ km
      deliveryZone = '8+ km';
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
      alert('Por favor completa los campos obligatorios (Nombre y Teléfono)');
      return;
    }

    if (formData.deliveryType === 'delivery') {
      if (!formData.address || !formData.colonia) {
        alert('Por favor ingresa tu dirección completa y colonia');
        return;
      }
      
      if (!location.lat || !location.lng) {
        alert('Por favor busca tu dirección en el mapa o haz clic en tu ubicación para calcular el envío');
        return;
      }
    }

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
        distance: formData.deliveryType === 'delivery' ? distance.toFixed(2) : '0',
        zone: deliveryZone,
        fee: deliveryFee
      },
      location: {
        lat: location.lat || restaurantLocation.lat,
        lng: location.lng || restaurantLocation.lng
      },
      payment: {
        method: formData.paymentMethod,
        subtotal: subtotal,
        deliveryFee: deliveryFee,
        total: total
      },
      notes: formData.notes || '',
      status: 'pending',
      createdAt: serverTimestamp()
    };

    try {
      const docRef = await addDoc(collection(db, 'orders'), order);
      
      alert(`¡Pedido confirmado! 🎉

Número de pedido: ${docRef.id.slice(-6).toUpperCase()}

📋 Resumen:
Nombre: ${formData.name}
Teléfono: ${formData.phone}

${formData.deliveryType === 'delivery' 
  ? `📍 Dirección: ${formData.address}, ${formData.colonia}
🚚 Distancia: ${distance.toFixed(1)} km (${deliveryZone})
💰 Costo de envío: $${deliveryFee}`
  : '🏪 Recogerá en el restaurante'}

💳 Pago: ${formData.paymentMethod === 'cash' ? 'Efectivo' : 'Transferencia'}
💵 Total: $${total}

⏱️ Tiempo estimado: 30-45 minutos

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
                <h2>👤 Tus Datos</h2>
                
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
                  <label>Teléfono (WhatsApp) *</label>
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
                <h2>🚚 Tipo de Entrega</h2>
                
                <div className="delivery-options">
                  <label className={formData.deliveryType === 'delivery' ? 'active' : ''}>
                    <input
                      type="radio"
                      name="deliveryType"
                      value="delivery"
                      checked={formData.deliveryType === 'delivery'}
                      onChange={handleChange}
                    />
                    🏍️ Delivery 
                    {location.lat && deliveryFee > 0 && ` - $${deliveryFee}`}
                    {location.lat && deliveryFee === 0 && ' - ¡GRATIS!'}
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
                <>
                  <section className="form-section">
                    <h2>📍 Dirección de Entrega</h2>
                    
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
                      <label>Referencias del domicilio</label>
                      <input
                        type="text"
                        name="references"
                        value={formData.references}
                        onChange={handleChange}
                        placeholder="Casa azul, portón negro, entre calles..."
                      />
                    </div>

                    {/* Buscador de dirección */}
                    <div className="address-search">
                      <label>🗺️ Buscar dirección en el mapa</label>
                      <div className="search-input-group">
                        <input
                          type="text"
                          value={searchAddress}
                          onChange={(e) => setSearchAddress(e.target.value)}
                          placeholder="Ej: Calle Morelos 123, Ensueños"
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), searchLocation())}
                        />
                        <button 
                          type="button" 
                          onClick={searchLocation}
                          disabled={isSearching}
                          className="search-btn"
                        >
                          {isSearching ? '⏳ Buscando...' : '🔍 Buscar'}
                        </button>
                      </div>
                      <div className="search-tips">
                        <strong>💡 Formatos aceptados:</strong>
                        <ul>
                          <li>✅ Dirección completa: <em>"Av. Morelos 123, Col. Centro"</em></li>
                          <li>✅ Calle y colonia: <em>"Insurgentes, Ensueños"</em></li>
                          <li>✅ Solo colonia: <em>"Ensueños"</em> o <em>"Centro"</em></li>
                          <li>✅ O haz <strong>clic directo en el mapa</strong> en tu casa</li>
                        </ul>
                        <small>💡 Si no encuentra tu dirección exacta, busca por colonia y luego haz clic en el mapa.</small>
                      </div>
                    </div>
                  </section>

                  {/* Mapa Interactivo */}
                  <section className="form-section map-section">
                    <h2>🗺️ Ubicación en el Mapa</h2>
                    
                    {location.lat && distance > 0 && (
                      <div className="distance-info">
                        <p>📏 Distancia: <strong>{distance.toFixed(1)} km</strong></p>
                        <p>📦 Zona: <strong>{deliveryZone}</strong></p>
                        <p>💰 Costo de envío: <strong>${deliveryFee}</strong></p>
                      </div>
                    )}

                    <div className="map-container">
                      <MapContainer 
                        center={[restaurantLocation.lat, restaurantLocation.lng]} 
                        zoom={13} 
                        style={{ height: '400px', width: '100%' }}
                      >
                        <TileLayer
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        />
                        
                        {/* Marcador del restaurante */}
                        <Marker 
                          position={[restaurantLocation.lat, restaurantLocation.lng]}
                          icon={restaurantIcon}
                        >
                          <Popup>
                            <strong>🏪 Tortas Ahogadas</strong><br />
                            Av. Amazonas<br />
                            Col. Ensueños
                          </Popup>
                        </Marker>

                        {/* Marcador del cliente (interactivo) */}
                        <LocationMarker position={location} setPosition={setLocation} />
                      </MapContainer>
                    </div>
                  </section>
                </>
              )}

              {/* RESUMEN DEL PEDIDO - AHORA AQUÍ */}
              <section className="form-section">
                <h2>📋 Resumen del Pedido</h2>

                <div className="summary-items-mobile">
                  {items.map((item) => (
                    <div key={item.cartId} className="summary-item">
                      <span>{item.quantity}x {item.name}</span>
                      <span>${item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>

                <div className="summary-totals-mobile">
                  <div className="summary-line">
                    <span>Subtotal:</span>
                    <span>${subtotal}</span>
                  </div>

                  {formData.deliveryType === 'delivery' && (
                    <div className="summary-line">
                      <span>Envío:</span>
                      <span className={deliveryFee === 0 ? 'free' : ''}>
                        {!location.lat ? 'Calculando...' : deliveryFee === 0 ? '¡GRATIS! 🎉' : `$${deliveryFee}`}
                      </span>
                    </div>
                  )}

                  <div className="summary-line total">
                    <span>Total:</span>
                    <span>${total}</span>
                  </div>
                </div>
              </section>

              <section className="form-section">
                <h2>💳 Método de Pago</h2>
                
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
                <h2>📝 Notas Adicionales (opcional)</h2>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Ejemplo: Sin cebolla, bien picante, con limones extra, etc."
                  rows="3"
                />
              </section>

              <button type="submit" className="submit-btn submit-btn-mobile">
                💳 Confirmar - ${total}
              </button>
            </form>
          </div>

          <div className="order-summary-checkout">
            <h2>📋 Resumen del Pedido</h2>

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

              {formData.deliveryType === 'delivery' && (
                <div className="summary-line">
                  <span>Envío:</span>
                  <span className={deliveryFee === 0 ? 'free' : ''}>
                    {!location.lat ? 'Calculando...' : deliveryFee === 0 ? '¡GRATIS! 🎉' : `$${deliveryFee}`}
                  </span>
                </div>
              )}

              <div className="summary-line total">
                <span>Total:</span>
                <span>${total}</span>
              </div>
            </div>

            {/* Info de zonas */}
            <div className="delivery-zones-info">
              <h3>📦 Tarifas de Envío</h3>
              <ul>
                <li>🟢 Colonia Ensueños: <strong>GRATIS</strong></li>
                <li>🔵 0.8-2 km: <strong>$25</strong></li>
                <li>🟡 2-4 km: <strong>$40</strong></li>
                <li>🟠 4-8 km: <strong>$80</strong></li>
                <li>🔴 8+ km: <strong>$130</strong></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;