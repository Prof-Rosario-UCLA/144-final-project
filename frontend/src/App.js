import Login from './pages/login';
import Messages from './pages/messages'
import { API_URL } from './constants'
import { React, useEffect, useState } from 'react';
import FindNewChats from './pages/newChats';
import Profile from './pages/profile';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("messages"); // default tab?
  const [selChat, setSelChat] = useState(null);
  // console.log(tab)

  const checkAuth = async () => {
    const token = localStorage.getItem('auth_token');
    
    if (!token) {
      setLoading(false);
      return;
    }
    
    try {
      const resp = await fetch(`${API_URL}/api/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (resp.ok) {
        // console.log("retreieving user data")
        const userData = await resp.json();
        // console.log(userData)
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
      className="min-h-screen w-screen flex flex-col items-center justify-center bg-sky-50 p-4"
      >
          <div 
          className="w-full max-w-sm bg-white rounded-2xl shadow-md p-6 text-center"
          >
              <h2 
              className="sm:text-xl text-xs font-bold mb-4 text-gray-800"
              >
                Loading...
              </h2>
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
      </div>
    );
  }

  return (
    <div 
    className="bg-transparent w-screen h-screen max-h-screen" 
    >
      {user ? (
        <div 
        // className="min-h-screen min-w-screen bg-sky-500"
        className='min-h-full min-w-full max-h-screen bg-transparent flex flex-col overflow-x-auto'
        >
          <header 
          className="bg-slate-50 shadow-sm p-4 flex sm:flex-row flex-col flex-wrap justify-between items-center flex-shrink-0 w-full min-w-screen border-black border-b-2"
          >
            <h1 
            className="text-xl font-bold text-violet-900 ml-[1em]"
            >
              Company Name
            </h1>

            <h2 
            className="text-lg font-bold text-sky-900 ml-[1em] hover:underline cursor-pointer ease-linear duration-200 transition-all"
            onClick={() => setTab("messages")}
            >
              My Chats
            </h2>

            <h2 
            className="text-lg font-bold text-sky-900 ml-[1em] hover:underline cursor-pointer ease-linear duration-200 transition-all"
            onClick={() => setTab("find")}
            >
              Find New Chats
            </h2>

            <h2 
            className="text-lg font-bold text-sky-900 ml-[1em] hover:underline cursor-pointer ease-linear duration-200 transition-all"
            onClick={() => setTab("profile")}
            >
              Profile
            </h2>
            <button 
              onClick={handleLogout}
              className="px-2 py-2 ml-[1em] bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
            >
              Logout
            </button>
          </header>
          
          <main
          className="container mx-auto w-full h-full max-h-max flex-1 flex min-w-full bg-transparent overflow-hidden"
          >
            {(tab === "messages") ? (
              <Messages user={user} selChat={selChat} setSelChat={setSelChat} />
            ) : ((tab === "find") ? (
              <FindNewChats user={user} setTab={setTab} setSelChat={setSelChat}/>
            ) : (
              <Profile user={user} />
            ))}
          </main>
        </div>
      ) : (
        <Login onLoginSuccess={handleLoginSuccess} />
      )}
    </div>
  );
}

export default App;
