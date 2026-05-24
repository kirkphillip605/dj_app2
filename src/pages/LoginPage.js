import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
export default function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(email, password);
            navigate('/dashboard');
        }
        catch (err) {
            setError(err.response?.data?.error ?? 'Login failed');
        }
    };
    return (_jsx("div", { className: "flex min-h-screen items-center justify-center bg-gray-50", children: _jsxs("form", { className: "max-w-sm w-full space-y-4 p-6 bg-white rounded-lg shadow-md", onSubmit: handleSubmit, children: [_jsx("h2", { className: "text-2xl font-bold text-center", children: "DJ Admin Login" }), error && _jsx("p", { className: "text-red-600", children: error }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium", children: "Email" }), _jsx("input", { type: "email", required: true, value: email, onChange: (e) => setEmail(e.target.value), className: "mt-1 w-full rounded border p-2" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium", children: "Password" }), _jsx("input", { type: "password", required: true, minLength: 6, value: password, onChange: (e) => setPassword(e.target.value), className: "mt-1 w-full rounded border p-2" })] }), _jsx("button", { type: "submit", className: "w-full rounded bg-indigo-600 py-2 text-white hover:bg-indigo-700", children: "Sign In" }), _jsxs("p", { className: "text-center text-sm", children: ["No account? ", _jsx(Link, { to: "/signup", className: "text-indigo-600 hover:underline", children: "Sign up" })] })] }) }));
}
