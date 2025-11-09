# CogniCMS v2 - Deployment Guide for Render

This guide provides step-by-step instructions for deploying CogniCMS v2 on Render.com with GitHub integration.

## Prerequisites

1. **GitHub Account** with access to:

   - This repository (`stefjnl/CogniCMS-v2`)
   - Target website repository (`stefjnl/zincafe-zweeloo`)

2. **Render.com Account** (free tier available)

3. **GitHub Personal Access Token** with `repo` scope

## Step 1: Create GitHub Personal Access Token

1. Go to GitHub Settings: https://github.com/settings/tokens
2. Click **"Personal access tokens"** → **"Tokens (classic)"**
3. Click **"Generate new token"** → **"Generate new token (classic)"**
4. Configure the token:
   - **Note**: `CogniCMS Render Deployment`
   - **Expiration**: 90 days (or No expiration for production)
   - **Scopes**: Check `repo` (Full control of private repositories)
5. Click **"Generate token"**
6. **IMPORTANT**: Copy the token immediately (starts with `ghp_`)
7. Save it securely - you won't be able to see it again!

## Step 2: Update Local Environment Variables

1. Edit `.env.local` file in the project root:

```env
GITHUB_TOKEN=ghp_your_actual_token_here
GITHUB_OWNER=stefjnl
GITHUB_REPO=zincafe-zweeloo
GITHUB_BRANCH=main
NEXT_PUBLIC_CMS_PASSWORD=your_secure_password_here
NODE_ENV=development
```

2. Replace `ghp_your_actual_token_here` with your GitHub token
3. Set a strong password for `NEXT_PUBLIC_CMS_PASSWORD`

## Step 3: Test Locally

Before deploying, test the application locally:

```bash
# Install dependencies (if not already done)
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

**Test checklist:**

- [ ] Can access login page at http://localhost:3000/login
- [ ] Can log in with the password from `.env.local`
- [ ] CMS loads content from GitHub repository
- [ ] Can edit content in the editor
- [ ] Can save changes (check GitHub repository for commits)
- [ ] Preview updates in real-time

## Step 4: Deploy to Render

### Option A: Deploy via Render Dashboard (Recommended)

1. **Go to Render Dashboard**: https://dashboard.render.com

2. **Create New Web Service**:

   - Click **"New +"** → **"Web Service"**

3. **Connect Repository**:

   - If first time: Click **"Connect GitHub"** and authorize Render
   - Select **`stefjnl/CogniCMS-v2`** repository
   - Click **"Connect"**

4. **Configure Service**:

   - **Name**: `cognicms-v2` (or your preferred name)
   - **Region**: Choose closest to you (e.g., Frankfurt, Oregon)
   - **Branch**: `main`
   - **Root Directory**: (leave blank)
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free (or Starter for $7/month - better performance)

5. **Add Environment Variables**:
   Click **"Advanced"** → **"Add Environment Variable"** for each:

   ```
   NODE_ENV = production
   GITHUB_TOKEN = ghp_your_actual_token_here
   GITHUB_OWNER = stefjnl
   GITHUB_REPO = zincafe-zweeloo
   GITHUB_BRANCH = main
   NEXT_PUBLIC_CMS_PASSWORD = your_secure_password_here
   ```

   **CRITICAL**: Use the same GitHub token and password from Step 2!

6. **Create Web Service**:
   - Review settings
   - Click **"Create Web Service"**
   - Wait for deployment (5-10 minutes)

### Option B: Deploy via Blueprint (render.yaml)

The repository includes `render.yaml` for automated deployment:

1. Go to Render Dashboard: https://dashboard.render.com
2. Click **"New +"** → **"Blueprint"**
3. Connect your GitHub repository
4. Render will detect `render.yaml` automatically
5. Set environment variables as described above
6. Click **"Apply"**

## Step 5: Configure Environment Variables in Render

After deployment starts, you MUST set the secret environment variables:

1. Go to your service in Render Dashboard
2. Click **"Environment"** in left sidebar
3. Add/Update these variables:

```
GITHUB_TOKEN = ghp_your_actual_github_token
NEXT_PUBLIC_CMS_PASSWORD = your_secure_password
```

4. Click **"Save Changes"**
5. Render will automatically redeploy

## Step 6: Access Your CMS

1. **Find Your URL**:

   - In Render Dashboard, find your service
   - URL will be: `https://cognicms-v2.onrender.com` (or your custom domain)

2. **Login**:

   - Go to `https://your-url.onrender.com/login`
   - Enter the password from `NEXT_PUBLIC_CMS_PASSWORD`

3. **Start Editing**:
   - Content loads from `stefjnl/zincafe-zweeloo` repository
   - Make changes in the editor
   - Click "Save Draft" to commit to GitHub
   - Changes appear on the live website (may take a few minutes for GitHub Pages)

## Step 7: Verify GitHub Integration

1. **Edit content** in the CMS
2. **Click "Save Draft"**
3. **Check GitHub repository**: https://github.com/stefjnl/zincafe-zweeloo/commits/main
4. **Verify commits** appear with message: `Update content via CogniCMS - [timestamp]`

## Troubleshooting

### Build Fails

**Error**: `Module not found` or dependency issues

- **Solution**: Run `npm install` locally and commit `package-lock.json`

**Error**: TypeScript compilation errors

- **Solution**: Run `npm run build` locally to identify errors
- Fix all TypeScript errors before deploying

### Authentication Issues

**Error**: "Invalid GitHub token"

- **Solution**: Verify `GITHUB_TOKEN` is correct and has `repo` scope
- Generate a new token if needed

**Error**: "Repository not found"

- **Solution**: Check `GITHUB_OWNER` and `GITHUB_REPO` are correct
- Ensure token has access to the repository

### Cannot Login to CMS

**Error**: "Invalid password"

- **Solution**: Verify `NEXT_PUBLIC_CMS_PASSWORD` matches in Render and your login attempt
- Check for typos or extra spaces

### Content Won't Save

**Error**: "Conflict: File has been modified"

- **Solution**: Reload the page to get latest content
- Try saving again

**Error**: "Failed to save to GitHub"

- **Solution**: Check GitHub token permissions
- Verify repository settings allow commits

### Free Tier Limitations

**Issue**: App spins down after inactivity (15 minutes)

- **Impact**: First request after inactivity takes 30-50 seconds to load
- **Solution**: Upgrade to Starter plan ($7/month) for always-on service

**Issue**: 750 hours/month limit

- **Impact**: App unavailable if limit exceeded
- **Solution**: Upgrade to paid plan or optimize usage

## Environment Variables Reference

| Variable                   | Required | Description                | Example           |
| -------------------------- | -------- | -------------------------- | ----------------- |
| `NODE_ENV`                 | Yes      | Node environment           | `production`      |
| `GITHUB_TOKEN`             | Yes      | GitHub PAT with repo scope | `ghp_xxxxx`       |
| `GITHUB_OWNER`             | Yes      | Repository owner           | `stefjnl`         |
| `GITHUB_REPO`              | Yes      | Repository name            | `zincafe-zweeloo` |
| `GITHUB_BRANCH`            | Yes      | Branch to commit to        | `main`            |
| `NEXT_PUBLIC_CMS_PASSWORD` | Yes      | CMS login password         | `your_password`   |

## Security Best Practices

1. **Use Strong Passwords**: Generate complex passwords for CMS access
2. **Rotate Tokens**: Regenerate GitHub tokens periodically
3. **Limit Token Scope**: Only grant `repo` scope, nothing more
4. **Monitor Commits**: Watch for unauthorized changes in GitHub
5. **Use Private Repository**: Consider making CMS repository private

## Updating the CMS

To deploy updates:

1. **Make changes** to the code locally
2. **Test locally**: `npm run dev`
3. **Commit and push** to GitHub
4. **Render auto-deploys** from `main` branch
5. **Monitor deployment** in Render Dashboard

## Custom Domain (Optional)

To use a custom domain like `cms.yoursite.com`:

1. Go to Render Dashboard → Your Service → **"Settings"**
2. Scroll to **"Custom Domain"**
3. Click **"Add Custom Domain"**
4. Enter domain: `cms.yoursite.com`
5. Follow Render's DNS configuration instructions
6. Update DNS records with your domain provider

## Support & Resources

- **Render Documentation**: https://render.com/docs
- **Next.js Deployment**: https://nextjs.org/docs/deployment
- **GitHub API**: https://docs.github.com/en/rest
- **Project README**: See `README.md` in repository

## Cost Breakdown

| Plan     | Cost      | Features                                 |
| -------- | --------- | ---------------------------------------- |
| Free     | $0/month  | 750 hours/month, spins down after 15 min |
| Starter  | $7/month  | Always-on, faster, 100GB bandwidth       |
| Standard | $25/month | Priority support, more resources         |

**Recommendation**: Start with Free tier for testing, upgrade to Starter for production use.

## Next Steps

1. Share the CMS URL and password with authorized users
2. Document content editing workflows
3. Set up monitoring for uptime (optional)
4. Consider adding user management for multiple editors (future enhancement)

---

**Deployment Date**: November 8, 2025  
**Version**: 2.0.0  
**Maintained by**: CogniCMS Team
