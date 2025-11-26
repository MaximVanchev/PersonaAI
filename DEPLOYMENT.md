# PersonaAI Production Deployment Guide

This guide covers deploying PersonaAI to a VPS server using git clone for deployment.

## Files Created

- `server.js` - Custom production server with graceful shutdown and logging
- `deploy.sh` - Automated deployment script with systemd service
- `ecosystem.config.json` - PM2 configuration (alternative process manager)
- `app/api/health/route.ts` - Health check endpoint for monitoring

## Prerequisites

### On your VPS server:

1. **Node.js and npm** (version 18 or higher)

```bash
# Install Node.js via NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Or using nvm (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18
```

2. **Git**

```bash
sudo apt update
sudo apt install git
```

3. **Database** (PostgreSQL recommended for Prisma)

```bash
sudo apt install postgresql postgresql-contrib
```

## Deployment Methods

### Method 1: Using the Deployment Script (Recommended)

1. **Upload and run the deployment script:**

```bash
# On your VPS
chmod +x deploy.sh
./deploy.sh
```

2. **Configure environment variables:**

```bash
cd /opt/PersonaAI  # or your chosen directory
nano .env.local
```

Add your actual environment variables:

```env
NODE_ENV=production
PORT=3000
DATABASE_URL="postgresql://username:password@localhost:5432/personaai"
OPENAI_API_KEY="your-openai-api-key"
```

3. **Restart the service:**

```bash
sudo systemctl restart personaai
```

### Method 2: Manual Deployment

1. **Clone the repository:**

```bash
cd /opt
sudo git clone https://github.com/MaximVanchev/PersonaAI.git
sudo chown -R $USER:$USER PersonaAI
cd PersonaAI
```

2. **Install dependencies and build:**

```bash
npm ci --only=production
npx prisma generate
npm run build
```

3. **Create environment file:**

```bash
cp .env.example .env.local  # if you have an example file
nano .env.local
```

4. **Run with Node.js directly:**

```bash
NODE_ENV=production node server.js
```

### Method 3: Using PM2 (Alternative Process Manager)

1. **Install PM2:**

```bash
npm install -g pm2
```

2. **Deploy and start:**

```bash
# After cloning and building
pm2 start ecosystem.config.json --env production
pm2 save
pm2 startup
```

## Configuration

### Environment Variables (.env.local)

```env
# Required
NODE_ENV=production
PORT=3000
DATABASE_URL="your-database-connection-string"
OPENAI_API_KEY="your-openai-api-key"

# Optional
HOSTNAME=localhost
```

### Reverse Proxy (Nginx)

Create `/etc/nginx/sites-available/personaai`:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/personaai /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## Management Commands

### Systemd Service Commands

```bash
# Check status
sudo systemctl status personaai

# Start/Stop/Restart
sudo systemctl start personaai
sudo systemctl stop personaai
sudo systemctl restart personaai

# View logs
sudo journalctl -u personaai -f
sudo journalctl -u personaai -n 100
```

### PM2 Commands (if using PM2)

```bash
# Status
pm2 status

# Logs
pm2 logs PersonaAI
pm2 logs PersonaAI --lines 100

# Restart
pm2 restart PersonaAI

# Stop
pm2 stop PersonaAI
```

## Monitoring

### Health Check

```bash
# Check application health
curl http://localhost:3000/api/health

# Expected response
{
  "status": "ok",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "uptime": 3600,
  "environment": "production",
  "version": "0.1.0",
  "memory": {
    "used": 150.25,
    "total": 200.00,
    "external": 25.50
  },
  "pid": 12345
}
```

### Log Monitoring

```bash
# Follow application logs
sudo journalctl -u personaai -f

# Check for errors
sudo journalctl -u personaai -p err
```

## Updating the Application

### Using the deployment script:

```bash
./deploy.sh
```

### Manual update:

```bash
cd /opt/PersonaAI
git pull origin main
npm ci --only=production
npm run build
sudo systemctl restart personaai
```

## SSL/HTTPS Setup

Use Certbot for Let's Encrypt SSL:

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

## Security Considerations

1. **Firewall:** Only open necessary ports (80, 443, 22)

```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

2. **Database Security:** Use strong passwords and restrict database access
3. **Environment Variables:** Never commit sensitive data to git
4. **Updates:** Keep system and dependencies updated

## Troubleshooting

### Common Issues:

1. **Port already in use:**

```bash
sudo lsof -i :3000
sudo kill -9 <PID>
```

2. **Permission errors:**

```bash
sudo chown -R $USER:$USER /opt/PersonaAI
```

3. **Database connection issues:**

- Check DATABASE_URL format
- Ensure database is running
- Verify credentials

4. **Build failures:**

- Check Node.js version compatibility
- Clear npm cache: `npm cache clean --force`
- Delete node_modules and reinstall

### Log Locations:

- Application logs: `sudo journalctl -u personaai`
- Nginx logs: `/var/log/nginx/error.log`
- System logs: `/var/log/syslog`

## Performance Optimization

1. **Enable gzip compression** in Nginx
2. **Use a CDN** for static assets
3. **Database optimization** (connection pooling, indexes)
4. **Monitor memory usage** and adjust accordingly
5. **Use PM2 cluster mode** for multiple CPU cores

For support, check the application logs and health endpoint first.
