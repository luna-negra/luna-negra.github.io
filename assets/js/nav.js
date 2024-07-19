document.addEventListener("DOMContentLoaded", function ()
    {
        var navCategories = document.querySelectorAll(".nav_category");

        Array.from(document.getElementsByClassName('language-ruby')).forEach(
            function (code) {
                var spans = code.getElementsByTagName('span');

                Array.from(spans).forEach(
                    function (span) {
                        var text = span.innerHTML;
                        var i = 0;
                        span.innerHTML = "";

                        function typeEffect () {
                            if (i < text.length) {

                                if (text[i] === "&")
                                {
                                    if (text[i+1] === "l" && text[i+2] === 't' && text[i+3] ===';')
                                    {
                                        span.innerHTML += "<";
                                        i += 4;
                                    }
                                    else if (text[i+1] === "g" && text[i+2] === 't' && text[i+3] ===';')
                                    {
                                        span.innerHTML += ">";
                                        i += 4;
                                    }
                                }
                                else
                                {
                                    if (text[i] === "#")
                                    {
                                        span.innerHTML += "";
                                    }
                                    else
                                    {
                                        span.innerHTML += text[i];
                                    }
                                    i++;
                                }
                                setTimeout(typeEffect, 50);
                            }
                        }
                        typeEffect();
                    });
            });

        // Nav Animation
        navCategories.forEach( function(navCategory)
        {
            var navCategoryList = navCategory.getElementsByClassName('nav_category_unit_list');
            if (navCategoryList.length != 0)
            {

                var navCategoryListHeight = navCategoryList[0].childElementCount * 40;

                navCategory.addEventListener("mouseenter", function ()
                {
                    navCategoryList[0].style.height = navCategoryListHeight + "px";
                });

                navCategory.addEventListener("mouseleave", function ()
                {
                    navCategoryList[0].style.height = "0px";
                });
            }
        });
    });