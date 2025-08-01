# EC2 Deployment Script for Windows PowerShell
# Usage: .\deploy-to-ec2.ps1

param(
    [Parameter(Mandatory=$true)]
    [string]$EC2IP,
    
    [Parameter(Mandatory=$true)]
    [string]$KeyPath,
    
    [Parameter(Mandatory=$false)]
    [string]$RemoteUser = "ubuntu"
)

Write-Host "🚀 Starting EC2 Deployment..." -ForegroundColor Green

# Check if deployment package exists
if (-not (Test-Path "deployment-package.zip")) {
    Write-Host "❌ deployment-package.zip not found!" -ForegroundColor Red
    Write-Host "Please run: npm run build && Compress-Archive -Path 'dist\*' -DestinationPath 'deployment-package.zip' -Force" -ForegroundColor Yellow
    exit 1
}

# Check if key file exists
if (-not (Test-Path $KeyPath)) {
    Write-Host "❌ Key file not found: $KeyPath" -ForegroundColor Red
    exit 1
}

Write-Host "📦 Uploading deployment package to EC2..." -ForegroundColor Blue

try {
    # Upload the deployment package
    $scpCommand = "scp -i `"$KeyPath`" deployment-package.zip ${RemoteUser}@${EC2IP}:/home/${RemoteUser}/"
    Write-Host "Executing: $scpCommand" -ForegroundColor Gray
    Invoke-Expression $scpCommand
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Upload successful!" -ForegroundColor Green
    } else {
        Write-Host "❌ Upload failed!" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Error during upload: $_" -ForegroundColor Red
    exit 1
}

Write-Host "🔧 Deploying on EC2..." -ForegroundColor Blue

# SSH commands to deploy on EC2
$sshCommands = @"
cd /home/$RemoteUser
unzip -o deployment-package.zip
sudo rm -rf /var/www/html/*
sudo mv * /var/www/html/
sudo chown -R www-data:www-data /var/www/html/
sudo chmod -R 755 /var/www/html/
sudo systemctl restart nginx
echo '✅ Deployment completed!'
"@

try {
    # Execute deployment commands on EC2
    $sshCommand = "ssh -i `"$KeyPath`" ${RemoteUser}@${EC2IP} `"$sshCommands`""
    Write-Host "Executing deployment commands..." -ForegroundColor Gray
    Invoke-Expression $sshCommand
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Deployment completed successfully!" -ForegroundColor Green
        Write-Host "🌐 Your application should now be available at: http://$EC2IP" -ForegroundColor Cyan
    } else {
        Write-Host "❌ Deployment failed!" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Error during deployment: $_" -ForegroundColor Red
    exit 1
}

Write-Host "🎉 Deployment completed! Check your application at http://$EC2IP" -ForegroundColor Green 