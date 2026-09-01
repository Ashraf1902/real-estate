export const agency = {
  brand: 'Real Estate',
  slogan: 'سوقك العقاري الموثوق لشراء واستثمار العقارات',
  phone: '0100 123 4567',
};

export type PropertyType = 'شقة' | 'فيلا' | 'أرض' | 'مكتب' | 'بنتهاوس' | 'شاليه';
export type PaymentPlan = 'كاش' | 'تقسيط' | 'مقدم+تقسيط';

export interface Property {
  id: string;
  title: string;
  type: PropertyType;
  location: string;
  price: number;
  area: number;
  beds: number;
  baths: number;
  images: string[];
  image?: string;
  tag?: 'جديد' | 'خصم' | 'استثماري' | 'مميز';
  desc: string;
  plan: PaymentPlan;
  installment?: { down: string; years: number; monthly: number };
  featured?: boolean;
  available: number;
}

const img = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=60`;

export const properties: Property[] = [
  {
    id: 'P-101',
    title: 'شقة 3 غرف — إطلالة على النيل',
    type: 'شقة',
    location: 'المهندسين، الجيزة',
    price: 3500000,
    area: 165,
    beds: 3,
    baths: 2,
    images: ['🏙️', '🛋️', '🛏️'],
    image: img('photo-1522708323590-d24dbb6b0267'),
    tag: 'مميز',
    desc: 'شقة سوبر لوكس بموقع متميز على النيل، تشطيب كامل، تراس واسع، وعمارة مصعدين بموقف خاص.',
    plan: 'مقدم+تقسيط',
    installment: { down: '30%', years: 7, monthly: 58000 },
    featured: true,
    available: 2,
  },
  {
    id: 'P-102',
    title: 'فيلا مودرن 4 غرف بمسبح خاص',
    type: 'فيلا',
    location: 'التجمع الخامس، القاهرة',
    price: 12400000,
    area: 420,
    beds: 4,
    baths: 4,
    images: ['🏡', '🏊', '🌳'],
    image: img('photo-1613490493576-7fde63acd811'),
    tag: 'استثماري',
    desc: 'فيلا مستقلة بالتقسيط على 8 سنوات، حديقة كبيرة، مسبح، وجراج يتسع لسيارتين. موقع راقي وقريب من خدمات.',
    plan: 'مقدم+تقسيط',
    installment: { down: '25%', years: 8, monthly: 168000 },
    featured: true,
    available: 1,
  },
  {
    id: 'P-103',
    title: 'شقة تطل على البحر — كمبوند سياحي',
    type: 'شقة',
    location: 'الساحل الشمالي',
    price: 5200000,
    area: 148,
    beds: 2,
    baths: 2,
    images: ['🌊', '🏖️', '🌅'],
    image: img('photo-1519641471654-76ce0107ad1b'),
    tag: 'جديد',
    desc: 'شقة شاطئية استثمارية بعائد إيجاري محتمل، تشطيب فندقي، وخدمات كمبوند متكاملة وأمن 24 ساعة.',
    plan: 'تقسيط',
    installment: { down: '40%', years: 5, monthly: 96000 },
    featured: true,
    available: 3,
  },
  {
    id: 'P-104',
    title: 'قطعة أرض استثمارية — 600 م²',
    type: 'أرض',
    location: 'الشروق، القاهرة',
    price: 2400000,
    area: 600,
    beds: 0,
    baths: 0,
    images: ['🏗️', '📍', '🏞️'],
    image: img('photo-1500382017468-9049fed747ef'),
    tag: 'استثماري',
    desc: 'أرض على قطعتين بموقع استراتيجي قرب محاور جديدة، صالحة للسكن أو الاستثمار بعائد ممتاز على المدى الطويل.',
    plan: 'كاش',
    available: 1,
  },
  {
    id: 'P-105',
    title: 'مكتب إداري — الحي المالي',
    type: 'مكتب',
    location: 'العاصمة الإدارية',
    price: 4800000,
    area: 110,
    beds: 0,
    baths: 1,
    images: ['🏢', '💼', '🖥️'],
    image: img('photo-1486406146926-c627a92ad1ab'),
    tag: 'مميز',
    desc: 'مكتب بالمقاصف بتشطيب تجاري جاهز للاستلام الفوري، إطلالة مميزة، وقرب من البنوك والخدمات.',
    plan: 'مقدم+تقسيط',
    installment: { down: '30%', years: 6, monthly: 82000 },
    available: 2,
  },
  {
    id: 'P-106',
    title: 'شقة 2 غرفة — سعر مخفض',
    type: 'شقة',
    location: 'مدينة نصر، القاهرة',
    price: 1850000,
    area: 110,
    beds: 2,
    baths: 1,
    images: ['🏙️', '🛏️', '🚪'],
    image: img('photo-1560448204-e02f11c3d0e2'),
    tag: 'خصم',
    desc: 'شقة فرصة بموقع حيوي وسعر مخفض لفترة محدودة، تشطيب جيد، ومواقف في الشارع قرب المترو.',
    plan: 'تقسيط',
    installment: { down: '35%', years: 7, monthly: 30000 },
    available: 4,
  },
  {
    id: 'P-107',
    title: 'بنتهاوس على النيل — إطلالة بانورامية',
    type: 'بنتهاوس',
    location: 'الزمالك، القاهرة',
    price: 8900000,
    area: 260,
    beds: 4,
    baths: 3,
    images: ['🏙️', '🛋️', '🌆'],
    image: img('photo-1600585154340-be6161a56a0c'),
    tag: 'مميز',
    desc: 'بنتهاوس فاخر بتشطيبات راقية، تراس خاص بإطلالة نيل بانورامية، أمن ومداخل ذكية، ومصعد خاص.',
    plan: 'مقدم+تقسيط',
    installment: { down: '30%', years: 7, monthly: 140000 },
    featured: true,
    available: 1,
  },
  {
    id: 'P-108',
    title: 'تاون هاوس — تجمع سكني مغلق',
    type: 'فيلا',
    location: 'التجمع الخامس، القاهرة',
    price: 6300000,
    area: 300,
    beds: 3,
    baths: 3,
    images: ['🏡', '🌳', '🚗'],
    image: img('photo-1570129477492-45c003edd2be'),
    tag: 'جديد',
    desc: 'تاون هاوس داخل كمبوند مغلق بحمام سباحة مشترك، جاردن خاص، وخدمات أمن ونادي متكامل.',
    plan: 'مقدم+تقسيط',
    installment: { down: '30%', years: 8, monthly: 92000 },
    available: 2,
  },
  {
    id: 'P-109',
    title: 'فيلا بحمام سباحة — الشيخ زايد',
    type: 'فيلا',
    location: 'الشيخ زايد، الجيزة',
    price: 15800000,
    area: 500,
    beds: 5,
    baths: 5,
    images: ['🏊', '🏡', '🌳'],
    image: img('photo-1512918728675-ed5a9ecdebfd'),
    tag: 'استثماري',
    desc: 'فيلا عائلية فاخرة بمساحة كبيرة، مسبح خاص وجراج لعدة سيارات، داخل كمبوند سكني هادئ.',
    plan: 'مقدم+تقسيط',
    installment: { down: '25%', years: 8, monthly: 210000 },
    featured: true,
    available: 1,
  },
  {
    id: 'P-110',
    title: 'شقة 4 غرف — عمارة مرتفعة',
    type: 'شقة',
    location: 'مدينة نصر، القاهرة',
    price: 3100000,
    area: 190,
    beds: 4,
    baths: 2,
    images: ['🏙️', '🛋️', '🛏️'],
    image: img('photo-1502672260266-1c1ef2d93688'),
    tag: 'مميز',
    desc: 'شقة واسعة بتشطيب حديث، غرف مطلة، وتشطيب أرضيات راقي، قريبة من الخدمات والمواصلات.',
    plan: 'مقدم+تقسيط',
    installment: { down: '30%', years: 7, monthly: 50000 },
    available: 3,
  },
  {
    id: 'P-111',
    title: 'شاليه على البحر — استلام فوري',
    type: 'شاليه',
    location: 'الساحل الشمالي',
    price: 2900000,
    area: 120,
    beds: 2,
    baths: 2,
    images: ['🏖️', '🌊', '🛏️'],
    image: img('photo-1499793983690-e29da59ef1c2'),
    tag: 'جديد',
    desc: 'شاليه جاهز بتشطيب فندقي على الشاطئ، عائد إيجاري ممتاز للمصايف، وخدمات فندقية متكاملة.',
    plan: 'تقسيط',
    installment: { down: '50%', years: 4, monthly: 68000 },
    available: 2,
  },
  {
    id: 'P-112',
    title: 'مكتب إداري — المعادي',
    type: 'مكتب',
    location: 'المعادي، القاهرة',
    price: 3400000,
    area: 90,
    beds: 0,
    baths: 1,
    images: ['💼', '🖥️', '🏢'],
    image: img('photo-1497366811353-6870744d04b2'),
    tag: 'مميز',
    desc: 'مكتب جاهز للعمل بتشطيب تجاري عصري، إضاءة طبيعية، وموقع حيوي قريب من المترو والخدمات.',
    plan: 'مقدم+تقسيط',
    installment: { down: '35%', years: 6, monthly: 55000 },
    available: 2,
  },
  {
    id: 'P-113',
    title: 'أرض استثمارية قرب البحر — العين السخنة',
    type: 'أرض',
    location: 'العين السخنة',
    price: 1900000,
    area: 400,
    beds: 0,
    baths: 0,
    images: ['🏞️', '📍', '🌊'],
    image: img('photo-1470071459604-3b5ec3a7fe05'),
    tag: 'استثماري',
    desc: 'أرض بمطل بحري على طريق العين السخنة، مثالية لتطوير مشروع سياحي أو سكني بعائد مرتفع.',
    plan: 'كاش',
    available: 1,
  },
  {
    id: 'P-114',
    title: 'فيلا راقية — 6 أكتوبر',
    type: 'فيلا',
    location: 'مدينة 6 أكتوبر، الجيزة',
    price: 9700000,
    area: 380,
    beds: 4,
    baths: 4,
    images: ['🏡', '🌳', '🏊'],
    image: img('photo-1600596542815-ffad4c1539a9'),
    tag: 'مميز',
    desc: 'فيلا مستقلة بتشطيبات فاخرة، حديقة وتراس واسع، داخل كمبوند راقي بأمان وكل الخدمات.',
    plan: 'مقدم+تقسيط',
    installment: { down: '25%', years: 8, monthly: 128000 },
    available: 1,
  },
  {
    id: 'P-115',
    title: 'شقة 3 غرف — الشيخ زايد (فرصة)',
    type: 'شقة',
    location: 'الشيخ زايد، الجيزة',
    price: 2700000,
    area: 140,
    beds: 3,
    baths: 2,
    images: ['🏙️', '🛋️', '🛏️'],
    image: img('photo-1493809842364-78817add7ffb'),
    tag: 'خصم',
    desc: 'شقة بعرض خاص لفترة محدودة، تشطيب جيد وإضاءة طبيعية، بموقع هادئ قريب من المدارس والخدمات.',
    plan: 'تقسيط',
    installment: { down: '40%', years: 6, monthly: 48000 },
    available: 3,
  },
  {
    id: 'P-116',
    title: 'بنتهاوس زجاجي — إطلالة المدينة',
    type: 'بنتهاوس',
    location: 'الزمالك، القاهرة',
    price: 7200000,
    area: 230,
    beds: 3,
    baths: 3,
    images: ['🌆', '🛋️', '✨'],
    image: img('photo-1586023492125-27b2c045efd7'),
    tag: 'استثماري',
    desc: 'بنتهاوس عصري بواجهات زجاجية، تراس ضخم، تشطيبات فاخرة، وموقع حيوي بإطلالات مفتوحة.',
    plan: 'مقدم+تقسيط',
    installment: { down: '30%', years: 7, monthly: 112000 },
    featured: true,
    available: 1,
  },
  {
    id: 'P-117',
    title: 'فيلا عصرية — العجمي',
    type: 'فيلا',
    location: 'العجمي، الإسكندرية',
    price: 6800000,
    area: 360,
    beds: 4,
    baths: 4,
    images: ['🏡', '🌊', '🛋️'],
    image: img('photo-1564013799919-ab600027ffc6'),
    tag: 'جديد',
    desc: 'فيلا عصرية قريبة من البحر بتصميم حديث، حديقة، ومساحات معيشة واسعة، مثالية للسكن أو المصيف.',
    plan: 'مقدم+تقسيط',
    installment: { down: '30%', years: 8, monthly: 100000 },
    available: 2,
  },
  {
    id: 'P-118',
    title: 'مكتب قطاع الأعمال — مدينة نصر',
    type: 'مكتب',
    location: 'مدينة نصر، القاهرة',
    price: 2600000,
    area: 80,
    beds: 0,
    baths: 1,
    images: ['💼', '🏢', '🖥️'],
    image: img('photo-1497366754035-f200968a6e72'),
    tag: 'مميز',
    desc: 'مكتب عصري جاهز للتشغيل، لوبي فندقي، مصاعد متعددة، وموقع استراتيجي للشركات الناشئة.',
    plan: 'مقدم+تقسيط',
    installment: { down: '35%', years: 5, monthly: 45000 },
    available: 3,
  },
  {
    id: 'P-119',
    title: 'أرض سكنية — 6 أكتوبر (300 م²)',
    type: 'أرض',
    location: 'مدينة 6 أكتوبر، الجيزة',
    price: 1600000,
    area: 300,
    beds: 0,
    baths: 0,
    images: ['🏞️', '📍', '🏗️'],
    image: img('photo-1500530855697-b586d89ba3ee'),
    tag: 'جديد',
    desc: 'أرض سكنية مرخصة داخل كمبوند، مناسبة لبناء فيلا خاصة أو مشروع صغير بعائد جيد.',
    plan: 'كاش',
    available: 2,
  },
  {
    id: 'P-120',
    title: 'شقة لوكس — الرحاب',
    type: 'شقة',
    location: 'الرحاب، القاهرة',
    price: 2400000,
    area: 150,
    beds: 3,
    baths: 2,
    images: ['🏙️', '🛋️', '🛏️'],
    image: img('photo-1484154218962-a197022b5858'),
    tag: 'مميز',
    desc: 'شقة داخل كمبوند الرحاب بحدائق، تشطيب سوبر لوكس، وخدمات أمن وبنية تحتية ممتازة.',
    plan: 'تقسيط',
    installment: { down: '35%', years: 7, monthly: 38000 },
    available: 3,
  },
];

export interface Service {
  id: string;
  name: string;
  kind: 'تشطيب' | 'أثاث' | 'صيانة' | 'استشارة';
  price: number;
  unit: string;
  desc: string;
}

export const services: Service[] = [
  { id: 'S-1', name: 'تشطيب سوبر لوكس', kind: 'تشطيب', price: 425000, unit: 'شقة', desc: 'تشطيب كامل بأعلى جودة خامات خلال 60 يوم.' },
  { id: 'S-2', name: 'فرشة مفروشة كاملة', kind: 'أثاث', price: 210000, unit: 'شقة', desc: 'أثاث مودرن شامل لكل الغرف والمطبخ والتكييف.' },
  { id: 'S-3', name: 'عقد صيانة سنوي', kind: 'صيانة', price: 24000, unit: 'سنة', desc: 'صيانة دورية للسباكة والكهرباء والتكييف لمدة عام.' },
  { id: 'S-4', name: 'استشارة تقييم عقار', kind: 'استشارة', price: 3500, unit: 'جلسة', desc: 'جلسة مع خبير لتقييم العقار ودراسة الربحية قبل الشراء.' },
];

export const serviceKinds = ['تشطيب', 'أثاث', 'صيانة', 'استشارة'];

export interface PropertyLead {
  id: string;
  name: string;
  phone: string;
  interest: string;
  stage: string;
  value: number;
  date: string;
  status: 'جديد' | 'تم التواصل' | 'على البارد';
}

export const propertyLeads: PropertyLead[] = [
  { id: '#L-9201', name: 'كريم نبيل', phone: '0101 234 8890', interest: 'شقة المهندسين', stage: 'صفحة الدفع', value: 1050000, date: '2026-08-29 14:10', status: 'جديد' },
  { id: '#L-9200', name: 'هالة عيسى', phone: '0115 667 2281', interest: 'فيلا التجمع', stage: 'صفحة الهبوط', value: 0, date: '2026-08-29 12:44', status: 'تم التواصل' },
  { id: '#L-9199', name: 'عادل صبري', phone: '0123 445 0091', interest: 'شقة الساحل الشمالي', stage: 'الخدمات الإضافية', value: 1560000, date: '2026-08-29 09:20', status: 'جديد' },
  { id: '#L-9198', name: 'منة الله', phone: '0106 778 1203', interest: 'مكتب العاصمة', stage: 'صفحة الدفع', value: 1440000, date: '2026-08-28 22:15', status: 'على البارد' },
  { id: '#L-9197', name: 'خالد مرسي', phone: '0111 902 4455', interest: 'أرض الشروق', stage: 'صفحة الهبوط', value: 0, date: '2026-08-28 19:47', status: 'تم التواصل' },
];

export interface BookingRow {
  id: string;
  customer: string;
  phone: string;
  property: string;
  service: string;
  downPayment: number;
  status: 'مؤكد' | 'قيد المراجعة' | 'تم التسليم' | 'ملغي';
  date: string;
  servi?: boolean;
}

export const bookings: BookingRow[] = [
  { id: '#BK-4421', customer: 'محمد السيد', phone: '0100 123 4567', property: 'شقة المهندسين', service: 'تشطيب سوبر لوكس', downPayment: 1050000, status: 'مؤكد', date: '2026-08-29 14:20', servi: true },
  { id: '#BK-4420', customer: 'ياسمين عبدالرحمن', phone: '0112 987 6543', property: 'فيلا التجمع الخامس', service: 'بدون خدمات', downPayment: 3100000, status: 'مؤكد', date: '2026-08-29 13:05' },
  { id: '#BK-4419', customer: 'أحمد فتحي', phone: '0128 554 7766', property: 'شقة الساحل الشمالي', service: 'أثاث + صيانة', downPayment: 2334000, status: 'تم التسليم', date: '2026-08-29 11:40', servi: true },
  { id: '#BK-4418', customer: 'سارة محمود', phone: '0109 222 8844', property: 'مكتب العاصمة الإدارية', service: 'بدون خدمات', downPayment: 1440000, status: 'قيد المراجعة', date: '2026-08-29 10:15' },
  { id: '#BK-4417', customer: 'محمود حسن', phone: '0114 333 2290', property: 'شقة مدينة نصر', service: 'تشطيب', downPayment: 647500, status: 'مؤكد', date: '2026-08-28 23:58', servi: true },
  { id: '#BK-4416', customer: 'نورا عادل', phone: '0120 771 5566', property: 'أرض الشروق', service: 'بدون خدمات', downPayment: 2400000, status: 'ملغي', date: '2026-08-28 21:33' },
];

export const propertyFunnel = [
  { id: 'landing', label: 'صفحة الهبوط (المعرض)', visitors: 10000, pct: 100 },
  { id: 'listing', label: 'صفحة العقار', visitors: 7200, pct: 72 },
  { id: 'checkout', label: 'صفحة الحجز والدفع', visitors: 2150, pct: 21.5 },
  { id: 'services', label: 'الخدمات الإضافية', visitors: 980, pct: 9.8 },
  { id: 'confirmed', label: 'تأكيد الحجز', visitors: 1680, pct: 16.8 },
];

export const revenueMetrics = [
  { label: 'إجمالي قيمة الحجوزات', value: 24890000, delta: 14.2, up: true },
  { label: 'متوسط حجم الحجز (AOV)', value: 1880000, delta: 6.8, up: true },
  { label: 'العملاء المحتملون (Leads)', value: 982, delta: 9.1, up: true },
  { label: 'نسبة التحويل', value: 16.8, delta: 1.6, up: true, pct: true },
];

export const inventory = [
  { id: 'P-101', name: 'شقة المهندسين — 3 غرف', type: 'شقة', units: 2, sold: 1, price: 3500000, status: 'نشط' },
  { id: 'P-102', name: 'فيلا التجمع الخامس', type: 'فيلا', units: 1, sold: 0, price: 12400000, status: 'نشط' },
  { id: 'P-103', name: 'شقة الساحل الشمالي', type: 'شقة', units: 3, sold: 2, price: 5200000, status: 'نشط' },
  { id: 'P-104', name: 'أرض الشروق — 600 م²', type: 'أرض', units: 1, sold: 1, price: 2400000, status: 'مؤرشف' },
  { id: 'P-105', name: 'مكتب العاصمة الإدارية', type: 'مكتب', units: 2, sold: 0, price: 4800000, status: 'نشط' },
  { id: 'P-106', name: 'شقة مدينة نصر', type: 'شقة', units: 4, sold: 3, price: 1850000, status: 'نشط' },
];

export const addonServices = [
  { id: 'SV-1', name: 'تشطيب سوبر لوكس', price: 425000, applied: 340, conv: 42 },
  { id: 'SV-2', name: 'أثاث مفروش', price: 210000, applied: 210, conv: 26 },
  { id: 'SV-3', name: 'عقد صيانة سنوي', price: 24000, applied: 480, conv: 58 },
];

export const coupons = [
  { code: 'HANDOVER5', discount: '5%', type: 'نسبة', valid: 'خصم على المقدم', uses: 64 },
  { code: 'SERV10', discount: '10%', type: 'نسبة', valid: 'خصم على الخدمات', uses: 33 },
];

export const abcampaigns = [
  { id: 'A', name: 'نسخة المعرض الحالية', traffic: 50, conv: 14.2, winner: false },
  { id: 'B', name: 'نسخة العروض الاستثمارية', traffic: 50, conv: 16.8, winner: true },
];
