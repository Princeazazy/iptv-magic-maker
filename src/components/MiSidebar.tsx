import { Tv, Film, Clapperboard, Trophy, Settings, Heart, ChevronLeft } from 'lucide-react';

type NavItem = 'live' | 'movies' | 'series' | 'sports' | 'favorites' | 'settings';

interface MiSidebarProps {
  activeItem: NavItem;
  onItemSelect: (item: NavItem) => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

const navItems: { id: NavItem; icon: typeof Tv; label: string }[] = [
  { id: 'live', icon: Tv, label: 'Live' },
  { id: 'movies', icon: Film, label: 'Movies' },
  { id: 'series', icon: Clapperboard, label: 'Series' },
  { id: 'sports', icon: Trophy, label: 'Sports Guide' },
  { id: 'favorites', icon: Heart, label: 'Favorites' },
  { id: 'settings', icon: Settings, label: 'Settings' },
];

export const MiSidebar = ({ 
  activeItem, 
  onItemSelect, 
  collapsed = false,
  onToggleCollapse 
}: MiSidebarProps) => {
  return (
    <aside className={`flex flex-col bg-sidebar-background border-r border-sidebar-border transition-all duration-300 ${
      collapsed ? 'w-20' : 'w-64'
    }`}>
      {/* Navigation Items */}
      <nav className="flex-1 py-6 px-3 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeItem === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onItemSelect(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'bg-primary text-primary-foreground mi-glow' 
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <div className={`flex items-center justify-center ${collapsed ? 'w-full' : 'w-10 h-10'} rounded-full ${
                isActive ? 'bg-primary-foreground/20' : 'bg-muted'
              }`}>
                <Icon className="w-5 h-5" />
              </div>
              {!collapsed && (
                <span className="font-medium">{item.label}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Collapse Toggle */}
      {onToggleCollapse && (
        <button
          onClick={onToggleCollapse}
          className="p-4 border-t border-sidebar-border text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className={`w-5 h-5 mx-auto transition-transform ${collapsed ? 'rotate-180' : ''}`} />
        </button>
      )}
    </aside>
  );
};
