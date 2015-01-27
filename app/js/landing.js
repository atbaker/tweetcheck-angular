/*global jQuery, document, window, navigator, WOW*/
/* ==========================================================================
Document Ready Function
========================================================================== */
jQuery(document).ready(function () {

    'use strict';

    var onMobile;

    /* ==========================================================================
    on mobile?
    ========================================================================== */
  onMobile = false;
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent)) { onMobile = true; }

  if (onMobile === true) {
        /* ==========================================================================
        ScrollTo
        ========================================================================== */
        jQuery('a.scrollto').click(function (event) {
            jQuery('html, body').scrollTo(this.hash, this.hash, {gap: {y: -60}, animation:  {easing: 'easeInOutCubic', duration: 0}});
            event.preventDefault();
        });
    } else {
        /* ==========================================================================
        ScrollTo
        ========================================================================== */
        jQuery('a.scrollto').click(function (event) {
            jQuery('html, body').scrollTo(this.hash, this.hash, {gap: {y: -60}, animation:  {easing: 'easeInOutCubic', duration: 1500}});
            event.preventDefault();
        });
    }

    /* ==========================================================================
    Data Spy
    ========================================================================== */
    jQuery('body').attr('data-spy', 'scroll').attr('data-target', '#nav-wrapper').attr('data-offset', '61');


    /* ==========================================================================
    Sidebar Menu Button
    ========================================================================== */
    jQuery('.navbar-toggle').click(function (event) {
        jQuery('#main-wrapper').toggleClass('nav-visable');
        jQuery('.navbar-collapse').toggleClass('nav-visable');
    });
    jQuery('#main-wrapper').click(function (event) {
        jQuery('#main-wrapper').removeClass('nav-visable');
        jQuery('.navbar-collapse').removeClass('nav-visable');
    });
    jQuery('.navbar-collapse').click(function (event) {
        jQuery('#main-wrapper').removeClass('nav-visable');
        jQuery('.navbar-collapse').removeClass('nav-visable');
        jQuery('.navbar-collapse').removeClass('in').addClass('collapse');
    });

}); // JavaScript Document

/* ==========================================================================
Window Resize
========================================================================== */
jQuery(window).resize(function () {

    'use strict';

    var windowWidth;

    windowWidth = jQuery(window).width();
    if (windowWidth >= 1200) {
        jQuery('#main-wrapper').removeClass('nav-visable');
        jQuery('.navbar-collapse').removeClass('nav-visable');
    }

    jQuery('[data-spy="scroll"]').each(function () {
        var $spy = jQuery(this).scrollspy('refresh');
    });

});
