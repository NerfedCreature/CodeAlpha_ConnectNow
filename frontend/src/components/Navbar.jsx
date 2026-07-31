import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../App';
import { Home, LogOut, Users } from 'lucide-react';
import './Navbar.css';

function Navbar() {
  const { currentUser, setCurrentUser } = useContext(UserContext);
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
