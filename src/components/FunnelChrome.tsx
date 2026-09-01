import { Link } from 'react-router-dom';

export function FunnelChrome() {
  return (
    <header className="fch">
      <div className="wrap fch-inner">
        <Link to="/" className="fch-brand">
          <img src="/logo.png" alt="Real Estate" className="logo" />
          Real Estate
        </Link>
        <span className="fch-sec"><b>وحدات محدودة</b> · الحجز بالبيانات وبدون دفع</span>
      </div>
    </header>
  );
}
