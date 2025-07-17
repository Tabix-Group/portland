const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET all minute items
router.get('/', async (req, res) => {
  const minutes = await prisma.minuteItem.findMany();
  res.json(minutes);
});

// GET minute item by id
router.get('/:id', async (req, res) => {
  const minute = await prisma.minuteItem.findUnique({ where: { id: req.params.id } });
  res.json(minute);
});

// POST create minute item
router.post('/', async (req, res) => {
  const minute = await prisma.minuteItem.create({ data: req.body });
  res.json(minute);
});

// PUT update minute item
router.put('/:id', async (req, res) => {
  const minute = await prisma.minuteItem.update({ where: { id: req.params.id }, data: req.body });
  res.json(minute);
});

// DELETE minute item
router.delete('/:id', async (req, res) => {
  await prisma.minuteItem.delete({ where: { id: req.params.id } });
  res.json({ message: 'Minute item deleted' });
});

module.exports = router;
