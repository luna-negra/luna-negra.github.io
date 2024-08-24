---
title: 0011. Basic Usage of AbstractBaseUser for Custom UserModel
date: "2024-08-24 13:59:00 +0900"
edited: 
tags:
  - django 
  - AbstractBaseUser
  - simple website example
categories:
  - django
  - basic usage
---

<fieldset>
<legend>Content</legend>
<a href="#ctn1">I. Preview</a><br>
<a href="#ctn2">II. AbstractUser</a><br>
<a href="#ctn3">III. Customise UserManager</a><br>
<a href="#ctn4">IV. References</a><br>
</fieldset>


<br><br>
## <span id="ctn1">I. Preview</span>
<p>
As I introduced how to use 'AbstractUser' class in Django at <u><a href="https://luna-negra.github.io/django/basic%20usage/basic-usage-of-abstractuser-for-custom-usermodel.html" target="_blank">this site</a></u>, web developers can use its fields which are mainly used for designing web accounts.
However, all web-site does not follow this format, sometimes web developer make their own fields to create account table.
For example, 'AbstractUser' provides fields name 'username' for user's username or id, but you want to make email fields as an user fields.
Or, If you want to add fields that does not exist in 'AbstractUser' class, you have to create new fields on your 'models.py' file.
</p>

<p>
In this reason, Django also provides almost empty class for account or user model. It is an 'AbstractBaseUser', which 'AbstractUser' class inherits.
This class only support 'password' and 'last_login' fields, and there are not any variable named 'objects' or 'USERNAME_FIELDS' and so on, 
which are important to link other class authenticating or creating new users.
</p>

![img.png](../../../assets/imgs/django/basic%20usage/basic-usage-of-abstractbaseuser-for-custom-usermodel/img1.png)

<p>
Therefore, if you want to create an account model by using 'AbstractBaseUser', there will be more extra works than with 'AbstractUser'.
Let us see how to use it.
</p>


<br><br>
## <span id="ctn2">II. AbstractUser</span>
<p>
For this test, you have to create a new project and Django application for account or delete files involving in database.
I will remove all database files - in migrate folder in each application and sqlite3 file - on my projects.
</p>

<p>
I will create a simple user model so, 'MyUser' class will have only 6 fields - email, password, cp_num, is_admin, created, last_login.
In addition, I will replace username to email.
</p>

{% highlight ruby linenos %}
# [ models.py ]
#
#from django import models
#from django.contrib.auth.models import AbstractBaseUser
#from django.contrib.auth.models import UserManager
#
#
#class MyUser(AbstractBaseUser):
#    email = models.CharField(max_length=64, unique=True, blank=False)
#    cp_num = models.CharField(max_length=16, blank=False, null=False, unique=False)
#    created = models.DateTimeField(auto_now=True
#    is_admin = models.BooleanField(default=False)
#
#    USERNAME_FIELD = "email"
#    objects = UserManager()
#
{% endhighlight %}

{% highlight ruby %}
#  * Do not forget to set 'AUTH_USER_MODEL' on 'settings.py' file.
{% endhighlight %}

![img.png](../../../assets/imgs/django/basic%20usage/basic-usage-of-abstractbaseuser-for-custom-usermodel/img2.png)

<p>
After that, I migrate all models.py information to the database.
</p>

![img.png](../../../assets/imgs/django/basic%20usage/basic-usage-of-abstractbaseuser-for-custom-usermodel/img3.png)

<p>
Once you migrate successfully, you can see the schema of new user table which reflecting fields defined in AbstractBaseUser.
</p>

![img.png](../../../assets/imgs/django/basic%20usage/basic-usage-of-abstractbaseuser-for-custom-usermodel/img4.png)

<p>
In this status, you can see the fields on your browser after add some codes on 'forms.py', 'views.py' and templates file.
</p>

![img.png](../../../assets/imgs/django/basic%20usage/basic-usage-of-abstractbaseuser-for-custom-usermodel/img5.png)

<p>
Let me fill out these form and click register button. Once I register sample user information, it will be saved on User Database.
</p>

![img.png](../../../assets/imgs/django/basic%20usage/basic-usage-of-abstractbaseuser-for-custom-usermodel/img6.png)
![img.png](../../../assets/imgs/django/basic%20usage/basic-usage-of-abstractbaseuser-for-custom-usermodel/img7.png)

<p>
Let me sign in and sign out with newly created account. First, I add 'SignInForm' with 'forms.Form'.
</p>

{% highlight ruby linenos %}
# [ forms.py ]
#
# ...
#class SignInForm(forms.ModelForm):
#    class Meta:
#        model = get_user_model()
#        fields = ["email", "password"]
#        widgets = {"password": forms.PasswordInput()}
#
#    def clean(self):
#        pass
#
#    def login(self, request):
#        email = self.data.get('email')
#        password = self.data.get('password')
#        user = authenticate(request=request, email=email, password=password)
#
#        if user is not None:
#            login(request=request, user=user)
#            return True
#
#        return False
#
{% endhighlight %}

{% highlight ruby %}
#  * I did not change 'views.py' file which are used in previous post. Please refer to it.
{% endhighlight %}

<p>
* <u><a href="https://luna-negra.github.io/django/basic%20usage/basic-usage-of-abstractuser-for-custom-usermodel.html" target="_blank">Previous Post</a></u>
</p>

![img.png](../../../assets/imgs/django/basic%20usage/basic-usage-of-abstractbaseuser-for-custom-usermodel/img8.png)

<p>
At a glance, using 'AbstractBaseUser' does not have any problem with creating and sign-in/out users. 
However, if you try to create a superuser in this status, 'AbstractBaseUser' does not work properly.
</p>

![img.png](../../../assets/imgs/django/basic%20usage/basic-usage-of-abstractbaseuser-for-custom-usermodel/img9.png)

<p>
The cause of this issue is on the 'UserManager' class. 
When you see the code of this class, you can see the method containing 'create_superuser' on its name.
</p>

![img.png](../../../assets/imgs/django/basic%20usage/basic-usage-of-abstractbaseuser-for-custom-usermodel/img10.png)

<p>
There are two method '_create_superuser()' and 'create_superuser()' and '_create_superuser()' is a responsibility to save user information.
It needs values from username fields, but I do not have any fields named 'username' and it makes issue above.
</p>

<p>
So, To avoid this issue during creating superuser, I have to create custom 'UserManager' class and linked it to my UserModel.
</p>


<br><br>
## <span id="ctn3">III. Customise UserManager</span>
<p>
To create superuser with 'AbstractBaseUser', you have to create custom 'UserManager' class inheriting 'UserManager'. 
By overriding 'create_superuser()' method, you can solve issue on creating superuser. Let me test with overriding simple code in this method.
</p>

{% highlight ruby linenos %}
# [ models.py ]
#
# ...
#class CustomUserManager(UserManager):
#    def create_superuser(self, email, password=None, **kwargs):
#        print(email)
#        print(password)
#        print(" - Add Code for Save Info")
# ...
#
#class MyUser(AbstractBaseUser):
# ...
#    objects = CustomUserManager()
# ...
#
{% endhighlight %}

![img.png](../../../assets/imgs/django/basic%20usage/basic-usage-of-abstractbaseuser-for-custom-usermodel/img11.png)

<p>
As a result, if you add code to save superuser information on 'create_superuser()', you can add superuser with command line.
</p>

![img.png](../../../assets/imgs/django/basic%20usage/basic-usage-of-abstractbaseuser-for-custom-usermodel/img12.png)
![img.png](../../../assets/imgs/django/basic%20usage/basic-usage-of-abstractbaseuser-for-custom-usermodel/img13.png)

<p>
However, if you try to log-in with superuser account to Django's admin site, you will always fail to log-in.
Because Django's admin site requires some fields such as 'is_staff' or 'has_module_perms' and so on, but my UserModel does not have these fields.
If you want to use only 'is_admin' field to log-in Django's admin site, you have to edit files related with Django admin application.
</p>

![img.png](../../../assets/imgs/django/basic%20usage/basic-usage-of-abstractbaseuser-for-custom-usermodel/img14.png)

<p>
Let me edit 'MyUser' and try to log in with admin account again.
</p>

![img.png](../../../assets/imgs/django/basic%20usage/basic-usage-of-abstractbaseuser-for-custom-usermodel/img16.png)
![img.png](../../../assets/imgs/django/basic%20usage/basic-usage-of-abstractbaseuser-for-custom-usermodel/img17.png)

{% highlight ruby %}
#  * You can not see the basic user information in that site yet, due to the permission issue.
{% endhighlight %}


<br><br>
## <span id="ctn4">IV. References</span>
<p>
  <li>
    <ul><a href="https://docs.djangoproject.com/en/4.2/topics/auth/customizing/" target="_blank">https://docs.djangoproject.com/en/4.2/topics/auth/customizing/</a></ul>
    <ul><a href="https://stackoverflow.com/questions/14723099/attributeerror-manager-object-has-no-attribute-get-by-natural-key-error-in" target="_blank">https://stackoverflow.com/questions/14723099/attributeerror-manager-object-has-no-attribute-get-by-natural-key-error-in</a></ul>
    <ul><a href="https://reintech.io/blog/creating-a-custom-user-management-system-in-django" target="_blank">https://reintech.io/blog/creating-a-custom-user-management-system-in-django</a></ul>
  </li>
</p>
