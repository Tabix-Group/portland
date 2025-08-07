const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

// Middleware para requerir autenticación (ejemplo, ajusta según tu auth real)
function requireAuth(req, res, next) {
  // Suponiendo que el userId está en req.user.id (ajusta según tu auth)
  if (!req.user || !req.user.id) {
    return res.status(401).json({ error: 'No autenticado' });
  }
  next();
}

// POST /api/users/change-password
router.post('/', requireAuth, async (req, res) => {
  const userId = req.user.id;
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Faltan campos' });
  }
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) return res.status(400).json({ error: 'Contraseña actual incorrecta' });
    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: userId }, data: { password: hashed } });
    res.json({ message: 'Contraseña actualizada' });
  } catch (err) {
    console.error('Error cambiando contraseña:', err);
    res.status(500).json({ error: 'Error interno' });
  }
});

module.exports = router;
