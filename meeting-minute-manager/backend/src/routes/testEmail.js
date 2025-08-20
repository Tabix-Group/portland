const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { sendMinuteNotification } = require('../utils/mailer');

// POST /api/test-email
router.post('/', async (req, res) => {
  try {
    // construit a minimal fake minute to test mail
    const minute = {
      id: 'test-' + Date.now(),
      title: 'Prueba de email desde backend',
      meetingDate: new Date().toISOString().split('T')[0],
      meetingTime: new Date().toISOString().split('T')[1].split('.')[0],
      createdBy: 'Sistema',
      topicsDiscussed: [{ text: 'Tema de prueba' }],
      decisions: [{ text: 'Decisión de prueba' }],
      pendingTasks: [{ text: 'Tarea de prueba', dueDate: null }],
      participantIds: [],
      occasionalParticipants: Array.isArray(req.body.recipients) ? req.body.recipients.map(r => ({ email: r })) : [],
      informedPersons: [],
    };

    // send mail (background)
    sendMinuteNotification({ minute, prisma }).catch(err => console.error('Test mail error:', err));

    res.json({ message: 'Test email triggered' });
  } catch (err) {
    console.error('Error in test-email route', err);
    res.status(500).json({ error: 'Error interno' });
  }
});

module.exports = router;
