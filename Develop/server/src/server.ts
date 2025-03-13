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

// Adjust the client build path to go one directory up
const clientBuildPath = path.join(process.cwd(), '..', 'client', 'dist');
console.log("Client build path:", clientBuildPath);

// Serve static files from the client's build folder
app.use(express.static(clientBuildPath));

// Import and mount your API routes under /api (if needed)
import routes from './routes/index.js';
app.use('/api', routes);

// Fallback: serve index.html for any unhandled routes (for client-side routing)
app.get('*', (_, res) => {
  res.sendFile(path.join(clientBuildPath, 'index.html'));
});

// Parse the PORT as a number and bind to 0.0.0.0 so Render detects the open port
const PORT: number = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;
app.listen(PORT, '0.0.0.0', () =>
  console.log(`Listening on PORT: ${PORT}`)
);

