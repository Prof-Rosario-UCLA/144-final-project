import Login from './pages/login';
import Messages from './pages/messages'
import { React, useEffect, useState } from 'react';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    const token = localStorage.getItem('auth_token');
    
    if (!token) {
      setLoading(false);
      return;
    }
    
    try {
      const resp = await fetch('/api/users/me', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (resp.ok) {
        const userData = await resp.json();
        setUser(userData);
      } else {
        handleLogout();
      }

    } catch (error) {
      console.error('Auth error:', error);
      handleLogout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('username');
    setUser(null);
  };

  const initializeSocket = () => {
    // use localStorage vals
    console.log('init socket later..');
  };

  useEffect(() => {
    if (user) initializeSocket();
  }, [user]);

  if (loading) {
    return (
      <div 
      className="min-h-screen w-screen flex items-center justify-center bg-sky-50"
      >
        <h2
        className="text-xl font-bold mb-4 text-gray-800"
        >
        Loading...
        </h2>
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div 
    className="bg-sky-100" 
    >
      {user ? (
        <div 
        className="min-h-screen bg-sky-50"
        >
          <header 
          className="bg-white shadow-sm p-4 flex justify-between items-center"
          >
            <h1 
            className="text-xl font-bold text-violet-900 ml-[1em]"
            >
              Company Name
            </h1>
            <div
            className="flex items-center gap-4"
            >
              <span className="text-gray-700"> Welcome, {user.username} </span> 
              <button 
                onClick={handleLogout}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
              >
                Logout
              </button>
            </div>
          </header>
          
          <main 
          className="container mx-auto p-4"
          >
            {/* make messages component later */}
            <Messages />
          </main>
        </div>
      ) : (
        <Login onLoginSuccess={handleLoginSuccess} />
      )}
    </div>
  );
}

export default App;
