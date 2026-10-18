import { AlertTriangle, CheckCircle2, LocateFixed, Search, ShieldAlert } from 'lucide-react';
import PageTitle from '../components/PageTitle';
import { useState } from 'react';

type Verdict = {
  title: string;
  advice: string;
  tone: 'good' | 'warn';
};

const diagnose = (power: number, los: boolean, point: string): Verdict => {
  if (los) {
    return {
      title: 'Total loss of signal detected',
      advice:
        'LOS with a very low or absent reading usually means a complete break. Check the most recent splice or a cut along the route. Use OTDR to pinpoint the distance.',
      tone: 'warn',
    };
  }
  if (power < -27) {
    return {
      title: 'Signal below the acceptable window',
      advice:
        'Power is too weak. Verify the splitter path, check for dirty connectors, sharp bends and bad splices. Measure at the FAT to isolate where the loss starts.',
      tone: 'warn',
    };
  }
  if (power > -8) {
    return {
      title: 'Signal above the receiver window',
      advice:
        'Power is too strong and may overload the ONT. Confirm the correct test point and consider an attenuator or a higher splitter ratio.',
      tone: 'warn',
    };
  }
  if (point === 'ont' && power >= -27) {
    return {
      title: 'ONT side looks healthy',
      advice:
        'Power at the ONT is within range. If the customer still has no internet, the issue is likely the ONT, its power adapter, Wi-Fi or the upstream registration — not the fibre.',
      tone: 'good',
    };
  }
  return {
    title: 'Power within the expected range',
    advice:
      'This reading is inside the selected window. Continue to the next test point to confirm the full path.',
    tone: 'good',
  };
};

const FaultPage = () => {
  const [power, setPower] = useState('-31.5');
  const [los, setLos] = useState(true);
  const [point, setPoint] = useState('ont');
  const [result, setResult] = useState<Verdict | null>(null);

  const run = () => {
    const n = Number(power);
    if (power.trim() === '' || !Number.isFinite(n)) {
      setResult({ title: 'Enter a valid reading', advice: 'Provide a numeric dBm value to run the isolation.', tone: 'warn' });
      return;
    }
    setResult(diagnose(n, los, point));
  };

  return (
    <div className="page-stack">
      <PageTitle
        eyebrow="FAULT ISOLATION"
        title="Blind fault locator"
        description="Stop guessing on site. Enter the measured power and the LOS status and the app tells you where to look next."
      />

      <section className="panel pad-block">
        <div className="panel-heading">
          <div>
            <h3>Fault inputs</h3>
            <p>Enter what the meter and the ONT show.</p>
          </div>
          <Search size={19} />
        </div>
        <div className="form-grid mt-16">
          <div>
            <label className="field-label" htmlFor="flt-power">Measured power (dBm)</label>
            <div className="input-with-unit">
              <input id="flt-power" className="text-input" inputMode="decimal" value={power} onChange={(e) => setPower(e.target.value)} placeholder="-31.5" />
              <span>dBm</span>
            </div>
          </div>
          <div>
            <label className="field-label" htmlFor="flt-point">Test point</label>
            <select id="flt-point" className="text-input" value={point} onChange={(e) => setPoint(e.target.value)}>
              <option value="olt">At the OLT / feeder</option>
              <option value="fat">At the FAT / splitter</option>
              <option value="drop">At the drop cable</option>
              <option value="ont">At the ONT / home</option>
            </select>
          </div>
          <div>
            <label className="field-label" htmlFor="flt-los">ONT LOS indicator</label>
            <select id="flt-los" className="text-input" value={los ? 'yes' : 'no'} onChange={(e) => setLos(e.target.value === 'yes')}>
              <option value="yes">Red / LOS lit</option>
              <option value="no">Normal / no LOS</option>
            </select>
          </div>
        </div>
        <div className="btn-row mt-18">
          <button className="primary-button" onClick={run}>
            <LocateFixed size={16} /> Isolate fault
          </button>
        </div>
      </section>

      {result && (
        <section className="panel pad-block">
          <div className="panel-heading">
            <div>
              <h3>Verdict</h3>
              <p>Suggested next action.</p>
            </div>
            {result.tone === 'good' ? <CheckCircle2 size={19} /> : <ShieldAlert size={19} />}
          </div>
          <div className={`assessment-banner ${result.tone === 'good' ? 'assessment-good' : 'assessment-weak'} mt-16`}>
            <div className="assessment-icon">
              {result.tone === 'good' ? <CheckCircle2 size={24} /> : <AlertTriangle size={24} />}
            </div>
            <div>
              <span className="assessment-overline">ISOLATION RESULT</span>
              <h2>{result.title}</h2>
              <p>{result.advice}</p>
            </div>
          </div>
        </section>
      )}

      <section className="panel pad-block">
        <div className="panel-heading">
          <div>
            <h3>3-step LOS checklist</h3>
            <p>Locate the break without climbing twice.</p>
          </div>
          <LocateFixed size={19} />
        </div>
        <div className="chip-row mt-16">
          <span className="data-chip sky">1 · Measure at the FAT</span>
          <span className="data-chip sky">2 · Measure at the drop</span>
          <span className="data-chip sky">3 · Measure at the ONT</span>
        </div>
        <p className="field-help mt-16">
          Where the power collapses between two points is where the fault lives. A healthy FAT
          reading with a dead ONT reading points to the drop or the home connection. Both dead
          points to the feeder or a splitter.
        </p>
      </section>
    </div>
  );
};

export default FaultPage;
