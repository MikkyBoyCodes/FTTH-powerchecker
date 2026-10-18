import { PowerOff, Search, SignalLow, UserPlus, Wifi } from 'lucide-react';
import PageTitle from '../components/PageTitle';
import { useMemo, useState } from 'react';

type Customer = {
  id: string;
  name: string;
  address: string;
  plan: string;
  power: number;
  status: 'online' | 'offline' | 'suspended';
};

const SeedCustomers: Customer[] = [
  { id: 'CUST-114', name: 'Otega residence', address: 'Ekpan', plan: '20 Mbps', power: -19.4, status: 'online' },
  { id: 'CUST-115', name: 'Efe store', address: 'Ekpan road', plan: '50 Mbps', power: -22.1, status: 'online' },
  { id: 'CUST-116', name: 'Ada Nwosu', address: 'Ugbomro', plan: '20 Mbps', power: -31.8, status: 'offline' },
  { id: 'CUST-117', name: 'Bola clinic', address: 'Ekpan junction', plan: '100 Mbps', power: -15.6, status: 'online' },
  { id: 'CUST-118', name: 'Vacant — unit 4', address: 'Ugbomro road', plan: '—', power: -35.0, status: 'suspended' },
];

const CustomersPage = () => {
  const [customers, setCustomers] = useState<Customer[]>(SeedCustomers);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | Customer['status']>('all');

  const [form, setForm] = useState({ name: '', address: '', plan: '20 Mbps', power: '-20.0' });

  const filtered = useMemo(() => {
    return customers.filter((c) => {
      const q = `${c.id} ${c.name} ${c.address}`.toLowerCase().includes(query.toLowerCase());
      const s = statusFilter === 'all' || c.status === statusFilter;
      return q && s;
    });
  }, [customers, query, statusFilter]);

  const addCustomer = () => {
    if (!form.name.trim()) return;
    const p = Number(form.power);
    const customer: Customer = {
      id: `CUST-${100 + customers.length + 1}`,
      name: form.name.trim(),
      address: form.address.trim() || 'Unassigned',
      plan: form.plan,
      power: Number.isFinite(p) ? p : -20,
      status: 'online',
    };
    setCustomers((prev) => [customer, ...prev]);
    setForm({ name: '', address: '', plan: '20 Mbps', power: '-20.0' });
  };

  const toggleOnline = (id: string) => {
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, status: c.status === 'online' ? 'suspended' : 'online' } : c
      )
    );
  };

  return (
    <div className="page-stack">
      <PageTitle
        eyebrow="CUSTOMERS"
        title="Customer management"
        description="Every subscriber, their plan, their signal level and their service state — in one searchable view."
      />

      <div className="module-grid">
        <div className="stat-card">
          <div className="stat-label">TOTAL CUSTOMERS</div>
          <div className="stat-value">{customers.length}</div>
          <div className="stat-sub">On the network</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">ONLINE</div>
          <div className="stat-value">{customers.filter((c) => c.status === 'online').length}</div>
          <div className="stat-sub">Currently active</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">OFFLINE / SUSPENDED</div>
          <div className="stat-value gold">{customers.filter((c) => c.status !== 'online').length}</div>
          <div className="stat-sub">Needs attention</div>
        </div>
      </div>

      <section className="panel pad-block">
        <div className="panel-heading">
          <div>
            <h3>Add customer</h3>
            <p>Register a new subscriber on the network.</p>
          </div>
          <UserPlus size={19} />
        </div>
        <div className="form-grid mt-16">
          <div>
            <label className="field-label" htmlFor="cust-name">Name</label>
            <input id="cust-name" className="text-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Ada Nwosu" />
          </div>
          <div>
            <label className="field-label" htmlFor="cust-addr">Address</label>
            <input id="cust-addr" className="text-input" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="e.g. Ekpan road" />
          </div>
          <div>
            <label className="field-label" htmlFor="cust-plan">Plan</label>
            <select id="cust-plan" className="text-input" value={form.plan} onChange={(e) => setForm({ ...form, plan: e.target.value })}>
              <option value="10 Mbps">10 Mbps</option>
              <option value="20 Mbps">20 Mbps</option>
              <option value="50 Mbps">50 Mbps</option>
              <option value="100 Mbps">100 Mbps</option>
            </select>
          </div>
          <div>
            <label className="field-label" htmlFor="cust-power">Signal (dBm)</label>
            <input id="cust-power" className="text-input" inputMode="decimal" value={form.power} onChange={(e) => setForm({ ...form, power: e.target.value })} placeholder="-20.0" />
          </div>
        </div>
        <div className="btn-row mt-16">
          <button className="primary-button" onClick={addCustomer} disabled={!form.name.trim()}>
            <UserPlus size={16} /> Add customer
          </button>
        </div>
      </section>

      <section className="panel pad-block">
        <div className="panel-heading">
          <div>
            <h3>Customer list</h3>
            <p>{filtered.length} of {customers.length} shown</p>
          </div>
          <Search size={19} />
        </div>
        <div className="form-grid mt-16">
          <div>
            <label className="field-label" htmlFor="cust-search">Search</label>
            <input id="cust-search" className="text-input" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name, ID or address" />
          </div>
          <div>
            <label className="field-label" htmlFor="cust-status">Filter by status</label>
            <select id="cust-status" className="text-input" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as 'all' | Customer['status'])}>
              <option value="all">All</option>
              <option value="online">Online</option>
              <option value="offline">Offline</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>
        <div className="scroll-x">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Address</th>
                <th>Plan</th>
                <th>Signal</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id}>
                  <td>{c.id}</td>
                  <td>{c.name}</td>
                  <td>{c.address}</td>
                  <td>{c.plan}</td>
                  <td>{c.power.toFixed(1)} dBm</td>
                  <td>
                    <span className={`data-chip ${c.status === 'online' ? 'sky' : 'gold'}`}>
                      {c.status === 'online' ? <Wifi size={13} /> : c.status === 'offline' ? <SignalLow size={13} /> : <PowerOff size={13} />}
                      {c.status}
                    </span>
                  </td>
                  <td>
                    <button className="text-button" onClick={() => toggleOnline(c.id)}>
                      {c.status === 'online' ? 'Suspend' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7}>No customers match your search.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default CustomersPage;
