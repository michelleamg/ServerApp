import express from 'express';
import cors from 'cors';
import { router as indexRouter } from './index.routes.js';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api', indexRouter);
app.get('/health', (_, res) => res.json({ ok: true }));

export default app;
