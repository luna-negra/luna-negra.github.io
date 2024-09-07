---
title: 0005. Understanding CA and Certificate
date: "2024-07-31 16:24:00 +0900"
edited: "2024-08-14 19:45:00 +0900"
tags:
  - Certificate Authority
  - private key
  - public key
  - linux system
categories:
  - linux
  - basic usage
---


<fieldset>
<legend>Contents</legend>
<a href="#ctn1">I. Preview</a><br>
<a href="#ctn2">II. Architecture</a><br>
<a href="#ctn3">III. Establish Own CA on Linux</a><br>
<a href="#ctn4">IV. Sign Certificate with Root CA</a><br>
<a href="#ctn5">V. References</a><br>
</fieldset>

<br><br>
## <span id="ctn1">I. Preview</span>
<p>
TLS or SSL secure the communication between computers connecting with net cable. 
One of them can encrypt sending data and the receiver is the only person who can decrypt encrypted data.
Therefore a person in third party can not know what the communicators talk about.
In other words, if you send your data without encrypting, a possibility of revealing your important information would be high.
</p>

![img.png](../../../assets/imgs/linux/basic%20usage/understanding-ca-and-certificate/img1.png)

<p>
To prevent it, it is better to apply TLS and SSL on your server and make the application use it.
Then, what is TLS/SSL and how can we apply it?
</p>

<br><br>
## <span id="ctn2">II. Architecture</span>

### 1. Basic Concept of SSL with Simple Example

<p>
TLS(Transport Layer Security) or SSL (Secure Socket Layer) are cryptographic technique by using symmetric or asymmetric encryption. 
These TLS and SSL have almost same thing but TLS is more developed one than SSL and is more used nowadays.
</p>

<p>
The communicators who use TLS encrypt and decrypt data with private key and public key.
In general, person who provides his or her service has private key and the other has public key.
The public key is derived from the server's private key by using cryptographic algorithms based on <u><a href="https://en.wikipedia.org/wiki/One-way_function" target="_blank">mathematical problems termed one-way functions</a></u>.
</p>

<p>
When the client initiates a communication, the client requests the server's public key. 
The server send the newly created public key to the sender first.
</p>

![img.png](../../../assets/imgs/linux/basic%20usage/understanding-ca-and-certificate/img2.png)

<p>
If the client get the public key without issue, the client encrypts his or her data with public key before sending it.
The server has a private key which is pair with public key, so can decrypt the client's data.
</p>

![img.png](../../../assets/imgs/linux/basic%20usage/understanding-ca-and-certificate/img3.png)

<p>
Even though a third one success to hijack the client's data, this data can not be shown because the third one does not have server's private key.
</p>

![img.png](../../../assets/imgs/linux/basic%20usage/understanding-ca-and-certificate/img4.png)


<br><br>
### 2. Certificate Authorization

<p>
Let's assume that the hacker's way to try to take a client's data.
The hacker is also able to make his or her own private key and public key.
So if the hacker can take the client's first traffic packet, client will not get the server's public key but the hacker's one.
</p>

![img.png](../../../assets/imgs/linux/basic%20usage/understanding-ca-and-certificate/img5.png)

<p>
From the example above, we can know that there should be some verifying method whether the public key can be trusted one or not.
To solve this problem, There are a few of trusted CA - Certificate Authorization - and they certify which public keys are safe and trusted.
</p>

<p>
On your browser setting, you can see a list of trusted CA. 
</p>

![img.png](../../../assets/imgs/linux/basic%20usage/understanding-ca-and-certificate/img6.png)

<p>When you visit unknown site and get a public key, 
your browser verify that the public key is signed by trusted CA. If not, you can see the warning screen that tells you the certificate is not signed by trusted CA.
</p>

![img.png](../../../assets/imgs/linux/basic%20usage/understanding-ca-and-certificate/img7.png)


<br><br>
## <span id="ctn3">III. Establish Own CA on Linux</span>
<p>
In a Linux, there are some function that create own CA and register a number of CAs as trusted even thought CAs are from outside of server.
You can see the trusted CA list on your linux system with command below.
</p>

{% highlight ruby linenos %}
#  : "Print out trusted CA list"
#  : "Ubuntu"
#  ls -lh /etc/ssl/certs/
#  
#  : "CentOS 8 Stream"
#  cat /etc/pki/ca-trust/extracted/openssl/ca-bundle.trust.crt  | grep \# 
{% endhighlight %}

<p>[ Ubuntu ]</p>
![img.png](../../../assets/imgs/linux/basic%20usage/understanding-ca-and-certificate/img8.png)

<p>[ CentOS 8 Stream ]</p>
![img.png](../../../assets/imgs/linux/basic%20usage/understanding-ca-and-certificate/img9.png)

<p>
This CA can grave a digital sign on public keys. If the CA are registered as a trusted one and server's public key is signed by trusted CA, 
TLS communication will be established between the client and the server.
</p>

![img.png](../../../assets/imgs/linux/basic%20usage/understanding-ca-and-certificate/img10.png)
![img.png](../../../assets/imgs/linux/basic%20usage/understanding-ca-and-certificate/img11.png)

<p>
Let me make my own CA and register it as a trusted CA.
First The private key for CA must be created. You can get a private key for CA after executing command below.
</p>

{% highlight ruby linenos %}
#  : "Create a private key for CA"
#  : openssl genrsa -out my_root_ca.key 4096
{% endhighlight %}

{% highlight ruby %}
#  *  You can add encryption algorithm to set password on your key file.
#  ex) openssl genrsa -algorithm RSA -out my_root_ca.key 4096
#  *  You can name key file extension one of 'key' or 'pem'.
#  ex) openssl genrsa -out my_root_ca-key.pem 4096
#  *  the number at the end of the command should be 2^n.
{% endhighlight %}

![img.png](../../../assets/imgs/linux/basic%20usage/understanding-ca-and-certificate/img12.png)

<p>
Next, create a public key for CA from private key I generated.
You have to write down that the public key issuer's information after typing the command.
All variables can be skipped except Common Name. Common name must be the IP or FQDN address of the server.
</p>

{% highlight ruby linenos %} 
#  : "Create a public key for CA"
#  openssl req -x509 -new -sha256 -days 365 -key my_root_ca.key -out my_root_ca.crt
{% endhighlight %}

{% highlight ruby %}
#  *  -days: assign the valid period of your public key.
#  *  You can name key file extension one of 'key' or 'pem'.
#  ex) openssl req -x509 -new -sha256 -days 365 -key my_root_ca.key -out my_root_ca.pem
{% endhighlight %}

![img.png](../../../assets/imgs/linux/basic%20usage/understanding-ca-and-certificate/img13.png)

<p>
It is ready to register our new CA public key (certificate) as a trusted CA.
Copy or move the public key file to specific folder.
</p>

{% highlight ruby linenos %}
#  : "Ubuntu"
#  cp my_root_ca.crt /usr/local/share/ca-certificates/
#
#  : "CentOS 8 Stream"
#  cp my_root_ca.crt /etc/pki/ca-trust/source/anchors/
{% endhighlight %}

<p>
After copying or moving the public key file, execute command below and register the CA public key as a trusted one.
</p>

{% highlight ruby linenos %}
#  : "Ubuntu"
#  update-ca-certificates
#
#  : "CentOS 8 Stream"
#  update-ca-trust
{% endhighlight %}

<p>[ Ubuntu ]</p>
![img.png](../../../assets/imgs/linux/basic%20usage/understand-ca-and-certificate/img15.png)

<p> [ CentOS 8 Stream ]</p>
![img.png](../../../assets/imgs/linux/basic%20usage/understand-ca-and-certificate/img15.png)

<p>
You can check your CA certificate are registered as a trusted CA on your host with command below.
</p>

{% highlight ruby linenos %}
#  : "Ubuntu "
#  ls -lh /etc/ssl/certs/ | grep [CA_PUBLIC_KEY_FILENAME]
#  
#  : "CentOS 8 Stream"
#  cat /etc/pki/ca-trust/extracted/openssl/ca-bundle.trust.crt | grep \# | grep [COMMON_NAME]
{% endhighlight %}

<p>[ Ubuntu ]</p>
![img.png](../../../assets/imgs/linux/basic%20usage/understand-ca-and-certificate/img16.png)

<p>[ CentOS 8 Stream ]</p>
![img.png](../../../assets/imgs/linux/basic%20usage/understand-ca-and-certificate/img17.png)

<p>
Now, I can use our CA to sign another public key for TLS communication.
</p>

<br><br>
## <span id="ctn4">IV. Sign Certificate with Root CA</span>

<p>
From now, let me create TLS private and public key and signing it with root CA's public key.
Then I will apply TLS apache2 with signed keys.
</p>

<p>
In my Ubuntu server, there are apache2 service running and I can access the default website with HTTP protocol.
</p>

![img.png](../../../assets/imgs/linux/basic%20usage/understanding-ca-and-certificate/img18.png)

<p>
First, create a private key as below.
</p>

{% highlight ruby linenos %}
#  : "Create a private key"
#  openssl genrsa -out domain.key 4096
{% endhighlight %}

<p>
After creating private key, I have to make a CSR - Certificate Signing Request - file. As we know from the file type, 
it requests CA to make a specific certificate and to sign on it. Create CSR file with command blelow.
</p>

{% highlight ruby linenos %}
#  : "Create a CSR file"
#  openssl req -new -subj "/CN=192.30.1.4" -key domain.key -out domain.csr
{% endhighlight %}

{% highlight ruby %}
#  * Option must contain '-subj' option and it must have CN value of CA.
{% endhighlight %}

![img.png](../../../assets/imgs/linux/basic%20usage/understanding-ca-and-certificate/img19.png)

<p>
I have a CSR file now, so can make docker.crt file with signing root CA.
</p>

{% highlight ruby linenos %}
#  : "Create a public key with CA signing"
#  openssl x509 -req -sha256 -days 365 -CA [CA_CRT_FILE] -CAkey [CA_KEY_FILE] \
#               -in domain.csr -out domain.crt
{% endhighlight %}

<p>
Now, I have private and public key signed by my own CA for applying TLS. 
</p>

![img.png](../../../assets/imgs/linux/basic%20usage/understanding-ca-and-certificate/img20.png)

<p>
Let me apply private and public key on my apache2.
</p>

![img.png](../../../assets/imgs/linux/basic%20usage/understanding-ca-and-certificate/img21.png)

<p>
Now I can access the apache2's default site with HTTPS. Let me access the site from my Windows.
Browser does not have my root CA in a trusted CA list, so browser tells me that the site contains some security unsafety.
</p>

![img.png](../../../assets/imgs/linux/basic%20usage/understanding-ca-and-certificate/img22.png)

<p>
Also, call the website info with 'curl' command from another linux, I can not get the information 
because the host can not trust the server's public key.
</p>

![img.png](../../../assets/imgs/linux/basic%20usage/understanding-ca-and-certificate/img23.png)

<p>
This problem can be solved by adding CA root as a trusted one. 
First with Linux, remote host does not have server's root CA in a trusted CA list, so it does not believe that the server's public key is safe.
</p>

![img.png](../../../assets/imgs/linux/basic%20usage/understanding-ca-and-certificate/img24.png)

<p>
Copy the server's CA root public key which did sign on domain.crt to the remote host, and register copied public key on the remote host as a trusted CA.
</p>

![img.png](../../../assets/imgs/linux/basic%20usage/understanding-ca-and-certificate/img25.png)



<br><br>
## <span id="ctn5">V. References</span>
<p>
  <ul>
    <li><a href="https://en.wikipedia.org/wiki/Transport_Layer_Security" target="_blank">https://en.wikipedia.org/wiki/Transport_Layer_Security</a></li>
    <li><a href="https://en.wikipedia.org/wiki/Public-key_cryptography" target="_blank">https://en.wikipedia.org/wiki/Public-key_cryptography</a></li>
    <li><a href="https://en.wikipedia.org/wiki/One-way_function" target="_blank">https://en.wikipedia.org/wiki/One-way_function</a></li>
    <li><a href="https://en.wikipedia.org/wiki/Privacy-Enhanced_Mail" target="_blank">https://en.wikipedia.org/wiki/Privacy-Enhanced_Mail</a></li>
  </ul>
</p>
