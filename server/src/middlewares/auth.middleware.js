import jwt from 'jsonwebtoken';

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Token requerido' });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    // Solo pacientes en esta API
    if (payload.role !== 'paciente') {
      return res.status(403).json({ message: 'Acceso restringido a pacientes' });
    }
    req.user = payload; // { sub, role, email }
    next();
  } catch (e) {
    return res.status(401).json({ message: 'Token inválido o expirado' });
  }
}
