import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';

// Layouts & Route Protection
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Auth Pages
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// Application Pages
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import ClientDetails from './pages/ClientDetails';
import Groups from './pages/Groups';
import Chains from './pages/Chains';
import Brands from './pages/Brands';
import Subzones from './pages/Subzones';
import Estimates from './pages/Estimates';
import EstimateDetails from './pages/EstimateDetails';
import EstimateForm from './pages/EstimateForm';
import Invoices from './pages/Invoices';
import InvoiceDetails from './pages/InvoiceDetails';
import InvoiceForm from './pages/InvoiceForm';
import Payments from './pages/Payments';
import Reports from './pages/Reports';
import Users from './pages/Users';
import Settings from './pages/Settings';
import AuditLogs from './pages/AuditLogs';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import Unauthorized from './pages/Unauthorized';

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            {/* Public Auth Routes */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
            </Route>

            {/* Protected Application Routes */}
            <Route
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />

              {/* Clients */}
              <Route path="/clients" element={<Clients />} />
              <Route path="/clients/:id" element={<ClientDetails />} />

              {/* Hierarchy Management (Admin Only) */}
              <Route
                path="/groups"
                element={
                  <ProtectedRoute adminOnly>
                    <Groups />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/chains"
                element={
                  <ProtectedRoute adminOnly>
                    <Chains />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/brands"
                element={
                  <ProtectedRoute adminOnly>
                    <Brands />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/subzones"
                element={
                  <ProtectedRoute adminOnly>
                    <Subzones />
                  </ProtectedRoute>
                }
              />

              {/* Estimates */}
              <Route path="/estimates" element={<Estimates />} />
              <Route path="/estimates/new" element={<EstimateForm />} />
              <Route path="/estimates/:id" element={<EstimateDetails />} />
              <Route path="/estimates/:id/edit" element={<EstimateForm />} />

              {/* Invoices */}
              <Route path="/invoices" element={<Invoices />} />
              <Route path="/invoices/new" element={<InvoiceForm />} />
              <Route path="/invoices/:id" element={<InvoiceDetails />} />
              <Route path="/invoices/:id/edit" element={<InvoiceForm />} />

              {/* Payments */}
              <Route path="/payments" element={<Payments />} />

              {/* Reports & Analytics */}
              <Route path="/reports" element={<Reports />} />

              {/* User Management (Admin Only) */}
              <Route
                path="/users"
                element={
                  <ProtectedRoute adminOnly>
                    <Users />
                  </ProtectedRoute>
                }
              />

              {/* Audit Logs (Admin Only) */}
              <Route
                path="/audit-logs"
                element={
                  <ProtectedRoute adminOnly>
                    <AuditLogs />
                  </ProtectedRoute>
                }
              />

              {/* Settings */}
              <Route path="/settings" element={<Settings />} />

              {/* User Profile */}
              <Route path="/profile" element={<Profile />} />

              {/* Status Pages */}
              <Route path="/unauthorized" element={<Unauthorized />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
