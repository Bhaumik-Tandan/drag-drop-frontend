import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login as loginApi } from '../utils/apiHelper';

const Login = ({ onLogin }: { onLogin: () => void }) => {
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLoginInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginForm({ ...loginForm, [e.target.name]: e.target.value });
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    try {
      const data = await loginApi(loginForm.email, loginForm.password);
      localStorage.setItem('token', data.access_token || data.token || '');
      onLogin();
      navigate('/workflow', { replace: true });
    } catch (err: any) {
      setLoginError('Invalid email or password');
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '100px auto', background: 'white', padding: 32, borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>Login</h2>
      <form onSubmit={handleLoginSubmit}>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={loginForm.email}
          onChange={handleLoginInputChange}
          required
          style={{ width: '100%', padding: 8, marginBottom: 12, borderRadius: 6, border: '1px solid #e5e7eb' }}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={loginForm.password}
          onChange={handleLoginInputChange}
          required
          style={{ width: '100%', padding: 8, marginBottom: 12, borderRadius: 6, border: '1px solid #e5e7eb' }}
        />
        {loginError && <div style={{ color: 'red', marginBottom: 8 }}>{loginError}</div>}
        <button
          type="submit"
          style={{ width: '100%', padding: 10, background: '#2563eb', color: 'white', border: 'none', borderRadius: 6, fontWeight: 600 }}
        >
          Login
        </button>
      </form>
      <div style={{ marginTop: 12, textAlign: 'center' }}>
        Don't have an account? <Link to="/register">Sign Up</Link>
      </div>
    </div>
  );
};

export default Login;
