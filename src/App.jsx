import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Cart from './components/cart/Cart';
import Checkout from './components/checkout/Checkout';
import AdminPanel from './pages/AdminPanel';  // ← ESTA LÍNEA ES NUEVA
import Repartidor from './pages/Repartidor';
import Login from './pages/Login';
import PrivateRoute from './components/auth/PrivateRoute';
import './index.css';

function App() {
  return (
    <BrowserRouter>
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/cart" element={<Cart />} />
    <Route path="/checkout" element={<Checkout />} />
    <Route path="/login" element={<Login />} />
    <Route path="/admin" element={<PrivateRoute><AdminPanel /></PrivateRoute>} />
    <Route path="/repartidor" element={<Repartidor />} />
  </Routes>
</BrowserRouter>
  );
}

export default App;
