import { useState, useEffect } from 'react';
import { auth } from './lib/auth';
import { apiClient } from './lib/apiClient';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
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
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  if (!bootstrapData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Loading user data...</p>
      </div>
    );
  }

  return <Dashboard bootstrapData={bootstrapData} onLogout={handleLogout} />;
};

