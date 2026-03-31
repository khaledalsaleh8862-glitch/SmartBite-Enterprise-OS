'use client';

import { useState, useCallback } from 'react';
import { useParams, Outlet } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Plus,
  Minus,
  Search,
  Flame,
  Leaf,
  Star,
} from 'lucide-react';

interface MenuItem {
  id: string;
  name_en: string;
  name_ar: string;
  description_en?: string;
  description_ar?: string;
  price: number;
  category: string;
  emoji: string;
  prep_time: number;
  calories?: number;
  is_popular?: boolean;
  is_vegetarian?: boolean;
  is_spicy?: boolean;
}

interface CartItem {
  id: string;
  name_en: string;
  name_ar: string;
  price: number;
  quantity: number;
  emoji: string;
}

const MOCK_MENU_ITEMS: MenuItem[] = [
  { id: '1', name_en: 'Arabic Coffee', name_ar: 'قهوة عربية', description_en: 'Traditional Saudi Arabic coffee', description_ar: 'قهوة عربية تقليدية', price: 8, category: 'Hot Drinks', emoji: '☕', prep_time: 5, calories: 50, is_popular: true },
  { id: '2', name_en: 'Zaatar Manakish', name_ar: 'مناقيش زعتر', description_en: 'Fresh zaatar on baked bread', description_ar: 'زعتر طازج على خبز مخبوز', price: 12, category: 'Breakfast', emoji: '🥙', prep_time: 10, calories: 280, is_popular: true, is_vegetarian: true },
  { id: '3', name_en: 'Labneh Sandwich', name_ar: 'ساندويتش لبنة', description_en: 'Creamy labneh with vegetables', description_ar: 'لبنة كريمية مع خضروات', price: 18, category: 'Breakfast', emoji: '🥪', prep_time: 8, calories: 350, is_popular: true },
  { id: '4', name_en: 'Fresh Lime', name_ar: 'ليموناضة', description_en: 'Freshly squeezed lime with mint', description_ar: 'ليمون طازج مع نعناع', price: 10, category: 'Cold Drinks', emoji: '🍋', prep_time: 3, calories: 60, is_vegetarian: true },
  { id: '5', name_en: 'Cheese Fatayer', name_ar: 'فطاير جبن', description_en: 'Cheese filled pastries', description_ar: 'فطاير محشوة جبن', price: 15, category: 'Snacks', emoji: '🥧', prep_time: 12, calories: 320, is_popular: true },
  { id: '6', name_en: 'Mixed Grill', name_ar: 'مشاوي مشكلة', description_en: 'Assorted grilled meats', description_ar: 'مجموعة مشاوي مشكلة', price: 65, category: 'Main Course', emoji: '🍖', prep_time: 20, calories: 850 },
  { id: '7', name_en: 'Kunafa', name_ar: 'كنافة', description_en: 'Traditional cheese kunafa', description_ar: 'كنافة جبن تقليدية', price: 25, category: 'Desserts', emoji: '🍮', prep_time: 15, calories: 450, is_popular: true },
  { id: '8', name_en: 'Hummus', name_ar: 'حمص', description_en: 'Classic chickpea dip', description_ar: 'حمص بالطحينة الكلاسيكي', price: 12, category: 'Appetizers', emoji: '🫘', prep_time: 5, calories: 180, is_vegetarian: true, is_popular: true },
  { id: '9', name_en: 'Mandi Chicken', name_ar: 'دجاج مندي', description_en: 'Yemeni style rice with chicken', description_ar: 'أرز مع دجاج على الطريقة اليمنية', price: 45, category: 'Main Course', emoji: '🍗', prep_time: 25, calories: 720 },
  { id: '10', name_en: 'Fresh Juice', name_ar: 'عصير طازج', description_en: 'Seasonal fresh fruit juice', description_ar: 'عصير فواكه طازج', price: 14, category: 'Cold Drinks', emoji: '🍹', prep_time: 5, calories: 120, is_vegetarian: true },
  { id: '11', name_en: 'Shawarma Plate', name_ar: 'شاورما بلات', description_en: 'Mixed meat shawarma with rice', description_ar: 'شاورما مختلطة مع أرز', price: 38, category: 'Main Course', emoji: '🥙', prep_time: 15, calories: 680 },
  { id: '12', name_en: 'Baklava', name_ar: 'بقلاوة', description_en: 'Mixed nuts baklava', description_ar: 'بقلاوة مكسرات مشكلة', price: 8, category: 'Desserts', emoji: '🥮', prep_time: 3, calories: 200 },
];

const CATEGORIES = ['All', 'Hot Drinks', 'Cold Drinks', 'Breakfast', 'Snacks', 'Appetizers', 'Main Course', 'Desserts'];

interface CustomerMenuProps {
  cart: CartItem[];
  onAddToCart: (item: MenuItem) => void;
  onRemoveFromCart: (itemId: string) => void;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
}

export default function CustomerMenu({ cart, onAddToCart, onRemoveFromCart, onUpdateQuantity }: CustomerMenuProps) {
  const { tableId } = useParams();
  const { t, isRTL, locale } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredItems = MOCK_MENU_ITEMS.filter(item => {
    const matchesSearch = item.name_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.name_ar.includes(searchTerm);
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const getCartQuantity = (itemId: string) => {
    const cartItem = cart.find(i => i.id === itemId);
    return cartItem ? cartItem.quantity : 0;
  };

  return (
    <div className="p-4 space-y-4">
      <div className="sticky top-0 bg-slate-950 z-10 pb-2">
        <div className="relative">
          <Search className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 ${isRTL ? 'right-3' : 'left-3'}`} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={locale === 'ar-SA' ? 'ابحث عن منتج...' : 'Search menu...'}
            className={`w-full py-3 px-12 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-400 ${
              isRTL ? 'text-right pr-12 pl-3' : 'text-left pl-12 pr-3'
            }`}
          />
        </div>

        <div className="flex gap-2 mt-3 overflow-x-auto pb-2 scrollbar-hide">
          {CATEGORIES.map(category => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeCategory === category
                  ? 'bg-amber-500 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredItems.map(item => {
          const cartQty = getCartQuantity(item.id);
          return (
            <Card
              key={item.id}
              className={`bg-slate-900 border-slate-800 overflow-hidden ${
                cartQty > 0 ? 'ring-2 ring-amber-500' : ''
              }`}
            >
              <CardContent className="p-4">
                <div className={`flex gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className="text-4xl">{item.emoji}</div>
                  <div className={`flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-white font-semibold">
                        {locale === 'ar-SA' ? item.name_ar : item.name_en}
                      </h3>
                      <div className="flex gap-1">
                        {item.is_popular && (
                          <Badge className="bg-amber-500/20 text-amber-400 text-xs">
                            <Star className="w-3 h-3 mr-1" />
                            {locale === 'ar-SA' ? 'مميز' : 'Popular'}
                          </Badge>
                        )}
                        {item.is_vegetarian && (
                          <Badge className="bg-emerald-500/20 text-emerald-400 text-xs">
                            <Leaf className="w-3 h-3 mr-1" />
                            {locale === 'ar-SA' ? 'نباتي' : 'Veg'}
                          </Badge>
                        )}
                        {item.is_spicy && (
                          <Badge className="bg-red-500/20 text-red-400 text-xs">
                            <Flame className="w-3 h-3 mr-1" />
                          </Badge>
                        )}
                      </div>
                    </div>

                    <p className="text-slate-400 text-sm mt-1 line-clamp-2">
                      {locale === 'ar-SA' ? item.description_ar : item.description_en}
                    </p>

                    <div className={`flex items-center justify-between mt-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <div>
                        <span className="text-amber-400 font-bold text-lg">{item.price} SAR</span>
                        <span className="text-slate-500 text-sm ml-2">
                          {item.prep_time} {locale === 'ar-SA' ? 'دقيقة' : 'min'}
                        </span>
                      </div>

                      {cartQty === 0 ? (
                        <Button
                          onClick={() => onAddToCart(item)}
                          size="sm"
                          className="bg-amber-500 hover:bg-amber-600 text-white"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          {locale === 'ar-SA' ? 'إضافة' : 'Add'}
                        </Button>
                      ) : (
                        <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <Button
                            onClick={() => onRemoveFromCart(item.id)}
                            size="sm"
                            variant="outline"
                            className="w-8 h-8 p-0 border-slate-600 text-slate-300 hover:text-white"
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="text-white font-bold w-8 text-center">{cartQty}</span>
                          <Button
                            onClick={() => onAddToCart(item)}
                            size="sm"
                            className="w-8 h-8 p-0 bg-amber-500 hover:bg-amber-600 text-white"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <Search className="w-16 h-16 text-slate-700 mx-auto mb-4" />
          <p className="text-slate-400 text-lg">
            {locale === 'ar-SA' ? 'لم يتم العثور على منتجات' : 'No items found'}
          </p>
        </div>
      )}
    </div>
  );
}
