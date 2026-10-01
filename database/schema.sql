-- ==============================================================
-- CODE-B — MANAGEMENT INFORMATION SYSTEM (MIS) & INVOICING SYSTEM
-- Database Schema (MySQL 8.0+ / MariaDB 10.4+)
-- ==============================================================

CREATE DATABASE IF NOT EXISTS codeb_mis CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE codeb_mis;

-- Drop tables in reverse dependency order if recreating
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS password_reset_tokens;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS invoice_items;
DROP TABLE IF EXISTS invoices;
DROP TABLE IF EXISTS estimate_items;
DROP TABLE IF EXISTS estimates;
DROP TABLE IF EXISTS clients;
DROP TABLE IF EXISTS brands;
DROP TABLE IF EXISTS chains;
DROP TABLE IF EXISTS `groups`;
DROP TABLE IF EXISTS subzones;
DROP TABLE IF EXISTS system_settings;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. USERS TABLE
CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('ADMIN', 'SALES_PERSON') NOT NULL DEFAULT 'SALES_PERSON',
    status ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    phone VARCHAR(20),
    department VARCHAR(50) DEFAULT 'Sales',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_email (email),
    INDEX idx_user_role (role),
    INDEX idx_user_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. GROUPS TABLE (Client Parent Organization)
CREATE TABLE `groups` (
    group_id INT PRIMARY KEY AUTO_INCREMENT,
    group_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    status ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_group_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. CHAINS TABLE (Belongs to a Group)
CREATE TABLE chains (
    chain_id INT PRIMARY KEY AUTO_INCREMENT,
    chain_name VARCHAR(100) NOT NULL,
    group_id INT,
    description TEXT,
    status ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES `groups`(group_id) ON DELETE SET NULL,
    INDEX idx_chain_group (group_id),
    INDEX idx_chain_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. BRANDS TABLE (Belongs to a Chain)
CREATE TABLE brands (
    brand_id INT PRIMARY KEY AUTO_INCREMENT,
    brand_name VARCHAR(100) NOT NULL,
    chain_id INT,
    description TEXT,
    status ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (chain_id) REFERENCES chains(chain_id) ON DELETE SET NULL,
    INDEX idx_brand_chain (chain_id),
    INDEX idx_brand_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. SUBZONES TABLE (Geographic Zones)
CREATE TABLE subzones (
    subzone_id INT PRIMARY KEY AUTO_INCREMENT,
    subzone_name VARCHAR(100) NOT NULL UNIQUE,
    region VARCHAR(100) NOT NULL,
    description TEXT,
    status ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_subzone_region (region),
    INDEX idx_subzone_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. CLIENTS TABLE
CREATE TABLE clients (
    client_id INT PRIMARY KEY AUTO_INCREMENT,
    client_name VARCHAR(150) NOT NULL,
    contact_person VARCHAR(100),
    email VARCHAR(100),
    phone VARCHAR(30),
    address VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    gstin VARCHAR(20),
    group_id INT,
    chain_id INT,
    brand_id INT,
    subzone_id INT,
    status ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES `groups`(group_id) ON DELETE SET NULL,
    FOREIGN KEY (chain_id) REFERENCES chains(chain_id) ON DELETE SET NULL,
    FOREIGN KEY (brand_id) REFERENCES brands(brand_id) ON DELETE SET NULL,
    FOREIGN KEY (subzone_id) REFERENCES subzones(subzone_id) ON DELETE SET NULL,
    INDEX idx_client_name (client_name),
    INDEX idx_client_gstin (gstin),
    INDEX idx_client_status (status),
    INDEX idx_client_group (group_id),
    INDEX idx_client_chain (chain_id),
    INDEX idx_client_subzone (subzone_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. ESTIMATES TABLE
CREATE TABLE estimates (
    estimate_id INT PRIMARY KEY AUTO_INCREMENT,
    estimate_number VARCHAR(50) NOT NULL UNIQUE,
    client_id INT NOT NULL,
    chain_id INT,
    estimate_date DATE NOT NULL,
    valid_until DATE NOT NULL,
    salesperson_id INT NOT NULL,
    status ENUM('DRAFT', 'SENT', 'APPROVED', 'REJECTED', 'EXPIRED', 'CONVERTED') NOT NULL DEFAULT 'DRAFT',
    subtotal DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    discount DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    taxable_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    gst_rate DECIMAL(5,2) NOT NULL DEFAULT 18.00,
    gst DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    grand_total DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(client_id),
    FOREIGN KEY (chain_id) REFERENCES chains(chain_id) ON DELETE SET NULL,
    FOREIGN KEY (salesperson_id) REFERENCES users(user_id),
    INDEX idx_estimate_number (estimate_number),
    INDEX idx_estimate_client (client_id),
    INDEX idx_estimate_salesperson (salesperson_id),
    INDEX idx_estimate_status (status),
    INDEX idx_estimate_date (estimate_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. ESTIMATE ITEMS TABLE
CREATE TABLE estimate_items (
    item_id INT PRIMARY KEY AUTO_INCREMENT,
    estimate_id INT NOT NULL,
    description VARCHAR(255) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    discount DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    tax DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    total DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    FOREIGN KEY (estimate_id) REFERENCES estimates(estimate_id) ON DELETE CASCADE,
    INDEX idx_item_estimate (estimate_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 9. INVOICES TABLE
CREATE TABLE invoices (
    invoice_id INT PRIMARY KEY AUTO_INCREMENT,
    invoice_number VARCHAR(50) NOT NULL UNIQUE,
    client_id INT NOT NULL,
    chain_id INT,
    estimate_id INT,
    invoice_date DATE NOT NULL,
    due_date DATE NOT NULL,
    salesperson_id INT NOT NULL,
    subtotal DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    discount DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    taxable_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    gst_rate DECIMAL(5,2) NOT NULL DEFAULT 18.00,
    gst DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    total_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    amount_paid DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    balance_due DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    status ENUM('DRAFT', 'ISSUED', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'CANCELLED') NOT NULL DEFAULT 'ISSUED',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(client_id),
    FOREIGN KEY (chain_id) REFERENCES chains(chain_id) ON DELETE SET NULL,
    FOREIGN KEY (estimate_id) REFERENCES estimates(estimate_id) ON DELETE SET NULL,
    FOREIGN KEY (salesperson_id) REFERENCES users(user_id),
    INDEX idx_invoice_number (invoice_number),
    INDEX idx_invoice_client (client_id),
    INDEX idx_invoice_salesperson (salesperson_id),
    INDEX idx_invoice_status (status),
    INDEX idx_invoice_date (invoice_date),
    INDEX idx_invoice_due_date (due_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 10. INVOICE ITEMS TABLE
CREATE TABLE invoice_items (
    invoice_item_id INT PRIMARY KEY AUTO_INCREMENT,
    invoice_id INT NOT NULL,
    description VARCHAR(255) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    discount DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    gst DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    total DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    FOREIGN KEY (invoice_id) REFERENCES invoices(invoice_id) ON DELETE CASCADE,
    INDEX idx_item_invoice (invoice_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 11. PAYMENTS TABLE
CREATE TABLE payments (
    payment_id INT PRIMARY KEY AUTO_INCREMENT,
    invoice_id INT NOT NULL,
    client_id INT NOT NULL,
    payment_date DATE NOT NULL,
    payment_reference VARCHAR(100),
    payment_method ENUM('Bank Transfer', 'UPI', 'Cash', 'Cheque', 'Card', 'Other') NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    status ENUM('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED') NOT NULL DEFAULT 'SUCCESS',
    notes TEXT,
    recorded_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (invoice_id) REFERENCES invoices(invoice_id) ON DELETE CASCADE,
    FOREIGN KEY (client_id) REFERENCES clients(client_id),
    FOREIGN KEY (recorded_by) REFERENCES users(user_id) ON DELETE SET NULL,
    INDEX idx_payment_invoice (invoice_id),
    INDEX idx_payment_client (client_id),
    INDEX idx_payment_status (status),
    INDEX idx_payment_date (payment_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 12. PASSWORD RESET TOKENS
CREATE TABLE password_reset_tokens (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(100) NOT NULL,
    token VARCHAR(100) NOT NULL UNIQUE,
    expiry_date DATETIME NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_token_email (email),
    INDEX idx_token_value (token)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 13. AUDIT LOGS
CREATE TABLE audit_logs (
    log_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    username VARCHAR(100),
    action VARCHAR(50) NOT NULL,
    module VARCHAR(50) NOT NULL,
    record_id VARCHAR(50),
    details TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL,
    INDEX idx_audit_module (module),
    INDEX idx_audit_user (user_id),
    INDEX idx_audit_timestamp (timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 14. SYSTEM SETTINGS
CREATE TABLE system_settings (
    setting_key VARCHAR(50) PRIMARY KEY,
    setting_value TEXT NOT NULL,
    description VARCHAR(255),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
