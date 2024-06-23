# jekyll-theme-ubuntu
Customized Jekyll theme ubuntu for Github blog, created by 'luna-negra'
<hr>

[sample]
![img.png](assets/imgs/sample_screen.png)

### How to Use
1. Download Git Repository 'jekyll-theme-ubuntu'

```commandline
git clone https://github.com/luna-negra/jekyll-theme-ubuntu
```

2. Create Categories for Your Blog
-  First, create categories of your blog with file 'categories.yml' on folder '_data', 
-  Once you finish categorizing, make markdown files with front-matter 'layout' as list and 'permalink' with /{category}/{sub_category}.
-  Please refer to the markdown file '/_posts/category2/2024-06-15-make-categories.md' for more details.

3. Create Your Own Posts
-  Write down your own post with markdown file and locate it on folder '_posts'
-  If you want to more detail about creating post, please refer to markdown files '/_posts/category1/2024-06-12-sample-post1.md' and '/_posts/category1/2024-06-12-front-matter-of-post.md'

4. Add and Commit Your Work

```commandline
git add {files_to_add}
git commit
```

5. Upload 'jekyll-theme-ubuntu' to Your Blog Repository

- The repository name should be "<strong style="color: yellow;">{your_github_username}.github.io</strong>"
```commandline
git push {remote_name} {branch_name}
```
