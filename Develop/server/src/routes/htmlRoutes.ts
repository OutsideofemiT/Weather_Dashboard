import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Router } from 'express';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = Router();

// Define route to serve index.html
router.get('/', (_, res) => {
  // Adjust the file path if your index.html is located elsewhere
  res.sendFile(path.join(__dirname, 'index.html'));
});

export default router;
