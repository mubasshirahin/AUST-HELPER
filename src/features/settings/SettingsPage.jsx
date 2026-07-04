import { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useRoutine } from '../../context/RoutineContext';
import { Camera, CheckCircle, Pencil, Settings, User, Bell, Info, Save, BellOff, BellRing, Clock, AlertTriangle, ShieldCheck, GraduationCap, Users, Send, CheckCircle2, Clock3, Moon, Sun, Newspaper, Terminal, Sparkles } from 'lucide-react';
import AboutUs from './AboutUs';
import { useNotifications } from '../../hooks/useNotifications';
import { submitRoleApplication, getApplicationsByUserId, getUserApplicationStatus } from '../../utils/authStorage';
import './SettingsPage.css';

const departments = ['CSE', 'EEE', 'CE', 'ME', 'IPE', 'TE', 'ARCH', 'BBA'];
const juniorBatchByDepartment = {
  CSE: 55,
  EEE: 55,
  CE: 55,
  BBA: 55,
  ARCH: 55,
  TE: 45,
  IPE: 35,
  ME: 29,
};
const yearSemesters = [
  'Year 1 - Semester 1',
  'Year 1 - Semester 2',
  'Year 2 - Semester 1',
  'Year 2 - Semester 2',
  'Year 3 - Semester 1',
  'Year 3 - Semester 2',
  'Year 4 - Semester 1',
  'Year 4 - Semester 2',
];
const sections = ['A', 'B', 'C'];
const quickProfileFields = ['department', 'batch', 'yearSemester', 'section', 'labSection'];

const getLabSectionOptions = (section) => {
  if (!section) return [];
  return [`${section}1`, `${section}2`];
};

const getBatchOptions = (department) => {
  const juniorBatch = juniorBatchByDepartment[department];
  if (!juniorBatch) return [];

  return Array.from({ length: juniorBatch }, (_, index) => {
    const batchNo = index + 1;
    const batchName = String(batchNo);

    return {
      label: batchName,
      batchName,
      batchNo: String(batchNo),
    };
  });
};

const getYearSemesterShortName = (yearSemester) => {
  const match = yearSemester.match(/Year (\d+) - Semester (\d+)/);
  return match ? `${match[1]}.${match[2]}` : yearSemester;
};

const getInitials = (name) => {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  return initials || 'ST';
};

const getYearSemesterFromSemester = (semester) => {
  if (!semester) return '';
  const year = Math.ceil(Number(semester) / 2);
  const term = Number(semester) % 2 === 0 ? 2 : 1;
  return `Year ${year} - Semester ${term}`;
};

const getBatchNoFromUser = (user) => {
  if (user.batchNo) return String(user.batchNo);
  const batchDigits = String(user.batch || '').match(/\d+/)?.[0];
  return batchDigits || '';
};

const getBatchDisplayName = (batchName, batchNo) => {
  if (!batchNo) return batchName || 'Not selected';
  const cleanBatchName = String(batchName || '').trim();

  if (cleanBatchName && cleanBatchName !== String(batchNo)) {
    return `${cleanBatchName.toUpperCase()}-${batchNo}`;
  }

  return `BATCH ${batchNo}`;
};

const themeOptions = [
  { id: 'dark', label: 'Dark', desc: 'Dark Mode standard', icon: Moon },
  { id: 'light', label: 'Light', desc: 'Light Mode standard', icon: Sun },
  { id: 'newsprint', label: 'Newsprint', desc: 'Editorial ink-on-paper', icon: Newspaper },
  { id: 'cyberpunk', label: 'Cyberpunk', desc: 'Neon-noir / glitch terminal', icon: Terminal },
  { id: 'maximalism', label: 'Maximalism', desc: 'Dopamine / Y2K hyperpop', icon: Sparkles },
];

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { user, isAuthenticated, updateUser } = useAuth();
  const { routine, weekDays } = useRoutine();
  const { supported, permission, settings: notifSettings, enable: enableNotifs, disable: disableNotifs, updateSetting } = useNotifications(routine, weekDays);

  const [activeSubTab, setActiveSubTab] = useState('profile');
  const [roleApplicationForm, setRoleApplicationForm] = useState({ appliedRole: 'cr' });
  const [applicationStatus, setApplicationStatus] = useState(null);
  const [userApplications, setUserApplications] = useState([]);
  const [applicationMessage, setApplicationMessage] = useState('');
  const [submittingApplication, setSubmittingApplication] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [notifEnabling, setNotifEnabling] = useState(false);
  const [notifMsg, setNotifMsg] = useState('');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  
  // Telegram notification settings
  const [telegramEnabled, setTelegramEnabled] = useState(() => {
    const saved = localStorage.getItem('telegram_notifications_enabled');
    return saved === 'true';
  });
  const [telegramChatId, setTelegramChatId] = useState(() => {
    return localStorage.getItem('telegram_chat_id') || '';
  });
  const [telegramTesting, setTelegramTesting] = useState(false);
  const [telegramMsg, setTelegramMsg] = useState('');
  const [isTelegramRegistered, setIsTelegramRegistered] = useState(() => {
    const saved = localStorage.getItem('telegram_is_registered');
    if (saved === 'true') return true;
    if (saved === 'false') return false;
    return null; // null = checking, false = not registered, true = registered
  });
  
  // Webhook status
  const [webhookInfo, setWebhookInfo] = useState(null);
  const [webhookLoading, setWebhookLoading] = useState(false);
  
  // Fetch webhook info on mount
  useEffect(() => {
    const fetchWebhookInfo = async () => {
      setWebhookLoading(true);
      try {
        const response = await fetch('/api/telegram/webhook-info');
        const result = await response.json();
        setWebhookInfo(result);
      } catch (err) {
        console.error('Failed to fetch webhook info:', err);
      } finally {
        setWebhookLoading(false);
      }
    };
    fetchWebhookInfo();
  }, []);

  // Persist Telegram settings to localStorage
  useEffect(() => {
    localStorage.setItem('telegram_notifications_enabled', telegramEnabled.toString());
  }, [telegramEnabled]);

  useEffect(() => {
    localStorage.setItem('telegram_chat_id', telegramChatId);
  }, [telegramChatId]);

  useEffect(() => {
    if (isTelegramRegistered !== null) {
      localStorage.setItem('telegram_is_registered', isTelegramRegistered.toString());
    }
  }, [isTelegramRegistered]);

  // Load application status on mount
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      const status = getUserApplicationStatus(user.id);
      setApplicationStatus(status);
      const applications = getApplicationsByUserId(user.id);
      setUserApplications(applications);
    }
  }, [isAuthenticated, user?.id]);
  const initialBatchNo = getBatchNoFromUser(user);
  const [profileDetails, setProfileDetails] = useState({
    id: user.id || '',
    name: user.name || '',
    email: user.email || '',
    avatar: user.avatar || '',
  });
  const [quickProfile, setQuickProfile] = useState({
    department: user.department || '',
    batchName: user.batchName || initialBatchNo || user.batch || '',
    batchNo: initialBatchNo,
    batchCustomName: '',
    yearSemester: user.yearSemester || getYearSemesterFromSemester(user.semester),
    section: user.section || '',
    labSection: user.labSection || '',
  });

  const resetProfileDrafts = () => {
    const nextBatchNo = getBatchNoFromUser(user);
    setProfileDetails({
      id: user.id || '',
      name: user.name || '',
      email: user.email || '',
      avatar: user.avatar || '',
    });
    setQuickProfile({
      department: user.department || '',
      batchName: user.batchName || nextBatchNo || user.batch || '',
      batchNo: nextBatchNo,
      batchCustomName: '',
      yearSemester: user.yearSemester || getYearSemesterFromSemester(user.semester),
      section: user.section || '',
      labSection: user.labSection || '',
    });
    setSaveMessage('');
  };

  const toggleProfileEditing = () => {
    if (isEditingProfile) {
      resetProfileDrafts();
    }
    setIsEditingProfile((current) => !current);
  };

  const updateQuickProfileField = (field, value) => {
    setQuickProfile((currentProfile) => {
      const fieldIndex = quickProfileFields.indexOf(field);
      const nextProfile = {
        ...currentProfile,
      };

      if (field === 'batch') {
        nextProfile.batchName = value.batchName;
        nextProfile.batchNo = value.batchNo;
        nextProfile.batchCustomName = '';
      } else {
        nextProfile[field] = value;
      }

      quickProfileFields.slice(fieldIndex + 1).forEach((nextField) => {
        if (nextField === 'batch') {
          nextProfile.batchName = '';
          nextProfile.batchNo = '';
        } else {
          nextProfile[nextField] = '';
        }
      });

      return nextProfile;
    });
  };

  const quickProfileReady = Boolean(
    quickProfile.department &&
    quickProfile.batchName &&
    quickProfile.batchNo &&
    quickProfile.yearSemester &&
    quickProfile.section
  );

  const profileDetailsReady = Boolean(profileDetails.id.trim() && profileDetails.name.trim() && profileDetails.email.trim());
  const allChangesReady = profileDetailsReady && quickProfileReady;

  const updateProfileDetailsField = (field, value) => {
    setProfileDetails((currentDetails) => ({
      ...currentDetails,
      [field]: value,
    }));
  };

  const handleRoleApplication = async (e) => {
    e.preventDefault();
    if (!isAuthenticated || !user?.id) {
      setApplicationMessage('Please login to apply.');
      return;
    }

    // Validate target selection
    if (roleApplicationForm.appliedRole === 'cr' && !roleApplicationForm.targetLabSection) {
      setApplicationMessage('Please select a lab group for CR application.');
      return;
    }
    if (roleApplicationForm.appliedRole === 'sr' && !roleApplicationForm.targetSection) {
      setApplicationMessage('Please select a section for SR application.');
      return;
    }

    setSubmittingApplication(true);
    try {
      await submitRoleApplication({
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        department: user.department,
        batch: user.batch,
        appliedRole: roleApplicationForm.appliedRole,
        targetLabSection: roleApplicationForm.targetLabSection,
        targetSection: roleApplicationForm.targetSection,
        statement: '',
      });
      setApplicationMessage('Application submitted successfully! Admin will review it soon.');
      setRoleApplicationForm({ appliedRole: 'cr', targetLabSection: '', targetSection: '' });
      
      // Refresh status
      const status = getUserApplicationStatus(user.id);
      setApplicationStatus(status);
      const applications = getApplicationsByUserId(user.id);
      setUserApplications(applications);
    } catch (err) {
      setApplicationMessage(err.message || 'Failed to submit application.');
    } finally {
      setSubmittingApplication(false);
      setTimeout(() => setApplicationMessage(''), 5000);
    }
  };

  const handleProfileImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      updateProfileDetailsField('avatar', reader.result);
    };
    reader.readAsDataURL(file);
  };

  const saveAllChanges = () => {
    if (!allChangesReady) return;

    if (!isAuthenticated) {
      setSaveMessage('Login to save your profile');
      window.setTimeout(() => setSaveMessage(''), 2200);
      return;
    }

    const nextName = profileDetails.name.trim();
    const finalBatchName = quickProfile.batchCustomName.trim() || quickProfile.batchName;

    updateUser({
      id: profileDetails.id.trim(),
      name: nextName,
      email: profileDetails.email.trim(),
      avatar: profileDetails.avatar,
      initials: getInitials(nextName),
      department: quickProfile.department,
      batch: finalBatchName,
      batchName: finalBatchName,
      batchNo: quickProfile.batchNo,
      yearSemester: quickProfile.yearSemester,
      section: quickProfile.section,
      labSection: quickProfile.labSection,
    });
    setSaveMessage('Saved');
    setIsEditingProfile(false);
    window.setTimeout(() => setSaveMessage(''), 1800);
  };

  const visibleBatchName = getBatchDisplayName(
    quickProfile.batchCustomName.trim() || quickProfile.batchName || user.batch,
    quickProfile.batchNo
  );

  const quickChangeSteps = [
    { label: 'Department', field: 'department', options: departments, visible: true },
    { label: 'Batch', field: 'batch', options: getBatchOptions(quickProfile.department), visible: Boolean(quickProfile.department) },
    { label: 'Year-Sem', field: 'yearSemester', options: yearSemesters, visible: Boolean(quickProfile.batchNo) },
    { label: 'Section', field: 'section', options: sections, visible: Boolean(quickProfile.yearSemester) },
    { label: 'Lab Section', field: 'labSection', options: getLabSectionOptions(quickProfile.section), visible: Boolean(quickProfile.section) },
  ];

  const renderOptionGroup = (label, field, options) => {
    const isBatchField = field === 'batch';

    return (
    <div className={`quick-option-group ${isBatchField ? 'batch-option-group' : ''}`}>
      <span>{label}</span>
      <div className={`quick-option-grid ${field === 'yearSemester' ? 'wide-options' : ''} ${isBatchField ? 'batch-option-slider' : ''}`}>
        {options.map((option) => {
          const optionLabel = field === 'yearSemester'
            ? getYearSemesterShortName(option)
            : typeof option === 'string'
              ? option
              : option.label;
          const value = option;
          const selected = field === 'batch'
            ? quickProfile.batchNo === option.batchNo
            : quickProfile[field] === value;

          return (
            <button
              key={optionLabel}
              type="button"
              className={`quick-option ${selected ? 'selected' : ''}`}
              aria-pressed={selected}
              onClick={() => updateQuickProfileField(field, value)}
            >
              {optionLabel}
            </button>
          );
        })}
      </div>
      {isBatchField && quickProfile.batchNo && (
        <label className="batch-name-field">
          <span>Batch Name <em>Optional</em></span>
          <input
            type="text"
            className="input"
            value={quickProfile.batchCustomName}
            placeholder={`Default: ${quickProfile.batchName}`}
            onChange={(event) => setQuickProfile((currentProfile) => ({
              ...currentProfile,
              batchCustomName: event.target.value,
            }))}
          />
        </label>
      )}
    </div>
    );
  };

  return (
    <div className="settings-page animate-fadeIn">
      <div className="settings-header">
        <h1 className="page-title">Portal Settings</h1>
        <p className="page-description">Manage user preferences, toggle modes, configure WhatsApp bots, and view about notes.</p>
      </div>

      <div className="grid-2" style={{ gridTemplateColumns: '0.8fr 2.2fr' }}>
        
        {/* Left Side: Sidebar options */}
        <div className="glass-card-static" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)', padding: '12px', height: 'fit-content' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <button 
              onClick={() => setActiveSubTab('profile')}
              className={`settings-nav-item ${activeSubTab === 'profile' ? 'active' : ''}`}
            >
              <User size={16} /> Student Profile
            </button>
            <button 
              onClick={() => setActiveSubTab('theme')}
              className={`settings-nav-item ${activeSubTab === 'theme' ? 'active' : ''}`}
            >
              <Settings size={16} /> Display & Theme
            </button>
            <button 
              onClick={() => setActiveSubTab('notifications')}
              className={`settings-nav-item ${activeSubTab === 'notifications' ? 'active' : ''}`}
            >
              <Bell size={16} /> Notifications
            </button>
            <button 
              onClick={() => setActiveSubTab('about')}
              className={`settings-nav-item ${activeSubTab === 'about' ? 'active' : ''}`}
            >
              <Info size={16} /> About Us
            </button>
            {isAuthenticated && (user?.role === 'student') && (
              <button 
                onClick={() => setActiveSubTab('roleApplication')}
                className={`settings-nav-item ${activeSubTab === 'roleApplication' ? 'active' : ''}`}
              >
                <GraduationCap size={16} /> Apply for CR/SR
              </button>
            )}
          </div>
        </div>

        {/* Right Side: Tab Panel Content */}
        <div className="glass-card-static settings-panel">
          {activeSubTab === 'profile' && (
            <div className="animate-fadeIn">
              <div className="profile-panel-header">
                <div>
                  <h3>Student Profile</h3>
                  <p>Update your identity and academic info together.</p>
                </div>
                <div className="profile-save-actions">
                  {saveMessage && (
                    <span className="save-status">
                      <CheckCircle size={14} /> {saveMessage}
                    </span>
                  )}
                  <button className="btn btn-secondary btn-sm" onClick={toggleProfileEditing}>
                    <Pencil size={14} /> {isEditingProfile ? 'Cancel' : 'Edit'}
                  </button>
                </div>
              </div>
              
              <div className="profile-content-stack">
                <div className="profile-editor">
                  <label className={`profile-photo-picker ${!isEditingProfile ? 'is-locked' : ''}`}>
                    {isEditingProfile && <input type="file" accept="image/*" onChange={handleProfileImageUpload} />}
                    <span className="avatar xl profile-photo-preview">
                      {profileDetails.avatar ? (
                        <img src={profileDetails.avatar} alt="Profile preview" />
                      ) : (
                        getInitials(profileDetails.name)
                      )}
                    </span>
                    {isEditingProfile && (
                      <span className="profile-photo-action">
                        <Camera size={14} />
                      </span>
                    )}
                  </label>
                  <div>
                    <h4 style={{ fontSize: 'var(--fs-lg)', fontWeight: 'bold' }}>{profileDetails.name || user.name}</h4>
                    <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-secondary)' }}>ID: {profileDetails.id || user.id}</p>
                  </div>
                </div>

                {isEditingProfile ? (
                  <div className="profile-details-form">
                    <div className="profile-details-stack">
                      <label>
                        <span>Student ID</span>
                        <input
                          type="text"
                          value={profileDetails.id}
                          onChange={(event) => updateProfileDetailsField('id', event.target.value)}
                          className="input mt-1"
                        />
                      </label>
                      <label>
                        <span>Email Address</span>
                        <input
                          type="email"
                          value={profileDetails.email}
                          onChange={(event) => updateProfileDetailsField('email', event.target.value)}
                          className="input mt-1"
                        />
                      </label>
                    </div>
                    <label>
                      <span>Name</span>
                      <input
                        type="text"
                        value={profileDetails.name}
                        onChange={(event) => updateProfileDetailsField('name', event.target.value)}
                        className="input mt-1"
                      />
                    </label>
                  </div>
                ) : (
                  <div className="profile-read-grid">
                    <div>
                      <span>Student ID</span>
                      <strong>{profileDetails.id || 'Not set'}</strong>
                      <span className="profile-read-sub-label">Email</span>
                      <strong>{profileDetails.email || 'Not set'}</strong>
                    </div>
                    <div>
                      <span>Name</span>
                      <strong>{profileDetails.name || 'Not set'}</strong>
                    </div>
                  </div>
                )}

                <div className="profile-summary-grid">
                  <div>
                    <span>Department</span>
                    <strong>{quickProfile.department || 'Not selected'}</strong>
                  </div>
                  <div>
                    <span>Batch</span>
                    <strong>{visibleBatchName}</strong>
                  </div>
                  <div>
                    <span>Section</span>
                    <strong>{quickProfile.section || 'Not selected'}</strong>
                  </div>
                  <div>
                    <span>Lab Group</span>
                    <strong>{quickProfile.labSection || 'Not selected'}</strong>
                  </div>
                  <div>
                    <span>Year-Sem</span>
                    <strong>{quickProfile.yearSemester ? getYearSemesterShortName(quickProfile.yearSemester) : 'Not selected'}</strong>
                  </div>
                </div>

                {isEditingProfile && (
                  <div className="settings-quick-change">
                    <div className="quick-change-header">
                      <h4>Academic Details</h4>
                      <p>Choose the fields you want to change, then save once below.</p>
                    </div>

                    <div className="quick-change-stack">
                      {quickChangeSteps
                        .filter((step) => step.visible)
                        .map((step) => renderOptionGroup(step.label, step.field, step.options))}
                    </div>
                  </div>
                )}

                {isEditingProfile && (
                  <div className="profile-bottom-actions">
                    <button className="btn btn-primary" onClick={saveAllChanges} disabled={!allChangesReady}>
                      <Save size={16} /> Save Changes
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeSubTab === 'theme' && (
            <div className="animate-fadeIn">
              <h3 style={{ fontSize: 'var(--fs-md)', fontWeight: 'bold', marginBottom: '16px' }}>Theme Configurations</h3>

              <div className="p-4" style={{ background: 'var(--bg-input)', borderRadius: 'var(--radius-lg)' }}>
                <div style={{ marginBottom: '14px' }}>
                  <h4 style={{ fontSize: 'var(--fs-sm)', fontWeight: 'bold' }}>Interface Theme</h4>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    Current: {themeOptions.find((t) => t.id === theme)?.desc || 'Dark Mode standard'}
                  </p>
                </div>

                <div
                  role="radiogroup"
                  aria-label="Interface theme"
                  className="grid-3"
                  style={{ gap: 'var(--sp-3)' }}
                >
                  {themeOptions.map(({ id, label, desc, icon: Icon }) => {
                    const isActive = theme === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        role="radio"
                        aria-checked={isActive}
                        onClick={() => setTheme(id)}
                        className="flex flex-col items-start gap-2 p-4"
                        style={{
                          textAlign: 'left',
                          borderRadius: 'var(--radius-md)',
                          border: `1px solid ${isActive ? 'var(--accent-blue)' : 'var(--border-primary)'}`,
                          background: isActive ? 'var(--accent-blue-glow)' : 'var(--bg-secondary)',
                          color: isActive ? 'var(--accent-blue)' : 'var(--text-primary)',
                          transition: 'all var(--transition-base)',
                        }}
                      >
                        <Icon size={18} />
                        <span style={{ fontSize: 'var(--fs-sm)', fontWeight: 'var(--fw-semibold)' }}>{label}</span>
                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.35 }}>{desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeSubTab === 'notifications' && (
            <div className="animate-fadeIn" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <h3 style={{ fontSize: 'var(--fs-md)', fontWeight: 'bold', marginBottom: '4px' }}>Browser Notifications</h3>
                <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-secondary)' }}>
                  Get browser alerts before your next class starts or when a deadline is approaching.
                </p>
              </div>

              {!supported && (
                <div className="flex items-center gap-3 p-4" style={{ background: 'var(--accent-rose-glow)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--accent-rose)' }}>
                  <AlertTriangle size={18} style={{ color: 'var(--accent-rose)', flexShrink: 0 }} />
                  <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--accent-rose)' }}>Your browser does not support notifications.</p>
                </div>
              )}

              {supported && permission === 'denied' && (
                <div className="flex items-center gap-3 p-4" style={{ background: 'var(--accent-rose-glow)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--accent-rose)' }}>
                  <BellOff size={18} style={{ color: 'var(--accent-rose)', flexShrink: 0 }} />
                  <div>
                    <p style={{ fontSize: 'var(--fs-xs)', fontWeight: 'bold', color: 'var(--accent-rose)' }}>Notifications blocked by browser</p>
                    <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>Go to your browser site settings and allow notifications for this site, then reload.</p>
                  </div>
                </div>
              )}

              {supported && permission !== 'denied' && (
                <>
                  <div className="flex justify-between items-center p-4" style={{ background: 'var(--bg-input)', borderRadius: 'var(--radius-lg)' }}>
                    <div className="flex items-center gap-3">
                      {notifSettings.enabled && permission === 'granted'
                        ? <BellRing size={20} style={{ color: 'var(--accent-emerald)' }} />
                        : <BellOff size={20} style={{ color: 'var(--text-tertiary)' }} />
                      }
                      <div>
                        <h4 style={{ fontSize: 'var(--fs-sm)', fontWeight: 'bold' }}>Enable smart reminders</h4>
                        <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                          {permission === 'granted'
                            ? notifSettings.enabled ? 'Active — reminders running in background' : 'Permission granted — click to enable'
                            : 'Browser will ask for permission when you enable'}
                        </p>
                      </div>
                    </div>
                    <div
                      className={`toggle-switch ${notifSettings.enabled && permission === 'granted' ? 'active' : ''}`}
                      onClick={async () => {
                        if (notifSettings.enabled) {
                          disableNotifs();
                          setNotifMsg('Reminders disabled.');
                        } else {
                          setNotifEnabling(true);
                          const result = await enableNotifs();
                          setNotifEnabling(false);
                          if (result === 'granted') setNotifMsg('Reminders enabled! You\'ll get alerts before classes and deadlines.');
                          else if (result === 'denied') setNotifMsg('Permission denied. Allow notifications in browser settings.');
                          else setNotifMsg('Permission not granted.');
                        }
                        setTimeout(() => setNotifMsg(''), 3500);
                      }}
                      style={{ opacity: notifEnabling ? 0.6 : 1, cursor: notifEnabling ? 'not-allowed' : 'pointer' }}
                    />
                  </div>

                  {notifMsg && (
                    <p className="animate-fadeIn" style={{ fontSize: 'var(--fs-xs)', color: permission === 'granted' ? 'var(--accent-emerald)' : 'var(--accent-rose)', padding: '0 4px' }}>
                      {notifMsg}
                    </p>
                  )}
                </>
              )}

              {supported && notifSettings.enabled && permission === 'granted' && (
                <div className="animate-fadeIn" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ height: '1px', background: 'var(--border-primary)' }} />
                  <h4 style={{ fontSize: 'var(--fs-sm)', fontWeight: 'bold', color: 'var(--text-secondary)' }}>Reminder Settings</h4>

                  <div className="flex justify-between items-center p-4" style={{ background: 'var(--bg-input)', borderRadius: 'var(--radius-lg)' }}>
                    <div className="flex items-center gap-3">
                      <Clock size={16} style={{ color: 'var(--accent-blue)' }} />
                      <div>
                        <h4 style={{ fontSize: 'var(--fs-xs)', fontWeight: 'bold' }}>Class reminders</h4>
                        <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Alert before class starts</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className={`toggle-switch ${notifSettings.notifyClass ? 'active' : ''}`}
                        onClick={() => updateSetting('notifyClass', !notifSettings.notifyClass)}
                      />
                    </div>
                  </div>

                  {notifSettings.notifyClass && (
                    <div className="animate-fadeIn p-4" style={{ background: 'var(--bg-input)', borderRadius: 'var(--radius-lg)' }}>
                      <label style={{ fontSize: 'var(--fs-xs)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <span style={{ fontWeight: 'bold' }}>Alert me <strong style={{ color: 'var(--accent-blue)' }}>{notifSettings.classReminderMins} minutes</strong> before class</span>
                        <input
                          type="range"
                          min={5} max={30} step={5}
                          value={notifSettings.classReminderMins}
                          onChange={(e) => updateSetting('classReminderMins', Number(e.target.value))}
                          style={{ width: '100%', accentColor: 'var(--accent-blue)' }}
                        />
                        <div className="flex justify-between" style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>
                          <span>5 min</span><span>10 min</span><span>15 min</span><span>20 min</span><span>25 min</span><span>30 min</span>
                        </div>
                      </label>
                    </div>
                  )}

                  <div className="flex justify-between items-center p-4" style={{ background: 'var(--bg-input)', borderRadius: 'var(--radius-lg)' }}>
                    <div className="flex items-center gap-3">
                      <AlertTriangle size={16} style={{ color: 'var(--accent-amber)' }} />
                      <div>
                        <h4 style={{ fontSize: 'var(--fs-xs)', fontWeight: 'bold' }}>Deadline reminders</h4>
                        <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Alert for upcoming assignments & exams</p>
                      </div>
                    </div>
                    <div
                      className={`toggle-switch ${notifSettings.notifyDeadline ? 'active' : ''}`}
                      onClick={() => updateSetting('notifyDeadline', !notifSettings.notifyDeadline)}
                    />
                  </div>

                  {notifSettings.notifyDeadline && (
                    <div className="animate-fadeIn p-4" style={{ background: 'var(--bg-input)', borderRadius: 'var(--radius-lg)' }}>
                      <label style={{ fontSize: 'var(--fs-xs)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <span style={{ fontWeight: 'bold' }}>Alert me <strong style={{ color: 'var(--accent-amber)' }}>{notifSettings.deadlineReminderHours} hours</strong> before deadline</span>
                        <input
                          type="range"
                          min={6} max={48} step={6}
                          value={notifSettings.deadlineReminderHours}
                          onChange={(e) => updateSetting('deadlineReminderHours', Number(e.target.value))}
                          style={{ width: '100%', accentColor: 'var(--accent-amber)' }}
                        />
                        <div className="flex justify-between" style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>
                          <span>6h</span><span>12h</span><span>18h</span><span>24h</span><span>30h</span><span>36h</span><span>42h</span><span>48h</span>
                        </div>
                      </label>
                    </div>
                  )}

                  <div className="flex items-center gap-3 p-4" style={{ background: 'var(--accent-emerald-glow, rgba(52,211,153,0.08))', borderRadius: 'var(--radius-lg)', border: '1px solid var(--accent-emerald)' }}>
                    <ShieldCheck size={18} style={{ color: 'var(--accent-emerald)', flexShrink: 0 }} />
                    <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                      Reminders are checked every minute. Notifications only fire once per event and won't repeat.
                    </p>
                  </div>
                </div>
              )}

              <div style={{ height: '1px', background: 'var(--border-primary)', margin: '16px 0' }} />
              <h3 style={{ fontSize: 'var(--fs-sm)', fontWeight: 'bold', marginBottom: '4px' }}>Telegram Daily Notification</h3>
              <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                Receive daily class schedule notifications via Telegram at 8 AM.
              </p>
              
              <div className="flex justify-between items-center p-4" style={{ background: 'var(--bg-input)', borderRadius: 'var(--radius-lg)' }}>
                <div>
                  <h4 style={{ fontSize: 'var(--fs-sm)', fontWeight: 'bold' }}>Enable Telegram notifications</h4>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    Get tomorrow's class schedule every morning at 8 AM
                  </p>
                </div>
                <div
                  className={`toggle-switch ${telegramEnabled ? 'active' : ''}`}
                  onClick={() => setTelegramEnabled(!telegramEnabled)}
                />
              </div>

              {telegramEnabled && (
                <div className="animate-fadeIn" style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
                  <div>
                    <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Telegram Chat ID</span>
                    <input 
                      type="text"
                      value={telegramChatId} 
                      onChange={(e) => setTelegramChatId(e.target.value)} 
                      className="input" 
                      placeholder="Enter your Telegram Chat ID"
                    />
                    <p style={{ fontSize: '10px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                      Get your ID from <a href="https://t.me/userinfobot" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-blue)' }}>@userinfobot</a> on Telegram
                    </p>
                  </div>
                  
                  {/* Registration status indicator */}
                  {isTelegramRegistered !== null && (
                    <div className="p-3" style={{ 
                      background: isTelegramRegistered ? 'var(--accent-emerald-glow)' : 'var(--bg-input)', 
                      borderRadius: 'var(--radius-md)',
                      border: `1px solid ${isTelegramRegistered ? 'var(--accent-emerald)' : 'var(--border-primary)'}`
                    }}>
                      <p style={{ fontSize: '10px', color: isTelegramRegistered ? 'var(--accent-emerald)' : 'var(--text-tertiary)' }}>
                        {isTelegramRegistered 
                          ? '✅ You are registered for daily notifications' 
                          : '⭕ Not registered for notifications'}
                      </p>
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    {/* Register button */}
                    {!isTelegramRegistered ? (
                      <button 
                        className="btn btn-primary" 
                        onClick={async () => {
                          if (!telegramChatId) {
                            setTelegramMsg('❌ Please enter your Chat ID');
                            setTimeout(() => setTelegramMsg(''), 3000);
                            return;
                          }
                          
                          setTelegramTesting(true);
                          try {
                            const response = await fetch('/api/telegram/register', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ 
                                chatId: telegramChatId,
                                routine 
                              })
                            });
                            const result = await response.json();
                            if (result.success) {
                              setTelegramMsg('✅ Registered successfully! You will receive daily notifications at 8 AM.');
                              setIsTelegramRegistered(true);
                            } else {
                              setTelegramMsg('❌ Failed: ' + (result.error || 'Unknown error'));
                            }
                          } catch (err) {
                            setTelegramMsg('❌ Error: ' + err.message);
                          }
                          setTelegramTesting(false);
                          setTimeout(() => setTelegramMsg(''), 5000);
                        }}
                        disabled={telegramTesting}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                        <BellRing size={14} /> {telegramTesting ? 'Registering...' : 'Register for Notifications'}
                      </button>
                    ) : (
                      <button 
                        className="btn btn-secondary" 
                        onClick={async () => {
                          if (!window.confirm('Are you sure you want to stop receiving Telegram notifications?')) return;
                          
                          setTelegramTesting(true);
                          try {
                            const response = await fetch('/api/telegram/unregister', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ chatId: telegramChatId })
                            });
                            const result = await response.json();
                            if (result.success) {
                              setTelegramMsg('✅ You have been unsubscribed from notifications.');
                              setIsTelegramRegistered(false);
                            } else {
                              setTelegramMsg('❌ Failed: ' + (result.error || 'Unknown error'));
                            }
                          } catch (err) {
                            setTelegramMsg('❌ Error: ' + err.message);
                          }
                          setTelegramTesting(false);
                          setTimeout(() => setTelegramMsg(''), 5000);
                        }}
                        disabled={telegramTesting}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                        <BellOff size={14} /> Unsubscribe
                      </button>
                    )}
                    
                    {/* Test button for 8 AM notification */}
                    <button 
                      className="btn btn-ghost" 
                      onClick={async () => {
                        if (!telegramChatId) {
                          setTelegramMsg('❌ Please enter your Chat ID');
                          setTimeout(() => setTelegramMsg(''), 3000);
                          return;
                        }
                        
                        setTelegramTesting(true);
                        try {
                          const response = await fetch('/api/telegram/test', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ 
                              routine,
                              chatId: telegramChatId
                            })
                          });
                          const result = await response.json();
                          if (result.success) {
                            setTelegramMsg('✅ Test notification sent! You will receive the next 8 AM notification preview.');
                          } else {
                            setTelegramMsg('❌ Failed: ' + (result.error || 'Unknown error'));
                          }
                        } catch (err) {
                          setTelegramMsg('❌ Error: ' + err.message);
                        }
                        setTelegramTesting(false);
                        setTimeout(() => setTelegramMsg(''), 5000);
                      }}
                      disabled={telegramTesting}
                      style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                      title="Sends the notification that would be sent at the next 8 AM"
                    >
                      <Send size={14} /> Test (8 AM)
                    </button>
                    
                    {/* Test button for 9 PM Attendance notification */}
                    <button 
                      className="btn btn-ghost" 
                      onClick={async () => {
                        if (!telegramChatId) {
                          setTelegramMsg('❌ Please enter your Chat ID');
                          setTimeout(() => setTelegramMsg(''), 3000);
                          return;
                        }
                        
                        setTelegramTesting(true);
                        try {
                          const response = await fetch('/api/telegram/test-attendance', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ 
                              routine,
                              chatId: telegramChatId
                            })
                          });
                          const result = await response.json();
                          if (result.success) {
                            setTelegramMsg('✅ Test attendance message sent! You will receive the 9 PM attendance confirmation message with Yes/No buttons.');
                          } else {
                            setTelegramMsg('❌ Failed: ' + (result.error || 'Unknown error'));
                          }
                        } catch (err) {
                          setTelegramMsg('❌ Error: ' + err.message);
                        }
                        setTelegramTesting(false);
                        setTimeout(() => setTelegramMsg(''), 5000);
                      }}
                      disabled={telegramTesting}
                      style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                      title="Sends the attendance confirmation message that would be sent at 9 PM"
                    >
                      <Send size={14} /> Test (9 PM Attendance)
                    </button>
                  </div>
                  
                  {telegramMsg && (
                    <p style={{ fontSize: 'var(--fs-xs)', color: telegramMsg.includes('✅') ? 'var(--accent-emerald)' : 'var(--accent-rose)', padding: '4px' }}>
                      {telegramMsg}
                    </p>
                  )}
                  
                  {/* Webhook Status */}
                  <div className="p-3" style={{ 
                    background: webhookInfo?.ok ? 'var(--accent-emerald-glow)' : 'var(--accent-amber-glow)', 
                    borderRadius: 'var(--radius-md)',
                    border: `1px solid ${webhookInfo?.ok ? 'var(--accent-emerald)' : 'var(--accent-amber)'}`
                  }}>
                    <div className="flex items-center gap-2 mb-2">
                      {webhookLoading ? (
                        <span style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>Checking webhook status...</span>
                      ) : webhookInfo?.ok ? (
                        <>
                          <CheckCircle2 size={14} style={{ color: 'var(--accent-emerald)' }} />
                          <span style={{ fontSize: '10px', color: 'var(--accent-emerald)', fontWeight: 'bold' }}>Webhook is active</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle size={14} style={{ color: 'var(--accent-amber)' }} />
                          <span style={{ fontSize: '10px', color: 'var(--accent-amber)', fontWeight: 'bold' }}>Webhook not configured</span>
                        </>
                      )}
                    </div>
                    {webhookInfo?.ok && webhookInfo.result?.url && (
                      <p style={{ fontSize: '9px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                        URL: {webhookInfo.result.url}
                      </p>
                    )}
                    {!webhookInfo?.ok && (
                      <div style={{ marginTop: '8px' }}>
                        <p style={{ fontSize: '10px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                          For Telegram buttons to work, the webhook must be configured with a public HTTPS URL.
                        </p>
                        <div className="flex gap-2">
                          <button 
                            className="btn btn-sm btn-primary"
                            onClick={async () => {
                              // Instructions for setting up ngrok
                              setTelegramMsg('📝 Setup Instructions:\n\n1. Install ngrok: npm install -g ngrok\n2. Run: ngrok http 5174\n3. Copy the HTTPS URL from ngrok output\n4. Click "Set Webhook URL" below and paste the URL\n\nExample: https://abc123.ngrok.io/api/telegram/webhook');
                              setTimeout(() => setTelegramMsg(''), 10000);
                            }}
                            style={{ fontSize: '10px' }}
                          >
                            Show Setup Guide
                          </button>
                          <button 
                            className="btn btn-sm btn-secondary"
                            onClick={async () => {
                              const webhookUrl = prompt('Enter your ngrok webhook URL:\n\nExample: https://abc123.ngrok.io/api/telegram/webhook');
                              if (webhookUrl) {
                                try {
                                  const response = await fetch('/api/telegram/set-webhook', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ webhookUrl })
                                  });
                                  const result = await response.json();
                                  if (result.ok) {
                                    setTelegramMsg('✅ Webhook configured successfully! Buttons should now work.');
                                    // Refresh webhook info
                                    const infoResponse = await fetch('/api/telegram/webhook-info');
                                    const infoResult = await infoResponse.json();
                                    setWebhookInfo(infoResult);
                                  } else {
                                    setTelegramMsg('❌ Failed: ' + (result.description || 'Unknown error'));
                                  }
                                } catch (err) {
                                  setTelegramMsg('❌ Error: ' + err.message);
                                }
                                setTimeout(() => setTelegramMsg(''), 5000);
                              }
                            }}
                            style={{ fontSize: '10px' }}
                          >
                            Set Webhook URL
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-3" style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-secondary)' }}>
                    <p style={{ fontSize: '10px', color: 'var(--text-tertiary)', marginBottom: '8px' }}>
                      <strong>How it works:</strong>
                    </p>
                    <ol style={{ fontSize: '10px', color: 'var(--text-secondary)', paddingLeft: '16px', margin: 0 }}>
                      <li>Get your Chat ID from <a href="https://t.me/userinfobot" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-blue)' }}>@userinfobot</a> on Telegram</li>
                      <li>Enter your Chat ID above and click "Register for Notifications"</li>
                      <li>You'll receive a welcome message from our bot</li>
                      <li>Daily notifications will be sent at 8 AM</li>
                      <li style={{ marginTop: '4px', color: 'var(--accent-amber)' }}><strong>Important:</strong> For attendance buttons to work, the webhook must be configured with a public HTTPS URL (use ngrok for local testing)</li>
                    </ol>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeSubTab === 'about' && (
            <AboutUs />
          )}

          {activeSubTab === 'roleApplication' && isAuthenticated && (
            <div className="animate-fadeIn">
              <h3 style={{ fontSize: 'var(--fs-md)', fontWeight: 'bold', marginBottom: '4px' }}>Apply for CR / SR Position</h3>
              <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                Submit your application to become a Class Representative (CR) or Student Representative (SR). Admin will review and approve your application.
              </p>

              {applicationMessage && (
                <div className={`p-4 mb-4 ${applicationMessage.includes('success') || applicationMessage.includes('successfully') ? 'success' : 'error'}`} style={{ 
                  background: applicationMessage.includes('success') || applicationMessage.includes('successfully') ? 'var(--accent-emerald-glow)' : 'var(--accent-rose-glow)',
                  border: `1px solid ${applicationMessage.includes('success') || applicationMessage.includes('successfully') ? 'var(--accent-emerald)' : 'var(--accent-rose)'}`,
                  borderRadius: 'var(--radius-lg)',
                  fontSize: 'var(--fs-xs)',
                  color: applicationMessage.includes('success') || applicationMessage.includes('successfully') ? 'var(--accent-emerald)' : 'var(--accent-rose)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  {applicationMessage.includes('success') || applicationMessage.includes('successfully') ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                  {applicationMessage}
                </div>
              )}

              {/* Application Status */}
              {applicationStatus && (
                <div className="mb-6">
                  <h4 style={{ fontSize: 'var(--fs-sm)', fontWeight: 'bold', marginBottom: '12px' }}>Your Application Status</h4>
                  
                  {applicationStatus.hasActiveRole && (
                    <div className="p-4" style={{ background: 'var(--accent-emerald-glow)', border: '1px solid var(--accent-emerald)', borderRadius: 'var(--radius-lg)' }}>
                      <div className="flex items-center gap-3">
                        <CheckCircle2 size={20} style={{ color: 'var(--accent-emerald)' }} />
                        <div>
                          <p style={{ fontSize: 'var(--fs-sm)', fontWeight: 'bold', color: 'var(--accent-emerald)' }}>
                            You are currently a {applicationStatus.activeRole === 'cr' ? 'Class Representative (CR)' : 'Student Representative (SR)'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {applicationStatus.hasPending && !applicationStatus.hasActiveRole && (
                    <div className="p-4" style={{ background: 'var(--accent-amber-glow)', border: '1px solid var(--accent-amber)', borderRadius: 'var(--radius-lg)' }}>
                      <div className="flex items-center gap-3">
                        <Clock3 size={20} style={{ color: 'var(--accent-amber)' }} />
                        <div>
                          <p style={{ fontSize: 'var(--fs-sm)', fontWeight: 'bold', color: 'var(--accent-amber)' }}>Application Pending Review</p>
                          <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                            You applied for {applicationStatus.pendingApplication.appliedRole === 'cr' ? 'CR' : 'SR'} on {new Date(applicationStatus.pendingApplication.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {!applicationStatus.hasPending && !applicationStatus.hasActiveRole && (
                    <div className="p-4" style={{ background: 'var(--bg-input)', border: '1px solid var(--border-primary)', borderRadius: 'var(--radius-lg)' }}>
                      <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-tertiary)' }}>You don't have any pending or active applications.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Profile Completion Check */}
              {(!applicationStatus?.hasPending && !applicationStatus?.hasActiveRole) && !allChangesReady && (
                <div className="glass-card-static" style={{ border: '1px solid var(--accent-amber)', borderRadius: 'var(--radius-lg)', padding: '20px', background: 'var(--accent-amber-glow)' }}>
                  <div className="flex items-center gap-3 mb-3">
                    <AlertTriangle size={20} style={{ color: 'var(--accent-amber)' }} />
                    <h4 style={{ fontSize: 'var(--fs-sm)', fontWeight: 'bold', color: 'var(--accent-amber)' }}>Profile Incomplete</h4>
                  </div>
                  <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                    Before applying for CR/SR, you must complete your profile with all academic details including <strong>Section</strong> and <strong>Lab Group</strong>.
                  </p>
                  <button 
                    className="btn btn-primary btn-sm" 
                    onClick={() => setActiveSubTab('profile')}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Pencil size={14} /> Complete Your Profile
                  </button>
                </div>
              )}

              {/* Application Form */}
              {(!applicationStatus?.hasPending && !applicationStatus?.hasActiveRole) && allChangesReady && (
                <form onSubmit={handleRoleApplication} className="glass-card-static" style={{ border: '1px solid var(--border-primary)', borderRadius: 'var(--radius-lg)', padding: '20px' }}>
                  <div className="mb-6">
                    <label style={{ fontSize: 'var(--fs-sm)', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Apply for Position</label>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        className={`btn flex-1 ${roleApplicationForm.appliedRole === 'cr' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setRoleApplicationForm({ ...roleApplicationForm, appliedRole: 'cr', targetLabSection: '', targetSection: '' })}
                      >
                        <Users size={16} /> Class Representative (CR)
                      </button>
                      <button
                        type="button"
                        className={`btn flex-1 ${roleApplicationForm.appliedRole === 'sr' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setRoleApplicationForm({ ...roleApplicationForm, appliedRole: 'sr', targetLabSection: '', targetSection: '' })}
                      >
                        <GraduationCap size={16} /> Student Representative (SR)
                      </button>
                    </div>
                  </div>

                  {/* Target Selection based on role */}
                  {roleApplicationForm.appliedRole && (
                    <div className="mb-4">
                      <label style={{ fontSize: 'var(--fs-sm)', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>
                        {roleApplicationForm.appliedRole === 'cr' ? 'Select Lab Group' : 'Select Section'}
                      </label>
                      {roleApplicationForm.appliedRole === 'cr' ? (
                        <div className="flex gap-2 flex-wrap">
                          {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map((lab) => (
                            <button
                              key={lab}
                              type="button"
                              className={`btn btn-sm ${roleApplicationForm.targetLabSection === lab ? 'btn-primary' : 'btn-secondary'}`}
                              onClick={() => setRoleApplicationForm({ ...roleApplicationForm, targetLabSection: lab })}
                            >
                              {lab}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="flex gap-2 flex-wrap">
                          {['A', 'B', 'C'].map((section) => (
                            <button
                              key={section}
                              type="button"
                              className={`btn btn-sm ${roleApplicationForm.targetSection === section ? 'btn-primary' : 'btn-secondary'}`}
                              onClick={() => setRoleApplicationForm({ ...roleApplicationForm, targetSection: section })}
                            >
                              {section}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="mb-4">
                    <label style={{ fontSize: 'var(--fs-sm)', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Your Information</label>
                    <div className="p-4" style={{ background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', fontSize: 'var(--fs-xs)' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        <div><span style={{ color: 'var(--text-tertiary)' }}>Name:</span> {user?.name}</div>
                        <div><span style={{ color: 'var(--text-tertiary)' }}>Email:</span> {user?.email}</div>
                        <div><span style={{ color: 'var(--text-tertiary)' }}>Department:</span> {user?.department}</div>
                        <div><span style={{ color: 'var(--text-tertiary)' }}>Batch:</span> {user?.batch || user?.batchNo}</div>
                        <div><span style={{ color: 'var(--text-tertiary)' }}>Section:</span> {user?.section}</div>
                        <div><span style={{ color: 'var(--text-tertiary)' }}>Lab Group:</span> {user?.labSection}</div>
                      </div>
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary" disabled={submittingApplication || (roleApplicationForm.appliedRole === 'cr' && !roleApplicationForm.targetLabSection) || (roleApplicationForm.appliedRole === 'sr' && !roleApplicationForm.targetSection)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <Send size={16} /> {submittingApplication ? 'Submitting...' : 'Submit Application'}
                  </button>
                </form>
              )}

              {/* Application History */}
              {userApplications.length > 0 && (
                <div className="mt-8">
                  <h4 style={{ fontSize: 'var(--fs-sm)', fontWeight: 'bold', marginBottom: '12px' }}>Application History</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {userApplications.map(app => (
                      <div key={app.id} className="p-4" style={{ 
                        background: 'var(--bg-input)', 
                        border: `1px solid ${app.status === 'approved' ? 'var(--accent-emerald)' : app.status === 'rejected' ? 'var(--accent-rose)' : 'var(--border-primary)'}`,
                        borderRadius: 'var(--radius-lg)'
                      }}>
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`badge ${app.appliedRole === 'cr' ? 'badge-amber' : 'badge-emerald'}`} style={{ fontSize: '10px' }}>
                                {app.appliedRole === 'cr' ? 'CR' : 'SR'}
                              </span>
                              <span className={`badge ${app.status === 'approved' ? 'badge-emerald' : app.status === 'rejected' ? 'badge-rose' : 'badge-blue'}`} style={{ fontSize: '10px' }}>
                                {app.status.toUpperCase()}
                              </span>
                            </div>
                            <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                              Applied on {new Date(app.createdAt).toLocaleDateString()}
                              {app.reviewedAt && ` • Reviewed on ${new Date(app.reviewedAt).toLocaleDateString()}`}
                            </p>
                          </div>
                        </div>
                        {app.statement && (
                          <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-secondary)', marginTop: '8px', fontStyle: 'italic' }}>
                            "{app.statement}"
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
