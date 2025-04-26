(function ($, document, window) {
    const defaults = {
        label: 'MENU',
        duplicate: true,
        duration: 200,
        easingOpen: 'swing',
        easingClose: 'swing',
        closedSymbol: '&#9658;',
        openedSymbol: '&#9660;',
        prependTo: 'body',
        appendTo: '',
        parentTag: 'a',
        closeOnClick: false,
        allowParentLinks: false,
        nestedParentLinks: true,
        showChildren: false,
        removeIds: true,
        removeClasses: false,
        removeStyles: false,
        brand: '',
        animations: 'jquery',
        init() {},
        beforeOpen() {},
        beforeClose() {},
        afterOpen() {},
        afterClose() {}
    };

    const prefix = 'slicknav',
          keyboard = { DOWN: 40, ENTER: 13, ESC: 27, LEFT: 37, RIGHT: 39, SPACE: 32, UP: 38 };

    function Plugin(el, options) {
        this.element = el;
        this.settings = $.extend({}, defaults, options);
        if (!this.settings.duplicate && !options.hasOwnProperty("removeIds")) {
            this.settings.removeIds = false;
        }
        this._name = prefix;
        this.init();
    }

    Plugin.prototype.init = function () {
        const self = this;
        const s = this.settings;
        const menu = $(this.element);
        const menuClone = s.duplicate ? menu.clone() : menu;

        ['id', 'class', 'style'].forEach(attr => {
            if (s['remove' + attr.charAt(0).toUpperCase() + attr.slice(1)]) {
                menuClone.removeAttr(attr).find('*').removeAttr(attr);
            }
        });

        menuClone.attr('class', prefix + '_nav');
        const menuBar = $('<div>', { class: prefix + '_menu' });

        if (s.brand) menuBar.append($('<div>', { class: prefix + '_brand', html: s.brand }));

        const btn = $(`
            <${s.parentTag === 'a' ? 'a href="#"' : s.parentTag}
                aria-haspopup="true" role="button" tabindex="0"
                class="${prefix}_btn ${prefix}_collapsed">
                <span class="${prefix}_menutxt">${s.label}</span>
                <span class="${prefix}_icon ${!s.label ? prefix + '_no-text' : ''}">
                    <span class="${prefix}_icon-bar"></span>
                    <span class="${prefix}_icon-bar"></span>
                    <span class="${prefix}_icon-bar"></span>
                </span>
            </${s.parentTag}>
        `);

        menuBar.append(btn);
        $(s.appendTo || s.prependTo).prepend(menuBar);
        menuBar.append(menuClone);

        const items = menuClone.find('li');

        items.each(function () {
            const item = $(this);
            const children = item.children('ul').attr('role', 'menu');
            item.data('menu', { children });

            if (children.length) {
                const nodes = item.contents().filter((_, el) => !$(el).is('ul'));
                const hasAnchor = nodes.is('a');
                const wrapEl = $(`<${s.parentTag} role="menuitem" aria-haspopup="true" tabindex="-1" class="${prefix}_item"/>`);

                if ((!s.allowParentLinks || s.nestedParentLinks) || !hasAnchor) {
                    nodes.wrapAll(wrapEl).parent().addClass(prefix + '_row');
                } else {
                    nodes.wrapAll(`<span class="${prefix}_parent-link ${prefix}_row"/>`);
                }

                item.addClass(s.showChildren ? prefix + '_open' : prefix + '_collapsed')
                    .addClass(prefix + '_parent');

                let arrow = $(`<span class="${prefix}_arrow">${s.showChildren ? s.openedSymbol : s.closedSymbol}</span>`);
                if (s.allowParentLinks && !s.nestedParentLinks && hasAnchor) {
                    arrow = arrow.wrap(wrapEl).parent();
                }
                nodes.last().after(arrow);
            } else if (!item.children().length) {
                item.addClass(prefix + '_txtnode');
            }

            // Accessibility
            item.children('a').attr('role', 'menuitem').on('click', function (e) {
                if (s.closeOnClick && !item.hasClass(prefix + '_parent')) btn.trigger('click');
            });

            if (s.closeOnClick && s.allowParentLinks) {
                item.find('.' + prefix + '_parent-link a:not(.' + prefix + '_item)').on('click', () => btn.trigger('click'));
            }
        });

        items.each(function () {
            const children = $(this).data('menu').children;
            if (!s.showChildren) self._visibilityToggle(children, null, false, null, true);
        });

        self._visibilityToggle(menuClone, null, false, 'init', true);
        menuClone.attr('role', 'menu');

        $(document).on('mousedown', () => self._outlines(false))
                   .on('keyup', () => self._outlines(true));

        btn.on('click', e => { e.preventDefault(); self._menuToggle(); });

        menuClone.on('click', `.${prefix}_item`, e => {
            e.preventDefault();
            self._itemClick($(e.currentTarget));
        });

        btn.on('keydown', e => {
            if ([keyboard.ENTER, keyboard.SPACE, keyboard.DOWN].includes(e.keyCode)) {
                e.preventDefault();
                if (e.keyCode !== keyboard.DOWN || !btn.hasClass(prefix + '_open')) self._menuToggle();
                menuClone.find('[role="menuitem"]').first().focus();
            }
        });

        menuClone.on('keydown', '.' + prefix + '_item', function (e) {
            const el = $(e.target);
            if (e.keyCode === keyboard.ENTER) {
                e.preventDefault();
                self._itemClick(el);
            } else if (e.keyCode === keyboard.RIGHT && el.parent().hasClass(prefix + '_collapsed')) {
                e.preventDefault();
                self._itemClick(el);
                el.next().find('[role="menuitem"]').first().focus();
            }
        });

        menuClone.on('keydown', '[role="menuitem"]', function (e) {
            const items = $(e.target).closest('ul').find('[role="menuitem"]:visible');
            const idx = items.index(e.target);

            switch (e.keyCode) {
                case keyboard.DOWN:
                    e.preventDefault();
                    items.eq((idx + 1) % items.length).focus();
                    break;
                case keyboard.UP:
                    e.preventDefault();
                    items.eq((idx - 1 + items.length) % items.length).focus();
                    break;
                case keyboard.LEFT:
                    e.preventDefault();
                    const parent = $(e.target).closest('ul').closest('li');
                    if (parent.hasClass(prefix + '_open')) {
                        const trigger = parent.find('> .' + prefix + '_item');
                        trigger.focus();
                        self._itemClick(trigger);
                    } else {
                        self._menuToggle();
                        btn.focus();
                    }
                    break;
                case keyboard.ESC:
                    e.preventDefault();
                    self._menuToggle();
                    btn.focus();
                    break;
            }
        });
    };

    // Dummy methods for _menuToggle, _itemClick, _visibilityToggle, _outlines
    Plugin.prototype._menuToggle = function () { /* toggle logic */ };
    Plugin.prototype._itemClick = function (el) { /* item click logic */ };
    Plugin.prototype._visibilityToggle = function (el, animate, visible, trigger, init) { /* toggle visibility */ };
    Plugin.prototype._outlines = function (enable) { /* outline logic */ };

    $.fn.slicknav = function (options) {
        return this.each(function () {
            if (!$.data(this, 'plugin_' + prefix)) {
                $.data(this, 'plugin_' + prefix, new Plugin(this, options));
            }
        });
    };
}(jQuery, document, window));
