---
title: 0020. How to Write Docker-Compose file
date: "2025-01-16 16:00:00 +0900"
edited: "2025-01-20 11:49:00 +0900"
tags:
  - docker container
  - docker build
  - docker compose
categories:
  - docker
  - basic usage
---

<fieldset>
    <legend> Content </legend>
    <a href="#ctn1">I. Preview</a><br>
    <a href="#ctn2">II. What is Docker Compose?</a><br>
    <a href="#ctn3">III. Install Docker Compose</a><br>
    <a href="#ctn4">IV. Example of Writing Docker Compose</a><br>
    <a href="#ctn5">IV. References</a><br>
</fieldset>


<br><br>
## <span id="ctn1">I. Preview</span>
<p>
If you create a bunch of containers, and they are working in a single system, you have to control container separately.<br>
For Example, there are 3 containers for database, backend api and frontend web. You have to run each container with command as well as create 3 Dockerfiles.
</p>

![img.png](../../../assets/imgs/docker/basic%20usage/how_to_write_docker_compose-file/img1.png)
![img.png](../../../assets/imgs/docker/basic%20usage/how_to_write_docker_compose-file/img2.png)

<p>
Controlling your docker containers with only Dockerfile is time spending work. <br>
Even if these containers makes a one system and you do some mistake during controlling container, there would be a critical results.
</p>

<p>
Is there any easy way to create, run my docker containers? <br>
If you have a same question like me, you may consider to use docker-compose
</p>


<br><br>
## <span id="ctn2">II. What is Docker Compose?</span>
<p>
Docker compose is a tool for defining conditions of each container and running multiple containers, which are consist of a specific system.<br>
This tool makes you do type a simple docker-compose command line to start or stop all containers defined in docker-compose.yml file.
</p>

<p>
'docker build' command finds 'Dockerfile' in its path.<br>
Similarly, 'docker-compose' command search YAML file named 'docker-compose' or 'compose' and execute instruction written in that file.
The difference between 'docker-compose' and 'compose' is a docker-compose version. 'docker compose' is older one and 'compose' was introduced in docker compose version 2.<br>
Current major version of docker-compose in January 2025 is 3, so you can use one of them without any problem. <br>
If both files are exist in one folder, docker-compose will execute 'compose' YAML file.
</p>

<p> 
Docker compose file(YAML file) has some elements named "version", "services", "networks", "volumes" and so on.
</p>

<p>
"version" define the file version of docker compose and it would have a value as a current version of docker-compose.<br>
The value of version must be a string so please encapsule with '' or "".<br>
Recently, docker-compose does not recommend set the version in docker-compose file, so you do not have to write it on docker-compose file.
</p>

{% highlight ruby linenos %}
# : "version section"
version: '3.8'
{% endhighlight %}

<p>
"services" element is a core section which defines containers. <br>
It has a sub-element like "image", "ports", "volumes" which are set as an option in 'docker run' command.
</p>

{% highlight ruby linenos %}
# : "services section"
# : "if you want to run service from image directly"
services: 
  SERVICE_NAME1: 
    image: IMAGE_NAME1:IMAGE_TAG1
    ports:
      - "CONTAINER_SERVICE_PORT:HOST_PORT"
    network: 
      - DOCKER_NETWORK_NAME
 
# : "if you want to run service with building Dockerfile"
  SERVICE_NAME2:
    build: 
      context: .                      // path the Dockerfile is located in.
      dockerfile: Dockerfile
    environment:
      ENV_VAR_NAME1: ENV_VAR_VALUE1
      ENV_VAR_NAME2: ENV_VAR_VALUE2
    network:
      - DOCKER_NETWORK_NAME
    volume:
      - DOCKER_VOLUME_NAME:CONTAINER_PATH     
      - HOST_VOLUME_PATH:CONTAINER_PATH     // starts with dot(.) or slash(/)
   ...  
{% endhighlight %}

<p>
"networks" and "volumes" define docker network and volume. Its effect is same as command 'docker network' or 'docker volume'.

</p>

{% highlight ruby linenos%}
: "Networks and Volumes Section"
networks:
  DOCKER_NETWORK_NAME:
    driver: host              // default is bridge
    ipam:
      config:
        - subnet: 192.168.100.0/24

volumes:
  DOCKER_VOLUME_NAME:
    driver: local

{% endhighlight %}

<p>
In summary, docker-compose file define how to create multiple containers and start them,
instead of typing docker command line by line.
</p>


<br><br>
## <span id="ctn3">III. Install Docker Compose</span>
<p>
Docker compose is a convenient utility to control docker containers, <br>
>unfortunately, it is only contained in docker desktop distribution, <br>
so If you installed dockerd with apt-get or yum, you have to install docker-compose standalone.
</p>

<p>
Therefore, docker compose must be installed before using docker-compose. Here is a cookbook to install docker-compose in Ubuntu.
</p>

<p>
[ Download and Install Docker-Compose with 'curl' Command]<br>
Download and install docker-compose files by executing command below.
</p>

{% highlight ruby linenos %}
# sudo curl -SL https://github.com/docker/compose/releases/download/v2.32.4/docker-compose-linux-x86_64 -o /usr/local/bin/docker-compose
{% endhighlight %}

![img.png](../../../assets/imgs/docker/basic%20usage/how_to_write_docker_compose-file/img3.png)

<p>
After installing files from curl, you can find 'docker-compose' file in /usr/local/bin.<br>
However, it does not have any execute permission, assign +x permission on that file. After that, you can use docker-compose command.
</p>

![img.png](../../../assets/imgs/docker/basic%20usage/how_to_write_docker_compose-file/img4.png)


<br><br>
## <span id="ctn4">IV. Example of Writing Docker Compose</span>
<p>
Then, let me create a docker compose file for my project. My project is consist of 3 processes and each process will be running in separate container.<br>
  <ul>
    <li>DB - Mongo Container</li>
    <li>API - Backend Django Rest Framework Container</li>
    <li>BOT - Telegram Bot Container</li>
  </ul>
</p>

![img.png](../../../assets/imgs/docker/basic%20usage/how_to_write_docker_compose-file/img5.png)

<p>
API container connected to DB and BOT container, and all containers do not allow external user to access them except telegram API communication.<br>
For this structure, I can create a docker-compose.yml file on my project root folder.
</p>

{% highlight ruby linenos %}
# : "docker-compose for my project"
# version: "3.8"

# services:
#   db_test:
#     build: 
#       context: ./docker_mongo
#       dockerfile: Dockerfile
#     container_name: db_test
#     hostname: db_test
#     ports:
#       - "127.0.0.1:27017:27017"
#     volumes:
#       - /backup/test/db:/data/db
#     networks:
#       - test_network1
#     command: ["mongod", "--auth"]
# 
#   api_test:
#     build:
#       context: ./docker_****
#       dockerfile: Dockerfile
#     container_name: api_test
#     hostname: api_test
#     ports:
#       - "127.0.0.1:8000:8000"
#     environment:
#       - ****_MONGODB_HOST="db_test"
#       - ****_EMAIL_HOST_USER="mymail@9mail.com"
#       - ****_EMAIL_HOST_PASSWORD="abcdefghijklmnop"
#     networks:
#       - test_network1
# 
#   bot_test:
#     build:
#       context: ./docker_****
#       dockerfile: Dockerfile
#     container_name: bot_test
#     hostname: bot_test
#     environment:
#       - ****_API_HOST_IP="api_test"
#       - ****_BOT_API_TOKEN="THISISACREDENTIAL.FALSEKEY"
#     networks:
#       - test_network1
# 
# networks:
#   test_network1:
#     driver: bridge
#
{% endhighlight %}

<p>
After writing and saving docker-compose.yml file, execute command 'docker-compose up -d' at the path where the docker-compose.yml file is located.<br>
This command will build new image from Dockerfile (as 'docker-compose build') if there is no image, and run containers in the same time.
</p>

{% highlight ruby linenos %}
# docker-compose up -d
{% endhighlight %}

{% highlight ruby %}
# '-d' option means background. if you missed it all container logs are printed out on your monitor.
{% endhighlight %}

![img.png](../../../assets/imgs/docker/basic%20usage/how_to_write_docker_compose-file/img6.png)
![img.png](../../../assets/imgs/docker/basic%20usage/how_to_write_docker_compose-file/img7.png)

<p>
If there is no error, then you can see the all containers defined in docker-compose are running well.
</p>

![img.png](../../../assets/imgs/docker/basic%20usage/how_to_write_docker_compose-file/img8.png)

<p>
You do not have to stop all container with typing command for each container. you can stop all container defined in compose with, 'docker-compose down' command.
</p>

![img.png](../../../assets/imgs/docker/basic%20usage/how_to_write_docker_compose-file/img9.png)

<p>
The command 'docker-compose' will affect on all containers defined in docker-compose file.<br>
Therefore, if you want to restart or remove all containers, just execute 'docker-compose restart' or 'docker-compose rm' 
</p>

<p>
Images which are created by build process in docker-compose.yml will be named 'project_folder_name'-'container_name'
</p>

![img.png](../../../assets/imgs/docker/basic%20usage/how_to_write_docker_compose-file/img10.png)

<p>
If there is a change in source files for containers, you have to recreate your image with command 'docker-compose commit'<br>
Changes in source will not be applied on image automatically, so you have to execute 'docker-compose commit' command after edit source.
</p>

![img.png](../../../assets/imgs/docker/basic%20usage/how_to_write_docker_compose-file/img11.png)

<p>
If you want not to use project and container name in your image name, you have to create your own image with custom name and tag first,<br>
then write a docker-compose file not with 'build' but 'image'
</p>

<p>
If you want to set a custom project name on your docker-compose, add option '-p [PROJECT_NAME]' when you do 'docker-compose up' command.<br>
Be advised that the image name does not change if there are previous image in the result of 'docker image ls'.
</p>

![img.png](../../../assets/imgs/docker/basic%20usage/how_to_write_docker_compose-file/img12.png)



<br><br>
## <span id="ctn5">IV. References</span>
<p>
  <ul>
    <li><a href="https://docs.docker.com/compose/" target="_blank">https://docs.docker.com/compose/</a></li>
    <li><a herf="https://docs.docker.com/compose/install/standalone/" target="_blank">https://docs.docker.com/compose/install/standalone/</a></li>
    <li><a href="https://docs.docker.com/desktop/setup/install/linux/">https://docs.docker.com/desktop/setup/install/linux/</a></li>
  </ul>
</p>
