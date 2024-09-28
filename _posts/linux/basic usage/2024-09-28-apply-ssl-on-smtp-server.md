---
title: 00014. Apply ssl on SMTP Server
date: "2024-09-28 17:32:00 +0900"
edited: 
tags:
  - Ubuntu
  - Postfix
  - SMTP
  - SSL
categories:
  - linux
  - basic usage
---

<fieldset>
<summary>Contents</summary>
I. <a href="#ctl1">Preview</a><br>
II. <a href="#ctl2">Set Previous Environment</a><br>
III. <a href="#ctl3">Protocol to Set Secure Mail Server</a><br>
IV. <a href="#ctl4">References</a><br>
</fieldset>


<br><br>
## <span id="ctl1">I. Preview</span>
<p>
If you want to send email starting from your custom mail server, it is recommended to apply TLS or SSL to secure the communication.
Nowadays, most mail providers also require to set SSL when the sender sends their message to their server, to prevent fraud such as spamming.
</p>

<p>
Certainly, there are more techniques that should be applied on the server - SPF, DKIM and DMARC - but they are not important topic of this post.
So I would like to provide the protocol that everyone can apply TLS or SSL on your custom mail server.
</p>


<br><br>
## <span id="ctl2">II. Set Previous Environment</span>
<p>
In this post, I will use Ubuntu 23.04 for OS and postfix package for mail server.
Therefore first, I will install postfix package after upgrading and updating apg-get.
</p>

{% highlight ruby linenos %}
#  :"Upgrading apg-get"
#  apg-get upgrade
#
#  :"Updating apt-get"
#  apg-get update
# 
#  :"Install postfix"
#  apt-get install postfix
{% endhighlight %}

<p>
When you finished postfix installation, please check the postfix service is running.
</p>

{% highlight ruby linenos%}
#  :"Check the 'postfix' Service is Running"
#  systemctl status postfix
{% endhighlight %}

<p>
Second, you have to create your own private and public key which will be used to apply TLS and SSL.
I wrote the post about creating the private and public key on ubuntu, so you can create your keys referring to it.
</p>

* <a href="https://luna-negra.github.io/linux/basic%20usage/understanding-CA-and-certificate.html" target="_blank">Understanding CA and Certificiate</a>

<p>
After creating your keys, please remember the key's absolute path.
</p>

<p>
The third one is an optional. I have installed named package to make my machine work as a DNS server.
The DNS configuration contains my domain information, so when I throw the query with my domain to DNS server, 
it would be return the related information. If you want to know about installing DNS on ubuntu, please refer to the post below.
</p>

* <a href="http://127.0.0.1:4000/linux/basic%20usage/create-custom-dns-server.html" target="_blank">Create Custom DNS Server</a>


<br><br>
## <span id="ctl3">III. Protocol to Set Secure Mail Server</span>
<p>
To apply SSL and TLS, you have to edit config file of postfix service. This file is located in /etc/postfix, and named as 'main.cf'.
</p>

![img.png](../../../assets/imgs/linux/basic%20usage/apply-ssl-on-smpt-server/img1.png)

<p>
Open it and add new config keys and values to apply SSL.
</p>

{% highlight ruby linenos %}
#  :"Configure whether tls use or not"
#  smtpd_use_tls=bool
#
#  :"Edit the path of CA certificates"
#  smtpd_tls_cert_file=[PATH_FOR_CA_CERTFILE]
#
#  :"Edit the path of CA private key"
#  smptd_tls_key_file[PATH_FOR_CA_CERTIFICATE]
# 
#  :"Set the SMTPD security level of SSL"
#  smtpd_tls_security_level=may
#
#  :"Accept headers from clinet request"
#  smtpd_tls_received_header = yes
#
#  :"Set the session cache time: default is 1 hour."
#  smtpd_tls_session_cache_timeout = 3600s
#
#  :"Set the log level for TLS"
#  smtpd_tls_loglevel=1
#  smtp_tls_loglevel=1
#
#  :"Set the version of SSL"
#  smtpd_tls_protocols=!SSLv1, !SSLv2
#  smtp_tls_protocols=!SSLv1, !SSLv2
# 
#  :"Set the TLS Cipher."
#  smptd_tls_ciphers="high"
#  smtp_tls_ciphers="high"
#
#  :"Set the SMTP security level of SSL"
#  smtp_tls_security_level=may
#  smtp_tls_ciphers="high"
{% endhighlight %}

{% highlight ruby %}
#  * Default config contains 'smtpd_tls_CApath' key. Please convert it as a comment.
{% endhighlight %}

![img.png](../../../assets/imgs/linux/basic%20usage/apply-ssl-on-smpt-server/img2.png)

<p>
After editing the config file, restart the postfix service with command below.
</p>

{% highlight ruby linenos %}
#  :"Restart postfix service
#  systemctl restart postfix
{% endhighlight %}

<p>
If the restarting process is finished without error, please check whether the SSL is applied on your mail server or not by using command below.
</p>

{% highlight ruby linenos %}
#  :"Check whether the SSL/TLS is applied or not"
#  openssl s_client -connect {MAIL_SERVER_IP or DOMAIN_FQDN}:25 -starttls smtp -brief
{% endhighlight %}

{% highlight ruby %}
#  * Please be advised that I have already registered mail server's information on my DNS Configuration.
{% endhighlight%}

![img.png](../../../assets/imgs/linux/basic%20usage/apply-ssl-on-smpt-server/img3.png)

<p>
If you can see the information about your certificate, you can use your Mail server with SSL/TLS.
However, If you have some error lines after second line, please debug the issue on the configuration file 'main.cf'.
</p>

<p>
Now, you can send and receive email with or without SSL/TLS on port 25. 
</p>

<p>
For a couples of years ago, custom mail server on linux machine can send mail to global mail server such as google or yahoo,
but nowadays this action will be blocked due to the threatening of spam mail. Therefore, if you want to send mail from your custom server,
you have to use global smtp server as a relay server and apply SPF, DKIM and DMARC, which are related to the mail securities.
</p>

<p>
Here is a link of post for testing custom mail server, which was done 3 years ago.
</p>

* <a href="https://whitewing4139.tistory.com/147/" target="_blank">Setting Mail Server and Testing - Korean</a>


<br><br>
## <span id="ctl4">IV. References</span>
<p>
  <ul>
    <li>N/A</li>
  </ul>
</p>
