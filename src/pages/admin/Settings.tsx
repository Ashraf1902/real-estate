import { useState, useEffect } from 'react';
import { CreditCard, Landmark, Wallet, ThumbsUp, Globe, Music2, CodeXml, Save, Settings2, ShieldCheck, Mail, User } from 'lucide-react';
import { useToast, useAdminName } from './AdminLayout';
import { fetchSettings, updateSettings } from '../../api';

function Toggle({ on, set }: { on: boolean; set: (v: boolean) => void }) {
  return <button type="button" className={`toggle ${on ? 'on' : ''}`} onClick={() => set(!on)} aria-pressed={on} />;
}

export default function Settings() {
  const toast = useToast();
  const adminNameCtx = useAdminName();
  const [adminName, setAdminName] = useState(adminNameCtx || 'محمود الشريف');
  const [gates, setGates] = useState([
    { name: 'فودافون كاش', status: true },
    { name: 'الدفع بالبطاقة (Visa/Master)', status: true },
    { name: 'التحويل البنكي', status: false },
    { name: 'محفظة موبي/أورانج', status: false },
  ]);
  const flipGate = (i: number) => setGates((g) => g.map((x, k) => (k === i ? { ...x, status: !x.status } : x)));
  const [pixels, setPixels] = useState([true, true, false]);
  const [dom, setDom] = useState({ maintenance: false, rtl: true, forceSecure: true, emailNotify: true });

  useEffect(() => {
    fetchSettings({ adminName: 'محمود الشريف', brand: 'Real Estate' }).then((s) => {
      if (s.adminName) setAdminName(s.adminName);
    }).catch(() => {});
  }, []);

  const saveName = async () => {
    const s = await updateSettings({ adminName });
    if (s && s.adminName) {
      setAdminName(s.adminName);
      toast('تم حفظ اسم الأدمن');
    } else {
      toast('تعذر حفظ الاسم، تأكد من تشغيل الخادم');
    }
  };

  return (
    <div className="set-grid">
      {/* Payment gateways */}
      <div className="panel">
        <div className="panel-head"><h3><CreditCard size={18} /> بوابات الدفع</h3><button className="btn-ghost" style={{ padding: '.4rem .7rem', fontSize: '.8rem' }} onClick={() => toast('فتح إضافة بوابة دفع')}>+ إضافة</button></div>
        <div className="panel-body">
          {gates.map((g, i) => (
            <div className={`gate ${g.status ? '' : 'off'}`} key={g.name}>
              <span className="gi" style={{ background: ['var(--emerald)', 'var(--sky)', 'var(--vio)', 'var(--gold)'][i] }}>
                {i === 0 ? <Wallet size={20} /> : i === 1 ? <CreditCard size={20} /> : i === 2 ? <Landmark size={20} /> : <Wallet size={20} />}
              </span>
              <div><b>{g.name}</b><span>{g.status ? 'مفعّل · يتقبل الدفع الآن' : 'متوقف مؤقتًا'}</span></div>
              <div className="gt"><Toggle on={g.status} set={() => flipGate(i)} /></div>
            </div>
          ))}
          <div style={{ fontSize: '.78rem', color: 'var(--ink-soft)', fontWeight: 600 }}>💡 حوّل «فودافون كاش» ليكون هو الافتراضي في صفحة الدفع.</div>
        </div>
      </div>

      {/* Tracking & pixels */}
      <div className="panel">
        <div className="panel-head"><h3><CodeXml size={18} /> التتبع والبيكسل</h3></div>
        <div className="panel-body">
          <p className="code-pix">&lt;!-- Meta Pixel ID: 4793... --&gt;</p>
          <div className="pixel"><b><ThumbsUp size={17} color="#1877F2" /> Meta Pixel</b><div className="pw"><Toggle on={pixels[0]} set={() => setPixels((p) => p.map((x, i) => (i === 0 ? !x : x)))} /></div></div>
          <div className="pixel"><b><Globe size={17} color="#4285F4" /> Google Tag Manager</b><div className="pw"><Toggle on={pixels[1]} set={() => setPixels((p) => p.map((x, i) => (i === 1 ? !x : x)))} /></div></div>
          <div className="pixel"><b><Music2 size={17} color="#69C9D0" /> TikTok Pixel</b><div className="pw"><Toggle on={pixels[2]} set={() => setPixels((p) => p.map((x, i) => (i === 2 ? !x : x)))} /></div></div>
          <button className="btn-ghost" style={{ width: '100%', justifyContent: 'center', marginTop: '.6rem' }} onClick={() => toast('تم فتح إضافة سكربت تتبع جديد')}>
            <CodeXml size={15} /> إضافة كود تتبع مخصص
          </button>
        </div>
      </div>

      {/* General settings */}
      <div className="panel">
        <div className="panel-head"><h3><Settings2 size={18} /> إعدادات عامة</h3></div>
        <div className="panel-body">
          {(Object.keys(dom) as (keyof typeof dom)[]).map((k) => (
            <div className="setting-row" key={k}>
              <div>
                <b>{k === 'maintenance' ? 'وضع الصيانة' : k === 'rtl' ? 'واجهة RTL عربية' : k === 'forceSecure' ? 'الدفع المشفّر إجباري' : 'إشعارات البريد'}</b>
                <span>{k === 'maintenance' ? 'إيقاف الفانل مؤقتًا' : k === 'rtl' ? 'اتجاه النص من اليمين' : ''}</span>
              </div>
              <div className="tg"><Toggle on={dom[k]} set={() => setDom((d) => ({ ...d, [k]: !d[k] }))} /></div>
            </div>
          ))}
          <div className="setting-row">
            <div><b>رابط تخصيص المجال</b><span>ربط دومين مخصص للفانل</span></div>
            <div className="tg"><button className="btn-ghost" style={{ padding: '.4rem .7rem', fontSize: '.8rem' }} onClick={() => toast('فتح إعدادات الدومين')}><Globe size={14} /> إدارة</button></div>
          </div>
          <div className="setting-row">
            <div><b>بريد المراسلات</b><span>الذي تصله رسائل الطلبات والتأكيد</span></div>
            <div className="tg"><button className="btn-ghost" style={{ padding: '.4rem .7rem', fontSize: '.8rem' }} onClick={() => toast('فتح إعدادات البريد')}><Mail size={14} /> إدارة</button></div>
          </div>
          <div className="setting-row">
            <div><b>ضمان استرداد 30 يوم</b><span>معروض في كل صفحات الفانل</span></div>
            <div className="tg"><ShieldCheck size={20} style={{ color: 'var(--emerald)' }} /></div>
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head"><h3><User size={18} /> معلومات الحساب</h3></div>
        <div className="panel-body">
          <div className="setting-row">
            <div><b>اسم الأدمن</b><span>يظهر في شريط التنقل الجانبي للأدمن</span></div>
          </div>
          <div className="set-field" style={{ display: 'flex', gap: '.5rem', alignItems: 'center', marginBottom: '1rem' }}>
            <input
              style={{ flex: 1, padding: '.6rem .7rem', border: '1px solid var(--line)', borderRadius: '10px', fontSize: '.95rem' }}
              value={adminName}
              onChange={(e) => setAdminName(e.target.value)}
              placeholder="اسم الأدمن"
            />
            <button className="btn-solid" onClick={saveName}><Save size={16} /> حفظ</button>
          </div>
          <div style={{ fontSize: '.95rem', marginBottom: '1rem' }}>
            <b>اسم البراند:</b> Real Estate<br />
            <b>الإشتراك:</b> الباقة الاحترافية<br />
            <span className="pill on" style={{ marginTop: '.5rem' }}>نشط حتى 2027-01-01</span>
          </div>
          <button className="btn-solid" onClick={() => toast('تم حفظ جميع الإعدادات')}><Save size={16} /> حفظ كل الإعدادات</button>
        </div>
      </div>
    </div>
  );
}
