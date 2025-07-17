const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET all templates
router.get('/', async (req, res) => {
  const templates = await prisma.minuteTemplate.findMany({ include: { topicGroups: true } });
  res.json(templates);
});

// GET template by id
router.get('/:id', async (req, res) => {
  const template = await prisma.minuteTemplate.findUnique({ where: { id: req.params.id }, include: { topicGroups: true } });
  res.json(template);
});

// POST create template
router.post('/', async (req, res) => {
  try {
    const { topicGroups, ...data } = req.body;
    const template = await prisma.minuteTemplate.create({
      data: {
        ...data,
        topicGroups: {
          create: Array.isArray(topicGroups) ? topicGroups.map(g => ({
            name: g.name,
            color: g.color,
            description: g.description || ""
          })) : []
        }
      },
      include: { topicGroups: true }
    });
    res.json(template);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

// PUT update template
router.put('/:id', async (req, res) => {
  const { topicGroups, ...data } = req.body;
  const template = await prisma.minuteTemplate.update({
    where: { id: req.params.id },
    data: {
      ...data,
      topicGroups: {
        deleteMany: {},
        create: topicGroups || []
      }
    },
    include: { topicGroups: true }
  });
  res.json(template);
});

// DELETE template
router.delete('/:id', async (req, res) => {
  await prisma.minuteTemplate.delete({ where: { id: req.params.id } });
  res.json({ message: 'Template deleted' });
});

module.exports = router;
