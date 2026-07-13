import { useNavigate } from 'react-router-dom';
import logoSilver from '../assets/logo-silver.png';
import './InfoPage.css';

export default function TermsPage() {
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
        <h1>Terms of Service</h1>
        <p className="info-page-subtitle">Last updated: January 2025</p>

        <h2>1. Acceptance of Terms</h2>
        <p>By accessing or using AUSTWise, you agree to be bound by these Terms of Service. If you do not agree, please do not use the platform.</p>

        <h2>2. Description of Service</h2>
        <p>AUSTWise is an academic assistant platform designed for students, faculty, and staff of Ahsanullah University of Science and Technology (AUST). It provides tools including but not limited to academic analytics, resource vault, campus navigation, community features, and marketplace listings.</p>

        <h2>3. User Accounts</h2>
        <p>You are responsible for maintaining the confidentiality of your account credentials. You must provide accurate information during registration. AUSTWise reserves the right to suspend accounts that violate these terms.</p>

        <h2>4. Acceptable Use</h2>
        <p>You agree not to:</p>
        <ul>
          <li>Use the platform for any unlawful purpose</li>
          <li>Post false, misleading, or harmful content</li>
          <li>Attempt to access another user's account</li>
          <li>Use automated tools to scrape or abuse the platform</li>
          <li>Upload malicious code or interfere with platform operations</li>
        </ul>

        <h2>5. Marketplace Listings</h2>
        <p>AUSTWise facilitates peer-to-peer listings. We do not endorse, guarantee, or verify any listings. Transactions are solely between buyers and sellers. AUSTWise is not responsible for disputes arising from marketplace transactions.</p>

        <h2>6. Intellectual Property</h2>
        <p>All content, trademarks, and intellectual property on AUSTWise are owned by AUSTWise or its licensors. You may not reproduce, distribute, or create derivative works without permission.</p>

        <h2>7. Limitation of Liability</h2>
        <p>AUSTWise is provided "as is" without warranties of any kind. We are not liable for any damages arising from your use of the platform.</p>

        <h2>8. Changes to Terms</h2>
        <p>We reserve the right to modify these terms at any time. Users will be notified of material changes via email or platform notice.</p>

        <h2>9. Contact</h2>
        <p>For questions about these terms, please reach out via the Feedback form or contact us at <a href="mailto:support@austwise.com">support@austwise.com</a>.</p>
      </div>
      <div className="info-page-footer">&copy; {new Date().getFullYear()} AUSTWise. All rights reserved.</div>
    </div>
  );
}
