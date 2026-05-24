import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '@/api/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, PlusIcon, Trash2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
export default function ClientPortalPage() {
    const { code } = useParams();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedBucket, setSelectedBucket] = useState(null);
    const [tracks, setTracks] = useState([]);
    const [search, setSearch] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    // Fetch event + buckets
    useEffect(() => {
        const fetchEvent = async () => {
            setLoading(true);
            try {
                const resp = await api.get(`/events/code/${code}`);
                setEvent(resp.data);
                // default bucket
                if (resp.data.buckets && resp.data.buckets.length > 0) {
                    setSelectedBucket(resp.data.buckets[0]);
                }
            }
            catch {
                toast({ variant: 'destructive', title: 'Invalid code' });
            }
            finally {
                setLoading(false);
            }
        };
        fetchEvent();
    }, [code]);
    // Load tracks for selected bucket
    useEffect(() => {
        if (!selectedBucket)
            return;
        const load = async () => {
            try {
                const resp = await api.get(`/music/bucket/${selectedBucket.id}/tracks`);
                setTracks(resp.data);
            }
            catch {
                toast({ variant: 'destructive', title: 'Failed to load tracks' });
            }
        };
        load();
    }, [selectedBucket]);
    // Update notes
    const saveNotes = async (notes) => {
        if (!selectedBucket)
            return;
        try {
            await api.patch('/music/bucket/notes', {
                bucketId: selectedBucket.id,
                notes,
            });
            toast({ title: 'Notes saved' });
            // update locally
            setEvent((prev) => prev && {
                ...prev,
                buckets: prev.buckets.map((b) => b.id === selectedBucket.id ? { ...b, notes } : b),
            });
        }
        catch {
            toast({ variant: 'destructive', title: 'Failed to save notes' });
        }
    };
    // Spotify search proxy call
    const performSearch = async () => {
        if (!search.trim())
            return;
        setSearchLoading(true);
        try {
            const resp = await api.get(`/music/search?q=${encodeURIComponent(search)}`);
            setSearchResults(resp.data);
        }
        catch {
            toast({ variant: 'destructive', title: 'Search failed' });
        }
        finally {
            setSearchLoading(false);
        }
    };
    const addTrack = async (track) => {
        if (!selectedBucket)
            return;
        try {
            const resp = await api.post('/music/track', {
                ...track,
                bucketId: selectedBucket.id,
            });
            toast({ title: 'Track added' });
            setTracks((prev) => [...prev, resp.data]);
        }
        catch {
            toast({ variant: 'destructive', title: 'Failed to add track' });
        }
    };
    const removeTrack = async (trackId) => {
        try {
            await api.delete(`/music/track/${trackId}`);
            setTracks((prev) => prev.filter((t) => t.id !== trackId));
            toast({ title: 'Track removed' });
        }
        catch {
            toast({ variant: 'destructive', title: 'Failed to remove track' });
        }
    };
    if (loading)
        return (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-zinc-950 text-white", children: _jsx(Loader2, { className: "animate-spin h-8 w-8 text-indigo-500" }) }));
    if (!event)
        return (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-zinc-950 text-white p-4", children: _jsxs(Card, { className: "max-w-md w-full bg-zinc-900 border-zinc-800 text-center p-6", children: [_jsx("p", { className: "text-red-400 font-semibold text-lg mb-2", children: "Event Not Found" }), _jsx("p", { className: "text-zinc-400 text-sm", children: "Please verify the code and try again." })] }) }));
    return (_jsx("div", { className: "min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 text-white p-4 sm:p-6 md:p-8", children: _jsxs("div", { className: "max-w-5xl mx-auto space-y-8", children: [_jsxs("header", { className: "text-center space-y-2", children: [_jsx("h1", { className: "text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent", children: event.eventName }), _jsxs("p", { className: "text-zinc-400 text-sm", children: ["Event Code: ", _jsx("span", { className: "font-mono bg-zinc-800/80 px-2 py-0.5 rounded text-white", children: event.uniqueCode })] })] }), _jsx("div", { className: "flex flex-wrap justify-center gap-2 sm:gap-3", children: event.buckets.map((b) => (_jsx(Button, { variant: selectedBucket?.id === b.id ? 'default' : 'outline', className: `capitalize transition-all duration-300 ${selectedBucket?.id === b.id
                            ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/30'
                            : 'bg-zinc-900/50 border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800'}`, onClick: () => setSelectedBucket(b), children: b.bucketType.replace(/_/g, ' ') }, b.id))) }), selectedBucket && (_jsxs(Card, { className: "bg-zinc-900/40 backdrop-blur-md border border-zinc-800/50 shadow-xl rounded-xl", children: [_jsx(CardHeader, { className: "pb-3 border-b border-zinc-800/40", children: _jsxs(CardTitle, { className: "flex items-center text-lg font-semibold text-zinc-200 capitalize", children: [selectedBucket.bucketType.replace(/_/g, ' '), " \u2013 Notes & Guidance"] }) }), _jsx(CardContent, { className: "pt-4", children: _jsx(Textarea, { defaultValue: selectedBucket.notes, placeholder: "Add any special instructions for the DJ regarding this playlist (e.g. key moments, preferred versions)...", className: "min-h-[120px] bg-zinc-950/60 border-zinc-800 text-zinc-200 placeholder-zinc-500 focus-visible:ring-indigo-500 focus-visible:ring-1 focus-visible:ring-offset-0", onBlur: (e) => saveNotes(e.target.value) }) })] })), _jsxs("section", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("h2", { className: "text-xl font-bold tracking-tight text-zinc-100 capitalize", children: [selectedBucket?.bucketType.replace(/_/g, ' '), " Tracks"] }), _jsxs(Button, { onClick: () => { setSearch(''); setSearchResults([]); setIsSearchOpen(true); }, className: "bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/20", children: [_jsx(PlusIcon, { className: "h-4 w-4" }), "Add from Spotify"] })] }), _jsx("div", { className: "grid gap-4 sm:grid-cols-2", children: tracks.length === 0 ? (_jsx("div", { className: "col-span-full border border-dashed border-zinc-800 rounded-xl p-8 text-center text-zinc-500", children: "No songs added to this playlist yet. Click \"Add from Spotify\" to search and add tracks." })) : (tracks.map((t) => (_jsxs(Card, { className: "bg-zinc-900/30 backdrop-blur-md border border-zinc-800/40 flex items-center p-3 shadow-md rounded-xl hover:border-zinc-700/60 transition-all duration-300 group", children: [t.artworkUrl ? (_jsx("img", { src: t.artworkUrl, alt: t.title, className: "h-16 w-16 object-cover rounded-lg shadow border border-zinc-800" })) : (_jsx("div", { className: "h-16 w-16 bg-zinc-800 rounded-lg flex items-center justify-center text-zinc-600", children: "\uD83C\uDFB5" })), _jsxs("div", { className: "pl-3 flex-1 min-w-0 pr-2", children: [_jsx("p", { className: "font-semibold text-zinc-100 truncate text-sm group-hover:text-indigo-400 transition-colors", children: t.title }), _jsx("p", { className: "text-xs text-zinc-400 truncate mt-0.5", children: t.artistName }), _jsx("p", { className: "text-[10px] text-zinc-500 truncate mt-0.5", children: t.albumName })] }), _jsx(Button, { size: "icon", variant: "ghost", className: "text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg shrink-0", onClick: () => removeTrack(t.id), children: _jsx(Trash2, { className: "h-4 w-4" }) })] }, t.id)))) })] }), isSearchOpen && selectedBucket && (_jsx("div", { className: "fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4", children: _jsxs(Card, { className: "w-full max-w-lg bg-zinc-900 border border-zinc-800 shadow-2xl rounded-2xl overflow-hidden", children: [_jsx(CardHeader, { className: "pb-3 border-b border-zinc-800", children: _jsxs(CardTitle, { className: "text-lg font-bold text-white", children: ["Add Tracks to ", selectedBucket.bucketType.replace(/_/g, ' ')] }) }), _jsxs(CardContent, { className: "space-y-4 pt-4", children: [_jsx("form", { onSubmit: (e) => {
                                            e.preventDefault();
                                            performSearch();
                                        }, children: _jsxs("div", { className: "flex gap-2", children: [_jsx(Input, { placeholder: "Search songs, artists, albums...", value: search, onChange: (e) => setSearch(e.target.value), className: "bg-zinc-950 border-zinc-800 text-white placeholder-zinc-500 focus-visible:ring-indigo-500 focus-visible:ring-1 focus-visible:ring-offset-0" }), _jsx(Button, { type: "submit", disabled: searchLoading, className: "bg-indigo-600 hover:bg-indigo-700 text-white", children: searchLoading ? _jsx(Loader2, { className: "animate-spin h-4 w-4" }) : 'Search' })] }) }), _jsx("div", { className: "max-h-[300px] overflow-y-auto space-y-2 pr-1 scrollbar-thin scrollbar-thumb-zinc-800", children: searchLoading ? (_jsx("div", { className: "flex justify-center items-center py-12", children: _jsx(Loader2, { className: "animate-spin h-6 w-6 text-indigo-500" }) })) : searchResults.length > 0 ? (searchResults.map((tr) => (_jsxs(Card, { className: "flex items-center p-2 bg-zinc-950/40 border-zinc-800/80 rounded-lg hover:border-zinc-700/60 transition-all", children: [tr.artworkUrl ? (_jsx("img", { src: tr.artworkUrl, alt: tr.title, className: "h-12 w-12 rounded object-cover border border-zinc-800" })) : (_jsx("div", { className: "h-12 w-12 bg-zinc-800 rounded flex items-center justify-center text-zinc-600", children: "\uD83C\uDFB5" })), _jsxs("div", { className: "flex-1 min-w-0 pl-2.5", children: [_jsx("p", { className: "font-semibold text-zinc-200 truncate text-xs", children: tr.title }), _jsx("p", { className: "text-[10px] text-zinc-400 truncate mt-0.5", children: tr.artistName })] }), _jsxs(Button, { size: "sm", className: "bg-indigo-600/90 hover:bg-indigo-600 text-white h-7 text-xs px-2.5 rounded flex items-center gap-1 shadow-md shadow-indigo-600/20", onClick: () => addTrack(tr), children: [_jsx(PlusIcon, { className: "h-3 w-3" }), "Add"] })] }, tr.id)))) : (_jsx("p", { className: "text-center text-xs text-zinc-500 py-10", children: search.trim() ? 'No results found.' : 'Search for music to add to your list.' })) }), _jsx("div", { className: "flex justify-end pt-2 border-t border-zinc-800", children: _jsx(Button, { variant: "outline", className: "bg-zinc-950 border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800", onClick: () => setIsSearchOpen(false), children: "Close" }) })] })] }) }))] }) }));
}
