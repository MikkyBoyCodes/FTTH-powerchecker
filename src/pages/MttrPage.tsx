import { Clock3, Plus, Timer, TrendingDown, Wrench } from 'lucide-react';
import PageTitle from '../components/PageTitle';
import { useState } from 'react';

type Ticket = {
  id: string;
  fault: string;
  opened: string;
  closed: string | null;
  minutes: number | null;
  status: 'open' | 'resolved';
  technician: string;
};

const SeedTickets: Ticket[] = [
  { id: 'INC-201', fault: 'LOS — Ekpan customer 114', opened: '08:12', closed: '09:40', minutes: 88, status: 'resolved', technician: 'Otega' },
  { id: 'INC-202', fault: 'High loss — Ugbomro feeder', opened: '10:05', closed: '11:22', minutes: 77, status: 'resolved', technician: 'Bola' },
  { id: 'INC-203', fault: 'ONT down — Otega residence', opened: '13:30', closed: null, minutes: null, status: 'open', technician: 'Unassigned' },
];

const MttrPage = ({ onToast }: { onToast: (m: string) => void }) => {
  const [tickets, setTickets] = useState<Ticket[]>(SeedTickets);
  const [fault, setFault] = useState('');
  const [technician, setTechnician] = useState('');

  const resolved = tickets.filter((t) => t.status === 'resolved' && t.minutes !== null);
  const mttr = resolved.length
    ? Math.round(resolved.reduce((sum, t) => sum + (t.minutes || 0), 0) / resolved.length)
    : 0;

  const openTicket = () => {
    if (!fault.trim()) {
      onToast('Describe the fault before opening a ticket.');
      return;
    }
    const now = new Date();
    const ticket: Ticket = {
      id: `INC-${200 + tickets.length + 1}`,
      fault: fault.trim(),
      opened: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      closed: null,
      minutes: null,
      status: 'open',
      technician: technician.trim() || 'Unassigned',
    };
    setTickets((prev) => [ticket, ...prev]);
    setFault('');
    setTechnician('');
    onToast(`${ticket.id} opened.`);
  };

  const resolveTicket = (id: string) => {
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id !== id || t.status === 'resolved') return t;
        const now = new Date();
        const [h, m] = t.opened.split(':').map(Number);
        const openedDate = new Date();
        openedDate.setHours(h, m, 0, 0);
        const diff = Math.max(1, Math.round((now.getTime() - openedDate.getTime()) / 60000));
        return {
          ...t,
          status: 'resolved' as const,
          closed: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          minutes: diff,
        };
      })
    );
    onToast(`${id} marked resolved.`);
  };

  return (
    <div className="page-stack">
      <PageTitle
        eyebrow="RELIABILITY"
        title="Mean time to repair"
        description="Track every fault ticket from open to resolution and measure how fast your team restores service."
      />

      <div className="module-grid">
        <div className="stat-card">
          <div className="stat-label">OPEN TICKETS</div>
          <div className="stat-value gold">{tickets.filter((t) => t.status === 'open').length}</div>
          <div className="stat-sub">Awaiting resolution</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">RESOLVED</div>
          <div className="stat-value">{resolved.length}</div>
          <div className="stat-sub">Closed this period</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">MTTR</div>
          <div className="stat-value">{mttr} min</div>
          <div className="stat-sub">Average repair time</div>
        </div>
      </div>

      <section className="panel pad-block">
        <div className="panel-heading">
          <div>
            <h3>Open a ticket</h3>
            <p>Log a new fault to start the repair clock.</p>
          </div>
          <Plus size={19} />
        </div>
        <div className="form-grid mt-16">
          <div>
            <label className="field-label" htmlFor="mttr-fault">Fault description</label>
            <input id="mttr-fault" className="text-input" value={fault} onChange={(e) => setFault(e.target.value)} placeholder="e.g. LOS — customer 120" />
          </div>
          <div>
            <label className="field-label" htmlFor="mttr-tech">Technician</label>
            <input id="mttr-tech" className="text-input" value={technician} onChange={(e) => setTechnician(e.target.value)} placeholder="e.g. Otega" />
          </div>
        </div>
        <div className="btn-row mt-16">
          <button className="primary-button" onClick={openTicket} disabled={!fault.trim()}>
            <Clock3 size={16} /> Open ticket
          </button>
        </div>
      </section>

      <section className="panel pad-block">
        <div className="panel-heading">
          <div>
            <h3>Tickets</h3>
            <p>{tickets.length} total</p>
          </div>
          <Wrench size={19} />
        </div>
        <div className="scroll-x">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Fault</th>
                <th>Opened</th>
                <th>Closed</th>
                <th>Duration</th>
                <th>Tech</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {tickets.map((t) => (
                <tr key={t.id}>
                  <td>{t.id}</td>
                  <td>{t.fault}</td>
                  <td>{t.opened}</td>
                  <td>{t.closed || '—'}</td>
                  <td>{t.minutes !== null ? `${t.minutes} min` : '—'}</td>
                  <td>{t.technician}</td>
                  <td>
                    <span className={`data-chip ${t.status === 'open' ? 'gold' : 'sky'}`}>{t.status}</span>
                  </td>
                  <td>
                    {t.status === 'open' && (
                      <button className="text-button" onClick={() => resolveTicket(t.id)}>
                        <TrendingDown size={13} /> Resolve
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="panel pad-block">
        <div className="panel-heading">
          <div>
            <h3>About MTTR</h3>
            <p>How the figure is calculated.</p>
          </div>
          <Timer size={19} />
        </div>
        <p className="field-help mt-16">
          Mean Time To Repair is the average elapsed time between a fault being opened and the
          service being restored. Lower MTTR means less downtime and less customer churn. Keep a
          target of under 4 hours for residential FTTH and track every ticket to measure it.
        </p>
      </section>
    </div>
  );
};

export default MttrPage;
