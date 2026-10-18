import { useCallback, useEffect, useState } from 'react';
import {
  ArrowLeftRight,
  Boxes,
  BriefcaseBusiness,
  Building2,
  ChevronDown,
  CloudOff,
  Download,
  Gauge,
  History,
  House,
  Map,
  Menu,
  MoreHorizontal,
  Search,
  Settings2,
  Shield,
  ShieldCheck,
  SignalLow,
  Smartphone,
  Timer,
  Wifi,
  X,
  Zap,
} from 'lucide-react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import Brand from './components/Brand';
import AuthDialog from './components/AuthDialog';
import { useAuth } from './lib/auth';
import LandingPage from './pages/LandingPage';
import OverviewPage from './pages/OverviewPage';
import PowerPage from './pages/PowerPage';
import ConverterPage from './pages/ConverterPage';
import InventoryPage from './pages/InventoryPage';
import ProvisioningPage from './pages/ProvisioningPage';
import MttrPage from './pages/MttrPage';
import FaultPage from './pages/FaultPage';
import SpliceQcPage from './pages/SpliceQcPage';
import StockPage from './pages/StockPage';
import CustomersPage from './pages/CustomersPage';
import MonitoringPage from './pages/MonitoringPage';
import HistoryPage from './pages/HistoryPage';
import JobsPage from './pages/JobsPage';
import SettingsPage from './pages/SettingsPage';
import type { Reading, View } from './types';
import './styles/app.css';

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

const DB = 'fiberlinkguard-local-v2';
const STORE = 'readings';

const openDb = (): Promise<IDBDatabase> =>
  new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
      reject(new Error('IndexedDB unavailable'));
      return;
    }
    const request = indexedDB.open(DB, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE)) {
        request.result.createObjectStore(STORE, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

const loadReadings = async (): Promise<Reading[]> => {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const request = db.transaction(STORE, 'readonly').objectStore(STORE).getAll();
    request.onsuccess = () => {
      db.close();
      resolve((request.result as Reading[]).sort((a, b) => b.id - a.id));
    };
    request.onerror = () => {
      db.close();
      reject(request.error);
    };
  });
};

const storeReadings = async (items: Reading[]): Promise<void> => {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    const store = tx.objectStore(STORE);
    store.clear();
    items.forEach((item) => store.put(item));
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
    tx.onabort = () => {
      db.close();
      reject(tx.error);
    };
  });
};

type NavItem = { id: View; label: string; icon: typeof House; group: string };

const navItems: NavItem[] = [
  { id: 'overview', label: 'Overview', icon: House, group: 'WORKSPACE' },
  { id: 'power', label: 'Power check', icon: Gauge, group: 'FIELD TOOLS' },
  { id: 'converter', label: 'Unit converter', icon: ArrowLeftRight, group: 'FIELD TOOLS' },
  { id: 'fault', label: 'Fault locator', icon: SignalLow, group: 'FIELD TOOLS' },
  { id: 'inventory', label: 'Inventory & GIS', icon: Map, group: 'OPERATIONS' },
  { id: 'provisioning', label: 'Provisioning', icon: Zap, group: 'OPERATIONS' },
  { id: 'splicing', label: 'Splicing QC', icon: Boxes, group: 'OPERATIONS' },
  { id: 'stock', label: 'Stock', icon: Building2, group: 'OPERATIONS' },
  { id: 'customers', label: 'Customers', icon: BriefcaseBusiness, group: 'OPERATIONS' },
  { id: 'monitoring', label: 'Monitoring', icon: Timer, group: 'OPERATIONS' },
  { id: 'mttr', label: 'MTTR', icon: Timer, group: 'OPERATIONS' },
  { id: 'history', label: 'Reading history', icon: History, group: 'RECORDS' },
  { id: 'jobs', label: 'Job listings', icon: BriefcaseBusiness, group: 'RECORDS' },
  { id: 'settings', label: 'Settings', icon: Settings2, group: 'RECORDS' },
];

const App = () => {
  const [showLanding, setShowLanding] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [view, setView] = useState<View>('overview');
  const [mobileMenu, setMobileMenu] = useState(false);
  const [powerInput, setPowerInput] = useState('-18.4');
  const [lowLimit, setLowLimit] = useState('-27');
  const [highLimit, setHighLimit] = useState('-8');
  const [profile, setProfile] = useState('gpon-bplus');
  const [siteName, setSiteName] = useState('');
  const [readings, setReadings] = useState<Reading[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [storageNotice, setStorageNotice] = useState('Loading local reading storage…');
  const [toast, setToast] = useState('');
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [online, setOnline] = useState(navigator.onLine);
  const [standalone, setStandalone] = useState(
    window.matchMedia('(display-mode: standalone)').matches
  );
  const [installGuideOpen, setInstallGuideOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  const { user, signOut } = useAuth();

  const { needRefresh: [needRefresh], updateServiceWorker } = useRegisterSW({
    onRegisteredSW(_url, registration) {
      if (registration) console.info('FIBERLINKGUARD service worker ready');
    },
  });

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    const before = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as InstallPromptEvent);
    };
    const done = () => {
      setInstalled(true);
      setStandalone(true);
      setInstallPrompt(null);
      setToast('FIBERLINKGUARD has been installed.');
    };
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    window.addEventListener('beforeinstallprompt', before);
    window.addEventListener('appinstalled', done);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
      window.removeEventListener('beforeinstallprompt', before);
      window.removeEventListener('appinstalled', done);
    };
  }, []);

  useEffect(() => {
    let active = true;
    loadReadings()
      .then((saved) => {
        if (!active) return;
        setReadings(saved);
        setLoaded(true);
        setStorageNotice('Saved on this device · available offline after first load');
      })
      .catch(() => {
        if (active) {
          setLoaded(true);
          setStorageNotice('Local storage unavailable in this browser.');
        }
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (loaded) {
      void storeReadings(readings)
        .then(() => setStorageNotice('Saved on this device · available offline after first load'))
        .catch(() => setStorageNotice('Could not save locally. Check browser storage settings.'));
    }
  }, [readings, loaded]);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(''), 3500);
    return () => window.clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    if (!loading) return;
    const messages = [
      'Starting workspace…',
      'Loading field tools…',
      'Restoring local records…',
      'Ready',
    ];
    setLoadingStep(0);
    const timers = [
      window.setTimeout(() => setLoadingStep(1), 700),
      window.setTimeout(() => setLoadingStep(2), 1500),
      window.setTimeout(() => setLoadingStep(3), 2300),
      window.setTimeout(() => setLoading(false), 2900),
    ];
    void messages;
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [loading]);

  const go = (next: View) => {
    setView(next);
    setMobileMenu(false);
  };

  const enterApp = useCallback(() => {
    setShowLanding(false);
    setLoading(true);
    setView('overview');
  }, []);

  const installApp = async () => {
    if (standalone || installed) {
      setToast('FIBERLINKGUARD is already running as an installed app.');
      return;
    }
    if (!installPrompt) {
      setInstallGuideOpen(true);
      return;
    }
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    setToast(
      choice.outcome === 'accepted'
        ? 'Installation accepted.'
        : 'Installation cancelled; you can install FIBERLINKGUARD later.'
    );
    setInstallPrompt(null);
  };

  const saveReading = () => {
    const n = Number(powerInput);
    const lo = Number(lowLimit);
    const hi = Number(highLimit);
    if (
      powerInput.trim() === '' ||
      lowLimit.trim() === '' ||
      highLimit.trim() === '' ||
      !Number.isFinite(n) ||
      !Number.isFinite(lo) ||
      !Number.isFinite(hi) ||
      lo >= hi
    ) {
      setToast('Enter a valid reading and a lower limit below the upper limit.');
      return;
    }
    const status =
      n < lo ? 'Signal may be too weak' : n > hi ? 'Signal may be too strong' : 'Within selected range';
    const item: Reading = {
      id: Date.now(),
      value: n,
      label: `${siteName.trim() || 'Untitled site'} · RX reading`,
      date: new Date().toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }),
      status,
    };
    setReadings((current) => [item, ...current]);
    setToast('Assessment saved on this device.');
    go('history');
  };

  const clearReadings = () => {
    setReadings([]);
    setToast('Local reading history cleared.');
  };

  const onToast = useCallback((message: string) => setToast(message), []);

  const userInitials = user ? (user.email?.charAt(0).toUpperCase() ?? 'U') : 'FT';

  const handleAccountClick = () => {
    if (!user) {
      setAuthOpen(true);
      return;
    }
    void signOut()
      .then(() => setToast('Signed out.'))
      .catch(() => setToast('Could not sign out. Try again.'));
  };

  const isAppleMobile =
    /iphone|ipad|ipod/i.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

  const loadingMessages = ['Starting workspace…', 'Loading field tools…', 'Restoring local records…', 'Ready'];

  if (showLanding) {
    return (
      <LandingPage
        onEnterApp={enterApp}
        onInstall={installApp}
        installPrompt={installPrompt}
        installed={installed}
        standalone={standalone}
      />
    );
  }

  if (loading) {
    return (
      <div className="loading-screen" role="status" aria-label="Loading FIBERLINKGUARD">
        <div className="loading-spinner" />
        <div className="loading-wordmark">
          FIBER<span>LINKGUARD</span>
        </div>
        <div className="loading-bar">
          <div className="loading-bar-fill" />
        </div>
        <span className="loading-status">{loadingMessages[loadingStep]}</span>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileMenu ? 'sidebar-open' : ''}`}>
        <Brand />
        <div className="workspace-pill">
          <span className="online-dot" /> LOCAL WORKSPACE <ChevronDown size={14} />
        </div>
        <p className="nav-caption">WORKSPACE</p>
        <nav className="main-nav" aria-label="Main navigation">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`nav-item ${view === id ? 'nav-item-active' : ''}`}
              onClick={() => go(id)}
            >
              <Icon size={18} strokeWidth={1.8} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-spacer" />
        <div className={`offline-card ${online ? '' : 'offline-card-disconnected'}`}>
          <div className="offline-icon">
            {online ? <Wifi size={17} /> : <CloudOff size={17} />}
          </div>
          <div>
            <strong>{online ? 'Offline ready' : 'You are offline'}</strong>
            <p>Core tools run on-device</p>
          </div>
          <span className="status-dot" />
        </div>
        <div className="profile-row">
          <div className="avatar">{userInitials}</div>
          <div className="profile-copy">
            <strong>{user ? user.email : 'Field technician'}</strong>
            <span>{user ? 'Signed in' : 'Local workspace'}</span>
          </div>
          <button
            className="icon-button"
            aria-label={user ? 'Sign out' : 'Sign in'}
            onClick={handleAccountClick}
          >
            <MoreHorizontal size={19} />
          </button>
        </div>
        <div className="sidebar-footer">
          FIBERLINKGUARD <span>•</span> F.L.G
        </div>
      </aside>

      {mobileMenu && (
        <button className="mobile-scrim" aria-label="Close menu" onClick={() => setMobileMenu(false)} />
      )}

      <main className="main-area">
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="icon-button mobile-menu-button"
              aria-label="Open navigation"
              onClick={() => setMobileMenu(true)}
            >
              <Menu size={21} />
            </button>
            <div className="breadcrumb">
              Workspace <span>/</span> <strong>{navItems.find((n) => n.id === view)?.label}</strong>
            </div>
          </div>
          <div className="topbar-actions">
            <div className={`connection-state ${online ? '' : 'connection-offline'}`}>
              <span className={online ? 'online-dot' : 'offline-dot'} />
              <span>{online ? 'Online ready' : 'Offline mode'}</span>
            </div>
            <button className="install-app-button" onClick={installApp}>
              <Download size={15} />
              <span>
                {installed || standalone ? 'Installed' : installPrompt ? 'Install app' : 'Install options'}
              </span>
            </button>
            <button
              className="icon-button"
              aria-label="Search saved readings"
              onClick={() => {
                go('history');
                onToast('Search your saved readings on the history page.');
              }}
            >
              <Search size={18} />
            </button>
            <button
              className="icon-button"
              aria-label="Settings"
              onClick={() => go('settings')}
            >
              <Settings2 size={18} />
            </button>
            <button
              className="top-account"
              aria-label={user ? 'Sign out' : 'Sign in'}
              title={user ? 'Sign out' : 'Sign in'}
              onClick={handleAccountClick}
            >
              <span className="top-avatar">{userInitials}</span>
              {!user && <span className="top-account-label">Sign in</span>}
            </button>
          </div>
        </header>

        <div className="page-content" key={view}>
          {view === 'overview' && (
            <OverviewPage
              readings={readings}
              online={online}
              installed={installed || standalone}
              onNavigate={go}
              onInstall={installApp}
              onToast={onToast}
            />
          )}
          {view === 'power' && (
            <PowerPage
              powerInput={powerInput}
              setPowerInput={setPowerInput}
              lowLimit={lowLimit}
              setLowLimit={setLowLimit}
              highLimit={highLimit}
              setHighLimit={setHighLimit}
              profile={profile}
              setProfile={(v) => {
                setProfile(v);
                if (v === 'gpon-bplus') {
                  setLowLimit('-27');
                  setHighLimit('-8');
                }
              }}
              siteName={siteName}
              setSiteName={setSiteName}
              onSave={saveReading}
              onToast={onToast}
            />
          )}
          {view === 'converter' && <ConverterPage />}
          {view === 'fault' && <FaultPage />}
          {view === 'inventory' && <InventoryPage onToast={onToast} />}
          {view === 'provisioning' && <ProvisioningPage onToast={onToast} />}
          {view === 'splicing' && <SpliceQcPage />}
          {view === 'stock' && <StockPage />}
          {view === 'customers' && <CustomersPage />}
          {view === 'monitoring' && <MonitoringPage />}
          {view === 'mttr' && <MttrPage onToast={onToast} />}
          {view === 'history' && (
            <HistoryPage
              readings={readings}
              storageNotice={storageNotice}
              onClear={clearReadings}
              onStart={() => go('power')}
            />
          )}
          {view === 'jobs' && <JobsPage onToast={onToast} onSignIn={() => setAuthOpen(true)} />}
          {view === 'settings' && (
            <SettingsPage onClear={clearReadings} onAbout={() => setAboutOpen(true)} />
          )}
        </div>

        <footer className="app-footer">
          <span>
            FIBERLINKGUARD <span className="footer-dot">•</span> FIELD TOOLS
          </span>
          <span>
            <Shield size={13} /> Local-first <span className="footer-dot">·</span> F.L.G
          </span>
        </footer>
      </main>

      {toast && (
        <div className="toast-message" role="status">
          <ShieldCheck size={17} />
          {toast}
          <button className="toast-close" onClick={() => setToast('')} aria-label="Dismiss message">
            <X size={15} />
          </button>
        </div>
      )}

      {needRefresh && (
        <div className="update-banner" role="status">
          <span>A new FIBERLINKGUARD version is ready.</span>
          <button className="secondary-button" onClick={() => updateServiceWorker(true)}>
            Update now
          </button>
        </div>
      )}

      {installGuideOpen && (
        <div
          className="install-guide-backdrop"
          role="presentation"
          onClick={() => setInstallGuideOpen(false)}
        >
          <section
            className="install-guide-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="install-guide-title"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="install-guide-close icon-button"
              aria-label="Close install instructions"
              onClick={() => setInstallGuideOpen(false)}
            >
              <X size={18} />
            </button>
            <div className="install-guide-symbol">
              <Smartphone size={25} />
            </div>
            <p className="eyebrow">FIBERLINKGUARD / INSTALLATION</p>
            <h2 id="install-guide-title">Add FIBERLINKGUARD to your phone</h2>
            {isAppleMobile ? (
              <div className="install-steps">
                <p>
                  <strong>On iPhone or iPad</strong>
                </p>
                <ol>
                  <li>
                    Open this deployed link in <strong>Safari</strong>.
                  </li>
                  <li>
                    Tap the <strong>Share</strong> icon.
                  </li>
                  <li>
                    Choose <strong>Add to Home Screen</strong>.
                  </li>
                  <li>
                    Tap <strong>Add</strong> to finish.
                  </li>
                </ol>
              </div>
            ) : (
              <div className="install-steps">
                <p>
                  <strong>On Android</strong>
                </p>
                <ol>
                  <li>
                    Open this deployed HTTPS link in <strong>Chrome</strong>.
                  </li>
                  <li>
                    Tap the browser&apos;s <strong>⋮ menu</strong>.
                  </li>
                  <li>
                    Choose <strong>Install app</strong> or <strong>Add to Home screen</strong>.
                  </li>
                  <li>Confirm the prompt.</li>
                </ol>
              </div>
            )}
            <button
              className="primary-button full-button"
              onClick={() => setInstallGuideOpen(false)}
            >
              Got it
            </button>
          </section>
        </div>
      )}

      {aboutOpen && (
        <div className="install-guide-backdrop" role="presentation" onClick={() => setAboutOpen(false)}>
          <section
            className="install-guide-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="about-title"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="install-guide-close icon-button"
              aria-label="Close about"
              onClick={() => setAboutOpen(false)}
            >
              <X size={18} />
            </button>
            <div className="install-guide-symbol">
              <ShieldCheck size={25} />
            </div>
            <p className="eyebrow">ABOUT FIBERLINKGUARD</p>
            <h2 id="about-title">F.L.G — FTTH Operations Platform</h2>
            <div className="install-steps">
              <p>
                FIBERLINKGUARD (F.L.G) is an all-in-one FTTH field toolkit for fibre technicians —
                power checking, fault isolation, Bluetooth smart testing, inventory, provisioning,
                quality control, stock control and live monitoring. Everything works offline and on
                any phone.
              </p>
            </div>
            <button
              className="primary-button full-button"
              onClick={() => setAboutOpen(false)}
            >
              Got it
            </button>
          </section>
        </div>
      )}

      {authOpen && <AuthDialog onClose={() => setAuthOpen(false)} onToast={onToast} />}
    </div>
  );
};

export default App;
