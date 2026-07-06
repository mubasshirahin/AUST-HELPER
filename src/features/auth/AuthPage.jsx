import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { GraduationCap, Briefcase, BookOpen } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './AuthPage.css';

const departments = ['CSE', 'EEE', 'CE', 'ME', 'IPE', 'TE', 'ARCH', 'BBA'];

const roleOptions = [
  { id: 'student', label: 'Student', icon: GraduationCap },
  { id: 'faculty', label: 'Faculty', icon: BookOpen },
  { id: 'alumni', label: 'Alumni', icon: Briefcase },
];

const defaultSignup = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: 'student',
  department: 'CSE',
  batchNo: '',
  designation: '',
  company: '',
  graduationYear: '',
};

export default function AuthPage() {
  const { isAuthenticated, isLoading, login, signup } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectPath = location.state?.from || '/';

  const [mode, setMode] = useState('login');
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [signupForm, setSignupForm] = useState(defaultSignup);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isLoading && isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }

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
      await signup({
        name: signupForm.name,
        email: signupForm.email,
        password: signupForm.password,
        role: signupForm.role,
        department: signupForm.department,
        batchNo: signupForm.batchNo,
        designation: signupForm.designation,
        company: signupForm.company,
        graduationYear: signupForm.graduationYear,
      });
      navigate(redirectPath, { replace: true });
    } catch (signupError) {
      setError(signupError.message || 'Signup failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const isStudent = signupForm.role === 'student';
  const isFaculty = signupForm.role === 'faculty';
  const isAlumni = signupForm.role === 'alumni';

  return (
    <div className="auth-page animate-fadeIn">
      <div className="auth-card glass-card-static">
        <div className="auth-brand">
          <div className="auth-brand-icon">
            <GraduationCap size={26} />
          </div>
          <h1>AUSTWise</h1>
          <p>Sign in or create your campus account</p>
        </div>

        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => { setMode('login'); setError(''); }}
          >
            Login
          </button>
          <button
            type="button"
            className={`auth-tab ${mode === 'signup' ? 'active' : ''}`}
            onClick={() => { setMode('signup'); setError(''); }}
          >
            Sign Up
          </button>
        </div>

        {error && <div className="auth-message error">{error}</div>}

        {mode === 'login' ? (
          <form className="auth-form" onSubmit={handleLogin}>
            <label className="auth-field">
              Email
              <input
                className="input"
                type="email"
                value={loginForm.email}
                onChange={(e) => setLoginForm((c) => ({ ...c, email: e.target.value }))}
                placeholder="you@aust.edu"
                required
              />
            </label>
            <label className="auth-field">
              Password
              <input
                className="input"
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm((c) => ({ ...c, password: e.target.value }))}
                placeholder="Password"
                required
              />
            </label>
            <button type="submit" className="btn btn-primary auth-submit" disabled={submitting}>
              {submitting ? 'Signing in...' : 'Login'}
            </button>
          </form>
        ) : (
          <form className="auth-form" onSubmit={handleSignup}>
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
                placeholder="Your name"
                required
              />
            </label>

            <label className="auth-field">
              Email
              <input
                className="input"
                type="email"
                value={signupForm.email}
                onChange={(e) => setSignupForm((c) => ({ ...c, email: e.target.value }))}
                placeholder="you@aust.edu"
                required
              />
              <span className="field-hint">Must be a valid AUST email address (@aust.edu)</span>
            </label>

            <div className="grid-2" style={{ gap: '10px' }}>
              <label className="auth-field">
                Password
                <input
                  className="input"
                  type="password"
                  value={signupForm.password}
                  onChange={(e) => setSignupForm((c) => ({ ...c, password: e.target.value }))}
                  minLength={6}
                  required
                />
              </label>
              <label className="auth-field">
                Confirm
                <input
                  className="input"
                  type="password"
                  value={signupForm.confirmPassword}
                  onChange={(e) => setSignupForm((c) => ({ ...c, confirmPassword: e.target.value }))}
                  minLength={6}
                  required
                />
              </label>
            </div>

            <label className="auth-field">
              Department
              <select
                className="input"
                value={signupForm.department}
                onChange={(e) => setSignupForm((c) => ({ ...c, department: e.target.value }))}
              >
                {departments.map((department) => (
                  <option key={department} value={department}>{department}</option>
                ))}
              </select>
            </label>

            {(isStudent || isAlumni) && (
              <label className="auth-field">
                Batch number
                <input
                  className="input"
                  value={signupForm.batchNo}
                  onChange={(e) => setSignupForm((c) => ({ ...c, batchNo: e.target.value }))}
                  placeholder="e.g. 30"
                  required
                />
              </label>
            )}

            {isFaculty && (
              <label className="auth-field">
                Designation
                <input
                  className="input"
                  value={signupForm.designation}
                  onChange={(e) => setSignupForm((c) => ({ ...c, designation: e.target.value }))}
                  placeholder="Lecturer / Assistant Professor"
                  required
                />
              </label>
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

            <button type="submit" className="btn btn-primary auth-submit" disabled={submitting}>
              {submitting ? 'Creating account...' : `Sign up as ${roleOptions.find((r) => r.id === signupForm.role)?.label}`}
            </button>
          </form>
        )}

        <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', textAlign: 'center', marginTop: '16px' }}>
          {mode === 'login' ? (
            <>New to AUSTWise? <button type="button" className="btn-ghost" style={{ padding: 0, color: 'var(--accent-blue)' }} onClick={() => setMode('signup')}>Create an account</button></>
          ) : (
            <>Already registered? <button type="button" className="btn-ghost" style={{ padding: 0, color: 'var(--accent-blue)' }} onClick={() => setMode('login')}>Login here</button></>
          )}
        </p>

        <button
          type="button"
          className="btn btn-secondary auth-submit"
          style={{ marginTop: '10px' }}
          onClick={() => navigate('/')}
        >
          Continue without account
        </button>
      </div>
    </div>
  );
}
