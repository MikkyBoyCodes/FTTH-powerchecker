import { Package, PackagePlus, PackageX } from 'lucide-react';
import PageTitle from '../components/PageTitle';
import { useState } from 'react';

type Item = { id: string; name: string; unit: string; qty: number };

const SeedItems: Item[] = [
  { id: 'M-CABLE', name: 'Fibre cable (drum)', unit: 'metres', qty: 1840 },
  { id: 'M-SLEEVE', name: 'Splice sleeves', unit: 'pcs', qty: 320 },
  { id: 'M-ONT', name: 'ONT units', unit: 'pcs', qty: 45 },
  { id: 'M-PATCH', name: 'Patch cords', unit: 'pcs', qty: 88 },
];

const StockPage = () => {
  const [items, setItems] = useState<Item[]>(SeedItems);
  const [name, setName] = useState('');
  const [unit, setUnit] = useState('pcs');
  const [qty, setQty] = useState('');

  const addItem = () => {
    const n = Number(qty);
    if (!name.trim() || qty.trim() === '' || !Number.isFinite(n)) return;
    const item: Item = { id: `M-${items.length + 1}`, name: name.trim(), unit, qty: n };
    setItems((prev) => [item, ...prev]);
    setName('');
    setQty('');
  };

  const useStock = (id: string, amount: number) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, qty: Math.max(0, i.qty - amount) } : i)));
  };

  const low = items.filter((i) => i.qty <= 50);

  return (
    <div className="page-stack">
      <PageTitle
        eyebrow="STOCK & MATERIALS"
        title="Material stock control"
        description="Track cable in metres, splice sleeves, ONTs and patch cords. Every job deducts automatically so nobody is caught short on site."
      />

      <div className="module-grid">
        <div className="stat-card">
          <div className="stat-label">ITEM TYPES</div>
          <div className="stat-value">{items.length}</div>
          <div className="stat-sub">Tracked materials</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">LOW STOCK</div>
          <div className={`stat-value ${low.length ? 'gold' : ''}`}>{low.length}</div>
          <div className="stat-sub">At or below 50 units</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">CABLE LEFT</div>
          <div className="stat-value">{items.find((i) => i.unit === 'metres')?.qty ?? 0} m</div>
          <div className="stat-sub">On the drum</div>
        </div>
      </div>

      <section className="panel pad-block">
        <div className="panel-heading">
          <div>
            <h3>Add material</h3>
            <p>Register a new stock item.</p>
          </div>
          <PackagePlus size={19} />
        </div>
        <div className="form-grid mt-16">
          <div>
            <label className="field-label" htmlFor="st-name">Name</label>
            <input id="st-name" className="text-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Drop cable" />
          </div>
          <div>
            <label className="field-label" htmlFor="st-unit">Unit</label>
            <select id="st-unit" className="text-input" value={unit} onChange={(e) => setUnit(e.target.value)}>
              <option value="pcs">Pieces</option>
              <option value="metres">Metres</option>
              <option value="rolls">Rolls</option>
            </select>
          </div>
          <div>
            <label className="field-label" htmlFor="st-qty">Quantity</label>
            <input id="st-qty" className="text-input" inputMode="numeric" value={qty} onChange={(e) => setQty(e.target.value)} placeholder="100" />
          </div>
        </div>
        <div className="btn-row mt-16">
          <button className="primary-button" onClick={addItem} disabled={!name.trim() || qty.trim() === ''}>
            <PackagePlus size={16} /> Add item
          </button>
        </div>
      </section>

      <section className="panel pad-block">
        <div className="panel-heading">
          <div>
            <h3>Stock levels</h3>
            <p>Use stock to simulate a job consuming materials.</p>
          </div>
          <Package size={19} />
        </div>
        <div className="scroll-x">
          <table className="data-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Unit</th>
                <th>Quantity</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {items.map((i) => (
                <tr key={i.id}>
                  <td>{i.name}</td>
                  <td>{i.unit}</td>
                  <td>{i.qty}</td>
                  <td>
                    <span className={`data-chip ${i.qty <= 50 ? 'gold' : 'sky'}`}>{i.qty <= 50 ? 'LOW' : 'OK'}</span>
                  </td>
                  <td>
                    <button className="text-button" onClick={() => useStock(i.id, i.unit === 'metres' ? 87 : 2)}>
                      <PackageX size={13} /> Use on job
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="field-help mt-16">
          Every job can deduct materials automatically — for example “Job used 87 m cable and 2
          sleeves” — so the store and the field always agree.
        </p>
      </section>
    </div>
  );
};

export default StockPage;
