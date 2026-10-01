# CODE-B — MANAGEMENT INFORMATION SYSTEM (MIS) & INVOICING SYSTEM

An enterprise-grade, production-style Management Information System (MIS) and Commercial Invoicing platform built for **Code-B**. This system enables executive administrators and sales teams to manage multi-tier enterprise hierarchies (Groups, Chains, Brands, Subzones), verified client profiles, quotations & estimates, commercial GST invoices, payment collections, and audit trails.

---

## 🌟 Key Capabilities & Features

### 1. Robust Role-Based Access Control (RBAC)
- **ADMIN**: Unrestricted system administration, user management, corporate organization hierarchy configuration, system tax/company parameters, and complete audit trail access.
- **SALES_PERSON**: Dedicated sales portal to manage assigned and active clients, issue formal sales estimates, convert approved estimates into invoices, record collections, and view sales performance metrics.

### 2. Multi-Tier Organizational Hierarchy
- **Groups**: Conglomerate entities (e.g., Tata Group, Reliance Retail, Aditya Birla Group).
- **Chains**: Subsidiaries and operating chains under a group (e.g., Westside, Star Bazaar, Smart Bazaar).
- **Brands**: Distinct brand offerings (e.g., Zudio, Croma, Freshpik).
- **Subzones**: Geographical sales territories and regional zones.
- **Clients**: Verified commercial accounts with 15-character GSTIN validation, corporate hierarchy association, contact personas, and billing addresses.

### 3. Financial Calculations & Workflow Engine
- **Server-Side Financial Accuracy**: Strictly calculates all monetary figures using Java `BigDecimal` with half-up rounding.
- **GST Compliance**: Configurable Goods and Services Tax (default 18% with 9% CGST + 9% SGST breakdown) calculated on net taxable value after item-level or overall discounts.
- **Estimate Lifecycle**: `DRAFT` &rarr; `SENT` &rarr; `APPROVED` / `REJECTED` &rarr; `CONVERTED_TO_INVOICE`.
- **Estimate-to-Invoice Conversion**: Automatically converts approved estimates into invoices with dynamic item transfer, preventing duplicate conversions through transactional locks.
- **Invoice & Payment Settlement Engine**:
  - Automatically transitions invoice statuses based on live collections: `ISSUED` &rarr; `PARTIALLY_PAID` &rarr; `PAID` / `OVERDUE`.
  - Validates that recorded payments do not exceed the remaining balance due.
- **Server-Side PDF Generation**: Uses OpenPDF to dynamically compile professional, print-ready, tax-compliant invoice documents (`GET /api/invoices/{id}/pdf`).

### 4. Interactive Analytics & Reporting
- **Live KPI Cards**: Real-time sales, collections, receivables, and conversion ratios.
- **Chart.js Visualizations**: Monthly revenue vs. collection trends, invoice status doughnut charts, and payment channel distribution.
- **Export Center**: Instant CSV exports for Invoices, Estimates, Payments, and Clients.

---

## 🏗️ Technology Architecture

| Tier | Technology Stack |
| :--- | :--- |
| **Frontend** | React 18, Vite 5, React Router v6, Chart.js, Lucide Icons, Vanilla CSS Enterprise Design System, Axios |
| **Backend** | Java 17, Spring Boot 3.2.5, Spring Security 6 (Stateless JWT + BCrypt), Spring Data JPA, OpenPDF 1.3.39, Springdoc OpenAPI (Swagger) |
| **Database** | MySQL / MariaDB 10.4 (14 Normalized Tables with Foreign Keys and Indexes) |
| **Security** | JWT authentication, 30-minute client-side inactivity auto-logout, token-based password reset, BCrypt password hashing |

---

## 🚀 Quick Start Guide

### Prerequisites
- **Java**: JDK 17 or higher
- **Maven**: 3.8+
- **Node.js**: v18+ and npm
- **MySQL / MariaDB**: Running on port 3306 with database `codeb_mis`

### 1. Database Initialization
```bash
# Start MySQL and execute schema and seed scripts:
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS codeb_mis;"
mysql -u root -p codeb_mis < database/schema.sql
mysql -u root -p codeb_mis < database/seed.sql
```

### 2. Backend Startup
```bash
cd backend
mvn spring-boot:run
```
Backend will start at: `http://localhost:8080`
- API Health: `http://localhost:8080/api/health`
- Swagger UI: `http://localhost:8080/swagger-ui.html`

### 3. Frontend Startup
```bash
cd frontend
npm install
npm run dev
```
Frontend will be accessible at: `http://localhost:5173`

---

## 👥 Demo User Accounts

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@codeb.com` | `admin123` | Full access to all modules, users, hierarchies, audit logs, and settings. |
| **Sales Representative** | `john.sales@codeb.com` | `sales123` | Create and manage clients, estimates, invoices, and payments. |
| **Sales Representative** | `sarah.sales@codeb.com` | `sales123` | Manage regional accounts and sales workflow. |

*Quick login buttons are available on the login page for 1-click credential auto-filling.*

---

## 📁 Project Structure

```text
codeb-mis-invoicing/
├── backend/
│   ├── pom.xml
│   └── src/
│       ├── main/
│       │   ├── java/com/codeb/mis/
│       │   │   ├── config/             # Seed data and application configurations
│       │   │   ├── controller/         # 14 REST Controllers (Auth, Clients, Invoices, etc.)
│       │   │   ├── dto/                # Data Transfer Objects with Bean Validation
│       │   │   ├── entity/             # 14 JPA Entities matching MySQL schema
│       │   │   ├── exception/          # Global Exception Handler and custom exceptions
│       │   │   ├── repository/         # JPA Repositories with custom queries
│       │   │   ├── security/           # JWT Filter, AuthenticationEntryPoint, SecurityConfig
│       │   │   └── service/            # Core business logic and calculations
│       │   └── resources/
│       │       └── application.properties
│       └── test/                       # Unit and integration test suites
├── database/
│   ├── schema.sql                      # 14 Normalized relational tables
│   └── seed.sql                        # Comprehensive enterprise demo dataset
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── components/                 # Modals, DataTables, StatCards, Navbar, Sidebar
│       ├── contexts/                   # AuthContext (JWT + inactivity timer), ToastContext
│       ├── layouts/                    # MainLayout (responsive sidebar) and AuthLayout
│       ├── pages/                      # 25 application pages & views
│       ├── services/                   # Axios HTTP client and API endpoints SDK
│       └── styles/                     # Enterprise CSS design tokens and layout rules
├── API_DOCUMENTATION.md                # Full REST API specification
├── USER_GUIDE.md                       # Complete end-user instruction handbook
└── README.md
```
