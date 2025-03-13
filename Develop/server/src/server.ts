import express from 'express';
import cors from 'cors';
import weatherRoutes from './routes/api/weatherRoutes.js';
import dotenv from 'dotenv';
dotenv.config();

const app = express();

// Use CORS middleware
app.use(cors());

// Other middleware and route setups
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/api/weather', weatherRoutes);

const PORT: number = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;
app.listen(PORT, '0.0.0.0', () => console.log(`Listening on PORT: ${PORT}`));
