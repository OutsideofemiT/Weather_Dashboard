import './styles/jass.css';

// Select necessary DOM elements
const searchForm = document.getElementById('search-form') as HTMLFormElement | null;
const searchInput = document.getElementById('search-input') as HTMLInputElement | null;
const todayContainer = document.querySelector('#today') as HTMLDivElement | null;
const forecastContainer = document.querySelector('#forecast') as HTMLDivElement | null;
const searchHistoryContainer = document.getElementById('history') as HTMLDivElement | null;
const heading = document.getElementById('search-title') as HTMLHeadingElement | null;
const weatherIcon = document.getElementById('weather-img') as HTMLImageElement | null;
const tempEl = document.getElementById('temp') as HTMLParagraphElement | null;
const windEl = document.getElementById('wind') as HTMLParagraphElement | null;
const humidityEl = document.getElementById('humidity') as HTMLParagraphElement | null;

// Weather Data Interface for current weather and daily forecast objects from your backend
interface WeatherData {
  city: string;
  date: string; // May be a Unix timestamp (in seconds) or a preformatted string; if missing, we'll compute it.
  icon: string; // May be missing in your data.
  iconDescription: string;
  temperature: number; // Returned in Celsius (since units: 'metric')
  windSpeed: number;
  humidity: number;
  description?: string;
}

/**
 * Helper: Convert Celsius to Fahrenheit.
 */
const celsiusToFahrenheit = (celsius: number): number => (celsius * 9) / 5 + 32;

/**
 * Helper: Map a weather description to an OpenWeather icon code.
 */
const mapDescriptionToIcon = (desc: string): string => {
  const lower = desc.toLowerCase();
  if (lower.includes("clear")) return "01d";
  if (lower.includes("few clouds")) return "02d";
  if (lower.includes("scattered clouds")) return "03d";
  if (lower.includes("broken clouds") || lower.includes("overcast")) return "04d";
  if (lower.includes("shower rain")) return "09d";
  if (lower.includes("rain")) return "10d";
  if (lower.includes("thunderstorm")) return "11d";
  if (lower.includes("snow")) return "13d";
  if (lower.includes("mist")) return "50d";
  return "01d";
};

/**
 * Helper: If a forecast item does not have a date, compute it as today's date plus (index+1) days.
 */
const computeForecastDate = (index: number): string => {
  const today = new Date();
  const forecastDate = new Date(today.getTime() + (index + 1) * 24 * 60 * 60 * 1000);
  return forecastDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
};

/**
 * Fetch Weather Data from your backend.
 * Assumes your backend returns an object with properties "current" and "forecast".
 */
const fetchWeather = async (cityName: string) => {
  try {
    if (!cityName.trim()) {
      alert("Please enter a city name.");
      return;
    }
    console.log(`Fetching weather for: ${cityName}`);

    const response = await fetch('/api/weather/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // Request metric units; we’ll convert to Fahrenheit on the client.
      body: JSON.stringify({ cityName: cityName.trim(), units: 'metric' }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const weatherData = await response.json();
    console.log("🔍 Debug: Full Weather Data Response:", weatherData);
    console.log("🔍 Forecast Array:", weatherData.forecast);

    if (!weatherData || !weatherData.current || !weatherData.forecast.length) {
      throw new Error("Invalid weather data received");
    }

    renderCurrentWeather(weatherData.current);
    renderForecast(weatherData.forecast);

    // Save to Search History in Local Storage
    let historyList = JSON.parse(localStorage.getItem("searchHistory") || "[]");
    if (!historyList.includes(cityName)) {
      historyList.unshift(cityName);
      if (historyList.length > 5) historyList.pop();
      localStorage.setItem("searchHistory", JSON.stringify(historyList));
    }

    getAndRenderHistory();
  } catch (error) {
    console.error("Failed to fetch weather data:", error);
    alert("City not found. Please enter a valid city name.");
  }
};

/**
 * Render current weather.
 * Converts temperature from Celsius to Fahrenheit.
 */
const renderCurrentWeather = (currentWeather: WeatherData) => {
  if (!heading || !weatherIcon || !tempEl || !windEl || !humidityEl || !todayContainer) {
    console.error("❌ Missing DOM elements. Check your HTML structure.");
    return;
  }

  console.log("🔍 Debug: Current Weather Data:", currentWeather);

  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
  heading.textContent = `${currentWeather.city} (${formattedDate})`;

  // Convert current temperature from Celsius to Fahrenheit.
  const tempFahrenheit = celsiusToFahrenheit(currentWeather.temperature);
  tempEl.textContent = `Temp: ${tempFahrenheit.toFixed(1)} °F`;
  windEl.textContent = `Wind: ${currentWeather.windSpeed} m/s`;
  humidityEl.textContent = `Humidity: ${currentWeather.humidity}%`;

  const weatherDescription = document.createElement('p');
  weatherDescription.textContent = currentWeather.description ?? "No description available";

  // Use icon if available; if not, fallback using description mapping.
  let iconCode = currentWeather.icon;
  if (!iconCode && currentWeather.description) {
    iconCode = mapDescriptionToIcon(currentWeather.description);
  }
  if (iconCode) {
    weatherIcon.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    weatherIcon.alt = currentWeather.description || 'Weather icon';
  } else {
    weatherIcon.src = 'https://openweathermap.org/img/wn/01d@2x.png';
  }

  todayContainer.innerHTML = '';
  todayContainer.appendChild(heading);
  todayContainer.appendChild(weatherIcon);
  todayContainer.appendChild(tempEl);
  todayContainer.appendChild(windEl);
  todayContainer.appendChild(humidityEl);
  todayContainer.appendChild(weatherDescription);
  console.log("Current Weather Icon:", currentWeather.icon);
};

/**
 * Render the 5-day forecast.
 * We assume your backend returns an array of forecast objects.
 * If forecast.date is missing, we compute a date based on the index.
 */
const renderForecast = (forecastData: WeatherData[]) => {
  if (!forecastContainer) return;
  forecastContainer.innerHTML = '<h4 class="col-12">5-Day Forecast:</h4>';

  // Take the first 5 forecast items
  const dailyForecasts = forecastData.slice(0, 5);
  dailyForecasts.forEach((item, index) => renderForecastCard(item, index));
};

/**
 * Render an individual forecast card.
 * If forecast.date is missing or invalid, we compute a date using the card index.
 * Temperature conversion from Celsius to Fahrenheit is applied.
 * If forecast.icon is missing, we use a mapping based on description.
 */
const renderForecastCard = (forecast: any, index: number) => {
  if (!forecastContainer) return;
  console.log("🔍 Debug: Forecast Data (Card):", forecast);

  const col = document.createElement("div");
  col.classList.add("col-auto");

  const card = document.createElement("div");
  card.classList.add("forecast-card", "card", "text-white", "bg-primary", "h-100");

  const cardBody = document.createElement("div");
  cardBody.classList.add("card-body", "p-2");

  // Date handling: if forecast.date exists and is a valid Unix timestamp (in seconds), use it;
  // otherwise, compute a date as today plus (index+1) days.
  let formattedDate = "N/A";
  const dateNum = Number(forecast.date);
  if (!isNaN(dateNum) && dateNum > 1000000000) {
    const dateObj = new Date(dateNum * 1000);
    formattedDate = dateObj.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  } else {
    formattedDate = computeForecastDate(index);
  }

  const cardTitle = document.createElement("h5");
  cardTitle.textContent = formattedDate;

  // Convert forecast temperature (in Celsius) to Fahrenheit
  const tempFahrenheit = celsiusToFahrenheit(forecast.temperature);

  // Weather icon: use forecast.icon if available; otherwise, map description.
  let iconCode = forecast.icon;
  if (!iconCode && forecast.description) {
    iconCode = mapDescriptionToIcon(forecast.description);
  }
  if (!iconCode) iconCode = "01d";

  const forecastIcon = document.createElement("img");
  forecastIcon.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  forecastIcon.alt = forecast.description || "Weather icon";

  const tempEl = document.createElement("p");
  tempEl.textContent = `Temp: ${tempFahrenheit.toFixed(1)} °F`;

  const windEl = document.createElement("p");
  windEl.textContent = `Wind: ${forecast.windSpeed ?? "N/A"} m/s`;

  const humidityEl = document.createElement("p");
  humidityEl.textContent = `Humidity: ${forecast.humidity ?? "N/A"}%`;

  const weatherDescription = document.createElement("p");
  weatherDescription.textContent = forecast.description ?? "No description available";

  cardBody.append(cardTitle, forecastIcon, tempEl, windEl, humidityEl, weatherDescription);
  card.append(cardBody);
  col.append(card);
  forecastContainer.append(col);
};

// Render Search History
const renderSearchHistory = (historyList: string[]) => {
  if (!searchHistoryContainer) return;
  searchHistoryContainer.innerHTML = '';

  const list = document.createElement('ul');
  list.classList.add('history-list');

  historyList.forEach((city: string) => {
    const listItem = document.createElement('li');
    const button = document.createElement('button');
    button.textContent = city;
    button.classList.add('history-btn');
    button.addEventListener('click', () => fetchWeather(city));
    listItem.appendChild(button);
    list.appendChild(listItem);
  });

  searchHistoryContainer.appendChild(list);
  console.log("✅ Search History Rendered:", historyList);
};

// Fetch & Render Search History on Load (from localStorage)
const getAndRenderHistory = async () => {
  let historyList = JSON.parse(localStorage.getItem("searchHistory") || "[]");
  if (!Array.isArray(historyList)) {
    historyList = [];
  }
  renderSearchHistory(historyList);
};

// Event Listener for Search Form
if (searchForm && searchInput) {
  searchForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!searchInput.value.trim()) {
      alert("City name cannot be empty.");
      return;
    }
    fetchWeather(searchInput.value.trim());
    searchInput.value = '';
  });
}

// Load Search History on Page Load
getAndRenderHistory();
