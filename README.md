# Ori - Next.js Authentication App

A modern authentication system built with Next.js 15, Supabase, and TypeScript, following Test-Driven Development (TDD) principles.

## 🚀 Features

- ✅ **Email/Password Authentication**
- ✅ **Google OAuth Integration**
- ✅ **User Profile Management**
- ✅ **Protected Routes**
- ✅ **Responsive Design with Tailwind CSS**
- ✅ **Type-Safe with TypeScript**
- ✅ **Comprehensive Test Suite**

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Authentication**: Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/ui + Radix UI
- **Language**: TypeScript
- **Testing**: Jest + React Testing Library

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd ori
npm install
```

### 2. Environment Setup

Copy the environment template:

```bash
cp .env.example .env.local
```

Update `.env.local` with your Supabase credentials:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
# Leave empty for development
NEXT_PUBLIC_SITE_URL=
```

### 3. Database Setup

Run the SQL setup script in your Supabase SQL Editor:

```sql
-- Copy and paste the contents of supabase-setup.sql
```

### 4. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your app!

## 🔧 Production Deployment

### Critical Configuration

⚠️ **IMPORTANT**: The most common production issue is OAuth redirecting to localhost instead of your production domain.

**Root Cause**: `NEXT_PUBLIC_SITE_URL` environment variable is incorrectly set to `http://localhost:3000` in production.

**Solution**: Set the correct production URL in your deployment platform:

```bash
# ✅ Correct for production
NEXT_PUBLIC_SITE_URL=https://yourdomain.com

# ❌ Wrong - will cause localhost redirects
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Platform-Specific Instructions

**Vercel**:
1. Project Settings → Environment Variables
2. Add `NEXT_PUBLIC_SITE_URL` with your production domain

**Netlify**:
1. Site Settings → Environment Variables
2. Add `NEXT_PUBLIC_SITE_URL` with your production domain

### Diagnostic Tool

Run this command to check for common configuration issues:

```bash
npm run check-production
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Check production configuration
npm run check-production
```

## 📁 Project Structure

```
ori/
├── app/                    # Next.js App Router
│   ├── auth/
│   │   └── callback/       # OAuth callback handler
│   ├── login/              # Login page
│   ├── signup/             # Registration page
│   └── project/            # Protected dashboard
├── components/             # Reusable UI components
│   ├── ui/                 # Shadcn/ui components
│   ├── login-form.tsx      # Login form with OAuth
│   └── protected-route.tsx # Route protection
├── hooks/                  # Custom React hooks
│   └── use-auth.tsx        # Authentication logic
├── lib/                    # Utilities
│   └── supabase.ts         # Supabase client
└── scripts/                # Development tools
    └── check-production-config.js
```

## 🔐 Authentication Flow

1. **Email/Password**: Traditional signup/login with email verification
2. **Google OAuth**: One-click authentication with automatic profile creation
3. **Protected Routes**: Automatic redirection for unauthenticated users
4. **Session Management**: Persistent sessions with automatic refresh

## 🐛 Troubleshooting

### Production App Redirects to Localhost

**Symptoms**: After Google login, users are redirected to `http://localhost:3000` instead of your production domain.

**Solution**:
1. Check your deployment platform's environment variables
2. Ensure `NEXT_PUBLIC_SITE_URL=https://yourdomain.com`
3. Update Supabase dashboard Site URL
4. Run `npm run check-production` to verify configuration

### Other Common Issues

See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for detailed troubleshooting guide.

## 📚 Documentation

- [Authentication Setup Guide](./AUTH_README.md)
- [Supabase Configuration](./SUPABASE_SETUP.md)
- [Testing Documentation](./__tests__/)

## 🤝 Contributing

This project follows Test-Driven Development (TDD) and "Tidy First" principles:

1. Write failing tests first
2. Implement minimum code to pass
3. Refactor when tests are green
4. Separate structural changes from behavioral changes

## 📄 License

MIT License - see LICENSE file for details.