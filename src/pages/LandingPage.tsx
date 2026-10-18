import { ArrowDownToLine, Download, ShieldCheck, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

type Props = {
  onEnterApp: () => void;
  onInstall: () => Promise<void>;
  installPrompt: InstallPromptEvent | null;
  installed: boolean;
  standalone: boolean;
};

export const LandingPage = ({ onEnterApp, onInstall, installPrompt, installed, standalone }: Props) => {
  const [canInstall, setCanInstall] = useState(false);
  const isStandalone = installed || standalone;

  useEffect(() => {
    setCanInstall(Boolean(installPrompt));
  }, [installPrompt]);

  const handleInstall = async () => {
    await onInstall();
  };

  const handleEnter = () => {
    onEnterApp();
  };

  return (
    <div className="landing-page">
      <header className="landing-header">
        <div className="landing-brand">
          <div className="landing-brand-symbol">
            <ShieldCheck size={28} />
          </div>
          <div className="landing-brand-text">
            FIBER<span>LINKGUARD</span>
            <small>F.L.G • FTTH OPERATIONS</small>
          </div>
        </div>
        <div className="landing-actions">
          <button className="landing-secondary-btn" onClick={handleEnter}>Open App</button>
          {!isStandalone && (
            <button className="landing-primary-btn" onClick={handleInstall}>
              <Download size={18} />
              Download App
            </button>
          )}
        </div>
      </header>

      <main className="landing-main">
        <section className="landing-hero">
          <div className="landing-hero-content">
            <div className="landing-eyebrow">
              <span className="landing-eyebrow-dot" />
              FTTH FIBRE INTELLIGENCE PLATFORM
            </div>
            <h1 className="landing-title">
              Stop Guesswork.
              <br />
              Fix Fibre Faster.
            </h1>
            <p className="landing-subtitle">
              FIBERLINKGUARD is a Progressive Web App built for FTTH field teams. Manage network inventory, provision connections, test with smart tools, and resolve faults faster — all in one app.
            </p>
            <div className="landing-cta-group">
              {!isStandalone && (
                <button className="landing-primary-btn large" onClick={handleInstall}>
                  <ArrowDownToLine size={20} />
                  Download for your device
                </button>
              )}
              <button className="landing-secondary-btn large" onClick={handleEnter}>
                <Zap size={18} />
                Open full app
              </button>
            </div>
            {!isStandalone && !canInstall && (
              <p className="landing-install-hint">
                No one-tap install here — on iPhone or iPad, tap Share → Add to Home Screen.
              </p>
            )}
            <div className="landing-benefits">
              <div className="landing-benefit">
                <ShieldCheck size={16} />
                <span>Works offline after first load</span>
              </div>
              <div className="landing-benefit">
                <Zap size={16} />
                <span>Smart testing & fault isolation</span>
              </div>
              <div className="landing-benefit">
                <Download size={16} />
                <span>Installable on all phones & browsers</span>
              </div>
            </div>
          </div>
          <div className="landing-hero-visual" aria-hidden="true">
            <div className="landing-ring ring-1" />
            <div className="landing-ring ring-2" />
            <div className="landing-ring ring-3" />
            <div className="landing-core">
              <ShieldCheck size={48} />
            </div>
          </div>
        </section>

        <section className="landing-features">
          <h2 className="landing-section-title">Key Features</h2>
          <div className="landing-feature-grid">
            <div className="landing-feature-card">
              <h3>Network Inventory & GIS Mapping</h3>
              <p>Digital as-built, poles, joints, splitters, customers — mapped and tracked.</p>
            </div>
            <div className="landing-feature-card">
              <h3>One-Click Provisioning</h3>
              <p>Streamlined workflows to activate and manage customer connections.</p>
            </div>
            <div className="landing-feature-card">
              <h3>Mean Time to Repair (MTTR)</h3>
              <p>Track faults, response times, and resolution for better uptime.</p>
            </div>
            <div className="landing-feature-card">
              <h3>Bluetooth Hardware Integration</h3>
              <p>Pair with OPM, OTDR, VFL for smart, live testing from the app.</p>
            </div>
          </div>
        </section>

        <section className="landing-install">
          <h2 className="landing-section-title">Download & Install</h2>
          <div className="landing-install-grid">
            <div className="landing-install-card">
              <h3>iOS (Safari)</h3>
              <ol>
                <li>Open this link in Safari</li>
                <li>Tap Share → Add to Home Screen</li>
                <li>Tap Add</li>
              </ol>
            </div>
            <div className="landing-install-card">
              <h3>Android (Chrome)</h3>
              <ol>
                <li>Open this link in Chrome</li>
                <li>Tap ⋮ → Install app / Add to Home screen</li>
                <li>Confirm the prompt</li>
              </ol>
            </div>
            <div className="landing-install-card">
              <h3>Desktop (Chrome/Edge)</h3>
              <ol>
                <li>Open in Chrome or Edge</li>
                <li>Look for Install icon in address bar</li>
                <li>Or use the Download button above</li>
              </ol>
            </div>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <span>FIBERLINKGUARD • F.L.G</span>
        <span>FTTH Operations Platform</span>
      </footer>
    </div>
  );
};

export default LandingPage;
