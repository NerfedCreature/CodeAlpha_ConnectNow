import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';
import { UserContext } from '../App';
import PostCard from '../components/PostCard';
import ProfileHeader from '../components/ProfileHeader';

function Profile() {
  const { username } = useParams();
  const { currentUser } = useContext(UserContext);
  const [profileUser, setProfileUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
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
      <ProfileHeader profileUser={profileUser} currentUser={currentUser} />
      
      <div className="profile-posts" style={{ marginTop: '24px' }}>
        <h3 style={{ marginBottom: '16px', color: 'var(--primary-dark)' }}>Posts</h3>
        {profileUser.posts && profileUser.posts.length > 0 ? (
          // Sort posts by date descending
          [...profileUser.posts]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .map(post => <PostCard key={post.id} post={{...post, author: profileUser}} />)
        ) : (
          <div className="glass" style={{ padding: '20px', textAlign: 'center' }}>
            No posts yet.
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;
