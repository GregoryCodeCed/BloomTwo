// Test script to verify real Solana wallet generation
import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';

// Function to generate real Solana wallet
function generateSolanaWallet() {
  const keypair = Keypair.generate();
  return {
    publicKey: keypair.publicKey.toString(),
    secretKey: bs58.encode(keypair.secretKey)
  };
}

// Function to import wallet from private key
function importSolanaWallet(privateKeyString) {
  try {
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

console.log('🔧 Testing Solana Wallet Generation...\n');

// Test 1: Generate new wallet
console.log('Test 1: Generating new Solana wallet...');
const newWallet = generateSolanaWallet();
console.log('✅ Wallet generated successfully!');
console.log('Public Key (Address):', newWallet.publicKey);
console.log('Private Key:', newWallet.secretKey);
console.log('Address Length:', newWallet.publicKey.length);
console.log('Is valid Solana address format:', /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(newWallet.publicKey));

console.log('\n' + '='.repeat(50) + '\n');

// Test 2: Import wallet from private key
console.log('Test 2: Testing wallet import...');
const importedWallet = importSolanaWallet(newWallet.secretKey);
if (importedWallet) {
  console.log('✅ Wallet imported successfully!');
  console.log('Imported Public Key:', importedWallet.publicKey);
  console.log('Keys match:', newWallet.publicKey === importedWallet.publicKey);
} else {
  console.log('❌ Wallet import failed!');
}

console.log('\n' + '='.repeat(50) + '\n');

// Test 3: Test invalid private key
console.log('Test 3: Testing invalid private key handling...');
const invalidImport = importSolanaWallet('invalid_key_123');
if (invalidImport === null) {
  console.log('✅ Invalid key properly rejected!');
} else {
  console.log('❌ Invalid key should have been rejected!');
}

console.log('\n🎉 All tests completed!');
console.log('\n📋 Summary:');
console.log('- Generated wallets are real Solana addresses');
console.log('- Addresses follow proper Solana format (base58, 32-44 chars)');
console.log('- Private keys can be used to restore wallets');
console.log('- Invalid keys are properly rejected');
console.log('\n💰 These addresses can receive real SOL on Solana mainnet!');
