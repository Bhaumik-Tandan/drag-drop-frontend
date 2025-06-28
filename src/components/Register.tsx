import React, { useState } from 'react';
import { register as registerApi } from '../utils/apiHelper';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await registerApi(form.email, form.password);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 1200);
    } catch (err: any) {
      setError('Registration failed');
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '100px auto', background: 'white', padding: 32, borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>Sign Up</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
          style={{ width: '100%', padding: 8, marginBottom: 12, borderRadius: 6, border: '1px solid #e5e7eb' }}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
          style={{ width: '100%', padding: 8, marginBottom: 12, borderRadius: 6, border: '1px solid #e5e7eb' }}
        />
        {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
        {success && <div style={{ color: 'green', marginBottom: 8 }}>Registration successful! Redirecting...</div>}
        <button
          type="submit"
          style={{ width: '100%', padding: 10, background: '#2563eb', color: 'white', border: 'none', borderRadius: 6, fontWeight: 600 }}
        >
          Sign Up
        </button>
      </form>
      <div style={{ marginTop: 12, textAlign: 'center' }}>
        Already have an account? <Link to="/login">Login</Link>
      </div>
    </div>
  );
};

export default Register;
