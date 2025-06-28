import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Banner, Spinner, EmptyState } from '@shopify/polaris';

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
        <Spinner size="large" />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 'var(--p-space-6)' }}>
      <Card>
        <div style={{ padding: 'var(--p-space-6)' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: 'var(--p-space-6)' 
          }}>
            <h1 style={{ 
              fontSize: 'var(--p-font-size-7)', 
              fontWeight: 'var(--p-font-weight-bold)',
              margin: 0,
              color: 'var(--p-text)'
            }}>
              Your Workflows
            </h1>
            <Button
              variant="primary"
              onClick={() => navigate('/workflow')}
            >
              New Workflow
            </Button>
          </div>

          {error && (
            <Banner tone="critical" onDismiss={() => setError(null)}>
              {error}
            </Banner>
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
              >
                Create Workflow
              </Button>
            </EmptyState>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--p-space-2)' }}>
              {workflows.map((workflow) => (
                <div key={workflow.id} style={{ 
                  border: '1px solid var(--p-border-subdued)',
                  borderRadius: 'var(--p-border-radius-2)',
                  padding: 'var(--p-space-3)',
                  cursor: 'pointer'
                }}>
                  <Button
                    variant="plain"
                    onClick={() => onSelect(workflow)}
                    fullWidth
                  >
                    {workflow.name || `Workflow #${workflow.id}`}
                  </Button>
                  <div style={{ 
                    marginTop: 'var(--p-space-2)',
                    color: 'var(--p-text-subdued)',
                    fontSize: 'var(--p-font-size-2)'
                  }}>
                    {new Date(workflow.created_at || Date.now()).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default WorkflowList;
