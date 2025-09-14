import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.ADMIN_EMAIL,
    pass: process.env.ADMIN_EMAIL_PASSWORD
  }
});

async function testEmail() {
  try {
    console.log('Testing email configuration...');
    console.log('From:', process.env.ADMIN_EMAIL);
    console.log('To:', process.env.RECEIVER_EMAIL);
    
    const result = await transporter.sendMail({
      from: process.env.ADMIN_EMAIL,
      to: process.env.RECEIVER_EMAIL,
      subject: '[Bloom Bot] Test Email - Bot Setup Complete',
      html: `
        <h2>🌸 Bloom Bot Email Test</h2>
        <p>This is a test email to confirm that your Bloom Telegram Bot email notifications are working correctly.</p>
        <p><strong>Sent at:</strong> ${new Date().toLocaleString()}</p>
        <p>If you receive this email, your bot is ready to send notifications!</p>
        <hr>
        <p><em>Bloom Telegram Bot - Serverless Trading Bot</em></p>
      `
    });

    console.log('✅ Email sent successfully!');
    console.log('Message ID:', result.messageId);
  } catch (error) {
    console.error('❌ Failed to send email:', error);
  }
}

testEmail();
