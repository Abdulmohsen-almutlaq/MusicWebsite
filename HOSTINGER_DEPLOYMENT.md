# Hostinger Docker VPS Deployment Guide

## 🚀 Quick Deployment Steps (Even Easier!)

### 1. Get Hostinger Docker VPS
- Go to https://www.hostinger.com/docker-hosting
- Choose **KVM 4 plan** ($9.99/mo) - includes Docker Manager
- Select Ubuntu OS
- Get your VPS IP: `YOUR_VPS_IP`

### 2. Use Docker Manager (No SSH needed!)
Hostinger's Docker Manager makes deployment visual and easy:

1. **Login to Hostinger Panel**
2. **Go to Docker Manager**
3. **Upload your docker-compose.yml**
4. **Upload your .env file**
5. **Click "Deploy"**

That's it! Your app is live.

### 3. Alternative: Manual Deployment
If you prefer command line:

```bash
# Connect to your VPS
ssh root@YOUR_VPS_IP

# Install Docker (usually pre-installed on Docker VPS)
docker --version
docker-compose --version

# Upload your project
scp -r MusicWebsite root@YOUR_VPS_IP:~/

# Deploy
cd MusicWebsite
docker-compose up -d --build
```

### 4. Access Your App
- Frontend: `http://YOUR_VPS_IP:3000`
- Backend: `http://YOUR_VPS_IP:8080`
cd MusicWebsite

# Update .env with your actual domain/IP
nano .env
# Change PUBLIC_FRONTEND_URL and PUBLIC_BACKEND_URL

# Deploy
docker-compose up -d --build
```

### 6. Access Your App
- Frontend: `http://YOUR_VPS_IP:3000`
- Backend: `http://YOUR_VPS_IP:8080`

## 🔧 Optional: Domain & SSL Setup

### Get a Domain
- Buy domain from Hostinger (~$10/year)
- Point domain to your VPS IP

### Install SSL (Let's Encrypt)
```bash
# Install certbot
sudo apt install certbot -y

# Get SSL certificate
sudo certbot certonly --standalone -d yourdomain.com

# Your certificates will be in: /etc/letsencrypt/live/yourdomain.com/
```

### Setup Reverse Proxy (NGINX)
```bash
# Install NGINX
sudo apt install nginx -y

# Create config
sudo nano /etc/nginx/sites-available/yourdomain.com

# Add this config:
server {
    listen 80;
    server_name yourdomain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    # SSL certificates
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Frontend (Next.js)
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Enable site
sudo ln -s /etc/nginx/sites-available/yourdomain.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 📊 Monitoring Your App

Use Hostinger's built-in tools:
- Docker Manager for container monitoring
- AI Assistant (Kodee) for troubleshooting
- Resource usage graphs

## 🔄 Updates

To update your app:
```bash
cd MusicWebsite
git pull origin main
docker-compose down
docker-compose up -d --build
```

## 💾 Backup Strategy

- Hostinger provides weekly automated backups
- Manual snapshots before major updates
- Database files are in `./data/` volume - backed up automatically

## 🚨 Important Notes

- Keep your JWT_SECRET and GLOBAL_ACCESS_PASSWORD secure
- Monitor disk space (music files can fill up storage quickly)
- SQLite works for small-scale but consider PostgreSQL for growth
- Test email functionality with production SMTP settings