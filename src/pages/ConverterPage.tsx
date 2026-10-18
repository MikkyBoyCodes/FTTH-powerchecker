import { ArrowRight, Calculator, Check, Info } from 'lucide-react';
import PageTitle from '../components/PageTitle';
import { useMemo, useState } from 'react';

const wattsLabel = (w: number) => {
  if (!Number.isFinite(w) || w < 0) return '—';
  if (w === 0) return '0 W';
  if (w < 1e-6) return `${w.toExponential(4)} W`;
  if (w < 0.001) return `${(w * 1e6).toFixed(3)} µW`;
  if (w < 1) return `${(w * 1000).toFixed(4)} mW`;
  return `${w.toFixed(6)} W`;
};

const ConverterPage = () => {
  const [dbmInput, setDbmInput] = useState('-18.0');
  const [distDirection, setDistDirection] = useState<'km-to-m' | 'm-to-km'>('km-to-m');
  const [distInput, setDistInput] = useState('1.5');

  const dbmValue = Number(dbmInput);
  const dbmValid = dbmInput.trim() !== '' && Number.isFinite(dbmValue);

  const wattsResult = useMemo(() => {
    if (!dbmValid) return null;
    const w = Math.pow(10, (dbmValue - 30) / 10);
    if (!Number.isFinite(w) || w < 0) return null;
    return wattsLabel(w);
  }, [dbmValue, dbmValid]);

  const distValue = Number(distInput);
  const distValid = distInput.trim() !== '' && Number.isFinite(distValue);

  const distResult = useMemo(() => {
    if (!distValid) return null;
    if (distDirection === 'km-to-m') return `${(distValue * 1000).toFixed(3)} m`;
    return `${(distValue / 1000).toFixed(6)} km`;
  }, [distValue, distValid, distDirection]);

  return (
    <div className="page-stack">
      <PageTitle
        eyebrow="FIELD TOOLS"
        title="Unit converter"
        description="Convert optical power from dBm to watts, and distance between kilometres and metres. Formulas are always shown."
      />

      {/* POWER CONVERSION — its own div */}
      <section className="panel converter-wrap">
        <div className="panel-heading">
          <div>
            <h3>Power conversion</h3>
            <p>Optical power: dBm → Watts only.</p>
          </div>
          <Calculator size={19} />
        </div>

        <div className="converter-body">
          <div className="converter-input-area">
            <div className="eyebrow">CONVERSION INPUT</div>
            <label className="field-label" htmlFor="dbm-input">
              Power level in dBm
            </label>
            <div className="input-with-unit converter-number">
              <input
                id="dbm-input"
                className="text-input number-input"
                inputMode="decimal"
                value={dbmInput}
                onChange={(e) => setDbmInput(e.target.value)}
                placeholder="-18.0"
              />
              <span>dBm</span>
            </div>
            <p className="field-help">Enter a valid dBm value, including the minus sign when needed.</p>
            <div className="formula-card">
              <span>FORMULA</span>
              <code>W = 10^((dBm − 30) / 10)</code>
            </div>
          </div>

          <div className="conversion-arrow">
            <ArrowRight size={21} />
          </div>

          <div className="conversion-output">
            <div className="eyebrow">CONVERSION RESULT</div>
            <span className="output-unit">WATTS</span>
            <strong className="output-value">{wattsResult ?? '—'}</strong>
            <p>{wattsResult ? 'Calculated locally on this device.' : 'Enter a valid dBm value to see the result.'}</p>
            <div className="output-check">
              <Check size={15} /> Formula always shown above
            </div>
          </div>
        </div>

        <div className="converter-footnote">
          <Info size={16} />
          <span>
            <strong>Note:</strong> dBm is an absolute power level. dB describes a ratio or
            gain/loss. A difference between two dBm readings is expressed in dB.
          </span>
        </div>
      </section>

      {/* DISTANCE CONVERSION — its own separate div */}
      <section className="panel converter-wrap">
        <div className="panel-heading">
          <div>
            <h3>Distance conversion</h3>
            <p>Route and cable length: kilometres ↔ metres.</p>
          </div>
          <Calculator size={19} />
        </div>

        <div className="converter-tabs">
          <button
            className={`converter-tab ${distDirection === 'km-to-m' ? 'tab-active' : ''}`}
            onClick={() => {
              setDistDirection('km-to-m');
              setDistInput('1.5');
            }}
          >
            km <ArrowRight size={15} /> m
          </button>
          <button
            className={`converter-tab ${distDirection === 'm-to-km' ? 'tab-active' : ''}`}
            onClick={() => {
              setDistDirection('m-to-km');
              setDistInput('1500');
            }}
          >
            m <ArrowRight size={15} /> km
          </button>
        </div>

        <div className="converter-body">
          <div className="converter-input-area">
            <div className="eyebrow">CONVERSION INPUT</div>
            <label className="field-label" htmlFor="dist-input">
              {distDirection === 'km-to-m' ? 'Distance in kilometres' : 'Distance in metres'}
            </label>
            <div className="input-with-unit converter-number">
              <input
                id="dist-input"
                className="text-input number-input"
                inputMode="decimal"
                value={distInput}
                onChange={(e) => setDistInput(e.target.value)}
                placeholder={distDirection === 'km-to-m' ? '1.5' : '1500'}
              />
              <span>{distDirection === 'km-to-m' ? 'km' : 'm'}</span>
            </div>
            <p className="field-help">
              {distDirection === 'km-to-m'
                ? 'Enter the route length in kilometres.'
                : 'Enter the length in metres.'}
            </p>
            <div className="formula-card">
              <span>FORMULA</span>
              <code>{distDirection === 'km-to-m' ? 'm = km × 1000' : 'km = m ÷ 1000'}</code>
            </div>
          </div>

          <div className="conversion-arrow">
            <ArrowRight size={21} />
          </div>

          <div className="conversion-output">
            <div className="eyebrow">CONVERSION RESULT</div>
            <span className="output-unit">{distDirection === 'km-to-m' ? 'METERS' : 'KILOMETERS'}</span>
            <strong className="output-value">{distResult ?? '—'}</strong>
            <p>{distResult ? 'Calculated locally on this device.' : 'Enter a valid value to see the result.'}</p>
            <div className="output-check">
              <Check size={15} /> Formula always shown above
            </div>
          </div>
        </div>

        <div className="converter-footnote">
          <Info size={16} />
          <span>
            <strong>Note:</strong> 1 kilometre = 1000 metres. Useful for cable drum planning,
            route as-built documentation and OTDR fault distance.
          </span>
        </div>
      </section>
    </div>
  );
};

export default ConverterPage;
