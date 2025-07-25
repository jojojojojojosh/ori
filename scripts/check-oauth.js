#!/usr/bin/env node

/**
 * OAuth Configuration Checker
 * 
 * This script checks if OAuth is properly configured in the Supabase project.
 * It follows TDD principles by testing the actual OAuth endpoints and configuration.
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables manually
function loadEnvFile() {
  try {
    const envPath = path.join(__dirname, '..', '.env.local');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const envVars = {};
    
    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        envVars[key.trim()] = valueParts.join('=').trim();
      }
    });
    
    return envVars;
  } catch (error) {
    console.error('Error reading .env.local file:', error.message);
    return {};
  }
}

const envVars = loadEnvFile();

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  console.log('Please check your .env.local file contains:');
  console.log('- NEXT_PUBLIC_SUPABASE_URL');
  console.log('- NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkOAuthConfiguration() {
  console.log('🔍 Checking OAuth Configuration...\n');
  
  const results = {
    supabaseConnection: false,
    googleOAuthEndpoint: false,
    authProviders: false,
    redirectUrl: false
  };

  // Test 1: Check Supabase connection
  console.log('1. Testing Supabase connection...');
  try {
    const { data, error } = await supabase.auth.getSession();
    if (!error) {
      console.log('   ✅ Supabase client connected successfully');
      results.supabaseConnection = true;
    } else {
      console.log('   ❌ Supabase connection error:', error.message);
    }
  } catch (error) {
    console.log('   ❌ Supabase connection failed:', error.message);
  }

  // Test 2: Check OAuth endpoint availability
  console.log('\n2. Testing OAuth endpoint...');
  try {
    const oauthUrl = `${supabaseUrl}/auth/v1/authorize?provider=google`;
    const response = await fetch(oauthUrl, { method: 'HEAD' });
    
    if (response.status === 302 || response.status === 200) {
      console.log('   ✅ OAuth endpoint is accessible');
      results.googleOAuthEndpoint = true;
    } else {
      console.log(`   ❌ OAuth endpoint returned status: ${response.status}`);
    }
  } catch (error) {
    console.log('   ❌ OAuth endpoint test failed:', error.message);
  }

  // Test 3: Test OAuth initiation (without actual redirect)
  console.log('\n3. Testing OAuth initiation...');
  try {
    // This will attempt to initiate OAuth but won't actually redirect in Node.js
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'http://localhost:3000/project',
        skipBrowserRedirect: true // This prevents actual redirect in server environment
      }
    });

    if (data && data.url) {
      console.log('   ✅ OAuth initiation successful');
      console.log('   📍 OAuth URL generated:', data.url.substring(0, 100) + '...');
      results.authProviders = true;
      results.redirectUrl = true;
    } else if (error) {
      console.log('   ❌ OAuth initiation failed:', error.message);
      if (error.message.includes('provider')) {
        console.log('   💡 This usually means Google OAuth is not configured in Supabase Dashboard');
      }
    }
  } catch (error) {
    console.log('   ❌ OAuth test failed:', error.message);
  }

  // Summary
  console.log('\n📊 OAuth Configuration Summary:');
  console.log('================================');
  console.log(`Supabase Connection: ${results.supabaseConnection ? '✅' : '❌'}`);
  console.log(`OAuth Endpoint: ${results.googleOAuthEndpoint ? '✅' : '❌'}`);
  console.log(`Google Provider: ${results.authProviders ? '✅' : '❌'}`);
  console.log(`Redirect URL: ${results.redirectUrl ? '✅' : '❌'}`);
  
  const allPassed = Object.values(results).every(result => result);
  
  if (allPassed) {
    console.log('\n🎉 OAuth is properly configured and working!');
    console.log('\n📝 Next steps:');
    console.log('   1. Visit http://localhost:3000/test-oauth to test in browser');
    console.log('   2. Try logging in with Google OAuth');
  } else {
    console.log('\n⚠️  OAuth configuration issues detected.');
    console.log('\n🔧 Troubleshooting steps:');
    
    if (!results.authProviders) {
      console.log('   1. Go to your Supabase Dashboard > Authentication > Providers');
      console.log('   2. Enable Google provider');
      console.log('   3. Add your Google OAuth Client ID and Secret');
      console.log('   4. Set redirect URL to: https://your-project.supabase.co/auth/v1/callback');
    }
    
    if (!results.supabaseConnection) {
      console.log('   1. Check your .env.local file');
      console.log('   2. Verify Supabase URL and anon key are correct');
    }
  }
  
  return allPassed;
}

// Run the check
checkOAuthConfiguration()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('\n💥 Unexpected error:', error);
    process.exit(1);
  });