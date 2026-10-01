import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import '../styles/Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from?.pathname || '/admin';

  // Si ya hay sesión activa, ir directo al admin
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) navigate(redirectTo, { replace: true });
    });
    return () => unsubscribe();
  }, [navigate, redirectTo]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      console.error('Error al iniciar sesión - code:', err.code);
      console.error('Error al iniciar sesión - message:', err.message);
      console.error('Error al iniciar sesión - objeto completo:', err);
      setError(`Error: ${err.code || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <form className="login-form" onSubmit={handleSubmit}>
        <h1>Panel Administrativo - Tortas Ahogadas</h1>
        <p className="login-subtitle">Inicia sesión para continuar</p>
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
        />
        {error && <p className="login-error">{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? 'Entrando...' : 'Iniciar sesión'}
        </button>
      </form>
    </div>
  );
}

export default Login;
