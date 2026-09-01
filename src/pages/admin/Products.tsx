import { useState, useEffect, useRef } from 'react';
import { Plus, Package, Building2, Users, Save, Tag, CirclePlus, Trash2, PencilRuler, Armchair, Wrench, Pencil, X, ImagePlus, Loader2 } from 'lucide-react';
import { addonServices, coupons } from '../../data/mock';
import { useToast } from './AdminLayout';
import { fetchProperties, createProperty, updateProperty, deleteProperty, uploadImage } from '../../api';
import type { Property, PropertyType } from '../../data/mock';

function Toggle({ on, set }: { on: boolean; set: (v: boolean) => void }) {
  return <button type="button" className={`toggle ${on ? 'on' : ''}`} onClick={() => set(!on)} aria-pressed={on} />;
}

const servIcon: Record<string, React.ReactNode> = {
  'تشطيب': <PencilRuler size={16} />,
  'أثاث': <Armchair size={16} />,
  'صيانة': <Wrench size={16} />,
};

const emptyForm = {
  title: '', type: 'شقة', location: '', price: '', area: '', beds: '', baths: '',
  tag: '', desc: '', available: '', image: '',
};

export default function Products() {
  const toast = useToast();
  const [properties, setProperties] = useState<Property[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [couponList, setCouponList] = useState(coupons.map((c) => ({ ...c, on: true })));
  const [newCoupon, setNewCoupon] = useState('');
  const [otoOn, setOtoOn] = useState(true);
  const [bumpOn, setBumpOn] = useState(true);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const url = await uploadImage(file);
    setUploading(false);
    e.target.value = '';
    if (url) {
      setForm((f) => ({ ...f, image: url }));
      toast('تم رفع الصورة وتحويلها إلى WebP');
    } else {
      toast('تعذر رفع الصورة — تأكد من تشغيل الخادم');
    }
  };

  const refresh = () => {
    fetchProperties([]).then((ps) => setProperties(ps)).catch(() => {});
  };

  useEffect(() => {
    refresh();
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const set = (k: keyof typeof emptyForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const saveProperty = async () => {
    if (!form.title.trim() || !form.location.trim() || !form.price) {
      toast('أكمل العنوان والموقع والسعر أولًا');
      return;
    }
    const payload: Partial<Property> = {
      title: form.title,
      type: form.type as PropertyType,
      location: form.location,
      price: Number(form.price) || 0,
      area: Number(form.area) || 0,
      beds: Number(form.beds) || 0,
      baths: Number(form.baths) || 0,
      tag: (form.tag || undefined) as Property['tag'],
      desc: form.desc || undefined,
      available: Number(form.available) || 0,
      image: form.image || undefined,
    };
    if (editingId) {
      const ok = await updateProperty(editingId, payload);
      if (ok) {
        toast(`تم تعديل العقار «${ok.title}» وظهر في الفانل`);
        refresh();
        resetForm();
      } else {
        toast('تعذر الحفظ — تأكد من تشغيل الخادم');
      }
    } else {
      const created = await createProperty(payload);
      if (created) {
        toast(`تمت إضافة العقار «${created.title}» وظهر في الفانل`);
        refresh();
        resetForm();
      } else {
        toast('تعذر الإضافة — تأكد من تشغيل الخادم');
      }
    }
  };

  const startEdit = (p: Property) => {
    setEditingId(p.id);
    setForm({
      title: p.title, type: p.type, location: p.location, price: String(p.price ?? ''),
      area: String(p.area ?? ''), beds: String(p.beds ?? ''), baths: String(p.baths ?? ''),
      tag: p.tag ?? '', desc: p.desc ?? '', available: String(p.available ?? ''), image: p.image ?? '',
    });
  };

  const remove = async (id: string) => {
    const ok = await deleteProperty(id);
    if (ok) {
      toast('تم حذف العقار من الفانل');
      if (editingId === id) resetForm();
      refresh();
    } else {
      toast('تعذر الحذف — تأكد من تشغيل الخادم');
    }
  };

  const addCoupon = () => {
    if (!newCoupon.trim()) return;
    setCouponList((cs) => [{ code: newCoupon.toUpperCase(), discount: '10%', type: 'نسبة', valid: 'غير محدود', uses: 0, on: true }, ...cs]);
    setNewCoupon('');
    toast(`تم إنشاء كود الخصم ${newCoupon.toUpperCase()}`);
  };

  const removeCoupon = (code: string) => {
    setCouponList((cs) => cs.filter((c) => c.code !== code));
    toast(`تم حذف الكود ${code}`);
  };

  return (
    <div>
      <div className="grid2">
        {/* Inventory / Properties — CRUD */}
        <div className="panel">
          <div className="panel-head">
            <h3><Building2 size={18} /> مخزون الوحدات</h3>
            {editingId ? (
              <button className="btn-ghost" style={{ padding: '.4rem .7rem', fontSize: '.8rem' }} onClick={resetForm}><X size={14} /> إلغاء التعديل</button>
            ) : (
              <button className="btn-ghost" style={{ padding: '.4rem .7rem', fontSize: '.8rem' }} onClick={() => toast('املأ النموذج بالأسفل لإضافة عقار')}><Plus size={14} /> إضافة وحدة</button>
            )}
          </div>

          {/* Add / Edit form */}
          <div className="panel-body" style={{ borderBottom: '1px solid var(--line)', marginBottom: '.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '.5rem', marginBottom: '.5rem' }}>
              <input value={form.title} onChange={set('title')} placeholder="عنوان العقار (مثال: شقة 3 غرف)" style={inp} />
              <select value={form.type} onChange={set('type')} style={inp}>
                {['شقة', 'فيلا', 'بنتهاوس', 'شاليه', 'مكتب', 'أرض'].map((t) => <option key={t}>{t}</option>)}
              </select>
              <input value={form.location} onChange={set('location')} placeholder="الموقع (مثال: المهندسين)" style={inp} />
              <input value={form.price} onChange={set('price')} placeholder="السعر (ج.م)" type="number" style={inp} />
              <input value={form.area} onChange={set('area')} placeholder="المساحة (م²)" type="number" style={inp} />
              <input value={form.available} onChange={set('available')} placeholder="الوحدات المتاحة" type="number" style={inp} />
              <input value={form.beds} onChange={set('beds')} placeholder="الغرف" type="number" style={inp} />
              <input value={form.baths} onChange={set('baths')} placeholder="الحمامات" type="number" style={inp} />
            </div>
            <div style={{ display: 'flex', gap: '.5rem', marginBottom: '.5rem' }}>
              <input value={form.tag} onChange={set('tag')} placeholder="شارة (مثال: مميز / جديد / خصم)" style={inp} />
            </div>
            <div style={{ display: 'flex', gap: '.6rem', alignItems: 'center', marginBottom: '.5rem' }}>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
              <button type="button" className="btn-ghost" style={{ padding: '.55rem .8rem', fontSize: '.85rem', display: 'inline-flex', alignItems: 'center', gap: '.4rem' }} onClick={() => fileRef.current?.click()} disabled={uploading}>
                {uploading ? <Loader2 size={15} className="spin" /> : <ImagePlus size={15} />} {uploading ? 'جارٍ التحويل إلى WebP…' : 'رفع صورة'}
              </button>
              {form.image && <img src={form.image} alt="ق" style={{ width: 46, height: 40, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--line)' }} />}
              {form.image && <button type="button" style={{ color: 'var(--coral)', fontSize: '.85rem', fontWeight: 700 }} onClick={() => setForm((f) => ({ ...f, image: '' }))}>إزالة</button>}
            </div>
            <textarea value={form.desc} onChange={(e) => setForm((f) => ({ ...f, desc: e.target.value }))} placeholder="وصف مختصر للعقار" rows={2} style={{ ...inp, width: '100%', resize: 'vertical', fontFamily: 'inherit' }} />
            <button className="btn-solid" style={{ width: '100%', justifyContent: 'center', marginTop: '.5rem' }} onClick={saveProperty}>
              <Save size={16} /> {editingId ? 'حفظ التعديل ونشره في الفانل' : 'إضافة العقار للفانل'}
            </button>
          </div>

          <div className="tbl-wrap">
            <table className="tbl">
              <thead><tr><th>الوحدة</th><th>النوع</th><th>المتوفر</th><th>السعر</th><th>إجراءات</th></tr></thead>
              <tbody>
                {properties.map((p) => (
                  <tr key={p.id}>
                    <td><b style={{ fontSize: '.84rem' }}>{p.title}</b><div style={{ fontSize: '.72rem', color: 'var(--ink-soft)' }}>{p.location}</div></td>
                    <td><span className="pill"><Building2 size={13} /> {p.type}</span></td>
                    <td className="num" style={{ fontFamily: 'var(--f-num)', fontWeight: 800, color: (p.available ?? 0) > 0 ? 'var(--emerald)' : 'var(--coral)' }}>{p.available ?? 0}</td>
                    <td className="num" style={{ fontFamily: 'var(--f-num)', fontWeight: 800 }}>{(p.price ?? 0).toLocaleString('ar-EG')} ج.م</td>
                    <td>
                      <div style={{ display: 'flex', gap: '.4rem' }}>
                        <button title="تعديل" style={{ color: 'var(--sky)' }} onClick={() => startEdit(p)}><Pencil size={16} /></button>
                        <button title="حذف" style={{ color: 'var(--coral)' }} onClick={() => remove(p.id)}><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {properties.length === 0 && (
                  <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--ink-soft)', padding: '1rem' }}>لا توجد وحدات بعد — أضف أول عقار من النموذج بالأعلى</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Coupons */}
        <div className="panel">
          <div className="panel-head"><h3><Tag size={18} /> كوبونات الخصم</h3></div>
          <div className="panel-body">
            <div style={{ display: 'flex', gap: '.5rem', marginBottom: '1rem' }}>
              <input value={newCoupon} onChange={(e) => setNewCoupon(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addCoupon()}
                placeholder="نص الكود… مثال: HANDOVER5" style={{ flex: 1, padding: '.6rem .8rem', border: '1.5px solid var(--line)', borderRadius: 10, fontSize: '.88rem' }} />
              <button className="btn-solid" onClick={addCoupon}><CirclePlus size={16} /> إنشاء</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
              {couponList.map((c) => (
                <div className="pixel" key={c.code} style={{ opacity: c.on ? 1 : .5 }}>
                  <b><Tag size={15} /> {c.code}</b>
                  <div className="pw num">{c.discount} · {c.valid} · استُخدم {c.uses}</div>
                  <div style={{ marginInlineStart: 'auto', display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                    {c.uses > 0 && <span className="pill on">مفعل</span>}
                    <button onClick={() => removeCoupon(c.code)} style={{ color: 'var(--coral)' }}><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bump (services) + Upsell settings */}
      <div className="grid2" style={{ marginTop: '1.4rem' }}>
        <div className="panel">
          <div className="panel-head"><h3><Package size={18} /> خدمات الـ Order Bump</h3>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '.5rem' }}><Toggle on={bumpOn} set={setBumpOn} /></span></div>
          <div className="panel-body">
            {addonServices.map((b) => (
              <div className="ab-panel" key={b.id}>
                <div className="ab-head"><span className="tag-ab" style={{ background: 'var(--gold)' }}>{servIcon[b.name.split(' ')[0] === 'تشطيب' ? 'تشطيب' : b.name.includes('أثاث') ? 'أثاث' : 'صيانة']}</span>
                  <b>{b.name}</b>
                  <span style={{ marginInlineStart: 'auto', color: 'var(--emerald)', fontWeight: 900 }} className="num">+ {b.price.toLocaleString('ar-EG')} ج.م</span></div>
                <div className="ab-stats">
                  <div className="ab-stat"><span>عدد الطلبات</span><b className="num">{b.applied}</b></div>
                  <div className="ab-stat"><span>نسبة القبول</span><b className="num">{b.conv}%</b></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="panel-head"><h3><Users size={18} /> عروض الـ Upsell / Downsell</h3>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '.5rem' }}><Toggle on={otoOn} set={setOtoOn} /></span></div>
          <div className="panel-body">
            <div className="ab-panel">
              <div className="ab-head"><span className="tag-ab" style={{ background: 'var(--vio)' }}>OTO</span><b>باقة التسليم المتكامل</b></div>
              <div className="ab-stats">
                <div className="ab-stat"><span>السعر المجمّع</span><b className="num">625,000 ج.م</b></div>
                <div className="ab-stat"><span>قبل الخصم</span><b className="num">659,000 ج.م</b></div>
              </div>
              <div style={{ marginTop: '.6rem', fontSize: '.8rem', color: 'var(--ink-soft)', fontWeight: 600 }}>تشطيب + أثاث + صيانة · يظهر بعد الحجز · يُعرض الأرخص عند الرفض</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '1.4rem' }}>
        <button className="btn-solid" onClick={() => toast('تم حفظ إعدادات الوحدات والخدمات والعروض')}><Save size={16} /> حفظ كل الإعدادات</button>
      </div>
    </div>
  );
}

const inp: React.CSSProperties = {
  padding: '.55rem .7rem', border: '1.5px solid var(--line)', borderRadius: 10, fontSize: '.85rem',
};
