import React from 'react';
import { Shield, Lock, Eye, Trash2, Mail, Info } from 'lucide-react';
import '../styles/global.css';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="privacy-policy-page" style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 20px' }}>
      <div className="dashboard-header" style={{ marginBottom: '40px', textAlign: 'center' }}>
        <div className="card-icon-wrap primary" style={{ margin: '0 auto 20px', width: '60px', height: '60px' }}>
          <Shield size={32} />
        </div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 900 }}>Privacy Policy</h1>
        <p className="subtitle" style={{ fontSize: '1.1rem' }}>Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
      </div>

      <div className="bento-grid" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
        {/* Introduction */}
        <section className="bento-card" style={{ padding: '30px' }}>
          <div className="card-top" style={{ marginBottom: '15px' }}>
            <div className="flex items-center gap-3">
              <Info size={24} style={{ color: 'var(--accent-purple)' }} />
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Introduction</h2>
            </div>
          </div>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            Welcome to Qobo1live. We value your privacy and are committed to protecting your personal data. 
            This Privacy Policy explains how we collect, use, and safeguard your information when you use our mobile application and website, 
            especially in connection with Facebook Login and other social authentication methods.
          </p>
        </section>

        {/* Data Collection */}
        <section className="bento-card" style={{ padding: '30px' }}>
          <div className="card-top" style={{ marginBottom: '15px' }}>
            <div className="flex items-center gap-3">
              <Eye size={24} style={{ color: 'var(--accent-blue)' }} />
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Information We Collect</h2>
            </div>
          </div>
          <div style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            <p style={{ marginBottom: '15px' }}>When you use Facebook Login, we may collect the following information:</p>
            <ul style={{ paddingLeft: '20px', listStyleType: 'disc' }}>
              <li><strong>Public Profile Information:</strong> Name, profile picture, and gender.</li>
              <li><strong>Email Address:</strong> Used for account creation and communication.</li>
              <li><strong>User ID:</strong> A unique identifier provided by Facebook to link your account.</li>
            </ul>
          </div>
        </section>

        {/* Data Usage */}
        <section className="bento-card" style={{ padding: '30px' }}>
          <div className="card-top" style={{ marginBottom: '15px' }}>
            <div className="flex items-center gap-3">
              <Lock size={24} style={{ color: '#10b981' }} />
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>How We Use Your Data</h2>
            </div>
          </div>
          <div style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            <p>We use the collected data for the following purposes:</p>
            <ul style={{ paddingLeft: '20px', listStyleType: 'disc', marginTop: '10px' }}>
              <li>To provide and maintain our Service.</li>
              <li>To authenticate your identity via social login providers.</li>
              <li>To personalize your user experience within the application.</li>
              <li>To provide customer support and respond to your inquiries.</li>
            </ul>
          </div>
        </section>

        {/* Data Deletion */}
        <section className="bento-card" style={{ padding: '30px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
          <div className="card-top" style={{ marginBottom: '15px' }}>
            <div className="flex items-center gap-3">
              <Trash2 size={24} style={{ color: '#ef4444' }} />
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Data Deletion Rights</h2>
            </div>
          </div>
          <div style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            <p style={{ marginBottom: '15px' }}>
              According to Facebook's Platform Rules, we provide a User Data Deletion Callback URL or Instructions. 
              If you want to delete your activities for Qobo1live, you can follow these steps:
            </p>
            <ol style={{ paddingLeft: '20px', listStyleType: 'decimal' }}>
              <li>Go to your Facebook Account's "Settings & Privacy" menu. Click "Settings".</li>
              <li>Look for "Apps and Websites" and you will see all of the apps and websites you linked with your Facebook.</li>
              <li>Search and tap "Qobo1live" in the search bar.</li>
              <li>Scroll and tap "Remove".</li>
              <li>Congratulations, you have successfully removed your app activities.</li>
            </ol>
            <p style={{ marginTop: '15px' }}>
              Alternatively, you can contact us directly at <strong>support@qobo1live.com</strong> to request data deletion.
            </p>
          </div>
        </section>

        {/* Contact Us */}
        <section className="bento-card" style={{ padding: '30px' }}>
          <div className="card-top" style={{ marginBottom: '15px' }}>
            <div className="flex items-center gap-3">
              <Mail size={24} style={{ color: '#f59e0b' }} />
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Contact Us</h2>
            </div>
          </div>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            If you have any questions or suggestions about our Privacy Policy, do not hesitate to contact us at:
            <br /><br />
            <strong>Email:</strong> support@qobo1live.com<br />
            <strong>Website:</strong> www.qobo1live.com
          </p>
        </section>
      </div>

      <footer style={{ marginTop: '50px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
        &copy; {new Date().getFullYear()} Qobo1live. All rights reserved.
      </footer>
    </div>
  );
};

export default PrivacyPolicy;
