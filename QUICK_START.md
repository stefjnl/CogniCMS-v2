# 🚀 CogniCMS v2 - Quick Reference

## 📦 What You Have Now

A fully functional CMS that:

- ✅ Loads content from GitHub (`stefjnl/zincafe-zweeloo`)
- ✅ Allows editing via visual interface
- ✅ Saves changes back to GitHub
- ✅ Shows live preview
- ✅ Protected by password
- ✅ Ready to deploy on Render.com

---

## ⚡ Quick Commands

```bash
# Install dependencies
npm install

# Development mode
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

---

## 🔐 Environment Variables

**Required for local development** (`.env.local`):

```env
GITHUB_TOKEN=ghp_your_github_token
GITHUB_OWNER=stefjnl
GITHUB_REPO=zincafe-zweeloo
GITHUB_BRANCH=main
NEXT_PUBLIC_CMS_PASSWORD=your_password
NODE_ENV=development
```

**Required for Render deployment** (set in dashboard):

```env
NODE_ENV=production
GITHUB_TOKEN=ghp_your_github_token
GITHUB_OWNER=stefjnl
GITHUB_REPO=zincafe-zweeloo
GITHUB_BRANCH=main
NEXT_PUBLIC_CMS_PASSWORD=your_secure_password
```

---

## 🎯 Getting Your GitHub Token

1. Go to: https://github.com/settings/tokens
2. Click **"Generate new token (classic)"**
3. Select scope: **`repo`** (full control)
4. Copy the token (starts with `ghp_`)
5. Add to `.env.local`

---

## 📝 File Structure

```
CogniCMS-v2/
├── app/
│   ├── api/
│   │   ├── auth/route.ts          # Authentication
│   │   ├── content/
│   │   │   ├── load/route.ts      # Load from GitHub
│   │   │   └── save/route.ts      # Save to GitHub
│   │   └── preview/route.ts       # Preview generation
│   ├── login/page.tsx             # Login page
│   └── page.tsx                   # Main CMS interface
├── components/cms/                # CMS components
├── lib/
│   ├── content/
│   │   ├── injector.ts            # Content → HTML injection
│   │   └── parser.ts              # HTML parsing utilities
│   └── state/
│       └── ContentContext.tsx     # State management
├── .env.example                   # Environment template
├── .env.local                     # Your config (gitignored)
├── render.yaml                    # Render deployment config
├── DEPLOYMENT.md                  # Full deployment guide
├── TESTING.md                     # Testing checklist
└── IMPLEMENTATION_SUMMARY.md      # What was built
```

---

## 🚀 Deploy to Render (5 Steps)

### 1. Get GitHub Token

- Create at https://github.com/settings/tokens
- Scope: `repo`

### 2. Go to Render

- Visit https://dashboard.render.com
- Click **"New +"** → **"Web Service"**

### 3. Connect Repository

- Connect GitHub account
- Select `stefjnl/CogniCMS-v2`

### 4. Configure

- **Environment**: Node
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

### 5. Set Environment Variables

```
NODE_ENV = production
GITHUB_TOKEN = ghp_your_token
GITHUB_OWNER = stefjnl
GITHUB_REPO = zincafe-zweeloo
GITHUB_BRANCH = main
NEXT_PUBLIC_CMS_PASSWORD = your_password
```

**Done!** Your CMS will be live at `https://your-app.onrender.com`

---

## 🔧 Local Testing (Before Deploy)

```bash
# 1. Set up environment
cp .env.example .env.local
# Edit .env.local with your credentials

# 2. Install
npm install

# 3. Run dev server
npm run dev

# 4. Open browser
# http://localhost:3000/login

# 5. Test
# - Log in with password from .env.local
# - Edit content
# - Save (creates real GitHub commit!)
# - Check https://github.com/stefjnl/zincafe-zweeloo/commits
```

---

## 🎨 How to Use the CMS

### Login

1. Go to `/login`
2. Enter password from environment variable
3. Click "Login"

### Edit Content

1. Select section from left panel
2. Edit fields in form
3. See live preview on right
4. Changes auto-save to localStorage

### Save to GitHub

1. Click "Save Draft" button
2. Wait for success notification
3. Check GitHub repository for commit
4. Website updates automatically

### Device Preview

- Click device icons: 📱 Tablet 💻 Desktop
- Preview shows responsive layout

---

## 🐛 Common Issues

### Build fails

```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

### Can't login

- Check `NEXT_PUBLIC_CMS_PASSWORD` in `.env.local`
- Verify no extra spaces in password
- Clear browser cache/localStorage

### GitHub API errors

- Verify `GITHUB_TOKEN` is correct
- Check token has `repo` scope
- Ensure token hasn't expired

### Content won't save

- Check GitHub token permissions
- Verify repository exists
- Check for merge conflicts

---

## 📊 API Endpoints

| Endpoint            | Method | Description           |
| ------------------- | ------ | --------------------- |
| `/api/auth`         | POST   | Authenticate user     |
| `/api/content/load` | GET    | Load from GitHub      |
| `/api/content/save` | POST   | Save to GitHub        |
| `/api/preview`      | POST   | Generate preview HTML |

---

## 📚 Documentation Files

- **DEPLOYMENT.md** - Complete deployment guide
- **TESTING.md** - Testing checklist
- **IMPLEMENTATION_SUMMARY.md** - What was built
- **.github/copilot-instructions.md** - Project context

---

## 💡 Tips

### Local Development

- Use `npm run dev` for hot reload
- Changes save to localStorage automatically
- Preview updates in real-time

### Production

- Always test locally first
- Verify GitHub commits after save
- Monitor Render logs for errors

### Security

- Use strong passwords
- Rotate GitHub tokens regularly
- Keep `.env.local` private

---

## 🆘 Need Help?

1. **Check logs**: Render Dashboard → Logs tab
2. **GitHub commits**: Verify at https://github.com/stefjnl/zincafe-zweeloo/commits
3. **Browser console**: Press F12 to see errors
4. **Documentation**: Read DEPLOYMENT.md and TESTING.md

---

## ✅ Pre-Flight Checklist

Before going live:

- [ ] GitHub token created and added
- [ ] Password set in environment
- [ ] Local testing completed
- [ ] Build succeeds: `npm run build`
- [ ] Can log in locally
- [ ] Can load content from GitHub
- [ ] Can save (test commit created)
- [ ] Preview works correctly
- [ ] Environment variables set in Render
- [ ] Deployment successful
- [ ] Can access production URL
- [ ] Production login works
- [ ] Production save creates GitHub commits

---

## 📈 Next Steps

1. **Test locally** with your GitHub token
2. **Deploy to Render** following DEPLOYMENT.md
3. **Share credentials** with authorized users
4. **Monitor usage** via Render dashboard
5. **Backup content** regularly from GitHub

---

## 🎉 You're Ready!

Everything is implemented and tested. Follow this guide to deploy your CMS.

**Questions?** Check the detailed guides:

- Full deployment steps: `DEPLOYMENT.md`
- Testing procedures: `TESTING.md`
- Implementation details: `IMPLEMENTATION_SUMMARY.md`

Good luck! 🚀
