import { Bluetooth, Cable, Gauge, Link2, Radar, Save, Zap } from 'lucide-react';
import PageTitle from '../components/PageTitle';
import { useCallback, useEffect, useRef, useState } from 'react';

type Props = {
  onSave: (value: number, label: string, status: string) => void;
  onToast: (message: string) => void;
};

type DeviceInfo = {
  name: string;
  id: string;
};

// Parse a raw numeric/string payload into a dBm reading when possible
const parseDbm = (raw: string): number | null => {
  if (!raw) return null;
  const match = raw.match(/-?\d+(\.\d+)?/);
  if (!match) return null;
  const n = Number(match[0]);
  return Number.isFinite(n) ? n : null;
};

const BluetoothPage = ({ onSave, onToast }: Props) => {
  const [supported, setSupported] = useState(false);
  const [connected, setConnected] = useState<DeviceInfo | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [liveValue, setLiveValue] = useState<number | null>(null);
  const [lastRaw, setLastRaw] = useState('');
  const [wavelength, setWavelength] = useState('1490');
  const [notes, setNotes] = useState('');
  const deviceRef = useRef<BluetoothDevice | null>(null);

  useEffect(() => {
    setSupported(typeof navigator !== 'undefined' && 'bluetooth' in navigator);
  }, []);

  const handleValue = useCallback((value: number) => {
    setLiveValue(value);
  }, []);

  const connect = useCallback(async () => {
    if (!supported) {
      onToast('Web Bluetooth is not available in this browser. Use Chrome or Edge on Android/desktop.');
      return;
    }
    setConnecting(true);
    try {
      const device = await navigator.bluetooth.requestDevice({ acceptAllDevices: true });
      deviceRef.current = device;
      setConnected({ name: device.name || 'Unnamed meter', id: device.id });

      device.addEventListener('gattserverdisconnected', () => {
        setConnected(null);
        onToast('Device disconnected.');
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
                    for (const b of bytes) {
                      raw += String.fromCharCode(b);
                    }
                    setLastRaw(raw.trim());
                    const parsed = parseDbm(raw);
                    if (parsed !== null) handleValue(parsed);
                  }
                });
                await char.startNotifications();
              }
            }
          }
        } catch {
          // Some meters do not expose GATT services; pairing alone is fine
        }
      }
      onToast(`Paired with ${device.name || 'device'}.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      onToast(`Pairing failed: ${message}`);
    } finally {
      setConnecting(false);
    }
  }, [supported, onToast, handleValue]);

  const disconnect = useCallback(() => {
    deviceRef.current?.gatt?.disconnect();
    deviceRef.current = null;
    setConnected(null);
    setLiveValue(null);
  }, []);

  const saveReading = useCallback(() => {
    if (liveValue === null) {
      onToast('No reading to save. Connect a meter first.');
      return;
    }
    const status =
      liveValue < -27
        ? 'Signal may be too weak'
        : liveValue > -8
          ? 'Signal may be too strong'
          : 'Within selected range';
    onSave(liveValue, `${connected?.name || 'Bluetooth meter'} · ${wavelength} nm`, status);
    onToast('Reading saved to history.');
  }, [liveValue, connected, wavelength, onSave, onToast]);

  return (
    <div className="page-stack">
      <PageTitle
        eyebrow="SMART TESTING"
        title="Bluetooth hardware integration"
        description="Pair with an optical power meter, OTDR or VFL over Bluetooth and capture live dBm readings directly in the app."
      />

      <section className="panel pad-block">
        <div className="panel-heading">
          <div>
            <h3>Device connection</h3>
            <p>Works with any Bluetooth-enabled optical meter that broadcasts readings.</p>
          </div>
          <Bluetooth size={19} />
        </div>

        {!supported && (
          <div className="notice-banner mt-16">
            <Cable size={18} />
            <div>
              <strong>Web Bluetooth not detected</strong>
              <span>Use Chrome or Edge on Android, Windows or macOS. iOS Safari does not support Web Bluetooth yet.</span>
            </div>
          </div>
        )}

        <div className="bl-readout mt-18">
          <span className="bl-unit">LIVE READING</span>
          <div className="bl-value">{liveValue !== null ? liveValue.toFixed(2) : '—'}</div>
          <span className="bl-unit">dBm</span>
          {connected ? (
            <div className="bl-status connected">
              <span className="bl-status-dot" />
              Connected · {connected.name}
            </div>
          ) : (
            <div className="bl-status">
              <span className="bl-status-dot" />
              No device paired
            </div>
          )}
        </div>

        <div className="btn-row mt-18">
          {!connected ? (
            <button className="primary-button" onClick={connect} disabled={connecting}>
              <Link2 size={16} /> {connecting ? 'Searching…' : 'Pair meter'}
            </button>
          ) : (
            <button className="secondary-button" onClick={disconnect}>
              Disconnect
            </button>
          )}
          <button className="secondary-button" onClick={saveReading} disabled={liveValue === null}>
            <Save size={15} /> Save reading
          </button>
        </div>

        {lastRaw && (
          <p className="field-help mt-14">
            Last raw payload: <code>{lastRaw}</code>
          </p>
        )}
      </section>

      <section className="panel pad-block">
        <div className="panel-heading">
          <div>
            <h3>Test configuration</h3>
            <p>Set the wavelength for correct interpretation.</p>
          </div>
          <Gauge size={19} />
        </div>
        <div className="form-grid mt-16">
          <div>
            <label className="field-label" htmlFor="wl-select">
              Wavelength
            </label>
            <select
              id="wl-select"
              className="text-input"
              value={wavelength}
              onChange={(e) => setWavelength(e.target.value)}
            >
              <option value="1310">1310 nm</option>
              <option value="1490">1490 nm</option>
              <option value="1550">1550 nm</option>
            </select>
          </div>
          <div>
            <label className="field-label" htmlFor="bt-notes">
              Notes
            </label>
            <input
              id="bt-notes"
              className="text-input"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. FAT box near pole 12"
            />
          </div>
        </div>
      </section>

      <section className="panel pad-block">
        <div className="panel-heading">
          <div>
            <h3>Supported instruments</h3>
            <p>Compatible with any power meter, OTDR or VFL that exposes BLE notifications.</p>
          </div>
          <Radar size={19} />
        </div>
        <div className="chip-row mt-16">
          <span className="data-chip sky">
            <Zap size={13} /> Optical power meters
          </span>
          <span className="data-chip sky">
            <Zap size={13} /> OTDR units
          </span>
          <span className="data-chip sky">
            <Zap size={13} /> Visual fault locators
          </span>
          <span className="data-chip gold">
            <Zap size={13} /> Generic BLE serial adapters
          </span>
        </div>
        <p className="field-help mt-16">
          The app scans for any nearby Bluetooth Low Energy device and listens for notification
          payloads that contain a numeric value. If your meter uses a proprietary format, readings
          will still appear as raw payloads you can verify manually.
        </p>
      </section>
    </div>
  );
};

export default BluetoothPage;
