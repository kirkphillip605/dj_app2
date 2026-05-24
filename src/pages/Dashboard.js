import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import api from '@/api/client';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
export default function Dashboard() {
    const { logout } = useAuth();
    const [events, setEvents] = useState([]);
    const [form, setForm] = useState({
        eventName: '',
        contactName: '',
        phone: '',
        email: '',
    });
    const [error, setError] = useState(null);
    const loadEvents = async () => {
        try {
            const resp = await api.get('/events');
            setEvents(resp.data);
        }
        catch (e) {
            setError(e.response?.data?.error ?? 'Failed to load events');
        }
    };
    useEffect(() => {
        loadEvents();
    }, []);
    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const resp = await api.post('/events', form);
            setEvents([resp.data, ...events]);
            setForm({ eventName: '', contactName: '', phone: '', email: '' });
        }
        catch (e) {
            setError(e.response?.data?.error ?? 'Create failed');
        }
    };
    return (_jsxs("div", { className: "p-6", children: [_jsxs("header", { className: "flex justify-between items-center mb-6", children: [_jsx("h1", { className: "text-3xl font-bold", children: "Your Events" }), _jsx("button", { onClick: logout, className: "text-sm text-gray-600 hover:underline", children: "Logout" })] }), error && _jsx("p", { className: "text-red-600 mb-4", children: error }), _jsxs("section", { className: "mb-8 rounded bg-gray-50 p-4 shadow", children: [_jsx("h2", { className: "text-xl font-semibold mb-2", children: "Create New Event" }), _jsxs("form", { className: "grid grid-cols-1 gap-4 md:grid-cols-2", onSubmit: handleCreate, children: [_jsx("input", { placeholder: "Event Name", required: true, value: form.eventName, onChange: (e) => setForm({ ...form, eventName: e.target.value }), className: "rounded border p-2" }), _jsx("input", { placeholder: "Contact Name", required: true, value: form.contactName, onChange: (e) => setForm({ ...form, contactName: e.target.value }), className: "rounded border p-2" }), _jsx("input", { placeholder: "Phone", required: true, value: form.phone, onChange: (e) => setForm({ ...form, phone: e.target.value }), className: "rounded border p-2" }), _jsx("input", { placeholder: "Email", type: "email", required: true, value: form.email, onChange: (e) => setForm({ ...form, email: e.target.value }), className: "rounded border p-2" }), _jsx("button", { type: "submit", className: "col-span-2 rounded bg-indigo-600 py-2 text-white", children: "Create Event" })] })] }), _jsxs("section", { children: [_jsx("h2", { className: "text-xl font-semibold mb-2", children: "Existing Events" }), events.length === 0 ? (_jsx("p", { children: "No events yet." })) : (_jsx("ul", { className: "space-y-2", children: events.map((ev) => (_jsxs("li", { className: "rounded bg-white p-3 shadow flex justify-between items-center", children: [_jsxs("div", { children: [_jsx("p", { className: "font-medium", children: ev.eventName }), _jsxs("p", { className: "text-sm text-gray-500", children: ["Code: ", ev.uniqueCode] })] }), _jsx(Link, { to: `/event/${ev.uniqueCode}`, className: "text-sm text-indigo-600 hover:underline", children: "Open Client Portal" })] }, ev.id))) }))] })] }));
}
