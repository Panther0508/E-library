# Deployment Guide

This guide provides step-by-step instructions for deploying EngineerVault to production, including both frontend and backend components.

## Prerequisites

Before deploying, ensure you have:

- [Node.js 18+](https://nodejs.org/) installed
- A [Vercel](https://vercel.com) account
- A [Supabase](https://supabase.com) account (optional)
- A [HuggingFace](https://huggingface.co) account with API token
- Git installed and configured

## Architecture Overview

```
┌─────────────────┐         ┌──────────────────┐
│   Vercel       │         │   External APIs  │
│   Frontend     │────────▶│   - Remotive     │
│   (Next.js)    │         │   - HuggingFace  │
└─────────────────┘         └──────────────────┘
         │
         ▼
┌─────────────────┐
│   Vercel       │
│   API Routes   │ (Serverless Functions)
│   (Backend)    │
└─────────────────┘
```

## Step 1: Prepare Your Repository

### Fork or Clone the Repository

```bash
git clone https://github.com/yourusername/engineervault.git
cd engineervault
```

### Install Dependencies

```bash
npm install
```

## Step 2: Configure Environment Variables

### Create Environment File

```bash
cp .env.example .env.local
```

### Edit `.env.local` with your values:

```env
# Supabase (optional - for future auth features)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# HuggingFace (required for AI features)
HUGGINGFACE_API_TOKEN=hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Vercel Frontend (your production URL)
VERCEL_FRONTEND_URL=https://your-project.vercel.app
```

## Step 3: Test Locally

### Run Development Server

```bash
npm run dev
```

Visit http://localhost:3000 to verify everything works.

### Test API Endpoints

```bash
# Health check
curl http://localhost:3000/api/health

# Jobs list
curl "http://localhost:3000/api/jobs?page=1&limit=5"

# AI text generation
curl -X POST http://localhost:3000/api/huggingface \
  -H "Content-Type: application/json" \
  -d '{"action":"generate","inputs":"Hello world","parameters":{"max_new_tokens":10}}'
```

### Build for Production

```bash
npm run build
```

Ensure the build completes without errors.

## Step 4: Deploy to Vercel

### Option A: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

Follow the prompts:

1. Set up and deploy? Yes
2. Which scope? Your Vercel username/organization
3. Want to modify settings? No (or configure as needed)
4. What's your project's name? engineervault

### Option B: Deploy via Git

1. Push your code to GitHub/GitLab/Bitbucket
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "Add New..." → "Project"
4. Import your repository
5. Configure project settings:
   - Framework Preset: Next.js
   - Build Command: `npm run build` (or leave blank)
   - Output Directory: `.next` (or leave blank)
6. Add environment variables in the "Environment Variables" section
7. Click "Deploy"

### Option C: Deploy via Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Drag and drop your project folder
4. Configure environment variables
5. Click "Deploy"

## Step 5: Configure Production Environment Variables

After deployment, go to your Vercel project settings and add:

| Variable                        | Required | Description                                                    |
| ------------------------------- | -------- | -------------------------------------------------------------- |
| `HUGGINGFACE_API_TOKEN`         | Yes      | Your HuggingFace API token                                     |
| `VERCEL_FRONTEND_URL`           | Yes      | Your production URL (e.g., `https://engineervault.vercel.app`) |
| `NEXT_PUBLIC_SUPABASE_URL`      | No       | Your Supabase URL                                              |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | No       | Your Supabase anon key                                         |
| `NODE_ENV`                      | Yes      | Set to `production`                                            |

### Adding Environment Variables in Vercel

1. Go to Project Settings → Environment Variables
2. Add each variable with appropriate value
3. Select "Production" and "Preview" for deployment
4. Trigger a new deployment

## Step 6: Verify Deployment

### Check Health Endpoint

```bash
curl https://your-project.vercel.app/api/health
```

Expected response:

```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "1.0.0",
  "services": {
    "cache": "up",
    "rateLimiter": "up"
  }
}
```

### Test API Endpoints

```bash
# Jobs
curl "https://your-project.vercel.app/api/jobs"

# Categories
curl "https://your-project.vercel.app/api/jobs/categories"

# HuggingFace AI
curl -X POST "https://your-project.vercel.app/api/huggingface" \
  -H "Content-Type: application/json" \
  -d '{"action":"generate","inputs":"Hello","parameters":{"max_new_tokens":5}}'
```

## Step 7: Configure Custom Domain (Optional)

1. Go to Vercel Dashboard → Project → Settings → Domains
2. Add your custom domain
3. Follow the instructions to configure DNS records
4. Wait for propagation (can take up to 24 hours)

## Backend Deployment Details

### How It Works

The backend runs as **Serverless Functions** on Vercel:

- Each API route (`app/api/*/route.ts`) becomes a serverless function
- Functions are automatically scaled based on demand
- No server management required

### Performance Optimizations

1. **Caching**: In-memory cache reduces API calls
2. **Rate Limiting**: Prevents abuse
3. **Connection Pooling**: Handled automatically by Vercel
4. **Cold Starts**: Minimized through lightweight dependencies

### Limits on Vercel Free Tier

| Feature              | Free Tier     | Pro Tier      |
| -------------------- | ------------- | ------------- |
| Bandwidth            | 100 GB/month  | 1 TB/month    |
| Serverless Functions | 12 GB-hours   | 1000 GB-hours |
| Build Time           | 6,000 minutes | Unlimited     |
| API Routes           | Unlimited     | Unlimited     |

### Monitoring

1. Go to Vercel Dashboard → Your Project → Functions
2. View function execution times, memory usage, and errors
3. Check the "Logs" tab for real-time request logs

## Frontend Deployment Details

### Static Generation

The frontend uses Next.js Static Generation for optimal performance:

- Homepage and static pages are pre-rendered
- API data is fetched client-side
- Optimized for fast initial load

### Environment Variables for Frontend

Add these to Vercel (marked as public):

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_API_URL=https://your-project.vercel.app/api
```

## Troubleshooting

### Build Failures

1. Check TypeScript errors: `npm run build`
2. Ensure all dependencies are installed: `npm install`
3. Verify environment variables are set

### API Errors

1. Check function logs in Vercel Dashboard
2. Verify environment variables are correct
3. Check rate limits haven't been exceeded

### CORS Issues

1. Ensure `VERCEL_FRONTEND_URL` matches your frontend URL
2. Check that the URL doesn't have trailing slashes
3. For development, use `http://localhost:3000`

### HuggingFace Errors

1. Verify `HUGGINGFACE_API_TOKEN` is set correctly
2. Check your token has sufficient permissions
3. Review HuggingFace API status page

### Cold Start Issues

1. Functions may take longer on first request after inactivity
2. Consider upgrading to Pro for better performance
3. Implement client-side loading states

## Maintenance

### Updating the Application

1. Make changes locally
2. Test thoroughly
3. Push to Git or deploy via Vercel CLI

```bash
vercel --prod
```

### Monitoring Production

1. Use Vercel Analytics for performance data
2. Set up alerts for errors
3. Monitor API usage and rate limits

### Backing Up

Since this is a serverless app:

- Code is in your Git repository
- Environment variables are in Vercel (or use a secrets manager)
- No database to backup (if using Supabase, backup there)

## Security Best Practices

1. **Never commit secrets**: Use environment variables
2. **Validate inputs**: All API endpoints validate request data
3. **Rate limit**: Prevents abuse and DoS
4. **CORS**: Restricts access to known domains
5. **HTTPS**: Enforced by Vercel

## Support

- Open an issue on GitHub for bugs
- Check Vercel documentation for platform issues
- Review HuggingFace status for API issues

## Quick Reference

```bash
# Development
npm run dev

# Production build
npm run build
npm start

# Deploy to Vercel
vercel --prod

# Check API health
curl https://your-project.vercel.app/api/health

# View logs
vercel logs your-project
```
