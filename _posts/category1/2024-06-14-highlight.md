---
title: 003. Ruby Hightlight
tags:
  - jekyll ubuntu
  - sample post
categories:
  - category1
  - sub category1
---


You can insert programming code or Linux commands with Ruby’s highlight.

[highlight ruby]

This changes your text color to yellow, 
so you can use it for writing warning commands or highlighting something. 
However, it does not support line numbers.

{% highlight ruby %}
    
#    [WARNING] I just want to warn you.
    
{% endhighlight %}

[highlight ruby with linenos]

If you need line numbers because your code is very long, use Ruby’s highlight filter with linenos.

{% highlight ruby linenos %}
# /* This is a Python Code to Print 'Hello {name}'

# def hello(name: str):
#     print("Hello, {name}")
#     return None

# /* or you can just use print() function */

# name = "alex" 
# print("Hello {name}")
    
{% endhighlight %}

All highlights have a typing effect for each line when the documents are loaded. 
If you have very long text in one line and cannot wait for it to be shown, 
just remove the ‘#’ in front of each line.
