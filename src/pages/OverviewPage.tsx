import {
  Activity,
  ArrowLeftRight,
  ArrowRight,
  ArrowUpRight,
  Boxes,
  Bluetooth,
  Building2,
  Check,
  Cpu,
  Gauge,
  History,
  Map,
  RadioTower,
  SignalLow,
  Smartphone,
  Timer,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import type { Reading, View } from '../types';

type Props = {
  readings: Reading[];
  online: boolean;
  installed: boolean;
  device: 'mobile' | 'desktop';
  onNavigate: (view: View, mode?: 'manual' | 'bluetooth') => void;
  onInstall: () => void;
  onToast: (message: string) => void;
};

type Tool = {
  id: View;
  icon: LucideIcon;
  title: string;
  desc: string;
  link: string;
  mode?: 'manual' | 'bluetooth';
};

const tools: Tool[] = [
  {
    id: 'power' as View,
    icon: Gauge,
    title: 'Optical power check',
    desc: 'Interpret a meter reading and compare it with a reference threshold.',
    link: 'Open checker',
  },
  {
    id: 'converter' as View,
    icon: ArrowLeftRight,
    title: 'Power converter',
    desc: 'Convert dBm to watts and distance between km and m, with formulas shown.',
    link: 'Open converter',
  },
  {
    id: 'fault' as View,
    icon: SignalLow,
    title: 'Blind fault locator',
    desc: 'Stop guessing on site — isolate the break from power and LOS.',
    link: 'Locate fault',
  },
  {
    id: 'power' as View,
    icon: Bluetooth,
    title: 'Bluetooth smart test',
    desc: 'Type a reading or capture live dBm from a meter over Bluetooth.',
    link: 'Open power checker',
    mode: 'bluetooth',
  },
  {
    id: 'inventory' as View,
    icon: Map,
    title: 'Inventory & GIS',
    desc: 'Digital as-built for poles, joint boxes, splitters and customers.',
    link: 'Open inventory',
  },
  {
    id: 'provisioning' as View,
    icon: Zap,
    title: 'One-click provisioning',
    desc: 'Activate a new subscriber in a single guided flow.',
    link: 'Provision',
  },
  {
    id: 'splicing' as View,
    icon: Boxes,
    title: 'Splicing & loss QC',
    desc: 'Document every splice with a photo and a measured loss.',
    link: 'Log splice',
  },
  {
    id: 'stock' as View,
    icon: Building2,
    title: 'Stock & materials',
    desc: 'Track cable, sleeves, ONTs and patch cords on site.',
    link: 'Open stock',
  },
  {
    id: 'mttr' as View,
    icon: Timer,
    title: 'Mean time to repair',
    desc: 'Track every fault ticket from open to resolution.',
    link: 'Open tickets',
  },
  {
    id: 'monitoring' as View,
    icon: RadioTower,
    title: 'Live monitoring',
    desc: 'Watch signal levels across your OLT and splitters live.',
    link: 'Open monitoring',
  },
  {
    id: 'history' as View,
    icon: History,
    title: 'Reading history',
    desc: 'Keep a local record of checks so you can review results later.',
    link: 'View history',
  },
];

const OverviewPage = ({ readings, online, installed, device, onNavigate, onInstall, onToast }: Props) => {
  const installedHere = device === 'mobile' ? 'this phone' : 'this system';
  const installElsewhere = device === 'mobile' ? 'your computer' : 'your phone';
  return (
    <div className="page-stack">
      <section className="welcome-row">
        <div>
          <div className="eyebrow">
            <span className="eyebrow-line" /> FIELD OPERATIONS · OVERVIEW
          </div>
          <h1>
            Signal clarity.
            <br />
            <span>Without the guesswork.</span>
          </h1>
          <p className="page-intro">
            Your complete FTTH field toolkit — power checks, fault isolation, Bluetooth testing,
            inventory, provisioning and live monitoring in one place.
          </p>
        </div>
        <div className="welcome-chip">
          <div className="chip-icon">
            <RadioTower size={19} />
          </div>
          <div>
            <span>WORKSPACE STATUS</span>
            <strong>Ready for checks</strong>
          </div>
          <span className="status-dot" />
        </div>
      </section>

      <section className="pwa-status-panel">
        <div className="pwa-status-icon">
          <Smartphone size={19} />
        </div>
        <div className="pwa-status-copy">
          <strong>
            {installed
              ? `FIBERLINKGUARD is installed on ${installedHere}`
              : 'Take FIBERLINKGUARD with you'}
          </strong>
          <span>
            {installed
              ? `You can also install it on ${installElsewhere} — open the web version there and tap Download App.`
              : online
                ? 'Install it on your phone for an app-like, full-screen experience.'
                : 'You are offline. Core tools and saved readings remain available after first load.'}
          </span>
        </div>
        {!installed && (
          <button className="pwa-action-button" onClick={onInstall}>
            <Smartphone size={15} />
            Install app
          </button>
        )}
      </section>

      <section className="hero-card">
        <div className="hero-grid" />
        <div className="hero-copy">
          <div className="hero-kicker">
            <Zap size={14} /> OPTICAL FIELD TOOLKIT
          </div>
          <h2>
            Know what your
            <br />
            power reading means.
          </h2>
          <p>
            Enter the reading from your optical meter. Get a clear result, unit context and the
            next thing to verify.
          </p>
          <button className="primary-button" onClick={() => onNavigate('power')}>
            Start a power check <ArrowRight size={17} />
          </button>
          <div className="hero-note">
            <Cpu size={14} /> Runs locally · No meter connection required
          </div>
        </div>
        <div className="hero-visual" aria-hidden="true">
          <div className="signal-rings ring-one" />
          <div className="signal-rings ring-two" />
          <div className="signal-rings ring-three" />
          <div className="signal-core">
            <Activity size={39} />
          </div>
          <div className="floating-readout readout-top">
            <span className="readout-pulse" /> OPTICAL RX <strong>-18.4 <small>dBm</small></strong>
          </div>
          <div className="floating-readout readout-bottom">
            <span>POWER STATUS</span>
            <strong><span className="status-dot" /> Check result</strong>
          </div>
          <svg className="signal-wave" viewBox="0 0 280 48" fill="none">
            <path
              d="M1 25H38L50 25L60 8L72 40L85 15L98 27H132L144 27L155 5L167 43L180 18L192 26H225L238 26L250 12L261 36L270 25H279"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </section>

      <section className="section-heading">
        <div>
          <h2>Your tools</h2>
          <p>Fast, focused utilities for field work.</p>
        </div>
        <span className="section-meta">{tools.length} TOOLS</span>
      </section>

      <section className="tool-grid">
        {tools.map(({ id, icon: Icon, title, desc, link, mode }) => (
          <button key={id} className="tool-card" onClick={() => onNavigate(id, mode)}>
            <div className="tool-icon icon-blue">
              <Icon size={21} />
            </div>
            <span className="tool-arrow">
              <ArrowUpRight size={18} />
            </span>
            <h3>{title}</h3>
            <p>{desc}</p>
            <span className="tool-link">
              {link} <ArrowRight size={14} />
            </span>
          </button>
        ))}
      </section>

      <section className="bottom-grid">
        <div className="panel recent-panel">
          <div className="panel-heading">
            <div>
              <h3>Recent readings</h3>
              <p>Your latest local checks</p>
            </div>
            <button className="text-button" onClick={() => onNavigate('history')}>
              View all <ArrowRight size={14} />
            </button>
          </div>
          <div className="reading-list">
            {readings.length ? (
              readings.slice(0, 3).map((r) => (
                <div className="reading-row" key={r.id}>
                  <div className="reading-icon">
                    <Activity size={17} />
                  </div>
                  <div className="reading-info">
                    <strong>{r.label}</strong>
                    <span>{r.date}</span>
                  </div>
                  <div className="reading-value">
                    <strong>{r.value.toFixed(1)} <small>dBm</small></strong>
                    <span
                      className={
                        r.status === 'Review needed' ||
                        r.status === 'Signal may be too weak' ||
                        r.status === 'Signal may be too strong'
                          ? 'text-warning'
                          : 'text-muted'
                      }
                    >
                      {r.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-recent">
                <Activity size={18} />
                <span>No readings yet. Run your first optical power check.</span>
                <button className="text-button" onClick={() => onNavigate('power')}>
                  Check signal <ArrowRight size={14} />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="panel note-panel">
          <div className="note-icon">
            <Check size={19} />
          </div>
          <div>
            <span className="eyebrow">READY FOR THE FIELD</span>
            <h3>Everything works offline.</h3>
            <p>
              All tools run on your device. Once the app is loaded you can keep checking, logging
              and locating faults with no connection.
            </p>
            {!installed && (
              <button
                className="text-button"
                onClick={() => onToast('Install FIBERLINKGUARD for a full-screen, offline field experience.')}
              >
                Install for offline use <ArrowRight size={14} />
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default OverviewPage;
