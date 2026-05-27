import { useState, useEffect, useRef } from 'react';
import { collection, query, orderBy, onSnapshot, where, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import '../styles/Repartidor.css';

function Repartidor() {
    console.log('🚀 REPARTIDOR VERSION 2.0 - SIN INDICE');
  const [deliveryOrders, setDeliveryOrders] = useState([]);
  const previousCount = useRef(0);

  // Alerta con vibración
  const alertNewOrder = () => {
    // Vibración
    if (navigator.vibrate) {
      navigator.vibrate([400, 200, 400, 200, 400]);
    }
    
    // Notificación
    if (Notification.permission === 'granted') {
      new Notification('🚴 ¡Nuevo Pedido de Delivery!', {
        body: 'Hay un nuevo pedido para entregar',
        requireInteraction: true
      });
    }
  };

  // Pedir permiso de notificaciones
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Escuchar pedidos de delivery en tiempo real - SIN ÍNDICE
  useEffect(() => {
    const q = query(
      collection(db, 'orders'),
      where('delivery.type', '==', 'delivery'),
      orderBy('createdAt', 'desc')
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const orders = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        // Filtrar pending y preparing en JavaScript
        if (data.status === 'pending' || data.status === 'confirmed' || data.status === 'preparing') {
          orders.push({
            id: doc.id,
            ...data
          });
        }
      });
      
      // Alerta si hay nuevo pedido
      if (previousCount.current > 0 && orders.length > previousCount.current) {
        alertNewOrder();
      }

      previousCount.current = orders.length;
      setDeliveryOrders(orders);
    });

    return () => unsubscribe();
  }, []);

  const openInMaps = (address, colonia) => {
    const fullAddress = `${address}, ${colonia}, Cuautitlán Izcalli, Estado de México`;
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;
    window.open(mapsUrl, '_blank');
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
  };

  const completeOrder = async (orderId) => {
    const confirmed = window.confirm('¿Pedido entregado al cliente?');
    
    if (confirmed) {
      try {
        await updateDoc(doc(db, 'orders', orderId), {
          status: 'completed'
        });
        alert('✅ Pedido marcado como entregado');
      } catch (error) {
        console.error('Error al completar pedido:', error);
        alert('❌ Error al marcar como entregado');
      }
    }
  };

  return (
    <div className="repartidor-panel">
      <div className="repartidor-header">
        <h1>🚴 Panel de Repartidor</h1>
        <div className="pending-count">
          📦 Pedidos Pendientes: 
          <strong>{deliveryOrders.length}</strong>
          {deliveryOrders.length > 0 && (
            <span className="badge-pulse">{deliveryOrders.length}</span>
          )}
        </div>
      </div>

      <div className="orders-list">
        {deliveryOrders.length === 0 ? (
          <div className="no-orders">
            <p>✅ No hay pedidos pendientes</p>
            <p className="subtitle">Los nuevos pedidos aparecerán aquí automáticamente</p>
          </div>
        ) : (
          deliveryOrders.map((order) => (
            <div key={order.id} className="delivery-card">
              <div className="card-header">
                <span className="order-id">#{order.id.slice(-6).toUpperCase()}</span>
                <span className={`status-badge-repartidor ${order.status}`}>
                  {order.status === 'pending' ? '🔴 Nuevo' : '👨‍🍳 Listo'}
                </span>
                <span className="order-time">🕐 {formatDate(order.createdAt)}</span>
              </div>

              <div className="customer-section">
                <h3>👤 {order.customer.name}</h3>
                <a href={`tel:${order.customer.phone}`} className="phone-link">
                  📱 {order.customer.phone}
                </a>
              </div>

              <div className="address-section">
                <p className="address-label">📍 Dirección de Entrega:</p>
                <p className="address-main">{order.delivery.address}</p>
                <p className="address-colonia">{order.delivery.colonia}</p>
                {order.delivery.references && (
                  <p className="address-ref">
                    📌 Referencias: {order.delivery.references}
                  </p>
                )}
                <p className="distance-info">
                  📏 Distancia: {order.delivery.distance} km ({order.delivery.zone})
                </p>
              </div>

              {order.notes && order.notes.trim() && (
                <div className="notes-section">
                  <p className="notes-label">📝 Notas del Cliente:</p>
                  <p className="notes-text">{order.notes}</p>
                </div>
              )}

              <div className="products-section">
                <p className="products-label">🌶️ Productos:</p>
                <ul>
                  {order.items.map((item, index) => (
                    <li key={index}>
                      {item.quantity}x {item.name}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="total-section">
  <span>💰 Total a cobrar:</span>
  <span className="total-amount">${order.payment.total}</span>
</div>

<div className="payment-method-section">
  <span className="payment-label">
    {order.payment.method === 'cash' ? '💵 Cobrar en Efectivo' : '🏦 Cobrar por Transferencia/SPEI'}
  </span>
</div>

              <button 
                className="maps-button"
                onClick={() => openInMaps(order.delivery.address, order.delivery.colonia)}
              >
                🗺️ Abrir en Google Maps
              </button>
              
              <button 
                className="complete-button"
                onClick={() => completeOrder(order.id)}
              >
                ✅ Marcar como Entregado
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Repartidor;