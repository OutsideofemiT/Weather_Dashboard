import { Router } from 'express';
const router = Router();

import HistoryService from '../../service/historyService.js';
import WeatherService from '../../service/weatherService.js';

// POST Request with city name to retrieve weather data
router.post('/', async (req, res) => {
  const { city } = req.body;
  if (!city) {
    return res.status(400).json({ error: 'City name is required' });
  }
  try {
    // GET weather data from city name
    const weather = await WeatherService.getWeatherByCity(city);

    // Save city to search history
    // Assuming weather includes properties 'name' and 'id'
    await HistoryService.addCity({ name: weather.name, id: weather.id });

    res.status(200).json({ weather });
  } catch (error) {
    console.error('Error fetching weather data:', error);
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
});

// GET search history
router.get('/history', async (req, res) => {
  try {
    const searchHistory = await HistoryService.getHistory();
    res.status(200).json({ searchHistory });
  } catch (error) {
    console.error('Error fetching search history:', error);
    res.status(500).json({ error: 'Failed to fetch search history' });
  }
});

// BONUS: DELETE city from search history
router.delete('/history/:id', async (req, res) => {
  try {
    const cityId = Number(req.params.id);
    if (isNaN(cityId)) {
      return res.status(400).json({ error: 'Invalid city id' });
    }
    const updatedHistory = await HistoryService.deleteCity(cityId);
    res.status(200).json({ searchHistory: updatedHistory });
  } catch (error) {
    console.error('Error deleting city from search history:', error);
    res.status(500).json({ error: 'Failed to delete city from search history' });
  }
});

export default router;
