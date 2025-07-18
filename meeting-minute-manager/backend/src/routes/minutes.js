const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

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
  const minute = await prisma.minuteItem.findUnique({ where: { id: req.params.id } });
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
    const minute = await prisma.minute.create({ data: req.body });
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

// PUT update minute item
router.put('/:id', async (req, res) => {
  const minute = await prisma.minuteItem.update({ where: { id: req.params.id }, data: req.body });
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

// DELETE minute item
router.delete('/:id', async (req, res) => {
  await prisma.minuteItem.delete({ where: { id: req.params.id } });
  res.json({ message: 'Minute item deleted' });
});

module.exports = router;
