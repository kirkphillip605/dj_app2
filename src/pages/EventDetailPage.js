import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '@/api/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
export default function EventDetailPage() {
    const { id } = useParams();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const fetchEvent = async () => {
            setLoading(true);
            const resp = await api.get(`/events/${id}`);
            setEvent(resp.data);
            setLoading(false);
        };
        fetchEvent();
    }, [id]);
    if (loading)
        return _jsx(Loader2, { className: "animate-spin mx-auto mt-10" });
    if (!event)
        return _jsx("p", { className: "text-center mt-10", children: "Event not found" });
    return (_jsx("div", { className: "p-8 min-h-screen bg-gradient-to-b from-background via-primary/5 to-background", children: _jsxs(Card, { className: "bg-white/30 backdrop-blur-lg border border-white/20", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: event.eventName }) }), _jsxs(CardContent, { children: [_jsxs("p", { className: "mb-2", children: ["Code: ", _jsx("span", { className: "font-mono", children: event.uniqueCode })] }), _jsx("h3", { className: "font-semibold mt-4 mb-2", children: "Buckets" }), _jsx("ul", { className: "list-disc pl-5 space-y-2", children: event.buckets.map((b) => (_jsxs("li", { children: [_jsx("strong", { children: b.bucketType.replace('_', ' ') }), ": ", b.notes || 'No notes'] }, b.id))) })] })] }) }));
}
