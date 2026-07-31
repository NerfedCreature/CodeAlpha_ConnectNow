import React, { createContext, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Discover from './pages/Discover';
import Messages from './pages/Messages';
import Notifications from './pages/Notifications';
import PostPage from './pages/PostPage';
import Login from './pages/Login';
import Register from './pages/Register';
import api from './api';
import { io } from 'socket.io-client';

export const UserContext = createContext();
export const SocketContext = createContext();

const socket = io('http://localhost:5000');

function TitleUpdater() {
  const location = useLocation();
  useEffect(() => {
    const path = location.pathname;
    let title = 'ConnectNow';
    
    if (path === '/') title = 'Home | ConnectNow';
    else if (path.startsWith('/discover')) title = 'Discover | ConnectNow';
    else if (path.startsWith('/messages')) title = 'Messages | ConnectNow';
    else if (path.startsWith('/notifications')) title = 'Notifications | ConnectNow';
    else if (path.startsWith('/profile')) title = 'Profile | ConnectNow';
    else if (path.startsWith('/post')) title = 'Post | ConnectNow';
    else if (path.startsWith('/login')) title = 'Login | ConnectNow';
    else if (path.startsWith('/register')) title = 'Register | ConnectNow';

    document.title = title;
  }, [location]);
  
  return null;
}

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unreadCounts, setUnreadCounts] = useState({ notifications: 0, messages: 0 });

  const fetchUnreadCounts = async () => {
    try {
      const res = await api.get('/notifications/unread');
      setUnreadCounts(res.data);
    } catch (err) {
      console.error('Failed to fetch unread counts', err);
    }
  };

  useEffect(() => {
    const initUser = async () => {
      const token = localStorage.getItem('connectnow_token');
      if (token) {
        try {
          const res = await api.get('/users/me');
          setCurrentUser(res.data);
          fetchUnreadCounts();
        } catch (err) {
          console.error("Failed to authenticate token", err);
          localStorage.removeItem('connectnow_token');
        }
      }
      setLoading(false);
    };
    initUser();
  }, []);

  useEffect(() => {
    if (currentUser) {
      socket.emit('join_user_room', currentUser.id);
      fetchUnreadCounts(); // Fetch counts whenever user logs in
      
      const handleConnect = () => {
        socket.emit('join_user_room', currentUser.id);
      };
      
      socket.on('connect', handleConnect);
      return () => {
        socket.off('connect', handleConnect);
      };
    }
  }, [currentUser]);

  useEffect(() => {
    const handleReceiveMessage = () => {
      setUnreadCounts(prev => ({ ...prev, messages: prev.messages + 1 }));
    };
    
    const handleReceiveNotification = () => {
      setUnreadCounts(prev => ({ ...prev, notifications: prev.notifications + 1 }));
    };

    socket.on('receive_message', handleReceiveMessage);
    socket.on('receive_notification', handleReceiveNotification);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
      socket.off('receive_notification', handleReceiveNotification);
    };
  }, []);

  if (loading) return <div className="app-container container" style={{textAlign: 'center'}}>Loading...</div>;

  return (
    <UserContext.Provider value={{ currentUser, setCurrentUser, unreadCounts, setUnreadCounts }}>
      <SocketContext.Provider value={socket}>
        <Router>
          <TitleUpdater />
          <Navbar />
          <div className="app-container container">
            <Routes>
              <Route path="/login" element={currentUser ? <Navigate to="/" /> : <Login />} />
              <Route path="/register" element={currentUser ? <Navigate to="/" /> : <Register />} />
              <Route path="/" element={currentUser ? <Home /> : <Navigate to="/login" />} />
              <Route path="/discover" element={currentUser ? <Discover /> : <Navigate to="/login" />} />
              <Route path="/post/:id" element={currentUser ? <PostPage /> : <Navigate to="/login" />} />
              <Route path="/messages" element={currentUser ? <Messages /> : <Navigate to="/login" />} />
              <Route path="/messages/:username" element={currentUser ? <Messages /> : <Navigate to="/login" />} />
              <Route path="/notifications" element={currentUser ? <Notifications /> : <Navigate to="/login" />} />
              <Route path="/profile/:username" element={currentUser ? <Profile /> : <Navigate to="/login" />} />
            </Routes>
          </div>
        </Router>
      </SocketContext.Provider>
    </UserContext.Provider>
  );
}

export default App;
