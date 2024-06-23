---
title: 004. Make Categories
date: "2024-06-15 00:31:57"
tags:
  - jekyll ubuntu
  - sample post
categories:
  - category1
  - sub category2
---

At the '_data' folder, you can see the YAML file named 'categories.yml'. 
You can organize the categories of jekyll-theme-ubuntu in this file.

![img.png](/assets/imgs/categories.png)

Each category has 'category' and 'sub_category' keys. 
If you want to create a page category, just type the category name and leave the sub_category empty. 
In contrast, if you want to divide more categories, set the sub_category key.

![img.png](/assets/imgs/categories2.png)

Once you create category information in the 'categories.yml' file, 
create 'list' layout markdown files for each sub_category, as shown below.

![img.png](/assets/imgs/categories3.png)

You don't have to organize all the 'list' files, but make sure that the permalink values are correct. 
If the permalink is not correct, you will not see your posts that belong to a specific category on the category's link.

![img.png](/assets/imgs/categories4.png)