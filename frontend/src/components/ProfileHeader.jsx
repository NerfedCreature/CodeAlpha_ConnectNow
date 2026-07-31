import React, { useState } from 'react';
import api from '../api';
import './ProfileHeader.css';

function ProfileHeader({ profileUser, currentUser, onTabChange }) {
  const isOwnProfile = currentUser?.id === profileUser.id;
  
  // Basic check if current user is in profileUser's followers
  const initialIsFollowing = profileUser.followers?.some(f => f.id === currentUser?.id);
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  
  const [followersCount, setFollowersCount] = useState(profileUser.followers?.length || 0);

  const handleFollowToggle = async () => {
    if (!currentUser) return;
    try {
      if (isFollowing) {
        await api.post('/follows/unfollow', {
          followerId: currentUser.id,
          followingId: profileUser.id
        });
        setFollowersCount(followersCount - 1);
        setIsFollowing(false);
      } else {
        await api.post('/follows', {
          followerId: currentUser.id,
          followingId: profileUser.id
        });
        setFollowersCount(followersCount + 1);
        setIsFollowing(true);
      }
    } catch (err) {
      console.error('Failed to toggle follow', err);
    }
  };

  return (
    <div className="profile-header glass animate-fade-in">
      <div className="profile-header-top">
        <div className="profile-info-main">
          <img src={profileUser.avatarUrl} alt="Avatar" className="avatar avatar-lg" />
          <div className="profile-names">
            <h2 className="profile-name">{profileUser.name}</h2>
            <span className="profile-username">@{profileUser.username}</span>
          </div>
        </div>
        
        {!isOwnProfile && currentUser && (
          <button 
            className={`btn ${isFollowing ? 'btn-outline' : 'btn-primary'}`}
            onClick={handleFollowToggle}
          >
            {isFollowing ? 'Following' : 'Follow'}
          </button>
        )}
      </div>
      
      {profileUser.bio && (
        <div className="profile-bio">
          <p>{profileUser.bio}</p>
        </div>
      )}
      
      <div className="profile-stats">
        <div className="stat" onClick={() => onTabChange && onTabChange('posts')} style={{cursor: 'pointer'}}>
          <span className="stat-value">{profileUser.posts?.length || 0}</span>
          <span className="stat-label">Posts</span>
        </div>
        <div className="stat" onClick={() => onTabChange && onTabChange('followers')} style={{cursor: 'pointer'}}>
          <span className="stat-value">{followersCount}</span>
          <span className="stat-label">Followers</span>
        </div>
        <div className="stat" onClick={() => onTabChange && onTabChange('following')} style={{cursor: 'pointer'}}>
          <span className="stat-value">{profileUser.following?.length || 0}</span>
          <span className="stat-label">Following</span>
        </div>
      </div>
    </div>
  );
}

export default ProfileHeader;
