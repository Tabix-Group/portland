
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { authenticateToken, authorizeAdminOrOwner } = require('../middleware/auth');
const { sendMinuteNotification } = require('../utils/mailer');

// Shared helpers: ensure arrays and normalized minute shape for mailer
const safe = arr => Array.isArray(arr) ? arr : [];
async function normalizeMinuteForMailer(minute) {
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
  // Ensure createdBy contains a human-friendly value (may be id in DB)
  if (!norm.createdBy && norm.createdById) norm.createdBy = norm.createdById;
  return norm;
}

// GET tasks for a minute
router.get('/:id/tasks', async (req, res) => {
  const tasks = await prisma.task.findMany({ where: { minuteId: req.params.id } });
  res.json(tasks);
});

// GET all minutes (todos pueden ver)
router.get('/', authenticateToken, async (req, res) => {
  const minutes = await prisma.minute.findMany();
  // ...existing code...
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

// GET minute by id (todos pueden ver)
router.get('/:id', authenticateToken, async (req, res) => {
  const minute = await prisma.minute.findUnique({ where: { id: req.params.id } });
  // ...existing code...
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

// POST create minute (asigna creador)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { tasks, ...minuteData } = req.body;
    const minute = await prisma.minute.create({
      data: {
        ...minuteData,
        createdBy: { connect: { id: req.user.id } },
      },
    });
    if (Array.isArray(tasks)) {
      for (const task of tasks) {
        await prisma.task.create({ data: { ...task, minuteId: minute.id } });
      }
    }
    // Enviar notificación por mail en background sólo si la minuta quedó publicada
    try {
      const status = (minute?.status || '').toString().toLowerCase();
      if (status === 'published') {
        try {
          // Resolve creator name (if available) and normalize minute shape for mailer
          let creatorName = '';
          if (minute.createdById) {
            const user = await prisma.user.findUnique({ where: { id: minute.createdById }, select: { name: true } });
            creatorName = user?.name || '';
          }
          const minuteForMail = await normalizeMinuteForMailer({ ...minute, createdBy: creatorName || minute.createdBy });
          sendMinuteNotification({ minute: minuteForMail, prisma }).catch(err => console.error('Background mail error:', err));
        } catch (err) {
          console.error('Error preparing minute for mail:', err);
        }
      } else {
        console.log(`[MINUTES] Minute ${minute.id} created with status='${minute.status}' — skipping email`);
      }
    } catch (err) {
      console.error('Error iniciando envío de mail:', err);
    }
    // ...existing code...
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

// PUT update minute (solo admin o dueño y solo borrador para usuarios)
router.put('/:id', authenticateToken, async (req, res, next) => {
  const minute = await prisma.minute.findUnique({ where: { id: req.params.id } });
  if (req.user.role === 'ADMIN' || (minute?.createdById === req.user.id && minute?.status === 'draft')) {
    return next();
  }
  return res.status(403).json({ error: 'No autorizado' });
}, async (req, res) => {
  const { tasks, ...minuteData } = req.body;
  // fetch previous state to detect status transition
  const prev = await prisma.minute.findUnique({ where: { id: req.params.id } });
  const minute = await prisma.minute.update({ where: { id: req.params.id }, data: minuteData });
  await prisma.task.deleteMany({ where: { minuteId: req.params.id } });
  if (Array.isArray(tasks)) {
    for (const task of tasks) {
      await prisma.task.create({ data: { ...task, minuteId: req.params.id } });
    }
  }
  // If the minute transitioned from non-published -> published, send notifications
  try {
    const prevStatus = (prev?.status || '').toString().toLowerCase();
    const newStatus = (minute?.status || '').toString().toLowerCase();
    if (prevStatus !== 'published' && newStatus === 'published') {
      try {
        let creatorName = '';
        if (minute.createdById) {
          const user = await prisma.user.findUnique({ where: { id: minute.createdById }, select: { name: true } });
          creatorName = user?.name || '';
        }
        const minuteForMail = await normalizeMinuteForMailer({ ...minute, createdBy: creatorName || minute.createdBy });
        sendMinuteNotification({ minute: minuteForMail, prisma }).catch(err => console.error('Background mail error:', err));
      } catch (err) {
        console.error('Error preparing minute for mail on update:', err);
      }
    } else {
      console.log(`[MINUTES] Minute ${minute.id} updated status from='${prev?.status}' to='${minute?.status}' — skipping email`);
    }
  } catch (err) {
    console.error('Error iniciando envío de mail en update:', err);
  }
  // ...existing code...
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

// DELETE minute (solo admin o dueño)
router.delete('/:id', authenticateToken, authorizeAdminOrOwner(async req => {
  const minute = await prisma.minute.findUnique({ where: { id: req.params.id } });
  return minute?.createdById;
}), async (req, res) => {
  await prisma.task.deleteMany({ where: { minuteId: req.params.id } });
  await prisma.minute.delete({ where: { id: req.params.id } });
  res.json({ message: 'Minute and related tasks deleted' });
});

module.exports = router;
