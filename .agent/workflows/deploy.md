---
description: Deploy to Vercel with Supabase
---

# Deployment Workflow: Lazy DM Companion

This workflow will deploy your app to Vercel with Supabase PostgreSQL and configure Google OAuth for production.

## Prerequisites
- Node.js installed
- Git installed
- GitHub account (for Vercel deployment)

---

## Phase 1: Setup Supabase Database

### 1. Create Supabase Account & Project
- Go to [https://supabase.com](https://supabase.com)
- Sign in with GitHub (recommended)
- Click "New Project"
  - Organization: Create new or select existing
  - **Project Name**: `lazy-dm-companion`
  - **Database Password**: Create a strong password and **SAVE IT**
  - **Region**: Choose closest to you (e.g., West EU for Europe)
  - Click "Create new project" (takes ~2 minutes)

### 2. Get Database Connection String
- In your Supabase project, go to **Project Settings** (gear icon) → **Database**
- Scroll to **Connection String** section
- Copy the **Connection pooling** URI (the one that says "Transaction" mode)
- It looks like: `postgresql://postgres.xxxxx:[YOUR-PASSWORD]@xxx.pooler.supabase.com:6543/postgres?pgbouncer=true`
- **IMPORTANT**: Replace `[YOUR-PASSWORD]` with the password you created in step 1
- Add `&connection_limit=1` to the end for Prisma compatibility
- Final format: `postgresql://postgres.xxxxx:YOUR_PASSWORD@xxx.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1`

### 3. Update Local Environment
- Open `.env` file
- Replace the `DATABASE_URL` line with your Supabase connection string
- Keep the Supabase connection string safe - you'll need it again for Vercel

### 4. Run Database Migration
```bash
npx prisma migrate dev --name init
```
This will create your database tables in Supabase.

---

## Phase 2: Setup Google OAuth

### 1. Go to Google Cloud Console
- Visit [https://console.cloud.google.com](https://console.cloud.google.com)
- Select your existing project or create a new one

### 2. Enable Google+ API
- In the search bar, type "Google+ API" or "People API"
- Click on it and click "Enable"

### 3. Configure OAuth Consent Screen
- Go to **APIs & Services** → **OAuth consent screen**
- Select **External** user type → Click "Create"
- Fill in required fields:
  - **App name**: `Lazy DM Companion`
  - **User support email**: Your email
  - **Developer contact**: Your email
- Click "Save and Continue"
- **Scopes**: Click "Add or Remove Scopes"
  - Add: `userinfo.email`, `userinfo.profile`
  - Click "Save and Continue"
- **Test users**: Add your email for testing
- Click "Save and Continue"

### 4. Create OAuth Credentials
- Go to **APIs & Services** → **Credentials**
- Click "**Create Credentials**" → "**OAuth client ID**"
- Application type: **Web application**
- Name: `Lazy DM Companion Web`
- **Authorized JavaScript origins**:
  - Add `http://localhost:3000` (for local testing)
  - Add `https://your-app-name.vercel.app` (you'll update this after deploying)
- **Authorized redirect URIs**:
  - Add `http://localhost:3000/api/auth/callback/google` (for local)
  - Add `https://your-app-name.vercel.app/api/auth/callback/google` (update after deploy)
- Click "Create"
- **SAVE** your `Client ID` and `Client Secret`

### 5. Update .env File
Add these to your `.env`:
```
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
```

---

## Phase 3: Setup Supabase Storage (for temporary audio files)

### 1. Create Storage Bucket
- In Supabase dashboard, go to **Storage** (sidebar)
- Click "Create a new bucket"
  - **Name**: `audio-temp`
  - **Public bucket**: NO (keep private)
  - Click "Create bucket"

### 2. Set Bucket Policies
- Click on the `audio-temp` bucket
- Go to **Policies** tab
- Click "New Policy" → "For full customization"
- Add these policies:

**Insert Policy** (allow authenticated uploads):
```sql
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'audio-temp');
```

**Select Policy** (allow authenticated reads):
```sql
CREATE POLICY "Allow authenticated reads"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'audio-temp');
```

**Delete Policy** (allow authenticated deletes):
```sql
CREATE POLICY "Allow authenticated deletes"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'audio-temp');
```

### 3. Get Storage Keys
- Go to **Project Settings** → **API**
- Copy:
  - **Project URL** (e.g., `https://xxxxx.supabase.co`)
  - **anon/public key** (the long key under "Project API keys")
- Add to `.env`:
```
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

---

## Phase 4: Prepare for Deployment

### 1. Create .env.example
Create a `.env.example` file with placeholder values (for documentation):
```
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="generate-with-openssl"
NEXTAUTH_URL="https://your-app.vercel.app"
GOOGLE_API_KEY="your-google-api-key"
GOOGLE_CLIENT_ID="your-client-id"
GOOGLE_CLIENT_SECRET="your-client-secret"
NEXT_PUBLIC_SUPABASE_URL="https://xxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
```

### 2. Generate NextAuth Secret
Run this command to generate a secure secret:
```bash
openssl rand -base64 32
```
Copy the output and update `NEXTAUTH_SECRET` in your `.env`

### 3. Create .gitignore (if not exists)
Ensure `.env` is in `.gitignore`:
```
.env
.env.local
node_modules
.next
```

### 4. Initialize Git (if not already)
```bash
git init
git add .
git commit -m "Initial commit - ready for deployment"
```

### 5. Push to GitHub
- Create a new repository on GitHub
- Follow the instructions to push your code:
```bash
git remote add origin https://github.com/YOUR_USERNAME/lazy-dm-companion.git
git branch -M main
git push -u origin main
```

---

## Phase 5: Deploy to Vercel

### 1. Sign Up for Vercel
- Go to [https://vercel.com](https://vercel.com)
- Sign in with GitHub (recommended)

### 2. Import Project
- Click "Add New" → "Project"
- Import your `lazy-dm-companion` repository
- Click "Import"

### 3. Configure Project
- **Framework Preset**: Next.js (auto-detected)
- **Root Directory**: `./`
- **Build Command**: `npm run build` (auto-filled)
- **Output Directory**: `.next` (auto-filled)

### 4. Add Environment Variables
Click "Environment Variables" and add ALL variables from your `.env`:
- `DATABASE_URL` (Supabase connection string)
- `NEXTAUTH_SECRET` (the one you generated)
- `NEXTAUTH_URL` → Set to `https://your-project-name.vercel.app` (you'll get this after deploy)
- `GOOGLE_API_KEY`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Note**: For `NEXTAUTH_URL`, you can leave it for now and update it in step 5.

### 5. Deploy
- Click "Deploy"
- Wait for deployment (2-3 minutes)
- Copy your deployment URL (e.g., `https://lazy-dm-companion-xxxx.vercel.app`)

### 6. Update NEXTAUTH_URL
- In Vercel dashboard, go to **Settings** → **Environment Variables**
- Edit `NEXTAUTH_URL` to your actual deployment URL
- Redeploy: Go to **Deployments** → Click "..." on latest → "Redeploy"

---

## Phase 6: Update Google OAuth

### 1. Add Production URLs to Google Console
- Go back to Google Cloud Console → **APIs & Services** → **Credentials**
- Click on your OAuth client
- **Authorized JavaScript origins**: Add your Vercel URL
  - `https://your-app-name.vercel.app`
- **Authorized redirect URIs**: Add your callback URL
  - `https://your-app-name.vercel.app/api/auth/callback/google`
- Click "Save"

---

## Phase 7: Test Deployment

### 1. Visit Your App
- Open your Vercel URL in a browser
- Try logging in with Google
- ✅ It should work now!

### 2. Monitor Logs
- In Vercel dashboard, go to your project
- Click on **Logs** to see real-time logs
- Check for any errors

---

## Troubleshooting

### Google Login Still Not Working?
- Wait 5-10 minutes for Google OAuth changes to propagate
- Clear browser cache and cookies
- Check that redirect URIs match exactly (no trailing slashes)
- Check Vercel logs for errors

### Database Connection Issues?
- Verify `DATABASE_URL` has `&connection_limit=1` at the end
- Check Supabase project is still running
- Try running `npx prisma migrate deploy` locally with production DATABASE_URL

### Environment Variables Not Working?
- Remember to redeploy after adding/changing env vars
- Check variable names match exactly (case-sensitive)

---

## Future Updates

To deploy updates:
```bash
git add .
git commit -m "Your update message"
git push
```
Vercel will automatically redeploy!

---

## Cost Summary
- ✅ **Supabase**: Free tier (500MB DB + 1GB storage)
- ✅ **Vercel**: Free tier (Hobby plan)
- ✅ **Google OAuth**: Free
- 💰 **Total**: $0/month

Both services will notify you if you approach limits!
