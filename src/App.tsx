import { useState } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useLanguage } from './contexts/LanguageContext'
import AccountingDashboard from './components/accounting/AccountingDashboard'
import CustomerTerminal from './components/customer/CustomerTerminal'
import POSCommandCenter from './components/pos/POSCommandCenter'
import KitchenDisplaySystem from './components/kitchen/KDS'
import AdminCommandCenter from './components/admin/AdminCommandCenter'
import CustomerLayout from './components/customer/CustomerLayout'

type View = 'accounting' | 'customer' | 'pos' | 'kds' | 'admin'

function AdminLayout() {
  const { locale, setLocale, t } = useLanguage()
  const [activeView, setActiveView] = useState<View>('accounting')

  const handleLocaleToggle = () => {
    setLocale(locale === 'en-US' ? 'ar-SA' : 'en-US')
  }

  return (
    <div className="min-h-screen bg-slate-950" dir={locale === 'ar-SA' ? 'rtl' : 'ltr'}>
      <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center">
                <span className="text-white font-bold text-sm">SB</span>
              </div>
              <span className="text-white font-semibold">{t('nav.smartbite')}</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleLocaleToggle}
                className="px-3 py-1.5 rounded bg-amber-500 text-white text-sm hover:bg-amber-600 font-medium"
              >
                {locale === 'en-US' ? 'عربي' : 'EN'}
              </button>
              <button
                onClick={() => setActiveView('accounting')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeView === 'accounting'
                    ? 'bg-amber-500 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <span className="hidden md:inline">{t('nav.accounting')}</span>
                <span className="md:hidden">{t('nav.short')}</span>
              </button>
              <button
                onClick={() => setActiveView('customer')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeView === 'customer'
                    ? 'bg-amber-500 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <span className="hidden md:inline">{t('nav.customer')}</span>
                <span className="md:hidden">{t('nav.customerShort')}</span>
              </button>
              <button
                onClick={() => setActiveView('pos')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeView === 'pos'
                    ? 'bg-amber-500 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <span className="hidden md:inline">{t('nav.pos')}</span>
                <span className="md:hidden">{t('nav.posShort')}</span>
              </button>
              <button
                onClick={() => setActiveView('kds')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeView === 'kds'
                    ? 'bg-amber-500 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <span className="hidden md:inline">{t('nav.kds')}</span>
                <span className="md:hidden">{t('nav.kdsShort')}</span>
              </button>
              <button
                onClick={() => setActiveView('admin')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeView === 'admin'
                    ? 'bg-amber-500 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <span className="hidden md:inline">{locale === 'ar-SA' ? 'لوحة التحكم' : 'Admin'}</span>
                <span className="md:hidden">{locale === 'ar-SA' ? 'إداري' : 'ADM'}</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {activeView === 'accounting' && <AccountingDashboard />}
      {activeView === 'customer' && <CustomerTerminal />}
      {activeView === 'pos' && <POSCommandCenter />}
      {activeView === 'kds' && <KitchenDisplaySystem />}
      {activeView === 'admin' && <AdminCommandCenter />}
    </div>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<AdminLayout />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminCommandCenter />} />
        <Route path="orders" element={<AdminCommandCenter />} />
        <Route path="customers" element={<AdminCommandCenter />} />
        <Route path="qr" element={<AdminCommandCenter />} />
        <Route path="analytics" element={<AdminCommandCenter />} />
      </Route>
      <Route path="/accounting" element={<AdminLayout />} />
      <Route path="/pos" element={<AdminLayout />} />
      <Route path="/kds" element={<AdminLayout />} />
      <Route path="/kitchen" element={<AdminLayout />} />
      <Route path="/menu/:tableId" element={<CustomerLayout />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
