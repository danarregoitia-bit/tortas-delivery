import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import '../styles/AdminPanel.css';

function AdminPanel() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('all');
  const [reservations, setReservations] = useState([]);
  const [previousOrdersCount, setPreviousOrdersCount] = useState(0);
  const [previousReservationsCount, setPreviousReservationsCount] = useState(0);
  const [notificationPermission, setNotificationPermission] = useState('default');

  // Reproducir sonido de alerta con vibración como respaldo
  const playSound = (type) => {
    try {
      let audioUrl = '';
      
      if (type === 'order') {
        audioUrl = 'https://www.soundjay.com/mechanical/sounds/cash-register-1.mp3';
      } else if (type === 'reservation') {
        audioUrl = 'https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3';
      }
      
      const audio = new Audio(audioUrl);
      audio.volume = 0.7;
      audio.play().catch(err => {
        console.log('Audio bloqueado, usando vibración:', err);
        // Si el sonido falla, vibrar como alternativa
        if (navigator.vibrate) {
          if (type === 'order') {
            navigator.vibrate([200, 100, 200]); // Vibración corta-pausa-corta
          } else {
            navigator.vibrate([400, 200, 400, 200, 400]); // Vibración larga (timbre)
          }
        }
      });
    } catch (error) {
      console.log('Error en playSound:', error);
      // Vibración de respaldo
      if (navigator.vibrate) {
        navigator.vibrate(200);
      }
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
          body = `Cliente: ${data.customer.name}\nTotal: $${data.payment.total}`;
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

  // Escuchar pedidos en tiempo real
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
      
      if (previousOrdersCount > 0 && ordersData.length > previousOrdersCount) {
        const newOrder = ordersData[0];
        playSound('order');
        showNotification('order', newOrder);
      }
      
      setPreviousOrdersCount(ordersData.length);
      setOrders(ordersData);
    });

    return () => unsubscribe();
  }, [previousOrdersCount]);

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
      
      if (previousReservationsCount > 0 && reservationsData.length > previousReservationsCount) {
        const newReservation = reservationsData[0];
        playSound('reservation');
        showNotification('reservation', newReservation);
      }
      
      setPreviousReservationsCount(reservationsData.length);
      setReservations(reservationsData);
    });

    return () => unsubscribe();
  }, [previousReservationsCount]);

  // NUEVA FUNCIÓN: Confirmar pedido (envía WhatsApp de confirmación)
  const confirmOrder = async (orderId) => {
    try {
      const order = orders.find(o => o.id === orderId);
      
      if (!order) {
        alert('Error: Pedido no encontrado');
        return;
      }

      // Actualizar estado a 'confirmed'
      await updateDoc(doc(db, 'orders', orderId), {
        status: 'confirmed'
      });

      // Preparar mensaje de WhatsApp
      const phone = order.customer.phone.replace(/\D/g, '');
      
      // Construir lista de productos
      const productosList = order.items
        .map(item => `• ${item.quantity}x ${item.name}`)
        .join('\n');

      const message = `¡Hola ${order.customer.name}! 👋

✅ *PEDIDO CONFIRMADO* #${order.id.slice(-6).toUpperCase()}

Recibimos tu pedido:
${productosList}

💰 Total: $${order.payment.total}
💵 Método de pago: ${order.payment.method === 'cash' ? 'Efectivo' : 'Transferencia/SPEI'}

${order.delivery.type === 'delivery' 
  ? `🚗 Entrega a domicilio:\n📍 ${order.delivery.address}\n\n⏰ Tiempo estimado: 30-45 minutos`
  : `🏃 Para llevar\n\n⏰ Listo en 30-45 minutos`
}

Te avisaremos cuando tu pedido esté listo y en camino. 🌶️

Gracias por tu preferencia,
Tortas Ahogadas Guadalajara`;

      const whatsappURL = `https://api.whatsapp.com/send?phone=52${phone}&text=${encodeURIComponent(message)}`;
      window.location.href = whatsappURL;

    } catch (error) {
      console.error('Error al confirmar pedido:', error);
      alert('Error al confirmar el pedido');
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status: newStatus
      });
      
      // Si el pedido se marcó como PREPARING (listo para entregar), enviar WhatsApp al cliente
      if (newStatus === 'preparing') {
        const order = orders.find(o => o.id === orderId);
        
        if (order) {
          const phone = order.customer.phone.replace(/\D/g, '');
          let message = '';
          
          if (order.delivery.type === 'delivery') {
            // Mensaje para ENTREGA A DOMICILIO
            message = `¡Hola ${order.customer.name}! 🚗

Tu pedido ya está listo y en camino a:
📍 ${order.delivery.address}

Gracias por tu preferencia 🌶️
Tortas Ahogadas Guadalajara`;
          } else {
            // Mensaje para PARA LLEVAR
            message = `¡Hola ${order.customer.name}! ✅

Tu pedido ya está listo para recoger 🌶️

Puedes pasar a recogerlo cuando gustes.

Gracias por tu preferencia 🌶️
Tortas Ahogadas Guadalajara`;
          }
          
          const whatsappURL = `https://api.whatsapp.com/send?phone=52${phone}&text=${encodeURIComponent(message)}`;
          window.location.href = whatsappURL;
        }
      } else {
        alert(`Pedido actualizado a: ${newStatus === 'completed' ? 'Entregado' : newStatus}`);
      }
    } catch (error) {
      console.error('Error al actualizar:', error);
      alert('Error al actualizar el pedido');
    }
  };

  const updateReservationStatus = async (reservationId, newStatus) => {
    try {
      await updateDoc(doc(db, 'reservations', reservationId), {
        status: newStatus
      });
      
      // Encontrar la reservación para obtener los datos del cliente
      const reservation = reservations.find(r => r.id === reservationId);
      
      if (reservation) {
        // Limpiar el número de teléfono (quitar espacios, guiones, paréntesis)
        const phone = reservation.customer.phone.replace(/\D/g, '');
        
        let message = '';
        
        if (newStatus === 'confirmed') {
          // Mensaje de CONFIRMACIÓN
          message = `¡Hola ${reservation.customer.name}! ✅ Tu reservación ha sido *CONFIRMADA*:

📅 Fecha: ${reservation.date}
🕐 Hora: ${reservation.time}
👥 Personas: ${reservation.guests}
⏰ Tolerancia: 10 minutos

¡Te esperamos en Tortas Ahogadas Guadalajara! 🌶️`;
        } else if (newStatus === 'cancelled') {
          // Mensaje de CANCELACIÓN (no hay mesa disponible)
          message = `Hola ${reservation.customer.name}, gracias por tu interés. 😔

Lamentablemente el horario que solicitaste:
📅 Fecha: ${reservation.date}
🕐 Hora: ${reservation.time}

Ya está ocupado. ¿Te gustaría otro horario? Contáctanos y te ayudamos a encontrar el mejor momento. 📞`;
        }
        
        // Construir URL de WhatsApp para móvil
        const whatsappURL = `https://api.whatsapp.com/send?phone=52${phone}&text=${encodeURIComponent(message)}`;
        
        // Redirigir a WhatsApp (abre la app en móvil)
        window.location.href = whatsappURL;
      } else {
        alert(`Reservación actualizada a: ${newStatus === 'confirmed' ? 'Confirmada' : 'Cancelada'}`);
      }
    } catch (error) {
      console.error('Error al actualizar reservación:', error);
      alert('Error al actualizar la reservación');
    }
  };

  // Filtrar items según el filtro activo
  const filteredOrders = filter === 'reservations' 
    ? [] 
    : orders.filter(order => {
        if (filter === 'all') return true;
        return order.status === filter;
      });

  const filteredReservations = filter === 'reservations' 
    ? reservations 
    : [];

  const filteredItems = filter === 'reservations' ? filteredReservations : filteredOrders;

  // Contar items pendientes para badges
  const pendingOrdersCount = orders.filter(o => o.status === 'pending').length;
  const pendingReservationsCount = reservations.filter(r => r.status === 'pending').length;

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Sin fecha';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString('es-MX');
  };

  // Verificar si una fecha es de hoy
  const isToday = (timestamp) => {
    if (!timestamp) return false;
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const today = new Date();
    
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  // Contadores de HOY para las tarjetas grandes
  const todayOrders = orders.filter(o => isToday(o.createdAt));
  const todayPendingOrders = todayOrders.filter(o => o.status === 'pending');
  const todayCompletedOrders = todayOrders.filter(o => o.status === 'completed');
  const todayReservations = reservations.filter(r => isToday(r.createdAt));

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h1>📊 Panel de Administración</h1>
        <div className="admin-stats">
          <div className="stat-card">
            <span className="stat-number">{todayOrders.length}</span>
            <span className="stat-label">Pedidos de Hoy</span>
          </div>
          <div className="stat-card pending">
            <span className="stat-number">{todayPendingOrders.length}</span>
            <span className="stat-label">Pendientes Hoy</span>
          </div>
          <div className="stat-card completed">
            <span className="stat-number">{todayCompletedOrders.length}</span>
            <span className="stat-label">Completados Hoy</span>
          </div>
          <div className="stat-card" style={{background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'}}>
            <span className="stat-number">{todayReservations.length}</span>
            <span className="stat-label">Reservaciones Hoy</span>
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
          🆕 Nuevos ({orders.filter(o => o.status === 'pending').length})
          {pendingOrdersCount > 0 && (
            <span className="badge-notification">{pendingOrdersCount}</span>
          )}
        </button>
        <button 
          className={filter === 'confirmed' ? 'active' : ''} 
          onClick={() => setFilter('confirmed')}
        >
          ✅ Confirmados ({orders.filter(o => o.status === 'confirmed').length})
        </button>
        <button 
  className={filter === 'preparing' ? 'active' : ''} 
  onClick={() => setFilter('preparing')}
>
  🚚 En Ruta ({orders.filter(o => o.status === 'preparing').length})
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
          {pendingReservationsCount > 0 && (
            <span className="badge-notification">{pendingReservationsCount}</span>
          )}
        </button>
      </div>

      <div className="orders-list">
        {filteredItems.length === 0 && (
          <div className="no-orders">
            <p>
              {filter === 'reservations'
                ? 'No hay reservaciones'
                : 'No hay pedidos'}
            </p>
            <p className="subtitle">
              {filter === 'reservations'
                ? 'Las nuevas reservaciones aparecerán aquí en tiempo real'
                : 'Los nuevos pedidos aparecerán aquí en tiempo real'}
            </p>
          </div>
        )}

        {filteredItems.map((item) => {
          // Renderizar reservación
          if (filter === 'reservations') {
            return (
              <div key={item.id} className="order-card">
                <div className="order-header">
                  <div className="order-id">
                    <strong>📅 #{item.id.slice(-6).toUpperCase()}</strong>
                  </div>
                  <span className={`status-badge ${item.status}`}>
                    {item.status === 'pending' ? '⏳ Pendiente' :
                     item.status === 'confirmed' ? '✅ Confirmada' :
                     '❌ Cancelada'}
                  </span>
                </div>

                <div className="order-time">
                  {formatDate(item.createdAt)}
                </div>

                <div className="order-body">
                  <div className="customer-info">
                    <h3>👤 {item.customer.name}</h3>
                    <p>📱 {item.customer.phone}</p>
                  </div>

                  <div className="reservation-info">
                    <p><strong>📅 Fecha:</strong> {item.date}</p>
                    <p><strong>🕐 Hora:</strong> {item.time}</p>
                    <p><strong>👥 Personas:</strong> {item.guests}</p>
                  </div>
                </div>

                {item.status === 'pending' && (
                  <div className="order-actions">
                    <button
                      className="btn-complete"
                      onClick={() => updateReservationStatus(item.id, 'confirmed')}
                    >
                      ✅ Confirmar Reservación
                    </button>
                    <button
                      className="btn-cancel"
                      onClick={() => updateReservationStatus(item.id, 'cancelled')}
                    >
                      ❌ Cancelar
                    </button>
                  </div>
                )}
              </div>
            );
          }

          // Renderizar pedido
          return (
            <div key={item.id} className={`order-card ${item.status}`}>
              <div className="order-header">
                <div className="order-id">
                  <strong>#{item.id.slice(-6).toUpperCase()}</strong>
                </div>
                <span className={`status-badge ${item.status}`}>
  {item.status === 'pending' ? '🆕 Nuevo' :
   item.status === 'confirmed' ? '✅ Confirmado' :
   item.status === 'preparing' ? '🚚 En Ruta' :
   item.status === 'completed' ? '✅ Completado' :
   item.status}
</span>
              </div>

              <div className="order-time">
                {formatDate(item.createdAt)}
              </div>

              <div className="order-body">
                <div className="customer-info">
                  <h3>👤 {item.customer.name}</h3>
                  <p>📱 {item.customer.phone}</p>
                  {item.customer.email && <p>📧 {item.customer.email}</p>}
                </div>

                <div className="delivery-info">
                  {item.delivery.type === 'delivery' ? (
                    <>
                      <p><strong>🚗 Entrega a domicilio</strong></p>
                      <p>📍 {item.delivery.address}</p>
                    </>
                  ) : (
                    <p><strong>🏃 Para llevar</strong></p>
                  )}
                </div>

                <div className="products">
                  <p><strong>🌶️ Productos:</strong></p>
                  <ul>
                    {item.items.map((product, index) => (
                      <li key={index}>
                        {product.quantity}x {product.name} - ${product.price}
                      </li>
                    ))}
                  </ul>

                  {/* NOTAS DEL CLIENTE - DENTRO DE PRODUCTS */}
                  {item.notes && item.notes.trim() && (
                    <div className="order-notes">
                      <p><strong>📝 Notas del Cliente:</strong></p>
                      <p className="notes-text">{item.notes}</p>
                    </div>
                  )}
                </div>

                <div className="order-total">
                  <strong>Total: ${item.payment.total}</strong>
                </div>
              </div>

              {/* BOTONES SEGÚN EL ESTADO */}
              {item.status === 'pending' && (
                <div className="order-actions">
                  <button
                    className="btn-confirm"
                    onClick={() => confirmOrder(item.id)}
                  >
                    ✅ Confirmar Pedido
                  </button>
                </div>
              )}

              {item.status === 'confirmed' && (
                <div className="order-actions">
                  <button
                    className="btn-preparing"
                    onClick={() => updateOrderStatus(item.id, 'preparing')}
                  >
                    👨‍🍳 Listo para Entregar
                  </button>
                </div>
              )}

              {item.status === 'preparing' && (
                <div className="order-actions">
                  <button
                    className="btn-complete"
                    onClick={() => updateOrderStatus(item.id, 'completed')}
                  >
                    ✅ Marcar como Entregado
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default AdminPanel;