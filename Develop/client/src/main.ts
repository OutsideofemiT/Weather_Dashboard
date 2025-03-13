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

// Weather Data Interface
interface WeatherData {
  city: string;
  date: string;
  icon: string;
  iconDescription: string;
  temperature: number;
  windSpeed: number;
  humidity: number;
  description?: string;
}

// Fetch Weather Data
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
      body: JSON.stringify({ cityName: cityName.trim(), units: 'metric' }), // 🔹 Fetch data in Celsius
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const weatherData = await response.json();
    console.log("🔍 Debug: Full Weather Data Response:", weatherData);

    if (!weatherData || !weatherData.current || !weatherData.forecast.length) {
      throw new Error("Invalid weather data received");
    }

    renderCurrentWeather(weatherData.current);
    renderForecast(weatherData.forecast);
    getAndRenderHistory(); // Update search history
  } catch (error) {
    console.error("Failed to fetch weather data:", error);
    alert("City not found. Please enter a valid city name.");
  }
};

// Fetch Search History
const fetchSearchHistory = async (): Promise<string[]> => {
  try {
    const response = await fetch('/api/weather/history');
    if (!response.ok) throw new Error("Failed to fetch search history");
    return await response.json();
  } catch (error) {
    console.error("Error fetching search history:", error);
    return [];
  }
};

// ✅ Render Current Weather with Correct Data Mapping
const renderCurrentWeather = (currentWeather: WeatherData) => {
  if (!heading || !weatherIcon || !tempEl || !windEl || !humidityEl || !todayContainer) {
    console.error("❌ Missing DOM elements. Check your HTML structure.");
    return;
  }

  console.log("🔍 Debug: Current Weather Data:", currentWeather);

  // ✅ Display formatted date
  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  heading.textContent = `${currentWeather.city} (${formattedDate})`;

  // ✅ Display temperature in Celsius
  tempEl.textContent = `Temp: ${currentWeather.temperature.toFixed(1) ?? 'N/A'}°C`;
  windEl.textContent = `Wind: ${currentWeather.windSpeed.toFixed(2) ?? 'N/A'} m/s`; // Adjust wind speed unit to m/s
  humidityEl.textContent = `Humidity: ${currentWeather.humidity ?? 'N/A'}%`;

  // ✅ Show weather description
  const weatherDescription = document.createElement('p');
  weatherDescription.textContent = currentWeather.description ?? "No description available";

  // ✅ Ensure valid weather icon
  weatherIcon.src = currentWeather.icon
    ? `https://openweathermap.org/img/wn/${currentWeather.icon}@2x.png`
    : 'https://openweathermap.org/img/wn/01d@2x.png';
  weatherIcon.alt = currentWeather.description || 'Weather icon';

  todayContainer.innerHTML = ''; // Clear previous content
  todayContainer.appendChild(heading);
  todayContainer.appendChild(weatherIcon);
  todayContainer.appendChild(tempEl);
  todayContainer.appendChild(windEl);
  todayContainer.appendChild(humidityEl);
  todayContainer.appendChild(weatherDescription);
};

// ✅ Render 5-Day Forecast
const renderForecast = (forecast: WeatherData[]) => {
  if (!forecastContainer) return;
  forecastContainer.innerHTML = '<h4 class="col-12">5-Day Forecast:</h4>';

  // ✅ Select 5 daily forecasts
  const dailyForecasts = forecast.slice(0, 5);
  dailyForecasts.forEach(renderForecastCard);
};

// ✅ Render Individual Forecast Card
const renderForecastCard = (forecast: WeatherData) => {
  if (!forecastContainer) return;

  console.log("🔍 Debug: Forecast Data:", forecast);

  const col = document.createElement('div');
  col.classList.add('col-auto');

  const card = document.createElement('div');
  card.classList.add('forecast-card', 'card', 'text-white', 'bg-primary', 'h-100');

  const cardBody = document.createElement('div');
  cardBody.classList.add('card-body', 'p-2');

  // ✅ Format Date Properly
  let formattedDate = "Invalid Date";
  if (forecast.date) {
    const dateObj = new Date(forecast.date);
    if (!isNaN(dateObj.getTime())) {
      formattedDate = dateObj.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      });
    }
  }

  const cardTitle = document.createElement('h5');
  cardTitle.textContent = formattedDate;

  const weatherIcon = document.createElement('img');
  weatherIcon.src = forecast.icon
    ? `https://openweathermap.org/img/wn/${forecast.icon}@2x.png`
    : 'https://openweathermap.org/img/wn/01d@2x.png';
  weatherIcon.alt = forecast.description || 'Weather icon';

  const tempEl = document.createElement('p');
  tempEl.textContent = `Temp: ${forecast.temperature.toFixed(1) ?? 'N/A'} °C`;

  const windEl = document.createElement('p');
  windEl.textContent = `Wind: ${forecast.windSpeed.toFixed(2) ?? 'N/A'} m/s`;

  const humidityEl = document.createElement('p');
  humidityEl.textContent = `Humidity: ${forecast.humidity ?? 'N/A'}%`;

  cardBody.append(cardTitle, weatherIcon, tempEl, windEl, humidityEl);
  card.append(cardBody);
  col.append(card);
  forecastContainer.append(col);
};

// ✅ Render Search History
const renderSearchHistory = (historyList: string[]) => {
  if (!searchHistoryContainer) return;
  searchHistoryContainer.innerHTML = '';
  historyList.forEach(city => {
    const button = document.createElement('button');
    button.textContent = city;
    button.classList.add('history-btn');
    button.addEventListener('click', () => fetchWeather(city));
    searchHistoryContainer.appendChild(button);
  });
  console.log("✅ Search History Rendered:", historyList);
};

// ✅ Fetch & Render Search History
const getAndRenderHistory = async () => {
  const historyList = await fetchSearchHistory();
  renderSearchHistory(historyList);
};

// ✅ Event Listener for Search Form
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

// ✅ Load Search History on Page Load
getAndRenderHistory();
