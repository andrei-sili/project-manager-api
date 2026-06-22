# Deploying live

Reference deployment used for the public demo.

```
                 ┌──────────────────────────┐
  pm.andreisili.com  →   Vercel (Next.js)   │   frontend
                 └─────────────┬────────────┘
                               │ HTTPS (REST + WSS)
                 ┌─────────────▼────────────┐
 api.andreisili.com →  Oracle Cloud VM      │
                 │   Caddy (auto-HTTPS)      │   backend
                 │     └─ Daphne (Django)    │
                 │     ├─ PostgreSQL         │
                 │     └─ Redis              │
                 └──────────────────────────┘
```

Vercel hosts only the frontend (it can't run Django/Channels/WebSockets). The
backend runs the `docker-compose.prod.yml` stack on a small always-free VM with
Caddy terminating TLS.

---

## A. Oracle Cloud VM (Always Free)

1. Create an Oracle Cloud account → **Compute → Instances → Create instance**.
2. Image **Ubuntu 22.04**, shape **VM.Standard.A1.Flex** (Ampere/ARM, Always
   Free — e.g. 1–2 OCPU, 6–12 GB RAM). Add your SSH public key.
3. After it boots, note the **public IP**.
4. Open **80** and **443**:
   - VCN **Security List**: add ingress rules for TCP 80 and 443 from `0.0.0.0/0`.
   - On the VM, also allow them in the host firewall:
     ```bash
     sudo iptables -I INPUT 1 -p tcp --dport 80 -j ACCEPT
     sudo iptables -I INPUT 1 -p tcp --dport 443 -j ACCEPT
     sudo netfilter-persistent save   # if installed; otherwise the ufw equivalent
     ```

## B. DNS

In the DNS manager for `andreisili.com` (Vercel DNS or your registrar):

| Type  | Name  | Value                         | Purpose            |
|-------|-------|-------------------------------|--------------------|
| A     | `api` | `<Oracle VM public IP>`       | backend            |
| CNAME | `pm`  | `cname.vercel-dns.com`        | frontend on Vercel |

(The `pm` CNAME exact value is shown by Vercel when you add the domain.)

## C. Backend on the VM

SSH in, install Docker, then run the production stack:

```bash
# Docker Engine + compose plugin
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER && newgrp docker

git clone https://github.com/andrei-sili/project-manager-api.git
cd project-manager-api

cp deploy/.env.prod.example .env
# Edit .env: SECRET_KEY (generate one), DATABASE_PASSWORD, API_DOMAIN, FRONTEND_DOMAIN
nano .env

docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml exec backend python seed_demo.py   # optional demo data
```

Caddy issues the TLS certificate automatically once `api.andreisili.com` points
to the VM. Verify:

```bash
curl -fsS https://api.andreisili.com/api/health/      # {"status": "ok"}
```

## D. Frontend on Vercel

1. **New Project** → import `project-manager-api`.
2. **Root Directory:** `frontend`.
3. **Environment variable:** `NEXT_PUBLIC_API_URL = https://api.andreisili.com/api`
   (used at build time for both REST and the WebSocket URL).
4. Deploy, then **Settings → Domains** → add `pm.andreisili.com`.

## Verify end-to-end

- `https://pm.andreisili.com` loads and you can log in (`alice@example.com` /
  `Demo1234!` if seeded).
- The notification bell connects (WebSocket to `wss://api.andreisili.com/ws/...`).
- `https://api.andreisili.com/api/docs/` shows Swagger.

## Updating

```bash
cd project-manager-api && git pull
docker compose -f docker-compose.prod.yml up -d --build
```

The frontend redeploys automatically on every push to the default branch.
