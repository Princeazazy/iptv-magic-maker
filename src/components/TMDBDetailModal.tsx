import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Star, Clock, Calendar, Film, Tv, ExternalLink, Search, Loader2, AlertCircle } from 'lucide-react';
import { TMDBItem, TMDBDetailedItem, useTMDB } from '@/hooks/useTMDB';
import { Channel } from '@/hooks/useIPTV';

interface TMDBDetailModalProps {
  item: TMDBItem;
  allChannels: Channel[];
  onClose: () => void;
  onPlayIPTV: (channel: Channel) => void;
}

export const TMDBDetailModal = ({ item, allChannels, onClose, onPlayIPTV }: TMDBDetailModalProps) => {
  const { getDetails, loading } = useTMDB();
  const [details, setDetails] = useState<TMDBDetailedItem | null>(null);
  const [showTrailer, setShowTrailer] = useState(false);

  useEffect(() => {
    const loadDetails = async () => {
      const data = await getDetails(item.id, item.mediaType);
      setDetails(data);
    };
    loadDetails();
  }, [item.id, item.mediaType, getDetails]);

  // Find matching IPTV content by title similarity - improved algorithm
  const matchingChannels = useMemo(() => {
    if (!allChannels.length) return [];
    
    // More aggressive normalization - remove articles too
    const normalizeTitle = (title: string) => 
      title.toLowerCase()
        .replace(/^(the|a|an)\s+/i, '')
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
    
    const searchTitle = normalizeTitle(item.title);
    const searchTitleFull = item.title.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim();
    const searchYear = item.year;
    
    // Include all VOD content - more lenient filtering
    const vodContent = allChannels.filter(ch => 
      ch.type === 'movies' || ch.type === 'series' || 
      ch.url?.includes('/movie/') || ch.url?.includes('/series/') ||
      ch.group?.toLowerCase().includes('movie') ||
      ch.group?.toLowerCase().includes('vod') ||
      ch.group?.toLowerCase().includes('film') ||
      ch.group?.toLowerCase().includes('series')
    );
    
    // Score and rank matches
    const scored = vodContent.map(channel => {
      const channelTitle = normalizeTitle(channel.name);
      const channelTitleFull = channel.name.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim();
      let score = 0;
      
      // Exact match
      if (channelTitle === searchTitle || channelTitleFull === searchTitleFull) {
        score = 100;
      }
      // Contains full title
      else if (channelTitle.includes(searchTitle) || channelTitleFull.includes(searchTitleFull)) {
        score = 85;
      }
      // Search contains channel (e.g., "Avatar" matches channel "Avatar 2009")
      else if (searchTitle.includes(channelTitle) && channelTitle.length > 3) {
        score = 80;
      }
      // Word matching
      else {
        const searchWords = searchTitle.split(' ').filter(w => w.length > 2);
        const channelWords = channelTitle.split(' ').filter(w => w.length > 2);
        
        if (searchWords.length > 0 && channelWords.length > 0) {
          const matchedWords = searchWords.filter(sw => 
            channelWords.some(cw => cw === sw || cw.includes(sw) || sw.includes(cw))
          );
          const matchRatio = matchedWords.length / searchWords.length;
          if (matchRatio >= 0.5) {
            score = matchRatio * 70;
          }
        }
      }
      
      // Year bonus
      if (score > 0 && searchYear && channel.name.includes(searchYear)) {
        score += 15;
      }
      
      return { channel, score };
    });
    
    const matches = scored
      .filter(s => s.score >= 35)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
    
    console.log(`TMDB Modal Match: "${item.title}" found ${matches.length} matches:`, matches.map(m => `${m.channel.name} (${m.score})`));
    
    return matches.map(s => s.channel);
  }, [allChannels, item.title, item.year]);

  const trailerUrl = details?.trailer?.key 
    ? `https://www.youtube.com/embed/${details.trailer.key}?autoplay=1&rel=0`
    : null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-card rounded-2xl border border-border shadow-2xl"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center hover:bg-black/70 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          {/* Backdrop */}
          <div className="relative h-[300px] overflow-hidden">
            {showTrailer && trailerUrl ? (
              <iframe
                src={trailerUrl}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <>
                {details?.backdropUrl || item.backdrop ? (
                  <img
                    src={details?.backdropUrl || item.backdrop || ''}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                    {item.mediaType === 'tv' ? (
                      <Tv className="w-20 h-20 text-muted-foreground" />
                    ) : (
                      <Film className="w-20 h-20 text-muted-foreground" />
                    )}
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
                
                {/* Play trailer button */}
                {trailerUrl && (
                  <button
                    onClick={() => setShowTrailer(true)}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center hover:bg-primary transition-colors shadow-lg"
                  >
                    <Play className="w-8 h-8 text-primary-foreground fill-current ml-1" />
                  </button>
                )}
              </>
            )}
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Title & Meta */}
            <div>
              <div className="flex items-start gap-4">
                {/* Poster thumbnail */}
                {item.poster && (
                  <img
                    src={item.poster}
                    alt={item.title}
                    className="w-24 h-36 object-cover rounded-lg shadow-lg -mt-20 relative z-10 border-2 border-card"
                  />
                )}
                <div className="flex-1 pt-2">
                  <h2 className="text-2xl font-bold text-foreground">{item.title}</h2>
                  {details?.tagline && (
                    <p className="text-muted-foreground italic mt-1">{details.tagline}</p>
                  )}
                  
                  <div className="flex items-center gap-4 mt-3 flex-wrap">
                    {item.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="text-sm font-medium">{item.rating.toFixed(1)}</span>
                      </div>
                    )}
                    {item.year && (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">{item.year}</span>
                      </div>
                    )}
                    {details?.runtime && (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">{details.runtime} min</span>
                      </div>
                    )}
                    <span className="px-2 py-0.5 rounded bg-primary/20 text-primary text-xs font-medium uppercase">
                      {item.mediaType === 'tv' ? 'TV Show' : 'Movie'}
                    </span>
                  </div>
                  
                  {details?.genres && details.genres.length > 0 && (
                    <div className="flex gap-2 mt-3 flex-wrap">
                      {details.genres.map(genre => (
                        <span key={genre.id} className="px-2 py-1 rounded-full bg-secondary text-xs text-muted-foreground">
                          {genre.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Overview */}
            {(details?.overview || item.overview) && (
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2">Overview</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {details?.overview || item.overview}
                </p>
              </div>
            )}

            {/* Trailer button if not showing */}
            {trailerUrl && !showTrailer && (
              <button
                onClick={() => setShowTrailer(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors"
              >
                <Play className="w-4 h-4 fill-current" />
                <span className="font-medium">Watch Trailer</span>
              </button>
            )}

            {/* IPTV Matches */}
            <div className="border-t border-border pt-6">
              <div className="flex items-center gap-2 mb-4">
                <Search className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">Available in Your Library</h3>
              </div>
              
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : matchingChannels.length > 0 ? (
                <div className="space-y-2">
                  {matchingChannels.map((channel) => (
                    <button
                      key={channel.id}
                      onClick={() => onPlayIPTV(channel)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors text-left group"
                    >
                      {channel.logo ? (
                        <img
                          src={channel.logo}
                          alt={channel.name}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                          <Film className="w-6 h-6 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">
                          {channel.name.replace(/_/g, ' ').replace(/-/g, ' ')}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">{channel.group}</p>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="w-5 h-5 text-primary-foreground fill-current" />
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-3 py-6 text-muted-foreground">
                  <AlertCircle className="w-5 h-5" />
                  <p className="text-sm">No matching content found in your IPTV library</p>
                </div>
              )}
            </div>

            {/* Cast */}
            {details?.cast && details.cast.length > 0 && (
              <div className="border-t border-border pt-6">
                <h3 className="text-sm font-semibold text-foreground mb-3">Cast</h3>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {details.cast.slice(0, 8).map((person) => (
                    <div key={person.id} className="flex-shrink-0 w-16 text-center">
                      {person.profile_path ? (
                        <img
                          src={`https://image.tmdb.org/t/p/w185${person.profile_path}`}
                          alt={person.name}
                          className="w-16 h-16 object-cover rounded-full mx-auto"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-muted mx-auto flex items-center justify-center">
                          <span className="text-lg text-muted-foreground">{person.name[0]}</span>
                        </div>
                      )}
                      <p className="text-xs font-medium text-foreground mt-1 truncate">{person.name}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{person.character}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
