import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import LoadingSpinner from './components/common/LoadingSpinner';

// Public pages — eagerly loaded (small + landing-critical)
import Landing from './pages/Landing';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import Forbidden from './pages/Forbidden';

// Protected pages — code-split (lazy) so admin code isn't shipped to patients and vice-versa
const Profile        = lazy(() => import('./pages/Profile'));
const MyBilans       = lazy(() => import('./pages/patient/MyBilans'));
const Dashboard      = lazy(() => import('./pages/admin/Dashboard'));
const Patients       = lazy(() => import('./pages/admin/Patients'));
const PatientDetail  = lazy(() => import('./pages/admin/PatientDetail'));
const AllBilans      = lazy(() => import('./pages/admin/AllBilans'));
const AuditLogs      = lazy(() => import('./pages/admin/AuditLogs'));

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, refetchOnWindowFocus: false } },
});

const PageFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-paper" role="status" aria-live="polite">
    <LoadingSpinner size="lg" />
    <span className="sr-only">Chargement...</span>
  </div>
);

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Toaster
            position="top-right"
            toastOptions={{ style: { borderRadius: '12px', background: '#000', color: '#fff' } }}
            // accessibility: react-hot-toast already adds role="status" aria-live="polite"
          />
          <Suspense fallback={<PageFallback />}>
            <Routes>
              <Route path="/"          element={<Landing />} />
              <Route path="/login"     element={<Login />} />
              <Route path="/forbidden" element={<Forbidden />} />

              <Route path="/profile" element={
                <ProtectedRoute><Profile /></ProtectedRoute>
              } />

              <Route path="/patient/bilans" element={
                <ProtectedRoute role="patient"><MyBilans /></ProtectedRoute>
              } />

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
              <Route path="/admin/audit" element={
                <ProtectedRoute role="admin"><AuditLogs /></ProtectedRoute>
              } />

              <Route path="/admin"   element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="/patient" element={<Navigate to="/patient/bilans" replace />} />
              <Route path="*"        element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
