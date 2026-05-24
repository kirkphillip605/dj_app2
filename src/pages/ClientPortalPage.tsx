import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '@/api/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, PlusIcon, Trash2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';

interface Bucket {
  id: string;
  bucketType: 'ceremony' | 'reception' | 'do_not_play';
  notes: string;
}

interface Track {
  id: string;
  title: string;
  artistName: string;
  albumName: string;
  artworkUrl: string;
  sourceService: string;
  externalTrackId: string;
}

interface Event {
  id: string;
  eventName: string;
  uniqueCode: string;
  buckets: Bucket[];
}

export default function ClientPortalPage() {
  const { code } = useParams<{ code: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedBucket, setSelectedBucket] = useState<Bucket | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<Track[]>([]);
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
      } catch {
        toast({ variant: 'destructive', title: 'Invalid code' });
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [code]);

  // Load tracks for selected bucket
  useEffect(() => {
    if (!selectedBucket) return;
    const load = async () => {
      try {
        const resp = await api.get(`/music/bucket/${selectedBucket.id}/tracks`);
        setTracks(resp.data);
      } catch {
        toast({ variant: 'destructive', title: 'Failed to load tracks' });
      }
    };
    load();
  }, [selectedBucket]);

  // Update notes
  const saveNotes = async (notes: string) => {
    if (!selectedBucket) return;
    try {
      await api.patch('/music/bucket/notes', {
        bucketId: selectedBucket.id,
        notes,
      });
      toast({ title: 'Notes saved' });
      // update locally
      setEvent((prev) =>
        prev && {
          ...prev,
          buckets: prev.buckets.map((b) =>
            b.id === selectedBucket.id ? { ...b, notes } : b
          ),
        }
      );
    } catch {
      toast({ variant: 'destructive', title: 'Failed to save notes' });
    }
  };

  // Spotify search proxy call
  const performSearch = async () => {
    if (!search.trim()) return;
    setSearchLoading(true);
    try {
      const resp = await api.get(`/music/search?q=${encodeURIComponent(search)}`);
      setSearchResults(resp.data);
    } catch {
      toast({ variant: 'destructive', title: 'Search failed' });
    } finally {
      setSearchLoading(false);
    }
  };

  const addTrack = async (track: Track) => {
    if (!selectedBucket) return;
    try {
      const resp = await api.post('/music/track', {
        ...track,
        bucketId: selectedBucket.id,
      });
      toast({ title: 'Track added' });
      setTracks((prev) => [...prev, resp.data]);
    } catch {
      toast({ variant: 'destructive', title: 'Failed to add track' });
    }
  };

  const removeTrack = async (trackId: string) => {
    try {
      await api.delete(`/music/track/${trackId}`);
      setTracks((prev) => prev.filter((t) => t.id !== trackId));
      toast({ title: 'Track removed' });
    } catch {
      toast({ variant: 'destructive', title: 'Failed to remove track' });
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white">
      <Loader2 className="animate-spin h-8 w-8 text-indigo-500" />
    </div>
  );

  if (!event) return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white p-4">
      <Card className="max-w-md w-full bg-zinc-900 border-zinc-800 text-center p-6">
        <p className="text-red-400 font-semibold text-lg mb-2">Event Not Found</p>
        <p className="text-zinc-400 text-sm">Please verify the code and try again.</p>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 text-white p-4 sm:p-6 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="text-center space-y-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
            {event.eventName}
          </h1>
          <p className="text-zinc-400 text-sm">Event Code: <span className="font-mono bg-zinc-800/80 px-2 py-0.5 rounded text-white">{event.uniqueCode}</span></p>
        </header>

        {/* Bucket selector */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
          {event.buckets.map((b) => (
            <Button
              key={b.id}
              variant={selectedBucket?.id === b.id ? 'default' : 'outline'}
              className={`capitalize transition-all duration-300 ${
                selectedBucket?.id === b.id
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/30'
                  : 'bg-zinc-900/50 border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800'
              }`}
              onClick={() => setSelectedBucket(b)}
            >
              {b.bucketType.replace(/_/g, ' ')}
            </Button>
          ))}
        </div>

        {/* Notes area */}
        {selectedBucket && (
          <Card className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800/50 shadow-xl rounded-xl">
            <CardHeader className="pb-3 border-b border-zinc-800/40">
              <CardTitle className="flex items-center text-lg font-semibold text-zinc-200 capitalize">
                {selectedBucket.bucketType.replace(/_/g, ' ')} – Notes & Guidance
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <Textarea
                defaultValue={selectedBucket.notes}
                placeholder="Add any special instructions for the DJ regarding this playlist (e.g. key moments, preferred versions)..."
                className="min-h-[120px] bg-zinc-950/60 border-zinc-800 text-zinc-200 placeholder-zinc-500 focus-visible:ring-indigo-500 focus-visible:ring-1 focus-visible:ring-offset-0"
                onBlur={(e) => saveNotes(e.target.value)}
              />
            </CardContent>
          </Card>
        )}

        {/* Track list */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight text-zinc-100 capitalize">
              {selectedBucket?.bucketType.replace(/_/g, ' ')} Tracks
            </h2>
            <Button 
              onClick={() => { setSearch(''); setSearchResults([]); setIsSearchOpen(true); }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/20"
            >
              <PlusIcon className="h-4 w-4" />
              Add from Spotify
            </Button>
          </div>

          {/* Existing tracks */}
          <div className="grid gap-4 sm:grid-cols-2">
            {tracks.length === 0 ? (
              <div className="col-span-full border border-dashed border-zinc-800 rounded-xl p-8 text-center text-zinc-500">
                No songs added to this playlist yet. Click "Add from Spotify" to search and add tracks.
              </div>
            ) : (
              tracks.map((t) => (
                <Card
                  key={t.id}
                  className="bg-zinc-900/30 backdrop-blur-md border border-zinc-800/40 flex items-center p-3 shadow-md rounded-xl hover:border-zinc-700/60 transition-all duration-300 group"
                >
                  {t.artworkUrl ? (
                    <img
                      src={t.artworkUrl}
                      alt={t.title}
                      className="h-16 w-16 object-cover rounded-lg shadow border border-zinc-800"
                    />
                  ) : (
                    <div className="h-16 w-16 bg-zinc-800 rounded-lg flex items-center justify-center text-zinc-600">🎵</div>
                  )}
                  <div className="pl-3 flex-1 min-w-0 pr-2">
                    <p className="font-semibold text-zinc-100 truncate text-sm group-hover:text-indigo-400 transition-colors">{t.title}</p>
                    <p className="text-xs text-zinc-400 truncate mt-0.5">
                      {t.artistName}
                    </p>
                    <p className="text-[10px] text-zinc-500 truncate mt-0.5">
                      {t.albumName}
                    </p>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg shrink-0"
                    onClick={() => removeTrack(t.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </Card>
              ))
            )}
          </div>
        </section>

        {/* Spotify search modal */}
        {isSearchOpen && selectedBucket && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-lg bg-zinc-900 border border-zinc-800 shadow-2xl rounded-2xl overflow-hidden">
              <CardHeader className="pb-3 border-b border-zinc-800">
                <CardTitle className="text-lg font-bold text-white">Add Tracks to {selectedBucket.bucketType.replace(/_/g, ' ')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    performSearch();
                  }}
                >
                  <div className="flex gap-2">
                    <Input
                      placeholder="Search songs, artists, albums..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="bg-zinc-950 border-zinc-800 text-white placeholder-zinc-500 focus-visible:ring-indigo-500 focus-visible:ring-1 focus-visible:ring-offset-0"
                    />
                    <Button type="submit" disabled={searchLoading} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                      {searchLoading ? <Loader2 className="animate-spin h-4 w-4" /> : 'Search'}
                    </Button>
                  </div>
                </form>

                <div className="max-h-[300px] overflow-y-auto space-y-2 pr-1 scrollbar-thin scrollbar-thumb-zinc-800">
                  {searchLoading ? (
                    <div className="flex justify-center items-center py-12">
                      <Loader2 className="animate-spin h-6 w-6 text-indigo-500" />
                    </div>
                  ) : searchResults.length > 0 ? (
                    searchResults.map((tr) => (
                      <Card key={tr.id} className="flex items-center p-2 bg-zinc-950/40 border-zinc-800/80 rounded-lg hover:border-zinc-700/60 transition-all">
                        {tr.artworkUrl ? (
                          <img src={tr.artworkUrl} alt={tr.title} className="h-12 w-12 rounded object-cover border border-zinc-800" />
                        ) : (
                          <div className="h-12 w-12 bg-zinc-800 rounded flex items-center justify-center text-zinc-600">🎵</div>
                        )}
                        <div className="flex-1 min-w-0 pl-2.5">
                          <p className="font-semibold text-zinc-200 truncate text-xs">{tr.title}</p>
                          <p className="text-[10px] text-zinc-400 truncate mt-0.5">{tr.artistName}</p>
                        </div>
                        <Button
                          size="sm"
                          className="bg-indigo-600/90 hover:bg-indigo-600 text-white h-7 text-xs px-2.5 rounded flex items-center gap-1 shadow-md shadow-indigo-600/20"
                          onClick={() => addTrack(tr)}
                        >
                          <PlusIcon className="h-3 w-3" />
                          Add
                        </Button>
                      </Card>
                    ))
                  ) : (
                    <p className="text-center text-xs text-zinc-500 py-10">
                      {search.trim() ? 'No results found.' : 'Search for music to add to your list.'}
                    </p>
                  )}
                </div>

                <div className="flex justify-end pt-2 border-t border-zinc-800">
                  <Button variant="outline" className="bg-zinc-950 border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800" onClick={() => setIsSearchOpen(false)}>
                    Close
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
