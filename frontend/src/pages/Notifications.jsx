import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { UserContext } from '../App';

function Notifications() {
  const { setUnreadCounts } = useContext(UserContext);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
    markAsRead();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async () => {
    try {
      await api.put('/notifications/read');
      setUnreadCounts(prev => ({ ...prev, notifications: 0 }));
    } catch (err) {
      console.error('Failed to mark notifications as read', err);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: '40px' }}>Loading notifications...</div>;

  return (
    <div className="notifications-container" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '24px', color: 'var(--primary-dark)' }}>Notifications</h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {notifications.length > 0 ? (
          notifications.map(notif => (
            <div 
              key={notif.id} 
              className="glass animate-fade-in" 
              style={{ 
                padding: '16px', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '16px',
                background: notif.isRead ? 'rgba(255, 255, 255, 0.5)' : 'var(--glass-bg)',
                borderLeft: notif.isRead ? 'none' : '4px solid var(--primary-color)'
              }}
            >
              <img src={notif.sourceUser.avatarUrl} alt={notif.sourceUser.name} className="avatar" />
              <div>
                <p style={{ margin: 0 }}>
                  <Link to={`/profile/${notif.sourceUser.username}`} style={{ fontWeight: 'bold', color: 'inherit', textDecoration: 'none' }}>
                    {notif.sourceUser.name}
                  </Link>
                  {' '}
                  {notif.type === 'FOLLOW' && 'started following you.'}
                  {notif.type === 'COMMENT' && (
                    <Link to={`/post/${notif.postId}`} style={{ color: 'inherit', textDecoration: 'underline' }}>
                      commented on your post.
                    </Link>
                  )}
                  {notif.type === 'LIKE' && (
                    <Link to={`/post/${notif.postId}`} style={{ color: 'inherit', textDecoration: 'underline' }}>
                      liked your post.
                    </Link>
                  )}
                </p>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {new Date(notif.createdAt).toLocaleDateString()} at {new Date(notif.createdAt).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="glass" style={{ padding: '40px', textAlign: 'center' }}>
            <p>You have no notifications yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Notifications;
