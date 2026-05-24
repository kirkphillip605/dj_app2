import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '@/pages/LoginPage';
import SignupPage from '@/pages/SignupPage';
import Dashboard from '@/pages/Dashboard';
import LandingPage from '@/pages/LandingPage';
import ClientPortalPage from '@/pages/ClientPortalPage';
import BucketView from '@/pages/BucketView';
import { useAuth } from '@/contexts/AuthContext';
function PrivateRoute({ children }) {
    const { token } = useAuth();
    return token ? children : _jsx(Navigate, { to: "/login", replace: true });
}
export default function App() {
    return (_jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(LandingPage, {}) }), _jsx(Route, { path: "/login", element: _jsx(LoginPage, {}) }), _jsx(Route, { path: "/signup", element: _jsx(SignupPage, {}) }), _jsx(Route, { path: "/dashboard/*", element: _jsx(PrivateRoute, { children: _jsx(Dashboard, {}) }) }), _jsx(Route, { path: "/event/:code", element: _jsx(ClientPortalPage, {}) }), _jsx(Route, { path: "/event/:code/bucket/:bucketId", element: _jsx(BucketView, {}) }), _jsx(Route, { path: "*", element: _jsx(Navigate, { to: "/", replace: true }) })] }));
}
