import React from 'react';
import {
  Shield, Lock, Trash2, Phone, Mail, Globe, CheckCircle2,
  AlertTriangle, Smartphone, Eye, Users, Camera, Mic, Bell,
  Bluetooth, Zap, HelpCircle, FileText, Info
} from 'lucide-react';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="privacy-policy-wrapper" style={{
      fontFamily: "'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      backgroundColor: '#f8fafc',
      color: '#0f172a',
      minHeight: '100vh',
      padding: '40px 20px',
      borderRadius: '24px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
    }}>
      <style>{`
        .privacy-container {
          max-width: 960px;
          margin: 0 auto;
        }
        .privacy-hero-header {
          text-align: center;
          margin-bottom: 35px;
          padding: 35px 24px;
          background: linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%);
          border-radius: 28px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 10px 30px -5px rgba(15, 23, 42, 0.05);
        }
        .privacy-logo-wrapper {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 76px;
          height: 76px;
          background: linear-gradient(135deg, #7c3aed, #2563eb);
          border-radius: 24px;
          margin-bottom: 18px;
          color: white;
          box-shadow: 0 12px 25px -5px rgba(124, 58, 237, 0.35);
        }
        .privacy-title {
          font-size: 2.5rem;
          font-weight: 900;
          color: #0f172a;
          letter-spacing: -0.02em;
          margin-bottom: 8px;
        }
        .privacy-badge-row {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-top: 16px;
        }
        .privacy-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 16px;
          border-radius: 30px;
          font-size: 0.82rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .privacy-badge-green { background: #d1fae5; color: #059669; border: 1px solid #a7f3d0; }
        .privacy-badge-purple { background: #f3e8ff; color: #7c3aed; border: 1px solid #ddd6fe; }
        .privacy-badge-blue { background: #dbeafe; color: #2563eb; border: 1px solid #bfdbfe; }
        
        .playstore-box {
          background: #ffffff;
          border: 2px solid #3b82f6;
          border-radius: 24px;
          padding: 24px 28px;
          margin-bottom: 32px;
          box-shadow: 0 12px 35px -8px rgba(37, 99, 235, 0.12);
        }
        .playstore-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-top: 16px;
        }
        .playstore-item {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 16px;
        }
        
        .privacy-nav {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(12px);
          border: 1px solid #e2e8f0;
          border-radius: 20px;
          padding: 14px 20px;
          margin-bottom: 32px;
          text-align: center;
          box-shadow: 0 4px 15px rgba(0,0,0,0.03);
          position: sticky;
          top: 15px;
          z-index: 50;
        }
        .privacy-nav a {
          color: #2563eb;
          text-decoration: none;
          font-weight: 700;
          font-size: 0.88rem;
          margin: 4px 8px;
          display: inline-block;
        }
        .privacy-nav a:hover {
          color: #7c3aed;
          text-decoration: underline;
        }

        .privacy-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 24px;
          padding: 32px;
          margin-bottom: 25px;
          box-shadow: 0 10px 30px -5px rgba(15, 23, 42, 0.05);
          scroll-margin-top: 90px;
        }
        .privacy-card-header {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 20px;
          border-bottom: 2px solid #f1f5f9;
          padding-bottom: 14px;
        }
        .privacy-card-header h2 {
          font-size: 1.4rem;
          font-weight: 800;
          color: #0f172a;
          margin: 0;
        }
        .privacy-card-icon {
          width: 44px;
          height: 44px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f1f5f9;
          flex-shrink: 0;
        }

        .privacy-card p {
          color: #475569;
          margin-bottom: 14px;
          font-size: 0.98rem;
          line-height: 1.7;
        }
        .privacy-card ul, .privacy-card ol {
          padding-left: 22px;
          color: #475569;
          margin-bottom: 16px;
        }
        .privacy-card li {
          margin-bottom: 10px;
          font-size: 0.96rem;
          line-height: 1.6;
        }

        .sdk-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 16px;
          margin-top: 16px;
        }
        .sdk-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 18px;
        }
        
        .permission-item {
          background: #f8fafc;
          border-left: 4px solid #2563eb;
          padding: 14px 18px;
          border-radius: 12px;
          margin-bottom: 12px;
        }

        .deletion-card {
          background: #fef2f2;
          border: 2px solid #fca5a5;
        }
        .deletion-card .privacy-card-header h2 {
          color: #991b1b;
        }
        .deletion-box {
          background: #ffffff;
          border: 1px solid #fecaca;
          padding: 20px;
          border-radius: 16px;
          margin-top: 16px;
        }
        
        .contact-box {
          background: linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%);
          border: 1.5px solid #bfdbfe;
          border-radius: 20px;
          padding: 24px;
          margin-top: 16px;
        }
        .contact-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
          font-size: 1rem;
        }
        .contact-row strong {
          width: 140px;
          color: #0f172a;
          flex-shrink: 0;
        }

        @media (max-width: 640px) {
          .privacy-title { font-size: 2rem; }
          .privacy-card { padding: 20px 16px; border-radius: 20px; }
          .contact-row { flex-direction: column; align-items: flex-start; gap: 2px; }
          .contact-row strong { width: auto; }
        }
      `}</style>

      <div className="privacy-container">
        {/* Hero Header */}
        <header className="privacy-hero-header">
          <div className="privacy-logo-wrapper">
            <Shield size={38} color="#ffffff" strokeWidth={2.5} />
          </div>
          <h1 className="privacy-title">Privacy Policy</h1>
          <p style={{ color: '#475569', fontSize: '1rem', fontWeight: 600 }}>
            Official Data Safety & Privacy Policy for <strong>Qobo1live</strong>
          </p>

          <div className="privacy-badge-row">
            <span className="privacy-badge privacy-badge-green">✓ Google Play Compliant</span>
            <span className="privacy-badge privacy-badge-purple">🔞 Age 18+ Only</span>
            <span className="privacy-badge privacy-badge-blue">🔒 Encrypted Data</span>
          </div>

          <p style={{ marginTop: '16px', fontSize: '0.9rem', color: '#64748b' }}>
            <strong>Effective Date:</strong> September 1, 2026 &nbsp;|&nbsp; <strong>Legal Operator:</strong> Qobo1live Technologies, India
          </p>
        </header>

        {/* Google Play Data Safety Summary Box */}
        <section className="playstore-box">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
            <Smartphone size={28} className="text-blue-600" />
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e3a8a', margin: 0 }}>
                Google Play Data Safety Summary
              </h3>
              <p style={{ margin: 0, fontSize: '0.88rem', color: '#475569' }}>
                Quick reference guide for Play Store reviewers and Qobo1live users.
              </p>
            </div>
          </div>

          <div className="playstore-grid">
            <div className="playstore-item">
              <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f172a', marginBottom: '6px' }}>
                🔒 Data Encryption
              </div>
              <div style={{ fontSize: '0.85rem', color: '#475569', lineHeight: '1.5' }}>
                All user data is encrypted in transit using industry-standard HTTPS/TLS 1.3 and WSS protocols.
              </div>
            </div>

            <div className="playstore-item">
              <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f172a', marginBottom: '6px' }}>
                🗑️ Account Deletion
              </div>
              <div style={{ fontSize: '0.85rem', color: '#475569', lineHeight: '1.5' }}>
                Users can delete their account instantly in-app or request email deletion without requiring the app.
              </div>
            </div>

            <div className="playstore-item">
              <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f172a', marginBottom: '6px' }}>
                🚫 Zero Data Sales
              </div>
              <div style={{ fontSize: '0.85rem', color: '#475569', lineHeight: '1.5' }}>
                We do NOT sell personal data or share user information with third-party ad tracking networks.
              </div>
            </div>

            <div className="playstore-item">
              <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f172a', marginBottom: '6px' }}>
                📞 Customer Support
              </div>
              <div style={{ fontSize: '0.85rem', color: '#475569', lineHeight: '1.5' }}>
                Direct support via Email (<a href="mailto:qobolive916@gmail.com" style={{ color: '#2563eb' }}>qobolive916@gmail.com</a>) or Phone (<a href="tel:+916351894341" style={{ color: '#2563eb' }}>+91 6351894341</a>).
              </div>
            </div>
          </div>
        </section>

        {/* Quick Jump Navigation */}
        <nav className="privacy-nav">
          <a href="#intro">Introduction</a> · 
          <a href="#info">Data We Collect</a> · 
          <a href="#media">Public vs Private</a> · 
          <a href="#sdks">Third-Party SDKs</a> · 
          <a href="#permissions">Permissions</a> · 
          <a href="#retention">Retention</a> · 
          <a href="#deletion" style={{ color: '#dc2626' }}>Delete Account</a> · 
          <a href="#children">Age (18+)</a> · 
          <a href="#contact">Contact Us</a>
        </nav>

        {/* Policy Content Cards */}
        <div>
          {/* 1. Introduction */}
          <section className="privacy-card" id="intro">
            <div className="privacy-card-header">
              <div className="privacy-card-icon"><Info size={22} color="#7c3aed" /></div>
              <h2>1. Introduction</h2>
            </div>
            <p>
              Welcome to <strong>Qobo1live</strong> (“the App”, “we”, “us”, “our”). We value your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, process, share, retain, and safeguard your personal information when you use our mobile application, live-streaming services, 1:1 voice and video calling, social chat messaging, interactive audio/video rooms, and virtual wallet services.
            </p>
            <p>
              The legal operator responsible for your information is <strong>Qobo1live Technologies</strong> (India). For privacy inquiries or support, contact us at <a href="mailto:qobolive916@gmail.com" style={{ color: '#2563eb' }}>qobolive916@gmail.com</a> or phone <a href="tel:+916351894341" style={{ color: '#2563eb' }}>+91 6351894341</a>.
            </p>
          </section>

          {/* 2. Information We Collect */}
          <section className="privacy-card" id="info">
            <div className="privacy-card-header">
              <div className="privacy-card-icon"><Eye size={22} color="#2563eb" /></div>
              <h2>2. Information We Collect and Why</h2>
            </div>
            <p>We collect personal information strictly to provide core app features, authenticate users, process virtual currency transactions, maintain platform safety, and satisfy regulatory obligations.</p>
            <dl style={{ color: '#475569' }}>
              <dt style={{ fontWeight: 800, color: '#0f172a', marginTop: '16px', fontSize: '1.02rem' }}>
                👤 Account & Profile Information
              </dt>
              <dd style={{ margin: '4px 0 16px 0', fontSize: '0.95rem' }}>
                When you register or edit your profile, we collect your display name, phone number, email address, profile picture, poster image, date of birth (for age verification), gender, bio, country, state, city, language preferences, and personal interests. When using Google or Facebook sign-in, we collect authorized account identifiers and profile information provided by those services.
              </dd>

              <dt style={{ fontWeight: 800, color: '#0f172a', marginTop: '16px', fontSize: '1.02rem' }}>
                💬 Content & Interactive Media
              </dt>
              <dd style={{ margin: '4px 0 16px 0', fontSize: '0.95rem' }}>
                We process direct messages, uploaded media, live audio/video streams, 1:1 voice and video call metadata, room participation events, follows, favorites, block lists, virtual gift transfers, avatar frames, and chat bubbles to operate social rooms, deliver streams, and enforce community standards.
              </dd>

              <dt style={{ fontWeight: 800, color: '#0f172a', marginTop: '16px', fontSize: '1.02rem' }}>
                💳 Wallet, Coins & Payout Records
              </dt>
              <dd style={{ margin: '4px 0 16px 0', fontSize: '0.95rem' }}>
                We process coin and diamond balances, purchase history via Razorpay, virtual gift logs, reward allocations, and payout requests. If you request a payout, we process the bank account details, IFSC code, account holder name, or UPI ID you provide. Financial providers process credit/debit card details in their secure checkout windows.
              </dd>

              <dt style={{ fontWeight: 800, color: '#0f172a', marginTop: '16px', fontSize: '1.02rem' }}>
                🆔 Host & Agency Verification Details
              </dt>
              <dd style={{ margin: '4px 0 16px 0', fontSize: '0.95rem' }}>
                When applying for Host or Agency status, we collect your full legal name, date of birth, government identity card details (including front and back document photos such as Aadhaar, PAN, or National ID), WhatsApp contact number, email, real photo, postal address, and agency affiliation code. This sensitive data is processed strictly for identity verification, host eligibility review, commission payouts, and fraud prevention.
              </dd>

              <dt style={{ fontWeight: 800, color: '#0f172a', marginTop: '16px', fontSize: '1.02rem' }}>
                ⚙️ Technical, Diagnostic & Device Information
              </dt>
              <dd style={{ margin: '4px 0 16px 0', fontSize: '0.95rem' }}>
                Our servers and integrated SDKs process technical operational data, including IP address, hardware model, operating system version, app build version, session tokens, device identifiers, Firebase Cloud Messaging (FCM) tokens, connection timestamps, and diagnostic crash logs to maintain connection stability, single-device login restrictions, and security enforcement.
              </dd>
            </dl>
          </section>

          {/* 3. Public Media & Content */}
          <section className="privacy-card" id="media">
            <div className="privacy-card-header">
              <div className="privacy-card-icon"><Mic size={22} color="#059669" /></div>
              <h2>3. Public Content vs Private 1:1 Media</h2>
            </div>
            <p>
              Your displayed public profile (including display name, profile photo, level, bio, country, equipped avatar frame/background, and live status) is visible to other users. Activity inside public audio rooms and live streams—such as seat status, public room chat, sending virtual gifts, and leaderboard rankings—is visible to participants in that room or stream.
            </p>
            <p>
              Direct chat messages and 1:1 voice/video calls are private between participants. If a user submits a safety report, compliance moderators review relevant chat logs or media to investigate policy violations. Real-time audio and video streams are transmitted through secure ZEGOCLOUD channels; call duration and session timestamps are logged. We do not perform permanent server-side video recording of direct 1:1 calls unless required for law enforcement compliance or safety investigations.
            </p>
          </section>

          {/* 4. Third-Party SDKs */}
          <section className="privacy-card" id="sdks">
            <div className="privacy-card-header">
              <div className="privacy-card-icon"><Users size={22} color="#d97706" /></div>
              <h2>4. Data Sharing & Third-Party SDKs</h2>
            </div>
            <p>
              We share information with third-party service providers strictly as required to operate the App. We do <strong>NOT</strong> sell personal information. We do <strong>NOT</strong> share user data with third-party advertising networks for cross-app tracking or targeted advertising.
            </p>

            <div className="sdk-grid">
              <div className="sdk-card">
                <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a', marginBottom: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Google / Firebase</span>
                  <span className="privacy-badge privacy-badge-blue">Auth & FCM</span>
                </div>
                <div style={{ fontSize: '0.88rem', color: '#475569', lineHeight: '1.5' }}>
                  Used for secure user login, database operations, Firebase Storage, and FCM push notification delivery for call alerts.
                </div>
              </div>

              <div className="sdk-card">
                <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a', marginBottom: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>ZEGOCLOUD (ZEGO Express)</span>
                  <span className="privacy-badge privacy-badge-purple">Audio / Video RTC</span>
                </div>
                <div style={{ fontSize: '0.88rem', color: '#475569', lineHeight: '1.5' }}>
                  Used for real-time audio/video streaming, 1:1 voice/video calling, room audio routing, and signaling.
                </div>
              </div>

              <div className="sdk-card">
                <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a', marginBottom: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Razorpay</span>
                  <span className="privacy-badge privacy-badge-green">In-App Purchases</span>
                </div>
                <div style={{ fontSize: '0.88rem', color: '#475569', lineHeight: '1.5' }}>
                  Used for secure in-app purchase checkout when buying coin packages or VIP passes.
                </div>
              </div>

              <div className="sdk-card">
                <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a', marginBottom: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Google & Meta (Facebook)</span>
                  <span className="privacy-badge privacy-badge-blue">Social Login</span>
                </div>
                <div style={{ fontSize: '0.88rem', color: '#475569', lineHeight: '1.5' }}>
                  Used solely for social single sign-in authentication.
                </div>
              </div>
            </div>
          </section>

          {/* 5. Device Permissions */}
          <section className="privacy-card" id="permissions">
            <div className="privacy-card-header">
              <div className="privacy-card-icon"><Smartphone size={22} color="#2563eb" /></div>
              <h2>5. Device Permissions</h2>
            </div>
            <p>To support live streaming, calling, and profile customization, Qobo1live requests the following device permissions:</p>

            <div className="permission-item">
              <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem', marginBottom: '4px' }}>
                📷 Camera (<code>android.permission.CAMERA</code>)
              </div>
              <div style={{ fontSize: '0.88rem', color: '#475569' }}>
                Required to broadcast live video streams and make 1:1 video calls.
              </div>
            </div>

            <div className="permission-item">
              <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem', marginBottom: '4px' }}>
                🎤 Microphone (<code>android.permission.RECORD_AUDIO</code>)
              </div>
              <div style={{ fontSize: '0.88rem', color: '#475569' }}>
                Required to transmit audio during live streams, audio rooms, and 1:1 calls.
              </div>
            </div>

            <div className="permission-item">
              <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem', marginBottom: '4px' }}>
                🖼️ Photos & Media (<code>READ_MEDIA_IMAGES</code> / <code>READ_EXTERNAL_STORAGE</code>)
              </div>
              <div style={{ fontSize: '0.88rem', color: '#475569' }}>
                Required to select and upload profile photos, poster images, room backgrounds, and verification documents.
              </div>
            </div>

            <div className="permission-item">
              <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem', marginBottom: '4px' }}>
                🔔 Notifications (<code>android.permission.POST_NOTIFICATIONS</code>)
              </div>
              <div style={{ fontSize: '0.88rem', color: '#475569' }}>
                Required on Android 13+ for incoming call alerts and direct chat notifications.
              </div>
            </div>

            <div className="permission-item">
              <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem', marginBottom: '4px' }}>
                🎧 Bluetooth & Audio (<code>BLUETOOTH_CONNECT</code> / <code>MODIFY_AUDIO_SETTINGS</code>)
              </div>
              <div style={{ fontSize: '0.88rem', color: '#475569' }}>
                Required to route audio to Bluetooth headsets and speakerphones.
              </div>
            </div>

            <div className="permission-item">
              <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem', marginBottom: '4px' }}>
                ⚡ Call Ring Screen & Foreground Execution
              </div>
              <div style={{ fontSize: '0.88rem', color: '#475569' }}>
                <code>USE_FULL_SCREEN_INTENT</code>, <code>SYSTEM_ALERT_WINDOW</code>, and <code>FOREGROUND_SERVICE</code> are required to display full-screen incoming call UI and maintain active background streams.
              </div>
            </div>
          </section>

          {/* 6. Retention and Security */}
          <section className="privacy-card" id="retention">
            <div className="privacy-card-header">
              <div className="privacy-card-icon"><Lock size={22} color="#059669" /></div>
              <h2>6. Retention and Security</h2>
            </div>
            <p>We retain personal data only as long as necessary for legitimate service operations or legal requirements:</p>
            <ul>
              <li><strong>Account & Profile Data:</strong> Retained while your account is active. Purged immediately upon account deletion confirmation.</li>
              <li><strong>Messages & Call Logs:</strong> Retained up to 12 months for messaging history and safety compliance.</li>
              <li><strong>Financial & Payout Records:</strong> In-app purchase history, coin transactions, and payout records are retained for <strong>7 years</strong> to comply with statutory accounting, banking, and tax laws.</li>
              <li><strong>Security Logs & Reports:</strong> System logs and safety reports are retained up to 24 months.</li>
              <li><strong>System Backups:</strong> Encrypted backups automatically expire and overwrite within <strong>30 days</strong>.</li>
            </ul>
            <p>We enforce transport layer encryption (HTTPS/TLS 1.3, WSS), hashed user passwords (bcrypt), database access controls, and secure session tokens.</p>
          </section>

          {/* 7. Account Deletion */}
          <section className="privacy-card deletion-card" id="deletion">
            <div className="privacy-card-header">
              <div className="privacy-card-icon" style={{ background: '#fee2e2' }}>
                <Trash2 size={22} color="#dc2626" />
              </div>
              <h2>7. Delete Your Qobo1live Account & Data</h2>
            </div>
            <p>In compliance with Google Play Developer Policies and Facebook Platform Rules, Qobo1live provides multiple simple ways to delete your account and personal data:</p>

            <div className="deletion-box">
              <p style={{ color: '#991b1b', fontWeight: 800, marginBottom: '6px' }}>Option A: In the App (Instant Self-Service Deletion)</p>
              <p style={{ color: '#475569', margin: 0 }}>
                Open the Qobo1live App → Go to <strong>Profile / Settings</strong> → Tap <strong>Delete Account</strong> → Confirm your request. Your account and associated profile, messages, wallet balances, and social links are purged immediately.
              </p>
            </div>

            <div className="deletion-box">
              <p style={{ color: '#991b1b', fontWeight: 800, marginBottom: '6px' }}>Option B: Web / Email Request (Without Requiring App)</p>
              <p style={{ color: '#475569', margin: 0 }}>
                Send an email to <a href="mailto:qobolive916@gmail.com?subject=Qobo1live%20Account%20Deletion" style={{ color: '#dc2626', fontWeight: 700 }}>qobolive916@gmail.com</a> with the subject line <strong>“Qobo1live Account Deletion”</strong>. Include your User ID and registered Phone Number or Email. Alternatively, call or WhatsApp customer support at <a href="tel:+916351894341" style={{ color: '#dc2626', fontWeight: 700 }}>+91 6351894341</a>. Verified deletion requests are completed within <strong>3 to 7 business days</strong>.
              </p>
            </div>

            <div className="deletion-box">
              <p style={{ color: '#991b1b', fontWeight: 800, marginBottom: '6px' }}>Option C: Facebook Login Activity Removal</p>
              <ol style={{ marginBottom: 0, marginTop: '6px', color: '#475569' }}>
                <li>Go to your Facebook Account's "Settings & Privacy" menu → Click "Settings".</li>
                <li>Look for "Apps and Websites" to view connected services.</li>
                <li>Search for "Qobo1live" and click "Remove".</li>
              </ol>
            </div>
            <p style={{ marginTop: '16px', fontSize: '0.88rem', color: '#7f1d1d' }}>
              <em>Scope of Deletion: Account deletion purges profile data, photos, chat messages, FCM tokens, wallet balances, backpack items, and host applications across our database and Firebase. Statutory financial records are retained separately as described in Section 6.</em>
            </p>
          </section>

          {/* 8. Your Rights */}
          <section className="privacy-card" id="rights">
            <div className="privacy-card-header">
              <div className="privacy-card-icon"><Zap size={22} color="#7c3aed" /></div>
              <h2>8. Your Rights and Choices</h2>
            </div>
            <p>
              You have the right to access, export, correct, or request deletion of your personal data, or revoke granted device permissions at any time. To submit a request, contact <a href="mailto:qobolive916@gmail.com" style={{ color: '#2563eb' }}>qobolive916@gmail.com</a> or phone <a href="tel:+916351894341" style={{ color: '#2563eb' }}>+91 6351894341</a>.
            </p>
          </section>

          {/* 9. Age Eligibility */}
          <section className="privacy-card" id="children">
            <div className="privacy-card-header">
              <div className="privacy-card-icon"><AlertTriangle size={22} color="#d97706" /></div>
              <h2>9. Age Eligibility (Strictly 18+ Requirement)</h2>
            </div>
            <p>
              Qobo1live is strictly intended for individuals aged <strong>18 and older</strong>. We do not knowingly collect personal data from or register minors under 18 years old. Accounts discovered to belong to minors are immediately suspended and purged. If you suspect an underage user on Qobo1live, notify us immediately at <a href="mailto:qobolive916@gmail.com" style={{ color: '#2563eb' }}>qobolive916@gmail.com</a>.
            </p>
          </section>

          {/* 10. Contact Us */}
          <section className="privacy-card" id="contact">
            <div className="privacy-card-header">
              <div className="privacy-card-icon"><Mail size={22} color="#2563eb" /></div>
              <h2>10. Contact Us & Legal Operator</h2>
            </div>
            <p>For privacy inquiries, grievance redressal, or data deletion requests, contact our team at:</p>

            <div className="contact-box">
              <div className="contact-row">
                <strong>📧 Support Email:</strong>
                <a href="mailto:qobolive916@gmail.com" style={{ color: '#2563eb' }}>qobolive916@gmail.com</a>
              </div>
              <div className="contact-row">
                <strong>📱 Phone / Mobile:</strong>
                <a href="tel:+916351894341" style={{ color: '#2563eb' }}>+91 6351894341</a>
              </div>
              <div className="contact-row">
                <strong>🌐 Website:</strong>
                <a href="https://www.qobo1live.com" target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb' }}>www.qobo1live.com</a>
              </div>
              <div className="contact-row" style={{ marginBottom: 0 }}>
                <strong>🏢 Legal Operator:</strong>
                <span>Qobo1live Technologies, India</span>
              </div>
            </div>
          </section>
        </div>

        <footer style={{
          textAlign: 'center',
          marginTop: '45px',
          paddingTop: '25px',
          borderTop: '1px solid #e2e8f0',
          color: '#64748b',
          fontSize: '0.9rem',
          fontWeight: 600
        }}>
          &copy; {new Date().getFullYear()} Qobo1live Technologies. All rights reserved. · Official Privacy Policy
        </footer>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
