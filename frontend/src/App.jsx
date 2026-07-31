import React, { createContext, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Profile from './pages/Profile';
import api from './api';

export const UserContext = createContext();

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // For demo, we just auto-login a default user if none exists
    const initUser = async () => {
      try {
        const storedUser = localStorage.getItem('connectnow_user');
        if (storedUser) {
          setCurrentUser(JSON.parse(storedUser));
        } else {
          // Register a default user for demonstration
          const res = await api.post('/users/login', { username: 'johndoe', name: 'John Doe' });
          setCurrentUser(res.data);
          localStorage.setItem('connectnow_user', JSON.stringify(res.data));
        }
      } catch (err) {
        console.error("Failed to init user", err);
      } finally {
        setLoading(false);
      }
    };
    initUser();
  }, []);

  if (loading) return <div className="app-container container" style={{textAlign: 'center'}}>Loading...</div>;

  return (
    <UserContext.Provider value={{ currentUser, setCurrentUser }}>
      <Router>
        <Navbar />
        <div className="app-container container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/profile/:username" element={<Profile />} />
          </Routes>
        </div>
      </Router>
    </UserContext.Provider>
  );
}

export default App;
