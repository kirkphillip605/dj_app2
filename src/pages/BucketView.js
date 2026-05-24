import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '@/api/client';
export default function BucketView() {
    const { code, bucketId } = useParams();
    const [tracks, setTracks] = useState([]);
    const [notes, setNotes] = useState('');
    const [error, setError] = useState(null);
    const loadTracks = async () => {
        try {
            const resp = await api.get(`/music/bucket/${bucketId}/tracks`);
            setTracks(resp.data);
        }
        catch (e) {
            setError(e.response?.data?.error ?? 'Failed to load tracks');
        }
    };
    const loadNotes = async () => {
        try {
            const resp = await api.get(`/music/bucket/${bucketId}`);
            setNotes(resp.data.notes ?? '');
        }
        catch (e) {
            // ignore – notes may be empty initially
        }
    };
    useEffect(() => {
        loadTracks();
        loadNotes();
    }, [bucketId]);
    const handleNotesSave = async () => {
        try {
            await api.patch('/music/bucket/notes', { bucketId, notes });
        }
        catch (e) {
            setError(e.response?.data?.error ?? 'Failed to save notes');
        }
    };
    return (_jsxs("div", { className: "p-6", children: [_jsx("h2", { className: "text-2xl font-bold mb-4", children: "Playlist" }), error && _jsx("p", { className: "text-red-600", children: error }), _jsxs("section", { className: "mb-6", children: [_jsx("h3", { className: "font-semibold", children: "Bucket Notes" }), _jsx("textarea", { value: notes, onChange: (e) => setNotes(e.target.value), className: "w-full rounded border p-2", rows: 3 }), _jsx("button", { onClick: handleNotesSave, className: "mt-2 rounded bg-indigo-600 py-1 px-3 text-white", children: "Save Notes" })] }), _jsx("ul", { className: "space-y-3", children: tracks.map((track) => (_jsxs("li", { className: "flex items-center space-x-4 rounded bg-gray-50 p-2 shadow", children: [track.artworkUrl && (_jsx("img", { src: track.artworkUrl, alt: track.title, className: "h-12 w-12 object-cover rounded" })), _jsxs("div", { children: [_jsx("p", { className: "font-medium", children: track.title }), _jsxs("p", { className: "text-sm text-gray-600", children: [track.artistName, " \u2013 ", track.albumName] })] })] }, track.id))) })] }));
}
