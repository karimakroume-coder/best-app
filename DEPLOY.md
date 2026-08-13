# Deploying the BEST backend (Railway or Render, free tier)

Why: `.github/workflows/agents.yml` runs the 20 AI agents every 30 minutes
on GitHub's servers, but they need a real `BEST_API_URL` to call — right
now that variable is hardcoded to `http://localhost:8000`, which doesn't
exist on a GitHub-hosted runner. Deploying `main.py` somewhere public
fixes that, and the agents (and your phone) stop depending on your laptop
being on.

Required environment variables (same five values as your local `.env`):

- `YOUTUBE_API_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_KEY`
- `SECRET_KEY`
- `GEMINI_API_KEY`

Start command (already in the repo's `Procfile`, both platforms read it):

```
web: uvicorn main:app --host 0.0.0.0 --port $PORT
```

No code changes are needed — `main.py` already binds to `0.0.0.0` and
CORS is already open (`allow_origins=["*"]`).

---

## Option A: Railway (CLI, recommended — fastest path)

1. Install the CLI and log in:
   ```
   npm i -g @railway/cli
   railway login
   ```
2. From the project root, create the project and link it:
   ```
   railway init
   ```
3. Set the five environment variables (repeat per variable, or paste
   values one at a time when prompted):
   ```
   railway variables --set "YOUTUBE_API_KEY=your_value"
   railway variables --set "SUPABASE_URL=your_value"
   railway variables --set "SUPABASE_SERVICE_KEY=your_value"
   railway variables --set "SECRET_KEY=your_value"
   railway variables --set "GEMINI_API_KEY=your_value"
   ```
4. Deploy:
   ```
   railway up
   ```
5. Generate a public URL (Railway doesn't expose one by default):
   ```
   railway domain
   ```
   This prints something like `https://best-app-production.up.railway.app`
   — that's your new `BEST_API_URL`.
6. Confirm it's live:
   ```
   curl https://YOUR-RAILWAY-URL/health
   ```
   Expect `{"status":"ok"}`.

Railway's free usage tier and limits change over time — check
railway.app/pricing before relying on it for anything beyond testing.

---

## Option B: Render (dashboard-based)

1. Go to render.com → **New** → **Web Service** → connect this GitHub repo.
2. Settings:
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type**: Free
3. Under **Environment Variables**, add the same five keys/values listed
   above.
4. Click **Create Web Service**. Render builds and deploys automatically
   on every push to `main` from then on.
5. Once live, Render gives you a URL like
   `https://best-app.onrender.com` — that's your `BEST_API_URL`.
6. Confirm:
   ```
   curl https://YOUR-RENDER-URL/health
   ```

Render's free web services sleep after a period of inactivity and take
a few seconds to wake on the next request — check render.com/pricing
for current behavior. Since the agents workflow hits the API every 30
minutes, this is usually a minor cold-start delay rather than a real
problem, but it's worth knowing about if a scheduled agent run ever
times out.

---

## After deploying: point GitHub Actions at the live URL

The workflow reads `BEST_API_URL` from a GitHub Actions secret and falls
back to `http://localhost:8000` only if that secret isn't set. Once you
have a real URL from Option A or B, set it with the GitHub CLI:

```
gh secret set BEST_API_URL --body "https://YOUR-DEPLOYED-URL"
```

Or manually: repo → **Settings** → **Secrets and variables** → **Actions**
→ **New repository secret** → name `BEST_API_URL`, value the deployed URL.

Also add the other four secrets the same way (`SUPABASE_URL`,
`SUPABASE_SERVICE_KEY`, `GEMINI_API_KEY`) — the workflow needs its own
copies even though you already set them on Railway/Render, since GitHub
Actions runs in a separate, empty environment each time.

Once all secrets are set, trigger a manual run to confirm end-to-end:

```
gh workflow run agents.yml
gh run watch
```
