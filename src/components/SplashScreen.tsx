import { useEffect } from 'react';
import Logo from './Logo';
export const SplashScreen = ({ onFinish }: { onFinish: () => void }) => {
  useEffect(() => { const timer = window.setTimeout(onFinish, 1800); return () => window.clearTimeout(timer); }, [onFinish]);
  return <div className="splash-screen" role="status" aria-label="Loading FIBERLINKGUARD"><div className="splash-orbit splash-orbit-one"/><div className="splash-orbit splash-orbit-two"/><div className="splash-mark"><Logo size="lg" alt="" /></div><div className="splash-wordmark">FIBER<span>LINKGUARD</span></div><p className="splash-caption">FTTH FIBRE INTELLIGENCE</p><div className="splash-progress"><span/></div><span className="splash-version">F.L.G • OPERATIONS</span></div>;
}
export default SplashScreen;
