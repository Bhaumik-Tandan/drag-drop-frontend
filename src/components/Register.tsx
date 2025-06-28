import React, { useState } from 'react';
import { register as registerApi } from '../utils/apiHelper';
import { useNavigate, Link } from 'react-router-dom';
import { Card, FormLayout, TextField, Button, Banner } from '@shopify/polaris';

const Register = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (value: string, id: string) => {
    setForm({ ...form, [id]: value });
  };

  const handleSubmit = async () => {
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
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      background: 'var(--p-surface)'
    }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <Card>
          <div style={{ padding: 'var(--p-space-8)' }}>
            <div style={{ textAlign: 'center', marginBottom: 'var(--p-space-6)' }}>
              <h1 style={{ 
                fontSize: 'var(--p-font-size-7)', 
                fontWeight: 'var(--p-font-weight-bold)',
                margin: 0,
                color: 'var(--p-text)'
              }}>
                Create Account
              </h1>
              <p style={{ 
                color: 'var(--p-text-subdued)', 
                marginTop: 'var(--p-space-2)',
                marginBottom: 0
              }}>
                Join us to start building workflows
              </p>
            </div>

            {error && (
              <Banner tone="critical" onDismiss={() => setError(null)}>
                {error}
              </Banner>
            )}

            {success && (
              <Banner tone="success">
                Registration successful! Redirecting...
              </Banner>
            )}

            <FormLayout>
              <TextField
                label="Email"
                type="email"
                value={form.email}
                onChange={handleChange}
                id="email"
                autoComplete="email"
              />
              <TextField
                label="Password"
                type="password"
                value={form.password}
                onChange={handleChange}
                id="password"
                autoComplete="new-password"
              />
              <Button
                variant="primary"
                fullWidth
                onClick={handleSubmit}
                disabled={!form.email || !form.password || success}
              >
                Sign Up
              </Button>
            </FormLayout>

            <div style={{ 
              marginTop: 'var(--p-space-6)', 
              textAlign: 'center',
              paddingTop: 'var(--p-space-4)',
              borderTop: '1px solid var(--p-border-subdued)'
            }}>
              <p style={{ 
                color: 'var(--p-text-subdued)', 
                margin: 0,
                fontSize: 'var(--p-font-size-3)'
              }}>
                Already have an account?{' '}
                <Link 
                  to="/login" 
                  style={{ 
                    color: 'var(--p-action-primary)', 
                    textDecoration: 'none',
                    fontWeight: 'var(--p-font-weight-semibold)'
                  }}
                >
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Register;
