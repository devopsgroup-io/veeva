/*global $, window, document, jQuery, utilKeyMessages, IScroll, com */

/**
 * VEEVA.iRep JS Library
 *
 * @version 1.0.0
 *
 *
 * @author Steven Britton    <stvnbritton@gmail.com>

 * @uses utilKeyMessages
 * @uses jQuery 1.7.2
 * @uses IScroll v5.1.2
 * @uses com Veeva Library for CLM v2.0
 */


var VEEVA = VEEVA || {};

;
(function(window, document, $, undefined) {



    VEEVA.iRep = function iRep(settings) {

        var name = 'VEEVA Module JS Library';

        this.veevaTrackSubsceneField = settings.veevaTrackSubsceneField;
        this.product = settings.product;
        this.presentationPrimary = settings.presentationPrimary;
        this.presentationPDFs = settings.presentationPDFs;
        this.presentationVideos = settings.presentationVideos;

        this.currentSectionName = settings.section;
        this.currentSection = '';

        this.currentKeyMessage = '';

        this.rootURL = '';
        this.isDeployed = settings.isDeployed === true ? true : false;
        this.debug = settings.isDeployed ? false : true;
        this.appConfigFile = 'global/app.json';

        this.eventClick = settings.isDeployed ? 'touchend' : 'click';

        this.appBody = $('#app-body');
        this.containerMainISI = '#main-isi';
        this.btnISI = $('.isi-bar');
        this.fileISI = 'global/isi.html';

        this.startTimeout = '';
        this.mainISI = '';
        this.popup = '';

        this.sectionNumber = 0;
        this.slideNumber = 0;
        this.state = {};
        this.bottomAdded = false;

        this._init();
    };

    VEEVA.iRep.prototype = {

        constructor: VEEVA.iRep,

        /* Debug logging (if enabled). */
        log: function() {

            if (this.debug) {
                window.top.console.log('', arguments);
            }
            return this;
        },

        _init: function() {

            var $this = this;

            $this.log('Product: ', $this.product.name);
            $this.log('Loading: ', $this.appConfigFile);

            $.ajax({
                type: 'GET',
                url: $this.appConfigFile,
                dataType: 'json',
                success: function(data) {
                    utilKeyMessages.loadKeymessages(data);

                    $this.log('Loading app.json', utilKeyMessages);

                    $this.start();
                },
                error: function() {
                    $this.log('Error: issue loading file ', $this.appConfigFile);
                }

            });

        },


        start: function() {

            var $this = this;

            $this.log('Init: App');
            $this.log('This Object: ', $this);

            var hash = location.hash.substr(1);

            if (hash === 'screenshot') {
                $this.isDeployed = false;
            }


            $this.currentSectionName = $this.product.name + $this.product.suffix + $this.currentSectionName;

            $this.btnISI.one($this.eventClick, function(e) {

                $this.log('Event: ISI button ', $this.eventClick);

                e.preventDefault();
                e.stopPropagation();


                if ($($this.containerMainISI).length === 0) {

                    /* Append new section to the DOM */
                    $this.appBody.append('<section id="main-isi" class="main-isi" />');

                    $this.mainISI = new MainISI($this);
                }
            });


            /**
             * Tap event listener for product logo.
             * @author Steven Britton
             * @date   2015-03-26
             * @todo Remove hard-coded product name with property passed down from global settings.
             */
            $this.appBody.find('.logo-product').on($this.eventClick, function() {

                $this.log('Event: Product logo ', $this.eventClick);
                if ($this.isDeployed) {
                    $this.goToSlide($this.product.name + $this.product.suffix + 'home.zip', $this.presentationPrimary);
                } else {
                    document.location = '../' + $this.product.name + $this.product.suffix + 'home/' + $this.product.name + $this.product.suffix + 'home.html';
                }
            });


            $this.appBody.on($this.eventClick, '.btn-goto', function(event) {

                event.preventDefault();

                $this.log($this, 'Event: btn-goto', event);

                var _this = $(this),
                    _section = _this.attr('data-section') !== undefined ? _this.attr('data-section') : '',
                    _slide = _this.attr('data-slide') !== undefined ? _this.attr('data-slide') : '0';


                //Only run if deployed, and if it is, then run Veeva scripts
                if ($this.isDeployed) {

                    //Update subscence field and then go to slide
                    $this.veevaUpdateUserObject(_slide, function() {
                        $this.goToSlide(_section + '.zip', $this.presentationPrimary);
                    });
                }

            });

            /**
             * Event Listner for linking to other Presentations
             * @author Steven Britton
             * @date   2015-04-20
             */
            $this.appBody.on($this.eventClick, '.btn-external', function(event) {

                event.preventDefault();

                $this.log($this, 'Event: btn-external', event);

                var _this = $(this),
                    _keyMessage = _this.attr('data-key-message') !== undefined ? _this.attr('data-key-message') : '',
                    _presentation = _this.attr('data-veeva-presentation') || $this.presentationPrimary;

                //Only run if deployed, and if it is, then run Veeva scripts
                if ($this.isDeployed && _keyMessage !== '' && _presentation !== '') {

                    //Update subscence field and then go to slide
                    $this.veevaUpdateUserObject(_keyMessage, function() {
                        $this.goToSlide(_keyMessage + '.zip', _presentation);
                    });
                } else {
                    document.location = '../' + _keyMessage + '/' + _keyMessage + '.html';
                }
            });

            $this.appBody.on($this.eventClick, '.btn-link', function(event) {

                event.preventDefault();

                $this.log($this, 'Event: btn-link', event);

                var _this = $(this),
                    _keyMessage = _this.attr('data-key-message') || '',
                    _slide = _this.attr('data-slide') !== undefined ? _this.attr('data-slide') : '0',
                    _product = _this.attr('data-product') || $this.product.name,
                    _presentation = _this.attr('data-veeva-presentation') || $this.presentationPrimary;

                //Only run if deployed, and if it is, then run Veeva scripts
                if ($this.isDeployed && _keyMessage !== '' && _presentation !== '') {

                    //Update subscence field and then go to slide
                    $this.veevaUpdateUserObject(_keyMessage, function() {
                        $this.goToSlide(_product + $this.product.suffix + _keyMessage + '.zip', _presentation);
                    });
                } else {
                    document.location = '../' + _product + $this.product.suffix + _keyMessage + '/' + _product + $this.product.suffix + _keyMessage + '.html';
                }
            });


            $(window).on('hashchange', function(e) {
                $this.pageChanged(e);
            });

            /*
            window.addEventListener('hashchange', function(e){
                $this.pageChanged(e);
            }, false);

             */
            document.addEventListener('touchmove', function(e) {
                e.preventDefault();
            });


            $this.appBody.on('show.popup.MD', function(event) {

                $this.log('Event: ', 'triggered', 'show.popup.MD', event);

                if (event.url) {
                    $this.openPopup(event);
                }

                //Check for tracking codes
                if (event.trackID && $this.isDeployed) {

                    //Add Veeva Click stream tracking
                    $this.addCallClickstream(event);
                }

            });

            //Check to see if SubScene should be loaded using Veeva custom field
            if ($this.isDeployed) {
                $this.veevaCheckForSubScene(function(blnSceneChanged) {
                    if (!blnSceneChanged) {
                        //Trigger function
                        $(window).trigger('hashchange');
                    }
                });
            } else {
                $(window).trigger('hashchange');
            }


            return this;
        }

    };

    VEEVA.iRep.prototype.pageChanged = function(event) {

        var $this = this;

        $this.log('Event: hashchange firing', $this);


        // Get the State Object
        $this.state = event.getState();

        //Set current section
        $this.state['section'] = $this.currentSectionName;

        $this.log('State: ', $this.state);


        if (!$this.state['pageChange']) {

            if ($this.state['section']) {

                $this.appBody.find('section.main-content section.page-load');

                $this.currentKeyMessage = utilKeyMessages.getKeyMessageByName($this.currentSectionName);

                var nextSection = utilKeyMessages.getKeyMessageByIndex($this.currentKeyMessage.index + 1),
                    prevSection = utilKeyMessages.getKeyMessageByIndex($this.currentKeyMessage.index - 1);


                var sectionDetails = {
                    page: $this.state['page'] || 0,
                    section: $this.currentKeyMessage,
                    sectionKey: $this.currentSectionName,
                    sectionIndex: $this.currentKeyMessage.index,
                    numSlides: $this.currentKeyMessage.numSlides,
                    sectionNextIndex: $this.currentKeyMessage.sectionNextIndex,
                    nextSection: nextSection,
                    nextSectionKey: nextSection.key_message,
                    nextSectionURL: nextSection.key_message + '.html',
                    prevSection: prevSection,
                    prevSectionKey: prevSection.key_message,
                    prevSectionURL: prevSection.key_message + '.html',
                    prevSectionnNumSlides: prevSection.slides.length,
                };

                $this.currentSection = new Section($this, sectionDetails, function() {

                    var appReadyEvent = $.Event('veeva.app.ready');

                    $this.log('Event: veeva.app.ready');

                    $('.main-content').fadeIn('slow');


                    $this.appBody.trigger(appReadyEvent);

                    //check for auto popups
                    if ($this.state['#popup']) {

                        var pLink = $this.state['#popup'];

                        pLink = pLink.slice(pLink.lastIndexOf('=') + 1, pLink.length);


                        // Trigger Popup event
                        var popEvent = $.Event('show.popup.MD');
                        popEvent.url = pLink;
                        popEvent.popupType = 'popup';

                        $this.appBody.trigger(popEvent);

                    }
                });

            }
        }

        return $this;
    };





    /**********************************************************
     ** SECTION
     ** Note: loads section based on app.json
     ***********************************************************/
    var Section = function(_that, _options, callback) {

        var $that = _that,
            $this = this,
            defaults = {
                page: 0
            };

        var $container = $that.appBody.find('.main-content'),
            $sectionSlides = $container.find('section slide'),
            options = $.extend(defaults, _options);

        var htmlSubNav = '<div class="subnav"><ul>';

        var slideNoSwipeZones = [];
        var $slidesConfigured = $(options.section.slides);

        var noSwipeZone,
            noSwipeZoneYtop,
            noSwipeZoneYbottom;

        // these are used after event listeners fire
        $this.name = options.sectionKey;
        $this.activeSlide = options.page !== 0 ? (options.page - 1) : options.page;

        /**
         * Loop through section slides
         * * Build sub navigation
         * * Add Veeva tracking tags as defined in configuration.yml
         * * Create no swipe zones as defined in configuration.yml
         * @date   2016-03-15
         */
        $sectionSlides.each(function(i, slide) {

            // check for no swipe zones
            noSwipeZone = $slidesConfigured[i].noSwipeZone || false;
            noSwipeZoneYtop = parseInt(noSwipeZone.yTop) || 0;
            noSwipeZoneYbottom = parseInt(noSwipeZone.yBottom) || 0;

            if (noSwipeZone) {
                slideNoSwipeZones.push({ 'slide': i, 'yTop': noSwipeZoneYtop, 'yBottom': noSwipeZoneYbottom });
            }

            // add veeva tracking attributes
            if ($slidesConfigured[i].track) {
                $(slide).attr('track-id', $slidesConfigured[i].id).attr('track-type', $slidesConfigured[i].track).attr('track-description', $slidesConfigured[i].slide);
            }

            // build sub nav
            htmlSubNav += '<li><a href="#" class="page-button trigger-swipe" id="' + $slidesConfigured[i].id + '" slideindex="' + i + '"><span class="nav-outer"><span>' + $slidesConfigured[i].slide + '</span></span></a></li>';

        });

        htmlSubNav += '</ul></div>';

        // append sub nav
        $that.appBody.append(htmlSubNav);


        // wrap each slide with content.
        $sectionSlides.wrapInner('<div class="content"></div>');


        // Plugins to override popups
        $container.popupLinks({ 'eventClick': $that.eventClick });

        $container.veevaLink({
            'eventClick': $that.eventClick,
            'primaryPresentation': $that.presentationPrimary,
            'videoPresentation': $that.presentationVideos,
            'pdfPresentation': $that.presentationPDFs
        });


        $container.on($that.eventClick, '.open-chart', function(e) {
            e.preventDefault();
            e.stopPropagation();

            var $this = $(this),
                popEvent = $.Event('show.popup.MD'),
                popupType = $this.attr('popup-type') === 'popupFull' ? 'popupFull' : 'popup',
                pLink = $this.attr('data-link');

            pLink = pLink.slice(pLink.lastIndexOf('=') + 1, pLink.length);

            popEvent.url = pLink;
            popEvent.popupType = popupType;

            //Get Tracking info
            popEvent.trackID = $this.attr('track-id');
            popEvent.trackType = $this.attr('track-type');
            popEvent.trackDescription = $this.attr('track-description');

            $this.trigger(popEvent);

            return false;
        });


        // setup Key Message slides
        $container.veevaSwipeSlider({
            sliderClass: 'section.page',
            slideClass: 'slide',
            debug: $that.debug,
            eventClick: $that.eventClick,
            speed: 400,
            startIndex: options.page,
            subNav: $('.subnav ul li'),
            stateManager: false,
            blnSwiping: true,
            slideNoSwipeZones: slideNoSwipeZones || false,
            controlsShow: true,
            onSlideChange: function(slider, index) {

                var slideEvent = $.Event('change.slider.MD');
                slideEvent.slide = index;

                slider.trigger(slideEvent);

                $that.log('Event: change.slider.MD', slider, index);

                $('.chart.reload').hide();

                var $activeSlide = $(this.slides[index]),
                    hasTracking = $activeSlide.attr('track-id') !== undefined ? $activeSlide.attr('track-id') : '';

                //If this is a sub-key-message then
                //Get Tracking info and call addCallClickstream function
                if (hasTracking.length > 0 && $that.isDeployed) {
                    event.trackID = hasTracking;
                    event.trackType = $activeSlide.attr('track-type');
                    event.trackDescription = $activeSlide.attr('track-description');

                    //Add Veeva Click stream tracking
                    $that.addCallClickstream(event);
                }

            },
            onSlideAfterChange: function(slider, index) {

                var activeSlide = this.slides[index];


                /** reload chart, if any */
                $(activeSlide).find('.chart.reload').fadeIn();

            },
            onSectionChange: function(dir) {

                var prevSectionLastSlide = $that.isDeployed ? options.prevSectionURL.replace('.html', '.zip') : '../' + options.prevSectionURL.slice(0, -5) + '/' + options.prevSectionURL + '#page=' + options.prevSectionnNumSlides,
                    nextSectionFirstSlide = $that.isDeployed ? options.nextSectionURL.replace('.html', '.zip') : '../' + options.nextSectionURL.slice(0, -5) + '/' + options.nextSectionURL,
                    setClass = dir === 'prev' ? 'slide-left' : 'slide-right',
                    setURL = dir === 'prev' ? prevSectionLastSlide : nextSectionFirstSlide;


                $container.fadeOut();

                if ((options.prevSectionKey !== undefined && dir === 'prev') || (options.nextSectionKey !== undefined && dir === 'next')) {

                    if ($that.isDeployed) {

                        //Set custom field to load last slide of previous section
                        if (dir === 'prev' && options.prevSectionnNumSlides !== '0') {

                            $that.veevaUpdateUserObject(options.prevSectionnNumSlides, function() {});

                        }

                        setTimeout(function() {
                            $that.goToSlide(setURL, $that.presentationPrimary);
                        }, 200);
                    } else {

                        $('section.main-content').fadeOut(300, function() {
                            window.location = setURL;
                        });
                    }
                }

                return this;
            }

        });

        callback();
    };


    var MainISI = function(_this) {

        var $that = _this,
            $mainISI = $($that.containerMainISI),
            isiOpen = false,
            isiSlider = null;

        $that.log('Function load: MainISI');

        $mainISI.append().load($that.fileISI,
            function(response, status, xhr) {
                if (status === 'error') {
                    var loadError = xhr.status + ' ' + xhr.statusText;
                    $(this).append('<h1 class="error">' + loadError + '</h1>');
                }
                if (status === 'success') {
                    sectionLoaded();
                }
            }
        );

        var sectionLoaded = function() {

            $that.btnISI.on($that.eventClick, function(e) {
                eventHandlerToggleISI(e);
                e.stopPropagation();
            });

            var eventHandlerToggleISI = function(e) {

                if (e.preventDefault) {
                    e.preventDefault();
                }

                if (isiSlider && isiOpen) {
                    isiOpen = false;
                    $that.btnISI.find('.btn-isi').removeClass('on').addClass('off').html('Open');
                    $mainISI.removeClass('open').addClass('close');
                    isiSlider.destroy();
                    isiSlider = null;
                } else if (e.type === $that.eventClick) {
                    isiOpen = true;


                    $that.btnISI.find('.btn-isi').removeClass('off').addClass('on').html('Close');

                    //Create IScroll object
                    isiSlider = new IScroll('#main-isi', {
                        mouseWheel: true,
                        momentum: true,
                        checkDOMChanges: true,
                        onDestroy: function() {
                            $mainISI.css({
                                'overflow-y': 'auto'
                            }).removeClass('open').addClass('close');
                        }

                    });
                    $mainISI.removeClass('close').addClass('open').css({
                        'overflow-y': 'auto'
                    });

                }
            };

            $that.btnISI.trigger($that.eventClick);

        };

        return $that;
    };



    VEEVA.iRep.prototype.openPopup = function(event) {

        var $that = this,
            $element = '',
            url = event.url;


        /**
         * Only build popup once and then reuse it
         * @author Steven Britton
         * @date   2015-08-04
         */
        if ($that.popup === '') {

            var buildPopup = '<div id="popup-wrapper"><div id="' + event.popupType + '" class="popup-inner">';
            buildPopup += '<a href="javascript:void(0)" class="close-button" ></a></div></div>';

            $(buildPopup).appendTo($that.appBody);

            $that.popup = $('#popup-wrapper');
        }

        $that.popup.addClass('on');

        $element = $that.popup.find('#popup');

        $element.load(url,
            function(response, status, xhr) {
                $element.append($('<a href="javascript:void(0)" class="close-button" />'));
                if (status === 'error') {
                    var loadError = xhr.status + ' ' + xhr.statusText;

                    $element.append('<h1 class="error">' + loadError + '</h1>');
                }
                if (status === 'success') {
                    sectionLoaded();
                }
            }
        );


        var sectionLoaded = function() {

            if ($element.attr('id') === 'popup') {

                $element.clearQueue().show('scale', {
                    percent: 70,
                    direction: 'both'
                }, 30, function() {

                    $element.trigger('popup.Ready');

                    $element.veevaLink({
                        'eventClick': $that.eventClick,
                        'primaryPresentation': $that.presentationPrimary,
                        'videoPresentation': $that.presentationVideos,
                        'pdfPresentation': $that.presentationPDFs
                    });

                });

            } else {
                $element.show().animate({
                    opacity: 1
                }, function() {
                    $element.trigger('popup.Ready');
                });
            }

        };

        $that.popup.off().on($that.eventClick, '.close-button', function(e) {
            e.preventDefault();
            e.stopPropagation();

            $element.animate({
                top: 0,
                opacity: 0
            }, 300, function() {

                $(this).removeAttr('style');

                $element.find('.content').detach();

                $that.popup.removeClass('on');

            });
        });

        return $that;
    };


    VEEVA.iRep.prototype.changeState = function(page) {

        var state = {};

        state['page'] = page;

        $.bbq.pushState(state);

    };


    VEEVA.iRep.prototype.goToSlide = function(slide, presentation) {

        document.location = 'veeva:gotoSlide(' + slide + ', ' + presentation + ')';
    };

    VEEVA.iRep.prototype.addCallClickstream = function(event) {

        var clickStream = {};

        clickStream.Track_Element_Id_vod__c = event.trackID;
        clickStream.Track_Element_Type_vod__c = event.trackType;
        clickStream.Track_Element_Description_vod__c = event.trackDescription;

        //Save the tracking data to Veeva Object
        com.veeva.clm.createRecord('Call_Clickstream_vod__c', clickStream, function() {

        });

    };

    VEEVA.iRep.prototype.veevaCheckForSubScene = function(cb) {

        var $this = this,
            customUserObject = $this.veevaTrackSubsceneField;

        if(customUserObject === ''){
            cb(false);
        }
        com.veeva.clm.getDataForCurrentObject('User', customUserObject, function(result) {
            if (result.success) {

                var subscene = result.User[customUserObject.toString()];

                //Jump to the scene specified in subscene above
                if (subscene !== '0') {

                    $this.changeState(subscene);

                    //Clear subscene field
                    $this.veevaUpdateUserObject('0', cb, true);

                    return;
                } else {
                    cb(false);
                }

            }
        });
    };

    VEEVA.iRep.prototype.veevaUpdateUserObject = function(subscene, cb) {

        var $this = this,
            dataString = {},
            customUserObject = $this.veevaTrackSubsceneField;

        if(customUserObject === ''){
            cb(false);
        }

        dataString[customUserObject.toString()] = subscene;

        com.veeva.clm.getDataForCurrentObject('User', 'ID', function(result) {
            com.veeva.clm.updateRecord('User', result.User.ID, dataString, cb);
        });
    };






})(window, document, jQuery, undefined);



