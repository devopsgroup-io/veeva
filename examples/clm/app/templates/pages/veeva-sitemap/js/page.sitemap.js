///(function ($) {

var pageSitemap = function() {

    var defaultSettings = {
            isDeployed: false
        },
        pageSettings;


    var sectionScroll = document.getElementById("section-scroller"),
        $sitemap = $('.sitemap-container div');



    var equalheight = function(container) {

        var currentTallest = 0,
            currentRowStart = 0,
            currentDiv = 0,
            rowDivs = [],
            $el,
            topPosition = 0;

        $(container).each(function() {

            $el = $(this);
            $($el).height('auto');
            topPosition = $el.position().top;

            if (currentRowStart !== topPosition) {
                for (currentDiv = 0; currentDiv < rowDivs.length; currentDiv++) {
                    rowDivs[currentDiv].height(currentTallest);
                }
                rowDivs.length = 0; // empty the array
                currentRowStart = topPosition;
                currentTallest = $el.height();
                rowDivs.push($el);
            } else {
                rowDivs.push($el);
                currentTallest = (currentTallest < $el.height()) ? ($el.height()) : (currentTallest);
            }
            for (currentDiv = 0; currentDiv < rowDivs.length; currentDiv++) {
                rowDivs[currentDiv].height(currentTallest);
            }
        });
    };

    var loadSitemap = function() {

        $.getJSON('sitemap.json').done(function(json) {

            $.each(json, function(i, o) {

                var section = o.section,
                    source = o.source != undefined ? o.source : '',
                    slide = o.slide != undefined ? o.slide : '0',
                    title = o.title,
                    thumb = section + '-thumb.jpg',
                    buttons = o.buttons,
                    strItem = '',
                    strImagePath = pageSettings.isDeployed ? 'thumbs/' : '../' + section + '/';

                source = pageSettings.isDeployed ? source.replace('.html', '.zip') : '../' + source.slice(0, -5) + '/' + source + '#page=' + slide;


                strItem = $('<article><a href="#" data-section="' + source + '"  data-slide="' + slide + '" class="btnGoto"><img src="' + strImagePath + thumb + '"><div class="head">' + title + '</div></article>');

                //Make sure we have some buttons
                if (buttons) {

                    var strButtons = $('<ul class="buttons">');

                    $.each(buttons, function(j, button) {
                        $('<li>' + button.title + '</li>').appendTo(strButtons);
                    });

                    $(strButtons).appendTo(strItem);
                }

                $(strItem).appendTo($sitemap);

            });

            setTimeout(function() {

                if (sectionScroll) {
                    sectionScroll = new IScroll('#section-scroller', {
                        scrollX: true,
                        freeScroll: true,
                        mouseWheel: true,
                        scrollbars: true,
                        tap: true
                    });
                }


                equalheight('.sitemap-container article');

                $('.sitemap-container').on('tap', '.btnGoto', function(e) {

                    e.preventDefault();

                    var _this = $(this),
                        _section = _this.attr('data-section') != undefined ? _this.attr('data-section') : '',
                        _slide = _this.attr('data-slide') != undefined ? _this.attr('data-slide') : '0';

                    if (pageSettings.isDeployed) {

                        //Update subscene field and then go to slide
                        veevaUpdateUserObject(_slide, function() {

                            veevaGoToSlide(_section.replace('.html', '.zip'), pageSettings.presentationPrimary);
                        });
                    } else {
                        document.location = _section;
                    }



                });

            }, 200);

            $('#section-scroller article').addClass('pull-left').fadeIn('slow');




        }).fail(function(jqxhr, textStatus, error) {
            //var err = textStatus + ', ' + error;
        });

    };


    return {
        //main function to initiate the module
        init: function(options) {

            //set options
            pageSettings = $.extend(defaultSettings, options);

            loadSitemap();

        }
    };
}();


//}(jQuery));
