'use client';

import { useParams } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Crown,
  Star,
  Gift,
  TrendingUp,
  Clock,
  MapPin,
  ChevronRight,
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

interface TierInfo {
  name: string;
  nameAr: string;
  minPoints: number;
  cashback: number;
  color: string;
  bgColor: string;
  icon: React.ElementType;
}

const TIERS: TierInfo[] = [
  { name: 'Regular', nameAr: 'عادي', minPoints: 0, cashback: 1, color: 'text-slate-300', bgColor: 'bg-slate-500/20', icon: Star },
  { name: 'Silver', nameAr: 'فضي', minPoints: 500, cashback: 2, color: 'text-gray-300', bgColor: 'bg-gray-400/20', icon: Star },
  { name: 'Gold', nameAr: 'ذهبي', minPoints: 2000, cashback: 5, color: 'text-amber-400', bgColor: 'bg-amber-500/20', icon: Crown },
  { name: 'VIP', nameAr: 'مميز', minPoints: 5000, cashback: 10, color: 'text-purple-400', bgColor: 'bg-purple-500/20', icon: Crown },
];

interface CustomerLoyaltyProps {
  customer: Customer | null;
}

export default function CustomerLoyalty({ customer }: CustomerLoyaltyProps) {
  const { tableId } = useParams();
  const { t, isRTL, locale } = useLanguage();

  if (!customer) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
        <div className="w-24 h-24 rounded-full bg-slate-800 flex items-center justify-center mb-6">
          <Star className="w-12 h-12 text-slate-600" />
        </div>
        <h2 className="text-white text-xl font-semibold mb-2">
          {locale === 'ar-SA' ? 'سجل نقاطك' : 'Track Your Points'}
        </h2>
        <p className="text-slate-400 text-center mb-6">
          {locale === 'ar-SA'
            ? 'سجل دخولك أو أنشئ حساباً للاستفادة من برنامج الولاء'
            : 'Check in or create an account to start earning loyalty rewards'}
        </p>
        <Button className="bg-amber-500 hover:bg-amber-600 text-white">
          <Gift className="w-4 h-4 mr-2" />
          {locale === 'ar-SA' ? 'اكسب نقاط الآن' : 'Earn Points Now'}
        </Button>
      </div>
    );
  }

  const currentTierInfo = TIERS.find(tier => tier.name === customer.tier) || TIERS[0];
  const currentTierIndex = TIERS.findIndex(tier => tier.name === customer.tier);
  const nextTier = TIERS[currentTierIndex + 1];
  const pointsToNextTier = nextTier ? nextTier.minPoints - (customer.lifetimePoints % nextTier.minPoints) : 0;
  const progressToNextTier = nextTier
    ? ((customer.lifetimePoints - nextTier.minPoints) / (nextTier.minPoints - nextTier.minPoints)) * 100
    : 100;

  const TierIcon = currentTierInfo.icon;

  const rewards = [
    { points: 100, reward: locale === 'ar-SA' ? 'قهوة عربية مجانية' : 'Free Arabic Coffee', icon: '☕' },
    { points: 250, reward: locale === 'ar-SA' ? 'خصم 10%' : '10% Discount', icon: '🎁' },
    { points: 500, reward: locale === 'ar-SA' ? 'وجبة مجانية' : 'Free Meal', icon: '🍽️' },
    { points: 1000, reward: locale === 'ar-SA' ? 'تخفيض 25% + مشروبات مجانية' : '25% Off + Free Drinks', icon: '🎉' },
  ];

  const unlockedRewards = rewards.filter(r => customer.lifetimePoints >= r.points);
  const upcomingRewards = rewards.filter(r => customer.lifetimePoints < r.points);

  return (
    <div className="p-4 space-y-6">
      <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
        <h2 className="text-white text-xl font-bold flex items-center gap-2">
          <Gift className="w-6 h-6 text-amber-400" />
          {locale === 'ar-SA' ? 'برنامج الولاء' : 'Loyalty Program'}
        </h2>
        <Badge className={currentTierInfo.bgColor + ' ' + currentTierInfo.color}>
          <TierIcon className="w-4 h-4 mr-1" />
          {locale === 'ar-SA' ? currentTierInfo.nameAr : currentTierInfo.name}
        </Badge>
      </div>

      <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 overflow-hidden">
        <div className={`h-2 bg-gradient-to-r ${currentTierIndex === 3 ? 'from-purple-500 to-purple-600' : 'from-amber-500 to-amber-600'}`} />
        <CardContent className="p-6">
          <div className={`flex items-center gap-4 mb-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className={`w-16 h-16 rounded-full ${currentTierInfo.bgColor} flex items-center justify-center`}>
              <span className="text-3xl font-bold text-white">
                {(locale === 'ar-SA' ? customer.nameAr : customer.nameEn).charAt(0)}
              </span>
            </div>
            <div className={isRTL ? 'text-right' : 'text-left'}>
              <h3 className="text-white text-xl font-bold">
                {locale === 'ar-SA' ? customer.nameAr : customer.nameEn}
              </h3>
              <p className="text-slate-400 text-sm flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {locale === 'ar-SA' ? 'طاولة' : 'Table'} {tableId}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-slate-800/50 rounded-lg p-4 text-center">
              <p className="text-amber-400 text-3xl font-bold">{customer.pointsBalance}</p>
              <p className="text-slate-400 text-sm">
                {locale === 'ar-SA' ? 'نقاط متاحة' : 'Available Points'}
              </p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4 text-center">
              <p className="text-emerald-400 text-3xl font-bold">{customer.lifetimePoints}</p>
              <p className="text-slate-400 text-sm">
                {locale === 'ar-SA' ? 'إجمالي النقاط' : 'Lifetime Points'}
              </p>
            </div>
          </div>

          <div className={`flex items-center justify-between mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <span className="text-slate-400 text-sm">
              {nextTier
                ? `${locale === 'ar-SA' ? nextTier.nameAr : nextTier.name} بعد` : locale === 'ar-SA' ? 'أعلى مستوى!' : 'Max tier!'}
            </span>
            {nextTier && (
              <span className="text-amber-400 text-sm font-medium">
                {pointsToNextTier} {locale === 'ar-SA' ? 'نقطة' : 'pts'}
              </span>
            )}
          </div>

          <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                currentTierIndex === 3 ? 'bg-purple-500' : 'bg-gradient-to-r from-amber-500 to-amber-600'
              }`}
              style={{ width: `${Math.min(progressToNextTier, 100)}%` }}
            />
          </div>
        </CardContent>
      </Card>

      <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <TrendingUp className="w-5 h-5 text-amber-400" />
        <h3 className="text-white font-semibold">
          {locale === 'ar-SA' ? 'مستوى التوفير' : 'Cashback Rate'}
        </h3>
        <Badge className={`ml-auto ${currentTierInfo.bgColor} ${currentTierInfo.color}`}>
          {currentTierInfo.cashback}% {locale === 'ar-SA' ? 'كاش باك' : 'cashback'}
        </Badge>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            {locale === 'ar-SA' ? 'نقاط الولاء' : 'Visit History'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-white text-xl font-bold">{customer.visitCount}</p>
              <p className="text-slate-400 text-xs">
                {locale === 'ar-SA' ? 'زيارة' : 'Visits'}
              </p>
            </div>
            <div>
              <p className="text-white text-xl font-bold">{customer.totalSpend.toFixed(0)}</p>
              <p className="text-slate-400 text-xs">SAR</p>
            </div>
            <div>
              <p className="text-emerald-400 text-xl font-bold">
                {customer.totalSpend > 0 ? (customer.totalSpend / customer.visitCount).toFixed(0) : 0}
              </p>
              <p className="text-slate-400 text-xs">
                {locale === 'ar-SA' ? 'متوسط' : 'Avg'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {unlockedRewards.length > 0 && (
        <div>
          <h3 className={`text-white font-semibold mb-3 flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Gift className="w-5 h-5 text-emerald-400" />
            {locale === 'ar-SA' ? 'المكافآت المتاحة' : 'Available Rewards'}
          </h3>
          <div className="space-y-2">
            {unlockedRewards.map((reward, idx) => (
              <Card key={idx} className="bg-emerald-500/10 border-emerald-500/30">
                <CardContent className="p-4">
                  <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <span className="text-2xl">{reward.icon}</span>
                      <div className={isRTL ? 'text-right' : 'text-left'}>
                        <p className="text-white font-medium">{reward.reward}</p>
                        <p className="text-emerald-400 text-sm">{reward.points} {locale === 'ar-SA' ? 'نقطة' : 'pts'}</p>
                      </div>
                    </div>
                    <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white">
                      {locale === 'ar-SA' ? 'استخدم' : 'Use'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {upcomingRewards.length > 0 && (
        <div>
          <h3 className={`text-white font-semibold mb-3 flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Star className="w-5 h-5 text-amber-400" />
            {locale === 'ar-SA' ? 'المكافآت القادمة' : 'Upcoming Rewards'}
          </h3>
          <div className="space-y-2">
            {upcomingRewards.slice(0, 3).map((reward, idx) => (
              <Card key={idx} className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-4">
                  <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <span className="text-2xl opacity-50">{reward.icon}</span>
                      <div className={isRTL ? 'text-right' : 'text-left'}>
                        <p className="text-slate-300 font-medium">{reward.reward}</p>
                        <p className="text-slate-500 text-sm">{reward.points} {locale === 'ar-SA' ? 'نقطة' : 'pts'}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-500" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
