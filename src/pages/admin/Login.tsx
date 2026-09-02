import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { adminLogin } from '../../api';

export default function Login() {
  const [pass, setPass] = useState('');
  const [show, setShow] = useState(false);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const handleLogin = async () => {
    if (!pass.trim()) { setErr('أدخل كلمة المرور'); return; }
    setLoading(true);
    setErr('');
    const ok = await adminLogin(pass.trim());
    setLoading(false);
    if (ok) nav('/admin', { replace: true });
    else setErr('كلمة المرور غير صحيحة');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'var(--paper)' }}>
      <div style={{ width: 380, background: '#fff', borderRadius: 16, boxShadow: '0 8px 40px rgba(0,0,0,.08)', padding: '2.5rem 2rem', textAlign: 'center' }}>
        <ShieldCheck size={42} style={{ color: 'var(--crimson)', marginBottom: '.8rem' }} />
        <h2 style={{ fontFamily: 'var(--f-display)', fontWeight: 900, fontSize: '1.3rem', marginBottom: '.3rem' }}>لوحة التحكم</h2>
        <p style={{ fontSize: '.85rem', color: 'var(--ink-soft)', marginBottom: '1.5rem' }}>أدخل كلمة المرور للدخول إلى الإعدادات</p>

        <div style={{ position: 'relative', marginBottom: '.6rem' }}>
          <input
            type={show ? 'text' : 'password'}
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            placeholder="••••••••"
            autoFocus
            style={{
              width: '100%', padding: '.75rem 2.8rem .75rem 1rem',
              border: err ? '2px solid var(--coral)' : '2px solid var(--line)',
              borderRadius: 10, fontSize: '1rem', fontFamily: 'var(--f-num)',
              letterSpacing: show ? 2 : 6, outline: 'none', boxSizing: 'border-box' as const,
              direction: 'ltr', textAlign: 'center',
            }}
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-soft)' }}
          >
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {err && <p style={{ color: 'var(--coral)', fontSize: '.82rem', marginBottom: '.6rem' }}>{err}</p>}

        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            width: '100%', padding: '.75rem', borderRadius: 10, border: 'none',
            background: 'linear-gradient(135deg, #61101F, #8b2040)',
            color: '#fff', fontSize: '.95rem', fontWeight: 700, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.5rem',
            opacity: loading ? .7 : 1,
          }}
        >
          <Lock size={16} /> {loading ? 'جارٍ التحقق…' : 'دخول'}
        </button>
      </div>
    </div>
  );
}
