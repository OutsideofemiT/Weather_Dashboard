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
    // Use getWeatherForCity (not getWeatherByCity)
    const weather = await WeatherService.getWeatherForCity(city);
    // Save city to search history.
    // Adjust the properties as needed. Here, we're assuming the HistoryService expects an object with name and id.
    await HistoryService.addCity({ name: city, id: Math.random().toString() });
    return res.status(200).json({ weather });
  } catch (error) {
    console.error('Error fetching weather data:', error);
    return res.status(500).json({ error: 'Failed to fetch weather data' });
  }
});

// GET search history
router.get('/history', async (_req, res) => {
  try {
    // Use getCities instead of getHistory
    const searchHistory = await HistoryService.getCities();
    return res.status(200).json({ searchHistory });
  } catch (error) {
    console.error('Error fetching search history:', error);
    return res.status(500).json({ error: 'Failed to fetch search history' });
  }
});

// BONUS: DELETE city from search history
router.delete('/history/:id', async (req, res) => {
  try {
    const cityId = req.params.id;
    // Use removeCity instead of deleteCity
    const updatedHistory = await HistoryService.removeCity(cityId);
    return res.status(200).json({ searchHistory: updatedHistory });
  } catch (error) {
    console.error('Error deleting city from search history:', error);
    return res.status(500).json({ error: 'Failed to delete city from search history' });
  }
});

export default router;
