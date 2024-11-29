---
title: 0019. Create New Django Commands
date: "2024-11-29 20:42:00 +0900"
edited: "2024-11-29 20:47:00 +0900"
tags:
  - django 
  - new command
  - django-admin
categories:
  - django
  - basic usage
---


<fieldset>
    <legend><Content</legend>
    <a href="#ctn1">I. Preview</a><br>
    <a href="#ctn2">II. How Django Command Works</a><br>
    <a href="#ctn3">III. Create a New Command</a><br>
    <a href="#ctn4">IV. Reference</a><br>
</fieldset>


<br><br>
## <span id="ctn1"> I. Preview</span>
<p>
If you use a Mongo DB as a database in django, you can not use Django's User functions such as authenticating login user or 
assigning session to login user, and so on. Once you decide to use Mongo DB with Django, you have to create these functions from the scratch.
In addition, you can not create a admin user with 'django-admin' command because Django deos not support MongoDB as a default.
</p>

![img.png](../../../assets/imgs/django/basic%20usage/create-new-django-commands/img1.png)

<p>
Now, My user class does have only a part of fields that are required by Django's user function. 
In addition, 'settings.py' file in my project does not have any default database setting because I am using Mongo DB.
</p>

<p>
Evne if I create a custom user manager class, I could not use createsuperuser command, because Mongo DB is not in a list of 
supported database.
</p>

![img.png](../../../assets/imgs/django/basic%20usage/create-new-django-commands/img2.png)

<p>
Then is it not possible to create superuser in a project that use MongoDB for database?
</p>


<br><br>
## <span id="ctn2"> II. How Django Command Works</span>
<p>
Let me find default options for 'manage.py'. Django contains files that defined each commands in each default application folder.
In detail, 'management > commands' folder in each Django application.
</p>

![img.png](../../../assets/imgs/django/basic%20usage/create-new-django-commands/img3.png)

<p>
This means, it is possible to create a new command option of 'manage.py' in each application with a same file system like above.
To create a superuser with command option, I will create same file system in my user application folder.
</p>

{% highlight ruby linenos %}
: "move to application folder"
mv USER_APP_PATH

: "create a new folder to save command file"
mkdir -p management/commands

: "create a init.py file in each folder"
touch management/__init__.py
touch management/commands/__init__.py
{% endhighlight %}

<p>
Then in commands folder, I will create a new file name 'mgtest.py'. After creating a 'mgtest.py' file, 
I can see the mgtest with command 'python manage.py --help'
</p>

![img.png](../../../assets/imgs/django/basic%20usage/create-new-django-commands/img4.png)

<p>
However, you can not execute this option because command file must have code that define the action for option.
</p>

![img.png](../../../assets/imgs/django/basic%20usage/create-new-django-commands/img5.png)

<p>
As you can see the error message, you have to write down class named 'Command' which is inheriting 'BaseCommand' in Django.
</p>

![img.png](../../../assets/imgs/django/basic%20usage/create-new-django-commands/img6.png)


<br><br>
## <span id="ctn3"> III. Create a New Command</span>

<p>
This class file has a method named 'handle' and this method is charge of logic for new option.
So, If I insert print("hello django") in this method, I can see the 'hello django' on the shell as a result of executing command.
</p>

{% highlight ruby linenos %}
: "mgtest.py"
from django.core.management.base import BaseCommand
from users.models import Users


class Command(BaseCommand):

    def handle(self, *args, **kwargs):
        print("hello django")

{% endhighlight %}

![img.png](../../../assets/imgs/django/basic%20usage/create-new-django-commands/img7.png)


<p>
So, If you write down code for creating a superuser, you can create a superuser account via shell. 
I will change a file name from 'mgtest.py' to 'createroot.py' and build some code lines.
</p>

{% highlight ruby linenos %}
: "createroot.py"

from django.core.management.base import BaseCommand
from users.models import Users


class Command(BaseCommand):

    def handle(self, *args, **kwargs):
                try:
            data: dict = {
                "email": input("Enter your email: "),
                "password": pwinput("Enter your password: "),
                "first_name": input("Enter your first name: "),
                "last_name": input("Enter your last name: "),

                "is_superuser": True,
            }

        except KeyboardInterrupt:
            return

        if Users.objects(email=data.get("email", "")).first():
            self.stdout.write(self.style.ERROR("User with this email already exists."))
            return

        user = Users(**data)
        user.make_password()
        user.save()

        self.stdout.write(self.style.SUCCESS("Superuser created successfully."))

{% endhighlight %}

{% highlight ruby %}
*  My user class have email, password, first_name and last_name fields as required.
*  To distinguish superuser, I insert 'is_superuser' field in my user class.
{% endhighlight %}

<p>
And I can create a new superuser with 'python manage.py createroot' command
</p>

![img.png](../../../assets/imgs/django/basic%20usage/create-new-django-commands/img8.png)

![img.png](../../../assets/imgs/django/basic%20usage/create-new-django-commands/img10.png)

<br><br>
## <span id="ctn4"> IV. References</span>
<p>
  N/A
</p>