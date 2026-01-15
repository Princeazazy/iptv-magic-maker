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

export const useWeather = () => {
  const [weather, setWeather] = useState<WeatherData>({
    temp: 0,
    unit: 'C',
    icon: 'cloud',
    loading: true,
  });

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        // Get user's location
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 5000,
            maximumAge: 600000, // 10 min cache
          });
        });

        const { latitude, longitude } = position.coords;

        // Determine if USA (rough bounding box)
        const isUSA =
          latitude >= 24.396308 &&
          latitude <= 49.384358 &&
          longitude >= -125.0 &&
          longitude <= -66.93457;

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

        setWeather({
          temp,
          unit,
          icon: getWeatherIcon(weatherCode),
          loading: false,
        });
      } catch (error) {
        console.log('Weather fetch failed, using defaults:', error);
        // Fallback to a reasonable default
        setWeather({
          temp: 24,
          unit: 'C',
          icon: 'cloud',
          loading: false,
        });
      }
    };

    fetchWeather();

    // Refresh weather every 30 minutes
    const interval = setInterval(fetchWeather, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const displayTemp = `${weather.temp}°${weather.unit === 'F' ? 'F' : ''}`;

  return { ...weather, displayTemp };
};
