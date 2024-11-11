---
title: 0016. Use MongoDB Container with Django
date: "2024-11-11 19:56:00 +0900"
edited: "2024-11-11 20:08:00 +0900"
tags:
  - django 
  - settings
  - mongodb
categories:
  - django
  - advanced protocols
---

<fieldset>
<legend>Content</legend>
    <a href="#ctn1">I. Preview</a><br>
    <a href="#ctn2">II. Prerequisite for Docker</a><br>
    <a href="#ctn3">III. Django Setting</a><br>
    <a href="#ctn4">IV. References</a><br>
</fieldset>

<br><br>
## <span id="ctn1">I. Preview</span>
<p>
Django is a web framework. In this reason, Django should have DBMS to save its data created between server and client.
Basically, Django provide a SQLite for its database, so if you start your django project from the scratch, 
you can see the file 'db.sqlite3' in your project folder.
</p>

<p>
However, There is a lot of problem to use SQLite for a product. First of all, 
SQLite does not have any security settings and save its data as a file - db.sqlite3 - without encryption.
There for the file, SQLite created can be read to everybody. Everyone can access this file and read its contents without authentication process.
For this reason, Django engineer use SQLite only in developing or debugging work. 
</p>

<p>
Second, it becomes more difficult to save data with a specific relation. 
Because most data recently created are unstructured, so these data can not be stored in a Relational Database.
The SQLite is also one of Relational DBMS, so you can not also use SQLite if you are going to save unformatted data.
</p>

<p>
How can we solve this issue when we use django? My answer is using MongoDB in your Django project.
</p>

<p>
MongoDB is a NoSQL and document-orientated DBMS. It saves data with json-like format and therefore mongodb can save unstructured data very easily.
MongoDB save its data as a file like SQLite, but MongoDB do transform its data to binary format. So If the third party person get your mongodb file,
he or she can not see the contents in easy way.
</p>

<p>
When it comes to the security, MongoDB is better than SQLite. MongoDB can create a user and custom role, so it is useful to control 
user to access its database.
</p>


<br><br>
## <span id="ctn2">II. Prerequisite for Docker</span>
<p>
<span style="color:yellow;">[ Be Advised ]</span><br>
- I am using MongoDB with docker container and will demonstrate how to connect django and Mongo DB as a basic level.<br>
- If you don't have any docker in your machine, please follow the <a href="https://docs.docker.com/engine/install/" target="_blank">reference to install docker</a>.
</p>


<br>
#### 1. Pull MongoDB Image

{% highlight ruby linenos%}
: "pull mongodb image from the official docker hub site."
sudo docker pull mongo
{% endhighlight%}


<br>
#### 2. Run Mongo Container

{% highlight ruby linenos %}
: "run mongo container."
sudo docker run -d --name mongo \
                   --hostname mongo \
                   --publish 27017:27017 \
                   mongo
{% endhighlight %}


<br>
#### 3. Check the Access to Mongo Container

[ In Local ]
{% highlight ruby linenos %}
: "run mongo container."
sudo docker exec -it mongo mongosh 
{% endhighlight %}

<p>
If there is no issue, you can see some MongoDB' logs and DB prompt with 'test>'
</p>

![img.png](../../../assets/imgs/django/advanced%20protocols/use-mongodb-container-with-django/img1.png)

[ Check the Port from the Remote ]
{% highlight ruby linenos %}
: "check the Mongo DB' port is open"
curl -v telnet://[IP_ADDRESS]:[PORT]
{% endhighlight %}

![img.png](../../../assets/imgs/django/advanced%20protocols/use-mongodb-container-with-django/img2.png)


<br>
#### 4. Create a Superuser
<p>
In MongoDB container, you have to create superuser account. This superuser can create another user, role, db and collection(table).
</p>

{% highlight ruby linenos %}
: "move to admin database"
use admin

: "create a superuser account"
db.createUser({
  user: 'USERNAME',
  pwd: passwordPrompt(), 
  roles: [
    { role: 'root', db: "admin" }
  ]
})

{% endhighlight %}

{% highlight ruby %}
*  You can enter the password string instead of passwordPrompt().
{% endhighlight %}

![img.png](../../../assets/imgs/django/advanced%20protocols/use-mongodb-container-with-django/img3.png)

<p>
Now you have a superuser 'admin' in your Mongo DB Server. If you see the new account was created, 
logout with 'exit' command and re-login with command below
</p>

{% highlight ruby linenos %}
: "log out MongoDB"
exit

: "login MongoDB with superuser account"
sudo docker exec -it mongo mongosh -u USERNAME -p -authenticationDatabase admin
{% endhighlight %}

{% highlight ruby %}
*  You can assign your password after option '-p'
{% endhighlight %}


<br>
#### 5. Create a Database and User for DB

<p>
I am about to save the user input data in 'django' Database in Mongo DB. To this, I will create new database named 'django',
 and create another user to read and write 'django' database.
</p>

{% highlight ruby linenos %}
: "create new database"
use django

: "create a new user with rw permission"
db.createUser({
  user: 'USERNAME',
  pwd: passwordPrompt(),
  roles: [
    { role: "dbOwner", db: "django" }
  ]
})

: "if you need to create a collection with superuser"
db.createCollection("[COLLECTION_NAME]")

{% endhighlight %}

{% highlight ruby %}
*  'use' command includes 'create database' implicitly.
*  When you name the database, I recommend you to name it with project name.
*  All class name in models.py will be a collection name (table name) in Mongo DB.
*  If you did not create any collection with superuser, new user's permission must be 'dbOwner'.
{% endhighlight %}

![img.png](../../../assets/imgs/django/advanced%20protocols/use-mongodb-container-with-django/img4.png)


<br><br>
## <span id="ctn3">III. Django Setting</span>

<p>
As a default, Django does not provide any engine for MongoDB, so you have to install python package 'mongoengine' first.
</p>

<br>
#### 1. Install 'mongoengine' Python Package.

{% highlight ruby linenos %}
: "install 'mongoengine'"
sudo pip install mongoengine
{% endhighlight %}


<br>
#### 2. Connection Setting.

<p>
After installation, open the 'settings.py' folder and add some lines.
</p>

{% highlight ruby linenos %}
// settings.py
// import mongoengine
import mongoengine as mg
...

//connect to database
mg.connect(
  { 
     db: "[DB_USERNAME]",
     host: "mongodb://[DB_USERNAME]:[USER_PASSWORD]@[IP_ADDRESS]:[PORT]/[DB_NAME]?authSource=[DB_NAME]"
)
...
{% endhighlight %}


#### 3. Create a models.py

<p>
Although MongoDB is a non-relational DBMS, Django require a basic relation to save a data. 
Therefore, I have to fill models.py file out with lines to save member's account. 
</p>

{% highlight ruby linenos %}
// models.py in application file
// import mongoengine
import mongoengine as mg

class User(mg.Document):
    email = mg.EmailField(required=True, unique=True, primary_key=True)
    password = mg.StringField(required=True, unique=False)
    created_at = mg.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.email
...
{% endhighlight %}

{% highlight ruby %}
*  The class name will be a collection name in Database 'django'
*  You don't have to migrate a database because MongoDB does not require to create table.
{% endhighlight %}


![img.png](../../../assets/imgs/django/advanced%20protocols/use-mongodb-container-with-django/img5.png)

<p>
<span style="color: yellow;">[Be Advised]</span><br>
Django’s authentication framework typically requires using django.contrib.auth and the default User model. 
However, with MongoEngine, you’ll need to create a custom authentication mechanism, 
as MongoDB is not directly compatible with Django’s ORM-based User model.
</p>


<br>
#### 4. Test to Save Input Data

<p>
I will creat a new user for my Django project, which connects to Mongo DB container.
To this, I will open the login page in my browser and do a sign up process.
</p>

![img.png](../../../assets/imgs/django/advanced%20protocols/use-mongodb-container-with-django/img6.png)

![img.png](../../../assets/imgs/django/advanced%20protocols/use-mongodb-container-with-django/img7.png)


<p>
If the web page does not print out any error, please check whether the data was saved in Mongo DB.
</p>

{% highlight ruby linenos %}
: "login Mongo DB with DB Account"
sudo docker exec -it mongo mongosh -u USERNAME -p --authenticationDatabase DB_NAME

: "move to DB"
use DB_NAME

: "show all documents"
db.COLLECTION_NAME.find()
{% endhighlight %}

![img.png](../../../assets/imgs/django/advanced%20protocols/use-mongodb-container-with-django/img8.png)


<br><br>
## <span id="ctn4">IV. Preview</span>
<p>
  <ul>
    <li><a href="https://www.mongodb.com/docs/manual/" target="_blank">https://www.mongodb.com/docs/manual/</a></li>
    <li><a href="https://docs.mongoengine.org/tutorial.html" target="_blank">https://docs.mongoengine.org/tutorial.html</a></li>
    <li><a href="https://www.mongodb.com/resources/products/compatibilities/mongodb-and-django#Connect%20Django%20and%20MongoDB%20Using%20MongoEngine" target="_blank">https://www.mongodb.com/resources/products/compatibilities/mongodb-and-django#Connect%20Django%20and%20MongoDB%20Using%20MongoEngine</a></li>
  </ul>
</p>