const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const SECRET = process.env.JWT_SECRET || 'secret';

// Middleware para verificar JWT y adjuntar usuario a req
async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);
  try {
    const payload = jwt.verify(token, SECRET);
    const user = await prisma.user.findUnique({ where: { id: payload.id } });
    if (!user) return res.sendStatus(403);
    req.user = user;
    next();
  } catch (err) {
    return res.sendStatus(403);
  }
}

// Middleware para roles
function authorizeRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'No autorizado' });
    }
    next();
  };
}

// Middleware para permitir admin o dueño
function authorizeAdminOrOwner(getResourceUserId) {
  return async (req, res, next) => {
    if (req.user.role === 'ADMIN') return next();
    const ownerId = await getResourceUserId(req);
    if (ownerId && ownerId === req.user.id) return next();
    return res.status(403).json({ error: 'No autorizado' });
  };
}

module.exports = { authenticateToken, authorizeRole, authorizeAdminOrOwner };
