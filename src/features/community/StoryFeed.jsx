import React, { useState, useEffect } from 'react';
import { MessageSquare, Send } from 'lucide-react';

const STORAGE_KEY = 'austwise_posts';
const REACTIONS_KEY = 'austwise_reactions';
const VISITOR_KEY = 'austwise_visitor_id';

const getVisitorId = () => {
  let id = localStorage.getItem(VISITOR_KEY);
  if (!id) {
    id = 'user_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem(VISITOR_KEY, id);
  }
  return id;
};

const categoryMeta = {
  confession: { icon: '💬', color: '#a855f7', label: 'Confession' },
  funny:      { icon: '😂', color: '#f59e0b', label: 'Funny' },
  helpful:    { icon: '💡', color: '#10b981', label: 'Helpful' },
  appreciation: { icon: '🙏', color: '#f43f5e', label: 'Appreciation' },
};

const reactionEmojis = { laugh: '😂', heart: '❤️', fire: '🔥' };

const getTimeAgo = (timestamp) => {
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString();
};

export default function StoryFeed() {
  const visitorId = getVisitorId();

  const [posts, setPosts] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });

  const [userReactions, setUserReactions] = useState(() => {
    try {
      const stored = localStorage.getItem(REACTIONS_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch { return {}; }
  });

  const [newPostContent, setNewPostContent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('confession');
  const [activeFilter, setActiveFilter] = useState('All');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    localStorage.setItem(REACTIONS_KEY, JSON.stringify(userReactions));
  }, [userReactions]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPosts(prev => prev.map(p => ({
        ...p,
        time: getTimeAgo(p.timestamp),
      })));
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const filterCategories = ['All', ...Object.keys(categoryMeta)];
  const postCategories = Object.keys(categoryMeta);

  const filteredPosts = activeFilter === 'All'
    ? posts
    : posts.filter(p => p.category === activeFilter);

  const handlePostSubmit = (e) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;

    const newPost = {
      id: Date.now() + Math.random(),
      content: newPostContent.trim(),
      category: selectedCategory,
      reactions: { laugh: 0, heart: 0, fire: 0 },
      timestamp: Date.now(),
      time: 'Just now',
      comments: 0,
    };

    setPosts([newPost, ...posts]);
    setNewPostContent('');
  };

  const handleReact = (postId, reactionType) => {
    const key = `${postId}-${reactionType}`;
    const userSet = userReactions[visitorId] || [];
    const hasReacted = userSet.includes(key);

    setUserReactions(prev => ({
      ...prev,
      [visitorId]: hasReacted
        ? userSet.filter(k => k !== key)
        : [...userSet, key],
    }));

    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;
      return {
        ...p,
        reactions: {
          ...p.reactions,
          [reactionType]: p.reactions[reactionType] + (hasReacted ? -1 : 1),
        },
      };
    }));
  };

  return (
    <div className="glass-card-static story-feed-container animate-fadeInUp" style={{ maxWidth: '700px', margin: '0 auto' }}>
      
      {/* Create post form */}
      <form onSubmit={handlePostSubmit} className="mb-6 p-4" style={{ background: 'var(--bg-input)', borderRadius: 'var(--radius-xl)' }}>
        <h3 style={{ fontSize: 'var(--fs-sm)', fontWeight: 'bold', marginBottom: '8px' }}>Share something anonymously</h3>

        {/* Category selector */}
        <div className="flex gap-1.5 mb-3 flex-wrap">
          {postCategories.map(cat => {
            const meta = categoryMeta[cat];
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                style={{
                  textTransform: 'capitalize',
                  fontSize: '11px',
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-full)',
                  border: active ? `2px solid ${meta.color}` : '2px solid transparent',
                  background: active ? meta.color + '20' : 'var(--bg-secondary)',
                  color: active ? meta.color : 'var(--text-secondary)',
                  fontWeight: active ? '600' : '400',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {meta.icon} {meta.label}
              </button>
            );
          })}
        </div>

        <textarea
          placeholder="What's on your mind?"
          value={newPostContent}
          onChange={(e) => setNewPostContent(e.target.value)}
          rows="3"
          style={{
            width: '100%',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-primary)',
            borderRadius: 'var(--radius-md)',
            padding: '12px',
            color: 'var(--text-primary)',
            fontSize: 'var(--fs-sm)',
            resize: 'none',
            outline: 'none',
            marginBottom: '10px',
            fontFamily: 'inherit',
          }}
        />
        <div className="flex justify-between items-center">
          <span style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>⚠️ Keep reports civil. Posts are anonymous.</span>
          <button type="submit" className="btn btn-primary btn-sm" style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            Post <Send size={12} />
          </button>
        </div>
      </form>

      {/* Category filters */}
      <div className="flex gap-1.5 mb-6 overflow-x-auto pb-1">
        {filterCategories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveFilter(cat)}
            className={`tag ${activeFilter === cat ? 'active' : ''}`}
            style={{ textTransform: 'capitalize' }}
          >
            {cat === 'All' ? 'All' : `${categoryMeta[cat].icon} ${cat}`}
          </button>
        ))}
      </div>

      {/* Post feeds lists */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filteredPosts.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '48px 20px',
            color: 'var(--text-tertiary)',
            fontSize: '13px',
            background: 'var(--bg-input)',
            borderRadius: 'var(--radius-lg)',
            border: '1px dashed var(--border-secondary)',
          }}>
            {activeFilter === 'All'
              ? 'No posts yet. Be the first to share!'
              : `No ${activeFilter} posts yet. Be the first to share one!`}
          </div>
        )}
        {filteredPosts.map(post => {
          const meta = categoryMeta[post.category] || categoryMeta.confession;
          return (
            <div
              key={post.id}
              className="p-4 animate-fadeIn"
              style={{
                background: 'var(--bg-input)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-primary)',
              }}
            >
              <div className="flex justify-between items-center mb-3">
                <span style={{
                  textTransform: 'capitalize',
                  fontSize: '9px',
                  fontWeight: '600',
                  background: meta.color + '20',
                  color: meta.color,
                  padding: '3px 10px',
                  borderRadius: '12px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}>
                  {meta.icon} {post.category}
                </span>
                <span style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>{post.time}</span>
              </div>

              <p style={{
                fontSize: '13px',
                color: 'var(--text-primary)',
                lineHeight: '1.6',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}>
                {post.content}
              </p>

              <div className="flex justify-between items-center mt-4 pt-3" style={{
                borderTop: '1px solid var(--border-secondary)',
                fontSize: '11px',
                color: 'var(--text-secondary)',
              }}>
                <div className="flex gap-2">
                  {Object.entries(reactionEmojis).map(([type, emoji]) => {
                    const hasReacted = (userReactions[visitorId] || []).includes(`${post.id}-${type}`);
                    return (
                      <button
                        key={type}
                        onClick={() => handleReact(post.id, type)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          background: hasReacted ? meta.color + '20' : 'var(--bg-secondary)',
                          color: hasReacted ? meta.color : 'var(--text-secondary)',
                          padding: '4px 10px',
                          borderRadius: 'var(--radius-full)',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '12px',
                          transition: 'all 0.15s ease',
                          fontWeight: hasReacted ? '600' : '400',
                        }}
                      >
                        {emoji} {post.reactions[type]}
                      </button>
                    );
                  })}
                </div>

                <span className="flex items-center gap-1">
                  <MessageSquare size={12} /> {post.comments}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
