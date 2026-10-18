import { ArrowDownToLine, Check, Download, WifiOff, Zap } from 'lucide-react';
import Logo from '../components/Logo';

type Props = {
  onEnterApp: () => void;
  onInstall: () => Promise<void>;
  installed: boolean;
  standalone: boolean;
};

export const LandingPage = ({ onEnterApp, onInstall, installed, standalone }: Props) => {
  const isStandalone = installed || standalone;
  const alreadyInstalled = installed && !standalone;

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
            <Logo size="md" alt="" />
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
              {alreadyInstalled ? <Check size={18} /> : <Download size={18} />}
              {alreadyInstalled ? 'Already installed' : 'Download App'}
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
                  {alreadyInstalled ? <Check size={20} /> : <ArrowDownToLine size={20} />}
                  {alreadyInstalled ? 'Already installed on this device' : 'Download for your device'}
                </button>
              )}
              <button className="landing-secondary-btn large" onClick={handleEnter}>
                <Zap size={18} />
                Open full app
              </button>
            </div>
            {alreadyInstalled && (
              <p className="landing-install-hint">
                FIBERLINKGUARD is already installed on this device. Open it from your apps or Start
                menu — you don’t need to download it again.
              </p>
            )}
            <div className="landing-benefits">
              <div className="landing-benefit">
                <WifiOff size={16} />
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
              <Logo size="xl" full alt="" />
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
          <h2 className="landing-section-title">Works on every device</h2>
          <p className="landing-install-note">
            One download for the whole team — FIBERLINKGUARD runs on iPhone and iPad (Safari),
            Android phones (Chrome), and laptops and desktops on Chrome or Edge for Windows, macOS
            and Linux.
          </p>
          <div className="landing-platforms">
            <span>iPhone</span>
            <span>iPad</span>
            <span>Android</span>
            <span>Windows</span>
            <span>macOS</span>
            <span>Linux</span>
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
