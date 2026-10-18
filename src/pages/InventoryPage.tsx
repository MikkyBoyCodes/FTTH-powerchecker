import {
  Boxes,
  Building2,
  Crosshair,
  MapPin,
  Plus,
  Router,
  Search,
  Trash2,
} from 'lucide-react';
import PageTitle from '../components/PageTitle';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ToastFn } from '../types';

type AssetType = 'pole' | 'joint' | 'splitter' | 'olt' | 'customer';
type AssetStatus = 'active' | 'maintenance' | 'free';

type Asset = {
  id: string;
  type: AssetType;
  name: string;
  location: string;
  cores: string;
  status: AssetStatus;
  lat: number | null;
  lng: number | null;
};

const STORE_KEY = 'fiberlinkguard-inventory-v1';

const SEED: Asset[] = [
  { id: 'OLT-01', type: 'olt', name: 'OLT Rack A — Warri', location: 'Exchange, Delta', cores: '16 PON ports', status: 'active', lat: 5.517, lng: 5.75 },
  { id: 'SPL-12', type: 'splitter', name: 'Splitter 12 (1x16)', location: 'Joint Box 2, Ekpan', cores: '8 of 16 used', status: 'active', lat: 5.567, lng: 5.717 },
  { id: 'JB-02', type: 'joint', name: 'Joint Box 2', location: 'Ekpan junction', cores: '96 fibers', status: 'active', lat: 5.565, lng: 5.719 },
  { id: 'POL-44', type: 'pole', name: 'Pole 44', location: 'Ugbomro road', cores: '—', status: 'maintenance', lat: 5.633, lng: 5.8 },
  { id: 'CUST-114', type: 'customer', name: 'Customer 114 — Otega', location: 'Ekpan', cores: 'Port 8 · Splitter 12', status: 'active', lat: 5.566, lng: 5.716 },
  { id: 'CUST-115', type: 'customer', name: 'Customer 115 — vacant', location: 'Ekpan', cores: 'Port 9 · Splitter 12', status: 'free', lat: 5.5665, lng: 5.7165 },
];

const typeIcon = (type: AssetType) => {
  if (type === 'pole') return <MapPin size={15} />;
  if (type === 'joint') return <Boxes size={15} />;
  if (type === 'splitter') return <Router size={15} />;
  if (type === 'olt') return <Building2 size={15} />;
  return <Search size={15} />;
};

const loadAssets = (): Asset[] => {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Asset[];
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // ignore malformed storage
  }
  return SEED;
};

const MAP_W = 100;
const MAP_H = 66;
const MAP_PAD = 10;

const InventoryPage = ({ onToast }: { onToast: ToastFn }) => {
  const [assets, setAssets] = useState<Asset[]>(loadAssets);
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | AssetType>('all');
  const [locating, setLocating] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState({
    id: '',
    type: 'pole' as AssetType,
    name: '',
    location: '',
    cores: '',
    status: 'active' as AssetStatus,
    lat: null as number | null,
    lng: null as number | null,
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(assets));
    } catch {
      // storage may be unavailable
    }
  }, [assets]);

  const capture = useCallback(
    (onDone: (lat: number, lng: number) => void) => {
      if (!('geolocation' in navigator)) {
        onToast('Location is not available on this device.');
        return;
      }
      setLocating(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocating(false);
          onDone(Number(pos.coords.latitude.toFixed(6)), Number(pos.coords.longitude.toFixed(6)));
        },
        () => {
          setLocating(false);
          onToast('Could not read location. Allow location access and try again.');
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    },
    [onToast]
  );

  const captureForForm = () => {
    capture((lat, lng) => {
      setForm((f) => ({ ...f, lat, lng }));
      onToast('New asset location captured.');
    });
  };

  const recordGps = (id: string) => {
    capture((lat, lng) => {
      setAssets((prev) => prev.map((a) => (a.id === id ? { ...a, lat, lng } : a)));
      onToast(`${id} location updated.`);
    });
  };

  const addAsset = () => {
    if (!form.name.trim()) return;
    const asset: Asset = {
      id: form.id.trim() || `ASSET-${assets.length + 1}`,
      type: form.type,
      name: form.name.trim(),
      location: form.location.trim() || 'Unassigned',
      cores: form.cores.trim() || '—',
      status: form.status,
      lat: form.lat,
      lng: form.lng,
    };
    setAssets((prev) => [asset, ...prev]);
    setForm({ id: '', type: 'pole', name: '', location: '', cores: '', status: 'active', lat: null, lng: null });
    onToast(`${asset.name} added to inventory.`);
  };

  const deleteAsset = (id: string) => {
    setAssets((prev) => prev.filter((a) => a.id !== id));
    setSelectedId((cur) => (cur === id ? null : cur));
    onToast(`${id} removed from inventory.`);
  };

  const filtered = useMemo(
    () =>
      assets.filter((a) => {
        const matchesQuery = `${a.id} ${a.name} ${a.location}`
          .toLowerCase()
          .includes(query.toLowerCase());
        const matchesType = typeFilter === 'all' || a.type === typeFilter;
        return matchesQuery && matchesType;
      }),
    [assets, query, typeFilter]
  );

  const geoPoints = useMemo(() => {
    const geo = assets.filter((a) => a.lat !== null && a.lng !== null);
    if (geo.length === 0) return [];
    const lats = geo.map((a) => a.lat as number);
    const lngs = geo.map((a) => a.lng as number);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    const spanLat = maxLat - minLat || 0.0005;
    const spanLng = maxLng - minLng || 0.0005;
    return geo.map((a) => {
      const x = MAP_PAD + (((a.lng as number) - minLng) / spanLng) * (MAP_W - MAP_PAD * 2);
      const y = MAP_PAD + (1 - ((a.lat as number) - minLat) / spanLat) * (MAP_H - MAP_PAD * 2);
      return { asset: a, x, y };
    });
  }, [assets]);

  const selected = assets.find((a) => a.id === selectedId) || null;
  const mappedCount = assets.filter((a) => a.lat !== null && a.lng !== null).length;

  return (
    <div className="page-stack">
      <PageTitle
        eyebrow="NETWORK INVENTORY"
        title="Inventory & GIS mapping"
        description="Digital as-built for your fibre network. Record real GPS coordinates with your device and see every pole, joint box, splitter, OLT and customer on a live coordinate map."
      />

      <div className="module-grid">
        <div className="stat-card">
          <div className="stat-label">TOTAL ASSETS</div>
          <div className="stat-value">{assets.length}</div>
          <div className="stat-sub">Tracked across the network</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">MAPPED</div>
          <div className="stat-value">{mappedCount}</div>
          <div className="stat-sub">With GPS coordinates</div>
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
            <h3>Geo map</h3>
            <p>{mappedCount} asset{mappedCount === 1 ? '' : 's'} plotted from real coordinates.</p>
          </div>
          <MapPin size={19} />
        </div>

        {geoPoints.length ? (
          <div className="gis-map-wrap mt-16">
            <svg
              className="gis-map"
              viewBox={`0 0 ${MAP_W} ${MAP_H}`}
              role="img"
              aria-label="Plot of network assets by GPS coordinate"
            >
              <defs>
                <pattern id="gisGrid" width="10" height="10" patternUnits="userSpaceOnUse">
                  <path d="M10 0H0V10" fill="none" stroke="#22324a" strokeWidth="0.25" />
                </pattern>
              </defs>
              <rect width={MAP_W} height={MAP_H} fill="url(#gisGrid)" />
              {geoPoints.map(({ asset, x, y }) => (
                <g
                  key={asset.id}
                  className={`gis-point ${selectedId === asset.id ? 'is-selected' : ''}`}
                  onClick={() => setSelectedId(asset.id)}
                >
                  <circle className="gis-halo" cx={x} cy={y} r="3.4" />
                  <circle className={`gis-dot gis-dot-${asset.type}`} cx={x} cy={y} r="1.7" />
                </g>
              ))}
            </svg>
            <div className="gis-legend">
              <span className="gis-legend-item"><i className="gis-swatch gis-dot-olt" /> OLT</span>
              <span className="gis-legend-item"><i className="gis-swatch gis-dot-splitter" /> Splitter</span>
              <span className="gis-legend-item"><i className="gis-swatch gis-dot-joint" /> Joint</span>
              <span className="gis-legend-item"><i className="gis-swatch gis-dot-pole" /> Pole</span>
              <span className="gis-legend-item"><i className="gis-swatch gis-dot-customer" /> Customer</span>
            </div>
            <p className="field-help mt-14">
              This is a schematic coordinate plot — points are placed by their real latitude and
              longitude relative to each other. Tap a point to select the asset.
            </p>
          </div>
        ) : (
          <div className="gis-empty mt-16">
            <Crosshair size={30} />
            <strong>No coordinates recorded yet</strong>
            <span>Add an asset below and tap “Capture GPS” to plot it here.</span>
          </div>
        )}

        {selected && (
          <div className="gis-selected mt-16">
            <div className="gis-selected-head">
              <span className="gis-selected-icon">{typeIcon(selected.type)}</span>
              <div>
                <strong>{selected.name}</strong>
                <span>{selected.id} · {selected.location}</span>
              </div>
            </div>
            <div className="gis-selected-coords">
              {selected.lat !== null && selected.lng !== null
                ? `${selected.lat.toFixed(5)}, ${selected.lng.toFixed(5)}`
                : 'No coordinates'}
            </div>
          </div>
        )}
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
            <select id="asset-type" className="text-input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as AssetType })}>
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
            <select id="asset-status" className="text-input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as AssetStatus })}>
              <option value="active">Active</option>
              <option value="maintenance">Maintenance</option>
              <option value="free">Free</option>
            </select>
          </div>
        </div>

        <div className="gis-capture-row mt-16">
          <button className="secondary-button" onClick={captureForForm} disabled={locating}>
            <Crosshair size={15} /> {locating ? 'Locating…' : 'Capture GPS'}
          </button>
          <span className={`gis-coord-chip ${form.lat !== null ? 'has-coords' : ''}`}>
            {form.lat !== null && form.lng !== null
              ? `${form.lat.toFixed(5)}, ${form.lng.toFixed(5)}`
              : 'No coordinates yet'}
          </span>
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
            <select id="asset-filter" className="text-input" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as 'all' | AssetType)}>
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
                <th>Coordinates</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={a.id}>
                  <td>{a.id}</td>
                  <td>{typeIcon(a.type)}</td>
                  <td>{a.name}</td>
                  <td>{a.location}</td>
                  <td className={a.lat !== null ? 'gis-coord-cell' : ''}>
                    {a.lat !== null && a.lng !== null
                      ? `${a.lat.toFixed(4)}, ${a.lng.toFixed(4)}`
                      : '—'}
                  </td>
                  <td>
                    <span className={`data-chip ${a.status === 'free' ? 'gold' : a.status === 'active' ? 'sky' : ''}`}>
                      {a.status}
                    </span>
                  </td>
                  <td>
                    <div className="row-actions">
                      <button className="text-button" onClick={() => recordGps(a.id)} disabled={locating}>
                        <Crosshair size={13} /> GPS
                      </button>
                      <button className="text-button danger" onClick={() => deleteAsset(a.id)}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7}>No assets match your search.</td>
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
