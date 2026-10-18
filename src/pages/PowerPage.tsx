import { Activity, AlertTriangle, CheckCircle2, CircleHelp, Info, Save, Signal, TriangleAlert } from 'lucide-react';
import PageTitle from '../components/PageTitle';

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
};

type Result = 'weak' | 'good' | 'strong' | 'invalid';

const PowerPage = (p: Props) => {
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
      text: 'The entered power is below the selected lower limit. Check connector cleanliness, bends, splitter path and link loss; confirm with the network specification.',
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
      text: 'The entered power is above the selected upper limit. Verify the correct test point, wavelength, meter setup and receiver overload specification.',
      icon: AlertTriangle,
      className: 'assessment-strong',
    },
    invalid: {
      title: 'Check the entered values',
      text: 'Enter a valid dBm reading and ensure the lower limit is less than the upper limit.',
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
        description="Enter the dBm value shown on the fibre meter. FIBERLINKGUARD interprets it for you — no manual calculation."
      />

      <div className="notice-banner">
        <Info size={18} />
        <div>
          <strong>Read the result in seconds</strong>
          <span>
            Use the received downstream power measured at the home/ONT side. Select the correct
            approved limits for the network before relying on a result.
          </span>
        </div>
      </div>

      <div className="power-layout power-layout-enhanced">
        <section className="panel power-form-panel" aria-live="polite">
          <div className="panel-heading">
            <div>
              <h3>Enter meter reading</h3>
              <p>Copy the reading exactly as shown.</p>
            </div>
            <Activity size={19} />
          </div>

          {/* LIVE RESULT — above the inputs, same panel */}
          <div className="result-block">
            <div className="panel-heading">
              <div>
                <h3>Signal interpretation</h3>
                <p>Based on the reading and selected range.</p>
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
                <span className="gauge-label">ENTERED POWER</span>
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
                        : 'Awaiting valid input'}
                </span>
              </div>
            </div>

            <div className="result-facts">
              <div>
                <span>Selected range</span>
                <strong>{validLimits ? `${low.toFixed(1)} to ${high.toFixed(1)} dBm` : 'Invalid limits'}</strong>
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
                sensitivity/overload, wavelength, test point, and the operator's approved limits
                matter. A reading alone cannot guarantee internet performance.
              </p>
            </div>
          </div>

          {/* INPUTS — below the results */}
          <div className="result-block result-block-separator">
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
              against the client's actual network and equipment.
            </p>

            <button
              className="primary-button full-button"
              onClick={p.onSave}
              disabled={result === 'invalid'}
            >
              <Save size={16} /> Save results
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default PowerPage;
