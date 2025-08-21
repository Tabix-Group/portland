require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const app = express();
app.use(cors());
app.use(express.json());

// Import routes
const { authenticateToken } = require('./middleware/auth');
// Init mailer early so startup fails fast on config issues
const { initMailer } = require('./utils/mailer');
app.use('/api/users', require('./routes/users'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/minutes', require('./routes/minutes'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/attachments', require('./routes/attachments'));
app.use('/api/tags', require('./routes/tags'));
app.use('/api/templates', require('./routes/templates'));
app.use('/api/globalTopicGroups', require('./routes/globalTopicGroups'));
app.use('/api/users/change-password', authenticateToken, require('./routes/changePassword'));
app.use('/api/users', authenticateToken, require('./routes/adminChangePassword'));
app.use('/api/smtp-check', require('./routes/smtpCheck'));

const PORT = process.env.PORT || 3001;

(async () => {
  try {
    await initMailer();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to initialize mailer on startup:', err);
    process.exit(1);
  }
})();
