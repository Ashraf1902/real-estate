import { useState } from 'react';
import { GripVertical, GitBranch, Copy, Check, Save, Plus, ArrowLeft, ArrowUpRight, Trophy, Eye } from 'lucide-react';
import { abcampaigns } from '../../data/mock';
import { useToast } from './AdminLayout';
import { fetchSettings, updateSettings } from '../../api';

function Toggle({ on, set }: { on: boolean; set: (v: boolean) => void }) {
  return <button type="button" className={`toggle ${on ? 'on' : ''}`} onClick={() => set(!on)} aria-pressed={on} />;
}

function Block({ id, mutable, cta, delta, onChange, onPreview }: {
  id: string; mutable: string; cta: string; delta: number;
  onChange: (id: string, field: 'mutable' | 'cta', v: string) => void;
  onPreview: (id: string) => void;
}) {
  return (
    <div className="block">
      <div className="bl-top"><GripVertical size={18} className="grip" /><b>نص يمكن تعديله</b><span style={{ fontSize: '.68rem', color: 'var(--ink-soft)' }}>🖱 اسحب</span></div>
      <div className="bl-inputs">
        <input value={mutable} onChange={(e) => onChange(id, 'mutable', e.target.value)} aria-label="النص" />
        <span className="bl-cta" style={{ display: 'inline-flex', alignItems: 'center', gap: '.3rem' }}><span className="num">{delta}%</span> {delta > 0 ? '👆' : ''}</span>
      </div>
      <div className="bl-top" style={{ marginTop: '.5rem', marginBottom: '.4rem' }}><GripVertical size={18} className="grip" /><b>نص زر الـ CTA</b></div>
      <div className="bl-inputs">
        <input value={cta} onChange={(e) => onChange(id, 'cta', e.target.value)} aria-label="الـ CTA" />
        <button className="bl-cta" onClick={(e) => { e.preventDefault(); onPreview(id); }}><Eye size={13} /> عاين</button>
      </div>
    </div>
  );
}

export default function FunnelBuilder() {
  const toast = useToast();
  const [blocks, setBlocks] = useState([
    { id: 'b1', mutable: 'معلّك عارف الفرق بين شقة بتخسرك وشقة بتكسبك؟', cta: 'استعرض العقارات المتاحة الآن', delta: 11.2 },
    { id: 'b2', mutable: 'انضم لأكثر من 2,400 مشتري استلموا وحداتهم بأمان من عندنا', cta: 'شاهد العروض أولًا', delta: 9.8 },
    { id: 'b3', mutable: 'الوحدات محدودة العدد — السعر والمقدم بيصفي بسرعة', cta: 'احجز وحدتك الآن', delta: 13.8 },
  ]);
  const [aSel, setASel] = useState<'A' | 'B'>('B');
  const [abTraffic, setAbTraffic] = useState(50);
  const [pixelOn, setPixelOn] = useState(true);
  const [done, setDone] = useState(false);
  const [previewBlock, setPreviewBlock] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const changeBlock = (id: string, field: 'mutable' | 'cta', v: string) =>
    setBlocks((bs) => bs.map((b) => (b.id === id ? { ...b, [field]: v } : b)));

  const load = async () => {
    const s = await fetchSettings().catch(() => null);
    if (s && Array.isArray(s.landingBlocks) && s.landingBlocks.length === blocks.length) {
      setBlocks(s.landingBlocks);
      if (typeof s.abTraffic === 'number') setAbTraffic(s.abTraffic);
      if (s.distributeVisitors === true || s.distributeVisitors === false) setPixelOn(s.distributeVisitors);
    }
  };
  load();

  const save = async () => {
    setSaving(true);
    const s = await updateSettings({ landingBlocks: blocks, abTraffic, distributeVisitors: pixelOn, activeAbVersion: aSel });
    setSaving(false);
    toast(s ? 'تم حفظ النسخة ونشرها بنجاح' : 'تعذر الحفظ — تأكد من تشغيل الخادم');
  };

  const addVersion = () => {
    setDone((d) => { if (!d) toast('أضيفت نسخة جديدة من صفحة الهبوط — عدّل النصوص ثم احفظ'); else toast('تمت إزالة النسخة الإضافية'); return !d; });
  };

  const previewOf = (id: string) => {
    const b = blocks.find((x) => x.id === id);
    setPreviewBlock(previewBlock === id ? null : id);
    if (b) toast(`معاينة: «${b.cta}»`);
  };

  const win = abcampaigns.find((c) => c.winner)?.id === 'B';
  const a = abcampaigns.find((c) => c.id === 'A')!;
  const b = abcampaigns.find((c) => c.id === 'B')!;

  return (
    <div>
      <div className="export-bar" style={{ alignItems: 'center' }}>
        <span style={{ fontWeight: 800, fontFamily: 'var(--f-display)' }}>صفحة الهبوط الرئيسية</span>
        <span className="pill on"><Check size={13} /> منشورة</span>
        <span style={{ marginInlineStart: 'auto' }} />
        <button className="btn-ghost" onClick={addVersion}>
          {done ? <><Copy size={15} /> نسخة إضافية</> : <><Plus size={15} /> إضافة نسخة جديدة</>}
        </button>
        <button className="btn-solid" onClick={save} disabled={saving}>
          {saving ? <><Save size={15} /> جارٍ…</> : <><Save size={15} /> حفظ ونشر النسخة</>}
        </button>
      </div>

      {previewBlock && (() => { const pb = blocks.find((x) => x.id === previewBlock); return pb ? (
        <div className="panel" style={{ marginBottom: '1.4rem', border: '1.5px solid var(--emerald)' }}>
          <div className="panel-head"><h3><Eye size={18} /> معاينة العنصر</h3><span className="meta">كيف سيظهر CTA للزائر</span></div>
          <div className="panel-body" style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '1rem' }}>{pb.mutable}</p>
            <button className="pbook" style={{ margin: '0 auto' }}>{pb.cta} ←</button>
          </div>
        </div>
      ) : null; })()}

      {/* A/B test panel */}
      <div className="panel" style={{ marginBottom: '1.4rem' }}>
        <div className="panel-head"><h3><GitBranch size={18} /> اختبار A/B</h3>
          <span className="meta"><span style={{ display: 'inline-flex', alignItems: 'center', gap: '.4rem', color: 'var(--ink-soft)' }}><Toggle on={pixelOn} set={setPixelOn} /> تفعيل توزيع الزوار</span></span></div>
        <div className="panel-body">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.2rem' }}>
            {[a, b].map((c) => (
              <div className={`ab-panel ${c.winner ? '' : ''}`} key={c.id} style={{ borderColor: c.id === aSel ? 'var(--navy-2)' : undefined }}>
                <div className="ab-head">
                  <span className="tag-ab" style={{ background: c.id === 'A' ? 'var(--sky)' : 'var(--vio)' }}>{c.id}</span>
                  <b>{c.name}</b>
                  {c.winner && <span className="winner num"><Trophy size={12} /> الفائزة</span>}
                </div>
                <div className="ab-stats">
                  <div className="ab-stat"><span>نسبة توزيع الزوار</span><b className="num">{c.traffic}%</b></div>
                  <div className="ab-stat"><span>نسبة التحويل</span><b className="num">{c.conv}%</b></div>
                </div>
              </div>
            ))}
          </div>
          <div className="split-row">
            <span style={{ fontSize: '.8rem', fontWeight: 800, color: 'var(--navy-2)' }}>نسبة التوزيع A : B</span>
            <input type="range" min={0} max={100} value={abTraffic} onChange={(e) => setAbTraffic(+e.target.value)} />
            <span className="num" style={{ fontSize: '.8rem', fontWeight: 800 }}>{abTraffic}% / {100 - abTraffic}%</span>
          </div>
          <div style={{ marginTop: '.9rem', fontSize: '.82rem', color: 'var(--ink-soft)', fontWeight: 600 }}>
            💡 النسخة B حاليًا بتتغلب: <b style={{ color: 'var(--emerald)' }}>تحويل أعلى بـ 2.6 نقطة.</b> ارفع نسبة توزيعها تدريجيًا.
          </div>
        </div>
      </div>

      {/* Editor blocks */}
      <div className="panel" style={{ marginBottom: '1.4rem' }}>
        <div className="panel-head"><h3><GripVertical size={18} /> محرر عناصر الصفحة</h3><span className="meta">جرّب تغيير النص وجاوب على أداء النسخة</span></div>
        <div className="panel-body">
          {blocks.map((b) => <Block key={b.id} {...b} id={b.id} onChange={changeBlock} onPreview={previewOf} />)}
        </div>
      </div>

      {/* Upsell mapping */}
      <div className="panel">
        <div className="panel-head"><h3><GitBranch size={18} /> خريطة الـ Upsell / Downsell</h3><span className="meta">اربط الصفحات ببعضها</span></div>
        <div className="panel-body">
          <div className="map-tree">
            <div className="match"><span className="arw"><ArrowUpRight size={16} /></span> <b>تأكد حجز الوحدة؟</b> ← <b>ينتقل إلى</b></div>
            <div className="mnode">
              <div className="moption">
                <b>العرض الأعلى (Upsell)</b><span className="lbl">إذا قبل ↑</span>
                <select defaultValue="thanks" style={{ marginInlineStart: 'auto' }}><option value="thanks">صفحة الشكر</option><option value="downsell">الـ Downsell</option></select>
              </div>
              <div className="moption">
                <b>الـ Downsell</b><span className="lbl">إذا رفض ↑</span>
                <select defaultValue="thanks" style={{ marginInlineStart: 'auto' }}><option value="thanks">صفحة الشكر</option><option value="upsell">الـ Upsell</option></select>
              </div>
              <div className="moption go">
                <ArrowLeft size={15} style={{ color: 'var(--emerald)' }} /> <b>إذا رفض الاثنين</b> <span className="cond" style={{ marginInlineStart: 'auto' }}>صفحة الشكر الأساسية</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
