'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Phone,
  User,
  Check,
  Crown,
  Star,
  Gift,
  CreditCard,
  MapPin,
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
  lastVisit: string;
}

interface CustomerCheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  tableId?: string;
  onCheckIn: (customer: Customer) => void;
}

const MOCK_CUSTOMERS: Record<string, Customer> = {
  '0501234567': {
    id: '1',
    phoneNumber: '0501234567',
    nameEn: 'Ahmed Al-Rashid',
    nameAr: 'أحمد الراشد',
    visitCount: 15,
    totalSpend: 1250.00,
    pointsBalance: 625,
    lifetimePoints: 2500,
    tier: 'Gold',
    lastVisit: '2026-03-28',
  },
  '0551234567': {
    id: '2',
    phoneNumber: '0551234567',
    nameEn: 'Fatima Hassan',
    nameAr: 'فاطمة حسن',
    visitCount: 52,
    totalSpend: 4800.00,
    pointsBalance: 2400,
    lifetimePoints: 9600,
    tier: 'VIP',
    lastVisit: '2026-03-30',
  },
};

const TIER_COLORS = {
  Regular: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
  Silver: 'bg-gray-400/20 text-gray-300 border-gray-400/30',
  Gold: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  VIP: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
};

const TIER_ICONS = {
  Regular: Star,
  Silver: Star,
  Gold: Crown,
  VIP: Crown,
};

const NEXT_TIER_POINTS = {
  Regular: { name: 'Silver', points: 500 },
  Silver: { name: 'Gold', points: 2000 },
  Gold: { name: 'VIP', points: 5000 },
  VIP: { name: 'Max', points: 0 },
};

export default function CustomerCheckInModal({
  isOpen,
  onClose,
  tableId,
  onCheckIn,
}: CustomerCheckInModalProps) {
  const { t, isRTL, locale } = useLanguage();
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [step, setStep] = useState<'phone' | 'welcome' | 'new-guest'>('phone');
  const [foundCustomer, setFoundCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handlePhoneSubmit = useCallback(async () => {
    if (!phone || phone.length < 9) return;

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    const customer = MOCK_CUSTOMERS[phone];
    if (customer) {
      setFoundCustomer(customer);
      setStep('welcome');
    } else {
      setStep('new-guest');
    }
    setIsLoading(false);
  }, [phone]);

  const handleNewGuestSubmit = useCallback(() => {
    if (!phone || !name) return;

    const newCustomer: Customer = {
      id: Date.now().toString(),
      phoneNumber: phone,
      nameEn: name,
      nameAr: name,
      visitCount: 0,
      totalSpend: 0,
      pointsBalance: 0,
      lifetimePoints: 0,
      tier: 'Regular',
      lastVisit: '',
    };

    onCheckIn(newCustomer);
    handleClose();
  }, [phone, name, onCheckIn]);

  const handleReturningGuestCheckIn = useCallback(() => {
    if (foundCustomer) {
      onCheckIn(foundCustomer);
      handleClose();
    }
  }, [foundCustomer, onCheckIn]);

  const handleClose = () => {
    setPhone('');
    setName('');
    setStep('phone');
    setFoundCustomer(null);
    onClose();
  };

  const TierIcon = foundCustomer ? TIER_ICONS[foundCustomer.tier] : Star;
  const nextTier = foundCustomer ? NEXT_TIER_POINTS[foundCustomer.tier] : null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-slate-900 border-slate-700 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <MapPin className="w-5 h-5 text-amber-400" />
            {locale === 'ar-SA' ? 'تسجيل الوصول' : 'Check-in'}
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            {locale === 'ar-SA'
              ? `أدخل رقم هاتفك للاستفادة من برنامج الولاء${tableId ? ` - طاولة ${tableId}` : ''}`
              : `Enter your phone number to earn loyalty rewards${tableId ? ` - Table ${tableId}` : ''}`}
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {step === 'phone' && (
            <motion.div
              key="phone-step"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4 py-4"
            >
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={locale === 'ar-SA' ? 'رقم الجوال' : 'Phone Number'}
                  className={`pl-10 bg-slate-800 border-slate-700 text-white text-lg ${
                    isRTL ? 'text-right pr-10 pl-3' : 'text-left'
                  }`}
                  dir="ltr"
                />
              </div>
              <Button
                onClick={handlePhoneSubmit}
                disabled={phone.length < 9 || isLoading}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white py-6 text-lg"
              >
                {isLoading
                  ? (locale === 'ar-SA' ? 'جاري البحث...' : 'Searching...')
                  : (locale === 'ar-SA' ? 'متابعة' : 'Continue')}
              </Button>
            </motion.div>
          )}

          {step === 'welcome' && foundCustomer && (
            <motion.div
              key="welcome-step"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className="text-center py-4">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center">
                  <span className="text-3xl">👋</span>
                </div>
                <h3 className="text-white text-xl font-bold mb-1">
                  {locale === 'ar-SA' ? 'مرحباً بعودتك!' : 'Welcome Back!'}
                </h3>
                <p className="text-2xl font-bold text-amber-400">
                  {locale === 'ar-SA' ? foundCustomer.nameAr : foundCustomer.nameEn}
                </p>
              </div>

              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <Badge className={TIER_COLORS[foundCustomer.tier]}>
                      <TierIcon className="w-4 h-4 mr-1" />
                      {foundCustomer.tier}
                      {locale === 'ar-SA' ? ' - ' : ' '}
                      {foundCustomer.tier === 'Regular' && (locale === 'ar-SA' ? 'عادي' : 'Regular')}
                      {foundCustomer.tier === 'Silver' && (locale === 'ar-SA' ? 'فضي' : 'Silver')}
                      {foundCustomer.tier === 'Gold' && (locale === 'ar-SA' ? 'ذهبي' : 'Gold')}
                      {foundCustomer.tier === 'VIP' && (locale === 'ar-SA' ? 'مميز' : 'VIP')}
                    </Badge>
                    <span className="text-slate-400 text-sm">
                      {foundCustomer.visitCount} {locale === 'ar-SA' ? 'زيارة' : 'visits'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 rounded bg-slate-700/50">
                      <p className="text-amber-400 text-xl font-bold">{foundCustomer.pointsBalance}</p>
                      <p className="text-slate-400 text-xs">
                        {locale === 'ar-SA' ? 'نقاط متاحة' : 'Available Points'}
                      </p>
                    </div>
                    <div className="text-center p-3 rounded bg-slate-700/50">
                      <p className="text-emerald-400 text-xl font-bold">{foundCustomer.totalSpend.toFixed(0)} SAR</p>
                      <p className="text-slate-400 text-xs">
                        {locale === 'ar-SA' ? 'إجمالي الإنفاق' : 'Total Spend'}
                      </p>
                    </div>
                  </div>

                  {nextTier && nextTier.points > 0 && (
                    <div className="mt-4 p-3 rounded bg-amber-500/10 border border-amber-500/20">
                      <p className="text-amber-400 text-sm text-center">
                        {locale === 'ar-SA'
                          ? `${nextTier.name} بعد ${nextTier.points - (foundCustomer.lifetimePoints % nextTier.points)} نقطة`
                          : `${nextTier.points - (foundCustomer.lifetimePoints % nextTier.points)} points to ${nextTier.name}`}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Button
                onClick={handleReturningGuestCheckIn}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-6 text-lg"
              >
                <Check className="w-5 h-5 mr-2" />
                {locale === 'ar-SA' ? 'تسجيل الوصول' : 'Check In'}
              </Button>
            </motion.div>
          )}

          {step === 'new-guest' && (
            <motion.div
              key="new-guest-step"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4 py-4"
            >
              <div className="text-center py-4">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center">
                  <Gift className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-white text-xl font-bold mb-1">
                  {locale === 'ar-SA' ? 'ضيف جديد!' : 'New Guest!'}
                </h3>
                <p className="text-slate-400 text-sm">
                  {locale === 'ar-SA'
                    ? 'سجّل بياناتك للحصول على نقاط الولاء'
                    : 'Register to start earning loyalty points'}
                </p>
              </div>

              <div className="space-y-3">
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    type="tel"
                    value={phone}
                    readOnly
                    className="pl-10 bg-slate-800 border-slate-700 text-white"
                    dir="ltr"
                  />
                </div>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={locale === 'ar-SA' ? 'اسمك' : 'Your Name'}
                    className={`pl-10 bg-slate-800 border-slate-700 text-white ${
                      isRTL ? 'text-right pr-10 pl-3' : 'text-left'
                    }`}
                  />
                </div>
              </div>

              <Card className="bg-amber-500/10 border-amber-500/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-amber-400 mb-2">
                    <Star className="w-5 h-5" />
                    <span className="font-bold">{locale === 'ar-SA' ? 'مكافأة التسجيل!' : 'Registration Bonus!'}</span>
                  </div>
                  <p className="text-slate-300 text-sm">
                    {locale === 'ar-SA'
                      ? 'احصل على 100 نقطة ترحيبية عند أول زيارة'
                      : 'Get 100 welcome points on your first visit'}
                  </p>
                </CardContent>
              </Card>

              <Button
                onClick={handleNewGuestSubmit}
                disabled={!name || !phone}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white py-6 text-lg"
              >
                {locale === 'ar-SA' ? 'إكمال التسجيل' : 'Complete Registration'}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
