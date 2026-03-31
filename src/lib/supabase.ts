import { createClient } from '@supabase/supabase-js';

type Json = Record<string, unknown> | unknown[] | string | number | boolean | null;

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

export type Database = {
  public: {
    Tables: {
      customers: {
        Row: {
          id: string;
          phone_number: string;
          email: string | null;
          name_ar: string;
          name_en: string;
          qr_code: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['customers']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['customers']['Insert']>;
      };
      customers_engagement: {
        Row: {
          id: string;
          customer_id: string;
          visit_count: number;
          last_checkin: string | null;
          average_spend: number;
          total_spend: number;
          behavioral_segment: 'Loyal' | 'At-risk' | 'New' | 'VIP' | 'Dormant';
          points_balance: number;
          lifetime_points: number;
          preferred_payment_method: 'cash' | 'card' | 'digital_wallet' | 'loyalty_points';
          favorite_item_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['customers_engagement']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['customers_engagement']['Insert']>;
      };
      orders: {
        Row: {
          id: string;
          order_number: string;
          customer_id: string | null;
          cashier_id: string | null;
          order_status: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled' | 'refunded';
          subtotal: number;
          tax_amount: number;
          discount_amount: number;
          loyalty_points_used: number;
          loyalty_points_earned: number;
          total_amount: number;
          payment_method: 'cash' | 'card' | 'digital_wallet' | 'loyalty_points';
          payment_status: string;
          notes: string | null;
          estimated_prep_time: number;
          actual_prep_time: number | null;
          order_type: string;
          table_number: string | null;
          qr_scanned: boolean;
          ai_generated: boolean;
          created_at: string;
          updated_at: string;
          completed_at: string | null;
        };
        Insert: Omit<Database['public']['Tables']['orders']['Row'], 'id' | 'order_number' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['orders']['Insert']>;
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          menu_item_id: string | null;
          item_name_en: string;
          item_name_ar: string;
          quantity: number;
          unit_price: number;
          total_price: number;
          modifiers_applied: Json;
          special_instructions: string | null;
          item_status: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['order_items']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['order_items']['Insert']>;
      };
      menu_items: {
        Row: {
          id: string;
          sku: string;
          name_en: string;
          name_ar: string;
          description_en: string | null;
          description_ar: string | null;
          ai_description_en: string | null;
          ai_description_ar: string | null;
          category_id: string | null;
          base_price: number;
          cost_price: number;
          profit_margin: number;
          image_url: string | null;
          prep_time_minutes: number;
          calories: number | null;
          is_available: boolean;
          is_active: boolean;
          popularity_score: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['menu_items']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['menu_items']['Insert']>;
      };
      inventory_management: {
        Row: {
          id: string;
          ingredient_code: string;
          name_en: string;
          name_ar: string;
          unit_of_measure: string;
          current_stock: number;
          minimum_stock: number;
          maximum_stock: number | null;
          cost_per_unit: number;
          supplier_name: string | null;
          expiry_tracking: boolean;
          last_restocked: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['inventory_management']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['inventory_management']['Insert']>;
      };
      recipe_ingredients: {
        Row: {
          id: string;
          menu_item_id: string;
          ingredient_id: string;
          quantity_required: number;
          unit_of_measure: string;
          is_optional: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['recipe_ingredients']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['recipe_ingredients']['Insert']>;
      };
      accounts: {
        Row: {
          id: string;
          account_code: string;
          account_name: string;
          account_name_ar: string | null;
          account_type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
          parent_account_id: string | null;
          balance: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['accounts']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['accounts']['Insert']>;
      };
      accounting_ledger: {
        Row: {
          id: string;
          transaction_date: string;
          transaction_type: 'debit' | 'credit';
          account_id: string;
          amount: number;
          reference_type: string | null;
          reference_id: string | null;
          description: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['accounting_ledger']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['accounting_ledger']['Insert']>;
      };
      loyalty_tiers: {
        Row: {
          id: string;
          tier_name: string;
          tier_name_ar: string;
          tier_level: number;
          min_points: number;
          cashback_percentage: number;
          discount_percentage: number;
          free_item_threshold: number | null;
          free_item_id: string | null;
          tier_rules: Json;
          benefits: Json;
          is_active: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['loyalty_tiers']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['loyalty_tiers']['Insert']>;
      };
      shifts: {
        Row: {
          id: string;
          user_id: string;
          shift_start: string;
          shift_end: string | null;
          opening_balance: number;
          closing_balance: number | null;
          expected_cash: number | null;
          variance: number | null;
          status: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['shifts']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['shifts']['Insert']>;
      };
    };
    Functions: Record<string, unknown>;
    Enums: Record<string, unknown>;
  };
};

export async function signInWithPhone(phone: string) {
  const { data, error } = await supabase.auth.signInWithOtp({
    phone,
  });
  if (error) throw error;
  return data;
}

export async function verifyOtp(phone: string, token: string) {
  const { data, error } = await supabase.auth.verifyOtp({
    type: 'sms',
    phone,
    token,
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export function subscribeToOrders(callback: (payload: any) => void) {
  return supabase
    .channel('orders-channel')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'orders',
      },
      callback
    )
    .subscribe();
}

export function subscribeToInventory(callback: (payload: any) => void) {
  return supabase
    .channel('inventory-channel')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'inventory_management',
      },
      callback
    )
    .subscribe();
}

export async function getCustomerByQR(qrCode: string) {
  const { data, error } = await supabase
    .from('customers')
    .select(`
      *,
      customers_engagement (*)
    `)
    .eq('qr_code', qrCode)
    .single();

  if (error) throw error;
  return data;
}

export async function createOrder(orderData: any) {
  const { data, error } = await supabase
    .from('orders')
    .insert(orderData)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateOrderStatus(orderId: string, status: string) {
  const { data, error } = await supabase
    .from('orders')
    .update({ order_status: status, updated_at: new Date().toISOString() })
    .eq('id', orderId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getInventoryStatus() {
  const { data, error } = await supabase
    .from('inventory_management')
    .select('*')
    .order('current_stock', { ascending: true });

  if (error) throw error;
  return data;
}

export async function getAccounts() {
  const { data, error } = await supabase
    .from('accounts')
    .select('*')
    .order('account_code');

  if (error) throw error;
  return data;
}

export async function getRevenueByPeriod(startDate: string, endDate: string) {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      created_at,
      total_amount,
      tax_amount,
      discount_amount,
      order_status
    `)
    .gte('created_at', startDate)
    .lte('created_at', endDate)
    .in('order_status', ['completed', 'ready']);

  if (error) throw error;
  return data;
}

export async function getTopProducts(limit: number = 10) {
  const { data, error } = await supabase
    .from('order_items')
    .select(`
      menu_item_id,
      quantity,
      total_price,
      menu_items (
        id,
        name_en,
        name_ar,
        base_price,
        cost_price
      )
    `)
    .limit(limit);

  if (error) throw error;
  return data;
}