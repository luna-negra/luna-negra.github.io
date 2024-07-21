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
<legend>Content</legend>
1. <a href="#ctn1">I. Preview</a><br>
2. <a href="#ctn2">II. Dockerfile</a><br>
3. <a href="#ctn3">III. Dockerfile Syntax</a><br>
4. <a href="#ctn4">IV. Example</a><br>
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
#  : ' Pull and run basic image '
#  sudo docker run -itd --name python3 --hostname python3 \
#                       --publish 192.30.1.4:8000:8000 \
#                       python:3.12
#
#  : ' Connect to the 'python3' terminal '
#  sudo docker exec -it python3 /bin/bash
#  
#  (Prompt will be changed)
#  : ' Update pip  '
#  pip install --upgrade pip
#  
#  : ' Install Django: will use django version 4.1.13 '
#  pip install django==4.1.13
#  
#  : ' Make Django Project: project name is 'project' '
#  django-admin startproject project
#
#  : ' Move to project folder '
#  cd project
#
#  : ' Run Django Server '
#  python manage.py runserver
{% endhighlight %}

{% highlight ruby %}
#  *  Django use tcp/8000 as a default web port.
#  *  Please be advised that my docker host server has a NAT IP 192.30.1.4
{% endhighlight %}

<p>
If you follow my cookbook above, you can see the django's green rocket when you access to django's website.
</p>




<br><br>
## <span id="ctn2">Dockerfile</span>
<p>

</p>


<br><br>
## <span id="ctn3">Dockefile Syntax</span>
<p>

</p>


<br><br>
## <span id="ctn4">Example</span>
