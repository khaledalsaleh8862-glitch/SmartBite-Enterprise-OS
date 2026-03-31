'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  CreditCard,
  Wallet,
  Building2,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  PieChart as PieChartIcon,
  BarChart3,
  Activity,
} from 'lucide-react';

interface Account {
  id: string;
  account_code: string;
  account_name: string;
  account_name_ar: string;
  account_type: string;
  balance: number;
}

interface RevenueData {
  date: string;
  order_count: number;
  gross_revenue: number;
  tax_collected: number;
  discounts_given: number;
  net_revenue: number;
}

interface TopProduct {
  id: string;
  name_en: string;
  name_ar: string;
  total_sold: number;
  total_revenue: number;
  profit_margin: number;
}

interface DashboardMetrics {
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  revenueGrowth: number;
  topCategory: string;
  topCategoryRevenue: number;
}

const CHART_COLORS = {
  amber: ['#F59E0B', '#D97706', '#B45309', '#92400E', '#78350F'],
  obsidian: ['#1F2937', '#374151', '#4B5563', '#6B7280', '#9CA3AF'],
  status: {
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    info: '#3B82F6',
  },
};

const formatCurrency = (value: number, locale = 'en-US', currency = 'SAR') => {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(value);
};

const formatNumber = (value: number) => {
  return new Intl.NumberFormat('en-US').format(value);
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/95 border border-amber-500/20 rounded-lg p-3 shadow-xl">
        <p className="text-amber-400 font-semibold mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-slate-200 text-sm" style={{ color: entry.color }}>
            {entry.name}: {typeof entry.value === 'number' ? formatCurrency(entry.value) : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const MetricCard = ({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  locale = 'en-US',
}: {
  title: string;
  value: number;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  icon: React.ElementType;
  locale?: string;
}) => {
  const isRTL = locale === 'ar-SA';
  return (
    <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-amber-500/20 overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className={`flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>
            <p className="text-slate-400 text-sm font-medium mb-1">{title}</p>
            <p className="text-2xl font-bold text-white">{formatCurrency(value)}</p>
            <div className={`flex items-center mt-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              {changeType === 'increase' ? (
                <ArrowUpRight className="w-4 h-4 text-emerald-400 mr-1" />
              ) : changeType === 'decrease' ? (
                <ArrowDownRight className="w-4 h-4 text-red-400 mr-1" />
              ) : null}
              <span
                className={`text-sm font-medium ${
                  changeType === 'increase'
                    ? 'text-emerald-400'
                    : changeType === 'decrease'
                    ? 'text-red-400'
                    : 'text-slate-400'
                }`}
              >
                {change > 0 ? '+' : ''}
                {change.toFixed(1)}%
              </span>
              <span className="text-slate-500 text-sm mr-2">vs last period</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center">
            <Icon className="w-6 h-6 text-amber-400" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const AccountRow = ({ account, isRTL }: { account: Account; isRTL: boolean }) => {
  const isAsset = account.account_type === 'asset' || account.account_type === 'revenue';
  return (
    <div className={`flex items-center justify-between p-4 rounded-lg bg-slate-800/50 border border-slate-700/50 ${isRTL ? 'flex-row-reverse' : ''}`}>
      <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
          account.account_type === 'asset' ? 'bg-emerald-500/20' :
          account.account_type === 'revenue' ? 'bg-amber-500/20' :
          account.account_type === 'expense' ? 'bg-red-500/20' :
          'bg-blue-500/20'
        }`}>
          {account.account_type === 'asset' && <Wallet className="w-5 h-5 text-emerald-400" />}
          {account.account_type === 'revenue' && <TrendingUp className="w-5 h-5 text-amber-400" />}
          {account.account_type === 'expense' && <TrendingDown className="w-5 h-5 text-red-400" />}
          {account.account_type === 'liability' && <Building2 className="w-5 h-5 text-blue-400" />}
        </div>
        <div className={isRTL ? 'text-right' : 'text-left'}>
          <p className="text-white font-medium">{account.account_name}</p>
          <p className="text-slate-400 text-sm">{account.account_code}</p>
        </div>
      </div>
      <div className={isRTL ? 'text-left' : 'text-right'}>
        <p className={`text-lg font-bold ${isAsset ? 'text-emerald-400' : 'text-slate-300'}`}>
          {formatCurrency(account.balance)}
        </p>
        <Badge variant="outline" className="border-slate-600 text-slate-400">
          {account.account_type}
        </Badge>
      </div>
    </div>
  );
};

const mockAccounts: Account[] = [
  { id: '1', account_code: '1000', account_name: 'Cash', account_name_ar: 'النقدية', account_type: 'asset', balance: 125000 },
  { id: '2', account_code: '1100', account_name: 'Accounts Receivable', account_name_ar: 'الحسابات المدينة', account_type: 'asset', balance: 45000 },
  { id: '3', account_code: '1200', account_name: 'Inventory', account_name_ar: 'المخزون', account_type: 'asset', balance: 78000 },
  { id: '4', account_code: '4000', account_name: 'Sales Revenue', account_name_ar: 'إيرادات المبيعات', account_type: 'revenue', balance: 450000 },
  { id: '5', account_code: '5000', account_name: 'Cost of Goods Sold', account_name_ar: 'تكلفة البضاعة المباعة', account_type: 'expense', balance: 180000 },
];

const mockRevenueData: RevenueData[] = [
  { date: '2026-03-24', order_count: 145, gross_revenue: 28450, tax_collected: 4267, discounts_given: 1200, net_revenue: 23000 },
  { date: '2026-03-25', order_count: 168, gross_revenue: 32100, tax_collected: 4815, discounts_given: 1500, net_revenue: 26000 },
  { date: '2026-03-26', order_count: 132, gross_revenue: 25800, tax_collected: 3870, discounts_given: 980, net_revenue: 21000 },
  { date: '2026-03-27', order_count: 189, gross_revenue: 36200, tax_collected: 5430, discounts_given: 1800, net_revenue: 29000 },
  { date: '2026-03-28', order_count: 201, gross_revenue: 38900, tax_collected: 5835, discounts_given: 2100, net_revenue: 31000 },
  { date: '2026-03-29', order_count: 178, gross_revenue: 34200, tax_collected: 5130, discounts_given: 1650, net_revenue: 27400 },
  { date: '2026-03-30', order_count: 156, gross_revenue: 29500, tax_collected: 4425, discounts_given: 1400, net_revenue: 24000 },
];

const mockTopProducts: TopProduct[] = [
  { id: '1', name_en: 'Arabic Coffee', name_ar: 'قهوة عربية', total_sold: 1250, total_revenue: 62500, profit_margin: 72.5 },
  { id: '2', name_en: 'Zaatar Manakish', name_ar: 'مناقيش زعتر', total_sold: 890, total_revenue: 44500, profit_margin: 68.2 },
  { id: '3', name_en: 'Labneh Sandwich', name_ar: 'ساندويتش لبنة', total_sold: 720, total_revenue: 36000, profit_margin: 65.8 },
  { id: '4', name_en: 'Fresh Lime', name_ar: 'ليموناضة', total_sold: 980, total_revenue: 29400, profit_margin: 75.3 },
  { id: '5', name_en: 'Cheese Fatayer', name_ar: 'فطاير جبن', total_sold: 540, total_revenue: 27000, profit_margin: 62.1 },
];

const mockAIInsights = {
  forecast: 'Based on the last 30 days analysis, sales are expected to increase by 15% next week. Peak hours predicted: 12:00-2:00 PM',
  menuEngineering: {
    stars: 3,
    puzzles: 2,
    dogs: 1,
  },
};

export default function AccountingDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const { t, isRTL, locale } = useLanguage();

  const { data: accounts = mockAccounts, isLoading: accountsLoading } = useQuery({
    queryKey: ['accounts'],
    queryFn: async () => {
      const response = await fetch('/api/accounting/accounts');
      if (!response.ok) return mockAccounts;
      return response.json();
    },
  });

  const { data: revenueData = mockRevenueData, isLoading: revenueLoading } = useQuery({
    queryKey: ['revenue', selectedPeriod],
    queryFn: async () => {
      const response = await fetch(`/api/accounting/revenue?period=${selectedPeriod}`);
      if (!response.ok) return mockRevenueData;
      return response.json();
    },
  });

  const { data: topProducts = mockTopProducts, isLoading: productsLoading } = useQuery({
    queryKey: ['topProducts'],
    queryFn: async () => {
      const response = await fetch('/api/accounting/top-products');
      if (!response.ok) return mockTopProducts;
      return response.json();
    },
  });

  const metrics = useMemo<DashboardMetrics>(() => {
    if (revenueData.length === 0) {
      return {
        totalRevenue: 0,
        totalOrders: 0,
        avgOrderValue: 0,
        revenueGrowth: 0,
        topCategory: 'N/A',
        topCategoryRevenue: 0,
      };
    }

    const totalRevenue = revenueData.reduce((sum: number, d: RevenueData) => sum + d.net_revenue, 0);
    const totalOrders = revenueData.reduce((sum: number, d: RevenueData) => sum + d.order_count, 0);
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const midPoint = Math.floor(revenueData.length / 2);
    const firstHalf = revenueData.slice(0, midPoint);
    const secondHalf = revenueData.slice(midPoint);
    const firstHalfRevenue = firstHalf.reduce((sum: number, d: RevenueData) => sum + d.net_revenue, 0);
    const secondHalfRevenue = secondHalf.reduce((sum: number, d: RevenueData) => sum + d.net_revenue, 0);
    const revenueGrowth = firstHalfRevenue > 0 ? ((secondHalfRevenue - firstHalfRevenue) / firstHalfRevenue) * 100 : 0;

    return {
      totalRevenue,
      totalOrders,
      avgOrderValue,
      revenueGrowth,
      topCategory: topProducts[0]?.name_en || 'N/A',
      topCategoryRevenue: topProducts[0]?.total_revenue || 0,
    };
  }, [revenueData, topProducts]);

  const pieChartData = useMemo(() => {
    const categoryMap = new Map<string, number>();
    topProducts.forEach((product: TopProduct) => {
      const current = categoryMap.get(product.name_en) || 0;
      categoryMap.set(product.name_en, current + product.total_revenue);
    });
    return Array.from(categoryMap.entries()).map(([name, value]) => ({ name, value }));
  }, [topProducts]);

  const chartData = useMemo(() => {
    return revenueData.map((d: RevenueData) => ({
      ...d,
      date: new Date(d.date).toLocaleDateString(locale === 'ar-SA' ? 'ar-SA' : 'en-US', {
        month: 'short',
        day: 'numeric',
      }),
    }));
  }, [revenueData, locale]);

  return (
    <div className={`min-h-screen bg-slate-950 p-6`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className={`flex flex-col md:flex-row md:items-center md:justify-between gap-4 ${isRTL ? 'text-right' : 'text-left'}`}>
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              {t('accounting.title')}
            </h1>
            <p className="text-slate-400 mt-1">
              {t('accounting.subtitle')}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-36 bg-slate-800 border-slate-700 text-white">
                <Calendar className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">{t('accounting.24h')}</SelectItem>
                <SelectItem value="7d">{t('accounting.7d')}</SelectItem>
                <SelectItem value="30d">{t('accounting.30d')}</SelectItem>
                <SelectItem value="90d">{t('accounting.90d')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title={t('accounting.totalRevenue')}
            value={metrics.totalRevenue}
            change={metrics.revenueGrowth}
            changeType={metrics.revenueGrowth >= 0 ? 'increase' : 'decrease'}
            icon={DollarSign}
            locale={locale}
          />
          <MetricCard
            title={t('accounting.totalOrders')}
            value={metrics.totalOrders}
            change={8.2}
            changeType="increase"
            icon={CreditCard}
            locale={locale}
          />
          <MetricCard
            title={t('accounting.avgOrderValue')}
            value={metrics.avgOrderValue}
            change={3.5}
            changeType="increase"
            icon={Wallet}
            locale={locale}
          />
          <MetricCard
            title={t('accounting.topCategory')}
            value={metrics.topCategoryRevenue}
            change={12.1}
            changeType="increase"
            icon={TrendingUp}
            locale={locale}
          />
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="bg-slate-800 border border-slate-700">
            <TabsTrigger value="overview" className="data-[state=active]:bg-amber-500 data-[state=active]:text-white">
              <BarChart3 className="w-4 h-4 mr-2" />
              {t('accounting.overview')}
            </TabsTrigger>
            <TabsTrigger value="accounts" className="data-[state=active]:bg-amber-500 data-[state=active]:text-white">
              <Building2 className="w-4 h-4 mr-2" />
              {t('accounting.accounts')}
            </TabsTrigger>
            <TabsTrigger value="products" className="data-[state=active]:bg-amber-500 data-[state=active]:text-white">
              <PieChartIcon className="w-4 h-4 mr-2" />
              {t('accounting.products')}
            </TabsTrigger>
            <TabsTrigger value="insights" className="data-[state=active]:bg-amber-500 data-[state=active]:text-white">
              <Activity className="w-4 h-4 mr-2" />
              {t('accounting.aiInsights')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="bg-slate-900 border-amber-500/20">
                <CardHeader>
                  <CardTitle className="text-white">{t('accounting.dailyRevenue')}</CardTitle>
                  <CardDescription className="text-slate-400">
                    {t('accounting.dailyRevenueDesc')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {revenueLoading ? (
                    <Skeleton className="h-64 bg-slate-800" />
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
                        <YAxis stroke="#9CA3AF" fontSize={12} tickFormatter={(v) => `$${v}`} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                          type="monotone"
                          dataKey="net_revenue"
                          stroke="#F59E0B"
                          strokeWidth={2}
                          fill="url(#revenueGradient)"
                          name={t('accounting.netRevenue')}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-slate-900 border-amber-500/20">
                <CardHeader>
                  <CardTitle className="text-white">{t('accounting.ordersSales')}</CardTitle>
                  <CardDescription className="text-slate-400">
                    {t('accounting.ordersSalesDesc')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {revenueLoading ? (
                    <Skeleton className="h-64 bg-slate-800" />
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
                        <YAxis yAxisId="left" stroke="#9CA3AF" fontSize={12} />
                        <YAxis yAxisId="right" orientation={isRTL ? 'left' : 'right'} stroke="#9CA3AF" fontSize={12} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Bar
                          yAxisId="left"
                          dataKey="order_count"
                          fill="#3B82F6"
                          name={t('accounting.orderCount')}
                          radius={[4, 4, 0, 0]}
                        />
                        <Bar
                          yAxisId="right"
                          dataKey="gross_revenue"
                          fill="#10B981"
                          name={t('accounting.grossSales')}
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card className="bg-slate-900 border-amber-500/20">
              <CardHeader>
                <CardTitle className="text-white">{t('accounting.revenueDistribution')}</CardTitle>
              </CardHeader>
              <CardContent>
                {productsLoading ? (
                  <Skeleton className="h-64 bg-slate-800" />
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieChartData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS.amber[index % CHART_COLORS.amber.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="accounts" className="space-y-4">
            <Card className="bg-slate-900 border-amber-500/20">
              <CardHeader>
                <CardTitle className="text-white">{t('accounting.chartOfAccounts')}</CardTitle>
                <CardDescription className="text-slate-400">
                  {t('accounting.chartOfAccountsDesc')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {accountsLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Skeleton key={i} className="h-16 bg-slate-800" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {accounts.map((account: Account) => (
                      <AccountRow key={account.id} account={account} isRTL={isRTL} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="bg-slate-900 border-amber-500/20">
                <CardHeader>
                  <CardTitle className="text-white">{t('accounting.accountsReceivable')}</CardTitle>
                </CardHeader>
                <CardContent>
                  {accountsLoading ? (
                    <Skeleton className="h-32 bg-slate-800" />
                  ) : (
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart
                        data={accounts
                          .filter((a: Account) => a.account_type === 'asset' || a.account_type === 'liability')
                          .map((a: Account) => ({ name: a.account_code, balance: a.balance }))}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="name" stroke="#9CA3AF" />
                        <YAxis stroke="#9CA3AF" tickFormatter={(v) => `$${v}`} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="balance" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-slate-900 border-amber-500/20">
                <CardHeader>
                  <CardTitle className="text-white">{t('accounting.revenueExpenses')}</CardTitle>
                </CardHeader>
                <CardContent>
                  {accountsLoading ? (
                    <Skeleton className="h-32 bg-slate-800" />
                  ) : (
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart
                        data={accounts
                          .filter((a: Account) => a.account_type === 'revenue' || a.account_type === 'expense')
                          .map((a: Account) => ({ name: a.account_code, balance: a.balance }))}
                        layout="vertical"
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis type="number" stroke="#9CA3AF" tickFormatter={(v) => `$${v}`} />
                        <YAxis type="category" dataKey="name" stroke="#9CA3AF" />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="balance" radius={[0, 4, 4, 0]}>
                          {accounts
                            .filter((a: Account) => a.account_type === 'revenue' || a.account_type === 'expense')
                            .map((_a: Account, index: number) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={index % 2 === 0 ? '#10B981' : '#EF4444'}
                              />
                            ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="products" className="space-y-4">
            <Card className="bg-slate-900 border-amber-500/20">
              <CardHeader>
                <CardTitle className="text-white">{t('accounting.topSellingProducts')}</CardTitle>
                <CardDescription className="text-slate-400">
                  {t('accounting.topSellingProductsDesc')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {productsLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Skeleton key={i} className="h-20 bg-slate-800" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {topProducts.map((product: TopProduct, index: number) => (
                      <div
                        key={product.id}
                        className={`flex items-center justify-between p-4 rounded-lg bg-slate-800/50 border border-slate-700/50 ${
                          isRTL ? 'flex-row-reverse' : ''
                        }`}
                      >
                        <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                              index === 0
                                ? 'bg-amber-500 text-white'
                                : index === 1
                                ? 'bg-slate-400 text-white'
                                : index === 2
                                ? 'bg-amber-700 text-white'
                                : 'bg-slate-700 text-slate-300'
                            }`}
                          >
                            #{index + 1}
                          </div>
                          <div className={isRTL ? 'text-right' : 'text-left'}>
                            <p className="text-white font-medium">{isRTL ? product.name_ar : product.name_en}</p>
                            <p className="text-slate-400 text-sm">
                              {formatNumber(product.total_sold)} {t('accounting.unitsSold')}
                            </p>
                          </div>
                        </div>
                        <div className={isRTL ? 'text-left' : 'text-right'}>
                          <p className="text-xl font-bold text-amber-400">{formatCurrency(product.total_revenue)}</p>
                          <Badge
                            className={`${
                              product.profit_margin >= 60
                                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                : product.profit_margin >= 40
                                ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                                : 'bg-red-500/20 text-red-400 border-red-500/30'
                            }`}
                          >
                            {product.profit_margin.toFixed(1)}% {t('accounting.margin')}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-slate-900 border-amber-500/20">
              <CardHeader>
                <CardTitle className="text-white">{t('accounting.profitMarginAnalysis')}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={topProducts.map((p: TopProduct) => ({
                      name: p.name_en.substring(0, 15) + (p.name_en.length > 15 ? '...' : ''),
                      margin: p.profit_margin,
                    }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="name" stroke="#9CA3AF" fontSize={10} />
                    <YAxis stroke="#9CA3AF" tickFormatter={(v) => `${v}%`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="margin" radius={[4, 4, 0, 0]}>
                      {topProducts.map((_: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS.amber[index % CHART_COLORS.amber.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-gradient-to-br from-amber-900/20 to-slate-900 border-amber-500/30">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-amber-400" />
                    </div>
                    <CardTitle className="text-white">{t('accounting.salesForecast')}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-300 leading-relaxed">
                    {mockAIInsights.forecast}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                      {t('accounting.expectedIncrease')}
                    </Badge>
                    <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                      {t('accounting.peakHours')}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-emerald-900/20 to-slate-900 border-emerald-500/30">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <PieChartIcon className="w-4 h-4 text-emerald-400" />
                    </div>
                    <CardTitle className="text-white">{t('accounting.menuEngineering')}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-emerald-400" />
                      <span className="text-slate-300 text-sm">
                        <strong className="text-emerald-400">{t('accounting.stars')}</strong>{' '}
                        {t('accounting.starsDesc')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-amber-400" />
                      <span className="text-slate-300 text-sm">
                        <strong className="text-amber-400">{t('accounting.puzzles')}</strong>{' '}
                        {t('accounting.puzzlesDesc')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-400" />
                      <span className="text-slate-300 text-sm">
                        <strong className="text-red-400">{t('accounting.dogs')}</strong>{' '}
                        {t('accounting.dogsDesc')}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-gradient-to-br from-blue-900/20 to-slate-900 border-blue-500/30">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <Activity className="w-4 h-4 text-blue-400" />
                  </div>
                  <CardTitle className="text-white">{t('accounting.inventoryRecommendations')}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                    <p className="text-red-400 font-medium mb-2">{t('accounting.lowStockAlert')}</p>
                    <p className="text-slate-300 text-sm">
                      {isRTL
                        ? 'القهوة العربية: 2 كجم متبقي (حد أدنى: 5 كجم)'
                        : 'Arabic Coffee: 2kg remaining (min: 5kg)'}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                    <p className="text-amber-400 font-medium mb-2">{t('accounting.reorderSuggested')}</p>
                    <p className="text-slate-300 text-sm">
                      {isRTL
                        ? 'خبز البيتزا: 8 قطع متبقية (الأسبوع القادم: +50%)'
                        : 'Pizza Bread: 8 pieces left (next week: +50%)'}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                    <p className="text-emerald-400 font-medium mb-2">{t('accounting.healthyLevels')}</p>
                    <p className="text-slate-300 text-sm">
                      {t('accounting.cheeseStock')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-900/20 to-slate-900 border-purple-500/30">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <DollarSign className="w-4 h-4 text-purple-400" />
                  </div>
                  <CardTitle className="text-white">{t('accounting.aiPricingOptimization')}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300 leading-relaxed">
                  {isRTL
                    ? 'من خلال تحليل بيانات المنافسين ومرونة السعر، نوصي بزيادة سعر "ساندويتش الريحان" بنسبة 10% لتحسين هامش الربح دون التأثير على الطلب. الطلب المتوقع: -2% فقط.'
                    : 'Based on competitor data analysis and price elasticity, we recommend increasing "Basil Sandwich" price by 10% to improve profit margins without significantly affecting demand. Expected demand change: only -2%.'}
                </p>
                <div className="mt-4">
                  <Button className="bg-purple-500 hover:bg-purple-600 text-white">
                    {t('accounting.applyRecommendation')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}