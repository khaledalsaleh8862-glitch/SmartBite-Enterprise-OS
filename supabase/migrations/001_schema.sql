-- SmartBite Enterprise OS - Database Schema Migration
-- Version: 1.0.0
-- Author: SmartBite Architecture Team
-- Description: Complete PostgreSQL schema for AI-Driven Cafeteria Ecosystem

-- ============================================
-- ENUM TYPES
-- ============================================

CREATE TYPE behavioral_segment_type AS ENUM ('Loyal', 'At-risk', 'New', 'VIP', 'Dormant');
CREATE TYPE order_status_type AS ENUM ('pending', 'preparing', 'ready', 'completed', 'cancelled', 'refunded');
CREATE TYPE payment_method_type AS ENUM ('cash', 'card', 'digital_wallet', 'loyalty_points');
CREATE TYPE transaction_type AS ENUM ('debit', 'credit');
CREATE TYPE account_type AS ENUM ('asset', 'liability', 'equity', 'revenue', 'expense');

-- ============================================
-- CORE TABLES
-- ============================================

-- Customers Table
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(255),
    name_ar VARCHAR(255) NOT NULL,
    name_en VARCHAR(255) NOT NULL,
    qr_code VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customer Engagement Tracking
CREATE TABLE customers_engagement (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    visit_count INTEGER DEFAULT 0,
    last_checkin TIMESTAMPTZ,
    average_spend DECIMAL(10, 2) DEFAULT 0.00,
    total_spend DECIMAL(12, 2) DEFAULT 0.00,
    behavioral_segment behavioral_segment_type DEFAULT 'New',
    points_balance INTEGER DEFAULT 0,
    lifetime_points INTEGER DEFAULT 0,
    preferred_payment_method payment_method_type DEFAULT 'cash',
    favorite_item_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(customer_id)
);

-- Loyalty Tiers Configuration
CREATE TABLE loyalty_tiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tier_name VARCHAR(50) NOT NULL,
    tier_name_ar VARCHAR(50) NOT NULL,
    tier_level INTEGER NOT NULL,
    min_points INTEGER DEFAULT 0,
    cashback_percentage DECIMAL(5, 2) DEFAULT 1.00,
    discount_percentage DECIMAL(5, 2) DEFAULT 0.00,
    free_item_threshold INTEGER,
    free_item_id UUID,
    tier_rules JSONB DEFAULT '{}',
    benefits JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chart of Accounts
CREATE TABLE accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_code VARCHAR(20) UNIQUE NOT NULL,
    account_name VARCHAR(100) NOT NULL,
    account_name_ar VARCHAR(100),
    account_type account_type NOT NULL,
    parent_account_id UUID REFERENCES accounts(id),
    balance DECIMAL(14, 2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Accounting Ledger (Double-Entry)
CREATE TABLE accounting_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_date TIMESTAMPTZ DEFAULT NOW(),
    transaction_type transaction_type NOT NULL,
    account_id UUID REFERENCES accounts(id) NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    reference_type VARCHAR(50),
    reference_id UUID,
    description TEXT,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categories
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_en VARCHAR(100) NOT NULL,
    name_ar VARCHAR(100) NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Raw Materials/Ingredients Inventory
CREATE TABLE inventory_management (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ingredient_code VARCHAR(50) UNIQUE NOT NULL,
    name_en VARCHAR(100) NOT NULL,
    name_ar VARCHAR(100) NOT NULL,
    unit_of_measure VARCHAR(20) NOT NULL,
    current_stock DECIMAL(10, 3) DEFAULT 0,
    minimum_stock DECIMAL(10, 3) DEFAULT 0,
    maximum_stock DECIMAL(10, 3),
    cost_per_unit DECIMAL(10, 4) DEFAULT 0,
    supplier_name VARCHAR(255),
    expiry_tracking BOOLEAN DEFAULT false,
    last_restocked TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Menu Items
CREATE TABLE menu_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku VARCHAR(50) UNIQUE NOT NULL,
    name_en VARCHAR(200) NOT NULL,
    name_ar VARCHAR(200) NOT NULL,
    description_en TEXT,
    description_ar TEXT,
    ai_description_en TEXT,
    ai_description_ar TEXT,
    category_id UUID REFERENCES categories(id),
    base_price DECIMAL(10, 2) NOT NULL,
    cost_price DECIMAL(10, 2) DEFAULT 0,
    profit_margin DECIMAL(10, 2) GENERATED ALWAYS AS (CASE WHEN base_price > 0 THEN ((base_price - cost_price) / base_price * 100) ELSE 0 END) STORED,
    image_url VARCHAR(500),
    prep_time_minutes INTEGER DEFAULT 10,
    calories INTEGER,
    is_available BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    popularity_score INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recipe/Ingredient Link (Menu Items to Inventory)
CREATE TABLE recipe_ingredients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    menu_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
    ingredient_id UUID REFERENCES inventory_management(id) ON DELETE CASCADE,
    quantity_required DECIMAL(10, 3) NOT NULL,
    unit_of_measure VARCHAR(20) NOT NULL,
    is_optional BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(menu_item_id, ingredient_id)
);

-- Menu Modifiers/Extras
CREATE TABLE menu_modifiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    menu_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
    modifier_name_en VARCHAR(100) NOT NULL,
    modifier_name_ar VARCHAR(100) NOT NULL,
    modifier_type VARCHAR(50) NOT NULL,
    price_adjustment DECIMAL(10, 2) DEFAULT 0,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(20) UNIQUE NOT NULL,
    customer_id UUID REFERENCES customers(id),
    cashier_id UUID,
    order_status order_status_type DEFAULT 'pending',
    subtotal DECIMAL(10, 2) NOT NULL,
    tax_amount DECIMAL(10, 2) DEFAULT 0,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    loyalty_points_used INTEGER DEFAULT 0,
    loyalty_points_earned INTEGER DEFAULT 0,
    total_amount DECIMAL(10, 2) NOT NULL,
    payment_method payment_method_type DEFAULT 'cash',
    payment_status VARCHAR(20) DEFAULT 'pending',
    notes TEXT,
    estimated_prep_time INTEGER DEFAULT 15,
    actual_prep_time INTEGER,
    order_type VARCHAR(20) DEFAULT 'dine_in',
    table_number VARCHAR(20),
    qr_scanned BOOLEAN DEFAULT false,
    ai_generated BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- Order Items
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id UUID REFERENCES menu_items(id),
    item_name_en VARCHAR(200) NOT NULL,
    item_name_ar VARCHAR(200) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    modifiers_applied JSONB DEFAULT '[]',
    special_instructions TEXT,
    item_status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inventory Transactions Log
CREATE TABLE inventory_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ingredient_id UUID REFERENCES inventory_management(id),
    transaction_type VARCHAR(20) NOT NULL,
    quantity_change DECIMAL(10, 3) NOT NULL,
    reference_type VARCHAR(50),
    reference_id UUID,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cash Management
CREATE TABLE cash_management (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cashier_id UUID NOT NULL,
    shift_id UUID,
    transaction_type VARCHAR(20) NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Shifts
CREATE TABLE shifts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    shift_start TIMESTAMPTZ DEFAULT NOW(),
    shift_end TIMESTAMPTZ,
    opening_balance DECIMAL(12, 2) DEFAULT 0,
    closing_balance DECIMAL(12, 2),
    expected_cash DECIMAL(12, 2),
    variance DECIMAL(12, 2),
    status VARCHAR(20) DEFAULT 'open',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Analytics Cache
CREATE TABLE ai_analytics_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analytics_type VARCHAR(50) NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    data JSONB NOT NULL,
    generated_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_customers_qr ON customers(qr_code);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(order_status);
CREATE INDEX idx_orders_created ON orders(created_at);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_recipe_ingredients_menu ON recipe_ingredients(menu_item_id);
CREATE INDEX idx_accounting_ledger_date ON accounting_ledger(transaction_date);
CREATE INDEX idx_accounting_ledger_account ON accounting_ledger(account_id);
CREATE INDEX idx_inventory_transactions_ingredient ON inventory_transactions(ingredient_id);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function: Update customer engagement on visit
CREATE OR REPLACE FUNCTION fn_update_customer_engagement()
RETURNS TRIGGER AS $$
DECLARE
    v_customer_id UUID;
    v_current_segment behavioral_segment_type;
    v_new_segment behavioral_segment_type;
BEGIN
    IF TG_TABLE_NAME = 'orders' AND NEW.customer_id IS NOT NULL THEN
        v_customer_id := NEW.customer_id;
        
        UPDATE customers_engagement
        SET 
            visit_count = visit_count + 1,
            last_checkin = NOW(),
            total_spend = total_spend + NEW.total_amount,
            average_spend = (total_spend + NEW.total_amount) / (visit_count + 1),
            updated_at = NOW()
        WHERE customer_id = v_customer_id;
        
        SELECT behavioral_segment INTO v_current_segment
        FROM customers_engagement
        WHERE customer_id = v_customer_id;
        
        v_new_segment := CASE
            WHEN (SELECT COALESCE(lifetime_points, 0) + NEW.loyalty_points_earned FROM customers_engagement WHERE customer_id = v_customer_id) >= 5000 THEN 'VIP'
            WHEN (SELECT visit_count FROM customers_engagement WHERE customer_id = v_customer_id) >= 50 THEN 'Loyal'
            WHEN (SELECT visit_count FROM customers_engagement WHERE customer_id = v_customer_id) BETWEEN 10 AND 49 THEN 'At-risk'
            WHEN (SELECT visit_count FROM customers_engagement WHERE customer_id = v_customer_id) < 10 THEN 'New'
            ELSE v_current_segment
        END;
        
        IF v_new_segment != v_current_segment THEN
            UPDATE customers_engagement
            SET behavioral_segment = v_new_segment, updated_at = NOW()
            WHERE customer_id = v_customer_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_engagement_on_order
AFTER INSERT ON orders
FOR EACH ROW EXECUTE FUNCTION fn_update_customer_engagement();

-- Function: Deduct inventory on order completion
CREATE OR REPLACE FUNCTION fn_deduct_inventory()
RETURNS TRIGGER AS $$
DECLARE
    v_order_items RECORD;
    v_ingredient RECORD;
BEGIN
    IF TG_TABLE_NAME = 'orders' AND NEW.order_status = 'completed' THEN
        FOR v_order_items IN 
            SELECT oi.id, oi.menu_item_id, oi.quantity
            FROM order_items oi
            WHERE oi.order_id = NEW.id
        LOOP
            FOR v_ingredient IN 
                SELECT ri.ingredient_id, ri.quantity_required, ri.unit_of_measure, im.current_stock
                FROM recipe_ingredients ri
                JOIN inventory_management im ON ri.ingredient_id = im.id
                WHERE ri.menu_item_id = v_order_items.menu_item_id
            LOOP
                UPDATE inventory_management
                SET current_stock = current_stock - (v_ingredient.quantity_required * v_order_items.quantity),
                    updated_at = NOW()
                WHERE id = v_ingredient.ingredient_id;
                
                INSERT INTO inventory_transactions (
                    ingredient_id,
                    transaction_type,
                    quantity_change,
                    reference_type,
                    reference_id,
                    notes
                ) VALUES (
                    v_ingredient.ingredient_id,
                    'deduction',
                    -(v_ingredient.quantity_required * v_order_items.quantity),
                    'order',
                    NEW.id,
                    'Auto-deducted from order ' || NEW.order_number
                );
            END LOOP;
        END LOOP;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_deduct_inventory_on_complete
AFTER UPDATE ON orders
FOR EACH ROW EXECUTE FUNCTION fn_deduct_inventory()
WHEN (NEW.order_status = 'completed' AND OLD.order_status != 'completed');

-- Function: Double-entry accounting for orders
CREATE OR REPLACE FUNCTION fn_double_entry_accounting()
RETURNS TRIGGER AS $$
DECLARE
    v_revenue_account_id UUID;
    v_receivable_account_id UUID;
    v_cash_account_id UUID;
BEGIN
    SELECT id INTO v_revenue_account_id FROM accounts WHERE account_code = '4000';
    SELECT id INTO v_receivable_account_id FROM accounts WHERE account_code = '1100';
    SELECT id INTO v_cash_account_id FROM accounts WHERE account_code = '1000';
    
    IF TG_TABLE_NAME = 'orders' AND NEW.order_status = 'completed' AND NEW.payment_status = 'paid' THEN
        IF NEW.payment_method = 'cash' THEN
            INSERT INTO accounting_ledger (transaction_type, account_id, amount, reference_type, reference_id, description)
            VALUES ('credit', v_revenue_account_id, NEW.total_amount, 'order', NEW.id, 'Revenue from order ' || NEW.order_number);
            
            INSERT INTO accounting_ledger (transaction_type, account_id, amount, reference_type, reference_id, description)
            VALUES ('debit', v_cash_account_id, NEW.total_amount, 'order', NEW.id, 'Cash received from order ' || NEW.order_number);
        ELSE
            INSERT INTO accounting_ledger (transaction_type, account_id, amount, reference_type, reference_id, description)
            VALUES ('credit', v_revenue_account_id, NEW.total_amount, 'order', NEW.id, 'Revenue from order ' || NEW.order_number);
            
            INSERT INTO accounting_ledger (transaction_type, account_id, amount, reference_type, reference_id, description)
            VALUES ('debit', v_receivable_account_id, NEW.total_amount, 'order', NEW.id, 'AR from order ' || NEW.order_number);
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_double_entry_on_payment
AFTER UPDATE ON orders
FOR EACH ROW EXECUTE FUNCTION fn_double_entry_accounting()
WHEN (NEW.payment_status = 'paid' AND OLD.payment_status != 'paid');

-- Function: Update account balances
CREATE OR REPLACE FUNCTION fn_update_account_balances()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.transaction_type = 'debit' THEN
        UPDATE accounts SET balance = balance - NEW.amount WHERE id = NEW.account_id;
    ELSIF NEW.transaction_type = 'credit' THEN
        UPDATE accounts SET balance = balance + NEW.amount WHERE id = NEW.account_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_account_balance
AFTER INSERT ON accounting_ledger
FOR EACH ROW EXECUTE FUNCTION fn_update_account_balances();

-- Function: Update menu item popularity
CREATE OR REPLACE FUNCTION fn_update_popularity()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_TABLE_NAME = 'order_items' THEN
        UPDATE menu_items
        SET popularity_score = popularity_score + NEW.quantity,
            updated_at = NOW()
        WHERE id = NEW.menu_item_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_popularity
AFTER INSERT ON order_items
FOR EACH ROW EXECUTE FUNCTION fn_update_popularity();

-- Function: Generate order number
CREATE OR REPLACE FUNCTION fn_generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.order_number := 'SB-' || TO_CHAR(NOW(), 'YYMMDD') || '-' || LPAD(NEXTVAL('order_seq')::TEXT, 6, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE IF NOT EXISTS order_seq START 1;

CREATE TRIGGER trg_generate_order_number
BEFORE INSERT ON orders
FOR EACH ROW EXECUTE FUNCTION fn_generate_order_number();

-- ============================================
-- VIEWS
-- ============================================

-- View: Customer Loyalty Summary
CREATE OR REPLACE VIEW v_customer_loyalty AS
SELECT 
    c.id,
    c.name_en,
    c.name_ar,
    c.phone_number,
    ce.visit_count,
    ce.last_checkin,
    ce.average_spend,
    ce.behavioral_segment,
    ce.points_balance,
    lt.tier_name,
    lt.tier_level,
    lt.cashback_percentage
FROM customers c
JOIN customers_engagement ce ON c.id = ce.customer_id
LEFT JOIN loyalty_tiers lt ON lt.tier_level = (
    SELECT MAX(tier_level) FROM loyalty_tiers 
    WHERE min_points <= ce.lifetime_points AND is_active = true
);

-- View: Revenue by Period
CREATE OR REPLACE VIEW v_revenue_by_period AS
SELECT 
    DATE_TRUNC('day', created_at) as date,
    COUNT(*) as order_count,
    SUM(total_amount) as gross_revenue,
    SUM(tax_amount) as tax_collected,
    SUM(discount_amount) as discounts_given,
    SUM(total_amount) - SUM(tax_amount) as net_revenue
FROM orders
WHERE order_status IN ('completed', 'ready')
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY date DESC;

-- View: Inventory Status
CREATE OR REPLACE VIEW v_inventory_status AS
SELECT 
    im.id,
    im.ingredient_code,
    im.name_en,
    im.name_ar,
    im.current_stock,
    im.minimum_stock,
    im.maximum_stock,
    im.unit_of_measure,
    im.cost_per_unit,
    im.current_stock * im.cost_per_unit as total_value,
    CASE 
        WHEN im.current_stock <= im.minimum_stock THEN 'Critical'
        WHEN im.current_stock <= im.minimum_stock * 1.5 THEN 'Low'
        ELSE 'Healthy'
    END as stock_status
FROM inventory_management im;

-- View: Menu Item Performance (for AI Menu Engineering)
CREATE OR REPLACE VIEW v_menu_performance AS
SELECT 
    mi.id,
    mi.sku,
    mi.name_en,
    mi.name_ar,
    mi.base_price,
    mi.cost_price,
    mi.profit_margin,
    mi.popularity_score,
    COUNT(oi.id) as order_count,
    COALESCE(SUM(oi.quantity), 0) as total_sold,
    COALESCE(SUM(oi.total_price), 0) as total_revenue,
    CASE
        WHEN mi.profit_margin >= 60 AND COALESCE(SUM(oi.quantity), 0) >= 100 THEN 'Star'
        WHEN mi.profit_margin >= 60 AND COALESCE(SUM(oi.quantity), 0) < 50 THEN 'High Profit Low Volume'
        WHEN mi.profit_margin < 40 AND COALESCE(SUM(oi.quantity), 0) >= 100 THEN 'Low Profit High Volume'
        WHEN mi.profit_margin < 40 AND COALESCE(SUM(oi.quantity), 0) < 50 THEN 'Dog'
        ELSE 'Puzzle'
    END as menu_classification
FROM menu_items mi
LEFT JOIN order_items oi ON mi.id = oi.menu_item_id
GROUP BY mi.id;

-- ============================================
-- RLS POLICIES
-- ============================================

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers_engagement ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounting_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_management ENABLE ROW LEVEL SECURITY;
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_management ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

-- Manager: Full access to accounting and analytics
CREATE POLICY "Managers can view all data" ON customers
    FOR SELECT USING (auth.jwt() ->> 'role' = 'manager');

CREATE POLICY "Managers can manage customers" ON customers
    FOR ALL USING (auth.jwt() ->> 'role' = 'manager');

CREATE POLICY "Managers can view accounting" ON accounting_ledger
    FOR SELECT USING (auth.jwt() ->> 'role' = 'manager');

CREATE POLICY "Managers can manage accounting" ON accounting_ledger
    FOR ALL USING (auth.jwt() ->> 'role' = 'manager');

-- Cashier: POS and customer lookup only
CREATE POLICY "Cashiers can view customers" ON customers
    FOR SELECT USING (auth.jwt() ->> 'role' IN ('manager', 'cashier'));

CREATE POLICY "Cashiers can create orders" ON orders
    FOR INSERT WITH CHECK (auth.jwt() ->> 'role' IN ('manager', 'cashier'));

CREATE POLICY "Cashiers can view orders" ON orders
    FOR SELECT USING (auth.jwt() ->> 'role' IN ('manager', 'cashier'));

-- Kitchen: KDS only
CREATE POLICY "Kitchen can view orders" ON orders
    FOR SELECT USING (auth.jwt() ->> 'role' IN ('manager', 'kitchen'));

CREATE POLICY "Kitchen can update order items" ON order_items
    FOR UPDATE USING (auth.jwt() ->> 'role' IN ('manager', 'kitchen'));

-- ============================================
-- SEED DATA
-- ============================================

-- Default Chart of Accounts
INSERT INTO accounts (account_code, account_name, account_name_ar, account_type) VALUES
('1000', 'Cash', 'النقدية', 'asset'),
('1100', 'Accounts Receivable', 'الحسابات المدينة', 'asset'),
('1200', 'Inventory', 'المخزون', 'asset'),
('2000', 'Accounts Payable', 'الحسابات الدائنة', 'liability'),
('3000', 'Owner Equity', 'حقوق الملكية', 'equity'),
('4000', 'Sales Revenue', 'إيرادات المبيعات', 'revenue'),
('5000', 'Cost of Goods Sold', 'تكلفة البضاعة المباعة', 'expense'),
('6000', 'Operating Expenses', 'المصروفات التشغيلية', 'expense');

-- Default Loyalty Tiers
INSERT INTO loyalty_tiers (tier_name, tier_name_ar, tier_level, min_points, cashback_percentage, tier_rules) VALUES
('Bronze', 'برونزي', 1, 0, 1.00, '{"requirements": "New customers", "benefits": ["1% cashback on all purchases"]}'),
('Silver', 'فضي', 2, 500, 2.00, '{"requirements": "500+ points", "benefits": ["2% cashback", "Birthday reward"]}'),
('Gold', 'ذهبي', 3, 1500, 3.00, '{"requirements": "1500+ points", "benefits": ["3% cashback", "Free coffee after 5 visits", "Priority support"]}'),
('Platinum', 'بلاتيني', 4, 3500, 4.00, '{"requirements": "3500+ points", "benefits": ["4% cashback", "Free item monthly", "VIP queue"]}'),
('VIP', 'مميز', 5, 5000, 5.00, '{"requirements": "5000+ points", "benefits": ["5% cashback", "Free premium item weekly", "Dedicated counter"]}');

-- Default Categories
INSERT INTO categories (name_en, name_ar, sort_order) VALUES
('Hot Beverages', 'المشروبات الساخنة', 1),
('Cold Beverages', 'المشروبات الباردة', 2),
('Sandwiches', 'الساندويتشات', 3),
('Wraps', 'الوجبات الخفيفة', 4),
('Salads', 'السلطات', 5),
('Desserts', 'الحلويات', 6),
('Snacks', 'المقبلات', 7);
