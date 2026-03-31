'use client';

import { Navigate, useLocation } from 'react-router-dom';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isCustomerRoute = location.pathname.startsWith('/menu');
  const isAdminRoute = location.pathname.startsWith('/admin') || 
                       location.pathname.startsWith('/pos') || 
                       location.pathname.startsWith('/kds') ||
                       location.pathname.startsWith('/accounting');

  if (isCustomerRoute && isAdminRoute) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}

export function CustomerRouteGuard({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  const isRestrictedPath =
    location.pathname.includes('/admin') ||
    location.pathname.includes('/pos') ||
    location.pathname.includes('/kds') ||
    location.pathname.includes('/accounting') ||
    location.pathname.includes('/kitchen');

  if (isRestrictedPath) {
    return <Navigate to={`/menu`} replace />;
  }

  return <>{children}</>;
}

export function AdminRouteGuard({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  const isCustomerPath = location.pathname.startsWith('/menu');

  if (isCustomerPath) {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
}
