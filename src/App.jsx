import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Cart from './components/cart/Cart';
import Checkout from './components/checkout/Checkout';
import AdminPanel from './pages/AdminPanel';  // ← ESTA LÍNEA ES NUEVA
import './index.css';

function App() {
  return (
    <BrowserRouter>
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/cart" element={<Cart />} />
    <Route path="/checkout" element={<Checkout />} />
    <Route path="/admin" element={<AdminPanel />} />
  </Routes>
</BrowserRouter>
  );
}

export default App;
