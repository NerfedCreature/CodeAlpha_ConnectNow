import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { UserContext } from '../App';

function Register() {
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { setCurrentUser } = useContext(UserContext);
  const navigate = useNavigate();

  const validatePassword = (pwd) => {
    const minLength = 8;
    const hasUpper = /[A-Z]/.test(pwd);
    const hasLower = /[a-z]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);
    if (pwd.length < minLength) return "Password must be at least 8 characters.";
    if (!hasUpper) return "Password must contain at least 1 uppercase letter.";
    if (!hasLower) return "Password must contain at least 1 lowercase letter.";
    if (!hasNumber) return "Password must contain at least 1 number.";
    return null;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    
    const pwdError = validatePassword(password);
    if (pwdError) {
      setError(pwdError);
      return;
    }

    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`;
      const res = await api.post('/users/register', { username, name: fullName, password });
      localStorage.setItem('connectnow_token', res.data.token);
      setCurrentUser(res.data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div className="auth-container">
      <div className="glass auth-card animate-fade-in">
        <h2 style={{ textAlign: 'center', marginBottom: '24px', color: 'var(--primary-dark)' }}>Join ConnectNow</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleRegister} className="auth-form">
          <div style={{ display: 'flex', gap: '12px' }}>
            <input 
              type="text" 
              className="input-field" 
              placeholder="First Name" 
              value={firstName} 
              onChange={e => setFirstName(e.target.value)}
              required
              style={{ flex: 1 }}
            />
            <input 
              type="text" 
              className="input-field" 
              placeholder="Last Name" 
              value={lastName} 
              onChange={e => setLastName(e.target.value)}
              required
              style={{ flex: 1 }}
            />
          </div>
          <input 
            type="text" 
            className="input-field" 
            placeholder="Username" 
            value={username} 
            onChange={e => setUsername(e.target.value)}
            required
          />
          <input 
            type="password" 
            className="input-field" 
            placeholder="Password" 
            value={password} 
            onChange={e => setPassword(e.target.value)}
            required
          />
          <p className="password-hint">
            Must be 8+ chars with 1 uppercase, 1 lowercase, and 1 number.
          </p>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '12px' }}>
            Register
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '20px' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--primary-color)', fontWeight: '600' }}>Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
