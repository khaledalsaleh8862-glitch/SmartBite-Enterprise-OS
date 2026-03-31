# SmartBite Enterprise OS

<div align="center">
  <img src="https://img.shields.io/badge/React-19-blue" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-v5.4-blue" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-5.4-646CFF" alt="Vite" />
  <img src="https://img.shields.io/badge/Supabase-v2-EFF8FF" alt="Supabase" />
  <img src="https://img.shields.io/badge/License-MIT-green" alt="License" />
</div>

> نظام إدارة مقاهي متكامل بالذكاء الاصطناعي - AI-Driven Cafeteria Management System

## 🚀 نظرة عامة

SmartBite Enterprise OS هو نظام شامل لإدارة المقاهي والمطاعم يتضمن:
- **نظام POS** لنقطة البيع
- **شاشة KDS** لعرض الطلبات في المطبخ
- **لوحة محاسبة** للتحليلات المالية
- **نظام ولاء العملاء** مع 4 مستويات
- **رموز QR** للطاولات
- **واجهة عميل** متوافقة مع الجوال

## ✨ الميزات

### للعملاء
- 📱 واجهة عميل متجاوبة (Mobile-first PWA)
- 🔐 تسجيل دخول بالهاتف
- 🎁 نظام ولاء متعدد المستويات
- 🛒 سلة تسوق ودفع سلس
- 🌐 دعم كامل للغتين (عربي/إنجليزي)

### للإدارة
- 📊 لوحة تحكم متكاملة
- 📈 تحليلات الإيرادات والأرباح
- 🍳 عرض الطلبات الحية (KDS)
- 🎫 إدارة رموز QR للطاولات
- 👥 إدارة العملاء
- 🔔 إشعارات الضيوف العائدين

## 🛠️ التقنيات

| التقنية | الاستخدام |
|---------|-----------|
| React 19 | واجهة المستخدم |
| TypeScript | لغة البرمجة |
| Vite | بناء المشروع |
| Zustand | إدارة الحالة |
| TanStack Query v5 | إدارة البيانات |
| Tailwind CSS | التصميم |
| Shadcn/UI | مكونات UI |
| Supabase | Backend (قاعدة بيانات + Realtime + Auth) |
| Framer Motion | الحركات |
| Recharts | الرسوم البيانية |
| qrcode.react | توليد رموز QR |

## 📁 هيكل المشروع

```
src/
├── components/
│   ├── accounting/      # لوحة المحاسبة
│   ├── admin/           # مركز التحكم
│   ├── customer/         # واجهة العميل
│   ├── kitchen/          # شاشة المطبخ (KDS)
│   ├── pos/              # نقطة البيع
│   └── ui/               # مكونات UI الأساسية
├── contexts/
│   └── LanguageContext   # إدارة اللغة (RTL/LTR)
├── hooks/                # React Hooks مخصصة
├── lib/                  # مكتبات وإعدادات
├── store/                # Zustand stores
└── supabase/             # Migratgions للـ Supabase
```

## 🚀 التشغيل

```bash
# تثبيت الاعتماديات
npm install

# تشغيل في وضع التطوير
npm run dev

# بناء للإنتاج
npm run build

# معاينة البناء
npm run preview
```

## 🔗 الروابط

| البيئة | الرابط |
|--------|--------|
| التطوير | http://localhost:3000 |
| الوضع | الرابط |

## 📝 ملاحظات التطوير

### Supabase
- قم بإنشاء مشروع Supabase جديد
- نفذ migrations من `supabase/migrations/001_schema.sql` و `002_qr_and_visits.sql`
- أضف متغيرات البيئة:
  ```
  VITE_SUPABASE_URL=your-project-url
  VITE_SUPABASE_ANON_KEY=your-anon-key
  ```

### Gemini API (اختياري)
- للحصول على ميزات الذكاء الاصطناعي
- أضف مفتاح API في المتغيرات البيئية

## 📄 الرخصة

MIT License - راجع ملف LICENSE للمزيد من التفاصيل.

---

<div align="center">
  <p>صُنع بـ ❤️ بواسطة SmartBite Team</p>
</div>
