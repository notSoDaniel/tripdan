/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [email, setEmail] = useState(() => localStorage.getItem('userEmail'));
  const [role, setRole] = useState(() => localStorage.getItem('userRole'));
  const navigate = useNavigate();

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');
    setToken(null);
    setEmail(null);
    setRole(null);
    navigate('/login');
  }, [navigate]);

  const storeAuth = (authData) => {
    localStorage.setItem('token', authData.token);
    localStorage.setItem('userEmail', authData.email);
    localStorage.setItem('userRole', authData.role);
    setToken(authData.token);
    setEmail(authData.email);
    setRole(authData.role);
  };

  useEffect(() => {
    const handleUnauthorized = () => logout();
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, [logout]);

  return (
    <AuthContext.Provider value={{ token, email, role, storeAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
