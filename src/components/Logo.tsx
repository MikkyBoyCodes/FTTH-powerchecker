import logoImage from '../assets/flg-logo.jpeg';

type LogoProps = {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  full?: boolean;
  alt?: string;
};

export const Logo = ({ size = 'md', full = false, alt = '' }: LogoProps) => {
  return (
    <span className={`flg-logo flg-logo-${size}${full ? ' flg-logo-full' : ''}`}>
      <img className="flg-logo-img" src={logoImage} alt={alt} draggable={false} />
    </span>
  );
};

export default Logo;
