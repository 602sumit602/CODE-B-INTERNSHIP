# CODE-B MIS & INVOICING — REST API SPECIFICATION

This document details all REST endpoints exposed by the Code-B MIS backend (`http://localhost:8080/api`), their HTTP methods, authorization requirements, request formats, and response payloads.

---

## 1. Authentication & Security Endpoints (`/api/auth`)

### 1.1 User Login
- **Endpoint**: `POST /api/auth/login`
- **Access**: Public
- **Request Body**:
```json
{
  "email": "admin@codeb.com",
  "password": "admin123"
}
```
- **Response** (`200 OK`):
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiJ9...",
    "type": "Bearer",
    "userId": 1,
    "fullName": "Administrator",
    "email": "admin@codeb.com",
    "role": "ADMIN",
    "status": "ACTIVE",
    "phone": "+91 98765 43210",
    "department": "Executive"
  },
  "status": 200,
  "timestamp": "2026-10-01T11:34:54.048Z"
}
```

### 1.2 User Registration
- **Endpoint**: `POST /api/auth/register`
- **Access**: Public
- **Request Body**:
```json
{
  "fullName": "Sarah Jenkins",
  "email": "sarah.jenkins@codeb.com",
  "password": "password123",
  "phone": "+91 98765 99881",
  "department": "Regional Sales",
  "role": "SALES_PERSON"
}
```

### 1.3 Forgot Password
- **Endpoint**: `POST /api/auth/forgot-password`
- **Access**: Public
- **Request Body**: `{ "email": "user@codeb.com" }`
- **Response** (`200 OK`): Generates a secure reset token valid for 2 hours.

### 1.4 Reset Password
- **Endpoint**: `POST /api/auth/reset-password`
- **Access**: Public
- **Request Body**:
```json
{
  "token": "reset-token-uuid-value",
  "newPassword": "newSecretPassword123"
}
```

### 1.5 Current User Profile
- **Endpoint**: `GET /api/auth/me`
- **Headers**: `Authorization: Bearer <token>`
- **Response** (`200 OK`): Current authenticated user details.

### 1.6 Change Password
- **Endpoint**: `PUT /api/auth/profile/change-password`
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newPassword456",
  "confirmPassword": "newPassword456"
}
```

---

## 2. Dashboard & Analytics (`/api/dashboard`)

### 2.1 Executive Dashboard Summary
- **Endpoint**: `GET /api/dashboard/summary`
- **Headers**: `Authorization: Bearer <token>`
- **Response Structure**:
```json
{
  "success": true,
  "data": {
    "totalClients": 7,
    "activeClients": 7,
    "totalGroups": 4,
    "totalChains": 5,
    "totalBrands": 5,
    "totalSubzones": 6,
    "totalEstimates": 5,
    "pendingEstimates": 2,
    "approvedEstimates": 1,
    "convertedEstimates": 1,
    "totalInvoices": 4,
    "paidInvoices": 1,
    "pendingInvoices": 2,
    "overdueInvoices": 1,
    "totalSales": 719800.00,
    "totalCollected": 392700.00,
    "totalOutstanding": 327100.00,
    "monthlySales": [ ... ],
    "invoiceStatusDistribution": { "ISSUED": 1, "PARTIALLY_PAID": 1, "PAID": 1, "OVERDUE": 1 },
    "recentActivities": [ ... ]
  }
}
```

---

## 3. Client Management (`/api/clients`)

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/clients` | Paginated search (`search`, `status`, `chainId`, `subzoneId`, `page`, `size`) | All Roles |
| `GET` | `/api/clients/active` | List of all active clients for dropdown selectors | All Roles |
| `GET` | `/api/clients/{id}` | Detailed client profile with GSTIN and address | All Roles |
| `POST` | `/api/clients` | Create new client with GSTIN validation | All Roles |
| `PUT` | `/api/clients/{id}` | Update existing client details | All Roles |
| `DELETE` | `/api/clients/{id}` | Soft delete / remove client | Admin Only |
| `GET` | `/api/clients/{id}/estimates` | All estimates issued for this client | All Roles |
| `GET` | `/api/clients/{id}/invoices` | All invoices billed to this client | All Roles |
| `GET` | `/api/clients/{id}/payments` | All payment receipts recorded for this client | All Roles |

---

## 4. Organization Hierarchy (`/api/groups`, `/api/chains`, `/api/brands`, `/api/subzones`)

- `GET /api/groups`: List/search conglomerate groups.
- `POST /api/groups`: Create group (Admin only).
- `GET /api/chains`: List chains.
- `GET /api/chains/by-group/{groupId}`: Filter chains under a group.
- `POST /api/chains`: Create chain (Admin only).
- `GET /api/brands`: List brand lines.
- `GET /api/brands/by-chain/{chainId}`: Filter brands under a chain.
- `POST /api/brands`: Create brand (Admin only).
- `GET /api/subzones`: List sales subzones/territories.
- `POST /api/subzones`: Create subzone (Admin only).

---

## 5. Estimates & Quotations (`/api/estimates`)

### 5.1 List Estimates
- **Endpoint**: `GET /api/estimates`
- **Query Params**: `search`, `status`, `clientId`, `salespersonId`, `startDate`, `endDate`, `page`, `size`

### 5.2 Create Estimate
- **Endpoint**: `POST /api/estimates`
- **Request Body**:
```json
{
  "clientId": 1,
  "chainId": 1,
  "estimateDate": "2026-10-01",
  "validUntil": "2026-10-31",
  "notes": "Valid for 30 days. Standard payment terms apply.",
  "items": [
    {
      "description": "Enterprise Cloud Setup & Migration",
      "quantity": 2,
      "unitPrice": 45000.00
    },
    {
      "description": "Annual Maintenance Contract",
      "quantity": 1,
      "unitPrice": 25000.00
    }
  ]
}
```

### 5.3 Estimate Workflow Endpoints
- `POST /api/estimates/{id}/approve`: Transition status to `APPROVED`.
- `POST /api/estimates/{id}/reject`: Transition status to `REJECTED`.
- `POST /api/estimates/{id}/convert-to-invoice`: Converts approved estimate into a new commercial invoice and locks estimate as `CONVERTED_TO_INVOICE`.

---

## 6. Commercial Invoicing & OpenPDF (`/api/invoices`)

### 6.1 List Invoices
- **Endpoint**: `GET /api/invoices`
- **Query Params**: `search`, `status`, `clientId`, `salespersonId`, `startDate`, `endDate`, `page`, `size`

### 6.2 Create Invoice Directly
- **Endpoint**: `POST /api/invoices`
- **Request Body**:
```json
{
  "clientId": 1,
  "invoiceDate": "2026-10-01",
  "dueDate": "2026-10-16",
  "status": "ISSUED",
  "gstRate": 18.00,
  "notes": "Please remit payment via RTGS/NEFT to Code-B Account.",
  "items": [
    {
      "description": "Quarterly Enterprise SaaS License",
      "quantity": 5,
      "unitPrice": 12000.00,
      "discount": 1000.00
    }
  ]
}
```

### 6.3 Download Invoice PDF
- **Endpoint**: `GET /api/invoices/{id}/pdf`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `application/pdf` binary stream ready for direct browser rendering or file download.

### 6.4 Cancel Invoice
- **Endpoint**: `POST /api/invoices/{id}/cancel`
- **Access**: Authorized Sales / Admin

---

## 7. Payments & Collections (`/api/payments`)

### 7.1 Record Payment
- **Endpoint**: `POST /api/payments`
- **Request Body**:
```json
{
  "invoiceId": 1,
  "paymentDate": "2026-10-01",
  "paymentMethod": "BANK_TRANSFER",
  "paymentReference": "UTR-20261001-9988",
  "amount": 25000.00,
  "notes": "NEFT transfer from client corporate account",
  "status": "SUCCESS"
}
```
*Note: Automatically recalculates invoice balance and transitions invoice status to `PARTIALLY_PAID` or `PAID`.*

---

## 8. Reports & CSV Exports (`/api/reports`)

- `GET /api/reports/sales`: Aggregated sales metrics, totals, and invoice registers with date/client filtering.
- `GET /api/reports/outstanding`: Aging receivables report with remaining balances.
- `GET /api/reports/export/invoices`: Returns `text/csv` attachment of all invoices.
- `GET /api/reports/export/estimates`: Returns `text/csv` attachment of all estimates.
- `GET /api/reports/export/payments`: Returns `text/csv` attachment of all payment records.
- `GET /api/reports/export/clients`: Returns `text/csv` attachment of client master data.

---

## 9. Audit Logs & System Settings (`/api/audit-logs`, `/api/settings`)

- `GET /api/audit-logs`: Admin-only query of all user mutations, login sessions, conversions, and transactions.
- `GET /api/settings`: Read all system parameters (GST %, company name, address, tax IDs).
- `PUT /api/settings/{key}`: Update system parameter (Admin only).
