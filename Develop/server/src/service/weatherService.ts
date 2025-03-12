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
  private weatherBaseUrl: string;   // For OneCall API
  private forecastBaseUrl: string;  // For forecast endpoint
  private cityName: string = '';

  constructor() {
    this.apiKey = process.env.OPENWEATHER_API_KEY || '';
    // OpenWeather Geocoding API endpoint
    this.geocodeBaseUrl = 'http://api.openweathermap.org/geo/1.0/direct';
    // OpenWeather OneCall API endpoint (for current weather + daily forecast)
    this.weatherBaseUrl = 'https://api.openweathermap.org/data/2.5/onecall';
    // OpenWeather Forecast API endpoint (returns forecast data at 3-hour intervals)
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
  

  // Destructure location data to obtain coordinates
  private destructureLocationData(locationData: any): Coordinates {
    // Assumes locationData is an array with at least one element
    const { lat, lon } = locationData[0];
    return { lat, lon };
  }

  // Build the query URL for the OneCall API
  private buildWeatherQuery(coordinates: Coordinates): string {
    return `${this.weatherBaseUrl}?lat=${coordinates.lat}&lon=${coordinates.lon}&exclude=minutely,hourly,alerts&units=metric&appid=${this.apiKey}`;
  }

  // Build the query URL for the forecast endpoint
  private buildForecastQuery(coordinates: Coordinates): string {
    return `${this.forecastBaseUrl}?lat=${coordinates.lat}&lon=${coordinates.lon}&units=metric&appid=${this.apiKey}`;
  }

  // Fetch and destructure location data for a city
  private async fetchAndDestructureLocationData(city: string): Promise<Coordinates> {
    const locationData = await this.fetchLocationData(city);
    return this.destructureLocationData(locationData);
  }

  // Fetch weather data from the OneCall API
  private async fetchWeatherData(coordinates: Coordinates): Promise<any> {
    const url = this.buildWeatherQuery(coordinates);
    console.log(`🌦️ Fetching weather data from: "${url}"`); // ✅ Log the full URL
    console.log("🔑 Using API Key:", this.apiKey); // ✅ Check if API Key is correct
  
    const response = await fetch(url);
    const data = await response.json();
    console.log("🌡️ Weather API Response:", data);
  
    if (!data || !data.current) {
      throw new Error(`❌ Weather data unavailable for coordinates: ${JSON.stringify(coordinates)}`);
    }
  
    return data;
  }
  

  // Fetch forecast data from the forecast endpoint
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
  

  // Parse current weather data from OneCall API response
  private parseCurrentWeather(response: any): Weather {
    return new Weather(
      this.cityName,
      response.current.temp,
      response.current.humidity,
      response.current.weather[0].description,
      response.current.wind_speed
    );
  }

  // Build an array of Weather objects from daily forecast data (from OneCall API)
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

  // Build an array of Weather objects from forecast data (from forecast endpoint)
  private buildForecastArray(forecastList: any[]): Weather[] {
    // forecastList is an array of forecast data (3-hour intervals)
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

  // Existing method using the OneCall API for current weather and daily forecast
  async getWeatherForCity(city: string): Promise<{ current: Weather; forecast: Weather[] }> {
    try {
      console.log(`✅ Fetching weather for city: ${city}`);
  
      // Fetch latitude and longitude
      const coordinates = await this.fetchAndDestructureLocationData(city);
      console.log(`📍 Coordinates for ${city}:`, coordinates);
  
      // Fetch weather data from OneCall API
      const weatherData = await this.fetchWeatherData(coordinates);
      console.log(`🌦️ Weather API Response:`, weatherData);
  
      // Ensure weatherData contains expected properties
      if (!weatherData || !weatherData.current) {
        throw new Error(`❌ Weather data unavailable for coordinates: ${JSON.stringify(coordinates)}`);
      }
  
      const currentWeather = this.parseCurrentWeather(weatherData);
      const forecast = weatherData.daily ? this.buildDailyForecastArray(weatherData.daily) : [];
  
      console.log(`✅ Successfully fetched weather for ${city}`);
      return { current: currentWeather, forecast };
    } catch (error) {
      console.error("❌ Error in getWeatherForCity:", error);
      throw error;
    }
  }
  

  // New method using the forecast endpoint
  async getForecastForCity(city: string): Promise<Weather[]> {
    this.cityName = city;
    const coordinates = await this.fetchAndDestructureLocationData(city);
    const forecastData = await this.fetchForecastData(coordinates);
    // forecastData.list is an array of forecast items at 3-hour intervals.
    // You might want to filter or group these items; here we simply convert them.
    return this.buildForecastArray(forecastData.list);
  }
}

export default new WeatherService();

