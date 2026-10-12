import { useEffect } from 'react';
import { ShieldCheck } from 'lucide-react';

export default function SplashScreen({ onFinish }: { onFinish: () => void }) {
  useEffect(() => {
    // Shorter load — design stays the same
    const timer = window.setTimeout(onFinish, 900);
    return () => window.clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className="splash-screen" role="status" aria-label="Loading RX Guard">
      <div className="splash-orbit splash-orbit-one" />
      <div className="splash-orbit splash-orbit-two" />
      <div className="splash-mark">
        <ShieldCheck size={38} strokeWidth={1.7} />
      </div>
      <div className="splash-wordmark">
        RX <span>GUARD</span>
      </div>
      <p className="splash-caption">FIELD TOOLS FOR FIBRE TECHNICIANS</p>
      <div className="splash-progress">
        <span />
      </div>
      <span className="splash-version">FIELD SYSTEMS</span>
    </div>
  );
}