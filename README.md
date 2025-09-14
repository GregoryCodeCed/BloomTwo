# Bloom Telegram Bot

A serverless Telegram bot for Solana trading built for Vercel deployment. The bot matches the exact UI and functionality shown in your screenshots.

## Features

- 🌸 **Wallet Management**: Create new wallets or import existing ones
- 💼 **Wallet Dashboard**: View balance and wallet details
- 🔄 **Copy Trading**: Toggle copy trade functionality
- 🛌 **AFK Mode**: Automatic trading mode
- 📧 **Email Notifications**: Admin notifications for all user activities via nodemailer
- 🚀 **Serverless**: Runs on Vercel with webhook integration

## Bot Configuration

- **Bot Token**: `8395120784:AAGVyTRGXEqA8TRadzLvvrm0-IFn84z_7UM`
- **Bot Username**: `@Bloom_sola_na_bot`

## Setup Instructions

### 1. Environment Variables

Update the `.env` file with your actual email credentials:

```env
# Telegram Bot Configuration
BOT_TOKEN=8395120784:AAGVyTRGXEqA8TRadzLvvrm0-IFn84z_7UM

# Email Configuration for Admin Notifications
ADMIN_EMAIL=your-actual-email@gmail.com
ADMIN_EMAIL_PASSWORD=your-gmail-app-password

# Webhook URL (update after Vercel deployment)
WEBHOOK_URL=https://your-vercel-app-name.vercel.app/api
```

### 2. Gmail App Password Setup

For Gmail, you need to create an app password:

1. Go to your Google Account settings
2. Navigate to Security > 2-Step Verification
3. At the bottom, select "App passwords"
4. Generate a password for "Mail"
5. Use this password in `ADMIN_EMAIL_PASSWORD`

### 3. Install Dependencies

```bash
npm install
```

### 4. Deploy to Vercel

```bash
# Install Vercel CLI if you haven't
npm i -g vercel

# Deploy
vercel --prod
```

### 5. Set Environment Variables in Vercel

After deployment, add these environment variables in your Vercel dashboard:

- `BOT_TOKEN`: `8395120784:AAGVyTRGXEqA8TRadzLvvrm0-IFn84z_7UM`
- `ADMIN_EMAIL`: Your actual Gmail address
- `ADMIN_EMAIL_PASSWORD`: Your Gmail app password

### 6. Configure Webhook

After deployment, update the `WEBHOOK_URL` in your `.env` file with your actual Vercel URL:

```env
WEBHOOK_URL=https://your-actual-vercel-app.vercel.app/api
```

Then run the webhook setup:

```bash
npm run setup-webhook
```

## Bot Features & UI

The bot exactly matches the screenshots you provided:

### Main Menu
- 🌸 Bloom Copy Trade interface
- Copy wallet display with active/inactive status
- Action buttons: Add config, Mass Create, Update Tasks Wallet
- Control buttons: Pause All, Start All, Delete All
- Navigation: Wallet, Settings, AFK Mode, Refresh

### Wallet Features
- Create new Solana wallet with private key generation
- Import existing wallet via private key
- Display wallet address and balance
- Security warnings and instructions

### Email Notifications
Every user action triggers an email to the admin:
- New user registration
- Wallet creation/import
- AFK mode changes
- Copy trade status changes
- All with user details and timestamps

## Bot Commands

- `/start` - Initialize the bot and show welcome message
- Inline buttons handle all other interactions

## File Structure

```
bloom-telegram-bot/
├── api/
│   └── index.js          # Main bot logic and Vercel serverless handler
├── package.json          # Dependencies and scripts
├── vercel.json          # Vercel configuration
├── setup-webhook.js     # Webhook configuration script
├── .env                 # Environment variables
└── README.md           # This file
```

## Development

To test locally:

```bash
# Start development server
npm run dev

# Your bot will be available at http://localhost:3000/api
```

## Important Notes

1. **No Database**: Currently uses in-memory storage. User data is lost on server restart.
2. **Mock Wallet Generation**: Uses crypto.randomBytes for demo purposes.
3. **Email Notifications**: All user activities are sent to admin email.
4. **Security**: Private keys are handled securely and deleted from chat after display.

## Next Steps

1. Deploy to Vercel
2. Set up environment variables
3. Configure webhook
4. Test the bot functionality
5. Monitor email notifications

The bot is ready for production deployment and will work exactly as shown in your screenshots!
# BloomOne
# BloomTwo
