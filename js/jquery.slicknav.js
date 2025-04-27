;(function ($, document, window) {
    var defaults = {
        label: 'MENU',
        duplicate: true,
        duration: 200,
        easingOpen: 'swing',
        easingClose: 'swing',
        closedSymbol: '&#9658;',
        openedSymbol: '&#9660;',
        prependTo: 'body',
        parentTag: 'a',
        closeOnClick: false,
        allowParentLinks: false,
        nestedParentLinks: true,
        showChildren: false,
        removeIds: true,
        animations: 'jquery',
        init: function () {},
        beforeOpen: function () {},
        beforeClose: function () {},
        afterOpen: function () {},
        afterClose: function () {}
    };
    
    var mobileMenu = 'slicknav',
        prefix = 'slicknav';
    
    function Plugin(element, options) {
        this.element = element;
        this.settings = $.extend({}, defaults, options);
        if (!this.settings.duplicate && !options.hasOwnProperty("removeIds")) {
          this.settings.removeIds = false;
        }
        this._defaults = defaults;
        this._name = mobileMenu;
        this.init();
    }
    
    Plugin.prototype.init = function () {
        var $this = this,
            menu = $(this.element),
            settings = this.settings;
        
        if (settings.duplicate) {
            $this.mobileNav = menu.clone();
        } else {
            $this.mobileNav = menu;
        }

        if (settings.removeIds) {
          $this.mobileNav.removeAttr('id');
          $this.mobileNav.find('*').removeAttr('id');
        }
        
        $this.mobileNav.attr('class', prefix + '_nav');
        var menuBar = $('<div class="' + prefix + '_menu"></div>');
        $this.btn = $('<a aria-haspopup="true" role="button" tabindex="0" class="' + prefix + '_btn ' + prefix + '_collapsed">' +
            '<span class="' + prefix + '_menutxt">' + settings.label + '</span>' +
            '<span class="' + prefix + '_icon">' +
                '<span class="' + prefix + '_icon-bar"></span>'.repeat(3) +
            '</span>' +
        '</a>');
        
        menuBar.append($this.btn);
        $(settings.prependTo).prepend(menuBar);
        menuBar.append($this.mobileNav);

        var items = $this.mobileNav.find('li');
        $(items).each(function () {
            var item = $(this),
                data = {};
            data.children = item.children('ul').attr('role', 'menu');
            item.data('menu', data);

            if (data.children.length > 0) {
                item.addClass(prefix+'_parent');
                if (!settings.showChildren){
                    item.addClass(prefix+'_collapsed');
                } else {
                    item.addClass(prefix+'_open');
                }
            } else {
                item.addClass(prefix+'_txtnode');
            }
        });

        $this._visibilityToggle($this.mobileNav, null, false, 'init', true);

        $($this.btn).click(function (e) {
            e.preventDefault();
            $this._menuToggle();
        });
    };
    
    Plugin.prototype._menuToggle = function () {
        var $this = this;
        var btn = $this.btn;
        var mobileNav = $this.mobileNav;

        btn.toggleClass(prefix+'_collapsed '+prefix+'_open');
        $this._visibilityToggle(mobileNav, btn.parent(), true);
    };
    
    Plugin.prototype._itemClick = function (el) {
        var $this = this;
        var settings = $this.settings;
        var data = el.data('menu');

        if (!data) {
            data = {};
            data.arrow = el.children('.'+prefix+'_arrow');
            data.ul = el.next('ul');
            data.parent = el.parent();
            el.data('menu', data);
        }

        data.parent.toggleClass(prefix+'_collapsed '+prefix+'_open');
        $this._visibilityToggle(data.ul, data.parent, true, el);
    };
    
    Plugin.prototype._visibilityToggle = function(el, parent, animate, trigger, init) {
        var $this = this;
        var settings = $this.settings;
        var duration = animate ? settings.duration : 0;

        if (el.hasClass(prefix+'_hidden')) {
            el.removeClass(prefix+'_hidden');
            if (settings.animations === 'jquery') {
                el.slideDown(duration, settings.easingOpen);
            }
        } else {
            el.addClass(prefix+'_hidden');
            if (settings.animations === 'jquery') {
                el.slideUp(duration, settings.easingClose);
            }
        }
    };

    $.fn[mobileMenu] = function (options) {
        return this.each(function () {
            if (!$.data(this, 'plugin_' + mobileMenu)) {
                $.data(this, 'plugin_' + mobileMenu, new Plugin(this, options));
            }
        });
    };
}(jQuery, document, window));
