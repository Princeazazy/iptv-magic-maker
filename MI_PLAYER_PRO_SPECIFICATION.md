# Mi Player Pro - Complete Application Specification

## 📋 Table of Contents
1. [Overview](#overview)
2. [Technology Stack](#technology-stack)
3. [Design System](#design-system)
4. [Application Screens](#application-screens)
5. [Components Library](#components-library)
6. [Data Structures](#data-structures)
7. [Features & Functionality](#features--functionality)
8. [API & Backend](#api--backend)
9. [Assets Required](#assets-required)

---

## Overview

**Mi Player Pro** is a premium IPTV (Internet Protocol Television) streaming application designed for watching live TV channels, movies, and series. The app features a modern, dark-themed interface with an Arabian aesthetic, supporting M3U playlist parsing and HLS stream playback.

### Key Capabilities
- Live TV streaming with 1000+ channels support
- VOD (Video on Demand) movies catalog
- TV Series browsing
- Sports channels guide
- Favorites management
- Global search across all content
- Fullscreen video player with controls
- M3U playlist URL configuration
- Background ambient music

---

## Technology Stack

| Technology | Purpose |
|------------|---------|
| React 18 | UI Framework |
| TypeScript | Type Safety |
| Vite | Build Tool |
| Tailwind CSS | Styling |
| shadcn/ui | UI Components |
| Framer Motion | Animations |
| HLS.js | Video Streaming |
| Supabase | Backend (Edge Functions) |
| Capacitor | Mobile App Wrapper |
| Lucide React | Icons |

---

## Design System

### Color Palette (HSL Values)

```css
/* Primary Colors */
--background: 240 10% 3.9%           /* Deep dark background #09090b */
--foreground: 0 0% 98%               /* White text #fafafa */

/* Accent Colors */
--primary: 24 95% 53%                /* Orange accent #f97316 */
--primary-foreground: 0 0% 100%     /* White on primary */

/* Secondary Colors */
--secondary: 240 3.7% 15.9%          /* Dark gray #27272a */
--secondary-foreground: 0 0% 98%    /* Light text on secondary */

/* Muted Colors */
--muted: 240 3.7% 15.9%              /* Muted background */
--muted-foreground: 240 5% 64.9%    /* Muted text #a1a1aa */

/* Accent */
--accent: 240 3.7% 15.9%             /* Accent background */
--accent-foreground: 0 0% 98%       /* Accent text */

/* Card Colors */
--card: 240 10% 3.9%                 /* Card background */
--card-foreground: 0 0% 98%         /* Card text */

/* Border & Input */
--border: 240 3.7% 15.9%             /* Border color */
--input: 240 3.7% 15.9%              /* Input border */
--ring: 24 95% 53%                   /* Focus ring (orange) */

/* Destructive */
--destructive: 0 62.8% 30.6%         /* Red for errors */

/* Sidebar Colors */
--sidebar-background: 240 5.9% 10%   /* Slightly lighter than bg */
--sidebar-foreground: 240 4.8% 95.9% /* Sidebar text */
--sidebar-primary: 24 95% 53%        /* Orange for active */
--sidebar-accent: 240 3.7% 15.9%     /* Hover state */
--sidebar-border: 240 3.7% 15.9%     /* Sidebar borders */

/* Custom Mi Player Colors */
--mi-red: 0 84% 60%                  /* Red accent #ef4444 */
--mi-orange: 24 95% 53%              /* Orange #f97316 */
--mi-gold: 45 93% 47%                /* Gold #eab308 */
```

### Typography

| Element | Font | Size | Weight |
|---------|------|------|--------|
| Page Title | System Sans | 32px | Bold (700) |
| Section Title | System Sans | 24px | Semibold (600) |
| Card Title | System Sans | 18px | Medium (500) |
| Body Text | System Sans | 14px | Regular (400) |
| Small Text | System Sans | 12px | Regular (400) |
| Button | System Sans | 14px | Medium (500) |

### Spacing Scale

```
4px, 8px, 12px, 16px, 20px, 24px, 32px, 48px, 64px
```

### Border Radius

```css
--radius: 0.5rem (8px)
/* Buttons: rounded-lg (8px) */
/* Cards: rounded-xl (12px) */
/* Modals: rounded-2xl (16px) */
```

### Shadows & Effects

```css
/* Glass effect */
background: rgba(255, 255, 255, 0.05);
backdrop-filter: blur(10px);
border: 1px solid rgba(255, 255, 255, 0.1);

/* Glow effect on active items */
box-shadow: 0 0 20px rgba(249, 115, 22, 0.3);

/* Card hover */
transform: scale(1.02);
transition: all 0.3s ease;
```

---

## Application Screens

### 1. Intro Screen (Arabia Theme)

![Intro Screen Layout]

**Purpose:** Splash screen shown on app launch with animated logo

**Layout:**
- Full screen dark background
- Centered animated logo with smoke effect
- Auto-advances to Home after 3 seconds
- Background ambient music plays

**Elements:**
- Logo: "arabia" text in gold gradient
- Smoke animation behind logo
- Video background option (arabia-intro.mp4)

---

### 2. Home Screen

**Purpose:** Main navigation hub displaying content counts and quick access

**Layout (1920x1080 reference):**
```
┌────────────────────────────────────────────────────────────────┐
│  [Logo]              [Search Bar]           [Settings] [User] │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│     ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│     │   LIVE TV   │  │   MOVIES    │  │   SERIES    │         │
│     │   [1234]    │  │   [5678]    │  │   [901]     │         │
│     │     📺      │  │     🎬      │  │     📀      │         │
│     └─────────────┘  └─────────────┘  └─────────────┘         │
│                                                                │
│     ┌─────────────┐                                           │
│     │SPORTS GUIDE │  ┌──────────────────────────────────┐     │
│     │     ⚽      │  │  [Sidebar Navigation]            │     │
│     └─────────────┘  │  • Account                       │     │
│                      │  • Reload                        │     │
│                      │  • Catch up                      │     │
│                      │  • Exit                          │     │
│                      └──────────────────────────────────┘     │
│                                                                │
│  [Weather: 25°C Sunny]                    [Time: 10:30:25 AM] │
└────────────────────────────────────────────────────────────────┘
```

**Background:** Arabian palace image with overlay gradient

**Interactive Elements:**
| Element | Action |
|---------|--------|
| Live TV Card | Navigate to Live TV list |
| Movies Card | Navigate to Movies grid |
| Series Card | Navigate to Series grid |
| Sports Guide Card | Navigate to Sports channels |
| Search Bar | Open global search modal |
| Settings Icon | Navigate to Settings |
| Account | Show account details |
| Reload | Refresh channel list |

**Card Design:**
- Size: ~280px × 180px
- Border radius: 16px
- Background: Glass effect with gradient
- Icon: Centered, 48px
- Count badge: Bottom, orange background

---

### 3. Live TV List Screen

**Purpose:** Browse and select live TV channels organized by country/category

**Layout:**
```
┌────────────────────────────────────────────────────────────────┐
│  [←Back] LIVE TV    [Sort▼] [Grid/List Toggle] [Search]       │
├──────────────┬─────────────────────────────────────────────────┤
│              │                                                 │
│  Categories  │  Channel List                                   │
│  ──────────  │  ─────────────                                  │
│  🇺🇸 USA (45)│  ┌────────┐ ┌────────┐ ┌────────┐              │
│  🇬🇧 UK (32) │  │  Logo  │ │  Logo  │ │  Logo  │              │
│  🇪🇬 Egypt   │  │  Name  │ │  Name  │ │  Name  │              │
│  🇸🇦 Saudi   │  │  Group │ │  Group │ │  Group │              │
│  🇦🇪 UAE     │  └────────┘ └────────┘ └────────┘              │
│  ...         │                                                 │
│              │  ┌────────┐ ┌────────┐ ┌────────┐              │
│  [Selected   │  │  ...   │ │  ...   │ │  ...   │              │
│   shows      │  └────────┘ └────────┘ └────────┘              │
│   preview]   │                                                 │
│              │                                                 │
└──────────────┴─────────────────────────────────────────────────┘
```

**Left Sidebar (280px width):**
- Scrollable category list
- Each item shows: Flag icon, Country name, Channel count
- Selected category highlighted with orange background
- Search filter for categories

**Main Content Area:**
- Grid or List view toggle
- Sort options: A-Z, Z-A, Recently Added
- Channel cards in responsive grid (3-5 columns)
- Pagination or infinite scroll

**Channel Card (Grid View):**
```
┌─────────────────┐
│    [Channel     │
│      Logo]      │
│                 │
│  Channel Name   │
│  Category       │
│  [♥ Favorite]   │
└─────────────────┘
Size: 180px × 220px
```

**Channel Row (List View):**
```
┌────────────────────────────────────────────────────┐
│ [Logo] │ Channel Name │ Category │ [♥] │ [▶ Play] │
└────────────────────────────────────────────────────┘
Height: 64px
```

---

### 4. Movies Grid Screen

**Purpose:** Browse VOD movies catalog with filtering

**Layout:** Same as Live TV but with movie-specific metadata

**Movie Card:**
```
┌─────────────────┐
│                 │
│   [Movie        │
│    Poster]      │
│                 │
│─────────────────│
│ Movie Title     │
│ ⭐ 7.5 │ 2023   │
│ [♥ Favorite]    │
└─────────────────┘
Size: 200px × 320px
Aspect Ratio: 2:3
```

**Categories Sidebar:**
- All Movies
- Action
- Comedy
- Drama
- Horror
- Sci-Fi
- Romance
- Documentary
- Animation
- (Dynamic from playlist groups)

---

### 5. Series Grid Screen

**Purpose:** Browse TV series catalog

**Layout:** Same as Movies Grid

**Series Card:**
```
┌─────────────────┐
│                 │
│   [Series       │
│    Poster]      │
│                 │
│─────────────────│
│ Series Title    │
│ S3 │ 24 Episodes│
│ [♥ Favorite]    │
└─────────────────┘
```

---

### 6. Movie/Series Detail Screen

**Purpose:** Show detailed information about selected content

**Layout:**
```
┌────────────────────────────────────────────────────────────────┐
│  [←Back]                              [Time] [Weather] [User] │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  [Blurred Background from Poster]                              │
│                                                                │
│  ┌──────────┐   MOVIE TITLE                                   │
│  │          │   ────────────────────                          │
│  │  Poster  │   ⭐ 8.5  │  2023  │  2h 15m  │  Action         │
│  │          │                                                  │
│  │          │   Director: Christopher Nolan                    │
│  │          │   Cast: Actor 1, Actor 2, Actor 3               │
│  │          │                                                  │
│  │          │   Lorem ipsum dolor sit amet, consectetur       │
│  │          │   adipiscing elit. Sed do eiusmod tempor...     │
│  │          │                                                  │
│  └──────────┘   [▶ Trailer]  [▶ Watch Now]  [♥ Add to Fav]   │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

**Poster Size:** 300px × 450px

**Metadata Displayed:**
- Title (large, white)
- Rating (star icon + number)
- Year
- Duration
- Genre
- Director
- Cast
- Plot summary

**Action Buttons:**
| Button | Style | Action |
|--------|-------|--------|
| Trailer | Outline | Play trailer if available |
| Watch Now | Primary (Orange) | Start playback |
| Add to Favorites | Icon button | Toggle favorite |

---

### 7. Fullscreen Video Player

**Purpose:** Full-screen video playback with controls

**Layout:**
```
┌────────────────────────────────────────────────────────────────┐
│  [✕ Close]                                                     │
│                                                                │
│                                                                │
│                                                                │
│                    [VIDEO CONTENT]                             │
│                                                                │
│                                                                │
│                                                                │
├────────────────────────────────────────────────────────────────┤
│  Channel Name                                      10:30:25 AM │
│  Category / Group                                              │
├────────────────────────────────────────────────────────────────┤
│  [🔇Mute] [⏮Prev] [⏯Play/Pause] [⏭Next] [⚙Settings] [⛶Full] │
│  ═══════════════════════════════●════════════════════════════  │
│  00:15:30                                           01:45:00   │
└────────────────────────────────────────────────────────────────┘
```

**Controls (appear on mouse move, hide after 3s):**

| Control | Icon | Action |
|---------|------|--------|
| Close | X | Exit player |
| Mute | 🔇/🔊 | Toggle audio |
| Previous | ⏮ | Previous channel |
| Play/Pause | ▶/⏸ | Toggle playback |
| Next | ⏭ | Next channel |
| Settings | ⚙ | Quality/Audio options |
| Fullscreen | ⛶ | Toggle fullscreen |

**Progress Bar:**
- Height: 4px (8px on hover)
- Background: White 20% opacity
- Progress: Orange gradient
- Scrubber: White circle, 16px

---

### 8. Settings Screen

**Purpose:** App configuration and account management

**Layout:**
```
┌────────────────────────────────────────────────────────────────┐
│  [←Back] SETTINGS                              [Time] [User]  │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  [Avatar]  User Name                                   │   │
│  │            user@email.com                              │   │
│  │                                                        │   │
│  │  Status: Active     Expires: 2025-12-31               │   │
│  │  MAC: XX:XX:XX:XX   Device Key: XXXX-XXXX             │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  ⚙ General Settings                                   │   │
│  │  ───────────────────────────────────────────────────   │   │
│  │  🔒 Parent Control                              [→]   │   │
│  │  📋 Change Playlist                             [→]   │   │
│  │  🗑 Delete Cache                                [→]   │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                │
│  App Version: 1.0.0                                           │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

**Settings Options:**

| Setting | Description |
|---------|-------------|
| Parent Control | PIN-protected content filtering |
| Change Playlist | Update M3U playlist URL |
| Delete Cache | Clear stored data and reload |

**Playlist URL Dialog:**
- Input field for M3U URL
- Supports Xtream Codes format
- Save and Cancel buttons

---

### 9. Global Search Modal

**Purpose:** Search across all content types

**Layout:**
```
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│            🔍 [Search channels, movies, series...]            │
│                                                                │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  Live Channels (5 results)                                     │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐      │
│  │  ...   │ │  ...   │ │  ...   │ │  ...   │ │  ...   │      │
│  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘      │
│                                                                │
│  Movies (3 results)                                            │
│  ┌────────┐ ┌────────┐ ┌────────┐                             │
│  │  ...   │ │  ...   │ │  ...   │                             │
│  └────────┘ └────────┘ └────────┘                             │
│                                                                │
│  Series (2 results)                                            │
│  ┌────────┐ ┌────────┐                                        │
│  │  ...   │ │  ...   │                                        │
│  └────────┘ └────────┘                                        │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

**Features:**
- Real-time search as you type
- Debounced input (300ms)
- Results grouped by content type
- Keyboard navigation support
- ESC to close

---

## Components Library

### Buttons

```tsx
// Primary Button
<Button variant="default" className="bg-primary text-primary-foreground">
  Watch Now
</Button>

// Secondary Button
<Button variant="secondary">
  Cancel
</Button>

// Ghost Button
<Button variant="ghost">
  <Settings className="w-5 h-5" />
</Button>

// Icon Button
<Button variant="ghost" size="icon">
  <Heart className="w-5 h-5" />
</Button>
```

### Cards

```tsx
// Channel Card
<div className="bg-card rounded-xl p-4 hover:scale-102 transition-transform">
  <img src={logo} className="w-full h-24 object-contain" />
  <h3 className="text-foreground font-medium">{name}</h3>
  <p className="text-muted-foreground text-sm">{group}</p>
</div>

// Movie Card
<div className="bg-card rounded-xl overflow-hidden">
  <img src={poster} className="w-full aspect-[2/3] object-cover" />
  <div className="p-3">
    <h3 className="text-foreground font-medium truncate">{title}</h3>
    <div className="flex items-center gap-2 text-muted-foreground text-sm">
      <Star className="w-4 h-4 text-yellow-500" />
      <span>{rating}</span>
      <span>•</span>
      <span>{year}</span>
    </div>
  </div>
</div>
```

### Navigation Item

```tsx
<button className={cn(
  "w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all",
  isActive 
    ? "bg-primary text-primary-foreground" 
    : "text-muted-foreground hover:bg-muted"
)}>
  <Icon className="w-5 h-5" />
  <span>{label}</span>
</button>
```

### Input Fields

```tsx
<div className="relative">
  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
  <Input 
    className="pl-10 bg-muted border-border" 
    placeholder="Search..."
  />
</div>
```

---

## Data Structures

### Channel Interface

```typescript
interface Channel {
  id: string;                    // Unique identifier
  name: string;                  // Channel display name
  url: string;                   // Stream URL (HLS/MP4)
  logo: string;                  // Channel logo URL
  group: string;                 // Category/Group name
  type: 'live' | 'movies' | 'series' | 'sports';
  
  // Extended metadata (for movies/series)
  tvgId?: string;               // EPG ID
  tvgName?: string;             // EPG name
  
  // Movie/Series specific
  rating?: string;              // e.g., "8.5"
  year?: string;                // Release year
  duration?: string;            // e.g., "2h 15m"
  genre?: string;               // Genre list
  director?: string;            // Director name
  cast?: string;                // Cast list
  plot?: string;                // Description
  poster?: string;              // Poster image URL
  backdrop?: string;            // Backdrop image URL
  
  // Series specific
  seasonNum?: string;           // Season number
  episodeNum?: string;          // Episode number
  seriesId?: string;            // Parent series ID
}
```

### M3U Playlist Format

```
#EXTM3U
#EXTINF:-1 tvg-id="channel1" tvg-name="Channel One" tvg-logo="http://logo.url" group-title="USA",Channel One
http://stream.url/channel1.m3u8

#EXTINF:-1 tvg-id="movie1" tvg-name="Movie Title" tvg-logo="http://poster.url" group-title="VOD: Action",Movie Title (2023)
http://stream.url/movie1.mp4
```

### Xtream Codes API Format

```
Base URL: http://provider.com:port
Username: user123
Password: pass456

Endpoints:
- /player_api.php?username={u}&password={p}&action=get_live_streams
- /player_api.php?username={u}&password={p}&action=get_vod_streams
- /player_api.php?username={u}&password={p}&action=get_series
```

### Local Storage Schema

```typescript
// Favorites
localStorage.setItem('favorites', JSON.stringify(['channel-id-1', 'channel-id-2']));

// Playlist URL
localStorage.setItem('playlistUrl', 'http://playlist.url/get.php?username=x&password=y');

// User Preferences
localStorage.setItem('preferences', JSON.stringify({
  volume: 0.8,
  autoplay: true,
  quality: 'auto'
}));
```

---

## Features & Functionality

### 1. Playlist Management

**Flow:**
1. User opens Settings → Change Playlist
2. Enters M3U URL or Xtream credentials
3. App fetches and parses playlist
4. Channels stored in memory (not persisted)
5. Displayed across Live/Movies/Series sections

**Supported Formats:**
- Standard M3U/M3U8
- Xtream Codes API
- Direct stream URLs

### 2. Content Classification

**Automatic Detection Logic:**

```typescript
function getContentType(group: string, name: string): ContentType {
  const groupLower = group.toLowerCase();
  const nameLower = name.toLowerCase();
  
  // VOD/Movies detection
  if (groupLower.includes('vod') || groupLower.includes('movie')) {
    return 'movies';
  }
  
  // Series detection
  if (groupLower.includes('series') || /s\d{1,2}\s*e\d{1,2}/i.test(nameLower)) {
    return 'series';
  }
  
  // Sports detection
  if (groupLower.includes('sport') || groupLower.includes('bein')) {
    return 'sports';
  }
  
  // Default to live TV
  return 'live';
}
```

### 3. Favorites System

**Storage:** LocalStorage with array of channel IDs
**Sync:** Immediate update on toggle
**Display:** Heart icon filled/outline state

### 4. Video Playback

**Technology:** HLS.js for adaptive streaming

**Supported Formats:**
- HLS (.m3u8)
- MP4 (direct)
- MPEG-TS

**Features:**
- Adaptive bitrate
- Error recovery
- Fullscreen mode
- Volume control
- Channel navigation

### 5. Search

**Scope:** All channels, movies, series
**Method:** Client-side filtering
**Fields:** name, group, genre, cast, director

### 6. Background Music

**File:** arabian-ambient.mp3
**Behavior:** 
- Plays on home screen
- Stops during video playback
- Volume: 30%
- Loop: enabled

---

## API & Backend

### Edge Functions

#### 1. fetch-m3u

**Purpose:** Proxy M3U playlist fetching to avoid CORS

**Endpoint:** `POST /functions/v1/fetch-m3u`

**Request:**
```json
{
  "url": "http://playlist.provider.com/get.php?...",
  "maxChannels": 5000,
  "preferXtreamApi": true
}
```

**Response:**
```json
{
  "channels": [...],
  "counts": {
    "live": 1234,
    "movies": 5678,
    "series": 901,
    "sports": 45
  },
  "metadata": {
    "fetchTime": 1500,
    "source": "xtream"
  }
}
```

#### 2. stream-proxy

**Purpose:** Proxy HLS streams for web playback

**Endpoint:** `GET /functions/v1/stream-proxy?url={encoded_stream_url}`

**Features:**
- Rate limiting (100 req/min)
- M3U8 URL rewriting
- CORS headers

---

## Assets Required

### Images

| Asset | Path | Dimensions | Format |
|-------|------|------------|--------|
| App Logo | /assets/arabia-logo.png | 200x60 | PNG |
| Palace Background | /assets/arabian-palace-bg.png | 1920x1080 | PNG |
| Default Channel Logo | /placeholder.svg | 100x100 | SVG |
| Default Movie Poster | /placeholder.svg | 300x450 | SVG |

### Audio

| Asset | Path | Duration | Format |
|-------|------|----------|--------|
| Ambient Music | /audio/arabian-ambient.mp3 | Loop | MP3 |

### Video

| Asset | Path | Duration | Format |
|-------|------|----------|--------|
| Intro Video | /assets/arabia-intro.mp4 | 3-5s | MP4 |

### Icons (Lucide React)

```
Tv, Film, Clapperboard, Trophy, Settings, Heart, 
Search, Play, Pause, SkipBack, SkipForward,
Volume2, VolumeX, Maximize, Minimize, X, 
ChevronLeft, ChevronRight, Star, Clock, Calendar,
User, RefreshCw, LogOut, Mic, Sun, Cloud
```

---

## Responsive Breakpoints

| Breakpoint | Width | Layout Changes |
|------------|-------|----------------|
| Mobile | < 640px | Single column, bottom nav |
| Tablet | 640-1024px | 2-3 columns, collapsed sidebar |
| Desktop | 1024-1440px | 4 columns, full sidebar |
| Large | > 1440px | 5-6 columns, expanded layout |

---

## Animations

### Page Transitions

```typescript
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

// Duration: 300ms
// Easing: ease-out
```

### Card Hover

```css
.card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.card:hover {
  transform: scale(1.02);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}
```

### Logo Smoke Effect

```css
@keyframes smoke-rise {
  0% { transform: translateY(20px); opacity: 0; }
  50% { opacity: 0.6; }
  100% { transform: translateY(-40px); opacity: 0; }
}
```

---

## Performance Considerations

1. **Virtual Scrolling:** Use for lists > 100 items
2. **Image Lazy Loading:** Load images on viewport entry
3. **Debounced Search:** 300ms delay on input
4. **Memoization:** useMemo for filtered lists
5. **Progressive Loading:** Load first 50 items, then batch rest

---

## Error Handling

| Error | User Message | Recovery |
|-------|--------------|----------|
| Network failure | "Unable to load channels. Check your connection." | Retry button |
| Invalid playlist | "The playlist URL is invalid or unreachable." | Edit URL |
| Stream error | "Unable to play this channel." | Skip to next |
| Rate limited | "Too many requests. Please wait." | Auto-retry |

---

## Accessibility

- Keyboard navigation for all interactive elements
- Focus visible indicators (orange ring)
- Alt text for all images
- ARIA labels for icon buttons
- Color contrast ratio > 4.5:1

---

*Document Version: 1.0*
*Last Updated: January 2026*
*For: Mi Player Pro IPTV Application*
