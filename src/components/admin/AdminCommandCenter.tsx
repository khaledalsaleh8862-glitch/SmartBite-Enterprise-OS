'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WelcomeBackAlert, useWelcomeNotifications } from '@/components/admin/WelcomeBackAlert';
import QRManagementPanel from '@/components/admin/QRManagementPanel';
import {
  LayoutDashboard,
  Users,
  QrCode,
  BarChart3,
  Clock,
  ChefHat,
  Check,
  X,
  Bell,
  TrendingUp,
  DollarSign,
  Phone,
  MapPin,
  Search,
  RefreshCw,
  Crown,
  Star,
} from 'lucide-react';

interface LiveOrder {
  id: string;
  orderNumber: string;
  tableNumber: string;
  items: string[];
  total: number;
  status: 'pending' | 'preparing' | 'ready';
  time: string;
  customerName?: string;
  customerTier?: string;
}

interface CustomerRecord {
  id: string;
  phone: string;
  nameEn: string;
  nameAr: string;
  visits: number;
  totalSpend: number;
  lastVisit: string;
  tier: string;
}

const MOCK_ORDERS: LiveOrder[] = [
  { id: '1', orderNumber: 'SB-260331-0001', tableNumber: 'T3', items: ['Arabic Coffee', 'Zaatar Manakish', 'Labneh Sandwich'], total: 45.50, status: 'preparing', time: '3 min', customerName: 'Ahmed A.', customerTier: 'Gold' },
  { id: '2', orderNumber: 'SB-260331-0002', tableNumber: 'T1', items: ['Fresh Lime', 'Cheese Fatayer'], total: 22.00, status: 'pending', time: '1 min', customerName: 'Fatima H.', customerTier: 'VIP' },
  { id: '3', orderNumber: 'SB-260331-0003', tableNumber: 'VIP1', items: ['Arabic Coffee x2', 'Mixed Grill'], total: 128.00, status: 'ready', time: '5 min', customerName: 'Mohammed K.', customerTier: 'VIP' },
  { id: '4', orderNumber: 'SB-260331-0004', tableNumber: 'T5', items: ['Manaqeesh Pizza'], total: 28.00, status: 'pending', time: '0 min' },
];

const MOCK_CUSTOMERS: CustomerRecord[] = [
  { id: '1', phone: '+966 50 123 4567', nameEn: 'Ahmed Al-Rashid', nameAr: 'أحمد الراشد', visits: 15, totalSpend: 1250.00, lastVisit: '2026-03-28', tier: 'Gold' },
  { id: '2', phone: '+966 55 123 4567', nameEn: 'Fatima Hassan', nameAr: 'فاطمة حسن', visits: 52, totalSpend: 4800.00, lastVisit: '2026-03-30', tier: 'VIP' },
  { id: '3', phone: '+966 56 123 4567', nameEn: 'Mohammed Khalil', nameAr: 'محمد خليل', visits: 8, totalSpend: 420.00, lastVisit: '2026-03-25', tier: 'Silver' },
  { id: '4', phone: '+966 57 123 4567', nameEn: 'Sara Wilson', nameAr: 'سارة ويلسون', visits: 3, totalSpend: 95.00, lastVisit: '2026-03-20', tier: 'Regular' },
];

const TIER_COLORS: Record<string, string> = {
  Regular: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
  Silver: 'bg-gray-400/20 text-gray-300 border-gray-400/30',
  Gold: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  VIP: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
};

export default function AdminCommandCenter() {
  const { t, isRTL, locale } = useLanguage();
  const [orders, setOrders] = useState<LiveOrder[]>(MOCK_ORDERS);
  const [customers] = useState<CustomerRecord[]>(MOCK_CUSTOMERS);
  const [searchTerm, setSearchTerm] = useState('');
  const [isConnected, setIsConnected] = useState(true);
  const { notifications, addNotification, markAsRead, clearAll } = useWelcomeNotifications();

  useEffect(() => {
    const interval = setInterval(() => {
      setOrders(prev => prev.map(order => ({
        ...order,
        time: order.status === 'pending' ? `${parseInt(order.time) + 1} min` : order.time,
      })));
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleOrderStatusChange = useCallback((orderId: string, newStatus: LiveOrder['status']) => {
    setOrders(prev => prev.map(order =>
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
  }, []);

  const filteredCustomers = customers.filter(c =>
    c.nameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.nameAr.includes(searchTerm) ||
    c.phone.includes(searchTerm)
  );

  const pendingOrders = orders.filter(o => o.status === 'pending');
  const preparingOrders = orders.filter(o => o.status === 'preparing');
  const readyOrders = orders.filter(o => o.status === 'ready');

  const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpend, 0);
  const totalVisits = customers.reduce((sum, c) => sum + c.visits, 0);

  return (
    <div className="min-h-screen bg-slate-950" dir={isRTL ? 'rtl' : 'ltr'}>
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40">
        <div className="px-4 py-3">
          <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center">
                <LayoutDashboard className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-white font-bold text-xl">{t('admin.commandCenter')}</h1>
                <p className="text-slate-400 text-sm">{locale === 'ar-SA' ? 'مركز التحكم الإداري' : 'Admin Command Center'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${isConnected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400' : 'bg-red-400'} animate-pulse`} />
                {isConnected ? (locale === 'ar-SA' ? 'متصل' : 'Live') : (locale === 'ar-SA' ? 'غير متصل' : 'Offline')}
              </div>
              <WelcomeBackAlert
                notifications={notifications}
                onMarkAsRead={markAsRead}
                onClearAll={clearAll}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title={locale === 'ar-SA' ? 'طلبات معلقة' : 'Pending Orders'}
            value={pendingOrders.length}
            icon={Clock}
            color="amber"
            trend={pendingOrders.length > 0 ? '+' : ''}
            isRTL={isRTL}
            locale={locale}
          />
          <MetricCard
            title={locale === 'ar-SA' ? 'قيد التحضير' : 'Preparing'}
            value={preparingOrders.length}
            icon={ChefHat}
            color="blue"
            trend=""
            isRTL={isRTL}
            locale={locale}
          />
          <MetricCard
            title={locale === 'ar-SA' ? 'جاهزة للاستلام' : 'Ready'}
            value={readyOrders.length}
            icon={Check}
            color="emerald"
            trend=""
            isRTL={isRTL}
            locale={locale}
          />
          <MetricCard
            title={locale === 'ar-SA' ? 'إجمالي الإيرادات' : 'Total Revenue'}
            value={`${totalRevenue.toLocaleString()} SAR`}
            icon={DollarSign}
            color="amber"
            trend=""
            isRTL={isRTL}
            locale={locale}
          />
        </div>

        <Tabs defaultValue="orders" className="space-y-4">
          <TabsList className="bg-slate-800 border border-slate-700">
            <TabsTrigger value="orders" className="data-[state=active]:bg-amber-500 data-[state=active]:text-white">
              <ChefHat className="w-4 h-4 mr-2" />
              {locale === 'ar-SA' ? 'الطلبات الحية' : 'Live Orders'}
            </TabsTrigger>
            <TabsTrigger value="customers" className="data-[state=active]:bg-amber-500 data-[state=active]:text-white">
              <Users className="w-4 h-4 mr-2" />
              {locale === 'ar-SA' ? 'العملاء' : 'Customers'}
            </TabsTrigger>
            <TabsTrigger value="qr" className="data-[state=active]:bg-amber-500 data-[state=active]:text-white">
              <QrCode className="w-4 h-4 mr-2" />
              {locale === 'ar-SA' ? 'إدارة QR' : 'QR Codes'}
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-amber-500 data-[state=active]:text-white">
              <BarChart3 className="w-4 h-4 mr-2" />
              {locale === 'ar-SA' ? 'التحليلات' : 'Analytics'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <OrderColumn
                title={locale === 'ar-SA' ? 'معلق' : 'Pending'}
                orders={pendingOrders}
                color="amber"
                onStatusChange={handleOrderStatusChange}
                isRTL={isRTL}
                locale={locale}
              />
              <OrderColumn
                title={locale === 'ar-SA' ? 'قيد التحضير' : 'Preparing'}
                orders={preparingOrders}
                color="blue"
                onStatusChange={handleOrderStatusChange}
                isRTL={isRTL}
                locale={locale}
              />
              <OrderColumn
                title={locale === 'ar-SA' ? 'جاهز' : 'Ready'}
                orders={readyOrders}
                color="emerald"
                onStatusChange={handleOrderStatusChange}
                isRTL={isRTL}
                locale={locale}
              />
            </div>
          </TabsContent>

          <TabsContent value="customers" className="space-y-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={locale === 'ar-SA' ? 'ابحث بالاسم أو الهاتف...' : 'Search by name or phone...'}
                  className={`pl-10 bg-slate-800 border-slate-700 text-white ${
                    isRTL ? 'text-right pr-10 pl-3' : 'text-left'
                  }`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCustomers.map((customer) => (
                <CustomerCard
                  key={customer.id}
                  customer={customer}
                  isRTL={isRTL}
                  locale={locale}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="qr">
            <QRManagementPanel />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-slate-900 border-amber-500/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-amber-400" />
                    {locale === 'ar-SA' ? 'أفضل العملاء' : 'Top Customers'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {customers.slice(0, 5).map((customer, index) => (
                      <div key={customer.id} className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                            index === 0 ? 'bg-amber-500 text-white' :
                            index === 1 ? 'bg-slate-400 text-white' :
                            index === 2 ? 'bg-amber-700 text-white' :
                            'bg-slate-700 text-slate-300'
                          }`}>
                            #{index + 1}
                          </span>
                          <div className={isRTL ? 'text-right' : 'text-left'}>
                            <p className="text-white font-medium">{locale === 'ar-SA' ? customer.nameAr : customer.nameEn}</p>
                            <p className="text-slate-400 text-sm">{customer.visits} {locale === 'ar-SA' ? 'زيارة' : 'visits'}</p>
                          </div>
                        </div>
                        <div className="text-left">
                          <p className="text-emerald-400 font-bold">{customer.totalSpend.toLocaleString()} SAR</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900 border-amber-500/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-amber-400" />
                    {locale === 'ar-SA' ? 'إحصائيات سريعة' : 'Quick Stats'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-slate-800/50 text-center">
                      <p className="text-3xl font-bold text-amber-400">{customers.length}</p>
                      <p className="text-slate-400 text-sm">{locale === 'ar-SA' ? 'إجمالي العملاء' : 'Total Customers'}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-slate-800/50 text-center">
                      <p className="text-3xl font-bold text-emerald-400">{totalVisits}</p>
                      <p className="text-slate-400 text-sm">{locale === 'ar-SA' ? 'إجمالي الزيارات' : 'Total Visits'}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-slate-800/50 text-center">
                      <p className="text-3xl font-bold text-blue-400">{totalRevenue.toLocaleString()}</p>
                      <p className="text-slate-400 text-sm">SAR {locale === 'ar-SA' ? 'الإجمالي' : 'Total'}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-slate-800/50 text-center">
                      <p className="text-3xl font-bold text-purple-400">
                        {(totalRevenue / (totalVisits || 1)).toFixed(0)}
                      </p>
                      <p className="text-slate-400 text-sm">SAR {locale === 'ar-SA' ? 'متوسط الفاتورة' : 'Avg Order'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function MetricCard({
  title,
  value,
  icon: Icon,
  color,
  trend,
  isRTL,
  locale,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  trend: string;
  isRTL: boolean;
  locale: string;
}) {
  const colorClasses: Record<string, string> = {
    amber: 'bg-amber-500/10 text-amber-400',
    blue: 'bg-blue-500/10 text-blue-400',
    emerald: 'bg-emerald-500/10 text-emerald-400',
    purple: 'bg-purple-500/10 text-purple-400',
  };

  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardContent className="p-4">
        <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className={isRTL ? 'text-right' : 'text-left'}>
            <p className="text-slate-400 text-sm">{title}</p>
            <p className="text-2xl font-bold text-white">{trend}{value}</p>
          </div>
          <div className={`w-12 h-12 rounded-full ${colorClasses[color]} flex items-center justify-center`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function OrderColumn({
  title,
  orders,
  color,
  onStatusChange,
  isRTL,
  locale,
}: {
  title: string;
  orders: LiveOrder[];
  color: string;
  onStatusChange: (id: string, status: LiveOrder['status']) => void;
  isRTL: boolean;
  locale: string;
}) {
  const colorClasses: Record<string, { bg: string; border: string; badge: string }> = {
    amber: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', badge: 'bg-amber-500/20 text-amber-400' },
    blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', badge: 'bg-blue-500/20 text-blue-400' },
    emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', badge: 'bg-emerald-500/20 text-emerald-400' },
  };

  return (
    <div className="space-y-3">
      <div className={`flex items-center justify-between px-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <h3 className="text-white font-semibold">{title}</h3>
        <Badge className={colorClasses[color].badge}>{orders.length}</Badge>
      </div>
      <div className="space-y-3 min-h-32">
        <AnimatePresence>
          {orders.map((order) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <Card className={`${colorClasses[color].bg} border ${colorClasses[color].border}`}>
                <CardHeader className="pb-2">
                  <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className={isRTL ? 'text-right' : 'text-left'}>
                      <p className="text-white font-bold">{order.orderNumber}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="border-slate-600 text-slate-300">
                          <MapPin className="w-3 h-3 mr-1" />
                          {order.tableNumber}
                        </Badge>
                        {order.customerTier && (
                          <Badge className={TIER_COLORS[order.customerTier]}>
                            {order.customerTier === 'VIP' && <Crown className="w-3 h-3 mr-1" />}
                            {order.customerTier}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-amber-400 font-bold">{order.total} SAR</p>
                      <p className="text-slate-400 text-sm flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {order.time}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-3">
                    {order.items.slice(0, 3).map((item, idx) => (
                      <p key={idx} className="text-slate-300 text-sm">{item}</p>
                    ))}
                    {order.items.length > 3 && (
                      <p className="text-slate-400 text-sm">+{order.items.length - 3} more</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {order.status === 'pending' && (
                      <Button
                        size="sm"
                        onClick={() => onStatusChange(order.id, 'preparing')}
                        className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
                      >
                        {locale === 'ar-SA' ? 'بدء التحضير' : 'Start Prep'}
                      </Button>
                    )}
                    {order.status === 'preparing' && (
                      <Button
                        size="sm"
                        onClick={() => onStatusChange(order.id, 'ready')}
                        className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white"
                      >
                        {locale === 'ar-SA' ? 'علامة جاهز' : 'Mark Ready'}
                      </Button>
                    )}
                    {order.status === 'ready' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 border-emerald-500/50 text-emerald-400"
                      >
                        {locale === 'ar-SA' ? 'تم التسليم' : 'Delivered'}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
        {orders.length === 0 && (
          <div className="text-center py-8 text-slate-500">
            <ChefHat className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>{locale === 'ar-SA' ? 'لا توجد طلبات' : 'No orders'}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function CustomerCard({
  customer,
  isRTL,
  locale,
}: {
  customer: CustomerRecord;
  isRTL: boolean;
  locale: string;
}) {
  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardContent className="p-4">
        <div className={`flex items-start justify-between mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center">
              <span className="text-lg font-bold text-white">
                {(locale === 'ar-SA' ? customer.nameAr : customer.nameEn).charAt(0)}
              </span>
            </div>
            <div className={isRTL ? 'text-right' : 'text-left'}>
              <p className="text-white font-medium">{locale === 'ar-SA' ? customer.nameAr : customer.nameEn}</p>
              <p className="text-slate-400 text-sm flex items-center gap-1">
                <Phone className="w-3 h-3" />
                {customer.phone}
              </p>
            </div>
          </div>
          <Badge className={TIER_COLORS[customer.tier]}>
            {customer.tier === 'VIP' && <Crown className="w-3 h-3 mr-1" />}
            {customer.tier === 'Gold' && <Star className="w-3 h-3 mr-1" />}
            {customer.tier}
          </Badge>
        </div>
        <div className={`grid grid-cols-3 gap-2 pt-3 border-t border-slate-700 ${isRTL ? 'text-right' : 'text-left'}`}>
          <div>
            <p className="text-slate-400 text-xs">{locale === 'ar-SA' ? 'الزيارات' : 'Visits'}</p>
            <p className="text-white font-bold">{customer.visits}</p>
          </div>
          <div>
            <p className="text-slate-400 text-xs">{locale === 'ar-SA' ? 'الإنفاق' : 'Spend'}</p>
            <p className="text-emerald-400 font-bold">{customer.totalSpend.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-slate-400 text-xs">{locale === 'ar-SA' ? 'آخر زيارة' : 'Last Visit'}</p>
            <p className="text-slate-300 text-sm">{customer.lastVisit}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
