import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { UserContext, SocketContext } from '../App';
import { Send, ArrowLeft } from 'lucide-react';
import './Messages.css';

function Messages() {
  const { username } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useContext(UserContext);
  const socket = useContext(SocketContext);
  
  const [inbox, setInbox] = useState([]);
  const [chatUser, setChatUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  // Scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (username) {
      fetchChatHistory();
    } else {
      fetchInbox();
    }
  }, [username]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!socket) return;
    
    const handleReceiveMessage = (newMessage) => {
      // If we are currently chatting with the sender, append the message
      if (chatUser && newMessage.senderId === chatUser.id) {
        setMessages(prev => [...prev, newMessage]);
      }
      
      // Update inbox preview if we are on the inbox view
      if (!username) {
        fetchInbox();
      }
    };

    socket.on('receive_message', handleReceiveMessage);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
    };
  }, [socket, chatUser, username]);

  const fetchInbox = async () => {
    setLoading(true);
    try {
      const res = await api.get('/messages');
      setInbox(res.data);
    } catch (err) {
      console.error('Failed to fetch inbox:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchChatHistory = async () => {
    setLoading(true);
    try {
      // First verify the target user exists
      const userRes = await api.get(`/users/${username}`);
      setChatUser(userRes.data);

      const msgRes = await api.get(`/messages/${username}`);
      setMessages(msgRes.data);
    } catch (err) {
      console.error('Failed to fetch chat history:', err);
      // If user not found, go back to inbox
      if (err.response?.status === 404) {
        navigate('/messages');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !chatUser) return;

    try {
      const res = await api.post('/messages', {
        receiverId: chatUser.id,
        content: newMessage
      });
      setMessages([...messages, res.data]);
      setNewMessage('');
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  if (loading) return <div style={{ textAlign: 'center' }}>Loading messages...</div>;

  return (
    <div className="messages-container">
      {!username ? (
        // INBOX VIEW
        <div className="inbox-view">
          <h2 style={{ marginBottom: '24px', color: 'var(--primary-dark)' }}>Your Messages</h2>
          {inbox.length > 0 ? (
            <div className="inbox-list">
              {inbox.map((item) => (
                <Link to={`/messages/${item.user.username}`} key={item.user.id} className="inbox-item glass animate-fade-in">
                  <img src={item.user.avatarUrl} alt={item.user.name} className="avatar" />
                  <div className="inbox-details">
                    <h4>{item.user.name} <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 'normal' }}>@{item.user.username}</span></h4>
                    <p className="last-message">
                      {item.lastMessage.senderId === currentUser?.id ? 'You: ' : ''}
                      {item.lastMessage.content.length > 50 ? item.lastMessage.content.substring(0, 50) + '...' : item.lastMessage.content}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="glass" style={{ padding: '40px', textAlign: 'center' }}>
              <p>You don't have any messages yet.</p>
              <Link to="/discover" className="btn btn-primary" style={{ display: 'inline-block', marginTop: '16px' }}>
                Find People to Message
              </Link>
            </div>
          )}
        </div>
      ) : (
        // CHAT VIEW
        <div className="chat-view glass animate-fade-in">
          {chatUser && (
            <>
              <div className="chat-header">
                <Link to="/messages" className="back-btn" title="Back to Inbox">
                  <ArrowLeft size={20} />
                </Link>
                <Link to={`/profile/${chatUser.username}`} className="chat-user-info">
                  <img src={chatUser.avatarUrl} alt={chatUser.name} className="avatar nav-avatar" />
                  <span className="nav-text">{chatUser.name}</span>
                </Link>
              </div>

              <div className="chat-history">
                {messages.length > 0 ? (
                  messages.map(msg => {
                    const isMine = msg.senderId === currentUser?.id;
                    return (
                      <div key={msg.id} className={`chat-bubble-wrapper ${isMine ? 'mine' : 'theirs'}`}>
                        <div className={`chat-bubble ${isMine ? 'bg-primary' : 'bg-glass'}`}>
                          {msg.content}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px' }}>
                    Say hello to {chatUser.name}!
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <form className="chat-input-wrapper" onSubmit={handleSendMessage}>
                <input
                  type="text"
                  className="input-field chat-input"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <button type="submit" className="btn btn-primary icon-btn" disabled={!newMessage.trim()}>
                  <Send size={18} />
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default Messages;
