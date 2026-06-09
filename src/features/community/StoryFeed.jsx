import React, { useState } from 'react';
import { MessageSquare, Heart, Sparkles, Send } from 'lucide-react';
import { anonymousStories } from '../../data/mockData';

export default function StoryFeed() {
  const [posts, setPosts] = useState(anonymousStories);
  const [newPostContent, setNewPostContent] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', 'confession', 'funny', 'helpful', 'appreciation'];

  const filteredPosts = activeCategory === 'All' 
    ? posts 
    : posts.filter(p => p.category === activeCategory);

  const handlePostSubmit = (e) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;

    const newPost = {
      id: posts.length + 1,
      content: newPostContent,
      category: 'confession', // Default category
      reactions: { laugh: 0, heart: 0, fire: 0 },
      time: 'Just now',
      comments: 0
    };

    setPosts([newPost, ...posts]);
    setNewPostContent('');
  };

  const handleReact = (postId, reactionType) => {
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          reactions: {
            ...p.reactions,
            [reactionType]: p.reactions[reactionType] + 1
          }
        };
      }
      return p;
    }));
  };

  return (
    <div className="glass-card-static story-feed-container animate-fadeInUp" style={{ maxWidth: '700px', margin: '0 auto' }}>
      
      {/* Create confession post */}
      <form onSubmit={handlePostSubmit} className="mb-6 p-4" style={{ background: 'var(--bg-input)', borderRadius: 'var(--radius-xl)' }}>
        <h3 style={{ fontSize: 'var(--fs-sm)', fontWeight: 'bold', marginBottom: '8px' }}>Write a Confession Anonymous card</h3>
        <textarea 
          placeholder="Share your funny anecdotes or campus secrets anonymized here..." 
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
            marginBottom: '10px'
          }}
        />
        <div className="flex justify-between items-center">
          <span style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>⚠️ Keep reports civil. Posts are anonymous.</span>
          <button type="submit" className="btn btn-primary btn-sm" style={{ display: 'flex', gap: '4px' }}>
            Post Anonymous <Send size={12} />
          </button>
        </div>
      </form>

      {/* Category filters */}
      <div className="flex gap-1.5 mb-6 overflow-x-auto pb-1">
        {categories.map(cat => (
          <button 
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`tag ${activeCategory === cat ? 'active' : ''}`}
            style={{ textTransform: 'capitalize' }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Post feeds lists */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filteredPosts.map(post => (
          <div 
            key={post.id}
            className="p-4 animate-fadeIn"
            style={{
              background: 'var(--bg-input)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-primary)'
            }}
          >
            <div className="flex justify-between items-center mb-3">
              <span className="badge badge-purple" style={{ textTransform: 'capitalize', fontSize: '9px' }}>
                {post.category}
              </span>
              <span style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>{post.time}</span>
            </div>

            <p style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
              {post.content}
            </p>

            <div className="flex justify-between items-center mt-4 pt-3" style={{ borderTop: '1px solid var(--border-secondary)', fontSize: '11px', color: 'var(--text-secondary)' }}>
              {/* Reactions list */}
              <div className="flex gap-2">
                <button 
                  onClick={() => handleReact(post.id, 'laugh')} 
                  style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--bg-secondary)', padding: '4px 8px', borderRadius: 'var(--radius-full)' }}
                >
                  😂 {post.reactions.laugh}
                </button>
                <button 
                  onClick={() => handleReact(post.id, 'heart')} 
                  style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--bg-secondary)', padding: '4px 8px', borderRadius: 'var(--radius-full)' }}
                >
                  ❤️ {post.reactions.heart}
                </button>
                <button 
                  onClick={() => handleReact(post.id, 'fire')} 
                  style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--bg-secondary)', padding: '4px 8px', borderRadius: 'var(--radius-full)' }}
                >
                  🔥 {post.reactions.fire}
                </button>
              </div>

              <span className="flex items-center gap-1">
                <MessageSquare size={12} /> {post.comments} Comments
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
