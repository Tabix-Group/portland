const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET all global topic groups
router.get('/', async (req, res) => {
  const groups = await prisma.globalTopicGroup.findMany();
  res.json(groups);
});

// GET group by id
router.get('/:id', async (req, res) => {
  const group = await prisma.globalTopicGroup.findUnique({ where: { id: req.params.id } });
  res.json(group);
});

// POST create group
router.post('/', async (req, res) => {
  const group = await prisma.globalTopicGroup.create({ data: req.body });
  res.json(group);
});

// PUT update group
router.put('/:id', async (req, res) => {
  const group = await prisma.globalTopicGroup.update({ where: { id: req.params.id }, data: req.body });
  res.json(group);
});

// DELETE group
router.delete('/:id', async (req, res) => {
  await prisma.globalTopicGroup.delete({ where: { id: req.params.id } });
  res.json({ message: 'Global topic group deleted' });
});

module.exports = router;
