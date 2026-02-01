import { useState, useEffect, useCallback } from 'react';

export const useDateTime = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = useCallback((options?: Intl.DateTimeFormatOptions) => {
    return time.toLocaleTimeString([], options || { hour: '2-digit', minute: '2-digit' });
  }, [time]);

  const formatDate = useCallback((options?: Intl.DateTimeFormatOptions) => {
    return time.toLocaleDateString('en-US', options || { weekday: 'long', month: 'short', day: 'numeric' });
  }, [time]);

  const formatVideoTime = useCallback((seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const formatCurrentVideoTime = useCallback((videoTime: number) => {
    const hours = Math.floor(videoTime / 3600);
    const minutes = Math.floor((videoTime % 3600) / 60);
    const seconds = Math.floor(videoTime % 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  return {
    time,
    formatTime,
    formatDate,
    formatVideoTime,
    formatCurrentVideoTime,
  };
};
