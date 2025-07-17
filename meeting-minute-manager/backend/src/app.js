require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const app = express();
app.use(cors());
app.use(express.json());

// Import routes
app.use('/users', require('./routes/users'));
app.use('/projects', require('./routes/projects'));
app.use('/minutes', require('./routes/minutes'));
app.use('/tasks', require('./routes/tasks'));
app.use('/attachments', require('./routes/attachments'));
app.use('/tags', require('./routes/tags'));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
