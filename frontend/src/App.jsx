import React, { createContext, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Discover from './pages/Discover';
import Login from './pages/Login';
import Register from './pages/Register';
import api from './api';

export const UserContext = createContext();

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initUser = async () => {
      const token = localStorage.getItem('connectnow_token');
      if (token) {
        try {
          const res = await api.get('/users/me');
          setCurrentUser(res.data);
        } catch (err) {
          console.error("Failed to authenticate token", err);
          localStorage.removeItem('connectnow_token');
        }
      }
      setLoading(false);
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
            <Route path="/login" element={currentUser ? <Navigate to="/" /> : <Login />} />
            <Route path="/register" element={currentUser ? <Navigate to="/" /> : <Register />} />
            <Route path="/" element={currentUser ? <Home /> : <Navigate to="/login" />} />
            <Route path="/discover" element={currentUser ? <Discover /> : <Navigate to="/login" />} />
            <Route path="/profile/:username" element={currentUser ? <Profile /> : <Navigate to="/login" />} />
          </Routes>
        </div>
      </Router>
    </UserContext.Provider>
  );
}

export default App;
