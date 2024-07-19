module Jekyll
    class ImgFolderGenerator < Generator
        def generate(site)
            site.posts.docs.each do |post|
                url = post.url
                img_folder = "/assets/imgs/#{url}"
                post.data['img_folder'] = img_folder.split(".html")[0]
            end
        end
    end
end