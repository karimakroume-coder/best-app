import React from 'react';

const GOLD = '#C8A951';
const CREAM = '#F5F0E6';
const BG = '#0D0800';
const DIM = '#555';

const section = { marginBottom: '32px' };
const h2 = {
  fontFamily: 'Bebas Neue, sans-serif', color: GOLD, fontSize: '18px',
  letterSpacing: '4px', marginBottom: '12px', marginTop: '24px',
};
const p = {
  fontFamily: 'Arial, sans-serif', color: CREAM, fontSize: '14px',
  lineHeight: 1.7, marginBottom: '12px',
};
const li = {
  fontFamily: 'Arial, sans-serif', color: CREAM, fontSize: '14px',
  lineHeight: 1.7, marginBottom: '6px', marginLeft: '16px',
};

function Privacy() {
  return (
    <div style={{ backgroundColor: BG, minHeight: '100vh', padding: '40px 24px 80px',
                  maxWidth: '700px', margin: '0 auto', boxSizing: 'border-box' }}>
      <div style={{ fontFamily: 'Pacifico, cursive', color: GOLD, fontSize: '32px',
                    textAlign: 'center', marginBottom: '4px' }}>
        BEST
      </div>
      <div style={{ fontFamily: 'Bebas Neue, sans-serif', color: GOLD, fontSize: '16px',
                    letterSpacing: '6px', textAlign: 'center', marginBottom: '8px' }}>
        PRIVACY POLICY
      </div>
      <div style={{ fontFamily: 'Arial, sans-serif', color: DIM, fontSize: '12px',
                    textAlign: 'center', marginBottom: '40px' }}>
        Effective Date: August 17, 2026
      </div>

      <div style={section}>
        <p style={p}>
          BEST ("we", "us", "our") is an independent video ranking platform.
          This Privacy Policy explains what data we collect, how we use it,
          and your rights. We built BEST to be different — that extends to
          how we handle your information.
        </p>
      </div>

      <div style={section}>
        <h2 style={h2}>1. DATA WE COLLECT</h2>
        <p style={p}>When you use BEST, we collect the following:</p>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li style={li}><strong style={{ color: GOLD }}>Account information</strong> — email address, username, and authentication credentials (managed by Supabase Auth).</li>
          <li style={li}><strong style={{ color: GOLD }}>Device identifier</strong> — a unique device ID used to associate your actions with your account. We do not collect IMEI, MAC address, or other persistent hardware identifiers.</li>
          <li style={li}><strong style={{ color: GOLD }}>Color and Word Marks</strong> — when you assign a color and word to a video, that data is stored permanently on our servers. Marks are public by design — they are the cultural layer of BEST.</li>
          <li style={li}><strong style={{ color: GOLD }}>FLEX photos</strong> — if you use the FLEX camera feature, the photo you take is uploaded to our servers and associated with the video you are reacting to. We do not access your camera at any other time.</li>
          <li style={li}><strong style={{ color: GOLD }}>Discovery Score</strong> — your cumulative activity score (based on watching, marking, fireflagging, and other interactions) is stored and displayed on your profile.</li>
          <li style={li}><strong style={{ color: GOLD }}>Country / location</strong> — your country code is used for geographic ranking diversity. We do not collect precise GPS coordinates.</li>
          <li style={li}><strong style={{ color: GOLD }}>Video interactions</strong> — videos you watch, rank, fireflag, add to Personal Best, or vote on in Crew Best are recorded to power the ranking algorithm and your personal experience.</li>
        </ul>
      </div>

      <div style={section}>
        <h2 style={h2}>2. HOW WE USE YOUR DATA</h2>
        <ul style={{ listStyle: 'content', padding: 0 }}>
          <li style={li}><strong style={{ color: GOLD }}>Ranking algorithm</strong> — your interactions (marks, fireflags, watches) feed the independent BEST score. No single user's data determines a ranking — the algorithm works on aggregate.</li>
          <li style={li}><strong style={{ color: GOLD }}>Personalization</strong> — your Personal Best 100, color preferences, and Discovery Score milestones are used to personalize your experience within the app.</li>
          <li style={li}><strong style={{ color: GOLD }}>Platform improvement</strong> — aggregate, anonymized usage patterns help us improve BEST. We never examine individual accounts for this purpose.</li>
        </ul>
      </div>

      <div style={section}>
        <h2 style={h2}>3. WHAT WE DO NOT DO</h2>
        <ul style={{ listStyle: 'content', padding: 0 }}>
          <li style={li}>We <strong style={{ color: GOLD }}>never sell</strong> your personal data to third parties.</li>
          <li style={li}>We <strong style={{ color: GOLD }}>never share</strong> your data with advertisers or data brokers.</li>
          <li style={li}>We <strong style={{ color: GOLD }}>never track</strong> your activity outside the BEST app.</li>
          <li style={li}>We <strong style={{ color: GOLD }}>never use</strong> your data to sell targeted ads.</li>
        </ul>
      </div>

      <div style={section}>
        <h2 style={h2}>4. CAMERA PERMISSION</h2>
        <p style={p}>
          BEST requests camera access solely for the FLEX feature, which
          lets you take a single photo reaction to a video. The camera is
          <strong style={{ color: GOLD }}> not accessed continuously</strong>,
          not used in the background, and not used for facial recognition.
          You can decline camera permission and use every other feature
          of BEST without limitation.
        </p>
      </div>

      <div style={section}>
        <h2 style={h2}>5. DATA STORAGE AND SECURITY</h2>
        <p style={p}>
          Your data is stored on Supabase (PostgreSQL) with row-level
          security policies. Authentication is handled via JWT tokens.
          We use HTTPS for all API communication. We retain your data
          for as long as your account is active.
        </p>
      </div>

      <div style={section}>
        <h2 style={h2}>6. YOUR RIGHTS</h2>
        <p style={p}>
          You have the right to:
        </p>
        <ul style={{ listStyle: 'content', padding: 0 }}>
          <li style={li}>Request a copy of all data we hold about you.</li>
          <li style={li}>Request deletion of your account and associated data.</li>
          <li style={li}>Export your Discovery Score and Mark history.</li>
          <li style={li}>Revoke camera permission at any time in your device settings.</li>
        </ul>
        <p style={p}>
          To exercise any of these rights, email us at{' '}
          <span style={{ color: GOLD }}>founding@bestapp.com</span>.
        </p>
      </div>

      <div style={section}>
        <h2 style={h2}>7. CHILDREN'S PRIVACY</h2>
        <p style={p}>
          BEST is not directed at children under 13. We do not knowingly
          collect data from children. If you believe a child has provided
          us with personal information, please contact us and we will
          delete it.
        </p>
      </div>

      <div style={section}>
        <h2 style={h2}>8. CHANGES TO THIS POLICY</h2>
        <p style={p}>
          We may update this policy as BEST evolves. Significant changes
          will be announced in the app. The effective date at the top
          will always reflect the latest version.
        </p>
      </div>

      <div style={section}>
        <h2 style={h2}>9. CONTACT</h2>
        <p style={p}>
          For privacy-related requests, questions, or concerns:<br />
          <span style={{ color: GOLD, fontWeight: 'bold' }}>founding@bestapp.com</span>
        </p>
      </div>

      <div style={{ textAlign: 'center', marginTop: '40px', paddingTop: '24px',
                    borderTop: `1px solid #1A1408` }}>
        <span style={{ fontFamily: 'Bebas Neue, sans-serif', color: DIM,
                       fontSize: '11px', letterSpacing: '3px' }}>
          BEST — INDEPENDENT RANKING. YOUR DATA. YOUR RANKING.
        </span>
      </div>
    </div>
  );
}

export default Privacy;
