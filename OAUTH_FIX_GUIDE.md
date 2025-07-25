# OAuth Redirect Issue Fix Guide

## Problem Description

Users are being redirected to a Supabase URL instead of the application's callback route after Google OAuth login:

```
https://auxpuxoqfuyoqqbylvon.supabase.co/ori-seven.vercel.app#access_token=...
```

This results in the error: `{"error":"requested path is invalid"}`

## Root Cause

The issue occurs because the **Google OAuth application's redirect URI** is incorrectly configured. Instead of pointing to your application's callback route, it's pointing to the Supabase domain.

## Solution

### Step 1: Fix Google OAuth Configuration

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** > **Credentials**
3. Find your OAuth 2.0 Client ID for this project
4. Click **Edit** on the OAuth client
5. In the **Authorized redirect URIs** section, ensure you have:
   ```
   https://auxpuxoqfuyoqqbylvon.supabase.co/auth/v1/callback
   ```
   **NOT:**
   ```
   https://auxpuxoqfuyoqqbylvon.supabase.co/ori-seven.vercel.app
   ```

### Step 2: Verify Supabase Configuration

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Navigate to **Authentication** > **Providers**
3. Click on **Google**
4. Ensure the **Site URL** is set to: `https://ori-seven.vercel.app`
5. Ensure **Redirect URLs** includes: `https://ori-seven.vercel.app/**`

### Step 3: Verify Application Configuration

Ensure your `.env.local` file has the correct site URL:
```env
NEXT_PUBLIC_SITE_URL=https://ori-seven.vercel.app
```

## How OAuth Should Work

1. User clicks "Sign in with Google"
2. Application redirects to Google with callback URL: `https://auxpuxoqfuyoqqbylvon.supabase.co/auth/v1/callback`
3. Google redirects back to Supabase with authorization code
4. Supabase processes the OAuth callback and redirects to your app: `https://ori-seven.vercel.app/auth/callback?next=/project`
5. Your app's callback route handles the session and redirects to `/project`

## Testing the Fix

1. Clear your browser cache and cookies
2. Try logging in with Google again
3. You should be redirected to: `https://ori-seven.vercel.app/auth/callback?next=/project`
4. Then automatically redirected to: `https://ori-seven.vercel.app/project`

## Common Mistakes

- ❌ Setting Google redirect URI to your app domain
- ❌ Setting Google redirect URI to `https://supabase.co/your-app-domain`
- ✅ Setting Google redirect URI to `https://your-project.supabase.co/auth/v1/callback`

## Additional Resources

- [Supabase Google OAuth Documentation](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Google OAuth 2.0 Setup](https://developers.google.com/identity/protocols/oauth2)