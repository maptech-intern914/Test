(function ($) {
	
	"use strict";

	var usesStandardMobileNav = /\/(cybersecurity|data-infrastructure|it-peripherals|computing-devices)\.html$/i.test(window.location.pathname) || /\/products\/[^/]+\/index\.html$/i.test(window.location.pathname);
	var standardNav = document.querySelector('.header-area .main-nav');
	if (usesStandardMobileNav && standardNav) {
		standardNav.classList.add('maptech-standard-mobile-nav');
		var legacyMenuTrigger = standardNav.querySelector('.menu-trigger');
		if (legacyMenuTrigger && legacyMenuTrigger.tagName !== 'BUTTON') {
			if (!document.querySelector('link[href*="bootstrap-icons.css"]')) {
				var iconStylesheet = document.createElement('link');
				iconStylesheet.rel = 'stylesheet';
				iconStylesheet.href = new URL('../../assets2/vendor/bootstrap-icons/bootstrap-icons.css', document.currentScript.src).href;
				document.head.append(iconStylesheet);
			}

			var mobileMenuButton = document.createElement('button');
			mobileMenuButton.type = 'button';
			mobileMenuButton.className = 'bi bi-list mobile-nav-toggle menu-trigger';
			mobileMenuButton.setAttribute('aria-label', 'Open navigation');
			mobileMenuButton.setAttribute('aria-expanded', 'false');
			legacyMenuTrigger.replaceWith(mobileMenuButton);
		}
	}

	$(function() {
        $("#tabs").tabs();
    });

	$(window).scroll(function() {
	  var scroll = $(window).scrollTop();
	  var box = $('.header-text').height();
	  var header = $('header').height();

	  if (scroll >= box - header) {
	    $("header").addClass("background-header");
	  } else {
	    $("header").removeClass("background-header");
	  }
	});
	

	$('.schedule-filter li').on('click', function() {
        var tsfilter = $(this).data('tsfilter');
        $('.schedule-filter li').removeClass('active');
        $(this).addClass('active');
        if (tsfilter == 'all') {
            $('.schedule-table').removeClass('filtering');
            $('.ts-item').removeClass('show');
        } else {
            $('.schedule-table').addClass('filtering');
        }
        $('.ts-item').each(function() {
            $(this).removeClass('show');
            if ($(this).data('tsmeta') == tsfilter) {
                $(this).addClass('show');
            }
        });
    });


	// Window Resize Mobile Menu Fix
	mobileNav();


	// Scroll animation init
	window.sr = new scrollReveal();
	

	// Menu Dropdown Toggle
	if($('.menu-trigger').length){
		$(".menu-trigger").on('click', function() {	
			var isOpen = !$(this).hasClass('active');
			$(this).toggleClass('active', isOpen);
			$(this).toggleClass('bi-list', !isOpen).toggleClass('bi-x', isOpen);
			$(this).attr('aria-expanded', isOpen);
			$(this).attr('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
			var mainNav = $(this).closest('.main-nav');
			mainNav.toggleClass('mobile-nav-open', isOpen);
			mainNav.find('.nav').stop(true, true).slideToggle(200);
		});
	}


	$(document).ready(function () {
	    $(document).on("scroll", onScroll);
	    onScroll();
	    
	    //smoothscroll
	    $('.scroll-to-section a[href^="#"]').on('click', function (e) {
	        e.preventDefault();
	        $(document).off("scroll");
	        
	        $('.header-area .main-nav .nav > li > a').each(function () {
	            $(this).removeClass('active');
	        });
	        $(this).addClass('active');
	      
	        var targetHash = this.hash;
	        var target = $(targetHash);
	        var headerHeight = $('.header-area').outerHeight() || 0;
	        $('html, body').stop().animate({
	            scrollTop: Math.max(0, target.offset().top - headerHeight + 1)
	        }, 500, 'swing', function () {
	            window.location.hash = targetHash;
	            $(document).on("scroll", onScroll);
	        });
	    });
	});

	function onScroll(){
	    var scrollPos = $(document).scrollTop() + ($('.header-area').outerHeight() || 0) + 1;
	    var activeLink = null;

	    $('.header-area .main-nav .nav > li > a').each(function () {
	        var href = this.getAttribute('href');
	        if (!href) {
	            return;
	        }

	        var targetUrl = new URL(href, window.location.href);
	        var targetPath = targetUrl.pathname.replace(/\/index\.html$/i, '/').replace(/\/$/, '');
	        var currentPath = window.location.pathname.replace(/\/index\.html$/i, '/').replace(/\/$/, '');
	        if (targetUrl.origin !== window.location.origin || targetPath !== currentPath) {
	            return;
	        }

	        var targetId = targetUrl.hash ? decodeURIComponent(targetUrl.hash.slice(1)) : 'top';
	        var targetSection = document.getElementById(targetId);
	        if (targetSection && $(targetSection).offset().top <= scrollPos) {
	            activeLink = this;
	        }
	    });

	    var navLinks = $('.header-area .main-nav .nav > li > a');
	    navLinks.removeClass('active');
	    if (activeLink) {
	        $(activeLink).addClass('active');
	    }
	}


	// Page loading animation
	 $(window).on('load', function() {

        $('#js-preloader').addClass('loaded');

    });


	// Window Resize Mobile Menu Fix
	$(window).on('resize', function() {
		mobileNav();
	});


	$('.maptech-mobile-submenu-toggle').on('click', function() {
		var toggle = $(this);
		var submenu = toggle.closest('.maptech-mega-item');
		var isExpanded = !submenu.hasClass('active');

		$('.maptech-mega-item').not(submenu).removeClass('active').children('ul').removeClass('active');
		$('.maptech-mobile-submenu-toggle').not(this)
			.removeClass('active bi-chevron-down').addClass('bi-chevron-right')
			.attr('aria-expanded', 'false');
		submenu.toggleClass('active', isExpanded).children('ul').toggleClass('active', isExpanded);
		toggle.toggleClass('active', isExpanded)
			.toggleClass('bi-chevron-down', isExpanded)
			.toggleClass('bi-chevron-right', !isExpanded)
			.attr('aria-expanded', isExpanded);
		toggle.attr('aria-label', (isExpanded ? 'Hide ' : 'Show ') + submenu.children('a').text().trim() + ' submenu');
	});

	$('.header-area .main-nav .nav > li > a').on('click', function() {
		var mainNav = $(this).closest('.main-nav');
		var menuToggle = mainNav.find('.menu-trigger');
		if ($(window).width() > 991 || !mainNav.hasClass('mobile-nav-open')) return;

		menuToggle.removeClass('active bi-x').addClass('bi-list')
			.attr('aria-expanded', 'false')
			.attr('aria-label', 'Open navigation');
		mainNav.removeClass('mobile-nav-open');
		mainNav.find('.nav').stop(true, true).slideUp(200);
		$('.maptech-mega-item').removeClass('active').children('ul').removeClass('active');
		$('.maptech-mobile-submenu-toggle').removeClass('active bi-chevron-down').addClass('bi-chevron-right')
			.attr('aria-expanded', 'false')
			.each(function() {
				$(this).attr('aria-label', 'Show ' + $(this).closest('.maptech-mega-item').children('a').text().trim() + ' submenu');
			});
	});

	// Window Resize Mobile Menu Fix
	function mobileNav() {
		if ($(window).width() >= 992) {
			$('.header-area .main-nav.maptech-standard-mobile-nav').each(function() {
				$(this).removeClass('mobile-nav-open');
				$(this).find('.nav').stop(true, true).css('display', '');
				$(this).find('.menu-trigger').removeClass('active bi-x').addClass('bi-list')
					.attr('aria-expanded', 'false')
					.attr('aria-label', 'Open navigation');
			});
			$('.submenu').removeClass('active').children('ul').removeClass('active');
			$('.maptech-mobile-submenu-toggle').removeClass('active bi-chevron-down').addClass('bi-chevron-right').attr('aria-expanded', 'false').each(function() {
				$(this).attr('aria-label', 'Show ' + $(this).closest('.maptech-mega-item').children('a').text().trim() + ' submenu');
			});
		}
	}


})(window.jQuery);