-- SmartBite Enterprise OS - Table QR & Customer Recognition Extension
-- Version: 1.1.0
-- Description: Dynamic QR Code System for tables and Smart Customer Recognition

-- ============================================
-- NEW TABLES
-- ============================================

-- Tables Management (for QR Code Generation)
CREATE TABLE tables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_number VARCHAR(20) UNIQUE NOT NULL,
    table_name VARCHAR(100),
    capacity INTEGER DEFAULT 4,
    location VARCHAR(100),
    qr_code_url VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Visit History (for Customer Recognition)
CREATE TABLE visits_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    table_id UUID REFERENCES tables(id) ON DELETE SET NULL,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    visit_timestamp TIMESTAMPTZ DEFAULT NOW(),
    spend_amount DECIMAL(10, 2) DEFAULT 0.00,
    points_earned INTEGER DEFAULT 0,
    loyalty_tier_at_visit VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin Users (for Admin Panel Authentication)
CREATE TABLE admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'cashier',
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR NEW TABLES
-- ============================================

CREATE INDEX idx_visits_customer ON visits_history(customer_id);
CREATE INDEX idx_visits_table ON visits_history(table_id);
CREATE INDEX idx_visits_timestamp ON visits_history(visit_timestamp);
CREATE INDEX idx_tables_qr ON tables(qr_code_url);
CREATE INDEX idx_admin_email ON admin_users(email);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function: Auto-create visit record when customer checks in at table
CREATE OR REPLACE FUNCTION fn_create_visit_on_checkin()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO visits_history (customer_id, table_id, visit_timestamp, loyalty_tier_at_visit)
    VALUES (
        NEW.customer_id,
        NEW.table_id,
        NOW(),
        (SELECT behavioral_segment FROM customers_engagement WHERE customer_id = NEW.customer_id)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function: Update visit history when order is completed
CREATE OR REPLACE FUNCTION fn_update_visit_on_order_complete()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.order_status = 'completed' AND OLD.order_status != 'completed' THEN
        UPDATE visits_history
        SET
            order_id = NEW.id,
            spend_amount = NEW.total_amount,
            points_earned = NEW.loyalty_points_earned
        WHERE customer_id = NEW.customer_id
        AND visit_timestamp = (
            SELECT MAX(visit_timestamp)
            FROM visits_history
            WHERE customer_id = NEW.customer_id
            AND visit_timestamp > NOW() - INTERVAL '1 hour'
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_create_visit_on_checkin
AFTER INSERT ON visits_history
FOR EACH ROW EXECUTE FUNCTION fn_create_visit_on_checkin();

CREATE TRIGGER trg_update_visit_on_order_complete
AFTER UPDATE ON orders
FOR EACH ROW EXECUTE FUNCTION fn_update_visit_on_order_complete();

-- Function: Get returning customer info for welcome notifications
CREATE OR REPLACE FUNCTION fn_get_returning_customer_info(p_phone VARCHAR)
RETURNS TABLE (
    customer_id UUID,
    customer_name_en VARCHAR,
    customer_name_ar VARCHAR,
    visit_count INTEGER,
    total_spend DECIMAL,
    current_tier VARCHAR,
    last_visit TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        c.id,
        c.name_en,
        c.name_ar,
        ce.visit_count,
        ce.total_spend,
        ce.behavioral_segment::VARCHAR,
        ce.last_checkin
    FROM customers c
    JOIN customers_engagement ce ON c.id = ce.customer_id
    WHERE c.phone_number = p_phone;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- REALTIME SUBSCRIPTIONS (Supabase)
-- ============================================

-- Enable realtime for visits_history
ALTER PUBLICATION supabase_realtime ADD TABLE visits_history;
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE customers_engagement;

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE visits_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Tables: Public read for QR access, admin write
CREATE POLICY "Tables are viewable by everyone" ON tables FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage tables" ON tables FOR ALL USING (auth.role() = 'authenticated');

-- Visits: Customers can see own history, admins see all
CREATE POLICY "Customers can view own visits" ON visits_history FOR SELECT
    USING (customer_id = auth.uid() OR auth.role() = 'authenticated');
CREATE POLICY "System can insert visits" ON visits_history FOR INSERT WITH CHECK (true);

-- Admin: Only authenticated admins can access
CREATE POLICY "Admins can manage own profile" ON admin_users FOR ALL
    USING (auth.role() = 'authenticated');

-- ============================================
-- SEED DATA: Sample Tables
-- ============================================

INSERT INTO tables (table_number, table_name, capacity, location) VALUES
    ('T1', 'Table 1', 4, 'Indoor Main'),
    ('T2', 'Table 2', 4, 'Indoor Main'),
    ('T3', 'Table 3', 6, 'Indoor Main'),
    ('T4', 'Table 4', 2, 'Window Side'),
    ('T5', 'Table 5', 4, 'Window Side'),
    ('T6', 'Table 6', 8, 'Private Area'),
    ('T7', 'Table 7', 4, 'Outdoor'),
    ('T8', 'Table 8', 4, 'Outdoor'),
    ('VIP1', 'VIP Booth 1', 6, 'VIP Section'),
    ('VIP2', 'VIP Booth 2', 6, 'VIP Section');
