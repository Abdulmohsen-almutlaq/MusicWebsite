# Local NGINX Testing Guide

## 🧪 Test Your App with NGINX Locally

### Start with NGINX:
```bash
# Build and start all services including NGINX
docker-compose up -d --build

# Check if everything is running
docker-compose ps
```

### Access Your App:
- **Frontend**: http://localhost (port 80)
- **Direct Frontend**: http://localhost:3000 (bypass NGINX)
- **Direct Backend**: http://localhost:8080 (bypass NGINX)

### Test API Routes:
- **Through NGINX**: http://localhost/api/auth/login
- **Direct**: http://localhost:8080/auth/login

### Check Logs:
```bash
# NGINX logs
docker-compose logs nginx

# Frontend logs
docker-compose logs frontend

# Backend logs
docker-compose logs api
```

### Stop Testing:
```bash
# Stop all services
docker-compose down

# Remove volumes if you want to start fresh
docker-compose down -v
```

## 🔧 Troubleshooting

### NGINX Not Starting:
```bash
# Check NGINX config syntax
docker run --rm -v $(pwd)/nginx.conf:/etc/nginx/nginx.conf nginx:alpine nginx -t
```

### Port 80 Already in Use:
```bash
# On Windows, stop IIS or other services using port 80
# Or change NGINX port in docker-compose.yml to 8080:80
```

### CORS Issues:
- NGINX handles CORS headers automatically
- Check browser console for any remaining CORS errors

## 🎯 What This Tests

✅ **Reverse Proxy**: NGINX routes requests correctly
✅ **Static Files**: CSS/JS/images served efficiently
✅ **API Routing**: /api requests go to backend
✅ **WebSocket Support**: Real-time features work
✅ **Security Headers**: Basic security headers applied
✅ **Production Ready**: Same setup as Hostinger

## 🚀 Ready for Hostinger

Once tested locally, your setup is ready for Hostinger Docker VPS! Just:
1. Update `.env` with your domain
2. Deploy to Hostinger
3. Add SSL certificates
4. Done! 🎉