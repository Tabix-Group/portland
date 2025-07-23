require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const app = express();
app.use(cors());
app.use(express.json());

// Import routes
app.use('/api/users', require('./routes/users'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/minutes', require('./routes/minutes'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/attachments', require('./routes/attachments'));
app.use('/api/tags', require('./routes/tags'));
app.use('/api/templates', require('./routes/templates'));
app.use('/api/globalTopicGroups', require('./routes/globalTopicGroups'));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
