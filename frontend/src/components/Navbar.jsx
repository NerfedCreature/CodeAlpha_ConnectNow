import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { UserContext } from '../App';
import { Home, User as UserIcon } from 'lucide-react';
import './Navbar.css';

function Navbar() {
  const { currentUser } = useContext(UserContext);

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
          {currentUser && (
            <Link to={`/profile/${currentUser.username}`} className="nav-link profile-link">
              <img src={currentUser.avatarUrl} alt="Avatar" className="avatar nav-avatar" />
              <span className="nav-text">{currentUser.name}</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
