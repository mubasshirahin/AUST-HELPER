import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Lightbulb, ThumbsUp, AlertTriangle, Lock, Shield, ChevronRight, Search, Filter, Plus, X, Send, Sparkles, TrendingUp, BookOpen, Brain, Flame, SortDesc, User, Award } from 'lucide-react';
import { seniorSecrets } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function SeniorSecrets() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [secrets, setSecrets] = useState(seniorSecrets);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSecret, setNewSecret] = useState({ title: '', tip: '', course: '', type: 'booster' });
  const [toast, setToast] = useState(null);
  const formRef = useRef(null);
  const searchRef = useRef(null);

  const isSenior = user?.role === 'sr' || user?.role === 'admin';

  // Keyboard shortcut: Ctrl/Cmd + K to focus search
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Scroll to form when opened
  useEffect(() => {
    if (showAddForm && formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [showAddForm]);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const filteredSecrets = useMemo(() => {
    let result = [...secrets];

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(s =>
        s.title.toLowerCase().includes(q) ||
        s.tip.toLowerCase().includes(q) ||
        s.course.toLowerCase().includes(q) ||
        s.author.toLowerCase().includes(q)
      );
    }

    // Type filter
    if (filterType !== 'all') {
      result = result.filter(s => s.type === filterType);
    }

    // Sort
    if (sortBy === 'popular') {
      result.sort((a, b) => b.upvotes - a.upvotes);
    } else if (sortBy === 'newest') {
      result.sort((a, b) => b.id - a.id);
    } else if (sortBy === 'alphabetical') {
      result.sort((a, b) => a.course.localeCompare(b.course));
    }

    return result;
  }, [secrets, searchQuery, filterType, sortBy]);

  const handleUpvote = (id) => {
    setSecrets(prev => prev.map(s => {
      if (s.id === id) {
        return { ...s, upvotes: s.upvotes + 1 };
      }
      return s;
    }));
  };

  const handleAddSecret = (e) => {
    e.preventDefault();
    if (!newSecret.title.trim() || !newSecret.tip.trim() || !newSecret.course.trim()) {
      showToast('Please fill in all fields');
      return;
    }

    const secret = {
      id: Date.now(),
      title: newSecret.title.trim(),
      tip: newSecret.tip.trim(),
      course: newSecret.course.trim().toUpperCase(),
      type: newSecret.type,
      author: user?.name || 'Anonymous',
      upvotes: 0,
    };

    setSecrets(prev => [secret, ...prev]);
    setNewSecret({ title: '', tip: '', course: '', type: 'booster' });
    setShowAddForm(false);
    showToast('🎉 Secret shared! Your wisdom helps future batches.');
  };

  const stats = useMemo(() => ({
    totalSecrets: secrets.length,
    totalUpvotes: secrets.reduce((sum, s) => sum + s.upvotes, 0),
    boosterCount: secrets.filter(s => s.type === 'booster').length,
    killerCount: secrets.filter(s => s.type === 'killer').length,
  }), [secrets]);

  // ── Locked screen for non-SR users ──
  if (!isSenior) {
    return (
      <div className="secrets-locked-screen">
        <div className="secrets-locked-glow" />
        <div className="secrets-locked-content">
          <div className="secrets-locked-icon">
            <Lock size={40} />
          </div>
          <h2>Gate Restricted</h2>
          <p className="secrets-locked-desc">
            Only <strong>Student Representatives (SR)</strong> can access Seniors' Secrets —
            insider tips, course hacks, and teacher insights shared by seniors.
            You need the <strong>Senior (SR)</strong> role to enter this section.
          </p>
          <div className="secrets-locked-preview">
            <div className="secrets-locked-preview-item">
              <Brain size={20} />
              <span>Course-specific teacher insights</span>
            </div>
            <div className="secrets-locked-preview-item">
              <TrendingUp size={20} />
              <span>Exam strategies & hacks</span>
            </div>
            <div className="secrets-locked-preview-item">
              <Flame size={20} />
              <span>"Killer" teacher warnings</span>
            </div>
            <div className="secrets-locked-preview-item">
              <Award size={20} />
              <span>Booster tips for higher grades</span>
            </div>
          </div>
          <button className="btn btn-primary" onClick={() => navigate('/settings')}>
            <Shield size={16} />
            Apply for SR Role
            <ChevronRight size={16} />
          </button>
          <p className="secrets-locked-footnote">
            Go to Settings → Role Application to apply. Your application will be reviewed by admin.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="secrets-page">
      {/* Toast notification */}
      {toast && (
        <div className="secrets-toast animate-fadeInUp" style={{
          position: 'sticky', top: 0, zIndex: 10,
          background: 'var(--accent-emerald-glow)',
          border: '1px solid var(--accent-emerald)',
          borderRadius: 'var(--radius-lg)',
          padding: '12px 18px',
          marginBottom: 'var(--sp-4)',
          fontSize: 'var(--fs-sm)',
          fontWeight: 'var(--fw-medium)',
          color: 'var(--accent-emerald)',
          textAlign: 'center',
        }}>
          {toast}
        </div>
      )}

      {/* ── Header Section ── */}
      <header className="secrets-header-card">
        <div className="secrets-header-bg" />
        <div className="secrets-header-content">
          <div className="secrets-header-left">
            <div className="secrets-header-icon">
              <Lightbulb size={24} />
            </div>
            <div>
              <h2 className="secrets-header-title">Seniors' Secrets</h2>
              <p className="secrets-header-subtitle">Insider tips, course hacks, and teacher insights — shared by seniors for future batches</p>
            </div>
          </div>
          <div className="secrets-header-actions">
            <button className="btn btn-primary" onClick={() => setShowAddForm(prev => !prev)}>
              {showAddForm ? <X size={16} /> : <Plus size={16} />}
              {showAddForm ? 'Cancel' : 'Share a Secret'}
            </button>
          </div>
        </div>

        {/* Stats bar */}
        <div className="secrets-stats-row">
          <div className="secrets-stat-chip">
            <BookOpen size={14} />
            <span><strong>{stats.totalSecrets}</strong> Secrets</span>
          </div>
          <div className="secrets-stat-chip">
            <ThumbsUp size={14} />
            <span><strong>{stats.totalUpvotes}</strong> Upvotes</span>
          </div>
          <div className="secrets-stat-chip secrets-stat-booster">
            <Sparkles size={14} />
            <span><strong>{stats.boosterCount}</strong> Boosters</span>
          </div>
          <div className="secrets-stat-chip secrets-stat-killer">
            <AlertTriangle size={14} />
            <span><strong>{stats.killerCount}</strong> Killers</span>
          </div>
        </div>
      </header>

      {/* ── Add New Secret Form ── */}
      {showAddForm && (
        <div className="secrets-add-form animate-fadeInUp" ref={formRef}>
          <div className="secrets-add-form-header">
            <Sparkles size={18} />
            <h3>Share Your Wisdom</h3>
          </div>
          <form onSubmit={handleAddSecret}>
            <div className="secrets-add-form-grid">
              <div className="secrets-add-field">
                <label>Course Code</label>
                <input
                  className="input"
                  placeholder="e.g. CSE 3101"
                  value={newSecret.course}
                  onChange={e => setNewSecret(prev => ({ ...prev, course: e.target.value }))}
                />
              </div>
              <div className="secrets-add-field">
                <label>Secret Type</label>
                <select
                  className="input"
                  value={newSecret.type}
                  onChange={e => setNewSecret(prev => ({ ...prev, type: e.target.value }))}
                >
                  <option value="booster">🚀 Booster Tip (helpful advice)</option>
                  <option value="killer">⚠️ Killer Alert (watch out!)</option>
                </select>
              </div>
              <div className="secrets-add-field secrets-add-field-full">
                <label>Title</label>
                <input
                  className="input"
                  placeholder="e.g. Sir Rahman takes attendance in the LAST 10 minutes"
                  value={newSecret.title}
                  onChange={e => setNewSecret(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              <div className="secrets-add-field secrets-add-field-full">
                <label>The Secret</label>
                <textarea
                  className="input"
                  rows={3}
                  placeholder="Share the insider tip, hack, or teacher insight..."
                  value={newSecret.tip}
                  onChange={e => setNewSecret(prev => ({ ...prev, tip: e.target.value }))}
                />
              </div>
            </div>
            <div className="secrets-add-form-actions">
              <button type="submit" className="btn btn-primary">
                <Send size={16} />
                Publish Secret
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => setShowAddForm(false)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Controls Bar ── */}
      <div className="secrets-controls">
        <div className="secrets-search">
          <Search size={16} />
          <input
            ref={searchRef}
            type="text"
            className="secrets-search-input"
            placeholder="Search secrets, courses, authors..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="secrets-search-clear" onClick={() => setSearchQuery('')}>
              <X size={14} />
            </button>
          )}
          <kbd className="secrets-search-kbd">Ctrl+K</kbd>
        </div>

        <div className="secrets-controls-right">
          <div className="secrets-filter-group">
            <Filter size={14} />
            <button
              className={`secrets-filter-btn ${filterType === 'all' ? 'active' : ''}`}
              onClick={() => setFilterType('all')}
            >
              All
            </button>
            <button
              className={`secrets-filter-btn secrets-filter-booster ${filterType === 'booster' ? 'active' : ''}`}
              onClick={() => setFilterType('booster')}
            >
              <Sparkles size={12} /> Boosters
            </button>
            <button
              className={`secrets-filter-btn secrets-filter-killer ${filterType === 'killer' ? 'active' : ''}`}
              onClick={() => setFilterType('killer')}
            >
              <AlertTriangle size={12} /> Killers
            </button>
          </div>
          <div className="secrets-sort-group">
            <SortDesc size={14} />
            <select
              className="secrets-sort-select"
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
            >
              <option value="popular">Most Popular</option>
              <option value="newest">Newest First</option>
              <option value="alphabetical">By Course</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Secrets Grid ── */}
      {filteredSecrets.length === 0 ? (
        <div className="secrets-empty">
          <div className="secrets-empty-icon">
            <Search size={32} />
          </div>
          <h3>No secrets found</h3>
          <p>
            {searchQuery
              ? `No results for "${searchQuery}". Try a different search term.`
              : 'No secrets match your filter. Be the first to share wisdom!'}
          </p>
          {!searchQuery && (
            <button className="btn btn-primary" onClick={() => setShowAddForm(true)}>
              <Plus size={16} /> Share a Secret
            </button>
          )}
        </div>
      ) : (
        <div className="secrets-grid stagger-children">
          {filteredSecrets.map((secret, idx) => {
            const isKiller = secret.type === 'killer';
            return (
              <div
                key={secret.id}
                className={`secrets-card animate-fadeInUp ${isKiller ? 'secret-killer' : 'secret-booster'}`}
                style={{ animationDelay: `${(idx % 6) * 60}ms` }}
              >
                <div className="secrets-card-top">
                  <div className="secrets-card-badges">
                    <span className={`badge ${isKiller ? 'badge-rose' : 'badge-emerald'}`}>
                      {isKiller ? <AlertTriangle size={10} /> : <Sparkles size={10} />}
                      {isKiller ? 'KILLER' : 'BOOSTER'}
                    </span>
                    <span className="badge badge-purple">{secret.course}</span>
                  </div>
                  <h3 className="secrets-card-title">{secret.title}</h3>
                  <div className="secrets-card-tip">
                    <span className="secrets-card-quote">&ldquo;</span>
                    <p>{secret.tip}</p>
                  </div>
                </div>
                <div className="secrets-card-footer">
                  <div className="secrets-card-author">
                    <User size={12} />
                    <span>{secret.author}</span>
                  </div>
                  <button
                    className={`secrets-upvote-btn ${isKiller ? 'secret-killer' : 'secret-booster'}`}
                    onClick={() => handleUpvote(secret.id)}
                  >
                    <ThumbsUp size={13} />
                    <span>{secret.upvotes}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
