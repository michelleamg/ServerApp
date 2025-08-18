import { Router } from 'express';
import { pool } from '../db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { requireAuth } from '../middlewares/auth.middleware.js';

const r = Router();

// POST /api/patient/register
r.post('/register', async (req, res) => {
  try {
    const { nombre, apellidop, apellidom, fechanac, sexo, correo, password, ciudad } = req.body;

    if (!correo || !password) return res.status(400).json({ message: 'Correo y contraseña son obligatorios' });

    const [exists] = await pool.query('SELECT id_paciente FROM paciente WHERE correo = ?', [correo]);
    if (exists.length) return res.status(409).json({ message: 'El correo ya está registrado' });

    const hash = await bcrypt.hash(password, 10);
    await pool.query(
      `INSERT INTO paciente (nombre, apellidop, apellidom, fechanac, sexo, correo, ciudad, password_hash)
       VALUES (?,?,?,?,?,?,?,?)`,
      [nombre || null, apellidop || null, apellidom || null, fechanac || null, sexo || null, correo, ciudad || null, hash]
    );

    res.status(201).json({ message: 'Paciente registrado' });
  } catch (e) {
    res.status(500).json({ message: 'Error en el registro', error: e.message });
  }
});

// POST /api/patient/login
r.post('/login', async (req, res) => {
  try {
    const { correo, password } = req.body;
    const [rows] = await pool.query(
      'SELECT id_paciente, correo, password_hash, nombre FROM paciente WHERE correo = ?',
      [correo]
    );
    if (!rows.length) return res.status(401).json({ message: 'Credenciales inválidas' });

    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ message: 'Credenciales inválidas' });

    const token = jwt.sign({ sub: user.id_paciente, role: 'paciente', email: user.correo }, process.env.JWT_SECRET, { expiresIn: '8h' });
    res.json({ token, user: { id: user.id_paciente, nombre: user.nombre, correo: user.correo } });
  } catch (e) {
    res.status(500).json({ message: 'Error al iniciar sesión', error: e.message });
  }
});

// GET /api/patient/me (perfil)
r.get('/me', requireAuth, async (req, res) => {
  const id = req.user.sub;
  const [rows] = await pool.query(
    'SELECT id_paciente, nombre, apellidop, apellidom, fechanac, sexo, correo, ciudad FROM paciente WHERE id_paciente = ?',
    [id]
  );
  if (!rows.length) return res.status(404).json({ message: 'Paciente no encontrado' });
  res.json(rows[0]);
});

export default r;
