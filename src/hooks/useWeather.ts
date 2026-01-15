import { useState, useEffect } from 'react';

interface WeatherData {
  temp: number;
  unit: 'F' | 'C';
  icon: 'sun' | 'cloud' | 'rain' | 'snow' | 'storm' | 'partly-cloudy';
  loading: boolean;
}

// Map weather codes to icons
const getWeatherIcon = (code: number): WeatherData['icon'] => {
  if (code === 0) return 'sun';
  if (code >= 1 && code <= 3) return 'partly-cloudy';
  if (code >= 45 && code <= 48) return 'cloud';
  if (code >= 51 && code <= 67) return 'rain';
  if (code >= 71 && code <= 77) return 'snow';
  if (code >= 80 && code <= 82) return 'rain';
  if (code >= 95 && code <= 99) return 'storm';
  return 'cloud';
};

// Get location from IP (no permission required)
const getLocationFromIP = async (): Promise<{ latitude: number; longitude: number; countryCode: string }> => {
  const response = await fetch('https://ipapi.co/json/');
  if (!response.ok) throw new Error('IP geolocation failed');
  const data = await response.json();
  return {
    latitude: data.latitude,
    longitude: data.longitude,
    countryCode: data.country_code,
  };
};

// Get location from browser geolocation API
const getBrowserLocation = (): Promise<{ latitude: number; longitude: number }> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => resolve({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      }),
      reject,
      { timeout: 3000, maximumAge: 600000 }
    );
  });
};

export const useWeather = () => {
  const [weather, setWeather] = useState<WeatherData>({
    temp: 0,
    unit: 'C',
    icon: 'cloud',
    loading: true,
  });

  const fetchWeather = async () => {
    setWeather(prev => ({ ...prev, loading: true }));
    try {
      let latitude: number;
      let longitude: number;
      let isUSA = false;

      // Try browser geolocation first, fall back to IP-based
      try {
        const browserLoc = await getBrowserLocation();
        latitude = browserLoc.latitude;
        longitude = browserLoc.longitude;
        
        // Determine if USA based on coordinates
        isUSA =
          latitude >= 24.396308 &&
          latitude <= 49.384358 &&
          longitude >= -125.0 &&
          longitude <= -66.93457;
      } catch {
        // Browser geolocation failed, use IP-based
        console.log('Browser geolocation unavailable, using IP-based location');
        const ipLoc = await getLocationFromIP();
        latitude = ipLoc.latitude;
        longitude = ipLoc.longitude;
        isUSA = ipLoc.countryCode === 'US';
      }

      const unit = isUSA ? 'F' : 'C';
      const tempUnit = isUSA ? 'fahrenheit' : 'celsius';

      // Fetch weather from Open-Meteo (free, no API key needed)
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&temperature_unit=${tempUnit}`
      );

      if (!response.ok) throw new Error('Weather fetch failed');

      const data = await response.json();
      const temp = Math.round(data.current.temperature_2m);
      const weatherCode = data.current.weather_code;

      console.log(`Weather fetched: ${temp}°${unit} at ${latitude}, ${longitude}`);

      setWeather({
        temp,
        unit,
        icon: getWeatherIcon(weatherCode),
        loading: false,
      });
    } catch (error) {
      console.error('Weather fetch failed:', error);
      // Fallback to a reasonable default
      setWeather({
        temp: 45,
        unit: 'F',
        icon: 'cloud',
        loading: false,
      });
    }
  };

  useEffect(() => {
    fetchWeather();

    // Refresh weather every 30 minutes
    const interval = setInterval(fetchWeather, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const displayTemp = `${weather.temp}°${weather.unit === 'F' ? 'F' : ''}`;

  return { ...weather, displayTemp, refresh: fetchWeather };
};
