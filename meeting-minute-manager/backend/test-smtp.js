#!/usr/bin/env node

/**
 * Script to test SMTP connection locally before deploying
 * Usage: node test-smtp.js
 * 
 * Set these environment variables or edit them below:
 * - SMTP_HOST=smtp.titan.email
 * - SMTP_PORT=587
 * - SMTP_SECURE=false
 * - SMTP_USER=noreply@memmo.ai
 * - SMTP_PASS=your_app_password_here
 */

const nodemailer = require('nodemailer');

// Configuration - edit these values or use environment variables
const config = {
  host: process.env.SMTP_HOST || 'smtp.titan.email',
  port: Number(process.env.SMTP_PORT || 587),
  secure: (process.env.SMTP_SECURE || 'false') === 'true',
  auth: {
    user: process.env.SMTP_USER || 'noreply@memmo.ai',
    pass: process.env.SMTP_PASS || 'YOUR_PASSWORD_HERE', // Replace with actual password
  },
};

async function testSMTP() {
  console.log('🧪 Testing SMTP configuration...');
  console.log('📧 Config:', {
    host: config.host,
    port: config.port,
    secure: config.secure,
    user: config.auth.user,
    pass: config.auth.pass ? '***hidden***' : '❌ NOT SET'
  });

  if (!config.auth.pass || config.auth.pass === 'YOUR_PASSWORD_HERE') {
    console.error('❌ Please set SMTP_PASS environment variable or edit this script');
    process.exit(1);
  }

  const transporter = nodemailer.createTransporter({
    ...config,
    logger: true,
    debug: true,
    connectionTimeout: 20000,
    greetingTimeout: 20000,
    socketTimeout: 20000,
    tls: { rejectUnauthorized: false }
  });

  try {
    console.log('\n🔍 Step 1: Testing connection...');
    await transporter.verify();
    console.log('✅ SMTP connection successful!');

    console.log('\n📤 Step 2: Sending test email...');
    const testEmail = {
      from: config.auth.user,
      to: config.auth.user, // Send to self for testing
      subject: '✅ SMTP Test - ' + new Date().toLocaleString(),
      html: `
        <h2>SMTP Test Successful!</h2>
        <p>This email was sent from your backend using the SMTP configuration:</p>
        <ul>
          <li><strong>Host:</strong> ${config.host}</li>
          <li><strong>Port:</strong> ${config.port}</li>
          <li><strong>Secure:</strong> ${config.secure}</li>
          <li><strong>User:</strong> ${config.auth.user}</li>
        </ul>
        <p>Time: ${new Date().toISOString()}</p>
      `
    };

    const info = await transporter.sendMail(testEmail);
    console.log('✅ Test email sent successfully!');
    console.log('📧 Message ID:', info.messageId);
    console.log('📧 Accepted:', info.accepted);
    console.log('📧 Rejected:', info.rejected);

  } catch (error) {
    console.error('❌ SMTP test failed:', {
      code: error.code,
      response: error.response,
      message: error.message
    });

    if (error.code === 'EAUTH') {
      console.error('\n🔑 Authentication Error - Possible solutions:');
      console.error('1. Check that SMTP_USER is the full email: noreply@memmo.ai');
      console.error('2. Use an app-specific password instead of your regular password');
      console.error('3. Enable SMTP in your Titan/GoDaddy email settings');
      console.error('4. If you have 2FA, generate an app password');
      console.error('5. Check if your account is locked in the email provider');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('\n🌐 Connection Timeout - Possible solutions:');
      console.error('1. Try port 465 with secure: true');
      console.error('2. Check if your firewall blocks SMTP ports');
      console.error('3. Verify SMTP_HOST is correct: smtp.titan.email');
    }

    process.exit(1);
  } finally {
    transporter.close?.();
  }

  console.log('\n🎉 All tests passed! Your SMTP configuration is working.');
}

testSMTP();
