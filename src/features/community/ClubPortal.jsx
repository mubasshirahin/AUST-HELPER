import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Target, Users, Search, Filter, PlusCircle, CheckCircle, X,
  Calendar, Award, User, ExternalLink, ChevronDown, ChevronUp,
  Code, Trophy, Bot, Music, Palette, Camera, Heart, Gamepad2,
  BookOpen, Leaf, Briefcase, MessageCircle, Shield,
  Star, Sparkles, TrendingUp, Clock, Hash,
} from 'lucide-react';
import { clubsData } from '../../data/mockData';

const clubIcons = {
  code: Code,
  trophy: Trophy,
  bot: Bot,
  music: Music,
  palette: Palette,
  camera: Camera,
  dove: Heart,
  gamepad: Gamepad2,
  book: BookOpen,
  leaf: Leaf,
  briefcase: Briefcase,
  heart: Heart,
  message: MessageCircle,
  shield: Shield,
};

const categoryEmojis = {
  'Academic & Technical': '🧠',
  'Sports & Recreation': '⚽',
  'Cultural & Arts': '🎭',
  'Social & Humanitarian': '🤝',
  'Professional Development': '💼',
};

export default function ClubPortal() {
  const [clubs, setClubs] = useState(clubsData);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [expandedClub, setExpandedClub] = useState(null);
  const [showJoinedOnly, setShowJoinedOnly] = useState(false);
  const searchRef = useRef(null);

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

  const handleJoinToggle = (clubId) => {
    setClubs(prev => prev.map(c => {
      if (c.id === clubId) {
        return { ...c, joined: !c.joined, members: c.joined ? c.members - 1 : c.members + 1 };
      }
      return c;
    }));
  };

  const categories = useMemo(() => {
    const cats = [...new Set(clubs.map(c => c.category))];
    return cats;
  }, [clubs]);

  const filteredClubs = useMemo(() => {
    let result = [...clubs];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.acronym.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.focus.some(f => f.toLowerCase().includes(q))
      );
    }

    if (filterCategory !== 'all') {
      result = result.filter(c => c.category === filterCategory);
    }

    if (showJoinedOnly) {
      result = result.filter(c => c.joined);
    }

    return result;
  }, [clubs, searchQuery, filterCategory, showJoinedOnly]);

  const stats = useMemo(() => ({
    total: clubs.length,
    totalMembers: clubs.reduce((sum, c) => sum + c.members, 0),
    joinedCount: clubs.filter(c => c.joined).length,
    joinedMembers: clubs.filter(c => c.joined).reduce((sum, c) => sum + c.members, 0),
  }), [clubs]);

  const toggleExpand = (id) => {
    setExpandedClub(prev => prev === id ? null : id);
  };

  const getIconComponent = (iconName) => {
    const Icon = clubIcons[iconName] || Target;
    return Icon;
  };

  return (
    <div className="clubs-page">
      {/* ── Header Card ── */}
      <header className="clubs-header-card">
        <div className="clubs-header-bg" />
        <div className="clubs-header-content">
          <div className="clubs-header-left">
            <div className="clubs-header-icon">
              <Target size={24} />
            </div>
            <div>
              <h2 className="clubs-header-title">Clubs Hub</h2>
              <p className="clubs-header-subtitle">
                Explore {clubs.length} active AUST student clubs — discover your passion, connect with peers, and build your campus life
              </p>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="clubs-stats-row">
          <div className="clubs-stat-chip">
            <Hash size={14} />
            <span><strong>{stats.total}</strong> Clubs</span>
          </div>
          <div className="clubs-stat-chip">
            <Users size={14} />
            <span><strong>{stats.totalMembers.toLocaleString()}</strong> Total Members</span>
          </div>
          <div className="clubs-stat-chip clubs-stat-joined">
            <Star size={14} />
            <span><strong>{stats.joinedCount}</strong> Joined</span>
          </div>
          {stats.joinedCount > 0 && (
            <div className="clubs-stat-chip">
              <TrendingUp size={14} />
              <span><strong>{stats.joinedMembers.toLocaleString()}</strong> Network Reach</span>
            </div>
          )}
        </div>
      </header>

      {/* ── Controls Bar ── */}
      <div className="clubs-controls">
        <div className="clubs-search">
          <Search size={16} />
          <input
            ref={searchRef}
            type="text"
            className="clubs-search-input"
            placeholder="Search clubs by name, keyword, or focus area..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="clubs-search-clear" onClick={() => setSearchQuery('')}>
              <X size={14} />
            </button>
          )}
          <kbd className="clubs-search-kbd">Ctrl+K</kbd>
        </div>

        <div className="clubs-controls-right">
          <div className="clubs-filter-group">
            <Filter size={14} />
            <button
              className={`clubs-filter-btn ${filterCategory === 'all' ? 'active' : ''}`}
              onClick={() => setFilterCategory('all')}
            >
              All
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                className={`clubs-filter-btn ${filterCategory === cat ? 'active' : ''}`}
                onClick={() => setFilterCategory(cat)}
              >
                {categoryEmojis[cat] || '📌'} {cat.split(' & ')[0]}
              </button>
            ))}
          </div>
          <button
            className={`clubs-joined-toggle ${showJoinedOnly ? 'active' : ''}`}
            onClick={() => setShowJoinedOnly(prev => !prev)}
          >
            <Star size={14} />
            Joined
          </button>
        </div>
      </div>

      {/* ── Clubs Grid ── */}
      {filteredClubs.length === 0 ? (
        <div className="clubs-empty">
          <div className="clubs-empty-icon">
            <Search size={32} />
          </div>
          <h3>No clubs found</h3>
          <p>
            {searchQuery
              ? `No results for "${searchQuery}". Try a different search term.`
              : showJoinedOnly
                ? 'You haven\'t joined any clubs yet. Browse and join one!'
                : 'No clubs match your filters.'}
          </p>
          {(searchQuery || showJoinedOnly) && (
            <button className="btn btn-primary" onClick={() => { setSearchQuery(''); setShowJoinedOnly(false); }}>
              <X size={16} /> Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="clubs-grid stagger-children">
          {filteredClubs.map((club, idx) => {
            const Icon = getIconComponent(club.icon);
            const isExpanded = expandedClub === club.id;

            return (
              <div
                key={club.id}
                className={`clubs-card animate-fadeInUp ${club.joined ? 'clubs-card-joined' : ''}`}
                style={{ animationDelay: `${(idx % 6) * 60}ms` }}
              >
                {/* Shine overlay — matches dashboard pattern */}
                <div className="card-shine" aria-hidden="true" />
                {/* Top accent bar */}
                <div className="clubs-card-accent" style={{ background: club.color }} />

                <div className="clubs-card-body">
                  {/* Logo + header */}
                  <div className="clubs-card-head">
                    <div className="clubs-card-logo" style={{ background: `${club.color}1A`, color: club.color }}>
                      <Icon size={22} />
                    </div>
                    <div className="clubs-card-head-text">
                      <h3 className="clubs-card-name">{club.name}</h3>
                      <span className="clubs-card-acronym">{club.acronym}</span>
                    </div>
                    <span className="clubs-card-badge" style={{ background: `${club.color}18`, color: club.color }}>
                      {club.members.toLocaleString()}
                      <Users size={12} />
                    </span>
                  </div>

                  {/* Category tag */}
                  <div className="clubs-card-category">
                    {categoryEmojis[club.category] || '📌'} {club.category}
                  </div>

                  {/* Description */}
                  <p className="clubs-card-desc">
                    {isExpanded ? club.description : `${club.description.slice(0, 100)}...`}
                  </p>
                  {club.description.length > 100 && (
                    <button className="clubs-card-expand" onClick={() => toggleExpand(club.id)}>
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      {isExpanded ? 'Show less' : 'Read more'}
                    </button>
                  )}

                  {/* Focus tags */}
                  <div className="clubs-card-focus">
                    {club.focus.map(f => (
                      <span key={f} className="clubs-card-tag">{f}</span>
                    ))}
                  </div>

                  {/* Details (collapsible on mobile, always visible on desktop) */}
                  <div className={`clubs-card-details ${isExpanded ? 'expanded' : ''}`}>
                    <div className="clubs-card-detail">
                      <Calendar size={13} />
                      <span><strong>Meeting:</strong> {club.meetingDay}</span>
                    </div>
                    <div className="clubs-card-detail">
                      <Clock size={13} />
                      <span><strong>Next:</strong> {club.nextEvent}</span>
                    </div>
                    <div className="clubs-card-detail">
                      <User size={13} />
                      <span><strong>Advisor:</strong> {club.advisor}</span>
                    </div>
                    <div className="clubs-card-detail">
                      <Award size={13} />
                      <span><strong>Since:</strong> {club.founded}</span>
                    </div>
                  </div>

                  {/* Achievement preview */}
                  {club.achievements && club.achievements.length > 0 && (
                    <div className="clubs-card-achievements">
                      <Sparkles size={12} />
                      <span>{club.achievements[0]}</span>
                    </div>
                  )}
                </div>

                {/* Action footer */}
                <div className="clubs-card-footer">
                  <div className="clubs-card-social">
                    {club.socialLinks?.facebook && (
                      <a href={club.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="clubs-social-link" title="Facebook">
                        <ExternalLink size={13} />
                      </a>
                    )}
                    {club.socialLinks?.discord && (
                      <a href={club.socialLinks.discord} target="_blank" rel="noopener noreferrer" className="clubs-social-link" title="Discord">
                        <MessageCircle size={13} />
                      </a>
                    )}
                    {club.socialLinks?.linkedin && (
                      <a href={club.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="clubs-social-link" title="LinkedIn">
                        <Briefcase size={13} />
                      </a>
                    )}
                  </div>
                  <button
                    className={`clubs-join-btn ${club.joined ? 'joined' : ''}`}
                    onClick={() => handleJoinToggle(club.id)}
                    style={{ '--club-accent': club.color }}
                  >
                    {club.joined ? (
                      <><CheckCircle size={15} /> Joined</>
                    ) : (
                      <><PlusCircle size={15} /> Join</>
                    )}
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
