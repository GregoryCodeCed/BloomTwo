# Quick Deployment Guide

## 🚀 Deploy Your Bloom Telegram Bot

### Step 1: Prepare Environment Variables

Your email credentials are already configured:
- **Sending Email**: riwandall50@gmail.com
- **App Password**: wnwsmfdnstfdumqd  
- **Receiver Email**: fredrickbolutife@gmail.com

The `.env` file is already set up with these credentials.

### Step 1: Test Email Configuration

First, let's test that your email notifications are working:

```bash
npm run test-email
```

If successful, you should see "✅ Email sent successfully!" and fredrickbolutife@gmail.com should receive a test email.

### Step 2: Deploy to Vercel

### Step 2: Deploy to Vercel

```bash
# Install Vercel CLI (if not installed)
npm i -g vercel

# Deploy
vercel --prod
```

### Step 3: Set Vercel Environment Variables

Your bot deployed successfully! Now add environment variables:

1. Go to your Vercel dashboard: https://vercel.com/fredabods-projects/bloom
2. Go to Settings → Environment Variables
3. Add these variables one by one:

- **Variable Name**: `BOT_TOKEN`  
  **Value**: `8395120784:AAGVyTRGXEqA8TRadzLvvrm0-IFn84z_7UM`

- **Variable Name**: `ADMIN_EMAIL`  
  **Value**: `riwandall50@gmail.com`

- **Variable Name**: `ADMIN_EMAIL_PASSWORD`  
  **Value**: `wnwsmfdnstfdumqd`

- **Variable Name**: `RECEIVER_EMAIL`  
  **Value**: `fredrickbolutife@gmail.com`

4. After adding all variables, redeploy:
   ```bash
   vercel --prod
   ```

### Step 4: Configure Webhook

Your bot is deployed at: `https://bloom-f5a278vf8-fredabods-projects.vercel.app`

1. Update `.env` with your actual Vercel URL:
   ```env
   WEBHOOK_URL=https://bloom-f5a278vf8-fredabods-projects.vercel.app/api
   ```

2. Run webhook setup:
   ```bash
   npm run setup-webhook
   ```

### Step 5: Test Your Bot

1. Open Telegram and search for `@Bloom_sola_na_bot`
2. Send `/start` command
3. Test wallet creation and other features
4. Check your email for admin notifications

## ✅ That's it! Your bot is now live and functional!

## 📧 Email Notifications

You'll receive emails for:
- New users starting the bot
- Wallet creation/import
- AFK mode changes
- Copy trade status changes

## 🔧 Troubleshooting

- **Bot not responding**: Check webhook URL and Vercel deployment
- **No emails**: Verify Gmail app password and SMTP settings
- **Webhook errors**: Run `npm run setup-webhook` again
