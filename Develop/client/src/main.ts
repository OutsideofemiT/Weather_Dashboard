import './styles/jass.css';

// * All necessary DOM elements selected
<<<<<<< HEAD
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

// Async function to fetch weather data for a given city with improved error handling
const fetchWeather = async (cityName: string): Promise<void> => {
  try {
    const response = await fetch('/api/weather', { // removed trailing slash here
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // Send { city: cityName } so that it matches the backend's expectation
      body: JSON.stringify({ city: cityName })
    });

    if (!response.ok) {
      // Check content type to determine whether to parse JSON or text
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json();
        console.error('Server responded with an error:', errorData);
        throw new Error('Server error');
      } else {
        const errorData = await response.text();
        console.error('Server responded with an error:', errorData);
        throw new Error('Server error');
      }
    }

    const weatherData = await response.json();
    console.log('weatherData:', weatherData);
    // Assuming the backend returns an object with a "weather" property that is an array:
    renderCurrentWeather(weatherData.weather[0]);
    renderForecast(weatherData.weather.slice(1));
  } catch (error) {
    console.error('Error fetching weather data:', error);
  }
};

const fetchSearchHistory = async () => {
  const historyResponse = await fetch('/api/weather/history', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  return historyResponse;
=======
const searchForm: HTMLFormElement = document.getElementById(
  'search-form'
) as HTMLFormElement;
const searchInput: HTMLInputElement = document.getElementById(
  'search-input'
) as HTMLInputElement;
const todayContainer = document.querySelector('#today') as HTMLDivElement;
const forecastContainer = document.querySelector('#forecast') as HTMLDivElement;
const searchHistoryContainer = document.getElementById(
  'history'
) as HTMLDivElement;
const heading: HTMLHeadingElement = document.getElementById(
  'search-title'
) as HTMLHeadingElement;
const weatherIcon: HTMLImageElement = document.getElementById(
  'weather-img'
) as HTMLImageElement;
const tempEl: HTMLParagraphElement = document.getElementById(
  'temp'
) as HTMLParagraphElement;
const windEl: HTMLParagraphElement = document.getElementById(
  'wind'
) as HTMLParagraphElement;
const humidityEl: HTMLParagraphElement = document.getElementById(
  'humidity'
) as HTMLParagraphElement;

/*

API Calls

*/

const fetchWeather = async (cityName: string) => {
  const response = await fetch('/api/weather/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ cityName }),
  });

  const weatherData = await response.json();

  console.log('weatherData: ', weatherData);

  renderCurrentWeather(weatherData[0]);
  renderForecast(weatherData.slice(1));
};

const fetchSearchHistory = async () => {
  const history = await fetch('/api/weather/history', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return history;
>>>>>>> e18e54ee5fd6588ada02d15366cd519a0acc341d
};

const deleteCityFromHistory = async (id: string) => {
  await fetch(`/api/weather/history/${id}`, {
    method: 'DELETE',
<<<<<<< HEAD
    headers: { 'Content-Type': 'application/json' },
  });
};

/* 
  Render Functions 
*/

const renderCurrentWeather = (currentWeather: any): void => {
  const { city, date, icon, iconDescription, tempF, windSpeed, humidity } = currentWeather;

  heading.textContent = `${city} (${date})`;
  weatherIcon.setAttribute('src', `https://openweathermap.org/img/w/${icon}.png`);
  weatherIcon.setAttribute('alt', iconDescription);
  weatherIcon.setAttribute('class', 'weather-img');
  // Append the icon only if it's not already appended
  if (!heading.querySelector('img')) {
    heading.append(weatherIcon);
  }
=======
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

/*

Render Functions

*/

const renderCurrentWeather = (currentWeather: any): void => {
  const { city, date, icon, iconDescription, tempF, windSpeed, humidity } =
    currentWeather;

  // convert the following to typescript
  heading.textContent = `${city} (${date})`;
  weatherIcon.setAttribute(
    'src',
    `https://openweathermap.org/img/w/${icon}.png`
  );
  weatherIcon.setAttribute('alt', iconDescription);
  weatherIcon.setAttribute('class', 'weather-img');
  heading.append(weatherIcon);
>>>>>>> e18e54ee5fd6588ada02d15366cd519a0acc341d
  tempEl.textContent = `Temp: ${tempF}°F`;
  windEl.textContent = `Wind: ${windSpeed} MPH`;
  humidityEl.textContent = `Humidity: ${humidity} %`;

  if (todayContainer) {
    todayContainer.innerHTML = '';
    todayContainer.append(heading, tempEl, windEl, humidityEl);
  }
};

const renderForecast = (forecast: any): void => {
  const headingCol = document.createElement('div');
<<<<<<< HEAD
  const forecastHeading = document.createElement('h4');

  headingCol.setAttribute('class', 'col-12');
  forecastHeading.textContent = '5-Day Forecast:';
  headingCol.append(forecastHeading);
=======
  const heading = document.createElement('h4');

  headingCol.setAttribute('class', 'col-12');
  heading.textContent = '5-Day Forecast:';
  headingCol.append(heading);
>>>>>>> e18e54ee5fd6588ada02d15366cd519a0acc341d

  if (forecastContainer) {
    forecastContainer.innerHTML = '';
    forecastContainer.append(headingCol);
  }

  for (let i = 0; i < forecast.length; i++) {
    renderForecastCard(forecast[i]);
  }
};

const renderForecastCard = (forecast: any) => {
  const { date, icon, iconDescription, tempF, windSpeed, humidity } = forecast;
<<<<<<< HEAD
  const { col, cardTitle, weatherIcon, tempEl, windEl, humidityEl } = createForecastCard();

  // Add content to elements
  cardTitle.textContent = date;
  weatherIcon.setAttribute('src', `https://openweathermap.org/img/w/${icon}.png`);
=======

  const { col, cardTitle, weatherIcon, tempEl, windEl, humidityEl } =
    createForecastCard();

  // Add content to elements
  cardTitle.textContent = date;
  weatherIcon.setAttribute(
    'src',
    `https://openweathermap.org/img/w/${icon}.png`
  );
>>>>>>> e18e54ee5fd6588ada02d15366cd519a0acc341d
  weatherIcon.setAttribute('alt', iconDescription);
  tempEl.textContent = `Temp: ${tempF} °F`;
  windEl.textContent = `Wind: ${windSpeed} MPH`;
  humidityEl.textContent = `Humidity: ${humidity} %`;

  if (forecastContainer) {
    forecastContainer.append(col);
  }
};

const renderSearchHistory = async (searchHistory: any) => {
  const historyList = await searchHistory.json();

  if (searchHistoryContainer) {
    searchHistoryContainer.innerHTML = '';

    if (!historyList.length) {
<<<<<<< HEAD
      searchHistoryContainer.innerHTML = '<p class="text-center">No Previous Search History</p>';
    }

    // Show most recent searches first
=======
      searchHistoryContainer.innerHTML =
        '<p class="text-center">No Previous Search History</p>';
    }

    // * Start at end of history array and count down to show the most recent cities at the top.
>>>>>>> e18e54ee5fd6588ada02d15366cd519a0acc341d
    for (let i = historyList.length - 1; i >= 0; i--) {
      const historyItem = buildHistoryListItem(historyList[i]);
      searchHistoryContainer.append(historyItem);
    }
  }
};

<<<<<<< HEAD
/* 
  Helper Functions 
=======
/*

Helper Functions

>>>>>>> e18e54ee5fd6588ada02d15366cd519a0acc341d
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
<<<<<<< HEAD
  card.classList.add('forecast-card', 'card', 'text-white', 'bg-primary', 'h-100');
=======
  card.classList.add(
    'forecast-card',
    'card',
    'text-white',
    'bg-primary',
    'h-100'
  );
>>>>>>> e18e54ee5fd6588ada02d15366cd519a0acc341d
  cardBody.classList.add('card-body', 'p-2');
  cardTitle.classList.add('card-title');
  tempEl.classList.add('card-text');
  windEl.classList.add('card-text');
  humidityEl.classList.add('card-text');

<<<<<<< HEAD
  return { col, cardTitle, weatherIcon, tempEl, windEl, humidityEl };
=======
  return {
    col,
    cardTitle,
    weatherIcon,
    tempEl,
    windEl,
    humidityEl,
  };
>>>>>>> e18e54ee5fd6588ada02d15366cd519a0acc341d
};

const createHistoryButton = (city: string) => {
  const btn = document.createElement('button');
  btn.setAttribute('type', 'button');
  btn.setAttribute('aria-controls', 'today forecast');
  btn.classList.add('history-btn', 'btn', 'btn-secondary', 'col-10');
  btn.textContent = city;
<<<<<<< HEAD
=======

>>>>>>> e18e54ee5fd6588ada02d15366cd519a0acc341d
  return btn;
};

const createDeleteButton = () => {
  const delBtnEl = document.createElement('button');
  delBtnEl.setAttribute('type', 'button');
<<<<<<< HEAD
  delBtnEl.classList.add('fas', 'fa-trash-alt', 'delete-city', 'btn', 'btn-danger', 'col-2');
=======
  delBtnEl.classList.add(
    'fas',
    'fa-trash-alt',
    'delete-city',
    'btn',
    'btn-danger',
    'col-2'
  );

>>>>>>> e18e54ee5fd6588ada02d15366cd519a0acc341d
  delBtnEl.addEventListener('click', handleDeleteHistoryClick);
  return delBtnEl;
};

const createHistoryDiv = () => {
  const div = document.createElement('div');
  div.classList.add('display-flex', 'gap-2', 'col-12', 'm-1');
  return div;
};

const buildHistoryListItem = (city: any) => {
  const newBtn = createHistoryButton(city.name);
  const deleteBtn = createDeleteButton();
  deleteBtn.dataset.city = JSON.stringify(city);
  const historyDiv = createHistoryDiv();
  historyDiv.append(newBtn, deleteBtn);
  return historyDiv;
};

<<<<<<< HEAD
/* 
  Event Handlers 
*/

// Modified: if input is blank, default to "San Diego"
console.log("handleSearchFormSubmit fired!")
const handleSearchFormSubmit = (event: any): void => {
  event.preventDefault();
  const search: string = searchInput.value.trim() || "San Diego";
=======
/*

Event Handlers

*/

const handleSearchFormSubmit = (event: any): void => {
  event.preventDefault();

  if (!searchInput.value) {
    throw new Error('City cannot be blank');
  }

  const search: string = searchInput.value.trim();
>>>>>>> e18e54ee5fd6588ada02d15366cd519a0acc341d
  fetchWeather(search).then(() => {
    getAndRenderHistory();
  });
  searchInput.value = '';
};

const handleSearchHistoryClick = (event: any) => {
  if (event.target.matches('.history-btn')) {
    const city = event.target.textContent;
<<<<<<< HEAD
    if (city) {
      fetchWeather(city).then(getAndRenderHistory);
    }
=======
    fetchWeather(city).then(getAndRenderHistory);
>>>>>>> e18e54ee5fd6588ada02d15366cd519a0acc341d
  }
};

const handleDeleteHistoryClick = (event: any) => {
  event.stopPropagation();
  const cityID = JSON.parse(event.target.getAttribute('data-city')).id;
  deleteCityFromHistory(cityID).then(getAndRenderHistory);
};

<<<<<<< HEAD
/* 
  Initial Render 
*/

const getAndRenderHistory = () => fetchSearchHistory().then(renderSearchHistory);
=======
/*

Initial Render

*/

const getAndRenderHistory = () =>
  fetchSearchHistory().then(renderSearchHistory);
>>>>>>> e18e54ee5fd6588ada02d15366cd519a0acc341d

searchForm?.addEventListener('submit', handleSearchFormSubmit);
searchHistoryContainer?.addEventListener('click', handleSearchHistoryClick);

getAndRenderHistory();
