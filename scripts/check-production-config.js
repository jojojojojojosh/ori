#!/usr/bin/env node

/**
 * Production Configuration Checker
 * 
 * This script helps identify common production deployment issues,
 * particularly the localhost redirect problem.
 */

const fs = require('fs')
const path = require('path')

function checkProductionConfig() {
  console.log('🔍 Checking production configuration...\n')
  
  // Check if .env.local exists and contains localhost
  const envLocalPath = path.join(process.cwd(), '.env.local')
  if (fs.existsSync(envLocalPath)) {
    const envContent = fs.readFileSync(envLocalPath, 'utf8')
    
    if (envContent.includes('NEXT_PUBLIC_SITE_URL=http://localhost')) {
      console.log('❌ CRITICAL ISSUE FOUND:')
      console.log('   NEXT_PUBLIC_SITE_URL is set to localhost in .env.local')
      console.log('   This will cause OAuth redirects to localhost in production!\n')
      console.log('💡 SOLUTION:')
      console.log('   Set NEXT_PUBLIC_SITE_URL=https://yourdomain.com in your production environment')
      console.log('   Do NOT set it to localhost in production!\n')
      return false
    }
    
    if (envContent.includes('NEXT_PUBLIC_SITE_URL=') && !envContent.includes('NEXT_PUBLIC_SITE_URL=\n')) {
      const siteUrlMatch = envContent.match(/NEXT_PUBLIC_SITE_URL=(.+)/)
      if (siteUrlMatch) {
        console.log('✅ NEXT_PUBLIC_SITE_URL is configured:', siteUrlMatch[1])
      }
    } else {
      console.log('ℹ️  NEXT_PUBLIC_SITE_URL is empty (OK for development)')
    }
  }
  
  console.log('\n📋 Production Deployment Checklist:')
  console.log('   □ Set NEXT_PUBLIC_SITE_URL to your production domain')
  console.log('   □ Update Supabase Site URL in dashboard')
  console.log('   □ Configure OAuth redirect URLs in Supabase')
  console.log('   □ Verify /auth/callback route exists')
  
  return true
}

if (require.main === module) {
  checkProductionConfig()
}

module.exports = { checkProductionConfig }