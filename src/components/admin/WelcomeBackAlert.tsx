'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Bell,
  X,
  User,
  Crown,
  Star,
  Phone,
  Clock,
  CreditCard,
  TrendingUp,
} from 'lucide-react';

interface WelcomeNotification {
  id: string;
  customerId: string;
  customerName: string;
  customerNameAr: string;
  tier: string;
  visitCount: number;
  tableNumber: string;
  timestamp: Date;
  isRead: boolean;
}

interface WelcomeBackAlertProps {
  notifications: WelcomeNotification[];
  onMarkAsRead: (id: string) => void;
  onClearAll: () => void;
}

const TIER_COLORS: Record<string, string> = {
  Regular: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
  Silver: 'bg-gray-400/20 text-gray-300 border-gray-400/30',
  Gold: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  VIP: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
};

export function WelcomeBackAlert({ notifications, onMarkAsRead, onClearAll }: WelcomeBackAlertProps) {
  const { t, isRTL, locale } = useLanguage();
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        className="relative border-amber-500/50 text-amber-400 hover:bg-amber-500/10"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </Button>

      <AnimatePresence>
        {notifications.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-full mt-2 right-0 w-80 z-50"
            dir={isRTL ? 'rtl' : 'ltr'}
          >
            <Card className="bg-slate-900 border-amber-500/30 shadow-xl">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white text-sm flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-400" />
                    {locale === 'ar-SA' ? 'إشعارات الضيوف' : 'Guest Alerts'}
                  </CardTitle>
                  {notifications.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onClearAll}
                      className="text-slate-400 hover:text-white text-xs"
                    >
                      {locale === 'ar-SA' ? 'مسح الكل' : 'Clear All'}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-2 max-h-96 overflow-y-auto">
                {notifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={onMarkAsRead}
                    isRTL={isRTL}
                    locale={locale}
                  />
                ))}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NotificationItem({
  notification,
  onMarkAsRead,
  isRTL,
  locale,
}: {
  notification: WelcomeNotification;
  onMarkAsRead: (id: string) => void;
  isRTL: boolean;
  locale: string;
}) {
  const tierColor = TIER_COLORS[notification.tier] || TIER_COLORS.Regular;

  return (
    <motion.div
      initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: isRTL ? 20 : -20 }}
      className={`p-3 rounded-lg bg-slate-800/80 border border-slate-700/50 ${
        !notification.isRead ? 'border-amber-500/30' : ''
      }`}
    >
      <div className={`flex items-start justify-between gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <div className={`flex items-start gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center flex-shrink-0">
            <span className="text-lg">👋</span>
          </div>
          <div className={isRTL ? 'text-right' : 'text-left'}>
            <p className="text-white text-sm font-medium">
              {locale === 'ar-SA'
                ? `مرحباً بعودتك ${notification.customerNameAr}!`
                : `Welcome back ${notification.customerName}!`}
            </p>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <Badge className={tierColor}>
                {notification.tier === 'VIP' && <Crown className="w-3 h-3 mr-1" />}
                {notification.tier === 'Gold' && <Star className="w-3 h-3 mr-1" />}
                {notification.tier}
              </Badge>
              <span className="text-slate-400 text-xs flex items-center gap-1">
                <User className="w-3 h-3" />
                {notification.visitCount} {locale === 'ar-SA' ? 'زيارة' : 'visits'}
              </span>
              <span className="text-slate-400 text-xs flex items-center gap-1">
                <Bell className="w-3 h-3" />
                {notification.tableNumber && `${locale === 'ar-SA' ? 'طاولة' : 'Table'} ${notification.tableNumber}`}
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={() => onMarkAsRead(notification.id)}
          className="text-slate-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}

export function useWelcomeNotifications() {
  const [notifications, setNotifications] = useState<WelcomeNotification[]>([]);

  const addNotification = useCallback((customer: {
    id: string;
    nameEn: string;
    nameAr: string;
    tier: string;
    visitCount: number;
    tableNumber?: string;
  }) => {
    const notification: WelcomeNotification = {
      id: Date.now().toString(),
      customerId: customer.id,
      customerName: customer.nameEn,
      customerNameAr: customer.nameAr,
      tier: customer.tier,
      visitCount: customer.visitCount,
      tableNumber: customer.tableNumber || '',
      timestamp: new Date(),
      isRead: false,
    };

    setNotifications(prev => [notification, ...prev].slice(0, 10));
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    notifications,
    addNotification,
    markAsRead,
    clearAll,
  };
}

export function CustomerAnalyticsSummary({ customer }: { customer: WelcomeNotification }) {
  const { locale } = useLanguage();

  return (
    <Card className="bg-slate-900 border-slate-700">
      <CardHeader className="pb-2">
        <CardTitle className="text-white text-sm flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-amber-400" />
          {locale === 'ar-SA' ? 'تحليل العميل' : 'Customer Analytics'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-sm flex items-center gap-1">
              <Phone className="w-4 h-4" />
              {locale === 'ar-SA' ? 'رقم الهاتف' : 'Phone'}
            </span>
            <span className="text-white text-sm">+966 XXX-XXXX</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-sm flex items-center gap-1">
              <CreditCard className="w-4 h-4" />
              {locale === 'ar-SA' ? 'إجمالي الإنفاق' : 'Total Spend'}
            </span>
            <span className="text-emerald-400 text-sm font-medium">1,250 SAR</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-sm flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {locale === 'ar-SA' ? 'آخر زيارة' : 'Last Visit'}
            </span>
            <span className="text-slate-300 text-sm">2026-03-28</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
