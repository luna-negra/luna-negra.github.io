---
title: 0018. User Authentication and Session with MongoDB in Django
date: "2024-11-23 16:22:00 +0900"
edited: 
tags:
  - django 
  - mongo db
  - user authentication
  - session control
categories:
  - django
  - advanced protocols
---


<fieldset>
  <legend>Contents</legend>
    <a href="#ctn1">I. Preview</a><br>
    <a href="#ctn2">II. Django Setting</a><br>
    <a href="#ctn3">III. Primary Key with IntegerField</a><br>
    <a href="#ctn4">IV. Primary Key with StringrField</a><br>
    <a href="#ctn5">V. References</a>
</fieldset>


<br><br>
## <span id="ctn1">I. Preview</span>
<p>
If you are planning to create your own website with any web-framework, you have to select DBMS. Most web frameworks 
support ORM so you don't have to know much about how to control db with shell. 
</p>

<p>
Django also support some DBMS for saving data. However Django supports Relational RDBMS - MySQL, PostgreSQL, SQLITE3 - basically, 
you have to do some additional work to use the other Non-Relational database such as MongoDB.
</p>

<p>
The real problem with database not supported by Django is, you can not use Django's function which are related with user control.
If you create a model with 'mongoengine', you might face with some issues during test for login process.
For example, you may see the issue if you create your model with non-IntField as a primary key or if you change __str() method in 
model class to return non integer value.
</p>

<p>
In this post, I will demonstrate how to create user model with Mongo DB to use django's authentication and session logic.
</p>


<br><br>
## <span id="ctn2">II. Django Setting</span>
<p>
When the user sign in django webpage,
</p>

<ol>
  <li>Django views.py get a sign in user's information.</li>
  <li>Internal logic - forms.py - for input value would validate input values.</li>
  <li>Django UserBackend class authenticate username and password.</li>
    <ul>
      <li>authenticate() method containing check_password() method in backend class will return user object with sign in user if username and password matches.</li>
      <li>get_user() method in backend class will return user object to request objects. In detail, it returns user object to 'request.user'</li>
    </ul>
  <li>with returned user object, Django do a login() process in django.contrib.auth package.</li>
  <li>In login() method, web session would be issued for signed in user and saved in browser cache.</li>
</ol>

<p>
Refer to the process above, first I have to add settings for backend and session on 'settings.py'.
</p>

{% highlight ruby linenos %}
: "settings.py"

...
// MongoDB Session
SESSION_ENGINE = 'django.contrib.sessions.backends.cache'
SESSION_COOKIE_AGE = 300

// MongoDB Authentication Backend
AUTHENTICATION_BACKENDS = ['BACKEND_PARENT_PATH_WITH_POINT']
...
{% endhighlight %}

{% highlight ruby %}
*  Except 'cache' SESSION_ENGINE would be file, db and so on.
   - django.contrib.sessions.backends.file: you should also set the SESSION_COOKIE_PATH with folder path.
   - django.contrib.sessions.backends.db: This require DATABASE setting variables in 'settings.py'
*  Example of AUTHENTICATION_BACKENDS
   - ['APP_NAME.FILE_NAME.BACKEND_CLASS_NAME']
{% endhighlight %}

![img.png](../../../assets/imgs/django/advanced%20protocols/user-authentication-and-session-with-mongodb-in-django/img1.png)


<p>
I create another python file to save BACKEND_CLASS with name backends.py in app folder.
</p>

![img.png](../../../assets/imgs/django/advanced%20protocols/user-authentication-and-session-with-mongodb-in-django/img2.png)

<p>
Now, I will create a new application named 'users' in my django project, and write down codes for using Django's user authentication process with MongoDB.
For this, I create 'urls.py', 'forms.py', 'models.py' as below.
</p>

{% highlight ruby linenos %}
: "urls.py"

from django.urls import path, include
from . import views


app_name: str = "users"
urlpatterns: list = [
    path("", views.access, name="access"),
    path("index/", views.index, name="index"),
    path("signin/", views.signin, name="signin"),
    path("signout/", views.signout, name="signout"),
    path("signup/", views.signup, name="signup"),
]

{% endhighlight %}


{% highlight ruby linenos %}
: "views.py" 

from django.shortcuts import render, redirect
from django.views.decorators.http import require_http_methods, require_GET, require_POST

from users.forms import *

# Create your views here.

TEMPLATE_PATH: str = "users/"


@require_GET
def access(request):
    return redirect(to="/index")


@require_GET
def index(request):
    if request.session.session_key is None:
        return redirect(to="/signin")

    context = {}
    return render(request=request,
                  template_name=f"{TEMPLATE_PATH}index.html",
                  context=context)


@require_http_methods(["GET", "POST"])
def signin(request):
    if request.session.session_key is not None:
        return redirect(to="/index")

    context = {"form": SignInForm()}

    if request.method == "POST":
        form = SignInForm(request=request, data=request.POST)
        if form.is_valid():
            form.save()
            return redirect(to="/index")

        context["form"] = form

    return render(request=request,
                  template_name=f"{TEMPLATE_PATH}signin.html",
                  context=context)


@require_http_methods(["GET", "POST"])
def signup(request):
    if request.session.session_key is not None:
        return redirect(to="/index")

    context = {"form": SignUpForm()}

    if request.method == "POST":
        form = SignUpForm(data=request.POST)
        if form.is_valid():
            form.save()
            return redirect(to="/index")

        context["form"] = form

    return render(request=request,
                  template_name=f"{TEMPLATE_PATH}signup.html",
                  context=context)

@require_POST
def signout(request):
    return redirect(to='/')

{% endhighlight %}

{% highlight ruby linenos %}
: "forms.py"

import mongodbforms as mf
from django import forms
from django.contrib.auth.hashers import make_password
from django.core.exceptions import ValidationError


from users.models import Users


class SignInForm(mf.DocumentForm):
    class Meta:
        model = Users
        fields = [
            "email",
            "password",
        ]
        widgets = {
            "email": forms.EmailInput(attrs={"placeholder": "Enter your Email"}),
            "password": forms.PasswordInput(attrs={"placeholder": "Enter your password"}),
        }

    def __init__(self, *args, **kwargs):
        self.request = kwargs.pop('request', '')
        self.user = None
        super().__init__(*args, **kwargs)

    def clean(self):
        data = self.data
        email = data.get("email", "")
        password = data.get("password", "")

    def save(self):
        pass


class SignUpForm(mf.DocumentForm):

    password_retype = mf.CharField(widget=forms.PasswordInput())
    class Meta:
        model = Users
        fields = [
            "email",
            "password",
            "password_retype",
            "first_name",
            "last_name",
        ]
        widgets = {
            "email": forms.EmailInput(attrs={"placeholder": "Type your Email as an Username"}),
            "password": forms.PasswordInput(attrs={"placeholder": "Type your password"}),
            "first_name": forms.TextInput(attrs={"placeholder": "Type your first name"}),
            "last_name": forms.TextInput(attrs={"placeholder": "Type your last name"}),
        }

    def clean_email(self):
        email = self.data.get("email", "")
        if Users.objects(email=email).first() is not None:
            raise ValidationError("Email is already registered")
        return email

    def clean_password(self):
        pw = self.data.get("password", "")
        pw_re = self.data.get("password_retype", "")
        if pw != pw_re:
            raise ValidationError("Password is not match.")
        return make_password(password-=pw)

    def clean_first_name(self):
        name = self.data.get("first_name", "")
        return f"{name[0].upper()}{name[1:]}"

    def clean_last_name(self):
        name = self.data.get("last_name", "")
        return f"{name[0].upper()}{name[1:]}"

    def save(self):
        data = {k:v for k,v in self.cleaned_data.items()}
        data.pop("password_retype")
        new_user = Users(**data)
        new_user.save()

{% endhighlight %}


{% highlight ruby linenos %}
: "models.py"

import mongoengine as mg


class Users(mg.Document):
    id = mg.IntField(required=False, primary_key=True)
    email = mg.EmailField(required=True)
    password = mg.StringField(required=True, min_length=8, max_length=256)
    first_name = mg.StringField(required=True)
    last_name = mg.StringField(required=True)
    last_signin_date = mg.DateTimeField()
    signup_date = mg.DateTimeField()

    def __str__(self):
        return str(self.id)

{% endhighlight %}

<p>
In this status, you can access 'signin' and 'signup' page only.
In 'signup' page, you can input information of your new account, but Mongo DB does not support auto-increment in IntField,
You can not save your new account information in database.
</p>

![img.png](../../../assets/imgs/django/advanced%20protocols/user-authentication-and-session-with-mongodb-in-django/img3.png)

<br><br>
## <span id="ctn3">III. Primary Key with IntegerField </span>
<p>
To use auto-increment in IntField with 'mongoengine' you have to create another collection that control your ID sequence.
For this, I create another model named Counter in 'models.py' file.
</p>

{% highlight ruby linenos %}
: "models.py"
...

class Counter(mg.Document):
    collection = mg.StringField(required=True, primary_key=True)
    sequence = mg.IntField()

    @classmethod
    def get_next_sequence(cls, collection):
        current_sequence = cls.objects(collection=collection).modify(
            upsert=True,
            new=True,
            inc__sequence=1
        )

...
{% endhighlight %}

{% highlight ruby %}
*  upsert=True: If the document does not exist, MongoDB creates a new one.
*  new=True: Returns the document after the update operation is applied.
*  inc__sequence_value=1: Increments the sequence_value field by 1. 
*  'inc__' is a MongoDB prefix for Increment.
{% endhighlight %}

<p>
And create a save() method in User model, so make the new user has the latest sequence number. 
</p>

{% highlight ruby linenos %}
: "models.py"

...
class Users(mg.Document):
    ...
    def save(self, *args, **kwargs):
        if self.id is None:
            self.id = Counter.get_next_sequence(collection=self.__class__.__name__)
        super(Users, self).save(*args, **kwargs)
    ...
...
{% endhighlight %}

<p>
After editing code like above, you can save your new account in your database, and id value will be assigned automatically.
</p>

![img.png](../../../assets/imgs/django/advanced%20protocols/user-authentication-and-session-with-mongodb-in-django/img4.png)

![img.png](../../../assets/imgs/django/advanced%20protocols/user-authentication-and-session-with-mongodb-in-django/img5.png)


<p>
In this status, let me create a login process in SignInForm(). First, I create a authentication process in clean() method.
To check the password for each user, it is recommended to use 'check_password()' function in 'django.contrib.auth.hashers' package.
</p>

<p>
Before doing this, be advised that the authentication process in Django will use backend to authenticate and assigning session to signed in user.
Therefore it is also recommended to create a authenticate() in custom backend. 
I will create a new file 'backends.py' and write a code for custom user backend.
</p>

{% highlight ruby linenos %}
: "backends.py"

from django.contrib.auth.backends import BaseBackend
from django.contrib.auth.hashers import check_password
from users.models import Users


class MongoDBBackend(BaseBackend):

    def authenticate(self, request, **kwargs):
        try:
            user = Users.objects.get(email=kwargs.get("email", ""))
        except Users.DoesNotExist:
            return None

        if check_password(password=kwargs.get("password", ""), encoded=user.password):
            return user
        return None

{% endhighlight %}

{% highlight ruby %}
*  authenticate() method is a override form from BaseBackend. 
{% endhighlight %}

<p>
And I will use this method in clean() method for sign in process, therefore, 
</p>

{% highlight ruby linenos %}
: "forms.py"
from .backends import MongoDBBackend

...
class SignInForm(mf.DocumentForm):
    ...
    def __init__(self, *args, **kwargs):
        self.request = kwargs.pop('request', '')
        self.backend = MongoBackend()
        self.user = None

    def clean(self):
        data = self.data
        email = data.get("email", "")
        password = data.get("password", "")

        user = self.backend.authenticate(request=self.request,
                                         email=email,
                                         password=password)
        if user is None:
            raise ValidationError("Email and Password is not match")

        self.user = user
...
{% endhighlight %}

<p>
If you print out self.user at the end of the SignInForm.clean() method, and the user information is matched,
you can see the user' pk on the shell.
</p>

![img.png](../../../assets/imgs/django/advanced%20protocols/user-authentication-and-session-with-mongodb-in-django/img6.png)

<p>
The final work is writing down codes in save() method. I have a authenticated user objects, 
so login session will be assigned to this user objects and request objects also have this user objects as a value of 'user' key.
'request.user' will be get a user object from get_user() method in backend class, and get_user() only accept pk value as a argument. 
</p>

<p>
Therefore, get_user() method in backend class will be like below.
</p>

{% highlight ruby linenos %}
: "backends.py"

...
class MongoDBBackend(BaseBackend):
    ...
    def get_user(self, id: int):
        try:
             return Users.objects(pk=id).first()
        except Users.DoesNotExist:
             return None

...
{% endhighlight %}

<p>
Finally, let me write down the save() method in SignInForm class. This method is charge of login for authenticated user,
so I have to use login() method which is located in 'django.contrib.auth' package.
</p>

{% highlight ruby linenos %}
: "forms.py"
from django.contrib.auth import login

...
class SignInForm(mg.DocumentForm):
    ...
    def save(self):
        if self.user is not None:
            login(request=self.request, user=self.user)
...
{% endhighlight %}

<p>
But, it does not work, because fields class derived from 'mongoengine' does not have 'value_to_string()' method, 
so Django can not execute its internal code anymore.
</p>

![img.png](../../../assets/imgs/django/advanced%20protocols/user-authentication-and-session-with-mongodb-in-django/img7.png)

<p>
To solve this problem, I have to create a new fields and make the 'id' variable in user model use newly created field.
</p>

{% highlight ruby linenos %}
: "fielsd.py"

from mongoengine import IntField as mi


class IntField(mi):
    def value_to_string(self, value):
        return str(value)

{% endhighlight %}


{% highlight ruby linenos %}
: "models.py"

import mongoengine as mg
from fields import IntField


class Users(mg.Document):
    id = IntField(required=False, primary_key=True)
    ...
...
{% endhighlight %}

![img.png](../../../assets/imgs/django/advanced%20protocols/user-authentication-and-session-with-mongodb-in-django/img8.png)

<p>
If you want to print out user info on index page, add DTL in index.html and edit index() function in 'views.py'.
</p>

![img_1.png](../../../assets/imgs/django/advanced%20protocols/user-authentication-and-session-with-mongodb-in-django/img9.png)



<br><br>
## <span id="ctn4">IV. Primary Key with StringField</span>
<p>
Now, I will change the field that has option primary_key as True. 
Because I am using email as a username, I want to set a email fields as a primary key.
I get rid of all collections in database and re-design user model like below.
</p>

{% highlight ruby linenos %}
: "fields.py"

from mongoengine import EmailField as me


class EmailField(me):
    def value_to_string(self, value):
        return str(value)

{% endhighlight %}



{% highlight ruby linenos %}
: "models.py"
import mongoengine as me
from .fields import EmailField

class Users(mg.Document):
    email = EmailField(required=True, primary_key=True)
    ...

    def __str__(str):
        return self.email

    def save(self, *args, **kwargs):
        super(Users, self).save(*args, **kwargs)
...
{% endhighlight %}


<p>
At this stage, you can save your account and you can check the email fields becomes a primary key.
</p>

![img.png](../../../assets/imgs/django/advanced%20protocols/user-authentication-and-session-with-mongodb-in-django/img10.png)

<p>
The authentication and login process is the same, so you can sign in with any problem. In comparing with previous example,
you can see the user' email when you print out request.user info in 'index.html'.
</p>

![img.png](../../../assets/imgs/django/advanced%20protocols/user-authentication-and-session-with-mongodb-in-django/img11.png)

<p>
This protocol does not allow to change return value of __str__() method, 
because get_user() method in the custom backend refer to this return value when it tries to look user object.
</p>

![img.png](../../../assets/imgs/django/advanced%20protocols/user-authentication-and-session-with-mongodb-in-django/img12.png)



<br><br>
## <span id="ctn5">V. References</span>
<p>
  <ul>
    <li><a href="https://docs.djangoproject.com/en/4.2/ref/settings/#sessions" target="_blank">https://docs.djangoproject.com/en/4.2/ref/settings/#sessions</a></li>
    <li><a href="https://docs.djangoproject.com/en/5.1/topics/auth/customizing/#specifying-authentication-backends" target="_blank">https://docs.djangoproject.com/en/5.1/topics/auth/customizing/#specifying-authentication-backends</a></li>
    <li><a href="https://docs.djangoproject.com/en/5.1/topics/auth/customizing/#specifying-authentication-backends" target="_blank">https://docs.djangoproject.com/en/5.1/topics/auth/customizing/#specifying-authentication-backends</a></li>  
    <li><a href="https://docs.djangoproject.com/en/5.1/ref/settings/#sessions" target="_blank">https://docs.djangoproject.com/en/5.1/ref/settings/#sessions</a></li>
  </ul>
</p>
