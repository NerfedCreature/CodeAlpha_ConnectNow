import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import { UserContext } from '../App';
import PostCard from '../components/PostCard';
import ProfileHeader from '../components/ProfileHeader';

function Profile() {
  const { username } = useParams();
  const { currentUser } = useContext(UserContext);
  const [profileUser, setProfileUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts'); // posts, followers, following

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/users/${username}`);
        setProfileUser(res.data);
      } catch (err) {
        console.error('Failed to fetch profile', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [username]);

  if (loading) return <div style={{ textAlign: 'center' }}>Loading profile...</div>;
  if (!profileUser) return <div style={{ textAlign: 'center' }}>User not found.</div>;

  return (
    <div className="profile-page">
      <ProfileHeader 
        profileUser={profileUser} 
        currentUser={currentUser} 
        onTabChange={setActiveTab} 
      />
      
      <div className="profile-content" style={{ marginTop: '24px' }}>
        {activeTab === 'posts' && (
          <div className="profile-posts">
            <h3 style={{ marginBottom: '16px', color: 'var(--primary-dark)' }}>Posts</h3>
            {profileUser.posts && profileUser.posts.length > 0 ? (
              [...profileUser.posts]
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .map(post => <PostCard key={post.id} post={{...post, author: profileUser}} />)
            ) : (
              <div className="glass" style={{ padding: '20px', textAlign: 'center' }}>
                No posts yet.
              </div>
            )}
          </div>
        )}

        {activeTab === 'followers' && (
          <div className="profile-users">
            <h3 style={{ marginBottom: '16px', color: 'var(--primary-dark)' }}>Followers</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {profileUser.followers && profileUser.followers.length > 0 ? (
                profileUser.followers.map(f => (
                  <div key={f.id} className="glass" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontWeight: '600' }}>{f.name}</span>
                    <Link to={`/profile/${f.username}`} style={{ color: 'var(--primary-color)' }}>@{f.username}</Link>
                  </div>
                ))
              ) : <p>No followers yet.</p>}
            </div>
          </div>
        )}

        {activeTab === 'following' && (
          <div className="profile-users">
            <h3 style={{ marginBottom: '16px', color: 'var(--primary-dark)' }}>Following</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {profileUser.following && profileUser.following.length > 0 ? (
                profileUser.following.map(f => (
                  <div key={f.id} className="glass" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontWeight: '600' }}>{f.name}</span>
                    <Link to={`/profile/${f.username}`} style={{ color: 'var(--primary-color)' }}>@{f.username}</Link>
                  </div>
                ))
              ) : <p>Not following anyone.</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;
