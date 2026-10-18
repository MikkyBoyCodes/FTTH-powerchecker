import { Activity, ArrowRight, Clock3, History, Info, RefreshCw } from 'lucide-react';
import type { Reading } from '../types';

type Props = {
  readings: Reading[];
  storageNotice: string;
  onClear: () => void;
  onStart: () => void;
};

const HistoryPage = ({ readings, storageNotice, onClear, onStart }: Props) => {
  return (
    <div className="page-stack">
      <div className="page-title">
        <span className="eyebrow">FIELD RECORDS</span>
        <h1>Reading history</h1>
        <p>Review checks saved locally on this device, including when you are offline.</p>
      </div>

      <div className="panel pad-block">
        <div className="panel-heading">
          <div>
            <h3>Saved readings</h3>
            <p>{readings.length} records in this browser</p>
          </div>
          <button className="secondary-button" onClick={onClear}>
            <RefreshCw size={15} /> Clear history
          </button>
        </div>

        {readings.length ? (
          <div className="reading-list mt-16">
            {readings.map((item) => (
              <div className="reading-row" key={item.id}>
                <div className="reading-icon">
                  <Activity size={17} />
                </div>
                <div className="reading-info">
                  <strong>{item.label}</strong>
                  <span>
                    <Clock3 size={13} /> {item.date}
                  </span>
                </div>
                <div className="reading-value">
                  <strong>{item.value.toFixed(1)} <small>dBm</small></strong>
                  <span
                    className={
                      item.status === 'Signal may be too weak' ||
                      item.status === 'Signal may be too strong'
                        ? 'text-warning'
                        : item.status === 'Within selected range'
                          ? 'text-success'
                          : 'text-muted'
                    }
                  >
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <History size={28} />
            <strong>No saved readings yet</strong>
            <span>Save an optical power check to see it here.</span>
            <button className="primary-button" onClick={onStart}>
              Start a check <ArrowRight size={16} />
            </button>
          </div>
        )}

        <div className="history-disclaimer mt-16">
          <Info size={16} />
          {storageNotice}. Data stays in this browser on this device. Clearing browser data may
          delete it.
        </div>
      </div>
    </div>
  );
};

export default HistoryPage;
