import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  Button, 
  Banner, 
  Spinner, 
  EmptyState,
  Text,
  Badge,
  Icon,
  ButtonGroup
} from '@shopify/polaris';

const API_URL = import.meta.env.VITE_API_URL;

const WorkflowList = ({ onSelect }: { onSelect: (workflow: any) => void }) => {
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchWorkflows = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/workflows`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch workflows');
        const data = await res.json();
        setWorkflows(data);
      } catch (err: any) {
        setError(err.message || 'Error fetching workflows');
      } finally {
        setLoading(false);
      }
    };
    fetchWorkflows();
  }, []);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '400px' 
      }}>
        <div style={{ textAlign: 'center' }}>
          <Spinner size="large" />
          <p style={{ 
            marginTop: 'var(--p-space-4)', 
            color: 'var(--p-text-subdued)' 
          }}>
            Loading your workflows...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: 'var(--p-space-6)' }}>
      <Card>
        <div style={{ padding: 'var(--p-space-6)' }}>
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

          {workflows.length === 0 && !loading ? (
            <EmptyState
              heading="No workflows yet"
              image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
            >
              <p>Create your first workflow to get started with building automated processes.</p>
              <Button
                variant="primary"
                onClick={() => navigate('/workflow')}
                size="large"
              >
                Create Your First Workflow
              </Button>
            </EmptyState>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--p-space-3)' }}>
              {workflows.map((workflow) => (
                <Card key={workflow.id}>
                  <div style={{ padding: 'var(--p-space-4)' }}>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      cursor: 'pointer'
                    }}
                    onClick={() => onSelect(workflow)}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ marginBottom: 'var(--p-space-2)' }}>
                          <Text variant="headingMd" as="h3" fontWeight="semibold">
                            {workflow.name || `Workflow #${workflow.id}`}
                          </Text>
                        </div>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 'var(--p-space-3)'
                        }}>
                          <p style={{ 
                            color: 'var(--p-text-subdued)',
                            margin: 0,
                            fontSize: 'var(--p-font-size-2)'
                          }}>
                            Created {new Date(workflow.created_at || Date.now()).toLocaleDateString()}
                          </p>
                          {workflow.status && (
                            <Badge tone={workflow.status === 'active' ? 'success' : 'info'}>
                              {workflow.status}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div style={{ marginLeft: 'var(--p-space-4)' }}>
                        <ButtonGroup>
                          <Button
                            variant="primary"
                            onClick={() => onSelect(workflow)}
                          >
                            Open
                          </Button>
                          <Button
                            variant="plain"
                            onClick={() => {
                              // Add edit functionality here
                            }}
                          >
                            Edit
                          </Button>
                        </ButtonGroup>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default WorkflowList;
