const nodemailer = require('nodemailer');

// Create transporter with improved config and fallback support
function createTransporter(port = null, secure = null) {
  const config = {
    host: process.env.SMTP_HOST,
    port: port || Number(process.env.SMTP_PORT || 587),
    secure: secure !== null ? secure : (process.env.SMTP_SECURE === 'true'),
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    logger: true,
    debug: true,
    // Increased timeouts for better reliability
    connectionTimeout: 30000, // 30s
    greetingTimeout: 30000,   // 30s
    socketTimeout: 30000,     // 30s
    tls: {
      rejectUnauthorized: false,
    },
  };

  console.log(`[MAILER] Creating transporter: ${config.host}:${config.port} (secure: ${config.secure}) user: ${config.auth.user}`);
  return nodemailer.createTransport(config);
}

// Try multiple configurations if the first one fails
async function createVerifiedTransporter() {
  const configs = [
    { port: 587, secure: false, name: 'STARTTLS (587)' },
    { port: 465, secure: true, name: 'TLS (465)' }
  ];

  for (const { port, secure, name } of configs) {
    console.log(`[MAILER] 🔄 Trying ${name}...`);
    const testTransporter = createTransporter(port, secure);

    try {
      await testTransporter.verify();
      console.log(`[MAILER] ✅ Success with ${name} - using this configuration`);
      return testTransporter;
    } catch (err) {
      console.log(`[MAILER] ❌ Failed with ${name}:`, err.code || err.message);
      testTransporter.close?.();
    }
  }

  // If all configs fail, return the default one with detailed error info
  console.error('[MAILER] ⚠️  All SMTP configurations failed, using default config');
  return createTransporter();
}

// Initialize transporter with fallback
let transporter;
async function initMailer() {
  transporter = await createVerifiedTransporter();
  return transporter;
}

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

function _renderText(item) {
  if (!item && item !== 0) return '';
  if (typeof item === 'string' || typeof item === 'number') return `${item}`;
  if (typeof item === 'object') {
    // Try multiple properties that could contain the display text
    return item.text || item.title || item.description || item.content ||
      (item.mentions && Array.isArray(item.mentions) ? item.mentions.map(m => m.text || m).join(', ') : '') ||
      JSON.stringify(item);
  }
  return `${item}`;
}

function buildMinuteHtml({ minute, appUrl }) {
  // Build the correct URL for the minute view
  const base = appUrl ? appUrl.replace(/\/+$/, '') : '';
  // Use the format that matches your frontend routing
  const minuteUrl = base ? `${base}/#/minutes/${minute.id}` : `/#/minutes/${minute.id}`;

  return `
    <div style="font-family: Arial, Helvetica, sans-serif; color: #111">
      <h2>Minuta: ${_renderText(minute.title) || 'Sin título'}</h2>
      <p><strong>Fecha:</strong> ${_renderText(minute.meetingDate)} ${_renderText(minute.meetingTime)}</p>
      <p><strong>Creada por:</strong> ${_renderText(minute.createdBy)}</p>
      <p><a href="${minuteUrl}">Ver minuta completa</a></p>
      <h3>Temas</h3>
      <ul>
        ${safeArr(minute.topicsDiscussed).map(t => `<li>${_renderText(t)}</li>`).join('')}
      </ul>
      <h3>Decisiones</h3>
      <ul>
        ${safeArr(minute.decisions).map(d => `<li>${_renderText(d)}</li>`).join('')}
      </ul>
      <h3>Tareas</h3>
      <ul>
        ${safeArr(minute.pendingTasks).map(ts => `<li>${_renderText(ts)} ${ts?.dueDate ? `- Fecha: ${_renderText(ts.dueDate)}` : ''}</li>`).join('')}
      </ul>
    </div>
  `;
}

async function sendMinuteNotification({ minute, prisma }) {
  console.log(`[MAILER] Starting notification for minute ${minute.id}: "${minute.title}"`);
  console.log(`[MAILER] Minute data structure:`, {
    topicsDiscussed: minute.topicsDiscussed?.slice(0, 1), // Log first item to see structure
    decisions: minute.decisions?.slice(0, 1),
    pendingTasks: minute.pendingTasks?.slice(0, 1)
  });

  // Ensure transporter is initialized
  if (!transporter) {
    console.error('[MAILER] ❌ Transporter not initialized, creating fallback...');
    transporter = createTransporter();
  }

  try {
    const to = await gatherRecipientEmails({ minute, prisma });
    if (!to || !to.length) {
      console.log(`[MAILER] ⚠️  No recipients found for minute ${minute.id}`);
      return { success: false, reason: 'No recipients' };
    }

    console.log(`[MAILER] 📧 Sending to ${to.length} recipients:`, to);

    const appUrl = process.env.APP_URL || '';
    const html = buildMinuteHtml({ minute, appUrl });

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.SMTP_USER,
      to: to.join(','),
      subject: `Minuta: ${minute.title || 'Nueva minuta'}`,
      html,
    };

    console.log(`[MAILER] 📤 Sending mail from: ${mailOptions.from}`);

    const info = await transporter.sendMail(mailOptions);

    console.log(`[MAILER] ✅ Email sent successfully!`, {
      messageId: info.messageId,
      recipients: to.length,
      accepted: info.accepted?.length || 0,
      rejected: info.rejected?.length || 0
    });

    return { success: true, messageId: info.messageId, recipients: to };

  } catch (err) {
    console.error(`[MAILER] ❌ Failed to send notification for minute ${minute.id}:`, {
      code: err.code,
      response: err.response,
      message: err.message,
      stack: err.stack
    });

    // Provide specific guidance based on error type
    if (err.code === 'EAUTH') {
      console.error('[MAILER] 🔑 Authentication failed - check your Office365 / Exchange credentials and mailbox settings:');
      console.error('  - SMTP_USER should be the full mailbox: noreply@memmo.ai');
      console.error('  - SMTP_PASS should be the mailbox password (or app password if your tenant requires it)');
      console.error('  - Ensure SMTP AUTH is enabled for this mailbox in Exchange settings');
      console.error('  - If your tenant blocks basic auth, consider using Microsoft Graph API (OAuth) or a transactional provider');
      console.error('  - Try logging into webmail to ensure account is not locked');
    }

    return { success: false, error: err.message, code: err.code };
  }
}

// Export additional utilities for testing
module.exports = {
  initMailer,
  sendMinuteNotification,
  createTransporter,  // for testing different configs
  gatherRecipientEmails  // for testing recipient gathering
};
