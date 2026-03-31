'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Clock,
  ChefHat,
  AlertCircle,
  Check,
  Flame,
  Users,
  RefreshCw,
  Volume2,
  VolumeX,
  Coffee,
  Utensils,
  Crown,
} from 'lucide-react';

interface OrderItem {
  id: string;
  name_en: string;
  name_ar: string;
  quantity: number;
  modifiers?: string[];
  notes?: string;
  status: 'pending' | 'preparing' | 'ready';
}

interface KDSOrder {
  id: string;
  orderNumber: string;
  items: OrderItem[];
  status: 'pending' | 'preparing' | 'ready' | 'completed';
  priority: 'normal' | 'rush';
  customerTier?: 'Regular' | 'Silver' | 'Gold' | 'VIP';
  estimatedPrepTime: number;
  actualWaitTime: number;
  createdAt: Date;
  tableNumber?: string;
  cashierName: string;
}

const TIER_COLORS = {
  Regular: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
  Silver: 'bg-gray-400/20 text-gray-300 border-gray-400/30',
  Gold: 'bg-amber-400/20 text-amber-300 border-amber-400/30',
  VIP: 'bg-purple-400/20 text-purple-300 border-purple-400/30',
};

const TIER_ICONS = {
  Regular: <Users className="w-3 h-3" />,
  Silver: <Users className="w-3 h-3" />,
  Gold: <Crown className="w-3 h-3" />,
  VIP: <Flame className="w-3 h-3" />,
};

const generateMockOrders = (): KDSOrder[] => {
  const now = Date.now();
  return [
    {
      id: '1',
      orderNumber: 'SB-260331-0001',
      items: [
        { id: '1', name_en: 'Arabic Coffee', name_ar: 'قهوة عربية', quantity: 2, status: 'pending' },
        { id: '5', name_en: 'Zaatar Manakish', name_ar: 'مناقيش زعتر', quantity: 1, status: 'pending', notes: 'Extra zaatar' },
      ],
      status: 'pending',
      priority: 'rush',
      customerTier: 'VIP',
      estimatedPrepTime: 8,
      actualWaitTime: 3,
      createdAt: new Date(now - 3 * 60 * 1000),
      tableNumber: 'T5',
      cashierName: 'Sarah',
    },
    {
      id: '2',
      orderNumber: 'SB-260331-0002',
      items: [
        { id: '6', name_en: 'Labneh Sandwich', name_ar: 'ساندويتش لبنة', quantity: 2, status: 'preparing' },
        { id: '3', name_en: 'Fresh Lime', name_ar: 'ليموناضة', quantity: 2, status: 'preparing' },
      ],
      status: 'preparing',
      priority: 'normal',
      customerTier: 'Gold',
      estimatedPrepTime: 12,
      actualWaitTime: 8,
      createdAt: new Date(now - 8 * 60 * 1000),
      tableNumber: 'T12',
      cashierName: 'Ahmed',
    },
    {
      id: '3',
      orderNumber: 'SB-260331-0003',
      items: [
        { id: '7', name_en: 'Cheese Fatayer', name_ar: 'فطاير جبن', quantity: 3, status: 'pending' },
        { id: '1', name_en: 'Arabic Coffee', name_ar: 'قهوة عربية', quantity: 3, status: 'pending' },
        { id: '8', name_en: 'Knafeh', name_ar: 'كنافة', quantity: 1, status: 'pending' },
      ],
      status: 'pending',
      priority: 'normal',
      customerTier: 'Regular',
      estimatedPrepTime: 15,
      actualWaitTime: 5,
      createdAt: new Date(now - 5 * 60 * 1000),
      cashierName: 'Sarah',
    },
    {
      id: '4',
      orderNumber: 'SB-260331-0004',
      items: [
        { id: '4', name_en: 'Mango Smoothie', name_ar: 'سموذي مانجو', quantity: 1, status: 'ready' },
      ],
      status: 'ready',
      priority: 'normal',
      customerTier: 'Silver',
      estimatedPrepTime: 5,
      actualWaitTime: 12,
      createdAt: new Date(now - 12 * 60 * 1000),
      tableNumber: 'T3',
      cashierName: 'Ahmed',
    },
    {
      id: '5',
      orderNumber: 'SB-260331-0005',
      items: [
        { id: '2', name_en: 'Cappuccino', name_ar: 'كابتشينو', quantity: 2, status: 'pending' },
        { id: '5', name_en: 'Zaatar Manakish', name_ar: 'مناقيش زعتر', quantity: 2, status: 'pending' },
        { id: '6', name_en: 'Labneh Sandwich', name_ar: 'ساندويتش لبنة', quantity: 1, status: 'pending' },
      ],
      status: 'pending',
      priority: 'normal',
      customerTier: 'Gold',
      estimatedPrepTime: 14,
      actualWaitTime: 2,
      createdAt: new Date(now - 2 * 60 * 1000),
      tableNumber: 'T8',
      cashierName: 'Sarah',
    },
  ];
};

const OrderCard = ({
  order,
  onUpdateItemStatus,
  onCompleteOrder,
}: {
  order: KDSOrder;
  onUpdateItemStatus: (orderId: string, itemId: string, status: 'pending' | 'preparing' | 'ready') => void;
  onCompleteOrder: (orderId: string) => void;
}) => {
  const { t, isRTL } = useLanguage();
  const isDelayed = order.actualWaitTime > 15;
  const isCriticalDelay = order.actualWaitTime > 20;

  const allItemsReady = order.items.every((item) => item.status === 'ready');

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{
        opacity: 1,
        scale: 1,
        boxShadow: isCriticalDelay
          ? '0 0 20px rgba(239, 68, 68, 0.5)'
          : isDelayed
          ? '0 0 15px rgba(249, 115, 22, 0.4)'
          : '0 0 0px rgba(0, 0, 0, 0)',
      }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={isRTL ? 'text-right' : 'text-left'}
    >
      <Card
        className={`
          bg-slate-900 border-2 overflow-hidden
          ${isCriticalDelay ? 'border-red-500' : isDelayed ? 'border-amber-500' : 'border-slate-700'}
          ${isCriticalDelay ? 'animate-pulse' : ''}
        `}
      >
        <CardHeader className="pb-2">
          <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <span className="text-white font-bold text-lg">{order.orderNumber}</span>
              {order.priority === 'rush' && (
                <Badge className="bg-red-500 text-white animate-pulse">
                  <Flame className="w-3 h-3 mx-1" />
                  {t('kds.rush')}
                </Badge>
              )}
              {order.customerTier && order.customerTier !== 'Regular' && (
                <Badge className={TIER_COLORS[order.customerTier]}>
                  {TIER_ICONS[order.customerTier]}
                  <span className="mx-1">{order.customerTier}</span>
                </Badge>
              )}
            </div>
            <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              {order.tableNumber && (
                <span className="text-slate-400 text-sm">
                  {order.tableNumber}
                </span>
              )}
              <div className={`flex items-center gap-1 ${order.actualWaitTime > 10 ? 'text-amber-400' : 'text-slate-400'}`}>
                <Clock className="w-4 h-4" />
                <span className={`font-mono ${isDelayed ? 'text-amber-400 font-bold' : ''}`}>
                  {order.actualWaitTime}m
                </span>
              </div>
            </div>
          </div>
          <div className={`text-slate-500 text-xs mt-1 ${isRTL ? 'text-right' : ''}`}>
            {order.cashierName} • {t('kds.table')} {order.tableNumber || '-'}
          </div>
        </CardHeader>

        <CardContent className="space-y-2">
          {order.items.map((item) => (
            <div
              key={item.id}
              className={`
                p-3 rounded-lg border transition-all
                ${item.status === 'ready'
                  ? 'bg-emerald-500/10 border-emerald-500/30'
                  : item.status === 'preparing'
                  ? 'bg-blue-500/10 border-blue-500/30'
                  : 'bg-slate-800/50 border-slate-700'}
              `}
            >
              <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <button
                    onClick={() => {
                      const nextStatus =
                        item.status === 'pending' ? 'preparing' : item.status === 'preparing' ? 'ready' : 'pending';
                      onUpdateItemStatus(order.id, item.id, nextStatus);
                    }}
                    className={`
                      w-8 h-8 rounded-full flex items-center justify-center
                      ${item.status === 'ready'
                        ? 'bg-emerald-500 text-white'
                        : item.status === 'preparing'
                        ? 'bg-blue-500 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}
                      transition-colors
                    `}
                  >
                    {item.status === 'ready' ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <span className="text-xs font-bold">{item.quantity}</span>
                    )}
                  </button>
                  <div className={isRTL ? 'text-right' : 'text-left'}>
                    <p className="text-white font-medium">
                      {item.quantity}x {isRTL ? item.name_ar : item.name_en}
                    </p>
                    {item.notes && (
                      <p className="text-amber-400 text-xs italic mt-1">
                        ⚡ {item.notes}
                      </p>
                    )}
                  </div>
                </div>
                <Badge
                  className={`
                    ${item.status === 'ready'
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      : item.status === 'preparing'
                      ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                      : 'bg-slate-600/50 text-slate-300 border-slate-500/30'}
                  `}
                >
                  {item.status === 'ready' ? t('kds.ready')
                    : item.status === 'preparing' ? t('kds.preparing')
                    : t('kds.pending')}
                </Badge>
              </div>
            </div>
          ))}

          {order.items.some((item) => item.notes) && (
            <div className="flex items-center gap-2 p-2 rounded bg-amber-500/10 border border-amber-500/20">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              <span className="text-amber-400 text-xs">
                {t('kds.hasInstructions')}
              </span>
            </div>
          )}

          {allItemsReady && (
            <Button
              onClick={() => onCompleteOrder(order.id)}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3"
            >
              <Check className="w-5 h-5 mx-2" />
              {t('kds.completeOrder')}
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

const StatsBar = ({ orders }: { orders: KDSOrder[] }) => {
  const { t, isRTL } = useLanguage();
  const pending = orders.filter((o) => o.status === 'pending').length;
  const preparing = orders.filter((o) => o.status === 'preparing').length;
  const ready = orders.filter((o) => o.status === 'ready').length;
  const delayed = orders.filter((o) => o.actualWaitTime > 15).length;

  return (
    <div className={`flex items-center justify-between mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
      <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amber-500" />
          <span className="text-slate-400 text-sm">
            {pending} {t('kds.pending')}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500" />
          <span className="text-slate-400 text-sm">
            {preparing} {t('kds.preparing')}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500" />
          <span className="text-slate-400 text-sm">
            {ready} {t('kds.ready')}
          </span>
        </div>
        {delayed > 0 && (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
            <span className="text-red-400 text-sm font-medium">
              {delayed} {t('kds.delayed')}
            </span>
          </div>
        )}
      </div>
      <div className="text-slate-500 text-sm">
        {orders.length} {t('kds.totalOrders')}
      </div>
    </div>
  );
};

export default function KitchenDisplaySystem() {
  const { t, isRTL } = useLanguage();
  const [orders, setOrders] = useState<KDSOrder[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'preparing' | 'ready'>('all');

  useEffect(() => {
    setOrders(generateMockOrders());

    const interval = setInterval(() => {
      setOrders((prev) =>
        prev.map((order) => ({
          ...order,
          actualWaitTime: order.actualWaitTime + 1,
        }))
      );
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const handleUpdateItemStatus = useCallback(
    (orderId: string, itemId: string, status: 'pending' | 'preparing' | 'ready') => {
      setOrders((prev) =>
        prev.map((order) => {
          if (order.id !== orderId) return order;
          const updatedItems = order.items.map((item) =>
            item.id === itemId ? { ...item, status } : item
          );
          const allReady = updatedItems.every((i) => i.id === itemId || i.status === 'ready');
          const newStatus: KDSOrder['status'] = status === 'preparing' ? 'preparing' : status === 'ready' && allReady ? 'ready' : order.status;
          return { ...order, items: updatedItems, status: newStatus };
        })
      );
    },
    []
  );

  const handleCompleteOrder = useCallback((orderId: string) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, status: 'completed' } : order
      )
    );
    setTimeout(() => {
      setOrders((prev) => prev.filter((order) => order.id !== orderId));
    }, 500);
  }, []);

  const filteredOrders = orders
    .filter((order) => order.status !== 'completed')
    .filter((order) => {
      if (filter === 'all') return true;
      return order.status === filter;
    })
    .sort((a, b) => {
      if (a.priority === 'rush' && b.priority !== 'rush') return -1;
      if (b.priority === 'rush' && a.priority !== 'rush') return 1;
      if (a.customerTier === 'VIP' && b.customerTier !== 'VIP') return -1;
      if (b.customerTier === 'VIP' && a.customerTier !== 'VIP') return 1;
      return a.actualWaitTime - b.actualWaitTime;
    });

  const _pendingOrders = orders.filter((o) => o.status === 'pending' || o.status === 'preparing');
  const readyOrders = orders.filter((o) => o.status === 'ready');

  return (
    <div className="min-h-screen bg-slate-950">
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40">
        <div className="px-4 py-3">
          <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center">
                <ChefHat className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-white font-bold text-xl">{t('kds.kitchenDisplay')}</h1>
                <p className="text-slate-400 text-sm">{t('kds.smartbiteKDS')}</p>
              </div>
            </div>

            <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className="flex items-center gap-2 bg-slate-800 rounded-lg p-1">
                {(['all', 'pending', 'preparing', 'ready'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`
                      px-3 py-1.5 rounded text-sm font-medium transition-colors
                      ${filter === f
                        ? 'bg-amber-500 text-white'
                        : 'text-slate-400 hover:text-white'}
                    `}
                  >
                    {f === 'all' ? t('pos.all')
                      : f === 'pending' ? t('kds.pending')
                      : f === 'preparing' ? t('kds.preparing')
                      : t('kds.ready')}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`
                  p-2 rounded-lg transition-colors
                  ${soundEnabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'}
                `}
              >
                {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </button>

              <Button
                onClick={() => setOrders(generateMockOrders())}
                variant="outline"
                className="border-slate-700 text-slate-400 hover:text-white"
              >
                <RefreshCw className="w-4 h-4 mx-2" />
                {t('kds.refresh')}
              </Button>
            </div>
          </div>

          <StatsBar orders={orders.filter((o) => o.status !== 'completed')} />
        </div>
      </header>

      <main className="p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AnimatePresence>
                {filteredOrders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onUpdateItemStatus={handleUpdateItemStatus}
                    onCompleteOrder={handleCompleteOrder}
                  />
                ))}
              </AnimatePresence>
            </div>

            {filteredOrders.length === 0 && (
              <div className="text-center py-16">
                <ChefHat className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                <p className="text-slate-500 text-lg">
                  {t('kds.noOrders')}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Coffee className="w-4 h-4 text-emerald-400" />
                  {t('kds.readyPickup')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {readyOrders.length === 0 ? (
                  <p className="text-slate-500 text-sm text-center py-4">
                    {t('kds.noReadyOrders')}
                  </p>
                ) : (
                  readyOrders.map((order) => (
                    <div
                      key={order.id}
                      className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30"
                    >
                      <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <div className={isRTL ? 'text-right' : 'text-left'}>
                          <p className="text-white font-bold">{order.orderNumber}</p>
                          <p className="text-slate-400 text-sm">
                            {order.items.length} {t('kds.items')}
                          </p>
                        </div>
                        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                          <Check className="w-3 h-3 mx-1" />
                          {t('kds.ready')}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="bg-slate-900 border-slate-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Utensils className="w-4 h-4 text-amber-400" />
                  {t('kds.speedSummary')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <span className="text-slate-400 text-sm">{t('kds.avgExpected')}</span>
                    <span className="text-white font-medium">10 min</span>
                  </div>
                  <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <span className="text-slate-400 text-sm">{t('kds.currentActual')}</span>
                    <span className="text-amber-400 font-medium">
                      {orders.length > 0
                        ? Math.round(
                            orders.reduce((sum, o) => sum + o.actualWaitTime, 0) / orders.length
                          )
                        : 0}{' '}
                      min
                    </span>
                  </div>
                  <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <span className="text-slate-400 text-sm">{t('kds.fastestOrder')}</span>
                    <span className="text-emerald-400 font-medium">
                      {orders.length > 0 ? Math.min(...orders.map((o) => o.actualWaitTime)) : 0} min
                    </span>
                  </div>
                  <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <span className="text-slate-400 text-sm">{t('kds.slowestOrder')}</span>
                    <span className="text-red-400 font-medium">
                      {orders.length > 0 ? Math.max(...orders.map((o) => o.actualWaitTime)) : 0} min
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900 border-slate-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400" />
                  {t('kds.alerts')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {orders.filter((o) => o.actualWaitTime > 15).length > 0 ? (
                  orders
                    .filter((o) => o.actualWaitTime > 15)
                    .map((order) => (
                      <div
                        key={order.id}
                        className="p-2 rounded bg-red-500/10 border border-red-500/30 text-sm"
                      >
                        <span className="text-red-400 font-medium">{order.orderNumber}</span>
                        <span className="text-slate-400 mx-2">
                          {t('kds.delayed')} ({order.actualWaitTime} min)
                        </span>
                      </div>
                    ))
                ) : (
                  <p className="text-emerald-400 text-sm text-center py-2">
                    ✓ {t('kds.noAlerts')}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}