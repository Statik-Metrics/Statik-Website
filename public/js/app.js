/**=========================================================
 * Module: aside-toggle.js
 * Toggle the aside between normal an collapsed state
 * State applied to body so all elements can be notified
 * Targeted elements must have [data-toggle="aside"]
 =========================================================*/

(function($, window, document){

    var Selector = '[data-toggle="aside"]',
        $body = $('body');

    $(document).on('click', Selector, function (e) {
        e.preventDefault();

        $body.toggleClass('aside-toggled');

    });

}(jQuery, window, document));

/**=========================================================
 * Module: calendar-ui.js
 * This script handle the calendar demo with draggable
 * events and events creations
 =========================================================*/

(function($, window, document){

    if(!$.fn.fullCalendar) return;


    /**
     * ExternalEvent object
     * @param jQuery Object elements Set of element as jQuery objects
     */
    var ExternalEvent = function (elements) {

        if (!elements) return;

        elements.each(function() {
            var $this = $(this);
            // create an Event Object (http://arshaw.com/fullcalendar/docs/event_data/Event_Object/)
            // it doesn't need to have a start or end
            var calendarEventObject = {
                title: $.trim($this.text()) // use the element's text as the event title
            };

            // store the Event Object in the DOM element so we can get to it later
            $this.data('calendarEventObject', calendarEventObject);

            // make the event draggable using jQuery UI
            $this.draggable({
                zIndex: 1070,
                revert: true, // will cause the event to go back to its
                revertDuration: 0  //  original position after the drag
            });

        });
    };

    /**
     * Invoke full calendar plugin and attach behavior
     * @param  jQuery [calElement] The calendar dom element wrapped into jQuery
     * @param  EventObject [events] An object with the event list to load when the calendar displays
     */
    function initCalendar(calElement, events) {

        // check to remove elements from the list
        var removeAfterDrop = $('#remove-after-drop');

        calElement.fullCalendar({
            header: {
                left:   'prev,next today',
                center: 'title',
                right:  'month,agendaWeek,agendaDay'
            },
            buttonIcons: { // note the space at the beginning
                prev:    ' fa fa-caret-left',
                next:    ' fa fa-caret-right'
            },
            buttonText: {
                today: 'today',
                month: 'month',
                week:  'week',
                day:   'day'
            },
            editable: true,
            droppable: true, // this allows things to be dropped onto the calendar
            drop: function(date, allDay) { // this function is called when something is dropped

                var $this = $(this),
                // retrieve the dropped element's stored Event Object
                    originalEventObject = $this.data('calendarEventObject');

                // if something went wrong, abort
                if(!originalEventObject) return;

                // clone the object to avoid multiple events with reference to the same object
                var clonedEventObject = $.extend({}, originalEventObject);

                // assign the reported date
                clonedEventObject.start = date;
                clonedEventObject.allDay = allDay;
                clonedEventObject.backgroundColor = $this.css("background-color");
                clonedEventObject.borderColor = $this.css("border-color");

                // render the event on the calendar
                // the last `true` argument determines if the event "sticks"
                // (http://arshaw.com/fullcalendar/docs/event_rendering/renderEvent/)
                calElement.fullCalendar('renderEvent', clonedEventObject, true);

                // if necessary remove the element from the list
                if(removeAfterDrop.is(':checked')) {
                    $this.remove();
                }
            },
            eventDragStart: function (event, js, ui) {
                draggingEvent = event;
            },
            // This array is the events sources
            events: events
        });
    }

    /**
     * Inits the external events panel
     * @param  jQuery [calElement] The calendar dom element wrapped into jQuery
     */
    function initExternalEvents(calElement){
        // Panel with the external events list
        var externalEvents = $('.external-events');

        // init the external events in the panel
        new ExternalEvent(externalEvents.children('div'));

        // External event color is danger-red by default
        var currColor = '#f6504d';
        // Color selector button
        var eventAddBtn = $('.external-event-add-btn');
        // New external event name input
        var eventNameInput = $('.external-event-name');
        // Color switchers
        var eventColorSelector = $('.external-event-color-selector .point');

        // Trash events Droparea
        $('.external-events-trash').droppable({
            accept:       '.fc-event',
            activeClass:  'active',
            hoverClass:   'hovered',
            tolerance:    'touch',
            drop: function(event, ui) {

                // You can use this function to send an ajax request
                // to remove the event from the repository

                if(draggingEvent) {
                    var eid = draggingEvent.id || draggingEvent._id;
                    // Remove the event
                    calElement.fullCalendar('removeEvents', eid);
                    // Remove the dom element
                    ui.draggable.remove();
                    // clear
                    draggingEvent = null;
                }
            }
        });

        eventColorSelector.click(function(e) {
            e.preventDefault();
            var $this = $(this);

            // Save color
            currColor = $this.css('background-color');
            // De-select all and select the current one
            eventColorSelector.removeClass('selected');
            $this.addClass('selected');
        });

        eventAddBtn.click(function(e) {
            e.preventDefault();

            // Get event name from input
            var val = eventNameInput.val();
            // Dont allow empty values
            if ($.trim(val) === '') return;

            // Create new event element
            var newEvent = $('<div/>').css({
                'background-color': currColor,
                'border-color':     currColor,
                'color':            '#fff'
            })
                .html(val);

            // Prepends to the external events list
            externalEvents.prepend(newEvent);
            // Initialize the new event element
            new ExternalEvent(newEvent);
            // Clear input
            eventNameInput.val('');
        });
    }

    /**
     * Creates an array of events to display in the first load of the calendar
     * Wrap into this function a request to a source to get via ajax the stored events
     * @return Array The array with the events
     */
    function createDemoEvents() {
        // Date for the calendar events (dummy data)
        var date = new Date();
        var d = date.getDate(),
            m = date.getMonth(),
            y = date.getFullYear();

        return  [
            {
                title: 'All Day Event',
                start: new Date(y, m, 1),
                backgroundColor: "#f56954", //red
                borderColor: "#f56954" //red
            },
            {
                title: 'Long Event',
                start: new Date(y, m, d - 5),
                end: new Date(y, m, d - 2),
                backgroundColor: "#f39c12", //yellow
                borderColor: "#f39c12" //yellow
            },
            {
                title: 'Meeting',
                start: new Date(y, m, d, 10, 30),
                allDay: false,
                backgroundColor: "#0073b7", //Blue
                borderColor: "#0073b7" //Blue
            },
            {
                title: 'Lunch',
                start: new Date(y, m, d, 12, 0),
                end: new Date(y, m, d, 14, 0),
                allDay: false,
                backgroundColor: "#00c0ef", //Info (aqua)
                borderColor: "#00c0ef" //Info (aqua)
            },
            {
                title: 'Birthday Party',
                start: new Date(y, m, d + 1, 19, 0),
                end: new Date(y, m, d + 1, 22, 30),
                allDay: false,
                backgroundColor: "#00a65a", //Success (green)
                borderColor: "#00a65a" //Success (green)
            },
            {
                title: 'Open Google',
                start: new Date(y, m, 28),
                end: new Date(y, m, 29),
                url: 'http://google.com/',
                backgroundColor: "#3c8dbc", //Primary (light-blue)
                borderColor: "#3c8dbc" //Primary (light-blue)
            }
        ];
    }

    // When dom ready, init calendar and events
    $(function() {

        // global shared var to know what we are dragging
        var draggingEvent = null;
        // The element that will display the calendar
        var calendar = $('#calendar');

        var demoEvents = createDemoEvents();

        initExternalEvents(calendar);

        initCalendar(calendar, demoEvents);

    });


}(jQuery, window, document));




/**=========================================================
 * Module: flot-chart.js
 * Initializes the flot chart plugin and attaches the
 * plugin to elements according to its type
 =========================================================*/

(function($, window, document){

    /**
     * Global object to load data for charts using ajax
     * Request the chart data from the server via post
     * Expects a response in JSON format to init the plugin
     * Usage
     *   chart = new floatChart('#id', 'server/chart-data.php')
     *   ...
     *   chart.requestData(options);
     *
     * @param  Chart element placeholder or selector
     * @param  Url to get the data via post. Response in JSON format
     */
    window.FlotChart = function (element, url) {
        // Properties
        this.element = $(element);
        this.url = url;

        // Public method
        this.requestData = function (option, method) {
            var self = this;
            method = method || "POST";
            $.ajax({
                url:      self.url,
                cache:    false,
                type:     method,
                dataType: "json"
            }).done(function (data) {
                $.plot( self.element, data, option );
            });
        };


    };

    //
    // Start of Demo Script
    //
    $(function () {

        // Bar chart
        (function () {
            var Selector = ".chart-bar";
            $(Selector).each(function() {
                var source = $(this).data('source') || $.error('Bar: No source defined.');
                var chart = new FlotChart(this, source),
                    panel = $(Selector).parents(".panel"),
                    option = {
                        series: {
                            bars: {
                                align: "center",
                                lineWidth: 0,
                                show: true,
                                barWidth: 0.6,
                                fill: 0.9
                            }
                        },
                        grid: {
                            borderColor: "#eee",
                            borderWidth: 1,
                            hoverable: true,
                            backgroundColor: "#fcfcfc"
                        },
                        tooltip: true,
                        tooltipOpts: {
                            content: "%x : %y"
                        },
                        xaxis: {
                            tickColor: "#fcfcfc",
                            mode: "categories"
                        },
                        yaxis: {
                            tickColor: "#eee"
                        },
                        shadowSize: 0
                    };
                // Send Request
                chart.requestData(option);
            });

        })();
        // Bar Stacked chart
        (function () {
            var Selector = ".chart-bar-stacked";
            $(Selector).each(function() {
                var source = $(this).data('source') || $.error('Bar Stacked: No source defined.');
                var chart = new FlotChart(this, source),
                    option = {
                        series: {
                            stack: true,
                            bars: {
                                align: "center",
                                lineWidth: 0,
                                show: true,
                                barWidth: 0.6,
                                fill: 0.9
                            }
                        },
                        grid: {
                            borderColor: "#eee",
                            borderWidth: 1,
                            hoverable: true,
                            backgroundColor: "#fcfcfc"
                        },
                        tooltip: true,
                        tooltipOpts: {
                            content: "%x : %y"
                        },
                        xaxis: {
                            tickColor: "#fcfcfc",
                            mode: "categories"
                        },
                        yaxis: {
                            tickColor: "#eee"
                        },
                        shadowSize: 0
                    };
                // Send Request
                chart.requestData(option);
            });
        })();
        // Area chart
        (function () {
            var Selector = ".chart-area";
            $(Selector).each(function() {
                var source = $(this).data('source') || $.error('Area: No source defined.');
                var chart = new FlotChart(this, source),
                    option = {
                        series: {
                            lines: {
                                show: true,
                                fill: 0.8
                            },
                            points: {
                                show: true,
                                radius: 4
                            }
                        },
                        grid: {
                            borderColor: "#eee",
                            borderWidth: 1,
                            hoverable: true,
                            backgroundColor: "#fcfcfc"
                        },
                        tooltip: true,
                        tooltipOpts: {
                            content: "%x : %y"
                        },
                        xaxis: {
                            tickColor: "#fcfcfc",
                            mode: "categories"
                        },
                        yaxis: {
                            tickColor: "#eee",
                            tickFormatter: function (v) {
                                return v + " visitors";
                            }
                        },
                        shadowSize: 0
                    };
                // Send Request
                chart.requestData(option);
            });
        })();
        // Line chart
        (function () {
            var Selector = ".chart-line";
            $(Selector).each(function() {
                var source = $(this).data('source') || $.error('Line: No source defined.');
                var chart = new FlotChart(this, source),
                    option = {
                        series: {
                            lines: {
                                show: true,
                                fill: 0.01
                            },
                            points: {
                                show: true,
                                radius: 4
                            }
                        },
                        grid: {
                            borderColor: "#eee",
                            borderWidth: 1,
                            hoverable: true,
                            backgroundColor: "#fcfcfc"
                        },
                        tooltip: true,
                        tooltipOpts: {
                            content: "%x : %y"
                        },
                        xaxis: {
                            tickColor: "#eee",
                            mode: "categories"
                        },
                        yaxis: {
                            tickColor: "#eee"
                        },
                        shadowSize: 0
                    };
                // Send Request
                chart.requestData(option);
            });
        })();
        // PÃ¯e
        (function () {
            var Selector = ".chart-pie";
            $(Selector).each(function() {
                var source = $(this).data('source') || $.error('Pie: No source defined.');
                var chart = new FlotChart(this, source),
                    option = {
                        series: {
                            pie: {
                                show: true,
                                innerRadius: 0,
                                label: {
                                    show: true,
                                    radius: 0.8,
                                    formatter: function (label, series) {
                                        return '<div class="flot-pie-label">' +
                                            //label + ' : ' +
                                            Math.round(series.percent) +
                                            '%</div>';
                                    },
                                    background: {
                                        opacity: 0.8,
                                        color: '#222'
                                    }
                                }
                            }
                        }
                    };
                // Send Request
                chart.requestData(option);
            });
        })();
        // Donut
        (function () {
            var Selector = ".chart-donut";
            $(Selector).each(function() {
                var source = $(this).data('source') || $.error('Donut: No source defined.');
                var chart = new FlotChart(this, source),
                    option = {
                        series: {
                            pie: {
                                show: true,
                                innerRadius: 0.5 // This makes the donut shape
                            }
                        }
                    };
                // Send Request
                chart.requestData(option);
            });
        })();
    });

}(jQuery, window, document));

/**=========================================================
 * Module: navbar-search.js
 * Navbar search toggler
 * To open search add a buton with [data-toggle="navbar-search"]
 * To close search add an element with [data-toggle="navbar-search-dismiss"]
 *
 * Auto dismiss on ESC key
 =========================================================*/

(function($, window, document){

    $(function() {

        var openSelector    = '[data-toggle="navbar-search"]',
            dismissSelector = '[data-toggle="navbar-search-dismiss"]',
            inputSelector   = '.navbar-form input[type="text"]',
            navbarForm      = $('form.navbar-form');

        var NavSearch = {
            toggle: function() {

                navbarForm.toggleClass('open');

                var isOpen = navbarForm.hasClass('open');

                navbarForm.find('input')[isOpen ? 'focus' : 'blur']();

            },

            dismiss: function() {
                navbarForm
                    .removeClass('open')      // Close control
                    .find('input[type="text"]').blur() // remove focus
                    .val('')                    // Empty input
                ;
            }

        };

        $(document)
            .on("click", NavSearch.dismiss)
            .on("click", openSelector +', '+ inputSelector +', '+ dismissSelector, function (e) {
                e.stopPropagation();
            })
            .on("click", dismissSelector, NavSearch.dismiss)
            .on("click", openSelector, NavSearch.toggle)
            .keyup(function(e) {
                if (e.keyCode == 27) // ESC
                    NavSearch.close();
            });
    });


}(jQuery, window, document));

/**=========================================================
 * Module: notify.js
 * Create toggleable notifications that fade out automatically.
 * Based on Notify addon from UIKit (http://getuikit.com/docs/addons_notify.html)
 * [data-toggle="notify"]
 * [data-options="options in json format" ]
 =========================================================*/

(function($, window, document){

    var Selector = '[data-toggle="notify"]',
        autoloadSelector = '[data-onload]',
        doc = $(document);


    $(function() {

        $(Selector).each(function(){

            var $this  = $(this),
                onload = $this.data('onload');

            if(onload !== undefined) {
                setTimeout(function(){
                    notifyNow($this);
                }, 800);
            }

            $this.on('click', function (e) {
                e.preventDefault();
                notifyNow($this);
            });

        });

    });

    function notifyNow($element) {
        var message = $element.data('message'),
            options = $element.data('options');

        if(!message)
            $.error('Notify: No message specified');

        $.notify(message, options || {});
    }


}(jQuery, window, document));


/**
 * Notify Addon definition as jQuery plugin
 * Adapted version to work with Bootstrap classes
 * More information http://getuikit.com/docs/addons_notify.html
 */

(function($, window, document){

    var containers = {},
        messages   = {},

        notify     =  function(options){

            if ($.type(options) == 'string') {
                options = { message: options };
            }

            if (arguments[1]) {
                options = $.extend(options, $.type(arguments[1]) == 'string' ? {status:arguments[1]} : arguments[1]);
            }

            return (new Message(options)).show();
        },
        closeAll  = function(group, instantly){
            if(group) {
                for(var id in messages) { if(group===messages[id].group) messages[id].close(instantly); }
            } else {
                for(var id in messages) { messages[id].close(instantly); }
            }
        };

    var Message = function(options){

        var $this = this;

        this.options = $.extend({}, Message.defaults, options);

        this.uuid    = "ID"+(new Date().getTime())+"RAND"+(Math.ceil(Math.random() * 100000));
        this.element = $([
            // alert-dismissable enables bs close icon
            '<div class="uk-notify-message alert-dismissable">',
            '<a class="close">&times;</a>',
                '<div>'+this.options.message+'</div>',
            '</div>'

        ].join('')).data("notifyMessage", this);

        // status
        if (this.options.status) {
            this.element.addClass('alert alert-'+this.options.status);
            this.currentstatus = this.options.status;
        }

        this.group = this.options.group;

        messages[this.uuid] = this;

        if(!containers[this.options.pos]) {
            containers[this.options.pos] = $('<div class="uk-notify uk-notify-'+this.options.pos+'"></div>').appendTo('body').on("click", ".uk-notify-message", function(){
                $(this).data("notifyMessage").close();
            });
        }
    };


    $.extend(Message.prototype, {

        uuid: false,
        element: false,
        timout: false,
        currentstatus: "",
        group: false,

        show: function() {

            if (this.element.is(":visible")) return;

            var $this = this;

            containers[this.options.pos].show().prepend(this.element);

            var marginbottom = parseInt(this.element.css("margin-bottom"), 10);

            this.element.css({"opacity":0, "margin-top": -1*this.element.outerHeight(), "margin-bottom":0}).animate({"opacity":1, "margin-top": 0, "margin-bottom":marginbottom}, function(){

                if ($this.options.timeout) {

                    var closefn = function(){ $this.close(); };

                    $this.timeout = setTimeout(closefn, $this.options.timeout);

                    $this.element.hover(
                        function() { clearTimeout($this.timeout); },
                        function() { $this.timeout = setTimeout(closefn, $this.options.timeout);  }
                    );
                }

            });

            return this;
        },

        close: function(instantly) {

            var $this    = this,
                finalize = function(){
                    $this.element.remove();

                    if(!containers[$this.options.pos].children().length) {
                        containers[$this.options.pos].hide();
                    }

                    delete messages[$this.uuid];
                };

            if(this.timeout) clearTimeout(this.timeout);

            if(instantly) {
                finalize();
            } else {
                this.element.animate({"opacity":0, "margin-top": -1* this.element.outerHeight(), "margin-bottom":0}, function(){
                    finalize();
                });
            }
        },

        content: function(html){

            var container = this.element.find(">div");

            if(!html) {
                return container.html();
            }

            container.html(html);

            return this;
        },

        status: function(status) {

            if(!status) {
                return this.currentstatus;
            }

            this.element.removeClass('alert alert-'+this.currentstatus).addClass('alert alert-'+status);

            this.currentstatus = status;

            return this;
        }
    });

    Message.defaults = {
        message: "",
        status: "normal",
        timeout: 5000,
        group: null,
        pos: 'top-center'
    };


    $["notify"]          = notify;
    $["notify"].message  = Message;
    $["notify"].closeAll = closeAll;

    return notify;

}(jQuery, window, document));

/**=========================================================
 * Module: offsidebar.js
 * Show content inside an offcanvas box
 =========================================================*/

(function($, window, document){

    var triggerSelector      = '[data-toggle="offsidebar"]',
        offsidebarSelector   = '.offsidebar',
        offsidebarOpenClass  = 'offsidebar-open',
        $body = $('body');

    $(function() {

        var OffSidebar = {
            open: function(offsidebar) {
                $body.addClass(offsidebarOpenClass);
            },
            close: function() {
                $body.removeClass(offsidebarOpenClass);
            },
            toggle: function() {
                $body.toggleClass(offsidebarOpenClass);
            }
        };

        $(document)
            .on("click", OffSidebar.close)
            .on("click", offsidebarSelector + "," + triggerSelector, function (e) {
                e.stopPropagation();
            })
            .on("click", triggerSelector, OffSidebar.toggle);

    });

}(jQuery, window, document));

/**=========================================================
 * Module: panel-perform.js
 * Dismiss panels
 * [data-perform="panel-dismiss"]
 *
 * Requires animo.js
 =========================================================*/
(function($, window, document){

    var panelSelector = '[data-perform="panel-dismiss"]';

    $(document).on('click', panelSelector, function (e) {

        // find the first parent panel
        var parent = $(this).closest('.panel');

        if($.support.animation) {
            parent.animo({animation: 'bounceOut'}, removeElement);
        }
        else removeElement();

        function removeElement() {
            var col = parent.parent();
            parent.remove();
            // remove the parent if it is a row and is empty
            col.filter(function() {
                var el = $(this);
                return (el.is('[class*="col-"]') && el.children('*').length === 0);
            }).remove();

        }

    });

}(jQuery, window, document));


/**
 * Collapse panels
 * [data-perform="panel-collapse"]
 */
(function($, window, document){

    var panelSelector = '[data-perform="panel-collapse"]';

    // Prepare the panel to be collapsable and its events
    $(panelSelector).each(function() {
        // find the first parent panel
        var $this = $(this),
            parent = $this.closest('.panel'),
            wrapper = parent.find('.panel-wrapper'),
            collapseOpts = {toggle: false};

        // if wrapper not addded, add it
        // we need a wrapper to avoid jumping due to the paddings
        if( ! wrapper.length) {
            wrapper =
                parent.children('.panel-heading').nextAll() //find('.panel-body, .panel-footer')
                    .wrapAll('<div/>')
                    .parent()
                    .addClass('panel-wrapper');
            collapseOpts = {};
        }
        // Init collapse and bind events to switch icons
        wrapper
            .collapse(collapseOpts)
            .on('hide.bs.collapse', function() {
                $this.children('em').removeClass('fa-minus').addClass('fa-plus');
            })
            .on('show.bs.collapse', function() {
                $this.children('em').removeClass('fa-plus').addClass('fa-minus');
            });

    });
    // finally catch clicks to toggle panel size
    $(document).on('click', panelSelector, function (e) {

        var parent = $(this).closest('.panel');
        var wrapper = parent.find('.panel-wrapper');

        wrapper.collapse('toggle');

    });

}(jQuery, window, document));

/**=========================================================
 * Module: play-animation.js
 * Provides a simple way to run animation with a trigger
 * Targeted elements must have
 *   [data-toggle="play-animation"]
 *   [data-target="Target element affected by the animation"]
 *   [data-play="Animation name (http://daneden.github.io/animate.css/)"]
 *
 * Requires animo.js
 =========================================================*/

(function($, window, document){

    var Selector = '[data-toggle="play-animation"]';

    $(function() {

        var $scroller = $('body, .wrapper');

        // Parse animations params and attach trigger to scroll
        $(Selector).each(function() {
            var $this     = $(this),
                offset    = $this.data('offset'),
                delay     = $this.data('delay')     || 100, // milliseconds
                animation = $this.data('play')      || 'bounce';

            if(typeof offset !== 'undefined') {

                // test if the element starts visible
                testAnimation($this);
                // test on scroll
                $scroller.scroll(function(){
                    testAnimation($this);
                });

            }

            // Test an element visibilty and trigger the given animation
            function testAnimation(element) {
                if ( !element.hasClass('anim-running') &&
                    $.Utils.isInView(element, {topoffset: offset})) {
                    element
                        .addClass('anim-running');

                    setTimeout(function() {
                        element
                            .addClass('anim-done')
                            .animo( { animation: animation, duration: 0.7} );
                    }, delay);

                }
            }

        });

        // Run click triggered animations
        $(document).on('click', Selector, function(e) {

            var $this     = $(this),
                targetSel = $this.data('target'),
                animation = $this.data('play') || 'bounce',
                target    = $(targetSel);

            if(target && target) {
                target.animo( { animation: animation } );
            }

        });

    });

}(jQuery, window, document));

/**=========================================================
 * Module: portlet.js
 * Drag and drop any panel to change its position
 * The Selector should could be applied to any object that contains
 * panel, so .col-* element are ideal.
 =========================================================*/

(function($, window, document){

    // Component is optional
    if(!$.fn.sortable) return;

    var Selector = '[data-toggle="portlet"]';

    $(function(){

        $( Selector ).sortable({
            connectWith:  Selector,
            items:        'div.panel',
            handle:       '.portlet-handler',
            opacity:      0.7,
            placeholder:  'portlet box-placeholder',
            cancel:       '.portlet-cancel',
            forcePlaceholderSize: true,
            iframeFix:  false,
            tolerance:  'pointer',
            helper:     'original',
            revert:     200,
            forceHelperSize: true,

        }).disableSelection();

    });

}(jQuery, window, document));


/**=========================================================
 * Module: sidebar-menu.js
 * Provides a simple way to implement bootstrap collapse plugin using a target
 * next to the current element (sibling)
 * Targeted elements must have [data-toggle="collapse-next"]
 =========================================================*/
(function($, window, document){

    var collapseSelector = '[data-toggle="collapse-next"]',
        colllapsibles    = $('.sidebar .collapse').collapse({toggle: false}),
        toggledClass     = 'aside-toggled',
        $body            = $('body'),
        phone_mq         = 768; // media querie

    $(function() {

        $(document)
            .on('click', collapseSelector, function (e) {
                e.preventDefault();

                if ($(window).width() > phone_mq &&
                    $body.hasClass(toggledClass)) return;

                // Try to close all of the collapse areas first
                colllapsibles.collapse('hide');
                // ...then open just the one we want
                var $target = $(this).siblings('ul');
                $target.collapse('show');

            })
            // Submenu when aside is toggled
            .on('click', '.sidebar > .nav > li', function() {

                if ($body.hasClass(toggledClass) &&
                    $(window).width() > phone_mq) {

                    $('.sidebar > .nav > li')
                        .not(this)
                        .removeClass('open')
                        .end()
                        .filter(this)
                        .toggleClass('open');
                }

            });

    });


}(jQuery, window, document));

/**=========================================================
 * Module: sparkline.js
 * SparkLines Mini Charts
 =========================================================*/

(function($, window, document){

    var Selector = '.inlinesparkline';

    // Match color with css values to style charts
    var colors = {
        primary:         '#5fb5cb',
        success:         '#27ae60',
        info:            '#22bfe8',
        warning:         '#ffc61d',
        danger:          '#f6504d'
    };

    // Inline sparklines take their values from the contents of the tag
    $(Selector).each(function() {

        var $this = $(this);
        var data = $this.data();

        if(data.barColor && colors[data.barColor])
            data.barColor = colors[data.barColor];

        var options = data;
        options.type = data.type || 'bar'; // default chart is bar

        $(this).sparkline('html', options);

    });

}(jQuery, window, document));

/**=========================================================
 * Module: table-checkall.js
 * Tables check all checkbox
 =========================================================*/

(function($, window, document){

    var Selector = 'th.check-all';

    $(Selector).on('change', function() {
        var $this = $(this),
            index= $this.index() + 1,
            checkbox = $this.find('input[type="checkbox"]'),
            table = $this.parents('table');
        // Make sure to affect only the correct checkbox column
        table.find('tbody > tr > td:nth-child('+index+') input[type="checkbox"]')
            .prop('checked', checkbox[0].checked);

    });

}(jQuery, window, document));

/**=========================================================
 * Module: tooltips.js
 * Initialize Bootstrap tooltip with auto placement
 =========================================================*/

(function($, window, document){

    $(function(){

        $('[data-toggle="tooltip"]').tooltip({
            container: 'body',
            placement: function (context, source) {
                //return (predictTooltipTop(source) < 0) ?  "bottom": "top";
                var pos = "top";
                if(predictTooltipTop(source) < 0)
                    pos = "bottom";
                if(predictTooltipLeft(source) < 0)
                    pos = "right";
                return pos;
            }
        });

    });

    // Predicts tooltip top position
    // based on the trigger element
    function predictTooltipTop(el) {
        var top = el.offsetTop;
        var height = 40; // asumes ~40px tooltip height

        while(el.offsetParent) {
            el = el.offsetParent;
            top += el.offsetTop;
        }
        return (top - height) - (window.pageYOffset);
    }

    // Predicts tooltip top position
    // based on the trigger element
    function predictTooltipLeft(el) {
        var left = el.offsetLeft;
        var width = el.offsetWidth;

        while(el.offsetParent) {
            el = el.offsetParent;
            left += el.offsetLeft;
        }
        return (left - width) - (window.pageXOffset);
    }

}(jQuery, window, document));

/**=========================================================
 * Module: user-block-status.js
 * Used for the dropdown in the sidebar to change
 * the user status
 =========================================================*/

(function($, window, document){

    var Selector =  '.user-block-status';

    $(document).on('click', Selector, function(e) {

        // avoids conflict with menu collapse
        e.stopPropagation();

        var $this = $(this),
            html = $this.find('.dropdown-menu > li > a').filter(e.target).html(), // the status clicked
            btn  = $this.find('.btn'); // the button to display status

        // Update button status
        btn.html(html);

        // Update picture status indicator
        $('.user-block .user-block-picture .user-block-status').html(html);

        // Since we stopPropagation dropdown must be closed manually
        if($this.hasClass('open'))
            btn.dropdown('toggle');

    });

}(jQuery, window, document));

/**=========================================================
 * Module: utils.js
 * jQuery Utility functions library
 * adapted from the core of UIKit
 =========================================================*/

(function($, window, doc){

    "use strict";

    var $html = $("html"), $win = $(window);

    $.support.transition = (function() {

        var transitionEnd = (function() {

            var element = doc.body || doc.documentElement,
                transEndEventNames = {
                    WebkitTransition: 'webkitTransitionEnd',
                    MozTransition: 'transitionend',
                    OTransition: 'oTransitionEnd otransitionend',
                    transition: 'transitionend'
                }, name;

            for (name in transEndEventNames) {
                if (element.style[name] !== undefined) return transEndEventNames[name];
            }
        }());

        return transitionEnd && { end: transitionEnd };
    })();

    $.support.animation = (function() {

        var animationEnd = (function() {

            var element = doc.body || doc.documentElement,
                animEndEventNames = {
                    WebkitAnimation: 'webkitAnimationEnd',
                    MozAnimation: 'animationend',
                    OAnimation: 'oAnimationEnd oanimationend',
                    animation: 'animationend'
                }, name;

            for (name in animEndEventNames) {
                if (element.style[name] !== undefined) return animEndEventNames[name];
            }
        }());

        return animationEnd && { end: animationEnd };
    })();

    $.support.requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.msRequestAnimationFrame || window.oRequestAnimationFrame || function(callback){ window.setTimeout(callback, 1000/60); };
    $.support.touch                 = (
        ('ontouchstart' in window && navigator.userAgent.toLowerCase().match(/mobile|tablet/)) ||
        (window.DocumentTouch && document instanceof window.DocumentTouch)  ||
        (window.navigator['msPointerEnabled'] && window.navigator['msMaxTouchPoints'] > 0) || //IE 10
        (window.navigator['pointerEnabled'] && window.navigator['maxTouchPoints'] > 0) || //IE >=11
        false
        );
    $.support.mutationobserver      = (window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver || null);

    $.Utils = {};

    $.Utils.debounce = function(func, wait, immediate) {
        var timeout;
        return function() {
            var context = this, args = arguments;
            var later = function() {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            var callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    };

    $.Utils.removeCssRules = function(selectorRegEx) {
        var idx, idxs, stylesheet, _i, _j, _k, _len, _len1, _len2, _ref;

        if(!selectorRegEx) return;

        setTimeout(function(){
            try {
                _ref = document.styleSheets;
                for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                    stylesheet = _ref[_i];
                    idxs = [];
                    stylesheet.cssRules = stylesheet.cssRules;
                    for (idx = _j = 0, _len1 = stylesheet.cssRules.length; _j < _len1; idx = ++_j) {
                        if (stylesheet.cssRules[idx].type === CSSRule.STYLE_RULE && selectorRegEx.test(stylesheet.cssRules[idx].selectorText)) {
                            idxs.unshift(idx);
                        }
                    }
                    for (_k = 0, _len2 = idxs.length; _k < _len2; _k++) {
                        stylesheet.deleteRule(idxs[_k]);
                    }
                }
            } catch (_error) {}
        }, 0);
    };

    $.Utils.isInView = function(element, options) {

        var $element = $(element);

        if (!$element.is(':visible')) {
            return false;
        }

        var window_left = $win.scrollLeft(),
            window_top  = $win.scrollTop(),
            offset      = $element.offset(),
            left        = offset.left,
            top         = offset.top;

        options = $.extend({topoffset:0, leftoffset:0}, options);

        if (top + $element.height() >= window_top && top - options.topoffset <= window_top + $win.height() &&
            left + $element.width() >= window_left && left - options.leftoffset <= window_left + $win.width()) {
            return true;
        } else {
            return false;
        }
    };

    $.Utils.options = function(string) {

        if ($.isPlainObject(string)) return string;

        var start = (string ? string.indexOf("{") : -1), options = {};

        if (start != -1) {
            try {
                options = (new Function("", "var json = " + string.substr(start) + "; return JSON.parse(JSON.stringify(json));"))();
            } catch (e) {}
        }

        return options;
    };

    $.Utils.events       = {};
    $.Utils.events.click = $.support.touch ? 'tap' : 'click';

    $.langdirection = $html.attr("dir") == "rtl" ? "right" : "left";

    $(function(){

        // Check for dom modifications
        if(!$.support.mutationobserver) return;

        // Install an observer for custom needs of dom changes
        var observer = new $.support.mutationobserver($.Utils.debounce(function(mutations) {
            $(doc).trigger("domready");
        }, 300));

        // pass in the target node, as well as the observer options
        observer.observe(document.body, { childList: true, subtree: true });

    });

    // add touch identifier class
    $html.addClass($.support.touch ? "touch" : "no-touch");

}(jQuery, window, document));
/**
 * Provides a start point to run plugins and other scripts
 */
(function($, window, document){

    if (typeof $ === 'undefined') { throw new Error('This application\'s JavaScript requires jQuery'); }

    $(window).load(function() {

        $('.scroll-content').slimScroll({
            height: '250px'
        });

    });

    $(function() {

        // Init Fast click for mobiles
        FastClick.attach(document.body);

        // inhibits null links
        $('a[href="#"]').each(function(){
            this.href = 'javascript:void(0);';
        });

        // popover init
        $("[data-toggle=popover]")
            .popover();

        // Bootstrap slider
        $('.slider').slider();

        // Chosen
        $(".chosen-select").chosen();

        // Filestyle
        $(".filestyle").filestyle();

    });

}(jQuery, window, document));
//HUMAN - Bootstrap Dashboard