---
title: 0009. Create Template and Validate Input with Django Forms
date: "2024-08-19 00:22:00 +0900"
edited: 
tags:
  - django 
  - model forms
  - simple website example
categories:
  - django
  - basic usage
---


<fieldset>
<legend>Content</legend>
<a href="#ctn1">I. Preview</a><br>
<a href="#ctn2">II. Architecture of Django Model Form</a><br>
<a href="#ctn3">III. Create a Simple Example</a><br>
<a href="#ctn4">IV. References</a><br>
</fieldset>


<br><br>
## <span id="ctn1">I. Preview </span>
<p>
<u><a href="https://luna-negra.github.io/django/basic%20usage/create-template-and-validate-input-with-django-forms.html" target="_blank">In my previous post</a></u>, you may recognise one inconvenient thing during creating a method for saving data.
Because, all inputs are validated, but you have to split them manually and set the value to arguments in a DB Class.
</p>

![img.png](../../../assets/imgs/django/basic%20usage/create-template-and-validate-input-with-django-modelform/img1.png)

<p>
It makes web developers very annoyed. Fortunately, django provides so called 'ModelForm' so let web developers be free from writing code for DB saving.
This ModelForm is also built-in class of django, so if your own form class inherit this ModelForm, your form class connects to designated model form automatically.
</p>

<br><br>
## <span id="ctn2">II. Architecture of Django Model Form </span>
<p>
The 'ModelForm' is located in package 'django.forms'. As you can see the source code of class 'ModelForm', this class has an arguments named metaclass.
</p>

![img.png](../../../assets/imgs/django/basic%20usage/create-template-and-validate-input-with-django-modelform/img2.png)

<p>
This metaclass is for setting options for your forms class which inherits ModelForm. 
In order to use this form class, First important thing is linking model class and your form class.
In source code of ModelForm, you can also see the variable named 'opts.model' and this variable is charge of linking model class.
</p>

![img.png](../../../assets/imgs/django/basic%20usage/create-template-and-validate-input-with-django-modelform/img3.png)

<p>
So, to set the model class to connect to your form class, first you have to create inner class in your form class, and name it as 'Meta'.
Then, design a model class name to a variable 'model' in Meta class.
</p>

![img.png](../../../assets/imgs/django/basic%20usage/create-template-and-validate-input-with-django-modelform/img4.png)

<p>
Model class has a various fields and the Meta class in your form class gets these info automatically. 
The Meta class also have a function to filter the fields, so you can choose which fields will be shown in web browser or not.
</p>

![img.png](../../../assets/imgs/django/basic%20usage/create-template-and-validate-input-with-django-modelform/img5.png)

<p>
The related class variables are 'fields' and 'exclude'. 'fields' will be a list of fields name or string "__all__".
If the value of 'fields' is '__all__', all fields in model class will be displayed on the screen. 
In contrast, you can hide fields by adding fields name to list and assign the list to variable 'exclude'.
</p>

<p>
That's all for a basic setting to use ModelForm. 
If you are familiar with django's basic form, you can also easily know how django ModelForm works.
With referring this architecture, let me create a simple website.
</p>

<br><br>
## <span id="ctn3">III. Create a Simple Example</span>
<p>
I will reuse my database model which was used at my previous post. 
This model stores personnel information input by user, and this model has 5 fields - f_name(First Name), l_name(Last Name), b_date(Birthdate), nation and email.
</p>

![img.png](../../../assets/imgs/django/basic%20usage/create-template-and-validate-input-with-django-modelform/img6.png)

<p>
I will create an index page only and make this page save the data when user input his or her information and click send button. 
Considering it, I can write down the code of 'forms.py' file like below.
</p>

{% highlight ruby linenos %}
# [ forms.py ]
#
#from django import forms
#from formtest.models import Member
#
#
#class MemberSaveForm(forms.ModelForm):
#    class Meta:
#        model = Member
#        fields = "__all__"
#        exclude = []
#
{% endhighlight %}

![img.png](../../../assets/imgs/django/basic%20usage/create-template-and-validate-input-with-django-modelform/img7.png)

<p>
In this status, you can see the all fields from 'Member' class as HTML tag on your browser when you start your django server.
Surely, you have to write down proper DTL on your rendering HTML file.
</p>

![img.png](../../../assets/imgs/django/basic%20usage/create-template-and-validate-input-with-django-modelform/img8.png)

<p>
Now, the web site is able to send information to your form class. However, the form class does not have any code to save received information yet.
Inherited class 'ModelForm' has a method named 'save()' and this is a main part for saving input data to your database file. 
Therefore, you just use this method after finishing validating process at the 'views.py' file.
</p>

![img.png](../../../assets/imgs/django/basic%20usage/create-template-and-validate-input-with-django-modelform/img9.png)

<p>
Now, Let me send random data via my 'index.html' and see what will be added on my database.
</p>

![img.png](../../../assets/imgs/django/basic%20usage/create-template-and-validate-input-with-django-modelform/img10.png)

<p>
If you want to change the input tags on your HTML, just exclude some fields which you want to edit and add new fields objects into your forms file.
Let me change 'b_date', 'nation' and 'email' to make users to fill out their information more easily.
</p>

![img.png](../../../assets/imgs/django/basic%20usage/create-template-and-validate-input-with-django-modelform/img11.png)

<p>
'save()' method in ModelForms will save the data extracting from 'cleaned_data'. 
So, If you edit fields at the forms.py, do not forget to validate input data with 'clean_{Model's_Fieldname}()' method.
In the example above, my form class receives the birthdate with 'b_date_year', 'b_date_month' and 'b_date_day' and there are no 'b_date' fields in 'self.data'.
It means that if you only use 'clean()' method, you can not save user's input even thought the input values are successfully validated.
</p>



<br><br>
## <span id="ctn4">IV. References </span>
<p>
  <ul>
    <li><a href="https://docs.djangoproject.com/en/4.2/topics/forms/modelforms/" target="_blank">https://docs.djangoproject.com/en/4.2/topics/forms/modelforms/</a></li>
  </ul>
</p>