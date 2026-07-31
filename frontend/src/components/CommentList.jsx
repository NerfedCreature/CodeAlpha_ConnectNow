import React, { useState, useContext } from 'react';
import { UserContext } from '../App';
import api from '../api';
import { Send } from 'lucide-react';
import './CommentList.css';

function CommentList({ postId, initialComments }) {
  const [comments, setComments] = useState(initialComments || []);
  const [newComment, setNewComment] = useState('');
  const { currentUser } = useContext(UserContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !currentUser) return;

    try {
      const res = await api.post('/comments', {
        content: newComment,
        postId,
        authorId: currentUser.id
      });
      setComments([...comments, res.data]);
      setNewComment('');
    } catch (err) {
      console.error('Failed to post comment', err);
    }
  };

  return (
    <div className="comments-section">
      <div className="comments-list">
        {comments.map((comment) => (
          <div key={comment.id} className="comment">
            <img src={comment.author?.avatarUrl} alt="Avatar" className="avatar comment-avatar" />
            <div className="comment-content-box">
              <span className="comment-author">{comment.author?.name}</span>
              <p className="comment-text">{comment.content}</p>
            </div>
          </div>
        ))}
        {comments.length === 0 && <p className="no-comments">No comments yet. Be the first!</p>}
      </div>
      
      {currentUser && (
        <form className="comment-form" onSubmit={handleSubmit}>
          <img src={currentUser.avatarUrl} alt="Avatar" className="avatar comment-avatar" />
          <div className="comment-input-wrapper">
            <input 
              type="text" 
              className="input-field comment-input" 
              placeholder="Write a comment..." 
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <button type="submit" className="btn-icon send-btn" disabled={!newComment.trim()}>
              <Send size={18} />
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default CommentList;
