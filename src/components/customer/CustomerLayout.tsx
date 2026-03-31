'use client';

import { useState, useCallback } from 'react';
import { useParams, Outlet } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import CustomerCheckInModal from '@/components/customer/CustomerCheckInModal';
import CustomerMenu from '@/components/customer/CustomerMenu';
import CustomerCart from '@/components/customer/CustomerCart';
import CustomerLoyalty from '@/components/customer/CustomerLoyalty';
import { Badge } from '@/components/ui/badge';
import {
  Menu,
  ShoppingCart,
  User,
  QrCode,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Home,
} from 'lucide-react';

interface Customer {
  id: string;
  phoneNumber: string;
  nameEn: string;
  nameAr: string;
  visitCount: number;
  totalSpend: number;
  pointsBalance: number;
  lifetimePoints: number;
  tier: 'Regular' | 'Silver' | 'Gold' | 'VIP';
}

interface CartItem {
  id: string;
  name_en: string;
  name_ar: string;
  price: number;
  quantity: number;
  emoji: string;
}

const TIER_COLORS = {
  Regular: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
  Silver: 'bg-gray-400/20 text-gray-300 border-gray-400/30',
  Gold: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  VIP: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
};

export default function CustomerLayout() {
  const { tableId } = useParams();
  const { t, isRTL, locale } = useLanguage();

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCheckIn, setShowCheckIn] = useState(!customer);
  const [activeTab, setActiveTab] = useState<'menu' | 'loyalty' | 'cart'>('menu');

  const handleCheckIn = useCallback((checkedInCustomer: Customer) => {
    setCustomer(checkedInCustomer);
    setShowCheckIn(false);
  }, []);

  const handleAddToCart = useCallback((item: { id: string; name_en: string; name_ar: string; price: number; emoji: string }) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  }, []);

  const handleRemoveFromCart = useCallback((itemId: string) => {
    setCart(prev => {
      const item = prev.find(i => i.id === itemId);
      if (item && item.quantity > 1) {
        return prev.map(i =>
          i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i
        );
      }
      return prev.filter(i => i.id !== itemId);
    });
  }, []);

  const handleUpdateQuantity = useCallback((itemId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart(prev => prev.filter(i => i.id !== itemId));
    } else {
      setCart(prev =>
        prev.map(i => i.id === itemId ? { ...i, quantity } : i)
      );
    }
  }, []);

  const handleClearCart = useCallback(() => {
    setCart([]);
  }, []);

  if (!tableId) {
    return null;
  }

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col" dir={isRTL ? 'rtl' : 'ltr'}>
      <CustomerCheckInModal
        isOpen={showCheckIn}
        onClose={() => setShowCheckIn(false)}
        tableId={tableId}
        onCheckIn={handleCheckIn}
      />

      <header className="bg-slate-900 border-b border-slate-800 px-4 py-3 sticky top-0 z-30">
        <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center">
              <span className="text-white font-bold text-sm">SB</span>
            </div>
            <div>
              <h1 className="text-white font-bold">SmartBite</h1>
              <div className="flex items-center gap-1 text-slate-400 text-sm">
                <MapPin className="w-3 h-3" />
                <span>{locale === 'ar-SA' ? 'طاولة' : 'Table'} {tableId}</span>
              </div>
            </div>
          </div>

          {customer && (
            <div className="flex items-center gap-2">
              <Badge className={TIER_COLORS[customer.tier]}>
                {customer.tier} - {customer.pointsBalance} {locale === 'ar-SA' ? 'نقطة' : 'pts'}
              </Badge>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 overflow-auto pb-24">
        {activeTab === 'menu' && (
          <CustomerMenu
            cart={cart}
            onAddToCart={handleAddToCart}
            onRemoveFromCart={handleRemoveFromCart}
            onUpdateQuantity={handleUpdateQuantity}
          />
        )}
        {activeTab === 'loyalty' && (
          <CustomerLoyalty customer={customer} />
        )}
        {activeTab === 'cart' && (
          <CustomerCart
            cart={cart}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={(id) => handleUpdateQuantity(id, 0)}
            onClearCart={handleClearCart}
            customer={customer}
          />
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 z-50">
        <div className="flex items-center justify-around py-2">
          <button
            onClick={() => setActiveTab('menu')}
            className={`flex flex-col items-center gap-1 px-4 py-2 ${
              activeTab === 'menu' ? 'text-amber-400' : 'text-slate-400'
            }`}
          >
            <Menu className="w-6 h-6" />
            <span className="text-xs">{locale === 'ar-SA' ? 'القائمة' : 'Menu'}</span>
          </button>

          <button
            onClick={() => setActiveTab('loyalty')}
            className={`flex flex-col items-center gap-1 px-4 py-2 ${
              activeTab === 'loyalty' ? 'text-amber-400' : 'text-slate-400'
            }`}
          >
            <QrCode className="w-6 h-6" />
            <span className="text-xs">{locale === 'ar-SA' ? 'ولائي' : 'Loyalty'}</span>
          </button>

          <button
            onClick={() => setActiveTab('cart')}
            className={`relative flex flex-col items-center gap-1 px-4 py-2 ${
              activeTab === 'cart' || cartCount > 0 ? 'text-amber-400' : 'text-slate-400'
            }`}
          >
            <div className="relative">
              <ShoppingCart className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-amber-500 text-white text-xs rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </div>
            <span className="text-xs">
              {cartTotal.toFixed(0)} SAR
            </span>
          </button>

          <button
            onClick={() => setShowCheckIn(true)}
            className={`flex flex-col items-center gap-1 px-4 py-2 ${
              !customer ? 'text-amber-400' : 'text-slate-400'
            }`}
          >
            <User className="w-6 h-6" />
            <span className="text-xs text-xs">
              {customer ? (locale === 'ar-SA' ? customer.nameAr : customer.nameEn).substring(0, 8) : (locale === 'ar-SA' ? 'تسجيل' : 'Check-in')}
            </span>
          </button>
        </div>
      </nav>
    </div>
  );
}
