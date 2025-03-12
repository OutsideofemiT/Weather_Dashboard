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
  private apiKey: string;
  private geocodeBaseUrl: string;
  private weatherBaseUrl: string;
  private forecastBaseUrl: string;
  private cityName: string = '';

  constructor() {
    this.apiKey = process.env.OPENWEATHER_API_KEY || '';
    if (!this.apiKey) {
      console.error("❌ ERROR: Missing OpenWeather API key. Check your .env file.");
    } else {
      console.log("🔑 DEBUG: Loaded API Key:", this.apiKey.length > 5 ? "********" + this.apiKey.slice(-5) : "Not Found");
    }

    this.geocodeBaseUrl = 'http://api.openweathermap.org/geo/1.0/direct';
    this.weatherBaseUrl = 'https://api.openweathermap.org/data/2.5/weather';
    this.forecastBaseUrl = 'https://api.openweathermap.org/data/2.5/forecast';
  }

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

  private destructureLocationData(locationData: any): Coordinates {
    const { lat, lon } = locationData[0];
    return { lat, lon };
  }

  private buildWeatherQuery(coordinates: Coordinates): string {
    return `${this.weatherBaseUrl}?lat=${coordinates.lat}&lon=${coordinates.lon}&units=metric&appid=${this.apiKey}`;
  }

  private buildForecastQuery(coordinates: Coordinates): string {
    return `${this.forecastBaseUrl}?lat=${coordinates.lat}&lon=${coordinates.lon}&units=metric&appid=${this.apiKey}`;
  }

  private async fetchWeatherData(coordinates: Coordinates): Promise<any> {
    const url = this.buildWeatherQuery(coordinates);
    console.log(`🌦️ Fetching weather data from: "${url}"`);
    
    const response = await fetch(url);
    const data = await response.json();
    console.log("🌡️ Weather API Response:", data);
    
    if (data.cod !== 200) {
      console.error("❌ Invalid API Key or Error in Weather API!");
      return null;
    }
    return data;
  }

  private async fetchForecastData(coordinates: Coordinates): Promise<any> {
    const url = this.buildForecastQuery(coordinates);
    console.log(`📅 Fetching forecast data from: ${url}`);

    try {
        const response = await fetch(url);
        const data = await response.json();

        console.log("📊 Forecast API Response:", data);

        // ✅ Check if 'list' exists before proceeding
        if (!data.list) {
            throw new Error(`❌ Forecast data unavailable for coordinates: ${JSON.stringify(coordinates)}`);
        }

        return data;
    } catch (error) {
        console.error("❌ Error fetching forecast data:", error);
        return null;  // Return null if there is an error
    }
}


  private parseCurrentWeather(response: any): Weather {
    if (!response.main || !response.weather || response.weather.length === 0) {
      throw new Error("❌ Invalid weather data format.");
    }
    return new Weather(
      response.name,
      response.main.temp,
      response.main.humidity,
      response.weather[0].description,
      response.wind.speed
    );
  }

  private buildForecastArray(forecastList: any[]): Weather[] {
    if (!Array.isArray(forecastList)) {
        console.error("❌ Invalid forecast data format:", forecastList);
        return [];
    }

    return forecastList.map((item: any) => {
        if (!item.main || !item.weather || item.weather.length === 0) {
            console.warn("⚠️ Skipping invalid forecast entry:", item);
            return null;
        }

        return new Weather(
            this.cityName,
            item.main.temp,
            item.main.humidity,
            item.weather[0].description,
            item.wind.speed
        );
    }).filter((weather): weather is Weather => weather !== null);  // Remove null values and ensure type safety
}

  async getWeatherForCity(city: string): Promise<{ current: Weather; forecast: Weather[] }> {
    try {
        console.log(`✅ Fetching weather for city: ${city}`);

        // Get coordinates
        const locationData = await this.fetchLocationData(city);
        const coordinates = this.destructureLocationData(locationData);
        console.log(`📍 Coordinates for ${city}:`, coordinates);

        // Fetch current weather
        let weatherData = await this.fetchWeatherData(coordinates);
        if (!weatherData || !weatherData.main) {
            console.error(`❌ Error: Missing current weather data for ${city}. Response:`, weatherData);
            throw new Error(`Current weather data unavailable for ${city}`);
        }

        // Fetch forecast data separately
        const forecastData = await this.fetchForecastData(coordinates);
        if (!forecastData || !forecastData.list) {
            console.error(`❌ Error: Missing forecast data for ${city}. Response:`, forecastData);
            throw new Error(`Forecast data unavailable for ${city}`);
        }

        // ✅ Debug: Log raw responses
        console.log("🌡️ Weather API Response:", weatherData);
        console.log("📊 Forecast API Response:", forecastData);

        // Parse current weather
        const currentWeather = this.parseCurrentWeather(weatherData);

        // ✅ Ensure 'list' exists before mapping
        const forecast = Array.isArray(forecastData.list)
            ? this.buildForecastArray(forecastData.list)
            : [];

        console.log(`✅ Successfully fetched weather for ${city}`);
        return { current: currentWeather, forecast };
    } catch (error) {
        console.error("❌ Error in getWeatherForCity:", error);
        throw error;
}
  }

}

export default new WeatherService();
