import { Route, Routes, Navigate } from 'react-router-dom'
import { Toaster } from './components/ui/sonner'
import AdminLayout from './layouts/AdminLayout'
import DashboardPage from './pages/Admin/Dashboard/DashboardPage'
import LoginPage from './pages/Admin/Login/LoginPage'
import VoucherListPage from './pages/Admin/Vouchers/VoucherListPage'
import VoucherRecipientsPage from './pages/Admin/Vouchers/VoucherRecipientsPage'
import CustomerListPage from './pages/Admin/Customers/CustomerListPage'
import StaffListPage from './pages/Admin/Staffs/StaffListPage'
import { AuthProvider, useAuth } from './contexts/AuthContext'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="vouchers/list" element={<VoucherListPage />} />
        <Route path="vouchers/:voucherId/recipients" element={<VoucherRecipientsPage />} />
        <Route path="customers/list" element={<CustomerListPage />} />
        <Route path="staffs/list" element={<StaffListPage />} />
      </Route>
      <Route path="/" element={<Navigate to="/admin" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" richColors />
      <AppRoutes />
    </AuthProvider>
  )
}

export default App
