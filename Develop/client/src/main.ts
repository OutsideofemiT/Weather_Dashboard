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
      body: JSON.stringify({ cityName: cityName.trim(), units: 'imperial' }), // Fetch Fahrenheit data
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

    // ✅ Save to Search History in Local Storage
    let historyList = JSON.parse(localStorage.getItem("searchHistory") || "[]");
    if (!historyList.includes(cityName)) {
      historyList.unshift(cityName); // Add to the beginning of the array
      if (historyList.length > 5) historyList.pop(); // Keep only 5 entries
      localStorage.setItem("searchHistory", JSON.stringify(historyList));
    }

    getAndRenderHistory(); // ✅ Refresh history UI
  } catch (error) {
    console.error("Failed to fetch weather data:", error);
    alert("City not found. Please enter a valid city name.");
  }
};

// ✅ Render Current Weather with Correct Data Mapping
const renderCurrentWeather = (currentWeather: WeatherData) => {
  if (!heading || !weatherIcon || !tempEl || !windEl || !humidityEl || !todayContainer) {
    console.error("❌ Missing DOM elements. Check your HTML structure.");
    return;
  }

  if (!currentWeather) {
    console.error("❌ No weather data available.");
    return;
  }

  console.log("🔍 Debug: Current Weather Data:", currentWeather);

  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  heading.textContent = `${currentWeather.city} (${formattedDate})`;

  // ✅ Convert Celsius to Fahrenheit
  const tempFahrenheit = (currentWeather.temperature * 9/5) + 32;
  tempEl.textContent = `Temp: ${tempFahrenheit.toFixed(1) ?? 'N/A'} °F`; 

  windEl.textContent = `Wind: ${currentWeather.windSpeed ?? 'N/A'} m/s`;
  humidityEl.textContent = `Humidity: ${currentWeather.humidity ?? 'N/A'}%`;

  const weatherDescription = document.createElement('p');
  weatherDescription.textContent = currentWeather.description ?? "No description available";

  // ✅ Fix Weather Icon Display
  if (currentWeather.icon) {
    weatherIcon.src = `https://openweathermap.org/img/wn/${currentWeather.icon}@2x.png`;
    weatherIcon.alt = currentWeather.description || 'Weather icon';
  } else {
    weatherIcon.src = 'https://openweathermap.org/img/wn/01d@2x.png'; // Default sunny icon
  }

  todayContainer.innerHTML = ''; // Clear previous content
  todayContainer.appendChild(heading);
  todayContainer.appendChild(weatherIcon);
  todayContainer.appendChild(tempEl);
  todayContainer.appendChild(windEl);
  todayContainer.appendChild(humidityEl);
  todayContainer.appendChild(weatherDescription);
};


// ✅ Render 5-Day Forecast
const renderForecast = (forecastData: any[]) => {
  if (!forecastContainer) return;
  forecastContainer.innerHTML = '<h4 class="col-12">5-Day Forecast:</h4>';

  const dailyForecasts: any[] = [];
  const usedDates = new Set();

  for (const forecast of forecastData) {
    // Convert Unix timestamp to readable format
    const forecastDate = new Date(forecast.date * 1000).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });

    if (!usedDates.has(forecastDate)) {
      usedDates.add(forecastDate);
      dailyForecasts.push(forecast);
    }

    if (dailyForecasts.length === 5) break; // Stop after 5 days
  }

  dailyForecasts.forEach(renderForecastCard);
};


// ✅ Render Individual Forecast Card
const renderForecastCard = (forecast: WeatherData) => {
  if (!forecastContainer) return;
  console.log("🔍 Debug: Forecast Data:", forecast);

  const col = document.createElement("div");
  col.classList.add("col-auto");

  const card = document.createElement("div");
  card.classList.add("forecast-card", "card", "text-white", "bg-primary", "h-100");

  const cardBody = document.createElement("div");
  cardBody.classList.add("card-body", "p-2");

  // ✅ Ensure correct date formatting
  let formattedDate = "N/A";
  if (forecast.date) {
    const dateObj = new Date(Number(forecast.date) * 1000);
    if (!isNaN(dateObj.getTime())) {
      formattedDate = dateObj.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      });
    }
  }

  const cardTitle = document.createElement("h5");
  cardTitle.textContent = formattedDate;

  // ✅ Ensure correct weather icon is shown
  const weatherIcon = document.createElement("img");
  weatherIcon.src = forecast.icon
    ? `https://openweathermap.org/img/wn/${forecast.icon}@2x.png`
    : "https://openweathermap.org/img/wn/01d@2x.png"; // Default icon
  weatherIcon.alt = forecast.description || "Weather icon";

  // ✅ Convert Temperature to Fahrenheit
  const tempFahrenheit = (forecast.temperature * 9) / 5 + 32;
  const tempEl = document.createElement("p");
  tempEl.textContent = `Temp: ${tempFahrenheit.toFixed(1) ?? "N/A"} °F`;

  const windEl = document.createElement("p");
  windEl.textContent = `Wind: ${forecast.windSpeed ?? "N/A"} m/s`;

  const humidityEl = document.createElement("p");
  humidityEl.textContent = `Humidity: ${forecast.humidity ?? "N/A"}%`;

  // ✅ Add weather description
  const weatherDescription = document.createElement("p");
  weatherDescription.textContent = forecast.description ?? "No description available";

  cardBody.append(cardTitle, weatherIcon, tempEl, windEl, humidityEl, weatherDescription);
  card.append(cardBody);
  col.append(card);
  forecastContainer.append(col);
};

// ✅ Render Search History
const renderSearchHistory = (historyList: string[]) => {
  if (!searchHistoryContainer) return;
  searchHistoryContainer.innerHTML = '';

  if (historyList.length === 0) {
    searchHistoryContainer.innerHTML = '<p>No recent searches available.</p>';
    return;
  }

  historyList.forEach(city => {
    const button = document.createElement('button');
    button.textContent = city;
    button.classList.add('history-btn');
    button.addEventListener('click', () => fetchWeather(city));
    searchHistoryContainer.appendChild(button);
  });

  console.log("✅ Search History Rendered:", historyList);
};


// ✅ Fetch & Render Search History on Load
const getAndRenderHistory = async () => {
  let historyList = JSON.parse(localStorage.getItem("searchHistory") || "[]");

  if (!Array.isArray(historyList)) {
    historyList = [];
  }

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
