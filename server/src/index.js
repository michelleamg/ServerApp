import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import patientAuthRoutes from './routes/patient.auth.routes.js';
import diaryRoutes from './routes/diary.routes.js';

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));
app.use(express.json());

// Rutas (solo paciente)
app.use('/api/patient', patientAuthRoutes);
app.use('/api/diary', diaryRoutes);

// Healthcheck
app.get('/health', (_req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API pacientes escuchando en http://localhost:${PORT}`));
