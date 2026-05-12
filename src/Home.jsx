import { useState } from 'react';
import { menuData, restaurantInfo } from '../utils/menuData';
import '../styles/Home.css';

function Home() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cart, setCart] = useState([]);

  const addToCart = (item) => {
    setCart([...cart, { ...item, quantity: 1, id: Date.now() }]);
    alert(`${item.name} agregado al carrito`);
  };

  const filteredItems = selectedCategory === 'all' 
    ? menuData.categories.flatMap(cat => cat.items)
    : menuData.categories.find(cat => cat.id === selectedCategory)?.items || [];

  return (
    <div className="home">
      {/* Header */}
      <header className="header">
        <div className="container">
          <h1>🌮 {restaurantInfo.name}</h1>
          <p className="subtitle">Auténticas Tortas Ahogadas de Guadalajara</p>
          <div className="header-info">
            <span>📍 {restaurantInfo.address}</span>
            <span>📞 {restaurantInfo.phone}</span>
          </div>
        </div>
      </header>

      {/* Horarios */}
      <section className="schedule">
        <div className="container">
          <h3>🕐 Horarios de Atención</h3>
          <div className="schedule-grid">
            <div className="day">Miércoles - Viernes: <strong>1:00 PM - 6:00 PM</strong></div>
            <div className="day">Sábado - Domingo: <strong>10:00 AM - 5:00 PM</strong></div>
            <div className="day closed">Lunes y Martes: <strong>Cerrado</strong></div>
          </div>
        </div>
      </section>

      {/* Delivery Info */}
      <section className="delivery-info">
        <div className="container">
          <div className="delivery-card">
            <h3>🏍️ Servicio a Domicilio</h3>
            <p>Costo de envío: <strong>${restaurantInfo.delivery.baseFee}</strong></p>
            <p>Envío GRATIS en pedidos mayores a <strong>${restaurantInfo.delivery.freeDeliveryMinimum}</strong></p>
            <p>Tiempo estimado: <strong>{restaurantInfo.delivery.estimatedTime}</strong></p>
          </div>
        </div>
      </section>

      {/* Categorías */}
      <section className="categories">
        <div className="container">
          <h2>Nuestro Menú</h2>
          <div className="category-buttons">
            <button 
              className={selectedCategory === 'all' ? 'active' : ''}
              onClick={() => setSelectedCategory('all')}
            >
              Todo el Menú
            </button>
            {menuData.categories.map(category => (
              <button
                key={category.id}
                className={selectedCategory === category.id ? 'active' : ''}
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Menú Items */}
      <section className="menu">
        <div className="container">
          <div className="menu-grid">
            {filteredItems.map(item => (
              <div key={item.id} className="menu-item">
                <div className="item-image">
                  <img src={item.image} alt={item.name} />
                </div>
                <div className="item-info">
                  <h3>{item.name}</h3>
                  <p className="description">{item.description}</p>
                  <div className="item-footer">
                    <span className="price">${item.price}</span>
                    <button 
                      className="add-btn"
                      onClick={() => addToCart(item)}
                    >
                      Agregar
                    </button>
                  </div>
                  <span className="prep-time">⏱️ {item.preparationTime} min</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Carrito flotante */}
      {cart.length > 0 && (
        <div className="cart-float">
          <button className="cart-button">
            🛒 Ver Carrito ({cart.length})
          </button>
        </div>
      )}
    </div>
  );
}

export default Home;