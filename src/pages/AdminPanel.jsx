import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import '../styles/AdminPanel.css';

function AdminPanel() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('all');

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
      setOrders(ordersData);
    });

    return () => unsubscribe();
  }, []);

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

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    return order.status === filter;
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
    </div>
  );
}

export default AdminPanel;