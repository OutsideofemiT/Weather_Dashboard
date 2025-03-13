## Weather Dashboard
External APIs allow developers to access data and functionality by making requests with specific parameters to a URL. This Weather Dashboard application demonstrates how to call the OpenWeather API, retrieve weather data, and render it in the browser.

## Description
This application lets travelers view current and 5-day weather forecasts for multiple cities. The front end has been provided; your task is to build the back end to connect to the OpenWeather API, manage search history, and deploy the full-stack application to Render.

API Endpoint Example:


### https://api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid={API_Key}
Note: After registering for a new API key, it may take up to 2 hours for the key to activate.

## User Story
AS A traveler
I WANT to see the weather outlook for multiple cities
SO THAT I can plan a trip accordingly

## Acceptance Criteria
Search Functionality:
When a user searches for a city, the app presents current and future conditions for that city and adds it to the search history.
Current Weather:
The dashboard displays the city name, the date, a weather icon, a description (for the icon’s alt text), temperature, humidity, and wind speed.
5-Day Forecast:
The forecast shows the date, a weather icon, temperature, wind speed, and humidity for the next five days.
Search History:
When a user clicks a city in the search history, the app displays that city’s weather data again.


Getting Started

## Installation
Clone the Repository: git clone https://github.com/YourUsername/Weather_Dashboard.git

cd Develop

# Install Dependencies for Both Client and Server:

npm run install

# Configure Environment Variables:

Create a .env file in the root (or in the server folder if preferred) and add your OpenWeather API key:

API_KEY=your_openweather_api_key
PORT=3001  # This is optional for local development; Render will supply its own PORT value.

# Running the Application Locally
Development Mode: npm run start:dev
Production Mode:  npm run start

This will build the client assets and start the Express server.

# Deploying to Render
Push your repository to GitHub.

Create a New Web Service on Render and connect it to your GitHub repository.

Set the Build Command to:

npm run render-build
Set the Start Command to: npm run start

Configure Environment Variables on Render (e.g., API_KEY).

Render’s system will use these commands to build and start your service, ensuring that your server binds to the correct port.

API Endpoints
HTML Route
GET *
Returns the index.html file from the client build folder.
API Routes
GET /api/weather/history
Reads searchHistory.json and returns all saved cities as JSON.

POST /api/weather
Receives a city name in the request body, saves it to searchHistory.json (assigning a unique id), and returns associated weather data from the OpenWeather API.

(Bonus) DELETE /api/weather/history/:id
Receives the id of a city to delete, removes the city from searchHistory.json, and updates the file.

Implementation Hints
Coordinates Requirement:
The 5-day weather forecast API requires geographical coordinates. Use the OpenWeatherMap Geocoding API to convert a city name to latitude and longitude.

Server-Side API Calls:
Fetch weather data from the OpenWeather API on the server side, parse the response, and then send the data to the client.

Unique IDs:
Use a package like uuid to assign unique IDs to saved city entries.

## License
This project is open-source and available under the MIT License.

## Acknowledgments
OpenWeather API Documentation
Render Documentation on Web Services
Starter code provided for the Weather Dashboard assignment.
Special thanks to the community and mentors for their support.
Contact
For any questions or feedback, please contact [outsideofemit@gmail.com] or open an issue in the repository.
