#!/bin/bash
# QDNS Deployment Script
# This script sets up the Quantum DNS service for .trust TLD

# Exit on error
set -e

echo "=== QDNS Deployment Script ==="
echo "Setting up Quantum DNS for .trust TLD"
echo

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo "Please run as root"
  exit 1
fi

# Install required packages
echo "Installing required packages..."
apt-get update
apt-get install -y bind9 bind9utils bind9-doc dnsutils

# Create directories
echo "Creating directories..."
mkdir -p /var/named
mkdir -p /var/log/named
mkdir -p /var/named/keys
mkdir -p /etc/named

# Set permissions
echo "Setting permissions..."
chown -R bind:bind /var/named
chown -R bind:bind /var/log/named
chown -R bind:bind /var/named/keys
chmod 755 /var/named
chmod 755 /var/log/named
chmod 755 /var/named/keys

# Copy configuration files
echo "Copying configuration files..."
cp ./server/services/qdns-management/named.conf.trust /etc/bind/named.conf.local
cp ./server/services/qdns-management/trust.zone /var/named/trust.zone

# Generate DNSSEC keys
echo "Generating DNSSEC keys..."
cd /var/named/keys
dnssec-keygen -a ECDSAP256SHA256 -b 256 -n ZONE trust
dnssec-keygen -a ECDSAP256SHA256 -b 256 -f KSK -n ZONE trust

# Sign the zone
echo "Signing the zone..."
dnssec-signzone -A -3 $(head -c 16 /dev/random | od -A n -t x | tr -d ' \n') -N INCREMENT -o trust -t /var/named/trust.zone

# Configure rndc
echo "Configuring rndc..."
rndc-confgen -a -c /etc/bind/rndc.key
chown bind:bind /etc/bind/rndc.key
chmod 640 /etc/bind/rndc.key

# Update named.conf
echo "Updating named.conf..."
cat > /etc/bind/named.conf <<EOF
include "/etc/bind/named.conf.options";
include "/etc/bind/named.conf.local";
include "/etc/bind/named.conf.default-zones";
EOF

# Create options file
echo "Creating options file..."
cat > /etc/bind/named.conf.options <<EOF
options {
    directory "/var/named";
    version "QDNS Server 1.0";
    listen-on port 53 { any; };
    listen-on-v6 port 53 { any; };
    allow-query { any; };
    recursion no;
    dnssec-validation auto;
    dnssec-enable yes;
};

controls {
    inet 127.0.0.1 port 953 allow { localhost; };
};

logging {
    channel default_log {
        file "/var/log/named/default.log" versions 3 size 5m;
        severity info;
        print-time yes;
        print-category yes;
        print-severity yes;
    };
    
    channel security_log {
        file "/var/log/named/security.log" versions 3 size 5m;
        severity info;
        print-time yes;
        print-category yes;
        print-severity yes;
    };
    
    category default { default_log; };
    category security { security_log; };
};
EOF

# Restart BIND
echo "Restarting BIND..."
systemctl restart bind9
systemctl enable bind9

# Configure firewall
echo "Configuring firewall..."
ufw allow 53/tcp
ufw allow 53/udp
ufw allow 953/tcp

# Test DNS server
echo "Testing DNS server..."
dig @localhost trust. SOA

# Create a simple web interface for WHOIS
echo "Setting up WHOIS web interface..."
apt-get install -y nginx php-fpm

# Configure Nginx
cat > /etc/nginx/sites-available/whois.aethercoin.trust <<EOF
server {
    listen 80;
    server_name whois.aethercoin.trust;

    root /var/www/whois;
    index index.php index.html;

    location / {
        try_files \$uri \$uri/ /index.php?\$args;
    }

    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/var/run/php/php7.4-fpm.sock;
    }
}
EOF

# Create web directory
mkdir -p /var/www/whois

# Create a simple WHOIS interface
cat > /var/www/whois/index.php <<EOF
<!DOCTYPE html>
<html>
<head>
    <title>QDNS WHOIS Service</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background-color: white;
            padding: 20px;
            border-radius: 5px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        h1 {
            color: #333;
        }
        .form-group {
            margin-bottom: 15px;
        }
        label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
        }
        input[type="text"] {
            width: 100%;
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 4px;
            box-sizing: border-box;
        }
        button {
            background-color: #4CAF50;
            color: white;
            padding: 10px 15px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }
        button:hover {
            background-color: #45a049;
        }
        pre {
            background-color: #f8f8f8;
            padding: 15px;
            border-radius: 4px;
            overflow-x: auto;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>QDNS WHOIS Service</h1>
        <p>Look up domain information in the .trust TLD</p>
        
        <form method="post">
            <div class="form-group">
                <label for="domain">Domain Name:</label>
                <input type="text" id="domain" name="domain" placeholder="example.trust" 
                       value="<?php echo isset(\$_POST['domain']) ? htmlspecialchars(\$_POST['domain']) : ''; ?>">
            </div>
            <button type="submit">Lookup</button>
        </form>
        
        <?php if (isset(\$_POST['domain'])): ?>
            <h2>WHOIS Results</h2>
            <pre><?php
                \$domain = trim(\$_POST['domain']);
                if (!empty(\$domain)) {
                    // Simple validation
                    if (preg_match('/^[a-z0-9][a-z0-9-]{0,61}[a-z0-9]\\.trust$/i', \$domain)) {
                        // Execute whois command
                        \$output = shell_exec('whois ' . escapeshellarg(\$domain) . ' 2>&1');
                        echo htmlspecialchars(\$output ?: 'No results found');
                    } else {
                        echo "Invalid domain format. Please enter a valid .trust domain.";
                    }
                } else {
                    echo "Please enter a domain name.";
                }
            ?></pre>
        <?php endif; ?>
    </div>
</body>
</html>
EOF

# Set permissions
chown -R www-data:www-data /var/www/whois

# Enable the site
ln -sf /etc/nginx/sites-available/whois.aethercoin.trust /etc/nginx/sites-enabled/
systemctl restart nginx

echo
echo "=== QDNS Deployment Complete ==="
echo "Your Quantum DNS server for .trust TLD is now running!"
echo "WHOIS interface is available at: http://whois.aethercoin.trust"
echo
echo "Next steps:"
echo "1. Update your domain registrar to point to this nameserver"
echo "2. Configure additional security measures"
echo "3. Set up monitoring and backup"
echo
echo "For more information, visit: https://aethercoin.trust/qdns-docs"
echo