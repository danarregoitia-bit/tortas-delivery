import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useCartStore } from '../store/cartStore';
import { menuData, restaurantInfo } from '../utils/menuData';
import '../styles/Home.css';

function Home() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { addItem, getTotalItems } = useCartStore();
  const navigate = useNavigate();

  const handleAddToCart = (item) => {
    addItem(item);
    alert(`${item.name} agregado al carrito`);
  };

  // Obtener categorías únicas
  const categories = [...new Set(menuData.map(item => item.category))];

  // Filtrar productos por categoría
  const filteredItems = selectedCategory === 'all'
    ? menuData
    : menuData.filter(item => item.category === selectedCategory);

  return (
    <div className="home">
      {/* Header */}
      <header className="header">
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
            <img
              src="/images/logo.jpg"
              alt="Logo"
              style={{ height: '80px', width: 'auto' }}
            />
            <h1>{restaurantInfo.name}</h1>
          </div>
          <button className="cart-button" onClick={() => navigate('/cart')}>
            🛒 Carrito ({getTotalItems()})
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <h2>¡Bienvenidos!</h2>
          <p>Las mejores tortas ahogadas de la ciudad</p>
        </div>
      </section>

      {/* Info Cards */}
      <section className="info-section">
        <div className="container">
          <div className="info-cards">
            <div className="info-card">
              <div className="card-icon">📍</div>
              <h3>Ubicación</h3>
              <p>Av. Amazonas</p>
              <p>Col. Ensueños, 54740</p>
              <p>Cuautitlán Izcalli, Méx.</p>
            </div>
            
            <div className="info-card">
              <div className="card-icon">📞</div>
              <h3>Contacto</h3>
              <p>{restaurantInfo.phone}</p>
            </div>
            
            <div className="info-card">
              <div className="card-icon">⏰</div>
              <h3>Horario</h3>
              <p>{restaurantInfo.hours}</p>
            </div>
          </div>

          <div className="delivery-info">
            <div className="delivery-header">
              <h3>🏍️ Servicio a Domicilio</h3>
              <p className="delivery-subtitle">Costos de envío desde Colonia Ensueños</p>
            </div>
            <div className="delivery-zones">
              <div className="zone-item free">
                <span className="zone-distance">Colonia Ensueños</span>
                <span className="zone-price">GRATIS 🎉</span>
              </div>
              <div className="zone-item">
                <span className="zone-distance">1-2 km</span>
                <span className="zone-price">$25</span>
              </div>
              <div className="zone-item">
                <span className="zone-distance">3-4 km</span>
                <span className="zone-price">$40</span>
              </div>
              <div className="zone-item">
                <span className="zone-distance">5-9 km</span>
                <span className="zone-price">$80</span>
              </div>
              <div className="zone-item">
                <span className="zone-distance">10+ km</span>
                <span className="zone-price">$130</span>
              </div>
            </div>
            <p className="delivery-time">⏱️ Tiempo estimado: 30-45 minutos</p>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="category-filter">
        <div className="container">
          <button
            className={selectedCategory === 'all' ? 'active' : ''}
            onClick={() => setSelectedCategory('all')}
          >
            Todos
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              className={selectedCategory === cat ? 'active' : ''}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </section>

      {/* Menu Items */}
      <section className="menu">
        <div className="container">
          <div className="menu-grid">
            {filteredItems.map((item) => (
              <div key={item.id} className="menu-item">
                <img src={item.image} alt={item.name} />
                <div className="menu-item-content">
                  <h3>{item.name}</h3>
                  <p className="description">{item.description}</p>
                  <div className="menu-item-footer">
                    <span className="price">${item.price}</span>
                    <span className="prep-time">⏱️ {item.preparationTime} min</span>
                  </div>
                  <button
                    className="add-button"
                    onClick={() => handleAddToCart(item)}
                    disabled={!item.available}
                  >
                    {item.available ? 'Agregar' : 'No disponible'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
