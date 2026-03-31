'use client';

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ShoppingCart,
  Minus,
  Plus,
  X,
  CreditCard,
  Banknote,
  QrCode,
  Check,
  Clock,
} from 'lucide-react';

interface CartItem {
  id: string;
  name_en: string;
  name_ar: string;
  price: number;
  quantity: number;
  emoji: string;
}

interface CustomerCartProps {
  cart: CartItem[];
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onClearCart: () => void;
  customer: {
    id: string;
    nameEn: string;
    nameAr: string;
    pointsBalance: number;
    tier: string;
  } | null;
}

export default function CustomerCart({ cart, onUpdateQuantity, onRemoveItem, onClearCart, customer }: CustomerCartProps) {
  const { tableId } = useParams();
  const { t, isRTL, locale } = useLanguage();
  const navigate = useNavigate();
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.15;
  const total = subtotal + tax;
  const cashback = customer ? Math.floor(total * 0.05) : 0;

  const handleCheckout = (method: 'cash' | 'card' | 'qr') => {
    const newOrderNumber = `SB-${Date.now().toString().slice(-6)}`;
    setOrderNumber(newOrderNumber);
    setOrderPlaced(true);
    setShowCheckout(false);

    setTimeout(() => {
      setOrderPlaced(false);
      onClearCart();
    }, 5000);
  };

  if (orderPlaced) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
        <div className="w-24 h-24 rounded-full bg-emerald-500/20 flex items-center justify-center mb-6 animate-pulse">
          <Check className="w-12 h-12 text-emerald-400" />
        </div>
        <h2 className="text-white text-2xl font-bold mb-2">
          {locale === 'ar-SA' ? 'تم إرسال طلبك!' : 'Order Placed!'}
        </h2>
        <p className="text-slate-400 mb-4">
          {locale === 'ar-SA' ? 'رقم الطلب:' : 'Order #'} {orderNumber}
        </p>
        <Card className="bg-slate-900 border-slate-800 w-full max-w-md">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 text-amber-400 mb-2">
              <Clock className="w-5 h-5" />
              <span className="font-semibold">
                {locale === 'ar-SA' ? 'الوقت المتوقع:' : 'Estimated Time:'} 15 {locale === 'ar-SA' ? 'دقيقة' : 'min'}
              </span>
            </div>
            <p className="text-slate-400 text-sm">
              {locale === 'ar-SA'
                ? `سيتم إشعارك عند جاهزية طلبك لطاولة ${tableId}`
                : `You'll be notified when your order is ready for Table ${tableId}`}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
        <ShoppingCart className="w-24 h-24 text-slate-700 mb-4" />
        <h2 className="text-white text-xl font-semibold mb-2">
          {locale === 'ar-SA' ? 'سلتك فارغة' : 'Your cart is empty'}
        </h2>
        <p className="text-slate-400 text-center">
          {locale === 'ar-SA'
            ? 'أضف منتجات من القائمة لبدء طلبك'
            : 'Add items from the menu to start your order'}
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
        <h2 className="text-white text-xl font-bold flex items-center gap-2">
          <ShoppingCart className="w-6 h-6 text-amber-400" />
          {locale === 'ar-SA' ? 'سلة التسوق' : 'Your Order'}
          <Badge className="bg-amber-500 text-white">{cart.length}</Badge>
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearCart}
          className="text-slate-400 hover:text-red-400"
        >
          {locale === 'ar-SA' ? 'مسح الكل' : 'Clear All'}
        </Button>
      </div>

      <div className="space-y-3">
        {cart.map(item => (
          <Card key={item.id} className="bg-slate-900 border-slate-800">
            <CardContent className="p-4">
              <div className={`flex items-center justify-between gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span className="text-3xl">{item.emoji}</span>
                  <div className={isRTL ? 'text-right' : 'text-left'}>
                    <h3 className="text-white font-semibold">
                      {locale === 'ar-SA' ? item.name_ar : item.name_en}
                    </h3>
                    <p className="text-amber-400 font-medium">{item.price} SAR</p>
                  </div>
                </div>

                <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <Button
                      onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                      variant="outline"
                      size="sm"
                      className="w-8 h-8 p-0 border-slate-600 text-slate-300 hover:text-white"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="text-white font-bold w-8 text-center">{item.quantity}</span>
                    <Button
                      onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                      variant="outline"
                      size="sm"
                      className="w-8 h-8 p-0 border-slate-600 text-slate-300 hover:text-white"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>

                  <Button
                    onClick={() => onRemoveItem(item.id)}
                    variant="ghost"
                    size="sm"
                    className="text-slate-400 hover:text-red-400"
                  >
                    <X className="w-4 h-4" />
                  </Button>

                  <span className="text-white font-bold min-w-[60px] text-right">
                    {(item.price * item.quantity).toFixed(0)} SAR
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardContent className="p-4 space-y-3">
          <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
            <span className="text-slate-400">{locale === 'ar-SA' ? 'المجموع الفرعي' : 'Subtotal'}</span>
            <span className="text-white font-medium">{subtotal.toFixed(2)} SAR</span>
          </div>
          <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
            <span className="text-slate-400">{locale === 'ar-SA' ? 'ضريبة 15%' : 'VAT 15%'}</span>
            <span className="text-white font-medium">{tax.toFixed(2)} SAR</span>
          </div>
          <div className={`flex items-center justify-between border-t border-slate-700 pt-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <span className="text-white text-lg font-bold">{locale === 'ar-SA' ? 'الإجمالي' : 'Total'}</span>
            <span className="text-amber-400 text-xl font-bold">{total.toFixed(2)} SAR</span>
          </div>

          {customer && (
            <div className={`flex items-center justify-between bg-amber-500/10 p-3 rounded-lg ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <span className="text-amber-400">💰</span>
                <span className="text-slate-300">{locale === 'ar-SA' ? 'كاش باك (5%)' : 'Cashback (5%)'}</span>
              </div>
              <span className="text-emerald-400 font-bold">+{cashback} {locale === 'ar-SA' ? 'نقطة' : 'pts'}</span>
            </div>
          )}
        </CardContent>
      </Card>

      <Button
        onClick={() => setShowCheckout(true)}
        className="w-full py-6 text-lg bg-amber-500 hover:bg-amber-600 text-white font-bold"
      >
        {locale === 'ar-SA' ? 'إتمام الطلب' : 'Place Order'} - {total.toFixed(2)} SAR
      </Button>

      {showCheckout && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <Card className="bg-slate-900 border-slate-700 w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-white text-center">
                {locale === 'ar-SA' ? 'اختر طريقة الدفع' : 'Select Payment Method'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <Button
                  onClick={() => handleCheckout('cash')}
                  variant="outline"
                  className="flex flex-col items-center gap-2 py-6 border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10"
                >
                  <Banknote className="w-8 h-8" />
                  <span>{locale === 'ar-SA' ? 'نقدي' : 'Cash'}</span>
                </Button>
                <Button
                  onClick={() => handleCheckout('card')}
                  variant="outline"
                  className="flex flex-col items-center gap-2 py-6 border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
                >
                  <CreditCard className="w-8 h-8" />
                  <span>{locale === 'ar-SA' ? 'بطاقة' : 'Card'}</span>
                </Button>
                <Button
                  onClick={() => handleCheckout('qr')}
                  variant="outline"
                  className="flex flex-col items-center gap-2 py-6 border-purple-500/50 text-purple-400 hover:bg-purple-500/10"
                >
                  <QrCode className="w-8 h-8" />
                  <span>QR</span>
                </Button>
              </div>
              <Button
                onClick={() => setShowCheckout(false)}
                variant="ghost"
                className="w-full text-slate-400 hover:text-white"
              >
                {locale === 'ar-SA' ? 'إلغاء' : 'Cancel'}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
