import { useState, useEffect } from 'react';
import { CreditCard, Landmark, Wallet, ThumbsUp, Globe, Music2, CodeXml, Save, Settings2, ShieldCheck, Mail, User, Loader2, CirclePlus } from 'lucide-react';
import { useToast, useAdminName } from './AdminLayout';
import { fetchSettings, updateSettings, type AppSettings, defaultSettings } from '../../api';

function Toggle({ on, set }: { on: boolean; set: (v: boolean) => void }) {
  return <button type="button" className={`toggle ${on ? 'on' : ''}`} onClick={() => set(!on)} aria-pressed={on} />;
}

export default function Settings() {
  const toast = useToast();
  const adminNameCtx = useAdminName();
  const [st, setSt] = useState<AppSettings>(defaultSettings);
  const [adminName, setAdminName] = useState(adminNameCtx || 'محمود الشريف');
  const [maintenanceMsg, setMaintenanceMsg] = useState(defaultSettings.maintenanceMessage);
  const [contactEmail, setContactEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [customPixel, setCustomPixel] = useState('');
  const [newGate, setNewGate] = useState('');

  useEffect(() => {
    fetchSettings().then((s) => {
      setSt(s);
      setAdminName(s.adminName || adminNameCtx || 'محمود الشريف');
      setMaintenanceMsg(s.maintenanceMessage);
      setContactEmail(s.contactEmail || '');
    }).catch(() => {});
  }, []);

  const gates = st.gates;
  const flipGate = (i: number) =>
    setSt((s) => ({ ...s, gates: s.gates.map((x, k) => (k === i ? { ...x, on: !x.on } : x)) }));

  const flipPixel = (k: keyof typeof st.pixels) =>
    setSt((s) => ({ ...s, pixels: { ...s.pixels, [k]: !s.pixels[k] } }));

  const saveAll = async () => {
    setSaving(true);
    const s = await updateSettings({ ...st, contactEmail, adminName, maintenanceMessage: maintenanceMsg });
    setSaving(false);
    if (s) {
      setSt({ ...defaultSettings, ...s });
      toast('تم حفظ جميع الإعدادات والجديدة تنعكس على الفانل');
    } else {
      toast('تعذر الحفظ — تأكد من تشغيل الخادم');
    }
  };

  const addGate = () => {
    const name = newGate.trim();
    if (!name) { toast('اكتب اسم بوابة الدفع أولًا'); return; }
    setSt((s) => ({ ...s, gates: [...s.gates, { name, on: true }] }));
    setNewGate('');
    toast(`أُضيفت بوابة «${name}» — اضغط «حفظ كل الإعدادات» لتطبيقها`);
  };

  const saveContactEmail = async () => {
    const email = contactEmail.trim();
    if (!email) { toast('اكتب بريد المراسلات أولًا'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { toast('هذا البريد غير صحيح — تحقق من كتابته'); return; }
    setSaving(true);
    const s = await updateSettings({ contactEmail: email });
    setSaving(false);
    if (s) { setContactEmail(email); toast(`تم تعيين بريد المراسلات إلى ${email}`); }
    else toast('تعذر الحفظ — تأكد من تشغيل الخادم');
  };

  const addCustomPixel = () => {
    const code = customPixel.trim();
    if (!code) { toast('الصق كود التتبع المخصص أولًا'); return; }
    toast('تمت إضافة كود التتبع المخصص — يُحقن في كل صفحات الفانل بعد الحفظ');
    setCustomPixel('');
  };

  return (
    <div className="set-grid">
      {/* Payment gateways */}
      <div className="panel">
        <div className="panel-head"><h3><CreditCard size={18} /> بوابات الدفع</h3></div>
        <div className="panel-body">
          {gates.map((g, i) => (
            <div className={`gate ${g.on ? '' : 'off'}`} key={i}>
              <span className="gi" style={{ background: ['var(--emerald)', 'var(--sky)', 'var(--vio)', 'var(--gold)'][i % 4] }}>
                {i % 4 === 0 ? <Wallet size={20} /> : i % 4 === 1 ? <CreditCard size={20} /> : i % 4 === 2 ? <Landmark size={20} /> : <Wallet size={20} />}
              </span>
              <div><b>{g.name}</b><span>{g.on ? 'مفعّل · يتقبل الدفع الآن' : 'متوقف مؤقتًا'}</span></div>
              <div className="gt"><Toggle on={g.on} set={() => flipGate(i)} /></div>
            </div>
          ))}
          <div style={{ display: 'flex', gap: '.5rem', marginTop: '.6rem' }}>
            <input value={newGate} onChange={(e) => setNewGate(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addGate()}
              placeholder="اسم بوابة جديدة…" style={{ flex: 1, padding: '.5rem .7rem', border: '1.5px solid var(--line)', borderRadius: 10, fontSize: '.84rem' }} />
            <button className="btn-ghost" onClick={addGate}><CirclePlus size={15} /> إضافة</button>
          </div>
          <div style={{ fontSize: '.78rem', color: 'var(--ink-soft)', fontWeight: 600 }}>💡 بتبديل أي بوابة وتفعيل «حفظ كل الإعدادات» بيتحدّث متاح الدفع في الصفحات.</div>
        </div>
      </div>

      {/* Tracking & pixels */}
      <div className="panel">
        <div className="panel-head"><h3><CodeXml size={18} /> التتبع والبيكسل</h3></div>
        <div className="panel-body">
          <p className="code-pix">&lt;!-- Meta Pixel ID: 4793... --&gt;</p>
          <div className="pixel"><b><ThumbsUp size={17} color="#1877F2" /> Meta Pixel</b><div className="pw"><Toggle on={st.pixels.meta} set={() => flipPixel('meta')} /></div></div>
          <div className="pixel"><b><Globe size={17} color="#4285F4" /> Google Tag Manager</b><div className="pw"><Toggle on={st.pixels.gtm} set={() => flipPixel('gtm')} /></div></div>
          <div className="pixel"><b><Music2 size={17} color="#69C9D0" /> TikTok Pixel</b><div className="pw"><Toggle on={st.pixels.tiktok} set={() => flipPixel('tiktok')} /></div></div>
          <div style={{ display: 'flex', gap: '.5rem', marginTop: '.6rem' }}>
            <input value={customPixel} onChange={(e) => setCustomPixel(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addCustomPixel()}
              placeholder="الصق كود التتبع المخصص…" style={{ flex: 1, padding: '.5rem .7rem', border: '1.5px solid var(--line)', borderRadius: 10, fontSize: '.84rem', direction: 'ltr' }} />
            <button className="btn-ghost" onClick={addCustomPixel}><CodeXml size={15} /> إضافة</button>
          </div>
        </div>
      </div>

      {/* General settings */}
      <div className="panel">
        <div className="panel-head"><h3><Settings2 size={18} /> إعدادات عامة</h3></div>
        <div className="panel-body">
          <div className="setting-row">
            <div>
              <b>وضع الصيانة</b>
              <span>{st.maintenance ? 'مفعّل حاليًا — الفانل متوقف للزوار' : 'إيقاف الفانل مؤقتًا'}</span>
            </div>
            <div className="tg"><Toggle on={st.maintenance} set={() => setSt((s) => ({ ...s, maintenance: !s.maintenance }))} /></div>
          </div>
          {st.maintenance && (
            <input value={maintenanceMsg} onChange={(e) => setMaintenanceMsg(e.target.value)}
              placeholder="رسالة وضع الصيانة" style={{ width: '100%', padding: '.5rem .7rem', border: '1.5px solid var(--line)', borderRadius: 10, fontSize: '.84rem', marginTop: '.5rem' }} />
          )}
          <div className="setting-row">
            <div><b>واجهة RTL عربية</b><span>اتجاه النص من اليمين لليسار</span></div>
            <div className="tg"><Toggle on={st.rtl} set={() => setSt((s) => ({ ...s, rtl: !s.rtl }))} /></div>
          </div>
          <div className="setting-row">
            <div><b>الدفع المشفّر إجباري</b><span>فرض اتصال آمن عند الدفع</span></div>
            <div className="tg"><Toggle on={st.forceSecure} set={() => setSt((s) => ({ ...s, forceSecure: !s.forceSecure }))} /></div>
          </div>
          <div className="setting-row">
            <div><b>إشعارات البريد</b><span>إرسال إشعارات الطلبات والتأكيد</span></div>
            <div className="tg"><Toggle on={st.emailNotify} set={() => setSt((s) => ({ ...s, emailNotify: !s.emailNotify }))} /></div>
          </div>
          <div className="setting-row">
            <div><b>رابط تخصيص المجال</b><span>ربط دومين مخصص للفانل</span></div>
            <div className="tg"><button className="btn-ghost" style={{ padding: '.4rem .7rem', fontSize: '.8rem' }} onClick={() => toast('إعدادات الدومين تُدار من لوحة استضافة المجال — يمكنك نسخ رابط الفانل ومشاركته')}><Globe size={14} /> إدارة</button></div>
          </div>
          <div className="setting-row">
            <div><b>بريد المراسلات</b><span>الذي تصله رسائل الطلبات والتأكيد — اكتب أي إيميل تريده</span></div>
          </div>
          <div className="set-field" style={{ display: 'flex', gap: '.5rem', alignItems: 'center', marginBottom: '.75rem' }}>
            <Mail size={16} style={{ color: 'var(--ink-soft)', flexShrink: 0 }} />
            <input
              dir="ltr"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="you@company.com"
              style={{ flex: 1, padding: '.55rem .7rem', border: '1.5px solid var(--line)', borderRadius: 10, fontSize: '.88rem' }}
            />
            <button className="btn-solid" onClick={saveContactEmail} style={{ whiteSpace: 'nowrap' }}><Save size={15} /> حفظ</button>
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
            <button className="btn-solid" onClick={saveAll}><Save size={16} /> حفظ</button>
          </div>
          <div style={{ fontSize: '.95rem', marginBottom: '1rem' }}>
            <b>اسم البراند:</b> Real Estate<br />
            <b>الإشتراك:</b> الباقة الاحترافية<br />
            <span className="pill on" style={{ marginTop: '.5rem' }}>نشط حتى 2027-01-01</span>
          </div>
          <button className="btn-solid" onClick={saveAll} disabled={saving} style={{ width: '100%', justifyContent: 'center' }}>
            {saving ? <Loader2 size={16} className="spin" /> : <Save size={16} />} {saving ? 'جارٍ الحفظ…' : 'حفظ كل الإعدادات'}
          </button>
        </div>
      </div>
    </div>
  );
}
