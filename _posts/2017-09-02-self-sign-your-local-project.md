---
layout: home
title: Self-sign your local web project served by nginx
tags:
  - ssl
  - self-sign
  - nginx
sources:
  - https://devcenter.heroku.com/articles/ssl-certificate-self
  - https://www.digitalocean.com/community/tutorials/how-to-secure-nginx-with-let-s-encrypt-on-ubuntu-16-04
  - https://letsecure.me/secure-web-deployment-with-lets-encrypt-and-nginx/
---

## Intro
Over the past year occasionally visited websites without https and noticed some login forms show a dropdown informing me I'm not on https.
Some fancy newly upgraded browser I thought, ey!
That plus internet is going forward and forcing or encouraging to use ssl configured websites. Good.
One evening said "hey I should make it happen to my local with let's encrypt".
Apparently it needs to be publicly available.
For local projects I just need to follow few 'simple' steps.

## Steps

### Let's create self-signed certificate

{% highlight shell %}
$ openssl genrsa -des3 -passout pass:password -out server.pass.key 2048
$ openssl rsa -passin pass:password -in server.pass.key -out server.key
$ rm server.pass.key
$ openssl req -new -key server.key -out server.csr
...
A challenge password []:
...
$ openssl x509 -req -sha256 -days 365 -in server.csr -signkey server.key -out server.crt
{% endhighlight %}

For password challenge can leave blank and just hit enter.

### Extra certificate

{% highlight shell %}
$ sudo openssl dhparam -out /etc/ssl/certs/dhparam.pem 2048
{% endhighlight %}

### Nginx configuration

{% highlight nginx %}
server {
    listen 80;
    listen [::]:80;
    listen 443 ssl http2;

    root /path/to/root;
    index index.php index.html index.htm;

    server_name domain.local *.domain.local;

    add_header Strict-Transport-Security "max-age=31557600; includeSubDomains";
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Xss-Protection "1";
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' *.google-analytics.com *.googleapis.com; style-src 'self' *.googleapis.com; font-src 'self' data: fonts.gstatic.com";
    add_header Referrer-Policy origin-when-cross-origin;

    ssl_certificate /etc/ssl/certs/server.crt;
    ssl_certificate_key /etc/ssl/private/server.key;
    ssl_ciphers 'ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-SHA384:ECDHE-RSA-AES256-SHA384:ECDHE-ECDSA-AES128-SHA256:ECDHE-RSA-AES128-SHA256';
    ssl_prefer_server_ciphers On;
    ssl_dhparam /etc/ssl/certs/dhparam.pem;
    ssl_protocols TLSv1.2;
    ssl_trusted_certificate /etc/ssl/certs/server.crt;
    ssl_stapling on;
    ssl_stapling_verify on;

    access_log /var/log/nginx/server.local/access.log;
    error_log /var/log/nginx/server.local/error.log;


    location / {
        if ($scheme = http) {
            return 301 https://$server_name$request_uri;
        }

        try_files $uri $uri/ /index.php$is_args$args;
    }

    location ~ \.php$ {
        fastcgi_split_path_info ^(.+\.php)(/.+)$;
        # NOTE: You should have "cgi.fix_pathinfo = 0;" in php.ini

        # With php7.1-fpm:
        fastcgi_pass unix:/run/php/php7.1-fpm-server.local.sock;

        fastcgi_index index.php;
        include fastcgi_params;

        fastcgi_param SCRIPT_FILENAME $document_root/$fastcgi_script_name;
    }
}
{% endhighlight %}
