import { AlertTriangle, Check, Image, Plus } from 'lucide-react';
import PageTitle from '../components/PageTitle';
import { useState } from 'react';

type Splice = {
  id: string;
  cable: string;
  loss: number;
  photo: boolean;
  tech: string;
};

const THRESHOLD = 0.25;

const SeedSplices: Splice[] = [
  { id: 'SP-01', cable: 'Feeder A — 96 core', loss: 0.18, photo: true, tech: 'Otega' },
  { id: 'SP-02', cable: 'Drop — customer 114', loss: 0.34, photo: true, tech: 'Bola' },
];

const SpliceQcPage = () => {
  const [splices, setSplices] = useState<Splice[]>(SeedSplices);
  const [cable, setCable] = useState('');
  const [loss, setLoss] = useState('');
  const [photo, setPhoto] = useState(false);
  const [tech, setTech] = useState('');

  const add = () => {
    const n = Number(loss);
    if (!cable.trim() || loss.trim() === '' || !Number.isFinite(n)) {
      return;
    }
    const splice: Splice = {
      id: `SP-${String(splices.length + 1).padStart(2, '0')}`,
      cable: cable.trim(),
      loss: n,
      photo,
      tech: tech.trim() || 'Unassigned',
    };
    setSplices((prev) => [splice, ...prev]);
    setCable('');
    setLoss('');
    setPhoto(false);
    setTech('');
  };

  const failed = splices.filter((s) => s.loss > THRESHOLD);

  return (
    <div className="page-stack">
      <PageTitle
        eyebrow="QUALITY CONTROL"
        title="Splicing & loss documentation"
        description="Record every splice with a photo and a measured loss. Anything above the threshold is flagged for a redo."
      />

      <div className="module-grid">
        <div className="stat-card">
          <div className="stat-label">SPLICES LOGGED</div>
          <div className="stat-value">{splices.length}</div>
          <div className="stat-sub">Documented this period</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">FAILED QC</div>
          <div className={`stat-value ${failed.length ? 'gold' : ''}`}>{failed.length}</div>
          <div className="stat-sub">Above {THRESHOLD} dB — must redo</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">PASS RATE</div>
          <div className="stat-value">
            {splices.length ? Math.round(((splices.length - failed.length) / splices.length) * 100) : 100}%
          </div>
          <div className="stat-sub">Within the loss threshold</div>
        </div>
      </div>

      <section className="panel pad-block">
        <div className="panel-heading">
          <div>
            <h3>Log a splice</h3>
            <p>Photo and measured loss are required for a quality record.</p>
          </div>
          <Plus size={19} />
        </div>
        <div className="form-grid mt-16">
          <div>
            <label className="field-label" htmlFor="sp-cable">Cable / segment</label>
            <input id="sp-cable" className="text-input" value={cable} onChange={(e) => setCable(e.target.value)} placeholder="e.g. Feeder B — 48 core" />
          </div>
          <div>
            <label className="field-label" htmlFor="sp-loss">Measured loss (dB)</label>
            <input id="sp-loss" className="text-input" inputMode="decimal" value={loss} onChange={(e) => setLoss(e.target.value)} placeholder="0.12" />
          </div>
          <div>
            <label className="field-label" htmlFor="sp-tech">Technician</label>
            <input id="sp-tech" className="text-input" value={tech} onChange={(e) => setTech(e.target.value)} placeholder="e.g. Otega" />
          </div>
          <div>
            <label className="field-label" htmlFor="sp-photo">Photo uploaded</label>
            <select id="sp-photo" className="text-input" value={photo ? 'yes' : 'no'} onChange={(e) => setPhoto(e.target.value === 'yes')}>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>
        </div>
        <div className="btn-row mt-16">
          <button className="primary-button" onClick={add} disabled={!cable.trim() || loss.trim() === ''}>
            <Image size={16} /> Log splice
          </button>
        </div>
      </section>

      <section className="panel pad-block">
        <div className="panel-heading">
          <div>
            <h3>Splice records</h3>
            <p>Loss over {THRESHOLD} dB fails quality control.</p>
          </div>
          <Check size={19} />
        </div>
        <div className="scroll-x">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Cable</th>
                <th>Loss</th>
                <th>Photo</th>
                <th>Tech</th>
                <th>QC</th>
              </tr>
            </thead>
            <tbody>
              {splices.map((s) => {
                const failedRow = s.loss > THRESHOLD;
                return (
                  <tr key={s.id}>
                    <td>{s.id}</td>
                    <td>{s.cable}</td>
                    <td>{s.loss.toFixed(2)} dB</td>
                    <td>
                      <span className={`data-chip ${s.photo ? 'sky' : 'gold'}`}>{s.photo ? 'Yes' : 'No'}</span>
                    </td>
                    <td>{s.tech}</td>
                    <td>
                      <span className={`data-chip ${failedRow ? 'gold' : 'sky'}`}>
                        {failedRow ? <AlertTriangle size={13} /> : <Check size={13} />}
                        {failedRow ? 'REDO' : 'PASS'}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {splices.length === 0 && (
                <tr>
                  <td colSpan={6}>No splices logged yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default SpliceQcPage;
