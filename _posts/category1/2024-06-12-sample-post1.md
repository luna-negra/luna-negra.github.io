---
title: 001. Sample Post 1
date: "2024-06-12 12:00:35"
edited: "2024-06-13 08:37:33"
tags:
  - jekyll ubuntu
  - sample post
categories:
  - category1
  - sub category1
---

This is a first sample post for ‘category1/subcategory1’. 
You can create a new paragraph by leaving an empty line between paragraphs.

Here is the second paragraph. 
You can write your own content in a markdown file in the ‘_posts’ folder. 
You don’t have to categorize your markdown file by folder.

All posts will have their own website URL automatically generated:

{% highlight ruby %}
#  URL: /{post_category}/{post_subcategory]/{markdown_title_in_filename}
{% endhighlight %}

So, this post will have a URL like ‘/category1/sub%20category1/sample-post1.html’.
The title of the post does not need to be the same as the title in the filename.

All markdown files in the ‘_posts’ folder have a layout as ‘post’.