# Deploying kani.lk

Two paths, per the build brief. Pick one — both are documented in full below.

---

## Path A — Vercel + MongoDB Atlas (simplest)

This is the recommended path for launch. No server to patch, automatic SSL,
automatic preview deployments on every PR.

### 1. MongoDB Atlas

1. Create a free **M0** cluster (512MB — see the storage note in
   [CLAUDE.md](../CLAUDE.md) and Section 9 of the build brief for when to
   upgrade) or an **M10** if you want headroom from day one.
2. Database Access → add a user with **readWrite** on the target database.
3. Network Access → add `0.0.0.0/0` (Vercel's outbound IPs are not static) or,
   for tighter security, use **Atlas → Vercel integration** which manages
   this automatically.
4. Copy the connection string — this is `MONGODB_URI`.

### 2. Vercel project

```bash
npm i -g vercel
vercel link
```

In the Vercel dashboard, set every variable from `.env.example` under
**Settings → Environment Variables** (Production **and** Preview). Do not
paste `.env.local` directly into a screenshot or a support ticket — treat it
like a password file.

### 3. Domain

**Settings → Domains** → add `kani.lk` and `www.kani.lk`. Vercel gives you
either an A record (apex) or a CNAME (`www`) to add at your registrar (the LK
Domain Registry, or wherever `kani.lk` is registered). SSL is issued
automatically once DNS resolves.

`.lk` DNS propagation can take up to 24 hours — do not schedule a go-live
announcement for the same hour you flip DNS.

### 4. Seed the production database once

```bash
MONGODB_URI="<production URI>" \
SEED_ADMIN_EMAIL="admin@kani.lk" \
SEED_ADMIN_PASSWORD="<a real password, not the sample one>" \
npx tsx scripts/seed.ts
```

**Change the sample listings and superadmin password before go-live** — the
seed script is meant for a populated demo, not production content. Either
edit `scripts/seed-data.ts` to real listings before running it once, or run
it once for the demo and then manage everything through `/admin` from then
on (re-running `seed` wipes and replaces every `kani_*` collection).

### 5. Push

```bash
vercel --prod
```

Or connect the GitHub repo in the Vercel dashboard for automatic deploys on
push to `main` — this is the standard setup and needs no extra CI config.

---

## Path B — VPS (Ubuntu 22.04 + Nginx + PM2)

Matches the brief's LKR 40,000/year hosting line. More to maintain, full
control.

### 1. Server setup

```bash
# As root, on a fresh Ubuntu 22.04 droplet/VPS
apt update && apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs nginx certbot python3-certbot-nginx
npm install -g pm2

# Firewall: only what's needed
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable

# App user (never run the app as root)
adduser --disabled-password --gecos "" kani
```

### 2. Deploy the app

```bash
su - kani
git clone <your-repo-url> kani.lk
cd kani.lk
npm ci
cp .env.example .env.local   # fill in every value — see below
npm run build
```

### 3. PM2

```bash
pm2 start npm --name kani -- start
pm2 save
pm2 startup   # follow the printed instructions to enable on boot
```

### 4. Nginx reverse proxy

`/etc/nginx/sites-available/kani.lk`:

```nginx
server {
    listen 80;
    server_name kani.lk www.kani.lk;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
ln -s /etc/nginx/sites-available/kani.lk /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
```

### 5. SSL

```bash
certbot --nginx -d kani.lk -d www.kani.lk
```

Certbot installs a systemd timer for renewal automatically — no cron entry
needed, but confirm with `systemctl list-timers | grep certbot`.

### 6. Deploy on push (GitHub Actions)

See [.github/workflows/deploy.yml](../.github/workflows/deploy.yml) — it
SSHes in, pulls, rebuilds, and restarts PM2 on every push to `main`. Add
these repository secrets: `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`.

### 7. Nightly backups

See [scripts/backup.sh](../scripts/backup.sh) — `mongodump` piped to gzip,
uploaded to S3-compatible object storage. Wire it up with cron:

```bash
crontab -e
# 2am daily
0 2 * * * /home/kani/kani.lk/scripts/backup.sh >> /var/log/kani-backup.log 2>&1
```

---

## Environment variables

Every variable in `.env.example` is required unless marked optional. Never
commit `.env` or `.env.local` — both are already in `.gitignore`.

| Variable | Notes |
|---|---|
| `MONGODB_URI` | Full connection string, including credentials |
| `JWT_SECRET`, `JWT_REFRESH_SECRET` | Generate with `openssl rand -base64 48`, keep them different from each other |
| `SMTP_HOST` / `PORT` / `USER` / `PASS` | If using Gmail, this must be an **App Password**, not the account password — Google rejects the account password over SMTP even with correct credentials otherwise |
| `MAIL_FROM` | The From header on outgoing mail |
| `ADMIN_NOTIFY_EMAIL` | Where new-enquiry notifications land |
| `NEXT_PUBLIC_SITE_URL` | No trailing slash — used in sitemap, JSON-LD, and email links |
| `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` / `SEED_ADMIN_NAME` | Only read by `npm run seed` |

## Post-deploy checklist

- [ ] Real `SMTP_*` credentials verified — the server logs `[mail] SMTP transport verified` on boot; if it logs a verification failure instead, enquiries are still saved to Mongo (never lost) but no email goes out until this is fixed
- [ ] `heroImageUrl` in `/admin/settings` (or `public/banner.jpg`) replaced with the client's real photography
- [ ] `public/logo.png` and favicon replaced with the real logo art
- [ ] Sample listings replaced or removed (`/admin/lands`)
- [ ] Seed superadmin password changed, or a new superadmin created and the seed one deactivated
- [ ] `NEXT_PUBLIC_SITE_URL` matches the live domain exactly (affects sitemap + JSON-LD + email links)
- [ ] Run Lighthouse on the live URL, mobile profile — see Section 10 of the build brief for the performance budget
