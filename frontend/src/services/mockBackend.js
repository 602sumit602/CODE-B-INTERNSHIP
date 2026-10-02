// CODE-B MIS & Invoicing — Embedded Mock Backend & Offline Storage Engine
// Provides full-fidelity client-side persistence and simulation of Spring Boot REST endpoints.

import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const STORAGE_KEY = 'codeb_mis_db_v2';

const INITIAL_DB = {
  users: [
    {
      userId: 1,
      fullName: 'Administrator',
      email: 'admin@codeb.com',
      password: 'admin123',
      role: 'ADMIN',
      status: 'ACTIVE',
      phone: '+91 98765 43210',
      department: 'Executive',
      createdAt: '2026-08-01T09:00:00'
    },
    {
      userId: 2,
      fullName: 'John Doe',
      email: 'john.sales@codeb.com',
      password: 'sales123',
      role: 'SALES_PERSON',
      status: 'ACTIVE',
      phone: '+91 98200 11223',
      department: 'West Zone Sales',
      createdAt: '2026-08-05T10:30:00'
    },
    {
      userId: 3,
      fullName: 'Sarah Jenkins',
      email: 'sarah.sales@codeb.com',
      password: 'sales123',
      role: 'SALES_PERSON',
      status: 'ACTIVE',
      phone: '+91 98111 22334',
      department: 'North Zone Sales',
      createdAt: '2026-08-10T11:15:00'
    },
    {
      userId: 4,
      fullName: 'Michael Chang',
      email: 'michael.sales@codeb.com',
      password: 'sales123',
      role: 'SALES_PERSON',
      status: 'ACTIVE',
      phone: '+91 98333 44556',
      department: 'South Zone Sales',
      createdAt: '2026-08-15T14:00:00'
    },
    {
      userId: 5,
      fullName: 'Inactive User',
      email: 'inactive@codeb.com',
      password: 'sales123',
      role: 'SALES_PERSON',
      status: 'INACTIVE',
      phone: '+91 98000 00000',
      department: 'Operations',
      createdAt: '2026-08-20T16:00:00'
    }
  ],

  groups: [
    { groupId: 1, groupName: 'Retail Hub India', description: 'Pan-India conglomerate specializing in retail, supermarket chains, and logistics', status: 'ACTIVE' },
    { groupId: 2, groupName: 'Metro Hospitality Group', description: 'Luxury hotels, business stays, gourmet diners, and quick-service restaurant chains', status: 'ACTIVE' },
    { groupId: 3, groupName: 'Zenith Consumer Tech', description: 'Electronics, consumer appliances, smart home hardware, and distribution', status: 'ACTIVE' },
    { groupId: 4, groupName: 'Apex Fashion Collective', description: 'Apparel, footwear, athletic gear, and lifestyle accessory retail brand network', status: 'ACTIVE' }
  ],

  chains: [
    { chainId: 1, chainName: 'Hub Express', groupId: 1, groupName: 'Retail Hub India', description: 'Convenience grocery stores situated in metropolitan transit zones', status: 'ACTIVE' },
    { chainId: 2, chainName: 'Hub Hyper', groupId: 1, groupName: 'Retail Hub India', description: 'Large format suburban hypermarkets with full lifestyle selection', status: 'ACTIVE' },
    { chainId: 3, chainName: 'Royal Suites & Hotels', groupId: 2, groupName: 'Metro Hospitality Group', description: 'Five-star luxury boutique hotels & convention resorts', status: 'ACTIVE' },
    { chainId: 4, chainName: 'Urban Cafe & Bistro', groupId: 2, groupName: 'Metro Hospitality Group', description: 'Trendy casual dining bistro chain across high-street commercial hubs', status: 'ACTIVE' },
    { chainId: 5, chainName: 'Zenith SmartStores', groupId: 3, groupName: 'Zenith Consumer Tech', description: 'Experiential tech retail outlets featuring connected devices and IoT', status: 'ACTIVE' }
  ],

  brands: [
    { brandId: 1, brandName: 'Hub Fresh Organics', chainId: 1, chainName: 'Hub Express', description: 'Certified farm-to-table organic produce & gourmet daily dairy', status: 'ACTIVE' },
    { brandId: 2, brandName: 'Hub Daily Essentials', chainId: 1, chainName: 'Hub Express', description: 'Private label fast-moving consumer packaged goods & staples', status: 'ACTIVE' },
    { brandId: 3, brandName: 'Royal Grand Residence', chainId: 3, chainName: 'Royal Suites & Hotels', description: 'Signature presidential suites and premium corporate retreats', status: 'ACTIVE' },
    { brandId: 4, brandName: 'Urban Brew House', chainId: 4, chainName: 'Urban Cafe & Bistro', description: 'Artisanal single-origin espresso and cold brew beverage bars', status: 'ACTIVE' },
    { brandId: 5, brandName: 'Zenith Pulse Audio', chainId: 5, chainName: 'Zenith SmartStores', description: 'High-fidelity audio systems, headphones, and home acoustic setups', status: 'ACTIVE' }
  ],

  subzones: [
    { subzoneId: 1, subzoneName: 'North Mumbai Metro', region: 'West', description: 'Bandra to Borivali commercial corridors, BKC, and Andheri MIDC', status: 'ACTIVE' },
    { subzoneId: 2, subzoneName: 'South Mumbai Financial', region: 'West', description: 'Nariman Point, Fort, Lower Parel, and Worli enterprise parks', status: 'ACTIVE' },
    { subzoneId: 3, subzoneName: 'Bengaluru Tech Corridor', region: 'South', description: 'Whitefield, Electronic City, Outer Ring Road, and Bellandur IT clusters', status: 'ACTIVE' },
    { subzoneId: 4, subzoneName: 'Delhi NCR Central', region: 'North', description: 'Connaught Place, Cyber City Gurugram, and Noida Sector 62 tech parks', status: 'ACTIVE' },
    { subzoneId: 5, subzoneName: 'Hyderabad Cyberabad', region: 'South', description: 'HITEC City, Gachibowli, Madhapur, and Financial District', status: 'ACTIVE' },
    { subzoneId: 6, subzoneName: 'Pune West Auto & Tech', region: 'West', description: 'Hinjewadi Infotech Park, Baner, and Chakan industrial zone', status: 'ACTIVE' }
  ],

  clients: [
    {
      clientId: 1,
      clientName: 'Acme Retail Ventures Ltd',
      contactPerson: 'Rajesh Sharma',
      email: 'procurement@acmeretail.com',
      phone: '+91 98201 23456',
      address: 'Tower 3, Level 7, BKC Business Park',
      city: 'Mumbai',
      state: 'Maharashtra',
      gstin: '27AABCU9603R1ZM',
      groupId: 1,
      chainId: 1,
      brandId: 1,
      subzoneId: 1,
      groupName: 'Retail Hub India',
      chainName: 'Hub Express',
      brandName: 'Hub Fresh Organics',
      subzoneName: 'North Mumbai Metro',
      status: 'ACTIVE',
      createdAt: '2026-08-01T10:00:00'
    },
    {
      clientId: 2,
      clientName: 'Grand Metropolitan Hotels Pvt Ltd',
      contactPerson: 'Vikramaditya Rao',
      email: 'finance@grandmetro.in',
      phone: '+91 98112 34567',
      address: '42, Marine Lines, Churchgate',
      city: 'Mumbai',
      state: 'Maharashtra',
      gstin: '27AABCG1234F1Z9',
      groupId: 2,
      chainId: 3,
      brandId: 3,
      subzoneId: 2,
      groupName: 'Metro Hospitality Group',
      chainName: 'Royal Suites & Hotels',
      brandName: 'Royal Grand Residence',
      subzoneName: 'South Mumbai Financial',
      status: 'ACTIVE',
      createdAt: '2026-08-03T11:00:00'
    },
    {
      clientId: 3,
      clientName: 'CyberTech Solutions India',
      contactPerson: 'Priya Sundaram',
      email: 'vendor.ops@cybertech.co.in',
      phone: '+91 98450 98765',
      address: 'Building 14, Helios Business Park, Outer Ring Rd',
      city: 'Bengaluru',
      state: 'Karnataka',
      gstin: '29AABCS5678K1Z3',
      groupId: 3,
      chainId: 5,
      brandId: 5,
      subzoneId: 3,
      groupName: 'Zenith Consumer Tech',
      chainName: 'Zenith SmartStores',
      brandName: 'Zenith Pulse Audio',
      subzoneName: 'Bengaluru Tech Corridor',
      status: 'ACTIVE',
      createdAt: '2026-08-05T12:00:00'
    },
    {
      clientId: 4,
      clientName: 'Urban Roast Hospitality',
      contactPerson: 'Karan Mehra',
      email: 'accounts@urbanroast.com',
      phone: '+91 98102 55443',
      address: 'Plot 88, Sector 29 Leisure Valley',
      city: 'Gurugram',
      state: 'Haryana',
      gstin: '06AABCU8899D1ZQ',
      groupId: 2,
      chainId: 4,
      brandId: 4,
      subzoneId: 4,
      groupName: 'Metro Hospitality Group',
      chainName: 'Urban Cafe & Bistro',
      brandName: 'Urban Brew House',
      subzoneName: 'Delhi NCR Central',
      status: 'ACTIVE',
      createdAt: '2026-08-08T14:30:00'
    },
    {
      clientId: 5,
      clientName: 'Apex Retail Superstores',
      contactPerson: 'Sunita Deshmukh',
      email: 's.deshmukh@apexmart.com',
      phone: '+91 98220 77889',
      address: 'Survey 45, Baner High Street',
      city: 'Pune',
      state: 'Maharashtra',
      gstin: '27AABCA7766E1Z2',
      groupId: 1,
      chainId: 2,
      brandId: 2,
      subzoneId: 6,
      groupName: 'Retail Hub India',
      chainName: 'Hub Hyper',
      brandName: 'Hub Daily Essentials',
      subzoneName: 'Pune West Auto & Tech',
      status: 'ACTIVE',
      createdAt: '2026-08-12T09:45:00'
    },
    {
      clientId: 6,
      clientName: 'Telangana Micro Devices Corp',
      contactPerson: 'Naveen Reddy',
      email: 'purchasing@tmdcorp.in',
      phone: '+91 98490 12345',
      address: 'Mindspace Cyberabad, Building 2B, HITEC City',
      city: 'Hyderabad',
      state: 'Telangana',
      gstin: '36AABCT4321H1Z0',
      groupId: 3,
      chainId: 5,
      brandId: 5,
      subzoneId: 5,
      groupName: 'Zenith Consumer Tech',
      chainName: 'Zenith SmartStores',
      brandName: 'Zenith Pulse Audio',
      subzoneName: 'Hyderabad Cyberabad',
      status: 'ACTIVE',
      createdAt: '2026-08-18T16:20:00'
    },
    {
      clientId: 7,
      clientName: 'Pacific Blue Apparel Retail',
      contactPerson: 'Ananya Sen',
      email: 'billing@pacificblue.co',
      phone: '+91 98301 99887',
      address: 'Park Street Corporate Towers, 4th Floor',
      city: 'Kolkata',
      state: 'West Bengal',
      gstin: '19AABCP1122J1Z8',
      groupId: 4,
      chainId: 1,
      brandId: 1,
      subzoneId: 1,
      groupName: 'Apex Fashion Collective',
      chainName: 'Hub Express',
      brandName: 'Hub Fresh Organics',
      subzoneName: 'North Mumbai Metro',
      status: 'ACTIVE',
      createdAt: '2026-08-25T11:10:00'
    }
  ],

  estimates: [
    {
      estimateId: 1,
      estimateNumber: 'CB-EST-2026-001',
      clientId: 1,
      clientName: 'Acme Retail Ventures Ltd',
      chainId: 1,
      chainName: 'Hub Express',
      estimateDate: '2026-09-01',
      validUntil: '2026-10-01',
      salespersonId: 2,
      salespersonName: 'John Doe',
      status: 'APPROVED',
      subtotal: 150000.0,
      discount: 10000.0,
      taxableAmount: 140000.0,
      gstRate: 18.0,
      gst: 25200.0,
      grandTotal: 165200.0,
      notes: 'Q3 POS Terminal rollout and enterprise barcode scanners integration',
      items: [
        { itemId: 1, description: 'Omni-directional 2D Barcode Scanners (USB-C)', quantity: 10, unitPrice: 8000.0, discount: 5000.0, tax: 13500.0, total: 88500.0 },
        { itemId: 2, description: 'Code-B POS Touch Terminals 15-inch Android 14', quantity: 5, unitPrice: 14000.0, discount: 5000.0, tax: 11700.0, total: 76700.0 }
      ]
    },
    {
      estimateId: 2,
      estimateNumber: 'CB-EST-2026-002',
      clientId: 2,
      clientName: 'Grand Metropolitan Hotels Pvt Ltd',
      chainId: 3,
      chainName: 'Royal Suites & Hotels',
      estimateDate: '2026-09-05',
      validUntil: '2026-10-05',
      salespersonId: 2,
      salespersonName: 'John Doe',
      status: 'CONVERTED',
      subtotal: 280000.0,
      discount: 15000.0,
      taxableAmount: 265000.0,
      gstRate: 18.0,
      gst: 47700.0,
      grandTotal: 312700.0,
      notes: 'Hotel ERP Guest Management & Digital Keyless Access integration',
      items: [
        { itemId: 3, description: 'RFID Keycard Encoders & Door Controllers', quantity: 8, unitPrice: 15000.0, discount: 5000.0, tax: 20700.0, total: 135700.0 },
        { itemId: 4, description: 'Code-B Hospitality PMS Cloud License (Annual)', quantity: 1, unitPrice: 160000.0, discount: 10000.0, tax: 27000.0, total: 177000.0 }
      ]
    },
    {
      estimateId: 3,
      estimateNumber: 'CB-EST-2026-003',
      clientId: 3,
      clientName: 'CyberTech Solutions India',
      chainId: 5,
      chainName: 'Zenith SmartStores',
      estimateDate: '2026-09-10',
      validUntil: '2026-10-10',
      salespersonId: 4,
      salespersonName: 'Michael Chang',
      status: 'SENT',
      subtotal: 85000.0,
      discount: 5000.0,
      taxableAmount: 80000.0,
      gstRate: 18.0,
      gst: 14400.0,
      grandTotal: 94400.0,
      notes: 'IoT Display kiosks and cloud monitoring subscription',
      items: [
        { itemId: 5, description: 'Smart IoT Shelf Sensor Kiosks 10.1-inch', quantity: 5, unitPrice: 17000.0, discount: 5000.0, tax: 14400.0, total: 94400.0 }
      ]
    },
    {
      estimateId: 4,
      estimateNumber: 'CB-EST-2026-004',
      clientId: 4,
      clientName: 'Urban Roast Hospitality',
      chainId: 4,
      chainName: 'Urban Cafe & Bistro',
      estimateDate: '2026-09-15',
      validUntil: '2026-09-30',
      salespersonId: 3,
      salespersonName: 'Sarah Jenkins',
      status: 'DRAFT',
      subtotal: 62000.0,
      discount: 2000.0,
      taxableAmount: 60000.0,
      gstRate: 18.0,
      gst: 10800.0,
      grandTotal: 70800.0,
      notes: 'Cafe billing touchscreens with thermal printer docks',
      items: [
        { itemId: 6, description: 'Compact Cafe Thermal Receipt Printers 80mm', quantity: 4, unitPrice: 8000.0, discount: 1000.0, tax: 5580.0, total: 36580.0 },
        { itemId: 7, description: 'Tablet Kitchen Display Units with Wall Mounts', quantity: 2, unitPrice: 15000.0, discount: 1000.0, tax: 5220.0, total: 34220.0 }
      ]
    },
    {
      estimateId: 5,
      estimateNumber: 'CB-EST-2026-005',
      clientId: 5,
      clientName: 'Apex Retail Superstores',
      chainId: 2,
      chainName: 'Hub Hyper',
      estimateDate: '2026-08-01',
      validUntil: '2026-08-31',
      salespersonId: 2,
      salespersonName: 'John Doe',
      status: 'EXPIRED',
      subtotal: 110000.0,
      discount: 10000.0,
      taxableAmount: 100000.0,
      gstRate: 18.0,
      gst: 18000.0,
      grandTotal: 118000.0,
      notes: 'Seasonal hypermarket inventory audit hardware suite',
      items: [
        { itemId: 8, description: 'Rugged Handheld Warehouse Scanners', quantity: 5, unitPrice: 22000.0, discount: 10000.0, tax: 18000.0, total: 118000.0 }
      ]
    }
  ],

  invoices: [
    {
      invoiceId: 1,
      invoiceNumber: 'CB-INV-2026-001',
      clientId: 2,
      clientName: 'Grand Metropolitan Hotels Pvt Ltd',
      chainId: 3,
      chainName: 'Royal Suites & Hotels',
      estimateId: 2,
      invoiceDate: '2026-09-08',
      dueDate: '2026-10-08',
      salespersonId: 2,
      salespersonName: 'John Doe',
      subtotal: 280000.0,
      discount: 15000.0,
      taxableAmount: 265000.0,
      gstRate: 18.0,
      gst: 47700.0,
      totalAmount: 312700.0,
      amountPaid: 312700.0,
      balanceDue: 0.0,
      status: 'PAID',
      notes: 'Converted from Estimate CB-EST-2026-002. Full payment received.',
      items: [
        { invoiceItemId: 1, description: 'RFID Keycard Encoders & Door Controllers', quantity: 8, unitPrice: 15000.0, discount: 5000.0, gst: 20700.0, total: 135700.0 },
        { invoiceItemId: 2, description: 'Code-B Hospitality PMS Cloud License (Annual)', quantity: 1, unitPrice: 160000.0, discount: 10000.0, gst: 27000.0, total: 177000.0 }
      ]
    },
    {
      invoiceId: 2,
      invoiceNumber: 'CB-INV-2026-002',
      clientId: 1,
      clientName: 'Acme Retail Ventures Ltd',
      chainId: 1,
      chainName: 'Hub Express',
      estimateId: 1,
      invoiceDate: '2026-09-12',
      dueDate: '2026-10-12',
      salespersonId: 2,
      salespersonName: 'John Doe',
      subtotal: 150000.0,
      discount: 10000.0,
      taxableAmount: 140000.0,
      gstRate: 18.0,
      gst: 25200.0,
      totalAmount: 165200.0,
      amountPaid: 80000.0,
      balanceDue: 85200.0,
      status: 'PARTIALLY_PAID',
      notes: 'Delivery phase 1 completed. 50% advance received.',
      items: [
        { invoiceItemId: 3, description: 'Omni-directional 2D Barcode Scanners (USB-C)', quantity: 10, unitPrice: 8000.0, discount: 5000.0, gst: 13500.0, total: 88500.0 },
        { invoiceItemId: 4, description: 'Code-B POS Touch Terminals 15-inch Android 14', quantity: 5, unitPrice: 14000.0, discount: 5000.0, gst: 11700.0, total: 76700.0 }
      ]
    },
    {
      invoiceId: 3,
      invoiceNumber: 'CB-INV-2026-003',
      clientId: 3,
      clientName: 'CyberTech Solutions India',
      chainId: 5,
      chainName: 'Zenith SmartStores',
      estimateId: null,
      invoiceDate: '2026-09-18',
      dueDate: '2026-10-18',
      salespersonId: 4,
      salespersonName: 'Michael Chang',
      subtotal: 120000.0,
      discount: 5000.0,
      taxableAmount: 115000.0,
      gstRate: 18.0,
      gst: 20700.0,
      totalAmount: 135700.0,
      amountPaid: 0.0,
      balanceDue: 135700.0,
      status: 'ISSUED',
      notes: 'Direct order for annual IoT telemetry API gateway subscriptions.',
      items: [
        { invoiceItemId: 5, description: 'IoT Telemetry Cloud API Gateway Enterprise SLA', quantity: 12, unitPrice: 10000.0, discount: 5000.0, gst: 20700.0, total: 135700.0 }
      ]
    },
    {
      invoiceId: 4,
      invoiceNumber: 'CB-INV-2026-004',
      clientId: 5,
      clientName: 'Apex Retail Superstores',
      chainId: 2,
      chainName: 'Hub Hyper',
      estimateId: null,
      invoiceDate: '2026-08-10',
      dueDate: '2026-09-10',
      salespersonId: 2,
      salespersonName: 'John Doe',
      subtotal: 95000.0,
      discount: 5000.0,
      taxableAmount: 90000.0,
      gstRate: 18.0,
      gst: 16200.0,
      totalAmount: 106200.0,
      amountPaid: 0.0,
      balanceDue: 106200.0,
      status: 'OVERDUE',
      notes: 'Hypermarket annual barcode maintenance SLA. Payment overdue.',
      items: [
        { invoiceItemId: 6, description: 'Annual Hypermarket Barcode Maintenance Contract', quantity: 1, unitPrice: 95000.0, discount: 5000.0, gst: 16200.0, total: 106200.0 }
      ]
    }
  ],

  payments: [
    {
      paymentId: 1,
      invoiceId: 1,
      invoiceNumber: 'CB-INV-2026-001',
      clientId: 2,
      clientName: 'Grand Metropolitan Hotels Pvt Ltd',
      paymentDate: '2026-09-10',
      paymentReference: 'HDFC-NEFT-99881122',
      paymentMethod: 'Bank Transfer',
      amount: 312700.0,
      status: 'SUCCESS',
      notes: 'Full invoice settlement received via corporate RTGS',
      recordedBy: 2,
      recordedByName: 'John Doe',
      createdAt: '2026-09-10T11:00:00'
    },
    {
      paymentId: 2,
      invoiceId: 2,
      invoiceNumber: 'CB-INV-2026-002',
      clientId: 1,
      clientName: 'Acme Retail Ventures Ltd',
      paymentDate: '2026-09-15',
      paymentReference: 'ICICI-UPI-88442211',
      paymentMethod: 'UPI',
      amount: 80000.0,
      status: 'SUCCESS',
      notes: 'Initial 50% milestone advance payment',
      recordedBy: 2,
      recordedByName: 'John Doe',
      createdAt: '2026-09-15T15:30:00'
    }
  ],

  settings: {
    company_name: 'Code-B Solutions Pvt Ltd',
    company_address: '402, Business Tower, Tech Park, Powai, Mumbai, Maharashtra - 400076',
    company_email: 'contact@codeb.com',
    company_phone: '+91 22 6123 4567',
    company_gstin: '27AAACC4112M1ZV',
    gst_rate: '18',
    invoice_prefix: 'CB-INV',
    estimate_prefix: 'CB-EST'
  },

  auditLogs: [
    { id: 1, action: 'SYSTEM_INIT', entity: 'System', entityId: '1', performedBy: 'System', timestamp: '2026-08-01T08:00:00', details: 'Database initialized with enterprise demo fixtures.' },
    { id: 2, action: 'CREATE', entity: 'User', entityId: '1', performedBy: 'System', timestamp: '2026-08-01T09:00:00', details: 'Admin user provisioned: admin@codeb.com' },
    { id: 3, action: 'CREATE', entity: 'Estimate', entityId: '1', performedBy: 'John Doe', timestamp: '2026-09-01T10:15:00', details: 'Estimate CB-EST-2026-001 issued for Acme Retail' },
    { id: 4, action: 'STATUS_UPDATE', entity: 'Estimate', entityId: '1', performedBy: 'Administrator', timestamp: '2026-09-02T14:20:00', details: 'Estimate approved' },
    { id: 5, action: 'PAYMENT_RECORDED', entity: 'Payment', entityId: '1', performedBy: 'John Doe', timestamp: '2026-09-10T11:00:00', details: 'Received INR 3,12,700 for CB-INV-2026-001 via RTGS' }
  ]
};

// In-memory fallback if localStorage is unavailable
let memoryDb = null;

function getDb() {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DB));
        return JSON.parse(JSON.stringify(INITIAL_DB));
      }
      return JSON.parse(raw);
    }
  } catch (err) {
    // ignore and use memory
  }
  if (!memoryDb) memoryDb = JSON.parse(JSON.stringify(INITIAL_DB));
  return memoryDb;
}

function saveDb(db) {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
      return;
    }
  } catch (err) {
    // ignore
  }
  memoryDb = db;
}

function successResponse(data, message = 'Success', status = 200, config = {}) {
  return {
    data: {
      success: true,
      message,
      data,
      status,
      timestamp: new Date().toISOString()
    },
    status,
    statusText: 'OK',
    headers: { 'content-type': 'application/json' },
    config,
    request: {}
  };
}

function errorResponse(message, status = 400, config = {}) {
  const err = new Error(message);
  err.response = {
    data: {
      success: false,
      message,
      status,
      timestamp: new Date().toISOString()
    },
    status,
    statusText: status === 401 ? 'Unauthorized' : status === 404 ? 'Not Found' : 'Bad Request',
    headers: { 'content-type': 'application/json' },
    config
  };
  return Promise.reject(err);
}

// PDF Generator using jsPDF
function generateInvoicePdfBlob(invoice, db) {
  const doc = new jsPDF();
  const settings = db.settings || {};

  // Header background
  doc.setFillColor(79, 70, 229);
  doc.rect(0, 0, 210, 30, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('TAX INVOICE', 14, 20);

  doc.setFontSize(10);
  doc.text(invoice.invoiceNumber || 'INV-001', 196, 20, { align: 'right' });

  // Company Details
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(settings.company_name || 'Code-B Solutions Pvt Ltd', 14, 42);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(settings.company_address || '402, Business Tower, Powai, Mumbai - 400076', 14, 48);
  doc.text(`GSTIN: ${settings.company_gstin || '27AAACC4112M1ZV'}  |  Email: ${settings.company_email || 'billing@codeb.com'}`, 14, 54);

  // Divider
  doc.setDrawColor(226, 232, 240);
  doc.line(14, 60, 196, 60);

  // Client & Invoice Meta
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('BILLED TO:', 14, 70);
  doc.text('INVOICE DETAILS:', 120, 70);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(invoice.clientName || 'Valued Client', 14, 76);
  doc.text(`Invoice Date: ${invoice.invoiceDate || 'N/A'}`, 120, 76);
  doc.text(`Due Date: ${invoice.dueDate || 'N/A'}`, 120, 82);
  doc.text(`Payment Status: ${invoice.status || 'ISSUED'}`, 120, 88);

  // Table Items
  const tableRows = (invoice.items || []).map((item, idx) => [
    idx + 1,
    item.description || 'Service/Item',
    item.quantity || 1,
    `INR ${Number(item.unitPrice || 0).toLocaleString('en-IN')}`,
    `INR ${Number(item.discount || 0).toLocaleString('en-IN')}`,
    `INR ${Number(item.gst || 0).toLocaleString('en-IN')}`,
    `INR ${Number(item.total || 0).toLocaleString('en-IN')}`
  ]);

  doc.autoTable({
    startY: 96,
    head: [['#', 'Description', 'Qty', 'Unit Price', 'Discount', 'GST (18%)', 'Total']],
    body: tableRows.length > 0 ? tableRows : [[1, 'Services as per agreement', 1, `INR ${invoice.subtotal}`, 'INR 0', `INR ${invoice.gst}`, `INR ${invoice.totalAmount}`]],
    headStyles: { fillColor: [79, 70, 229], textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { fontSize: 8, cellPadding: 3 },
    theme: 'grid'
  });

  const finalY = doc.lastAutoTable.finalY + 10;

  // Totals Box
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Subtotal:', 130, finalY);
  doc.text(`INR ${Number(invoice.subtotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 196, finalY, { align: 'right' });

  doc.text('Discount:', 130, finalY + 6);
  doc.text(`INR ${Number(invoice.discount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 196, finalY + 6, { align: 'right' });

  doc.text('GST (18%):', 130, finalY + 12);
  doc.text(`INR ${Number(invoice.gst || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 196, finalY + 12, { align: 'right' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Grand Total:', 130, finalY + 20);
  doc.text(`INR ${Number(invoice.totalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 196, finalY + 20, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Amount Paid:', 130, finalY + 26);
  doc.text(`INR ${Number(invoice.amountPaid || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 196, finalY + 26, { align: 'right' });

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(invoice.balanceDue > 0 ? 220 : 22, invoice.balanceDue > 0 ? 38 : 163, invoice.balanceDue > 0 ? 38 : 74);
  doc.text('Balance Due:', 130, finalY + 32);
  doc.text(`INR ${Number(invoice.balanceDue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 196, finalY + 32, { align: 'right' });

  // Footer
  doc.setTextColor(148, 163, 184);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('This is a computer-generated tax invoice verified by Code-B MIS System.', 105, 280, { align: 'center' });

  return doc.output('blob');
}

// Request Dispatcher
export async function handleMockRequest(config) {
  const db = getDb();
  const method = (config.method || 'get').toUpperCase();
  
  // Extract path from URL (remove query strings, protocols, and hostname)
  let path = config.url || '';
  if (path.startsWith('http')) {
    try {
      const u = new URL(path);
      path = u.pathname;
    } catch {
      // fallback regex
      path = path.replace(/^https?:\/\/[^\/]+/, '');
    }
  }
  if (!path.startsWith('/')) path = '/' + path;

  const params = config.params || {};
  let body = {};
  if (config.data) {
    if (typeof config.data === 'string') {
      try {
        body = JSON.parse(config.data);
      } catch {
        body = config.data;
      }
    } else {
      body = config.data;
    }
  }

  // ----------------------------------------------------
  // 1. AUTHENTICATION MODULE
  // ----------------------------------------------------
  if (path === '/api/auth/login' && method === 'POST') {
    const { email, password } = body;
    const user = db.users.find((u) => u.email?.toLowerCase() === email?.toLowerCase());
    if (!user || user.password !== password) {
      return errorResponse('Invalid email or password', 401, config);
    }
    if (user.status !== 'ACTIVE') {
      return errorResponse('Your account has been deactivated. Please contact an administrator.', 403, config);
    }

    const token = `mock-jwt-token-${user.userId}-${Date.now()}`;
    return successResponse(
      {
        token,
        userId: user.userId,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        status: user.status,
        phone: user.phone,
        department: user.department,
      },
      'Authentication successful',
      200,
      config
    );
  }

  if (path === '/api/auth/register' && method === 'POST') {
    const { fullName, email, password, phone, department } = body;
    if (db.users.some((u) => u.email?.toLowerCase() === email?.toLowerCase())) {
      return errorResponse('Email address is already registered', 400, config);
    }

    const newUser = {
      userId: db.users.length > 0 ? Math.max(...db.users.map((u) => u.userId)) + 1 : 1,
      fullName: fullName || 'New User',
      email,
      password: password || 'password123',
      role: 'SALES_PERSON',
      status: 'ACTIVE',
      phone: phone || '',
      department: department || 'Sales',
      createdAt: new Date().toISOString()
    };

    db.users.push(newUser);
    saveDb(db);

    const token = `mock-jwt-token-${newUser.userId}-${Date.now()}`;
    return successResponse(
      {
        token,
        userId: newUser.userId,
        fullName: newUser.fullName,
        email: newUser.email,
        role: newUser.role,
        status: newUser.status,
        phone: newUser.phone,
        department: newUser.department,
      },
      'User registered successfully',
      200,
      config
    );
  }

  if (path === '/api/auth/me' && method === 'GET') {
    const savedUser = localStorage.getItem('user');
    const u = savedUser ? JSON.parse(savedUser) : db.users[0];
    return successResponse(u, 'Current user profile', 200, config);
  }

  if (path === '/api/auth/forgot-password' && method === 'POST') {
    return successResponse(null, 'Password reset link sent to your registered email address.', 200, config);
  }

  if (path === '/api/auth/reset-password' && method === 'POST') {
    return successResponse(null, 'Your password has been reset successfully.', 200, config);
  }

  if (path === '/api/auth/profile/change-password' && method === 'PUT') {
    return successResponse(null, 'Password updated successfully.', 200, config);
  }

  if (path === '/api/auth/logout' && method === 'POST') {
    return successResponse(null, 'Logged out successfully', 200, config);
  }

  // ----------------------------------------------------
  // 2. DASHBOARD & REPORTS MODULE
  // ----------------------------------------------------
  if (path === '/api/dashboard/summary' && method === 'GET') {
    const activeInvoices = db.invoices.filter((i) => i.status !== 'CANCELLED');
    const totalSales = activeInvoices.reduce((acc, i) => acc + Number(i.totalAmount || 0), 0);
    const totalCollected = activeInvoices.reduce((acc, i) => acc + Number(i.amountPaid || 0), 0);
    const totalOutstanding = activeInvoices.reduce((acc, i) => acc + Number(i.balanceDue || 0), 0);
    const paidInvoices = activeInvoices.filter((i) => i.status === 'PAID').length;
    const overdueInvoices = activeInvoices.filter((i) => i.status === 'OVERDUE').length;

    const totalEstimates = db.estimates.length;
    const approvedEstimates = db.estimates.filter((e) => e.status === 'APPROVED').length;
    const convertedEstimates = db.estimates.filter((e) => e.status === 'CONVERTED').length;

    const totalClients = db.clients.length;
    const activeClients = db.clients.filter((c) => c.status === 'ACTIVE').length;

    const invoiceStatusDist = {};
    db.invoices.forEach((i) => {
      invoiceStatusDist[i.status] = (invoiceStatusDist[i.status] || 0) + 1;
    });

    const estimateStatusDist = {};
    db.estimates.forEach((e) => {
      estimateStatusDist[e.status] = (estimateStatusDist[e.status] || 0) + 1;
    });

    const summary = {
      totalSales,
      totalCollected,
      totalOutstanding,
      totalInvoices: db.invoices.length,
      paidInvoices,
      overdueInvoices,
      totalEstimates,
      approvedEstimates,
      convertedEstimates,
      totalClients,
      activeClients,
      monthlySales: [
        { month: 'Jul 2026', sales: 120000, collected: 95000 },
        { month: 'Aug 2026', sales: 205000, collected: 175000 },
        { month: 'Sep 2026', sales: totalSales > 0 ? totalSales : 312700, collected: totalCollected > 0 ? totalCollected : 80000 }
      ],
      invoiceStatusDistribution: invoiceStatusDist,
      estimateStatusDistribution: estimateStatusDist,
      recentInvoices: db.invoices.slice(0, 5),
      recentEstimates: db.estimates.slice(0, 5)
    };

    return successResponse(summary, 'Dashboard metrics', 200, config);
  }

  if (path === '/api/reports/sales' && method === 'GET') {
    let list = db.invoices.filter((i) => i.status !== 'CANCELLED');
    if (params.clientId) {
      list = list.filter((i) => String(i.clientId) === String(params.clientId));
    }
    const totalBilled = list.reduce((sum, i) => sum + Number(i.totalAmount || 0), 0);
    const totalPaid = list.reduce((sum, i) => sum + Number(i.amountPaid || 0), 0);
    const totalDue = list.reduce((sum, i) => sum + Number(i.balanceDue || 0), 0);

    return successResponse(
      {
        invoicesCount: list.length,
        totalBilled,
        totalPaid,
        totalDue,
        invoices: list
      },
      'Sales report',
      200,
      config
    );
  }

  if (path === '/api/reports/outstanding' && method === 'GET') {
    let list = db.invoices.filter((i) => i.status !== 'CANCELLED' && i.status !== 'PAID');
    if (params.clientId) {
      list = list.filter((i) => String(i.clientId) === String(params.clientId));
    }
    const totalOutstanding = list.reduce((sum, i) => sum + Number(i.balanceDue || 0), 0);

    return successResponse(
      {
        count: list.length,
        totalOutstanding,
        invoices: list
      },
      'Outstanding report',
      200,
      config
    );
  }

  // CSV Exports
  if (path === '/api/reports/export/invoices' && method === 'GET') {
    let csv = 'Invoice Number,Date,Due Date,Client Name,Salesperson,Subtotal,Discount,GST,Total,Amount Paid,Balance Due,Status\n';
    db.invoices.forEach((i) => {
      csv += `"${i.invoiceNumber}","${i.invoiceDate}","${i.dueDate}","${(i.clientName || '').replace(/"/g, '""')}","${(i.salespersonName || '').replace(/"/g, '""')}",${i.subtotal},${i.discount},${i.gst},${i.totalAmount},${i.amountPaid},${i.balanceDue},"${i.status}"\n`;
    });
    return { data: csv, status: 200, statusText: 'OK', headers: { 'content-type': 'text/csv' }, config };
  }

  if (path === '/api/reports/export/estimates' && method === 'GET') {
    let csv = 'Estimate Number,Date,Valid Until,Client Name,Salesperson,Subtotal,Discount,GST,Grand Total,Status\n';
    db.estimates.forEach((e) => {
      csv += `"${e.estimateNumber}","${e.estimateDate}","${e.validUntil}","${(e.clientName || '').replace(/"/g, '""')}","${(e.salespersonName || '').replace(/"/g, '""')}",${e.subtotal},${e.discount},${e.gst},${e.grandTotal},"${e.status}"\n`;
    });
    return { data: csv, status: 200, statusText: 'OK', headers: { 'content-type': 'text/csv' }, config };
  }

  if (path === '/api/reports/export/payments' && method === 'GET') {
    let csv = 'Payment ID,Invoice Number,Client Name,Date,Method,Reference,Amount,Status\n';
    db.payments.forEach((p) => {
      csv += `${p.paymentId},"${p.invoiceNumber}","${(p.clientName || '').replace(/"/g, '""')}","${p.paymentDate}","${p.paymentMethod}","${p.paymentReference}",${p.amount},"${p.status}"\n`;
    });
    return { data: csv, status: 200, statusText: 'OK', headers: { 'content-type': 'text/csv' }, config };
  }

  if (path === '/api/reports/export/clients' && method === 'GET') {
    let csv = 'Client ID,Name,Contact Person,Email,Phone,City,State,GSTIN,Status\n';
    db.clients.forEach((c) => {
      csv += `${c.clientId},"${(c.clientName || '').replace(/"/g, '""')}","${(c.contactPerson || '').replace(/"/g, '""')}","${c.email}","${c.phone}","${c.city}","${c.state}","${c.gstin}","${c.status}"\n`;
    });
    return { data: csv, status: 200, statusText: 'OK', headers: { 'content-type': 'text/csv' }, config };
  }

  // ----------------------------------------------------
  // 3. USERS MANAGEMENT MODULE
  // ----------------------------------------------------
  if (path === '/api/users' && method === 'GET') {
    let list = [...db.users];
    if (params.search) {
      const q = params.search.toLowerCase();
      list = list.filter((u) => u.fullName?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q));
    }
    if (params.role) list = list.filter((u) => u.role === params.role);
    if (params.status) list = list.filter((u) => u.status === params.status);

    return successResponse(
      {
        content: list,
        totalElements: list.length,
        totalPages: Math.ceil(list.length / (params.size || 10)) || 1,
        number: Number(params.page || 0),
        size: Number(params.size || 10)
      },
      'Users list',
      200,
      config
    );
  }

  if (path === '/api/users' && method === 'POST') {
    const newUser = {
      userId: db.users.length > 0 ? Math.max(...db.users.map((u) => u.userId)) + 1 : 1,
      fullName: body.fullName || 'New User',
      email: body.email,
      password: body.password || 'welcome123',
      role: body.role || 'SALES_PERSON',
      status: body.status || 'ACTIVE',
      phone: body.phone || '',
      department: body.department || 'Sales',
      createdAt: new Date().toISOString()
    };
    db.users.push(newUser);
    saveDb(db);
    return successResponse(newUser, 'User created successfully', 201, config);
  }

  const userToggleMatch = path.match(/^\/api\/users\/(\d+)\/toggle-status$/);
  if (userToggleMatch && method === 'PATCH') {
    const id = Number(userToggleMatch[1]);
    const u = db.users.find((x) => x.userId === id);
    if (u) {
      u.status = u.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      saveDb(db);
      return successResponse(u, `User status updated to ${u.status}`, 200, config);
    }
    return errorResponse('User not found', 404, config);
  }

  const userByIdMatch = path.match(/^\/api\/users\/(\d+)$/);
  if (userByIdMatch) {
    const id = Number(userByIdMatch[1]);
    const u = db.users.find((x) => x.userId === id);
    if (!u) return errorResponse('User not found', 404, config);

    if (method === 'GET') return successResponse(u, 'User found', 200, config);
    if (method === 'PUT') {
      Object.assign(u, body);
      saveDb(db);
      return successResponse(u, 'User updated successfully', 200, config);
    }
    if (method === 'DELETE') {
      db.users = db.users.filter((x) => x.userId !== id);
      saveDb(db);
      return successResponse(null, 'User deleted successfully', 200, config);
    }
  }

  // ----------------------------------------------------
  // 4. CLIENTS MODULE
  // ----------------------------------------------------
  if (path === '/api/clients/active' && method === 'GET') {
    const active = db.clients.filter((c) => c.status === 'ACTIVE');
    return successResponse(active, 'Active clients', 200, config);
  }

  if (path === '/api/clients' && method === 'GET') {
    let list = [...db.clients];
    if (params.search) {
      const q = params.search.toLowerCase();
      list = list.filter(
        (c) =>
          c.clientName?.toLowerCase().includes(q) ||
          c.contactPerson?.toLowerCase().includes(q) ||
          c.email?.toLowerCase().includes(q) ||
          c.gstin?.toLowerCase().includes(q)
      );
    }
    if (params.status) list = list.filter((c) => c.status === params.status);

    return successResponse(
      {
        content: list,
        totalElements: list.length,
        totalPages: Math.ceil(list.length / (params.size || 10)) || 1,
        number: Number(params.page || 0),
        size: Number(params.size || 10)
      },
      'Clients list',
      200,
      config
    );
  }

  if (path === '/api/clients' && method === 'POST') {
    const group = db.groups.find((g) => String(g.groupId) === String(body.groupId));
    const chain = db.chains.find((ch) => String(ch.chainId) === String(body.chainId));
    const brand = db.brands.find((b) => String(b.brandId) === String(body.brandId));
    const subzone = db.subzones.find((s) => String(s.subzoneId) === String(body.subzoneId));

    const newClient = {
      clientId: db.clients.length > 0 ? Math.max(...db.clients.map((c) => c.clientId)) + 1 : 1,
      ...body,
      groupName: group?.groupName || '',
      chainName: chain?.chainName || '',
      brandName: brand?.brandName || '',
      subzoneName: subzone?.subzoneName || '',
      status: body.status || 'ACTIVE',
      createdAt: new Date().toISOString()
    };
    db.clients.push(newClient);
    saveDb(db);
    return successResponse(newClient, 'Client registered successfully', 201, config);
  }

  // Client sub-resources
  const clientEstMatch = path.match(/^\/api\/clients\/(\d+)\/estimates$/);
  if (clientEstMatch && method === 'GET') {
    const id = Number(clientEstMatch[1]);
    const est = db.estimates.filter((e) => Number(e.clientId) === id);
    return successResponse(est, 'Client estimates', 200, config);
  }

  const clientInvMatch = path.match(/^\/api\/clients\/(\d+)\/invoices$/);
  if (clientInvMatch && method === 'GET') {
    const id = Number(clientInvMatch[1]);
    const inv = db.invoices.filter((i) => Number(i.clientId) === id);
    return successResponse(inv, 'Client invoices', 200, config);
  }

  const clientPayMatch = path.match(/^\/api\/clients\/(\d+)\/payments$/);
  if (clientPayMatch && method === 'GET') {
    const id = Number(clientPayMatch[1]);
    const pay = db.payments.filter((p) => Number(p.clientId) === id);
    return successResponse(pay, 'Client payments', 200, config);
  }

  const clientByIdMatch = path.match(/^\/api\/clients\/(\d+)$/);
  if (clientByIdMatch) {
    const id = Number(clientByIdMatch[1]);
    const client = db.clients.find((c) => c.clientId === id);
    if (!client) return errorResponse('Client not found', 404, config);

    if (method === 'GET') return successResponse(client, 'Client details', 200, config);
    if (method === 'PUT') {
      Object.assign(client, body);
      saveDb(db);
      return successResponse(client, 'Client updated successfully', 200, config);
    }
    if (method === 'DELETE') {
      db.clients = db.clients.filter((c) => c.clientId !== id);
      saveDb(db);
      return successResponse(null, 'Client deleted successfully', 200, config);
    }
  }

  // ----------------------------------------------------
  // 5. HIERARCHY MODULE (Groups, Chains, Brands, Subzones)
  // ----------------------------------------------------
  // Groups
  if (path === '/api/groups/active' && method === 'GET') {
    return successResponse(db.groups.filter((g) => g.status === 'ACTIVE'), 'Active groups', 200, config);
  }
  if (path === '/api/groups' && method === 'GET') {
    return successResponse({ content: db.groups, totalElements: db.groups.length }, 'Groups list', 200, config);
  }
  if (path === '/api/groups' && method === 'POST') {
    const newGroup = { groupId: Date.now(), status: 'ACTIVE', ...body };
    db.groups.push(newGroup);
    saveDb(db);
    return successResponse(newGroup, 'Group created', 201, config);
  }
  const groupByIdMatch = path.match(/^\/api\/groups\/(\d+)$/);
  if (groupByIdMatch) {
    const id = Number(groupByIdMatch[1]);
    const idx = db.groups.findIndex((g) => g.groupId === id);
    if (method === 'GET') return successResponse(db.groups[idx], 'Group details', 200, config);
    if (method === 'PUT') {
      Object.assign(db.groups[idx], body);
      saveDb(db);
      return successResponse(db.groups[idx], 'Group updated', 200, config);
    }
    if (method === 'DELETE') {
      db.groups.splice(idx, 1);
      saveDb(db);
      return successResponse(null, 'Group deleted', 200, config);
    }
  }

  // Chains
  if (path === '/api/chains/active' && method === 'GET') {
    return successResponse(db.chains.filter((c) => c.status === 'ACTIVE'), 'Active chains', 200, config);
  }
  const chainByGroupMatch = path.match(/^\/api\/chains\/by-group\/(\d+)$/);
  if (chainByGroupMatch && method === 'GET') {
    const gid = Number(chainByGroupMatch[1]);
    return successResponse(db.chains.filter((c) => Number(c.groupId) === gid), 'Chains by group', 200, config);
  }
  if (path === '/api/chains' && method === 'GET') {
    return successResponse({ content: db.chains, totalElements: db.chains.length }, 'Chains list', 200, config);
  }
  if (path === '/api/chains' && method === 'POST') {
    const group = db.groups.find((g) => Number(g.groupId) === Number(body.groupId));
    const newChain = { chainId: Date.now(), groupName: group?.groupName || '', status: 'ACTIVE', ...body };
    db.chains.push(newChain);
    saveDb(db);
    return successResponse(newChain, 'Chain created', 201, config);
  }
  const chainByIdMatch = path.match(/^\/api\/chains\/(\d+)$/);
  if (chainByIdMatch) {
    const id = Number(chainByIdMatch[1]);
    const idx = db.chains.findIndex((c) => c.chainId === id);
    if (method === 'GET') return successResponse(db.chains[idx], 'Chain details', 200, config);
    if (method === 'PUT') {
      Object.assign(db.chains[idx], body);
      saveDb(db);
      return successResponse(db.chains[idx], 'Chain updated', 200, config);
    }
    if (method === 'DELETE') {
      db.chains.splice(idx, 1);
      saveDb(db);
      return successResponse(null, 'Chain deleted', 200, config);
    }
  }

  // Brands
  if (path === '/api/brands/active' && method === 'GET') {
    return successResponse(db.brands.filter((b) => b.status === 'ACTIVE'), 'Active brands', 200, config);
  }
  const brandByChainMatch = path.match(/^\/api\/brands\/by-chain\/(\d+)$/);
  if (brandByChainMatch && method === 'GET') {
    const cid = Number(brandByChainMatch[1]);
    return successResponse(db.brands.filter((b) => Number(b.chainId) === cid), 'Brands by chain', 200, config);
  }
  if (path === '/api/brands' && method === 'GET') {
    return successResponse({ content: db.brands, totalElements: db.brands.length }, 'Brands list', 200, config);
  }
  if (path === '/api/brands' && method === 'POST') {
    const chain = db.chains.find((c) => Number(c.chainId) === Number(body.chainId));
    const newBrand = { brandId: Date.now(), chainName: chain?.chainName || '', status: 'ACTIVE', ...body };
    db.brands.push(newBrand);
    saveDb(db);
    return successResponse(newBrand, 'Brand created', 201, config);
  }
  const brandByIdMatch = path.match(/^\/api\/brands\/(\d+)$/);
  if (brandByIdMatch) {
    const id = Number(brandByIdMatch[1]);
    const idx = db.brands.findIndex((b) => b.brandId === id);
    if (method === 'GET') return successResponse(db.brands[idx], 'Brand details', 200, config);
    if (method === 'PUT') {
      Object.assign(db.brands[idx], body);
      saveDb(db);
      return successResponse(db.brands[idx], 'Brand updated', 200, config);
    }
    if (method === 'DELETE') {
      db.brands.splice(idx, 1);
      saveDb(db);
      return successResponse(null, 'Brand deleted', 200, config);
    }
  }

  // Subzones
  if (path === '/api/subzones/active' && method === 'GET') {
    return successResponse(db.subzones.filter((s) => s.status === 'ACTIVE'), 'Active subzones', 200, config);
  }
  if (path === '/api/subzones' && method === 'GET') {
    return successResponse({ content: db.subzones, totalElements: db.subzones.length }, 'Subzones list', 200, config);
  }
  if (path === '/api/subzones' && method === 'POST') {
    const newSubzone = { subzoneId: Date.now(), status: 'ACTIVE', ...body };
    db.subzones.push(newSubzone);
    saveDb(db);
    return successResponse(newSubzone, 'Subzone created', 201, config);
  }
  const subzoneByIdMatch = path.match(/^\/api\/subzones\/(\d+)$/);
  if (subzoneByIdMatch) {
    const id = Number(subzoneByIdMatch[1]);
    const idx = db.subzones.findIndex((s) => s.subzoneId === id);
    if (method === 'GET') return successResponse(db.subzones[idx], 'Subzone details', 200, config);
    if (method === 'PUT') {
      Object.assign(db.subzones[idx], body);
      saveDb(db);
      return successResponse(db.subzones[idx], 'Subzone updated', 200, config);
    }
    if (method === 'DELETE') {
      db.subzones.splice(idx, 1);
      saveDb(db);
      return successResponse(null, 'Subzone deleted', 200, config);
    }
  }

  // ----------------------------------------------------
  // 6. ESTIMATES MODULE
  // ----------------------------------------------------
  if (path === '/api/estimates' && method === 'GET') {
    let list = [...db.estimates];
    if (params.search) {
      const q = params.search.toLowerCase();
      list = list.filter((e) => e.estimateNumber?.toLowerCase().includes(q) || e.clientName?.toLowerCase().includes(q));
    }
    if (params.status) list = list.filter((e) => e.status === params.status);

    return successResponse(
      {
        content: list,
        totalElements: list.length,
        totalPages: Math.ceil(list.length / (params.size || 10)) || 1,
        number: Number(params.page || 0),
        size: Number(params.size || 10)
      },
      'Estimates list',
      200,
      config
    );
  }

  if (path === '/api/estimates' && method === 'POST') {
    const client = db.clients.find((c) => Number(c.clientId) === Number(body.clientId));
    const chain = db.chains.find((c) => Number(c.chainId) === Number(body.chainId));
    const nextId = db.estimates.length > 0 ? Math.max(...db.estimates.map((e) => e.estimateId)) + 1 : 1;
    const estimateNumber = `CB-EST-${new Date().getFullYear()}-${String(nextId).padStart(3, '0')}`;

    const items = (body.items || []).map((item, idx) => {
      const qty = Number(item.quantity || 1);
      const price = Number(item.unitPrice || 0);
      const disc = Number(item.discount || 0);
      const taxable = Math.max(0, qty * price - disc);
      const tax = taxable * 0.18;
      return {
        itemId: idx + 1,
        description: item.description,
        quantity: qty,
        unitPrice: price,
        discount: disc,
        tax,
        total: taxable + tax
      };
    });

    const subtotal = items.reduce((sum, it) => sum + it.quantity * it.unitPrice, 0);
    const totalDiscount = items.reduce((sum, it) => sum + it.discount, 0);
    const taxableAmount = Math.max(0, subtotal - totalDiscount);
    const gst = taxableAmount * 0.18;
    const grandTotal = taxableAmount + gst;

    const newEstimate = {
      estimateId: nextId,
      estimateNumber,
      clientId: body.clientId,
      clientName: client?.clientName || 'Client',
      chainId: body.chainId,
      chainName: chain?.chainName || 'Chain',
      estimateDate: body.estimateDate || new Date().toISOString().split('T')[0],
      validUntil: body.validUntil || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      salespersonId: body.salespersonId || 2,
      salespersonName: 'John Doe',
      status: 'DRAFT',
      subtotal,
      discount: totalDiscount,
      taxableAmount,
      gstRate: 18.0,
      gst,
      grandTotal,
      notes: body.notes || '',
      items
    };

    db.estimates.unshift(newEstimate);
    saveDb(db);
    return successResponse(newEstimate, 'Estimate created successfully', 201, config);
  }

  // Estimate actions
  const estApproveMatch = path.match(/^\/api\/estimates\/(\d+)\/approve$/);
  if (estApproveMatch && method === 'POST') {
    const id = Number(estApproveMatch[1]);
    const est = db.estimates.find((e) => e.estimateId === id);
    if (est) {
      est.status = 'APPROVED';
      saveDb(db);
      return successResponse(est, 'Estimate approved', 200, config);
    }
    return errorResponse('Estimate not found', 404, config);
  }

  const estRejectMatch = path.match(/^\/api\/estimates\/(\d+)\/reject$/);
  if (estRejectMatch && method === 'POST') {
    const id = Number(estRejectMatch[1]);
    const est = db.estimates.find((e) => e.estimateId === id);
    if (est) {
      est.status = 'REJECTED';
      saveDb(db);
      return successResponse(est, 'Estimate rejected', 200, config);
    }
    return errorResponse('Estimate not found', 404, config);
  }

  const estConvertMatch = path.match(/^\/api\/estimates\/(\d+)\/convert-to-invoice$/);
  if (estConvertMatch && method === 'POST') {
    const id = Number(estConvertMatch[1]);
    const est = db.estimates.find((e) => e.estimateId === id);
    if (!est) return errorResponse('Estimate not found', 404, config);

    est.status = 'CONVERTED';

    const nextInvId = db.invoices.length > 0 ? Math.max(...db.invoices.map((i) => i.invoiceId)) + 1 : 1;
    const invNumber = `CB-INV-${new Date().getFullYear()}-${String(nextInvId).padStart(3, '0')}`;

    const newInvoice = {
      invoiceId: nextInvId,
      invoiceNumber: invNumber,
      clientId: est.clientId,
      clientName: est.clientName,
      chainId: est.chainId,
      chainName: est.chainName,
      estimateId: est.estimateId,
      invoiceDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      salespersonId: est.salespersonId,
      salespersonName: est.salespersonName,
      subtotal: est.subtotal,
      discount: est.discount,
      taxableAmount: est.taxableAmount,
      gstRate: est.gstRate,
      gst: est.gst,
      totalAmount: est.grandTotal,
      amountPaid: 0.0,
      balanceDue: est.grandTotal,
      status: 'ISSUED',
      notes: `Converted from Estimate ${est.estimateNumber}. ${est.notes || ''}`,
      items: (est.items || []).map((it, idx) => ({
        invoiceItemId: idx + 1,
        description: it.description,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        discount: it.discount,
        gst: it.tax,
        total: it.total
      }))
    };

    db.invoices.unshift(newInvoice);
    saveDb(db);
    return successResponse(newInvoice, 'Estimate converted to Invoice successfully', 200, config);
  }

  const estByIdMatch = path.match(/^\/api\/estimates\/(\d+)$/);
  if (estByIdMatch) {
    const id = Number(estByIdMatch[1]);
    const est = db.estimates.find((e) => e.estimateId === id);
    if (!est) return errorResponse('Estimate not found', 404, config);

    if (method === 'GET') return successResponse(est, 'Estimate details', 200, config);
    if (method === 'PUT') {
      Object.assign(est, body);
      saveDb(db);
      return successResponse(est, 'Estimate updated successfully', 200, config);
    }
    if (method === 'DELETE') {
      db.estimates = db.estimates.filter((e) => e.estimateId !== id);
      saveDb(db);
      return successResponse(null, 'Estimate deleted', 200, config);
    }
  }

  // ----------------------------------------------------
  // 7. INVOICES MODULE
  // ----------------------------------------------------
  if (path === '/api/invoices' && method === 'GET') {
    let list = [...db.invoices];
    if (params.search) {
      const q = params.search.toLowerCase();
      list = list.filter((i) => i.invoiceNumber?.toLowerCase().includes(q) || i.clientName?.toLowerCase().includes(q));
    }
    if (params.status) list = list.filter((i) => i.status === params.status);

    return successResponse(
      {
        content: list,
        totalElements: list.length,
        totalPages: Math.ceil(list.length / (params.size || 10)) || 1,
        number: Number(params.page || 0),
        size: Number(params.size || 10)
      },
      'Invoices list',
      200,
      config
    );
  }

  if (path === '/api/invoices' && method === 'POST') {
    const client = db.clients.find((c) => Number(c.clientId) === Number(body.clientId));
    const chain = db.chains.find((c) => Number(c.chainId) === Number(body.chainId));
    const nextId = db.invoices.length > 0 ? Math.max(...db.invoices.map((i) => i.invoiceId)) + 1 : 1;
    const invoiceNumber = `CB-INV-${new Date().getFullYear()}-${String(nextId).padStart(3, '0')}`;

    const items = (body.items || []).map((item, idx) => {
      const qty = Number(item.quantity || 1);
      const price = Number(item.unitPrice || 0);
      const disc = Number(item.discount || 0);
      const taxable = Math.max(0, qty * price - disc);
      const tax = taxable * 0.18;
      return {
        invoiceItemId: idx + 1,
        description: item.description,
        quantity: qty,
        unitPrice: price,
        discount: disc,
        gst: tax,
        total: taxable + tax
      };
    });

    const subtotal = items.reduce((sum, it) => sum + it.quantity * it.unitPrice, 0);
    const totalDiscount = items.reduce((sum, it) => sum + it.discount, 0);
    const taxableAmount = Math.max(0, subtotal - totalDiscount);
    const gst = taxableAmount * 0.18;
    const totalAmount = taxableAmount + gst;

    const newInvoice = {
      invoiceId: nextId,
      invoiceNumber,
      clientId: body.clientId,
      clientName: client?.clientName || 'Client',
      chainId: body.chainId,
      chainName: chain?.chainName || 'Chain',
      estimateId: body.estimateId || null,
      invoiceDate: body.invoiceDate || new Date().toISOString().split('T')[0],
      dueDate: body.dueDate || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      salespersonId: body.salespersonId || 2,
      salespersonName: 'John Doe',
      subtotal,
      discount: totalDiscount,
      taxableAmount,
      gstRate: 18.0,
      gst,
      totalAmount,
      amountPaid: 0.0,
      balanceDue: totalAmount,
      status: 'ISSUED',
      notes: body.notes || '',
      items
    };

    db.invoices.unshift(newInvoice);
    saveDb(db);
    return successResponse(newInvoice, 'Invoice created successfully', 201, config);
  }

  // Invoice PDF Generation
  const invPdfMatch = path.match(/^\/api\/invoices\/(\d+)\/pdf$/);
  if (invPdfMatch && method === 'GET') {
    const id = Number(invPdfMatch[1]);
    const inv = db.invoices.find((i) => i.invoiceId === id);
    if (!inv) return errorResponse('Invoice not found', 404, config);

    const pdfBlob = generateInvoicePdfBlob(inv, db);
    return {
      data: pdfBlob,
      status: 200,
      statusText: 'OK',
      headers: { 'content-type': 'application/pdf' },
      config
    };
  }

  // Invoice Cancel
  const invCancelMatch = path.match(/^\/api\/invoices\/(\d+)\/cancel$/);
  if (invCancelMatch && method === 'POST') {
    const id = Number(invCancelMatch[1]);
    const inv = db.invoices.find((i) => i.invoiceId === id);
    if (inv) {
      inv.status = 'CANCELLED';
      saveDb(db);
      return successResponse(inv, 'Invoice cancelled', 200, config);
    }
    return errorResponse('Invoice not found', 404, config);
  }

  const invByIdMatch = path.match(/^\/api\/invoices\/(\d+)$/);
  if (invByIdMatch) {
    const id = Number(invByIdMatch[1]);
    const inv = db.invoices.find((i) => i.invoiceId === id);
    if (!inv) return errorResponse('Invoice not found', 404, config);

    if (method === 'GET') return successResponse(inv, 'Invoice details', 200, config);
    if (method === 'PUT') {
      Object.assign(inv, body);
      saveDb(db);
      return successResponse(inv, 'Invoice updated successfully', 200, config);
    }
    if (method === 'DELETE') {
      db.invoices = db.invoices.filter((i) => i.invoiceId !== id);
      saveDb(db);
      return successResponse(null, 'Invoice deleted', 200, config);
    }
  }

  // ----------------------------------------------------
  // 8. PAYMENTS MODULE
  // ----------------------------------------------------
  const payByInvMatch = path.match(/^\/api\/payments\/invoice\/(\d+)$/);
  if (payByInvMatch && method === 'GET') {
    const invId = Number(payByInvMatch[1]);
    const list = db.payments.filter((p) => Number(p.invoiceId) === invId);
    return successResponse(list, 'Payments for invoice', 200, config);
  }

  if (path === '/api/payments' && method === 'GET') {
    let list = [...db.payments];
    if (params.search) {
      const q = params.search.toLowerCase();
      list = list.filter((p) => p.paymentReference?.toLowerCase().includes(q) || p.clientName?.toLowerCase().includes(q));
    }
    return successResponse(
      {
        content: list,
        totalElements: list.length,
        totalPages: Math.ceil(list.length / (params.size || 10)) || 1,
        number: Number(params.page || 0),
        size: Number(params.size || 10)
      },
      'Payments list',
      200,
      config
    );
  }

  if (path === '/api/payments' && method === 'POST') {
    const invoice = db.invoices.find((i) => Number(i.invoiceId) === Number(body.invoiceId));
    if (!invoice) return errorResponse('Target invoice not found', 404, config);

    const payAmount = Number(body.amount || 0);
    if (payAmount <= 0) return errorResponse('Payment amount must be greater than zero', 400, config);
    if (payAmount > Number(invoice.balanceDue) + 0.01) {
      return errorResponse(`Payment amount (INR ${payAmount}) exceeds invoice balance due (INR ${invoice.balanceDue})`, 400, config);
    }

    const nextId = db.payments.length > 0 ? Math.max(...db.payments.map((p) => p.paymentId)) + 1 : 1;
    const newPayment = {
      paymentId: nextId,
      invoiceId: invoice.invoiceId,
      invoiceNumber: invoice.invoiceNumber,
      clientId: invoice.clientId,
      clientName: invoice.clientName,
      paymentDate: body.paymentDate || new Date().toISOString().split('T')[0],
      paymentReference: body.paymentReference || `PAY-${Date.now()}`,
      paymentMethod: body.paymentMethod || 'Bank Transfer',
      amount: payAmount,
      status: 'SUCCESS',
      notes: body.notes || 'Payment recorded',
      recordedBy: 2,
      recordedByName: 'John Doe',
      createdAt: new Date().toISOString()
    };

    // Update invoice balance and status
    invoice.amountPaid = Number(invoice.amountPaid || 0) + payAmount;
    invoice.balanceDue = Math.max(0, Number(invoice.totalAmount) - invoice.amountPaid);
    if (invoice.balanceDue <= 0.01) {
      invoice.status = 'PAID';
    } else {
      invoice.status = 'PARTIALLY_PAID';
    }

    db.payments.unshift(newPayment);
    saveDb(db);
    return successResponse(newPayment, 'Payment recorded successfully', 201, config);
  }

  // ----------------------------------------------------
  // 9. SETTINGS & AUDIT LOGS MODULE
  // ----------------------------------------------------
  if (path === '/api/settings' && method === 'GET') {
    return successResponse(db.settings, 'System settings', 200, config);
  }

  const settingKeyMatch = path.match(/^\/api\/settings\/(.+)$/);
  if (settingKeyMatch && method === 'PUT') {
    const key = settingKeyMatch[1];
    db.settings[key] = body.value !== undefined ? body.value : body;
    saveDb(db);
    return successResponse(db.settings, 'Setting updated', 200, config);
  }

  if (path === '/api/audit-logs' && method === 'GET') {
    return successResponse(
      {
        content: db.auditLogs,
        totalElements: db.auditLogs.length,
        totalPages: 1,
        number: 0,
        size: 10
      },
      'Audit logs',
      200,
      config
    );
  }

  // Health check
  if (path === '/api/health' && method === 'GET') {
    return successResponse({ status: 'UP', mode: 'EMBEDDED_MOCK_STORAGE' }, 'System healthy', 200, config);
  }

  // Fallback for unhandled endpoints
  console.warn(`[Mock Backend] Unhandled endpoint: ${method} ${path}`);
  return successResponse({}, 'OK', 200, config);
}
