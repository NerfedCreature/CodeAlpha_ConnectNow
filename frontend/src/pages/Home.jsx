import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../App';
import api from '../api';
import PostCard from '../components/PostCard';

function Home() {
  const { currentUser } = useContext(UserContext);
  const [posts, setPosts] = useState([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [feedType, setFeedType] = useState('following'); // 'global' or 'following'

  useEffect(() => {
    fetchPosts();
  }, [feedType]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const endpoint = feedType === 'global' ? '/posts' : '/posts/feed';
      const res = await api.get(endpoint);
      setPosts(res.data);
    } catch (err) {
      console.error('Failed to fetch posts', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!newPostContent.trim() || !currentUser) return;
    try {
      const res = await api.post('/posts', {
        content: newPostContent
      });
      // Prepend the new post
      setPosts([res.data, ...posts]);
      setNewPostContent('');
    } catch (err) {
      console.error('Failed to create post', err);
    }
  };

  return (
    <div className="home-page">
      {currentUser && (
        <div className="create-post glass animate-fade-in" style={{ marginBottom: '24px', padding: '20px' }}>
          <form onSubmit={handlePostSubmit}>
            <textarea
              className="input-field"
              placeholder="What's on your mind?"
              rows="3"
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              style={{ resize: 'none', marginBottom: '12px' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn btn-primary" disabled={!newPostContent.trim()}>
                Post
              </button>
            </div>
          </form>
        </div>
      )}

      {currentUser && (
        <div className="feed-tabs" style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
          <button 
            className={`btn ${feedType === 'following' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setFeedType('following')}
          >
            Following
          </button>
          <button 
            className={`btn ${feedType === 'global' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setFeedType('global')}
          >
            Global
          </button>
        </div>
      )}

      <div className="feed">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>Loading feed...</div>
        ) : posts.length > 0 ? (
          posts.map(post => <PostCard key={post.id} post={post} />)
        ) : (
          <div className="glass" style={{ textAlign: 'center', padding: '40px' }}>
            {feedType === 'following' 
              ? "You aren't following anyone with posts yet. Go Discover some people!" 
              : "No posts yet. Be the first to say something!"}
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
