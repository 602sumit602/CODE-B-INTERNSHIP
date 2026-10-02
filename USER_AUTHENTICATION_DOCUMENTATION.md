# CODE-B — USER AUTHENTICATION & REGISTRATION MODULE
## Assignment Submission & End User Documentation

---

### 📌 Assignment Submission Details

| Field | Detail |
| :--- | :--- |
| **GitHub Repository Link** | [https://github.com/602sumit602/CODE-B-INTERNSHIP](https://github.com/602sumit602/CODE-B-INTERNSHIP) |
| **URL Hosted on Free Server** | [https://code-b-internship.vercel.app/login](https://code-b-internship.vercel.app/login) |
| **Module Completed** | User Registration, Authentication & Role-Based Access Control (RBAC) |
| **Technology Stack** | Java 17, Spring Boot 3, Spring Security 6 (Stateless JWT + BCrypt), React 18, Vite, MySQL |

---

## 1. Module Overview

The **User Authentication & Registration System** provides a secure, role-differentiated access control gateway for the **CODE-B Management Information System (MIS) & Invoicing Platform**. 

Key capabilities include:
- **Stateless JWT Authentication**: Secure 24-hour JSON Web Tokens signed with HMAC-SHA256.
- **Enterprise Password Protection**: BCrypt one-way password hashing (work factor 10).
- **Role-Based Access Control (RBAC)**: Differentiated user permissions (`ADMIN` vs. `SALES_PERSON`).
- **30-Minute Inactivity Auto-Logout**: Automatic client-side inactivity monitoring for heightened enterprise workstation security.
- **Tokenized Password Reset Flow**: Secure token-based password recovery.
- **Quick 1-Click Demo Logins**: Instant credential auto-fill for testing and evaluator convenience.

---

## 2. Test & Demo User Accounts

The live system includes pre-seeded verified accounts for immediate testing:

| Role | Email Address | Password | Privileges |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@codeb.com` | `admin123` | Full access to all modules, users, hierarchies, audit logs, and settings. |
| **Sales Representative** | `john.sales@codeb.com` | `sales123` | Dedicated sales portal: client management, estimates issuance, invoices, and payments. |
| **Sales Representative** | `sarah.sales@codeb.com` | `sales123` | Regional sales account management and quotes. |

---

## 3. End User Documentation & Operating Handbook

### 3.1. User Registration Flow
1. Navigate to the registration portal at `https://code-b-internship.vercel.app/register` (or click **"Register here"** on the login screen).
2. Complete the user registration form:
   - **Full Name**: Enter formal first and last name.
   - **Corporate Email**: Validated corporate email address (duplicate check enforced).
   - **Password**: Minimum 6 characters (automatically encrypted via BCrypt).
   - **Phone**: Contact telephone number.
   - **Department**: Corporate department (e.g., *Sales*, *Executive*, *Operations*).
   - **Role**: Select `SALES_PERSON` or `ADMIN`.
3. Click **"Create Account"**.
4. The system validates the input, persists the user record with hashed password, issues an authorized session token, and automatically redirects to the MIS Dashboard.

### 3.2. User Login Flow
1. Navigate to `https://code-b-internship.vercel.app/login`.
2. Enter your email and password (or click one of the **Quick Demo Login** buttons).
3. Optionally select **"Remember me"**.
4. Click **"Sign In to Dashboard"**.
5. The system verifies credentials, generates a signed JWT token, stores it in browser local storage, and loads the user’s authorized view.

### 3.3. Role-Based Access Control (RBAC) Matrix

| Module / Action | ADMIN Role | SALES_PERSON Role |
| :--- | :---: | :---: |
| **MIS Dashboard** | Full System Statistics | Assigned Sales Metrics |
| **Client Management** | All Clients | Assigned Clients |
| **Sales Estimates** | Full Lifecycle (Create, Approve, Reject) | Create & Send Quotes |
| **Commercial Invoices** | Full Access & PDF Generation | Full Access & PDF Generation |
| **Payment Collections** | Record & Manage All Payments | Record Client Payments |
| **User Administration** | Full CRUD | ❌ Access Denied (403) |
| **Corporate Hierarchies** | Full CRUD (Groups, Chains, Brands) | ❌ Access Denied (403) |
| **System Audit Trails** | Full Visibility | ❌ Access Denied (403) |

### 3.4. 30-Minute Inactivity Auto-Logout
- The client application actively listens for user interaction events (`mousemove`, `keydown`, `click`, `scroll`).
- If no user interaction occurs for **30 minutes**, the system automatically clears authentication tokens and redirects the user to `/login?expired=true` with an informative warning message.

### 3.5. Password Recovery Workflow
1. Click **"Forgot Password?"** on the login page.
2. Enter your registered email address.
3. The server generates a unique, time-limited cryptographic token.
4. Enter the token along with your new password on the Reset Password page to restore access.

---

## 4. Technical Specifications & REST APIs

### Authentication Endpoints

| HTTP Method | Path | Security | Functionality |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Public | Validates credentials, issues JWT bearer token and user profile. |
| `POST` | `/api/auth/register` | Public | Creates new user account with duplicate prevention. |
| `POST` | `/api/auth/forgot-password` | Public | Generates time-limited password reset token. |
| `POST` | `/api/auth/reset-password` | Public | Verifies token and resets password hash. |
| `GET` | `/api/auth/me` | Bearer JWT | Returns current authenticated user context. |

---

## 5. Instructions to Generate Assignment PDF

To submit this assignment in **PDF format**:

1. Open the file [`Assignment_Submission.html`](file:///C:/Users/HP/.gemini/antigravity-ide/scratch/codeb-mis-invoicing/Assignment_Submission.html) in your browser:
   - Double-click the file in Windows File Explorer, or open with Chrome / Edge.
2. Click the floating **"🖨️ Download / Save as PDF"** button (or press <kbd>Ctrl</kbd> + <kbd>P</kbd>).
3. In the Print dialog:
   - **Destination**: Choose **"Save as PDF"**.
   - **Layout**: Portrait.
   - **Options**: Check **"Background graphics"**.
4. Click **Save** to produce your assignment PDF file!
