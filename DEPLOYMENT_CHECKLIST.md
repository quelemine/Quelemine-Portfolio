# Deployment Checklist — Isaac L. Quelemine Portfolio

## Stack
- **Framework**: Next.js 16 (App Router, Turbopack)
- **Runtime**: Node.js 18+
- **Styling**: Tailwind CSS v4
- **Animations**: Framer Motion
- **Data storage**: localStorage only (no database)

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_ADMIN_PASSWORD` | **Yes** | Password for `/admin` dashboard. Must be set — login fails without it. |
| `GITHUB_TOKEN` | No | GitHub PAT to raise API rate limit (60 → 5000 req/hr). Read-only scopes: `read:user`, `public_repo`. |

Copy `.env.example` to `.env.local` and fill in values before deploying.

---

## Build & Start Commands

```bash
npm install          # Install dependencies
npm run build        # Production build (outputs to .next/)
npm start            # Start production server (port 3000)
```

---

## Deployment Platforms

### Vercel (Recommended)
1. Connect GitHub repo `quelemine/Quelemine-Portfolio` to Vercel.
2. Set environment variables in Vercel dashboard → Settings → Environment Variables.
3. Deploy from `master` branch.
4. Custom domain: `queleminetech.info` → add in Vercel Domains settings.

### Other Node.js Hosts (Railway, Render, VPS)
1. Set `NODE_ENV=production`.
2. Set all env vars listed above.
3. Run `npm run build && npm start`.
4. Expose port `3000` (or set `PORT` env var).

---

## No Database Required
All chat/session logging uses **browser localStorage** only. No database setup, migrations, or connection strings needed.

---

## Static Assets
All assets are in `public/`:
- `public/images/profile/` — profile photos (already committed)
- `public/images/projects/` — project SVG thumbnails (already committed)
- `public/resume.pdf` — CV download (already committed)

---

## API Routes
| Route | Type | Description |
|---|---|---|
| `GET /api/github` | Dynamic | Fetches real GitHub stats (repos, stars, forks, followers). Cached 1hr. |

---

## Security Headers (applied automatically)
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`

---

## Pre-Deployment Checklist

- [ ] `NEXT_PUBLIC_ADMIN_PASSWORD` set in hosting environment
- [ ] `npm run build` passes with zero errors
- [ ] `npx tsc --noEmit` passes with zero errors
- [ ] No `.env` or `.env.local` committed to Git
- [ ] Profile images load correctly
- [ ] Resume PDF downloads correctly
- [ ] AI Assistant opens and responds
- [ ] GitHub stats section loads (or shows graceful fallback)
- [ ] Contact form opens Gmail compose
- [ ] All nav links scroll to correct sections
- [ ] Mobile menu works
- [ ] Language switcher works
- [ ] Admin dashboard accessible at `/admin` with correct password

---

## Final Test Results (pre-push)
- TypeScript: ✅ 0 errors
- Production build: ✅ Passed
- npm audit: ✅ 0 vulnerabilities
- Security headers: ✅ Applied
- Hardcoded secrets: ✅ None
- Broken links: ✅ Fixed (Instagram/Twitter placeholder URLs replaced)
- Broken images: ✅ Fixed (github-readme-stats 503 replaced with real API)
- Dead code: ✅ None found
- Console logs: ✅ None found

---

## Git
- **Repository**: `https://github.com/quelemine/Quelemine-Portfolio.git`
- **Branch**: `master`
