# Deployment Guide: Vercel + Git

This guide walks you through deploying your Flower Ordering app to production on Vercel.

## Prerequisites

- GitHub account (for hosting your code)
- Vercel account (free tier is fine)
- Your ERPNext instance details (URL, API key, API secret)
- Git installed on your machine

## Step 1: Push to GitHub

### Create a new GitHub repository

1. Go to [github.com/new](https://github.com/new)
2. Name it `flower-ordering-app` (or your preferred name)
3. Do NOT initialize with README (we already have one)
4. Click "Create repository"

### Push your code

In your terminal (in the `flower-ordering-app` directory):

```bash
# Add GitHub as the remote
git remote add origin https://github.com/YOUR_USERNAME/flower-ordering-app.git
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username.

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended for first-time)

1. Go to [vercel.com](https://vercel.com)
2. Sign up or log in with GitHub
3. Click "New Project"
4. Select your GitHub repository (`flower-ordering-app`)
5. In the configuration:
   - **Framework Preset**: Next.js
   - **Root Directory**: ./
   - Leave Build and Output settings as default
6. Click "Add Environment Variables" and add:
   ```
   FRAPPE_URL = https://your-erpnext-instance.com
   FRAPPE_API_KEY = your_api_key
   FRAPPE_API_SECRET = your_api_secret
   ```
7. Click "Deploy"

Vercel will build and deploy your app. This usually takes 2-3 minutes.

### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI globally (one time)
npm install -g vercel

# In your project directory
vercel

# Follow the prompts:
# - Link to existing project? No (first time)
# - Project name? flower-ordering-app
# - Which directory? ./
# - Want to modify settings? Yes
#   - Add environment variables when prompted
```

## Step 3: Verify Your Deployment

After deployment completes:

1. Vercel gives you a URL like: `https://flower-ordering-app-xyz.vercel.app`
2. Open that URL in your browser
3. You should see the Flower Ordering app loading
4. Check the browser console (F12) for any errors
5. Try the "Refresh from ERPNext" button to test the connection

### Common Issues

**"ERPNext configuration missing"**
- Go to Vercel dashboard → Your project → Settings → Environment Variables
- Verify all three variables are set correctly:
  - `FRAPPE_URL` (with https://)
  - `FRAPPE_API_KEY`
  - `FRAPPE_API_SECRET`
- Redeploy after adding/fixing variables

**"Could not connect to ERPNext"**
- Check that your ERPNext instance URL is correct
- Verify the API key and secret are active (check in ERPNext)
- Check that CORS is enabled on your ERPNext instance

**Blank page or 404**
- Check Vercel Function logs: Dashboard → Your project → Deployments → Function logs
- Make sure all files were deployed correctly

## Step 4: Set Up Auto-Deployment

Now every time you push to GitHub, Vercel automatically rebuilds and deploys:

```bash
# Make a change
echo "# Updated" >> README.md

# Commit and push
git add README.md
git commit -m "Update docs"
git push

# Vercel automatically deploys within 1-2 minutes
```

## Step 5: Custom Domain (Optional)

To use your own domain:

1. Vercel dashboard → Your project → Settings → Domains
2. Enter your domain (e.g., `flowers.yourdomain.com`)
3. Follow the DNS configuration steps
4. Usually takes 5-10 minutes to activate

## Step 6: Production Checklist

Before sharing your app with others:

- [ ] Test all buttons (Refresh, Download PO)
- [ ] Verify ERPNext connection is live
- [ ] Check app works on mobile/tablet
- [ ] Enable HTTPS (Vercel does this automatically)
- [ ] Set up error monitoring (optional: Sentry, LogRocket)
- [ ] Document any custom fields you used

## Monitoring & Maintenance

### View Logs

```bash
# Via Vercel CLI
vercel logs

# Or check Vercel dashboard:
# Project → Deployments → Select a deployment → Function logs
```

### Update Environment Variables

If you need to update your ERPNext credentials:

1. Vercel dashboard → Your project → Settings → Environment Variables
2. Edit the variable
3. Vercel automatically redeploys with the new values

### Rollback to Previous Version

If something breaks after a deployment:

1. Vercel dashboard → Your project → Deployments
2. Find the previous working deployment
3. Click "Redeploy" on that version

## Updating Your App

To add new features or fix bugs:

```bash
# Make your changes locally
# ... edit files ...

# Test locally
npm run dev

# Commit and push
git add .
git commit -m "Add new feature"
git push

# Vercel automatically deploys (2-3 minutes)
```

## Troubleshooting

### Clear Build Cache
If you're getting weird build errors:

1. Vercel dashboard → Your project → Settings → Git
2. Click "Redeploy" with "Use existing source"
3. This does a clean build

### Enable Debug Logging

In `pages/api/frappe-proxy.js`, uncomment debug lines:
```javascript
console.log('Request:', { action, endpoint, data });
console.log('Response:', responseData);
```

Then check logs: Vercel dashboard → Function logs

### Rate Limiting

ERPNext has rate limits. If you get 429 errors:
- Add delays between requests in your app
- Check ERPNext rate limit settings
- Contact your ERPNext admin if limits are too strict

## Success!

Your Flower Ordering app is now live on:
```
https://flower-ordering-app-xyz.vercel.app
```

Share this URL with your team and start managing flower orders! 🌸

## Next Steps

1. **Enhance the UI**: Port more features from the original artifact
2. **Add features**: Purchase order creation, supplier management, reporting
3. **Set up monitoring**: Error tracking, performance monitoring
4. **User management**: Add authentication if needed
5. **Integrations**: Connect to other tools (Slack notifications, etc.)

## Getting Help

- **Vercel docs**: https://vercel.com/docs
- **Next.js docs**: https://nextjs.org/docs
- **Frappe API docs**: https://frappeframework.com/docs/v13/user/api/rest

Good luck! 🚀
