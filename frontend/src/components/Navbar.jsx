import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../App';
import { Home, LogOut, Users, MessageSquare, Bell } from 'lucide-react';
import './Navbar.css';

function Navbar() {
  const { currentUser, setCurrentUser, unreadCounts } = useContext(UserContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('connectnow_token');
    setCurrentUser(null);
    navigate('/login');
  };

  return (
    <nav className="navbar glass">
      <div className="container navbar-content">
        <Link to="/" className="navbar-brand">
          <span className="logo-text">ConnectNow</span>
        </Link>
        <div className="navbar-links">
          <Link to="/" className="nav-link">
            <Home size={20} />
            <span className="nav-text">Feed</span>
          </Link>
          <Link to="/discover" className="nav-link">
            <Users size={20} />
            <span className="nav-text">Discover</span>
          </Link>
          {currentUser && (
            <>
              <Link to="/messages" className="nav-link icon-only" style={{ position: 'relative' }}>
                <MessageSquare size={24} />
                {unreadCounts?.messages > 0 && (
                  <span className="badge">{unreadCounts.messages}</span>
                )}
              </Link>
              <Link to="/notifications" className="nav-link icon-only" style={{ position: 'relative' }}>
                <Bell size={24} />
                {unreadCounts?.notifications > 0 && (
                  <span className="badge">{unreadCounts.notifications}</span>
                )}
              </Link>
            </>
          )}
          {currentUser && (
            <>
              <Link to={`/profile/${currentUser.username}`} className="nav-link profile-link">
                <img src={currentUser.avatarUrl} alt="Avatar" className="avatar nav-avatar" />
                <span className="nav-text">{currentUser.name}</span>
              </Link>
              <button className="btn-icon" onClick={handleLogout} title="Logout">
                <LogOut size={20} />
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
