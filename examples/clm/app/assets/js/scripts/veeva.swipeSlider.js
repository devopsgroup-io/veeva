
/*
if (typeof jQuery === 'undefined') {
  throw new Error('Swipe Sliders\'s JavaScript requires jQuery');
}
*/

;(function($) {
    //'use strict';

    var utils = (function () {

        var me = {};

        me.log = function () {
            if (this.debug) {
                window.top.console.log('', arguments);
            }
            return this;
        };

        return me;

    })();


    $.fn.veevaSwipeSlider = function(options){

        /**
         * Some defults
         * @type {Object}
         */
        var defaults = {
            debug:              false,
            slideEvent:         'change.slider.MD',
            eventClick:         'click',
            triggerSlideClass: 'trigger-swipe',
            prevId:             'prevBtn',
            prevText:           'Previous',
            nextId:             'nextBtn',
            nextText:           'Next',
            controlsShow:       false,
            controlsBefore:     '',
            controlsAfter:      '',
            controlsFade:       true,
            firstId:            'firstBtn',
            firstText:          'First',
            firstShow:          false,
            lastId:             'lastBtn',
            lastText:           'Last',
            lastShow:           false,
            speed:              800,
            auto:               false,
            pause:              2000,
            continuous:         false,
            blnSwiping:         true,
            slideNoSwipeZones:  false,
            startIndex:         0,
            slideIndex:         0,
            subNav:             false,
            stateID:            'page',
            stateManager:       false,
            sliderClass:        'ul.slideObj',
            slideClass:         'li.slideObj',
            indicator:          false,
            indicatorId:        'sliderDots',
            threshold: {
                x: 100,
                y: 100
            },
            onSectionChange: function(){},
            onSlideChange: function(){},
            onSlideAfterChange: function(){},
            goToSlide: function(slide){
                skipTo(slide);
            },
        },

        /**
         * Set plugin to this object and extend defualts and utils
         * @type {[type]}
         */
        plugin                  = this;
        plugin.options          = $.extend(defaults, options, utils);

        plugin.options.slides   = [];


        plugin.each(function(){

            var $element    = $(this),
                s           = $element.find(plugin.options.slideClass).length,
                w           = $element.find(plugin.options.slideClass).width(),
                h           = $element.find(plugin.options.slideClass).height(),
                ts          = s-1;

            plugin.options.slideIndex = 0;

            plugin.options.log('Init: swipeSlider: ', plugin.options, plugin.options.slideIndex);

            plugin.options.slides = $element.find(plugin.options.sliderClass).find(plugin.options.slideClass);

            function handleStateManager(){
                if (plugin.options.stateManager) {
                    var state = {'pageChange': true};
                    $.bbq.pushState(state);
                }
            }

            function handleSlideEvent(){
                plugin.options.onSlideChange($element, plugin.options.slideIndex);

            }

            function handleSubNav(){
                $(plugin.options.subNav).find('a').removeClass('active');
                $(plugin.options.subNav[plugin.options.slideIndex]).find('a').addClass('active');
            }

            function skipTo(index){

                var p       = (index*w*-1),
                    $slide  = $(plugin.options.sliderClass, $element);

                plugin.options.slideIndex = index;

                $(plugin.options.subNav[index]).find('a').addClass('active');

                $slide.find('.content').hide();
                $slide.css({ marginLeft: p });
                $slide.find('.content').fadeIn('slow');

                if(!plugin.options.continuous && plugin.options.controlsFade){

                    if(index===ts){
                        $('a','#'+plugin.options.nextId).hide();
                        $('a','#'+plugin.options.lastId).hide();
                    } else {
                        $('a','#'+plugin.options.nextId).show();
                        $('a','#'+plugin.options.lastId).show();
                    }

                    if(index===0){
                        $('a','#'+plugin.options.prevId).hide();
                        $('a','#'+plugin.options.firstId).hide();
                    } else {
                        $('a','#'+plugin.options.prevId).show();
                        $('a','#'+plugin.options.firstId).show();
                    }
                }
            }

            function animate(dir, clicked){
                var ot = plugin.options.slideIndex;

                switch(dir){
                    case 'next':
                        plugin.options.slideIndex = (ot>=ts) ? (plugin.options.continuous ? 0 : ts) : plugin.options.slideIndex+1;
                        break;
                    case 'prev':
                        plugin.options.slideIndex = (plugin.options.slideIndex<=0) ? (plugin.options.continuous ? ts : 0) : plugin.options.slideIndex-1;
                        break;
                    case 'first':
                        plugin.options.slideIndex = 0;
                        break;
                    case 'last':
                        plugin.options.slideIndex = ts;
                        break;
                    default:
                        break;
                }

                var diff = Math.abs(ot-plugin.options.slideIndex);
                var speed = diff*plugin.options.speed;
                var position = (plugin.options.slideIndex*w*-1);



                /**
                 * Handle Slide Event before movement
                 * Animate slide
                 * Fire onSlideAfterChange event
                 * @author Steven Britton
                 * @date   2015-08-04
                 */

                handleSlideEvent();


                $(plugin.options.sliderClass, $element).animate({ marginLeft: position}, speed, function(){

                    handleSubNav();

                    $(plugin.options.slides).removeClass('active');

                    $(plugin.options.slides[plugin.options.slideIndex]).addClass('active');

                    plugin.options.onSlideAfterChange($element, plugin.options.slideIndex);

                });


                handleStateManager();

                //Check for first or last slide, and if either are true, fire the call back function
                if( (ot === 0 && plugin.options.slideIndex === 0) ||  (ot === (ts) && plugin.options.slideIndex ===(ts) )){
                    plugin.options.onSectionChange(dir);
                }
            }


            $element.width(w).height(h).css('overflow','hidden');

            $(plugin.options.sliderClass, $element).css({'width':s*w});

            if(plugin.options.controlsShow){
                var html = plugin.options.controlsBefore;

                html += '<div class="ctrl-next-slide" id="'+ plugin.options.nextId +'"></div><div class="ctrl-pre-slide" id="'+ plugin.options.prevId +'"></div>';
                html += plugin.options.controlsAfter;

                $($element).append(html);
            }

            $($element).find('#'+plugin.options.nextId).on(plugin.options.eventClick, function(e){
                e.preventDefault();

                animate('next',true);
            });

            $($element).find('#' + plugin.options.prevId).on(plugin.options.eventClick, function(e){
                e.preventDefault();

                animate('prev',true);
            });

            // handle sub-nav links
            $(plugin.options.subNav).find('a').on(plugin.options.eventClick, function(e){

                e.preventDefault();

                var islideIndex = parseInt($(this).attr('slideindex'));


                skipTo(islideIndex);

                handleStateManager();

                handleSubNav();

                //trigger slide event
                handleSlideEvent();

                $(plugin.options.slides).removeClass('active');

                $(plugin.options.slides[plugin.options.slideIndex]).addClass('active');

                plugin.options.onSlideAfterChange($element, plugin.options.slideIndex);

            });

            if(plugin.options.startIndex > 0) {
                skipTo(plugin.options.startIndex-1);
            }
            else{
                $(plugin.options.subNav[plugin.options.startIndex]).find('a').addClass('active');
            }

            /**
             * Swiping turned on?
             * @author Steven Britton
             * @date   2015-04-17
             */
            if(plugin.options.blnSwiping){

                /* Private variables for each element */
                var originalCoord = { x: 0, y: 0};
                var finalCoord = { x: 0, y: 0};


                function touchMove(event) {

                    event.preventDefault();

                    /* Updated X,Y coordinates */
                    finalCoord.x = event.targetTouches[0].pageX;
                    finalCoord.y = event.targetTouches[0].pageY;
                }

                function touchEnd(event) {

                    plugin.options.log('Swipe Event: touchEnd', event);
                    plugin.options.log('Slide Index: ', plugin.options.slideIndex);

                    var changeY = originalCoord.y - finalCoord.y;

                    if(changeY < plugin.options.threshold.y && changeY > (plugin.options.threshold.y*-1)) {

                        var changeX = originalCoord.x - finalCoord.x;

                        var noSwipeZone = plugin.options.slideNoSwipeZones[plugin.options.slideIndex] || false,
                            noSwipeZoneYtop = parseInt(noSwipeZone.yTop) || 0,
                            noSwipeZoneYbottom = parseInt(noSwipeZone.yBottom) || 0;

                        if(changeX > plugin.options.threshold.x) {
                            if (originalCoord.y > noSwipeZoneYtop && originalCoord.y < noSwipeZoneYbottom){
                                plugin.options.log('in the noSwipeZone');
                            }
                            else {
                                plugin.options.log('not in the noSwipeZone');
                                animate('next', true);
                            }
                        }
                        if(changeX < (plugin.options.threshold.x*-1)) {
                            if (originalCoord.y > noSwipeZoneYtop && originalCoord.y < noSwipeZoneYbottom){
                                plugin.options.log('in the noSwipeZone');
                            }
                            else {
                                plugin.options.log('not in the noSwipeZone');
                                animate('prev', true);
                            }
                        }
                    }

                }

                // Swipe was started
                function touchStart(event) {
                    originalCoord.x = event.targetTouches[0].pageX;
                    originalCoord.y = event.targetTouches[0].pageY;


                    plugin.options.log('Swipe Event: touchStart', event);
                    plugin.options.log('originalCoord.x', originalCoord.x);
                    plugin.options.log('originalCoord.y', originalCoord.y);

                    finalCoord.x = originalCoord.x;
                    finalCoord.y = originalCoord.y;
                }

                // Swipe was canceled
                function touchCancel(event) {
                    plugin.options.log('Swipe Event: touchCancel', event);
                }

                // Add gestures to all swipable areas
                this.addEventListener('touchstart', touchStart, false);
                this.addEventListener('touchmove', touchMove, false);
                this.addEventListener('touchend', touchEnd, false);
                this.addEventListener('touchcancel', touchCancel, false);
            }

            return $element;

        });

        return plugin;

    };

})(jQuery);
