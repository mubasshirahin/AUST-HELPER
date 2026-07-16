import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Copy, Check, BookOpen, Star, Plus, X, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  getCheatsheets,
  addCheatsheet,
  deleteCheatsheet,
  getFavoriteIds,
  toggleFavorite,
} from '../../utils/cheatsheetStorage';

const categoryColors = {
  'Programming': '#a855f7',
  'Data Structures': '#3b82f6',
  'Object-Oriented': '#f59e0b',
  'Algorithms': '#10b981',
  'Operating Systems': '#ef4444',
  'Database': '#06b6d4',
  'Networks': '#f97316',
  'Software Engineering': '#8b5cf6',
  'AI': '#ec4899',
  'Machine Learning': '#14b8a6',
  'Mathematics': '#6366f1',
  'Physics': '#5c6bc0',
  'Chemistry': '#26a69a',
  'English': '#ef5350',
  'Humanities': '#ab47bc',
};

const deptMeta = {
  CSE:  { label: 'CSE',  full: 'Computer Science & Engineering',      color: '#a855f7', icon: '💻' },
  EEE:  { label: 'EEE',  full: 'Electrical & Electronic Engineering',  color: '#ff5722', icon: '⚡' },
  CE:   { label: 'CE',   full: 'Civil Engineering',                    color: '#3f51b5', icon: '🏗️' },
  ME:   { label: 'ME',   full: 'Mechanical Engineering',               color: '#f44336', icon: '⚙️' },
  IPE:  { label: 'IPE',  full: 'Industrial & Production Engineering',  color: '#9c27b0', icon: '🏭' },
  TE:   { label: 'TE',   full: 'Textile Engineering',                  color: '#ff4081', icon: '🧵' },
  ARCH: { label: 'ARCH', full: 'Architecture',                         color: '#ff9800', icon: '🏛️' },
  BBA:  { label: 'BBA',  full: 'Business Administration',              color: '#4db6ac', icon: '📊' },
  MATH: { label: 'MATH', full: 'Mathematics',                          color: '#6366f1', icon: '📐' },
  PHY:  { label: 'PHY',  full: 'Physics',                              color: '#5c6bc0', icon: '🔬' },
  CHEM: { label: 'CHEM', full: 'Chemistry',                            color: '#26a69a', icon: '🧪' },
};

const emptyForm = { title: '', category: '', course: '', formulas: '' };

export default function Cheatsheets({ vaultContext }) {
  const { course, courseName } = vaultContext;
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'moderator';
  const canAdd = true; // for now, everyone can add — admins can still delete any sheet

  const [sheets, setSheets] = useState(() => getCheatsheets());
  const [favorites, setFavorites] = useState(() => getFavoriteIds(user?.id));
  const [searchTerm, setSearchTerm] = useState('');
  const [activeDept, setActiveDept] = useState('All');
  const [activeCategory, setActiveCategory] = useState('All');
  const [showFavsOnly, setShowFavsOnly] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');

  const handleToggleFavorite = useCallback((sheetId) => {
    setFavorites(new Set(toggleFavorite(user?.id, sheetId)));
  }, [user?.id]);

  // Reload favorites when the signed-in user changes
  useEffect(() => {
    setFavorites(getFavoriteIds(user?.id));
  }, [user?.id]);

  const handleDelete = useCallback((sheetId) => {
    deleteCheatsheet(sheetId);
    setSheets(getCheatsheets());
  }, []);

  const handleAddSubmit = (e) => {
    e.preventDefault();
    const formulas = form.formulas.split('\n').map((f) => f.trim()).filter(Boolean);
    if (!form.title.trim()) { setFormError('Title is required.'); return; }
    if (formulas.length === 0) { setFormError('Add at least one formula / line.'); return; }
    addCheatsheet({
      title: form.title,
      category: form.category || 'General',
      course: form.course,
      formulas,
      contributorId: user?.id,
    });
    setSheets(getCheatsheets());
    setForm(emptyForm);
    setFormError('');
    setShowAddForm(false);
  };

  const filteredByDept = useMemo(() => {
    return activeDept === 'All'
      ? sheets
      : sheets.filter((cs) => cs.course?.startsWith(activeDept));
  }, [sheets, activeDept]);

  const availableCategories = useMemo(() => {
    const cats = [...new Set(filteredByDept.map((cs) => cs.category).filter(Boolean))];
    return ['All', ...cats.sort()];
  }, [filteredByDept]);

  const filteredCheatsheets = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    return filteredByDept
      .filter((cs) => !course || !cs.course || cs.course === course)
      .filter((cs) => !showFavsOnly || favorites.has(cs.id))
      .filter((cs) => activeCategory === 'All' || cs.category === activeCategory)
      .filter((cs) =>
        !q ||
        cs.title.toLowerCase().includes(q) ||
        (cs.category || '').toLowerCase().includes(q) ||
        (cs.course && cs.course.toLowerCase().includes(q)) ||
        cs.formulas.some((f) => f.toLowerCase().includes(q))
      );
  }, [filteredByDept, course, activeCategory, searchTerm, showFavsOnly, favorites]);

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const favCount = favorites.size;

  return (
    <div className="glass-card-static cheatsheets-container animate-fadeInUp">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <div>
          <h2 className="section-title" style={{ fontSize: 'var(--fs-lg)', margin: 0 }}>Cheatsheets</h2>
          <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-secondary)' }}>
            {courseName} — quick formula sheets and references
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Favorites toggle */}
          <button
            onClick={() => setShowFavsOnly((p) => !p)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              fontSize: '11px',
              fontWeight: '600',
              padding: '6px 12px',
              borderRadius: 'var(--radius-full)',
              border: showFavsOnly ? '1.5px solid var(--accent-amber)' : '1.5px solid var(--border-primary)',
              background: showFavsOnly ? 'color-mix(in srgb, var(--accent-amber) 12%, transparent)' : 'var(--bg-secondary)',
              color: showFavsOnly ? 'var(--accent-amber)' : 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            title={showFavsOnly ? 'Show all cheatsheets' : 'Show favorites only'}
          >
            <Star size={13} fill={showFavsOnly ? 'currentColor' : 'none'} />
            Favorites{favCount > 0 ? ` (${favCount})` : ''}
          </button>

          {/* Add cheatsheet */}
          {canAdd && (
            <button
              onClick={() => { setShowAddForm((p) => !p); setFormError(''); }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '11px',
                fontWeight: '600',
                padding: '6px 12px',
                borderRadius: 'var(--radius-full)',
                border: '1.5px solid var(--accent-purple)',
                background: showAddForm ? 'var(--accent-purple)' : 'color-mix(in srgb, var(--accent-purple) 12%, transparent)',
                color: showAddForm ? '#fff' : 'var(--accent-purple)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {showAddForm ? <X size={13} /> : <Plus size={13} />}
              {showAddForm ? 'Cancel' : 'Add Cheatsheet'}
            </button>
          )}

          <div className="search-box" style={{ width: '220px' }}>
            <input
              type="text"
              placeholder="Search cheatsheets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Add form */}
      {canAdd && showAddForm && (
        <form
          onSubmit={handleAddSubmit}
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-primary)',
            borderRadius: 'var(--radius-lg)',
            padding: '16px',
            marginBottom: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          <div className="flex gap-2 flex-wrap">
            <input
              type="text"
              placeholder="Title * (e.g. C Programming Basics)"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              style={{ flex: 2, minWidth: '180px', padding: '8px 12px', background: 'var(--bg-card)', border: '1px solid var(--border-primary)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', fontSize: '12px', outline: 'none' }}
            />
            <input
              type="text"
              placeholder="Category (e.g. Programming)"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              style={{ flex: 1, minWidth: '140px', padding: '8px 12px', background: 'var(--bg-card)', border: '1px solid var(--border-primary)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', fontSize: '12px', outline: 'none' }}
            />
            <input
              type="text"
              placeholder="Course code (e.g. CSE1101)"
              value={form.course}
              onChange={(e) => setForm({ ...form, course: e.target.value })}
              style={{ flex: 1, minWidth: '140px', padding: '8px 12px', background: 'var(--bg-card)', border: '1px solid var(--border-primary)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', fontSize: '12px', outline: 'none' }}
            />
          </div>
          <textarea
            placeholder={'Formulas / lines — one per line *\ne.g.\nprintf("format", args);\nfor (int i = 0; i < n; i++) { }'}
            value={form.formulas}
            onChange={(e) => setForm({ ...form, formulas: e.target.value })}
            rows={5}
            style={{ padding: '10px 12px', background: 'var(--bg-card)', border: '1px solid var(--border-primary)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', fontSize: '12px', fontFamily: "'Cascadia Code', 'Fira Code', monospace", outline: 'none', resize: 'vertical' }}
          />
          {formError && (
            <p style={{ color: 'var(--accent-rose)', fontSize: '11px', margin: 0 }}>{formError}</p>
          )}
          <div>
            <button
              type="submit"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '12px',
                fontWeight: '600',
                padding: '8px 18px',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                background: 'var(--accent-purple)',
                color: '#fff',
                cursor: 'pointer',
              }}
            >
              <Plus size={13} /> Publish Cheatsheet
            </button>
          </div>
        </form>
      )}

      {/* Department filter */}
      <div className="mb-5">
        <p style={{ fontSize: '10px', fontWeight: '600', color: 'var(--text-tertiary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Department
        </p>
        <div className="flex gap-1.5 overflow-x-auto pb-1 flex-wrap">
          <button
            onClick={() => { setActiveDept('All'); setActiveCategory('All'); }}
            className={`tag ${activeDept === 'All' ? 'active' : ''}`}
            style={{ fontSize: '11px', flexShrink: 0 }}
          >
            All Departments
          </button>
          {Object.keys(deptMeta).map((dk) => {
            const m = deptMeta[dk];
            const active = activeDept === dk;
            return (
              <button
                key={dk}
                onClick={() => { setActiveDept(dk); setActiveCategory('All'); }}
                style={{
                  fontSize: '11px',
                  padding: '4px 12px',
                  borderRadius: 'var(--radius-full)',
                  border: active ? `1.5px solid ${m.color}` : '1.5px solid transparent',
                  background: active ? m.color + '18' : 'var(--bg-secondary)',
                  color: active ? m.color : 'var(--text-secondary)',
                  fontWeight: active ? '600' : '400',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                {m.icon} {m.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Category filter chips */}
      {filteredByDept.length > 0 && availableCategories.length > 1 && (
        <div className="mb-5">
          <p style={{ fontSize: '10px', fontWeight: '600', color: 'var(--text-tertiary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Topic
          </p>
          <div className="flex gap-1.5 overflow-x-auto pb-1 flex-wrap">
            {availableCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`tag ${activeCategory === cat ? 'active' : ''}`}
                style={{
                  textTransform: 'capitalize',
                  fontSize: '11px',
                  border: activeCategory === cat
                    ? `1.5px solid ${categoryColors[cat] || 'var(--accent-purple)'}`
                    : '1.5px solid transparent',
                }}
              >
                {cat === 'All' ? 'All' : cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {filteredCheatsheets.length === 0 ? (
        <div className="empty-state" style={{ padding: '48px 16px', textAlign: 'center' }}>
          {showFavsOnly ? (
            <>
              <Star size={36} style={{ color: 'var(--text-tertiary)', marginBottom: '12px' }} />
              <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--fs-sm)', margin: 0 }}>
                No favorites yet — tap the ★ on any cheatsheet to save it here.
              </p>
            </>
          ) : (
            <>
              <BookOpen size={36} style={{ color: 'var(--text-tertiary)', marginBottom: '12px' }} />
              <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--fs-sm)', margin: 0 }}>
                {searchTerm
                  ? 'No cheatsheets match your search.'
                  : 'No cheatsheets yet — use "Add Cheatsheet" to publish the first one!'}
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="grid-2">
          {filteredCheatsheets.map((cs) => {
            const catColor = categoryColors[cs.category] || 'var(--accent-purple)';
            const dept = cs.course && deptMeta[cs.course];
            const isFav = favorites.has(cs.id);
            return (
              <div
                key={cs.id}
                className="glass-card"
                style={{
                  padding: '0',
                  background: 'var(--bg-input)',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                }}
              >
                {/* Card header */}
                <div
                  style={{
                    padding: '14px 18px',
                    borderBottom: '1px solid var(--border-secondary)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <h3 style={{
                      fontSize: '14px',
                      fontWeight: 'var(--fw-bold)',
                      margin: 0,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {cs.title}
                    </h3>
                    <span style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>
                      {dept ? `${dept.icon} ${dept.full}` : (cs.course || '')}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                    {cs.category && (
                      <span
                        style={{
                          fontSize: '9px',
                          fontWeight: '600',
                          background: catColor + '20',
                          color: catColor,
                          padding: '3px 10px',
                          borderRadius: '12px',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {cs.category}
                      </span>
                    )}
                    {/* Favorite star */}
                    <button
                      onClick={() => handleToggleFavorite(cs.id)}
                      title={isFav ? 'Remove from favorites' : 'Add to favorites'}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        color: isFav ? 'var(--accent-amber)' : 'var(--text-tertiary)',
                        transition: 'color 0.15s ease, transform 0.15s ease',
                        transform: isFav ? 'scale(1.1)' : 'scale(1)',
                      }}
                    >
                      <Star size={15} fill={isFav ? 'currentColor' : 'none'} />
                    </button>
                    {/* Delete: admins any sheet, users their own */}
                    {cs.createdAt && (isAdmin || cs.contributorId === user?.id) && (
                      <button
                        onClick={() => handleDelete(cs.id)}
                        title="Delete cheatsheet"
                        style={{
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          color: 'var(--text-tertiary)',
                          transition: 'color 0.15s ease',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--accent-rose)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-tertiary)'; }}
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Formula list */}
                <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {cs.formulas.map((formula, idx) => {
                    const uid = `${cs.id}-${idx}`;
                    return (
                      <div
                        key={idx}
                        style={{
                          background: 'var(--bg-secondary)',
                          border: '1px solid var(--border-primary)',
                          borderRadius: 'var(--radius-sm)',
                          padding: '8px 10px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: '8px',
                        }}
                      >
                        <code
                          style={{
                            fontFamily: "'Cascadia Code', 'Fira Code', monospace",
                            fontSize: '11px',
                            color: 'var(--accent-cyan)',
                            wordBreak: 'break-all',
                            lineHeight: '1.5',
                            flex: 1,
                          }}
                        >
                          {formula}
                        </code>
                        <button
                          className="btn-ghost"
                          onClick={() => handleCopy(formula, uid)}
                          style={{
                            padding: '4px 6px',
                            borderRadius: '4px',
                            flexShrink: 0,
                            color: copiedId === uid ? 'var(--accent-emerald)' : 'var(--text-tertiary)',
                            transition: 'color 0.15s ease',
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                          }}
                          title="Copy"
                        >
                          {copiedId === uid ? <Check size={12} /> : <Copy size={12} />}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
