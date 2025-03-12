import './styles/jass.css';

// * Select necessary DOM elements
const searchForm = document.getElementById('search-form') as HTMLFormElement;
const searchInput = document.getElementById('search-input') as HTMLInputElement;
const todayContainer = document.querySelector('#today') as HTMLDivElement;
const forecastContainer = document.querySelector('#forecast') as HTMLDivElement;
const searchHistoryContainer = document.getElementById('history') as HTMLDivElement;
const heading = document.getElementById('search-title') as HTMLHeadingElement;
const weatherIcon = document.getElementById('weather-img') as HTMLImageElement;
const tempEl = document.getElementById('temp') as HTMLParagraphElement;
const windEl = document.getElementById('wind') as HTMLParagraphElement;
const humidityEl = document.getElementById('humidity') as HTMLParagraphElement;

/*

API Calls

*/

interface WeatherData {
  city: string;
  date: string;
  icon: string;
  iconDescription: string;
  tempF: number;
  windSpeed: number;
  humidity: number;
}

const fetchWeather = async (cityName: string) => {
  try {
    if (!cityName.trim()) {
      throw new Error("City name is required.");
    }

    const response = await fetch('/api/weather/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cityName }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("API Error Response:", errorData);
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const weatherData: WeatherData[] = await response.json();
    console.log('Weather Data:', weatherData);

    if (!Array.isArray(weatherData) || weatherData.length === 0) {
      throw new Error("Invalid weather data received");
    }

    renderCurrentWeather(weatherData[0]);
    renderForecast(weatherData.slice(1));
  } catch (error) {
    console.error("Failed to fetch weather data:", error);
    alert("City not found. Please enter a valid city name.");
  }
};

const fetchSearchHistory = async (): Promise<WeatherData[]> => {
  try {
    const response = await fetch('/api/weather/history', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch search history");
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      console.error("Unexpected search history format:", data);
      return [];
    }

    return data;
  } catch (error) {
    console.error("Error fetching search history:", error);
    return [];
  }
};

const deleteCityFromHistory = async (id: string) => {
  try {
    const response = await fetch(`/api/weather/history/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error("Failed to delete city from history");
    }

    getAndRenderHistory();
  } catch (error) {
    console.error("Error deleting history entry:", error);
  }
};

/*

Render Functions

*/

const renderCurrentWeather = (currentWeather: WeatherData | null): void => {
  if (!currentWeather) {
    console.error("No weather data available.");
    return;
  }

  const { city, date, icon, iconDescription, tempF, windSpeed, humidity } = currentWeather;

  heading.textContent = `${city} (${date})`;
  weatherIcon.setAttribute('src', `https://openweathermap.org/img/w/${icon}.png`);
  weatherIcon.setAttribute('alt', iconDescription);
  weatherIcon.setAttribute('class', 'weather-img');
  tempEl.textContent = `Temp: ${tempF}°F`;
  windEl.textContent = `Wind: ${windSpeed} MPH`;
  humidityEl.textContent = `Humidity: ${humidity} %`;

  todayContainer.innerHTML = '';
  todayContainer.append(heading, tempEl, windEl, humidityEl);
};

const renderForecast = (forecast: WeatherData[]): void => {
  forecastContainer.innerHTML = '<h4 class="col-12">5-Day Forecast:</h4>';
  forecast.forEach(renderForecastCard);
};

const renderForecastCard = (forecast: WeatherData) => {
  const { date, icon, iconDescription, tempF, windSpeed, humidity } = forecast;
  const { col, cardTitle, weatherIcon, tempEl, windEl, humidityEl } = createForecastCard();

  cardTitle.textContent = date;
  weatherIcon.setAttribute('src', `https://openweathermap.org/img/w/${icon}.png`);
  weatherIcon.setAttribute('alt', iconDescription);
  tempEl.textContent = `Temp: ${tempF} °F`;
  windEl.textContent = `Wind: ${windSpeed} MPH`;
  humidityEl.textContent = `Humidity: ${humidity} %`;

  forecastContainer.append(col);
};

/*

Helper Functions

*/

const createForecastCard = () => {
  const col = document.createElement('div');
  col.classList.add('col-auto');

  const card = document.createElement('div');
  card.classList.add('forecast-card', 'card', 'text-white', 'bg-primary', 'h-100');

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

/*

Event Handlers

*/

const handleSearchFormSubmit = (event: Event): void => {
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
    fetchWeather(target.textContent ?? "").then(getAndRenderHistory);
  }
};

const handleDeleteHistoryClick = (event: Event) => {
  event.stopPropagation();
  const target = event.target as HTMLElement;
  const cityID = target.getAttribute('data-city-id');
  if (cityID) deleteCityFromHistory(cityID);
};

/*

Initial Render

*/

const getAndRenderHistory = async () => {
  const historyList = await fetchSearchHistory();
  renderSearchHistory(historyList);
};

const renderSearchHistory = (historyList: WeatherData[]): void => {
  searchHistoryContainer.innerHTML = '';

  historyList.forEach((historyItem) => {
    const historyButton = document.createElement('button');
    historyButton.textContent = historyItem.city;
    historyButton.classList.add('history-btn');
    historyButton.setAttribute('data-city', JSON.stringify(historyItem));

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

searchForm.addEventListener('submit', handleSearchFormSubmit);
searchHistoryContainer.addEventListener('click', handleSearchHistoryClick);

getAndRenderHistory();
