import './styles/jass.css';

// Select necessary DOM elements
const searchForm = document.getElementById('search-form') as HTMLFormElement;
const searchInput = document.getElementById('search-input') as HTMLInputElement;
const forecastContainer = document.querySelector('#forecast') as HTMLDivElement;
const searchHistoryContainer = document.getElementById('history') as HTMLDivElement;
const heading = document.getElementById('search-title') as HTMLHeadingElement;
const weatherIcon = document.getElementById('weather-img') as HTMLImageElement;
const tempEl = document.getElementById('temp') as HTMLParagraphElement;
const windEl = document.getElementById('wind') as HTMLParagraphElement;
const humidityEl = document.getElementById('humidity') as HTMLParagraphElement;

// Weather Data Interface
interface WeatherData {
  city: string;
  date: string;
  icon: string;
  iconDescription: string;
  tempF: number;
  windSpeed: number;
  humidity: number;
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
      body: JSON.stringify({ cityName: cityName.trim() }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const weatherData = await response.json();
    if (!weatherData || !weatherData.current || !weatherData.forecast.length) {
      throw new Error("Invalid weather data received");
    }

    renderCurrentWeather(weatherData.current);
    renderForecast(weatherData.forecast);
  } catch (error) {
    console.error("Failed to fetch weather data:", error);
    alert("City not found. Please enter a valid city name.");
  }
};

// Fetch Search History
const fetchSearchHistory = async (): Promise<WeatherData[]> => {
  try {
    const response = await fetch('/api/weather/history');
    if (!response.ok) throw new Error("Failed to fetch search history");
    return await response.json();
  } catch (error) {
    console.error("Error fetching search history:", error);
    return [];
  }
};

// Delete City from History
const deleteCityFromHistory = async (id: string) => {
  try {
    const response = await fetch(`/api/weather/history/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error("Failed to delete city");
    getAndRenderHistory();
  } catch (error) {
    console.error("Error deleting history entry:", error);
  }
};

// Render Current Weather
const renderCurrentWeather = (currentWeather: WeatherData) => {
  if (!currentWeather) return;
  heading.textContent = `${currentWeather.city} (${currentWeather.date})`;
  weatherIcon.src = `https://openweathermap.org/img/w/${currentWeather.icon}.png`;
  tempEl.textContent = `Temp: ${currentWeather.tempF}°F`;
  windEl.textContent = `Wind: ${currentWeather.windSpeed} MPH`;
  humidityEl.textContent = `Humidity: ${currentWeather.humidity}%`;
};

// Render 5-Day Forecast
const renderForecast = (forecast: WeatherData[]) => {
  forecastContainer.innerHTML = '<h4 class="col-12">5-Day Forecast:</h4>';
  forecast.forEach(renderForecastCard);
};

const renderForecastCard = (forecast: WeatherData) => {
  const { col, cardTitle, weatherIcon, tempEl, windEl, humidityEl } = createForecastCard();
  cardTitle.textContent = forecast.date;
  weatherIcon.src = `https://openweathermap.org/img/w/${forecast.icon}.png`;
  tempEl.textContent = `Temp: ${forecast.tempF} °F`;
  windEl.textContent = `Wind: ${forecast.windSpeed} MPH`;
  humidityEl.textContent = `Humidity: ${forecast.humidity}%`;
  forecastContainer.append(col);
};

// Create Forecast Card Structure
const createForecastCard = () => {
  const col = document.createElement('div');
  col.classList.add('col-auto');

  const card = document.createElement('div');
  card.classList.add('forecast-card', 'card', 'bg-primary', 'text-white');

  const cardBody = document.createElement('div');
  cardBody.classList.add('card-body', 'p-2');

  const cardTitle = document.createElement('h5');
  const weatherIcon = document.createElement('img');
  const tempEl = document.createElement('p');
  const windEl = document.createElement('p');
  const humidityEl = document.createElement('p');

  cardBody.append(cardTitle, weatherIcon, tempEl, windEl, humidityEl);
  card.append(cardBody);
  col.append(card);

  return { col, cardTitle, weatherIcon, tempEl, windEl, humidityEl };
};

// Event Handlers
const handleSearchFormSubmit = (event: Event) => {
  event.preventDefault();
  if (!searchInput.value.trim()) {
    alert("City name cannot be empty.");
    return;
  }
  fetchWeather(searchInput.value.trim()).then(getAndRenderHistory);
  searchInput.value = '';
};

const handleSearchHistoryClick = (event: Event) => {
  const target = event.target as HTMLElement;
  if (target.matches('.history-btn')) {
    fetchWeather(target.textContent ?? "");
  }
};

const handleDeleteHistoryClick = (event: Event) => {
  event.stopPropagation();
  const cityID = (event.target as HTMLElement).getAttribute('data-city-id');
  if (cityID) deleteCityFromHistory(cityID);
};

// Render Search History
const renderSearchHistory = (historyList: WeatherData[]) => {
  searchHistoryContainer.innerHTML = '';
  historyList.forEach((historyItem) => {
    const historyButton = document.createElement('button');
    historyButton.textContent = historyItem.city;
    historyButton.classList.add('history-btn');

    const deleteButton = document.createElement('button');
    deleteButton.textContent = "❌";
    deleteButton.classList.add('delete-btn');
    deleteButton.setAttribute('data-city-id', historyItem.city);
    deleteButton.addEventListener('click', handleDeleteHistoryClick);

    const historyDiv = document.createElement('div');
    historyDiv.classList.add('history-entry');
    historyDiv.append(historyButton, deleteButton);

    searchHistoryContainer.append(historyDiv);
  });
};

// Initialize
const getAndRenderHistory = async () => {
  const historyList = await fetchSearchHistory();
  renderSearchHistory(historyList);
};

searchForm.addEventListener('submit', handleSearchFormSubmit);
searchHistoryContainer.addEventListener('click', handleSearchHistoryClick);

getAndRenderHistory();
