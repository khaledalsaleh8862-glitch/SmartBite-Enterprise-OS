import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface MenuItem {
  id: string;
  name_en: string;
  name_ar: string;
  price: number;
  category: string;
  emoji: string;
  description_en?: string;
  description_ar?: string;
  modifiers?: MenuModifier[];
}

export interface MenuModifier {
  id: string;
  name_en: string;
  name_ar: string;
  type: 'single' | 'multiple';
  required: boolean;
  options: ModifierOption[];
}

export interface ModifierOption {
  id: string;
  name_en: string;
  name_ar: string;
  price_adjustment: number;
}

export interface CartItem {
  id: string;
  menuItem: MenuItem;
  quantity: number;
  selectedModifiers: SelectedModifier[];
  specialInstructions?: string;
  totalPrice: number;
}

export interface SelectedModifier {
  modifierId: string;
  modifierName_en: string;
  modifierName_ar: string;
  selectedOptions: {
    id: string;
    name_en: string;
    name_ar: string;
    price_adjustment: number;
  }[];
}

interface CartState {
  items: CartItem[];
  customerId: string | null;
  customerName: string | null;
  visitCount: number;
  loyaltyPoints: number;
  addItem: (item: MenuItem, modifiers?: SelectedModifier[], instructions?: string) => void;
  removeItem: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  setCustomer: (id: string, name: string, points: number) => void;
  clearCustomer: () => void;
  getSubtotal: () => number;
  getTax: (rate?: number) => number;
  getTotal: (taxRate?: number) => number;
  getPointsToEarn: () => number;
}

const calculateItemPrice = (item: MenuItem, modifiers?: SelectedModifier[]): number => {
  let price = item.price;
  if (modifiers) {
    modifiers.forEach((mod) => {
      mod.selectedOptions.forEach((opt) => {
        price += opt.price_adjustment;
      });
    });
  }
  return price;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      customerId: null,
      customerName: null,
      visitCount: 0,
      loyaltyPoints: 0,

      addItem: (item, modifiers, instructions) => {
        const id = `${item.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const totalPrice = calculateItemPrice(item, modifiers);

        set((state) => ({
          items: [
            ...state.items,
            {
              id,
              menuItem: item,
              quantity: 1,
              selectedModifiers: modifiers || [],
              specialInstructions: instructions,
              totalPrice,
            },
          ],
        }));
      },

      removeItem: (cartItemId) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== cartItemId),
        }));
      },

      updateQuantity: (cartItemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(cartItemId);
          return;
        }

        set((state) => ({
          items: state.items.map((item) =>
            item.id === cartItemId
              ? { ...item, quantity }
              : item
          ),
        }));
      },

      clearCart: () => {
        set({ items: [] });
      },

      setCustomer: (id, name, points) => {
        set({
          customerId: id,
          customerName: name,
          loyaltyPoints: points,
          visitCount: 0,
        });
      },

      clearCustomer: () => {
        set({
          customerId: null,
          customerName: null,
          visitCount: 0,
          loyaltyPoints: 0,
        });
      },

      getSubtotal: () => {
        const state = get();
        return state.items.reduce((sum, item) => {
          const itemPrice = calculateItemPrice(item.menuItem, item.selectedModifiers);
          return sum + itemPrice * item.quantity;
        }, 0);
      },

      getTax: (rate = 0.15) => {
        return get().getSubtotal() * rate;
      },

      getTotal: (taxRate = 0.15) => {
        return get().getSubtotal() + get().getTax(taxRate);
      },

      getPointsToEarn: () => {
        const subtotal = get().getSubtotal();
        return Math.floor(subtotal);
      },
    }),
    {
      name: 'smartbite-cart',
    }
  )
);

interface OrderState {
  orders: Order[];
  activeOrderId: string | null;
  addOrder: (order: Omit<Order, 'id' | 'createdAt'>) => string;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  setActiveOrder: (orderId: string | null) => void;
  getActiveOrder: () => Order | null;
  getRecentOrders: (limit?: number) => Order[];
}

export interface Order {
  id: string;
  orderNumber: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: 'cash' | 'card' | 'qr' | 'loyalty';
  status: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  customerId?: string;
  customerName?: string;
  cashierId?: string;
  notes?: string;
  createdAt: Date;
  completedAt?: Date;
  loyaltyPointsUsed?: number;
  loyaltyPointsEarned?: number;
}

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: [],
  activeOrderId: null,

  addOrder: (orderData) => {
    const id = Math.random().toString(36).substr(2, 9);
    const now = new Date();
    const dateStr = now.toISOString().slice(2, 10).replace(/-/g, '');
    const seq = String(get().orders.length + 1).padStart(4, '0');
    const orderNumber = `SB-${dateStr}-${seq}`;

    const order: Order = {
      ...orderData,
      id,
      orderNumber,
      createdAt: now,
    };

    set((state) => ({
      orders: [...state.orders, order],
      activeOrderId: id,
    }));

    return id;
  },

  updateOrderStatus: (orderId, status) => {
    set((state) => ({
      orders: state.orders.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status,
              ...(status === 'completed' ? { completedAt: new Date() } : {}),
            }
          : order
      ),
    }));
  },

  setActiveOrder: (orderId) => {
    set({ activeOrderId: orderId });
  },

  getActiveOrder: () => {
    const state = get();
    return state.orders.find((o) => o.id === state.activeOrderId) || null;
  },

  getRecentOrders: (limit = 10) => {
    return get().orders
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  },
}));

interface CustomerState {
  customer: CustomerProfile | null;
  engagement: CustomerEngagement | null;
  setCustomer: (customer: CustomerProfile, engagement: CustomerEngagement) => void;
  updateEngagement: (updates: Partial<CustomerEngagement>) => void;
  clearCustomer: () => void;
}

export interface CustomerProfile {
  id: string;
  phone_number: string;
  email?: string;
  name_en: string;
  name_ar: string;
  qr_code: string;
}

export interface CustomerEngagement {
  visit_count: number;
  last_checkin: Date | null;
  average_spend: number;
  total_spend: number;
  behavioral_segment: 'Loyal' | 'At-risk' | 'New' | 'VIP' | 'Dormant';
  points_balance: number;
  lifetime_points: number;
  preferred_payment_method: 'cash' | 'card' | 'digital_wallet' | 'loyalty_points';
  favorite_item_id?: string;
  tier_name?: string;
  tier_name_ar?: string;
  cashback_percentage?: number;
}

export const useCustomerStore = create<CustomerState>((set) => ({
  customer: null,
  engagement: null,

  setCustomer: (customer, engagement) => {
    set({ customer, engagement });
  },

  updateEngagement: (updates) => {
    set((state) => ({
      engagement: state.engagement ? { ...state.engagement, ...updates } : null,
    }));
  },

  clearCustomer: () => {
    set({ customer: null, engagement: null });
  },
}));

interface SettingsState {
  isRTL: boolean;
  locale: 'en-US' | 'ar-SA';
  currency: string;
  taxRate: number;
  loyaltyCashbackRate: number;
  setLocale: (locale: 'en-US' | 'ar-SA') => void;
  toggleRTL: () => void;
  setCurrency: (currency: string) => void;
  setTaxRate: (rate: number) => void;
  setLoyaltyCashbackRate: (rate: number) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      isRTL: false,
      locale: 'en-US',
      currency: 'SAR',
      taxRate: 0.15,
      loyaltyCashbackRate: 0.05,

      setLocale: (locale) => {
        set({ locale, isRTL: locale === 'ar-SA' });
      },

      toggleRTL: () => {
        set((state) => ({ isRTL: !state.isRTL }));
      },

      setCurrency: (currency) => {
        set({ currency });
      },

      setTaxRate: (rate) => {
        set({ taxRate: rate });
      },

      setLoyaltyCashbackRate: (rate) => {
        set({ loyaltyCashbackRate: rate });
      },
    }),
    {
      name: 'smartbite-settings',
    }
  )
);