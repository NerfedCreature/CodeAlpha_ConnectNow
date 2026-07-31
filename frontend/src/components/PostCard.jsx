import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Share2 } from 'lucide-react';
import { UserContext } from '../App';
import api from '../api';
import CommentList from './CommentList';
import './PostCard.css';

function PostCard({ post }) {
  const { currentUser } = useContext(UserContext);
  const [likes, setLikes] = useState(post.likesCount);
  const [liked, setLiked] = useState(post.likedBy?.some(u => u.id === currentUser?.id) || false);
  const [showComments, setShowComments] = useState(false);

  const handleLike = async () => {
    if (!currentUser) return;
    try {
      const res = await api.post(`/posts/${post.id}/like`);
      if (res.data.action === 'liked') {
        setLikes(likes + 1);
        setLiked(true);
      } else {
        setLikes(Math.max(0, likes - 1));
        setLiked(false);
      }
    } catch (err) {
      console.error('Failed to like post', err);
    }
  };

  return (
    <div className="postcard glass animate-fade-in">
      <div className="postcard-header">
        <Link to={`/profile/${post.author?.username}`} className="postcard-author">
          <img src={post.author?.avatarUrl} alt={post.author?.name} className="avatar" />
          <div className="author-info">
            <span className="author-name">{post.author?.name}</span>
            <span className="author-username">@{post.author?.username}</span>
          </div>
        </Link>
        <span className="post-date">{new Date(post.createdAt).toLocaleDateString()}</span>
      </div>
      
      <div className="postcard-body">
        <p>{post.content}</p>
      </div>

      <div className="postcard-actions">
        <button className={`btn-icon action-btn ${liked ? 'liked' : ''}`} onClick={handleLike}>
          <Heart size={20} fill={liked ? 'currentColor' : 'none'} />
          <span>{likes}</span>
        </button>
        <button className="btn-icon action-btn" onClick={() => setShowComments(!showComments)}>
          <MessageCircle size={20} />
          <span>{post.comments?.length || 0}</span>
        </button>
        <button className="btn-icon action-btn">
          <Share2 size={20} />
        </button>
      </div>

      {showComments && (
        <CommentList postId={post.id} initialComments={post.comments} />
      )}
    </div>
  );
}

export default PostCard;
