import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const BOT_TOKEN = process.env.BOT_TOKEN;
const WEBHOOK_URL = process.env.WEBHOOK_URL;

async function setWebhook() {
  try {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: WEBHOOK_URL
      })
    });

    const result = await response.json();
    console.log('Webhook setup result:', result);
    
    if (result.ok) {
      console.log('✅ Webhook set successfully!');
    } else {
      console.log('❌ Failed to set webhook:', result.description);
    }
  } catch (error) {
    console.error('Error setting webhook:', error);
  }
}

async function getWebhookInfo() {
  try {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo`;
    const response = await fetch(url);
    const result = await response.json();
    
    console.log('Current webhook info:', result);
  } catch (error) {
    console.error('Error getting webhook info:', error);
  }
}

// Check if webhook URL is provided
if (!WEBHOOK_URL || WEBHOOK_URL.includes('your-vercel-app')) {
  console.log('❌ Please update WEBHOOK_URL in .env file with your actual Vercel deployment URL');
  console.log('Example: WEBHOOK_URL=https://your-app-name.vercel.app/api');
  process.exit(1);
}

console.log('Setting up webhook...');
await setWebhook();
console.log('\nGetting webhook info...');
await getWebhookInfo();
