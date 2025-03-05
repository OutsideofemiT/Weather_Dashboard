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
  // Define the baseURL, API key, and city name properties
  private apiKey: string;
  private geocodeBaseUrl: string;
  private weatherBaseUrl: string;
  private cityName: string = '';

  constructor() {
    this.apiKey = process.env.OPENWEATHER_API_KEY || '';
    // OpenWeather Geocoding API endpoint
    this.geocodeBaseUrl = 'http://api.openweathermap.org/geo/1.0/direct';
    // OpenWeather OneCall API endpoint
    this.weatherBaseUrl = 'https://api.openweathermap.org/data/2.5/onecall';
  }

  // Create fetchLocationData method
  private async fetchLocationData(query: string): Promise<any> {
    const url = `${this.geocodeBaseUrl}?q=${query}&appid=${this.apiKey}`;
    const response = await fetch(url);
    const data = await response.json();
    return data;
  }

  // Create destructureLocationData method
  private destructureLocationData(locationData: any): Coordinates {
    // Assumes locationData is an array with at least one element
    const { lat, lon } = locationData[0];
    return { lat, lon };
  }


  // Create buildWeatherQuery method
  private buildWeatherQuery(coordinates: Coordinates): string {
    return `${this.weatherBaseUrl}?lat=${coordinates.lat}&lon=${coordinates.lon}&exclude=minutely,hourly,alerts&units=metric&appid=${this.apiKey}`;
  }

  // Create fetchAndDestructureLocationData method
  private async fetchAndDestructureLocationData(city: string): Promise<Coordinates> {
    const locationData = await this.fetchLocationData(city);
    return this.destructureLocationData(locationData);
  }

  // Create fetchWeatherData method
  private async fetchWeatherData(coordinates: Coordinates): Promise<any> {
    const url = this.buildWeatherQuery(coordinates);
    const response = await fetch(url);
    const data = await response.json();
    return data;
  }

  // Build parseCurrentWeather method
  private parseCurrentWeather(response: any): Weather {
    // Using current weather data from response.current
    return new Weather(
      this.cityName,
      response.current.temp,
      response.current.humidity,
      response.current.weather[0].description,
      response.current.wind_speed
    );
  }

  // Complete buildForecastArray method
  private buildForecastArray(dailyForecast: any[]): Weather[] {
    // Build an array of Weather objects from daily forecast data
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

  // Complete getWeatherForCity method
  async getWeatherForCity(city: string): Promise<{ current: Weather; forecast: Weather[] }> {
    this.cityName = city;
    const coordinates = await this.fetchAndDestructureLocationData(city);
    const weatherData = await this.fetchWeatherData(coordinates);
    const currentWeather = this.parseCurrentWeather(weatherData);
    const forecast = weatherData.daily ? this.buildForecastArray(weatherData.daily) : [];
    return { current: currentWeather, forecast };
  }
}

export default new WeatherService();
