import { jsx as _jsx } from "react/jsx-runtime";
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
export const ProtectedRoute = () => {
    const { token } = useAuth();
    return token ? _jsx(Outlet, {}) : _jsx(Navigate, { to: "/login", replace: true });
};
