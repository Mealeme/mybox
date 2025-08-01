# EC2 Deployment Guide

## 📦 Deployment Package Created
Your application has been packaged into `deployment-package.zip` which contains all the built files from the `dist` folder.

## 🚀 Deployment Options

### Option 1: Manual EC2 Deployment (Recommended)

#### Prerequisites:
- EC2 instance running (Ubuntu/Amazon Linux)
- SSH access to your EC2 instance
- Web server (Nginx/Apache) installed

#### Step 1: Upload Files to EC2

```bash
# Upload the deployment package to your EC2 instance
scp -i "your-key.pem" deployment-package.zip ubuntu@your-ec2-ip:/home/ubuntu/

# Or if using Windows PowerShell:
scp -i "your-key.pem" deployment-package.zip ubuntu@your-ec2-ip:/home/ubuntu/
```

#### Step 2: SSH into EC2 and Set Up Web Server

```bash
# SSH into your EC2 instance
ssh -i "your-key.pem" ubuntu@your-ec2-ip

# Install Nginx (Ubuntu)
sudo apt update
sudo apt install nginx -y

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Extract the deployment package
cd /home/ubuntu
unzip deployment-package.zip

# Move files to web server directory
sudo mv * /var/www/html/

# Set proper permissions
sudo chown -R www-data:www-data /var/www/html/
sudo chmod -R 755 /var/www/html/

# Configure Nginx for SPA (Single Page Application)
sudo nano /etc/nginx/sites-available/default
```

#### Step 3: Configure Nginx for React App

Add this configuration to `/etc/nginx/sites-available/default`:

```nginx
server {
    listen 80;
    server_name your-domain.com;  # Replace with your domain or EC2 public IP
    
    root /var/www/html;
    index index.html;
    
    # Handle client-side routing
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
}
```

#### Step 4: Restart Nginx

```bash
# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx

# Check status
sudo systemctl status nginx
```

### Option 2: Automated Deployment Script

Create a deployment script for future updates:

```bash
#!/bin/bash
# deploy.sh

EC2_IP="your-ec2-ip"
KEY_PATH="your-key.pem"
REMOTE_USER="ubuntu"

echo "🚀 Deploying to EC2..."

# Upload files
scp -i "$KEY_PATH" deployment-package.zip $REMOTE_USER@$EC2_IP:/home/ubuntu/

# Execute deployment commands on EC2
ssh -i "$KEY_PATH" $REMOTE_USER@$EC2_IP << 'EOF'
    cd /home/ubuntu
    unzip -o deployment-package.zip
    sudo rm -rf /var/www/html/*
    sudo mv * /var/www/html/
    sudo chown -R www-data:www-data /var/www/html/
    sudo chmod -R 755 /var/www/html/
    sudo systemctl restart nginx
    echo "✅ Deployment completed!"
EOF
```

## 🔧 Additional Setup

### 1. Configure Security Groups
- Open port 80 (HTTP) and 443 (HTTPS) in your EC2 security group
- Open port 22 (SSH) for deployment access

### 2. Set Up HTTPS (Optional)
```bash
# Install Certbot for SSL
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d your-domain.com
```

### 3. Set Up Domain (Optional)
- Point your domain to your EC2 public IP
- Update Nginx configuration with your domain name

## 📋 Quick Commands

### Check if deployment worked:
```bash
# Test locally
curl http://your-ec2-ip

# Check Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Update deployment:
```bash
# Rebuild and redeploy
npm run build
Compress-Archive -Path "dist\*" -DestinationPath "deployment-package.zip" -Force
# Then run your deployment script
```

## 🆘 Troubleshooting

### Common Issues:
1. **Permission denied**: Check file permissions and ownership
2. **404 errors**: Ensure Nginx configuration includes `try_files $uri $uri/ /index.html;`
3. **Port not accessible**: Check EC2 security group settings
4. **Nginx not starting**: Check configuration with `sudo nginx -t`

### Useful Commands:
```bash
# Check Nginx status
sudo systemctl status nginx

# View Nginx configuration
sudo cat /etc/nginx/sites-available/default

# Check file permissions
ls -la /var/www/html/

# Monitor logs
sudo tail -f /var/log/nginx/error.log
```

## 🎯 Next Steps

1. Replace `your-ec2-ip` with your actual EC2 public IP
2. Replace `your-key.pem` with your actual key file path
3. Replace `your-domain.com` with your actual domain (if applicable)
4. Run the deployment commands
5. Test your application at `http://your-ec2-ip`

Your application should now be accessible via your EC2 instance's public IP address! 