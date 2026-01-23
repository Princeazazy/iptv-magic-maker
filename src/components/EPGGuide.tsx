import { useState, useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Play, Clock } from 'lucide-react';
import { Channel } from '@/hooks/useIPTV';

interface Program {
  id: string;
  title: string;
  start: Date;
  end: Date;
  description?: string;
  category?: string;
}

interface EPGGuideProps {
  channels: Channel[];
  currentChannel?: Channel | null;
  onChannelSelect: (channel: Channel) => void;
  onClose: () => void;
}

// Generate mock EPG data (in real app, this would come from an EPG API)
const generateMockPrograms = (channel: Channel): Program[] => {
  const now = new Date();
  const programs: Program[] = [];
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);

  const programTitles = [
    'Morning News', 'Breakfast Show', 'Talk Show', 'Documentary',
    'Movie: Action', 'Series Episode', 'Sports Highlights', 'Evening News',
    'Prime Time Movie', 'Late Night Show', 'Music Hour', 'Weather Report',
    'Kids Show', 'Drama Series', 'Comedy Hour', 'News Update'
  ];

  let currentStart = new Date(startOfDay);
  let programIndex = 0;

  while (currentStart < new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000)) {
    const duration = Math.floor(Math.random() * 60 + 30) * 60 * 1000; // 30-90 mins
    const end = new Date(currentStart.getTime() + duration);

    programs.push({
      id: `${channel.id}-${programIndex}`,
      title: programTitles[programIndex % programTitles.length],
      start: new Date(currentStart),
      end,
      description: `${programTitles[programIndex % programTitles.length]} on ${channel.name}`,
      category: ['News', 'Entertainment', 'Sports', 'Documentary'][Math.floor(Math.random() * 4)],
    });

    currentStart = end;
    programIndex++;
  }

  return programs;
};

export const EPGGuide = ({
  channels,
  currentChannel,
  onChannelSelect,
  onClose,
}: EPGGuideProps) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [now, setNow] = useState(new Date());
  const timelineRef = useRef<HTMLDivElement>(null);
  const [hoveredProgram, setHoveredProgram] = useState<Program | null>(null);

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Generate EPG data for visible channels
  const channelPrograms = useMemo(() => {
    const programs = new Map<string, Program[]>();
    channels.slice(0, 20).forEach((channel) => {
      programs.set(channel.id, generateMockPrograms(channel));
    });
    return programs;
  }, [channels]);

  // Time slots for the timeline (24 hours in 30-min increments)
  const timeSlots = useMemo(() => {
    const slots: Date[] = [];
    const start = new Date(selectedDate);
    start.setHours(0, 0, 0, 0);

    for (let i = 0; i < 48; i++) {
      slots.push(new Date(start.getTime() + i * 30 * 60 * 1000));
    }
    return slots;
  }, [selectedDate]);

  // Scroll to current time on mount
  useEffect(() => {
    if (timelineRef.current) {
      const nowMinutes = now.getHours() * 60 + now.getMinutes();
      const scrollPosition = (nowMinutes / 30) * 120 - 200; // 120px per 30 min slot
      timelineRef.current.scrollLeft = Math.max(0, scrollPosition);
    }
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getProgramWidth = (program: Program) => {
    const durationMs = program.end.getTime() - program.start.getTime();
    const durationMins = durationMs / (1000 * 60);
    return (durationMins / 30) * 120; // 120px per 30 min
  };

  const getProgramOffset = (program: Program) => {
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);
    const offsetMs = program.start.getTime() - startOfDay.getTime();
    const offsetMins = offsetMs / (1000 * 60);
    return (offsetMins / 30) * 120;
  };

  const isCurrentProgram = (program: Program) => {
    return now >= program.start && now < program.end;
  };

  const getCurrentTimeOffset = () => {
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);
    const offsetMs = now.getTime() - startOfDay.getTime();
    const offsetMins = offsetMs / (1000 * 60);
    return (offsetMins / 30) * 120;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="bg-background border-t border-border/30"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/30">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-card flex items-center justify-center hover:bg-card/80"
          >
            <ChevronLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <h2 className="text-lg font-semibold text-foreground">Program Guide</h2>
        </div>

        {/* Date Navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedDate(new Date(selectedDate.getTime() - 24 * 60 * 60 * 1000))}
            className="w-8 h-8 rounded-full bg-card flex items-center justify-center hover:bg-card/80"
          >
            <ChevronLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <span className="text-foreground font-medium min-w-[120px] text-center">
            {selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </span>
          <button
            onClick={() => setSelectedDate(new Date(selectedDate.getTime() + 24 * 60 * 60 * 1000))}
            className="w-8 h-8 rounded-full bg-card flex items-center justify-center hover:bg-card/80"
          >
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Current Time */}
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span>{formatTime(now)}</span>
        </div>
      </div>

      {/* EPG Grid */}
      <div className="flex">
        {/* Channel Column */}
        <div className="w-48 flex-shrink-0 border-r border-border/30">
          {/* Time header spacer */}
          <div className="h-10 border-b border-border/30 bg-card/50" />

          {/* Channel list */}
          {channels.slice(0, 20).map((channel) => (
            <button
              key={channel.id}
              onClick={() => onChannelSelect(channel)}
              className={`w-full flex items-center gap-3 px-3 py-2 h-16 border-b border-border/20 hover:bg-card/50 transition-colors ${
                currentChannel?.id === channel.id ? 'bg-card border-l-2 border-l-primary' : ''
              }`}
            >
              <div className="w-10 h-10 rounded bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                {channel.logo ? (
                  <img src={channel.logo} alt="" className="w-full h-full object-contain p-1" />
                ) : (
                  <span className="text-sm font-bold text-muted-foreground">{channel.name.charAt(0)}</span>
                )}
              </div>
              <span className="text-sm text-foreground truncate">{channel.name}</span>
            </button>
          ))}
        </div>

        {/* Timeline */}
        <div ref={timelineRef} className="flex-1 overflow-x-auto mi-scrollbar">
          {/* Time slots header */}
          <div className="flex h-10 border-b border-border/30 bg-card/50 sticky top-0">
            {timeSlots.map((slot, idx) => (
              <div
                key={idx}
                className="w-[120px] flex-shrink-0 px-2 flex items-center border-r border-border/20 text-xs text-muted-foreground"
              >
                {formatTime(slot)}
              </div>
            ))}
          </div>

          {/* Current time indicator */}
          <div
            className="absolute top-10 bottom-0 w-0.5 bg-primary z-10"
            style={{ left: `${192 + getCurrentTimeOffset()}px` }}
          />

          {/* Program rows */}
          {channels.slice(0, 20).map((channel) => {
            const programs = channelPrograms.get(channel.id) || [];
            return (
              <div key={channel.id} className="relative h-16 border-b border-border/20">
                {programs.map((program) => {
                  const width = getProgramWidth(program);
                  const offset = getProgramOffset(program);
                  const isCurrent = isCurrentProgram(program);

                  if (offset + width < 0 || offset > timeSlots.length * 120) return null;

                  return (
                    <button
                      key={program.id}
                      onClick={() => onChannelSelect(channel)}
                      onMouseEnter={() => setHoveredProgram(program)}
                      onMouseLeave={() => setHoveredProgram(null)}
                      className={`absolute top-1 bottom-1 rounded-lg px-2 py-1 text-left transition-all overflow-hidden ${
                        isCurrent
                          ? 'bg-primary/20 border border-primary/40 hover:bg-primary/30'
                          : 'bg-card/80 border border-border/30 hover:bg-card'
                      }`}
                      style={{
                        left: offset,
                        width: Math.max(width - 4, 40),
                      }}
                    >
                      <p className={`text-xs font-medium truncate ${isCurrent ? 'text-primary' : 'text-foreground'}`}>
                        {program.title}
                      </p>
                      <p className="text-[10px] text-muted-foreground truncate">
                        {formatTime(program.start)} - {formatTime(program.end)}
                      </p>

                      {/* Now playing indicator */}
                      {isCurrent && (
                        <div className="absolute top-1 right-1">
                          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Hovered Program Info */}
      {hoveredProgram && (
        <div className="px-4 py-3 bg-card/50 border-t border-border/30">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <Play className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-foreground font-semibold">{hoveredProgram.title}</h3>
              <p className="text-muted-foreground text-sm">
                {formatTime(hoveredProgram.start)} - {formatTime(hoveredProgram.end)}
                {hoveredProgram.category && ` • ${hoveredProgram.category}`}
              </p>
              {hoveredProgram.description && (
                <p className="text-muted-foreground text-sm mt-1">{hoveredProgram.description}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};
