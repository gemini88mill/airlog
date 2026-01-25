import { useState, useEffect } from 'react';
import { auth } from './lib/auth';
import { Login } from './components/Login';
import './App.css';

type User = {
  id: string;
  email?: string;
  [key: string]: unknown;
};

const App = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { user: currentUser } = await auth.getSession();
      setUser(currentUser as User | null);
      setLoading(false);
    };

    checkUser();
  }, []);

  const handleLogout = async () => {
    await auth.logout();
    setUser(null);
  };

  if (loading) {
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
          <span>Welcome, {user.email}</span>
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
        <p>You are now logged in and have access to the airlog-api.</p>
      </div>
    </div>
  );
};

export default App;
