import { Navigate, Outlet } from 'react-router-dom';

export default function ProtectedRoute() {
  const token = localStorage.getItem('token');
  return token ? <Outlet /> : <Navigate to="/login" replace />;
}

export function AdminRoute() {
  const role = localStorage.getItem('userRole');
  return role === 'ADMIN' ? <Outlet /> : <Navigate to="/" replace />;
}
