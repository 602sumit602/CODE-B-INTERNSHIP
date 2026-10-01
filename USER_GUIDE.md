# CODE-B MIS & INVOICING — USER GUIDE & OPERATING MANUAL

Welcome to the **Code-B Management Information System (MIS) & Invoicing System**. This guide provides step-by-step instructions for managing your sales operations, generating quotes, issuing invoices, and tracking client collections.

---

## Table of Contents
1. [Logging In & Account Security](#1-logging-in--account-security)
2. [Navigating the MIS Dashboard](#2-navigating-the-mis-dashboard)
3. [Managing Organization Hierarchies (Admin Only)](#3-managing-organization-hierarchies-admin-only)
4. [Client Onboarding & GSTIN Verification](#4-client-onboarding--gstin-verification)
5. [Sales Estimates Lifecycle](#5-sales-estimates-lifecycle)
6. [Converting Estimates to Invoices](#6-converting-estimates-to-invoices)
7. [Direct Invoicing & PDF Generation](#7-direct-invoicing--pdf-generation)
8. [Recording Payments & Balance Tracking](#8-recording-payments--balance-tracking)
9. [Financial Reports & CSV Exports](#9-financial-reports--csv-exports)
10. [User Management & Access Control (Admin Only)](#10-user-management--access-control-admin-only)
11. [System Audit Trail & Configuration](#11-system-audit-trail--configuration)

---

## 1. Logging In & Account Security

1. Navigate to `http://localhost:5173/login`.
2. Enter your corporate email and password:
   - **Admin Access**: `admin@codeb.com` / `admin123`
   - **Sales Representative Access**: `john.sales@codeb.com` / `sales123`
3. Click **"Sign In to Dashboard"**.
4. **Auto-Logout Security**: For enterprise security, your session will automatically terminate after 30 minutes of inactivity. You will receive an alert and be redirected back to the login portal.
5. **Forgot Password**: If you ever misplace your password, click **"Forgot Password?"** on the login screen, enter your email, copy the generated reset token, and set your new password on the reset page.

---

## 2. Navigating the MIS Dashboard

The dashboard provides real-time visibility into executive KPIs:
- **Total Invoiced**: Cumulative billing amount across all active invoices.
- **Revenue Realized / Collected**: Cash realized through settled payments.
- **Outstanding Receivables**: Payments pending collection from clients.
- **Operational Metrics**: Active clients count, pending estimates, and overdue invoices.
- **Interactive Visualizations**:
  - *Monthly Revenue vs. Collections* bar chart comparing billed vs. collected funds.
  - *Invoice Status Distribution* doughnut chart displaying proportions of Paid, Partially Paid, and Issued invoices.
  - *Recent Activity Feed* showing live system audits.

---

## 3. Managing Organization Hierarchies (Admin Only)

Code-B supports multi-level enterprise hierarchy mapping:
1. **Groups** (`/groups`): Manage parent conglomerates (e.g., Tata Group, Reliance Retail). Click **"+ Add Group"** to add a new entity.
2. **Chains** (`/chains`): Subsidiary retail chains under a group (e.g., Westside, Smart Bazaar). When creating a chain, select its parent Group.
3. **Brands** (`/brands`): Specific product lines or store brands (e.g., Zudio, Croma). Link each brand to its corresponding Chain.
4. **Subzones** (`/subzones`): Regional sales territories (e.g., North Delhi, Mumbai Metro, South Karnataka).

---

## 4. Client Onboarding & GSTIN Verification

1. Navigate to **Clients** (`/clients`) from the sidebar.
2. Click **"+ Add New Client"**.
3. Fill in the client profile:
   - **Client Name** and **Company Name**.
   - **GSTIN**: 15-character statutory tax identifier (e.g., `27AABCC9988K1Z5`). The system validates the format automatically.
   - **Email & Phone Number**.
   - **Associated Group / Chain / Brand / Subzone**.
   - **Full Billing Address, City, State, and Pincode**.
4. Click **"Save Client"**.
5. Click on any client to view their **Client 360° Profile**, which aggregates their linked Estimates, Invoices, and Payment History in one consolidated view.

---

## 5. Sales Estimates Lifecycle

1. Navigate to **Estimates** (`/estimates`) and click **"+ Create Estimate"**.
2. Select the **Client** and specify the **Estimate Date** and **Valid Until Date**.
3. Add item lines by clicking **"+ Add Item"**:
   - Provide item description (e.g., "Annual Software Maintenance").
   - Specify Quantity and Unit Price in INR (₹).
   - Enter any line-item or overall discount.
4. Review the live calculation card on the right:
   - Gross Subtotal &rarr; Less Discount &rarr; Taxable Value &rarr; Plus GST (18%) &rarr; Grand Total.
5. Click **"Save & Create Estimate"**.
6. **Workflow Transitions**:
   - Status begins as `DRAFT`.
   - Click **"Approve"** when the client accepts the quote.
   - Click **"Reject"** if the client declines.

---

## 6. Converting Estimates to Invoices

Once a sales estimate has been **APPROVED**:
1. Open the estimate details page (`/estimates/{id}`).
2. Click the primary button **"Convert to Invoice"**.
3. Confirm the modal prompt.
4. The system automatically creates a commercial invoice with identical line items and tax calculations.
5. The estimate status transitions to `CONVERTED_TO_INVOICE`, preventing accidental duplicate conversions.
6. You will be automatically redirected to the newly created invoice.

---

## 7. Direct Invoicing & PDF Generation

1. Navigate to **Invoices** (`/invoices`) and click **"+ Create Invoice"**.
2. Select the client, specify issue date, and set the payment due date.
3. Add billable particulars, quantities, unit prices, and applicable discounts.
4. Save the invoice.
5. **Download Official PDF**:
   - Open any invoice details page (`/invoices/{id}`).
   - Click **"Download PDF"** in the top action bar.
   - The backend compiles and delivers a formatted, tax-compliant PDF invoice generated via OpenPDF with company headers, client GSTIN details, line item schedules, and bank instructions.
6. **Print Directly**: Click **"Print"** to trigger your browser's native print dialog.

---

## 8. Recording Payments & Balance Tracking

1. In the **Invoices** table or **Invoice Details** screen, click **"Record Payment"** on any invoice with an outstanding balance.
2. The payment modal will open:
   - Enter the payment amount (the system prevents entering an amount higher than the current balance due).
   - Select the payment date.
   - Choose the payment method: **Bank Transfer (NEFT/RTGS)**, **UPI**, **Cheque**, **Credit Card**, or **Cash**.
   - Input the transaction reference or bank UTR code.
3. Click **"Confirm & Record Payment"**.
4. The invoice balance due is deducted automatically:
   - If balance reaches `₹0.00`, the invoice transitions to `PAID`.
   - If balance is greater than zero, the status updates to `PARTIALLY_PAID`.

---

## 9. Financial Reports & CSV Exports

Navigate to **Reports** (`/reports`):
- **Sales Performance Tab**: Select custom date ranges and specific clients to compute aggregate billed revenue, cash collected, and outstanding receivables.
- **Outstanding Aging & Dues Tab**: Inspect all invoices currently awaiting full or partial settlement.
- **Data Export Center Tab**: One-click streaming downloads for:
  - *Invoices Register CSV*
  - *Sales Estimates Register CSV*
  - *Payments Journal CSV*
  - *Client Master Directory CSV*

---

## 10. User Management & Access Control (Admin Only)

1. Navigate to **Users** (`/users`) in the admin navigation.
2. View existing team accounts, departments, and active statuses.
3. Click **"+ Add New User"** to provision a new user account.
4. Toggle active/inactive statuses with a single click using the user toggle icon.

---

## 11. System Audit Trail & Configuration

1. **Audit Trail** (`/audit-logs`): Review tamper-evident logs of every transaction, record mutation, user login, and invoice conversion. Filter by module or search by keyword.
2. **System Settings** (`/settings`): Configure company legal details, official GSTIN number, address, and default GST percentage rate.
