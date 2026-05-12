import { useCartStore } from '../../store/cartStore';
import { useNavigate } from 'react-router-dom';
import '../../styles/Cart.css';

function Cart() {
  const navigate = useNavigate();
  const { items, removeItem, updateQuantity, getTotal, getTotalItems } = useCartStore();

  const subtotal = getTotal();
  const deliveryFee = subtotal >= 1000 ? 0 : 40;
  const total = subtotal + deliveryFee;

  if (items.length === 0) {
    return (
      <div className="cart-empty">
        <div className="empty-state">
          <h2>🛒 Tu carrito está vacío</h2>
          <p>Agrega productos deliciosos del menú</p>
          <button onClick={() => navigate('/')} className="btn-primary">
            Ver Menú
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-container">
        <div className="cart-header">
          <button onClick={() => navigate('/')} className="back-button">
            ← Volver al Menú
          </button>
          <h1>🛒 Tu Carrito ({getTotalItems()} items)</h1>
        </div>

        <div className="cart-content">
          <div className="cart-items">
            {items.map((item) => (
              <div key={item.cartId} className="cart-item">
                <div className="item-image">
                  <img src={item.image} alt={item.name} />
                </div>

                <div className="item-details">
                  <h3>{item.name}</h3>
                  <p className="item-description">{item.description}</p>
                  <p className="item-price">${item.price} c/u</p>
                </div>

                <div className="item-actions">
                  <div className="quantity-controls">
                    <button 
                      onClick={() => updateQuantity(item.cartId, item.quantity - 1)}
                      className="qty-btn"
                    >
                      −
                    </button>
                    <span className="quantity">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.cartId, item.quantity + 1)}
                      className="qty-btn"
                    >
                      +
                    </button>
                  </div>

                  <p className="item-total">${item.price * item.quantity}</p>

                  <button 
                    onClick={() => removeItem(item.cartId)}
                    className="remove-btn"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="order-summary">
            <h2>Resumen del Pedido</h2>

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

            {subtotal < 1000 && subtotal > 0 && (
              <div className="promo-message">
                💡 Agrega ${1000 - subtotal} más para envío gratis
              </div>
            )}

            <div className="summary-line total">
              <span>Total:</span>
              <span>${total}</span>
            </div>

            <button 
              onClick={() => navigate('/checkout')}
              className="checkout-btn"
            >
              Continuar a Dirección de Entrega →
            </button>

            <button 
              onClick={() => navigate('/')}
              className="continue-shopping"
            >
              ← Seguir Comprando
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;