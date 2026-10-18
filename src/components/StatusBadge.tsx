export const StatusBadge = ({ children, tone = 'good' }: { children: React.ReactNode; tone?: 'good' | 'warning' | 'neutral' }) => { return <span className={`status-badge status-badge-${tone}`}>{children}</span>; }
export default StatusBadge;
