import { Activity, AlertTriangle, CheckCircle2, Gauge, Wifi } from 'lucide-react';
import PageTitle from '../components/PageTitle';
import { useEffect, useState } from 'react';

type MonPoint = { id: string; name: string; power: number; uptime: string };

const SEED: MonPoint[] = [
  { id: 'OLT-01', name: 'OLT Rack A — Warri', power: 3.2, uptime: '42d 6h' },
  { id: 'SPL-12', name: 'Splitter 12 — Ekpan', power: -11.5, uptime: '18d 2h' },
  { id: 'SPL-07', name: 'Splitter 7 — Ugbomro', power: -14.8, uptime: '12d 9h' },
];

const MonitoringPage = () => {
  const [points, setPoints] = useState<MonPoint[]>(SEED);
  const [live, setLive] = useState(true);

  useEffect(() => {
    if (!live) return;
    const timer = window.setInterval(() => {
      setPoints((prev) =>
        prev.map((p) => {
          const jitter = (Math.random() - 0.5) * 0.4;
          return { ...p, power: Number((p.power + jitter).toFixed(2)) };
        })
      );
    }, 3000);
    return () => window.clearInterval(timer);
  }, [live]);

  const healthy = points.filter((p) => p.power > -27).length;

  return (
    <div className="page-stack">
      <PageTitle
        eyebrow="LIVE MONITORING"
        title="Network monitoring"
        description="Live signal levels across your OLT and splitters, refreshed automatically while you work."
      />

      <div className="module-grid">
        <div className="stat-card">
          <div className="stat-label">MONITORED POINTS</div>
          <div className="stat-value">{points.length}</div>
          <div className="stat-sub">OLT and splitters</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">HEALTHY</div>
          <div className="stat-value">{healthy}</div>
          <div className="stat-sub">Within range</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">ALERTS</div>
          <div className={`stat-value ${points.length - healthy > 0 ? 'gold' : ''}`}>{points.length - healthy}</div>
          <div className="stat-sub">Needs attention</div>
        </div>
      </div>

      <section className="panel pad-block">
        <div className="panel-heading">
          <div>
            <h3>Live feed</h3>
            <p>{live ? 'Updating every 3 seconds' : 'Feed paused'}</p>
          </div>
          <Activity size={19} />
        </div>
        <div className="btn-row mt-16">
          <button className="secondary-button" onClick={() => setLive((v) => !v)}>
            <Wifi size={16} /> {live ? 'Pause feed' : 'Resume feed'}
          </button>
        </div>
        <div className="chip-row mt-16">
          {points.map((p) => (
            <span key={p.id} className={`data-chip ${p.power > -27 ? 'sky' : 'gold'}`}>
              {p.power > -27 ? <CheckCircle2 size={13} /> : <AlertTriangle size={13} />}
              {p.name} · {p.power.toFixed(1)} dBm
            </span>
          ))}
        </div>
      </section>

      <section className="panel pad-block">
        <div className="panel-heading">
          <div>
            <h3>Point detail</h3>
            <p>Current level and uptime per network point.</p>
          </div>
          <Gauge size={19} />
        </div>
        <div className="scroll-x">
          <table className="data-table">
            <thead>
              <tr>
                <th>Point</th>
                <th>Name</th>
                <th>Level</th>
                <th>Uptime</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {points.map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{p.name}</td>
                  <td>{p.power.toFixed(1)} dBm</td>
                  <td>{p.uptime}</td>
                  <td>
                    <span className={`data-chip ${p.power > -27 ? 'sky' : 'gold'}`}>
                      {p.power > -27 ? 'OK' : 'CHECK'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default MonitoringPage;
