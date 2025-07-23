
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET tasks for a minute
router.get('/:id/tasks', async (req, res) => {
  const tasks = await prisma.task.findMany({ where: { minuteId: req.params.id } });
  res.json(tasks);
});

// GET all minute items
// GET all minutes
router.get('/', async (req, res) => {
  const minutes = await prisma.minute.findMany();
  // Normalizar arrays en cada minuto antes de enviar
  const safe = arr => Array.isArray(arr) ? arr : [];
  const normalizeMinute = (minute) => {
    if (!minute) return minute;
    const norm = { ...minute };
    norm.topicGroups = safe(norm.topicGroups).map((g) => ({
      ...g,
      topicsDiscussed: safe(g.topicsDiscussed),
      decisions: safe(g.decisions),
      pendingTasks: safe(g.pendingTasks)
    }));
    norm.topicsDiscussed = safe(norm.topicsDiscussed);
    norm.decisions = safe(norm.decisions);
    norm.pendingTasks = safe(norm.pendingTasks);
    norm.participants = safe(norm.participants);
    norm.occasionalParticipants = safe(norm.occasionalParticipants);
    norm.informedPersons = safe(norm.informedPersons);
    norm.tags = safe(norm.tags);
    norm.files = safe(norm.files);
    norm.projectIds = safe(norm.projectIds);
    norm.participantIds = safe(norm.participantIds);
    norm.externalMentions = safe(norm.externalMentions);
    return norm;
  };
  res.json(safe(minutes).map(normalizeMinute));
});

// GET minute item by id
router.get('/:id', async (req, res) => {
  const minute = await prisma.minute.findUnique({ where: { id: req.params.id } });
  // Normalizar arrays en la respuesta
  const safe = arr => Array.isArray(arr) ? arr : [];
  const normalizeMinute = (minute) => {
    if (!minute) return minute;
    const norm = { ...minute };
    norm.topicGroups = safe(norm.topicGroups).map((g) => ({
      ...g,
      topicsDiscussed: safe(g.topicsDiscussed),
      decisions: safe(g.decisions),
      pendingTasks: safe(g.pendingTasks)
    }));
    norm.topicsDiscussed = safe(norm.topicsDiscussed);
    norm.decisions = safe(norm.decisions);
    norm.pendingTasks = safe(norm.pendingTasks);
    norm.participants = safe(norm.participants);
    norm.occasionalParticipants = safe(norm.occasionalParticipants);
    norm.informedPersons = safe(norm.informedPersons);
    norm.tags = safe(norm.tags);
    norm.files = safe(norm.files);
    norm.projectIds = safe(norm.projectIds);
    norm.participantIds = safe(norm.participantIds);
    norm.externalMentions = safe(norm.externalMentions);
    return norm;
  };
  res.json(normalizeMinute(minute));
});

// POST create minute
router.post('/', async (req, res) => {
  try {
    // Extraer tareas del body y quitarlas del objeto principal
    const { tasks, ...minuteData } = req.body;
    const minute = await prisma.minute.create({ data: minuteData });
    // Crear tareas si vienen en el body
    if (Array.isArray(tasks)) {
      for (const task of tasks) {
        await prisma.task.create({ data: { ...task, minuteId: minute.id } });
      }
    }
    // Normalizar arrays en la respuesta
    const safe = arr => Array.isArray(arr) ? arr : [];
    const normalizeMinute = (minute) => {
      if (!minute) return minute;
      const norm = { ...minute };
      norm.topicGroups = safe(norm.topicGroups).map((g) => ({
        ...g,
        topicsDiscussed: safe(g.topicsDiscussed),
        decisions: safe(g.decisions),
        pendingTasks: safe(g.pendingTasks)
      }));
      norm.topicsDiscussed = safe(norm.topicsDiscussed);
      norm.decisions = safe(norm.decisions);
      norm.pendingTasks = safe(norm.pendingTasks);
      norm.participants = safe(norm.participants);
      norm.occasionalParticipants = safe(norm.occasionalParticipants);
      norm.informedPersons = safe(norm.informedPersons);
      norm.tags = safe(norm.tags);
      norm.files = safe(norm.files);
      norm.projectIds = safe(norm.projectIds);
      norm.participantIds = safe(norm.participantIds);
      norm.externalMentions = safe(norm.externalMentions);
      return norm;
    };
    res.json(normalizeMinute(minute));
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

// PUT update minute
router.put('/:id', async (req, res) => {
  // Extraer tareas del body y quitarlas del objeto principal
  const { tasks, ...minuteData } = req.body;
  const minute = await prisma.minute.update({ where: { id: req.params.id }, data: minuteData });
  // Sincronizar tareas: eliminar las existentes y crear las nuevas
  await prisma.task.deleteMany({ where: { minuteId: req.params.id } });
  if (Array.isArray(tasks)) {
    for (const task of tasks) {
      await prisma.task.create({ data: { ...task, minuteId: req.params.id } });
    }
  }
  // Normalizar arrays en la respuesta
  const safe = arr => Array.isArray(arr) ? arr : [];
  const normalizeMinute = (minute) => {
    if (!minute) return minute;
    const norm = { ...minute };
    norm.topicGroups = safe(norm.topicGroups).map((g) => ({
      ...g,
      topicsDiscussed: safe(g.topicsDiscussed),
      decisions: safe(g.decisions),
      pendingTasks: safe(g.pendingTasks)
    }));
    norm.topicsDiscussed = safe(norm.topicsDiscussed);
    norm.decisions = safe(norm.decisions);
    norm.pendingTasks = safe(norm.pendingTasks);
    norm.participants = safe(norm.participants);
    norm.occasionalParticipants = safe(norm.occasionalParticipants);
    norm.informedPersons = safe(norm.informedPersons);
    norm.tags = safe(norm.tags);
    norm.files = safe(norm.files);
    norm.projectIds = safe(norm.projectIds);
    norm.participantIds = safe(norm.participantIds);
    norm.externalMentions = safe(norm.externalMentions);
    return norm;
  };
  res.json(normalizeMinute(minute));
});

// DELETE minute
router.delete('/:id', async (req, res) => {
  // Eliminar tareas asociadas primero
  await prisma.task.deleteMany({ where: { minuteId: req.params.id } });
  await prisma.minute.delete({ where: { id: req.params.id } });
  res.json({ message: 'Minute and related tasks deleted' });
});

module.exports = router;
