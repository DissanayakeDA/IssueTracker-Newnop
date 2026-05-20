# AWS Free Tier Deployment Guide

Deploy the Issue Tracker on AWS without spending a cent using only free-tier-eligible services.

## Architecture overview

| Layer | Service | Free tier allowance |
|-------|---------|---------------------|
| Frontend | **AWS Amplify Hosting** | 1,000 build min/mo, 15 GB served/mo, 5 GB storage |
| Backend | **Amazon EC2 t2.micro** | 750 hours/mo (12 months) |
| Database | **MongoDB Atlas M0** | 512 MB storage, free forever |
| DNS/SSL | **Amplify** auto-provisions HTTPS; backend uses **Nginx + Let's Encrypt** |

> **Note:** The 12-month free tier starts from AWS account creation. After 12 months, the EC2 instance costs ~$8.50/mo (t2.micro on-demand, us-east-1). Delete it if you no longer need it.

---

## Prerequisites

- An **AWS account** (credit card required for sign-up, but nothing is charged within free tier).
- **Git** and your code pushed to a **GitHub** repository.
- A local terminal with **SSH** support (Git Bash on Windows works fine).
- **Node.js 18+** installed locally (for building/testing before deploy).

---

## Step 1 — Set a billing alarm (do this first!)

1. Go to **AWS Billing** > **Budgets** > **Create budget**.
2. Choose **Zero spend budget** — it alerts you the moment any charge appears.
3. Add your email for notifications.
4. Optionally create a second budget for **$5 USD** with 50%/80%/100% alerts.
5. Stick to **one region** for everything (recommended: `us-east-1`).

---

## Step 2 — MongoDB Atlas (free M0 cluster)

1. Go to [cloud.mongodb.com](https://cloud.mongodb.com) and create an account.
2. **Create a cluster** > Choose **M0 FREE** tier.
   - Provider: AWS
   - Region: `us-east-1` (same as your EC2 region for lower latency)
3. **Database Access** > Add a database user:
   - Username: `issuetracker`
   - Password: generate a strong password — save it
4. **Network Access** > Add IP Address:
   - For now, add `0.0.0.0/0` (allow from anywhere).
   - After deployment, restrict to your EC2 Elastic IP.
5. **Connect** > **Drivers** > Copy the connection string:
   ```
   mongodb+srv://issuetracker:<password>@cluster0.xxxxx.mongodb.net/issuetracker?retryWrites=true&w=majority
   ```
   Replace `<password>` with your actual password and add `issuetracker` as the database name.

---

## Step 3 — Launch an EC2 instance (backend)

### 3.1 Create a key pair

1. Go to **EC2** > **Key Pairs** > **Create key pair**.
2. Name: `issuetracker-key`
3. Type: RSA, Format: `.pem`
4. Download and keep the `.pem` file safe.

On macOS / Linux:
```bash
chmod 400 issuetracker-key.pem
```

On Windows — open **Git Bash** (not CMD or PowerShell) and run:
```bash
cd ~/Downloads
chmod 400 issuetracker-key.pem
```

Or in **PowerShell**:
```powershell
icacls "$env:USERPROFILE\Downloads\issuetracker-key.pem" /inheritance:r /grant:r "$($env:USERNAME):(R)"
```

### 3.2 Create a security group

1. **EC2** > **Security Groups** > **Create security group**.
2. Name: `issuetracker-backend-sg`
3. Add **Inbound rules**:

| Type | Port | Source | Purpose |
|------|------|--------|---------|
| SSH | 22 | My IP | SSH access |
| HTTP | 80 | 0.0.0.0/0 | Nginx redirect |
| HTTPS | 443 | 0.0.0.0/0 | API traffic (SSL) |
| Custom TCP | 5000 | 0.0.0.0/0 | Direct API (optional, for testing) |

### 3.3 Launch the instance

1. **EC2** > **Launch Instance**.
2. **Name**: `issuetracker-backend`
3. **AMI**: Amazon Linux 2023 (free tier eligible)
4. **Instance type**: `t2.micro` (free tier)
5. **Key pair**: `issuetracker-key`
6. **Security group**: select `issuetracker-backend-sg`
7. **Storage**: 8 GB gp3 (free tier allows up to 30 GB)
8. Launch.

### 3.4 Allocate an Elastic IP (free while attached)

1. **EC2** > **Elastic IPs** > **Allocate**.
2. **Associate** it with your `issuetracker-backend` instance.
3. Note this IP — your backend will live at this address.

> Elastic IPs are free **only** while associated with a running instance. Release it when you tear down.

---

## Step 4 — Set up the EC2 instance

SSH into the instance:

```bash
ssh -i issuetracker-key.pem ec2-user@<YOUR_ELASTIC_IP>
```

### 4.1 Install Node.js 20

```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
source ~/.bashrc

# Install Node 20
nvm install 20
node -v  # should print v20.x.x
```

### 4.2 Install PM2 (process manager)

```bash
npm install -g pm2
```

### 4.3 Install Git and clone the repo

```bash
sudo dnf install git -y
git clone https://github.com/<YOUR_USERNAME>/<YOUR_REPO>.git
cd <YOUR_REPO>
```

### 4.4 Install dependencies and build

```bash
npm ci
npm run build:backend
```

### 4.5 Create the environment file

```bash
cat > apps/backend/.env << 'EOF'
PORT=5000
NODE_ENV=production
MONGO_URI=mongodb+srv://issuetracker:<password>@cluster0.xxxxx.mongodb.net/issuetracker?retryWrites=true&w=majority
JWT_SECRET=your-strong-random-secret-minimum-32-chars
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://<your-amplify-domain>
EOF
```

Generate a strong JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 4.6 Start with PM2

```bash
# Start the backend
pm2 start apps/backend/dist/server.js --name issuetracker-api

# Verify it's running
pm2 status
curl http://localhost:5000/   # should return health check JSON

# Make PM2 survive reboots
pm2 startup
pm2 save
```

### 4.7 Install Nginx (reverse proxy + SSL)

```bash
sudo dnf install nginx -y
sudo systemctl enable nginx
sudo systemctl start nginx
```

Create the Nginx config:

```bash
sudo tee /etc/nginx/conf.d/issuetracker.conf > /dev/null << 'EOF'
server {
    listen 80;
    server_name <YOUR_ELASTIC_IP>;

    location / {
        proxy_pass http://127.0.0.1:5000;
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
EOF
```

```bash
sudo nginx -t          # test config
sudo systemctl reload nginx
```

Now `http://<YOUR_ELASTIC_IP>/api/issues` should return data.

### 4.8 (Optional) Add a domain + free SSL with Let's Encrypt

If you have a domain (e.g., `api.issuetracker.com`):

```bash
# Install certbot
sudo dnf install certbot python3-certbot-nginx -y

# Get certificate (replace with your domain)
sudo certbot --nginx -d api.yourdomain.com

# Auto-renew
sudo systemctl enable certbot-renew.timer
```

If you don't have a domain, the frontend can still call `http://<ELASTIC_IP>/api` — but browsers may block mixed content (HTTPS frontend calling HTTP backend). See the workaround in Step 6.

---

## Step 5 — Deploy the frontend (Amplify)

### 5.1 Push your code to GitHub

Make sure these files are committed and pushed:

- `amplify.yml` (already in the repo root)
- All source code under `apps/frontend/`

### 5.2 Create the Amplify app

1. Go to **AWS Amplify** console > **Create new app**.
2. Select **GitHub** > Authorize and choose your repo/branch.
3. **Monorepo** toggle: **ON** — set the app root to `apps/frontend`.
4. Amplify auto-detects `amplify.yml`. Verify the build settings look correct.
5. **Environment variables** > Add:

| Variable | Value |
|----------|-------|
| `VITE_API_URL` | `http://<YOUR_ELASTIC_IP>/api` (or `https://api.yourdomain.com/api` if using SSL) |

6. Click **Save and deploy**.

### 5.3 Add SPA rewrite rule

React Router needs all routes to serve `index.html`:

1. In Amplify > your app > **Rewrites and redirects**.
2. Add rule:
   - **Source**: `</^[^.]+$|\.(?!(css|gif|ico|jpg|js|png|txt|svg|woff|woff2|ttf|map|json|webp)$)([^.]+$)/>`
   - **Target**: `/index.html`
   - **Type**: `200 (Rewrite)`

### 5.4 Verify the frontend

Open the Amplify URL (e.g., `https://main.d1234abcde.amplifyapp.com`):

- Register a new user
- Login
- Create/edit/delete issues
- Check the dashboard stats

---

## Step 6 — Mixed content workaround (no domain)

If you don't have a custom domain, your Amplify frontend is HTTPS but the EC2 backend is HTTP. Browsers block this ("mixed content").

**Option A — Use a free subdomain** (recommended):
- Use [DuckDNS](https://www.duckdns.org/) — free dynamic DNS.
- Point `issuetracker-api.duckdns.org` to your Elastic IP.
- Then run `certbot --nginx -d issuetracker-api.duckdns.org` for free SSL.

**Option B — Self-signed cert** (development/demo only):
```bash
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/nginx/ssl/selfsigned.key \
  -out /etc/nginx/ssl/selfsigned.crt
```
Update Nginx to listen on 443 with the cert. Note: browsers will show a warning.

**Option C — CloudFront** (free tier: 1 TB/mo transfer):
- Create a CloudFront distribution pointing to `http://<ELASTIC_IP>`.
- CloudFront provides an HTTPS `*.cloudfront.net` URL automatically.
- Use that as your `VITE_API_URL`.

---

## Step 7 — Update CORS on the backend

After deploying, update the backend's `.env` on EC2:

```bash
# SSH into EC2
ssh -i issuetracker-key.pem ec2-user@<YOUR_ELASTIC_IP>

# Edit .env
cd <YOUR_REPO>
nano apps/backend/.env
```

Set `CORS_ORIGIN` to your Amplify frontend URL:
```
CORS_ORIGIN=https://main.d1234abcde.amplifyapp.com
```

Then restart:
```bash
pm2 restart issuetracker-api
```

---

## Step 8 — Updating your app

When you push code changes:

### Frontend
Amplify auto-deploys on every push to the connected branch. Just `git push`.

### Backend
```bash
# SSH into EC2
ssh -i issuetracker-key.pem ec2-user@<YOUR_ELASTIC_IP>
cd <YOUR_REPO>

git pull origin development
npm ci
npm run build:backend
pm2 restart issuetracker-api
```

---

## Free tier cost breakdown

| Service | Free tier | Your usage | Cost |
|---------|-----------|------------|------|
| EC2 t2.micro | 750 hrs/mo (12 months) | ~730 hrs/mo (24/7) | **$0** |
| EBS (8 GB gp3) | 30 GB free | 8 GB | **$0** |
| Elastic IP | Free while attached | 1 IP attached | **$0** |
| Amplify Hosting | 1,000 build min, 15 GB served | Low traffic | **$0** |
| MongoDB Atlas M0 | 512 MB, free forever | Small dataset | **$0** |
| Data transfer | 100 GB/mo out free | Low traffic | **$0** |
| **Total** | | | **$0/mo** |

---

## Cleanup when you're done

To avoid surprise charges after your free tier expires:

```bash
# 1. Terminate EC2 instance
aws ec2 terminate-instances --instance-ids <INSTANCE_ID>

# 2. Release Elastic IP
aws ec2 release-address --allocation-id <ALLOCATION_ID>

# 3. Delete Amplify app
aws amplify delete-app --app-id <APP_ID>
```

Or do it from the AWS Console:

1. **EC2** > Select instance > **Terminate**
2. **EC2** > **Elastic IPs** > **Release**
3. **Amplify** > Select app > **Delete app**
4. **CloudWatch** > **Log groups** > Delete any `issuetracker` log groups
5. **MongoDB Atlas** > Terminate cluster (if no longer needed)

---

## Quick architecture diagram

```
                    ┌─────────────────────────────┐
                    │   MongoDB Atlas M0 (free)    │
                    │   mongodb+srv://...          │
                    └──────────────┬──────────────┘
                                   │
┌──────────────┐    ┌──────────────┴──────────────┐
│   Browser    │───>│  EC2 t2.micro (free tier)   │
│              │    │  ┌────────┐  ┌───────────┐  │
│  Amplify URL │    │  │ Nginx  │─>│ Express   │  │
│  (React SPA) │    │  │ :443   │  │ :5000     │  │
│              │    │  └────────┘  └───────────┘  │
└──────┬───────┘    │  Elastic IP + PM2           │
       │            └─────────────────────────────┘
       │
┌──────┴───────┐
│ AWS Amplify  │
│ Hosting      │
│ (HTTPS auto) │
└──────────────┘
```

---

## Interview tips

- **Explain the architecture in 30 seconds**: "React SPA on Amplify, Express API on EC2 behind Nginx, MongoDB Atlas for persistence. All within AWS free tier."
- **Why EC2 over Lambda?**: "Express.js runs naturally as a long-lived process. Lambda would need cold-start optimization and a wrapper like serverless-express."
- **Why not ECS?**: "ECS Fargate has no free tier. EC2 t2.micro gives 750 free hours/month."
- **How do you handle deployments?**: "Frontend auto-deploys via Amplify CI/CD on git push. Backend is a simple git pull + rebuild + PM2 restart."
- **Security**: "JWT auth, bcrypt password hashing, CORS restricted to frontend origin, environment variables for secrets, HTTPS via Let's Encrypt."

