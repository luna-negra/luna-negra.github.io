---
title: 0003. How to Set Dockerd Config
date: "2024-07-26 00:21:00 +0900"
edited:
tags:
  - docker daemon
  - docker config
  - daemon.json
  - handle dockerd option
categories:
  - docker
  - basic usage
---

<fieldset>
<legend> Content </legend>
<a href="#ctn1">I. Preview</a><br>
<a href="#ctn2">II. File daemon.json</a><br>
<a href="#ctn3">III. Trouble Shooting</a><br>
<a href="#ctn4">IV. References</a><br>
</fieldset>


<br><br>
## <span id="ctn1">I. Preview</span>
<p>
Docker daemon provide many options. In default, docker allows user to connect localhost only or does not support tls and so on. 
In this reason, you have to apply some docker daemon options if you want to operate your docker server more sophisticate.
Let's see how the docker daemon works.
</p>

<p>
You can check whether the docker daemon is running or not by typing command 'systemctl status docker'.
The procedure how docker server starts are described on the file 'docker.service' file.
</p>

{% highlight ruby linenos %}
#  : "ubuntu 22.04"
#  sudo cat /etc/systemd/system/multi-user.target.wants/docker.service
#
#  : "centos 8 stream"
#  sudo cat /usr/lib/systemd/system/docker.service
{% endhighlight %}

![img.png](../../../assets/imgs/docker/basic%20usage/how-to-set-docker-config/img1.png)

<p>
You can see the 'ExecStart' at a 'service' section. 
If the docker daemon starts, dockerd command will be executed. 
As you can see, there are some dockerd options which make you to manage docker containers on your host machine.
</p>

<p>
In addition, there are another service called docker socket and it is required to run docker daemon. 
Its role is connecting docker-cli and docker server properly so if this socket does not work, you are not able to use docker command.
</p>

![img.png](../../../assets/imgs/docker/basic%20usage/how-to-set-docker-config/img2.png)

<p>
Let's stop the docker daemon and docker.socket service by stopping docker.socket. 
Then, start docker with 'dockerd' command. you can see the result of docker command without issue in another terminal.
</p>

![img.png](../../../assets/imgs/docker/basic%20usage/how-to-set-docker-config/img3.png)

<p>
Now, let me start dockerd again with some light options. 
I just want the docker daemon to see google DNS server as a default and 
to add host information to connect docker server from a remote. 
But 'dockerd' command with options can not be executed because option -H with remote address should be run by systemd.
</p>

{% highlight ruby linenos %}
#  : "Start docker daemon with option. "
#  sudo dockerd -H fd://   \
#               -H 192.30.1.4:2375  \
#               --containerd=/run/containerd/containerd.sock  \
#               --dns=8.8.8.8  \ 
#               --dns=8.8.8.4
{% endhighlight %}

![img.png](../../../assets/imgs/docker/basic%20usage/how-to-set-docker-config/img4.png)

<p>
Solution of this issue is very easy. You can just add options at 'ExecStart' in the 'docker.service'.
Let me do it.
</p>

![img.png](../../../assets/imgs/docker/basic%20usage/how-to-set-docker-config/img5.png)

<p>
After starting docker daemon, I can connect to my docker server from another remote server.
</p>

![img.png](../../../assets/imgs/docker/basic%20usage/how-to-set-docker-config/img6.png)

<p>
However, this mean has a problem. If you are not familiar with 'service' file and
some part are edited by accidentally or mistake, your machine can not work docker daemon properly.
</p>

<p>
In this reason, Docker provides 'docker' file which contains dockerd option as a variables. 
All linux service file has function to refer the file, so you rarely have chance to edit another part of 'docker.service' file.
</p>

{% highlight ruby linenos %}
#  : " location of 'docker' file on Ubuntu 22.04. "
#  /etc/default/docker
#  : " location of 'docker' file on CentOS8. "
#  /etc/sysconfig/docker
{% endhighlight %}

{% highlight ruby %}
#  'docker' file does not exist in CentOS so you have to create it manually.
{% endhighlight %}

![img.png](../../../assets/imgs/docker/basic%20usage/how-to-set-docker-config/img7.png)

<p>
This way reduces the chance that the user wrongly edit the service file because once you add EnvironmentFile and variables for option on the service file, 
You don't have to open service file anymore.
</p>

<p>
However, docker option in 'docker' file is relatively hard to manage if you use so many docker option.
Because of that reason, Docker is design to see config file 'daemon.json' to organize your option in key-value format.
</p>

<br><br>
## <span id="ctn2">II. File daemon.json </span>
<p>
The file 'daemon.json' should be located on '/etc/docker'. 
If the docker daemon is started, docker simultaneously look for 'docker' and '/etc/docker/daemon.json' files and 
apply the options in these files. If the same option flag are on both file, docker daemon will print out errors.
Therefore it is recommended to use one of 'docker' or 'daemon.json' file as possible.
</p>

<p>
Also, docker daemon will refer to the options on 'daemon.json',
so remove 'EnvironmentFile' key and edit 'ExecStart' on 'docker.service' file will be changed like below.
</p>

{% highlight ruby linenos %}
#  : " ExecStart on 'docker.service' "
#  ExecStart=/usr/bin/dockerd
{% endhighlight %}

<p>
Let me create daemon.json on '/etc/docker' and create contents with options that I used before.
</p>

{% highlight ruby linenos %}
#  : " /etc/docker/daemon.json"
#  { 
#    "hosts": ["fd://", "unix:///var/run/docker.sock", """tcp://192.30.1.4:2375"],
#    "containerd": "/run/containerd/containerd.sock",
#    "dns": ["8.8.8.8", "8.8.8.4"]
#  }
{% endhighlight %}

{% highlight ruby %}
#  * Host must contain "unix:///var/run/docker.sock" if you want to use docker command on the docker hosts.
#    It connects docker client on the host and docker server.
#  * There are multiple 'host(-H)' option in the previous command and it could be grouped by json list format.
#    Make sure that the key name should be plural form if you want to assign values as a list form.
{% endhighlight %}

<p>
If you don't have any incorrect spells on 'daemon.json' file, docker daemon would be run if it is restarted.
</p>

<p>
Finally, I just want to add more option with private docker registry container. 
Docker container which exist in docker host can be uploaded to docker registry without TLS, 
but it needs additional dockerd flag option. 
</p>

{% highlight ruby linenos %}
# : " Pull docker registry - official "
# sudo docker pull registry
#
# : " create and run container for registry1 "
# sudo docker run -d --name registry1 --hostname registry1 \
#                 --publish 192.30.1.4:5000:5000 \
#                 --restart always \
#                 registry
#
# : " create and run container for registry2 "
# sudo docker run -d --name registry2 --hostname registry2 \
#                 --publish 192.30.1.4:5001:5000 \
#                 --restart always \
#                 registry
{% endhighlight %}

<p>
After running 2 containers, docker host's 5000 and 5001 port will be open.
</p>

![img.png](../../../assets/imgs/docker/basic%20usage/how-to-set-docker-config/img8.png)

<p>
Docker container can not be pushed to the new docker registries
because docker does not allow Non-SSL communication between docker server and registry as a default.
In this reason, additional flag should be added to the daemon.json.
</p>

![img.png](../../../assets/imgs/docker/basic%20usage/how-to-set-docker-config/img9.png)

<p>
Open 'daemon.json' file and add 'insecure-registries' key and value.
</p>

{% highlight ruby linenos %}
#  : " Add dockerd flag optional 'insecure-registries"
#  "insecure-registries" : ["192.30.1.4:5000", "192.30.1.4:5001"]
{% endhighlight %}

{% highlight ruby %}
#  * You have to write key and value enclosing with double-quote.
#  * If one key has more than one value, key name should be plural form and values should be in json list.
{% endhighlight %}

![img.png](../../../assets/imgs/docker/basic%20usage/how-to-set-docker-config/img10.png)

<p>
Now, Let me check that the django:1.0 container is successfully uploaded by pulling it from another docker client. 
I pull that image at the CentOS Linux.
</p>


{% highlight ruby %}
#  * Please note that you have to add docker flag option in order to connect the registries.
{% endhighlight %}

![img.png](../../../assets/imgs/docker/basic%20usage/how-to-set-docker-config/img12.png)

<p>
If you want to run docker with applying tls, you have to add dockerd flag option related to 'tls' such as 'tlsverify' or 'tlscacert' and so on. 
In conclusion, knowing how to use dockerd flag appropriately is the most basic thing to operate your containers safely.
</p>


<br><br>
## <span id="ctn3">III. Trouble Shooting</span>
<p>
If you have incorrect spell on the 'daemon.json', 'docker' or even 'docker.service' file, Docker daemon will not be started.
It is very hard to find the error unless you are familiar with docker or linux logging system.
</p>

<br>
#### 1. Can not Find Config Error
<p>
Sometimes, you missed wrong typed character and it would make you annoyed. Here is the easiest way to find an error in your config. 
All daemons in linux system records their work as a syslog. 
Ubuntu has it in a file '/var/log/syslog' and CentOS store it in a file '/var/log/messages'.
</p>

![img.png](../../../assets/imgs/docker/basic%20usage/how-to-set-docker-config/img13.png)
![img.png](../../../assets/imgs/docker/basic%20usage/how-to-set-docker-config/img14.png)

<p>
You can see that which part of your option was wrong by looking over the logs.
Intededly, I change the key name 'insecure-registries' as a 'insecure-registriesss'.
</p>

![img.png](../../../assets/imgs/docker/basic%20usage/how-to-set-docker-config/img15.png)

<br>
#### 2. Docker Daemon can not be started.
<p>
When you fix your incorrect config and restart the daemon, you would face the problem that the docker daemon is not restarted.
This issue has a simple reason that 'docker.socket' is not running. As you saw the logs at the picture above, 'docker.socket' is also stopped by an error.
Sometimes 'docker.socket' exceed the number of 'service-start-limit-hit' and would not start by itself.
In that situation, you have to start it manually.
</p>

{% highlight ruby linenos %}
#  : " Restart docker.socket and docker.service"
#  sudo systemctl start docker.socket
#  sudo systemctl start docker
{% endhighlight %}

<br><br>
## <span id="ctn4">IV. References </span>
<p>
  <ul>
    <li><a href="https://docs.docker.com/config/daemon/" target="_blank">https://docs.docker.com/config/daemon/</a></li>
    <li><a href="https://docs.docker.com/reference/cli/dockerd/#daemon-configuration-file" target="_blank">https://docs.docker.com/reference/cli/dockerd/#daemon-configuration-file</a></li>
    <li><a href="https://stackoverflow.com/questions/47489631/warning-stopping-docker-service-but-it-can-still-be-activated-by-docker-socke" target="_blank">https://stackoverflow.com/questions/47489631/warning-stopping-docker-service-but-it-can-still-be-activated-by-docker-socke4</a></li>
  </ul>
</p>