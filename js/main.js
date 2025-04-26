'use strict';

(function ($) {
    $(window).on('load', function () {
        $(".loader").fadeOut();
        $("#preloder").delay(200).fadeOut("slow");

        $('.gallery-controls ul li').on('click', function() {
            $('.gallery-controls ul li').removeClass('active').end().addClass('active');
        });

        if ($('.gallery-filter').length) {
            mixitup(document.querySelector('.gallery-filter'));
        }

        $('.blog-gird').masonry({
            itemSelector: '.grid-item', columnWidth: '.grid-sizer',
        });
    });

    $('.set-bg').each(function () {
        $(this).css('background-image', 'url(' + $(this).data('setbg') + ')');
    });

    $(".mobile-menu").slicknav({
        prependTo: '#mobile-menu-wrap', allowParentLinks: true
    });

    $(".header-section .nav-menu .mainmenu ul li").on('mouseenter', function() {
        $(this).addClass('active');
    }).on('mouseleave', function() {
        $('.header-section .nav-menu .mainmenu ul li').removeClass('active');
    });

    $(".hero-items").owlCarousel({
        loop: true, margin: 0, nav: true, items: 1,
        dots: true, animateOut: 'fadeOut', animateIn: 'fadeIn',
        navText: ['<i class="arrow_carrot-left"></i>', '<i class="arrow_carrot-right"></i>'],
        smartSpeed: 1200, autoHeight: false,
    });

    $(".testimonial-slider").owlCarousel({
        loop: true, margin: 0, nav: false, items: 1,
        dots: true, navText: ['<i class="arrow_carrot-left"></i>', '<i class="arrow_carrot-right"></i>'],
        smartSpeed: 1200, autoHeight: false, autoplay: true,
    });

    $('.video-popup').magnificPopup({ type: 'iframe' });
    $('.image-popup').magnificPopup({ type: 'image' });
    $('.show-result-select').niceSelect();

    $('.timetable-controls ul li').on('click', function() {
        var tsfilter = $(this).data('tsfilter');
        $('.timetable-controls ul li').removeClass('active').end().addClass('active');
        $('.classtime-table').toggleClass('filtering', tsfilter !== 'all');

        $('.ts-item').each(function(){
            $(this).toggleClass('show', $(this).data('tsmeta') === tsfilter);
        });
    });

})(jQuery);
