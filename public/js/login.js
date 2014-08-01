$(function () {
            $("input").iCheck({
                checkboxClass: 'icheckbox_square-blue',
                increaseArea: '20%' // optional
            });
            $(".form-control").focus(function () {
                $(this).closest(".textbox-wrap").addClass("focused");
            }).blur(function () {
                $(this).closest(".textbox-wrap").removeClass("focused");
            });

            if ($(window).width() >= 968 && !Modernizr.touch && Modernizr.cssanimations) {

                $("body").addClass("scroll-animations-activated");
                $('[data-animation-delay]').each(function () {
                    var animationDelay = $(this).data("animation-delay");
                    $(this).css({
                        "-webkit-animation-delay": animationDelay,
                        "-moz-animation-delay": animationDelay,
                        "-o-animation-delay": animationDelay,
                        "-ms-animation-delay": animationDelay,
                        "animation-delay": animationDelay
                    });

                });
                $('[data-animation]').waypoint(function (direction) {
                    if (direction == "down") {
                        $(this).addClass("animated " + $(this).data("animation"));

                    }
                }, {
                    offset: '90%'
                }).waypoint(function (direction) {
                    if (direction == "up") {
                        $(this).removeClass("animated " + $(this).data("animation"));

                    }
                }, {
                    offset: $(window).height() + 1
                });
            }

            if ($(window).width() > 1000 && !Modernizr.touch) {
                var options = {
                    $menu: ".main-nav",
                    menuSelector: 'a',
                    panelSelector: 'section',
                    namespace: '.panelSnap',
                    onSnapStart: function () { },
                    onSnapFinish: function ($target) {
                        $target.find('input:first').focus();
                    },
                    directionThreshold: 50,
                    slideSpeed: 200
                };
                $('body').panelSnap(options);

            }
        });