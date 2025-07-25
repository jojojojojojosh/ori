# Supabase Authentication Setup

This guide will help you set up Supabase authentication for your application.

## Prerequisites

1. A Supabase account (sign up at [supabase.com](https://supabase.com))
2. A new Supabase project created

## Setup Steps

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Choose your organization
4. Enter a project name and database password
5. Select a region close to your users
6. Click "Create new project"

### 2. Get Your Project Credentials

1. In your Supabase dashboard, go to **Settings** > **API**
2. Copy the following values:
   - **Project URL** (under "Project URL")
   - **Anon public key** (under "Project API keys")

### 3. Configure Environment Variables

1. Open the `.env.local` file in your project root
2. Replace the placeholder values with your actual Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_actual_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_supabase_anon_key
```

### 4. Set Up Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Copy the contents of `supabase-setup.sql` from your project
3. Paste it into the SQL Editor
4. Click "Run" to execute the SQL

This will create:
- A `profiles` table to store user profile information
- Row Level Security (RLS) policies for data protection
- Triggers to automatically create profiles when users sign up

### 5. Configure Authentication Providers

#### Email Authentication (Already Enabled)
Email/password authentication is enabled by default.

#### Google OAuth (Optional)
1. Go to **Authentication** > **Providers** in your Supabase dashboard
2. Find "Google" and click the toggle to enable it
3. Follow the setup instructions to configure Google OAuth:
   - Create a Google Cloud Project
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add your Supabase redirect URL to authorized redirect URIs
   - Copy the Client ID and Client Secret to Supabase

#### Configure OAuth Redirect URLs
**IMPORTANT**: You must configure the correct redirect URLs for OAuth to work in production.

1. Go to **Authentication** > **URL Configuration** in your Supabase dashboard
2. Set the **Site URL** to your production domain (e.g., `https://yourdomain.com`)
3. Add **Redirect URLs** for both development and production:
   - Development: `http://localhost:3000/auth/callback`
   - Production: `https://yourdomain.com/auth/callback`
4. Save the configuration

**Note**: The auth callback route (`/auth/callback`) is automatically created in your Next.js app to handle OAuth redirects.

### 6. Configure Email Settings (Optional)

For production, you may want to configure custom email templates:

1. Go to **Authentication** > **Email Templates**
2. Customize the email templates for:
   - Confirm signup
   - Reset password
   - Magic link

### 7. Test Your Setup

1. Start your development server: `npm run dev`
2. Navigate to `/signup` to create a new account
3. Check your Supabase dashboard under **Authentication** > **Users** to see the new user
4. Check the **Table Editor** > **profiles** to see the automatically created profile

## Features Included

✅ **Email/Password Authentication**
- User registration with email verification
- Secure login/logout
- Password reset functionality

✅ **Google OAuth** (when configured)
- One-click Google sign-in
- Automatic profile creation

✅ **User Profiles**
- Automatic profile creation on signup
- Profile data synchronization
- Secure data access with RLS

✅ **Security**
- Row Level Security (RLS) enabled
- Secure API endpoints
- Protected routes

## Troubleshooting

### Common Issues

1. **"Invalid API key" error**
   - Double-check your environment variables
   - Ensure you're using the anon public key, not the service role key
   - Restart your development server after changing environment variables

2. **"User not found" after signup**
   - Check if email confirmation is required in your Supabase settings
   - Look for the confirmation email in your inbox/spam folder

3. **Google OAuth not working**
   - Verify your Google OAuth configuration
   - Check that your redirect URLs are correctly set
   - Ensure Google OAuth is enabled in Supabase

4. **Redirecting to localhost in production**
   - Check your Supabase **Authentication** > **URL Configuration**
   - Ensure the Site URL is set to your production domain
   - Verify that production redirect URLs are configured
   - Make sure the `/auth/callback` route exists in your app

5. **Database errors**
   - Verify that the SQL setup script ran successfully
   - Check the Supabase logs for detailed error messages

### Getting Help

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord Community](https://discord.supabase.com)
- [Next.js Documentation](https://nextjs.org/docs)

## Security Notes

- Never commit your `.env.local` file to version control
- Use environment variables for all sensitive configuration
- Regularly review your RLS policies
- Monitor your Supabase dashboard for unusual activity