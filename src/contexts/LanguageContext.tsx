import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

type Locale = 'en-US' | 'ar-SA';

interface LanguageContextType {
  locale: Locale;
  isRTL: boolean;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  t: (key: string) => string;
}

const translations: Record<string, Record<Locale, string>> = {
  // Navigation
  'nav.smartbite': { 'en-US': 'SmartBite Enterprise', 'ar-SA': 'سمارت بايت للمؤسسات' },
  'nav.accounting': { 'en-US': 'Accounting', 'ar-SA': 'المحاسبة' },
  'nav.customer': { 'en-US': 'Customer Terminal', 'ar-SA': 'واجهة العميل' },
  'nav.pos': { 'en-US': 'POS Terminal', 'ar-SA': ' نقطة البيع' },
  'nav.kds': { 'en-US': 'Kitchen Display', 'ar-SA': 'عرض المطبخ' },
  'nav.short': { 'en-US': 'ACC', 'ar-SA': 'مح' },
  'nav.customerShort': { 'en-US': 'CPT', 'ar-SA': 'عم' },
  'nav.posShort': { 'en-US': 'POS', 'ar-SA': 'ب' },
  'nav.kdsShort': { 'en-US': 'KDS', 'ar-SA': 'م' },

  // Accounting Dashboard
  'accounting.title': { 'en-US': 'Accounting Dashboard', 'ar-SA': 'لوحة المحاسبة' },
  'accounting.subtitle': { 'en-US': 'Comprehensive financial insights and revenue analytics', 'ar-SA': 'رؤى مالية شاملة وتحليلات الإيرادات' },
  'accounting.totalRevenue': { 'en-US': 'Total Revenue', 'ar-SA': 'إجمالي الإيرادات' },
  'accounting.totalOrders': { 'en-US': 'Total Orders', 'ar-SA': 'إجمالي الطلبات' },
  'accounting.avgOrderValue': { 'en-US': 'Average Order Value', 'ar-SA': 'متوسط قيمة الطلب' },
  'accounting.topCategory': { 'en-US': 'Top Category', 'ar-SA': 'أفضل فئة' },
  'accounting.overview': { 'en-US': 'Overview', 'ar-SA': 'نظرة عامة' },
  'accounting.accounts': { 'en-US': 'Accounts', 'ar-SA': 'الحسابات' },
  'accounting.products': { 'en-US': 'Products', 'ar-SA': 'المنتجات' },
  'accounting.aiInsights': { 'en-US': 'AI Insights', 'ar-SA': 'تحليلات الذكاء الاصطناعي' },
  'accounting.dailyRevenue': { 'en-US': 'Daily Revenue', 'ar-SA': 'إيرادات يومية' },
  'accounting.netRevenue': { 'en-US': 'Net Revenue', 'ar-SA': 'صافي الإيرادات' },
  'accounting.ordersSales': { 'en-US': 'Orders & Sales', 'ar-SA': 'الطلبات والمبيعات' },
  'accounting.orderCount': { 'en-US': 'Order Count', 'ar-SA': 'عدد الطلبات' },
  'accounting.grossSales': { 'en-US': 'Gross Sales', 'ar-SA': 'إجمالي المبيعات' },
  'accounting.revenueByCategory': { 'en-US': 'Revenue Distribution by Category', 'ar-SA': 'توزيع الإيرادات حسب الفئة' },
  'accounting.chartOfAccounts': { 'en-US': 'Chart of Accounts', 'ar-SA': 'كشف الحسابات' },
  'accounting.allAccounts': { 'en-US': 'All financial accounts and their balances', 'ar-SA': 'جميع الحسابات المالية وحركاتها' },
  'accounting.accountsReceivable': { 'en-US': 'Accounts Receivable', 'ar-SA': 'الحسابات المدينة' },
  'accounting.revenueExpenses': { 'en-US': 'Revenue vs Expenses', 'ar-SA': 'الإيرادات والمصروفات' },
  'accounting.topSelling': { 'en-US': 'Top Selling Products', 'ar-SA': 'أفضل المنتجات مبيعاً' },
  'accounting.byRevenue': { 'en-US': 'Most popular products by revenue', 'ar-SA': 'المنتجات الأكثر شعبية حسب الإيرادات' },
  'accounting.unitsSold': { 'en-US': 'units sold', 'ar-SA': 'وحدة مباعة' },
  'accounting.margin': { 'en-US': 'margin', 'ar-SA': 'هامش ربح' },
  'accounting.profitAnalysis': { 'en-US': 'Profit Margin Analysis', 'ar-SA': 'تحليل هامش الربح' },
  'accounting.salesForecast': { 'en-US': 'Sales Forecast', 'ar-SA': 'توقعات المبيعات' },
  'accounting.24h': { 'en-US': 'Last 24 Hours', 'ar-SA': 'آخر 24 ساعة' },
  'accounting.7d': { 'en-US': 'Last 7 Days', 'ar-SA': 'آخر 7 أيام' },
  'accounting.30d': { 'en-US': 'Last 30 Days', 'ar-SA': 'آخر 30 يوم' },
  'accounting.90d': { 'en-US': 'Last 90 Days', 'ar-SA': 'آخر 90 يوم' },
  'accounting.dailyRevenueDesc': { 'en-US': 'Net daily revenue for selected period', 'ar-SA': 'إيرادات صافية يومية للفترة المحددة' },
  'accounting.ordersSalesDesc': { 'en-US': 'Order count and total sales volume', 'ar-SA': 'عدد الطلبات وإجمالي المبيعات' },
  'accounting.revenueDistribution': { 'en-US': 'Revenue Distribution by Category', 'ar-SA': 'توزيع الإيرادات حسب الفئة' },
  'accounting.chartOfAccountsDesc': { 'en-US': 'All financial accounts and their balances', 'ar-SA': 'جميع الحسابات المالية وحركاتها' },
  'accounting.topSellingProducts': { 'en-US': 'Top Selling Products', 'ar-SA': 'أفضل المنتجات مبيعاً' },
  'accounting.topSellingProductsDesc': { 'en-US': 'Most popular products by revenue', 'ar-SA': 'المنتجات الأكثر شعبية حسب الإيرادات' },
  'accounting.profitMarginAnalysis': { 'en-US': 'Profit Margin Analysis', 'ar-SA': 'تحليل هامش الربح' },
  'accounting.expectedIncrease': { 'en-US': 'Expected +15%', 'ar-SA': 'ارتفاع متوقع' },
  'accounting.peakHours': { 'en-US': 'Peak: 12-2 PM', 'ar-SA': 'ساعات الذروة: 12-2' },
  'accounting.starsDesc': { 'en-US': 'items high profit & popular', 'ar-SA': 'عناصر عالية الربح وشعبية' },
  'accounting.puzzlesDesc': { 'en-US': 'items need repricing', 'ar-SA': 'عناصر تحتاج تسعيرة' },
  'accounting.dogsDesc': { 'en-US': 'item needs reevaluation', 'ar-SA': 'عنصر يحتاج إعادة تقييم' },
  'accounting.inventoryRecommendations': { 'en-US': 'Inventory Recommendations', 'ar-SA': 'توصيات المخزون' },
  'accounting.lowStockAlert': { 'en-US': 'Low Stock Alert', 'ar-SA': 'انخفاض المخزون' },
  'accounting.reorderSuggested': { 'en-US': 'Reorder Suggested', 'ar-SA': 'إعادة ترتيب مستحبة' },
  'accounting.healthyLevels': { 'en-US': 'Healthy Levels', 'ar-SA': 'مستويات صحية' },
  'accounting.aiPricingOptimization': { 'en-US': 'AI Pricing Optimization', 'ar-SA': 'تحسين التسعيرة بالذكاء الاصطناعي' },
  'accounting.applyRecommendation': { 'en-US': 'Apply Recommendation', 'ar-SA': 'تطبيق التوصية' },
  'accounting.menuEngineering': { 'en-US': 'Menu Engineering', 'ar-SA': 'هندسة القائمة' },
  'accounting.stars': { 'en-US': 'Stars:', 'ar-SA': 'نجوم:' },
  'accounting.puzzles': { 'en-US': 'Puzzles:', 'ar-SA': 'ألعاب:' },
  'accounting.dogs': { 'en-US': 'Dogs:', 'ar-SA': 'كلاب:' },
  'accounting.inventoryRec': { 'en-US': 'Inventory Recommendations', 'ar-SA': 'توصيات المخزون' },
  'accounting.lowStock': { 'en-US': 'Low Stock Alert', 'ar-SA': 'انخفاض المخزون' },
  'accounting.reorder': { 'en-US': 'Reorder Suggested', 'ar-SA': 'إعادة ترتيب مستحبة' },
  'accounting.healthy': { 'en-US': 'Healthy Levels', 'ar-SA': 'مستويات صحية' },
  'accounting.aiPricing': { 'en-US': 'AI Pricing Optimization', 'ar-SA': 'تحسين التسعيرة بالذكاء الاصطناعي' },
  'accounting.apply': { 'en-US': 'Apply Recommendation', 'ar-SA': 'تطبيق التوصية' },
  'accounting.vsLast': { 'en-US': 'vs last period', 'ar-SA': 'مقارنة بالفترة السابقة' },
  'accounting.expected': { 'en-US': 'Expected +15%', 'ar-SA': 'ارتفاع متوقع' },
  'accounting.peak': { 'en-US': 'Peak: 12-2 PM', 'ar-SA': 'ساعات الذروة: 12-2' },
  'accounting.highProfitPopular': { 'en-US': 'items high profit & popular', 'ar-SA': 'عناصر عالية الربح وشعبية' },
  'accounting.needReprice': { 'en-US': 'items need repricing', 'ar-SA': 'عناصر تحتاج تسعيرة' },
  'accounting.needReeval': { 'en-US': 'item needs reevaluation', 'ar-SA': 'عنصر يحتاج إعادة تقييم' },
  'accounting.arabicCoffeeStock': { 'en-US': 'Arabic Coffee: 2kg remaining (min: 5kg)', 'ar-SA': 'القهوة العربية: 2 كجم متبقي (حد أدنى: 5 كجم)' },
  'accounting.pizzaBreadStock': { 'en-US': 'Pizza Bread: 8 pieces left (next week: +50%)', 'ar-SA': 'خبز البيتزا: 8 قطع متبقية (الأسبوع القادم: +50%)' },
  'accounting.cheeseStock': { 'en-US': 'Cheese: 15kg in stock', 'ar-SA': 'الجبن: 15 كجم متوفر' },
  'accounting.aiBasilRec': { 'en-US': 'Based on competitor data analysis and price elasticity, we recommend increasing "Basil Sandwich" price by 10% to improve profit margins without significantly affecting demand. Expected demand change: only -2%.', 'ar-SA': 'بناءً على تحليل بيانات المنافسين ومرونة السعر، نوصي بزيادة سعر "ساندويتش الريحان" بنسبة 10% لتحسين هامش الربح دون التأثير على الطلب. الطلب المتوقع: -2% فقط.' },

  // Customer Terminal
  'customer.scanQR': { 'en-US': 'Scan QR to Check-in', 'ar-SA': 'امسح رمز QR للاستفادة' },
  'customer.scanDesc': { 'en-US': 'Scan the QR code on your table to start', 'ar-SA': 'امسح رمز الاستجابة السريعة الموجود على طاولتك' },
  'customer.scanNow': { 'en-US': 'Scan Now', 'ar-SA': 'امسح الآن' },
  'customer.pointsPerVisit': { 'en-US': 'pts per visit', 'ar-SA': 'نقطة لكل زيارة' },
  'customer.instantCashback': { 'en-US': 'Instant cashback', 'ar-SA': 'كاش باك فوري' },
  'customer.menu': { 'en-US': 'Menu', 'ar-SA': 'قائمة الطعام' },
  'customer.loyalty': { 'en-US': 'Loyalty', 'ar-SA': 'الولاء' },
  'customer.yourOrder': { 'en-US': 'Your Order', 'ar-SA': 'طلبك' },
  'customer.subtotal': { 'en-US': 'Subtotal', 'ar-SA': 'المجموع الفرعي' },
  'customer.cashback': { 'en-US': 'Cashback (5%)', 'ar-SA': 'كاش باك (5%)' },
  'customer.total': { 'en-US': 'Total', 'ar-SA': 'الإجمالي' },
  'customer.checkout': { 'en-US': 'Checkout', 'ar-SA': 'إتمام الطلب' },
  'customer.loyaltyRewards': { 'en-US': 'Loyalty Rewards', 'ar-SA': 'نقاط الولاء' },
  'customer.points': { 'en-US': 'Points', 'ar-SA': 'نقطة' },
  'customer.visits': { 'en-US': 'Visits', 'ar-SA': 'زيارة' },
  'customer.cashbackRate': { 'en-US': 'Cashback', 'ar-SA': 'كاش باك' },
  'customer.yourFavorite': { 'en-US': 'Your Favorite', 'ar-SA': 'عنصرك المفضل' },
  'customer.favorite': { 'en-US': 'Favorite', 'ar-SA': 'مفضل' },
  'customer.nextTier': { 'en-US': 'Next tier:', 'ar-SA': 'المستوى التالي:' },
  'customer.pointsToGo': { 'en-US': 'points to go', 'ar-SA': 'نقطة متبقية' },
  'customer.toNextTier': { 'en-US': 'to next tier', 'ar-SA': 'للالمستوى التالي' },
  'customer.popular': { 'en-US': 'Popular', 'ar-SA': 'الأكثر طلباً' },
  'customer.remove': { 'en-US': 'Remove', 'ar-SA': 'إزالة' },
  'customer.clear': { 'en-US': 'Clear', 'ar-SA': 'مسح' },
  'customer.optional': { 'en-US': 'Customer name (optional)', 'ar-SA': 'اسم العميل (اختياري)' },
  'customer.successOrder': { 'en-US': 'Order placed successfully!', 'ar-SA': 'تم تسجيل طلبك بنجاح!' },

  // POS
  'pos.smartbitePOS': { 'en-US': 'SmartBite POS', 'ar-SA': 'نقطة بيع سمارت بايت' },
  'pos.commandCenter': { 'en-US': 'Command Center', 'ar-SA': 'مركز التحكم' },
  'pos.all': { 'en-US': 'All', 'ar-SA': 'الكل' },
  'pos.shortcuts': { 'en-US': 'Shortcuts', 'ar-SA': 'الاختصارات' },
  'pos.cart': { 'en-US': 'Cart', 'ar-SA': 'السلة' },
  'pos.search': { 'en-US': 'Search products...', 'ar-SA': 'ابحث عن منتج...' },
  'pos.cash': { 'en-US': 'Cash', 'ar-SA': 'نقدي' },
  'pos.card': { 'en-US': 'Card', 'ar-SA': 'بطاقة' },
  'pos.vat': { 'en-US': 'VAT 15%', 'ar-SA': 'ضريبة 15%' },
  'pos.forCardPayment': { 'en-US': 'Ctrl+Enter for card payment', 'ar-SA': 'Ctrl+Enter للدفع بالبطاقة' },
  'pos.success': { 'en-US': 'Success!', 'ar-SA': 'تم بنجاح!' },
  'pos.orderPlaced': { 'en-US': 'Order placed successfully', 'ar-SA': 'تم تسجيل طلبك' },
  'pos.orderNumber': { 'en-US': 'Order #', 'ar-SA': 'رقم الطلب' },
  'pos.paymentMethod': { 'en-US': 'Payment', 'ar-SA': 'طريقة الدفع' },
  'pos.done': { 'en-US': 'Done', 'ar-SA': 'تم' },
  'pos.shortcutsTitle': { 'en-US': 'Keyboard Shortcuts', 'ar-SA': 'اختصارات لوحة المفاتيح' },
  'pos.quickAdd': { 'en-US': 'Quick add item', 'ar-SA': 'إضافة منتج سريع' },
  'pos.clearCart': { 'en-US': 'Clear cart', 'ar-SA': 'مسح السلة' },
  'pos.showHelp': { 'en-US': 'Show this help', 'ar-SA': 'إظهار المساعدة' },
  'pos.close': { 'en-US': 'Close', 'ar-SA': 'إغلاق' },
  'pos.shiftInfo': { 'en-US': 'Shift Info', 'ar-SA': 'معلومات الشيفت' },
  'pos.cashier': { 'en-US': 'Cashier', 'ar-SA': 'الكاشير' },
  'pos.hours': { 'en-US': 'Hours', 'ar-SA': 'ساعات العمل' },
  'pos.opening': { 'en-US': 'Opening', 'ar-SA': 'الافتتاح' },
  'pos.current': { 'en-US': 'Current', 'ar-SA': 'الحالي' },
  'pos.variance': { 'en-US': 'Variance', 'ar-SA': 'الفرق' },
  'pos.endShift': { 'en-US': 'End Shift', 'ar-SA': 'إنهاء الشيفت' },
  'pos.cashManagement': { 'en-US': 'Cash Management', 'ar-SA': 'إدارة النقدية' },
  'pos.cashIn': { 'en-US': 'Cash In', 'ar-SA': 'إضافة' },
  'pos.cashOut': { 'en-US': 'Cash Out', 'ar-SA': 'سحب' },
  'pos.recentOrders': { 'en-US': 'Recent Orders', 'ar-SA': 'الطلبات الأخيرة' },

  // KDS
  'kds.kitchenDisplay': { 'en-US': 'Kitchen Display', 'ar-SA': 'عرض المطبخ' },
  'kds.smartbiteKDS': { 'en-US': 'SmartBite KDS', 'ar-SA': 'نظام عرض المطبخ' },
  'kds.pending': { 'en-US': 'Pending', 'ar-SA': 'معلق' },
  'kds.preparing': { 'en-US': 'In Progress', 'ar-SA': 'قيد التحضير' },
  'kds.ready': { 'en-US': 'Ready', 'ar-SA': 'جاهز' },
  'kds.delayed': { 'en-US': 'Delayed', 'ar-SA': 'متأخر' },
  'kds.totalOrders': { 'en-US': 'Total Orders', 'ar-SA': 'إجمالي الطلبات' },
  'kds.refresh': { 'en-US': 'Refresh', 'ar-SA': 'تحديث' },
  'kds.rush': { 'en-US': 'RUSH', 'ar-SA': 'عاجل' },
  'kds.table': { 'en-US': 'Table', 'ar-SA': 'طاولة' },
  'kds.noOrders': { 'en-US': 'No orders to display', 'ar-SA': 'لا توجد طلبات' },
  'kds.readyPickup': { 'en-US': 'Ready for Pickup', 'ar-SA': 'طلبات جاهزة للاستلام' },
  'kds.noReadyOrders': { 'en-US': 'No orders ready', 'ar-SA': 'لا توجد طلبات جاهزة' },
  'kds.speedSummary': { 'en-US': 'Speed Summary', 'ar-SA': 'ملخص السرعة' },
  'kds.avgExpected': { 'en-US': 'Avg Expected', 'ar-SA': 'المتوسط المتوقع' },
  'kds.currentActual': { 'en-US': 'Current Actual', 'ar-SA': 'الفعلي الحالي' },
  'kds.fastestOrder': { 'en-US': 'Fastest Order', 'ar-SA': 'أسرع طلب' },
  'kds.slowestOrder': { 'en-US': 'Slowest Order', 'ar-SA': 'الأبطأ طلب' },
  'kds.alerts': { 'en-US': 'Alerts', 'ar-SA': 'تنبيهات' },
  'kds.noAlerts': { 'en-US': 'No alerts', 'ar-SA': 'لا توجد تنبيهات' },
  'kds.items': { 'en-US': 'items', 'ar-SA': 'عنصر' },
  'kds.hasInstructions': { 'en-US': 'Has special instructions', 'ar-SA': 'يحتوي على ملاحظات خاصة' },
  'kds.completeOrder': { 'en-US': 'Complete Order', 'ar-SA': 'اكتمال الطلب' },
  'kds.itemsordered': { 'en-US': 'items', 'ar-SA': 'عناصر' },

  // Admin
  'admin.commandCenter': { 'en-US': 'Command Center', 'ar-SA': 'مركز التحكم' },
  'admin.qrManagement': { 'en-US': 'QR Management', 'ar-SA': 'إدارة رموز QR' },
  'admin.liveOrders': { 'en-US': 'Live Orders', 'ar-SA': 'الطلبات الحية' },
  'admin.customers': { 'en-US': 'Customers', 'ar-SA': 'العملاء' },
  'admin.analytics': { 'en-US': 'Analytics', 'ar-SA': 'التحليلات' },
  'admin.allTables': { 'en-US': 'All Tables', 'ar-SA': 'كل الطاولات' },
  'admin.active': { 'en-US': 'Active', 'ar-SA': 'نشطة' },
  'admin.inactive': { 'en-US': 'Inactive', 'ar-SA': 'غير نشطة' },
  'admin.addTable': { 'en-US': 'Add Table', 'ar-SA': 'إضافة طاولة' },
  'admin.print': { 'en-US': 'Print', 'ar-SA': 'طباعة' },
  'admin.deactivate': { 'en-US': 'Deactivate', 'ar-SA': 'إلغاء تفعيل' },
  'admin.activate': { 'en-US': 'Activate', 'ar-SA': 'تفعيل' },
  'admin.location': { 'en-US': 'Location', 'ar-SA': 'الموقع' },
  'admin.capacity': { 'en-US': 'Capacity', 'ar-SA': 'السعة' },
  'admin.tableNumber': { 'en-US': 'Table Number', 'ar-SA': 'رقم الطاولة' },
  'admin.tableName': { 'en-US': 'Table Name', 'ar-SA': 'اسم الطاولة' },
  'admin.pending': { 'en-US': 'Pending', 'ar-SA': 'معلق' },
  'admin.preparing': { 'en-US': 'Preparing', 'ar-SA': 'قيد التحضير' },
  'admin.ready': { 'ar-SA': 'جاهز', 'en-US': 'Ready' },
  'admin.startPrep': { 'en-US': 'Start Prep', 'ar-SA': 'بدء التحضير' },
  'admin.markReady': { 'en-US': 'Mark Ready', 'ar-SA': 'علامة جاهز' },
  'admin.delivered': { 'en-US': 'Delivered', 'ar-SA': 'تم التسليم' },
  'admin.noOrders': { 'en-US': 'No orders', 'ar-SA': 'لا توجد طلبات' },
  'admin.searchCustomers': { 'en-US': 'Search by name or phone...', 'ar-SA': 'ابحث بالاسم أو الهاتف...' },
  'admin.totalCustomers': { 'en-US': 'Total Customers', 'ar-SA': 'إجمالي العملاء' },
  'admin.totalVisits': { 'en-US': 'Total Visits', 'ar-SA': 'إجمالي الزيارات' },
  'admin.avgOrder': { 'en-US': 'Avg Order', 'ar-SA': 'متوسط الفاتورة' },
  'admin.topCustomers': { 'en-US': 'Top Customers', 'ar-SA': 'أفضل العملاء' },
  'admin.quickStats': { 'en-US': 'Quick Stats', 'ar-SA': 'إحصائيات سريعة' },
  'admin.guestAlerts': { 'en-US': 'Guest Alerts', 'ar-SA': 'إشعارات الضيوف' },
  'admin.clearAll': { 'en-US': 'Clear All', 'ar-SA': 'مسح الكل' },
  'admin.visits': { 'en-US': 'Visits', 'ar-SA': 'الزيارات' },
  'admin.spend': { 'en-US': 'Spend', 'ar-SA': 'الإنفاق' },
  'admin.lastVisit': { 'en-US': 'Last Visit', 'ar-SA': 'آخر زيارة' },
  'admin.welcomeBack': { 'en-US': 'Welcome Back', 'ar-SA': 'مرحباً بعودتك' },
  'admin.newGuest': { 'en-US': 'New Guest', 'ar-SA': 'ضيف جديد' },
  'admin.registerEarn': { 'en-US': 'Register to start earning loyalty points', 'ar-SA': 'سجّل بياناتك للحصول على نقاط الولاء' },
  'admin.phoneNumber': { 'en-US': 'Phone Number', 'ar-SA': 'رقم الجوال' },
  'admin.yourName': { 'en-US': 'Your Name', 'ar-SA': 'اسمك' },
  'admin.registrationBonus': { 'en-US': 'Registration Bonus', 'ar-SA': 'مكافأة التسجيل' },
  'admin.welcomePoints': { 'en-US': 'Get 100 welcome points on your first visit', 'ar-SA': 'احصل على 100 نقطة ترحيبية عند أول زيارة' },
  'admin.completeRegistration': { 'en-US': 'Complete Registration', 'ar-SA': 'إكمال التسجيل' },
  'admin.continue': { 'en-US': 'Continue', 'ar-SA': 'متابعة' },
  'admin.searching': { 'en-US': 'Searching...', 'ar-SA': 'جاري البحث...' },
  'admin.checkIn': { 'en-US': 'Check In', 'ar-SA': 'تسجيل الوصول' },
  'admin.availablePoints': { 'en-US': 'Available Points', 'ar-SA': 'نقاط متاحة' },
  'admin.totalSpend': { 'en-US': 'Total Spend', 'ar-SA': 'إجمالي الإنفاق' },
  'admin.pointsTo': { 'en-US': 'points to', 'ar-SA': 'نقطة لـ' },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('ar-SA');
  const isRTL = locale === 'ar-SA';

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    document.documentElement.dir = newLocale === 'ar-SA' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLocale === 'ar-SA' ? 'ar' : 'en';
  }, []);

  const toggleLocale = useCallback(() => {
    setLocale(locale === 'en-US' ? 'ar-SA' : 'en-US');
  }, [locale, setLocale]);

  const t = useCallback((key: string): string => {
    return translations[key]?.[locale] || key;
  }, [locale]);

  return (
    <LanguageContext.Provider value={{ locale, isRTL, setLocale, toggleLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

export type { Locale };