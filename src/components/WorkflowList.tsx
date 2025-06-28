import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

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

  return (
    <div style={{ maxWidth: 600, margin: '40px auto', background: 'white', padding: 32, borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>Your Workflows</h2>
      {loading && <div>Loading...</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {workflows.map((wf) => (
          <li key={wf.id} style={{ marginBottom: 12 }}>
            <button
              style={{ width: '100%', textAlign: 'left', padding: 12, borderRadius: 6, border: '1px solid #e5e7eb', background: '#f3f4f6', cursor: 'pointer', fontWeight: 600 }}
              onClick={() => onSelect(wf)}
            >
              {wf.name || `Workflow #${wf.id}`}
            </button>
          </li>
        ))}
      </ul>
      <button
        style={{ marginTop: 16, width: '100%', padding: 10, background: '#2563eb', color: 'white', border: 'none', borderRadius: 6, fontWeight: 600 }}
        onClick={() => navigate('/workflow')}
      >
        New Workflow
      </button>
    </div>
  );
};

export default WorkflowList;
