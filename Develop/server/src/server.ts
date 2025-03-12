import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

dotenv.config();

const app = express();

// Use CORS middleware
app.use(cors());

// Parse incoming requests with JSON payloads and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the client build folder.
// Adjust the relative path based on your project structure.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, '../../client/dist')));

// Import and mount your weather API routes under '/api/weather'
import weatherRoutes from './routes/api/weatherRoutes.js';
app.use('/api/weather', weatherRoutes);

// Import and mount your HTML routes under '/'
import htmlRoutes from './routes/htmlRoutes.js';
app.use('/', htmlRoutes);

// For any route that isn't handled by your API routes, serve index.html
app.get('*', (_, res) => {
  res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Listening on PORT: ${PORT}`));
