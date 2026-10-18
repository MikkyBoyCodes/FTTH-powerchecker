import {
  Activity,
  AlertTriangle,
  Bluetooth,
  Cable,
  CheckCircle2,
  CircleHelp,
  Keyboard,
  Link2,
  Save,
  Signal,
  SlidersHorizontal,
  TriangleAlert,
} from 'lucide-react';
import PageTitle from '../components/PageTitle';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { ToastFn } from '../types';

type Props = {
  powerInput: string;
  setPowerInput: (v: string) => void;
  lowLimit: string;
  setLowLimit: (v: string) => void;
  highLimit: string;
  setHighLimit: (v: string) => void;
  profile: string;
  setProfile: (v: string) => void;
  siteName: string;
  setSiteName: (v: string) => void;
  onSave: () => void;
  onToast: ToastFn;
};

type Result = 'weak' | 'good' | 'strong' | 'invalid';
type Mode = 'manual' | 'bluetooth';
type DeviceInfo = { name: string; id: string };

const parseDbm = (raw: string): number | null => {
  if (!raw) return null;
  const match = raw.match(/-?\d+(\.\d+)?/);
  if (!match) return null;
  const n = Number(match[0]);
  return Number.isFinite(n) ? n : null;
};

const PowerPage = (p: Props) => {
  const [mode, setMode] = useState<Mode>('manual');
  const [btSupported, setBtSupported] = useState(false);
  const [btConnected, setBtConnected] = useState<DeviceInfo | null>(null);
  const [btConnecting, setBtConnecting] = useState(false);
  const [btLive, setBtLive] = useState<number | null>(null);
  const [btRaw, setBtRaw] = useState('');
  const [wavelength, setWavelength] = useState('1490');
  const deviceRef = useRef<BluetoothDevice | null>(null);

  useEffect(() => {
    setBtSupported(typeof navigator !== 'undefined' && 'bluetooth' in navigator);
  }, []);

  const applyLive = useCallback(
    (value: number) => {
      setBtLive(value);
      p.setPowerInput(value.toFixed(1));
    },
    [p]
  );

  const connect = useCallback(async () => {
    if (!btSupported) {
      p.onToast('Web Bluetooth is not available here. Use Chrome or Edge on Android or desktop.');
      return;
    }
    setBtConnecting(true);
    try {
      const device = await navigator.bluetooth.requestDevice({ acceptAllDevices: true });
      deviceRef.current = device;
      setBtConnected({ name: device.name || 'Unnamed meter', id: device.id });
      device.addEventListener('gattserverdisconnected', () => {
        setBtConnected(null);
        p.onToast('Device disconnected.');
      });
      const server = await device.gatt?.connect();
      if (server) {
        try {
          const services = await server.getPrimaryServices();
          for (const service of services) {
            const characteristics = await service.getCharacteristics();
            for (const char of characteristics) {
              if (char.properties.notify || char.properties.indicate) {
                char.addEventListener('characteristicvaluechanged', (event: Event) => {
                  const target = event.target as DataView;
                  if (target && target.buffer) {
                    const bytes = new Uint8Array(target.buffer);
                    let raw = '';
                    for (const b of bytes) raw += String.fromCharCode(b);
                    setBtRaw(raw.trim());
                    const parsed = parseDbm(raw);
                    if (parsed !== null) applyLive(parsed);
                  }
                });
                await char.startNotifications();
              }
            }
          }
        } catch {
          // Some meters do not expose GATT services; pairing alone is fine.
        }
      }
      p.onToast(`Paired with ${device.name || 'device'}.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      p.onToast(`Pairing failed: ${message}`);
    } finally {
      setBtConnecting(false);
    }
  }, [btSupported, p, applyLive]);

  const disconnect = useCallback(() => {
    deviceRef.current?.gatt?.disconnect();
    deviceRef.current = null;
    setBtConnected(null);
    setBtLive(null);
  }, []);

  const value = Number(p.powerInput);
  const low = Number(p.lowLimit);
  const high = Number(p.highLimit);
  const validValue = p.powerInput.trim() !== '' && Number.isFinite(value);
  const validLimits =
    p.lowLimit.trim() !== '' &&
    p.highLimit.trim() !== '' &&
    Number.isFinite(low) &&
    Number.isFinite(high) &&
    low < high;
  const result: Result =
    !validValue || !validLimits ? 'invalid' : value < low ? 'weak' : value > high ? 'strong' : 'good';
  const watts = validValue ? Math.pow(10, (value - 30) / 10) : NaN;

  const resultCopy = {
    weak: {
      title: 'Signal may be too weak',
      text: 'The reading is below the selected lower limit. Check connector cleanliness, bends, splitter path and link loss; confirm with the network specification.',
      icon: TriangleAlert,
      className: 'assessment-weak',
    },
    good: {
      title: 'Within the selected range',
      text: 'This reading falls between the selected lower and upper limits. This is a power-level check only; it does not guarantee internet speed or overall service quality.',
      icon: CheckCircle2,
      className: 'assessment-good',
    },
    strong: {
      title: 'Signal may be too strong',
      text: 'The reading is above the selected upper limit. Verify the correct test point, wavelength, meter setup and receiver overload specification.',
      icon: AlertTriangle,
      className: 'assessment-strong',
    },
    invalid: {
      title: 'Awaiting a valid reading',
      text:
        mode === 'bluetooth'
          ? 'Pair a meter and capture a live reading, or switch to typing to enter a value manually.'
          : 'Enter a valid dBm reading and ensure the lower limit is less than the upper limit.',
      icon: CircleHelp,
      className: 'assessment-invalid',
    },
  }[result];

  const ResultIcon = resultCopy.icon;

  return (
    <div className="page-stack">
      <PageTitle
        eyebrow="PRIMARY FIELD TOOL"
        title="Optical power checker"
        description="Type the dBm value from your meter or capture it live over Bluetooth. FIBERLINKGUARD interprets the reading instantly."
      />

      <div className="power-mode-bar">
        <div className="power-toggle" role="tablist" aria-label="Reading input method">
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'manual'}
            className={`power-toggle-btn ${mode === 'manual' ? 'is-active' : ''}`}
            onClick={() => setMode('manual')}
          >
            <Keyboard size={16} /> Type reading
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'bluetooth'}
            className={`power-toggle-btn ${mode === 'bluetooth' ? 'is-active' : ''}`}
            onClick={() => setMode('bluetooth')}
          >
            <Bluetooth size={16} /> Bluetooth meter
          </button>
        </div>
        <span className="power-mode-note">
          {mode === 'manual'
            ? 'Read the value from your meter and type it in.'
            : 'Pair a meter to stream live dBm readings.'}
        </span>
      </div>

      <div className="power-grid">
        <div className="power-col">
          <section className="panel power-card">
            <div className="panel-heading">
              <div>
                <h3>Capture reading</h3>
                <p>
                  {mode === 'manual'
                    ? 'Copy the reading exactly as shown.'
                    : 'Live reading updates as your meter reports.'}
                </p>
              </div>
              <div className="power-card-icon">
                {mode === 'manual' ? <Activity size={18} /> : <Bluetooth size={18} />}
              </div>
            </div>

            {mode === 'manual' ? (
              <div className="power-manual">
                <label className="field-label" htmlFor="power-input">
                  Received optical power
                </label>
                <div className="input-with-unit main-reading-input">
                  <input
                    id="power-input"
                    inputMode="decimal"
                    className="text-input number-input"
                    value={p.powerInput}
                    onChange={(e) => p.setPowerInput(e.target.value)}
                    placeholder="-18.4"
                    aria-describedby="reading-help"
                  />
                  <span>dBm</span>
                </div>
                <p className="field-help" id="reading-help">
                  Include the minus sign. For example, −18.4 dBm.
                </p>
              </div>
            ) : (
              <div className="bt-panel">
                {!btSupported && (
                  <div className="notice-banner">
                    <Cable size={18} />
                    <div>
                      <strong>Web Bluetooth not detected</strong>
                      <span>
                        Use Chrome or Edge on Android or desktop. iOS Safari does not support Web
                        Bluetooth yet.
                      </span>
                    </div>
                  </div>
                )}

                <div className={`bt-readout ${btConnected ? 'is-live' : ''}`}>
                  <span className="bt-readout-label">LIVE READING</span>
                  <div className="bt-readout-value">
                    {btLive !== null ? btLive.toFixed(2) : '—'}
                    <small>dBm</small>
                  </div>
                  <div className={`bt-status ${btConnected ? 'connected' : ''}`}>
                    <span className="bt-status-dot" />
                    {btConnected ? `Connected · ${btConnected.name}` : 'No device paired'}
                  </div>
                </div>

                <div className="btn-row mt-18">
                  {!btConnected ? (
                    <button
                      type="button"
                      className="primary-button"
                      onClick={connect}
                      disabled={btConnecting}
                    >
                      <Link2 size={16} /> {btConnecting ? 'Searching…' : 'Pair meter'}
                    </button>
                  ) : (
                    <button type="button" className="secondary-button" onClick={disconnect}>
                      Disconnect
                    </button>
                  )}
                </div>

                {btRaw && (
                  <p className="field-help mt-14">
                    Last payload: <code className="raw-payload">{btRaw}</code>
                  </p>
                )}

                <label className="field-label" htmlFor="wl-select">
                  Wavelength
                </label>
                <select
                  id="wl-select"
                  className="text-input profile-select"
                  value={wavelength}
                  onChange={(e) => setWavelength(e.target.value)}
                >
                  <option value="1310">1310 nm</option>
                  <option value="1490">1490 nm</option>
                  <option value="1550">1550 nm</option>
                </select>
              </div>
            )}

            <label className="field-label" htmlFor="site-name">
              Customer / site label <span>OPTIONAL</span>
            </label>
            <input
              id="site-name"
              className="text-input"
              value={p.siteName}
              onChange={(e) => p.setSiteName(e.target.value)}
              placeholder="e.g. Customer home 014"
            />
          </section>

          <section className="panel power-card">
            <div className="panel-heading">
              <div>
                <h3>Limits &amp; profile</h3>
                <p>Define the pass range for the assessment.</p>
              </div>
              <div className="power-card-icon">
                <SlidersHorizontal size={18} />
              </div>
            </div>

            <label className="field-label" htmlFor="profile-select">
              Assessment profile
            </label>
            <select
              id="profile-select"
              className="text-input profile-select"
              value={p.profile}
              onChange={(e) => p.setProfile(e.target.value)}
            >
              <option value="gpon-bplus">Illustrative GPON B+ ONT downstream (1490 nm)</option>
              <option value="custom">Custom limits (confirm with client)</option>
            </select>

            <div className="limit-grid">
              <div>
                <label className="field-label" htmlFor="low-limit">
                  Lower limit
                </label>
                <div className="input-with-unit">
                  <input
                    id="low-limit"
                    className="text-input number-input"
                    inputMode="decimal"
                    value={p.lowLimit}
                    onChange={(e) => {
                      p.setLowLimit(e.target.value);
                      p.setProfile('custom');
                    }}
                  />
                  <span>dBm</span>
                </div>
              </div>
              <div>
                <label className="field-label" htmlFor="high-limit">
                  Upper limit
                </label>
                <div className="input-with-unit">
                  <input
                    id="high-limit"
                    className="text-input number-input"
                    inputMode="decimal"
                    value={p.highLimit}
                    onChange={(e) => {
                      p.setHighLimit(e.target.value);
                      p.setProfile('custom');
                    }}
                  />
                  <span>dBm</span>
                </div>
              </div>
            </div>

            <p className="field-help">
              A less-negative dBm value means more optical power. Limits are editable; verify them
              against the actual network and equipment.
            </p>
          </section>
        </div>

        <div className="power-col">
          <section className="panel power-card power-result-card">
            <div className="panel-heading">
              <div>
                <h3>Signal interpretation</h3>
                <p>Updates the moment a reading arrives.</p>
              </div>
              <div className="live-badge">
                <span />
                LIVE RESULT
              </div>
            </div>

            <div className={`assessment-banner ${resultCopy.className}`}>
              <div className="assessment-icon">
                <ResultIcon size={24} />
              </div>
              <div>
                <span className="assessment-overline">FIBERLINKGUARD ASSESSMENT</span>
                <h2>{resultCopy.title}</h2>
                <p>{resultCopy.text}</p>
              </div>
            </div>

            <div
              className={`result-gauge ${
                result === 'good'
                  ? 'gauge-good'
                  : result === 'weak' || result === 'strong'
                    ? 'gauge-review'
                    : 'gauge-neutral'
              }`}
            >
              <div className="gauge-inner">
                <div className="gauge-icon">
                  <Signal size={22} />
                </div>
                <span className="gauge-label">CAPTURED POWER</span>
                <strong>
                  {validValue ? value.toFixed(2) : '—'}
                  <small> dBm</small>
                </strong>
                <span className={`result-status ${result === 'good' ? 'status-good' : 'status-warn'}`}>
                  {result === 'good'
                    ? 'Within selected range'
                    : result === 'weak'
                      ? 'Below lower limit'
                      : result === 'strong'
                        ? 'Above upper limit'
                        : 'Awaiting input'}
                </span>
              </div>
            </div>

            <div className="result-facts">
              <div>
                <span>Selected range</span>
                <strong>
                  {validLimits ? `${low.toFixed(1)} to ${high.toFixed(1)} dBm` : 'Invalid limits'}
                </strong>
              </div>
              <div>
                <span>Distance from lower limit</span>
                <strong>{validValue && validLimits ? `${(value - low).toFixed(1)} dB` : '—'}</strong>
              </div>
              <div>
                <span>Equivalent optical power</span>
                <strong>
                  {validValue && Number.isFinite(watts)
                    ? watts < 0.001
                      ? `${(watts * 1e6).toFixed(3)} µW`
                      : `${(watts * 1000).toFixed(4)} mW`
                    : '—'}
                </strong>
              </div>
            </div>

            <div className="result-explanation">
              <CircleHelp size={17} />
              <p>
                <strong>Important:</strong> GPON B+ values here are an illustrative
                receiver-specification reference, not a universal promise of good service. Receiver
                sensitivity/overload, wavelength, test point and the operator&apos;s approved limits
                matter. A reading alone cannot guarantee internet performance.
              </p>
            </div>

            <button
              className="primary-button full-button"
              onClick={p.onSave}
              disabled={result === 'invalid'}
            >
              <Save size={16} /> Save results
            </button>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PowerPage;
