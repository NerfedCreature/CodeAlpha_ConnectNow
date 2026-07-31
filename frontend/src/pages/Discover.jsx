import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { UserContext } from '../App';

function Discover() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useContext(UserContext);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      console.log('Fetching users from /users API...');
      const res = await api.get('/users');
      console.log('Fetched users data:', res.data);
      // Filter out the current user
      if (currentUser) {
        const filtered = res.data.filter(u => u.id !== currentUser.id);
        console.log('Filtered users (excluding current user):', filtered);
        setUsers(filtered);
      } else {
        setUsers(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
      if (err.response) {
        console.error('Error response:', err.response.data);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFollowToggle = async (targetUser) => {
    if (!currentUser) return;
    const isFollowing = targetUser.followers?.some(f => f.id === currentUser.id);

    try {
      if (isFollowing) {
        await api.post('/follows/unfollow', { followingId: targetUser.id });
        // Update local state
        setUsers(users.map(u => {
          if (u.id === targetUser.id) {
            return { ...u, followers: u.followers.filter(f => f.id !== currentUser.id) };
          }
          return u;
        }));
      } else {
        await api.post('/follows', { followingId: targetUser.id });
        // Update local state
        setUsers(users.map(u => {
          if (u.id === targetUser.id) {
            return { ...u, followers: [...u.followers, { id: currentUser.id }] };
          }
          return u;
        }));
      }
    } catch (err) {
      console.error('Failed to toggle follow', err);
    }
  };

  if (loading) return <div style={{ textAlign: 'center' }}>Loading...</div>;

  return (
    <div className="discover-page">
      <h2 style={{ marginBottom: '24px', color: 'var(--primary-dark)' }}>Discover People</h2>
      
      <div className="users-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '20px'
      }}>
        {users.length > 0 ? (
          users.map(user => {
            const isFollowing = Array.isArray(user.followers) 
              ? user.followers.some(f => f.id === currentUser?.id)
              : false;
            return (
              <div key={user.id} className="glass animate-fade-in" style={{ padding: '20px', textAlign: 'center', display: 'flex', flexDirection: 'column' }}>
                <Link to={`/profile/${user.username}`} style={{ flex: 1 }}>
                  <img src={user.avatarUrl} alt={user.name} className="avatar avatar-lg" style={{ marginBottom: '12px' }} />
                  <h3 style={{ fontSize: '1.1rem', color: 'var(--text-color)', marginBottom: '4px' }}>{user.name}</h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '16px' }}>@{user.username}</p>
                </Link>
                {currentUser && (
                  <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                    <button 
                      className={`btn ${isFollowing ? 'btn-outline' : 'btn-primary'}`} 
                      style={{ flex: 1 }}
                      onClick={() => handleFollowToggle(user)}
                    >
                      {isFollowing ? 'Following' : 'Follow'}
                    </button>
                    {isFollowing && (
                      <Link to={`/messages/${user.username}`} className="btn btn-outline" style={{ flex: 1 }}>
                        Message
                      </Link>
                    )}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <p>No other users found.</p>
        )}
      </div>
    </div>
  );
}

export default Discover;
