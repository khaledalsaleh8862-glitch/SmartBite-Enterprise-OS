'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  User,
  QrCode,
  Gift,
  Coffee,
  Star,
  ChevronRight,
  Sparkles,
  Crown,
  Zap,
} from 'lucide-react';

interface Customer {
  id: string;
  name_en: string;
  name_ar: string;
  phone_number: string;
  points_balance: number;
  lifetime_points: number;
  visit_count: number;
  behavioral_segment: 'Loyal' | 'At-risk' | 'New' | 'VIP' | 'Dormant';
  tier: {
    name: string;
    name_ar: string;
    cashback_percentage: number;
    next_tier?: {
      name: string;
      points_required: number;
    };
  };
  progress_to_next: number;
  recent_orders: number[];
  favorite_item?: {
    name_en: string;
    name_ar: string;
  };
}

const TIER_COLORS = {
  New: 'from-slate-500/20 to-slate-600/20',
  Loyal: 'from-blue-500/20 to-blue-600/20',
  'At-risk': 'from-amber-500/20 to-amber-600/20',
  VIP: 'from-amber-400/20 to-amber-700/20',
  Dormant: 'from-slate-600/20 to-slate-700/20',
};

const generateRewardAnimation = () => {
  return Array.from({ length: 12 }).map((_, i) => ({
    angle: i * 30,
    delay: i * 0.1,
  }));
};

const ProgressRing = ({
  progress,
  size = 120,
  strokeWidth = 8,
}: {
  progress: number;
  size?: number;
  strokeWidth?: number;
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <svg className="progress-ring" width={size} height={size}>
      <circle
        className="text-slate-700"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        fill="transparent"
        r={radius}
        cx={size / 2}
        cy={size / 2}
      />
      <circle
        className="text-amber-400 progress-ring__circle"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        fill="transparent"
        r={radius}
        cx={size / 2}
        cy={size / 2}
      />
    </svg>
  );
};

const LoyaltyCard = ({ customer }: { customer: Customer }) => {
  const { t, isRTL } = useLanguage();
  const rewards = generateRewardAnimation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card className={`bg-gradient-to-br ${TIER_COLORS[customer.behavioral_segment]} border-amber-500/30 overflow-hidden`}>
        <CardContent className="p-6">
          <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
                  <Crown className="w-8 h-8 text-white" />
                </div>
                {customer.behavioral_segment === 'VIP' && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-amber-400 flex items-center justify-center"
                  >
                    <Sparkles className="w-3 h-3 text-amber-900" />
                  </motion.div>
                )}
              </div>
              <div className={isRTL ? 'text-right' : 'text-left'}>
                <h3 className="text-xl font-bold text-white">{isRTL ? customer.name_ar : customer.name_en}</h3>
                <p className="text-slate-400 text-sm">{isRTL ? customer.tier.name_ar : customer.tier.name}</p>
              </div>
            </div>

            <div className={`flex flex-col items-center ${isRTL ? 'text-right' : 'text-left'}`}>
              <div className="relative">
                <ProgressRing progress={customer.progress_to_next} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white">{customer.progress_to_next}%</p>
                  </div>
                </div>
              </div>
              <p className="text-slate-400 text-xs mt-2">
                {t('customer.toNextTier')}
              </p>
            </div>
          </div>

          {customer.tier.next_tier && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className={`mt-4 p-3 rounded-lg bg-slate-800/50 ${isRTL ? 'text-right' : 'text-left'}`}
            >
              <p className="text-slate-400 text-sm">
                {t('customer.nextTier')}
                <span className="text-amber-400 font-semibold mx-1">
                  {customer.tier.next_tier.name}
                </span>
                <span className="text-slate-500 text-xs mx-2">
                  ({customer.tier.next_tier.points_required - customer.lifetime_points} {t('customer.pointsToGo')})
                </span>
              </p>
            </motion.div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-3">
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-4 text-center">
            <Gift className="w-6 h-6 text-amber-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{customer.points_balance}</p>
            <p className="text-slate-400 text-xs">{t('customer.points')}</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-4 text-center">
            <Coffee className="w-6 h-6 text-blue-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{customer.visit_count}</p>
            <p className="text-slate-400 text-xs">{t('customer.visits')}</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-4 text-center">
            <Star className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{customer.tier.cashback_percentage}%</p>
            <p className="text-slate-400 text-xs">{t('customer.cashbackRate')}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-slate-900 border-slate-800 overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            {t('customer.loyaltyRewards')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative h-32 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 rounded-full bg-slate-800 border-4 border-amber-500/30 flex items-center justify-center">
                <span className="text-3xl font-bold text-amber-400">
                  {customer.points_balance}
                </span>
              </div>
            </div>
            <AnimatePresence>
              {rewards.map((reward, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0.5],
                    x: [0, Math.cos((reward.angle * Math.PI) / 180) * 80],
                    y: [0, Math.sin((reward.angle * Math.PI) / 180) * 80],
                  }}
                  transition={{
                    duration: 1.5,
                    delay: reward.delay,
                    repeat: Infinity,
                    repeatDelay: 3,
                  }}
                  className="absolute"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>

      {customer.favorite_item && (
        <Card className="bg-gradient-to-r from-amber-900/20 to-slate-900 border-amber-500/30">
          <CardContent className="p-4">
            <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className={isRTL ? 'text-right' : 'text-left'}>
                <p className="text-slate-400 text-sm">{t('customer.yourFavorite')}</p>
                <p className="text-white font-semibold">{isRTL ? customer.favorite_item.name_ar : customer.favorite_item.name_en}</p>
              </div>
              <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                <Coffee className="w-4 h-4 mx-1" />
                {t('customer.favorite')}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
};

const QRCheckIn = ({ onScan }: { onScan: (code: string) => void }) => {
  const { t, isRTL } = useLanguage();
  const [isScanning, setIsScanning] = useState(false);

  const handleScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      onScan('CUST-QR-' + Math.random().toString(36).substr(2, 9).toUpperCase());
      setIsScanning(false);
    }, 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center p-8"
    >
      <motion.div
        animate={isScanning ? { scale: [1, 1.05, 1] } : {}}
        transition={{ repeat: Infinity, duration: 1 }}
        className="relative"
      >
        <div className="w-64 h-64 rounded-2xl bg-gradient-to-br from-amber-500/20 to-slate-800 border-2 border-dashed border-amber-500/50 flex items-center justify-center">
          <QrCode className={`w-32 h-32 text-amber-400 ${isScanning ? 'animate-pulse' : ''}`} />
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-500/10 to-transparent" />
        </div>
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute -bottom-4 left-1/2 transform -translate-x-1/2"
        >
          <div className="w-2 h-2 rounded-full bg-amber-400" />
        </motion.div>
      </motion.div>

      <h2 className="text-2xl font-bold text-white mt-8 mb-2">
        {t('customer.scanQR')}
      </h2>
      <p className="text-slate-400 text-center mb-6">
        {t('customer.scanDesc')}
      </p>

      <Button
        onClick={handleScan}
        disabled={isScanning}
        className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-8"
      >
        {isScanning ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1 }}
            className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
          />
        ) : (
          <>
            <QrCode className="w-5 h-5 mx-2" />
            {t('customer.scanNow')}
          </>
        )}
      </Button>

      <div className={`flex items-center gap-4 mt-8 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <div className="text-center">
          <p className="text-3xl font-bold text-amber-400">+10</p>
          <p className="text-slate-400 text-sm">{t('customer.pointsPerVisit')}</p>
        </div>
        <div className="w-px h-12 bg-slate-700" />
        <div className="text-center">
          <p className="text-3xl font-bold text-emerald-400">+5%</p>
          <p className="text-slate-400 text-sm">{t('customer.instantCashback')}</p>
        </div>
      </div>
    </motion.div>
  );
};

interface MenuItem {
  id: string;
  name_en: string;
  name_ar: string;
  price: number;
  category: string;
  emoji: string;
  popular?: boolean;
}

interface CartItem extends MenuItem {
  quantity: number;
}

const MOCK_MENU_ITEMS: MenuItem[] = [
  { id: '1', name_en: 'Arabic Coffee', name_ar: 'قهوة عربية', price: 8, category: 'Hot Beverages', emoji: '☕', popular: true },
  { id: '2', name_en: 'Cappuccino', name_ar: 'كابتشينو', price: 14, category: 'Hot Beverages', emoji: '🥛' },
  { id: '3', name_en: 'Fresh Lime', name_ar: 'ليموناضة', price: 10, category: 'Cold Beverages', emoji: '🍋', popular: true },
  { id: '4', name_en: 'Mango Smoothie', name_ar: 'سموذي مانجو', price: 16, category: 'Cold Beverages', emoji: '🥭' },
  { id: '5', name_en: 'Zaatar Manakish', name_ar: 'مناقيش زعتر', price: 12, category: 'Sandwiches', emoji: '🫓', popular: true },
  { id: '6', name_en: 'Labneh Sandwich', name_ar: 'ساندويتش لبنة', price: 15, category: 'Sandwiches', emoji: '🥪' },
  { id: '7', name_en: 'Cheese Fatayer', name_ar: 'فطاير جبن', price: 10, category: 'Snacks', emoji: '🥧' },
  { id: '8', name_en: 'Knafeh', name_ar: 'كنافة', price: 18, category: 'Desserts', emoji: '🍯', popular: true },
];

const MOCK_CUSTOMER: Customer = {
  id: '1',
  name_en: 'Ahmed Al-Rashid',
  name_ar: 'أحمد الراشد',
  phone_number: '+966501234567',
  points_balance: 1250,
  lifetime_points: 1250,
  visit_count: 23,
  behavioral_segment: 'Loyal',
  tier: {
    name: 'Gold',
    name_ar: 'ذهبي',
    cashback_percentage: 5,
    next_tier: {
      name: 'Platinum',
      points_required: 1500,
    },
  },
  progress_to_next: 83,
  recent_orders: [1, 2, 3],
  favorite_item: {
    name_en: 'Arabic Coffee',
    name_ar: 'قهوة عربية',
  },
};

export default function CustomerTerminal() {
  const { t, isRTL } = useLanguage();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeTab, setActiveTab] = useState<'menu' | 'loyalty'>('menu');

  const handleQRScan = useCallback(() => {
    setCustomer(MOCK_CUSTOMER);
  }, []);

  const handleAddToCart = useCallback((item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  }, []);

  const handleRemoveFromCart = useCallback((id: string) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const handleUpdateQuantity = useCallback((id: string, qty: number) => {
    if (qty <= 0) {
      handleRemoveFromCart(id);
      return;
    }
    setCart((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity: qty } : i))
    );
  }, [handleRemoveFromCart]);

  const handleCheckout = useCallback(() => {
    alert('Order placed successfully! (Demo)');
    setCart([]);
  }, []);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cashback = subtotal * 0.05;

  const categories = [...new Set(MOCK_MENU_ITEMS.map((item) => item.category))];

  return (
    <div className="min-h-screen bg-slate-950">
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center">
              <Coffee className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold">SmartBite</h1>
              <p className="text-slate-400 text-xs">Cafeteria</p>
            </div>
          </div>

          {customer && (
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-amber-400" />
              <span className="text-white text-sm">{isRTL ? customer.name_ar : customer.name_en}</span>
              <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs">
                {customer.points_balance} pts
              </Badge>
            </div>
          )}
        </div>
      </header>

      {cart.length > 0 && (
        <div className={`fixed right-0 top-0 h-full w-80 bg-slate-900 border-l border-slate-800 shadow-xl z-50 ${isRTL ? '' : 'left-0 right-auto'} flex flex-col`}>
          <div className="p-4 border-b border-slate-800">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Coffee className="w-5 h-5 text-amber-400" />
              {t('customer.yourOrder')}
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            <AnimatePresence>
              {cart.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="p-3 rounded-lg bg-slate-800/50 border border-slate-700"
                >
                  <div className={`flex items-start justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className={isRTL ? 'text-right' : 'text-left'}>
                      <p className="text-white font-medium">{isRTL ? item.name_ar : item.name_en}</p>
                      <p className="text-amber-400 text-sm">{item.price} SAR</p>
                    </div>
                    <button
                      onClick={() => handleRemoveFromCart(item.id)}
                      className="text-slate-400 hover:text-red-400 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                  <div className={`flex items-center justify-between mt-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 rounded-full bg-slate-700 text-white hover:bg-slate-600 transition-colors"
                      >
                        -
                      </button>
                      <span className="text-white font-medium w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 rounded-full bg-amber-500 text-white hover:bg-amber-600 transition-colors"
                      >
                        +
                      </button>
                    </div>
                    <p className="text-white font-semibold">
                      {(item.price * item.quantity).toFixed(2)} SAR
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="p-4 border-t border-slate-800 space-y-3">
            <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
              <span className="text-slate-400">{t('customer.subtotal')}</span>
              <span className="text-white font-semibold">{subtotal.toFixed(2)} SAR</span>
            </div>
            <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
              <span className="text-emerald-400 flex items-center gap-1">
                <Gift className="w-4 h-4" />
                {t('customer.cashback')}
              </span>
              <span className="text-emerald-400 font-semibold">+{cashback.toFixed(2)} SAR</span>
            </div>
            <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
              <span className="text-lg text-white font-bold">{t('customer.total')}</span>
              <span className="text-xl text-amber-400 font-bold">{subtotal.toFixed(2)} SAR</span>
            </div>
            <Button
              onClick={handleCheckout}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white py-6 text-lg"
            >
              {t('customer.checkout')}
              <ChevronRight className="w-5 h-5 mx-2" />
            </Button>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 py-6">
        {!customer ? (
          <QRCheckIn onScan={handleQRScan} />
        ) : (
          <div className="space-y-6">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('menu')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'menu'
                    ? 'bg-amber-500 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {t('customer.menu')}
              </button>
              <button
                onClick={() => setActiveTab('loyalty')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'loyalty'
                    ? 'bg-amber-500 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {t('customer.loyalty')}
              </button>
            </div>

            {activeTab === 'loyalty' ? (
              <LoyaltyCard customer={customer} />
            ) : (
              <div className="space-y-6">
                {categories.map((category) => (
                  <div key={category}>
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <span className="w-1 h-6 bg-amber-500 rounded-full" />
                      {category}
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {MOCK_MENU_ITEMS
                        .filter((item) => item.category === category)
                        .map((item) => (
                          <motion.div
                            key={item.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Card
                              className="bg-slate-900 border-slate-800 hover:border-amber-500/50 cursor-pointer transition-colors overflow-hidden"
                              onClick={() => handleAddToCart(item)}
                            >
                              <div className="aspect-square bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center relative">
                                <span className="text-4xl">{item.emoji}</span>
                                {item.popular && (
                                  <Badge className="absolute top-2 right-2 bg-amber-500 text-white text-xs">
                                    <Star className="w-3 h-3 mx-1" />
                                    {t('customer.popular')}
                                  </Badge>
                                )}
                              </div>
                              <CardContent className="p-3">
                                <p className="text-white font-medium text-sm truncate">{isRTL ? item.name_ar : item.name_en}</p>
                                <p className="text-amber-400 font-bold">{item.price} SAR</p>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}