import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { UserContext } from '../App';
import api from '../api';
import CommentList from '../components/CommentList';
import { Heart, MessageCircle } from 'lucide-react';

function PostPage() {
  const { id } = useParams();
  const { currentUser } = useContext(UserContext);
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await api.get(`/posts/${id}`);
        setPost(res.data);
      } catch (err) {
        console.error('Failed to fetch post', err);
        setError('Post not found or unavailable.');
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  const handleLike = async () => {
    if (!currentUser) return;
    try {
      const res = await api.post(`/posts/${post.id}/like`);
      const action = res.data.action;
      
      setPost(prev => {
        let newLikedBy = prev.likedBy || [];
        if (action === 'liked') {
          newLikedBy = [...newLikedBy, { id: currentUser.id }];
        } else {
          newLikedBy = newLikedBy.filter(u => u.id !== currentUser.id);
        }
        return { 
          ...prev, 
          likesCount: res.data.post.likesCount,
          likedBy: newLikedBy
        };
      });
    } catch (err) {
      console.error('Failed to like post', err);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: '40px' }}>Loading post...</div>;
  if (error) return <div style={{ textAlign: 'center', marginTop: '40px', color: 'red' }}>{error}</div>;

  return (
    <div className="discover-container" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div className="post-card glass animate-fade-in">
        <div className="post-header">
          <Link to={`/profile/${post.author?.username}`}>
            <img src={post.author?.avatarUrl} alt="Avatar" className="avatar" />
          </Link>
          <div className="post-author-info">
            <Link to={`/profile/${post.author?.username}`} className="author-name">
              {post.author?.name}
            </Link>
            <span className="post-time">
              {new Date(post.createdAt).toLocaleDateString()} at {new Date(post.createdAt).toLocaleTimeString()}
            </span>
          </div>
        </div>
        <div className="post-content">
          <p>{post.content}</p>
        </div>
        <div className="post-actions">
          <button 
            className="action-btn" 
            onClick={handleLike} 
            style={{ color: post.likedBy?.some(u => u.id === currentUser?.id) ? 'var(--primary-color)' : 'inherit' }}
          >
            <Heart size={20} fill={post.likedBy?.some(u => u.id === currentUser?.id) ? 'var(--primary-color)' : 'none'} />
            <span>{post.likesCount}</span>
          </button>
          <button className="action-btn">
            <MessageCircle size={20} />
            <span>{post.comments?.length || 0}</span>
          </button>
        </div>
        
        {/* Render comments below the post */}
        <div style={{ marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '20px' }}>
          <CommentList postId={post.id} initialComments={post.comments} />
        </div>
      </div>
    </div>
  );
}

export default PostPage;
