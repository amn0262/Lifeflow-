import { TemperatureUnit, WeatherData } from '../types';

const DEMO_WEATHER_DATA: WeatherData = {
  city: 'London / Global',
  temperature: 21,
  condition: 'Partly Cloudy',
  conditionCode: 'cloudy',
  high: 24,
  low: 16,
  humidity: 58,
  isDemo: true,
};

export async function fetchWeather(city: string = 'Current Location'): Promise<WeatherData> {
  const apiKey = import.meta.env.VITE_WEATHER_API_KEY;

  if (apiKey && apiKey !== 'YOUR_KEY') {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
          city === 'Current Location' ? 'London' : city
        )}&units=metric&appid=${apiKey}`
      );
      if (response.ok) {
        const data = await response.json();
        const mainCond = data.weather?.[0]?.main?.toLowerCase() || '';
        let conditionCode: WeatherData['conditionCode'] = 'clear';
        if (mainCond.includes('cloud')) conditionCode = 'cloudy';
        else if (mainCond.includes('rain')) conditionCode = 'rainy';
        else if (mainCond.includes('snow')) conditionCode = 'snowy';
        else if (mainCond.includes('storm')) conditionCode = 'storm';

        return {
          city: data.name || city,
          temperature: Math.round(data.main?.temp ?? 20),
          condition: data.weather?.[0]?.description || 'Clear Sky',
          conditionCode,
          high: Math.round(data.main?.temp_max ?? 23),
          low: Math.round(data.main?.temp_min ?? 15),
          humidity: Math.round(data.main?.humidity ?? 60),
          isDemo: false,
        };
      }
    } catch (err) {
      console.warn('[LifeFlow Weather Service] Weather API request failed, using demo fallback:', err);
    }
  }

  // Realistic fallback demo weather
  const currentHour = new Date().getHours();
  const isNight = currentHour < 6 || currentHour > 20;
  return {
    ...DEMO_WEATHER_DATA,
    city: city || DEMO_WEATHER_DATA.city,
    temperature: isNight ? 17 : 22,
    high: isNight ? 19 : 25,
    low: isNight ? 14 : 16,
    condition: isNight ? 'Clear Night' : 'Pleasant & Sunny',
    conditionCode: isNight ? 'clear' : 'sunny',
  };
}

export function convertTemperature(celsius: number, unit: TemperatureUnit): number {
  if (unit === 'fahrenheit') {
    return Math.round((celsius * 9) / 5 + 32);
  }
  return Math.round(celsius);
}

export function formatTempString(celsius: number, unit: TemperatureUnit): string {
  const value = convertTemperature(celsius, unit);
  return `${value}°${unit === 'fahrenheit' ? 'F' : 'C'}`;
}
