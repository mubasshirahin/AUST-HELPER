import { useState, useMemo, useEffect, useRef } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { GraduationCap, Briefcase, BookOpen, Moon, Sun, Newspaper, Terminal, Sparkles, Gauge, MoonStar, Pen, PenTool, Check, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { getYearSemOptions } from '../../utils/semester';
import { getPasswordGrade } from '../../utils/passwordStrength';
import ParticleField from './ParticleField';
import logoSilver from '../../assets/logo-silver.png';
import logoRed from '../../assets/logo-red.png';
import './AuthPage.css';

const EMAIL_DOMAIN = '@aust.edu';

const departments = ['CSE', 'EEE', 'CE', 'ME', 'IPE', 'TE', 'ARCH', 'BBA'];

const roleOptions = [
  { id: 'student', label: 'Student', icon: GraduationCap },
  { id: 'faculty', label: 'Faculty', icon: BookOpen },
  { id: 'alumni', label: 'Alumni', icon: Briefcase },
];

const themeOptions = [
  { id: 'dark', label: 'Dark', icon: Moon },
  { id: 'light', label: 'Light', icon: Sun },
  { id: 'newsprint', label: 'Newsprint', icon: Newspaper },
  { id: 'cyberpunk', label: 'Cyberpunk', icon: Terminal },
  { id: 'maximalism', label: 'Maximalism', icon: Sparkles },
  { id: 'industrial', label: 'Industrial', icon: Gauge },
  { id: 'midnight', label: 'Midnight', icon: MoonStar },
  { id: 'sketchbook', label: 'Sketchbook', icon: PenTool },
  { id: 'minimalist-monochrome', label: 'Monochrome', icon: Pen },
];

const defaultSignup = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: 'student',
  department: 'CSE',
  batchNo: '',
  yearSemester: '1.1',
  designation: '',
  company: '',
  graduationYear: '',
};

export default function AuthPage() {
  const { isAuthenticated, isLoading, login, signup } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectPath = location.state?.from || '/';

  const [mode, setMode] = useState('login');
  const [signupStep, setSignupStep] = useState(1);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [signupForm, setSignupForm] = useState(defaultSignup);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [showLoginPw, setShowLoginPw] = useState(false);
  const [showSignupPw, setShowSignupPw] = useState(false);
  const [focusKind, setFocusKind] = useState(null);
  const [sending, setSending] = useState(false);
  const signupFormRef = useRef(null);
  const [logoVariant, setLogoVariant] = useState(
    () => localStorage.getItem('logoVariant') || 'silver'
  );
  const [logoClicked, setLogoClicked] = useState(false);

  const toggleLogo = () => {
    setLogoClicked(true);
    setTimeout(() => setLogoClicked(false), 600);
    setLogoVariant((prev) => {
      const next = prev === 'silver' ? 'red' : 'silver';
      localStorage.setItem('logoVariant', next);
      return next;
    });
  };

  // ─── Typewriter ticker ───
  const TICKER_PHRASES = [
    'Track your attendance.',
    'Never miss a deadline.',
    'Your campus. Simplified.',
    'Routine. Grades. Vault.',
    'Built for AUST students.',
    'Check your routine today.',
    'Find past papers in Vault.',
    'Stay ahead, every semester.',
  ];
  const [tickerText, setTickerText] = useState('');
  const [tickerPhaseIdx, setTickerPhaseIdx] = useState(0);
  const [tickerCharIdx, setTickerCharIdx] = useState(0);
  const [tickerDeleting, setTickerDeleting] = useState(false);
  const tickerRef = useRef(null);

  useEffect(() => {
    const phrase = TICKER_PHRASES[tickerPhaseIdx % TICKER_PHRASES.length];
    let delay;
    if (!tickerDeleting) {
      if (tickerCharIdx < phrase.length) {
        delay = 55;
        tickerRef.current = setTimeout(() => {
          setTickerText(phrase.slice(0, tickerCharIdx + 1));
          setTickerCharIdx((c) => c + 1);
        }, delay);
      } else {
        // pause then delete
        tickerRef.current = setTimeout(() => setTickerDeleting(true), 1800);
      }
    } else {
      if (tickerCharIdx > 0) {
        delay = 28;
        tickerRef.current = setTimeout(() => {
          setTickerText(phrase.slice(0, tickerCharIdx - 1));
          setTickerCharIdx((c) => c - 1);
        }, delay);
      } else {
        setTickerDeleting(false);
        setTickerPhaseIdx((p) => p + 1);
      }
    }
    return () => clearTimeout(tickerRef.current);
  }, [tickerCharIdx, tickerDeleting, tickerPhaseIdx]);

  const yearSemOptions = useMemo(() => getYearSemOptions(signupForm.department), [signupForm.department]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isLoading && isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }

  const activeTheme = themeOptions.find((t) => t.id === theme) || themeOptions[0];
  const ThemeIcon = activeTheme.icon;

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setError('');
    setSignupStep(1);
  };

  const handleContinue = () => {
    setError('');
    // Let the browser surface native inline validation for the step-1 fields
    // (required / email format / minLength) before advancing.
    if (signupFormRef.current && !signupFormRef.current.reportValidity()) {
      return;
    }
    // Password match isn't expressible in HTML constraints — check it here.
    if (signupForm.password !== signupForm.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setSignupStep(2);
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await login(loginForm.email, loginForm.password);
      navigate(redirectPath, { replace: true });
    } catch (loginError) {
      setError(loginError.message || 'Login failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignup = async (event) => {
    event.preventDefault();
    setError('');

    if (signupForm.password !== signupForm.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);

    try {
      // Map yearSemester (e.g. "3.1") to semester number (e.g. 5)
      const [yr, term] = (signupForm.yearSemester || '1.1').split('.').map(Number);
      const semesterNum = (yr - 1) * 2 + term;

      await signup({
        name: signupForm.name,
        email: signupForm.email,
        password: signupForm.password,
        role: signupForm.role,
        department: signupForm.department,
        batchNo: signupForm.batchNo,
        yearSemester: signupForm.yearSemester,
        semester: semesterNum,
        designation: signupForm.designation,
        company: signupForm.company,
        graduationYear: signupForm.graduationYear,
      });

      // ─── "Drop the mic" success ───
      // Reward the long form: fold the card up like an exam paper into an
      // envelope and zip it away, then slide into the dashboard.
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduced) {
        navigate(redirectPath, { replace: true });
        return;
      }
      setSending(true);
      setTimeout(() => navigate(redirectPath, { replace: true }), 1150);
    } catch (signupError) {
      setError(signupError.message || 'Signup failed.');
      setSubmitting(false);
    }
  };

  const isStudent = signupForm.role === 'student';
  const isFaculty = signupForm.role === 'faculty';
  const isAlumni = signupForm.role === 'alumni';

  // ─── Mascot mood ───
  // Reacts to the focused field: covers its eyes on a masked password,
  // peeks when the password is revealed, glances down while typing else.
  const anyPwRevealed =
    (mode === 'login' && showLoginPw) ||
    (mode === 'signup' && (showSignupPw || (focusKind === 'confirm' && showConfirmPw)));
  let mascotMood = 'idle';
  if (focusKind === 'password' || focusKind === 'confirm') {
    mascotMood = anyPwRevealed ? 'peek' : 'cover';
  } else if (focusKind === 'text') {
    mascotMood = 'look';
  }

  // ─── Password strength (AUST grading scale) ───
  const activePassword = mode === 'login' ? loginForm.password : signupForm.password;
  const pwGrade = getPasswordGrade(activePassword);
  // The grid "powers up" while a password field is focused; its intensity
  // (and the logo glow) scale with how strong the password is.
  const energized = focusKind === 'password' || focusKind === 'confirm';
  const energyIntensity = energized ? Math.max(0.15, pwGrade.strength || 0) : 0;

  // ─── Department easter egg ───
  const activeDept = mode === 'signup' && signupStep === 2 ? signupForm.department : null;
  const blueprintMode = activeDept === 'ARCH';

  // ─── Email domain auto-complete ───
  const emailSuggestion = (value) => {
    const v = (value || '').trim();
    return v.length > 0 && !v.includes('@') ? `${v}${EMAIL_DOMAIN}` : null;
  };
  const completeLoginEmail = () =>
    setLoginForm((c) => ({ ...c, email: `${c.email.trim()}${EMAIL_DOMAIN}` }));
  const completeSignupEmail = () =>
    setSignupForm((c) => ({ ...c, email: `${c.email.trim()}${EMAIL_DOMAIN}` }));
  const onEmailKeyDown = (complete, suggestion) => (e) => {
    if (suggestion && (e.key === 'Tab' || e.key === 'Enter') && !e.shiftKey) {
      e.preventDefault();
      complete();
    }
  };
  const loginEmailSug = emailSuggestion(loginForm.email);
  const signupEmailSug = emailSuggestion(signupForm.email);

  return (
    <div
      className={`auth-page animate-fadeIn ${blueprintMode ? 'is-blueprint' : ''}`}
      style={{ '--pw-strength': energyIntensity }}
    >
      <div className="auth-page-bg">
        <div className="auth-page-grid" />
        <ParticleField energized={energized} intensity={energyIntensity} blueprint={blueprintMode} />
        <div className="auth-page-orb auth-page-orb-1" />
        <div className="auth-page-orb auth-page-orb-2" />
        <div className="auth-page-orb auth-page-orb-3" />
        <div className="auth-page-noise" aria-hidden="true" />
      </div>
      <div className={`auth-shell ${sending ? 'is-sending' : ''}`}>
        <div className="auth-brand-outside">
          <div className="auth-logo-wrapper">
            <div className="topbar-logo">
              <div className="logo-icon-wrapper">
                <button
                  type="button"
                  className={`topbar-logo-icon ${logoClicked ? 'clicked' : ''}`}
                  onClick={toggleLogo}
                  title="Click to switch logo"
                  aria-label="Toggle logo color"
                >
                  <img
                    src={logoVariant === 'silver' ? logoSilver : logoRed}
                    alt="AUSTWise logo"
                    className="topbar-logo-img"
                  />
                </button>
                <div className="logo-burst" aria-hidden="true">
                  <i></i><i></i><i></i><i></i>
                  <i></i><i></i><i></i><i></i>
                </div>
              </div>
              <div className="logo-text">
                <div className="logo-wordmark">
                  <span className="wm-ust">
                    <span className="wc">u</span>
                    <span className="wc">s</span>
                    <span className="wc">t</span>
                  </span>
                  <span className="wm-ise">
                    <span className="wc">i</span>
                    <span className="wc">s</span>
                    <span className="wc">e</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
          <p className="auth-ticker">
            <span className="auth-ticker-text">{tickerText}</span>
            <span className="auth-ticker-cursor" aria-hidden="true">|</span>
          </p>
        </div>

        <div
          className={`auth-card glass-card-static stagger-children ${activeDept ? 'has-dept-egg' : ''} ${sending ? 'auth-card--sending' : ''}`}
          data-dept={activeDept || undefined}
        >
          {activeDept && <span className="auth-dept-fx" aria-hidden="true" data-dept={activeDept} />}
          <div className="auth-theme-switcher">
            <button
              type="button"
              className="auth-theme-btn"
              onClick={() => setThemeMenuOpen((open) => !open)}
              aria-label={`Theme: ${activeTheme.label}`}
            >
              <div className={`auth-theme-icon ${theme}`}>
                <ThemeIcon size={16} />
              </div>
            </button>
            {themeMenuOpen && (
              <div className="auth-theme-menu" role="menu">
                <span className="auth-theme-menu-heading">Theme</span>
                {themeOptions.map(({ id, label, icon: Icon }) => {
                  const isActive = theme === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      role="menuitemradio"
                      aria-checked={isActive}
                      className={`auth-theme-menu-item ${isActive ? 'active' : ''}`}
                      onClick={() => { setTheme(id); setThemeMenuOpen(false); }}
                    >
                      <Icon size={14} />
                      <span>{label}</span>
                      {isActive && <Check size={12} className="auth-theme-menu-check" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className={`auth-mascot mood-${mascotMood}`} aria-hidden="true">
            <div className="auth-mascot-face">
              <span className="auth-mascot-eye left"><i className="auth-mascot-pupil" /></span>
              <span className="auth-mascot-eye right"><i className="auth-mascot-pupil" /></span>
              <span className="auth-mascot-paw left" />
              <span className="auth-mascot-paw right" />
            </div>
          </div>

        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => switchMode('login')}
          >
            Login
          </button>
          <button
            type="button"
            className={`auth-tab ${mode === 'signup' ? 'active' : ''}`}
            onClick={() => switchMode('signup')}
          >
            Sign Up
          </button>
        </div>

        {error && <div className="auth-message error">{error}</div>}

        {mode === 'login' ? (
          <form className="auth-form" onSubmit={handleLogin}>
            <label className="auth-field">
              Email
              <div className="auth-email-wrap">
                <input
                  className="input"
                  type="email"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm((c) => ({ ...c, email: e.target.value }))}
                  onFocus={() => setFocusKind('text')}
                  onBlur={() => setFocusKind(null)}
                  onKeyDown={onEmailKeyDown(completeLoginEmail, loginEmailSug)}
                  placeholder="you@aust.edu"
                  required
                />
                {loginEmailSug && (
                  <button
                    type="button"
                    className="auth-domain-hint"
                    onMouseDown={(e) => { e.preventDefault(); completeLoginEmail(); }}
                    tabIndex={-1}
                  >
                    <span className="auth-domain-hint-text">{loginEmailSug}</span>
                    <kbd>Tab</kbd>
                  </button>
                )}
              </div>
            </label>
            <label className="auth-field">
              Password
              <div className="auth-input-eye">
                <input
                  className="input"
                  type={showLoginPw ? 'text' : 'password'}
                  value={loginForm.password}
                  onChange={(e) => setLoginForm((c) => ({ ...c, password: e.target.value }))}
                  onFocus={() => setFocusKind('password')}
                  onBlur={() => setFocusKind(null)}
                  placeholder="Password"
                  required
                />
                <button
                  type="button"
                  className="auth-eye-btn"
                  onClick={() => setShowLoginPw((v) => !v)}
                  tabIndex={-1}
                  aria-label={showLoginPw ? 'Hide password' : 'Show password'}
                >
                  {showLoginPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </label>
            <button type="submit" className="btn btn-primary auth-submit" disabled={submitting}>
              {submitting ? 'Signing in...' : 'Login'}
            </button>
          </form>
        ) : (
          <form className="auth-form" onSubmit={handleSignup} ref={signupFormRef}>
            <div className="auth-steps" aria-hidden="true">
              <span className={`auth-step-dot ${signupStep === 1 ? 'active' : 'done'}`} />
              <span className="auth-step-line" />
              <span className={`auth-step-dot ${signupStep === 2 ? 'active' : ''}`} />
            </div>
            <p className="auth-step-label">
              Step {signupStep} of 2 — {signupStep === 1 ? 'Your account' : 'Role details'}
            </p>

            {signupStep === 1 && (
            <div className="auth-step-panel">
            <div className="auth-role-grid">
              {roleOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className={`auth-role-card ${signupForm.role === option.id ? 'active' : ''}`}
                  onClick={() => setSignupForm((c) => ({ ...c, role: option.id }))}
                >
                  <option.icon size={18} />
                  <span>{option.label}</span>
                </button>
              ))}
            </div>

            <label className="auth-field">
              Full name
              <input
                className="input"
                value={signupForm.name}
                onChange={(e) => setSignupForm((c) => ({ ...c, name: e.target.value }))}
                onFocus={() => setFocusKind('text')}
                onBlur={() => setFocusKind(null)}
                placeholder="Your name"
                required
              />
            </label>

            <label className="auth-field">
              Email
              <div className="auth-email-wrap">
                <input
                  className="input"
                  type="email"
                  value={signupForm.email}
                  onChange={(e) => setSignupForm((c) => ({ ...c, email: e.target.value }))}
                  onFocus={() => setFocusKind('text')}
                  onBlur={() => setFocusKind(null)}
                  onKeyDown={onEmailKeyDown(completeSignupEmail, signupEmailSug)}
                  placeholder="you@aust.edu"
                  required
                />
                {signupEmailSug && (
                  <button
                    type="button"
                    className="auth-domain-hint"
                    onMouseDown={(e) => { e.preventDefault(); completeSignupEmail(); }}
                    tabIndex={-1}
                  >
                    <span className="auth-domain-hint-text">{signupEmailSug}</span>
                    <kbd>Tab</kbd>
                  </button>
                )}
              </div>
            </label>

            <div className="grid-2" style={{ gap: '10px' }}>
              <label className="auth-field">
                Password
                <div className="auth-input-eye">
                  <input
                    className="input"
                    type={showSignupPw ? 'text' : 'password'}
                    value={signupForm.password}
                    onChange={(e) => setSignupForm((c) => ({ ...c, password: e.target.value }))}
                    onFocus={() => setFocusKind('password')}
                    onBlur={() => setFocusKind(null)}
                    minLength={6}
                    required
                  />
                  <button
                    type="button"
                    className="auth-eye-btn"
                    onClick={() => setShowSignupPw((v) => !v)}
                    tabIndex={-1}
                    aria-label={showSignupPw ? 'Hide password' : 'Show password'}
                  >
                    {showSignupPw ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </label>
              <label className="auth-field">
                Confirm
                <div className="auth-input-eye">
                  <input
                    className="input"
                    type={showConfirmPw ? 'text' : 'password'}
                    value={signupForm.confirmPassword}
                    onChange={(e) => setSignupForm((c) => ({ ...c, confirmPassword: e.target.value }))}
                    onFocus={() => setFocusKind('confirm')}
                    onBlur={() => setFocusKind(null)}
                    minLength={6}
                    required
                  />
                  <button
                    type="button"
                    className="auth-eye-btn"
                    onClick={() => setShowConfirmPw((v) => !v)}
                    tabIndex={-1}
                    aria-label={showConfirmPw ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPw ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </label>
            </div>

            {signupForm.password && (
              <div className={`auth-pw-grade tone-${pwGrade.tone}`}>
                <div className="auth-pw-grade-bar">
                  <span
                    className="auth-pw-grade-fill"
                    style={{ width: `${pwGrade.pct}%` }}
                  />
                </div>
                <div className="auth-pw-grade-row">
                  <span className="auth-pw-grade-badge">{pwGrade.grade}</span>
                  <span className="auth-pw-grade-label">{pwGrade.label}</span>
                </div>
              </div>
            )}

            <button type="button" className="btn btn-primary auth-submit" onClick={handleContinue}>
              Continue →
            </button>
            </div>
            )}

            {signupStep === 2 && (
            <div className="auth-step-panel">
            <div className={`auth-dept-row ${!isFaculty && !isAlumni ? 'grid-2' : ''}`} style={{ gap: '10px' }}>
              <div className="auth-field">
                Department
                <div className={`auth-btn-grid ${!isFaculty && !isAlumni ? 'auth-btn-grid-4' : 'auth-btn-grid-8'}`}>
                  {departments.map((dept) => (
                    <button
                      key={dept}
                      type="button"
                      className={`auth-btn-option ${signupForm.department === dept ? 'active' : ''}`}
                      onClick={() => setSignupForm((c) => ({ ...c, department: dept }))}
                    >
                      {dept}
                    </button>
                  ))}
                </div>
              </div>
              {!isFaculty && !isAlumni && (
                <div className="auth-field">
                  Year-Sem
                  <div className="auth-btn-grid auth-btn-grid-2">
                    {yearSemOptions.map((ys) => (
                      <button
                        key={ys}
                        type="button"
                        className={`auth-btn-option ${signupForm.yearSemester === ys ? 'active' : ''}`}
                        onClick={() => setSignupForm((c) => ({ ...c, yearSemester: ys }))}
                      >
                        {ys}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {isStudent && (
              <label className="auth-field">
                Batch name &amp; no.
                <input
                  className="input"
                  value={signupForm.batchNo}
                  onChange={(e) => setSignupForm((c) => ({ ...c, batchNo: e.target.value }))}
                  placeholder="e.g. Quanta 52"
                  required
                />
              </label>
            )}

            {isAlumni && (
              <label className="auth-field">
                Batch name &amp; no.
                <input
                  className="input"
                  value={signupForm.batchNo}
                  onChange={(e) => setSignupForm((c) => ({ ...c, batchNo: e.target.value }))}
                  placeholder="e.g. Origin 42"
                  required
                />
              </label>
            )}

            {isFaculty && (
              <>
                <div className="auth-field">
                  Designation
                  <div className="auth-btn-grid auth-btn-grid-2">
                    {['Lecturer', 'Senior Lecturer', 'Assistant Professor', 'Associate Professor', 'Professor', 'Other'].map((d) => (
                      <button
                        key={d}
                        type="button"
                        className={`auth-btn-option ${signupForm.designation === d ? 'active' : ''}`}
                        onClick={() => setSignupForm((c) => ({ ...c, designation: d }))}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
                <label className="auth-field">
                  Batch name &amp; no.
                  <input
                    className="input"
                    value={signupForm.batchNo}
                    onChange={(e) => setSignupForm((c) => ({ ...c, batchNo: e.target.value }))}
                    placeholder="e.g. Quanta 52"
                  />
                </label>
              </>
            )}

            {isAlumni && (
              <>
                <label className="auth-field">
                  Graduation year
                  <input
                    className="input"
                    value={signupForm.graduationYear}
                    onChange={(e) => setSignupForm((c) => ({ ...c, graduationYear: e.target.value }))}
                    placeholder="2024"
                  />
                </label>
                <label className="auth-field">
                  Company (optional)
                  <input
                    className="input"
                    value={signupForm.company}
                    onChange={(e) => setSignupForm((c) => ({ ...c, company: e.target.value }))}
                    placeholder="Where you work now"
                  />
                </label>
              </>
            )}

            <div className="auth-step-nav">
              <button
                type="button"
                className="btn btn-secondary auth-back-btn"
                onClick={() => { setError(''); setSignupStep(1); }}
              >
                ← Back
              </button>
              <button type="submit" className="btn btn-primary auth-submit" disabled={submitting}>
                {submitting ? 'Creating account...' : `Sign up as ${roleOptions.find((r) => r.id === signupForm.role)?.label}`}
              </button>
            </div>
            </div>
            )}
          </form>
        )}

        <div className="auth-footer">
          {mode === 'login' ? (
            <>New to AUSTWise? <button type="button" onClick={() => switchMode('signup')}>Create an account</button></>
          ) : (
            <>Already registered? <button type="button" onClick={() => switchMode('login')}>Login here</button></>
          )}
        </div>

        <button
          type="button"
          className="btn btn-secondary auth-submit"
          onClick={() => navigate('/')}
        >
          Continue without account
        </button>
        </div>
        {sending && (
          <div className="auth-envelope" aria-hidden="true">
            <div className="auth-envelope-flap" />
            <div className="auth-envelope-body" />
            <span className="auth-envelope-check">✓</span>
          </div>
        )}
      </div>
    </div>
  );
}
