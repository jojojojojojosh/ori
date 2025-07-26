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
  
  let hasIssues = false
  
  // Check if .env.local exists and contains active localhost URL
  const envLocalPath = path.join(process.cwd(), '.env.local')
  if (fs.existsSync(envLocalPath)) {
    const envContent = fs.readFileSync(envLocalPath, 'utf8')
    
    // Check for uncommented localhost URL (this would be problematic)
    const uncommentedLocalhostMatch = envContent.match(/^NEXT_PUBLIC_SITE_URL=http:\/\/localhost/m)
    const commentedLocalhostMatch = envContent.match(/^# NEXT_PUBLIC_SITE_URL=http:\/\/localhost/m)
    
    if (uncommentedLocalhostMatch) {
      console.log('❌ CRITICAL ISSUE FOUND:')
      console.log('   NEXT_PUBLIC_SITE_URL is set to localhost in .env.local')
      console.log('   This will cause OAuth redirects to localhost in production!\n')
      hasIssues = true
    } else if (commentedLocalhostMatch) {
      console.log('✅ .env.local: localhost URL is properly commented out')
    }
    
    // Check for any active NEXT_PUBLIC_SITE_URL in .env.local
    const siteUrlMatch = envContent.match(/^NEXT_PUBLIC_SITE_URL=(.+)$/m)
    if (siteUrlMatch) {
      console.log('ℹ️  .env.local NEXT_PUBLIC_SITE_URL:', siteUrlMatch[1])
    }
  }
  
  // Check if .env.production exists with correct configuration
  const envProdPath = path.join(process.cwd(), '.env.production')
  if (fs.existsSync(envProdPath)) {
    const envProdContent = fs.readFileSync(envProdPath, 'utf8')
    const prodSiteUrlMatch = envProdContent.match(/^NEXT_PUBLIC_SITE_URL=(.+)$/m)
    
    if (prodSiteUrlMatch) {
      const prodUrl = prodSiteUrlMatch[1]
      console.log('✅ .env.production NEXT_PUBLIC_SITE_URL:', prodUrl)
      
      if (prodUrl.includes('localhost')) {
        console.log('❌ Production environment should not use localhost!')
        hasIssues = true
      } else if (prodUrl.startsWith('https://')) {
        console.log('✅ Production URL uses HTTPS')
      } else {
        console.log('⚠️  Production URL should use HTTPS')
      }
    } else {
      console.log('⚠️  .env.production exists but no NEXT_PUBLIC_SITE_URL found')
    }
  } else {
    console.log('ℹ️  No .env.production file found')
  }
  
  if (hasIssues) {
    console.log('\n💡 SOLUTION:')
    console.log('   1. Comment out NEXT_PUBLIC_SITE_URL in .env.local')
    console.log('   2. Set correct production URL in .env.production')
    console.log('   3. Configure deployment platform environment variables')
    console.log('   4. Update Supabase OAuth redirect URLs')
  }
  
  console.log('\n📋 Production Deployment Checklist:')
  console.log('   □ Set NEXT_PUBLIC_SITE_URL to your production domain')
  console.log('   □ Update Supabase Site URL in dashboard')
  console.log('   □ Configure OAuth redirect URLs in Supabase')
  console.log('   □ Verify /auth/callback route exists')
  
  return !hasIssues
}

if (require.main === module) {
  checkProductionConfig()
}

module.exports = { checkProductionConfig }