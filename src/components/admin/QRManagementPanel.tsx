'use client';

import { useState, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Download,
  Plus,
  Trash2,
  Printer,
  QrCode,
  Users,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
} from 'lucide-react';

interface Table {
  id: string;
  tableNumber: string;
  tableName: string;
  capacity: number;
  location: string;
  isActive: boolean;
}

const MOCK_TABLES: Table[] = [
  { id: '1', tableNumber: 'T1', tableName: 'Table 1', capacity: 4, location: 'Indoor Main', isActive: true },
  { id: '2', tableNumber: 'T2', tableName: 'Table 2', capacity: 4, location: 'Indoor Main', isActive: true },
  { id: '3', tableNumber: 'T3', tableName: 'Table 3', capacity: 6, location: 'Indoor Main', isActive: true },
  { id: '4', tableNumber: 'T4', tableName: 'Table 4', capacity: 2, location: 'Window Side', isActive: true },
  { id: '5', tableNumber: 'T5', tableName: 'Table 5', capacity: 4, location: 'Window Side', isActive: true },
  { id: '6', tableNumber: 'T6', tableName: 'Table 6', capacity: 8, location: 'Private Area', isActive: false },
  { id: '7', tableNumber: 'T7', tableName: 'Table 7', capacity: 4, location: 'Outdoor', isActive: true },
  { id: '8', tableNumber: 'T8', tableName: 'Table 8', capacity: 4, location: 'Outdoor', isActive: true },
  { id: '9', tableNumber: 'VIP1', tableName: 'VIP Booth 1', capacity: 6, location: 'VIP Section', isActive: true },
  { id: '10', tableNumber: 'VIP2', tableName: 'VIP Booth 2', capacity: 6, location: 'VIP Section', isActive: true },
];

const QR_CODE_BASE_URL = 'https://smartbite.app/menu?table=';

export default function QRManagementPanel() {
  const { t, isRTL, locale } = useLanguage();
  const [tables, setTables] = useState<Table[]>(MOCK_TABLES);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [newTableNumber, setNewTableNumber] = useState('');
  const [newTableName, setNewTableName] = useState('');
  const [newTableCapacity, setNewTableCapacity] = useState(4);
  const [newTableLocation, setNewTableLocation] = useState('');

  const generateQRUrl = (tableNumber: string) => `${QR_CODE_BASE_URL}${tableNumber}`;

  const handlePrintQR = useCallback((table: Table) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const qrUrl = generateQRUrl(table.tableNumber);
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>SmartBite QR - ${table.tableName}</title>
          <style>
            body {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              font-family: Arial, sans-serif;
            }
            .qr-container {
              border: 4px solid #F59E0B;
              border-radius: 16px;
              padding: 32px;
              text-align: center;
            }
            .logo {
              font-size: 24px;
              font-weight: bold;
              color: #F59E0B;
              margin-bottom: 16px;
            }
            .table-name {
              font-size: 28px;
              font-weight: bold;
              color: #1F2937;
              margin: 16px 0;
            }
            .table-info {
              color: #6B7280;
              margin-bottom: 16px;
            }
          </style>
        </head>
        <body>
          <div class="qr-container">
            <div class="logo">SmartBite</div>
            <div class="table-name">${table.tableName}</div>
            <div class="table-info">${t('kds.table')}: ${table.tableNumber} | ${t('accounting.totalOrders')}: ${table.capacity}</div>
            <div>
              <svg width="200" height="200" data-url="${qrUrl}"></svg>
            </div>
          </div>
          <script src="https://unpkg.com/qrcodejs@1.0.0/qrcode.min.js"><\/script>
          <script>
            new QRCode(document.querySelector('svg'), '${qrUrl}');
          <\/script>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  }, [t]);

  const handleAddTable = () => {
    if (!newTableNumber || !newTableName) return;

    const newTable: Table = {
      id: Date.now().toString(),
      tableNumber: newTableNumber,
      tableName: newTableName,
      capacity: newTableCapacity,
      location: newTableLocation || 'Main Hall',
      isActive: true,
    };

    setTables([...tables, newTable]);
    setNewTableNumber('');
    setNewTableName('');
    setNewTableCapacity(4);
    setNewTableLocation('');
  };

  const handleDeleteTable = (tableId: string) => {
    setTables(tables.filter(t => t.id !== tableId));
  };

  const handleToggleActive = (tableId: string) => {
    setTables(tables.map(t =>
      t.id === tableId ? { ...t, isActive: !t.isActive } : t
    ));
  };

  const getQRCodeSize = () => {
    if (typeof window === 'undefined') return 128;
    return window.innerWidth < 640 ? 160 : 200;
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className={`flex flex-col md:flex-row md:items-center md:justify-between gap-4 ${isRTL ? 'text-right' : 'text-left'}`}>
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center">
                <QrCode className="w-6 h-6 text-white" />
              </div>
              {t('admin.qrManagement')}
            </h1>
            <p className="text-slate-400 mt-1">
              {locale === 'ar-SA' ? 'إنشاء وإدارة رموز QR للطاولات' : 'Create and manage QR codes for tables'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Dialog open={showQRModal} onOpenChange={setShowQRModal}>
              <DialogTrigger asChild>
                <Button className="bg-amber-500 hover:bg-amber-600 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  {locale === 'ar-SA' ? 'إضافة طاولة' : 'Add Table'}
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-900 border-slate-700">
                <DialogHeader>
                  <DialogTitle className="text-white">
                    {locale === 'ar-SA' ? 'إضافة طاولة جديدة' : 'Add New Table'}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-slate-400 text-sm block mb-1">{locale === 'ar-SA' ? 'رقم الطاولة' : 'Table Number'}</label>
                      <Input
                        value={newTableNumber}
                        onChange={(e) => setNewTableNumber(e.target.value)}
                        placeholder="T1"
                        className="bg-slate-800 border-slate-700 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 text-sm block mb-1">{locale === 'ar-SA' ? 'اسم الطاولة' : 'Table Name'}</label>
                      <Input
                        value={newTableName}
                        onChange={(e) => setNewTableName(e.target.value)}
                        placeholder={locale === 'ar-SA' ? 'طاولة 1' : 'Table 1'}
                        className="bg-slate-800 border-slate-700 text-white"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-slate-400 text-sm block mb-1">{locale === 'ar-SA' ? 'السعة' : 'Capacity'}</label>
                      <Input
                        type="number"
                        value={newTableCapacity}
                        onChange={(e) => setNewTableCapacity(parseInt(e.target.value) || 4)}
                        className="bg-slate-800 border-slate-700 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 text-sm block mb-1">{locale === 'ar-SA' ? 'الموقع' : 'Location'}</label>
                      <Input
                        value={newTableLocation}
                        onChange={(e) => setNewTableLocation(e.target.value)}
                        placeholder={locale === 'ar-SA' ? 'القاعة الرئيسية' : 'Main Hall'}
                        className="bg-slate-800 border-slate-700 text-white"
                      />
                    </div>
                  </div>
                  <Button onClick={handleAddTable} className="w-full bg-amber-500 hover:bg-amber-600 text-white">
                    {locale === 'ar-SA' ? 'إضافة' : 'Add Table'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Tabs defaultValue="all" className="space-y-4">
          <TabsList className="bg-slate-800 border border-slate-700">
            <TabsTrigger value="all" className="data-[state=active]:bg-amber-500 data-[state=active]:text-white">
              {locale === 'ar-SA' ? 'الكل' : 'All Tables'}
            </TabsTrigger>
            <TabsTrigger value="active" className="data-[state=active]:bg-amber-500 data-[state=active]:text-white">
              <CheckCircle className="w-4 h-4 mr-1" />
              {locale === 'ar-SA' ? 'نشطة' : 'Active'}
            </TabsTrigger>
            <TabsTrigger value="inactive" className="data-[state=active]:bg-amber-500 data-[state=active]:text-white">
              <XCircle className="w-4 h-4 mr-1" />
              {locale === 'ar-SA' ? 'غير نشطة' : 'Inactive'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {tables.map((table) => (
                <TableQRCard
                  key={table.id}
                  table={table}
                  onPrint={() => { setSelectedTable(table); handlePrintQR(table); }}
                  onDelete={() => handleDeleteTable(table.id)}
                  onToggle={() => handleToggleActive(table.id)}
                  isRTL={isRTL}
                  locale={locale}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="active" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {tables.filter(t => t.isActive).map((table) => (
                <TableQRCard
                  key={table.id}
                  table={table}
                  onPrint={() => { setSelectedTable(table); handlePrintQR(table); }}
                  onDelete={() => handleDeleteTable(table.id)}
                  onToggle={() => handleToggleActive(table.id)}
                  isRTL={isRTL}
                  locale={locale}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="inactive" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {tables.filter(t => !t.isActive).map((table) => (
                <TableQRCard
                  key={table.id}
                  table={table}
                  onPrint={() => { setSelectedTable(table); handlePrintQR(table); }}
                  onDelete={() => handleDeleteTable(table.id)}
                  onToggle={() => handleToggleActive(table.id)}
                  isRTL={isRTL}
                  locale={locale}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function TableQRCard({
  table,
  onPrint,
  onDelete,
  onToggle,
  isRTL,
  locale,
}: {
  table: Table;
  onPrint: () => void;
  onDelete: () => void;
  onToggle: () => void;
  isRTL: boolean;
  locale: string;
}) {
  const qrUrl = `https://smartbite.app/menu?table=${table.tableNumber}`;

  return (
    <Card className={`bg-slate-900 border-amber-500/20 ${!table.isActive ? 'opacity-60' : ''}`}>
      <CardHeader className="pb-2">
        <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
          <CardTitle className="text-white text-lg">{table.tableName}</CardTitle>
          <Badge className={table.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}>
            {table.isActive ? (locale === 'ar-SA' ? 'نشطة' : 'Active') : (locale === 'ar-SA' ? 'غير نشطة' : 'Inactive')}
          </Badge>
        </div>
        <CardDescription className="text-slate-400">
          {locale === 'ar-SA' ? 'الموقع' : 'Location'}: {table.location} | {locale === 'ar-SA' ? 'السعة' : 'Capacity'}: {table.capacity}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center bg-white p-4 rounded-lg">
          <QRCodeSVG
            value={qrUrl}
            size={120}
            level="H"
            includeMargin
          />
        </div>
        <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <Button
            onClick={onPrint}
            variant="outline"
            size="sm"
            className="flex-1 border-amber-500/50 text-amber-400 hover:bg-amber-500/10"
          >
            <Printer className="w-4 h-4 mr-1" />
            {locale === 'ar-SA' ? 'طباعة' : 'Print'}
          </Button>
          <Button
            onClick={onToggle}
            variant="outline"
            size="sm"
            className={`flex-1 ${table.isActive ? 'border-red-500/50 text-red-400 hover:bg-red-500/10' : 'border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10'}`}
          >
            {table.isActive ? (locale === 'ar-SA' ? 'إلغاء تفعيل' : 'Deactivate') : (locale === 'ar-SA' ? 'تفعيل' : 'Activate')}
          </Button>
          <Button
            onClick={onDelete}
            variant="outline"
            size="sm"
            className="border-red-500/50 text-red-400 hover:bg-red-500/10"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
