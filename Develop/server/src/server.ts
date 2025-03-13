import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

const app = express();

// Use CORS middleware
app.use(cors());

// Other middleware and route setups
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import and use your routes
import routes from './routes/index.js';
app.use(routes);

const PORT: number = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;
app.listen(PORT, '0.0.0.0', () =>
  console.log(`Listening on PORT: ${PORT}`)
);
