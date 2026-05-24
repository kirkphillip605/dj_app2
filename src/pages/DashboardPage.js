import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusIcon, LinkIcon, CopyIcon } from 'lucide-react';
import api from '@/api/client';
import { Link } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
export default function DashboardPage() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const fetchEvents = async () => {
        setLoading(true);
        try {
            const resp = await api.get('/events');
            setEvents(resp.data);
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchEvents();
    }, []);
    const copyLink = (code) => {
        const url = `${window.location.origin}/event/${code}`;
        navigator.clipboard.writeText(url);
        toast({ title: 'Link copied', description: url });
    };
    return (_jsx("div", { className: "min-h-screen bg-gradient-to-b from-background via-primary/5 to-background p-8", children: _jsxs("div", { className: "max-w-5xl mx-auto space-y-6", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("h1", { className: "text-3xl font-bold", children: "My Events" }), _jsx(Link, { to: "/events/new", children: _jsxs(Button, { children: [_jsx(PlusIcon, { className: "mr-2 h-4 w-4" }), "New Event"] }) })] }), loading ? (_jsx("p", { children: "Loading\u2026" })) : events.length === 0 ? (_jsx("p", { children: "No events yet. Create one!" })) : (_jsx("div", { className: "grid gap-4 md:grid-cols-2", children: events.map((ev) => (_jsxs(Card, { className: "bg-white/30 backdrop-blur-lg border border-white/20", children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { children: ev.eventName }) }), _jsxs(CardContent, { className: "flex flex-col space-y-2", children: [_jsxs("p", { className: "text-sm text-muted-foreground", children: ["Code: ", _jsx("span", { className: "font-mono", children: ev.uniqueCode })] }), _jsxs("div", { className: "flex gap-2", children: [_jsxs(Button, { variant: "outline", size: "sm", onClick: () => copyLink(ev.uniqueCode), children: [_jsx(CopyIcon, { className: "mr-1 h-3 w-3" }), "Copy URL"] }), _jsx(Button, { variant: "outline", size: "sm", asChild: true, children: _jsxs("a", { href: `/event/${ev.uniqueCode}`, target: "_blank", rel: "noopener", children: [_jsx(LinkIcon, { className: "mr-1 h-3 w-3" }), "Open Portal"] }) })] })] })] }, ev.id))) }))] }) }));
}
