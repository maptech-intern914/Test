(function ($) {
	
	"use strict";

	function setTheme(isDark) {
		document.body.classList.toggle('dark-mode', isDark);
		var themeToggle = document.querySelector('.theme-toggle');
		var header = document.querySelector('.header-area');
		if (header) {
			header.style.setProperty('background', isDark ? 'rgba(17, 19, 21, .86)' : '', 'important');
			header.style.setProperty('background-color', isDark ? 'rgba(17, 19, 21, .86)' : '', 'important');
		}
		if (!themeToggle) {
			return;
		}

		themeToggle.classList.toggle('bi-sun', isDark);
		themeToggle.classList.toggle('bi-moon-stars', !isDark);
		themeToggle.style.setProperty('color', isDark ? '#f7d56b' : '#232d39', 'important');
		var isMobile = window.matchMedia('(max-width: 991px)').matches;
		themeToggle.style.setProperty('background-color', isMobile ? 'transparent' : (isDark ? '#42484b' : '#ffffff'), 'important');
		themeToggle.style.setProperty('border-color', isMobile ? 'transparent' : (isDark ? '#687176' : '#d7ddd8'), 'important');
		themeToggle.style.setProperty('box-shadow', isMobile ? 'none' : '', 'important');
		var backToTop = document.getElementById('header') && document.querySelector('.back-to-top');
		if (backToTop) {
			backToTop.style.setProperty('right', isMobile ? '' : '24px', 'important');
			backToTop.style.setProperty('bottom', isMobile ? '' : '84px', 'important');
		}
		document.querySelectorAll('#tabs ul li a').forEach(function (categoryLink) {
			categoryLink.style.setProperty('background', isDark ? '#3a4043' : '', 'important');
			categoryLink.style.setProperty('background-color', isDark ? '#3a4043' : '', 'important');
			categoryLink.style.setProperty('color', isDark ? '#edf0f1' : '', 'important');
		});
		themeToggle.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
		themeToggle.setAttribute('title', isDark ? 'Switch to light mode' : 'Switch to dark mode');
		themeToggle.setAttribute('aria-pressed', isDark);
	}

	function setupThemeToggle() {
		var mainNav = document.querySelector('.header-area .main-nav');
		if (!mainNav || document.querySelector('.theme-toggle')) {
			return;
		}

		var themeToggle = document.createElement('button');
		themeToggle.type = 'button';
		themeToggle.className = 'theme-toggle bi bi-moon-stars';
		themeToggle.setAttribute('aria-pressed', 'false');
		mainNav.appendChild(themeToggle);

		var savedTheme = window.localStorage.getItem('maptech-theme');
		setTheme(savedTheme === 'dark');
		themeToggle.addEventListener('click', function () {
			var isDark = !document.body.classList.contains('dark-mode');
			setTheme(isDark);
			window.localStorage.setItem('maptech-theme', isDark ? 'dark' : 'light');
		});
	}

	if (!document.querySelector('link[href*="bootstrap-icons.css"]')) {
		var iconStylesheet = document.createElement('link');
		iconStylesheet.rel = 'stylesheet';
		iconStylesheet.href = new URL('../../assets2/vendor/bootstrap-icons/bootstrap-icons.css', document.currentScript.src).href;
		document.head.append(iconStylesheet);
	}

	var themeStylesheet = document.createElement('link');
	themeStylesheet.rel = 'stylesheet';
	themeStylesheet.href = new URL('../css/dark-mode.css', document.currentScript.src).href;
	document.head.appendChild(themeStylesheet);
	setupThemeToggle();
	if (!window.jQuery) {
		return;
	}

	var usesStandardMobileNav = /\/(cybersecurity|data-infrastructure|it-peripherals|computing-devices)\.html$/i.test(window.location.pathname) || /\/products\/.+\/index\.html$/i.test(window.location.pathname);
	var standardNav = document.querySelector('.header-area .main-nav');
	if (usesStandardMobileNav && standardNav) {
		standardNav.classList.add('maptech-standard-mobile-nav');
		var legacyMenuTrigger = standardNav.querySelector('.menu-trigger');
		if (legacyMenuTrigger && legacyMenuTrigger.tagName !== 'BUTTON') {
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