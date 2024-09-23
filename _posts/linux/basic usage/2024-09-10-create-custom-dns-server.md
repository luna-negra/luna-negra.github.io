---
title: 00013. Create Custom DNS server
date: "2024-09-09 17:56:00 +0900"
edited: 
tags:
  - Ubuntu
  - bind9
  - custom DNS server
  - register custom domain
categories:
  - linux
  - basic usage
---


<fieldset>
<legend>Content</legend>
<a href="#ctn1">I. Preview</a><br>
<a href="#ctn2">II. Set DNS Config</a><br>
<a href="#ctn3">III. Test Custom DNS Server</a><br>
<a href="#ctn4">IV. References</a><br>
</fieldset>


<br><br>
## <span id="ctn1">I. Preview</span>
<p>
Nowadays, most people in the internet uses URL address to access their target website. 
When a person types the "github.com" in address bar, your browser shows HTML contents to that person.
Most servers have their own ip address and this address will be used to communicate each other. 
Then, how do the internet browsers map the URL and ip address?
</p>

<p>
There are so called DNS server, abbreviation of <b>D</b>omain <b>N</b>ame <b>S</b>erver. 
This server converts the url to ip address or vice versa. Most computers these days have a network interface, 
so when a computer is being connected to internet, DNS server is configured as a default.
</p>

![img.png](../../../assets/imgs/linux/basic%20usage/create-custom-dns-server/img1.png)

<p>
So, when you remove the DNS setting value, you can not access to the internet site
</p>

![img.png](../../../assets/imgs/linux/basic%20usage/create-custom-dns-server/img2.png)

![img.png](../../../assets/imgs/linux/basic%20usage/create-custom-dns-server/img3.png)

<p>
Then, How does the DNS work?
</p>

![img.png](../../../assets/imgs/linux/basic%20usage/create-custom-dns-server/img4.png)

<p>
When the endpoint user types the URL address, the endpoint request the IP address of typed URL address to DNS server, which is designated on Network config.
If the server exists and is alive, the DNS server will return the IP address mapping to the URL address. If there is no mapping IP address, endpoint user only can see an error "Not Connected to the Site".
</p>

<p>
This process is called DNS protocol, using port number 25. when the endpoint starts the request, packet is transferred by tcp protocol.
Vice versa, packet which contains response is transferred by UDP protocol.
</p>

<p>
There are so many DNS server around the world. But you have to create a custom DNS server if you need your own network.
In this post, I will show how to install DNS package and set config in ubuntu.
</p>


<br><br>
## <span id="ctn2">II. Set DNS Config</span>
<p>
If you want to make your ubuntu server work as a DNS server, you have to install 'bind9' package.
</p>

{% highlight ruby linenos %}
#  :"Install 'bind9' package"
#  sudo apt-get install bind9 -y
{% endhighlight %}

{% highlight ruby %}
#  * It is recommended to install 'dnsutils' too.
{% endhighlight %}

![img.png](../../../assets/imgs/linux/basic%20usage/create-custom-dns-server/img5.png)

<p>
Once the 'bind9' package is installed successfully, you can see the service 'named' is running with command below.
</p>

{% highlight ruby linenos %}
#  :"Check the status of 'named' service"
#  sudo systemctl status named
{% endhighlight %}

![img.png](../../../assets/imgs/linux/basic%20usage/create-custom-dns-server/img6.png)

<p>
Like other linux packages, config files of 'bind9' are located on '/etc' folder, exactly in '/etc/bind'.
There are so many files whose name starts with 'named.conf'.
</p>

![img.png](../../../assets/imgs/linux/basic%20usage/create-custom-dns-server/img7.png)

<p>
First, look at the file 'named.conf.options'. This file is charge of main settings of named service.
So you can set the 'listen address', or 'allow ip list' and so on. There are so many setting keys, but I will show a few key that can make DNS server work properly.
</p>

<ul>
  <li>listen-on [port NUMBER] { IP_ADDRESS; }; </li>
  <li>allow-query { IP_ADDRESS OR NETWORK; } </li>
  <li>recursion [YES|NO] </li>
</ul>

<p>
Listen address is a server address that receives the DNS query. Now my linux's ip address is '10.10.92.85', so let me assign that address in 'listen-on'.
Also, This server is only for the test, I will allow only endpoint in the same network segment to request to my custom DNS server.
Last, If the custom DNS server does not return any values because there are no mapping data, let the DNS server relay the request to another DNS server and get the result.
This process will be executed when the 'recursion' is set by 'yes'.
</p>

![img.png](../../../assets/imgs/linux/basic%20usage/create-custom-dns-server/img8.png)

<p>
Second, config file is 'named.conf.default-zone', If you want to add new domain information to your custom DNS server, 
you should edit that file or create new zone file and include it in 'named.conf' file.
</p>

<p>
I will add new domain named 'luna-negra.com' to new file and include it in main config file.
</p>

{% highlight ruby linenos %}
#  :"New zone file"
#  zone "DOMAIN_NAME" IN {
#    type [master | slave | hint];
#    file "ZONE_INFO_FILE_PATH";
#  };
{% endhighlight %}

![img.png](../../../assets/imgs/linux/basic%20usage/create-custom-dns-server/img9.png)

<p>
The 'zone' means a new domain that you want your DNS server to know. 
In the config above, my domain "luna-negra.com" refers to the "/etc/bind/db.luna-negra.com", which is called 'zone file', to answer the DNS query.
So the zone file should be created and applied to the service.
</p>

<p>
You can validate whether there are issue in named.conf file or not, by using a command below.
</p>

{% highlight ruby linenos %}
#  :" Validate the named config"
#  sudo named-checkconf
{% endhighlight %}

![img.png](../../../assets/imgs/linux/basic%20usage/create-custom-dns-server/img11.png)

<p>
If there is no issue on your config file, prompt does not return any text on the screen. On the other situation, you can see the error log as a result of the command.
</p>

![img.png](../../../assets/imgs/linux/basic%20usage/create-custom-dns-server/img12.png)

<p>
Third, zone file for new zone 'luna-negra.com' should be created. If a request - example: 'www.luna-negra.com' - arrives at the DNS server, the server mapping the domain name - 'luna-negra.com' - first.
Then, information of hostname - 'www' - will be found by Server at zone file - '/etc/bind/db.luna-negra.com'.
</p>

{% highlight ruby linenos %}
#  :" Zone file"
# $ORIGIN {DOMAIN_NAME.}
# $TTL TIME_TO_LIVE_IN_INTEGER
# @       IN      SOA      {NS_HOST.SERVER_DOMAIN.}   {root.SERVER_DOMAIN.} (
#                          1                          ; SerialNumber
#                          86400                      ; Refresh Time. required for slave server.
#                          3600                       ; Retry Time. required for slave server.
#                          604800                     ; Expire Time. required for slave server.
#                          604800                     ; Negative TTL
# );
#
#         IN      NS                    ns.{DOMAIN_NAME.}
#         IN      MX       10           mail.{DOMAIN_NAME.}      ;   The number is priority for several mail servers.
# ns      IN      A                     {NAMESERVER_IP}
# mail    IN      A                     {MAILSERVER_IP}
# www     IN      A                     {WEBSERVER_IP}
#
{% endhighlight %}

{% highlight ruby %}
#  *  The unit of all SOA values in integer is second(time).
#  *  You can change it in simple form. ex) 86400 -> 1D, 3600 1h
{% endhighlight %}

![img.png](../../../assets/imgs/linux/basic%20usage/create-custom-dns-server/img13.png)

<p>
The zone file can be also validated by command 'named-checkzone'.
</p>

{% highlight ruby linenos %}
#  :"Check zone file"
#  sudo named-checkzone {ZONE_NAME} {ZONE_FILE_PATH}
{% endhighlight %}

![img.png](../../../assets/imgs/linux/basic%20usage/create-custom-dns-server/img14.png)

<p>
If you finished to set the named config, restart the named service and open the DNS port at machine's firewall.
</p>

{% highlight ruby linenos %}
#  :"Restart named service"
#  sudo systemctl restart named
#
#  :"Open DNS port"
#  sudo firewall-cmd --add-port=53/tcp 
#  sudo firewall-cmd --add-port=53/udp
{% endhighlight %}

![img.png](../../../assets/imgs/linux/basic%20usage/create-custom-dns-server/img15.png)

<p>
And make your linux host see the custom DNS server by editing '/etc/resolv.conf' file or network dns setting file in '/etc/netplan'.
</p>

![img.png](../../../assets/imgs/linux/basic%20usage/create-custom-dns-server/img16.png)

{% highlight ruby %}
#  * It is recommeded to locate your custom DNS server IP upper than global DNS server's one.
{% endhighlight%}

<br><br>
## <span id="ctn3">III. Test Custom DNS</span>
<p>
Let me test my custom DNS server. First, I will test it on the DNS server.
</p>

{% highlight ruby linenos %}
#  :"Request DNS Query"
#  dig www.luna-negra.com
{% endhighlight %}

{% highlight ruby %}
#  * You have to install dnsutils if you want to use 'dig' or 'nslookup' command.
{% endhighlight %}

![img.png](../../../assets/imgs/linux/basic%20usage/create-custom-dns-server/img17.png)

![img.png](../../../assets/imgs/linux/basic%20usage/create-custom-dns-server/img18.png)

<p>
All values are returned as zone file of 'luna-negra.com'. Next, I will test my custom DNS server from remote windows labtop.
</p>

![img.png](../../../assets/imgs/linux/basic%20usage/create-custom-dns-server/img19.png)

<p>
You can see the unauthorized response when I executed a command with 'google.com' domain. Because, my custom DNS server did not have any information about 'google.com' domain, 
so it recursively relayed the query to the another DNS server(8.8.8.8) which was set on my Ubuntu machine. DNS server 8.8.8.8 returned the response to the custom DNS server, and custom DNS server transmit that data to the endpoint.
Custom DNS server did not provide IP data directly, therefore windows endpoint showed "Unauthorized Response".
</p>



<br><br>
## <span id="ctn4">IV. References</span>
<p>
  <ul>
     <li><a href="https://bind9.readthedocs.io/en/latest/reference.html#configuration-file-named-conf" target="_blank">https://bind9.readthedocs.io/en/latest/reference.html#configuration-file-named-conf</a></li>
     <li><a href="https://bind9.readthedocs.io/en/v9.18.14/" target="_blank">https://bind9.readthedocs.io/en/v9.18.14/</a></li>
     <li><a href="https://bind9.readthedocs.io/en/v9.18.14/chapter3.html#localhost-reverse-mapped-zone-file" target="_blank">https://bind9.readthedocs.io/en/v9.18.14/chapter3.html#localhost-reverse-mapped-zone-file</a></li>
  </ul>
</p>
