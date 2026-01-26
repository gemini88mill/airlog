import { useState, useEffect } from 'react';
import { auth } from './lib/auth';
import { apiClient } from './lib/apiClient';
import { Login } from './components/Login';
import './App.css';

type User = {
  id: string;
  email?: string;
  [key: string]: unknown;
};

type BootstrapData = {
  user: {
    id: string;
    displayName: string;
  };
  circles: Array<{
    id: string;
    name: string;
    role: string;
    members: Array<{
      id: string;
      displayName: string;
    }>;
  }>;
  defaults: {
    activeCircleId: string | null;
    canCreateFlights: boolean;
  };
};

export const App = () => {
  const [user, setUser] = useState<User | null>(null);
  const [bootstrapData, setBootstrapData] = useState<BootstrapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [bootstrapLoading, setBootstrapLoading] = useState(false);

  const fetchBootstrap = async () => {
    setBootstrapLoading(true);
    try {
      const response = await apiClient.get('/v1/bootstrap');
      
      if (!response.ok) {
        if (response.status === 401) {
          // Token invalid, clear user
          setUser(null);
          return;
        }
        throw new Error('Failed to fetch bootstrap data');
      }

      const data = await response.json();
      setBootstrapData(data);
    } catch (error) {
      console.error('Bootstrap error:', error);
      // Don't clear user on bootstrap error, just log it
    } finally {
      setBootstrapLoading(false);
    }
  };

  useEffect(() => {
    const checkUser = async () => {
      const { user: currentUser } = await auth.getSession();
      setUser(currentUser as User | null);
      setLoading(false);

      // If user is authenticated, fetch bootstrap data
      if (currentUser) {
        await fetchBootstrap();
      }
    };

    checkUser();
  }, []);

  const handleLogout = async () => {
    await auth.logout();
    setUser(null);
    setBootstrapData(null);
  };

  if (loading || (user && bootstrapLoading)) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
      }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const displayName = bootstrapData?.user.displayName || user.email || 'User';

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
      }}>
        <h1>Airlog</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span>Welcome, {displayName}</span>
          <button
            onClick={handleLogout}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Logout
          </button>
        </div>
      </div>
      <div>
        {bootstrapData ? (
          <div>
            <p>You are now logged in and have access to the airlog-api.</p>
            {bootstrapData.circles.length > 0 && (
              <div style={{ marginTop: '1rem' }}>
                <h2>Your Circles</h2>
                <ul>
                  {bootstrapData.circles.map((circle) => (
                    <li key={circle.id}>
                      {circle.name} ({circle.role}) - {circle.members.length} member(s)
                    </li>
                  ))}
                </ul>
                {bootstrapData.defaults.activeCircleId && (
                  <p>Active Circle: {bootstrapData.circles.find(c => c.id === bootstrapData.defaults.activeCircleId)?.name}</p>
                )}
              </div>
            )}
          </div>
        ) : (
          <p>Loading user data...</p>
        )}
      </div>
    </div>
  );
};

