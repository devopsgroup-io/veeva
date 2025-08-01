;(function($){


    $.fn.veevaLink = function(options) {

        var defaults = {
            eventClick: 'click',
            primaryPresentation: '',
            videoPresentation: '',
            pdfPresentation:'',
        };

        var breakUp = function (str) {
            var querystring = str.replace( '#', '' ).split( '&' ),
                queryObj = {};

                for (var i = 0, len = querystring.length; i < len; i++) {
                    var name  = querystring[i].split('=')[0],
                        value = querystring[i].split('=')[1];
                    queryObj[name] = value;
                }
                return queryObj;
            };

        var settings = $.extend(defaults, options);

        if (!this){
            return false;
        }

        return this.each(function() {

            $('a[href*="veevaLink"]', $(this)).on(settings.eventClick, function(event){

                event.preventDefault();

                var $this               = $(this),
                    linkObj             = breakUp($this.attr('href')),
                    pLink               = linkObj.veevaLink,
                    pType               = linkObj.type,
                    veevaPresentation   = pType === 'pdf' ? settings.pdfPresentation : settings.videoPresentation;

                    document.location = 'veeva:gotoSlide('+pLink+'.zip,'+veevaPresentation+')';
                return false;
            });
        });
    };


    $.fn.popupLinks = function(options) {

        // Default thresholds & swipe functions
        var defaults = {
            eventClick: 'click'
        };

        var settings = $.extend(defaults, options);

        if (!this){
            return false;
        }

        return this.each(function() {

            $('a[href*="#popup"]', $(this)).on(settings.eventClick, function(e){



                e.preventDefault();

                var $this       = $(this),
                    popEvent    = $.Event('show.popup.MD'),
                    popupType   = $this.attr('popup-type') === 'popupFull' ? 'popupFull' : 'popup',
                    pLink       = $this.attr('href');

                    pLink       = pLink.slice(pLink.lastIndexOf('=')+1, pLink.length);

                    popEvent.url                = pLink;
                    popEvent.popupType          = popupType;

                    //Get Tracking info
                    popEvent.trackID            = $this.attr('track-id');
                    popEvent.trackType          = $this.attr('track-type');
                    popEvent.trackDescription   = $this.attr('track-description');



                    $this.trigger(popEvent);


            });
        });
    };




})(jQuery);
