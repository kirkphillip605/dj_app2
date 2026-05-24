import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '@/api/client';
export default function EventPortal() {
    const { code } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [error, setError] = useState(null);
    const loadEvent = async () => {
        try {
            const resp = await api.get(`/events/code/${code}`);
            setEvent(resp.data);
        }
        catch (e) {
            setError(e.response?.data?.error ?? 'Event not found');
        }
    };
    useEffect(() => {
        loadEvent();
    }, [code]);
    if (error)
        return _jsx("p", { className: "p-4 text-red-600", children: error });
    if (!event)
        return _jsx("p", { className: "p-4", children: "Loading\u2026" });
    return (_jsxs("div", { className: "p-6", children: [_jsx("h1", { className: "text-2xl font-bold mb-4", children: event.eventName }), _jsxs("p", { className: "mb-2", children: ["Contact: ", event.contactName] }), _jsxs("p", { className: "mb-4", children: ["Phone: ", event.phone] }), _jsx("h2", { className: "text-xl font-semibold mb-2", children: "Playlists" }), _jsx("ul", { className: "space-y-2", children: event.buckets.map((bucket) => (_jsx("li", { children: _jsx("button", { onClick: () => navigate(`/event/${code}/bucket/${bucket.id}`), className: "text-indigo-600 hover:underline", children: bucket.bucketType.replace('_', ' ') }) }, bucket.id))) })] }));
}
