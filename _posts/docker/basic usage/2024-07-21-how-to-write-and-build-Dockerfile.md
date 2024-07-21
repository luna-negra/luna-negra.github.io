---
title: 0002. How to Write and Build Dockerfile
date: "2024-07-20 22:07:00 +0900"
edited: 
tags:
  - docker container
  - Dockerfile
  - python django
  - postgresql
categories:
  - docker
  - basic usage
---


<fieldset>
<legend> Content </legend>
<a href="#ctn1">I. Preview</a><br>
<a href="#ctn2">II. Dockerfile Syntax</a><br>
<a href="#ctn3">III. Example</a><br>
<a href="#ctn4">IV. Reference</a><br>
</fieldset>


<br><br>
## <span id="ctn1">I. Preview</span>
<p>
Although he official docker hub website offer so many containers, sometimes we have to make our own container from a basic image.
In order to this, we can run basic docker images, install applications that we need in the container and commit that image to create new image.
</p>

<p>
Here is the example. I want to get a python django image, but official docker hub website does not have it. 
More details, Django image exist at the hub, but it was deprecated so person who need Django container should create their own django. 
</p>

![img.png](../../../assets/imgs/docker/basic%20usage/how-to-write-and-build-Dockefile/img1.png)

<p>
Then, let me make a new django container manually. I will use image 'python:3.12' as a basic image.
</p>

{% highlight ruby linenos %}
#  : " Pull and run basic image "
#  sudo docker run -itd --name python3 --hostname python3 \
#                       --publish 192.30.1.4:8000:8000 \
#                       python:3.12
#
#  : " Connect to the 'python3' terminal "
#  sudo docker exec -it python3 /bin/bash
#  
#  (Prompt will be changed)
#  : " Upgrade pip "
#  pip install --upgrade pip
#
#  : " Install Django: will use django version 4.1.13 "
#  pip install django==4.1.13
#
#  : " Update apt-get "
#  apt-get update
#
#  : " install vim package "
#  apt-get install vim -y
#
#  : " Make Django Project: project name is 'project' "
#  django-admin startproject project
#
#  : " Edit settings.py with vim"
#  vi /project/project/settings.py
#
#  : " Add value '*' to setting key 'ALLOWED_HOSTS' and exit vim"
#  ALLOWED_HOSTS = ['*']
#
#  : " Run Django Server "
#  python /project/manage.py runserver python3:8000
{% endhighlight %}

{% highlight ruby %}
#  *  Django use tcp/8000 as a default web port.
#  *  Please be advised that my docker host server has a NAT IP 192.30.1.4
#  *  You have to create volume to handle the 'settings.py' easily.
#  *  The command related to running django server, has 'python3' as a hostname. 
#     - you can see that IP on '/etc/hosts'. 

{% endhighlight %}

<p>
If you follow my cookbook above, you can see the django's green rocket when you access to django's website.
</p>

![img.png](../../../assets/imgs/docker/basic%20usage/how-to-write-and-build-Dockefile/img2.png)

<p>
I stop the django server by typing 'Ctrl + C' and exit the container with 'Ctrl + P + Q'.
Now I have a django container, so I will convert it into the docker image so that I can use django container instantly.
</p>

{% highlight ruby linenos %}
#  : " On the host, convert 'python3' container to new django image "
#  sudo docker commit --author 'pavel' \
#                     --message 'first django image' \
#                     python3 mydjango:1.0
{% endhighlight %}

![img.png](../../../assets/imgs/docker/basic%20usage/how-to-write-and-build-Dockefile/img3.png)

<p>
Now, I have a new django container derived from edited container, so I can run django image whenever I want to.
Let me run my new image with command below.
</p>

{% highlight ruby linenos %}
#  : " Run django container with new image "
#  sudo docker run -d --name django --hostname django \
#                --publish 192.30.1.4:8000:8000 \
#                mydjango:1.0 \
#                python /project/manage.py runserver django:8000
{% endhighlight %}

![img.png](../../../assets/imgs/docker/basic%20usage/how-to-write-and-build-Dockefile/img4.png)

<p>
I successfully made a new django image and there is no server issue.
Now, let's assume that we have to change massive structure in our new container. 
We can do it by accessing our container, adding, removing some files, doing some job and committing that container to new image as I have shown at the header of this post.
However, this job make a new image be heavy in its size, because changes in docker container will be added to the new container as a layer form.
You can check it with command 'docker history [IMAGE_NAME:TAG]'
</p>

![img.png](../../../assets/imgs/docker/basic%20usage/how-to-write-and-build-Dockefile/img5.png)

<p>
I will remove vim package from the container named 'django', which is derived from docker image 'mydjango:1.0' 
and rebuild image named as 'mydjango:1.1'. After that, let's check the size of the image 'mydjango:1.1'. 
Will the size of 'mydjango:1.1" be lighter than 'mydjango:1.0'?
</p>

{% highlight ruby linenos %}
#  : " Remove 'vim' package on the 'django' container "
#  sudo docker exec django apt-get purge vim -y
#
#  : " Check the 'vim' package is successfully removed "
#  sudo docker exec django dpkg -l | grep vim
#
#  : " Commit 'mydjango:1.1' docker image from container 'django' "
#  sudo docker commit --author pavel \
#                     --message 'second django image' \
#                     django mydjango:1.1 
# 
#  : " Check the size of new image 'mydjango:1.1' "
#  sudo docker images | grep mydjango
{% endhighlight %}

![img.png](../../../assets/imgs/docker/basic%20usage/how-to-write-and-build-Dockefile/img6.png)

<p>
The size of new image is not decreased, because new layer just added to the previous image even thought the files on the container are removed.
</p>

![img.png](../../../assets/imgs/docker/basic%20usage/how-to-write-and-build-Dockefile/img7.png)

<p>
Therefore, it is better to create new image from the official, lightweight docker image than from the edited container.
Also, it is impossible to remember all procedures even we've done a week ago, so we need to record our works as a script or something.
</p>

<p>
Docker can build images automatically by reading the 'instructions' from a Dockerfile.
With Dockerfile, we can edit instructions to build a new image only from the official images so our new image have less chance to be 'obesity'.
</p>


<br><br>
## <span id="ctn2">II. Dockefile Syntax</span>
<p>

</p>


<br><br>
## <span id="ctn3">III. Example</span>
<p>

</p>


<br><br>
## <span id="ctn4">IV. Reference</span>
<p>
  <ul>
    <li>
      <a href="https://docs.docker.com/reference/dockerfile/" target="_blank">https://docs.docker.com/reference/dockerfile/</a>
    </li>
  </ul>
</p>

