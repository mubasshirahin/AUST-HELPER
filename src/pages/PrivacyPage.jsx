import { useNavigate } from 'react-router-dom';
import logoSilver from '../assets/logo-silver.png';
import './InfoPage.css';

export default function PrivacyPage() {
  const navigate = useNavigate();
  return (
    <div className="info-page">
      <header className="info-page-header">
        <a href="/" className="info-page-logo" onClick={(e) => { e.preventDefault(); navigate('/'); }}>
          <img src={logoSilver} alt="" />
          <span>AUSTWise</span>
        </a>
        <button className="info-page-back" onClick={() => navigate('/')}>← Back to Home</button>
      </header>
      <div className="info-page-body">
        <h1>Privacy Policy</h1>
        <p className="info-page-subtitle">Last updated: January 2025</p>

        <h2>1. Information We Collect</h2>
        <p>We collect information you provide when creating an account, including your name, email address, student ID, department, batch, and academic data such as grades and course schedules.</p>

        <h2>2. How We Use Your Information</h2>
        <p>Your information is used to:</p>
        <ul>
          <li>Provide and improve AUSTWise features</li>
          <li>Display CGPA analytics and academic insights</li>
          <li>Facilitate community and marketplace interactions</li>
          <li>Send notifications about classes, deadlines, and platform updates</li>
          <li>Ensure platform security and prevent abuse</li>
        </ul>

        <h2>3. Data Sharing</h2>
        <p>We do not sell your personal data. Information may be shared with:</p>
        <ul>
          <li>Other AUSTWise users only as needed for platform features (e.g., student directory, community posts)</li>
          <li>Service providers who help operate the platform</li>
          <li>Legal authorities if required by law</li>
        </ul>

        <h2>4. Data Storage & Security</h2>
        <p>Your data is stored securely using industry-standard encryption. We retain your data for as long as your account is active. You may request deletion of your data by contacting us.</p>

        <h2>5. Your Rights</h2>
        <p>You have the right to access, correct, or delete your personal data. You can manage most of this through your account settings.</p>

        <h2>6. Cookies</h2>
        <p>We use essential cookies to maintain your session and preferences. See our <a href="/cookie-policy">Cookie Policy</a> for details.</p>

        <h2>7. Contact</h2>
        <p>For privacy-related inquiries, contact <a href="mailto:privacy@austwise.com">privacy@austwise.com</a>.</p>
      </div>
      <div className="info-page-footer">&copy; {new Date().getFullYear()} AUSTWise. All rights reserved.</div>
    </div>
  );
}
