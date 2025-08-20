const nodemailer = require('nodemailer');

// Configura el transporter usando variables de entorno.
// IMPORTANT: no subas tus credenciales a git. Usa .env en el servidor.
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

function safeArr(arr) {
  return Array.isArray(arr) ? arr : [];
}

async function gatherRecipientEmails({ minute, prisma }) {
  const emails = new Set();

  // participantIds -> buscar usuarios con email
  if (Array.isArray(minute.participantIds) && minute.participantIds.length && prisma) {
    try {
      const users = await prisma.user.findMany({ where: { id: { in: minute.participantIds } }, select: { email: true } });
      users.forEach(u => { if (u?.email) emails.add(u.email); });
    } catch (err) {
      console.error('Error fetching users for email recipients', err);
    }
  }

  // ocasionales
  safeArr(minute.occasionalParticipants).forEach(p => { if (p?.email) emails.add(p.email); });

  // informados
  safeArr(minute.informedPersons).forEach(p => { if (p?.email) emails.add(p.email); });

  return Array.from(emails);
}

function buildMinuteHtml({ minute, appUrl }) {
  const minuteUrl = appUrl ? `${appUrl.replace(/\/+$/, '')}/minutes/${minute.id}` : `#/minutes/${minute.id}`;

  return `
    <div style="font-family: Arial, Helvetica, sans-serif; color: #111">
      <h2>Minuta: ${minute.title || 'Sin título'}</h2>
      <p><strong>Fecha:</strong> ${minute.meetingDate || ''} ${minute.meetingTime || ''}</p>
      <p><strong>Creada por:</strong> ${minute.createdBy || ''}</p>
      <p><a href="${minuteUrl}">Ver minuta completa</a></p>
      <h3>Temas</h3>
      <ul>
        ${safeArr(minute.topicsDiscussed).map(t => `<li>${t?.text || t}</li>`).join('')}
      </ul>
      <h3>Decisiones</h3>
      <ul>
        ${safeArr(minute.decisions).map(d => `<li>${d?.text || d}</li>`).join('')}
      </ul>
      <h3>Tareas</h3>
      <ul>
        ${safeArr(minute.pendingTasks).map(ts => `<li>${ts?.text || ts} ${ts?.dueDate ? `- Fecha: ${ts.dueDate}` : ''}</li>`).join('')}
      </ul>
    </div>
  `;
}

async function sendMinuteNotification({ minute, prisma }) {
  try {
    const to = await gatherRecipientEmails({ minute, prisma });
    if (!to || !to.length) {
      console.log('No recipients for minute', minute.id);
      return;
    }

    const appUrl = process.env.APP_URL || '';
    const html = buildMinuteHtml({ minute, appUrl });

    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.SMTP_USER,
      to: to.join(','),
      subject: `Minuta: ${minute.title || 'Nueva minuta'}`,
      html,
    });

    console.log('Minute notification sent:', info.messageId, 'to', to);
  } catch (err) {
    console.error('Error sending minute notification', err);
  }
}

module.exports = { sendMinuteNotification };
