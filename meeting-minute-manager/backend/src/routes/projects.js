const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET all projects
router.get('/', async (req, res) => {
  const projects = await prisma.project.findMany();
  res.json(projects);
});

// GET project by id
router.get('/:id', async (req, res) => {
  const project = await prisma.project.findUnique({ where: { id: req.params.id } });
  res.json(project);
});

// POST create project
router.post('/', async (req, res) => {
  const project = await prisma.project.create({ data: req.body });
  res.json(project);
});

// PUT update project
router.put('/:id', async (req, res) => {
  const project = await prisma.project.update({ where: { id: req.params.id }, data: req.body });
  res.json(project);
});

// DELETE project
router.delete('/:id', async (req, res) => {
  await prisma.project.delete({ where: { id: req.params.id } });
  res.json({ message: 'Project deleted' });
});

module.exports = router;
