const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET all tags
router.get('/', async (req, res) => {
  const tags = await prisma.tag.findMany();
  res.json(tags);
});

// GET tag by id
router.get('/:id', async (req, res) => {
  const tag = await prisma.tag.findUnique({ where: { id: req.params.id } });
  res.json(tag);
});

// POST create tag
router.post('/', async (req, res) => {
  const tag = await prisma.tag.create({ data: req.body });
  res.json(tag);
});

// PUT update tag
router.put('/:id', async (req, res) => {
  const tag = await prisma.tag.update({ where: { id: req.params.id }, data: req.body });
  res.json(tag);
});

// DELETE tag
router.delete('/:id', async (req, res) => {
  await prisma.tag.delete({ where: { id: req.params.id } });
  res.json({ message: 'Tag deleted' });
});

module.exports = router;
