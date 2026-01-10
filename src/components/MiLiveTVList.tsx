import { useState, useMemo, useEffect } from 'react';
import { ChevronLeft, Search, Star, Tv, Cloud, User, Grid, List } from 'lucide-react';
import { Channel } from '@/hooks/useIPTV';
import { useProgressiveList } from '@/hooks/useProgressiveList';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface MiLiveTVListProps {
  channels: Channel[];
  currentChannel: Channel | null;
  favorites: Set<string>;
  searchQuery: string;
  showFavoritesOnly: boolean;
  onChannelSelect: (channel: Channel) => void;
  onToggleFavorite: (channelId: string) => void;
  onBack: () => void;
  category?: 'live' | 'movies' | 'series' | 'sports';
}

const getCategoryTitle = (category: string): string => {
  switch (category) {
    case 'movies': return 'Movies';
    case 'series': return 'Series';
    case 'sports': return 'Sports Guide';
    default: return "Live TV's";
  }
};

// Country code to full name and flag mapping
const countryCodeToInfo: Record<string, { name: string; code: string }> = {
  'ad': { name: 'Andorra', code: 'ad' },
  'ae': { name: 'United Arab Emirates', code: 'ae' },
  'af': { name: 'Afghanistan', code: 'af' },
  'ag': { name: 'Antigua and Barbuda', code: 'ag' },
  'al': { name: 'Albania', code: 'al' },
  'am': { name: 'Armenia', code: 'am' },
  'ao': { name: 'Angola', code: 'ao' },
  'ar': { name: 'Argentina', code: 'ar' },
  'at': { name: 'Austria', code: 'at' },
  'au': { name: 'Australia', code: 'au' },
  'az': { name: 'Azerbaijan', code: 'az' },
  'ba': { name: 'Bosnia and Herzegovina', code: 'ba' },
  'bb': { name: 'Barbados', code: 'bb' },
  'bd': { name: 'Bangladesh', code: 'bd' },
  'be': { name: 'Belgium', code: 'be' },
  'bf': { name: 'Burkina Faso', code: 'bf' },
  'bg': { name: 'Bulgaria', code: 'bg' },
  'bh': { name: 'Bahrain', code: 'bh' },
  'bi': { name: 'Burundi', code: 'bi' },
  'bj': { name: 'Benin', code: 'bj' },
  'bn': { name: 'Brunei', code: 'bn' },
  'bo': { name: 'Bolivia', code: 'bo' },
  'br': { name: 'Brazil', code: 'br' },
  'bs': { name: 'Bahamas', code: 'bs' },
  'bt': { name: 'Bhutan', code: 'bt' },
  'bw': { name: 'Botswana', code: 'bw' },
  'by': { name: 'Belarus', code: 'by' },
  'bz': { name: 'Belize', code: 'bz' },
  'ca': { name: 'Canada', code: 'ca' },
  'cd': { name: 'DR Congo', code: 'cd' },
  'cf': { name: 'Central African Republic', code: 'cf' },
  'cg': { name: 'Congo', code: 'cg' },
  'ch': { name: 'Switzerland', code: 'ch' },
  'ci': { name: 'Ivory Coast', code: 'ci' },
  'cl': { name: 'Chile', code: 'cl' },
  'cm': { name: 'Cameroon', code: 'cm' },
  'cn': { name: 'China', code: 'cn' },
  'co': { name: 'Colombia', code: 'co' },
  'cr': { name: 'Costa Rica', code: 'cr' },
  'cu': { name: 'Cuba', code: 'cu' },
  'cv': { name: 'Cape Verde', code: 'cv' },
  'cy': { name: 'Cyprus', code: 'cy' },
  'cz': { name: 'Czech Republic', code: 'cz' },
  'de': { name: 'Germany', code: 'de' },
  'dj': { name: 'Djibouti', code: 'dj' },
  'dk': { name: 'Denmark', code: 'dk' },
  'dm': { name: 'Dominica', code: 'dm' },
  'do': { name: 'Dominican Republic', code: 'do' },
  'dz': { name: 'Algeria', code: 'dz' },
  'ec': { name: 'Ecuador', code: 'ec' },
  'ee': { name: 'Estonia', code: 'ee' },
  'eg': { name: 'Egypt', code: 'eg' },
  'er': { name: 'Eritrea', code: 'er' },
  'es': { name: 'Spain', code: 'es' },
  'et': { name: 'Ethiopia', code: 'et' },
  'fi': { name: 'Finland', code: 'fi' },
  'fj': { name: 'Fiji', code: 'fj' },
  'fr': { name: 'France', code: 'fr' },
  'ga': { name: 'Gabon', code: 'ga' },
  'gb': { name: 'United Kingdom', code: 'gb' },
  'gd': { name: 'Grenada', code: 'gd' },
  'ge': { name: 'Georgia', code: 'ge' },
  'gh': { name: 'Ghana', code: 'gh' },
  'gm': { name: 'Gambia', code: 'gm' },
  'gn': { name: 'Guinea', code: 'gn' },
  'gq': { name: 'Equatorial Guinea', code: 'gq' },
  'gr': { name: 'Greece', code: 'gr' },
  'gt': { name: 'Guatemala', code: 'gt' },
  'gw': { name: 'Guinea-Bissau', code: 'gw' },
  'gy': { name: 'Guyana', code: 'gy' },
  'hk': { name: 'Hong Kong', code: 'hk' },
  'hn': { name: 'Honduras', code: 'hn' },
  'hr': { name: 'Croatia', code: 'hr' },
  'ht': { name: 'Haiti', code: 'ht' },
  'hu': { name: 'Hungary', code: 'hu' },
  'id': { name: 'Indonesia', code: 'id' },
  'ie': { name: 'Ireland', code: 'ie' },
  'il': { name: 'Israel', code: 'il' },
  'in': { name: 'India', code: 'in' },
  'iq': { name: 'Iraq', code: 'iq' },
  'ir': { name: 'Iran', code: 'ir' },
  'is': { name: 'Iceland', code: 'is' },
  'it': { name: 'Italy', code: 'it' },
  'jm': { name: 'Jamaica', code: 'jm' },
  'jo': { name: 'Jordan', code: 'jo' },
  'jp': { name: 'Japan', code: 'jp' },
  'ke': { name: 'Kenya', code: 'ke' },
  'kg': { name: 'Kyrgyzstan', code: 'kg' },
  'kh': { name: 'Cambodia', code: 'kh' },
  'km': { name: 'Comoros', code: 'km' },
  'kn': { name: 'Saint Kitts and Nevis', code: 'kn' },
  'kp': { name: 'North Korea', code: 'kp' },
  'kr': { name: 'South Korea', code: 'kr' },
  'kw': { name: 'Kuwait', code: 'kw' },
  'kz': { name: 'Kazakhstan', code: 'kz' },
  'la': { name: 'Laos', code: 'la' },
  'lb': { name: 'Lebanon', code: 'lb' },
  'lc': { name: 'Saint Lucia', code: 'lc' },
  'li': { name: 'Liechtenstein', code: 'li' },
  'lk': { name: 'Sri Lanka', code: 'lk' },
  'lr': { name: 'Liberia', code: 'lr' },
  'ls': { name: 'Lesotho', code: 'ls' },
  'lt': { name: 'Lithuania', code: 'lt' },
  'lu': { name: 'Luxembourg', code: 'lu' },
  'lv': { name: 'Latvia', code: 'lv' },
  'ly': { name: 'Libya', code: 'ly' },
  'ma': { name: 'Morocco', code: 'ma' },
  'mc': { name: 'Monaco', code: 'mc' },
  'md': { name: 'Moldova', code: 'md' },
  'me': { name: 'Montenegro', code: 'me' },
  'mg': { name: 'Madagascar', code: 'mg' },
  'mk': { name: 'North Macedonia', code: 'mk' },
  'ml': { name: 'Mali', code: 'ml' },
  'mm': { name: 'Myanmar', code: 'mm' },
  'mn': { name: 'Mongolia', code: 'mn' },
  'mo': { name: 'Macau', code: 'mo' },
  'mr': { name: 'Mauritania', code: 'mr' },
  'mt': { name: 'Malta', code: 'mt' },
  'mu': { name: 'Mauritius', code: 'mu' },
  'mv': { name: 'Maldives', code: 'mv' },
  'mw': { name: 'Malawi', code: 'mw' },
  'mx': { name: 'Mexico', code: 'mx' },
  'my': { name: 'Malaysia', code: 'my' },
  'mz': { name: 'Mozambique', code: 'mz' },
  'na': { name: 'Namibia', code: 'na' },
  'ne': { name: 'Niger', code: 'ne' },
  'ng': { name: 'Nigeria', code: 'ng' },
  'ni': { name: 'Nicaragua', code: 'ni' },
  'nl': { name: 'Netherlands', code: 'nl' },
  'no': { name: 'Norway', code: 'no' },
  'np': { name: 'Nepal', code: 'np' },
  'nz': { name: 'New Zealand', code: 'nz' },
  'om': { name: 'Oman', code: 'om' },
  'pa': { name: 'Panama', code: 'pa' },
  'pe': { name: 'Peru', code: 'pe' },
  'pg': { name: 'Papua New Guinea', code: 'pg' },
  'ph': { name: 'Philippines', code: 'ph' },
  'pk': { name: 'Pakistan', code: 'pk' },
  'pl': { name: 'Poland', code: 'pl' },
  'pr': { name: 'Puerto Rico', code: 'pr' },
  'ps': { name: 'Palestine', code: 'ps' },
  'pt': { name: 'Portugal', code: 'pt' },
  'py': { name: 'Paraguay', code: 'py' },
  'qa': { name: 'Qatar', code: 'qa' },
  'ro': { name: 'Romania', code: 'ro' },
  'rs': { name: 'Serbia', code: 'rs' },
  'ru': { name: 'Russia', code: 'ru' },
  'rw': { name: 'Rwanda', code: 'rw' },
  'sa': { name: 'Saudi Arabia', code: 'sa' },
  'sb': { name: 'Solomon Islands', code: 'sb' },
  'sc': { name: 'Seychelles', code: 'sc' },
  'sd': { name: 'Sudan', code: 'sd' },
  'se': { name: 'Sweden', code: 'se' },
  'sg': { name: 'Singapore', code: 'sg' },
  'si': { name: 'Slovenia', code: 'si' },
  'sk': { name: 'Slovakia', code: 'sk' },
  'sl': { name: 'Sierra Leone', code: 'sl' },
  'sm': { name: 'San Marino', code: 'sm' },
  'sn': { name: 'Senegal', code: 'sn' },
  'so': { name: 'Somalia', code: 'so' },
  'sr': { name: 'Suriname', code: 'sr' },
  'ss': { name: 'South Sudan', code: 'ss' },
  'sv': { name: 'El Salvador', code: 'sv' },
  'sy': { name: 'Syria', code: 'sy' },
  'sz': { name: 'Eswatini', code: 'sz' },
  'td': { name: 'Chad', code: 'td' },
  'tg': { name: 'Togo', code: 'tg' },
  'th': { name: 'Thailand', code: 'th' },
  'tj': { name: 'Tajikistan', code: 'tj' },
  'tl': { name: 'Timor-Leste', code: 'tl' },
  'tm': { name: 'Turkmenistan', code: 'tm' },
  'tn': { name: 'Tunisia', code: 'tn' },
  'to': { name: 'Tonga', code: 'to' },
  'tr': { name: 'Turkey', code: 'tr' },
  'turk': { name: 'Turkey', code: 'tr' },
  'tt': { name: 'Trinidad and Tobago', code: 'tt' },
  'tw': { name: 'Taiwan', code: 'tw' },
  'tz': { name: 'Tanzania', code: 'tz' },
  'ua': { name: 'Ukraine', code: 'ua' },
  'ug': { name: 'Uganda', code: 'ug' },
  'uk': { name: 'United Kingdom', code: 'gb' },
  'us': { name: 'United States', code: 'us' },
  'usa': { name: 'United States', code: 'us' },
  'uy': { name: 'Uruguay', code: 'uy' },
  'uz': { name: 'Uzbekistan', code: 'uz' },
  've': { name: 'Venezuela', code: 've' },
  'vn': { name: 'Vietnam', code: 'vn' },
  'vu': { name: 'Vanuatu', code: 'vu' },
  'ws': { name: 'Samoa', code: 'ws' },
  'xk': { name: 'Kosovo', code: 'xk' },
  'ye': { name: 'Yemen', code: 'ye' },
  'za': { name: 'South Africa', code: 'za' },
  'zm': { name: 'Zambia', code: 'zm' },
  'zw': { name: 'Zimbabwe', code: 'zw' },
};

// Get country info from group name (handles both codes like "DE" and full names like "Germany")
const getCountryInfo = (group: string): { name: string; code: string; flagUrl: string } | null => {
  const groupLower = group.toLowerCase().trim();
  
  // First check if it's a direct country code match (e.g., "DE", "US")
  if (countryCodeToInfo[groupLower]) {
    const info = countryCodeToInfo[groupLower];
    return {
      name: info.name,
      code: info.code,
      flagUrl: `https://flagcdn.com/w80/${info.code}.png`
    };
  }
  
  // Check if group starts with a country code followed by separator (e.g., "DE |", "US:")
  const codeMatch = groupLower.match(/^([a-z]{2})[\s|:\-]/);
  if (codeMatch && countryCodeToInfo[codeMatch[1]]) {
    const info = countryCodeToInfo[codeMatch[1]];
    return {
      name: info.name,
      code: info.code,
      flagUrl: `https://flagcdn.com/w80/${info.code}.png`
    };
  }
  
  // Search for country name within the group string
  for (const [code, info] of Object.entries(countryCodeToInfo)) {
    if (groupLower.includes(info.name.toLowerCase())) {
      return {
        name: info.name,
        code: info.code,
        flagUrl: `https://flagcdn.com/w80/${info.code}.png`
      };
    }
  }
  
  return null;
};

// Get display name for a group (converts codes to full names)
const getDisplayName = (group: string): string => {
  const countryInfo = getCountryInfo(group);
  if (countryInfo) {
    return countryInfo.name;
  }
  return group;
};

// Country flag image URLs using flagcdn.com (circular flags)
const getCountryFlagUrl = (group: string): string | null => {
  const countryInfo = getCountryInfo(group);
  return countryInfo?.flagUrl || null;
};

// Fallback emoji for non-country categories
const getCategoryEmoji = (group: string): string => {
  const groupLower = group.toLowerCase();
  
  // Movie categories (including abbreviations and Arabic)
  // "MOV" abbreviation, "أفلام" (aflam = films in Arabic), year patterns like 2021, 2025
  if (groupLower.includes('mov ') || groupLower.includes(' mov') || groupLower.match(/\bmov\b/)) return '🎬';
  if (group.includes('أفلام') || group.includes('فيلم') || group.includes('افلام')) return '🎬';
  if (groupLower.includes('مترجمة') || group.includes('مترجم')) return '🎬'; // Translated/dubbed
  if (groupLower.match(/\b(19|20)\d{2}\b/)) return '🎬'; // Year-based categories (1900s-2000s)
  
  // Sports categories
  if (groupLower.includes('soccer') || groupLower.includes('football')) return '⚽';
  if (groupLower.includes('basketball') || groupLower.includes('nba')) return '🏀';
  if (groupLower.includes('tennis')) return '🎾';
  if (groupLower.includes('golf')) return '⛳';
  if (groupLower.includes('baseball') || groupLower.includes('mlb')) return '⚾';
  if (groupLower.includes('hockey') || groupLower.includes('nhl')) return '🏒';
  if (groupLower.includes('boxing') || groupLower.includes('ufc') || groupLower.includes('fight')) return '🥊';
  if (groupLower.includes('racing') || groupLower.includes('f1') || groupLower.includes('nascar')) return '🏎️';
  if (groupLower.includes('cricket')) return '🏏';
  if (groupLower.includes('rugby')) return '🏉';
  if (groupLower.includes('sport') || groupLower.includes('رياضة')) return '🏆';
  
  // Entertainment categories
  if (groupLower.includes('theater') || groupLower.includes('theatre') || groupLower.includes('drama') || group.includes('مسرح')) return '🎭';
  if (groupLower.includes('comedy') || groupLower.includes('funny') || group.includes('كوميدي')) return '😂';
  if (groupLower.includes('horror') || groupLower.includes('scary') || group.includes('رعب')) return '👻';
  if (groupLower.includes('action') || group.includes('اكشن') || group.includes('أكشن')) return '💥';
  if (groupLower.includes('romance') || groupLower.includes('love') || group.includes('رومانسي')) return '❤️';
  if (groupLower.includes('animation') || groupLower.includes('cartoon') || groupLower.includes('anime') || group.includes('كرتون') || group.includes('انمي')) return '🎨';
  if (groupLower.includes('entertainment') || group.includes('ترفيه')) return '🎪';
  
  // Media categories
  if (groupLower.includes('news') || group.includes('اخبار') || group.includes('أخبار')) return '📰';
  if (groupLower.includes('documentary') || groupLower.includes('doc') || group.includes('وثائقي')) return '🎬';
  if (groupLower.includes('music') || groupLower.includes('mtv') || group.includes('موسيقى') || group.includes('اغاني')) return '🎵';
  if (groupLower.includes('movie') || groupLower.includes('film') || groupLower.includes('cinema')) return '🎥';
  if (groupLower.includes('series') || groupLower.includes('show') || group.includes('مسلسل')) return '📺';
  
  // Other categories
  if (groupLower.includes('kids') || groupLower.includes('child') || groupLower.includes('junior') || group.includes('اطفال') || group.includes('أطفال')) return '🧸';
  if (groupLower.includes('religious') || groupLower.includes('faith') || groupLower.includes('church') || group.includes('ديني') || group.includes('اسلامي')) return '⛪';
  if (groupLower.includes('cooking') || groupLower.includes('food') || groupLower.includes('chef') || group.includes('طبخ')) return '🍳';
  if (groupLower.includes('nature') || groupLower.includes('wildlife') || groupLower.includes('animal') || group.includes('طبيعة')) return '🦁';
  if (groupLower.includes('travel') || groupLower.includes('adventure') || group.includes('سفر')) return '✈️';
  if (groupLower.includes('science') || groupLower.includes('discovery') || group.includes('علوم')) return '🔬';
  if (groupLower.includes('history') || group.includes('تاريخ')) return '🏛️';
  if (groupLower.includes('education') || groupLower.includes('learn') || group.includes('تعليم')) return '📚';
  if (groupLower.includes('gaming') || groupLower.includes('game') || group.includes('العاب')) return '🎮';
  if (groupLower.includes('fashion') || groupLower.includes('lifestyle') || group.includes('موضة')) return '👗';
  if (groupLower.includes('weather') || group.includes('طقس')) return '🌤️';
  if (groupLower.includes('adult') || groupLower.includes('xxx')) return '🔞';
  if (groupLower.includes('en ') || groupLower.includes('ar ') || groupLower.includes('fr ')) return '🎬'; // Language prefixed categories
  return '🌐';
};

export const MiLiveTVList = ({
  channels,
  currentChannel,
  favorites,
  searchQuery,
  showFavoritesOnly,
  onChannelSelect,
  onToggleFavorite,
  onBack,
  category = 'live',
}: MiLiveTVListProps) => {
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('number');
  const [viewMode, setViewMode] = useState<'list' | 'card'>('card');
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const groups = useMemo(() => {
    const groupCounts = new Map<string, number>();
    channels.forEach((ch) => {
      const group = ch.group || 'Uncategorized';
      groupCounts.set(group, (groupCounts.get(group) || 0) + 1);
    });
    return Array.from(groupCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));
  }, [channels]);

  const filteredChannels = useMemo(() => {
    let filtered = channels.filter((channel) => {
      const matchesSearch = channel.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesGroup = selectedGroup === 'all' || channel.group === selectedGroup;
      const matchesFavorites = !showFavoritesOnly || favorites.has(channel.id);
      return matchesSearch && matchesGroup && matchesFavorites;
    });

    switch (sortBy) {
      case 'a-z':
        filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'z-a':
        filtered = [...filtered].sort((a, b) => b.name.localeCompare(a.name));
        break;
    }

    return filtered;
  }, [channels, searchQuery, selectedGroup, showFavoritesOnly, favorites, sortBy]);

  const {
    visibleItems: visibleChannels,
    onScroll,
    ensureIndexVisible,
    hasMore,
  } = useProgressiveList(filteredChannels, {
    initial: 120,
    step: 120,
  });

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (filteredChannels.length === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setFocusedIndex((prev) => {
            const next = Math.min(prev + 1, filteredChannels.length - 1);
            ensureIndexVisible(next);
            return next;
          });
          break;
        case 'ArrowUp':
          e.preventDefault();
          setFocusedIndex((prev) => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredChannels[focusedIndex]) {
            onChannelSelect(filteredChannels[focusedIndex]);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filteredChannels, focusedIndex, onChannelSelect, ensureIndexVisible]);

  return (
    <div className="h-full flex bg-background">
      {/* Left Sidebar - Categories with Flags */}
      <div className="w-72 flex flex-col border-r border-border/30">
        {/* Back Button & Title */}
        <div className="flex items-center gap-4 p-5">
          <button
            onClick={onBack}
            className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 active:scale-95 transition-all duration-100"
          >
            <ChevronLeft className="w-6 h-6 text-muted-foreground" />
          </button>
          <h1 className="text-xl font-semibold text-foreground">
            {showFavoritesOnly ? (
              <>
                <span className="font-bold">Favorites</span>{' '}
                <span className="font-normal text-muted-foreground">{getCategoryTitle(category)}</span>
              </>
            ) : (
              getCategoryTitle(category)
            )}
          </h1>
        </div>

        {/* Country/Category List */}
        <div className="flex-1 overflow-y-auto px-3 space-y-1 mi-scrollbar">
          {groups.slice(0, 15).map((group) => (
            <button
              key={group.name}
              onClick={() => setSelectedGroup(group.name)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-colors ${
                selectedGroup === group.name
                  ? 'bg-card text-foreground'
                  : 'text-muted-foreground hover:bg-card/50 hover:text-foreground'
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                {getCountryFlagUrl(group.name) ? (
                  <img 
                    src={getCountryFlagUrl(group.name)!} 
                    alt={group.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xl">{getCategoryEmoji(group.name)}</span>
                )}
              </div>
              <div className="flex-1 text-left">
                <p className={`text-sm truncate ${selectedGroup === group.name ? 'font-semibold text-foreground' : ''}`}>
                  {getDisplayName(group.name)}
                </p>
                {selectedGroup === group.name && (
                  <p className="text-xs text-muted-foreground">{group.count} Channels</p>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Bottom Nav Icons */}
        <div className="p-4 flex flex-col gap-2">
          <button
            onClick={() => setSelectedGroup('all')}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
              selectedGroup === 'all' && !showFavoritesOnly ? 'bg-secondary text-foreground' : 'bg-card text-muted-foreground hover:bg-card/80'
            }`}
          >
            <Tv className="w-6 h-6" />
          </button>
          <button
            onClick={() => onToggleFavorite('')}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
              showFavoritesOnly ? 'bg-secondary text-foreground' : 'bg-card text-muted-foreground hover:bg-card/80'
            }`}
          >
            <Star className={`w-6 h-6 ${showFavoritesOnly ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Content - Channel List */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/30">
          {/* Sort Dropdown */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-60 bg-card border-border/50 rounded-xl h-12">
              <SelectValue placeholder="Order By Number" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="number">Order By Number</SelectItem>
              <SelectItem value="added">Order By Added</SelectItem>
              <SelectItem value="a-z">Order By A-Z</SelectItem>
              <SelectItem value="z-a">Order By Z-A</SelectItem>
            </SelectContent>
          </Select>

          {/* Time & Weather */}
          <div className="flex items-center gap-6">
            <span className="text-foreground font-medium text-lg">
              {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Cloud className="w-5 h-5" />
              <span>24°</span>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setViewMode(viewMode === 'list' ? 'card' : 'list')}
              className="w-11 h-11 rounded-full bg-card flex items-center justify-center hover:bg-card/80 transition-colors"
            >
              {viewMode === 'list' ? <Grid className="w-5 h-5 text-muted-foreground" /> : <List className="w-5 h-5 text-muted-foreground" />}
            </button>
            <button className="w-11 h-11 rounded-full bg-card flex items-center justify-center hover:bg-card/80 transition-colors">
              <Search className="w-5 h-5 text-muted-foreground" />
            </button>
            <div className="w-11 h-11 rounded-full bg-primary overflow-hidden flex items-center justify-center ring-2 ring-primary/30">
              <User className="w-5 h-5 text-primary-foreground" />
            </div>
          </div>
        </div>

        {/* Channel List */}
        <div className="flex-1 overflow-y-auto px-6 py-4 mi-scrollbar" onScroll={onScroll}>
          {viewMode === 'list' ? (
            <div className="space-y-2">
              {visibleChannels.map((channel, index) => (
                <button
                  key={channel.id}
                  onClick={() => onChannelSelect(channel)}
                  className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
                    currentChannel?.id === channel.id
                      ? 'mi-card-selected'
                      : focusedIndex === index
                      ? 'bg-card'
                      : 'bg-card/50 hover:bg-card'
                  }`}
                >
                  {/* Channel Logo */}
                  <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                    {channel.logo ? (
                      <img
                        src={channel.logo}
                        alt={channel.name}
                        loading="lazy"
                        className="w-full h-full object-contain p-1"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <span className="text-lg font-bold text-muted-foreground">
                        {channel.name.charAt(0)}
                      </span>
                    )}
                  </div>

                  {/* Channel Name */}
                  <span className="flex-1 text-left text-foreground font-medium truncate">
                    {channel.name}
                  </span>

                  {/* Badges */}
                  <div className="flex items-center gap-2">
                    <span className="mi-badge mi-badge-secondary">HD</span>
                    <span className="mi-badge mi-badge-secondary">EPG</span>
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(channel.id);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.stopPropagation();
                          onToggleFavorite(channel.id);
                        }
                      }}
                      className="cursor-pointer"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          favorites.has(channel.id)
                            ? 'fill-accent text-accent'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      />
                    </span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {visibleChannels.map((channel, index) => (
                <button
                  key={channel.id}
                  onClick={() => onChannelSelect(channel)}
                  className={`flex gap-4 p-4 rounded-xl transition-all ${
                    currentChannel?.id === channel.id
                      ? 'mi-card-selected bg-card'
                      : focusedIndex === index
                      ? 'bg-card'
                      : 'bg-card/50 hover:bg-card'
                  }`}
                >
                  {/* Channel Logo - Larger for card view */}
                  <div className="w-28 h-20 rounded-xl bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                    {channel.logo ? (
                      <img
                        src={channel.logo}
                        alt={channel.name}
                        loading="lazy"
                        className="w-full h-full object-contain p-3"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <span className="text-2xl font-bold text-muted-foreground">
                        {channel.name.charAt(0)}
                      </span>
                    )}
                  </div>

                  {/* Channel Info */}
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div>
                      <h3 className="text-foreground font-semibold text-left text-lg">{channel.name}</h3>
                      <p className="text-muted-foreground text-sm text-left">+8.2M Views</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-1">
                        <span className="mi-badge mi-badge-secondary">HD</span>
                        <span className="mi-badge mi-badge-secondary">EPG</span>
                      </div>
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavorite(channel.id);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.stopPropagation();
                            onToggleFavorite(channel.id);
                          }
                        }}
                        className="cursor-pointer"
                      >
                        <Star
                          className={`w-5 h-5 ${
                            favorites.has(channel.id)
                              ? 'fill-accent text-accent'
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                        />
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {hasMore && (
            <div className="py-6 text-center text-muted-foreground text-sm">Loading more…</div>
          )}

          {filteredChannels.length === 0 && (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <p className="text-muted-foreground text-lg">No channels found</p>
              <p className="text-muted-foreground/60 text-sm mt-2">
                Try adjusting your search or filters
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Video Preview Panel (when channel selected) */}
      {currentChannel && (
        <div className="w-[420px] relative bg-gradient-to-l from-background/95 to-transparent">
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-30"
            style={{ backgroundImage: `url(${currentChannel.logo || ''})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
          <div className="absolute bottom-10 left-6 right-6">
            <p className="text-muted-foreground text-sm mb-2">Now Playing...</p>
            <h2 className="text-foreground text-3xl font-bold mb-2">{currentChannel.name}</h2>
            <p className="text-muted-foreground text-sm line-clamp-3">
              {currentChannel.group || 'Live TV Channel'}
            </p>
            {/* Progress bar placeholder */}
            <div className="mt-6">
              <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
                <div className="w-3/4 h-full bg-foreground" />
              </div>
              <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                <span>01:52:37</span>
                <span>02:10:46</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
