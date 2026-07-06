import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Mail, Building2, GraduationCap, Users, MessageCircle, Radio } from 'lucide-react';
import { getAlumniAccounts, setOpenForTalk } from '../../utils/authStorage';
import { useAuth } from '../../context/AuthContext';

export default function AlumniDirectory() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [alumni, setAlumni] = useState(() => getAlumniAccounts());

  const isAlumniViewer = user?.role === 'alumni';
  const isGuest = user?.role === 'guest' || !user?.id;

  // Registered alumni (role === 'alumni'). Reloaded after the
  // "Open for Talk" toggle so the change reflects immediately.
  const refreshAlumni = () => setAlumni(getAlumniAccounts());

  const myOpenForTalk = alumni.find((a) => a.id === user?.id)?.openForTalk ?? false;

  const toggleMyAvailability = () => {
    const next = !myOpenForTalk;
    setOpenForTalk(user.id, next);
    refreshAlumni();
  };

  // Departments that actually have alumni, for the selector.
  const departments = useMemo(() => {
    const set = new Set(alumni.map((a) => a.department).filter(Boolean));
    return ['All', ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [alumni]);

  // Apply department + search filters.
  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return alumni.filter((a) => {
      const matchesDept = selectedDept === 'All' || a.department === selectedDept;
      const matchesSearch =
        !term ||
        a.name.toLowerCase().includes(term) ||
        a.company.toLowerCase().includes(term) ||
        a.designation.toLowerCase().includes(term) ||
        a.batch.toLowerCase().includes(term);
      return matchesDept && matchesSearch;
    });
  }, [alumni, selectedDept, searchTerm]);

  // Group by batch, then order groups so the OLDEST batch (smallest number) is
  // on top. Alumni without a batch number sink to the bottom.
  const batchGroups = useMemo(() => {
    const groups = new Map(); // batchNo -> { batchNo, label, members }
    for (const a of filtered) {
      const key = a.batchNo || 'NA';
      if (!groups.has(key)) {
        groups.set(key, {
          batchNo: a.batchNo ? Number(a.batchNo) : Infinity,
          label: a.batchNo ? `Batch ${a.batchNo}` : 'Batch not specified',
          members: [],
        });
      }
      groups.get(key).members.push(a);
    }
    return Array.from(groups.values()).sort((x, y) => x.batchNo - y.batchNo);
  }, [filtered]);

  const handleMessage = (al) => {
    if (isGuest) {
      navigate('/login');
      return;
    }
    navigate(`/messages?peer=${al.id}`);
  };

  return (
    <div className="glass-card-static alumni-container animate-fadeInUp">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <div>
          <h2 className="section-title" style={{ fontSize: 'var(--fs-lg)', margin: 0 }}>Alumni Corner</h2>
          <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-secondary)' }}>
            Registered AUST graduates, grouped by batch — oldest batches first
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            className="input"
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            style={{ padding: '8px 12px', minWidth: '160px' }}
          >
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept === 'All' ? 'All Departments' : dept}
              </option>
            ))}
          </select>

          <div className="search-box" style={{ width: '220px' }}>
            <input
              type="text"
              placeholder="Search by name / company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Alumni self-service: toggle availability for direct messages. */}
      {isAlumniViewer && (
        <div
          className="open-for-talk-banner"
          style={{
            borderColor: myOpenForTalk ? 'var(--accent-cyan)' : 'var(--border-primary)',
            background: myOpenForTalk ? 'var(--accent-cyan-glow)' : 'var(--bg-input)',
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="open-for-talk-icon"
              style={{
                background: myOpenForTalk ? 'var(--accent-cyan)' : 'var(--bg-secondary)',
                color: myOpenForTalk ? '#fff' : 'var(--text-tertiary)',
              }}
            >
              <Radio size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '14px', margin: 0, fontWeight: 700 }}>
                Open for Talk {myOpenForTalk ? 'ON' : 'OFF'}
              </h3>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
                {myOpenForTalk
                  ? 'Students and other alumni can message you directly from this directory.'
                  : 'Turn this on so others can message you from the Alumni Directory.'}
              </p>
            </div>
          </div>
          <div
            className={`toggle-switch ${myOpenForTalk ? 'active' : ''}`}
            onClick={toggleMyAvailability}
            role="switch"
            aria-checked={myOpenForTalk}
            aria-label="Toggle Open for Talk"
          />
        </div>
      )}

      {alumni.length === 0 ? (
        <div className="empty-state" style={{ padding: '48px 16px', textAlign: 'center' }}>
          <GraduationCap size={40} style={{ opacity: 0.5 }} />
          <h3 style={{ fontSize: 'var(--fs-md)', marginTop: '12px' }}>No alumni registered yet</h3>
          <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-secondary)' }}>
            Alumni who sign up with an alumni account will appear here, grouped by batch.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state" style={{ padding: '48px 16px', textAlign: 'center' }}>
          <Search size={36} style={{ opacity: 0.5 }} />
          <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-secondary)', marginTop: '8px' }}>
            No alumni match your filters.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {batchGroups.map((group) => (
            <div key={group.label}>
              {/* Batch header */}
              <div
                className="flex items-center gap-2 mb-3"
                style={{ borderBottom: '1px solid var(--border-primary)', paddingBottom: '8px' }}
              >
                <span className="badge badge-cyan" style={{ fontSize: '12px', padding: '4px 10px' }}>
                  {group.label}
                </span>
                <span className="flex items-center gap-1" style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                  <Users size={12} /> {group.members.length} alumni
                </span>
              </div>

              {/* Alumni cards for this batch */}
              <div className="grid-3">
                {group.members.map((al) => {
                  const isMe = al.id === user?.id;
                  const canMessage = al.openForTalk && !isMe && !isGuest;
                  return (
                    <div
                      key={al.id}
                      className="glass-card"
                      style={{
                        padding: '16px 20px',
                        background: 'var(--bg-input)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                      }}
                    >
                      <div className="flex gap-3 items-start">
                        <div className="avatar" style={{ width: '40px', height: '40px', flexShrink: 0 }}>
                          {al.initials}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <h3 style={{ fontSize: '15px', fontWeight: 'bold', margin: 0 }}>
                            {al.name}
                            {isMe && (
                              <span className="badge badge-cyan" style={{ fontSize: '9px', marginLeft: '6px', padding: '1px 6px' }}>
                                You
                              </span>
                            )}
                          </h3>
                          <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', margin: 0 }}>
                            {al.department}
                            {al.graduationYear ? ` · Class of ${al.graduationYear}` : ''}
                          </p>
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                        {al.designation && (
                          <span className="flex items-center gap-1.5">
                            <GraduationCap size={12} /> {al.designation}
                          </span>
                        )}
                        {al.company && (
                          <span className="flex items-center gap-1.5">
                            <Building2 size={12} /> {al.company}
                          </span>
                        )}
                        {al.email && (
                          <a
                            href={`mailto:${al.email}`}
                            className="flex items-center gap-1.5"
                            style={{ color: 'var(--accent-blue)', textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                          >
                            <Mail size={12} /> {al.email}
                          </a>
                        )}
                      </div>

                      <div className="flex items-center justify-between" style={{ gap: '8px' }}>
                        {al.openForTalk ? (
                          <span className="flex items-center gap-1" style={{ fontSize: '10px', color: 'var(--accent-cyan)', fontWeight: 600 }}>
                            <Radio size={11} /> Open for Talk
                          </span>
                        ) : (
                          <span style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>Not available</span>
                        )}

                        {canMessage ? (
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                            onClick={() => handleMessage(al)}
                          >
                            <MessageCircle size={13} /> Message
                          </button>
                        ) : isMe ? (
                          <span style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>Your profile</span>
                        ) : (
                          <span style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>Messaging off</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
