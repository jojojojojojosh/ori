# OAuth Configuration for Local Development

To fix the OAuth redirect issue when running on localhost:3001, you need to update your Supabase project's OAuth configuration.

## Steps to Configure Supabase OAuth:

1. **Go to your Supabase Dashboard**:
   - Visit: https://supabase.com/dashboard
   - Select your project: `auxpuxoqfuyoqqbylvon`

2. **Navigate to Authentication Settings**:
   - Go to `Authentication` > `URL Configuration`

3. **Add Redirect URLs**:
   Add these URLs to your "Redirect URLs" list:
   ```
   http://localhost:3000/auth/callback
   http://localhost:3001/auth/callback
   https://ori-seven.vercel.app/auth/callback
   ```

4. **Update Site URL** (if needed):
   - For development: `http://localhost:3001`
   - For production: `https://ori-seven.vercel.app`

## What was fixed in the code:

- Updated `hooks/use-auth.tsx` to detect local development environment
- When running on localhost, it now uses `window.location.origin` instead of the hardcoded production URL
- This ensures OAuth redirects go to the correct local port

## Testing:

1. Start the dev server on port 3001: `npm run dev -- -p 3001`
2. Navigate to `http://localhost:3001/login`
3. Try Google OAuth login
4. Should redirect properly to `http://localhost:3001/auth/callback`

## Error Resolution:

The original error `{"error":"requested path is invalid"}` occurred because:
- OAuth was trying to redirect to `https://ori-seven.vercel.app/auth/callback`
- But the user was on `http://localhost:3001`
- Supabase didn't have `localhost:3001` in the allowed redirect URLs

After following these steps, OAuth should work correctly on both localhost:3001 and production.