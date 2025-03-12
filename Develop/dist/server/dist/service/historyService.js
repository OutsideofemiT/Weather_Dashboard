import { promises as fs } from 'fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
// Set up __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Define the City class with name and id properties
export class City {
    constructor(name, id) {
        this.name = name;
        this.id = id;
    }
}
class HistoryService {
    constructor() {
        // Adjust the relative path to your searchHistory.json file if needed
        this.dbPath = path.join(__dirname, 'searchHistory.json');
    }
    // Private async read method that reads from the searchHistory.json file
    async read() {
        try {
            const data = await fs.readFile(this.dbPath, 'utf-8');
            const cities = JSON.parse(data);
            return cities;
        }
        catch (error) {
            // If file doesn't exist, return an empty array
            if (error.code === 'ENOENT') {
                return [];
            }
            console.error('Error reading searchHistory.json:', error);
            throw error;
        }
    }
    // Private async write method that writes the updated cities array to the searchHistory.json file
    async write(cities) {
        try {
            await fs.writeFile(this.dbPath, JSON.stringify(cities, null, 2));
        }
        catch (error) {
            console.error('Error writing to searchHistory.json:', error);
            throw error;
        }
    }
    // getCities method that reads the cities from the searchHistory.json file and returns them as an array of City objects
    async getCities() {
        return await this.read();
    }
    // addCity method that adds a city to the searchHistory.json file
    async addCity(city) {
        const cities = await this.read();
        // Only add if a city with the same id doesn't already exist
        if (!cities.find(c => c.id === city.id)) {
            cities.push(city);
            await this.write(cities);
        }
    }
    // removeCity method that removes a city from the searchHistory.json file
    async removeCity(id) {
        let cities = await this.read();
        cities = cities.filter((city) => city.id !== id);
        await this.write(cities);
        return cities;
    }
}
export default new HistoryService();
