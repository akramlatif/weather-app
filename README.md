# SkyPulse Weather App

SkyPulse is a modern, responsive weather web app that shows real-time conditions, a 7-day forecast, and a 24-hour hourly forecast for cities worldwide.

It uses free and open APIs from Open-Meteo (weather + geocoding) and does not require an API key.

## Features

- City search with live autocomplete suggestions
- Current weather conditions:
  - Temperature
  - Feels like
  - Humidity
  - Wind speed
  - Visibility
  - Pressure
  - Cloud cover
- 7-day weather forecast
- 24-hour hourly forecast
- Celsius/Fahrenheit unit toggle
- Quick search buttons for popular cities
- Fully responsive UI for desktop and mobile

## Tech Stack

- HTML5
- CSS3
- Vanilla JavaScript (ES6+)
- Open-Meteo APIs

## APIs Used

- Geocoding API: https://geocoding-api.open-meteo.com/v1/search
- Forecast API: https://api.open-meteo.com/v1/forecast

## Project Structure

weather-app/
- index.html
- style.css
- app.js

## How to Run Locally

1. Clone the repository:

   git clone https://github.com/akramlatif/weather-app.git

2. Go to the project folder:

   cd weather-app

3. Open index.html in your browser.

No build step or dependencies are required.

## Notes

- This project uses browser fetch calls directly to public APIs.
- Internet connection is required for weather and geocoding data.

## Future Improvements

- Add location-based weather (GPS)
- Add theme switching (light/dark)
- Add precipitation charts
- Add favorite cities with local storage

## License

This project is open source and available under the MIT License.
