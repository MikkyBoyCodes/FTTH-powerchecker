import { Check, Loader2, Play, User, Zap } from 'lucide-react';
import PageTitle from '../components/PageTitle';
import { useState } from 'react';

type Step = { id: string; label: string; detail: string };
type Job = { id: string; customer: string; plan: string; status: string };

const STEPS: Step[] = [
  { id: 'port', label: 'Select free port', detail: 'Find an available splitter port for the customer location.' },
  { id: 'ont', label: 'Register ONT', detail: 'Scan or enter the ONT serial number and bind it to the port.' },
  { id: 'vlan', label: 'Assign VLAN & profile', detail: 'Apply the service profile and VLAN for the subscriber plan.' },
  { id: 'verify', label: 'Verify activation', detail: 'Confirm the ONT registers and the link comes up in range.' },
];

const SeedJobs: Job[] = [
  { id: 'JOB-101', customer: 'Otega residence', plan: '20 Mbps', status: 'Completed' },
  { id: 'JOB-102', customer: 'Efe store', plan: '50 Mbps', status: 'Completed' },
];

const ProvisioningPage = ({ onToast }: { onToast: (m: string) => void }) => {
  const [customer, setCustomer] = useState('');
  const [plan, setPlan] = useState('20 Mbps');
  const [ontSn, setOntSn] = useState('');
  const [port, setPort] = useState('Port 9 · Splitter 12');
  const [currentStep, setCurrentStep] = useState(0);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [jobs, setJobs] = useState<Job[]>(SeedJobs);

  const runProvisioning = () => {
    if (!customer.trim()) {
      onToast('Enter a customer name before provisioning.');
      return;
    }
    setRunning(true);
    setDone(false);
    setCurrentStep(0);
    let step = 0;
    const timer = window.setInterval(() => {
      step += 1;
      setCurrentStep(step);
      if (step >= STEPS.length) {
        window.clearInterval(timer);
        setRunning(false);
        setDone(true);
        const job: Job = {
          id: `JOB-${100 + jobs.length + 1}`,
          customer: customer.trim(),
          plan,
          status: 'Completed',
        };
        setJobs((prev) => [job, ...prev]);
        onToast(`${customer.trim()} provisioned on ${port}.`);
      }
    }, 900);
  };

  return (
    <div className="page-stack">
      <PageTitle
        eyebrow="PROVISIONING"
        title="One-click provisioning"
        description="Activate a new FTTH subscriber in a single guided flow — port selection, ONT registration, VLAN assignment and verification."
      />

      <div className="module-grid">
        <div className="stat-card">
          <div className="stat-label">JOBS COMPLETED</div>
          <div className="stat-value">{jobs.filter((j) => j.status === 'Completed').length}</div>
          <div className="stat-sub">Total activations</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">AVG. TIME</div>
          <div className="stat-value gold">3.6s</div>
          <div className="stat-sub">Guided flow duration</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">FREE PORTS</div>
          <div className="stat-value">7</div>
          <div className="stat-sub">Ready to assign</div>
        </div>
      </div>

      <section className="panel pad-block">
        <div className="panel-heading">
          <div>
            <h3>New activation</h3>
            <p>Fill in the details and run the one-click flow.</p>
          </div>
          <User size={19} />
        </div>

        <div className="form-grid mt-16">
          <div>
            <label className="field-label" htmlFor="prov-customer">Customer name</label>
            <input id="prov-customer" className="text-input" value={customer} onChange={(e) => setCustomer(e.target.value)} placeholder="e.g. Ada Nwosu" />
          </div>
          <div>
            <label className="field-label" htmlFor="prov-plan">Plan</label>
            <select id="prov-plan" className="text-input" value={plan} onChange={(e) => setPlan(e.target.value)}>
              <option value="10 Mbps">10 Mbps</option>
              <option value="20 Mbps">20 Mbps</option>
              <option value="50 Mbps">50 Mbps</option>
              <option value="100 Mbps">100 Mbps</option>
            </select>
          </div>
          <div>
            <label className="field-label" htmlFor="prov-ont">ONT serial number</label>
            <input id="prov-ont" className="text-input" value={ontSn} onChange={(e) => setOntSn(e.target.value)} placeholder="e.g. HWTC12345678" />
          </div>
          <div>
            <label className="field-label" htmlFor="prov-port">Target port</label>
            <select id="prov-port" className="text-input" value={port} onChange={(e) => setPort(e.target.value)}>
              <option value="Port 9 · Splitter 12">Port 9 · Splitter 12</option>
              <option value="Port 10 · Splitter 12">Port 10 · Splitter 12</option>
              <option value="Port 2 · Splitter 7">Port 2 · Splitter 7</option>
            </select>
          </div>
        </div>

        <div className="btn-row mt-18">
          <button className="primary-button" onClick={runProvisioning} disabled={running}>
            {running ? <Loader2 size={16} /> : <Play size={16} />}
            {running ? 'Provisioning…' : 'Provision in one click'}
          </button>
        </div>
      </section>

      <section className="panel pad-block">
        <div className="panel-heading">
          <div>
            <h3>Flow steps</h3>
            <p>Progress of the current activation.</p>
          </div>
          <Zap size={19} />
        </div>
        <div className="chip-row mt-16">
          {STEPS.map((s, i) => (
            <span key={s.id} className={`data-chip ${done || i < currentStep ? 'sky' : i === currentStep && running ? 'gold' : ''}`}>
              {done || i < currentStep ? <Check size={13} /> : null}
              {s.label}
            </span>
          ))}
        </div>
        <p className="field-help mt-16">
          {done
            ? 'Activation complete. The customer is now live on the selected port.'
            : running
              ? `Running step ${Math.min(currentStep + 1, STEPS.length)} of ${STEPS.length}…`
              : 'Fill the form above and start the one-click flow.'}
        </p>
      </section>

      <section className="panel pad-block">
        <div className="panel-heading">
          <div>
            <h3>Recent activations</h3>
            <p>{jobs.length} provisioning jobs</p>
          </div>
          <Check size={19} />
        </div>
        <div className="scroll-x">
          <table className="data-table">
            <thead>
              <tr>
                <th>Job</th>
                <th>Customer</th>
                <th>Plan</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((j) => (
                <tr key={j.id}>
                  <td>{j.id}</td>
                  <td>{j.customer}</td>
                  <td>{j.plan}</td>
                  <td>
                    <span className="data-chip sky">{j.status}</span>
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

export default ProvisioningPage;
