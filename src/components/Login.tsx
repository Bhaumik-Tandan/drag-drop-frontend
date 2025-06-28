import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Card, 
  FormLayout, 
  TextField, 
  Button, 
  Banner, 
  Page,
  Icon,
  Text,
  ButtonGroup
} from '@shopify/polaris';
import { login as loginApi } from '../utils/apiHelper';

const Login = ({ onLogin }: { onLogin: () => void }) => {
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLoginInputChange = (value: string, id: string) => {
    setLoginForm({ ...loginForm, [id]: value });
    if (loginError) setLoginError(null);
  };

  const handleLoginSubmit = async () => {
    if (!loginForm.email || !loginForm.password) return;
    
    setLoginError(null);
    setIsLoading(true);
    
    try {
      const data = await loginApi(loginForm.email, loginForm.password);
      localStorage.setItem('token', data.access_token || data.token || '');
      localStorage.setItem('userEmail', loginForm.email);
      onLogin();
      navigate('/workflows', { replace: true });
    } catch (err: any) {
      setLoginError('Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleLoginSubmit();
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
                Welcome Back
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
                Sign in to your account and continue building amazing workflows
              </p>
            </div>

            {loginError && (
              <div style={{ marginBottom: 'var(--p-space-6)' }}>
                <Banner 
                  tone="critical" 
                  onDismiss={() => setLoginError(null)}
                >
                  <p>{loginError}</p>
                </Banner>
              </div>
            )}

            <FormLayout>
              <TextField
                label="Email address"
                type="email"
                value={loginForm.email}
                onChange={handleLoginInputChange}
                id="email"
                autoComplete="email"
                placeholder="Enter your email address"
                autoFocus
              />
              <TextField
                label="Password"
                type="password"
                value={loginForm.password}
                onChange={handleLoginInputChange}
                id="password"
                autoComplete="current-password"
                placeholder="Enter your password"
              />
              
              <div style={{ marginTop: 'var(--p-space-8)' }}>
                <Button
                  variant="primary"
                  fullWidth
                  onClick={handleLoginSubmit}
                  disabled={!loginForm.email || !loginForm.password || isLoading}
                  loading={isLoading}
                  size="large"
                >
                  {isLoading ? 'Signing In...' : 'Sign In'}
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
                  Don't have an account?
                </p>
              </div>
              <Button
                variant="plain"
                onClick={() => navigate('/register')}
                size="large"
              >
                Create a new account
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;
