import dotenv from 'dotenv';
dotenv.config();

// Define an interface for the Coordinates object
interface Coordinates {
  lat: number;
  lon: number;
}

// Define a class for the Weather object
export class Weather {
  city: string;
  temperature: number;
  humidity: number;
  description: string;
  windSpeed: number;

  constructor(
    city: string,
    temperature: number,
    humidity: number,
    description: string,
    windSpeed: number
  ) {
    this.city = city;
    this.temperature = temperature;
    this.humidity = humidity;
    this.description = description;
    this.windSpeed = windSpeed;
  }
}

// Complete the WeatherService class
class WeatherService {
  // Define the base URLs, API key, and city name property
  private apiKey: string;
  private geocodeBaseUrl: string;
  private weatherBaseUrl: string;   // OneCall API
  private forecastBaseUrl: string;  // Forecast API
  private cityName: string = '';

  constructor() {
    this.apiKey = process.env.OPENWEATHER_API_KEY || '';
    if (!this.apiKey) {
      console.error("❌ ERROR: Missing OpenWeather API key. Check your .env file.");
    } else {
      console.log("🔑 DEBUG: Loaded API Key:", this.apiKey.length > 5 ? "********" + this.apiKey.slice(-5) : "Not Found");
    }

    // OpenWeather Geocoding API
    this.geocodeBaseUrl = 'http://api.openweathermap.org/geo/1.0/direct';
    // OpenWeather OneCall API (Requires a Paid Plan)
    this.weatherBaseUrl = 'https://api.openweathermap.org/data/2.5/onecall';
    // OpenWeather Forecast API (Works on Free Plan)
    this.forecastBaseUrl = 'https://api.openweathermap.org/data/2.5/forecast';
  }

  // Fetch location data for a given city query
  private async fetchLocationData(query: string): Promise<any> {
    const url = `${this.geocodeBaseUrl}?q=${encodeURIComponent(query)}&appid=${this.apiKey}`;
    console.log(`🔍 Fetching location data from: ${url}`);

    const response = await fetch(url);
    const data = await response.json();
    console.log("📍 Location API Response:", data);

    if (!Array.isArray(data) || data.length === 0) {
      throw new Error(`❌ No location found for city: ${query}`);
    }

    return data;
  }

  // Extract latitude & longitude
  private destructureLocationData(locationData: any): Coordinates {
    const { lat, lon } = locationData[0];
    return { lat, lon };
  }

  // Build URL for OneCall API
  private buildWeatherQuery(coordinates: Coordinates): string {
    return `https://api.openweathermap.org/data/2.5/weather?lat=${coordinates.lat}&lon=${coordinates.lon}&units=metric&appid=${this.apiKey}`;
}

  // Build URL for Forecast API
  private buildForecastQuery(coordinates: Coordinates): string {
    return `${this.forecastBaseUrl}?lat=${coordinates.lat}&lon=${coordinates.lon}&units=metric&appid=${this.apiKey}`;
  }

  // Fetch location data & extract coordinates
  private async fetchAndDestructureLocationData(city: string): Promise<Coordinates> {
    const locationData = await this.fetchLocationData(city);
    return this.destructureLocationData(locationData);
  }

  // Fetch weather data (OneCall API)
  private async fetchWeatherData(coordinates: Coordinates): Promise<any> {
    const url = this.buildWeatherQuery(coordinates);
    console.log(`🌦️ Fetching weather data from: "${url}"`);
    console.log("🔑 Using API Key:", this.apiKey);

    const response = await fetch(url);
    const data = await response.json();
    console.log("🌡️ Weather API Response:", data);

    if (data.cod === 401) {
      console.error("❌ Invalid API Key! Switching to Forecast API.");
      return null; // Indicate failure, so we can try Forecast API
    }

    if (!data || !data.current) {
      throw new Error(`❌ Weather data unavailable for coordinates: ${JSON.stringify(coordinates)}`);
    }

    return data;
  }

  // Fetch forecast data (Forecast API)
  private async fetchForecastData(coordinates: Coordinates): Promise<any> {
    const url = this.buildForecastQuery(coordinates);
    console.log(`📅 Fetching forecast data from: ${url}`);

    const response = await fetch(url);
    const data = await response.json();
    console.log("📊 Forecast API Response:", data);

    if (!data || !data.list) {
      throw new Error(`❌ Forecast data unavailable for coordinates: ${JSON.stringify(coordinates)}`);
    }

    return data;
  }

  // Parse OneCall API response
  private parseCurrentWeather(response: any): Weather {
    return new Weather(
      this.cityName,
      response.current.temp,
      response.current.humidity,
      response.current.weather[0].description,
      response.current.wind_speed
    );
  }

  // Convert daily forecast from OneCall API
  private buildDailyForecastArray(dailyForecast: any[]): Weather[] {
    return dailyForecast.map((day: any) => {
      return new Weather(
        this.cityName,
        day.temp.day,
        day.humidity,
        day.weather[0].description,
        day.wind_speed
      );
    });
  }

  // Convert forecast data from Forecast API
  private buildForecastArray(forecastList: any[]): Weather[] {
    return forecastList.map((item: any) => {
      return new Weather(
        this.cityName,
        item.main.temp,
        item.main.humidity,
        item.weather[0].description,
        item.wind.speed
      );
    });
  }

  // Fetch Weather (OneCall API with Forecast API fallback)
  async getWeatherForCity(city: string): Promise<{ current: Weather; forecast: Weather[] }> {
    try {
      console.log(`✅ Fetching weather for city: ${city}`);

      // Get coordinates
      const coordinates = await this.fetchAndDestructureLocationData(city);
      console.log(`📍 Coordinates for ${city}:`, coordinates);

      // Try OneCall API first
      let weatherData = await this.fetchWeatherData(coordinates);
      if (!weatherData) {
        console.log("🔄 Falling back to Forecast API...");
        weatherData = await this.fetchForecastData(coordinates);
      }

      if (!weatherData) {
        throw new Error(`❌ Weather data unavailable for ${city}`);
      }

      const currentWeather = this.parseCurrentWeather(weatherData);
      const forecast = weatherData.daily
        ? this.buildDailyForecastArray(weatherData.daily)
        : this.buildForecastArray(weatherData.list);

      console.log(`✅ Successfully fetched weather for ${city}`);
      return { current: currentWeather, forecast };
    } catch (error) {
      console.error("❌ Error in getWeatherForCity:", error);
      throw error;
    }
  }

  // Fetch Forecast (Only uses Forecast API)
  async getForecastForCity(city: string): Promise<Weather[]> {
    this.cityName = city;
    const coordinates = await this.fetchAndDestructureLocationData(city);
    const forecastData = await this.fetchForecastData(coordinates);
    return this.buildForecastArray(forecastData.list);
  }
}

export default new WeatherService();
