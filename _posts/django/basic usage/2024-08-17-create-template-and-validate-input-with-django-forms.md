---
title: 0008. Create Template and Validate Input with Django Forms
date: "2024-08-17 17:19:00 +0900"
edited: 
tags:
  - django 
  - basic forms
  - simple website example
categories:
  - django
  - basic usage
---


<fieldset>
<legend>Content</legend>
<a href="#ctn1">I. Priview</a><br>
<a href="#ctn2">II. Architecture of Django Form</a><br>
<a href="#ctn3">III. Create a Simple Example </a><br>
<a href="#ctn4">IV. References</a><br>
</fieldset>


<br><br>
## <span id="ctn1">I. Preview</span>
<p>
With a knowledge about django's basic architecture, you can create your website with it, as you can see at <u><a href="https://luna-negra.github.io/django/basic%20usage/django-basic-architecture-to-build-simple-website.html" target="_blank">my previous post</a></u>.
However, Once you are familiar with the django's basic architecture, you may recognise that some parts have some repeated work processes or inconvenient things.
Let us have a look at it.
</p>

<p>
I would like to create a simple website that users can send their personnel information to the django server. It does only have a storage function, 
so my website will have only 'index' view and index.html will be shown like below.
</p>

![img.png](../../../assets/imgs/django/basic%20usage/create-template-and-validate-input-with-django-forms/img1.png)

<p>
The 'index' view will accept "GET" and "POST" communications so that the users can submit their data through the index view.
Let me make it in a minute. First, I will create a new application named 'formtest' and set urls.py at my project folder and newly created application folder.
</p>

{% highlight ruby linenos %}
# [ project_folder / urls.py ]
#  
#from django.urls import path, include
#from django.contrib import admin
#from formtest import urls as urls_formtest
#
#
#urlpatterns: list = [
#    path("admin/", admin.site.urls),
#    path("", include(urls_formtest))
#]
{% endhighlight %}


{% highlight ruby %}
#  * Do not forget to add new application AppConfig to 'settings.py' 
{% endhighlight %}


{% highlight ruby linenos %}
# [ formtest / urls.py ]
#
#from django.urls import path
#from formtest import views
#
#
#app_name: str = "formtest"
#urlpatterns: list = [
#    path("", views.index, name="index")
#]
{% endhighlight%}

<p>
Next, I will create a models.py in an application folder.
</p>

{% highlight ruby linenos %}
# [ formtest/models.py ]
#
#from django import models
#
#
#class Members(models.Model):
#    f_name = models.CharField(max_length=30)
#    l_name = models.CharField(max_length=30)
#    b_date = models.DateTimeField(blank=False, null=False)
#    nation = models.CharField(max_length=30)
#    f_name = models.EmailField()
#
#    def __str__(self):
#        return f"Member-{id}"
{% endhighlight %}

{% highlight ruby %}
#  * Do not forget to makemigrations and migrate to apply your models.py file to database.
{% endhighlight %}

<p>
Once you finished migration, just write down the 'views.py' file's frame like below.
</p>

{% highlight ruby linenos %}
# [ formtest / views.py ]
#
#from django.shortcuts import render
#from django.views.decorators.http import require_http_methods
#from formtest.models import Members
#
#
#@require_http_method(["GET", "POST"])
#def index(request):
#    return render(request=request, template_names='index.html', context=None)
{% endhighlight %}

<p>
Last, I will create 'index.html' and locate it in templates forder.
</p>

![img.png](../../../assets/imgs/django/basic%20usage/create-template-and-validate-input-with-django-forms/img2.png)

<p>
The result of all works will be displayed like below.
</p>

![img.png](../../../assets/imgs/django/basic%20usage/create-template-and-validate-input-with-django-forms/img3.png)

<p>
Now, I can get a POST data at my views.py file with variable 'request'. Then, I can put them on my database file.
</p>

{% highlight ruby linenos %}
# ...
#from datetime import datetime
# ...
#def index(request):
#    if request.method == "POST":
#
#        data: dict = request.POST
#        f_name: str = data.get('f_name')
#        l_name: str = data.get('l_name')
#        b_date: str = datetime.strptime(data.get('b_date'), "%Y-%m-%d")
#        nation: str = data.get('nation')
#        email: str = data.get('email')
#  
#        new_info: Members = Members(f_name=f_name,
#                                    l_name=l_name,
#                                    b_date=b_date,
#                                    nation=nation,
#                                    email=email)
#        new_info.save()
#    return render(request=request, template_name='index.html', context=context)
{% endhighlight %}

<p>
It would work well... however, I did not finish to make it in a minute. The main cause of the inefficiency is a repeated code in HTML, views.py and models.py.
The 'views.py' will handle the data from 'index.html' file and 'models.py' file also do that from the 'views.py' file.
If there is an integrator module that can create index.html's input and insert data to the database, the workload would be somehow relieved. 
</p>

<p>
Also, there is another problem that would be caused by clients at the part for typing nation. 
There are not choices for nation input, so user can type any text in it even though it is not a nation name.
In this reason, views.py should validate user's input so that it would give more work on django's 'views.py'. 
According to the MVT model, views are better to handle the mapping between front-end and urls. 
</p>

<p>
Fortunately, Django offers these functions with file called 'forms.py' by getting involved between views.py and models.py.
</p>



<br><br>
## <span id="ctn2">II. Architecture of Django Form</span>
<p>
Then, we have to know how the forms works in a Django framework. 
In a brief, forms file are consist of some fields and they create HTML tags related to data input. 
This HTML Tags are able to be delivered to the templates file via context. 
It makes you more convenient because you do not have to make an additional tags manually in html file.
If you import a model class into a 'views.py' file, you can also handle database CRUD. 
</p>

<p>
However the most awesome thing is that 'forms.py' file has function for validate user's input.
With 'forms.py' file, it is easier to handle the views because you can hide the validating code at 'forms.py' file.
</p>

![img.png](../../../assets/imgs/django/basic%20usage/create-template-and-validate-input-with-django-forms/img4.png)

<p>
According to this architecture, there should be a few fields in forms.py so created input tags would be transmitted to the 'views.py'.
</p>


<br><br>
## <span id="ctn3">III. Create a Simple Example</span>

<fieldset>
<a href="#prtc1"> 1. Create Input Tags on HTML Files.</a><br>
<a href="#prtc2"> 2. Validate and Save Input Data</a><br>
</fieldset>


<br><br>
### <span id="prtc1"> 1. Create Input Tags on HTML Files. </span>
<p>
Let me create a 'forms.py' file first. It should include fields for user's input. Forms.py file has one or more form class and 
each class can have a different fields.
</p>

{% highlight ruby linenos %}
# [ formtest / forms.py ]
#
#from django import forms
#from formtest.models import Members
#from datetime import datetime
#
#
#NATION_LIST: tuple = (
#    ('HR', 'Hrvatska'),
#    ('USA', 'USA'),
#    ('ETH', 'ሪፐብሊክ'),
#    ('JPN', '日本国'),
#    ('ARG', 'Argentina')
#)
#
#
#class MemberSaveForm(forms.Form):
#    f_name = forms.CharField(max_length=30, label="First Name")
#    l_name = forms.CharField(max_length=30, label="Last Name")
#    b_date = forms.DateField(widget=forms.SelectDateWidget(years=range(1920, datetime.now().year + 1)),
#                             label="Birthdate") 
#    nation = forms.ChoiceField(
#        widget=forms.Select,
#        choices=NATION_LIST,
#        required=True,
#        label="Nation"
#    )
#    email = forms.email(blank=False, null=False, label="email")
#
{% endhighlight %}

<p>
In this status, you can call the class 'MemberSaveForm' at the 'views.py'. When you print that object, you can see some HTML tags that produced by 'forms.py'.
</p>

![img.png](../../../assets/imgs/django/basic%20usage/create-template-and-validate-input-with-django-forms/img5.png)

<p>
And once you send this object with context, you can see the input tags on your templates.
</p>

{% highlight ruby linenos %}
# [ formtest / views.py ]
#
#from formtest import MemberSaveForm
#...
#def index(request)
#    context = {"form": MemberSaveForm()}
#    return render(request=request, 
#                  template_name='index.html',
#                  context=context
#    )
#
{% endhighlight %}

<p>
The 'index.html' file only contains approximately 10 lines of HTML Tags. 
Comparing to the previous 'index.html' file, the number of lines is significantly decreased.
</p>

![img.png](../../../assets/imgs/django/basic%20usage/create-template-and-validate-input-with-django-forms/img6.png)

<p>
If there is no exceptions in files, you can see the input form at the browser.
</p>

![img.png](../../../assets/imgs/django/basic%20usage/create-template-and-validate-input-with-django-forms/img7.png)



<br><br>
### <span id="prtc2"> 2. Validate and Save Input Data. </span>
<p>
Now, let me get user's personnel input typed by user. To get these information, use 'request' variable at the 'views.py' file.
</p>

{% highlight ruby linenos %}
# [ formtest / views.py ]
# ...
#@require_http_methods(["GET", "POST"])
#def index(request):
#    context = {"form": MemberSaveForm()}
#
#    if request.method == "POST":
#        input_info: dict = request.POST
#        form = MemberSaveForm(data=input_info)
#        print(form)
#    
#    return render(request=request,
#                  template_name="index.html",
#                  context=context)
{% endhighlight %}

{% highlight ruby %}
#  * print(form) will print out the user's input on the terminal.
{% endhighlight %}

![img.png](../../../assets/imgs/django/basic%20usage/create-template-and-validate-input-with-django-forms/img8.png)
![img.png](../../../assets/imgs/django/basic%20usage/create-template-and-validate-input-with-django-forms/img9.png)

<p>
This input data can also be transmitted to the form class. This class inherits django's Form class and that has some methods for validating.
If you are using methods 'is_validate()' and 'clean()' after calling form class with 'data' arguments. 
</p>

![img.png](../../../assets/imgs/django/basic%20usage/create-template-and-validate-input-with-django-forms/img10.png)

![img.png](../../../assets/imgs/django/basic%20usage/create-template-and-validate-input-with-django-forms/img11.png)

<p>
The method 'form.is_valid()' will check the valid status of input value by clean() function. 
If the 'clean()' method has a logic to validate input data and there are no error, 'clean()' method always returns true to 'is_valid()'. 
I create some logic that filter the strange email address having 'test.com' at the end of the input.
</p>

{% highlight ruby linenos %}
# [ formtest / forms.py ]
# 
# ...
# def clean(self):
#     data: dict = self.data
#     email: str = data.get("email")
#     if email.endswith("test.com"):
#         raise Exception(f"Email address \'{email}\' is not valid.")
# ...
#
{% endhighlight %}


![img.png](../../../assets/imgs/django/basic%20usage/create-template-and-validate-input-with-django-forms/img12.png)
![img.png](../../../assets/imgs/django/basic%20usage/create-template-and-validate-input-with-django-forms/img13.png)


<p>
The basic python 'Exception' will make a critical symptom that user will misunderstand there are some errors in site. 
So, If you need to raise an error related validating user's input, you should use django's built-in exception.
</p>

{% highlight ruby linenos %}
# [ formtest / forms.py]
# ...
# from django.core.exceptions import ValidationError
# ...
#     if email.endswith("test.com"):
#         raise ValidationError(f'[warning] Email Address \'{email}\' is not valid.')
# ... 
{% endhighlight %}

![img.png](../../../assets/imgs/django/basic%20usage/create-template-and-validate-input-with-django-forms/img14.png)

<p>
With Exception 'ValidationError', you do not know whether your input data is saved to database successfully on not.
So, I also have to send the exception string to the 'index.html' file.
</p>

![img.png](../../../assets/imgs/django/basic%20usage/create-template-and-validate-input-with-django-forms/img15.png)


<p>
Form class has class variable named 'errors'. If clean() raises ValidationException, raised exceptions will be added to the errors.
</p>

<p>
You can separate validation process with field name with method 'clean_{field_name}()'.
Let me assume that I have to valid nation will not be 'USA'. Then,
</p>

{% highlight ruby linenos %}
# [ formtest / forms.py]
# ...
#def clean_nation(self):
#    nation = self.data.get("nation")
#    if nation == "usa":
#        raise ValidationError("[Warning] Nation should not be 'USA'")
#
#    return nation
{% endhighlight %}

![img.png](../../../assets/imgs/django/basic%20usage/create-template-and-validate-input-with-django-forms/img16.png)
![img.png](../../../assets/imgs/django/basic%20usage/create-template-and-validate-input-with-django-forms/img17.png)

<p>
Please be advised that if you want to use 'clean_{field_name}' method, you must return the field value at the end of the code.
If you forget it, form class will understand that user input is not passed validation process. 
'is_valid()' refers to the dictionary variable named 'cleaned_data' and if one of fields are extracted from it, is_valid() will be False.
</p>

![img.png](../../../assets/imgs/django/basic%20usage/create-template-and-validate-input-with-django-forms/img18.png)


<p>
Saving validated data is easy. Just use your model class defined and write down the saving logic on your 'models.py' file.
</p>

![img.png](../../../assets/imgs/django/basic%20usage/create-template-and-validate-input-with-django-forms/img19.png)


<br><br>
## <span id="ctn4">IV. References</span>
<p>
  <ul>
    <li><a href="https://docs.djangoproject.com/en/5.0/ref/forms/api/" target="_blank">https://docs.djangoproject.com/en/5.0/ref/forms/api/</a></li> 
    <li><a href="https://docs.djangoproject.com/en/5.0/ref/forms/fields/" target="_blank">https://docs.djangoproject.com/en/5.0/ref/forms/fields/</a></li>
    <li><a href="https://docs.djangoproject.com/en/5.0/ref/forms/widgets/" target="_blank">https://docs.djangoproject.com/en/5.0/ref/forms/widgets/</a></li>
  </ul>
</p>
