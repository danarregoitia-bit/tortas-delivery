import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import '../styles/AdminPanel.css';

function AdminPanel() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('all');
const [reservations, setReservations] = useState([]);
// Estados para detectar nuevos items y reproducir alertas
const [previousOrdersCount, setPreviousOrdersCount] = useState(0);
const [previousReservationsCount, setPreviousReservationsCount] = useState(0);
const [notificationPermission, setNotificationPermission] = useState('default');
// Pedir permiso de notificaciones al cargar el componente
useEffect(() => {
  if ('Notification' in window) {
    if (Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        setNotificationPermission(permission);
      });
    } else {
      setNotificationPermission(Notification.permission);
    }
  }
}, []);
  useEffect(() => {
  const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
  
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const ordersData = [];
    snapshot.forEach((doc) => {
      ordersData.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // Detectar nuevo pedido
    if (previousOrdersCount > 0 && ordersData.length > previousOrdersCount) {
      const newOrder = ordersData[0]; // El más reciente
      playSound('order');
      showNotification('order', newOrder);
    }
    
    setPreviousOrdersCount(ordersData.length);
    setOrders(ordersData);
  });

  return () => unsubscribe();
}, [previousOrdersCount, notificationPermission]);
  // Escuchar reservaciones en tiempo real
useEffect(() => {
  const q = query(collection(db, 'reservations'), orderBy('createdAt', 'desc'));
  
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const reservationsData = [];
    snapshot.forEach((doc) => {
      reservationsData.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // Detectar nueva reservación
    if (previousReservationsCount > 0 && reservationsData.length > previousReservationsCount) {
      const newReservation = reservationsData[0]; // La más reciente
      playSound('reservation');
      showNotification('reservation', newReservation);
    }
    
    setPreviousReservationsCount(reservationsData.length);
    setReservations(reservationsData);
  });

  return () => unsubscribe();
}, [previousReservationsCount, notificationPermission]);

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status: newStatus
      });
      alert(`Pedido actualizado a: ${newStatus}`);
    } catch (error) {
      console.error('Error al actualizar:', error);
      alert('Error al actualizar el pedido');
    }
  };
  // Actualizar estado de reservación
const updateReservationStatus = async (reservationId, newStatus) => {
  try {
    // Reproducir sonido de alerta
const playSound = (type) => {
  try {
    let audioUrl = '';
    
    if (type === 'order') {
      // Sonido de caja registradora para pedidos
      audioUrl = 'https://www.soundjay.com/mechanical/sounds/cash-register-1.mp3';
    } else if (type === 'reservation') {
      // Sonido de timbre para reservaciones
      audioUrl = 'https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3';
    }
    
    const audio = new Audio(audioUrl);
    audio.volume = 0.7;
    audio.play().catch(err => console.log('Error al reproducir sonido:', err));
  } catch (error) {
    console.log('Error en playSound:', error);
  }
};

// Mostrar notificación del navegador
const showNotification = (type, data) => {
  if (notificationPermission === 'granted') {
    try {
      let title = '';
      let body = '';
      let icon = '';
      
      if (type === 'order') {
        title = '🍔 ¡Nuevo Pedido!';
        body = `Cliente: ${data.customer.name}\nTotal: $${data.total}`;
        icon = '🍔';
      } else if (type === 'reservation') {
        title = '📅 ¡Nueva Reservación!';
        body = `Cliente: ${data.customer.name}\nFecha: ${data.date} ${data.time}\nPersonas: ${data.guests}`;
        icon = '📅';
      }
      
      new Notification(title, {
        body: body,
        icon: icon,
        tag: type,
        requireInteraction: true
      });
    } catch (error) {
      console.log('Error al mostrar notificación:', error);
    }
  }
};
    await updateDoc(doc(db, 'reservations', reservationId), {
      status: newStatus
    });
    alert(`Reservación actualizada a: ${newStatus === 'confirmed' ? 'Confirmada' : 'Cancelada'}`);
  } catch (error) {
    console.error('Error al actualizar reservación:', error);
    alert('Error al actualizar la reservación');
  }
};

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    return order.status === filter;
  });
  // Filtrar reservaciones
const filteredReservations = reservations.filter(reservation => {
  if (filter === 'reservations') return true;
  if (filter === 'all') return false;
  return false;
});

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Sin fecha';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString('es-MX');
  };

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h1>📊 Panel de Administración</h1>
        <div className="admin-stats">
  <div className="stat-card">
    <span className="stat-number">{orders.length}</span>
    <span className="stat-label">Total Pedidos</span>
  </div>
  <div className="stat-card pending">
    <span className="stat-number">{orders.filter(o => o.status === 'pending').length}</span>
    <span className="stat-label">Pendientes</span>
  </div>
  <div className="stat-card completed">
    <span className="stat-number">{orders.filter(o => o.status === 'completed').length}</span>
    <span className="stat-label">Completados</span>
  </div>
  <div className="stat-card" style={{background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'}}>
    <span className="stat-number">{reservations.filter(r => r.status === 'pending').length}</span>
    <span className="stat-label">Reservaciones</span>
  </div>
</div>
      </div>

      <div className="filters">
  <button 
    className={filter === 'all' ? 'active' : ''} 
    onClick={() => setFilter('all')}
  >
    Todos ({orders.length})
  </button>
  <button 
    className={filter === 'pending' ? 'active' : ''} 
    onClick={() => setFilter('pending')}
  >
    Pendientes ({orders.filter(o => o.status === 'pending').length})
  </button>
  <button 
    className={filter === 'completed' ? 'active' : ''} 
    onClick={() => setFilter('completed')}
  >
    Completados ({orders.filter(o => o.status === 'completed').length})
  </button>
  <button 
    className={filter === 'reservations' ? 'active' : ''} 
    onClick={() => setFilter('reservations')}
  >
    📅 Reservaciones ({reservations.length})
  </button>
</div>

      <div className="orders-list">
        {filteredOrders.length === 0 ? (
          <div className="empty-state">
            <h3>No hay pedidos</h3>
            <p>Los nuevos pedidos aparecerán aquí en tiempo real</p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div key={order.id} className={`order-card ${order.status}`}>
              <div className="order-header">
                <div className="order-id">
                  <strong>#{order.id.slice(-6).toUpperCase()}</strong>
                  <span className={`status-badge ${order.status}`}>
                    {order.status === 'pending' ? '⏳ Pendiente' : 
                     order.status === 'completed' ? '✅ Completado' : 
                     order.status}
                  </span>
                </div>
                <div className="order-time">
                  {formatDate(order.createdAt)}
                </div>
              </div>

              <div className="order-body">
                <div className="customer-info">
                  <h3>👤 {order.customer.name}</h3>
                  <p>📱 {order.customer.phone}</p>
                  {order.customer.email && <p>📧 {order.customer.email}</p>}
                </div>

                <div className="delivery-info">
                  {order.delivery.type === 'delivery' ? (
                    <>
                      <p><strong>🏍️ Delivery</strong></p>
                      <p>📍 {order.delivery.address}</p>
                      {order.delivery.colonia && <p>🏘️ {order.delivery.colonia}</p>}
                      {order.delivery.references && <p>📝 {order.delivery.references}</p>}
                      <p>📏 Distancia: {order.delivery.distance} km</p>
                    </>
                  ) : (
                    <p><strong>🏪 Recoger en restaurante</strong></p>
                  )}
                </div>

                <div className="items-info">
                  <h4>🍔 Productos:</h4>
                  <ul>
                    {order.items.map((item, index) => (
                      <li key={index}>
                        {item.quantity}x {item.name} - ${item.price * item.quantity}
                      </li>
                    ))}
                  </ul>
                </div>

                {order.notes && (
                  <div className="notes-info">
                    <strong>📝 Notas:</strong> {order.notes}
                  </div>
                )}

                <div className="payment-info">
                  <p><strong>💳 Pago:</strong> {order.payment.method === 'cash' ? 'Efectivo' : 'Transferencia'}</p>
                  <p className="total"><strong>Total: ${order.payment.total}</strong></p>
                </div>
              </div>

              <div className="order-actions">
                {order.status === 'pending' && (
                  <>
                    <button 
                      className="btn-accept"
                      onClick={() => updateOrderStatus(order.id, 'in-progress')}
                    >
                      ✅ Aceptar Pedido
                    </button>
                    <button 
                      className="btn-complete"
                      onClick={() => updateOrderStatus(order.id, 'completed')}
                    >
                      🎉 Marcar Completado
                    </button>
                    <button 
                      className="btn-cancel"
                      onClick={() => updateOrderStatus(order.id, 'cancelled')}
                    >
                      ❌ Cancelar
                    </button>
                  </>
                )}
                {order.status === 'in-progress' && (
                  <button 
                    className="btn-complete"
                    onClick={() => updateOrderStatus(order.id, 'completed')}
                  >
                    🎉 Marcar Completado
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
      {/* Mostrar Reservaciones cuando el filtro es 'reservations' */}
        {filter === 'reservations' && (
          <>
            {filteredReservations.length === 0 ? (
              <div className="empty-state">
                <h3>No hay reservaciones</h3>
                <p>Las nuevas reservaciones aparecerán aquí en tiempo real</p>
              </div>
            ) : (
              filteredReservations.map((reservation) => (
                <div key={reservation.id} className={`order-card reservation ${reservation.status}`}>
                  <div className="order-header">
                    <div className="order-id">
                      <strong>📅 #{reservation.id.slice(-6).toUpperCase()}</strong>
                      <span className={`status-badge ${reservation.status}`}>
                        {reservation.status === 'pending' ? '⏳ Pendiente' : 
                         reservation.status === 'confirmed' ? '✅ Confirmada' : 
                         '❌ Cancelada'}
                      </span>
                    </div>
                    <div className="order-time">
                      {formatDate(reservation.createdAt)}
                    </div>
                  </div>

                  <div className="order-body">
                    <div className="customer-info">
                      <h3>👤 {reservation.customer.name}</h3>
                      <p>📱 {reservation.customer.phone}</p>
                    </div>

                    <div className="delivery-info">
                      <p><strong>📅 Fecha:</strong> {reservation.date}</p>
                      <p><strong>🕐 Hora:</strong> {reservation.time}</p>
                      <p><strong>👥 Personas:</strong> {reservation.guests}</p>
                    </div>
                  </div>

                  {reservation.status === 'pending' && (
                    <div className="order-actions">
                      <button 
                        className="btn-accept"
                        onClick={() => updateReservationStatus(reservation.id, 'confirmed')}
                      >
                        ✅ Confirmar Reservación
                      </button>
                      <button 
                        className="btn-cancel"
                        onClick={() => updateReservationStatus(reservation.id, 'cancelled')}
                      >
                        ❌ Cancelar
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </>
        )}
    </div>
  );
}

export default AdminPanel;