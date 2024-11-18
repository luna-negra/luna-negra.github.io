---
title: 0017. How to Use ModelForm with Mongoengine
date: "2024-11-18 17:22:00 +0900"
edited: 
tags:
  - django 
  - mongoengine
  - model form
  - document form
categories:
  - django
  - advanced protocols
---

<fieldset>
<legend>Content</legend>
    <a href="#ctn1">I. Preview</a><br>
    <a href="#ctn2">II. Pre-setting </a><br>
    <a href="#ctn3">III. Create Django Form</a><br>
    <a href="#ctn4">IV. References</a><br>
</fieldset>

<br><br>
## <span id="ctn1">I. Preview</span>
<p>
If you are using Mongo DB as a database for django first time, you may have some issue during constructing your web page.
Django does not support Mongo DB as a default, you have to install third party python module like 'mongoengine' and so on.
You can make any connection between Mongo DB and django however, you can not use some django's useful functions such as 
'modelForm' or 'AUTH_USER_MODEL' because 'mongoengine' is only designed for connecting to Mongo DB.
</p>

<p>
In this reason, you would be concerned about inefficiency of your code writing. You can only create a front-end form with 
Django's BaseForm which is not reflecting any Model Fields. If you change the model architecture, you also have to change 
contents in 'forms.py'
</p>

<p>
Fortunately, some clever engineer create a python package which helps create things that similar to model form in django.
Unfortunately, this module is not adequate for current version of Django, so you have to edit some code in this package.
But It is not a big problem comparing with creating your web page with base form.
</p>

<p>
In this article, I would like to show how to set up django to use ModelForm with mongoengine.
If you want to see how to connect Django to Mongo DB, please refer to <a href="https://luna-negra.github.io/django/advanced%20protocols/use-mongodb-container-with-django.html" target="_blank">this article</a> first.
</p>


<br><br>
## <span id="ctn2">II. Pre-setting</span>
<p>
First, move to your Django project folder and install python package 'django-mongoengine-form' for using Mongo DB.
</p>

{% highlight ruby linenos %}
: "Install 'django-mongoengine-form'"
pip install django-mongoengine-form

: "Check the package was installed successfully"
pip list
{% endhighlight %}

{% highlight ruby %}
*  Don't forget to install 'mongoengine'.
{% endhighlight %}

<p>
If you installed 'django-mongoengine-forms', you can not run Django server because some code in 'django-mongoengine-forms' has
been outdated.
</p>

![img.png](../../../assets/imgs/django/advanced%20protocols/how-to-use-model-form-with-mongoengine/img1.png)

<p>
So, you have to edit some outdated python code in 'mongodbforms' package which is popped up after installing 'django-mongoengine-forms' package.
</p>

![img.png](../../../assets/imgs/django/advanced%20protocols/how-to-use-model-form-with-mongoengine/img2.png)

{% highlight ruby linenos %}
: "mongodbforms > documents.py"

before >> 
from collections import Callable, OrderedDict
from django.forms.forms import (BaseForm, DeclarativeFieldsMetaclass,
                                NON_FIELD_ERRORS, pretty_name)
from django.utils.translation import ugettext_lazy as _, ugettext


after >>
from collections import OrderedDict
from collections.abc import Callable
from django.forms.utils import pretty_name
from django.utils.translation import gettext_lazy as _, gettext

{% endhighlight %}


{% highlight ruby linenos %}
: "mongodbforms > documentoptions.py"

before >> 
#from collections import MutableMapping
#from django.db.models.fields import FieldDoesNotExist

after >>
from collections.abc import MutableMapping
from django.core.exceptions import FieldDoesNotExist

{% endhighlight %}


{% highlight ruby linenos %}
: "mongodbforms > fieldgenerator.py"

before >> 
from django.utils.encoding import smart_text as smart_unicode
if isinstance(f.default, collections.Callable):                  (Line 136)

after >>
from django.utils.encoding import smart_str as smart_unicode
if isinstance(f.default, collections.abc.Callable):

{% endhighlight %}


{% highlight ruby linenos %}
: "mongodbforms > fields.py"

before >> 
from django.utils.encoding import (force_text as force_unicode,
                                   smart_text as smart_unicode)
from django.utils.translation import ugettext_lazy as _

after >>
from django.utils.encoding import (force_str as force_unicode,
                                   smart_str as smart_unicode)  
from django.utils.translation import gettext_lazy as _ 
{% endhighlight %}

<p>
After editing some lines in 'mongodbforms' package, you can run Django again without any error.
</p>

![img.png](../../../assets/imgs/django/advanced%20protocols/how-to-use-model-form-with-mongoengine/img3.png)

<p>
Now, you can write down code in "forms.py" and "models.py" files.
</p>

<br><br>
## <span id="ctn3">III. Create Django Form</span>
<p>
Let me create a simple user model in Django. 
This model contains 'email' as a primary key, 'password', 'first_name', 'last_name' and 'signup_date' only.

{% highlight ruby linenos %}
: "models.py"

import mongoengine as mg


class Users(mg.Document):
    email = mg.EmailField(required=True, primary_key=True)
    password = mg.StringField(required=True, min_length=8, max_length=64)
    first_name = mg.StringField(required=True, max_length=20)
    last_name = mg.StringField(required=True, max_length=20)
    signup_date = mg.DateTimeField(auto_now_add=True)

{% endhighlight %}

{% highlight ruby %}
*  Please inherit mongoengine.Document to create a Collection in MongoDB. 
{% endhighlight %}
</p>


<p>
Now, Let me create a forms.py with 'SignUpForm' which contains fields information in 'models.py'. But you can not use Django's
ModelForm class directly because ModelForm class in Django can not recognise any fields derived from 'mongoengine'.
So you have to inherits 'mongoedbform.DocumentForm' to your form class, instead of 'django.forms.ModelForm'.
</p>

{% highlight ruby linenos %}
: "forms.py"

import mongodbforms as mf
from django.core.exceptions import ValidationError
from users.models import Users


class SignUpForm(mf.DocumentForm):

    // Please be advised you can not use get_user_model() with mongnoengine.
    // if 'fields' is blank, you can get all fields in models.py
    class Meta:
        model = Users
        fields = []

{% endhighlight %}

{% highlight ruby %}
*  Please be advised you can not use get_user_model() with mongnoengine.
*  if 'fields' is blank, you can get all fields in models.py
{% endhighlight %}


<p>
I create a SignUpForm with DocumentForm and Django will print out all model fields on your web browser. 
</p>

![img.png](../../../assets/imgs/django/advanced%20protocols/how-to-use-model-form-with-mongoengine/img4.png)

<p>
You can you 'Meta' classes variables such as 'exclude', 'widgets' and so on, except labels. 
'mongodbform' can not react with labels, so you have to create accurate fields name in 'models.py' if you want to show them
in html page without change. The example screenshot above, I use 'form.label_tag' DTL in html page, so there is no under bar in field name.
</p>

<p>
Also, If you want to add or edit options of fields, you can use fields which is belong to 'django.forms' without any issue.
</p>

![img.png](../../../assets/imgs/django/advanced%20protocols/how-to-use-model-form-with-mongoengine/img5.png)


<p>
If you want to validate input, use 'clean_' method in your form class. The usage is same as Django's Basic Form. 
</p>



<br><br>
## <span id="ctn4">IV. Preview</span>
<p>
  <ul>
    <li><a href="https://stackoverflow.com/questions/12004358/django-mongodb-how-can-i-use-modelforms" target="_blank">https://stackoverflow.com/questions/12004358/django-mongodb-how-can-i-use-modelforms</a></li>
  </ul>
</p>
