import { Boxes, Building2, Map, MapPin, Plus, Router, Search } from 'lucide-react';
import PageTitle from '../components/PageTitle';
import { useMemo, useState } from 'react';

type Asset = {
  id: string;
  type: 'pole' | 'joint' | 'splitter' | 'olt' | 'customer';
  name: string;
  location: string;
  cores: string;
  status: 'active' | 'maintenance' | 'free';
};

const SEED: Asset[] = [
  { id: 'OLT-01', type: 'olt', name: 'OLT Rack A — Warri', location: 'Exchange, Delta', cores: '16 PON ports', status: 'active' },
  { id: 'SPL-12', type: 'splitter', name: 'Splitter 12 (1x16)', location: 'Joint Box 2, Ekpan', cores: '8 of 16 used', status: 'active' },
  { id: 'JB-02', type: 'joint', name: 'Joint Box 2', location: 'Ekpan junction', cores: '96 fibers', status: 'active' },
  { id: 'POL-44', type: 'pole', name: 'Pole 44', location: 'Ugbomro road', cores: '—', status: 'maintenance' },
  { id: 'CUST-114', type: 'customer', name: 'Customer 114 — Otega', location: 'Ekpan', cores: 'Port 8 · Splitter 12', status: 'active' },
  { id: 'CUST-115', type: 'customer', name: 'Customer 115 — vacant', location: 'Ekpan', cores: 'Port 9 · Splitter 12', status: 'free' },
];

const typeIcon = (type: Asset['type']) => {
  if (type === 'pole') return <MapPin size={16} />;
  if (type === 'joint') return <Boxes size={16} />;
  if (type === 'splitter') return <Router size={16} />;
  if (type === 'olt') return <Building2 size={16} />;
  return <Search size={16} />;
};

const InventoryPage = () => {
  const [assets, setAssets] = useState<Asset[]>(SEED);
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | Asset['type']>('all');

  const [form, setForm] = useState({
    id: '',
    type: 'pole' as Asset['type'],
    name: '',
    location: '',
    cores: '',
    status: 'active' as Asset['status'],
  });

  const filtered = useMemo(() => {
    return assets.filter((a) => {
      const matchesQuery = `${a.id} ${a.name} ${a.location}`.toLowerCase().includes(query.toLowerCase());
      const matchesType = typeFilter === 'all' || a.type === typeFilter;
      return matchesQuery && matchesType;
    });
  }, [assets, query, typeFilter]);

  const addAsset = () => {
    if (!form.name.trim()) return;
    const asset: Asset = {
      id: form.id.trim() || `ASSET-${assets.length + 1}`,
      type: form.type,
      name: form.name.trim(),
      location: form.location.trim() || 'Unassigned',
      cores: form.cores.trim() || '—',
      status: form.status,
    };
    setAssets((prev) => [asset, ...prev]);
    setForm({ id: '', type: 'pole', name: '', location: '', cores: '', status: 'active' });
  };

  return (
    <div className="page-stack">
      <PageTitle
        eyebrow="NETWORK INVENTORY"
        title="Inventory & GIS mapping"
        description="Digital as-built for your fibre network. Track poles, joint boxes, splitters, OLT ports and every customer on a live map and list."
      />

      <div className="module-grid">
        <div className="stat-card">
          <div className="stat-label">TOTAL ASSETS</div>
          <div className="stat-value">{assets.length}</div>
          <div className="stat-sub">Mapped across the network</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">ACTIVE</div>
          <div className="stat-value">{assets.filter((a) => a.status === 'active').length}</div>
          <div className="stat-sub">Currently in service</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">FREE PORTS</div>
          <div className="stat-value gold">{assets.filter((a) => a.status === 'free').length}</div>
          <div className="stat-sub">Ready for new customers</div>
        </div>
      </div>

      <section className="panel pad-block">
        <div className="panel-heading">
          <div>
            <h3>Map view</h3>
            <p>Approximate placement of key network assets.</p>
          </div>
          <Map size={19} />
        </div>
        <div className="bl-readout mt-16">
          <MapPin className="text-sky" size={40} />
          <div className="bl-value text-lg">{assets.length} mapped assets</div>
          <span className="bl-unit">GPS positions recorded per asset</span>
          <p className="field-help mt-14">
            Tap “Record GPS” on an asset to pin its exact coordinates. The full interactive map
            renders from these positions.
          </p>
        </div>
      </section>

      <section className="panel pad-block">
        <div className="panel-heading">
          <div>
            <h3>Add asset</h3>
            <p>Register a new pole, joint box, splitter, OLT or customer.</p>
          </div>
          <Plus size={19} />
        </div>
        <div className="form-grid mt-16">
          <div>
            <label className="field-label" htmlFor="asset-id">Asset ID</label>
            <input id="asset-id" className="text-input" value={form.id} onChange={(e) => setForm({ ...form, id: e.target.value })} placeholder="e.g. JB-03" />
          </div>
          <div>
            <label className="field-label" htmlFor="asset-type">Type</label>
            <select id="asset-type" className="text-input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as Asset['type'] })}>
              <option value="pole">Pole</option>
              <option value="joint">Joint box</option>
              <option value="splitter">Splitter</option>
              <option value="olt">OLT</option>
              <option value="customer">Customer</option>
            </select>
          </div>
          <div>
            <label className="field-label" htmlFor="asset-name">Name</label>
            <input id="asset-name" className="text-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Joint Box 3" />
          </div>
          <div>
            <label className="field-label" htmlFor="asset-location">Location</label>
            <input id="asset-location" className="text-input" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="e.g. Ekpan road" />
          </div>
          <div>
            <label className="field-label" htmlFor="asset-cores">Cores / ports</label>
            <input id="asset-cores" className="text-input" value={form.cores} onChange={(e) => setForm({ ...form, cores: e.target.value })} placeholder="e.g. 96 fibers" />
          </div>
          <div>
            <label className="field-label" htmlFor="asset-status">Status</label>
            <select id="asset-status" className="text-input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Asset['status'] })}>
              <option value="active">Active</option>
              <option value="maintenance">Maintenance</option>
              <option value="free">Free</option>
            </select>
          </div>
        </div>
        <div className="btn-row mt-16">
          <button className="primary-button" onClick={addAsset} disabled={!form.name.trim()}>
            <Plus size={16} /> Add asset
          </button>
        </div>
      </section>

      <section className="panel pad-block">
        <div className="panel-heading">
          <div>
            <h3>Asset list</h3>
            <p>{filtered.length} of {assets.length} shown</p>
          </div>
          <Search size={19} />
        </div>
        <div className="form-grid mt-16">
          <div>
            <label className="field-label" htmlFor="asset-search">Search</label>
            <input id="asset-search" className="text-input" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name, ID or location" />
          </div>
          <div>
            <label className="field-label" htmlFor="asset-filter">Filter by type</label>
            <select id="asset-filter" className="text-input" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as 'all' | Asset['type'])}>
              <option value="all">All types</option>
              <option value="pole">Poles</option>
              <option value="joint">Joint boxes</option>
              <option value="splitter">Splitters</option>
              <option value="olt">OLTs</option>
              <option value="customer">Customers</option>
            </select>
          </div>
        </div>
        <div className="scroll-x">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Type</th>
                <th>Name</th>
                <th>Location</th>
                <th>Cores / ports</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={a.id}>
                  <td>{a.id}</td>
                  <td>{typeIcon(a.type)}</td>
                  <td>{a.name}</td>
                  <td>{a.location}</td>
                  <td>{a.cores}</td>
                  <td>
                    <span className={`data-chip ${a.status === 'free' ? 'gold' : a.status === 'active' ? 'sky' : ''}`}>
                      {a.status}
                    </span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6}>No assets match your search.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default InventoryPage;
