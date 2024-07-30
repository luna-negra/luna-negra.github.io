---
title: 0004. How to Own My Docker Hub Registry with and without TLS
date: "2024-07-30 15:18:00 +0900"
edited:
tags:
  - docker hub
  - private registry
  - applying tls
categories:
  - docker
  - advanced protocols
---


<fieldset>
<legend> Content </legend>
<a href="#ctn1">I. Preview</a><br>
<a href="#ctn2">II. How to Create Private Registry</a><br>
<a href="#ctn3">III. Security: Apply TLS</a><br>
<a href="#ctn4">IV. References</a><br>
</fieldset>


<br><br>
## <span id="ctn1">I. Preview </span>
<p>
Docker provide its official images via its <u><a href="hub.docker.com" target="_blank">official hub site</a></u>.
You can upload your own image to the docker hub with either private or public mode. 
</p>

<p>
Despite the docker hub site is useful, sometimes you want to make your own hub to store your own images. 
In this case you might create your hub site on your intra-net which is not connected to the Internet.
</p>

<p>
However, It is difficult and time-spending to create your own hub site from the scratch. 
Using web-framework, designing DB and API, authentication and so on...
Fortunately, Docker has a private hub container called 'registry' so that we can pull and push our own images without Internet connection. 
Even though it does not have any web-site for GUI, you can create own hub site by using web framework and registry's API.
</p>

<p>
In this post, Let me introduce how to make a private docker registry with and without TLS.
</p>


<br><br>
## <span id="ctn2">II. How to Create Private Registry</a>
<p>
Creating docker registry container is very easy. It is finished by pulling registry image from docker official site.
</p>

{% highlight ruby linenos %}
#  : "Pulling down docker 'registry' image" 
#  sudo docker pull registry
{% endhighlight %}

<p>
Docker registry container uses default port 5000 to pull and push images. Simply create and run the registry image like below.
</p>

{% highlight ruby linenos %}
#  : "Creating and running registry container" 
#  sudo docker run -d --name registry --hostname registry \
#                     --publish 192.30.1.4:5000:5000
#                     --restart always
#                     registry
{% endhighlight %}

{% highlight ruby %}
#  * Please note that ip address of my host server is 192.30.1.4. you can replace it to 0.0.0.0
{% endhighlight %}

<p>
Then, you can connect to the host port 5000 with curl.
</p>

{% highlight ruby linenos %}
#  : "Checking that the host port to registry is open"
#  curl -v telnet://192.30.1.4:5000
{% endhighlight %}

![img.png](../../../assets/imgs/docker/advanced%20protocols/how-to-own-my-docker-hub-registry-with-and-without-tls/img1.png)

<p>
However, if you try to push your image to the created repository, there will be an issue related to TLS. 
</p>

![img.png](../../../assets/imgs/docker/advanced%20protocols/how-to-own-my-docker-hub-registry-with-and-without-tls/img2.png)

<p>
Because Docker only accept TLS communication as a default, so you have to tell the docker server that a specify registry will not use TLS. 
<u><a href="https://luna-negra.github.io/docker/basic%20usage/How-to-Set-Dockerd-Config.html" target="_blank">Open docker config file</a></u> and add config key 'insecure-registry' and value for registry ip and port.
Select one of them below to edit dockerd config.
</p>

{% highlight ruby linenos %}
#  : " Adding a config at file 'daemon.json'"
#  {
#    ...
#    "insecure-registries": ["192.30.1.4:5000"],
#    ...
#  }
#
#  : " Adding a config at file 'docker'
#  DOCKER_OPT= ... --insecure-registry=192.30.1.4:5000 ...
{% endhighlight %}

![img.png](../../../assets/imgs/docker/advanced%20protocols/how-to-own-my-docker-hub-registry-with-and-without-tls/img3.png)

<p>
After adding 'insecure-registry', restart docker daemon and try to push your image again.
</p>

![img.png](../../../assets/imgs/docker/advanced%20protocols/how-to-own-my-docker-hub-registry-with-and-without-tls/img4.png)

<p>
You can also pull the image from your registry if the image you want is stored in the registry. 
</p>

![img.png](../../../assets/imgs/docker/advanced%20protocols/how-to-own-my-docker-hub-registry-with-and-without-tls/img5.png)

<p>
From another remote docker client, images can be downloaded and pushed if the docker configs are correctly set.
</p>

![img.png](../../../assets/imgs/docker/advanced%20protocols/how-to-own-my-docker-hub-registry-with-and-without-tls/img6.png)


<br><br>
## <span id="ctn3">III. Security: Apply TLS</a>

<fieldset>
<legend> Summary </legend>
<a href="#prtc1">1. Create Root CA </a><br>
<a href="#prtc2">2. Create Docker Key and Certificate for Applying TLS</a><br>
<a href="#prtc3">3. Create Registry Key and Certificate</a><br>
<a href="#prtc4">4. Run TLS registry and Test</a><br>
</fieldset>

<br><br>
## <span id="prtc1">1. Create Root CA</span>

<p>
Now you can create your own registry, but there is a problem in terms of security.
It has any change to be eavesdropped from unknown person because the registry container is not applied TLS.
</p>

![img.png](../../../assets/imgs/docker/advanced%20protocols/how-to-own-my-docker-hub-registry-with-and-without-tls/img7.png)

<p>
In this reason, it is more recommended to apply TLS on your private registry. 
In order to do this, you have to create your own private key and public key(Certificate) for docker daemon.
</p>

<p>
If you don't have any CA(Certificate Authority) on your server, please create private and public key for CA.
</p>

{% highlight ruby linenos %}
#  : "Creating a new folder to store CA key and certificate"
#  mkdir ~/.cacerts
#  cd ~/.cacerts
# 
#  : "Creating a CA key"
#  sudo openssl genrsa -out ca.key 4096
#
#  : "Creating a CA certificate - CA public key"
#  sudo openssl req -x509 -new -days 365 -sha256 -key ca.key -out ca.crt
{% endhighlight %}

{% highlight ruby %}
#  * You have to store ca.crt and ca.key in separate folder and change permission as
#  - sudo chmod 400 ca.key
#  - sudo chmod 444 ca.crt
#  * Don't forget to set Common Name as IP address or FQDN of your docker host. 
{% endhighlight %}

![img.png](../../../assets/imgs/docker/advanced%20protocols/how-to-own-my-docker-hub-registry-with-and-without-tls/img8.png)

<p>
Then, copy the newly created ca.crt to specific folder to register it as CA Certificate on your host.
</p>

{% highlight ruby linenos %}
#  : "Register new CA.crt to your host machine - ubuntu"
#  sudo cp ca.crt /usr/local/share/ca-certificate
#  sudo update-ca-certificate
#
#  : "Register new CA.crt to your host machine - centos"
#  sudo cp ca.crt /etc/pki/ca-trust/source/anchors/
#  sudo update-ca-trust
{% endhighlight %}

![img.png](../../../assets/imgs/docker/advanced%20protocols/how-to-own-my-docker-hub-registry-with-and-without-tls/img9.png)


<br><br>
## <span id="prtc2">2. Create Docker Key and Certificate for Applying TLS</span>

<p>
Now you can make public and private key signed by your root CA.
Next docker private key and public key must be created and signed by root CA. 
</p>

{% highlight ruby linenos %}
#  : "Creating a new private key for docker TLS"
#  sudo openssl genrsa -out docker.key 4096
#
#  : "Creating a CSR(Certificate Signing Request)"
#  sudo openssl req -new -subj "/CN=192.30.1.4" -key docker.key -out docker.csr
#
#  : "Creating extfile.cnf to apply openssl option to create docker.crt"
#  echo "subjectAltName = IP:192.30.1.4"  > extfile.cnf
#
#  : "Creating a new public key for docker registry"
#  sudo openssl x509 -req -sha256 -days 365 \
#                    -CA {LOCATION_OF_ca.crt} \
#                    -CAkey {LOCATION_OF_ca.key} \
#                    -extfile extfile.cnf \
#                    -in docker.csr \
#                    -out docker.crt
#
#  : " Removing unnecessary files"
#  rm extfile.cnf docker.csr
{% endhighlight %}

{% highlight ruby %}
#  *  When you create csr file, please put an option -subj and assign /CN as Common Name at your ca.crt
#  * You have to store ca.crt and ca.key in seperate folder and change permission
#  - chmod 400 docker.key
#  - chmod 444 docker.crt
{% endhighlight %}

![img.png](../../../assets/imgs/docker/advanced%20protocols/how-to-own-my-docker-hub-registry-with-and-without-tls/img10.png)

<p>
Now it is ready to create docker registry with certificate and key. 
Before that, docker need to be informed of that containers will be run with TLS.
TLS certificate are signed by Host's root CA, so adding flag option for CA information on docker config file is required.
Select one of them below.
</p>

{% highlight ruby linenos %}
#  : "edit docker config - daemon.json"
#  {
#    ...
#    "tlsverify": true,
#    "tlscacert": ~/.cacerts/ca.crt,
#    "tlscert": ~/.cacerts/docker.crt,
#    "tlskey": ~/.cacerts/docker.key,
#    ...
#  }
#
#  : "edit docker config - docker"
#  DOCKER_OPT=... --tlsverify --tlscacert=~/.cacerts/ca.crt --tlscert=~/.cacerts/docker.crt --tlskey=~/.cacerts/docker.key    ...
{% endhighlight %}

{% highlight ruby %}
#  * tlsverify:  set tls use or not. default if 'false' [ true / false ]
#  * tlscacerts: CA certification that signing docker key and certificate.
#  * tlscert: docker certificate to use TLS (docker.crt)
#  * tlskey : docker private key to use TLS (docker.key)
{% endhighlight %}

<p>
After editing config file, restart docker daemon to apply new configs. 
</p>

![img.png](../../../assets/imgs/docker/advanced%20protocols/how-to-own-my-docker-hub-registry-with-and-without-tls/img11.png)

<p>
If there is any problem. you can create public key and private key for registry TLS.
</p>

<br><br>
## <span id="prtc3">3. Create Registry Key and Certificate</span>

<p>
The next step is creating private key and certificate signed by root CA. 
They would be used in registry container and only allow TLS communication.
</p>

{% highlight ruby linenos %}
#  : "Creating a new private key for docker registry"
#  sudo openssl genrsa -out registry.key 4096
# 
#  : "Creating a CSR(Certificate Signing Request)"
#  sudo openssl req -new -subj "/CN=192.30.1.4" -key registry.key -out registry.csr
#
#  : "Creating extfile.cnf to apply openssl option to create registry.crt"
#  echo "subjectAltName = IP:192.30.1.4"  > extfile.cnf
#
#  : "Creating a new public key for docker registry"
#  sudo openssl x509 -req -sha256 -days 365 \
#                    -CA {LOCATION_OF_ca.crt} \
#                    -CAkey {LOCATION_OF_ca.key} \
#                    -extfile extfile.cnf \
#                    -in registry.csr \
#                    -out registry.crt
{% endhighlight %}

{% highlight ruby %}
#  *  When you create csr file, please put an option -subj and assign /CN as Common Name at your ca.crt
#  * You have to store ca.crt and ca.key in seperate folder and change permission
#  - chmod 400 docker.key
#  - chmod 444 docker.crt
{% endhighlight %}

![img.png](../../../assets/imgs/docker/advanced%20protocols/how-to-own-my-docker-hub-registry-with-and-without-tls/img12.png)


<br><br>
## <span id="prtc4">4. Run TLS registry and Test</span>

<p>
With registry.key and registry.crt, let me create and run registry container.
To apply TLS, registry container must have some environmental variables.
</p>

{% highlight ruby linenos %}
#  : " Creating and running registry container"
#  sudo docker run -d --name registry --hostname --registry \
#                     --publish 192.30.1.4:443:443 \
#                     --volume $(pwd)/registry.key:/certs/registry.key \
#                     --volume $(pwd)/registry.crt:/certs/registry.crt \
#                     --restart always \
#                     -e REGISTRY_HTTP_ADDR=0.0.0.0:443 \
#                     -e REGISTRY_HTTP_TLS_CERTIFICATE=/certs/registry.crt \
#                     -e REGISTRY_HTTP_TLS_KEY=/certs/registry.key \
#                     registry
{% endhighlight %}

![img.png](../../../assets/imgs/docker/advanced%20protocols/how-to-own-my-docker-hub-registry-with-and-without-tls/img13.png)

<p>
If the registry container has no issue, let me check the port open and communication
</p>

{% highlight ruby linenos %}
#  : "Checking Port Open"
#  curl -v telnet://192.30.1.4:443
#
#  : "Checking Registry's API"
#  curl https://192.30.1.4/v2/_catalog
{% endhighlight %}

{% highlight ruby %}
#  * https://192.30.1.4/v2/_catalog returns a list of stored images in json format.
{% endhighlight %}

![img.png](../../../assets/imgs/docker/advanced%20protocols/how-to-own-my-docker-hub-registry-with-and-without-tls/img14.png)

<p>
Now, you can upload your images to private registry which is applied TLS unless there are any issue related to HTTPS.
</p>

![img.png](../../../assets/imgs/docker/advanced%20protocols/how-to-own-my-docker-hub-registry-with-and-without-tls/img15.png)

<p>
Even if somebody eavesdrop communication, data will not be shown due to the encryption.
</p>

![img_1.png](../../../assets/imgs/docker/advanced%20protocols/how-to-own-my-docker-hub-registry-with-and-without-tls/img16.png)

<p>
In addition, another host machine without proper certificate and key, will not push images to the private registry or pull from it.
</p>

![img.png](../../../assets/imgs/docker/advanced%20protocols/how-to-own-my-docker-hub-registry-with-and-without-tls/img17.png)

<p>
If you want to access TLS registry from the remote, you must have root CA certificate on the remote machine and register it as a trust certificate.
</p>

![img.png](../../../assets/imgs/docker/advanced%20protocols/how-to-own-my-docker-hub-registry-with-and-without-tls/img18.png)


<br><br>
## <span id="ctn4">IV. References </span>
<p>
  <ul>
    <li><a href="https://docs.docker.com/engine/security/protect-access/#use-tls-https-to-protect-the-docker-daemon-socket" target="_blank">https://docs.docker.com/engine/security/protect-access/#use-tls-https-to-protect-the-docker-daemon-socket</a></li>
    <li><a href="https://stackoverflow.com/questions/63433936/what-is-serverauth-and-clientauth#:~:text=clientAuth%20means%20it%20can%20be,1.12%20Extended%20Key%20Usage." target="_blank">https://stackoverflow.com/questions/63433936/what-is-serverauth-and-clientauth#:~:text=clientAuth%20means%20it%20can%20be,1.12%20Extended%20Key%20Usage.</a></li>
    <li><a href="https://stackoverflow.com/questions/66878538/how-to-secure-docker-client-connection-by-default" target="_blank">https://stackoverflow.com/questions/66878538/how-to-secure-docker-client-connection-by-default</a></li> 
    <li><a href="https://distribution.github.io/distribution/about/deploying/#get-a-certificate" target="_blank">https://distribution.github.io/distribution/about/deploying/#get-a-certificate</a></li>
    <li><a href="https://distribution.github.io/distribution/about/insecure/" target="_blank">https://distribution.github.io/distribution/about/insecure/</a></li>
  </ul>
</p>
