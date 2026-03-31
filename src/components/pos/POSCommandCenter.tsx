'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ShoppingCart,
  CreditCard,
  Banknote,
  QrCode,
  Clock,
  Plus,
  Minus,
  X,
  Search,
  Keyboard,
  User,
  LogOut,
  DollarSign,
  Receipt,
  Check,
} from 'lucide-react';

interface POSItem {
  id: string;
  name_en: string;
  name_ar: string;
  price: number;
  category: string;
  emoji: string;
  hotkey?: string;
}

interface CartItem extends POSItem {
  quantity: number;
}

interface Order {
  id: string;
  orderNumber: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: 'cash' | 'card' | 'qr';
  status: 'pending' | 'preparing' | 'ready' | 'completed';
  customerName?: string;
  createdAt: Date;
  priority: 'normal' | 'rush';
}

interface ShiftData {
  cashierName: string;
  startTime: Date;
  openingBalance: number;
  currentCash: number;
}

const MENU_ITEMS: POSItem[] = [
  { id: '1', name_en: 'Arabic Coffee', name_ar: 'قهوة عربية', price: 8, category: 'Hot', emoji: '☕', hotkey: 'F1' },
  { id: '2', name_en: 'Cappuccino', name_ar: 'كابتشينو', price: 14, category: 'Hot', emoji: '🥛', hotkey: 'F2' },
  { id: '3', name_en: 'Fresh Lime', name_ar: 'ليموناضة', price: 10, category: 'Cold', emoji: '🍋', hotkey: 'F3' },
  { id: '4', name_en: 'Mango Smoothie', name_ar: 'سموذي مانجو', price: 16, category: 'Cold', emoji: '🥭', hotkey: 'F4' },
  { id: '5', name_en: 'Zaatar Manakish', name_ar: 'مناقيش زعتر', price: 12, category: 'Food', emoji: '🫓', hotkey: 'F5' },
  { id: '6', name_en: 'Labneh Sandwich', name_ar: 'ساندويتش لبنة', price: 15, category: 'Food', emoji: '🥪', hotkey: 'F6' },
  { id: '7', name_en: 'Cheese Fatayer', name_ar: 'فطاير جبن', price: 10, category: 'Food', emoji: '🥧', hotkey: 'F7' },
  { id: '8', name_en: 'Knafeh', name_ar: 'كنافة', price: 18, category: 'Desserts', emoji: '🍯', hotkey: 'F8' },
  { id: '9', name_en: 'Water', name_ar: 'ماء', price: 3, category: 'Cold', emoji: '💧', hotkey: 'F9' },
  { id: '10', name_en: 'Tea', name_ar: 'شاي', price: 5, category: 'Hot', emoji: '🍵', hotkey: 'F10' },
];

const QUICK_AMOUNTS = [5, 10, 20, 50, 100];

const KeyboardShortcutDisplay = ({ keys }: { keys: string[] }) => (
  <div className="flex gap-1">
    {keys.map((key, i) => (
      <kbd
        key={i}
        className="px-1.5 py-0.5 text-xs font-mono bg-slate-700 text-slate-300 rounded border border-slate-600"
      >
        {key}
      </kbd>
    ))}
  </div>
);

const ShiftManagement = ({
  shift,
  onEndShift,
}: {
  shift: ShiftData;
  onEndShift: () => void;
}) => {
  const { t, isRTL } = useLanguage();
  const hoursWorked = Math.floor(
    (Date.now() - shift.startTime.getTime()) / (1000 * 60 * 60)
  );
  const variance = shift.currentCash - shift.openingBalance;

  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-white text-sm flex items-center gap-2">
          <User className="w-4 h-4 text-blue-400" />
          {t('pos.shiftInfo')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
          <span className="text-slate-400 text-sm">{t('pos.cashier')}</span>
          <span className="text-white text-sm font-medium">{shift.cashierName}</span>
        </div>
        <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
          <span className="text-slate-400 text-sm">{t('pos.hours')}</span>
          <span className="text-white text-sm">{hoursWorked}h</span>
        </div>
        <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
          <span className="text-slate-400 text-sm">{t('pos.opening')}</span>
          <span className="text-white text-sm">{shift.openingBalance.toFixed(2)} SAR</span>
        </div>
        <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
          <span className="text-slate-400 text-sm">{t('pos.current')}</span>
          <span className="text-amber-400 text-sm font-medium">{shift.currentCash.toFixed(2)} SAR</span>
        </div>
        <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
          <span className="text-slate-400 text-sm">{t('pos.variance')}</span>
          <span className={`text-sm font-medium ${variance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {variance >= 0 ? '+' : ''}{variance.toFixed(2)} SAR
          </span>
        </div>
        <Button
          variant="outline"
          onClick={onEndShift}
          className="w-full mt-2 border-red-500/50 text-red-400 hover:bg-red-500/10"
        >
          <LogOut className="w-4 h-4 mx-2" />
          {t('pos.endShift')}
        </Button>
      </CardContent>
    </Card>
  );
};

const CashInOut = ({
  onCashAction,
}: {
  onCashAction: (amount: number, type: 'in' | 'out') => void;
}) => {
  const { t, isRTL } = useLanguage();
  const [amount, setAmount] = useState('');

  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-white text-sm flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-emerald-400" />
          {t('pos.cashManagement')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="flex-1 px-3 py-2 rounded bg-slate-800 border border-slate-700 text-white text-center"
          />
          <span className="flex items-center text-slate-400">SAR</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            onClick={() => {
              if (amount) { onCashAction(parseFloat(amount), 'in'); setAmount(''); }
            }}
            className="border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10"
          >
            <Plus className="w-4 h-4 mx-1" />
            {t('pos.cashIn')}
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              if (amount) { onCashAction(parseFloat(amount), 'out'); setAmount(''); }
            }}
            className="border-red-500/50 text-red-400 hover:bg-red-500/10"
          >
            <Minus className="w-4 h-4 mx-1" />
            {t('pos.cashOut')}
          </Button>
        </div>
        <div className="grid grid-cols-5 gap-1">
          {QUICK_AMOUNTS.map((amt) => (
            <button
              key={amt}
              onClick={() => setAmount(amt.toString())}
              className="px-2 py-1 text-xs bg-slate-800 text-slate-400 rounded hover:bg-slate-700"
            >
              {amt}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const RecentOrdersWidget = ({ orders }: { orders: Order[] }) => {
  const { t, isRTL } = useLanguage();
  const last5 = orders.slice(-5).reverse();

  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-white text-sm flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-400" />
          {t('pos.recentOrders')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {last5.map((order) => (
          <div
            key={order.id}
            className="flex items-center justify-between p-2 rounded bg-slate-800/50"
          >
            <div>
              <p className="text-white text-sm font-medium">{order.orderNumber}</p>
              <p className="text-slate-400 text-xs">
                {order.items.length} items
              </p>
            </div>
            <Badge
              className={
                order.status === 'completed'
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : order.status === 'preparing'
                  ? 'bg-amber-500/20 text-amber-400'
                  : 'bg-slate-600/50 text-slate-300'
              }
            >
              {order.status}
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default function POSCommandCenter() {
  const { t, isRTL } = useLanguage();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastOrder, setLastOrder] = useState<Order | null>(null);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  const [shift, setShift] = useState<ShiftData>({
    cashierName: 'Sarah Johnson',
    startTime: new Date(Date.now() - 4 * 60 * 60 * 1000),
    openingBalance: 500,
    currentCash: 2847.50,
  });

  const inputRef = useRef<HTMLInputElement>(null);

  const TAX_RATE = 0.15;
  const categories = ['all', ...new Set(MENU_ITEMS.map((i) => i.category))];

  const filteredItems = MENU_ITEMS.filter((item) => {
    const matchesSearch =
      item.name_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.name_ar.includes(searchQuery);
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;

  const handleAddToCart = useCallback((item: POSItem) => {
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

  const handleUpdateQuantity = useCallback((id: string, qty: number) => {
    if (qty <= 0) {
      setCart((prev) => prev.filter((i) => i.id !== id));
      return;
    }
    setCart((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity: qty } : i))
    );
  }, []);

  const handleRemoveItem = useCallback((id: string) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const handleClearCart = useCallback(() => {
    setCart([]);
    setCustomerName('');
  }, []);

  const generateOrderNumber = () => {
    const date = new Date();
    const dateStr = date.toISOString().slice(2, 10).replace(/-/g, '');
    const seq = String(orders.length + 1).padStart(4, '0');
    return `SB-${dateStr}-${seq}`;
  };

  const handleCheckout = useCallback((paymentMethod: 'cash' | 'card' | 'qr') => {
    if (cart.length === 0) return;

    const order: Order = {
      id: Math.random().toString(36).substr(2, 9),
      orderNumber: generateOrderNumber(),
      items: [...cart],
      subtotal,
      tax,
      total,
      paymentMethod,
      status: 'pending',
      customerName: customerName || undefined,
      createdAt: new Date(),
      priority: 'normal',
    };

    setOrders((prev) => [...prev, order]);
    setLastOrder(order);
    setShowReceipt(true);

    if (paymentMethod === 'cash') {
      setShift((prev) => ({
        ...prev,
        currentCash: prev.currentCash + total,
      }));
    }

    setTimeout(() => {
      setShowReceipt(false);
      setLastOrder(null);
      handleClearCart();
    }, 3000);
  }, [cart, subtotal, tax, total, customerName, orders.length, handleClearCart]);

  const handleCashInOut = useCallback((amount: number, type: 'in' | 'out') => {
    setShift((prev) => ({
      ...prev,
      currentCash: type === 'in' ? prev.currentCash + amount : prev.currentCash - amount,
    }));
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClearCart();
      } else if (e.key === 'F1') {
        e.preventDefault();
        handleAddToCart(MENU_ITEMS[0]);
      } else if (e.key === 'F2') {
        e.preventDefault();
        handleAddToCart(MENU_ITEMS[1]);
      } else if (e.key === 'F3') {
        e.preventDefault();
        handleAddToCart(MENU_ITEMS[2]);
      } else if (e.key === 'F4') {
        e.preventDefault();
        handleAddToCart(MENU_ITEMS[3]);
      } else if (e.key === 'F5') {
        e.preventDefault();
        handleAddToCart(MENU_ITEMS[4]);
      } else if (e.key === 'F6') {
        e.preventDefault();
        handleAddToCart(MENU_ITEMS[5]);
      } else if (e.key === 'F7') {
        e.preventDefault();
        handleAddToCart(MENU_ITEMS[6]);
      } else if (e.key === 'F8') {
        e.preventDefault();
        handleAddToCart(MENU_ITEMS[7]);
      } else if (e.key === 'F9') {
        e.preventDefault();
        handleAddToCart(MENU_ITEMS[8]);
      } else if (e.key === 'F10') {
        e.preventDefault();
        handleAddToCart(MENU_ITEMS[9]);
      } else if (e.key === 'Enter' && e.ctrlKey && cart.length > 0) {
        e.preventDefault();
        handleCheckout('card');
      } else if (e.key === '?' || (e.key === '/' && e.shiftKey)) {
        e.preventDefault();
        setShowKeyboardHelp(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cart, handleAddToCart, handleCheckout, handleClearCart]);

  return (
    <div className="min-h-screen bg-slate-950">
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40">
        <div className="px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center">
                <Receipt className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-white font-bold">{t('pos.smartbitePOS')}</h1>
                <p className="text-slate-400 text-xs">{t('pos.commandCenter')}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveCategory('all')}
                className={`px-3 py-1 rounded text-sm ${
                  activeCategory === 'all'
                    ? 'bg-amber-500 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {t('pos.all')}
              </button>
              {categories.filter(c => c !== 'all').map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1 rounded text-sm ${
                    activeCategory === cat
                      ? 'bg-amber-500 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowKeyboardHelp(true)}
              className="flex items-center gap-1 px-3 py-1.5 rounded bg-slate-800 text-slate-400 hover:text-white text-sm"
            >
              <Keyboard className="w-4 h-4" />
              <span className="hidden md:inline">{t('pos.shortcuts')}</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-60px)]">
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="mb-4">
            <div className="relative">
              <Search className={`absolute top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 ${isRTL ? 'right-3' : 'left-3'}`} />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('pos.search')}
                className={`w-full py-3 rounded-lg bg-slate-900 border border-slate-800 text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 ${isRTL ? 'pr-10 text-right' : 'pl-10 text-left'}`}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {filteredItems.map((item) => (
              <motion.div
                key={item.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card
                  className="bg-slate-900 border-slate-800 hover:border-amber-500/50 cursor-pointer transition-all"
                  onClick={() => handleAddToCart(item)}
                >
                  <CardContent className="p-3">
                    <div className={`flex items-start justify-between mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <span className="text-3xl">{item.emoji}</span>
                      {item.hotkey && (
                        <KeyboardShortcutDisplay keys={[item.hotkey]} />
                      )}
                    </div>
                    <p className="text-white font-medium text-sm truncate">{isRTL ? item.name_ar : item.name_en}</p>
                    <p className="text-amber-400 font-bold">{item.price} SAR</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        <div className={`w-96 bg-slate-900 border-slate-800 shadow-xl flex flex-col ${isRTL ? 'border-l' : 'border-r'}`}>
          <div className="p-4 border-b border-slate-800">
            <div className={`flex items-center justify-between mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <h2 className="text-white font-bold flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-amber-400" />
                {t('pos.cart')}
                {cart.length > 0 && (
                  <Badge className="bg-amber-500 text-white">{cart.length}</Badge>
                )}
              </h2>
              {cart.length > 0 && (
                <button
                  onClick={handleClearCart}
                  className="text-slate-400 hover:text-red-400 text-sm"
                >
                  {t('customer.clear')}
                </button>
              )}
            </div>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder={t('customer.optional')}
              className={`w-full px-3 py-2 rounded bg-slate-800 border border-slate-700 text-white text-sm placeholder-slate-400 ${isRTL ? 'text-right' : 'text-left'}`}
            />
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
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
                    <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <span className="text-xl">{item.emoji}</span>
                      <div className={isRTL ? 'text-right' : 'text-left'}>
                        <p className="text-white text-sm">{isRTL ? item.name_ar : item.name_en}</p>
                        <p className="text-amber-400 text-xs">{item.price} SAR</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-slate-400 hover:text-red-400"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className={`flex items-center justify-between mt-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                        className="w-7 h-7 rounded-full bg-slate-700 text-white hover:bg-slate-600"
                      >
                        <Minus className="w-4 h-4 mx-auto" />
                      </button>
                      <span className="text-white font-medium w-8 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        className="w-7 h-7 rounded-full bg-amber-500 text-white hover:bg-amber-600"
                      >
                        <Plus className="w-4 h-4 mx-auto" />
                      </button>
                    </div>
                    <span className="text-white font-semibold">
                      {(item.price * item.quantity).toFixed(2)} SAR
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="p-4 border-t border-slate-800 space-y-3">
            <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
              <span className="text-slate-400">{t('customer.subtotal')}</span>
              <span className="text-white">{subtotal.toFixed(2)} SAR</span>
            </div>
            <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
              <span className="text-slate-400">{t('pos.vat')}</span>
              <span className="text-white">{tax.toFixed(2)} SAR</span>
            </div>
            <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
              <span className="text-lg text-white font-bold">{t('customer.total')}</span>
              <span className="text-xl text-amber-400 font-bold">{total.toFixed(2)} SAR</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <Button
                onClick={() => handleCheckout('cash')}
                disabled={cart.length === 0}
                className="bg-emerald-500 hover:bg-emerald-600 text-white"
              >
                <Banknote className="w-4 h-4 mx-1" />
                {t('pos.cash')}
              </Button>
              <Button
                onClick={() => handleCheckout('card')}
                disabled={cart.length === 0}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                <CreditCard className="w-4 h-4 mx-1" />
                {t('pos.card')}
              </Button>
              <Button
                onClick={() => handleCheckout('qr')}
                disabled={cart.length === 0}
                className="bg-purple-500 hover:bg-purple-600 text-white"
              >
                <QrCode className="w-4 h-4 mx-1" />
                QR
              </Button>
            </div>

            <p className="text-slate-500 text-xs text-center">
              {t('pos.forCardPayment')}
            </p>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showReceipt && lastOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="bg-white text-slate-900 rounded-lg p-8 max-w-md w-full mx-4"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-emerald-600">{t('pos.success')}</h2>
                <p className="text-slate-500 mt-2">{t('pos.orderPlaced')}</p>
              </div>
              <div className="border-t border-b border-slate-200 py-4 mb-4">
                <div className="flex justify-between mb-2">
                  <span className="text-slate-500">{t('pos.orderNumber')}</span>
                  <span className="font-bold">{lastOrder.orderNumber}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-slate-500">{t('customer.total')}</span>
                  <span className="font-bold text-amber-600">{lastOrder.total.toFixed(2)} SAR</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{t('pos.paymentMethod')}</span>
                  <span className="font-bold capitalize">{lastOrder.paymentMethod}</span>
                </div>
              </div>
              <Button
                onClick={() => setShowReceipt(false)}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
              >
                {t('pos.done')}
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showKeyboardHelp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowKeyboardHelp(false)}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 border border-slate-700 rounded-lg p-6 max-w-lg w-full mx-4"
            >
              <h2 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
                <Keyboard className="w-6 h-6 text-amber-400" />
                {t('pos.shortcutsTitle')}
              </h2>
              <div className="space-y-3">
                {[
                  { keys: ['F1', '-', 'F10'], desc: t('pos.quickAdd') },
                  { keys: ['Esc'], desc: t('pos.clearCart') },
                  { keys: ['Ctrl', 'Enter'], desc: t('pos.forCardPayment') },
                  { keys: ['?'], desc: t('pos.showHelp') },
                ].map((shortcut, i) => (
                  <div key={i} className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <span className="text-slate-400">{shortcut.desc}</span>
                    <KeyboardShortcutDisplay keys={shortcut.keys} />
                  </div>
                ))}
              </div>
              <Button
                onClick={() => setShowKeyboardHelp(false)}
                className="w-full mt-4 bg-amber-500 hover:bg-amber-600 text-white"
              >
                {t('pos.close')}
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}