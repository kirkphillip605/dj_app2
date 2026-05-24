import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SearchIcon } from 'lucide-react';
export default function LandingPage() {
    const [code, setCode] = useState('');
    const navigate = useNavigate();
    const handleEnter = (e) => {
        e.preventDefault();
        if (code.trim()) {
            navigate(`/event/${code.trim()}`);
        }
    };
    return (_jsx("div", { className: "flex min-h-screen items-center justify-center bg-gradient-to-b from-primary/10 to-background p-4", children: _jsxs(Card, { className: "w-full max-w-md bg-white/30 backdrop-blur-lg border border-white/20", children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(SearchIcon, { className: "h-5 w-5" }), "Enter Your Event Code"] }) }), _jsx(CardContent, { children: _jsxs("form", { onSubmit: handleEnter, className: "space-y-4", children: [_jsx(Input, { placeholder: "e.g., ABC123", value: code, onChange: (e) => setCode(e.target.value), required: true }), _jsx(Button, { type: "submit", className: "w-full", children: "Continue" })] }) })] }) }));
}
