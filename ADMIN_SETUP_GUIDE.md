# Admin Account Setup Guide

## Prerequisites

Before creating the admin account, ensure you have the following:

### 1. Environment Variables Setup

Create a `.env.local` file in the kfresh-admin directory with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tmufbgaxhtqgkvcngyxg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
NEXT_PUBLIC_CLIENT_URL=https://your-client-app.vercel.app
```

**How to get the keys:**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/tmufbgaxhtqgkvcngyxg)
2. Navigate to **Settings** → **API**
3. Copy the `anon/public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Copy the `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

### 2. Database Setup

First, ensure the user_profiles table supports admin roles by running this SQL in Supabase:

```sql
-- Run the contents of setup-admin-profiles.sql in Supabase SQL Editor
```

### 3. Install Dependencies

```bash
cd /Volumes/E/KF\ App/kfresh-admin
npm install
```

## Creating the Admin Account

### Method 1: Automated Script (Recommended)

Run the admin user creation script:

```bash
node scripts/create-admin-user.js
```

This will create:
- **Email:** info@jasskhinda.com
- **Password:** Openmyadmin5!
- **Name:** Jass Khinda
- **Role:** admin

### Method 2: Manual Creation via Supabase Dashboard

1. Go to **Authentication** → **Users** in Supabase Dashboard
2. Click **Add User**
3. Enter the admin credentials:
   - Email: info@jasskhinda.com
   - Password: Openmyadmin5!
   - Skip email confirmation: Yes
4. After creation, go to **Table Editor** → **user_profiles**
5. Add a new row or update the existing user profile with:
   - id: (the user ID from auth.users)
   - email: info@jasskhinda.com
   - first_name: Jass
   - last_name: Khinda
   - role: admin

## Testing the Login

1. Start the admin app:
   ```bash
   npm run dev
   ```

2. Go to `http://localhost:3001`

3. You should be redirected to the login page

4. Enter the admin credentials:
   - Email: info@jasskhinda.com
   - Password: Openmyadmin5!

5. You should be logged in and see the admin dashboard

## Troubleshooting

### "User already exists" error
- The script will detect existing users and update their profile instead

### "Missing environment variables" error
- Ensure `.env.local` file exists with correct Supabase keys

### Login shows "Unauthorized" error
- Check that the user profile has `role: 'admin'` in the user_profiles table
- Verify the middleware is checking for the correct admin email or role

### "Cannot read properties" error
- Run the `setup-admin-profiles.sql` to ensure the user_profiles table has the role column

## Security Notes

- The service role key has full database access - keep it secure
- Change the admin password after first login if needed
- The admin authentication checks for either:
  - `role = 'admin'` in user_profiles table
  - `email = 'info@jasskhinda.com'` (hardcoded fallback)

## Next Steps

After successful admin account creation:
1. Test the complete authentication flow
2. Verify admin can access all admin routes
3. Test product, order, and customer management features
4. Set up additional admin users if needed
