import './styles/jass.css';

// * All necessary DOM elements selected
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

// Define the weather data structure
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
    if (!cityName || cityName.trim() === "") {
      throw new Error("City name is required.");
    }

    const response = await fetch('/api/weather/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ cityName }),
    });

    if (!response.ok) {
      const errorData = await response.json(); // Log API error response
      console.error("API Error Response:", errorData);
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const weatherData: WeatherData[] = await response.json();
    console.log('weatherData: ', weatherData);

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

const fetchSearchHistory = async () => {
  try {
    const response = await fetch('/api/weather/history', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch search history`);
    }

    return response;
  } catch (error) {
    console.error(error);
  }
};

const deleteCityFromHistory = async (id: string) => {
  try {
    const response = await fetch(`/api/weather/history/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error("Failed to delete city from history");
    }
  } catch (error) {
    console.error(error);
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

  if (todayContainer) {
    todayContainer.innerHTML = '';
    todayContainer.append(heading, tempEl, windEl, humidityEl);
  }
};

const renderForecast = (forecast: WeatherData[]): void => {
  if (forecastContainer) {
    forecastContainer.innerHTML = '<h4 class="col-12">5-Day Forecast:</h4>';
  }

  for (const day of forecast) {
    renderForecastCard(day);
  }
};

const renderForecastCard = (forecast: WeatherData) => {
  const { date, icon, iconDescription, tempF, windSpeed, humidity } = forecast;

  const { col, cardTitle, weatherIcon, tempEl, windEl, humidityEl } = createForecastCard();

  // Add content to elements
  cardTitle.textContent = date;
  weatherIcon.setAttribute('src', `https://openweathermap.org/img/w/${icon}.png`);
  weatherIcon.setAttribute('alt', iconDescription);
  tempEl.textContent = `Temp: ${tempF} °F`;
  windEl.textContent = `Wind: ${windSpeed} MPH`;
  humidityEl.textContent = `Humidity: ${humidity} %`;

  if (forecastContainer) {
    forecastContainer.append(col);
  }
};

/*

Helper Functions

*/

const createForecastCard = () => {
  const col = document.createElement('div');
  const card = document.createElement('div');
  const cardBody = document.createElement('div');
  const cardTitle = document.createElement('h5');
  const weatherIcon = document.createElement('img');
  const tempEl = document.createElement('p');
  const windEl = document.createElement('p');
  const humidityEl = document.createElement('p');

  col.append(card);
  card.append(cardBody);
  cardBody.append(cardTitle, weatherIcon, tempEl, windEl, humidityEl);

  col.classList.add('col-auto');
  card.classList.add('forecast-card', 'card', 'text-white', 'bg-primary', 'h-100');
  cardBody.classList.add('card-body', 'p-2');
  cardTitle.classList.add('card-title');
  tempEl.classList.add('card-text');
  windEl.classList.add('card-text');
  humidityEl.classList.add('card-text');

  return {
    col,
    cardTitle,
    weatherIcon,
    tempEl,
    windEl,
    humidityEl,
  };
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

  const search = searchInput.value.trim();
  fetchWeather(search).then(() => {
    getAndRenderHistory();
  });
  searchInput.value = '';
};

const handleSearchHistoryClick = (event: Event) => {
  const target = event.target as HTMLElement;
  if (target.matches('.history-btn')) {
    const city = target.textContent;
    if (city) fetchWeather(city).then(getAndRenderHistory);
  }
};

const handleDeleteHistoryClick = (event: Event) => {
  event.stopPropagation();
  const target = event.target as HTMLElement;
  const cityID = JSON.parse(target.getAttribute('data-city') || "{}").id;
  if (cityID) deleteCityFromHistory(cityID).then(getAndRenderHistory);
};

/*

Initial Render

*/

const getAndRenderHistory = async () => {
  try {
    const historyResponse = await fetchSearchHistory();

    if (!historyResponse || !historyResponse.ok) {
      console.error("Failed to fetch search history.");
      return;
    }

    const historyList = await historyResponse.json();
    if (!Array.isArray(historyList)) {
      console.error("Expected an array but received:", historyList);
      return;
    }

    renderSearchHistory(historyList);
  } catch (error) {
    console.error("Error loading search history:", error);
  }
};

const renderSearchHistory = (historyList: WeatherData[]): void => {
  if (searchHistoryContainer) {
    searchHistoryContainer.innerHTML = '';

    historyList.forEach((historyItem) => {
      const historyButton = document.createElement('button');
      historyButton.textContent = historyItem.city;
      historyButton.classList.add('history-btn');
      historyButton.setAttribute('data-city', JSON.stringify(historyItem));
      searchHistoryContainer.append(historyButton);
    });
  }
};

searchForm?.addEventListener('submit', handleSearchFormSubmit);
searchHistoryContainer?.addEventListener('click', handleSearchHistoryClick);
searchHistoryContainer?.addEventListener('click', handleDeleteHistoryClick);

getAndRenderHistory();
