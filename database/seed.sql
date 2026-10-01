-- ==============================================================
-- CODE-B — MANAGEMENT INFORMATION SYSTEM (MIS) & INVOICING SYSTEM
-- Seed Data for Development & Testing
-- ==============================================================

USE codeb_mis;

-- 1. SEED USERS
-- Default passwords:
-- Admin: admin@codeb.com / admin123
-- Sales: john.sales@codeb.com / sales123
-- Sales: sarah.sales@codeb.com / sales123
-- Note: Spring Boot DataInitializer will also ensure these BCrypt hashes match if needed.
INSERT INTO users (user_id, full_name, email, password_hash, role, status, phone, department) VALUES
(1, 'Administrator', 'admin@codeb.com', '$2a$10$slYQmyNdGzTn7ZLBXBChFOC9f6kFjAqPhccnP6DxlWXx2lPk1C3G6', 'ADMIN', 'ACTIVE', '+91 98765 43210', 'Executive'),
(2, 'John Doe', 'john.sales@codeb.com', '$2a$10$slYQmyNdGzTn7ZLBXBChFOC9f6kFjAqPhccnP6DxlWXx2lPk1C3G6', 'SALES_PERSON', 'ACTIVE', '+91 98200 11223', 'West Zone Sales'),
(3, 'Sarah Jenkins', 'sarah.sales@codeb.com', '$2a$10$slYQmyNdGzTn7ZLBXBChFOC9f6kFjAqPhccnP6DxlWXx2lPk1C3G6', 'SALES_PERSON', 'ACTIVE', '+91 98111 22334', 'North Zone Sales'),
(4, 'Michael Chang', 'michael.sales@codeb.com', '$2a$10$slYQmyNdGzTn7ZLBXBChFOC9f6kFjAqPhccnP6DxlWXx2lPk1C3G6', 'SALES_PERSON', 'ACTIVE', '+91 98333 44556', 'South Zone Sales'),
(5, 'Inactive User', 'inactive@codeb.com', '$2a$10$slYQmyNdGzTn7ZLBXBChFOC9f6kFjAqPhccnP6DxlWXx2lPk1C3G6', 'SALES_PERSON', 'INACTIVE', '+91 98000 00000', 'Operations')
ON DUPLICATE KEY UPDATE full_name=VALUES(full_name);

-- 2. SEED GROUPS
INSERT INTO `groups` (group_id, group_name, description, status) VALUES
(1, 'Retail Hub India', 'Pan-India conglomerate specializing in retail, supermarket chains, and logistics', 'ACTIVE'),
(2, 'Metro Hospitality Group', 'Luxury hotels, business stays, gourmet diners, and quick-service restaurant chains', 'ACTIVE'),
(3, 'Zenith Consumer Tech', 'Electronics, consumer appliances, smart home hardware, and distribution', 'ACTIVE'),
(4, 'Apex Fashion Collective', 'Apparel, footwear, athletic gear, and lifestyle accessory retail brand network', 'ACTIVE')
ON DUPLICATE KEY UPDATE group_name=VALUES(group_name);

-- 3. SEED CHAINS
INSERT INTO chains (chain_id, chain_name, group_id, description, status) VALUES
(1, 'Hub Express', 1, 'Convenience grocery stores situated in metropolitan transit zones', 'ACTIVE'),
(2, 'Hub Hyper', 1, 'Large format suburban hypermarkets with full lifestyle selection', 'ACTIVE'),
(3, 'Royal Suites & Hotels', 2, 'Five-star luxury boutique hotels & convention resorts', 'ACTIVE'),
(4, 'Urban Cafe & Bistro', 2, 'Trendy casual dining bistro chain across high-street commercial hubs', 'ACTIVE'),
(5, 'Zenith SmartStores', 3, 'Experiential tech retail outlets featuring connected devices and IoT', 'ACTIVE')
ON DUPLICATE KEY UPDATE chain_name=VALUES(chain_name);

-- 4. SEED BRANDS
INSERT INTO brands (brand_id, brand_name, chain_id, description, status) VALUES
(1, 'Hub Fresh Organics', 1, 'Certified farm-to-table organic produce & gourmet daily dairy', 'ACTIVE'),
(2, 'Hub Daily Essentials', 1, 'Private label fast-moving consumer packaged goods & staples', 'ACTIVE'),
(3, 'Royal Grand Residence', 3, 'Signature presidential suites and premium corporate retreats', 'ACTIVE'),
(4, 'Urban Brew House', 4, 'Artisanal single-origin espresso and cold brew beverage bars', 'ACTIVE'),
(5, 'Zenith Pulse Audio', 5, 'High-fidelity audio systems, headphones, and home acoustic setups', 'ACTIVE')
ON DUPLICATE KEY UPDATE brand_name=VALUES(brand_name);

-- 5. SEED SUBZONES
INSERT INTO subzones (subzone_id, subzone_name, region, description, status) VALUES
(1, 'North Mumbai Metro', 'West', 'Bandra to Borivali commercial corridors, BKC, and Andheri MIDC', 'ACTIVE'),
(2, 'South Mumbai Financial', 'West', 'Nariman Point, Fort, Lower Parel, and Worli enterprise parks', 'ACTIVE'),
(3, 'Bengaluru Tech Corridor', 'South', 'Whitefield, Electronic City, Outer Ring Road, and Bellandur IT clusters', 'ACTIVE'),
(4, 'Delhi NCR Central', 'North', 'Connaught Place, Cyber City Gurugram, and Noida Sector 62 tech parks', 'ACTIVE'),
(5, 'Hyderabad Cyberabad', 'South', 'HITEC City, Gachibowli, Madhapur, and Financial District', 'ACTIVE'),
(6, 'Pune West Auto & Tech', 'West', 'Hinjewadi Infotech Park, Baner, and Chakan industrial zone', 'ACTIVE')
ON DUPLICATE KEY UPDATE subzone_name=VALUES(subzone_name);

-- 6. SEED CLIENTS
INSERT INTO clients (client_id, client_name, contact_person, email, phone, address, city, state, gstin, group_id, chain_id, brand_id, subzone_id, status) VALUES
(1, 'Acme Retail Ventures Ltd', 'Rajesh Sharma', 'procurement@acmeretail.com', '+91 98201 23456', 'Tower 3, Level 7, BKC Business Park', 'Mumbai', 'Maharashtra', '27AABCU9603R1ZM', 1, 1, 1, 1, 'ACTIVE'),
(2, 'Grand Metropolitan Hotels Pvt Ltd', 'Vikramaditya Rao', 'finance@grandmetro.in', '+91 98112 34567', '42, Marine Lines, Churchgate', 'Mumbai', 'Maharashtra', '27AABCG1234F1Z9', 2, 3, 3, 2, 'ACTIVE'),
(3, 'CyberTech Solutions India', 'Priya Sundaram', 'vendor.ops@cybertech.co.in', '+91 98450 98765', 'Building 14, Helios Business Park, Outer Ring Rd', 'Bengaluru', 'Karnataka', '29AABCS5678K1Z3', 3, 5, 5, 3, 'ACTIVE'),
(4, 'Urban Roast Hospitality', 'Karan Mehra', 'accounts@urbanroast.com', '+91 98102 55443', 'Plot 88, Sector 29 Leisure Valley', 'Gurugram', 'Haryana', '06AABCU8899D1ZQ', 2, 4, 4, 4, 'ACTIVE'),
(5, 'Apex Retail Superstores', 'Sunita Deshmukh', 's.deshmukh@apexmart.com', '+91 98220 77889', 'Survey 45, Baner High Street', 'Pune', 'Maharashtra', '27AABCA7766E1Z2', 1, 2, 2, 6, 'ACTIVE'),
(6, 'Telangana Micro Devices Corp', 'Naveen Reddy', 'purchasing@tmdcorp.in', '+91 98490 12345', 'Mindspace Cyberabad, Building 2B, HITEC City', 'Hyderabad', 'Telangana', '36AABCT4321H1Z0', 3, 5, 5, 5, 'ACTIVE'),
(7, 'Pacific Blue Apparel Retail', 'Ananya Sen', 'billing@pacificblue.co', '+91 98301 99887', 'Park Street Corporate Towers, 4th Floor', 'Kolkata', 'West Bengal', '19AABCP1122J1Z8', 4, 1, 1, 1, 'ACTIVE')
ON DUPLICATE KEY UPDATE client_name=VALUES(client_name);

-- 7. SEED ESTIMATES
INSERT INTO estimates (estimate_id, estimate_number, client_id, chain_id, estimate_date, valid_until, salesperson_id, status, subtotal, discount, taxable_amount, gst_rate, gst, grand_total, notes) VALUES
(1, 'CB-EST-2026-001', 1, 1, '2026-09-01', '2026-10-01', 2, 'APPROVED', 150000.00, 10000.00, 140000.00, 18.00, 25200.00, 165200.00, 'Q3 POS Terminal rollout and enterprise barcode scanners integration'),
(2, 'CB-EST-2026-002', 2, 3, '2026-09-05', '2026-10-05', 2, 'CONVERTED', 280000.00, 15000.00, 265000.00, 18.00, 47700.00, 312700.00, 'Hotel ERP Guest Management & Digital Keyless Access integration'),
(3, 'CB-EST-2026-003', 3, 5, '2026-09-10', '2026-10-10', 4, 'SENT', 85000.00, 5000.00, 80000.00, 18.00, 14400.00, 94400.00, 'IoT Display kiosks and cloud monitoring subscription'),
(4, 'CB-EST-2026-004', 4, 4, '2026-09-15', '2026-09-30', 3, 'DRAFT', 62000.00, 2000.00, 60000.00, 18.00, 10800.00, 70800.00, 'Cafe billing touchscreens with thermal printer docks'),
(5, 'CB-EST-2026-005', 5, 2, '2026-08-01', '2026-08-31', 2, 'EXPIRED', 110000.00, 10000.00, 100000.00, 18.00, 18000.00, 118000.00, 'Seasonal hypermarket inventory audit hardware suite')
ON DUPLICATE KEY UPDATE estimate_number=VALUES(estimate_number);

-- 8. SEED ESTIMATE ITEMS
INSERT INTO estimate_items (item_id, estimate_id, description, quantity, unit_price, discount, tax, total) VALUES
(1, 1, 'Omni-directional 2D Barcode Scanners (USB-C)', 10, 8000.00, 5000.00, 13500.00, 88500.00),
(2, 1, 'Code-B POS Touch Terminals 15-inch Android 14', 5, 14000.00, 5000.00, 11700.00, 76700.00),
(3, 2, 'RFID Keycard Encoders & Door Controllers', 8, 15000.00, 5000.00, 20700.00, 135700.00),
(4, 2, 'Code-B Hospitality PMS Cloud License (Annual)', 1, 160000.00, 10000.00, 27000.00, 177000.00),
(5, 3, 'Smart IoT Shelf Sensor Kiosks 10.1-inch', 5, 17000.00, 5000.00, 14400.00, 94400.00),
(6, 4, 'Compact Cafe Thermal Receipt Printers 80mm', 4, 8000.00, 1000.00, 5580.00, 36580.00),
(7, 4, 'Tablet Kitchen Display Units with Wall Mounts', 2, 15000.00, 1000.00, 5220.00, 34220.00),
(8, 5, 'Rugged Handheld Warehouse Scanners', 5, 22000.00, 10000.00, 18000.00, 118000.00)
ON DUPLICATE KEY UPDATE description=VALUES(description);

-- 9. SEED INVOICES
INSERT INTO invoices (invoice_id, invoice_number, client_id, chain_id, estimate_id, invoice_date, due_date, salesperson_id, subtotal, discount, taxable_amount, gst_rate, gst, total_amount, amount_paid, balance_due, status, notes) VALUES
(1, 'CB-INV-2026-001', 2, 3, 2, '2026-09-08', '2026-10-08', 2, 280000.00, 15000.00, 265000.00, 18.00, 47700.00, 312700.00, 312700.00, 0.00, 'PAID', 'Converted from Estimate CB-EST-2026-002. Full payment received.'),
(2, 'CB-INV-2026-002', 1, 1, 1, '2026-09-12', '2026-10-12', 2, 150000.00, 10000.00, 140000.00, 18.00, 25200.00, 165200.00, 80000.00, 85200.00, 'PARTIALLY_PAID', 'Delivery phase 1 completed. 50% advance received.'),
(3, 'CB-INV-2026-003', 3, 5, NULL, '2026-09-18', '2026-10-18', 4, 120000.00, 5000.00, 115000.00, 18.00, 20700.00, 135700.00, 0.00, 135700.00, 'ISSUED', 'Direct order for annual IoT telemetry API gateway subscriptions.'),
(4, 'CB-INV-2026-004', 5, 2, NULL, '2026-08-10', '2026-09-10', 2, 95000.00, 5000.00, 90000.00, 18.00, 16200.00, 106200.00, 0.00, 106200.00, 'OVERDUE', 'Hypermarket annual barcode maintenance SLA. Payment overdue.')
ON DUPLICATE KEY UPDATE invoice_number=VALUES(invoice_number);

-- 10. SEED INVOICE ITEMS
INSERT INTO invoice_items (invoice_item_id, invoice_id, description, quantity, unit_price, discount, gst, total) VALUES
(1, 1, 'RFID Keycard Encoders & Door Controllers', 8, 15000.00, 5000.00, 20700.00, 135700.00),
(2, 1, 'Code-B Hospitality PMS Cloud License (Annual)', 1, 160000.00, 10000.00, 27000.00, 177000.00),
(3, 2, 'Omni-directional 2D Barcode Scanners (USB-C)', 10, 8000.00, 5000.00, 13500.00, 88500.00),
(4, 2, 'Code-B POS Touch Terminals 15-inch Android 14', 5, 14000.00, 5000.00, 11700.00, 76700.00),
(5, 3, 'IoT Telemetry Cloud API Gateway Enterprise SLA', 12, 10000.00, 5000.00, 20700.00, 135700.00),
(6, 4, 'Annual Hypermarket Barcode Maintenance Contract', 1, 95000.00, 5000.00, 16200.00, 106200.00)
ON DUPLICATE KEY UPDATE description=VALUES(description);

-- 11. SEED PAYMENTS
INSERT INTO payments (payment_id, invoice_id, client_id, payment_date, payment_reference, payment_method, amount, status, notes, recorded_by) VALUES
(1, 1, 2, '2026-09-10', 'HDFC-NEFT-99881122', 'Bank Transfer', 312700.00, 'SUCCESS', 'Full invoice settlement received via corporate RTGS', 2),
(2, 2, 1, '2026-09-15', 'ICICI-UPI-88442211', 'UPI', 80000.00, 'SUCCESS', 'Initial 50% milestone advance payment', 2)
ON DUPLICATE KEY UPDATE payment_reference=VALUES(payment_reference);

-- 12. SEED SYSTEM SETTINGS
INSERT INTO system_settings (setting_key, setting_value, description) VALUES
('company_name', 'Code-B Solutions Pvt Ltd', 'Registered Company Legal Name'),
('company_address', '402, Business Tower, Tech Park, Powai, Mumbai, Maharashtra - 400076', 'Registered Business Address'),
('company_email', 'contact@codeb.com', 'Official Company Contact Email'),
('company_phone', '+91 22 6123 4567', 'Official Company Telephone'),
('company_gstin', '27AAACC4112M1ZV', 'Goods & Services Tax Identification Number'),
('default_gst_rate', '18.00', 'Default GST Rate in Percentage'),
('currency_symbol', '₹', 'Currency Symbol'),
('currency_code', 'INR', 'Currency ISO Code'),
('invoice_prefix', 'CB-INV-', 'Prefix for generated invoice numbers'),
('estimate_prefix', 'CB-EST-', 'Prefix for generated estimate numbers'),
('payment_terms', 'Net 30 days from date of invoice. Late payments subject to 1.5% interest per month.', 'Default Invoice Payment Terms & Conditions')
ON DUPLICATE KEY UPDATE setting_value=VALUES(setting_value);

-- 13. SEED AUDIT LOGS
INSERT INTO audit_logs (user_id, username, action, module, record_id, details) VALUES
(1, 'Administrator', 'CREATE', 'USER', '2', 'Created sales representative account for John Doe'),
(1, 'Administrator', 'CREATE', 'CLIENT', '1', 'Added new enterprise client Acme Retail Ventures Ltd'),
(2, 'John Doe', 'CREATE', 'ESTIMATE', '1', 'Generated sales estimate CB-EST-2026-001 for Acme Retail'),
(2, 'John Doe', 'CONVERT', 'INVOICE', '1', 'Converted approved estimate CB-EST-2026-002 into invoice CB-INV-2026-001'),
(2, 'John Doe', 'RECORD_PAYMENT', 'PAYMENT', '1', 'Recorded RTGS payment of ₹3,12,700 for invoice CB-INV-2026-001');
