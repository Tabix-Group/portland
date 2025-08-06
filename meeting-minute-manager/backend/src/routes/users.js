const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

// GET all users
router.get('/', async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

// GET user by id
router.get('/:id', async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.params.id } });
  res.json(user);
});

// POST create user
router.post('/', async (req, res) => {
  try {
    const { name, email, password, role, isActive, projectIds, hasLimitedAccess } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }
    // Aceptar roles en lowercase o uppercase
    const upperRole = role.toUpperCase();
    if (!['ADMIN', 'USER'].includes(upperRole)) {
      return res.status(400).json({ error: 'Rol inválido' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: upperRole,
        isActive: isActive !== undefined ? isActive : true,
        projectIds: projectIds || [],
        hasLimitedAccess: hasLimitedAccess || false
      }
    });
    res.json(user);
  } catch (err) {
    console.error('Error creating user:', err);
    res.status(500).json({ error: 'Error interno al crear usuario' });
  }
});

// PUT update user
router.put('/:id', async (req, res) => {
  const { role, ...rest } = req.body;
  // Aceptar roles en lowercase o uppercase
  let updateRole;
  if (role) {
    const upper = role.toUpperCase();
    if (!['ADMIN', 'USER'].includes(upper)) {
      return res.status(400).json({ error: 'Rol inválido' });
    }
    updateRole = upper;
  }
  const user = await prisma.user.update({ where: { id: req.params.id }, data: { ...rest, ...(updateRole ? { role: updateRole } : {}) } });
  res.json(user);
});

// DELETE user
router.delete('/:id', async (req, res) => {
  await prisma.user.delete({ where: { id: req.params.id } });
  res.json({ message: 'User deleted' });
});

module.exports = router;
