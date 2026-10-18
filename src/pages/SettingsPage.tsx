import { Bluetooth, Info, MapPin, Shield, Trash2 } from 'lucide-react';
import PageTitle from '../components/PageTitle';

const SettingsPage = ({ onClear, onAbout }: { onClear: () => void; onAbout: () => void }) => {
  return (
    <div className="page-stack">
      <PageTitle
        eyebrow="SETTINGS"
        title="Preferences & data"
        description="Manage how FIBERLINKGUARD behaves on this device and keep your readings safe."
      />

      <section className="panel pad-block">
        <div className="panel-heading">
          <div>
            <h3>About FIBERLINKGUARD</h3>
            <p>Version 1.0 · F.L.G</p>
          </div>
          <Info size={19} />
        </div>
        <p className="field-help mt-16">
          FIBERLINKGUARD (F.L.G) is an all-in-one FTTH field toolkit for fibre technicians — power
          checking, fault isolation, Bluetooth smart testing, inventory, provisioning, quality
          control, stock control and live monitoring. Everything works offline and on any phone.
        </p>
        <div className="btn-row mt-16">
          <button className="secondary-button" onClick={onAbout}>
            <Info size={16} /> Learn more
          </button>
        </div>
      </section>

      <section className="panel pad-block">
        <div className="panel-heading">
          <div>
            <h3>Data on this device</h3>
            <p>Your readings are stored locally in this browser.</p>
          </div>
          <Shield size={19} />
        </div>
        <p className="field-help mt-16">
          Readings are saved to your browser&apos;s local storage and never leave the device. Clearing
          them removes them permanently from this phone or computer.
        </p>
        <div className="btn-row mt-16">
          <button className="secondary-button danger" onClick={onClear}>
            <Trash2 size={16} /> Clear saved readings
          </button>
        </div>
      </section>

      <section className="panel pad-block">
        <div className="panel-heading">
          <div>
            <h3>Field features</h3>
            <p>Tools that use device hardware.</p>
          </div>
          <Bluetooth size={19} />
        </div>
        <div className="chip-row mt-16">
          <span className="data-chip sky">Bluetooth smart testing</span>
          <span className="data-chip sky">GPS location tagging</span>
          <span className="data-chip sky">Offline readings</span>
        </div>
        <p className="field-help mt-14">
          Bluetooth testing and GPS tagging use features that depend on your browser and device.
          Chrome and Edge support Web Bluetooth; Safari supports GPS tagging through the browser.
        </p>
      </section>

      <section className="panel pad-block">
        <div className="panel-heading">
          <div>
            <h3>Installation</h3>
            <p>Add F.L.G to your home screen.</p>
          </div>
          <MapPin size={19} />
        </div>
        <p className="field-help mt-16">
          Use your browser&apos;s “Add to Home Screen” option to install FIBERLINKGUARD as a full-screen
          app on your phone. It launches without a browser bar and works offline once installed.
        </p>
      </section>
    </div>
  );
};

export default SettingsPage;
