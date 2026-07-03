import React, { useState, useMemo } from 'react';
import { Search, Code, Copy, Check } from 'lucide-react';
import { cheatsheets } from '../../data/mockData';

export default function Cheatsheets({ vaultContext }) {
  const { course, courseName } = vaultContext;
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  const filteredCheatsheets = useMemo(() => {
    return cheatsheets
      .filter((cs) => !course || !cs.course || cs.course === course)
      .filter(
        (cs) =>
          cs.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          cs.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
          cs.formulas.some((f) => f.toLowerCase().includes(searchTerm.toLowerCase())),
      );
  }, [course, searchTerm]);

  const handleCopy = (formulaText, uniqueId) => {
    navigator.clipboard.writeText(formulaText);
    setCopiedId(uniqueId);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="glass-card-static cheatsheets-container animate-fadeInUp">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <div>
          <h2 className="section-title" style={{ fontSize: 'var(--fs-lg)', margin: 0 }}>Cheatsheets</h2>
          <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-secondary)' }}>
            {courseName} — quick formula sheets and references
          </p>
        </div>

        <div className="search-box" style={{ width: '240px' }}>
          <input
            type="text"
            placeholder="Search cheatsheets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {filteredCheatsheets.length === 0 ? (
        <div className="empty-state" style={{ padding: '32px 16px', textAlign: 'center' }}>
          <Code size={32} style={{ color: 'var(--text-tertiary)', marginBottom: '12px' }} />
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--fs-sm)', margin: 0 }}>
            No cheatsheets available for {courseName} yet.
          </p>
        </div>
      ) : (
        <div className="grid-2">
          {filteredCheatsheets.map((cs) => (
            <div
              key={cs.id}
              className="glass-card"
              style={{
                padding: '16px 20px',
                background: 'var(--bg-input)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 style={{ fontSize: '15px', fontWeight: 'var(--fw-bold)' }}>{cs.title}</h3>
                  <span className="badge badge-purple" style={{ fontSize: '10px' }}>
                    {cs.category}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {cs.formulas.map((formula, idx) => {
                    const uniqueId = `${cs.id}-${idx}`;
                    const isCopied = copiedId === uniqueId;

                    return (
                      <div
                        key={idx}
                        style={{
                          background: 'var(--bg-secondary)',
                          border: '1px solid var(--border-primary)',
                          borderRadius: 'var(--radius-sm)',
                          padding: '10px 12px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: '12px',
                        }}
                      >
                        <code
                          style={{
                            fontFamily: 'monospace',
                            fontSize: '11px',
                            color: 'var(--accent-cyan)',
                            wordBreak: 'break-all',
                          }}
                        >
                          {formula}
                        </code>
                        <button
                          className="btn-ghost"
                          onClick={() => handleCopy(formula, uniqueId)}
                          style={{
                            padding: '4px',
                            borderRadius: '4px',
                            flexShrink: 0,
                            color: isCopied ? 'var(--accent-emerald)' : 'var(--text-tertiary)',
                          }}
                        >
                          {isCopied ? <Check size={12} /> : <Copy size={12} />}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
