import { validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from './db.js';
import { config } from './config.js';

function signToken(paciente) {
  const payload = { id: paciente.id, correo: paciente.correo, role: 'paciente' };
  return jwt.sign(payload, config.auth.jwtSecret, { expiresIn: config.auth.jwtExpires });
}

export function authMiddleware(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Token requerido' });
  try {
    req.user = jwt.verify(token, config.auth.jwtSecret);
    next();
  } catch {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
}

// POST /api/auth/paciente/register
export async function pacienteRegister(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const {
    nombre, apellido_paterno, apellido_materno,
    fecha_nacimiento, sexo, ocupacion, ciudad,
    correo, password, id_psicologo
  } = req.body;

  try {
    // ¿existe correo?
    const [dup] = await pool.query('SELECT id FROM pacientes WHERE correo = ?', [correo]);
    if (dup.length) return res.status(409).json({ error: 'El correo ya está registrado' });

    // validar psicólogo (si viene)
    if (id_psicologo) {
      const [ps] = await pool.query('SELECT usuario_id FROM psicologos WHERE usuario_id = ?', [id_psicologo]);
      if (!ps.length) return res.status(400).json({ error: 'id_psicologo no existe' });
    }

    const hash = await bcrypt.hash(password, config.auth.bcryptRounds);

    const [r] = await pool.query(
      `INSERT INTO pacientes
       (nombre, apellido_paterno, apellido_materno, fecha_nacimiento, sexo, ocupacion, ciudad, correo, contrasena, id_psicologo)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        nombre, apellido_paterno, apellido_materno,
        fecha_nacimiento, sexo, ocupacion || null, ciudad,
        correo, hash, id_psicologo || null
      ]
    );

    const [rows] = await pool.query(
      `SELECT id, nombre, apellido_paterno, apellido_materno, correo, sexo, ciudad, id_psicologo, fecha_registro
       FROM pacientes WHERE id = ?`,
      [r.insertId]
    );
    const paciente = rows[0];
    const token = signToken(paciente);
    return res.status(201).json({ user: paciente, token });
  } catch (err) {
    console.error('pacienteRegister error:', err);
    return res.status(500).json({ error: 'Error del servidor' });
  }
}

// POST /api/auth/paciente/login
export async function pacienteLogin(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { correo, password } = req.body;

  try {
    const [rows] = await pool.query(
      `SELECT id, nombre, apellido_paterno, apellido_materno, correo, contrasena, sexo, ciudad, id_psicologo
       FROM pacientes WHERE correo = ?`,
      [correo]
    );
    if (!rows.length) return res.status(401).json({ error: 'Credenciales inválidas' });

    const paciente = rows[0];
    const ok = await bcrypt.compare(password, paciente.contrasena);
    if (!ok) return res.status(401).json({ error: 'Credenciales inválidas' });

    delete paciente.contrasena;
    const token = signToken(paciente);
    return res.json({ user: paciente, token });
  } catch (err) {
    console.error('pacienteLogin error:', err);
    return res.status(500).json({ error: 'Error del servidor' });
  }
}

// GET /api/auth/paciente/me
export async function mePaciente(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT id, nombre, apellido_paterno, apellido_materno, correo, sexo, ciudad, id_psicologo, fecha_registro
       FROM pacientes WHERE id = ?`,
      [req.user.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'No encontrado' });
    return res.json({ user: rows[0] });
  } catch (err) {
    console.error('mePaciente error:', err);
    return res.status(500).json({ error: 'Error del servidor' });
  }
}
