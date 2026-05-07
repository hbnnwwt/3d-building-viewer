import express from 'express';
import cors from 'cors';
import { buildingsRouter } from './routes/buildings.js';
import { navigationRouter } from './routes/navigation.js';
import { monitorsRouter } from './routes/monitors.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/buildings', buildingsRouter);
app.use('/api/navigation', navigationRouter);
app.use('/api/monitors', monitorsRouter);

app.get('/api/health', (_, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});