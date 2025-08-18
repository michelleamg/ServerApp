import { Router } from 'express';
import { pool } from '../db.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const r = Router();

// GET /api/diary  -> lista mis entradas (opcional: ?from=YYYY-MM-DD&to=YYYY-MM-DD)
r.get('/', requireAuth, async (req, res) => {
  const idPaciente = req.user.sub;
  const { from, to } = req.query;

  const where = ['id_paciente = ?'];
  const params = [idPaciente];

  if (from) { where.push('fecha >= ?'); params.push(from); }
  if (to)   { where.push('fecha <= ?'); params.push(to); }

  const [rows] = await pool.query(
    `SELECT id_diario, porcentaje, fecha, contenido
       FROM diario_emociones
      WHERE ${where.join(' AND ')}
      ORDER BY fecha DESC`,
    params
  );
  res.json(rows);
});

// POST /api/diary  -> nueva entrada
r.post('/', requireAuth, async (req, res) => {
  const idPaciente = req.user.sub;
  const { porcentaje, fecha, contenido } = req.body;

  if (porcentaje == null || porcentaje < 0 || porcentaje > 100) {
    return res.status(400).json({ message: 'porcentaje debe estar entre 0 y 100' });
  }

  const [result] = await pool.query(
    `INSERT INTO diario_emociones (id_paciente, porcentaje, fecha, contenido)
     VALUES (?, ?, ?, ?)`,
    [idPaciente, porcentaje, fecha || new Date(), contenido || null]
  );
  res.status(201).json({ id: result.insertId });
});

export default r;
