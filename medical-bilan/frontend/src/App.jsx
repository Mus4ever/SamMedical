import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import Forbidden from './pages/Forbidden';

import MyBilans from './pages/patient/MyBilans';

import Dashboard     from './pages/admin/Dashboard';
import Patients      from './pages/admin/Patients';
import PatientDetail from './pages/admin/PatientDetail';
import AllBilans     from './pages/admin/AllBilans';

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, refetchOnWindowFocus: false } },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Toaster position="top-right" toastOptions={{
            style: { borderRadius: '12px', background: '#000', color: '#fff' },
          }} />
          <Routes>
            <Route path="/"          element={<Landing />} />
            <Route path="/login"     element={<Login />} />
            <Route path="/forbidden" element={<Forbidden />} />

            {/* Profile — accessible to any authenticated user */}
            <Route path="/profile" element={
              <ProtectedRoute><Profile /></ProtectedRoute>
            } />

            {/* Patient */}
            <Route path="/patient/bilans" element={
              <ProtectedRoute role="patient"><MyBilans /></ProtectedRoute>
            } />

            {/* Admin */}
            <Route path="/admin/dashboard" element={
              <ProtectedRoute role="admin"><Dashboard /></ProtectedRoute>
            } />
            <Route path="/admin/patients" element={
              <ProtectedRoute role="admin"><Patients /></ProtectedRoute>
            } />
            <Route path="/admin/patients/:id" element={
              <ProtectedRoute role="admin"><PatientDetail /></ProtectedRoute>
            } />
            <Route path="/admin/bilans" element={
              <ProtectedRoute role="admin"><AllBilans /></ProtectedRoute>
            } />

            <Route path="/admin"   element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/patient" element={<Navigate to="/patient/bilans" replace />} />
            <Route path="*"        element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
