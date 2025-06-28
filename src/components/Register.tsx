import React, { useState } from 'react';
import { register as registerApi } from '../utils/apiHelper';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  FormLayout, 
  TextField, 
  Button, 
  Banner,
  Icon,
  Text
} from '@shopify/polaris';

const Register = () => {
  const [form, setForm] = useState({ 
    email: '', 
    password: '', 
    confirmPassword: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (value: string, id: string) => {
    setForm({ ...form, [id]: value });
    if (error) setError(null);
  };

  const validateForm = () => {
    if (!form.email || !form.password || !form.confirmPassword) {
      setError('All fields are required');
      return false;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    if (!form.email.includes('@')) {
      setError('Please enter a valid email address');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setError(null);
    setIsLoading(true);
    
    try {
      await registerApi(form.email, form.password);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      setError('Registration failed. Please try again or use a different email.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: 'var(--p-space-4)'
    }}>
      <div style={{ width: '100%', maxWidth: 450 }}>
        <Card>
          <div style={{ padding: 'var(--p-space-8)' }}>
            <div style={{ textAlign: 'center', marginBottom: 'var(--p-space-8)' }}>
              <h1 style={{ 
                fontSize: 'var(--p-font-size-8)',
                fontWeight: 'var(--p-font-weight-bold)',
                margin: '0 0 var(--p-space-4) 0',
                background: 'linear-gradient(135deg, var(--p-action-primary) 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.02em'
              }}>
                Join Workflow Builder
              </h1>
              <p style={{ 
                margin: 0,
                color: 'var(--p-text-subdued)',
                fontSize: 'var(--p-font-size-4)',
                lineHeight: 1.6,
                maxWidth: '320px',
                marginLeft: 'auto',
                marginRight: 'auto'
              }}>
                Create your account and start building amazing workflows in minutes
              </p>
            </div>

            {error && (
              <div style={{ marginBottom: 'var(--p-space-6)' }}>
                <Banner 
                  tone="critical" 
                  onDismiss={() => setError(null)}
                >
                  <p>{error}</p>
                </Banner>
              </div>
            )}

            {success && (
              <div style={{ marginBottom: 'var(--p-space-6)' }}>
                <Banner tone="success">
                  <p>🎉 Registration successful! Redirecting to login...</p>
                </Banner>
              </div>
            )}

            <FormLayout>
              <TextField
                label="Email address"
                type="email"
                value={form.email}
                onChange={handleChange}
                id="email"
                autoComplete="email"
                placeholder="Enter your email address"
                autoFocus
              />
              <TextField
                label="Password"
                type="password"
                value={form.password}
                onChange={handleChange}
                id="password"
                autoComplete="new-password"
                placeholder="Create a secure password"
                helpText="Must be at least 6 characters long"
              />
              <TextField
                label="Confirm Password"
                type="password"
                value={form.confirmPassword}
                onChange={handleChange}
                id="confirmPassword"
                autoComplete="new-password"
                placeholder="Confirm your password"
              />
              
              <div style={{ marginTop: 'var(--p-space-8)' }}>
                <Button
                  variant="primary"
                  fullWidth
                  onClick={handleSubmit}
                  disabled={!form.email || !form.password || !form.confirmPassword || success || isLoading}
                  loading={isLoading}
                  size="large"
                >
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </div>
            </FormLayout>

            <div style={{ 
              marginTop: 'var(--p-space-8)', 
              textAlign: 'center',
              paddingTop: 'var(--p-space-6)',
              borderTop: '1px solid var(--p-border-subdued)'
            }}>
              <div style={{ marginBottom: 'var(--p-space-4)' }}>
                <p style={{ 
                  color: 'var(--p-text-subdued)',
                  margin: 0,
                  fontSize: 'var(--p-font-size-3)'
                }}>
                  Already have an account?
                </p>
              </div>
              <Button
                variant="plain"
                onClick={() => navigate('/login')}
                size="large"
              >
                Sign in to your account
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Register;
