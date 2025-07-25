#!/usr/bin/env node

/**
 * OAuth Configuration Diagnostic Script
 * 
 * This script helps diagnose OAuth redirect issues by checking:
 * 1. Environment variables
 * 2. Expected vs actual redirect URLs
 * 3. Supabase configuration
 */

const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
function loadEnvFile() {
  const envPath = path.join(__dirname, '..', '.env.local');
  const env = {};
  
  try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        env[key.trim()] = valueParts.join('=').trim();
      }
    });
  } catch (error) {
    console.warn('⚠️  Could not read .env.local file');
  }
  
  return env;
}

const envVars = loadEnvFile();

const config = {
  supabaseUrl: envVars.NEXT_PUBLIC_SUPABASE_URL,
  supabaseAnonKey: envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  siteUrl: envVars.NEXT_PUBLIC_SITE_URL,
};

console.log('🔍 OAuth Configuration Diagnostic');
console.log('================================\n');

// Check environment variables
console.log('📋 Environment Variables:');
console.log(`NEXT_PUBLIC_SUPABASE_URL: ${config.supabaseUrl}`);
console.log(`NEXT_PUBLIC_SUPABASE_ANON_KEY: ${config.supabaseAnonKey ? '[SET]' : '[NOT SET]'}`);
console.log(`NEXT_PUBLIC_SITE_URL: ${config.siteUrl}`);
console.log();

// Extract project reference from Supabase URL
const projectRef = config.supabaseUrl ? config.supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1] : null;

if (!projectRef) {
  console.error('❌ Could not extract project reference from Supabase URL');
  process.exit(1);
}

console.log(`📊 Project Reference: ${projectRef}`);
console.log();

// Expected configurations
const expectedConfig = {
  googleRedirectUri: `${config.supabaseUrl}/auth/v1/callback`,
  appCallbackUrl: `${config.siteUrl}/auth/callback`,
  finalRedirectUrl: `${config.siteUrl}/project`,
};

console.log('✅ Expected Configuration:');
console.log(`Google OAuth Redirect URI: ${expectedConfig.googleRedirectUri}`);
console.log(`App Callback URL: ${expectedConfig.appCallbackUrl}`);
console.log(`Final Redirect URL: ${expectedConfig.finalRedirectUrl}`);
console.log();

// Common issues
console.log('🚨 Common Issues to Check:');
console.log('1. Google OAuth App Redirect URI should be:');
console.log(`   ${expectedConfig.googleRedirectUri}`);
console.log('2. NOT your app domain like:');
console.log(`   ${config.siteUrl} ❌`);
console.log(`   ${config.supabaseUrl}/${config.siteUrl?.replace('https://', '')} ❌`);
console.log();

// Test OAuth configuration
console.log('🔗 OAuth Flow Analysis:');
const redirectTo = `${config.siteUrl}/auth/callback?next=/project`;
console.log(`Expected redirect URL: ${redirectTo}`);
console.log();

// Validation
const issues = [];

if (!config.supabaseUrl) {
  issues.push('❌ NEXT_PUBLIC_SUPABASE_URL is not set');
}

if (!config.supabaseAnonKey) {
  issues.push('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY is not set');
}

if (!config.siteUrl) {
  issues.push('❌ NEXT_PUBLIC_SITE_URL is not set');
}

if (config.siteUrl && !config.siteUrl.startsWith('https://')) {
  issues.push('⚠️  NEXT_PUBLIC_SITE_URL should use HTTPS in production');
}

if (issues.length > 0) {
  console.log('🚨 Configuration Issues Found:');
  issues.forEach(issue => console.log(`  ${issue}`));
  console.log();
} else {
  console.log('✅ Environment variables look correct.');
  console.log();
}

console.log('📋 Current Issue Analysis:');
console.log('The redirect URL in your error message shows:');
console.log('https://auxpuxoqfuyoqqbylvon.supabase.co/ori-seven.vercel.app');
console.log();
console.log('This suggests the Google OAuth app redirect URI is incorrectly set to:');
console.log('❌ https://auxpuxoqfuyoqqbylvon.supabase.co/ori-seven.vercel.app');
console.log();
console.log('It should be set to:');
console.log(`✅ ${expectedConfig.googleRedirectUri}`);
console.log()

console.log('\n🔧 Next Steps:');
console.log('1. Review the OAUTH_FIX_GUIDE.md file');
console.log('2. Update Google OAuth app configuration');
console.log('3. Verify Supabase dashboard settings');
console.log('4. Test the login flow again');