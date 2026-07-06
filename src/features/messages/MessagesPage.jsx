import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { MessageSquare, Send, ArrowLeft, Inbox } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  getConversations,
  getThread,
  sendMessage,
  markConversationRead,
  getUnreadCount,
  formatMessageTime,
  formatConversationTime,
} from '../../utils/messageStorage';
import './MessagesPage.css';

function ChatThread({ userId, peerId, peer, onSent }) {
  const [thread, setThread] = useState(() => getThread(userId, peerId));
  const [draft, setDraft] = useState('');
  const scrollRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setThread(getThread(userId, peerId));
      markConversationRead(userId, peerId);
    }, 2000);
    return () => clearInterval(interval);
  }, [userId, peerId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [thread]);

  const handleSend = (e) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    sendMessage(userId, peerId, text);
    setDraft('');
    setThread(getThread(userId, peerId));
    markConversationRead(userId, peerId);
    onSent();
  };

  return (
    <>
      <header className="chat-header">
        <button
          type="button"
          className="chat-back hide-desktop"
          onClick={() => onSent('back')}
          aria-label="Back to inbox"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="avatar" style={{ width: '40px', height: '40px' }}>{peer?.initials}</div>
        <div className="chat-peer-info">
          <span className="chat-peer-name">{peer?.name}</span>
          <span className="chat-peer-sub">
            {peer?.role === 'alumni' ? 'Alumni' : peer?.role || 'Member'}
            {peer?.department ? ` · ${peer.department}` : ''}
          </span>
        </div>
      </header>

      <div className="chat-messages" ref={scrollRef}>
        {thread.map((m) => {
          const mine = m.fromId === userId;
          return (
            <div key={m.id} className={`chat-bubble-row ${mine ? 'mine' : 'theirs'}`}>
              <div className="chat-bubble">
                <p>{m.text}</p>
                <span className="chat-time">{formatMessageTime(m.timestamp)}</span>
              </div>
            </div>
          );
        })}
      </div>

      <form className="chat-input" onSubmit={handleSend}>
        <input
          type="text"
          placeholder={`Message ${peer?.name || ''}...`}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
        <button type="submit" className="btn btn-primary chat-send" disabled={!draft.trim()}>
          <Send size={16} /> <span className="hide-mobile">Send</span>
        </button>
      </form>
    </>
  );
}

export default function MessagesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentUserId = user?.id;
  const [conversations, setConversations] = useState(() =>
    currentUserId ? getConversations(currentUserId) : []
  );
  const [activePeerId, setActivePeerId] = useState(searchParams.get('peer') || '');
  const [searchTerm, setSearchTerm] = useState('');

  const refreshConversations = useCallback(() => {
    if (!currentUserId) return;
    setConversations(getConversations(currentUserId));
  }, [currentUserId]);

  useEffect(() => {
    const interval = setInterval(refreshConversations, 2000);
    return () => clearInterval(interval);
  }, [refreshConversations]);

  const openConversation = (peerId) => {
    setActivePeerId(peerId);
    setSearchParams(peerId ? { peer: peerId } : {});
  };

  const handleThreadEvent = (action) => {
    if (action === 'back') {
      setActivePeerId('');
      setSearchParams({});
      return;
    }
    refreshConversations();
  };

  const filteredConversations = conversations.filter((c) =>
    c.peer.name.toLowerCase().includes(searchTerm.trim().toLowerCase())
  );

  const activePeer = conversations.find((c) => c.peerId === activePeerId)?.peer;

  if (!currentUserId) {
    return (
      <div className="glass-card-static messages-empty">
        <MessageSquare size={40} style={{ opacity: 0.5 }} />
        <h3>Login to view messages</h3>
        <p>You need an account to use the inbox.</p>
        <button className="btn btn-primary" onClick={() => navigate('/login')}>Login / Sign up</button>
      </div>
    );
  }

  const unreadTotal = getUnreadCount(currentUserId);

  return (
    <div className="glass-card-static messages-page animate-fadeIn">
      <div className="messages-layout">
        {/* Conversation list */}
        <aside className={`messages-list ${activePeerId ? 'hidden-mobile' : ''}`}>
          <div className="messages-list-header">
            <h2 className="section-title" style={{ fontSize: 'var(--fs-md)', margin: 0 }}>Inbox</h2>
            {unreadTotal > 0 && (
              <span className="badge badge-cyan" style={{ fontSize: '11px' }}>
                {unreadTotal} new
              </span>
            )}
          </div>

          <div className="search-box" style={{ padding: '0 16px 12px' }}>
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="conversation-items">
            {filteredConversations.length === 0 ? (
              <div className="messages-empty small">
                <Inbox size={28} style={{ opacity: 0.4 }} />
                <p>No conversations yet.</p>
                <span>Message an alumni from the Alumni Directory who is "Open for Talk".</span>
              </div>
            ) : (
              filteredConversations.map((c) => (
                <button
                  key={c.conversationId}
                  type="button"
                  className={`conversation-item ${c.peerId === activePeerId ? 'active' : ''}`}
                  onClick={() => openConversation(c.peerId)}
                >
                  <div className="avatar" style={{ width: '42px', height: '42px', flexShrink: 0 }}>
                    {c.peer.initials}
                  </div>
                  <div className="conversation-item-body">
                    <div className="conversation-item-top">
                      <span className="conversation-name">{c.peer.name}</span>
                      <span className="conversation-time">{formatConversationTime(c.lastTimestamp)}</span>
                    </div>
                    <div className="conversation-item-bottom">
                      <span className="conversation-preview">
                        {c.lastMessage.fromId === currentUserId ? 'You: ' : ''}
                        {c.lastMessage.text}
                      </span>
                      {c.unread > 0 && <span className="unread-badge">{c.unread}</span>}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </aside>

        {/* Chat thread */}
        <section className={`messages-chat ${!activePeerId ? 'hidden-mobile' : ''}`}>
          {!activePeerId ? (
            <div className="messages-empty">
              <MessageSquare size={40} style={{ opacity: 0.5 }} />
              <h3>Select a conversation</h3>
              <p>Pick a chat from the left to start messaging.</p>
            </div>
          ) : (
            <ChatThread
              key={activePeerId}
              userId={currentUserId}
              peerId={activePeerId}
              peer={activePeer}
              onSent={handleThreadEvent}
            />
          )}
        </section>
      </div>
    </div>
  );
}
