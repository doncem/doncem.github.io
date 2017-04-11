---
layout: home
title: How to upgrade PHP7.x on Ubuntu
tags:
  - PHP7
  - php-fpm
  - nginx
source: https://www.thinkingmedia.ca/2017/02/how-to-upgrade-php-7-0-to-php-7-1-on-ubuntu/
---

## Intro
Been waiting for PHP7 to come out and be available in usual Ubuntu repos but successfully ignored my ability to Google for that, xe.
Finally, picked one evening and followed several how-to's in order to set up as properly as possible php-fpm + nginx.
Shortly after PHP7.1 came out and I simply could not be bothered to figure out an upgrade.

## Steps to upgrade

### Check current

{% highlight shell %}
$ php -v
PHP 7.0.17-3+deb.sury.org~yakkety+1 (cli) (built: April 08 2017 09:50:13) ( NTS )
Copyright (c) 1997-2017 The PHP Group
Zend Engine v3.0.0, Copyright (c) 1998-2017 Zend Technologies
    with Zend OPcache v7.0.17-3+deb.sury.org~trusty+1, Copyright (c) 1999-2017, by Zend Technologies
    with Xdebug v2.5.1, Copyright (c) 2002-2017, by Derick Rethans
{% endhighlight %}

### Extra package

Not sure if it is optional

{% highlight shell %}
$ sudo apt-get install python-software-properties
{% endhighlight %}

### Grep current modules

Checking:

{% highlight shell %}
$ dpkg --get-selections | grep -v deinstall | grep php7.0
{% endhighlight %}

Will produce something like this:

{% highlight shell %}
php7.0              install
php7.0-cli          install
php7.0-common       install
php7.0-curl         install
php7.0-fpm          install
php7.0-gd           install
php7.0-json         install
php7.0-mbstring     install
php7.0-mysql        install
php7.0-opcache      install
php7.0-readline     install
php7.0-xml          install
{% endhighlight %}

Let's grab the first column:

{% highlight shell %}
$ dpkg --get-selections | grep -v deinstall | grep php7.0 | awk '{print $1}' > php-packages.txt
{% endhighlight %}

### Replace PHP7.0 with PHP7.1

{% highlight shell %}
$ cat php-packages.txt | xargs sudo apt-get remove -y
$ sed 's/7.0/7.1/' php-packages.txt | xargs sudo apt-get install -y
{% endhighlight %}

### And what do we have?

{% highlight shell %}
$ php -v
PHP 7.1.3-3+deb.sury.org~yakkety+1 (cli) (built: Mar 25 2017 14:01:32) ( NTS )
Copyright (c) 1997-2017 The PHP Group
Zend Engine v3.1.0, Copyright (c) 1998-2017 Zend Technologies
    with Zend OPcache v7.1.3-3+deb.sury.org~yakkety+1, Copyright (c) 1999-2017, by Zend Technologies
    with Xdebug v2.5.1, Copyright (c) 2002-2017, by Derick Rethans
{% endhighlight %}

### Xdebug note

When replacing PHP7.0 with 7.1 you will lose Xdebug.
Simply remove it and freshly install again.
Even if it is the same version.

## My additional php-fpm and nginx amendments

Since you have php installed and some sort of server (unless you purely use php built-in server), you have some amendments to do.

* php-fpm pools in `/etc/php/7.1/fpm/pool.d/*.conf`:
  * I consider you moved all the confs from 7.0
  * `listen = /var/run/php/php7.1-fpm-[your-virtual-host-name].sock`
* nginx sites-available in `/etc/nginx/sites-available/*`:
  * `fastcgi_pass unix:/run/php/php7.1-fpm-[your-virtual-host-name].sock;`
* restart and enjoy:
  * `sudo service php7.1-fpm stop && service php7.1-fpm start`
  * `sudo service nginx stop && service nginx start`

I believe that is all I had to change if my memory serves good.
