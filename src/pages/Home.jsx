import { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { menuData, restaurantInfo } from '../utils/menuData';
import '../styles/Home.css';

function Home() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { addItem, getTotalItems } = useCartStore();
  const navigate = useNavigate();

  const [selectedVariant, setSelectedVariant] = useState({});
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  
  // Estados para reservaciones
  const [reservationData, setReservationData] = useState({
    name: '',
    phone: '',
    date: '',
    time: '',
    guests: 2
  });
  const [isSubmittingReservation, setIsSubmittingReservation] = useState(false);

  const handleAddToCart = (item) => {
    if (item.variants && item.variants.length > 0) {
      setCurrentItem(item);
      setSelectedVariant(item.variants[0].name);
      setShowVariantModal(true);
    } else {
      addItem(item);
      alert(`${item.name} agregado al carrito`);
    }
  };

  const confirmAddToCart = () => {
    if (currentItem && selectedVariant) {
      const itemWithVariant = {
        ...currentItem,
        selectedVariant: selectedVariant,
        name: `${currentItem.name} - ${selectedVariant}`
      };
      addItem(itemWithVariant);
      alert(`${itemWithVariant.name} agregado al carrito`);
      setShowVariantModal(false);
      setCurrentItem(null);
    }
  };

  const scrollToReservations = () => {
    const reservationsSection = document.getElementById('reservations-section');
    if (reservationsSection) {
      reservationsSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const getAvailableHours = (dateString) => {
    if (!dateString) return [];
    
    const date = new Date(dateString + 'T00:00:00');
    const dayOfWeek = date.getDay();
    
    if (dayOfWeek === 1 || dayOfWeek === 2) {
      return [];
    }
    
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return [
        { value: '10:00', label: '10:00 AM' },
        { value: '10:30', label: '10:30 AM' },
        { value: '11:00', label: '11:00 AM' },
        { value: '11:30', label: '11:30 AM' },
        { value: '12:00', label: '12:00 PM' },
        { value: '12:30', label: '12:30 PM' },
        { value: '13:00', label: '1:00 PM' },
        { value: '13:30', label: '1:30 PM' },
        { value: '14:00', label: '2:00 PM' },
        { value: '14:30', label: '2:30 PM' },
        { value: '15:00', label: '3:00 PM' },
        { value: '15:30', label: '3:30 PM' },
        { value: '16:00', label: '4:00 PM' },
        { value: '16:30', label: '4:30 PM' },
        { value: '17:00', label: '5:00 PM' }
      ];
    }
    
    return [
      { value: '13:00', label: '1:00 PM' },
      { value: '13:30', label: '1:30 PM' },
      { value: '14:00', label: '2:00 PM' },
      { value: '14:30', label: '2:30 PM' },
      { value: '15:00', label: '3:00 PM' },
      { value: '15:30', label: '3:30 PM' },
      { value: '16:00', label: '4:00 PM' },
      { value: '16:30', label: '4:30 PM' },
      { value: '17:00', label: '5:00 PM' },
      { value: '17:30', label: '5:30 PM' },
      { value: '18:00', label: '6:00 PM' }
    ];
  };

  const handleReservationChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'date') {
      setReservationData(prev => ({
        ...prev,
        date: value,
        time: ''
      }));
    } else {
      setReservationData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleReservationSubmit = async (e) => {
    e.preventDefault();
    
    if (!reservationData.name || !reservationData.phone) {
      alert('Por favor completa tu nombre y teléfono');
      return;
    }
    
    if (!reservationData.date || !reservationData.time) {
      alert('Por favor selecciona fecha y hora');
      return;
    }
    
    const date = new Date(reservationData.date + 'T00:00:00');
    const dayOfWeek = date.getDay();

    if (dayOfWeek === 1 || dayOfWeek === 2) {
      alert('❌ Lo sentimos, estamos cerrados los Lunes y Martes.\n\nHorario:\n🗓️ Miércoles-Viernes: 1:00 PM - 6:00 PM\n🗓️ Sábado-Domingo: 10:00 AM - 5:00 PM');
      return;
    }
    
    const selectedDate = new Date(`${reservationData.date}T${reservationData.time}`);
    const now = new Date();
    
    if (selectedDate < now) {
      alert('No puedes hacer una reservación en el pasado');
      return;
    }
    
    setIsSubmittingReservation(true);
    
    try {
      const reservation = {
        customer: {
          name: reservationData.name,
          phone: reservationData.phone
        },
        date: reservationData.date,
        time: reservationData.time,
        guests: parseInt(reservationData.guests),
        status: 'pending',
        createdAt: serverTimestamp()
      };
      
      await addDoc(collection(db, 'reservations'), reservation);
      
      alert(`✅ ¡Reservación confirmada!\n\n📅 ${reservationData.date}\n🕐 ${reservationData.time}\n👥 ${reservationData.guests} personas\n\n¡Nos vemos pronto!`);
      
      setReservationData({
        name: '',
        phone: '',
        date: '',
        time: '',
        guests: 2
      });
      
    } catch (error) {
      console.error('Error al guardar reservación:', error);
      alert('Hubo un error al guardar tu reservación. Por favor intenta de nuevo.');
    } finally {
      setIsSubmittingReservation(false);
    }
  };

  const categories = [...new Set(menuData.map(item => item.category))];
  const filteredItems = selectedCategory === 'all' ? menuData : menuData.filter(item => item.category === selectedCategory);

  return (
    <div className="home">
      <header className="header">
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
            <img src="/images/logo.jpg" alt="Logo" style={{ height: '80px', width: 'auto' }} />
            <h1>{restaurantInfo.name}</h1>
          </div>
          <button className="cart-button" onClick={() => navigate('/cart')}>
            🛒 Carrito ({getTotalItems()})
          </button>
        </div>
      </header>

      <section className="hero">
        <div className="container">
          <h2>¡Bienvenidos!</h2>
          <p>Las mejores tortas ahogadas de la ciudad</p>
        </div>
      </section>

      {/* Botón para ir a reservaciones */}
      <div className="reservation-cta">
        <button 
          className="btn-reserve-now"
          onClick={scrollToReservations}
        >
          📅 Hacer mi Reservación
        </button>
      </div>

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
              <div className="zone-item"><span className="zone-distance">0.8-2 km</span><span className="zone-price">$25</span></div>
              <div className="zone-item"><span className="zone-distance">2-4 km</span><span className="zone-price">$40</span></div>
              <div className="zone-item"><span className="zone-distance">4-8 km</span><span className="zone-price">$80</span></div>
              <div className="zone-item"><span className="zone-distance">8-15 km</span><span className="zone-price">$130</span></div>
            </div>
            <p className="delivery-time">⏱️ Tiempo estimado: 30-45 minutos</p>
          </div>
        </div>
      </section>

      <section className="category-filter">
        <div className="container">
          <button className={selectedCategory === 'all' ? 'active' : ''} onClick={() => setSelectedCategory('all')}>Todos</button>
          {categories.map(cat => (
            <button key={cat} className={selectedCategory === cat ? 'active' : ''} onClick={() => setSelectedCategory(cat)}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </section>

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
                  <button className="add-button" onClick={() => handleAddToCart(item)} disabled={!item.available}>
                    {item.available ? 'Agregar' : 'No disponible'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sistema de Reservaciones - Movido al final */}
      <section id="reservations-section" className="info-section" style={{ paddingTop: '3rem' }}>
        <div className="container">
          <div className="reservation-card">
            <div className="card-icon">📅</div>
            <h2>Hacer una Reservación</h2>
            
            <form onSubmit={handleReservationSubmit} className="reservation-form">
              <div className="form-group">
                <label>📅 Fecha</label>
                <input type="date" name="date" value={reservationData.date} onChange={handleReservationChange} min={new Date().toISOString().split('T')[0]} required />
              </div>
              
              <div className="form-group">
                <label>🕐 Hora</label>
                <select name="time" value={reservationData.time} onChange={handleReservationChange} required disabled={!reservationData.date}>
                  <option value="">{!reservationData.date ? 'Primero selecciona una fecha' : getAvailableHours(reservationData.date).length === 0 ? 'Cerrado este día (Lunes/Martes)' : 'Selecciona una hora'}</option>
                  {getAvailableHours(reservationData.date).map(hour => (
                    <option key={hour.value} value={hour.value}>{hour.label}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>👥 Número de personas</label>
                <select name="guests" value={reservationData.guests} onChange={handleReservationChange} required>
                  {[1,2,3,4,5,6,7,8,9,10,12,15,20].map(num => (
                    <option key={num} value={num}>{num} {num === 1 ? 'persona' : 'personas'}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>👤 Tu nombre</label>
                <input type="text" name="name" value={reservationData.name} onChange={handleReservationChange} placeholder="Juan Pérez" required />
              </div>
              
              <div className="form-group">
                <label>📱 Teléfono (WhatsApp)</label>
                <input type="tel" name="phone" value={reservationData.phone} onChange={handleReservationChange} placeholder="5512345678" pattern="[0-9]{10}" required />
              </div>
              
              <button type="submit" className="reservation-btn" disabled={isSubmittingReservation}>
                {isSubmittingReservation ? '⏳ Enviando...' : '🍽️ Reservar Mesa'}
              </button>
            </form>
          </div>
        </div>
      </section>

      {showVariantModal && currentItem && (
        <div style={{position:'fixed',top:0,left:0,right:0,bottom:0,backgroundColor:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000}} onClick={() => setShowVariantModal(false)}>
          <div style={{backgroundColor:'white',padding:'30px',borderRadius:'10px',maxWidth:'400px',width:'90%'}} onClick={(e) => e.stopPropagation()}>
            <h3>{currentItem.name}</h3>
            <p style={{color:'#666',marginBottom:'20px'}}>${currentItem.price}</p>
            <div style={{marginBottom:'20px'}}>
              <label style={{display:'block',fontWeight:'bold',marginBottom:'10px'}}>Selecciona el sabor:</label>
              {currentItem.variants.map((variant) => (
                <div key={variant.name} style={{marginBottom:'8px'}}>
                  <label style={{display:'flex',alignItems:'center',cursor:'pointer'}}>
                    <input type="radio" name="variant" value={variant.name} checked={selectedVariant === variant.name} onChange={(e) => setSelectedVariant(e.target.value)} style={{marginRight:'10px'}} />
                    {variant.name}
                  </label>
                </div>
              ))}
            </div>
            <div style={{display:'flex',gap:'10px'}}>
              <button onClick={confirmAddToCart} style={{flex:1,padding:'12px',backgroundColor:'#dc2626',color:'white',border:'none',borderRadius:'5px',cursor:'pointer',fontWeight:'bold'}}>Agregar al Carrito</button>
              <button onClick={() => setShowVariantModal(false)} style={{flex:1,padding:'12px',backgroundColor:'#6b7280',color:'white',border:'1px solid #ddd',borderRadius:'5px',cursor:'pointer'}}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
