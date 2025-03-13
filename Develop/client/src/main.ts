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

const API_KEY = "YOUR_OPENWEATHERMAP_API_KEY"; // ✅ Replace with your API Key

// Weather Data Interface
interface WeatherData {
  city: string;
  date: number;
  icon: string;
  iconDescription: string;
  temperature: number;
  windSpeed: number;
  humidity: number;
  description?: string;
  coord?: { lat: number; lon: number };
}

// ✅ Fetch Weather Data
const fetchWeather = async (cityName: string) => {
  try {
    if (!cityName.trim()) {
      alert("Please enter a city name.");
      return;
    }

    console.log(`Fetching weather for: ${cityName}`);
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&units=imperial&appid=${API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const weatherData = await response.json();
    console.log("🔍 Debug: Full Weather Data Response:", weatherData);

    const currentWeather: WeatherData = {
      city: weatherData.name,
      date: weatherData.dt,
      icon: weatherData.weather[0].icon,
      iconDescription: weatherData.weather[0].description,
      temperature: weatherData.main.temp,
      windSpeed: weatherData.wind.speed,
      humidity: weatherData.main.humidity,
      description: weatherData.weather[0].description,
      coord: weatherData.coord, // ✅ Store lat/lon for 5-day forecast
    };

    renderCurrentWeather(currentWeather);

    // ✅ Fetch 5-Day Forecast Using Latitude & Longitude
    if (currentWeather.coord) {
      fetchForecast(currentWeather.coord.lat, currentWeather.coord.lon);
    }

    // ✅ Save to Search History in Local Storage
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

// ✅ Fetch 5-Day Forecast
const fetchForecast = async (lat: number, lon: number) => {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=${API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const forecastData = await response.json();
    console.log("🔍 Debug: 5-Day Forecast Data:", forecastData);

    renderForecast(forecastData.list);
  } catch (error) {
    console.error("Failed to fetch forecast data:", error);
  }
};

// ✅ Render Current Weather
const renderCurrentWeather = (currentWeather: WeatherData) => {
  if (!heading || !weatherIcon || !tempEl || !windEl || !humidityEl || !todayContainer) {
    console.error("❌ Missing DOM elements. Check your HTML structure.");
    return;
  }

  console.log("🔍 Debug: Current Weather Data:", currentWeather);

  const formattedDate = new Date(currentWeather.date * 1000).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  heading.textContent = `${currentWeather.city} (${formattedDate})`;
  tempEl.textContent = `Temp: ${currentWeather.temperature.toFixed(1)} °F`;
  windEl.textContent = `Wind: ${currentWeather.windSpeed} m/s`;
  humidityEl.textContent = `Humidity: ${currentWeather.humidity}%`;

  const weatherDescription = document.createElement("p");
  weatherDescription.textContent = currentWeather.description ?? "No description available";

  // ✅ Fix Weather Icon
  if (currentWeather.icon) {
    weatherIcon.src = `https://openweathermap.org/img/wn/${currentWeather.icon}@2x.png`;
    weatherIcon.alt = currentWeather.iconDescription || "Weather icon";
  }

  todayContainer.innerHTML = "";
  todayContainer.appendChild(heading);
  todayContainer.appendChild(weatherIcon);
  todayContainer.appendChild(tempEl);
  todayContainer.appendChild(windEl);
  todayContainer.appendChild(humidityEl);
  todayContainer.appendChild(weatherDescription);
};

// ✅ Render 5-Day Forecast
const renderForecast = (forecastList: any[]) => {
  if (!forecastContainer) return;
  forecastContainer.innerHTML = '<h4 class="col-12">5-Day Forecast:</h4>';

  const dailyForecasts = forecastList.filter((_, index) => index % 8 === 0).slice(0, 5);

  dailyForecasts.forEach(renderForecastCard);
};

// ✅ Render Individual Forecast Card
const renderForecastCard = (forecast: any) => {
  if (!forecastContainer) return;

  const col = document.createElement("div");
  col.classList.add("col-auto");

  const card = document.createElement("div");
  card.classList.add("forecast-card", "card", "text-white", "bg-primary", "h-100");

  const cardBody = document.createElement("div");
  cardBody.classList.add("card-body", "p-2");

  const formattedDate = new Date(forecast.dt * 1000).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const cardTitle = document.createElement("h5");
  cardTitle.textContent = formattedDate;

  const weatherIcon = document.createElement("img");
  weatherIcon.src = `https://openweathermap.org/img/wn/${forecast.weather[0].icon}@2x.png`;
  weatherIcon.alt = forecast.weather[0].description || "Weather icon";

  const tempEl = document.createElement("p");
  tempEl.textContent = `Temp: ${forecast.main.temp.toFixed(1)} °F`;

  const windEl = document.createElement("p");
  windEl.textContent = `Wind: ${forecast.wind.speed} m/s`;

  const humidityEl = document.createElement("p");
  humidityEl.textContent = `Humidity: ${forecast.main.humidity}%`;

  cardBody.append(cardTitle, weatherIcon, tempEl, windEl, humidityEl);
  card.append(cardBody);
  col.append(card);
  forecastContainer.append(col);
};

// ✅ Render Search History
const renderSearchHistory = (historyList: string[]) => {
  if (!searchHistoryContainer) return;
  searchHistoryContainer.innerHTML = "";

  historyList.forEach((city: string) => {
    const button = document.createElement("button");
    button.textContent = city;
    button.classList.add("history-btn");
    button.addEventListener("click", () => fetchWeather(city));
    searchHistoryContainer.appendChild(button);
  });

  console.log("✅ Search History Rendered:", historyList);
};

// ✅ Load Search History on Page Load
const getAndRenderHistory = () => {
  const historyList = JSON.parse(localStorage.getItem("searchHistory") || "[]");
  renderSearchHistory(historyList);
};

// ✅ Event Listener for Search Form
if (searchForm && searchInput) {
  searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    fetchWeather(searchInput.value.trim());
    searchInput.value = "";
  });
}

getAndRenderHistory();
