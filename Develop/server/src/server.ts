import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'node:path';
dotenv.config();

const app = express();

// Use CORS middleware
app.use(cors());

// Other middleware and route setups
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the client's build folder
const clientBuildPath = path.join(process.cwd(), 'client', 'dist');
app.use(express.static(clientBuildPath));

// Import and mount your API routes (if any) under a prefix, e.g., /api
import routes from './routes/index.js';
app.use('/api', routes);

// Fallback: serve index.html for any routes not handled (for client-side routing support)
app.get('*', (_, res) => {
  res.sendFile(path.join(clientBuildPath, 'index.html'));
});

// Parse the PORT as a number and bind to 0.0.0.0 so Render can detect the open port
const PORT: number = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;
app.listen(PORT, '0.0.0.0', () =>
  console.log(`Listening on PORT: ${PORT}`)
);

