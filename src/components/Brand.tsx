import Logo from './Logo';

export const Brand = () => {
  return (
    <div className="brand-row">
      <div className="brand-symbol">
        <Logo size="xs" alt="" />
      </div>
      <div className="brand-text">
        FIBER<span>LINKGUARD</span>
        <small>F.L.G • FTTH OPERATIONS</small>
      </div>
    </div>
  );
};

export default Brand;
