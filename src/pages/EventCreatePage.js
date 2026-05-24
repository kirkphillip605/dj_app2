import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import api from '@/api/client';
import { toast } from '@/hooks/use-toast';
export default function EventCreatePage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        eventName: '',
        contactName: '',
        phone: '',
        email: '',
    });
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const resp = await api.post('/events', form);
            toast({
                title: 'Event created',
                description: `Code: ${resp.data.uniqueCode}`,
            });
            navigate('/dashboard');
        }
        catch (err) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not create event' });
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsx("div", { className: "min-h-screen bg-gradient-to-b from-background via-primary/5 to-background flex items-center justify-center p-4", children: _jsxs(Card, { className: "w-full max-w-xl bg-white/30 backdrop-blur-lg border border-white/20", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Create New Event" }) }), _jsx(CardContent, { children: _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsx(Input, { placeholder: "Event Name", required: true, value: form.eventName, onChange: (e) => setForm({ ...form, eventName: e.target.value }) }), _jsx(Input, { placeholder: "Contact Name", required: true, value: form.contactName, onChange: (e) => setForm({ ...form, contactName: e.target.value }) }), _jsx(Input, { placeholder: "Phone Number", required: true, value: form.phone, onChange: (e) => setForm({ ...form, phone: e.target.value }) }), _jsx(Input, { placeholder: "Contact Email", type: "email", required: true, value: form.email, onChange: (e) => setForm({ ...form, email: e.target.value }) }), _jsxs(Button, { type: "submit", className: "w-full", disabled: loading, children: [loading && _jsx(Loader2, { className: "animate-spin mr-2 h-4 w-4" }), "Create Event"] })] }) })] }) }));
}
