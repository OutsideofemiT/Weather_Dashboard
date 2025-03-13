import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Load environment variables
dotenv.config();

// Convert __filename and __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 1. Import your routes
import weatherRoutes from './routes/api/weatherRoutes.js';

// 2. Mount your API routes
app.use('/api/weather', weatherRoutes);

app.use(express.static(path.join(__dirname, './Develop/client/dist')));

// 4. (Optional) Catch-all route for client-side routing
//    If you’re using React Router or any client-side routing, you’ll want a fallback:
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, './Develop/client/dist', 'index.html'));
});

// 5. Start the server on the correct port for Render
const PORT: number = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Listening on PORT: ${PORT}`);
});
