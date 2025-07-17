const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET all file attachments
router.get('/', async (req, res) => {
  const attachments = await prisma.fileAttachment.findMany();
  res.json(attachments);
});

// GET file attachment by id
router.get('/:id', async (req, res) => {
  const attachment = await prisma.fileAttachment.findUnique({ where: { id: req.params.id } });
  res.json(attachment);
});

// POST create file attachment
router.post('/', async (req, res) => {
  const attachment = await prisma.fileAttachment.create({ data: req.body });
  res.json(attachment);
});

// PUT update file attachment
router.put('/:id', async (req, res) => {
  const attachment = await prisma.fileAttachment.update({ where: { id: req.params.id }, data: req.body });
  res.json(attachment);
});

// DELETE file attachment
router.delete('/:id', async (req, res) => {
  await prisma.fileAttachment.delete({ where: { id: req.params.id } });
  res.json({ message: 'File attachment deleted' });
});

module.exports = router;
