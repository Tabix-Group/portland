const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');
const { authorizeRole } = require('../middleware/auth');

// POST /api/users/:id/admin-change-password
router.post('/:id/admin-change-password', authorizeRole('ADMIN'), async (req, res) => {
  const { id } = req.params;
  const { newPassword } = req.body;
  if (!newPassword) {
    return res.status(400).json({ error: 'Falta la nueva contraseña' });
  }
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id }, data: { password: hashed } });
    res.json({ message: 'Contraseña actualizada por admin' });
  } catch (err) {
    console.error('Error admin cambiando contraseña:', err);
    res.status(500).json({ error: 'Error interno' });
  }
});

module.exports = router;
