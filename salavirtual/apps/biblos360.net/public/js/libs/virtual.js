var FORMALIZE = function(a, b, c) {
    function d(a) {
        var b = c.createElement("b");
        return b.innerHTML = "<!--[if IE " + a + "]><br><![endif]-->",
        !!b.getElementsByTagName("br").length
    }
    var e = "placeholder"in c.createElement("input")
      , f = "autofocus"in c.createElement("input")
      , g = d(6)
      , h = d(7);
    return {
        go: function() {
            var a, b = this.init;
            for (a in b)
                b.hasOwnProperty(a) && b[a]()
        },
        init: {
            full_input_size: function() {
                h && a("textarea, input.input_full").length && a("textarea, input.input_full").wrap('<span class="input_full_wrap"></span>')
            },
            ie6_skin_inputs: function() {
                if (g && a("input, select, textarea").length) {
                    var b = /button|submit|reset/
                      , c = /date|datetime|datetime-local|email|month|number|password|range|search|tel|text|time|url|week/;
                    a("input").each(function() {
                        var d = a(this);
                        this.getAttribute("type").match(b) ? (d.addClass("ie6_button"),
                        this.disabled && d.addClass("ie6_button_disabled")) : this.getAttribute("type").match(c) && (d.addClass("ie6_input"),
                        this.disabled && d.addClass("ie6_input_disabled"))
                    }),
                    a("textarea, select").each(function() {
                        this.disabled && a(this).addClass("ie6_input_disabled")
                    })
                }
            },
            autofocus: function() {
                f || !a(":input[autofocus]").length || a(":input[autofocus]:visible:first").focus()
            },
            placeholder: function() {
                !e && !!a(":input[placeholder]").length && (FORMALIZE.misc.add_placeholder(),
                a(":input[placeholder]").each(function() {
                    if (this.type !== "password") {
                        var b = a(this)
                          , c = b.attr("placeholder");
                        b.focus(function() {
                            b.val() === c && b.val("").removeClass("placeholder_text")
                        }).blur(function() {
                            FORMALIZE.misc.add_placeholder()
                        }),
                        b.closest("form").submit(function() {
                            b.val() === c && b.val("").removeClass("placeholder_text")
                        }).bind("reset", function() {
                            setTimeout(FORMALIZE.misc.add_placeholder, 50)
                        })
                    }
                }))
            }
        },
        misc: {
            add_placeholder: function() {
                e || !a(":input[placeholder]").length || a(":input[placeholder]").each(function() {
                    if (this.type !== "password") {
                        var b = a(this)
                          , c = b.attr("placeholder");
                        (!b.val() || b.val() === c) && b.val(c).addClass("placeholder_text")
                    }
                })
            }
        }
    }
}(jQuery, this, this.document);
jQuery(document).ready(function() {
    FORMALIZE.go()
});
!function($) {
    "use strict";
    $.browser || ($.browser = {},
    $.browser.mozilla = /mozilla/.test(navigator.userAgent.toLowerCase()) && !/webkit/.test(navigator.userAgent.toLowerCase()),
    $.browser.webkit = /webkit/.test(navigator.userAgent.toLowerCase()),
    $.browser.opera = /opera/.test(navigator.userAgent.toLowerCase()),
    $.browser.msie = /msie/.test(navigator.userAgent.toLowerCase()));
    var a = {
        destroy: function() {
            return $(this).unbind(".maskMoney"),
            $.browser.msie && (this.onpaste = null),
            this
        },
        mask: function(a) {
            return this.each(function() {
                var b, c = $(this);
                return "number" == typeof a && (c.trigger("mask"),
                b = $(c.val().split(/\D/)).last()[0].length,
                a = a.toFixed(b),
                c.val(a)),
                c.trigger("mask")
            })
        },
        unmasked: function() {
            return this.map(function() {
                var a, b = $(this).val() || "0", c = -1 !== b.indexOf("-");
                return $(b.split(/\D/).reverse()).each(function(b, c) {
                    return c ? (a = c,
                    !1) : void 0
                }),
                b = b.replace(/\D/g, ""),
                b = b.replace(new RegExp(a + "$"), "." + a),
                c && (b = "-" + b),
                parseFloat(b)
            })
        },
        init: function(a) {
            return a = $.extend({
                prefix: "",
                suffix: "",
                affixesStay: !0,
                thousands: ",",
                decimal: ".",
                precision: 2,
                allowZero: !1,
                allowNegative: !1
            }, a),
            this.each(function() {
                function b() {
                    var a, b, c, d, e, f = s.get(0), g = 0, h = 0;
                    return "number" == typeof f.selectionStart && "number" == typeof f.selectionEnd ? (g = f.selectionStart,
                    h = f.selectionEnd) : (b = document.selection.createRange(),
                    b && b.parentElement() === f && (d = f.value.length,
                    a = f.value.replace(/\r\n/g, "\n"),
                    c = f.createTextRange(),
                    c.moveToBookmark(b.getBookmark()),
                    e = f.createTextRange(),
                    e.collapse(!1),
                    c.compareEndPoints("StartToEnd", e) > -1 ? g = h = d : (g = -c.moveStart("character", -d),
                    g += a.slice(0, g).split("\n").length - 1,
                    c.compareEndPoints("EndToEnd", e) > -1 ? h = d : (h = -c.moveEnd("character", -d),
                    h += a.slice(0, h).split("\n").length - 1)))),
                    {
                        start: g,
                        end: h
                    }
                }
                function c() {
                    var a = !(s.val().length >= s.attr("maxlength") && s.attr("maxlength") >= 0)
                      , c = b()
                      , d = c.start
                      , e = c.end
                      , f = c.start !== c.end && s.val().substring(d, e).match(/\d/) ? !0 : !1
                      , g = "0" === s.val().substring(0, 1);
                    return a || f || g
                }
                function d(a) {
                    s.each(function(b, c) {
                        if (c.setSelectionRange)
                            c.focus(),
                            c.setSelectionRange(a, a);
                        else if (c.createTextRange) {
                            var d = c.createTextRange();
                            d.collapse(!0),
                            d.moveEnd("character", a),
                            d.moveStart("character", a),
                            d.select()
                        }
                    })
                }
                function e(b) {
                    var c = "";
                    return b.indexOf("-") > -1 && (b = b.replace("-", ""),
                    c = "-"),
                    c + a.prefix + b + a.suffix
                }
                function f(b) {
                    var c, d, f, g = b.indexOf("-") > -1 && a.allowNegative ? "-" : "", h = b.replace(/[^0-9]/g, ""), i = h.slice(0, h.length - a.precision);
                    return i = i.replace(/^0*/g, ""),
                    i = i.replace(/\B(?=(\d{3})+(?!\d))/g, a.thousands),
                    "" === i && (i = "0"),
                    c = g + i,
                    a.precision > 0 && (d = h.slice(h.length - a.precision),
                    f = new Array(a.precision + 1 - d.length).join(0),
                    c += a.decimal + f + d),
                    e(c)
                }
                function g(a) {
                    var b, c = s.val().length;
                    s.val(f(s.val())),
                    b = s.val().length,
                    a -= c - b,
                    d(a)
                }
                function h() {
                    var a = s.val();
                    s.val(f(a))
                }
                function i() {
                    var b = s.val();
                    return a.allowNegative ? "" !== b && "-" === b.charAt(0) ? b.replace("-", "") : "-" + b : b
                }
                function j(a) {
                    a.preventDefault ? a.preventDefault() : a.returnValue = !1
                }
                function k(a) {
                    a = a || window.event;
                    var d, e, f, h, k, l = a.which || a.charCode || a.keyCode;
                    return void 0 === l ? !1 : 48 > l || l > 57 ? 45 === l ? (s.val(i()),
                    !1) : 43 === l ? (s.val(s.val().replace("-", "")),
                    !1) : 13 === l || 9 === l ? !0 : !$.browser.mozilla || 37 !== l && 39 !== l || 0 !== a.charCode ? (j(a),
                    !0) : !0 : c() ? (j(a),
                    d = String.fromCharCode(l),
                    e = b(),
                    f = e.start,
                    h = e.end,
                    k = s.val(),
                    s.val(k.substring(0, f) + d + k.substring(h, k.length)),
                    g(f + 1),
                    !1) : !1
                }
                function l(c) {
                    c = c || window.event;
                    var d, e, f, h, i, k = c.which || c.charCode || c.keyCode;
                    return void 0 === k ? !1 : (d = b(),
                    e = d.start,
                    f = d.end,
                    8 === k || 46 === k || 63272 === k ? (j(c),
                    h = s.val(),
                    e === f && (8 === k ? "" === a.suffix ? e -= 1 : (i = h.split("").reverse().join("").search(/\d/),
                    e = h.length - i - 1,
                    f = e + 1) : f += 1),
                    s.val(h.substring(0, e) + h.substring(f, h.length)),
                    g(e),
                    !1) : 9 === k ? !0 : !0)
                }
                function m() {
                    r = s.val(),
                    h();
                    var a, b = s.get(0);
                    b.createTextRange && (a = b.createTextRange(),
                    a.collapse(!1),
                    a.select())
                }
                function n() {
                    setTimeout(function() {
                        h()
                    }, 0)
                }
                function o() {
                    var b = parseFloat("0") / Math.pow(10, a.precision);
                    return b.toFixed(a.precision).replace(new RegExp("\\.","g"), a.decimal)
                }
                function p(b) {
                    if ($.browser.msie && k(b),
                    "" === s.val() || s.val() === e(o()))
                        a.allowZero ? a.affixesStay ? s.val(e(o())) : s.val(o()) : s.val("");
                    else if (!a.affixesStay) {
                        var c = s.val().replace(a.prefix, "").replace(a.suffix, "");
                        s.val(c)
                    }
                    s.val() !== r && s.change()
                }
                function q() {
                    var a, b = s.get(0);
                    b.setSelectionRange ? (a = s.val().length,
                    b.setSelectionRange(a, a)) : s.val(s.val())
                }
                var r, s = $(this);
                a = $.extend(a, s.data()),
                s.unbind(".maskMoney"),
                s.bind("keypress.maskMoney", k),
                s.bind("keydown.maskMoney", l),
                s.bind("blur.maskMoney", p),
                s.bind("focus.maskMoney", m),
                s.bind("click.maskMoney", q),
                s.bind("cut.maskMoney", n),
                s.bind("paste.maskMoney", n),
                s.bind("mask.maskMoney", h)
            })
        }
    };
    $.fn.maskMoney = function(b) {
        return a[b] ? a[b].apply(this, Array.prototype.slice.call(arguments, 1)) : "object" != typeof b && b ? ($.error("Method " + b + " does not exist on jQuery.maskMoney"),
        void 0) : a.init.apply(this, arguments)
    }
}(window.jQuery || window.Zepto);
;if (jQuery)
    (function($) {
        'use strict';
        var modal;
        var overlay;
        var okButton;
        var cancelButton;
        var activeElement;
        function show(type, message, options) {
            var defer = $.Deferred();
            activeElement = document.activeElement;
            activeElement.blur();
            $(modal).add(overlay).remove();
            options = $.extend({}, $.alertable.defaults, options);
            modal = $(options.modal).hide();
            overlay = $(options.overlay).hide();
            okButton = $(options.okButton);
            cancelButton = $(options.cancelButton);
            if (options.html) {
                modal.find('.alertable-message').html(message);
            } else {
                modal.find('.alertable-message').text(message);
            }
            if (type === 'prompt') {
                modal.find('.alertable-prompt').html(options.prompt);
            } else {
                modal.find('.alertable-prompt').remove();
            }
            $(modal).find('.alertable-buttons').append(type === 'alert' ? '' : cancelButton).append(okButton);
            $(options.container).append(overlay).append(modal);
            options.show.call({
                modal: modal,
                overlay: overlay
            });
            if (type === 'prompt') {
                $(modal).find('.alertable-prompt :input:first').focus();
            } else {
                $(modal).find(':input[type="submit"]').focus();
            }
            $(modal).on('submit.alertable', function(event) {
                var i;
                var formData;
                var values = [];
                event.preventDefault();
                if (type === 'prompt') {
                    formData = $(modal).serializeArray();
                    for (i = 0; i < formData.length; i++) {
                        values[formData[i].name] = formData[i].value;
                    }
                } else {
                    values = null;
                }
                hide(options);
                defer.resolve(values);
            });
            cancelButton.on('click.alertable', function() {
                hide(options);
                defer.reject();
            });
            $(document).on('keydown.alertable', function(event) {
                if (event.keyCode === 27) {
                    event.preventDefault();
                    hide(options);
                    defer.reject();
                }
            });
            $(document).on('focus.alertable', '*', function(event) {
                if (!$(event.target).parents().is('.alertable')) {
                    event.stopPropagation();
                    event.target.blur();
                    $(modal).find(':input:first').focus();
                }
            });
            return defer.promise();
        }
        function hide(options) {
            options.hide.call({
                modal: modal,
                overlay: overlay
            });
            $(document).off('.alertable');
            modal.off('.alertable');
            cancelButton.off('.alertable');
            activeElement.focus();
        }
        $.alertable = {
            alert: function(message, options) {
                return show('alert', message, options);
            },
            confirm: function(message, options) {
                return show('confirm', message, options);
            },
            prompt: function(message, options) {
                return show('prompt', message, options);
            },
            defaults: {
                container: 'body',
                html: false,
                cancelButton: '<button class="alertable-cancel" type="button">Cancel</button>',
                okButton: '<button class="alertable-ok" type="submit">OK</button>',
                overlay: '<div class="alertable-overlay"></div>',
                prompt: '<input class="alertable-input" type="text" name="value">',
                modal: '<form class="alertable">' + '<div class="alertable-message"></div>' + '<div class="alertable-prompt"></div>' + '<div class="alertable-buttons"></div>' + '</form>',
                hide: function() {
                    $(this.modal).add(this.overlay).fadeOut(100);
                },
                show: function() {
                    $(this.modal).add(this.overlay).fadeIn(100);
                }
            }
        };
    }
    )(jQuery);
;/* markdown-it 11.0.0 https://github.com//markdown-it/markdown-it @license MIT */
(function(f) {
    if (typeof exports === "object" && typeof module !== "undefined") {
        module.exports = f()
    } else if (typeof define === "function" && define.amd) {
        define([], f)
    } else {
        var g;
        if (typeof window !== "undefined") {
            g = window
        } else if (typeof global !== "undefined") {
            g = global
        } else if (typeof self !== "undefined") {
            g = self
        } else {
            g = this
        }
        g.markdownit = f()
    }
}
)(function() {
    var define, module, exports;
    return (function() {
        function r(e, n, t) {
            function o(i, f) {
                if (!n[i]) {
                    if (!e[i]) {
                        var c = "function" == typeof require && require;
                        if (!f && c)
                            return c(i, !0);
                        if (u)
                            return u(i, !0);
                        var a = new Error("Cannot find module '" + i + "'");
                        throw a.code = "MODULE_NOT_FOUND",
                        a
                    }
                    var p = n[i] = {
                        exports: {}
                    };
                    e[i][0].call(p.exports, function(r) {
                        var n = e[i][1][r];
                        return o(n || r)
                    }, p, p.exports, r, e, n, t)
                }
                return n[i].exports
            }
            for (var u = "function" == typeof require && require, i = 0; i < t.length; i++)
                o(t[i]);
            return o
        }
        return r
    }
    )()({
        1: [function(require, module, exports) {
            'use strict';
            module.exports = require('entities/lib/maps/entities.json');
        }
        , {
            "entities/lib/maps/entities.json": 52
        }],
        2: [function(require, module, exports) {
            'use strict';
            module.exports = ['address', 'article', 'aside', 'base', 'basefont', 'blockquote', 'body', 'caption', 'center', 'col', 'colgroup', 'dd', 'details', 'dialog', 'dir', 'div', 'dl', 'dt', 'fieldset', 'figcaption', 'figure', 'footer', 'form', 'frame', 'frameset', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'head', 'header', 'hr', 'html', 'iframe', 'legend', 'li', 'link', 'main', 'menu', 'menuitem', 'meta', 'nav', 'noframes', 'ol', 'optgroup', 'option', 'p', 'param', 'section', 'source', 'summary', 'table', 'tbody', 'td', 'tfoot', 'th', 'thead', 'title', 'tr', 'track', 'ul'];
        }
        , {}],
        3: [function(require, module, exports) {
            'use strict';
            var attr_name = '[a-zA-Z_:][a-zA-Z0-9:._-]*';
            var unquoted = '[^"\'=<>`\\x00-\\x20]+';
            var single_quoted = "'[^']*'";
            var double_quoted = '"[^"]*"';
            var attr_value = '(?:' + unquoted + '|' + single_quoted + '|' + double_quoted + ')';
            var attribute = '(?:\\s+' + attr_name + '(?:\\s*=\\s*' + attr_value + ')?)';
            var open_tag = '<[A-Za-z][A-Za-z0-9\\-]*' + attribute + '*\\s*\\/?>';
            var close_tag = '<\\/[A-Za-z][A-Za-z0-9\\-]*\\s*>';
            var comment = '<!---->|<!--(?:-?[^>-])(?:-?[^-])*-->';
            var processing = '<[?].*?[?]>';
            var declaration = '<![A-Z]+\\s+[^>]*>';
            var cdata = '<!\\[CDATA\\[[\\s\\S]*?\\]\\]>';
            var HTML_TAG_RE = new RegExp('^(?:' + open_tag + '|' + close_tag + '|' + comment + '|' + processing + '|' + declaration + '|' + cdata + ')');
            var HTML_OPEN_CLOSE_TAG_RE = new RegExp('^(?:' + open_tag + '|' + close_tag + ')');
            module.exports.HTML_TAG_RE = HTML_TAG_RE;
            module.exports.HTML_OPEN_CLOSE_TAG_RE = HTML_OPEN_CLOSE_TAG_RE;
        }
        , {}],
        4: [function(require, module, exports) {
            'use strict';
            function _class(obj) {
                return Object.prototype.toString.call(obj);
            }
            function isString(obj) {
                return _class(obj) === '[object String]';
            }
            var _hasOwnProperty = Object.prototype.hasOwnProperty;
            function has(object, key) {
                return _hasOwnProperty.call(object, key);
            }
            function assign(obj) {
                var sources = Array.prototype.slice.call(arguments, 1);
                sources.forEach(function(source) {
                    if (!source) {
                        return;
                    }
                    if (typeof source !== 'object') {
                        throw new TypeError(source + 'must be object');
                    }
                    Object.keys(source).forEach(function(key) {
                        obj[key] = source[key];
                    });
                });
                return obj;
            }
            function arrayReplaceAt(src, pos, newElements) {
                return [].concat(src.slice(0, pos), newElements, src.slice(pos + 1));
            }
            function isValidEntityCode(c) {
                if (c >= 0xD800 && c <= 0xDFFF) {
                    return false;
                }
                if (c >= 0xFDD0 && c <= 0xFDEF) {
                    return false;
                }
                if ((c & 0xFFFF) === 0xFFFF || (c & 0xFFFF) === 0xFFFE) {
                    return false;
                }
                if (c >= 0x00 && c <= 0x08) {
                    return false;
                }
                if (c === 0x0B) {
                    return false;
                }
                if (c >= 0x0E && c <= 0x1F) {
                    return false;
                }
                if (c >= 0x7F && c <= 0x9F) {
                    return false;
                }
                if (c > 0x10FFFF) {
                    return false;
                }
                return true;
            }
            function fromCodePoint(c) {
                if (c > 0xffff) {
                    c -= 0x10000;
                    var surrogate1 = 0xd800 + (c >> 10)
                      , surrogate2 = 0xdc00 + (c & 0x3ff);
                    return String.fromCharCode(surrogate1, surrogate2);
                }
                return String.fromCharCode(c);
            }
            var UNESCAPE_MD_RE = /\\([!"#$%&'()*+,\-.\/:;<=>?@[\\\]^_`{|}~])/g;
            var ENTITY_RE = /&([a-z#][a-z0-9]{1,31});/gi;
            var UNESCAPE_ALL_RE = new RegExp(UNESCAPE_MD_RE.source + '|' + ENTITY_RE.source,'gi');
            var DIGITAL_ENTITY_TEST_RE = /^#((?:x[a-f0-9]{1,8}|[0-9]{1,8}))/i;
            var entities = require('./entities');
            function replaceEntityPattern(match, name) {
                var code = 0;
                if (has(entities, name)) {
                    return entities[name];
                }
                if (name.charCodeAt(0) === 0x23 && DIGITAL_ENTITY_TEST_RE.test(name)) {
                    code = name[1].toLowerCase() === 'x' ? parseInt(name.slice(2), 16) : parseInt(name.slice(1), 10);
                    if (isValidEntityCode(code)) {
                        return fromCodePoint(code);
                    }
                }
                return match;
            }
            function unescapeMd(str) {
                if (str.indexOf('\\') < 0) {
                    return str;
                }
                return str.replace(UNESCAPE_MD_RE, '$1');
            }
            function unescapeAll(str) {
                if (str.indexOf('\\') < 0 && str.indexOf('&') < 0) {
                    return str;
                }
                return str.replace(UNESCAPE_ALL_RE, function(match, escaped, entity) {
                    if (escaped) {
                        return escaped;
                    }
                    return replaceEntityPattern(match, entity);
                });
            }
            var HTML_ESCAPE_TEST_RE = /[&<>"]/;
            var HTML_ESCAPE_REPLACE_RE = /[&<>"]/g;
            var HTML_REPLACEMENTS = {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;'
            };
            function replaceUnsafeChar(ch) {
                return HTML_REPLACEMENTS[ch];
            }
            function escapeHtml(str) {
                if (HTML_ESCAPE_TEST_RE.test(str)) {
                    return str.replace(HTML_ESCAPE_REPLACE_RE, replaceUnsafeChar);
                }
                return str;
            }
            var REGEXP_ESCAPE_RE = /[.?*+^$[\]\\(){}|-]/g;
            function escapeRE(str) {
                return str.replace(REGEXP_ESCAPE_RE, '\\$&');
            }
            function isSpace(code) {
                switch (code) {
                case 0x09:
                case 0x20:
                    return true;
                }
                return false;
            }
            function isWhiteSpace(code) {
                if (code >= 0x2000 && code <= 0x200A) {
                    return true;
                }
                switch (code) {
                case 0x09:
                case 0x0A:
                case 0x0B:
                case 0x0C:
                case 0x0D:
                case 0x20:
                case 0xA0:
                case 0x1680:
                case 0x202F:
                case 0x205F:
                case 0x3000:
                    return true;
                }
                return false;
            }
            var UNICODE_PUNCT_RE = require('uc.micro/categories/P/regex');
            function isPunctChar(ch) {
                return UNICODE_PUNCT_RE.test(ch);
            }
            function isMdAsciiPunct(ch) {
                switch (ch) {
                case 0x21:
                case 0x22:
                case 0x23:
                case 0x24:
                case 0x25:
                case 0x26:
                case 0x27:
                case 0x28:
                case 0x29:
                case 0x2A:
                case 0x2B:
                case 0x2C:
                case 0x2D:
                case 0x2E:
                case 0x2F:
                case 0x3A:
                case 0x3B:
                case 0x3C:
                case 0x3D:
                case 0x3E:
                case 0x3F:
                case 0x40:
                case 0x5B:
                case 0x5C:
                case 0x5D:
                case 0x5E:
                case 0x5F:
                case 0x60:
                case 0x7B:
                case 0x7C:
                case 0x7D:
                case 0x7E:
                    return true;
                default:
                    return false;
                }
            }
            function normalizeReference(str) {
                str = str.trim().replace(/\s+/g, ' ');
                if ('ẞ'.toLowerCase() === 'Ṿ') {
                    str = str.replace(/ẞ/g, 'ß');
                }
                return str.toLowerCase().toUpperCase();
            }
            exports.lib = {};
            exports.lib.mdurl = require('mdurl');
            exports.lib.ucmicro = require('uc.micro');
            exports.assign = assign;
            exports.isString = isString;
            exports.has = has;
            exports.unescapeMd = unescapeMd;
            exports.unescapeAll = unescapeAll;
            exports.isValidEntityCode = isValidEntityCode;
            exports.fromCodePoint = fromCodePoint;
            exports.escapeHtml = escapeHtml;
            exports.arrayReplaceAt = arrayReplaceAt;
            exports.isSpace = isSpace;
            exports.isWhiteSpace = isWhiteSpace;
            exports.isMdAsciiPunct = isMdAsciiPunct;
            exports.isPunctChar = isPunctChar;
            exports.escapeRE = escapeRE;
            exports.normalizeReference = normalizeReference;
        }
        , {
            "./entities": 1,
            "mdurl": 58,
            "uc.micro": 65,
            "uc.micro/categories/P/regex": 63
        }],
        5: [function(require, module, exports) {
            'use strict';
            exports.parseLinkLabel = require('./parse_link_label');
            exports.parseLinkDestination = require('./parse_link_destination');
            exports.parseLinkTitle = require('./parse_link_title');
        }
        , {
            "./parse_link_destination": 6,
            "./parse_link_label": 7,
            "./parse_link_title": 8
        }],
        6: [function(require, module, exports) {
            'use strict';
            var unescapeAll = require('../common/utils').unescapeAll;
            module.exports = function parseLinkDestination(str, pos, max) {
                var code, level, lines = 0, start = pos, result = {
                    ok: false,
                    pos: 0,
                    lines: 0,
                    str: ''
                };
                if (str.charCodeAt(pos) === 0x3C) {
                    pos++;
                    while (pos < max) {
                        code = str.charCodeAt(pos);
                        if (code === 0x0A) {
                            return result;
                        }
                        if (code === 0x3E) {
                            result.pos = pos + 1;
                            result.str = unescapeAll(str.slice(start + 1, pos));
                            result.ok = true;
                            return result;
                        }
                        if (code === 0x5C && pos + 1 < max) {
                            pos += 2;
                            continue;
                        }
                        pos++;
                    }
                    return result;
                }
                level = 0;
                while (pos < max) {
                    code = str.charCodeAt(pos);
                    if (code === 0x20) {
                        break;
                    }
                    if (code < 0x20 || code === 0x7F) {
                        break;
                    }
                    if (code === 0x5C && pos + 1 < max) {
                        pos += 2;
                        continue;
                    }
                    if (code === 0x28) {
                        level++;
                    }
                    if (code === 0x29) {
                        if (level === 0) {
                            break;
                        }
                        level--;
                    }
                    pos++;
                }
                if (start === pos) {
                    return result;
                }
                if (level !== 0) {
                    return result;
                }
                result.str = unescapeAll(str.slice(start, pos));
                result.lines = lines;
                result.pos = pos;
                result.ok = true;
                return result;
            }
            ;
        }
        , {
            "../common/utils": 4
        }],
        7: [function(require, module, exports) {
            'use strict';
            module.exports = function parseLinkLabel(state, start, disableNested) {
                var level, found, marker, prevPos, labelEnd = -1, max = state.posMax, oldPos = state.pos;
                state.pos = start + 1;
                level = 1;
                while (state.pos < max) {
                    marker = state.src.charCodeAt(state.pos);
                    if (marker === 0x5D) {
                        level--;
                        if (level === 0) {
                            found = true;
                            break;
                        }
                    }
                    prevPos = state.pos;
                    state.md.inline.skipToken(state);
                    if (marker === 0x5B) {
                        if (prevPos === state.pos - 1) {
                            level++;
                        } else if (disableNested) {
                            state.pos = oldPos;
                            return -1;
                        }
                    }
                }
                if (found) {
                    labelEnd = state.pos;
                }
                state.pos = oldPos;
                return labelEnd;
            }
            ;
        }
        , {}],
        8: [function(require, module, exports) {
            'use strict';
            var unescapeAll = require('../common/utils').unescapeAll;
            module.exports = function parseLinkTitle(str, pos, max) {
                var code, marker, lines = 0, start = pos, result = {
                    ok: false,
                    pos: 0,
                    lines: 0,
                    str: ''
                };
                if (pos >= max) {
                    return result;
                }
                marker = str.charCodeAt(pos);
                if (marker !== 0x22 && marker !== 0x27 && marker !== 0x28) {
                    return result;
                }
                pos++;
                if (marker === 0x28) {
                    marker = 0x29;
                }
                while (pos < max) {
                    code = str.charCodeAt(pos);
                    if (code === marker) {
                        result.pos = pos + 1;
                        result.lines = lines;
                        result.str = unescapeAll(str.slice(start + 1, pos));
                        result.ok = true;
                        return result;
                    } else if (code === 0x0A) {
                        lines++;
                    } else if (code === 0x5C && pos + 1 < max) {
                        pos++;
                        if (str.charCodeAt(pos) === 0x0A) {
                            lines++;
                        }
                    }
                    pos++;
                }
                return result;
            }
            ;
        }
        , {
            "../common/utils": 4
        }],
        9: [function(require, module, exports) {
            'use strict';
            var utils = require('./common/utils');
            var helpers = require('./helpers');
            var Renderer = require('./renderer');
            var ParserCore = require('./parser_core');
            var ParserBlock = require('./parser_block');
            var ParserInline = require('./parser_inline');
            var LinkifyIt = require('linkify-it');
            var mdurl = require('mdurl');
            var punycode = require('punycode');
            var config = {
                'default': require('./presets/default'),
                zero: require('./presets/zero'),
                commonmark: require('./presets/commonmark')
            };
            var BAD_PROTO_RE = /^(vbscript|javascript|file|data):/;
            var GOOD_DATA_RE = /^data:image\/(gif|png|jpeg|webp);/;
            function validateLink(url) {
                var str = url.trim().toLowerCase();
                return BAD_PROTO_RE.test(str) ? (GOOD_DATA_RE.test(str) ? true : false) : true;
            }
            var RECODE_HOSTNAME_FOR = ['http:', 'https:', 'mailto:'];
            function normalizeLink(url) {
                var parsed = mdurl.parse(url, true);
                if (parsed.hostname) {
                    if (!parsed.protocol || RECODE_HOSTNAME_FOR.indexOf(parsed.protocol) >= 0) {
                        try {
                            parsed.hostname = punycode.toASCII(parsed.hostname);
                        } catch (er) {}
                    }
                }
                return mdurl.encode(mdurl.format(parsed));
            }
            function normalizeLinkText(url) {
                var parsed = mdurl.parse(url, true);
                if (parsed.hostname) {
                    if (!parsed.protocol || RECODE_HOSTNAME_FOR.indexOf(parsed.protocol) >= 0) {
                        try {
                            parsed.hostname = punycode.toUnicode(parsed.hostname);
                        } catch (er) {}
                    }
                }
                return mdurl.decode(mdurl.format(parsed));
            }
            function MarkdownIt(presetName, options) {
                if (!(this instanceof MarkdownIt)) {
                    return new MarkdownIt(presetName,options);
                }
                if (!options) {
                    if (!utils.isString(presetName)) {
                        options = presetName || {};
                        presetName = 'default';
                    }
                }
                this.inline = new ParserInline();
                this.block = new ParserBlock();
                this.core = new ParserCore();
                this.renderer = new Renderer();
                this.linkify = new LinkifyIt();
                this.validateLink = validateLink;
                this.normalizeLink = normalizeLink;
                this.normalizeLinkText = normalizeLinkText;
                this.utils = utils;
                this.helpers = utils.assign({}, helpers);
                this.options = {};
                this.configure(presetName);
                if (options) {
                    this.set(options);
                }
            }
            MarkdownIt.prototype.set = function(options) {
                utils.assign(this.options, options);
                return this;
            }
            ;
            MarkdownIt.prototype.configure = function(presets) {
                var self = this, presetName;
                if (utils.isString(presets)) {
                    presetName = presets;
                    presets = config[presetName];
                    if (!presets) {
                        throw new Error('Wrong `markdown-it` preset "' + presetName + '", check name');
                    }
                }
                if (!presets) {
                    throw new Error('Wrong `markdown-it` preset, can\'t be empty');
                }
                if (presets.options) {
                    self.set(presets.options);
                }
                if (presets.components) {
                    Object.keys(presets.components).forEach(function(name) {
                        if (presets.components[name].rules) {
                            self[name].ruler.enableOnly(presets.components[name].rules);
                        }
                        if (presets.components[name].rules2) {
                            self[name].ruler2.enableOnly(presets.components[name].rules2);
                        }
                    });
                }
                return this;
            }
            ;
            MarkdownIt.prototype.enable = function(list, ignoreInvalid) {
                var result = [];
                if (!Array.isArray(list)) {
                    list = [list];
                }
                ['core', 'block', 'inline'].forEach(function(chain) {
                    result = result.concat(this[chain].ruler.enable(list, true));
                }, this);
                result = result.concat(this.inline.ruler2.enable(list, true));
                var missed = list.filter(function(name) {
                    return result.indexOf(name) < 0;
                });
                if (missed.length && !ignoreInvalid) {
                    throw new Error('MarkdownIt. Failed to enable unknown rule(s): ' + missed);
                }
                return this;
            }
            ;
            MarkdownIt.prototype.disable = function(list, ignoreInvalid) {
                var result = [];
                if (!Array.isArray(list)) {
                    list = [list];
                }
                ['core', 'block', 'inline'].forEach(function(chain) {
                    result = result.concat(this[chain].ruler.disable(list, true));
                }, this);
                result = result.concat(this.inline.ruler2.disable(list, true));
                var missed = list.filter(function(name) {
                    return result.indexOf(name) < 0;
                });
                if (missed.length && !ignoreInvalid) {
                    throw new Error('MarkdownIt. Failed to disable unknown rule(s): ' + missed);
                }
                return this;
            }
            ;
            MarkdownIt.prototype.use = function(plugin) {
                var args = [this].concat(Array.prototype.slice.call(arguments, 1));
                plugin.apply(plugin, args);
                return this;
            }
            ;
            MarkdownIt.prototype.parse = function(src, env) {
                if (typeof src !== 'string') {
                    throw new Error('Input data should be a String');
                }
                var state = new this.core.State(src,this,env);
                this.core.process(state);
                return state.tokens;
            }
            ;
            MarkdownIt.prototype.render = function(src, env) {
                env = env || {};
                return this.renderer.render(this.parse(src, env), this.options, env);
            }
            ;
            MarkdownIt.prototype.parseInline = function(src, env) {
                var state = new this.core.State(src,this,env);
                state.inlineMode = true;
                this.core.process(state);
                return state.tokens;
            }
            ;
            MarkdownIt.prototype.renderInline = function(src, env) {
                env = env || {};
                return this.renderer.render(this.parseInline(src, env), this.options, env);
            }
            ;
            module.exports = MarkdownIt;
        }
        , {
            "./common/utils": 4,
            "./helpers": 5,
            "./parser_block": 10,
            "./parser_core": 11,
            "./parser_inline": 12,
            "./presets/commonmark": 13,
            "./presets/default": 14,
            "./presets/zero": 15,
            "./renderer": 16,
            "linkify-it": 53,
            "mdurl": 58,
            "punycode": 60
        }],
        10: [function(require, module, exports) {
            'use strict';
            var Ruler = require('./ruler');
            var _rules = [['table', require('./rules_block/table'), ['paragraph', 'reference']], ['code', require('./rules_block/code')], ['fence', require('./rules_block/fence'), ['paragraph', 'reference', 'blockquote', 'list']], ['blockquote', require('./rules_block/blockquote'), ['paragraph', 'reference', 'blockquote', 'list']], ['hr', require('./rules_block/hr'), ['paragraph', 'reference', 'blockquote', 'list']], ['list', require('./rules_block/list'), ['paragraph', 'reference', 'blockquote']], ['reference', require('./rules_block/reference')], ['heading', require('./rules_block/heading'), ['paragraph', 'reference', 'blockquote']], ['lheading', require('./rules_block/lheading')], ['html_block', require('./rules_block/html_block'), ['paragraph', 'reference', 'blockquote']], ['paragraph', require('./rules_block/paragraph')]];
            function ParserBlock() {
                this.ruler = new Ruler();
                for (var i = 0; i < _rules.length; i++) {
                    this.ruler.push(_rules[i][0], _rules[i][1], {
                        alt: (_rules[i][2] || []).slice()
                    });
                }
            }
            ParserBlock.prototype.tokenize = function(state, startLine, endLine) {
                var ok, i, rules = this.ruler.getRules(''), len = rules.length, line = startLine, hasEmptyLines = false, maxNesting = state.md.options.maxNesting;
                while (line < endLine) {
                    state.line = line = state.skipEmptyLines(line);
                    if (line >= endLine) {
                        break;
                    }
                    if (state.sCount[line] < state.blkIndent) {
                        break;
                    }
                    if (state.level >= maxNesting) {
                        state.line = endLine;
                        break;
                    }
                    for (i = 0; i < len; i++) {
                        ok = rules[i](state, line, endLine, false);
                        if (ok) {
                            break;
                        }
                    }
                    state.tight = !hasEmptyLines;
                    if (state.isEmpty(state.line - 1)) {
                        hasEmptyLines = true;
                    }
                    line = state.line;
                    if (line < endLine && state.isEmpty(line)) {
                        hasEmptyLines = true;
                        line++;
                        state.line = line;
                    }
                }
            }
            ;
            ParserBlock.prototype.parse = function(src, md, env, outTokens) {
                var state;
                if (!src) {
                    return;
                }
                state = new this.State(src,md,env,outTokens);
                this.tokenize(state, state.line, state.lineMax);
            }
            ;
            ParserBlock.prototype.State = require('./rules_block/state_block');
            module.exports = ParserBlock;
        }
        , {
            "./ruler": 17,
            "./rules_block/blockquote": 18,
            "./rules_block/code": 19,
            "./rules_block/fence": 20,
            "./rules_block/heading": 21,
            "./rules_block/hr": 22,
            "./rules_block/html_block": 23,
            "./rules_block/lheading": 24,
            "./rules_block/list": 25,
            "./rules_block/paragraph": 26,
            "./rules_block/reference": 27,
            "./rules_block/state_block": 28,
            "./rules_block/table": 29
        }],
        11: [function(require, module, exports) {
            'use strict';
            var Ruler = require('./ruler');
            var _rules = [['normalize', require('./rules_core/normalize')], ['block', require('./rules_core/block')], ['inline', require('./rules_core/inline')], ['linkify', require('./rules_core/linkify')], ['replacements', require('./rules_core/replacements')], ['smartquotes', require('./rules_core/smartquotes')]];
            function Core() {
                this.ruler = new Ruler();
                for (var i = 0; i < _rules.length; i++) {
                    this.ruler.push(_rules[i][0], _rules[i][1]);
                }
            }
            Core.prototype.process = function(state) {
                var i, l, rules;
                rules = this.ruler.getRules('');
                for (i = 0,
                l = rules.length; i < l; i++) {
                    rules[i](state);
                }
            }
            ;
            Core.prototype.State = require('./rules_core/state_core');
            module.exports = Core;
        }
        , {
            "./ruler": 17,
            "./rules_core/block": 30,
            "./rules_core/inline": 31,
            "./rules_core/linkify": 32,
            "./rules_core/normalize": 33,
            "./rules_core/replacements": 34,
            "./rules_core/smartquotes": 35,
            "./rules_core/state_core": 36
        }],
        12: [function(require, module, exports) {
            'use strict';
            var Ruler = require('./ruler');
            var _rules = [['text', require('./rules_inline/text')], ['newline', require('./rules_inline/newline')], ['escape', require('./rules_inline/escape')], ['backticks', require('./rules_inline/backticks')], ['strikethrough', require('./rules_inline/strikethrough').tokenize], ['emphasis', require('./rules_inline/emphasis').tokenize], ['link', require('./rules_inline/link')], ['image', require('./rules_inline/image')], ['autolink', require('./rules_inline/autolink')], ['html_inline', require('./rules_inline/html_inline')], ['entity', require('./rules_inline/entity')]];
            var _rules2 = [['balance_pairs', require('./rules_inline/balance_pairs')], ['strikethrough', require('./rules_inline/strikethrough').postProcess], ['emphasis', require('./rules_inline/emphasis').postProcess], ['text_collapse', require('./rules_inline/text_collapse')]];
            function ParserInline() {
                var i;
                this.ruler = new Ruler();
                for (i = 0; i < _rules.length; i++) {
                    this.ruler.push(_rules[i][0], _rules[i][1]);
                }
                this.ruler2 = new Ruler();
                for (i = 0; i < _rules2.length; i++) {
                    this.ruler2.push(_rules2[i][0], _rules2[i][1]);
                }
            }
            ParserInline.prototype.skipToken = function(state) {
                var ok, i, pos = state.pos, rules = this.ruler.getRules(''), len = rules.length, maxNesting = state.md.options.maxNesting, cache = state.cache;
                if (typeof cache[pos] !== 'undefined') {
                    state.pos = cache[pos];
                    return;
                }
                if (state.level < maxNesting) {
                    for (i = 0; i < len; i++) {
                        state.level++;
                        ok = rules[i](state, true);
                        state.level--;
                        if (ok) {
                            break;
                        }
                    }
                } else {
                    state.pos = state.posMax;
                }
                if (!ok) {
                    state.pos++;
                }
                cache[pos] = state.pos;
            }
            ;
            ParserInline.prototype.tokenize = function(state) {
                var ok, i, rules = this.ruler.getRules(''), len = rules.length, end = state.posMax, maxNesting = state.md.options.maxNesting;
                while (state.pos < end) {
                    if (state.level < maxNesting) {
                        for (i = 0; i < len; i++) {
                            ok = rules[i](state, false);
                            if (ok) {
                                break;
                            }
                        }
                    }
                    if (ok) {
                        if (state.pos >= end) {
                            break;
                        }
                        continue;
                    }
                    state.pending += state.src[state.pos++];
                }
                if (state.pending) {
                    state.pushPending();
                }
            }
            ;
            ParserInline.prototype.parse = function(str, md, env, outTokens) {
                var i, rules, len;
                var state = new this.State(str,md,env,outTokens);
                this.tokenize(state);
                rules = this.ruler2.getRules('');
                len = rules.length;
                for (i = 0; i < len; i++) {
                    rules[i](state);
                }
            }
            ;
            ParserInline.prototype.State = require('./rules_inline/state_inline');
            module.exports = ParserInline;
        }
        , {
            "./ruler": 17,
            "./rules_inline/autolink": 37,
            "./rules_inline/backticks": 38,
            "./rules_inline/balance_pairs": 39,
            "./rules_inline/emphasis": 40,
            "./rules_inline/entity": 41,
            "./rules_inline/escape": 42,
            "./rules_inline/html_inline": 43,
            "./rules_inline/image": 44,
            "./rules_inline/link": 45,
            "./rules_inline/newline": 46,
            "./rules_inline/state_inline": 47,
            "./rules_inline/strikethrough": 48,
            "./rules_inline/text": 49,
            "./rules_inline/text_collapse": 50
        }],
        13: [function(require, module, exports) {
            'use strict';
            module.exports = {
                options: {
                    html: true,
                    xhtmlOut: true,
                    breaks: false,
                    langPrefix: 'language-',
                    linkify: false,
                    typographer: false,
                    quotes: '\u201c\u201d\u2018\u2019',
                    highlight: null,
                    maxNesting: 20
                },
                components: {
                    core: {
                        rules: ['normalize', 'block', 'inline']
                    },
                    block: {
                        rules: ['blockquote', 'code', 'fence', 'heading', 'hr', 'html_block', 'lheading', 'list', 'reference', 'paragraph']
                    },
                    inline: {
                        rules: ['autolink', 'backticks', 'emphasis', 'entity', 'escape', 'html_inline', 'image', 'link', 'newline', 'text'],
                        rules2: ['balance_pairs', 'emphasis', 'text_collapse']
                    }
                }
            };
        }
        , {}],
        14: [function(require, module, exports) {
            'use strict';
            module.exports = {
                options: {
                    html: false,
                    xhtmlOut: false,
                    breaks: false,
                    langPrefix: 'language-',
                    linkify: false,
                    typographer: false,
                    quotes: '\u201c\u201d\u2018\u2019',
                    highlight: null,
                    maxNesting: 100
                },
                components: {
                    core: {},
                    block: {},
                    inline: {}
                }
            };
        }
        , {}],
        15: [function(require, module, exports) {
            'use strict';
            module.exports = {
                options: {
                    html: false,
                    xhtmlOut: false,
                    breaks: false,
                    langPrefix: 'language-',
                    linkify: false,
                    typographer: false,
                    quotes: '\u201c\u201d\u2018\u2019',
                    highlight: null,
                    maxNesting: 20
                },
                components: {
                    core: {
                        rules: ['normalize', 'block', 'inline']
                    },
                    block: {
                        rules: ['paragraph']
                    },
                    inline: {
                        rules: ['text'],
                        rules2: ['balance_pairs', 'text_collapse']
                    }
                }
            };
        }
        , {}],
        16: [function(require, module, exports) {
            'use strict';
            var assign = require('./common/utils').assign;
            var unescapeAll = require('./common/utils').unescapeAll;
            var escapeHtml = require('./common/utils').escapeHtml;
            var default_rules = {};
            default_rules.code_inline = function(tokens, idx, options, env, slf) {
                var token = tokens[idx];
                return '<code' + slf.renderAttrs(token) + '>' + escapeHtml(tokens[idx].content) + '</code>';
            }
            ;
            default_rules.code_block = function(tokens, idx, options, env, slf) {
                var token = tokens[idx];
                return '<pre' + slf.renderAttrs(token) + '><code>' + escapeHtml(tokens[idx].content) + '</code></pre>\n';
            }
            ;
            default_rules.fence = function(tokens, idx, options, env, slf) {
                var token = tokens[idx], info = token.info ? unescapeAll(token.info).trim() : '', langName = '', highlighted, i, tmpAttrs, tmpToken;
                if (info) {
                    langName = info.split(/\s+/g)[0];
                }
                if (options.highlight) {
                    highlighted = options.highlight(token.content, langName) || escapeHtml(token.content);
                } else {
                    highlighted = escapeHtml(token.content);
                }
                if (highlighted.indexOf('<pre') === 0) {
                    return highlighted + '\n';
                }
                if (info) {
                    i = token.attrIndex('class');
                    tmpAttrs = token.attrs ? token.attrs.slice() : [];
                    if (i < 0) {
                        tmpAttrs.push(['class', options.langPrefix + langName]);
                    } else {
                        tmpAttrs[i][1] += ' ' + options.langPrefix + langName;
                    }
                    tmpToken = {
                        attrs: tmpAttrs
                    };
                    return '<pre><code' + slf.renderAttrs(tmpToken) + '>' + highlighted + '</code></pre>\n';
                }
                return '<pre><code' + slf.renderAttrs(token) + '>' + highlighted + '</code></pre>\n';
            }
            ;
            default_rules.image = function(tokens, idx, options, env, slf) {
                var token = tokens[idx];
                token.attrs[token.attrIndex('alt')][1] = slf.renderInlineAsText(token.children, options, env);
                return slf.renderToken(tokens, idx, options);
            }
            ;
            default_rules.hardbreak = function(tokens, idx, options) {
                return options.xhtmlOut ? '<br />\n' : '<br>\n';
            }
            ;
            default_rules.softbreak = function(tokens, idx, options) {
                return options.breaks ? (options.xhtmlOut ? '<br />\n' : '<br>\n') : '\n';
            }
            ;
            default_rules.text = function(tokens, idx) {
                return escapeHtml(tokens[idx].content);
            }
            ;
            default_rules.html_block = function(tokens, idx) {
                return tokens[idx].content;
            }
            ;
            default_rules.html_inline = function(tokens, idx) {
                return tokens[idx].content;
            }
            ;
            function Renderer() {
                this.rules = assign({}, default_rules);
            }
            Renderer.prototype.renderAttrs = function renderAttrs(token) {
                var i, l, result;
                if (!token.attrs) {
                    return '';
                }
                result = '';
                for (i = 0,
                l = token.attrs.length; i < l; i++) {
                    result += ' ' + escapeHtml(token.attrs[i][0]) + '="' + escapeHtml(token.attrs[i][1]) + '"';
                }
                return result;
            }
            ;
            Renderer.prototype.renderToken = function renderToken(tokens, idx, options) {
                var nextToken, result = '', needLf = false, token = tokens[idx];
                if (token.hidden) {
                    return '';
                }
                if (token.block && token.nesting !== -1 && idx && tokens[idx - 1].hidden) {
                    result += '\n';
                }
                result += (token.nesting === -1 ? '</' : '<') + token.tag;
                result += this.renderAttrs(token);
                if (token.nesting === 0 && options.xhtmlOut) {
                    result += ' /';
                }
                if (token.block) {
                    needLf = true;
                    if (token.nesting === 1) {
                        if (idx + 1 < tokens.length) {
                            nextToken = tokens[idx + 1];
                            if (nextToken.type === 'inline' || nextToken.hidden) {
                                needLf = false;
                            } else if (nextToken.nesting === -1 && nextToken.tag === token.tag) {
                                needLf = false;
                            }
                        }
                    }
                }
                result += needLf ? '>\n' : '>';
                return result;
            }
            ;
            Renderer.prototype.renderInline = function(tokens, options, env) {
                var type, result = '', rules = this.rules;
                for (var i = 0, len = tokens.length; i < len; i++) {
                    type = tokens[i].type;
                    if (typeof rules[type] !== 'undefined') {
                        result += rules[type](tokens, i, options, env, this);
                    } else {
                        result += this.renderToken(tokens, i, options);
                    }
                }
                return result;
            }
            ;
            Renderer.prototype.renderInlineAsText = function(tokens, options, env) {
                var result = '';
                for (var i = 0, len = tokens.length; i < len; i++) {
                    if (tokens[i].type === 'text') {
                        result += tokens[i].content;
                    } else if (tokens[i].type === 'image') {
                        result += this.renderInlineAsText(tokens[i].children, options, env);
                    }
                }
                return result;
            }
            ;
            Renderer.prototype.render = function(tokens, options, env) {
                var i, len, type, result = '', rules = this.rules;
                for (i = 0,
                len = tokens.length; i < len; i++) {
                    type = tokens[i].type;
                    if (type === 'inline') {
                        result += this.renderInline(tokens[i].children, options, env);
                    } else if (typeof rules[type] !== 'undefined') {
                        result += rules[tokens[i].type](tokens, i, options, env, this);
                    } else {
                        result += this.renderToken(tokens, i, options, env);
                    }
                }
                return result;
            }
            ;
            module.exports = Renderer;
        }
        , {
            "./common/utils": 4
        }],
        17: [function(require, module, exports) {
            'use strict';
            function Ruler() {
                this.__rules__ = [];
                this.__cache__ = null;
            }
            Ruler.prototype.__find__ = function(name) {
                for (var i = 0; i < this.__rules__.length; i++) {
                    if (this.__rules__[i].name === name) {
                        return i;
                    }
                }
                return -1;
            }
            ;
            Ruler.prototype.__compile__ = function() {
                var self = this;
                var chains = [''];
                self.__rules__.forEach(function(rule) {
                    if (!rule.enabled) {
                        return;
                    }
                    rule.alt.forEach(function(altName) {
                        if (chains.indexOf(altName) < 0) {
                            chains.push(altName);
                        }
                    });
                });
                self.__cache__ = {};
                chains.forEach(function(chain) {
                    self.__cache__[chain] = [];
                    self.__rules__.forEach(function(rule) {
                        if (!rule.enabled) {
                            return;
                        }
                        if (chain && rule.alt.indexOf(chain) < 0) {
                            return;
                        }
                        self.__cache__[chain].push(rule.fn);
                    });
                });
            }
            ;
            Ruler.prototype.at = function(name, fn, options) {
                var index = this.__find__(name);
                var opt = options || {};
                if (index === -1) {
                    throw new Error('Parser rule not found: ' + name);
                }
                this.__rules__[index].fn = fn;
                this.__rules__[index].alt = opt.alt || [];
                this.__cache__ = null;
            }
            ;
            Ruler.prototype.before = function(beforeName, ruleName, fn, options) {
                var index = this.__find__(beforeName);
                var opt = options || {};
                if (index === -1) {
                    throw new Error('Parser rule not found: ' + beforeName);
                }
                this.__rules__.splice(index, 0, {
                    name: ruleName,
                    enabled: true,
                    fn: fn,
                    alt: opt.alt || []
                });
                this.__cache__ = null;
            }
            ;
            Ruler.prototype.after = function(afterName, ruleName, fn, options) {
                var index = this.__find__(afterName);
                var opt = options || {};
                if (index === -1) {
                    throw new Error('Parser rule not found: ' + afterName);
                }
                this.__rules__.splice(index + 1, 0, {
                    name: ruleName,
                    enabled: true,
                    fn: fn,
                    alt: opt.alt || []
                });
                this.__cache__ = null;
            }
            ;
            Ruler.prototype.push = function(ruleName, fn, options) {
                var opt = options || {};
                this.__rules__.push({
                    name: ruleName,
                    enabled: true,
                    fn: fn,
                    alt: opt.alt || []
                });
                this.__cache__ = null;
            }
            ;
            Ruler.prototype.enable = function(list, ignoreInvalid) {
                if (!Array.isArray(list)) {
                    list = [list];
                }
                var result = [];
                list.forEach(function(name) {
                    var idx = this.__find__(name);
                    if (idx < 0) {
                        if (ignoreInvalid) {
                            return;
                        }
                        throw new Error('Rules manager: invalid rule name ' + name);
                    }
                    this.__rules__[idx].enabled = true;
                    result.push(name);
                }, this);
                this.__cache__ = null;
                return result;
            }
            ;
            Ruler.prototype.enableOnly = function(list, ignoreInvalid) {
                if (!Array.isArray(list)) {
                    list = [list];
                }
                this.__rules__.forEach(function(rule) {
                    rule.enabled = false;
                });
                this.enable(list, ignoreInvalid);
            }
            ;
            Ruler.prototype.disable = function(list, ignoreInvalid) {
                if (!Array.isArray(list)) {
                    list = [list];
                }
                var result = [];
                list.forEach(function(name) {
                    var idx = this.__find__(name);
                    if (idx < 0) {
                        if (ignoreInvalid) {
                            return;
                        }
                        throw new Error('Rules manager: invalid rule name ' + name);
                    }
                    this.__rules__[idx].enabled = false;
                    result.push(name);
                }, this);
                this.__cache__ = null;
                return result;
            }
            ;
            Ruler.prototype.getRules = function(chainName) {
                if (this.__cache__ === null) {
                    this.__compile__();
                }
                return this.__cache__[chainName] || [];
            }
            ;
            module.exports = Ruler;
        }
        , {}],
        18: [function(require, module, exports) {
            'use strict';
            var isSpace = require('../common/utils').isSpace;
            module.exports = function blockquote(state, startLine, endLine, silent) {
                var adjustTab, ch, i, initial, l, lastLineEmpty, lines, nextLine, offset, oldBMarks, oldBSCount, oldIndent, oldParentType, oldSCount, oldTShift, spaceAfterMarker, terminate, terminatorRules, token, wasOutdented, oldLineMax = state.lineMax, pos = state.bMarks[startLine] + state.tShift[startLine], max = state.eMarks[startLine];
                if (state.sCount[startLine] - state.blkIndent >= 4) {
                    return false;
                }
                if (state.src.charCodeAt(pos++) !== 0x3E) {
                    return false;
                }
                if (silent) {
                    return true;
                }
                initial = offset = state.sCount[startLine] + pos - (state.bMarks[startLine] + state.tShift[startLine]);
                if (state.src.charCodeAt(pos) === 0x20) {
                    pos++;
                    initial++;
                    offset++;
                    adjustTab = false;
                    spaceAfterMarker = true;
                } else if (state.src.charCodeAt(pos) === 0x09) {
                    spaceAfterMarker = true;
                    if ((state.bsCount[startLine] + offset) % 4 === 3) {
                        pos++;
                        initial++;
                        offset++;
                        adjustTab = false;
                    } else {
                        adjustTab = true;
                    }
                } else {
                    spaceAfterMarker = false;
                }
                oldBMarks = [state.bMarks[startLine]];
                state.bMarks[startLine] = pos;
                while (pos < max) {
                    ch = state.src.charCodeAt(pos);
                    if (isSpace(ch)) {
                        if (ch === 0x09) {
                            offset += 4 - (offset + state.bsCount[startLine] + (adjustTab ? 1 : 0)) % 4;
                        } else {
                            offset++;
                        }
                    } else {
                        break;
                    }
                    pos++;
                }
                oldBSCount = [state.bsCount[startLine]];
                state.bsCount[startLine] = state.sCount[startLine] + 1 + (spaceAfterMarker ? 1 : 0);
                lastLineEmpty = pos >= max;
                oldSCount = [state.sCount[startLine]];
                state.sCount[startLine] = offset - initial;
                oldTShift = [state.tShift[startLine]];
                state.tShift[startLine] = pos - state.bMarks[startLine];
                terminatorRules = state.md.block.ruler.getRules('blockquote');
                oldParentType = state.parentType;
                state.parentType = 'blockquote';
                wasOutdented = false;
                for (nextLine = startLine + 1; nextLine < endLine; nextLine++) {
                    if (state.sCount[nextLine] < state.blkIndent)
                        wasOutdented = true;
                    pos = state.bMarks[nextLine] + state.tShift[nextLine];
                    max = state.eMarks[nextLine];
                    if (pos >= max) {
                        break;
                    }
                    if (state.src.charCodeAt(pos++) === 0x3E && !wasOutdented) {
                        initial = offset = state.sCount[nextLine] + pos - (state.bMarks[nextLine] + state.tShift[nextLine]);
                        if (state.src.charCodeAt(pos) === 0x20) {
                            pos++;
                            initial++;
                            offset++;
                            adjustTab = false;
                            spaceAfterMarker = true;
                        } else if (state.src.charCodeAt(pos) === 0x09) {
                            spaceAfterMarker = true;
                            if ((state.bsCount[nextLine] + offset) % 4 === 3) {
                                pos++;
                                initial++;
                                offset++;
                                adjustTab = false;
                            } else {
                                adjustTab = true;
                            }
                        } else {
                            spaceAfterMarker = false;
                        }
                        oldBMarks.push(state.bMarks[nextLine]);
                        state.bMarks[nextLine] = pos;
                        while (pos < max) {
                            ch = state.src.charCodeAt(pos);
                            if (isSpace(ch)) {
                                if (ch === 0x09) {
                                    offset += 4 - (offset + state.bsCount[nextLine] + (adjustTab ? 1 : 0)) % 4;
                                } else {
                                    offset++;
                                }
                            } else {
                                break;
                            }
                            pos++;
                        }
                        lastLineEmpty = pos >= max;
                        oldBSCount.push(state.bsCount[nextLine]);
                        state.bsCount[nextLine] = state.sCount[nextLine] + 1 + (spaceAfterMarker ? 1 : 0);
                        oldSCount.push(state.sCount[nextLine]);
                        state.sCount[nextLine] = offset - initial;
                        oldTShift.push(state.tShift[nextLine]);
                        state.tShift[nextLine] = pos - state.bMarks[nextLine];
                        continue;
                    }
                    if (lastLineEmpty) {
                        break;
                    }
                    terminate = false;
                    for (i = 0,
                    l = terminatorRules.length; i < l; i++) {
                        if (terminatorRules[i](state, nextLine, endLine, true)) {
                            terminate = true;
                            break;
                        }
                    }
                    if (terminate) {
                        state.lineMax = nextLine;
                        if (state.blkIndent !== 0) {
                            oldBMarks.push(state.bMarks[nextLine]);
                            oldBSCount.push(state.bsCount[nextLine]);
                            oldTShift.push(state.tShift[nextLine]);
                            oldSCount.push(state.sCount[nextLine]);
                            state.sCount[nextLine] -= state.blkIndent;
                        }
                        break;
                    }
                    oldBMarks.push(state.bMarks[nextLine]);
                    oldBSCount.push(state.bsCount[nextLine]);
                    oldTShift.push(state.tShift[nextLine]);
                    oldSCount.push(state.sCount[nextLine]);
                    state.sCount[nextLine] = -1;
                }
                oldIndent = state.blkIndent;
                state.blkIndent = 0;
                token = state.push('blockquote_open', 'blockquote', 1);
                token.markup = '>';
                token.map = lines = [startLine, 0];
                state.md.block.tokenize(state, startLine, nextLine);
                token = state.push('blockquote_close', 'blockquote', -1);
                token.markup = '>';
                state.lineMax = oldLineMax;
                state.parentType = oldParentType;
                lines[1] = state.line;
                for (i = 0; i < oldTShift.length; i++) {
                    state.bMarks[i + startLine] = oldBMarks[i];
                    state.tShift[i + startLine] = oldTShift[i];
                    state.sCount[i + startLine] = oldSCount[i];
                    state.bsCount[i + startLine] = oldBSCount[i];
                }
                state.blkIndent = oldIndent;
                return true;
            }
            ;
        }
        , {
            "../common/utils": 4
        }],
        19: [function(require, module, exports) {
            'use strict';
            module.exports = function code(state, startLine, endLine) {
                var nextLine, last, token;
                if (state.sCount[startLine] - state.blkIndent < 4) {
                    return false;
                }
                last = nextLine = startLine + 1;
                while (nextLine < endLine) {
                    if (state.isEmpty(nextLine)) {
                        nextLine++;
                        continue;
                    }
                    if (state.sCount[nextLine] - state.blkIndent >= 4) {
                        nextLine++;
                        last = nextLine;
                        continue;
                    }
                    break;
                }
                state.line = last;
                token = state.push('code_block', 'code', 0);
                token.content = state.getLines(startLine, last, 4 + state.blkIndent, true);
                token.map = [startLine, state.line];
                return true;
            }
            ;
        }
        , {}],
        20: [function(require, module, exports) {
            'use strict';
            module.exports = function fence(state, startLine, endLine, silent) {
                var marker, len, params, nextLine, mem, token, markup, haveEndMarker = false, pos = state.bMarks[startLine] + state.tShift[startLine], max = state.eMarks[startLine];
                if (state.sCount[startLine] - state.blkIndent >= 4) {
                    return false;
                }
                if (pos + 3 > max) {
                    return false;
                }
                marker = state.src.charCodeAt(pos);
                if (marker !== 0x7E && marker !== 0x60) {
                    return false;
                }
                mem = pos;
                pos = state.skipChars(pos, marker);
                len = pos - mem;
                if (len < 3) {
                    return false;
                }
                markup = state.src.slice(mem, pos);
                params = state.src.slice(pos, max);
                if (marker === 0x60) {
                    if (params.indexOf(String.fromCharCode(marker)) >= 0) {
                        return false;
                    }
                }
                if (silent) {
                    return true;
                }
                nextLine = startLine;
                for (; ; ) {
                    nextLine++;
                    if (nextLine >= endLine) {
                        break;
                    }
                    pos = mem = state.bMarks[nextLine] + state.tShift[nextLine];
                    max = state.eMarks[nextLine];
                    if (pos < max && state.sCount[nextLine] < state.blkIndent) {
                        break;
                    }
                    if (state.src.charCodeAt(pos) !== marker) {
                        continue;
                    }
                    if (state.sCount[nextLine] - state.blkIndent >= 4) {
                        continue;
                    }
                    pos = state.skipChars(pos, marker);
                    if (pos - mem < len) {
                        continue;
                    }
                    pos = state.skipSpaces(pos);
                    if (pos < max) {
                        continue;
                    }
                    haveEndMarker = true;
                    break;
                }
                len = state.sCount[startLine];
                state.line = nextLine + (haveEndMarker ? 1 : 0);
                token = state.push('fence', 'code', 0);
                token.info = params;
                token.content = state.getLines(startLine + 1, nextLine, len, true);
                token.markup = markup;
                token.map = [startLine, state.line];
                return true;
            }
            ;
        }
        , {}],
        21: [function(require, module, exports) {
            'use strict';
            var isSpace = require('../common/utils').isSpace;
            module.exports = function heading(state, startLine, endLine, silent) {
                var ch, level, tmp, token, pos = state.bMarks[startLine] + state.tShift[startLine], max = state.eMarks[startLine];
                if (state.sCount[startLine] - state.blkIndent >= 4) {
                    return false;
                }
                ch = state.src.charCodeAt(pos);
                if (ch !== 0x23 || pos >= max) {
                    return false;
                }
                level = 1;
                ch = state.src.charCodeAt(++pos);
                while (ch === 0x23 && pos < max && level <= 6) {
                    level++;
                    ch = state.src.charCodeAt(++pos);
                }
                if (level > 6 || (pos < max && !isSpace(ch))) {
                    return false;
                }
                if (silent) {
                    return true;
                }
                max = state.skipSpacesBack(max, pos);
                tmp = state.skipCharsBack(max, 0x23, pos);
                if (tmp > pos && isSpace(state.src.charCodeAt(tmp - 1))) {
                    max = tmp;
                }
                state.line = startLine + 1;
                token = state.push('heading_open', 'h' + String(level), 1);
                token.markup = '########'.slice(0, level);
                token.map = [startLine, state.line];
                token = state.push('inline', '', 0);
                token.content = state.src.slice(pos, max).trim();
                token.map = [startLine, state.line];
                token.children = [];
                token = state.push('heading_close', 'h' + String(level), -1);
                token.markup = '########'.slice(0, level);
                return true;
            }
            ;
        }
        , {
            "../common/utils": 4
        }],
        22: [function(require, module, exports) {
            'use strict';
            var isSpace = require('../common/utils').isSpace;
            module.exports = function hr(state, startLine, endLine, silent) {
                var marker, cnt, ch, token, pos = state.bMarks[startLine] + state.tShift[startLine], max = state.eMarks[startLine];
                if (state.sCount[startLine] - state.blkIndent >= 4) {
                    return false;
                }
                marker = state.src.charCodeAt(pos++);
                if (marker !== 0x2A && marker !== 0x2D && marker !== 0x5F) {
                    return false;
                }
                cnt = 1;
                while (pos < max) {
                    ch = state.src.charCodeAt(pos++);
                    if (ch !== marker && !isSpace(ch)) {
                        return false;
                    }
                    if (ch === marker) {
                        cnt++;
                    }
                }
                if (cnt < 3) {
                    return false;
                }
                if (silent) {
                    return true;
                }
                state.line = startLine + 1;
                token = state.push('hr', 'hr', 0);
                token.map = [startLine, state.line];
                token.markup = Array(cnt + 1).join(String.fromCharCode(marker));
                return true;
            }
            ;
        }
        , {
            "../common/utils": 4
        }],
        23: [function(require, module, exports) {
            'use strict';
            var block_names = require('../common/html_blocks');
            var HTML_OPEN_CLOSE_TAG_RE = require('../common/html_re').HTML_OPEN_CLOSE_TAG_RE;
            var HTML_SEQUENCES = [[/^<(script|pre|style)(?=(\s|>|$))/i, /<\/(script|pre|style)>/i, true], [/^<!--/, /-->/, true], [/^<\?/, /\?>/, true], [/^<![A-Z]/, />/, true], [/^<!\[CDATA\[/, /\]\]>/, true], [new RegExp('^</?(' + block_names.join('|') + ')(?=(\\s|/?>|$))','i'), /^$/, true], [new RegExp(HTML_OPEN_CLOSE_TAG_RE.source + '\\s*$'), /^$/, false]];
            module.exports = function html_block(state, startLine, endLine, silent) {
                var i, nextLine, token, lineText, pos = state.bMarks[startLine] + state.tShift[startLine], max = state.eMarks[startLine];
                if (state.sCount[startLine] - state.blkIndent >= 4) {
                    return false;
                }
                if (!state.md.options.html) {
                    return false;
                }
                if (state.src.charCodeAt(pos) !== 0x3C) {
                    return false;
                }
                lineText = state.src.slice(pos, max);
                for (i = 0; i < HTML_SEQUENCES.length; i++) {
                    if (HTML_SEQUENCES[i][0].test(lineText)) {
                        break;
                    }
                }
                if (i === HTML_SEQUENCES.length) {
                    return false;
                }
                if (silent) {
                    return HTML_SEQUENCES[i][2];
                }
                nextLine = startLine + 1;
                if (!HTML_SEQUENCES[i][1].test(lineText)) {
                    for (; nextLine < endLine; nextLine++) {
                        if (state.sCount[nextLine] < state.blkIndent) {
                            break;
                        }
                        pos = state.bMarks[nextLine] + state.tShift[nextLine];
                        max = state.eMarks[nextLine];
                        lineText = state.src.slice(pos, max);
                        if (HTML_SEQUENCES[i][1].test(lineText)) {
                            if (lineText.length !== 0) {
                                nextLine++;
                            }
                            break;
                        }
                    }
                }
                state.line = nextLine;
                token = state.push('html_block', '', 0);
                token.map = [startLine, nextLine];
                token.content = state.getLines(startLine, nextLine, state.blkIndent, true);
                return true;
            }
            ;
        }
        , {
            "../common/html_blocks": 2,
            "../common/html_re": 3
        }],
        24: [function(require, module, exports) {
            'use strict';
            module.exports = function lheading(state, startLine, endLine) {
                var content, terminate, i, l, token, pos, max, level, marker, nextLine = startLine + 1, oldParentType, terminatorRules = state.md.block.ruler.getRules('paragraph');
                if (state.sCount[startLine] - state.blkIndent >= 4) {
                    return false;
                }
                oldParentType = state.parentType;
                state.parentType = 'paragraph';
                for (; nextLine < endLine && !state.isEmpty(nextLine); nextLine++) {
                    if (state.sCount[nextLine] - state.blkIndent > 3) {
                        continue;
                    }
                    if (state.sCount[nextLine] >= state.blkIndent) {
                        pos = state.bMarks[nextLine] + state.tShift[nextLine];
                        max = state.eMarks[nextLine];
                        if (pos < max) {
                            marker = state.src.charCodeAt(pos);
                            if (marker === 0x2D || marker === 0x3D) {
                                pos = state.skipChars(pos, marker);
                                pos = state.skipSpaces(pos);
                                if (pos >= max) {
                                    level = (marker === 0x3D ? 1 : 2);
                                    break;
                                }
                            }
                        }
                    }
                    if (state.sCount[nextLine] < 0) {
                        continue;
                    }
                    terminate = false;
                    for (i = 0,
                    l = terminatorRules.length; i < l; i++) {
                        if (terminatorRules[i](state, nextLine, endLine, true)) {
                            terminate = true;
                            break;
                        }
                    }
                    if (terminate) {
                        break;
                    }
                }
                if (!level) {
                    return false;
                }
                content = state.getLines(startLine, nextLine, state.blkIndent, false).trim();
                state.line = nextLine + 1;
                token = state.push('heading_open', 'h' + String(level), 1);
                token.markup = String.fromCharCode(marker);
                token.map = [startLine, state.line];
                token = state.push('inline', '', 0);
                token.content = content;
                token.map = [startLine, state.line - 1];
                token.children = [];
                token = state.push('heading_close', 'h' + String(level), -1);
                token.markup = String.fromCharCode(marker);
                state.parentType = oldParentType;
                return true;
            }
            ;
        }
        , {}],
        25: [function(require, module, exports) {
            'use strict';
            var isSpace = require('../common/utils').isSpace;
            function skipBulletListMarker(state, startLine) {
                var marker, pos, max, ch;
                pos = state.bMarks[startLine] + state.tShift[startLine];
                max = state.eMarks[startLine];
                marker = state.src.charCodeAt(pos++);
                if (marker !== 0x2A && marker !== 0x2D && marker !== 0x2B) {
                    return -1;
                }
                if (pos < max) {
                    ch = state.src.charCodeAt(pos);
                    if (!isSpace(ch)) {
                        return -1;
                    }
                }
                return pos;
            }
            function skipOrderedListMarker(state, startLine) {
                var ch, start = state.bMarks[startLine] + state.tShift[startLine], pos = start, max = state.eMarks[startLine];
                if (pos + 1 >= max) {
                    return -1;
                }
                ch = state.src.charCodeAt(pos++);
                if (ch < 0x30 || ch > 0x39) {
                    return -1;
                }
                for (; ; ) {
                    if (pos >= max) {
                        return -1;
                    }
                    ch = state.src.charCodeAt(pos++);
                    if (ch >= 0x30 && ch <= 0x39) {
                        if (pos - start >= 10) {
                            return -1;
                        }
                        continue;
                    }
                    if (ch === 0x29 || ch === 0x2e) {
                        break;
                    }
                    return -1;
                }
                if (pos < max) {
                    ch = state.src.charCodeAt(pos);
                    if (!isSpace(ch)) {
                        return -1;
                    }
                }
                return pos;
            }
            function markTightParagraphs(state, idx) {
                var i, l, level = state.level + 2;
                for (i = idx + 2,
                l = state.tokens.length - 2; i < l; i++) {
                    if (state.tokens[i].level === level && state.tokens[i].type === 'paragraph_open') {
                        state.tokens[i + 2].hidden = true;
                        state.tokens[i].hidden = true;
                        i += 2;
                    }
                }
            }
            module.exports = function list(state, startLine, endLine, silent) {
                var ch, contentStart, i, indent, indentAfterMarker, initial, isOrdered, itemLines, l, listLines, listTokIdx, markerCharCode, markerValue, max, nextLine, offset, oldListIndent, oldParentType, oldSCount, oldTShift, oldTight, pos, posAfterMarker, prevEmptyEnd, start, terminate, terminatorRules, token, isTerminatingParagraph = false, tight = true;
                if (state.sCount[startLine] - state.blkIndent >= 4) {
                    return false;
                }
                if (state.listIndent >= 0 && state.sCount[startLine] - state.listIndent >= 4 && state.sCount[startLine] < state.blkIndent) {
                    return false;
                }
                if (silent && state.parentType === 'paragraph') {
                    if (state.tShift[startLine] >= state.blkIndent) {
                        isTerminatingParagraph = true;
                    }
                }
                if ((posAfterMarker = skipOrderedListMarker(state, startLine)) >= 0) {
                    isOrdered = true;
                    start = state.bMarks[startLine] + state.tShift[startLine];
                    markerValue = Number(state.src.substr(start, posAfterMarker - start - 1));
                    if (isTerminatingParagraph && markerValue !== 1)
                        return false;
                } else if ((posAfterMarker = skipBulletListMarker(state, startLine)) >= 0) {
                    isOrdered = false;
                } else {
                    return false;
                }
                if (isTerminatingParagraph) {
                    if (state.skipSpaces(posAfterMarker) >= state.eMarks[startLine])
                        return false;
                }
                markerCharCode = state.src.charCodeAt(posAfterMarker - 1);
                if (silent) {
                    return true;
                }
                listTokIdx = state.tokens.length;
                if (isOrdered) {
                    token = state.push('ordered_list_open', 'ol', 1);
                    if (markerValue !== 1) {
                        token.attrs = [['start', markerValue]];
                    }
                } else {
                    token = state.push('bullet_list_open', 'ul', 1);
                }
                token.map = listLines = [startLine, 0];
                token.markup = String.fromCharCode(markerCharCode);
                nextLine = startLine;
                prevEmptyEnd = false;
                terminatorRules = state.md.block.ruler.getRules('list');
                oldParentType = state.parentType;
                state.parentType = 'list';
                while (nextLine < endLine) {
                    pos = posAfterMarker;
                    max = state.eMarks[nextLine];
                    initial = offset = state.sCount[nextLine] + posAfterMarker - (state.bMarks[startLine] + state.tShift[startLine]);
                    while (pos < max) {
                        ch = state.src.charCodeAt(pos);
                        if (ch === 0x09) {
                            offset += 4 - (offset + state.bsCount[nextLine]) % 4;
                        } else if (ch === 0x20) {
                            offset++;
                        } else {
                            break;
                        }
                        pos++;
                    }
                    contentStart = pos;
                    if (contentStart >= max) {
                        indentAfterMarker = 1;
                    } else {
                        indentAfterMarker = offset - initial;
                    }
                    if (indentAfterMarker > 4) {
                        indentAfterMarker = 1;
                    }
                    indent = initial + indentAfterMarker;
                    token = state.push('list_item_open', 'li', 1);
                    token.markup = String.fromCharCode(markerCharCode);
                    token.map = itemLines = [startLine, 0];
                    oldTight = state.tight;
                    oldTShift = state.tShift[startLine];
                    oldSCount = state.sCount[startLine];
                    oldListIndent = state.listIndent;
                    state.listIndent = state.blkIndent;
                    state.blkIndent = indent;
                    state.tight = true;
                    state.tShift[startLine] = contentStart - state.bMarks[startLine];
                    state.sCount[startLine] = offset;
                    if (contentStart >= max && state.isEmpty(startLine + 1)) {
                        state.line = Math.min(state.line + 2, endLine);
                    } else {
                        state.md.block.tokenize(state, startLine, endLine, true);
                    }
                    if (!state.tight || prevEmptyEnd) {
                        tight = false;
                    }
                    prevEmptyEnd = (state.line - startLine) > 1 && state.isEmpty(state.line - 1);
                    state.blkIndent = state.listIndent;
                    state.listIndent = oldListIndent;
                    state.tShift[startLine] = oldTShift;
                    state.sCount[startLine] = oldSCount;
                    state.tight = oldTight;
                    token = state.push('list_item_close', 'li', -1);
                    token.markup = String.fromCharCode(markerCharCode);
                    nextLine = startLine = state.line;
                    itemLines[1] = nextLine;
                    contentStart = state.bMarks[startLine];
                    if (nextLine >= endLine) {
                        break;
                    }
                    if (state.sCount[nextLine] < state.blkIndent) {
                        break;
                    }
                    if (state.sCount[startLine] - state.blkIndent >= 4) {
                        break;
                    }
                    terminate = false;
                    for (i = 0,
                    l = terminatorRules.length; i < l; i++) {
                        if (terminatorRules[i](state, nextLine, endLine, true)) {
                            terminate = true;
                            break;
                        }
                    }
                    if (terminate) {
                        break;
                    }
                    if (isOrdered) {
                        posAfterMarker = skipOrderedListMarker(state, nextLine);
                        if (posAfterMarker < 0) {
                            break;
                        }
                    } else {
                        posAfterMarker = skipBulletListMarker(state, nextLine);
                        if (posAfterMarker < 0) {
                            break;
                        }
                    }
                    if (markerCharCode !== state.src.charCodeAt(posAfterMarker - 1)) {
                        break;
                    }
                }
                if (isOrdered) {
                    token = state.push('ordered_list_close', 'ol', -1);
                } else {
                    token = state.push('bullet_list_close', 'ul', -1);
                }
                token.markup = String.fromCharCode(markerCharCode);
                listLines[1] = nextLine;
                state.line = nextLine;
                state.parentType = oldParentType;
                if (tight) {
                    markTightParagraphs(state, listTokIdx);
                }
                return true;
            }
            ;
        }
        , {
            "../common/utils": 4
        }],
        26: [function(require, module, exports) {
            'use strict';
            module.exports = function paragraph(state, startLine) {
                var content, terminate, i, l, token, oldParentType, nextLine = startLine + 1, terminatorRules = state.md.block.ruler.getRules('paragraph'), endLine = state.lineMax;
                oldParentType = state.parentType;
                state.parentType = 'paragraph';
                for (; nextLine < endLine && !state.isEmpty(nextLine); nextLine++) {
                    if (state.sCount[nextLine] - state.blkIndent > 3) {
                        continue;
                    }
                    if (state.sCount[nextLine] < 0) {
                        continue;
                    }
                    terminate = false;
                    for (i = 0,
                    l = terminatorRules.length; i < l; i++) {
                        if (terminatorRules[i](state, nextLine, endLine, true)) {
                            terminate = true;
                            break;
                        }
                    }
                    if (terminate) {
                        break;
                    }
                }
                content = state.getLines(startLine, nextLine, state.blkIndent, false).trim();
                state.line = nextLine;
                token = state.push('paragraph_open', 'p', 1);
                token.map = [startLine, state.line];
                token = state.push('inline', '', 0);
                token.content = content;
                token.map = [startLine, state.line];
                token.children = [];
                token = state.push('paragraph_close', 'p', -1);
                state.parentType = oldParentType;
                return true;
            }
            ;
        }
        , {}],
        27: [function(require, module, exports) {
            'use strict';
            var normalizeReference = require('../common/utils').normalizeReference;
            var isSpace = require('../common/utils').isSpace;
            module.exports = function reference(state, startLine, _endLine, silent) {
                var ch, destEndPos, destEndLineNo, endLine, href, i, l, label, labelEnd, oldParentType, res, start, str, terminate, terminatorRules, title, lines = 0, pos = state.bMarks[startLine] + state.tShift[startLine], max = state.eMarks[startLine], nextLine = startLine + 1;
                if (state.sCount[startLine] - state.blkIndent >= 4) {
                    return false;
                }
                if (state.src.charCodeAt(pos) !== 0x5B) {
                    return false;
                }
                while (++pos < max) {
                    if (state.src.charCodeAt(pos) === 0x5D && state.src.charCodeAt(pos - 1) !== 0x5C) {
                        if (pos + 1 === max) {
                            return false;
                        }
                        if (state.src.charCodeAt(pos + 1) !== 0x3A) {
                            return false;
                        }
                        break;
                    }
                }
                endLine = state.lineMax;
                terminatorRules = state.md.block.ruler.getRules('reference');
                oldParentType = state.parentType;
                state.parentType = 'reference';
                for (; nextLine < endLine && !state.isEmpty(nextLine); nextLine++) {
                    if (state.sCount[nextLine] - state.blkIndent > 3) {
                        continue;
                    }
                    if (state.sCount[nextLine] < 0) {
                        continue;
                    }
                    terminate = false;
                    for (i = 0,
                    l = terminatorRules.length; i < l; i++) {
                        if (terminatorRules[i](state, nextLine, endLine, true)) {
                            terminate = true;
                            break;
                        }
                    }
                    if (terminate) {
                        break;
                    }
                }
                str = state.getLines(startLine, nextLine, state.blkIndent, false).trim();
                max = str.length;
                for (pos = 1; pos < max; pos++) {
                    ch = str.charCodeAt(pos);
                    if (ch === 0x5B) {
                        return false;
                    } else if (ch === 0x5D) {
                        labelEnd = pos;
                        break;
                    } else if (ch === 0x0A) {
                        lines++;
                    } else if (ch === 0x5C) {
                        pos++;
                        if (pos < max && str.charCodeAt(pos) === 0x0A) {
                            lines++;
                        }
                    }
                }
                if (labelEnd < 0 || str.charCodeAt(labelEnd + 1) !== 0x3A) {
                    return false;
                }
                for (pos = labelEnd + 2; pos < max; pos++) {
                    ch = str.charCodeAt(pos);
                    if (ch === 0x0A) {
                        lines++;
                    } else if (isSpace(ch)) {} else {
                        break;
                    }
                }
                res = state.md.helpers.parseLinkDestination(str, pos, max);
                if (!res.ok) {
                    return false;
                }
                href = state.md.normalizeLink(res.str);
                if (!state.md.validateLink(href)) {
                    return false;
                }
                pos = res.pos;
                lines += res.lines;
                destEndPos = pos;
                destEndLineNo = lines;
                start = pos;
                for (; pos < max; pos++) {
                    ch = str.charCodeAt(pos);
                    if (ch === 0x0A) {
                        lines++;
                    } else if (isSpace(ch)) {} else {
                        break;
                    }
                }
                res = state.md.helpers.parseLinkTitle(str, pos, max);
                if (pos < max && start !== pos && res.ok) {
                    title = res.str;
                    pos = res.pos;
                    lines += res.lines;
                } else {
                    title = '';
                    pos = destEndPos;
                    lines = destEndLineNo;
                }
                while (pos < max) {
                    ch = str.charCodeAt(pos);
                    if (!isSpace(ch)) {
                        break;
                    }
                    pos++;
                }
                if (pos < max && str.charCodeAt(pos) !== 0x0A) {
                    if (title) {
                        title = '';
                        pos = destEndPos;
                        lines = destEndLineNo;
                        while (pos < max) {
                            ch = str.charCodeAt(pos);
                            if (!isSpace(ch)) {
                                break;
                            }
                            pos++;
                        }
                    }
                }
                if (pos < max && str.charCodeAt(pos) !== 0x0A) {
                    return false;
                }
                label = normalizeReference(str.slice(1, labelEnd));
                if (!label) {
                    return false;
                }
                if (silent) {
                    return true;
                }
                if (typeof state.env.references === 'undefined') {
                    state.env.references = {};
                }
                if (typeof state.env.references[label] === 'undefined') {
                    state.env.references[label] = {
                        title: title,
                        href: href
                    };
                }
                state.parentType = oldParentType;
                state.line = startLine + lines + 1;
                return true;
            }
            ;
        }
        , {
            "../common/utils": 4
        }],
        28: [function(require, module, exports) {
            'use strict';
            var Token = require('../token');
            var isSpace = require('../common/utils').isSpace;
            function StateBlock(src, md, env, tokens) {
                var ch, s, start, pos, len, indent, offset, indent_found;
                this.src = src;
                this.md = md;
                this.env = env;
                this.tokens = tokens;
                this.bMarks = [];
                this.eMarks = [];
                this.tShift = [];
                this.sCount = [];
                this.bsCount = [];
                this.blkIndent = 0;
                this.line = 0;
                this.lineMax = 0;
                this.tight = false;
                this.ddIndent = -1;
                this.listIndent = -1;
                this.parentType = 'root';
                this.level = 0;
                this.result = '';
                s = this.src;
                indent_found = false;
                for (start = pos = indent = offset = 0,
                len = s.length; pos < len; pos++) {
                    ch = s.charCodeAt(pos);
                    if (!indent_found) {
                        if (isSpace(ch)) {
                            indent++;
                            if (ch === 0x09) {
                                offset += 4 - offset % 4;
                            } else {
                                offset++;
                            }
                            continue;
                        } else {
                            indent_found = true;
                        }
                    }
                    if (ch === 0x0A || pos === len - 1) {
                        if (ch !== 0x0A) {
                            pos++;
                        }
                        this.bMarks.push(start);
                        this.eMarks.push(pos);
                        this.tShift.push(indent);
                        this.sCount.push(offset);
                        this.bsCount.push(0);
                        indent_found = false;
                        indent = 0;
                        offset = 0;
                        start = pos + 1;
                    }
                }
                this.bMarks.push(s.length);
                this.eMarks.push(s.length);
                this.tShift.push(0);
                this.sCount.push(0);
                this.bsCount.push(0);
                this.lineMax = this.bMarks.length - 1;
            }
            StateBlock.prototype.push = function(type, tag, nesting) {
                var token = new Token(type,tag,nesting);
                token.block = true;
                if (nesting < 0)
                    this.level--;
                token.level = this.level;
                if (nesting > 0)
                    this.level++;
                this.tokens.push(token);
                return token;
            }
            ;
            StateBlock.prototype.isEmpty = function isEmpty(line) {
                return this.bMarks[line] + this.tShift[line] >= this.eMarks[line];
            }
            ;
            StateBlock.prototype.skipEmptyLines = function skipEmptyLines(from) {
                for (var max = this.lineMax; from < max; from++) {
                    if (this.bMarks[from] + this.tShift[from] < this.eMarks[from]) {
                        break;
                    }
                }
                return from;
            }
            ;
            StateBlock.prototype.skipSpaces = function skipSpaces(pos) {
                var ch;
                for (var max = this.src.length; pos < max; pos++) {
                    ch = this.src.charCodeAt(pos);
                    if (!isSpace(ch)) {
                        break;
                    }
                }
                return pos;
            }
            ;
            StateBlock.prototype.skipSpacesBack = function skipSpacesBack(pos, min) {
                if (pos <= min) {
                    return pos;
                }
                while (pos > min) {
                    if (!isSpace(this.src.charCodeAt(--pos))) {
                        return pos + 1;
                    }
                }
                return pos;
            }
            ;
            StateBlock.prototype.skipChars = function skipChars(pos, code) {
                for (var max = this.src.length; pos < max; pos++) {
                    if (this.src.charCodeAt(pos) !== code) {
                        break;
                    }
                }
                return pos;
            }
            ;
            StateBlock.prototype.skipCharsBack = function skipCharsBack(pos, code, min) {
                if (pos <= min) {
                    return pos;
                }
                while (pos > min) {
                    if (code !== this.src.charCodeAt(--pos)) {
                        return pos + 1;
                    }
                }
                return pos;
            }
            ;
            StateBlock.prototype.getLines = function getLines(begin, end, indent, keepLastLF) {
                var i, lineIndent, ch, first, last, queue, lineStart, line = begin;
                if (begin >= end) {
                    return '';
                }
                queue = new Array(end - begin);
                for (i = 0; line < end; line++,
                i++) {
                    lineIndent = 0;
                    lineStart = first = this.bMarks[line];
                    if (line + 1 < end || keepLastLF) {
                        last = this.eMarks[line] + 1;
                    } else {
                        last = this.eMarks[line];
                    }
                    while (first < last && lineIndent < indent) {
                        ch = this.src.charCodeAt(first);
                        if (isSpace(ch)) {
                            if (ch === 0x09) {
                                lineIndent += 4 - (lineIndent + this.bsCount[line]) % 4;
                            } else {
                                lineIndent++;
                            }
                        } else if (first - lineStart < this.tShift[line]) {
                            lineIndent++;
                        } else {
                            break;
                        }
                        first++;
                    }
                    if (lineIndent > indent) {
                        queue[i] = new Array(lineIndent - indent + 1).join(' ') + this.src.slice(first, last);
                    } else {
                        queue[i] = this.src.slice(first, last);
                    }
                }
                return queue.join('');
            }
            ;
            StateBlock.prototype.Token = Token;
            module.exports = StateBlock;
        }
        , {
            "../common/utils": 4,
            "../token": 51
        }],
        29: [function(require, module, exports) {
            'use strict';
            var isSpace = require('../common/utils').isSpace;
            function getLine(state, line) {
                var pos = state.bMarks[line] + state.blkIndent
                  , max = state.eMarks[line];
                return state.src.substr(pos, max - pos);
            }
            function escapedSplit(str) {
                var result = [], pos = 0, max = str.length, ch, escapes = 0, lastPos = 0, backTicked = false, lastBackTick = 0;
                ch = str.charCodeAt(pos);
                while (pos < max) {
                    if (ch === 0x60) {
                        if (backTicked) {
                            backTicked = false;
                            lastBackTick = pos;
                        } else if (escapes % 2 === 0) {
                            backTicked = true;
                            lastBackTick = pos;
                        }
                    } else if (ch === 0x7c && (escapes % 2 === 0) && !backTicked) {
                        result.push(str.substring(lastPos, pos));
                        lastPos = pos + 1;
                    }
                    if (ch === 0x5c) {
                        escapes++;
                    } else {
                        escapes = 0;
                    }
                    pos++;
                    if (pos === max && backTicked) {
                        backTicked = false;
                        pos = lastBackTick + 1;
                    }
                    ch = str.charCodeAt(pos);
                }
                result.push(str.substring(lastPos));
                return result;
            }
            module.exports = function table(state, startLine, endLine, silent) {
                var ch, lineText, pos, i, nextLine, columns, columnCount, token, aligns, t, tableLines, tbodyLines;
                if (startLine + 2 > endLine) {
                    return false;
                }
                nextLine = startLine + 1;
                if (state.sCount[nextLine] < state.blkIndent) {
                    return false;
                }
                if (state.sCount[nextLine] - state.blkIndent >= 4) {
                    return false;
                }
                pos = state.bMarks[nextLine] + state.tShift[nextLine];
                if (pos >= state.eMarks[nextLine]) {
                    return false;
                }
                ch = state.src.charCodeAt(pos++);
                if (ch !== 0x7C && ch !== 0x2D && ch !== 0x3A) {
                    return false;
                }
                while (pos < state.eMarks[nextLine]) {
                    ch = state.src.charCodeAt(pos);
                    if (ch !== 0x7C && ch !== 0x2D && ch !== 0x3A && !isSpace(ch)) {
                        return false;
                    }
                    pos++;
                }
                lineText = getLine(state, startLine + 1);
                columns = lineText.split('|');
                aligns = [];
                for (i = 0; i < columns.length; i++) {
                    t = columns[i].trim();
                    if (!t) {
                        if (i === 0 || i === columns.length - 1) {
                            continue;
                        } else {
                            return false;
                        }
                    }
                    if (!/^:?-+:?$/.test(t)) {
                        return false;
                    }
                    if (t.charCodeAt(t.length - 1) === 0x3A) {
                        aligns.push(t.charCodeAt(0) === 0x3A ? 'center' : 'right');
                    } else if (t.charCodeAt(0) === 0x3A) {
                        aligns.push('left');
                    } else {
                        aligns.push('');
                    }
                }
                lineText = getLine(state, startLine).trim();
                if (lineText.indexOf('|') === -1) {
                    return false;
                }
                if (state.sCount[startLine] - state.blkIndent >= 4) {
                    return false;
                }
                columns = escapedSplit(lineText.replace(/^\||\|$/g, ''));
                columnCount = columns.length;
                if (columnCount > aligns.length) {
                    return false;
                }
                if (silent) {
                    return true;
                }
                token = state.push('table_open', 'table', 1);
                token.map = tableLines = [startLine, 0];
                token = state.push('thead_open', 'thead', 1);
                token.map = [startLine, startLine + 1];
                token = state.push('tr_open', 'tr', 1);
                token.map = [startLine, startLine + 1];
                for (i = 0; i < columns.length; i++) {
                    token = state.push('th_open', 'th', 1);
                    token.map = [startLine, startLine + 1];
                    if (aligns[i]) {
                        token.attrs = [['style', 'text-align:' + aligns[i]]];
                    }
                    token = state.push('inline', '', 0);
                    token.content = columns[i].trim();
                    token.map = [startLine, startLine + 1];
                    token.children = [];
                    token = state.push('th_close', 'th', -1);
                }
                token = state.push('tr_close', 'tr', -1);
                token = state.push('thead_close', 'thead', -1);
                token = state.push('tbody_open', 'tbody', 1);
                token.map = tbodyLines = [startLine + 2, 0];
                for (nextLine = startLine + 2; nextLine < endLine; nextLine++) {
                    if (state.sCount[nextLine] < state.blkIndent) {
                        break;
                    }
                    lineText = getLine(state, nextLine).trim();
                    if (lineText.indexOf('|') === -1) {
                        break;
                    }
                    if (state.sCount[nextLine] - state.blkIndent >= 4) {
                        break;
                    }
                    columns = escapedSplit(lineText.replace(/^\||\|$/g, ''));
                    token = state.push('tr_open', 'tr', 1);
                    for (i = 0; i < columnCount; i++) {
                        token = state.push('td_open', 'td', 1);
                        if (aligns[i]) {
                            token.attrs = [['style', 'text-align:' + aligns[i]]];
                        }
                        token = state.push('inline', '', 0);
                        token.content = columns[i] ? columns[i].trim() : '';
                        token.children = [];
                        token = state.push('td_close', 'td', -1);
                    }
                    token = state.push('tr_close', 'tr', -1);
                }
                token = state.push('tbody_close', 'tbody', -1);
                token = state.push('table_close', 'table', -1);
                tableLines[1] = tbodyLines[1] = nextLine;
                state.line = nextLine;
                return true;
            }
            ;
        }
        , {
            "../common/utils": 4
        }],
        30: [function(require, module, exports) {
            'use strict';
            module.exports = function block(state) {
                var token;
                if (state.inlineMode) {
                    token = new state.Token('inline','',0);
                    token.content = state.src;
                    token.map = [0, 1];
                    token.children = [];
                    state.tokens.push(token);
                } else {
                    state.md.block.parse(state.src, state.md, state.env, state.tokens);
                }
            }
            ;
        }
        , {}],
        31: [function(require, module, exports) {
            'use strict';
            module.exports = function inline(state) {
                var tokens = state.tokens, tok, i, l;
                for (i = 0,
                l = tokens.length; i < l; i++) {
                    tok = tokens[i];
                    if (tok.type === 'inline') {
                        state.md.inline.parse(tok.content, state.md, state.env, tok.children);
                    }
                }
            }
            ;
        }
        , {}],
        32: [function(require, module, exports) {
            'use strict';
            var arrayReplaceAt = require('../common/utils').arrayReplaceAt;
            function isLinkOpen(str) {
                return /^<a[>\s]/i.test(str);
            }
            function isLinkClose(str) {
                return /^<\/a\s*>/i.test(str);
            }
            module.exports = function linkify(state) {
                var i, j, l, tokens, token, currentToken, nodes, ln, text, pos, lastPos, level, htmlLinkLevel, url, fullUrl, urlText, blockTokens = state.tokens, links;
                if (!state.md.options.linkify) {
                    return;
                }
                for (j = 0,
                l = blockTokens.length; j < l; j++) {
                    if (blockTokens[j].type !== 'inline' || !state.md.linkify.pretest(blockTokens[j].content)) {
                        continue;
                    }
                    tokens = blockTokens[j].children;
                    htmlLinkLevel = 0;
                    for (i = tokens.length - 1; i >= 0; i--) {
                        currentToken = tokens[i];
                        if (currentToken.type === 'link_close') {
                            i--;
                            while (tokens[i].level !== currentToken.level && tokens[i].type !== 'link_open') {
                                i--;
                            }
                            continue;
                        }
                        if (currentToken.type === 'html_inline') {
                            if (isLinkOpen(currentToken.content) && htmlLinkLevel > 0) {
                                htmlLinkLevel--;
                            }
                            if (isLinkClose(currentToken.content)) {
                                htmlLinkLevel++;
                            }
                        }
                        if (htmlLinkLevel > 0) {
                            continue;
                        }
                        if (currentToken.type === 'text' && state.md.linkify.test(currentToken.content)) {
                            text = currentToken.content;
                            links = state.md.linkify.match(text);
                            nodes = [];
                            level = currentToken.level;
                            lastPos = 0;
                            for (ln = 0; ln < links.length; ln++) {
                                url = links[ln].url;
                                fullUrl = state.md.normalizeLink(url);
                                if (!state.md.validateLink(fullUrl)) {
                                    continue;
                                }
                                urlText = links[ln].text;
                                if (!links[ln].schema) {
                                    urlText = state.md.normalizeLinkText('http://' + urlText).replace(/^http:\/\//, '');
                                } else if (links[ln].schema === 'mailto:' && !/^mailto:/i.test(urlText)) {
                                    urlText = state.md.normalizeLinkText('mailto:' + urlText).replace(/^mailto:/, '');
                                } else {
                                    urlText = state.md.normalizeLinkText(urlText);
                                }
                                pos = links[ln].index;
                                if (pos > lastPos) {
                                    token = new state.Token('text','',0);
                                    token.content = text.slice(lastPos, pos);
                                    token.level = level;
                                    nodes.push(token);
                                }
                                token = new state.Token('link_open','a',1);
                                token.attrs = [['href', fullUrl]];
                                token.level = level++;
                                token.markup = 'linkify';
                                token.info = 'auto';
                                nodes.push(token);
                                token = new state.Token('text','',0);
                                token.content = urlText;
                                token.level = level;
                                nodes.push(token);
                                token = new state.Token('link_close','a',-1);
                                token.level = --level;
                                token.markup = 'linkify';
                                token.info = 'auto';
                                nodes.push(token);
                                lastPos = links[ln].lastIndex;
                            }
                            if (lastPos < text.length) {
                                token = new state.Token('text','',0);
                                token.content = text.slice(lastPos);
                                token.level = level;
                                nodes.push(token);
                            }
                            blockTokens[j].children = tokens = arrayReplaceAt(tokens, i, nodes);
                        }
                    }
                }
            }
            ;
        }
        , {
            "../common/utils": 4
        }],
        33: [function(require, module, exports) {
            'use strict';
            var NEWLINES_RE = /\r\n?|\n/g;
            var NULL_RE = /\0/g;
            module.exports = function normalize(state) {
                var str;
                str = state.src.replace(NEWLINES_RE, '\n');
                str = str.replace(NULL_RE, '\uFFFD');
                state.src = str;
            }
            ;
        }
        , {}],
        34: [function(require, module, exports) {
            'use strict';
            var RARE_RE = /\+-|\.\.|\?\?\?\?|!!!!|,,|--/;
            var SCOPED_ABBR_TEST_RE = /\((c|tm|r|p)\)/i;
            var SCOPED_ABBR_RE = /\((c|tm|r|p)\)/ig;
            var SCOPED_ABBR = {
                c: '©',
                r: '®',
                p: '§',
                tm: '™'
            };
            function replaceFn(match, name) {
                return SCOPED_ABBR[name.toLowerCase()];
            }
            function replace_scoped(inlineTokens) {
                var i, token, inside_autolink = 0;
                for (i = inlineTokens.length - 1; i >= 0; i--) {
                    token = inlineTokens[i];
                    if (token.type === 'text' && !inside_autolink) {
                        token.content = token.content.replace(SCOPED_ABBR_RE, replaceFn);
                    }
                    if (token.type === 'link_open' && token.info === 'auto') {
                        inside_autolink--;
                    }
                    if (token.type === 'link_close' && token.info === 'auto') {
                        inside_autolink++;
                    }
                }
            }
            function replace_rare(inlineTokens) {
                var i, token, inside_autolink = 0;
                for (i = inlineTokens.length - 1; i >= 0; i--) {
                    token = inlineTokens[i];
                    if (token.type === 'text' && !inside_autolink) {
                        if (RARE_RE.test(token.content)) {
                            token.content = token.content.replace(/\+-/g, '±').replace(/\.{2,}/g, '…').replace(/([?!])…/g, '$1..').replace(/([?!]){4,}/g, '$1$1$1').replace(/,{2,}/g, ',').replace(/(^|[^-])---(?=[^-]|$)/mg, '$1\u2014').replace(/(^|\s)--(?=\s|$)/mg, '$1\u2013').replace(/(^|[^-\s])--(?=[^-\s]|$)/mg, '$1\u2013');
                        }
                    }
                    if (token.type === 'link_open' && token.info === 'auto') {
                        inside_autolink--;
                    }
                    if (token.type === 'link_close' && token.info === 'auto') {
                        inside_autolink++;
                    }
                }
            }
            module.exports = function replace(state) {
                var blkIdx;
                if (!state.md.options.typographer) {
                    return;
                }
                for (blkIdx = state.tokens.length - 1; blkIdx >= 0; blkIdx--) {
                    if (state.tokens[blkIdx].type !== 'inline') {
                        continue;
                    }
                    if (SCOPED_ABBR_TEST_RE.test(state.tokens[blkIdx].content)) {
                        replace_scoped(state.tokens[blkIdx].children);
                    }
                    if (RARE_RE.test(state.tokens[blkIdx].content)) {
                        replace_rare(state.tokens[blkIdx].children);
                    }
                }
            }
            ;
        }
        , {}],
        35: [function(require, module, exports) {
            'use strict';
            var isWhiteSpace = require('../common/utils').isWhiteSpace;
            var isPunctChar = require('../common/utils').isPunctChar;
            var isMdAsciiPunct = require('../common/utils').isMdAsciiPunct;
            var QUOTE_TEST_RE = /['"]/;
            var QUOTE_RE = /['"]/g;
            var APOSTROPHE = '\u2019';
            function replaceAt(str, index, ch) {
                return str.substr(0, index) + ch + str.substr(index + 1);
            }
            function process_inlines(tokens, state) {
                var i, token, text, t, pos, max, thisLevel, item, lastChar, nextChar, isLastPunctChar, isNextPunctChar, isLastWhiteSpace, isNextWhiteSpace, canOpen, canClose, j, isSingle, stack, openQuote, closeQuote;
                stack = [];
                for (i = 0; i < tokens.length; i++) {
                    token = tokens[i];
                    thisLevel = tokens[i].level;
                    for (j = stack.length - 1; j >= 0; j--) {
                        if (stack[j].level <= thisLevel) {
                            break;
                        }
                    }
                    stack.length = j + 1;
                    if (token.type !== 'text') {
                        continue;
                    }
                    text = token.content;
                    pos = 0;
                    max = text.length;
                    OUTER: while (pos < max) {
                        QUOTE_RE.lastIndex = pos;
                        t = QUOTE_RE.exec(text);
                        if (!t) {
                            break;
                        }
                        canOpen = canClose = true;
                        pos = t.index + 1;
                        isSingle = (t[0] === "'");
                        lastChar = 0x20;
                        if (t.index - 1 >= 0) {
                            lastChar = text.charCodeAt(t.index - 1);
                        } else {
                            for (j = i - 1; j >= 0; j--) {
                                if (tokens[j].type === 'softbreak' || tokens[j].type === 'hardbreak')
                                    break;
                                if (tokens[j].type !== 'text')
                                    continue;
                                lastChar = tokens[j].content.charCodeAt(tokens[j].content.length - 1);
                                break;
                            }
                        }
                        nextChar = 0x20;
                        if (pos < max) {
                            nextChar = text.charCodeAt(pos);
                        } else {
                            for (j = i + 1; j < tokens.length; j++) {
                                if (tokens[j].type === 'softbreak' || tokens[j].type === 'hardbreak')
                                    break;
                                if (tokens[j].type !== 'text')
                                    continue;
                                nextChar = tokens[j].content.charCodeAt(0);
                                break;
                            }
                        }
                        isLastPunctChar = isMdAsciiPunct(lastChar) || isPunctChar(String.fromCharCode(lastChar));
                        isNextPunctChar = isMdAsciiPunct(nextChar) || isPunctChar(String.fromCharCode(nextChar));
                        isLastWhiteSpace = isWhiteSpace(lastChar);
                        isNextWhiteSpace = isWhiteSpace(nextChar);
                        if (isNextWhiteSpace) {
                            canOpen = false;
                        } else if (isNextPunctChar) {
                            if (!(isLastWhiteSpace || isLastPunctChar)) {
                                canOpen = false;
                            }
                        }
                        if (isLastWhiteSpace) {
                            canClose = false;
                        } else if (isLastPunctChar) {
                            if (!(isNextWhiteSpace || isNextPunctChar)) {
                                canClose = false;
                            }
                        }
                        if (nextChar === 0x22 && t[0] === '"') {
                            if (lastChar >= 0x30 && lastChar <= 0x39) {
                                canClose = canOpen = false;
                            }
                        }
                        if (canOpen && canClose) {
                            canOpen = isLastPunctChar;
                            canClose = isNextPunctChar;
                        }
                        if (!canOpen && !canClose) {
                            if (isSingle) {
                                token.content = replaceAt(token.content, t.index, APOSTROPHE);
                            }
                            continue;
                        }
                        if (canClose) {
                            for (j = stack.length - 1; j >= 0; j--) {
                                item = stack[j];
                                if (stack[j].level < thisLevel) {
                                    break;
                                }
                                if (item.single === isSingle && stack[j].level === thisLevel) {
                                    item = stack[j];
                                    if (isSingle) {
                                        openQuote = state.md.options.quotes[2];
                                        closeQuote = state.md.options.quotes[3];
                                    } else {
                                        openQuote = state.md.options.quotes[0];
                                        closeQuote = state.md.options.quotes[1];
                                    }
                                    token.content = replaceAt(token.content, t.index, closeQuote);
                                    tokens[item.token].content = replaceAt(tokens[item.token].content, item.pos, openQuote);
                                    pos += closeQuote.length - 1;
                                    if (item.token === i) {
                                        pos += openQuote.length - 1;
                                    }
                                    text = token.content;
                                    max = text.length;
                                    stack.length = j;
                                    continue OUTER;
                                }
                            }
                        }
                        if (canOpen) {
                            stack.push({
                                token: i,
                                pos: t.index,
                                single: isSingle,
                                level: thisLevel
                            });
                        } else if (canClose && isSingle) {
                            token.content = replaceAt(token.content, t.index, APOSTROPHE);
                        }
                    }
                }
            }
            module.exports = function smartquotes(state) {
                var blkIdx;
                if (!state.md.options.typographer) {
                    return;
                }
                for (blkIdx = state.tokens.length - 1; blkIdx >= 0; blkIdx--) {
                    if (state.tokens[blkIdx].type !== 'inline' || !QUOTE_TEST_RE.test(state.tokens[blkIdx].content)) {
                        continue;
                    }
                    process_inlines(state.tokens[blkIdx].children, state);
                }
            }
            ;
        }
        , {
            "../common/utils": 4
        }],
        36: [function(require, module, exports) {
            'use strict';
            var Token = require('../token');
            function StateCore(src, md, env) {
                this.src = src;
                this.env = env;
                this.tokens = [];
                this.inlineMode = false;
                this.md = md;
            }
            StateCore.prototype.Token = Token;
            module.exports = StateCore;
        }
        , {
            "../token": 51
        }],
        37: [function(require, module, exports) {
            'use strict';
            var EMAIL_RE = /^<([a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*)>/;
            var AUTOLINK_RE = /^<([a-zA-Z][a-zA-Z0-9+.\-]{1,31}):([^<>\x00-\x20]*)>/;
            module.exports = function autolink(state, silent) {
                var tail, linkMatch, emailMatch, url, fullUrl, token, pos = state.pos;
                if (state.src.charCodeAt(pos) !== 0x3C) {
                    return false;
                }
                tail = state.src.slice(pos);
                if (tail.indexOf('>') < 0) {
                    return false;
                }
                if (AUTOLINK_RE.test(tail)) {
                    linkMatch = tail.match(AUTOLINK_RE);
                    url = linkMatch[0].slice(1, -1);
                    fullUrl = state.md.normalizeLink(url);
                    if (!state.md.validateLink(fullUrl)) {
                        return false;
                    }
                    if (!silent) {
                        token = state.push('link_open', 'a', 1);
                        token.attrs = [['href', fullUrl]];
                        token.markup = 'autolink';
                        token.info = 'auto';
                        token = state.push('text', '', 0);
                        token.content = state.md.normalizeLinkText(url);
                        token = state.push('link_close', 'a', -1);
                        token.markup = 'autolink';
                        token.info = 'auto';
                    }
                    state.pos += linkMatch[0].length;
                    return true;
                }
                if (EMAIL_RE.test(tail)) {
                    emailMatch = tail.match(EMAIL_RE);
                    url = emailMatch[0].slice(1, -1);
                    fullUrl = state.md.normalizeLink('mailto:' + url);
                    if (!state.md.validateLink(fullUrl)) {
                        return false;
                    }
                    if (!silent) {
                        token = state.push('link_open', 'a', 1);
                        token.attrs = [['href', fullUrl]];
                        token.markup = 'autolink';
                        token.info = 'auto';
                        token = state.push('text', '', 0);
                        token.content = state.md.normalizeLinkText(url);
                        token = state.push('link_close', 'a', -1);
                        token.markup = 'autolink';
                        token.info = 'auto';
                    }
                    state.pos += emailMatch[0].length;
                    return true;
                }
                return false;
            }
            ;
        }
        , {}],
        38: [function(require, module, exports) {
            'use strict';
            module.exports = function backtick(state, silent) {
                var start, max, marker, matchStart, matchEnd, token, pos = state.pos, ch = state.src.charCodeAt(pos);
                if (ch !== 0x60) {
                    return false;
                }
                start = pos;
                pos++;
                max = state.posMax;
                while (pos < max && state.src.charCodeAt(pos) === 0x60) {
                    pos++;
                }
                marker = state.src.slice(start, pos);
                matchStart = matchEnd = pos;
                while ((matchStart = state.src.indexOf('`', matchEnd)) !== -1) {
                    matchEnd = matchStart + 1;
                    while (matchEnd < max && state.src.charCodeAt(matchEnd) === 0x60) {
                        matchEnd++;
                    }
                    if (matchEnd - matchStart === marker.length) {
                        if (!silent) {
                            token = state.push('code_inline', 'code', 0);
                            token.markup = marker;
                            token.content = state.src.slice(pos, matchStart).replace(/\n/g, ' ').replace(/^ (.+) $/, '$1');
                        }
                        state.pos = matchEnd;
                        return true;
                    }
                }
                if (!silent) {
                    state.pending += marker;
                }
                state.pos += marker.length;
                return true;
            }
            ;
        }
        , {}],
        39: [function(require, module, exports) {
            'use strict';
            function processDelimiters(state, delimiters) {
                var closerIdx, openerIdx, closer, opener, minOpenerIdx, newMinOpenerIdx, isOddMatch, lastJump, openersBottom = {}, max = delimiters.length;
                for (closerIdx = 0; closerIdx < max; closerIdx++) {
                    closer = delimiters[closerIdx];
                    closer.length = closer.length || 0;
                    if (!closer.close)
                        continue;
                    if (!openersBottom.hasOwnProperty(closer.marker)) {
                        openersBottom[closer.marker] = [-1, -1, -1];
                    }
                    minOpenerIdx = openersBottom[closer.marker][closer.length % 3];
                    newMinOpenerIdx = -1;
                    openerIdx = closerIdx - closer.jump - 1;
                    for (; openerIdx > minOpenerIdx; openerIdx -= opener.jump + 1) {
                        opener = delimiters[openerIdx];
                        if (opener.marker !== closer.marker)
                            continue;
                        if (newMinOpenerIdx === -1)
                            newMinOpenerIdx = openerIdx;
                        if (opener.open && opener.end < 0 && opener.level === closer.level) {
                            isOddMatch = false;
                            if (opener.close || closer.open) {
                                if ((opener.length + closer.length) % 3 === 0) {
                                    if (opener.length % 3 !== 0 || closer.length % 3 !== 0) {
                                        isOddMatch = true;
                                    }
                                }
                            }
                            if (!isOddMatch) {
                                lastJump = openerIdx > 0 && !delimiters[openerIdx - 1].open ? delimiters[openerIdx - 1].jump + 1 : 0;
                                closer.jump = closerIdx - openerIdx + lastJump;
                                closer.open = false;
                                opener.end = closerIdx;
                                opener.jump = lastJump;
                                opener.close = false;
                                newMinOpenerIdx = -1;
                                break;
                            }
                        }
                    }
                    if (newMinOpenerIdx !== -1) {
                        openersBottom[closer.marker][(closer.length || 0) % 3] = newMinOpenerIdx;
                    }
                }
            }
            module.exports = function link_pairs(state) {
                var curr, tokens_meta = state.tokens_meta, max = state.tokens_meta.length;
                processDelimiters(state, state.delimiters);
                for (curr = 0; curr < max; curr++) {
                    if (tokens_meta[curr] && tokens_meta[curr].delimiters) {
                        processDelimiters(state, tokens_meta[curr].delimiters);
                    }
                }
            }
            ;
        }
        , {}],
        40: [function(require, module, exports) {
            'use strict';
            module.exports.tokenize = function emphasis(state, silent) {
                var i, scanned, token, start = state.pos, marker = state.src.charCodeAt(start);
                if (silent) {
                    return false;
                }
                if (marker !== 0x5F && marker !== 0x2A) {
                    return false;
                }
                scanned = state.scanDelims(state.pos, marker === 0x2A);
                for (i = 0; i < scanned.length; i++) {
                    token = state.push('text', '', 0);
                    token.content = String.fromCharCode(marker);
                    state.delimiters.push({
                        marker: marker,
                        length: scanned.length,
                        jump: i,
                        token: state.tokens.length - 1,
                        end: -1,
                        open: scanned.can_open,
                        close: scanned.can_close
                    });
                }
                state.pos += scanned.length;
                return true;
            }
            ;
            function postProcess(state, delimiters) {
                var i, startDelim, endDelim, token, ch, isStrong, max = delimiters.length;
                for (i = max - 1; i >= 0; i--) {
                    startDelim = delimiters[i];
                    if (startDelim.marker !== 0x5F && startDelim.marker !== 0x2A) {
                        continue;
                    }
                    if (startDelim.end === -1) {
                        continue;
                    }
                    endDelim = delimiters[startDelim.end];
                    isStrong = i > 0 && delimiters[i - 1].end === startDelim.end + 1 && delimiters[i - 1].token === startDelim.token - 1 && delimiters[startDelim.end + 1].token === endDelim.token + 1 && delimiters[i - 1].marker === startDelim.marker;
                    ch = String.fromCharCode(startDelim.marker);
                    token = state.tokens[startDelim.token];
                    token.type = isStrong ? 'strong_open' : 'em_open';
                    token.tag = isStrong ? 'strong' : 'em';
                    token.nesting = 1;
                    token.markup = isStrong ? ch + ch : ch;
                    token.content = '';
                    token = state.tokens[endDelim.token];
                    token.type = isStrong ? 'strong_close' : 'em_close';
                    token.tag = isStrong ? 'strong' : 'em';
                    token.nesting = -1;
                    token.markup = isStrong ? ch + ch : ch;
                    token.content = '';
                    if (isStrong) {
                        state.tokens[delimiters[i - 1].token].content = '';
                        state.tokens[delimiters[startDelim.end + 1].token].content = '';
                        i--;
                    }
                }
            }
            module.exports.postProcess = function emphasis(state) {
                var curr, tokens_meta = state.tokens_meta, max = state.tokens_meta.length;
                postProcess(state, state.delimiters);
                for (curr = 0; curr < max; curr++) {
                    if (tokens_meta[curr] && tokens_meta[curr].delimiters) {
                        postProcess(state, tokens_meta[curr].delimiters);
                    }
                }
            }
            ;
        }
        , {}],
        41: [function(require, module, exports) {
            'use strict';
            var entities = require('../common/entities');
            var has = require('../common/utils').has;
            var isValidEntityCode = require('../common/utils').isValidEntityCode;
            var fromCodePoint = require('../common/utils').fromCodePoint;
            var DIGITAL_RE = /^&#((?:x[a-f0-9]{1,6}|[0-9]{1,7}));/i;
            var NAMED_RE = /^&([a-z][a-z0-9]{1,31});/i;
            module.exports = function entity(state, silent) {
                var ch, code, match, pos = state.pos, max = state.posMax;
                if (state.src.charCodeAt(pos) !== 0x26) {
                    return false;
                }
                if (pos + 1 < max) {
                    ch = state.src.charCodeAt(pos + 1);
                    if (ch === 0x23) {
                        match = state.src.slice(pos).match(DIGITAL_RE);
                        if (match) {
                            if (!silent) {
                                code = match[1][0].toLowerCase() === 'x' ? parseInt(match[1].slice(1), 16) : parseInt(match[1], 10);
                                state.pending += isValidEntityCode(code) ? fromCodePoint(code) : fromCodePoint(0xFFFD);
                            }
                            state.pos += match[0].length;
                            return true;
                        }
                    } else {
                        match = state.src.slice(pos).match(NAMED_RE);
                        if (match) {
                            if (has(entities, match[1])) {
                                if (!silent) {
                                    state.pending += entities[match[1]];
                                }
                                state.pos += match[0].length;
                                return true;
                            }
                        }
                    }
                }
                if (!silent) {
                    state.pending += '&';
                }
                state.pos++;
                return true;
            }
            ;
        }
        , {
            "../common/entities": 1,
            "../common/utils": 4
        }],
        42: [function(require, module, exports) {
            'use strict';
            var isSpace = require('../common/utils').isSpace;
            var ESCAPED = [];
            for (var i = 0; i < 256; i++) {
                ESCAPED.push(0);
            }
            '\\!"#$%&\'()*+,./:;<=>?@[]^_`{|}~-'.split('').forEach(function(ch) {
                ESCAPED[ch.charCodeAt(0)] = 1;
            });
            module.exports = function escape(state, silent) {
                var ch, pos = state.pos, max = state.posMax;
                if (state.src.charCodeAt(pos) !== 0x5C) {
                    return false;
                }
                pos++;
                if (pos < max) {
                    ch = state.src.charCodeAt(pos);
                    if (ch < 256 && ESCAPED[ch] !== 0) {
                        if (!silent) {
                            state.pending += state.src[pos];
                        }
                        state.pos += 2;
                        return true;
                    }
                    if (ch === 0x0A) {
                        if (!silent) {
                            state.push('hardbreak', 'br', 0);
                        }
                        pos++;
                        while (pos < max) {
                            ch = state.src.charCodeAt(pos);
                            if (!isSpace(ch)) {
                                break;
                            }
                            pos++;
                        }
                        state.pos = pos;
                        return true;
                    }
                }
                if (!silent) {
                    state.pending += '\\';
                }
                state.pos++;
                return true;
            }
            ;
        }
        , {
            "../common/utils": 4
        }],
        43: [function(require, module, exports) {
            'use strict';
            var HTML_TAG_RE = require('../common/html_re').HTML_TAG_RE;
            function isLetter(ch) {
                var lc = ch | 0x20;
                return (lc >= 0x61) && (lc <= 0x7a);
            }
            module.exports = function html_inline(state, silent) {
                var ch, match, max, token, pos = state.pos;
                if (!state.md.options.html) {
                    return false;
                }
                max = state.posMax;
                if (state.src.charCodeAt(pos) !== 0x3C || pos + 2 >= max) {
                    return false;
                }
                ch = state.src.charCodeAt(pos + 1);
                if (ch !== 0x21 && ch !== 0x3F && ch !== 0x2F && !isLetter(ch)) {
                    return false;
                }
                match = state.src.slice(pos).match(HTML_TAG_RE);
                if (!match) {
                    return false;
                }
                if (!silent) {
                    token = state.push('html_inline', '', 0);
                    token.content = state.src.slice(pos, pos + match[0].length);
                }
                state.pos += match[0].length;
                return true;
            }
            ;
        }
        , {
            "../common/html_re": 3
        }],
        44: [function(require, module, exports) {
            'use strict';
            var normalizeReference = require('../common/utils').normalizeReference;
            var isSpace = require('../common/utils').isSpace;
            module.exports = function image(state, silent) {
                var attrs, code, content, label, labelEnd, labelStart, pos, ref, res, title, token, tokens, start, href = '', oldPos = state.pos, max = state.posMax;
                if (state.src.charCodeAt(state.pos) !== 0x21) {
                    return false;
                }
                if (state.src.charCodeAt(state.pos + 1) !== 0x5B) {
                    return false;
                }
                labelStart = state.pos + 2;
                labelEnd = state.md.helpers.parseLinkLabel(state, state.pos + 1, false);
                if (labelEnd < 0) {
                    return false;
                }
                pos = labelEnd + 1;
                if (pos < max && state.src.charCodeAt(pos) === 0x28) {
                    pos++;
                    for (; pos < max; pos++) {
                        code = state.src.charCodeAt(pos);
                        if (!isSpace(code) && code !== 0x0A) {
                            break;
                        }
                    }
                    if (pos >= max) {
                        return false;
                    }
                    start = pos;
                    res = state.md.helpers.parseLinkDestination(state.src, pos, state.posMax);
                    if (res.ok) {
                        href = state.md.normalizeLink(res.str);
                        if (state.md.validateLink(href)) {
                            pos = res.pos;
                        } else {
                            href = '';
                        }
                    }
                    start = pos;
                    for (; pos < max; pos++) {
                        code = state.src.charCodeAt(pos);
                        if (!isSpace(code) && code !== 0x0A) {
                            break;
                        }
                    }
                    res = state.md.helpers.parseLinkTitle(state.src, pos, state.posMax);
                    if (pos < max && start !== pos && res.ok) {
                        title = res.str;
                        pos = res.pos;
                        for (; pos < max; pos++) {
                            code = state.src.charCodeAt(pos);
                            if (!isSpace(code) && code !== 0x0A) {
                                break;
                            }
                        }
                    } else {
                        title = '';
                    }
                    if (pos >= max || state.src.charCodeAt(pos) !== 0x29) {
                        state.pos = oldPos;
                        return false;
                    }
                    pos++;
                } else {
                    if (typeof state.env.references === 'undefined') {
                        return false;
                    }
                    if (pos < max && state.src.charCodeAt(pos) === 0x5B) {
                        start = pos + 1;
                        pos = state.md.helpers.parseLinkLabel(state, pos);
                        if (pos >= 0) {
                            label = state.src.slice(start, pos++);
                        } else {
                            pos = labelEnd + 1;
                        }
                    } else {
                        pos = labelEnd + 1;
                    }
                    if (!label) {
                        label = state.src.slice(labelStart, labelEnd);
                    }
                    ref = state.env.references[normalizeReference(label)];
                    if (!ref) {
                        state.pos = oldPos;
                        return false;
                    }
                    href = ref.href;
                    title = ref.title;
                }
                if (!silent) {
                    content = state.src.slice(labelStart, labelEnd);
                    state.md.inline.parse(content, state.md, state.env, tokens = []);
                    token = state.push('image', 'img', 0);
                    token.attrs = attrs = [['src', href], ['alt', '']];
                    token.children = tokens;
                    token.content = content;
                    if (title) {
                        attrs.push(['title', title]);
                    }
                }
                state.pos = pos;
                state.posMax = max;
                return true;
            }
            ;
        }
        , {
            "../common/utils": 4
        }],
        45: [function(require, module, exports) {
            'use strict';
            var normalizeReference = require('../common/utils').normalizeReference;
            var isSpace = require('../common/utils').isSpace;
            module.exports = function link(state, silent) {
                var attrs, code, label, labelEnd, labelStart, pos, res, ref, title, token, href = '', oldPos = state.pos, max = state.posMax, start = state.pos, parseReference = true;
                if (state.src.charCodeAt(state.pos) !== 0x5B) {
                    return false;
                }
                labelStart = state.pos + 1;
                labelEnd = state.md.helpers.parseLinkLabel(state, state.pos, true);
                if (labelEnd < 0) {
                    return false;
                }
                pos = labelEnd + 1;
                if (pos < max && state.src.charCodeAt(pos) === 0x28) {
                    parseReference = false;
                    pos++;
                    for (; pos < max; pos++) {
                        code = state.src.charCodeAt(pos);
                        if (!isSpace(code) && code !== 0x0A) {
                            break;
                        }
                    }
                    if (pos >= max) {
                        return false;
                    }
                    start = pos;
                    res = state.md.helpers.parseLinkDestination(state.src, pos, state.posMax);
                    if (res.ok) {
                        href = state.md.normalizeLink(res.str);
                        if (state.md.validateLink(href)) {
                            pos = res.pos;
                        } else {
                            href = '';
                        }
                    }
                    start = pos;
                    for (; pos < max; pos++) {
                        code = state.src.charCodeAt(pos);
                        if (!isSpace(code) && code !== 0x0A) {
                            break;
                        }
                    }
                    res = state.md.helpers.parseLinkTitle(state.src, pos, state.posMax);
                    if (pos < max && start !== pos && res.ok) {
                        title = res.str;
                        pos = res.pos;
                        for (; pos < max; pos++) {
                            code = state.src.charCodeAt(pos);
                            if (!isSpace(code) && code !== 0x0A) {
                                break;
                            }
                        }
                    } else {
                        title = '';
                    }
                    if (pos >= max || state.src.charCodeAt(pos) !== 0x29) {
                        parseReference = true;
                    }
                    pos++;
                }
                if (parseReference) {
                    if (typeof state.env.references === 'undefined') {
                        return false;
                    }
                    if (pos < max && state.src.charCodeAt(pos) === 0x5B) {
                        start = pos + 1;
                        pos = state.md.helpers.parseLinkLabel(state, pos);
                        if (pos >= 0) {
                            label = state.src.slice(start, pos++);
                        } else {
                            pos = labelEnd + 1;
                        }
                    } else {
                        pos = labelEnd + 1;
                    }
                    if (!label) {
                        label = state.src.slice(labelStart, labelEnd);
                    }
                    ref = state.env.references[normalizeReference(label)];
                    if (!ref) {
                        state.pos = oldPos;
                        return false;
                    }
                    href = ref.href;
                    title = ref.title;
                }
                if (!silent) {
                    state.pos = labelStart;
                    state.posMax = labelEnd;
                    token = state.push('link_open', 'a', 1);
                    token.attrs = attrs = [['href', href]];
                    if (title) {
                        attrs.push(['title', title]);
                    }
                    state.md.inline.tokenize(state);
                    token = state.push('link_close', 'a', -1);
                }
                state.pos = pos;
                state.posMax = max;
                return true;
            }
            ;
        }
        , {
            "../common/utils": 4
        }],
        46: [function(require, module, exports) {
            'use strict';
            var isSpace = require('../common/utils').isSpace;
            module.exports = function newline(state, silent) {
                var pmax, max, pos = state.pos;
                if (state.src.charCodeAt(pos) !== 0x0A) {
                    return false;
                }
                pmax = state.pending.length - 1;
                max = state.posMax;
                if (!silent) {
                    if (pmax >= 0 && state.pending.charCodeAt(pmax) === 0x20) {
                        if (pmax >= 1 && state.pending.charCodeAt(pmax - 1) === 0x20) {
                            state.pending = state.pending.replace(/ +$/, '');
                            state.push('hardbreak', 'br', 0);
                        } else {
                            state.pending = state.pending.slice(0, -1);
                            state.push('softbreak', 'br', 0);
                        }
                    } else {
                        state.push('softbreak', 'br', 0);
                    }
                }
                pos++;
                while (pos < max && isSpace(state.src.charCodeAt(pos))) {
                    pos++;
                }
                state.pos = pos;
                return true;
            }
            ;
        }
        , {
            "../common/utils": 4
        }],
        47: [function(require, module, exports) {
            'use strict';
            var Token = require('../token');
            var isWhiteSpace = require('../common/utils').isWhiteSpace;
            var isPunctChar = require('../common/utils').isPunctChar;
            var isMdAsciiPunct = require('../common/utils').isMdAsciiPunct;
            function StateInline(src, md, env, outTokens) {
                this.src = src;
                this.env = env;
                this.md = md;
                this.tokens = outTokens;
                this.tokens_meta = Array(outTokens.length);
                this.pos = 0;
                this.posMax = this.src.length;
                this.level = 0;
                this.pending = '';
                this.pendingLevel = 0;
                this.cache = {};
                this.delimiters = [];
                this._prev_delimiters = [];
            }
            StateInline.prototype.pushPending = function() {
                var token = new Token('text','',0);
                token.content = this.pending;
                token.level = this.pendingLevel;
                this.tokens.push(token);
                this.pending = '';
                return token;
            }
            ;
            StateInline.prototype.push = function(type, tag, nesting) {
                if (this.pending) {
                    this.pushPending();
                }
                var token = new Token(type,tag,nesting);
                var token_meta = null;
                if (nesting < 0) {
                    this.level--;
                    this.delimiters = this._prev_delimiters.pop();
                }
                token.level = this.level;
                if (nesting > 0) {
                    this.level++;
                    this._prev_delimiters.push(this.delimiters);
                    this.delimiters = [];
                    token_meta = {
                        delimiters: this.delimiters
                    };
                }
                this.pendingLevel = this.level;
                this.tokens.push(token);
                this.tokens_meta.push(token_meta);
                return token;
            }
            ;
            StateInline.prototype.scanDelims = function(start, canSplitWord) {
                var pos = start, lastChar, nextChar, count, can_open, can_close, isLastWhiteSpace, isLastPunctChar, isNextWhiteSpace, isNextPunctChar, left_flanking = true, right_flanking = true, max = this.posMax, marker = this.src.charCodeAt(start);
                lastChar = start > 0 ? this.src.charCodeAt(start - 1) : 0x20;
                while (pos < max && this.src.charCodeAt(pos) === marker) {
                    pos++;
                }
                count = pos - start;
                nextChar = pos < max ? this.src.charCodeAt(pos) : 0x20;
                isLastPunctChar = isMdAsciiPunct(lastChar) || isPunctChar(String.fromCharCode(lastChar));
                isNextPunctChar = isMdAsciiPunct(nextChar) || isPunctChar(String.fromCharCode(nextChar));
                isLastWhiteSpace = isWhiteSpace(lastChar);
                isNextWhiteSpace = isWhiteSpace(nextChar);
                if (isNextWhiteSpace) {
                    left_flanking = false;
                } else if (isNextPunctChar) {
                    if (!(isLastWhiteSpace || isLastPunctChar)) {
                        left_flanking = false;
                    }
                }
                if (isLastWhiteSpace) {
                    right_flanking = false;
                } else if (isLastPunctChar) {
                    if (!(isNextWhiteSpace || isNextPunctChar)) {
                        right_flanking = false;
                    }
                }
                if (!canSplitWord) {
                    can_open = left_flanking && (!right_flanking || isLastPunctChar);
                    can_close = right_flanking && (!left_flanking || isNextPunctChar);
                } else {
                    can_open = left_flanking;
                    can_close = right_flanking;
                }
                return {
                    can_open: can_open,
                    can_close: can_close,
                    length: count
                };
            }
            ;
            StateInline.prototype.Token = Token;
            module.exports = StateInline;
        }
        , {
            "../common/utils": 4,
            "../token": 51
        }],
        48: [function(require, module, exports) {
            'use strict';
            module.exports.tokenize = function strikethrough(state, silent) {
                var i, scanned, token, len, ch, start = state.pos, marker = state.src.charCodeAt(start);
                if (silent) {
                    return false;
                }
                if (marker !== 0x7E) {
                    return false;
                }
                scanned = state.scanDelims(state.pos, true);
                len = scanned.length;
                ch = String.fromCharCode(marker);
                if (len < 2) {
                    return false;
                }
                if (len % 2) {
                    token = state.push('text', '', 0);
                    token.content = ch;
                    len--;
                }
                for (i = 0; i < len; i += 2) {
                    token = state.push('text', '', 0);
                    token.content = ch + ch;
                    state.delimiters.push({
                        marker: marker,
                        length: 0,
                        jump: i,
                        token: state.tokens.length - 1,
                        end: -1,
                        open: scanned.can_open,
                        close: scanned.can_close
                    });
                }
                state.pos += scanned.length;
                return true;
            }
            ;
            function postProcess(state, delimiters) {
                var i, j, startDelim, endDelim, token, loneMarkers = [], max = delimiters.length;
                for (i = 0; i < max; i++) {
                    startDelim = delimiters[i];
                    if (startDelim.marker !== 0x7E) {
                        continue;
                    }
                    if (startDelim.end === -1) {
                        continue;
                    }
                    endDelim = delimiters[startDelim.end];
                    token = state.tokens[startDelim.token];
                    token.type = 's_open';
                    token.tag = 's';
                    token.nesting = 1;
                    token.markup = '~~';
                    token.content = '';
                    token = state.tokens[endDelim.token];
                    token.type = 's_close';
                    token.tag = 's';
                    token.nesting = -1;
                    token.markup = '~~';
                    token.content = '';
                    if (state.tokens[endDelim.token - 1].type === 'text' && state.tokens[endDelim.token - 1].content === '~') {
                        loneMarkers.push(endDelim.token - 1);
                    }
                }
                while (loneMarkers.length) {
                    i = loneMarkers.pop();
                    j = i + 1;
                    while (j < state.tokens.length && state.tokens[j].type === 's_close') {
                        j++;
                    }
                    j--;
                    if (i !== j) {
                        token = state.tokens[j];
                        state.tokens[j] = state.tokens[i];
                        state.tokens[i] = token;
                    }
                }
            }
            module.exports.postProcess = function strikethrough(state) {
                var curr, tokens_meta = state.tokens_meta, max = state.tokens_meta.length;
                postProcess(state, state.delimiters);
                for (curr = 0; curr < max; curr++) {
                    if (tokens_meta[curr] && tokens_meta[curr].delimiters) {
                        postProcess(state, tokens_meta[curr].delimiters);
                    }
                }
            }
            ;
        }
        , {}],
        49: [function(require, module, exports) {
            'use strict';
            function isTerminatorChar(ch) {
                switch (ch) {
                case 0x0A:
                case 0x21:
                case 0x23:
                case 0x24:
                case 0x25:
                case 0x26:
                case 0x2A:
                case 0x2B:
                case 0x2D:
                case 0x3A:
                case 0x3C:
                case 0x3D:
                case 0x3E:
                case 0x40:
                case 0x5B:
                case 0x5C:
                case 0x5D:
                case 0x5E:
                case 0x5F:
                case 0x60:
                case 0x7B:
                case 0x7D:
                case 0x7E:
                    return true;
                default:
                    return false;
                }
            }
            module.exports = function text(state, silent) {
                var pos = state.pos;
                while (pos < state.posMax && !isTerminatorChar(state.src.charCodeAt(pos))) {
                    pos++;
                }
                if (pos === state.pos) {
                    return false;
                }
                if (!silent) {
                    state.pending += state.src.slice(state.pos, pos);
                }
                state.pos = pos;
                return true;
            }
            ;
        }
        , {}],
        50: [function(require, module, exports) {
            'use strict';
            module.exports = function text_collapse(state) {
                var curr, last, level = 0, tokens = state.tokens, max = state.tokens.length;
                for (curr = last = 0; curr < max; curr++) {
                    if (tokens[curr].nesting < 0)
                        level--;
                    tokens[curr].level = level;
                    if (tokens[curr].nesting > 0)
                        level++;
                    if (tokens[curr].type === 'text' && curr + 1 < max && tokens[curr + 1].type === 'text') {
                        tokens[curr + 1].content = tokens[curr].content + tokens[curr + 1].content;
                    } else {
                        if (curr !== last) {
                            tokens[last] = tokens[curr];
                        }
                        last++;
                    }
                }
                if (curr !== last) {
                    tokens.length = last;
                }
            }
            ;
        }
        , {}],
        51: [function(require, module, exports) {
            'use strict';
            function Token(type, tag, nesting) {
                this.type = type;
                this.tag = tag;
                this.attrs = null;
                this.map = null;
                this.nesting = nesting;
                this.level = 0;
                this.children = null;
                this.content = '';
                this.markup = '';
                this.info = '';
                this.meta = null;
                this.block = false;
                this.hidden = false;
            }
            Token.prototype.attrIndex = function attrIndex(name) {
                var attrs, i, len;
                if (!this.attrs) {
                    return -1;
                }
                attrs = this.attrs;
                for (i = 0,
                len = attrs.length; i < len; i++) {
                    if (attrs[i][0] === name) {
                        return i;
                    }
                }
                return -1;
            }
            ;
            Token.prototype.attrPush = function attrPush(attrData) {
                if (this.attrs) {
                    this.attrs.push(attrData);
                } else {
                    this.attrs = [attrData];
                }
            }
            ;
            Token.prototype.attrSet = function attrSet(name, value) {
                var idx = this.attrIndex(name)
                  , attrData = [name, value];
                if (idx < 0) {
                    this.attrPush(attrData);
                } else {
                    this.attrs[idx] = attrData;
                }
            }
            ;
            Token.prototype.attrGet = function attrGet(name) {
                var idx = this.attrIndex(name)
                  , value = null;
                if (idx >= 0) {
                    value = this.attrs[idx][1];
                }
                return value;
            }
            ;
            Token.prototype.attrJoin = function attrJoin(name, value) {
                var idx = this.attrIndex(name);
                if (idx < 0) {
                    this.attrPush([name, value]);
                } else {
                    this.attrs[idx][1] = this.attrs[idx][1] + ' ' + value;
                }
            }
            ;
            module.exports = Token;
        }
        , {}],
        52: [function(require, module, exports) {
            module.exports = {
                "Aacute": "\u00C1",
                "aacute": "\u00E1",
                "Abreve": "\u0102",
                "abreve": "\u0103",
                "ac": "\u223E",
                "acd": "\u223F",
                "acE": "\u223E\u0333",
                "Acirc": "\u00C2",
                "acirc": "\u00E2",
                "acute": "\u00B4",
                "Acy": "\u0410",
                "acy": "\u0430",
                "AElig": "\u00C6",
                "aelig": "\u00E6",
                "af": "\u2061",
                "Afr": "\uD835\uDD04",
                "afr": "\uD835\uDD1E",
                "Agrave": "\u00C0",
                "agrave": "\u00E0",
                "alefsym": "\u2135",
                "aleph": "\u2135",
                "Alpha": "\u0391",
                "alpha": "\u03B1",
                "Amacr": "\u0100",
                "amacr": "\u0101",
                "amalg": "\u2A3F",
                "amp": "&",
                "AMP": "&",
                "andand": "\u2A55",
                "And": "\u2A53",
                "and": "\u2227",
                "andd": "\u2A5C",
                "andslope": "\u2A58",
                "andv": "\u2A5A",
                "ang": "\u2220",
                "ange": "\u29A4",
                "angle": "\u2220",
                "angmsdaa": "\u29A8",
                "angmsdab": "\u29A9",
                "angmsdac": "\u29AA",
                "angmsdad": "\u29AB",
                "angmsdae": "\u29AC",
                "angmsdaf": "\u29AD",
                "angmsdag": "\u29AE",
                "angmsdah": "\u29AF",
                "angmsd": "\u2221",
                "angrt": "\u221F",
                "angrtvb": "\u22BE",
                "angrtvbd": "\u299D",
                "angsph": "\u2222",
                "angst": "\u00C5",
                "angzarr": "\u237C",
                "Aogon": "\u0104",
                "aogon": "\u0105",
                "Aopf": "\uD835\uDD38",
                "aopf": "\uD835\uDD52",
                "apacir": "\u2A6F",
                "ap": "\u2248",
                "apE": "\u2A70",
                "ape": "\u224A",
                "apid": "\u224B",
                "apos": "'",
                "ApplyFunction": "\u2061",
                "approx": "\u2248",
                "approxeq": "\u224A",
                "Aring": "\u00C5",
                "aring": "\u00E5",
                "Ascr": "\uD835\uDC9C",
                "ascr": "\uD835\uDCB6",
                "Assign": "\u2254",
                "ast": "*",
                "asymp": "\u2248",
                "asympeq": "\u224D",
                "Atilde": "\u00C3",
                "atilde": "\u00E3",
                "Auml": "\u00C4",
                "auml": "\u00E4",
                "awconint": "\u2233",
                "awint": "\u2A11",
                "backcong": "\u224C",
                "backepsilon": "\u03F6",
                "backprime": "\u2035",
                "backsim": "\u223D",
                "backsimeq": "\u22CD",
                "Backslash": "\u2216",
                "Barv": "\u2AE7",
                "barvee": "\u22BD",
                "barwed": "\u2305",
                "Barwed": "\u2306",
                "barwedge": "\u2305",
                "bbrk": "\u23B5",
                "bbrktbrk": "\u23B6",
                "bcong": "\u224C",
                "Bcy": "\u0411",
                "bcy": "\u0431",
                "bdquo": "\u201E",
                "becaus": "\u2235",
                "because": "\u2235",
                "Because": "\u2235",
                "bemptyv": "\u29B0",
                "bepsi": "\u03F6",
                "bernou": "\u212C",
                "Bernoullis": "\u212C",
                "Beta": "\u0392",
                "beta": "\u03B2",
                "beth": "\u2136",
                "between": "\u226C",
                "Bfr": "\uD835\uDD05",
                "bfr": "\uD835\uDD1F",
                "bigcap": "\u22C2",
                "bigcirc": "\u25EF",
                "bigcup": "\u22C3",
                "bigodot": "\u2A00",
                "bigoplus": "\u2A01",
                "bigotimes": "\u2A02",
                "bigsqcup": "\u2A06",
                "bigstar": "\u2605",
                "bigtriangledown": "\u25BD",
                "bigtriangleup": "\u25B3",
                "biguplus": "\u2A04",
                "bigvee": "\u22C1",
                "bigwedge": "\u22C0",
                "bkarow": "\u290D",
                "blacklozenge": "\u29EB",
                "blacksquare": "\u25AA",
                "blacktriangle": "\u25B4",
                "blacktriangledown": "\u25BE",
                "blacktriangleleft": "\u25C2",
                "blacktriangleright": "\u25B8",
                "blank": "\u2423",
                "blk12": "\u2592",
                "blk14": "\u2591",
                "blk34": "\u2593",
                "block": "\u2588",
                "bne": "=\u20E5",
                "bnequiv": "\u2261\u20E5",
                "bNot": "\u2AED",
                "bnot": "\u2310",
                "Bopf": "\uD835\uDD39",
                "bopf": "\uD835\uDD53",
                "bot": "\u22A5",
                "bottom": "\u22A5",
                "bowtie": "\u22C8",
                "boxbox": "\u29C9",
                "boxdl": "\u2510",
                "boxdL": "\u2555",
                "boxDl": "\u2556",
                "boxDL": "\u2557",
                "boxdr": "\u250C",
                "boxdR": "\u2552",
                "boxDr": "\u2553",
                "boxDR": "\u2554",
                "boxh": "\u2500",
                "boxH": "\u2550",
                "boxhd": "\u252C",
                "boxHd": "\u2564",
                "boxhD": "\u2565",
                "boxHD": "\u2566",
                "boxhu": "\u2534",
                "boxHu": "\u2567",
                "boxhU": "\u2568",
                "boxHU": "\u2569",
                "boxminus": "\u229F",
                "boxplus": "\u229E",
                "boxtimes": "\u22A0",
                "boxul": "\u2518",
                "boxuL": "\u255B",
                "boxUl": "\u255C",
                "boxUL": "\u255D",
                "boxur": "\u2514",
                "boxuR": "\u2558",
                "boxUr": "\u2559",
                "boxUR": "\u255A",
                "boxv": "\u2502",
                "boxV": "\u2551",
                "boxvh": "\u253C",
                "boxvH": "\u256A",
                "boxVh": "\u256B",
                "boxVH": "\u256C",
                "boxvl": "\u2524",
                "boxvL": "\u2561",
                "boxVl": "\u2562",
                "boxVL": "\u2563",
                "boxvr": "\u251C",
                "boxvR": "\u255E",
                "boxVr": "\u255F",
                "boxVR": "\u2560",
                "bprime": "\u2035",
                "breve": "\u02D8",
                "Breve": "\u02D8",
                "brvbar": "\u00A6",
                "bscr": "\uD835\uDCB7",
                "Bscr": "\u212C",
                "bsemi": "\u204F",
                "bsim": "\u223D",
                "bsime": "\u22CD",
                "bsolb": "\u29C5",
                "bsol": "\\",
                "bsolhsub": "\u27C8",
                "bull": "\u2022",
                "bullet": "\u2022",
                "bump": "\u224E",
                "bumpE": "\u2AAE",
                "bumpe": "\u224F",
                "Bumpeq": "\u224E",
                "bumpeq": "\u224F",
                "Cacute": "\u0106",
                "cacute": "\u0107",
                "capand": "\u2A44",
                "capbrcup": "\u2A49",
                "capcap": "\u2A4B",
                "cap": "\u2229",
                "Cap": "\u22D2",
                "capcup": "\u2A47",
                "capdot": "\u2A40",
                "CapitalDifferentialD": "\u2145",
                "caps": "\u2229\uFE00",
                "caret": "\u2041",
                "caron": "\u02C7",
                "Cayleys": "\u212D",
                "ccaps": "\u2A4D",
                "Ccaron": "\u010C",
                "ccaron": "\u010D",
                "Ccedil": "\u00C7",
                "ccedil": "\u00E7",
                "Ccirc": "\u0108",
                "ccirc": "\u0109",
                "Cconint": "\u2230",
                "ccups": "\u2A4C",
                "ccupssm": "\u2A50",
                "Cdot": "\u010A",
                "cdot": "\u010B",
                "cedil": "\u00B8",
                "Cedilla": "\u00B8",
                "cemptyv": "\u29B2",
                "cent": "\u00A2",
                "centerdot": "\u00B7",
                "CenterDot": "\u00B7",
                "cfr": "\uD835\uDD20",
                "Cfr": "\u212D",
                "CHcy": "\u0427",
                "chcy": "\u0447",
                "check": "\u2713",
                "checkmark": "\u2713",
                "Chi": "\u03A7",
                "chi": "\u03C7",
                "circ": "\u02C6",
                "circeq": "\u2257",
                "circlearrowleft": "\u21BA",
                "circlearrowright": "\u21BB",
                "circledast": "\u229B",
                "circledcirc": "\u229A",
                "circleddash": "\u229D",
                "CircleDot": "\u2299",
                "circledR": "\u00AE",
                "circledS": "\u24C8",
                "CircleMinus": "\u2296",
                "CirclePlus": "\u2295",
                "CircleTimes": "\u2297",
                "cir": "\u25CB",
                "cirE": "\u29C3",
                "cire": "\u2257",
                "cirfnint": "\u2A10",
                "cirmid": "\u2AEF",
                "cirscir": "\u29C2",
                "ClockwiseContourIntegral": "\u2232",
                "CloseCurlyDoubleQuote": "\u201D",
                "CloseCurlyQuote": "\u2019",
                "clubs": "\u2663",
                "clubsuit": "\u2663",
                "colon": ":",
                "Colon": "\u2237",
                "Colone": "\u2A74",
                "colone": "\u2254",
                "coloneq": "\u2254",
                "comma": ",",
                "commat": "@",
                "comp": "\u2201",
                "compfn": "\u2218",
                "complement": "\u2201",
                "complexes": "\u2102",
                "cong": "\u2245",
                "congdot": "\u2A6D",
                "Congruent": "\u2261",
                "conint": "\u222E",
                "Conint": "\u222F",
                "ContourIntegral": "\u222E",
                "copf": "\uD835\uDD54",
                "Copf": "\u2102",
                "coprod": "\u2210",
                "Coproduct": "\u2210",
                "copy": "\u00A9",
                "COPY": "\u00A9",
                "copysr": "\u2117",
                "CounterClockwiseContourIntegral": "\u2233",
                "crarr": "\u21B5",
                "cross": "\u2717",
                "Cross": "\u2A2F",
                "Cscr": "\uD835\uDC9E",
                "cscr": "\uD835\uDCB8",
                "csub": "\u2ACF",
                "csube": "\u2AD1",
                "csup": "\u2AD0",
                "csupe": "\u2AD2",
                "ctdot": "\u22EF",
                "cudarrl": "\u2938",
                "cudarrr": "\u2935",
                "cuepr": "\u22DE",
                "cuesc": "\u22DF",
                "cularr": "\u21B6",
                "cularrp": "\u293D",
                "cupbrcap": "\u2A48",
                "cupcap": "\u2A46",
                "CupCap": "\u224D",
                "cup": "\u222A",
                "Cup": "\u22D3",
                "cupcup": "\u2A4A",
                "cupdot": "\u228D",
                "cupor": "\u2A45",
                "cups": "\u222A\uFE00",
                "curarr": "\u21B7",
                "curarrm": "\u293C",
                "curlyeqprec": "\u22DE",
                "curlyeqsucc": "\u22DF",
                "curlyvee": "\u22CE",
                "curlywedge": "\u22CF",
                "curren": "\u00A4",
                "curvearrowleft": "\u21B6",
                "curvearrowright": "\u21B7",
                "cuvee": "\u22CE",
                "cuwed": "\u22CF",
                "cwconint": "\u2232",
                "cwint": "\u2231",
                "cylcty": "\u232D",
                "dagger": "\u2020",
                "Dagger": "\u2021",
                "daleth": "\u2138",
                "darr": "\u2193",
                "Darr": "\u21A1",
                "dArr": "\u21D3",
                "dash": "\u2010",
                "Dashv": "\u2AE4",
                "dashv": "\u22A3",
                "dbkarow": "\u290F",
                "dblac": "\u02DD",
                "Dcaron": "\u010E",
                "dcaron": "\u010F",
                "Dcy": "\u0414",
                "dcy": "\u0434",
                "ddagger": "\u2021",
                "ddarr": "\u21CA",
                "DD": "\u2145",
                "dd": "\u2146",
                "DDotrahd": "\u2911",
                "ddotseq": "\u2A77",
                "deg": "\u00B0",
                "Del": "\u2207",
                "Delta": "\u0394",
                "delta": "\u03B4",
                "demptyv": "\u29B1",
                "dfisht": "\u297F",
                "Dfr": "\uD835\uDD07",
                "dfr": "\uD835\uDD21",
                "dHar": "\u2965",
                "dharl": "\u21C3",
                "dharr": "\u21C2",
                "DiacriticalAcute": "\u00B4",
                "DiacriticalDot": "\u02D9",
                "DiacriticalDoubleAcute": "\u02DD",
                "DiacriticalGrave": "`",
                "DiacriticalTilde": "\u02DC",
                "diam": "\u22C4",
                "diamond": "\u22C4",
                "Diamond": "\u22C4",
                "diamondsuit": "\u2666",
                "diams": "\u2666",
                "die": "\u00A8",
                "DifferentialD": "\u2146",
                "digamma": "\u03DD",
                "disin": "\u22F2",
                "div": "\u00F7",
                "divide": "\u00F7",
                "divideontimes": "\u22C7",
                "divonx": "\u22C7",
                "DJcy": "\u0402",
                "djcy": "\u0452",
                "dlcorn": "\u231E",
                "dlcrop": "\u230D",
                "dollar": "$",
                "Dopf": "\uD835\uDD3B",
                "dopf": "\uD835\uDD55",
                "Dot": "\u00A8",
                "dot": "\u02D9",
                "DotDot": "\u20DC",
                "doteq": "\u2250",
                "doteqdot": "\u2251",
                "DotEqual": "\u2250",
                "dotminus": "\u2238",
                "dotplus": "\u2214",
                "dotsquare": "\u22A1",
                "doublebarwedge": "\u2306",
                "DoubleContourIntegral": "\u222F",
                "DoubleDot": "\u00A8",
                "DoubleDownArrow": "\u21D3",
                "DoubleLeftArrow": "\u21D0",
                "DoubleLeftRightArrow": "\u21D4",
                "DoubleLeftTee": "\u2AE4",
                "DoubleLongLeftArrow": "\u27F8",
                "DoubleLongLeftRightArrow": "\u27FA",
                "DoubleLongRightArrow": "\u27F9",
                "DoubleRightArrow": "\u21D2",
                "DoubleRightTee": "\u22A8",
                "DoubleUpArrow": "\u21D1",
                "DoubleUpDownArrow": "\u21D5",
                "DoubleVerticalBar": "\u2225",
                "DownArrowBar": "\u2913",
                "downarrow": "\u2193",
                "DownArrow": "\u2193",
                "Downarrow": "\u21D3",
                "DownArrowUpArrow": "\u21F5",
                "DownBreve": "\u0311",
                "downdownarrows": "\u21CA",
                "downharpoonleft": "\u21C3",
                "downharpoonright": "\u21C2",
                "DownLeftRightVector": "\u2950",
                "DownLeftTeeVector": "\u295E",
                "DownLeftVectorBar": "\u2956",
                "DownLeftVector": "\u21BD",
                "DownRightTeeVector": "\u295F",
                "DownRightVectorBar": "\u2957",
                "DownRightVector": "\u21C1",
                "DownTeeArrow": "\u21A7",
                "DownTee": "\u22A4",
                "drbkarow": "\u2910",
                "drcorn": "\u231F",
                "drcrop": "\u230C",
                "Dscr": "\uD835\uDC9F",
                "dscr": "\uD835\uDCB9",
                "DScy": "\u0405",
                "dscy": "\u0455",
                "dsol": "\u29F6",
                "Dstrok": "\u0110",
                "dstrok": "\u0111",
                "dtdot": "\u22F1",
                "dtri": "\u25BF",
                "dtrif": "\u25BE",
                "duarr": "\u21F5",
                "duhar": "\u296F",
                "dwangle": "\u29A6",
                "DZcy": "\u040F",
                "dzcy": "\u045F",
                "dzigrarr": "\u27FF",
                "Eacute": "\u00C9",
                "eacute": "\u00E9",
                "easter": "\u2A6E",
                "Ecaron": "\u011A",
                "ecaron": "\u011B",
                "Ecirc": "\u00CA",
                "ecirc": "\u00EA",
                "ecir": "\u2256",
                "ecolon": "\u2255",
                "Ecy": "\u042D",
                "ecy": "\u044D",
                "eDDot": "\u2A77",
                "Edot": "\u0116",
                "edot": "\u0117",
                "eDot": "\u2251",
                "ee": "\u2147",
                "efDot": "\u2252",
                "Efr": "\uD835\uDD08",
                "efr": "\uD835\uDD22",
                "eg": "\u2A9A",
                "Egrave": "\u00C8",
                "egrave": "\u00E8",
                "egs": "\u2A96",
                "egsdot": "\u2A98",
                "el": "\u2A99",
                "Element": "\u2208",
                "elinters": "\u23E7",
                "ell": "\u2113",
                "els": "\u2A95",
                "elsdot": "\u2A97",
                "Emacr": "\u0112",
                "emacr": "\u0113",
                "empty": "\u2205",
                "emptyset": "\u2205",
                "EmptySmallSquare": "\u25FB",
                "emptyv": "\u2205",
                "EmptyVerySmallSquare": "\u25AB",
                "emsp13": "\u2004",
                "emsp14": "\u2005",
                "emsp": "\u2003",
                "ENG": "\u014A",
                "eng": "\u014B",
                "ensp": "\u2002",
                "Eogon": "\u0118",
                "eogon": "\u0119",
                "Eopf": "\uD835\uDD3C",
                "eopf": "\uD835\uDD56",
                "epar": "\u22D5",
                "eparsl": "\u29E3",
                "eplus": "\u2A71",
                "epsi": "\u03B5",
                "Epsilon": "\u0395",
                "epsilon": "\u03B5",
                "epsiv": "\u03F5",
                "eqcirc": "\u2256",
                "eqcolon": "\u2255",
                "eqsim": "\u2242",
                "eqslantgtr": "\u2A96",
                "eqslantless": "\u2A95",
                "Equal": "\u2A75",
                "equals": "=",
                "EqualTilde": "\u2242",
                "equest": "\u225F",
                "Equilibrium": "\u21CC",
                "equiv": "\u2261",
                "equivDD": "\u2A78",
                "eqvparsl": "\u29E5",
                "erarr": "\u2971",
                "erDot": "\u2253",
                "escr": "\u212F",
                "Escr": "\u2130",
                "esdot": "\u2250",
                "Esim": "\u2A73",
                "esim": "\u2242",
                "Eta": "\u0397",
                "eta": "\u03B7",
                "ETH": "\u00D0",
                "eth": "\u00F0",
                "Euml": "\u00CB",
                "euml": "\u00EB",
                "euro": "\u20AC",
                "excl": "!",
                "exist": "\u2203",
                "Exists": "\u2203",
                "expectation": "\u2130",
                "exponentiale": "\u2147",
                "ExponentialE": "\u2147",
                "fallingdotseq": "\u2252",
                "Fcy": "\u0424",
                "fcy": "\u0444",
                "female": "\u2640",
                "ffilig": "\uFB03",
                "fflig": "\uFB00",
                "ffllig": "\uFB04",
                "Ffr": "\uD835\uDD09",
                "ffr": "\uD835\uDD23",
                "filig": "\uFB01",
                "FilledSmallSquare": "\u25FC",
                "FilledVerySmallSquare": "\u25AA",
                "fjlig": "fj",
                "flat": "\u266D",
                "fllig": "\uFB02",
                "fltns": "\u25B1",
                "fnof": "\u0192",
                "Fopf": "\uD835\uDD3D",
                "fopf": "\uD835\uDD57",
                "forall": "\u2200",
                "ForAll": "\u2200",
                "fork": "\u22D4",
                "forkv": "\u2AD9",
                "Fouriertrf": "\u2131",
                "fpartint": "\u2A0D",
                "frac12": "\u00BD",
                "frac13": "\u2153",
                "frac14": "\u00BC",
                "frac15": "\u2155",
                "frac16": "\u2159",
                "frac18": "\u215B",
                "frac23": "\u2154",
                "frac25": "\u2156",
                "frac34": "\u00BE",
                "frac35": "\u2157",
                "frac38": "\u215C",
                "frac45": "\u2158",
                "frac56": "\u215A",
                "frac58": "\u215D",
                "frac78": "\u215E",
                "frasl": "\u2044",
                "frown": "\u2322",
                "fscr": "\uD835\uDCBB",
                "Fscr": "\u2131",
                "gacute": "\u01F5",
                "Gamma": "\u0393",
                "gamma": "\u03B3",
                "Gammad": "\u03DC",
                "gammad": "\u03DD",
                "gap": "\u2A86",
                "Gbreve": "\u011E",
                "gbreve": "\u011F",
                "Gcedil": "\u0122",
                "Gcirc": "\u011C",
                "gcirc": "\u011D",
                "Gcy": "\u0413",
                "gcy": "\u0433",
                "Gdot": "\u0120",
                "gdot": "\u0121",
                "ge": "\u2265",
                "gE": "\u2267",
                "gEl": "\u2A8C",
                "gel": "\u22DB",
                "geq": "\u2265",
                "geqq": "\u2267",
                "geqslant": "\u2A7E",
                "gescc": "\u2AA9",
                "ges": "\u2A7E",
                "gesdot": "\u2A80",
                "gesdoto": "\u2A82",
                "gesdotol": "\u2A84",
                "gesl": "\u22DB\uFE00",
                "gesles": "\u2A94",
                "Gfr": "\uD835\uDD0A",
                "gfr": "\uD835\uDD24",
                "gg": "\u226B",
                "Gg": "\u22D9",
                "ggg": "\u22D9",
                "gimel": "\u2137",
                "GJcy": "\u0403",
                "gjcy": "\u0453",
                "gla": "\u2AA5",
                "gl": "\u2277",
                "glE": "\u2A92",
                "glj": "\u2AA4",
                "gnap": "\u2A8A",
                "gnapprox": "\u2A8A",
                "gne": "\u2A88",
                "gnE": "\u2269",
                "gneq": "\u2A88",
                "gneqq": "\u2269",
                "gnsim": "\u22E7",
                "Gopf": "\uD835\uDD3E",
                "gopf": "\uD835\uDD58",
                "grave": "`",
                "GreaterEqual": "\u2265",
                "GreaterEqualLess": "\u22DB",
                "GreaterFullEqual": "\u2267",
                "GreaterGreater": "\u2AA2",
                "GreaterLess": "\u2277",
                "GreaterSlantEqual": "\u2A7E",
                "GreaterTilde": "\u2273",
                "Gscr": "\uD835\uDCA2",
                "gscr": "\u210A",
                "gsim": "\u2273",
                "gsime": "\u2A8E",
                "gsiml": "\u2A90",
                "gtcc": "\u2AA7",
                "gtcir": "\u2A7A",
                "gt": ">",
                "GT": ">",
                "Gt": "\u226B",
                "gtdot": "\u22D7",
                "gtlPar": "\u2995",
                "gtquest": "\u2A7C",
                "gtrapprox": "\u2A86",
                "gtrarr": "\u2978",
                "gtrdot": "\u22D7",
                "gtreqless": "\u22DB",
                "gtreqqless": "\u2A8C",
                "gtrless": "\u2277",
                "gtrsim": "\u2273",
                "gvertneqq": "\u2269\uFE00",
                "gvnE": "\u2269\uFE00",
                "Hacek": "\u02C7",
                "hairsp": "\u200A",
                "half": "\u00BD",
                "hamilt": "\u210B",
                "HARDcy": "\u042A",
                "hardcy": "\u044A",
                "harrcir": "\u2948",
                "harr": "\u2194",
                "hArr": "\u21D4",
                "harrw": "\u21AD",
                "Hat": "^",
                "hbar": "\u210F",
                "Hcirc": "\u0124",
                "hcirc": "\u0125",
                "hearts": "\u2665",
                "heartsuit": "\u2665",
                "hellip": "\u2026",
                "hercon": "\u22B9",
                "hfr": "\uD835\uDD25",
                "Hfr": "\u210C",
                "HilbertSpace": "\u210B",
                "hksearow": "\u2925",
                "hkswarow": "\u2926",
                "hoarr": "\u21FF",
                "homtht": "\u223B",
                "hookleftarrow": "\u21A9",
                "hookrightarrow": "\u21AA",
                "hopf": "\uD835\uDD59",
                "Hopf": "\u210D",
                "horbar": "\u2015",
                "HorizontalLine": "\u2500",
                "hscr": "\uD835\uDCBD",
                "Hscr": "\u210B",
                "hslash": "\u210F",
                "Hstrok": "\u0126",
                "hstrok": "\u0127",
                "HumpDownHump": "\u224E",
                "HumpEqual": "\u224F",
                "hybull": "\u2043",
                "hyphen": "\u2010",
                "Iacute": "\u00CD",
                "iacute": "\u00ED",
                "ic": "\u2063",
                "Icirc": "\u00CE",
                "icirc": "\u00EE",
                "Icy": "\u0418",
                "icy": "\u0438",
                "Idot": "\u0130",
                "IEcy": "\u0415",
                "iecy": "\u0435",
                "iexcl": "\u00A1",
                "iff": "\u21D4",
                "ifr": "\uD835\uDD26",
                "Ifr": "\u2111",
                "Igrave": "\u00CC",
                "igrave": "\u00EC",
                "ii": "\u2148",
                "iiiint": "\u2A0C",
                "iiint": "\u222D",
                "iinfin": "\u29DC",
                "iiota": "\u2129",
                "IJlig": "\u0132",
                "ijlig": "\u0133",
                "Imacr": "\u012A",
                "imacr": "\u012B",
                "image": "\u2111",
                "ImaginaryI": "\u2148",
                "imagline": "\u2110",
                "imagpart": "\u2111",
                "imath": "\u0131",
                "Im": "\u2111",
                "imof": "\u22B7",
                "imped": "\u01B5",
                "Implies": "\u21D2",
                "incare": "\u2105",
                "in": "\u2208",
                "infin": "\u221E",
                "infintie": "\u29DD",
                "inodot": "\u0131",
                "intcal": "\u22BA",
                "int": "\u222B",
                "Int": "\u222C",
                "integers": "\u2124",
                "Integral": "\u222B",
                "intercal": "\u22BA",
                "Intersection": "\u22C2",
                "intlarhk": "\u2A17",
                "intprod": "\u2A3C",
                "InvisibleComma": "\u2063",
                "InvisibleTimes": "\u2062",
                "IOcy": "\u0401",
                "iocy": "\u0451",
                "Iogon": "\u012E",
                "iogon": "\u012F",
                "Iopf": "\uD835\uDD40",
                "iopf": "\uD835\uDD5A",
                "Iota": "\u0399",
                "iota": "\u03B9",
                "iprod": "\u2A3C",
                "iquest": "\u00BF",
                "iscr": "\uD835\uDCBE",
                "Iscr": "\u2110",
                "isin": "\u2208",
                "isindot": "\u22F5",
                "isinE": "\u22F9",
                "isins": "\u22F4",
                "isinsv": "\u22F3",
                "isinv": "\u2208",
                "it": "\u2062",
                "Itilde": "\u0128",
                "itilde": "\u0129",
                "Iukcy": "\u0406",
                "iukcy": "\u0456",
                "Iuml": "\u00CF",
                "iuml": "\u00EF",
                "Jcirc": "\u0134",
                "jcirc": "\u0135",
                "Jcy": "\u0419",
                "jcy": "\u0439",
                "Jfr": "\uD835\uDD0D",
                "jfr": "\uD835\uDD27",
                "jmath": "\u0237",
                "Jopf": "\uD835\uDD41",
                "jopf": "\uD835\uDD5B",
                "Jscr": "\uD835\uDCA5",
                "jscr": "\uD835\uDCBF",
                "Jsercy": "\u0408",
                "jsercy": "\u0458",
                "Jukcy": "\u0404",
                "jukcy": "\u0454",
                "Kappa": "\u039A",
                "kappa": "\u03BA",
                "kappav": "\u03F0",
                "Kcedil": "\u0136",
                "kcedil": "\u0137",
                "Kcy": "\u041A",
                "kcy": "\u043A",
                "Kfr": "\uD835\uDD0E",
                "kfr": "\uD835\uDD28",
                "kgreen": "\u0138",
                "KHcy": "\u0425",
                "khcy": "\u0445",
                "KJcy": "\u040C",
                "kjcy": "\u045C",
                "Kopf": "\uD835\uDD42",
                "kopf": "\uD835\uDD5C",
                "Kscr": "\uD835\uDCA6",
                "kscr": "\uD835\uDCC0",
                "lAarr": "\u21DA",
                "Lacute": "\u0139",
                "lacute": "\u013A",
                "laemptyv": "\u29B4",
                "lagran": "\u2112",
                "Lambda": "\u039B",
                "lambda": "\u03BB",
                "lang": "\u27E8",
                "Lang": "\u27EA",
                "langd": "\u2991",
                "langle": "\u27E8",
                "lap": "\u2A85",
                "Laplacetrf": "\u2112",
                "laquo": "\u00AB",
                "larrb": "\u21E4",
                "larrbfs": "\u291F",
                "larr": "\u2190",
                "Larr": "\u219E",
                "lArr": "\u21D0",
                "larrfs": "\u291D",
                "larrhk": "\u21A9",
                "larrlp": "\u21AB",
                "larrpl": "\u2939",
                "larrsim": "\u2973",
                "larrtl": "\u21A2",
                "latail": "\u2919",
                "lAtail": "\u291B",
                "lat": "\u2AAB",
                "late": "\u2AAD",
                "lates": "\u2AAD\uFE00",
                "lbarr": "\u290C",
                "lBarr": "\u290E",
                "lbbrk": "\u2772",
                "lbrace": "{",
                "lbrack": "[",
                "lbrke": "\u298B",
                "lbrksld": "\u298F",
                "lbrkslu": "\u298D",
                "Lcaron": "\u013D",
                "lcaron": "\u013E",
                "Lcedil": "\u013B",
                "lcedil": "\u013C",
                "lceil": "\u2308",
                "lcub": "{",
                "Lcy": "\u041B",
                "lcy": "\u043B",
                "ldca": "\u2936",
                "ldquo": "\u201C",
                "ldquor": "\u201E",
                "ldrdhar": "\u2967",
                "ldrushar": "\u294B",
                "ldsh": "\u21B2",
                "le": "\u2264",
                "lE": "\u2266",
                "LeftAngleBracket": "\u27E8",
                "LeftArrowBar": "\u21E4",
                "leftarrow": "\u2190",
                "LeftArrow": "\u2190",
                "Leftarrow": "\u21D0",
                "LeftArrowRightArrow": "\u21C6",
                "leftarrowtail": "\u21A2",
                "LeftCeiling": "\u2308",
                "LeftDoubleBracket": "\u27E6",
                "LeftDownTeeVector": "\u2961",
                "LeftDownVectorBar": "\u2959",
                "LeftDownVector": "\u21C3",
                "LeftFloor": "\u230A",
                "leftharpoondown": "\u21BD",
                "leftharpoonup": "\u21BC",
                "leftleftarrows": "\u21C7",
                "leftrightarrow": "\u2194",
                "LeftRightArrow": "\u2194",
                "Leftrightarrow": "\u21D4",
                "leftrightarrows": "\u21C6",
                "leftrightharpoons": "\u21CB",
                "leftrightsquigarrow": "\u21AD",
                "LeftRightVector": "\u294E",
                "LeftTeeArrow": "\u21A4",
                "LeftTee": "\u22A3",
                "LeftTeeVector": "\u295A",
                "leftthreetimes": "\u22CB",
                "LeftTriangleBar": "\u29CF",
                "LeftTriangle": "\u22B2",
                "LeftTriangleEqual": "\u22B4",
                "LeftUpDownVector": "\u2951",
                "LeftUpTeeVector": "\u2960",
                "LeftUpVectorBar": "\u2958",
                "LeftUpVector": "\u21BF",
                "LeftVectorBar": "\u2952",
                "LeftVector": "\u21BC",
                "lEg": "\u2A8B",
                "leg": "\u22DA",
                "leq": "\u2264",
                "leqq": "\u2266",
                "leqslant": "\u2A7D",
                "lescc": "\u2AA8",
                "les": "\u2A7D",
                "lesdot": "\u2A7F",
                "lesdoto": "\u2A81",
                "lesdotor": "\u2A83",
                "lesg": "\u22DA\uFE00",
                "lesges": "\u2A93",
                "lessapprox": "\u2A85",
                "lessdot": "\u22D6",
                "lesseqgtr": "\u22DA",
                "lesseqqgtr": "\u2A8B",
                "LessEqualGreater": "\u22DA",
                "LessFullEqual": "\u2266",
                "LessGreater": "\u2276",
                "lessgtr": "\u2276",
                "LessLess": "\u2AA1",
                "lesssim": "\u2272",
                "LessSlantEqual": "\u2A7D",
                "LessTilde": "\u2272",
                "lfisht": "\u297C",
                "lfloor": "\u230A",
                "Lfr": "\uD835\uDD0F",
                "lfr": "\uD835\uDD29",
                "lg": "\u2276",
                "lgE": "\u2A91",
                "lHar": "\u2962",
                "lhard": "\u21BD",
                "lharu": "\u21BC",
                "lharul": "\u296A",
                "lhblk": "\u2584",
                "LJcy": "\u0409",
                "ljcy": "\u0459",
                "llarr": "\u21C7",
                "ll": "\u226A",
                "Ll": "\u22D8",
                "llcorner": "\u231E",
                "Lleftarrow": "\u21DA",
                "llhard": "\u296B",
                "lltri": "\u25FA",
                "Lmidot": "\u013F",
                "lmidot": "\u0140",
                "lmoustache": "\u23B0",
                "lmoust": "\u23B0",
                "lnap": "\u2A89",
                "lnapprox": "\u2A89",
                "lne": "\u2A87",
                "lnE": "\u2268",
                "lneq": "\u2A87",
                "lneqq": "\u2268",
                "lnsim": "\u22E6",
                "loang": "\u27EC",
                "loarr": "\u21FD",
                "lobrk": "\u27E6",
                "longleftarrow": "\u27F5",
                "LongLeftArrow": "\u27F5",
                "Longleftarrow": "\u27F8",
                "longleftrightarrow": "\u27F7",
                "LongLeftRightArrow": "\u27F7",
                "Longleftrightarrow": "\u27FA",
                "longmapsto": "\u27FC",
                "longrightarrow": "\u27F6",
                "LongRightArrow": "\u27F6",
                "Longrightarrow": "\u27F9",
                "looparrowleft": "\u21AB",
                "looparrowright": "\u21AC",
                "lopar": "\u2985",
                "Lopf": "\uD835\uDD43",
                "lopf": "\uD835\uDD5D",
                "loplus": "\u2A2D",
                "lotimes": "\u2A34",
                "lowast": "\u2217",
                "lowbar": "_",
                "LowerLeftArrow": "\u2199",
                "LowerRightArrow": "\u2198",
                "loz": "\u25CA",
                "lozenge": "\u25CA",
                "lozf": "\u29EB",
                "lpar": "(",
                "lparlt": "\u2993",
                "lrarr": "\u21C6",
                "lrcorner": "\u231F",
                "lrhar": "\u21CB",
                "lrhard": "\u296D",
                "lrm": "\u200E",
                "lrtri": "\u22BF",
                "lsaquo": "\u2039",
                "lscr": "\uD835\uDCC1",
                "Lscr": "\u2112",
                "lsh": "\u21B0",
                "Lsh": "\u21B0",
                "lsim": "\u2272",
                "lsime": "\u2A8D",
                "lsimg": "\u2A8F",
                "lsqb": "[",
                "lsquo": "\u2018",
                "lsquor": "\u201A",
                "Lstrok": "\u0141",
                "lstrok": "\u0142",
                "ltcc": "\u2AA6",
                "ltcir": "\u2A79",
                "lt": "<",
                "LT": "<",
                "Lt": "\u226A",
                "ltdot": "\u22D6",
                "lthree": "\u22CB",
                "ltimes": "\u22C9",
                "ltlarr": "\u2976",
                "ltquest": "\u2A7B",
                "ltri": "\u25C3",
                "ltrie": "\u22B4",
                "ltrif": "\u25C2",
                "ltrPar": "\u2996",
                "lurdshar": "\u294A",
                "luruhar": "\u2966",
                "lvertneqq": "\u2268\uFE00",
                "lvnE": "\u2268\uFE00",
                "macr": "\u00AF",
                "male": "\u2642",
                "malt": "\u2720",
                "maltese": "\u2720",
                "Map": "\u2905",
                "map": "\u21A6",
                "mapsto": "\u21A6",
                "mapstodown": "\u21A7",
                "mapstoleft": "\u21A4",
                "mapstoup": "\u21A5",
                "marker": "\u25AE",
                "mcomma": "\u2A29",
                "Mcy": "\u041C",
                "mcy": "\u043C",
                "mdash": "\u2014",
                "mDDot": "\u223A",
                "measuredangle": "\u2221",
                "MediumSpace": "\u205F",
                "Mellintrf": "\u2133",
                "Mfr": "\uD835\uDD10",
                "mfr": "\uD835\uDD2A",
                "mho": "\u2127",
                "micro": "\u00B5",
                "midast": "*",
                "midcir": "\u2AF0",
                "mid": "\u2223",
                "middot": "\u00B7",
                "minusb": "\u229F",
                "minus": "\u2212",
                "minusd": "\u2238",
                "minusdu": "\u2A2A",
                "MinusPlus": "\u2213",
                "mlcp": "\u2ADB",
                "mldr": "\u2026",
                "mnplus": "\u2213",
                "models": "\u22A7",
                "Mopf": "\uD835\uDD44",
                "mopf": "\uD835\uDD5E",
                "mp": "\u2213",
                "mscr": "\uD835\uDCC2",
                "Mscr": "\u2133",
                "mstpos": "\u223E",
                "Mu": "\u039C",
                "mu": "\u03BC",
                "multimap": "\u22B8",
                "mumap": "\u22B8",
                "nabla": "\u2207",
                "Nacute": "\u0143",
                "nacute": "\u0144",
                "nang": "\u2220\u20D2",
                "nap": "\u2249",
                "napE": "\u2A70\u0338",
                "napid": "\u224B\u0338",
                "napos": "\u0149",
                "napprox": "\u2249",
                "natural": "\u266E",
                "naturals": "\u2115",
                "natur": "\u266E",
                "nbsp": "\u00A0",
                "nbump": "\u224E\u0338",
                "nbumpe": "\u224F\u0338",
                "ncap": "\u2A43",
                "Ncaron": "\u0147",
                "ncaron": "\u0148",
                "Ncedil": "\u0145",
                "ncedil": "\u0146",
                "ncong": "\u2247",
                "ncongdot": "\u2A6D\u0338",
                "ncup": "\u2A42",
                "Ncy": "\u041D",
                "ncy": "\u043D",
                "ndash": "\u2013",
                "nearhk": "\u2924",
                "nearr": "\u2197",
                "neArr": "\u21D7",
                "nearrow": "\u2197",
                "ne": "\u2260",
                "nedot": "\u2250\u0338",
                "NegativeMediumSpace": "\u200B",
                "NegativeThickSpace": "\u200B",
                "NegativeThinSpace": "\u200B",
                "NegativeVeryThinSpace": "\u200B",
                "nequiv": "\u2262",
                "nesear": "\u2928",
                "nesim": "\u2242\u0338",
                "NestedGreaterGreater": "\u226B",
                "NestedLessLess": "\u226A",
                "NewLine": "\n",
                "nexist": "\u2204",
                "nexists": "\u2204",
                "Nfr": "\uD835\uDD11",
                "nfr": "\uD835\uDD2B",
                "ngE": "\u2267\u0338",
                "nge": "\u2271",
                "ngeq": "\u2271",
                "ngeqq": "\u2267\u0338",
                "ngeqslant": "\u2A7E\u0338",
                "nges": "\u2A7E\u0338",
                "nGg": "\u22D9\u0338",
                "ngsim": "\u2275",
                "nGt": "\u226B\u20D2",
                "ngt": "\u226F",
                "ngtr": "\u226F",
                "nGtv": "\u226B\u0338",
                "nharr": "\u21AE",
                "nhArr": "\u21CE",
                "nhpar": "\u2AF2",
                "ni": "\u220B",
                "nis": "\u22FC",
                "nisd": "\u22FA",
                "niv": "\u220B",
                "NJcy": "\u040A",
                "njcy": "\u045A",
                "nlarr": "\u219A",
                "nlArr": "\u21CD",
                "nldr": "\u2025",
                "nlE": "\u2266\u0338",
                "nle": "\u2270",
                "nleftarrow": "\u219A",
                "nLeftarrow": "\u21CD",
                "nleftrightarrow": "\u21AE",
                "nLeftrightarrow": "\u21CE",
                "nleq": "\u2270",
                "nleqq": "\u2266\u0338",
                "nleqslant": "\u2A7D\u0338",
                "nles": "\u2A7D\u0338",
                "nless": "\u226E",
                "nLl": "\u22D8\u0338",
                "nlsim": "\u2274",
                "nLt": "\u226A\u20D2",
                "nlt": "\u226E",
                "nltri": "\u22EA",
                "nltrie": "\u22EC",
                "nLtv": "\u226A\u0338",
                "nmid": "\u2224",
                "NoBreak": "\u2060",
                "NonBreakingSpace": "\u00A0",
                "nopf": "\uD835\uDD5F",
                "Nopf": "\u2115",
                "Not": "\u2AEC",
                "not": "\u00AC",
                "NotCongruent": "\u2262",
                "NotCupCap": "\u226D",
                "NotDoubleVerticalBar": "\u2226",
                "NotElement": "\u2209",
                "NotEqual": "\u2260",
                "NotEqualTilde": "\u2242\u0338",
                "NotExists": "\u2204",
                "NotGreater": "\u226F",
                "NotGreaterEqual": "\u2271",
                "NotGreaterFullEqual": "\u2267\u0338",
                "NotGreaterGreater": "\u226B\u0338",
                "NotGreaterLess": "\u2279",
                "NotGreaterSlantEqual": "\u2A7E\u0338",
                "NotGreaterTilde": "\u2275",
                "NotHumpDownHump": "\u224E\u0338",
                "NotHumpEqual": "\u224F\u0338",
                "notin": "\u2209",
                "notindot": "\u22F5\u0338",
                "notinE": "\u22F9\u0338",
                "notinva": "\u2209",
                "notinvb": "\u22F7",
                "notinvc": "\u22F6",
                "NotLeftTriangleBar": "\u29CF\u0338",
                "NotLeftTriangle": "\u22EA",
                "NotLeftTriangleEqual": "\u22EC",
                "NotLess": "\u226E",
                "NotLessEqual": "\u2270",
                "NotLessGreater": "\u2278",
                "NotLessLess": "\u226A\u0338",
                "NotLessSlantEqual": "\u2A7D\u0338",
                "NotLessTilde": "\u2274",
                "NotNestedGreaterGreater": "\u2AA2\u0338",
                "NotNestedLessLess": "\u2AA1\u0338",
                "notni": "\u220C",
                "notniva": "\u220C",
                "notnivb": "\u22FE",
                "notnivc": "\u22FD",
                "NotPrecedes": "\u2280",
                "NotPrecedesEqual": "\u2AAF\u0338",
                "NotPrecedesSlantEqual": "\u22E0",
                "NotReverseElement": "\u220C",
                "NotRightTriangleBar": "\u29D0\u0338",
                "NotRightTriangle": "\u22EB",
                "NotRightTriangleEqual": "\u22ED",
                "NotSquareSubset": "\u228F\u0338",
                "NotSquareSubsetEqual": "\u22E2",
                "NotSquareSuperset": "\u2290\u0338",
                "NotSquareSupersetEqual": "\u22E3",
                "NotSubset": "\u2282\u20D2",
                "NotSubsetEqual": "\u2288",
                "NotSucceeds": "\u2281",
                "NotSucceedsEqual": "\u2AB0\u0338",
                "NotSucceedsSlantEqual": "\u22E1",
                "NotSucceedsTilde": "\u227F\u0338",
                "NotSuperset": "\u2283\u20D2",
                "NotSupersetEqual": "\u2289",
                "NotTilde": "\u2241",
                "NotTildeEqual": "\u2244",
                "NotTildeFullEqual": "\u2247",
                "NotTildeTilde": "\u2249",
                "NotVerticalBar": "\u2224",
                "nparallel": "\u2226",
                "npar": "\u2226",
                "nparsl": "\u2AFD\u20E5",
                "npart": "\u2202\u0338",
                "npolint": "\u2A14",
                "npr": "\u2280",
                "nprcue": "\u22E0",
                "nprec": "\u2280",
                "npreceq": "\u2AAF\u0338",
                "npre": "\u2AAF\u0338",
                "nrarrc": "\u2933\u0338",
                "nrarr": "\u219B",
                "nrArr": "\u21CF",
                "nrarrw": "\u219D\u0338",
                "nrightarrow": "\u219B",
                "nRightarrow": "\u21CF",
                "nrtri": "\u22EB",
                "nrtrie": "\u22ED",
                "nsc": "\u2281",
                "nsccue": "\u22E1",
                "nsce": "\u2AB0\u0338",
                "Nscr": "\uD835\uDCA9",
                "nscr": "\uD835\uDCC3",
                "nshortmid": "\u2224",
                "nshortparallel": "\u2226",
                "nsim": "\u2241",
                "nsime": "\u2244",
                "nsimeq": "\u2244",
                "nsmid": "\u2224",
                "nspar": "\u2226",
                "nsqsube": "\u22E2",
                "nsqsupe": "\u22E3",
                "nsub": "\u2284",
                "nsubE": "\u2AC5\u0338",
                "nsube": "\u2288",
                "nsubset": "\u2282\u20D2",
                "nsubseteq": "\u2288",
                "nsubseteqq": "\u2AC5\u0338",
                "nsucc": "\u2281",
                "nsucceq": "\u2AB0\u0338",
                "nsup": "\u2285",
                "nsupE": "\u2AC6\u0338",
                "nsupe": "\u2289",
                "nsupset": "\u2283\u20D2",
                "nsupseteq": "\u2289",
                "nsupseteqq": "\u2AC6\u0338",
                "ntgl": "\u2279",
                "Ntilde": "\u00D1",
                "ntilde": "\u00F1",
                "ntlg": "\u2278",
                "ntriangleleft": "\u22EA",
                "ntrianglelefteq": "\u22EC",
                "ntriangleright": "\u22EB",
                "ntrianglerighteq": "\u22ED",
                "Nu": "\u039D",
                "nu": "\u03BD",
                "num": "#",
                "numero": "\u2116",
                "numsp": "\u2007",
                "nvap": "\u224D\u20D2",
                "nvdash": "\u22AC",
                "nvDash": "\u22AD",
                "nVdash": "\u22AE",
                "nVDash": "\u22AF",
                "nvge": "\u2265\u20D2",
                "nvgt": ">\u20D2",
                "nvHarr": "\u2904",
                "nvinfin": "\u29DE",
                "nvlArr": "\u2902",
                "nvle": "\u2264\u20D2",
                "nvlt": "<\u20D2",
                "nvltrie": "\u22B4\u20D2",
                "nvrArr": "\u2903",
                "nvrtrie": "\u22B5\u20D2",
                "nvsim": "\u223C\u20D2",
                "nwarhk": "\u2923",
                "nwarr": "\u2196",
                "nwArr": "\u21D6",
                "nwarrow": "\u2196",
                "nwnear": "\u2927",
                "Oacute": "\u00D3",
                "oacute": "\u00F3",
                "oast": "\u229B",
                "Ocirc": "\u00D4",
                "ocirc": "\u00F4",
                "ocir": "\u229A",
                "Ocy": "\u041E",
                "ocy": "\u043E",
                "odash": "\u229D",
                "Odblac": "\u0150",
                "odblac": "\u0151",
                "odiv": "\u2A38",
                "odot": "\u2299",
                "odsold": "\u29BC",
                "OElig": "\u0152",
                "oelig": "\u0153",
                "ofcir": "\u29BF",
                "Ofr": "\uD835\uDD12",
                "ofr": "\uD835\uDD2C",
                "ogon": "\u02DB",
                "Ograve": "\u00D2",
                "ograve": "\u00F2",
                "ogt": "\u29C1",
                "ohbar": "\u29B5",
                "ohm": "\u03A9",
                "oint": "\u222E",
                "olarr": "\u21BA",
                "olcir": "\u29BE",
                "olcross": "\u29BB",
                "oline": "\u203E",
                "olt": "\u29C0",
                "Omacr": "\u014C",
                "omacr": "\u014D",
                "Omega": "\u03A9",
                "omega": "\u03C9",
                "Omicron": "\u039F",
                "omicron": "\u03BF",
                "omid": "\u29B6",
                "ominus": "\u2296",
                "Oopf": "\uD835\uDD46",
                "oopf": "\uD835\uDD60",
                "opar": "\u29B7",
                "OpenCurlyDoubleQuote": "\u201C",
                "OpenCurlyQuote": "\u2018",
                "operp": "\u29B9",
                "oplus": "\u2295",
                "orarr": "\u21BB",
                "Or": "\u2A54",
                "or": "\u2228",
                "ord": "\u2A5D",
                "order": "\u2134",
                "orderof": "\u2134",
                "ordf": "\u00AA",
                "ordm": "\u00BA",
                "origof": "\u22B6",
                "oror": "\u2A56",
                "orslope": "\u2A57",
                "orv": "\u2A5B",
                "oS": "\u24C8",
                "Oscr": "\uD835\uDCAA",
                "oscr": "\u2134",
                "Oslash": "\u00D8",
                "oslash": "\u00F8",
                "osol": "\u2298",
                "Otilde": "\u00D5",
                "otilde": "\u00F5",
                "otimesas": "\u2A36",
                "Otimes": "\u2A37",
                "otimes": "\u2297",
                "Ouml": "\u00D6",
                "ouml": "\u00F6",
                "ovbar": "\u233D",
                "OverBar": "\u203E",
                "OverBrace": "\u23DE",
                "OverBracket": "\u23B4",
                "OverParenthesis": "\u23DC",
                "para": "\u00B6",
                "parallel": "\u2225",
                "par": "\u2225",
                "parsim": "\u2AF3",
                "parsl": "\u2AFD",
                "part": "\u2202",
                "PartialD": "\u2202",
                "Pcy": "\u041F",
                "pcy": "\u043F",
                "percnt": "%",
                "period": ".",
                "permil": "\u2030",
                "perp": "\u22A5",
                "pertenk": "\u2031",
                "Pfr": "\uD835\uDD13",
                "pfr": "\uD835\uDD2D",
                "Phi": "\u03A6",
                "phi": "\u03C6",
                "phiv": "\u03D5",
                "phmmat": "\u2133",
                "phone": "\u260E",
                "Pi": "\u03A0",
                "pi": "\u03C0",
                "pitchfork": "\u22D4",
                "piv": "\u03D6",
                "planck": "\u210F",
                "planckh": "\u210E",
                "plankv": "\u210F",
                "plusacir": "\u2A23",
                "plusb": "\u229E",
                "pluscir": "\u2A22",
                "plus": "+",
                "plusdo": "\u2214",
                "plusdu": "\u2A25",
                "pluse": "\u2A72",
                "PlusMinus": "\u00B1",
                "plusmn": "\u00B1",
                "plussim": "\u2A26",
                "plustwo": "\u2A27",
                "pm": "\u00B1",
                "Poincareplane": "\u210C",
                "pointint": "\u2A15",
                "popf": "\uD835\uDD61",
                "Popf": "\u2119",
                "pound": "\u00A3",
                "prap": "\u2AB7",
                "Pr": "\u2ABB",
                "pr": "\u227A",
                "prcue": "\u227C",
                "precapprox": "\u2AB7",
                "prec": "\u227A",
                "preccurlyeq": "\u227C",
                "Precedes": "\u227A",
                "PrecedesEqual": "\u2AAF",
                "PrecedesSlantEqual": "\u227C",
                "PrecedesTilde": "\u227E",
                "preceq": "\u2AAF",
                "precnapprox": "\u2AB9",
                "precneqq": "\u2AB5",
                "precnsim": "\u22E8",
                "pre": "\u2AAF",
                "prE": "\u2AB3",
                "precsim": "\u227E",
                "prime": "\u2032",
                "Prime": "\u2033",
                "primes": "\u2119",
                "prnap": "\u2AB9",
                "prnE": "\u2AB5",
                "prnsim": "\u22E8",
                "prod": "\u220F",
                "Product": "\u220F",
                "profalar": "\u232E",
                "profline": "\u2312",
                "profsurf": "\u2313",
                "prop": "\u221D",
                "Proportional": "\u221D",
                "Proportion": "\u2237",
                "propto": "\u221D",
                "prsim": "\u227E",
                "prurel": "\u22B0",
                "Pscr": "\uD835\uDCAB",
                "pscr": "\uD835\uDCC5",
                "Psi": "\u03A8",
                "psi": "\u03C8",
                "puncsp": "\u2008",
                "Qfr": "\uD835\uDD14",
                "qfr": "\uD835\uDD2E",
                "qint": "\u2A0C",
                "qopf": "\uD835\uDD62",
                "Qopf": "\u211A",
                "qprime": "\u2057",
                "Qscr": "\uD835\uDCAC",
                "qscr": "\uD835\uDCC6",
                "quaternions": "\u210D",
                "quatint": "\u2A16",
                "quest": "?",
                "questeq": "\u225F",
                "quot": "\"",
                "QUOT": "\"",
                "rAarr": "\u21DB",
                "race": "\u223D\u0331",
                "Racute": "\u0154",
                "racute": "\u0155",
                "radic": "\u221A",
                "raemptyv": "\u29B3",
                "rang": "\u27E9",
                "Rang": "\u27EB",
                "rangd": "\u2992",
                "range": "\u29A5",
                "rangle": "\u27E9",
                "raquo": "\u00BB",
                "rarrap": "\u2975",
                "rarrb": "\u21E5",
                "rarrbfs": "\u2920",
                "rarrc": "\u2933",
                "rarr": "\u2192",
                "Rarr": "\u21A0",
                "rArr": "\u21D2",
                "rarrfs": "\u291E",
                "rarrhk": "\u21AA",
                "rarrlp": "\u21AC",
                "rarrpl": "\u2945",
                "rarrsim": "\u2974",
                "Rarrtl": "\u2916",
                "rarrtl": "\u21A3",
                "rarrw": "\u219D",
                "ratail": "\u291A",
                "rAtail": "\u291C",
                "ratio": "\u2236",
                "rationals": "\u211A",
                "rbarr": "\u290D",
                "rBarr": "\u290F",
                "RBarr": "\u2910",
                "rbbrk": "\u2773",
                "rbrace": "}",
                "rbrack": "]",
                "rbrke": "\u298C",
                "rbrksld": "\u298E",
                "rbrkslu": "\u2990",
                "Rcaron": "\u0158",
                "rcaron": "\u0159",
                "Rcedil": "\u0156",
                "rcedil": "\u0157",
                "rceil": "\u2309",
                "rcub": "}",
                "Rcy": "\u0420",
                "rcy": "\u0440",
                "rdca": "\u2937",
                "rdldhar": "\u2969",
                "rdquo": "\u201D",
                "rdquor": "\u201D",
                "rdsh": "\u21B3",
                "real": "\u211C",
                "realine": "\u211B",
                "realpart": "\u211C",
                "reals": "\u211D",
                "Re": "\u211C",
                "rect": "\u25AD",
                "reg": "\u00AE",
                "REG": "\u00AE",
                "ReverseElement": "\u220B",
                "ReverseEquilibrium": "\u21CB",
                "ReverseUpEquilibrium": "\u296F",
                "rfisht": "\u297D",
                "rfloor": "\u230B",
                "rfr": "\uD835\uDD2F",
                "Rfr": "\u211C",
                "rHar": "\u2964",
                "rhard": "\u21C1",
                "rharu": "\u21C0",
                "rharul": "\u296C",
                "Rho": "\u03A1",
                "rho": "\u03C1",
                "rhov": "\u03F1",
                "RightAngleBracket": "\u27E9",
                "RightArrowBar": "\u21E5",
                "rightarrow": "\u2192",
                "RightArrow": "\u2192",
                "Rightarrow": "\u21D2",
                "RightArrowLeftArrow": "\u21C4",
                "rightarrowtail": "\u21A3",
                "RightCeiling": "\u2309",
                "RightDoubleBracket": "\u27E7",
                "RightDownTeeVector": "\u295D",
                "RightDownVectorBar": "\u2955",
                "RightDownVector": "\u21C2",
                "RightFloor": "\u230B",
                "rightharpoondown": "\u21C1",
                "rightharpoonup": "\u21C0",
                "rightleftarrows": "\u21C4",
                "rightleftharpoons": "\u21CC",
                "rightrightarrows": "\u21C9",
                "rightsquigarrow": "\u219D",
                "RightTeeArrow": "\u21A6",
                "RightTee": "\u22A2",
                "RightTeeVector": "\u295B",
                "rightthreetimes": "\u22CC",
                "RightTriangleBar": "\u29D0",
                "RightTriangle": "\u22B3",
                "RightTriangleEqual": "\u22B5",
                "RightUpDownVector": "\u294F",
                "RightUpTeeVector": "\u295C",
                "RightUpVectorBar": "\u2954",
                "RightUpVector": "\u21BE",
                "RightVectorBar": "\u2953",
                "RightVector": "\u21C0",
                "ring": "\u02DA",
                "risingdotseq": "\u2253",
                "rlarr": "\u21C4",
                "rlhar": "\u21CC",
                "rlm": "\u200F",
                "rmoustache": "\u23B1",
                "rmoust": "\u23B1",
                "rnmid": "\u2AEE",
                "roang": "\u27ED",
                "roarr": "\u21FE",
                "robrk": "\u27E7",
                "ropar": "\u2986",
                "ropf": "\uD835\uDD63",
                "Ropf": "\u211D",
                "roplus": "\u2A2E",
                "rotimes": "\u2A35",
                "RoundImplies": "\u2970",
                "rpar": ")",
                "rpargt": "\u2994",
                "rppolint": "\u2A12",
                "rrarr": "\u21C9",
                "Rrightarrow": "\u21DB",
                "rsaquo": "\u203A",
                "rscr": "\uD835\uDCC7",
                "Rscr": "\u211B",
                "rsh": "\u21B1",
                "Rsh": "\u21B1",
                "rsqb": "]",
                "rsquo": "\u2019",
                "rsquor": "\u2019",
                "rthree": "\u22CC",
                "rtimes": "\u22CA",
                "rtri": "\u25B9",
                "rtrie": "\u22B5",
                "rtrif": "\u25B8",
                "rtriltri": "\u29CE",
                "RuleDelayed": "\u29F4",
                "ruluhar": "\u2968",
                "rx": "\u211E",
                "Sacute": "\u015A",
                "sacute": "\u015B",
                "sbquo": "\u201A",
                "scap": "\u2AB8",
                "Scaron": "\u0160",
                "scaron": "\u0161",
                "Sc": "\u2ABC",
                "sc": "\u227B",
                "sccue": "\u227D",
                "sce": "\u2AB0",
                "scE": "\u2AB4",
                "Scedil": "\u015E",
                "scedil": "\u015F",
                "Scirc": "\u015C",
                "scirc": "\u015D",
                "scnap": "\u2ABA",
                "scnE": "\u2AB6",
                "scnsim": "\u22E9",
                "scpolint": "\u2A13",
                "scsim": "\u227F",
                "Scy": "\u0421",
                "scy": "\u0441",
                "sdotb": "\u22A1",
                "sdot": "\u22C5",
                "sdote": "\u2A66",
                "searhk": "\u2925",
                "searr": "\u2198",
                "seArr": "\u21D8",
                "searrow": "\u2198",
                "sect": "\u00A7",
                "semi": ";",
                "seswar": "\u2929",
                "setminus": "\u2216",
                "setmn": "\u2216",
                "sext": "\u2736",
                "Sfr": "\uD835\uDD16",
                "sfr": "\uD835\uDD30",
                "sfrown": "\u2322",
                "sharp": "\u266F",
                "SHCHcy": "\u0429",
                "shchcy": "\u0449",
                "SHcy": "\u0428",
                "shcy": "\u0448",
                "ShortDownArrow": "\u2193",
                "ShortLeftArrow": "\u2190",
                "shortmid": "\u2223",
                "shortparallel": "\u2225",
                "ShortRightArrow": "\u2192",
                "ShortUpArrow": "\u2191",
                "shy": "\u00AD",
                "Sigma": "\u03A3",
                "sigma": "\u03C3",
                "sigmaf": "\u03C2",
                "sigmav": "\u03C2",
                "sim": "\u223C",
                "simdot": "\u2A6A",
                "sime": "\u2243",
                "simeq": "\u2243",
                "simg": "\u2A9E",
                "simgE": "\u2AA0",
                "siml": "\u2A9D",
                "simlE": "\u2A9F",
                "simne": "\u2246",
                "simplus": "\u2A24",
                "simrarr": "\u2972",
                "slarr": "\u2190",
                "SmallCircle": "\u2218",
                "smallsetminus": "\u2216",
                "smashp": "\u2A33",
                "smeparsl": "\u29E4",
                "smid": "\u2223",
                "smile": "\u2323",
                "smt": "\u2AAA",
                "smte": "\u2AAC",
                "smtes": "\u2AAC\uFE00",
                "SOFTcy": "\u042C",
                "softcy": "\u044C",
                "solbar": "\u233F",
                "solb": "\u29C4",
                "sol": "/",
                "Sopf": "\uD835\uDD4A",
                "sopf": "\uD835\uDD64",
                "spades": "\u2660",
                "spadesuit": "\u2660",
                "spar": "\u2225",
                "sqcap": "\u2293",
                "sqcaps": "\u2293\uFE00",
                "sqcup": "\u2294",
                "sqcups": "\u2294\uFE00",
                "Sqrt": "\u221A",
                "sqsub": "\u228F",
                "sqsube": "\u2291",
                "sqsubset": "\u228F",
                "sqsubseteq": "\u2291",
                "sqsup": "\u2290",
                "sqsupe": "\u2292",
                "sqsupset": "\u2290",
                "sqsupseteq": "\u2292",
                "square": "\u25A1",
                "Square": "\u25A1",
                "SquareIntersection": "\u2293",
                "SquareSubset": "\u228F",
                "SquareSubsetEqual": "\u2291",
                "SquareSuperset": "\u2290",
                "SquareSupersetEqual": "\u2292",
                "SquareUnion": "\u2294",
                "squarf": "\u25AA",
                "squ": "\u25A1",
                "squf": "\u25AA",
                "srarr": "\u2192",
                "Sscr": "\uD835\uDCAE",
                "sscr": "\uD835\uDCC8",
                "ssetmn": "\u2216",
                "ssmile": "\u2323",
                "sstarf": "\u22C6",
                "Star": "\u22C6",
                "star": "\u2606",
                "starf": "\u2605",
                "straightepsilon": "\u03F5",
                "straightphi": "\u03D5",
                "strns": "\u00AF",
                "sub": "\u2282",
                "Sub": "\u22D0",
                "subdot": "\u2ABD",
                "subE": "\u2AC5",
                "sube": "\u2286",
                "subedot": "\u2AC3",
                "submult": "\u2AC1",
                "subnE": "\u2ACB",
                "subne": "\u228A",
                "subplus": "\u2ABF",
                "subrarr": "\u2979",
                "subset": "\u2282",
                "Subset": "\u22D0",
                "subseteq": "\u2286",
                "subseteqq": "\u2AC5",
                "SubsetEqual": "\u2286",
                "subsetneq": "\u228A",
                "subsetneqq": "\u2ACB",
                "subsim": "\u2AC7",
                "subsub": "\u2AD5",
                "subsup": "\u2AD3",
                "succapprox": "\u2AB8",
                "succ": "\u227B",
                "succcurlyeq": "\u227D",
                "Succeeds": "\u227B",
                "SucceedsEqual": "\u2AB0",
                "SucceedsSlantEqual": "\u227D",
                "SucceedsTilde": "\u227F",
                "succeq": "\u2AB0",
                "succnapprox": "\u2ABA",
                "succneqq": "\u2AB6",
                "succnsim": "\u22E9",
                "succsim": "\u227F",
                "SuchThat": "\u220B",
                "sum": "\u2211",
                "Sum": "\u2211",
                "sung": "\u266A",
                "sup1": "\u00B9",
                "sup2": "\u00B2",
                "sup3": "\u00B3",
                "sup": "\u2283",
                "Sup": "\u22D1",
                "supdot": "\u2ABE",
                "supdsub": "\u2AD8",
                "supE": "\u2AC6",
                "supe": "\u2287",
                "supedot": "\u2AC4",
                "Superset": "\u2283",
                "SupersetEqual": "\u2287",
                "suphsol": "\u27C9",
                "suphsub": "\u2AD7",
                "suplarr": "\u297B",
                "supmult": "\u2AC2",
                "supnE": "\u2ACC",
                "supne": "\u228B",
                "supplus": "\u2AC0",
                "supset": "\u2283",
                "Supset": "\u22D1",
                "supseteq": "\u2287",
                "supseteqq": "\u2AC6",
                "supsetneq": "\u228B",
                "supsetneqq": "\u2ACC",
                "supsim": "\u2AC8",
                "supsub": "\u2AD4",
                "supsup": "\u2AD6",
                "swarhk": "\u2926",
                "swarr": "\u2199",
                "swArr": "\u21D9",
                "swarrow": "\u2199",
                "swnwar": "\u292A",
                "szlig": "\u00DF",
                "Tab": "\t",
                "target": "\u2316",
                "Tau": "\u03A4",
                "tau": "\u03C4",
                "tbrk": "\u23B4",
                "Tcaron": "\u0164",
                "tcaron": "\u0165",
                "Tcedil": "\u0162",
                "tcedil": "\u0163",
                "Tcy": "\u0422",
                "tcy": "\u0442",
                "tdot": "\u20DB",
                "telrec": "\u2315",
                "Tfr": "\uD835\uDD17",
                "tfr": "\uD835\uDD31",
                "there4": "\u2234",
                "therefore": "\u2234",
                "Therefore": "\u2234",
                "Theta": "\u0398",
                "theta": "\u03B8",
                "thetasym": "\u03D1",
                "thetav": "\u03D1",
                "thickapprox": "\u2248",
                "thicksim": "\u223C",
                "ThickSpace": "\u205F\u200A",
                "ThinSpace": "\u2009",
                "thinsp": "\u2009",
                "thkap": "\u2248",
                "thksim": "\u223C",
                "THORN": "\u00DE",
                "thorn": "\u00FE",
                "tilde": "\u02DC",
                "Tilde": "\u223C",
                "TildeEqual": "\u2243",
                "TildeFullEqual": "\u2245",
                "TildeTilde": "\u2248",
                "timesbar": "\u2A31",
                "timesb": "\u22A0",
                "times": "\u00D7",
                "timesd": "\u2A30",
                "tint": "\u222D",
                "toea": "\u2928",
                "topbot": "\u2336",
                "topcir": "\u2AF1",
                "top": "\u22A4",
                "Topf": "\uD835\uDD4B",
                "topf": "\uD835\uDD65",
                "topfork": "\u2ADA",
                "tosa": "\u2929",
                "tprime": "\u2034",
                "trade": "\u2122",
                "TRADE": "\u2122",
                "triangle": "\u25B5",
                "triangledown": "\u25BF",
                "triangleleft": "\u25C3",
                "trianglelefteq": "\u22B4",
                "triangleq": "\u225C",
                "triangleright": "\u25B9",
                "trianglerighteq": "\u22B5",
                "tridot": "\u25EC",
                "trie": "\u225C",
                "triminus": "\u2A3A",
                "TripleDot": "\u20DB",
                "triplus": "\u2A39",
                "trisb": "\u29CD",
                "tritime": "\u2A3B",
                "trpezium": "\u23E2",
                "Tscr": "\uD835\uDCAF",
                "tscr": "\uD835\uDCC9",
                "TScy": "\u0426",
                "tscy": "\u0446",
                "TSHcy": "\u040B",
                "tshcy": "\u045B",
                "Tstrok": "\u0166",
                "tstrok": "\u0167",
                "twixt": "\u226C",
                "twoheadleftarrow": "\u219E",
                "twoheadrightarrow": "\u21A0",
                "Uacute": "\u00DA",
                "uacute": "\u00FA",
                "uarr": "\u2191",
                "Uarr": "\u219F",
                "uArr": "\u21D1",
                "Uarrocir": "\u2949",
                "Ubrcy": "\u040E",
                "ubrcy": "\u045E",
                "Ubreve": "\u016C",
                "ubreve": "\u016D",
                "Ucirc": "\u00DB",
                "ucirc": "\u00FB",
                "Ucy": "\u0423",
                "ucy": "\u0443",
                "udarr": "\u21C5",
                "Udblac": "\u0170",
                "udblac": "\u0171",
                "udhar": "\u296E",
                "ufisht": "\u297E",
                "Ufr": "\uD835\uDD18",
                "ufr": "\uD835\uDD32",
                "Ugrave": "\u00D9",
                "ugrave": "\u00F9",
                "uHar": "\u2963",
                "uharl": "\u21BF",
                "uharr": "\u21BE",
                "uhblk": "\u2580",
                "ulcorn": "\u231C",
                "ulcorner": "\u231C",
                "ulcrop": "\u230F",
                "ultri": "\u25F8",
                "Umacr": "\u016A",
                "umacr": "\u016B",
                "uml": "\u00A8",
                "UnderBar": "_",
                "UnderBrace": "\u23DF",
                "UnderBracket": "\u23B5",
                "UnderParenthesis": "\u23DD",
                "Union": "\u22C3",
                "UnionPlus": "\u228E",
                "Uogon": "\u0172",
                "uogon": "\u0173",
                "Uopf": "\uD835\uDD4C",
                "uopf": "\uD835\uDD66",
                "UpArrowBar": "\u2912",
                "uparrow": "\u2191",
                "UpArrow": "\u2191",
                "Uparrow": "\u21D1",
                "UpArrowDownArrow": "\u21C5",
                "updownarrow": "\u2195",
                "UpDownArrow": "\u2195",
                "Updownarrow": "\u21D5",
                "UpEquilibrium": "\u296E",
                "upharpoonleft": "\u21BF",
                "upharpoonright": "\u21BE",
                "uplus": "\u228E",
                "UpperLeftArrow": "\u2196",
                "UpperRightArrow": "\u2197",
                "upsi": "\u03C5",
                "Upsi": "\u03D2",
                "upsih": "\u03D2",
                "Upsilon": "\u03A5",
                "upsilon": "\u03C5",
                "UpTeeArrow": "\u21A5",
                "UpTee": "\u22A5",
                "upuparrows": "\u21C8",
                "urcorn": "\u231D",
                "urcorner": "\u231D",
                "urcrop": "\u230E",
                "Uring": "\u016E",
                "uring": "\u016F",
                "urtri": "\u25F9",
                "Uscr": "\uD835\uDCB0",
                "uscr": "\uD835\uDCCA",
                "utdot": "\u22F0",
                "Utilde": "\u0168",
                "utilde": "\u0169",
                "utri": "\u25B5",
                "utrif": "\u25B4",
                "uuarr": "\u21C8",
                "Uuml": "\u00DC",
                "uuml": "\u00FC",
                "uwangle": "\u29A7",
                "vangrt": "\u299C",
                "varepsilon": "\u03F5",
                "varkappa": "\u03F0",
                "varnothing": "\u2205",
                "varphi": "\u03D5",
                "varpi": "\u03D6",
                "varpropto": "\u221D",
                "varr": "\u2195",
                "vArr": "\u21D5",
                "varrho": "\u03F1",
                "varsigma": "\u03C2",
                "varsubsetneq": "\u228A\uFE00",
                "varsubsetneqq": "\u2ACB\uFE00",
                "varsupsetneq": "\u228B\uFE00",
                "varsupsetneqq": "\u2ACC\uFE00",
                "vartheta": "\u03D1",
                "vartriangleleft": "\u22B2",
                "vartriangleright": "\u22B3",
                "vBar": "\u2AE8",
                "Vbar": "\u2AEB",
                "vBarv": "\u2AE9",
                "Vcy": "\u0412",
                "vcy": "\u0432",
                "vdash": "\u22A2",
                "vDash": "\u22A8",
                "Vdash": "\u22A9",
                "VDash": "\u22AB",
                "Vdashl": "\u2AE6",
                "veebar": "\u22BB",
                "vee": "\u2228",
                "Vee": "\u22C1",
                "veeeq": "\u225A",
                "vellip": "\u22EE",
                "verbar": "|",
                "Verbar": "\u2016",
                "vert": "|",
                "Vert": "\u2016",
                "VerticalBar": "\u2223",
                "VerticalLine": "|",
                "VerticalSeparator": "\u2758",
                "VerticalTilde": "\u2240",
                "VeryThinSpace": "\u200A",
                "Vfr": "\uD835\uDD19",
                "vfr": "\uD835\uDD33",
                "vltri": "\u22B2",
                "vnsub": "\u2282\u20D2",
                "vnsup": "\u2283\u20D2",
                "Vopf": "\uD835\uDD4D",
                "vopf": "\uD835\uDD67",
                "vprop": "\u221D",
                "vrtri": "\u22B3",
                "Vscr": "\uD835\uDCB1",
                "vscr": "\uD835\uDCCB",
                "vsubnE": "\u2ACB\uFE00",
                "vsubne": "\u228A\uFE00",
                "vsupnE": "\u2ACC\uFE00",
                "vsupne": "\u228B\uFE00",
                "Vvdash": "\u22AA",
                "vzigzag": "\u299A",
                "Wcirc": "\u0174",
                "wcirc": "\u0175",
                "wedbar": "\u2A5F",
                "wedge": "\u2227",
                "Wedge": "\u22C0",
                "wedgeq": "\u2259",
                "weierp": "\u2118",
                "Wfr": "\uD835\uDD1A",
                "wfr": "\uD835\uDD34",
                "Wopf": "\uD835\uDD4E",
                "wopf": "\uD835\uDD68",
                "wp": "\u2118",
                "wr": "\u2240",
                "wreath": "\u2240",
                "Wscr": "\uD835\uDCB2",
                "wscr": "\uD835\uDCCC",
                "xcap": "\u22C2",
                "xcirc": "\u25EF",
                "xcup": "\u22C3",
                "xdtri": "\u25BD",
                "Xfr": "\uD835\uDD1B",
                "xfr": "\uD835\uDD35",
                "xharr": "\u27F7",
                "xhArr": "\u27FA",
                "Xi": "\u039E",
                "xi": "\u03BE",
                "xlarr": "\u27F5",
                "xlArr": "\u27F8",
                "xmap": "\u27FC",
                "xnis": "\u22FB",
                "xodot": "\u2A00",
                "Xopf": "\uD835\uDD4F",
                "xopf": "\uD835\uDD69",
                "xoplus": "\u2A01",
                "xotime": "\u2A02",
                "xrarr": "\u27F6",
                "xrArr": "\u27F9",
                "Xscr": "\uD835\uDCB3",
                "xscr": "\uD835\uDCCD",
                "xsqcup": "\u2A06",
                "xuplus": "\u2A04",
                "xutri": "\u25B3",
                "xvee": "\u22C1",
                "xwedge": "\u22C0",
                "Yacute": "\u00DD",
                "yacute": "\u00FD",
                "YAcy": "\u042F",
                "yacy": "\u044F",
                "Ycirc": "\u0176",
                "ycirc": "\u0177",
                "Ycy": "\u042B",
                "ycy": "\u044B",
                "yen": "\u00A5",
                "Yfr": "\uD835\uDD1C",
                "yfr": "\uD835\uDD36",
                "YIcy": "\u0407",
                "yicy": "\u0457",
                "Yopf": "\uD835\uDD50",
                "yopf": "\uD835\uDD6A",
                "Yscr": "\uD835\uDCB4",
                "yscr": "\uD835\uDCCE",
                "YUcy": "\u042E",
                "yucy": "\u044E",
                "yuml": "\u00FF",
                "Yuml": "\u0178",
                "Zacute": "\u0179",
                "zacute": "\u017A",
                "Zcaron": "\u017D",
                "zcaron": "\u017E",
                "Zcy": "\u0417",
                "zcy": "\u0437",
                "Zdot": "\u017B",
                "zdot": "\u017C",
                "zeetrf": "\u2128",
                "ZeroWidthSpace": "\u200B",
                "Zeta": "\u0396",
                "zeta": "\u03B6",
                "zfr": "\uD835\uDD37",
                "Zfr": "\u2128",
                "ZHcy": "\u0416",
                "zhcy": "\u0436",
                "zigrarr": "\u21DD",
                "zopf": "\uD835\uDD6B",
                "Zopf": "\u2124",
                "Zscr": "\uD835\uDCB5",
                "zscr": "\uD835\uDCCF",
                "zwj": "\u200D",
                "zwnj": "\u200C"
            }
        }
        , {}],
        53: [function(require, module, exports) {
            'use strict';
            function assign(obj) {
                var sources = Array.prototype.slice.call(arguments, 1);
                sources.forEach(function(source) {
                    if (!source) {
                        return;
                    }
                    Object.keys(source).forEach(function(key) {
                        obj[key] = source[key];
                    });
                });
                return obj;
            }
            function _class(obj) {
                return Object.prototype.toString.call(obj);
            }
            function isString(obj) {
                return _class(obj) === '[object String]';
            }
            function isObject(obj) {
                return _class(obj) === '[object Object]';
            }
            function isRegExp(obj) {
                return _class(obj) === '[object RegExp]';
            }
            function isFunction(obj) {
                return _class(obj) === '[object Function]';
            }
            function escapeRE(str) {
                return str.replace(/[.?*+^$[\]\\(){}|-]/g, '\\$&');
            }
            var defaultOptions = {
                fuzzyLink: true,
                fuzzyEmail: true,
                fuzzyIP: false
            };
            function isOptionsObj(obj) {
                return Object.keys(obj || {}).reduce(function(acc, k) {
                    return acc || defaultOptions.hasOwnProperty(k);
                }, false);
            }
            var defaultSchemas = {
                'http:': {
                    validate: function(text, pos, self) {
                        var tail = text.slice(pos);
                        if (!self.re.http) {
                            self.re.http = new RegExp('^\\/\\/' + self.re.src_auth + self.re.src_host_port_strict + self.re.src_path,'i');
                        }
                        if (self.re.http.test(tail)) {
                            return tail.match(self.re.http)[0].length;
                        }
                        return 0;
                    }
                },
                'https:': 'http:',
                'ftp:': 'http:',
                '//': {
                    validate: function(text, pos, self) {
                        var tail = text.slice(pos);
                        if (!self.re.no_http) {
                            self.re.no_http = new RegExp('^' + self.re.src_auth + '(?:localhost|(?:(?:' + self.re.src_domain + ')\\.)+' + self.re.src_domain_root + ')' + self.re.src_port + self.re.src_host_terminator + self.re.src_path,'i');
                        }
                        if (self.re.no_http.test(tail)) {
                            if (pos >= 3 && text[pos - 3] === ':') {
                                return 0;
                            }
                            if (pos >= 3 && text[pos - 3] === '/') {
                                return 0;
                            }
                            return tail.match(self.re.no_http)[0].length;
                        }
                        return 0;
                    }
                },
                'mailto:': {
                    validate: function(text, pos, self) {
                        var tail = text.slice(pos);
                        if (!self.re.mailto) {
                            self.re.mailto = new RegExp('^' + self.re.src_email_name + '@' + self.re.src_host_strict,'i');
                        }
                        if (self.re.mailto.test(tail)) {
                            return tail.match(self.re.mailto)[0].length;
                        }
                        return 0;
                    }
                }
            };
            var tlds_2ch_src_re = 'a[cdefgilmnoqrstuwxz]|b[abdefghijmnorstvwyz]|c[acdfghiklmnoruvwxyz]|d[ejkmoz]|e[cegrstu]|f[ijkmor]|g[abdefghilmnpqrstuwy]|h[kmnrtu]|i[delmnoqrst]|j[emop]|k[eghimnprwyz]|l[abcikrstuvy]|m[acdeghklmnopqrstuvwxyz]|n[acefgilopruz]|om|p[aefghklmnrstwy]|qa|r[eosuw]|s[abcdeghijklmnortuvxyz]|t[cdfghjklmnortvwz]|u[agksyz]|v[aceginu]|w[fs]|y[et]|z[amw]';
            var tlds_default = 'biz|com|edu|gov|net|org|pro|web|xxx|aero|asia|coop|info|museum|name|shop|рф'.split('|');
            function resetScanCache(self) {
                self.__index__ = -1;
                self.__text_cache__ = '';
            }
            function createValidator(re) {
                return function(text, pos) {
                    var tail = text.slice(pos);
                    if (re.test(tail)) {
                        return tail.match(re)[0].length;
                    }
                    return 0;
                }
                ;
            }
            function createNormalizer() {
                return function(match, self) {
                    self.normalize(match);
                }
                ;
            }
            function compile(self) {
                var re = self.re = require('./lib/re')(self.__opts__);
                var tlds = self.__tlds__.slice();
                self.onCompile();
                if (!self.__tlds_replaced__) {
                    tlds.push(tlds_2ch_src_re);
                }
                tlds.push(re.src_xn);
                re.src_tlds = tlds.join('|');
                function untpl(tpl) {
                    return tpl.replace('%TLDS%', re.src_tlds);
                }
                re.email_fuzzy = RegExp(untpl(re.tpl_email_fuzzy), 'i');
                re.link_fuzzy = RegExp(untpl(re.tpl_link_fuzzy), 'i');
                re.link_no_ip_fuzzy = RegExp(untpl(re.tpl_link_no_ip_fuzzy), 'i');
                re.host_fuzzy_test = RegExp(untpl(re.tpl_host_fuzzy_test), 'i');
                var aliases = [];
                self.__compiled__ = {};
                function schemaError(name, val) {
                    throw new Error('(LinkifyIt) Invalid schema "' + name + '": ' + val);
                }
                Object.keys(self.__schemas__).forEach(function(name) {
                    var val = self.__schemas__[name];
                    if (val === null) {
                        return;
                    }
                    var compiled = {
                        validate: null,
                        link: null
                    };
                    self.__compiled__[name] = compiled;
                    if (isObject(val)) {
                        if (isRegExp(val.validate)) {
                            compiled.validate = createValidator(val.validate);
                        } else if (isFunction(val.validate)) {
                            compiled.validate = val.validate;
                        } else {
                            schemaError(name, val);
                        }
                        if (isFunction(val.normalize)) {
                            compiled.normalize = val.normalize;
                        } else if (!val.normalize) {
                            compiled.normalize = createNormalizer();
                        } else {
                            schemaError(name, val);
                        }
                        return;
                    }
                    if (isString(val)) {
                        aliases.push(name);
                        return;
                    }
                    schemaError(name, val);
                });
                aliases.forEach(function(alias) {
                    if (!self.__compiled__[self.__schemas__[alias]]) {
                        return;
                    }
                    self.__compiled__[alias].validate = self.__compiled__[self.__schemas__[alias]].validate;
                    self.__compiled__[alias].normalize = self.__compiled__[self.__schemas__[alias]].normalize;
                });
                self.__compiled__[''] = {
                    validate: null,
                    normalize: createNormalizer()
                };
                var slist = Object.keys(self.__compiled__).filter(function(name) {
                    return name.length > 0 && self.__compiled__[name];
                }).map(escapeRE).join('|');
                self.re.schema_test = RegExp('(^|(?!_)(?:[><\uff5c]|' + re.src_ZPCc + '))(' + slist + ')', 'i');
                self.re.schema_search = RegExp('(^|(?!_)(?:[><\uff5c]|' + re.src_ZPCc + '))(' + slist + ')', 'ig');
                self.re.pretest = RegExp('(' + self.re.schema_test.source + ')|(' + self.re.host_fuzzy_test.source + ')|@', 'i');
                resetScanCache(self);
            }
            function Match(self, shift) {
                var start = self.__index__
                  , end = self.__last_index__
                  , text = self.__text_cache__.slice(start, end);
                this.schema = self.__schema__.toLowerCase();
                this.index = start + shift;
                this.lastIndex = end + shift;
                this.raw = text;
                this.text = text;
                this.url = text;
            }
            function createMatch(self, shift) {
                var match = new Match(self,shift);
                self.__compiled__[match.schema].normalize(match, self);
                return match;
            }
            function LinkifyIt(schemas, options) {
                if (!(this instanceof LinkifyIt)) {
                    return new LinkifyIt(schemas,options);
                }
                if (!options) {
                    if (isOptionsObj(schemas)) {
                        options = schemas;
                        schemas = {};
                    }
                }
                this.__opts__ = assign({}, defaultOptions, options);
                this.__index__ = -1;
                this.__last_index__ = -1;
                this.__schema__ = '';
                this.__text_cache__ = '';
                this.__schemas__ = assign({}, defaultSchemas, schemas);
                this.__compiled__ = {};
                this.__tlds__ = tlds_default;
                this.__tlds_replaced__ = false;
                this.re = {};
                compile(this);
            }
            LinkifyIt.prototype.add = function add(schema, definition) {
                this.__schemas__[schema] = definition;
                compile(this);
                return this;
            }
            ;
            LinkifyIt.prototype.set = function set(options) {
                this.__opts__ = assign(this.__opts__, options);
                return this;
            }
            ;
            LinkifyIt.prototype.test = function test(text) {
                this.__text_cache__ = text;
                this.__index__ = -1;
                if (!text.length) {
                    return false;
                }
                var m, ml, me, len, shift, next, re, tld_pos, at_pos;
                if (this.re.schema_test.test(text)) {
                    re = this.re.schema_search;
                    re.lastIndex = 0;
                    while ((m = re.exec(text)) !== null) {
                        len = this.testSchemaAt(text, m[2], re.lastIndex);
                        if (len) {
                            this.__schema__ = m[2];
                            this.__index__ = m.index + m[1].length;
                            this.__last_index__ = m.index + m[0].length + len;
                            break;
                        }
                    }
                }
                if (this.__opts__.fuzzyLink && this.__compiled__['http:']) {
                    tld_pos = text.search(this.re.host_fuzzy_test);
                    if (tld_pos >= 0) {
                        if (this.__index__ < 0 || tld_pos < this.__index__) {
                            if ((ml = text.match(this.__opts__.fuzzyIP ? this.re.link_fuzzy : this.re.link_no_ip_fuzzy)) !== null) {
                                shift = ml.index + ml[1].length;
                                if (this.__index__ < 0 || shift < this.__index__) {
                                    this.__schema__ = '';
                                    this.__index__ = shift;
                                    this.__last_index__ = ml.index + ml[0].length;
                                }
                            }
                        }
                    }
                }
                if (this.__opts__.fuzzyEmail && this.__compiled__['mailto:']) {
                    at_pos = text.indexOf('@');
                    if (at_pos >= 0) {
                        if ((me = text.match(this.re.email_fuzzy)) !== null) {
                            shift = me.index + me[1].length;
                            next = me.index + me[0].length;
                            if (this.__index__ < 0 || shift < this.__index__ || (shift === this.__index__ && next > this.__last_index__)) {
                                this.__schema__ = 'mailto:';
                                this.__index__ = shift;
                                this.__last_index__ = next;
                            }
                        }
                    }
                }
                return this.__index__ >= 0;
            }
            ;
            LinkifyIt.prototype.pretest = function pretest(text) {
                return this.re.pretest.test(text);
            }
            ;
            LinkifyIt.prototype.testSchemaAt = function testSchemaAt(text, schema, pos) {
                if (!this.__compiled__[schema.toLowerCase()]) {
                    return 0;
                }
                return this.__compiled__[schema.toLowerCase()].validate(text, pos, this);
            }
            ;
            LinkifyIt.prototype.match = function match(text) {
                var shift = 0
                  , result = [];
                if (this.__index__ >= 0 && this.__text_cache__ === text) {
                    result.push(createMatch(this, shift));
                    shift = this.__last_index__;
                }
                var tail = shift ? text.slice(shift) : text;
                while (this.test(tail)) {
                    result.push(createMatch(this, shift));
                    tail = tail.slice(this.__last_index__);
                    shift += this.__last_index__;
                }
                if (result.length) {
                    return result;
                }
                return null;
            }
            ;
            LinkifyIt.prototype.tlds = function tlds(list, keepOld) {
                list = Array.isArray(list) ? list : [list];
                if (!keepOld) {
                    this.__tlds__ = list.slice();
                    this.__tlds_replaced__ = true;
                    compile(this);
                    return this;
                }
                this.__tlds__ = this.__tlds__.concat(list).sort().filter(function(el, idx, arr) {
                    return el !== arr[idx - 1];
                }).reverse();
                compile(this);
                return this;
            }
            ;
            LinkifyIt.prototype.normalize = function normalize(match) {
                if (!match.schema) {
                    match.url = 'http://' + match.url;
                }
                if (match.schema === 'mailto:' && !/^mailto:/i.test(match.url)) {
                    match.url = 'mailto:' + match.url;
                }
            }
            ;
            LinkifyIt.prototype.onCompile = function onCompile() {}
            ;
            module.exports = LinkifyIt;
        }
        , {
            "./lib/re": 54
        }],
        54: [function(require, module, exports) {
            'use strict';
            module.exports = function(opts) {
                var re = {};
                re.src_Any = require('uc.micro/properties/Any/regex').source;
                re.src_Cc = require('uc.micro/categories/Cc/regex').source;
                re.src_Z = require('uc.micro/categories/Z/regex').source;
                re.src_P = require('uc.micro/categories/P/regex').source;
                re.src_ZPCc = [re.src_Z, re.src_P, re.src_Cc].join('|');
                re.src_ZCc = [re.src_Z, re.src_Cc].join('|');
                var text_separators = '[><\uff5c]';
                re.src_pseudo_letter = '(?:(?!' + text_separators + '|' + re.src_ZPCc + ')' + re.src_Any + ')';
                re.src_ip4 = '(?:(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)';
                re.src_auth = '(?:(?:(?!' + re.src_ZCc + '|[@/\\[\\]()]).)+@)?';
                re.src_port = '(?::(?:6(?:[0-4]\\d{3}|5(?:[0-4]\\d{2}|5(?:[0-2]\\d|3[0-5])))|[1-5]?\\d{1,4}))?';
                re.src_host_terminator = '(?=$|' + text_separators + '|' + re.src_ZPCc + ')(?!-|_|:\\d|\\.-|\\.(?!$|' + re.src_ZPCc + '))';
                re.src_path = '(?:' + '[/?#]' + '(?:' + '(?!' + re.src_ZCc + '|' + text_separators + '|[()[\\]{}.,"\'?!\\-]).|' + '\\[(?:(?!' + re.src_ZCc + '|\\]).)*\\]|' + '\\((?:(?!' + re.src_ZCc + '|[)]).)*\\)|' + '\\{(?:(?!' + re.src_ZCc + '|[}]).)*\\}|' + '\\"(?:(?!' + re.src_ZCc + '|["]).)+\\"|' + "\\'(?:(?!" + re.src_ZCc + "|[']).)+\\'|" + "\\'(?=" + re.src_pseudo_letter + '|[-]).|' + '\\.{2,}[a-zA-Z0-9%/&]|' + '\\.(?!' + re.src_ZCc + '|[.]).|' + (opts && opts['---'] ? '\\-(?!--(?:[^-]|$))(?:-*)|' : '\\-+|') + '\\,(?!' + re.src_ZCc + ').|' + '\\!(?!' + re.src_ZCc + ').|' + '\\?(?!' + re.src_ZCc + '|[?]).' + ')+' + '|\\/' + ')?';
                re.src_email_name = '[\\-;:&=\\+\\$,\\.a-zA-Z0-9_][\\-;:&=\\+\\$,\\"\\.a-zA-Z0-9_]*';
                re.src_xn = 'xn--[a-z0-9\\-]{1,59}';
                re.src_domain_root = '(?:' + re.src_xn + '|' + re.src_pseudo_letter + '{1,63}' + ')';
                re.src_domain = '(?:' + re.src_xn + '|' + '(?:' + re.src_pseudo_letter + ')' + '|' + '(?:' + re.src_pseudo_letter + '(?:-|' + re.src_pseudo_letter + '){0,61}' + re.src_pseudo_letter + ')' + ')';
                re.src_host = '(?:' + '(?:(?:(?:' + re.src_domain + ')\\.)*' + re.src_domain + ')' + ')';
                re.tpl_host_fuzzy = '(?:' + re.src_ip4 + '|' + '(?:(?:(?:' + re.src_domain + ')\\.)+(?:%TLDS%))' + ')';
                re.tpl_host_no_ip_fuzzy = '(?:(?:(?:' + re.src_domain + ')\\.)+(?:%TLDS%))';
                re.src_host_strict = re.src_host + re.src_host_terminator;
                re.tpl_host_fuzzy_strict = re.tpl_host_fuzzy + re.src_host_terminator;
                re.src_host_port_strict = re.src_host + re.src_port + re.src_host_terminator;
                re.tpl_host_port_fuzzy_strict = re.tpl_host_fuzzy + re.src_port + re.src_host_terminator;
                re.tpl_host_port_no_ip_fuzzy_strict = re.tpl_host_no_ip_fuzzy + re.src_port + re.src_host_terminator;
                re.tpl_host_fuzzy_test = 'localhost|www\\.|\\.\\d{1,3}\\.|(?:\\.(?:%TLDS%)(?:' + re.src_ZPCc + '|>|$))';
                re.tpl_email_fuzzy = '(^|' + text_separators + '|"|\\(|' + re.src_ZCc + ')' + '(' + re.src_email_name + '@' + re.tpl_host_fuzzy_strict + ')';
                re.tpl_link_fuzzy = '(^|(?![.:/\\-_@])(?:[$+<=>^`|\uff5c]|' + re.src_ZPCc + '))' + '((?![$+<=>^`|\uff5c])' + re.tpl_host_port_fuzzy_strict + re.src_path + ')';
                re.tpl_link_no_ip_fuzzy = '(^|(?![.:/\\-_@])(?:[$+<=>^`|\uff5c]|' + re.src_ZPCc + '))' + '((?![$+<=>^`|\uff5c])' + re.tpl_host_port_no_ip_fuzzy_strict + re.src_path + ')';
                return re;
            }
            ;
        }
        , {
            "uc.micro/categories/Cc/regex": 61,
            "uc.micro/categories/P/regex": 63,
            "uc.micro/categories/Z/regex": 64,
            "uc.micro/properties/Any/regex": 66
        }],
        55: [function(require, module, exports) {
            'use strict';
            var decodeCache = {};
            function getDecodeCache(exclude) {
                var i, ch, cache = decodeCache[exclude];
                if (cache) {
                    return cache;
                }
                cache = decodeCache[exclude] = [];
                for (i = 0; i < 128; i++) {
                    ch = String.fromCharCode(i);
                    cache.push(ch);
                }
                for (i = 0; i < exclude.length; i++) {
                    ch = exclude.charCodeAt(i);
                    cache[ch] = '%' + ('0' + ch.toString(16).toUpperCase()).slice(-2);
                }
                return cache;
            }
            function decode(string, exclude) {
                var cache;
                if (typeof exclude !== 'string') {
                    exclude = decode.defaultChars;
                }
                cache = getDecodeCache(exclude);
                return string.replace(/(%[a-f0-9]{2})+/gi, function(seq) {
                    var i, l, b1, b2, b3, b4, chr, result = '';
                    for (i = 0,
                    l = seq.length; i < l; i += 3) {
                        b1 = parseInt(seq.slice(i + 1, i + 3), 16);
                        if (b1 < 0x80) {
                            result += cache[b1];
                            continue;
                        }
                        if ((b1 & 0xE0) === 0xC0 && (i + 3 < l)) {
                            b2 = parseInt(seq.slice(i + 4, i + 6), 16);
                            if ((b2 & 0xC0) === 0x80) {
                                chr = ((b1 << 6) & 0x7C0) | (b2 & 0x3F);
                                if (chr < 0x80) {
                                    result += '\ufffd\ufffd';
                                } else {
                                    result += String.fromCharCode(chr);
                                }
                                i += 3;
                                continue;
                            }
                        }
                        if ((b1 & 0xF0) === 0xE0 && (i + 6 < l)) {
                            b2 = parseInt(seq.slice(i + 4, i + 6), 16);
                            b3 = parseInt(seq.slice(i + 7, i + 9), 16);
                            if ((b2 & 0xC0) === 0x80 && (b3 & 0xC0) === 0x80) {
                                chr = ((b1 << 12) & 0xF000) | ((b2 << 6) & 0xFC0) | (b3 & 0x3F);
                                if (chr < 0x800 || (chr >= 0xD800 && chr <= 0xDFFF)) {
                                    result += '\ufffd\ufffd\ufffd';
                                } else {
                                    result += String.fromCharCode(chr);
                                }
                                i += 6;
                                continue;
                            }
                        }
                        if ((b1 & 0xF8) === 0xF0 && (i + 9 < l)) {
                            b2 = parseInt(seq.slice(i + 4, i + 6), 16);
                            b3 = parseInt(seq.slice(i + 7, i + 9), 16);
                            b4 = parseInt(seq.slice(i + 10, i + 12), 16);
                            if ((b2 & 0xC0) === 0x80 && (b3 & 0xC0) === 0x80 && (b4 & 0xC0) === 0x80) {
                                chr = ((b1 << 18) & 0x1C0000) | ((b2 << 12) & 0x3F000) | ((b3 << 6) & 0xFC0) | (b4 & 0x3F);
                                if (chr < 0x10000 || chr > 0x10FFFF) {
                                    result += '\ufffd\ufffd\ufffd\ufffd';
                                } else {
                                    chr -= 0x10000;
                                    result += String.fromCharCode(0xD800 + (chr >> 10), 0xDC00 + (chr & 0x3FF));
                                }
                                i += 9;
                                continue;
                            }
                        }
                        result += '\ufffd';
                    }
                    return result;
                });
            }
            decode.defaultChars = ';/?:@&=+$,#';
            decode.componentChars = '';
            module.exports = decode;
        }
        , {}],
        56: [function(require, module, exports) {
            'use strict';
            var encodeCache = {};
            function getEncodeCache(exclude) {
                var i, ch, cache = encodeCache[exclude];
                if (cache) {
                    return cache;
                }
                cache = encodeCache[exclude] = [];
                for (i = 0; i < 128; i++) {
                    ch = String.fromCharCode(i);
                    if (/^[0-9a-z]$/i.test(ch)) {
                        cache.push(ch);
                    } else {
                        cache.push('%' + ('0' + i.toString(16).toUpperCase()).slice(-2));
                    }
                }
                for (i = 0; i < exclude.length; i++) {
                    cache[exclude.charCodeAt(i)] = exclude[i];
                }
                return cache;
            }
            function encode(string, exclude, keepEscaped) {
                var i, l, code, nextCode, cache, result = '';
                if (typeof exclude !== 'string') {
                    keepEscaped = exclude;
                    exclude = encode.defaultChars;
                }
                if (typeof keepEscaped === 'undefined') {
                    keepEscaped = true;
                }
                cache = getEncodeCache(exclude);
                for (i = 0,
                l = string.length; i < l; i++) {
                    code = string.charCodeAt(i);
                    if (keepEscaped && code === 0x25 && i + 2 < l) {
                        if (/^[0-9a-f]{2}$/i.test(string.slice(i + 1, i + 3))) {
                            result += string.slice(i, i + 3);
                            i += 2;
                            continue;
                        }
                    }
                    if (code < 128) {
                        result += cache[code];
                        continue;
                    }
                    if (code >= 0xD800 && code <= 0xDFFF) {
                        if (code >= 0xD800 && code <= 0xDBFF && i + 1 < l) {
                            nextCode = string.charCodeAt(i + 1);
                            if (nextCode >= 0xDC00 && nextCode <= 0xDFFF) {
                                result += encodeURIComponent(string[i] + string[i + 1]);
                                i++;
                                continue;
                            }
                        }
                        result += '%EF%BF%BD';
                        continue;
                    }
                    result += encodeURIComponent(string[i]);
                }
                return result;
            }
            encode.defaultChars = ";/?:@&=+$,-_.!~*'()#";
            encode.componentChars = "-_.!~*'()";
            module.exports = encode;
        }
        , {}],
        57: [function(require, module, exports) {
            'use strict';
            module.exports = function format(url) {
                var result = '';
                result += url.protocol || '';
                result += url.slashes ? '//' : '';
                result += url.auth ? url.auth + '@' : '';
                if (url.hostname && url.hostname.indexOf(':') !== -1) {
                    result += '[' + url.hostname + ']';
                } else {
                    result += url.hostname || '';
                }
                result += url.port ? ':' + url.port : '';
                result += url.pathname || '';
                result += url.search || '';
                result += url.hash || '';
                return result;
            }
            ;
        }
        , {}],
        58: [function(require, module, exports) {
            'use strict';
            module.exports.encode = require('./encode');
            module.exports.decode = require('./decode');
            module.exports.format = require('./format');
            module.exports.parse = require('./parse');
        }
        , {
            "./decode": 55,
            "./encode": 56,
            "./format": 57,
            "./parse": 59
        }],
        59: [function(require, module, exports) {
            'use strict';
            function Url() {
                this.protocol = null;
                this.slashes = null;
                this.auth = null;
                this.port = null;
                this.hostname = null;
                this.hash = null;
                this.search = null;
                this.pathname = null;
            }
            var protocolPattern = /^([a-z0-9.+-]+:)/i
              , portPattern = /:[0-9]*$/
              , simplePathPattern = /^(\/\/?(?!\/)[^\?\s]*)(\?[^\s]*)?$/
              , delims = ['<', '>', '"', '`', ' ', '\r', '\n', '\t']
              , unwise = ['{', '}', '|', '\\', '^', '`'].concat(delims)
              , autoEscape = ['\''].concat(unwise)
              , nonHostChars = ['%', '/', '?', ';', '#'].concat(autoEscape)
              , hostEndingChars = ['/', '?', '#']
              , hostnameMaxLen = 255
              , hostnamePartPattern = /^[+a-z0-9A-Z_-]{0,63}$/
              , hostnamePartStart = /^([+a-z0-9A-Z_-]{0,63})(.*)$/
              , hostlessProtocol = {
                'javascript': true,
                'javascript:': true
            }
              , slashedProtocol = {
                'http': true,
                'https': true,
                'ftp': true,
                'gopher': true,
                'file': true,
                'http:': true,
                'https:': true,
                'ftp:': true,
                'gopher:': true,
                'file:': true
            };
            function urlParse(url, slashesDenoteHost) {
                if (url && url instanceof Url) {
                    return url;
                }
                var u = new Url();
                u.parse(url, slashesDenoteHost);
                return u;
            }
            Url.prototype.parse = function(url, slashesDenoteHost) {
                var i, l, lowerProto, hec, slashes, rest = url;
                rest = rest.trim();
                if (!slashesDenoteHost && url.split('#').length === 1) {
                    var simplePath = simplePathPattern.exec(rest);
                    if (simplePath) {
                        this.pathname = simplePath[1];
                        if (simplePath[2]) {
                            this.search = simplePath[2];
                        }
                        return this;
                    }
                }
                var proto = protocolPattern.exec(rest);
                if (proto) {
                    proto = proto[0];
                    lowerProto = proto.toLowerCase();
                    this.protocol = proto;
                    rest = rest.substr(proto.length);
                }
                if (slashesDenoteHost || proto || rest.match(/^\/\/[^@\/]+@[^@\/]+/)) {
                    slashes = rest.substr(0, 2) === '//';
                    if (slashes && !(proto && hostlessProtocol[proto])) {
                        rest = rest.substr(2);
                        this.slashes = true;
                    }
                }
                if (!hostlessProtocol[proto] && (slashes || (proto && !slashedProtocol[proto]))) {
                    var hostEnd = -1;
                    for (i = 0; i < hostEndingChars.length; i++) {
                        hec = rest.indexOf(hostEndingChars[i]);
                        if (hec !== -1 && (hostEnd === -1 || hec < hostEnd)) {
                            hostEnd = hec;
                        }
                    }
                    var auth, atSign;
                    if (hostEnd === -1) {
                        atSign = rest.lastIndexOf('@');
                    } else {
                        atSign = rest.lastIndexOf('@', hostEnd);
                    }
                    if (atSign !== -1) {
                        auth = rest.slice(0, atSign);
                        rest = rest.slice(atSign + 1);
                        this.auth = auth;
                    }
                    hostEnd = -1;
                    for (i = 0; i < nonHostChars.length; i++) {
                        hec = rest.indexOf(nonHostChars[i]);
                        if (hec !== -1 && (hostEnd === -1 || hec < hostEnd)) {
                            hostEnd = hec;
                        }
                    }
                    if (hostEnd === -1) {
                        hostEnd = rest.length;
                    }
                    if (rest[hostEnd - 1] === ':') {
                        hostEnd--;
                    }
                    var host = rest.slice(0, hostEnd);
                    rest = rest.slice(hostEnd);
                    this.parseHost(host);
                    this.hostname = this.hostname || '';
                    var ipv6Hostname = this.hostname[0] === '[' && this.hostname[this.hostname.length - 1] === ']';
                    if (!ipv6Hostname) {
                        var hostparts = this.hostname.split(/\./);
                        for (i = 0,
                        l = hostparts.length; i < l; i++) {
                            var part = hostparts[i];
                            if (!part) {
                                continue;
                            }
                            if (!part.match(hostnamePartPattern)) {
                                var newpart = '';
                                for (var j = 0, k = part.length; j < k; j++) {
                                    if (part.charCodeAt(j) > 127) {
                                        newpart += 'x';
                                    } else {
                                        newpart += part[j];
                                    }
                                }
                                if (!newpart.match(hostnamePartPattern)) {
                                    var validParts = hostparts.slice(0, i);
                                    var notHost = hostparts.slice(i + 1);
                                    var bit = part.match(hostnamePartStart);
                                    if (bit) {
                                        validParts.push(bit[1]);
                                        notHost.unshift(bit[2]);
                                    }
                                    if (notHost.length) {
                                        rest = notHost.join('.') + rest;
                                    }
                                    this.hostname = validParts.join('.');
                                    break;
                                }
                            }
                        }
                    }
                    if (this.hostname.length > hostnameMaxLen) {
                        this.hostname = '';
                    }
                    if (ipv6Hostname) {
                        this.hostname = this.hostname.substr(1, this.hostname.length - 2);
                    }
                }
                var hash = rest.indexOf('#');
                if (hash !== -1) {
                    this.hash = rest.substr(hash);
                    rest = rest.slice(0, hash);
                }
                var qm = rest.indexOf('?');
                if (qm !== -1) {
                    this.search = rest.substr(qm);
                    rest = rest.slice(0, qm);
                }
                if (rest) {
                    this.pathname = rest;
                }
                if (slashedProtocol[lowerProto] && this.hostname && !this.pathname) {
                    this.pathname = '';
                }
                return this;
            }
            ;
            Url.prototype.parseHost = function(host) {
                var port = portPattern.exec(host);
                if (port) {
                    port = port[0];
                    if (port !== ':') {
                        this.port = port.substr(1);
                    }
                    host = host.substr(0, host.length - port.length);
                }
                if (host) {
                    this.hostname = host;
                }
            }
            ;
            module.exports = urlParse;
        }
        , {}],
        60: [function(require, module, exports) {
            (function(global) {
                /* https://mths.be/punycode v1.4.1 by @mathias */
                ;(function(root) {
                    var freeExports = typeof exports == 'object' && exports && !exports.nodeType && exports;
                    var freeModule = typeof module == 'object' && module && !module.nodeType && module;
                    var freeGlobal = typeof global == 'object' && global;
                    if (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal || freeGlobal.self === freeGlobal) {
                        root = freeGlobal;
                    }
                    var punycode, maxInt = 2147483647, base = 36, tMin = 1, tMax = 26, skew = 38, damp = 700, initialBias = 72, initialN = 128, delimiter = '-', regexPunycode = /^xn--/, regexNonASCII = /[^\x20-\x7E]/, regexSeparators = /[\x2E\u3002\uFF0E\uFF61]/g, errors = {
                        'overflow': 'Overflow: input needs wider integers to process',
                        'not-basic': 'Illegal input >= 0x80 (not a basic code point)',
                        'invalid-input': 'Invalid input'
                    }, baseMinusTMin = base - tMin, floor = Math.floor, stringFromCharCode = String.fromCharCode, key;
                    function error(type) {
                        throw new RangeError(errors[type]);
                    }
                    function map(array, fn) {
                        var length = array.length;
                        var result = [];
                        while (length--) {
                            result[length] = fn(array[length]);
                        }
                        return result;
                    }
                    function mapDomain(string, fn) {
                        var parts = string.split('@');
                        var result = '';
                        if (parts.length > 1) {
                            result = parts[0] + '@';
                            string = parts[1];
                        }
                        string = string.replace(regexSeparators, '\x2E');
                        var labels = string.split('.');
                        var encoded = map(labels, fn).join('.');
                        return result + encoded;
                    }
                    function ucs2decode(string) {
                        var output = [], counter = 0, length = string.length, value, extra;
                        while (counter < length) {
                            value = string.charCodeAt(counter++);
                            if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
                                extra = string.charCodeAt(counter++);
                                if ((extra & 0xFC00) == 0xDC00) {
                                    output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
                                } else {
                                    output.push(value);
                                    counter--;
                                }
                            } else {
                                output.push(value);
                            }
                        }
                        return output;
                    }
                    function ucs2encode(array) {
                        return map(array, function(value) {
                            var output = '';
                            if (value > 0xFFFF) {
                                value -= 0x10000;
                                output += stringFromCharCode(value >>> 10 & 0x3FF | 0xD800);
                                value = 0xDC00 | value & 0x3FF;
                            }
                            output += stringFromCharCode(value);
                            return output;
                        }).join('');
                    }
                    function basicToDigit(codePoint) {
                        if (codePoint - 48 < 10) {
                            return codePoint - 22;
                        }
                        if (codePoint - 65 < 26) {
                            return codePoint - 65;
                        }
                        if (codePoint - 97 < 26) {
                            return codePoint - 97;
                        }
                        return base;
                    }
                    function digitToBasic(digit, flag) {
                        return digit + 22 + 75 * (digit < 26) - ((flag != 0) << 5);
                    }
                    function adapt(delta, numPoints, firstTime) {
                        var k = 0;
                        delta = firstTime ? floor(delta / damp) : delta >> 1;
                        delta += floor(delta / numPoints);
                        for (; delta > baseMinusTMin * tMax >> 1; k += base) {
                            delta = floor(delta / baseMinusTMin);
                        }
                        return floor(k + (baseMinusTMin + 1) * delta / (delta + skew));
                    }
                    function decode(input) {
                        var output = [], inputLength = input.length, out, i = 0, n = initialN, bias = initialBias, basic, j, index, oldi, w, k, digit, t, baseMinusT;
                        basic = input.lastIndexOf(delimiter);
                        if (basic < 0) {
                            basic = 0;
                        }
                        for (j = 0; j < basic; ++j) {
                            if (input.charCodeAt(j) >= 0x80) {
                                error('not-basic');
                            }
                            output.push(input.charCodeAt(j));
                        }
                        for (index = basic > 0 ? basic + 1 : 0; index < inputLength; ) {
                            for (oldi = i,
                            w = 1,
                            k = base; ; k += base) {
                                if (index >= inputLength) {
                                    error('invalid-input');
                                }
                                digit = basicToDigit(input.charCodeAt(index++));
                                if (digit >= base || digit > floor((maxInt - i) / w)) {
                                    error('overflow');
                                }
                                i += digit * w;
                                t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);
                                if (digit < t) {
                                    break;
                                }
                                baseMinusT = base - t;
                                if (w > floor(maxInt / baseMinusT)) {
                                    error('overflow');
                                }
                                w *= baseMinusT;
                            }
                            out = output.length + 1;
                            bias = adapt(i - oldi, out, oldi == 0);
                            if (floor(i / out) > maxInt - n) {
                                error('overflow');
                            }
                            n += floor(i / out);
                            i %= out;
                            output.splice(i++, 0, n);
                        }
                        return ucs2encode(output);
                    }
                    function encode(input) {
                        var n, delta, handledCPCount, basicLength, bias, j, m, q, k, t, currentValue, output = [], inputLength, handledCPCountPlusOne, baseMinusT, qMinusT;
                        input = ucs2decode(input);
                        inputLength = input.length;
                        n = initialN;
                        delta = 0;
                        bias = initialBias;
                        for (j = 0; j < inputLength; ++j) {
                            currentValue = input[j];
                            if (currentValue < 0x80) {
                                output.push(stringFromCharCode(currentValue));
                            }
                        }
                        handledCPCount = basicLength = output.length;
                        if (basicLength) {
                            output.push(delimiter);
                        }
                        while (handledCPCount < inputLength) {
                            for (m = maxInt,
                            j = 0; j < inputLength; ++j) {
                                currentValue = input[j];
                                if (currentValue >= n && currentValue < m) {
                                    m = currentValue;
                                }
                            }
                            handledCPCountPlusOne = handledCPCount + 1;
                            if (m - n > floor((maxInt - delta) / handledCPCountPlusOne)) {
                                error('overflow');
                            }
                            delta += (m - n) * handledCPCountPlusOne;
                            n = m;
                            for (j = 0; j < inputLength; ++j) {
                                currentValue = input[j];
                                if (currentValue < n && ++delta > maxInt) {
                                    error('overflow');
                                }
                                if (currentValue == n) {
                                    for (q = delta,
                                    k = base; ; k += base) {
                                        t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);
                                        if (q < t) {
                                            break;
                                        }
                                        qMinusT = q - t;
                                        baseMinusT = base - t;
                                        output.push(stringFromCharCode(digitToBasic(t + qMinusT % baseMinusT, 0)));
                                        q = floor(qMinusT / baseMinusT);
                                    }
                                    output.push(stringFromCharCode(digitToBasic(q, 0)));
                                    bias = adapt(delta, handledCPCountPlusOne, handledCPCount == basicLength);
                                    delta = 0;
                                    ++handledCPCount;
                                }
                            }
                            ++delta;
                            ++n;
                        }
                        return output.join('');
                    }
                    function toUnicode(input) {
                        return mapDomain(input, function(string) {
                            return regexPunycode.test(string) ? decode(string.slice(4).toLowerCase()) : string;
                        });
                    }
                    function toASCII(input) {
                        return mapDomain(input, function(string) {
                            return regexNonASCII.test(string) ? 'xn--' + encode(string) : string;
                        });
                    }
                    punycode = {
                        'version': '1.4.1',
                        'ucs2': {
                            'decode': ucs2decode,
                            'encode': ucs2encode
                        },
                        'decode': decode,
                        'encode': encode,
                        'toASCII': toASCII,
                        'toUnicode': toUnicode
                    };
                    if (typeof define == 'function' && typeof define.amd == 'object' && define.amd) {
                        define('punycode', function() {
                            return punycode;
                        });
                    } else if (freeExports && freeModule) {
                        if (module.exports == freeExports) {
                            freeModule.exports = punycode;
                        } else {
                            for (key in punycode) {
                                punycode.hasOwnProperty(key) && (freeExports[key] = punycode[key]);
                            }
                        }
                    } else {
                        root.punycode = punycode;
                    }
                }(this));
            }
            ).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
        }
        , {}],
        61: [function(require, module, exports) {
            module.exports = /[\0-\x1F\x7F-\x9F]/
        }
        , {}],
        62: [function(require, module, exports) {
            module.exports = /[\xAD\u0600-\u0605\u061C\u06DD\u070F\u08E2\u180E\u200B-\u200F\u202A-\u202E\u2060-\u2064\u2066-\u206F\uFEFF\uFFF9-\uFFFB]|\uD804[\uDCBD\uDCCD]|\uD82F[\uDCA0-\uDCA3]|\uD834[\uDD73-\uDD7A]|\uDB40[\uDC01\uDC20-\uDC7F]/
        }
        , {}],
        63: [function(require, module, exports) {
            module.exports = /[!-#%-\*,-\/:;\?@\[-\]_\{\}\xA1\xA7\xAB\xB6\xB7\xBB\xBF\u037E\u0387\u055A-\u055F\u0589\u058A\u05BE\u05C0\u05C3\u05C6\u05F3\u05F4\u0609\u060A\u060C\u060D\u061B\u061E\u061F\u066A-\u066D\u06D4\u0700-\u070D\u07F7-\u07F9\u0830-\u083E\u085E\u0964\u0965\u0970\u09FD\u0A76\u0AF0\u0C84\u0DF4\u0E4F\u0E5A\u0E5B\u0F04-\u0F12\u0F14\u0F3A-\u0F3D\u0F85\u0FD0-\u0FD4\u0FD9\u0FDA\u104A-\u104F\u10FB\u1360-\u1368\u1400\u166D\u166E\u169B\u169C\u16EB-\u16ED\u1735\u1736\u17D4-\u17D6\u17D8-\u17DA\u1800-\u180A\u1944\u1945\u1A1E\u1A1F\u1AA0-\u1AA6\u1AA8-\u1AAD\u1B5A-\u1B60\u1BFC-\u1BFF\u1C3B-\u1C3F\u1C7E\u1C7F\u1CC0-\u1CC7\u1CD3\u2010-\u2027\u2030-\u2043\u2045-\u2051\u2053-\u205E\u207D\u207E\u208D\u208E\u2308-\u230B\u2329\u232A\u2768-\u2775\u27C5\u27C6\u27E6-\u27EF\u2983-\u2998\u29D8-\u29DB\u29FC\u29FD\u2CF9-\u2CFC\u2CFE\u2CFF\u2D70\u2E00-\u2E2E\u2E30-\u2E4E\u3001-\u3003\u3008-\u3011\u3014-\u301F\u3030\u303D\u30A0\u30FB\uA4FE\uA4FF\uA60D-\uA60F\uA673\uA67E\uA6F2-\uA6F7\uA874-\uA877\uA8CE\uA8CF\uA8F8-\uA8FA\uA8FC\uA92E\uA92F\uA95F\uA9C1-\uA9CD\uA9DE\uA9DF\uAA5C-\uAA5F\uAADE\uAADF\uAAF0\uAAF1\uABEB\uFD3E\uFD3F\uFE10-\uFE19\uFE30-\uFE52\uFE54-\uFE61\uFE63\uFE68\uFE6A\uFE6B\uFF01-\uFF03\uFF05-\uFF0A\uFF0C-\uFF0F\uFF1A\uFF1B\uFF1F\uFF20\uFF3B-\uFF3D\uFF3F\uFF5B\uFF5D\uFF5F-\uFF65]|\uD800[\uDD00-\uDD02\uDF9F\uDFD0]|\uD801\uDD6F|\uD802[\uDC57\uDD1F\uDD3F\uDE50-\uDE58\uDE7F\uDEF0-\uDEF6\uDF39-\uDF3F\uDF99-\uDF9C]|\uD803[\uDF55-\uDF59]|\uD804[\uDC47-\uDC4D\uDCBB\uDCBC\uDCBE-\uDCC1\uDD40-\uDD43\uDD74\uDD75\uDDC5-\uDDC8\uDDCD\uDDDB\uDDDD-\uDDDF\uDE38-\uDE3D\uDEA9]|\uD805[\uDC4B-\uDC4F\uDC5B\uDC5D\uDCC6\uDDC1-\uDDD7\uDE41-\uDE43\uDE60-\uDE6C\uDF3C-\uDF3E]|\uD806[\uDC3B\uDE3F-\uDE46\uDE9A-\uDE9C\uDE9E-\uDEA2]|\uD807[\uDC41-\uDC45\uDC70\uDC71\uDEF7\uDEF8]|\uD809[\uDC70-\uDC74]|\uD81A[\uDE6E\uDE6F\uDEF5\uDF37-\uDF3B\uDF44]|\uD81B[\uDE97-\uDE9A]|\uD82F\uDC9F|\uD836[\uDE87-\uDE8B]|\uD83A[\uDD5E\uDD5F]/
        }
        , {}],
        64: [function(require, module, exports) {
            module.exports = /[ \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000]/
        }
        , {}],
        65: [function(require, module, exports) {
            'use strict';
            exports.Any = require('./properties/Any/regex');
            exports.Cc = require('./categories/Cc/regex');
            exports.Cf = require('./categories/Cf/regex');
            exports.P = require('./categories/P/regex');
            exports.Z = require('./categories/Z/regex');
        }
        , {
            "./categories/Cc/regex": 61,
            "./categories/Cf/regex": 62,
            "./categories/P/regex": 63,
            "./categories/Z/regex": 64,
            "./properties/Any/regex": 66
        }],
        66: [function(require, module, exports) {
            module.exports = /[\0-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/
        }
        , {}],
        67: [function(require, module, exports) {
            'use strict';
            module.exports = require('./lib/');
        }
        , {
            "./lib/": 9
        }]
    }, {}, [67])(67)
});
;/*
 http://www.jacklmoore.com/autosize
*/
(function(global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() : typeof define === 'function' && define.amd ? define(factory) : (global = global || self,
    global.autosize = factory());
}(this, (function() {
    var assignedElements = new Map();
    function assign(ta) {
        if (!ta || !ta.nodeName || ta.nodeName !== 'TEXTAREA' || assignedElements.has(ta))
            return;
        var previousHeight = null;
        function cacheScrollTops(el) {
            var arr = [];
            while (el && el.parentNode && el.parentNode instanceof Element) {
                if (el.parentNode.scrollTop) {
                    arr.push([el.parentNode, el.parentNode.scrollTop]);
                }
                el = el.parentNode;
            }
            return function() {
                return arr.forEach(function(_ref) {
                    var node = _ref[0]
                      , scrollTop = _ref[1];
                    node.style.scrollBehavior = 'auto';
                    node.scrollTop = scrollTop;
                    node.style.scrollBehavior = null;
                });
            }
            ;
        }
        var computed = window.getComputedStyle(ta);
        function setHeight(_ref2) {
            var _ref2$restoreTextAlig = _ref2.restoreTextAlign
              , restoreTextAlign = _ref2$restoreTextAlig === void 0 ? null : _ref2$restoreTextAlig
              , _ref2$testForHeightRe = _ref2.testForHeightReduction
              , testForHeightReduction = _ref2$testForHeightRe === void 0 ? true : _ref2$testForHeightRe;
            var initialOverflowY = computed.overflowY;
            if (ta.scrollHeight === 0) {
                return;
            }
            if (computed.resize === 'vertical') {
                ta.style.resize = 'none';
            } else if (computed.resize === 'both') {
                ta.style.resize = 'horizontal';
            }
            var restoreScrollTops;
            if (testForHeightReduction) {
                restoreScrollTops = cacheScrollTops(ta);
                ta.style.height = '';
            }
            var newHeight;
            if (computed.boxSizing === 'content-box') {
                newHeight = ta.scrollHeight - (parseFloat(computed.paddingTop) + parseFloat(computed.paddingBottom));
            } else {
                newHeight = ta.scrollHeight + parseFloat(computed.borderTopWidth) + parseFloat(computed.borderBottomWidth);
            }
            if (computed.maxHeight !== 'none' && newHeight > parseFloat(computed.maxHeight)) {
                if (computed.overflowY === 'hidden') {
                    ta.style.overflow = 'scroll';
                }
                newHeight = parseFloat(computed.maxHeight);
            } else if (computed.overflowY !== 'hidden') {
                ta.style.overflow = 'hidden';
            }
            ta.style.height = newHeight + 'px';
            if (restoreTextAlign) {
                ta.style.textAlign = restoreTextAlign;
            }
            if (restoreScrollTops) {
                restoreScrollTops();
            }
            if (previousHeight !== newHeight) {
                ta.dispatchEvent(new Event('autosize:resized',{
                    bubbles: true
                }));
                previousHeight = newHeight;
            }
            if (initialOverflowY !== computed.overflow && !restoreTextAlign) {
                var textAlign = computed.textAlign;
                if (computed.overflow === 'hidden') {
                    ta.style.textAlign = textAlign === 'start' ? 'end' : 'start';
                }
                setHeight({
                    restoreTextAlign: textAlign,
                    testForHeightReduction: true
                });
            }
        }
        function fullSetHeight() {
            setHeight({
                testForHeightReduction: true,
                restoreTextAlign: null
            });
        }
        var handleInput = function() {
            var previousValue = ta.value;
            return function() {
                setHeight({
                    testForHeightReduction: previousValue === '' || !ta.value.startsWith(previousValue),
                    restoreTextAlign: null
                });
                previousValue = ta.value;
            }
            ;
        }();
        var destroy = function(style) {
            ta.removeEventListener('autosize:destroy', destroy);
            ta.removeEventListener('autosize:update', fullSetHeight);
            ta.removeEventListener('input', handleInput);
            window.removeEventListener('resize', fullSetHeight);
            Object.keys(style).forEach(function(key) {
                return ta.style[key] = style[key];
            });
            assignedElements["delete"](ta);
        }
        .bind(ta, {
            height: ta.style.height,
            resize: ta.style.resize,
            textAlign: ta.style.textAlign,
            overflowY: ta.style.overflowY,
            overflowX: ta.style.overflowX,
            wordWrap: ta.style.wordWrap
        });
        ta.addEventListener('autosize:destroy', destroy);
        ta.addEventListener('autosize:update', fullSetHeight);
        ta.addEventListener('input', handleInput);
        window.addEventListener('resize', fullSetHeight);
        ta.style.overflowX = 'hidden';
        ta.style.wordWrap = 'break-word';
        assignedElements.set(ta, {
            destroy: destroy,
            update: fullSetHeight
        });
        fullSetHeight();
    }
    function destroy(ta) {
        var methods = assignedElements.get(ta);
        if (methods) {
            methods.destroy();
        }
    }
    function update(ta) {
        var methods = assignedElements.get(ta);
        if (methods) {
            methods.update();
        }
    }
    var autosize = null;
    if (typeof window === 'undefined') {
        autosize = function autosize(el) {
            return el;
        }
        ;
        autosize.destroy = function(el) {
            return el;
        }
        ;
        autosize.update = function(el) {
            return el;
        }
        ;
    } else {
        autosize = function autosize(el, options) {
            if (el) {
                Array.prototype.forEach.call(el.length ? el : [el], function(x) {
                    return assign(x);
                });
            }
            return el;
        }
        ;
        autosize.destroy = function(el) {
            if (el) {
                Array.prototype.forEach.call(el.length ? el : [el], destroy);
            }
            return el;
        }
        ;
        autosize.update = function(el) {
            if (el) {
                Array.prototype.forEach.call(el.length ? el : [el], update);
            }
            return el;
        }
        ;
    }
    var autosize$1 = autosize;
    return autosize$1;
}
)));
;;(function() {
    "use strict";
    window.LoremIpsum = function() {}
    window.LoremIpsum.prototype = {
        _words: ["a", "ac", "accumsan", "ad", "adipiscing", "aenean", "aenean", "aliquam", "aliquam", "aliquet", "amet", "ante", "aptent", "arcu", "at", "auctor", "augue", "bibendum", "blandit", "class", "commodo", "condimentum", "congue", "consectetur", "consequat", "conubia", "convallis", "cras", "cubilia", "curabitur", "curabitur", "curae", "cursus", "dapibus", "diam", "dictum", "dictumst", "dolor", "donec", "donec", "dui", "duis", "egestas", "eget", "eleifend", "elementum", "elit", "enim", "erat", "eros", "est", "et", "etiam", "etiam", "eu", "euismod", "facilisis", "fames", "faucibus", "felis", "fermentum", "feugiat", "fringilla", "fusce", "gravida", "habitant", "habitasse", "hac", "hendrerit", "himenaeos", "iaculis", "id", "imperdiet", "in", "inceptos", "integer", "interdum", "ipsum", "justo", "lacinia", "lacus", "laoreet", "lectus", "leo", "libero", "ligula", "litora", "lobortis", "lorem", "luctus", "maecenas", "magna", "malesuada", "massa", "mattis", "mauris", "metus", "mi", "molestie", "mollis", "morbi", "nam", "nec", "neque", "netus", "nibh", "nisi", "nisl", "non", "nostra", "nulla", "nullam", "nunc", "odio", "orci", "ornare", "pellentesque", "per", "pharetra", "phasellus", "placerat", "platea", "porta", "porttitor", "posuere", "potenti", "praesent", "pretium", "primis", "proin", "pulvinar", "purus", "quam", "quis", "quisque", "quisque", "rhoncus", "risus", "rutrum", "sagittis", "sapien", "scelerisque", "sed", "sem", "semper", "senectus", "sit", "sociosqu", "sodales", "sollicitudin", "suscipit", "suspendisse", "taciti", "tellus", "tempor", "tempus", "tincidunt", "torquent", "tortor", "tristique", "turpis", "ullamcorper", "ultrices", "ultricies", "urna", "ut", "ut", "varius", "vehicula", "vel", "velit", "venenatis", "vestibulum", "vitae", "vivamus", "viverra", "volutpat", "vulputate"],
        _random: function(x, y) {
            var rnd = (Math.random() * 2 - 1) + (Math.random() * 2 - 1) + (Math.random() * 2 - 1);
            return Math.round(Math.abs(rnd) * x + y);
        },
        _count: function(min, max) {
            var result;
            if (min && max)
                result = Math.floor(Math.random() * (max - min + 1) + min);
            else if (min)
                result = min;
            else if (max)
                result = max;
            else
                result = this._random(8, 2);
            return result;
        },
        words: function(min, max) {
            var result = [];
            var count = this._count(min, max);
            while (result.length < count) {
                var pos = Math.floor(Math.random() * this._words.length);
                var rnd = this._words[pos];
                if (result.length && result[result.length - 1] === rnd) {
                    continue;
                }
                result.push(rnd);
            }
            return result;
        },
        sentence: function(min, max) {
            var words = this.words(min, max);
            var index = this._random(6, 2);
            while (index < words.length - 2) {
                words[index] += ",";
                index += this._random(6, 2);
            }
            var punct = "...!?"
            words[words.length - 1] += punct.charAt(Math.floor(Math.random() * punct.length));
            words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
            return words.join(" ");
        },
        paragraph: function(min, max) {
            if (!min && !max) {
                min = 20;
                max = 60;
            }
            var result = "";
            var count = this._count(min, max);
            while (result.slice(0, -1).split(" ").length < count) {
                result += this.sentence() + " ";
            }
            result = result.slice(0, -1)
            if (result.split(" ").length > count) {
                var punct = result.slice(-1);
                result = result.split(" ").slice(0, count).join(" ");
                result = result.replace(/,$/, "");
                result += punct;
            }
            return result;
        }
    }
}
)();
;!function() {
    function t(e, i, s) {
        function o(h, r) {
            if (!i[h]) {
                if (!e[h]) {
                    var a = "function" == typeof require && require;
                    if (!r && a)
                        return a(h, !0);
                    if (n)
                        return n(h, !0);
                    var _ = new Error("Cannot find module '" + h + "'");
                    throw _.code = "MODULE_NOT_FOUND",
                    _
                }
                var f = i[h] = {
                    exports: {}
                };
                e[h][0].call(f.exports, function(t) {
                    var i = e[h][1][t];
                    return o(i || t)
                }, f, f.exports, t, e, i, s)
            }
            return i[h].exports
        }
        for (var n = "function" == typeof require && require, h = 0; h < s.length; h++)
            o(s[h]);
        return o
    }
    return t
}()({
    1: [function(t, e, i) {
        t("./src/Plugin")
    }
    , {
        "./src/Plugin": 8
    }],
    2: [function(t, e, i) {
        (function(t) {
            !function(s, o) {
                "use strict";
                "function" == typeof define && define.amd ? define(["jquery"], o) : "object" == typeof i ? e.exports = o("undefined" != typeof window ? window.jQuery : "undefined" != typeof t ? t.jQuery : null) : o(s.jQuery)
            }(this, function(t) {
                "use strict";
                var e = function() {
                    return this._Construct()
                };
                return e.prototype = {
                    _Construct: function() {
                        return this._commandList = [],
                        this._isReady = !1,
                        this._timer = setInterval(this._check.bind(this), 10),
                        this
                    },
                    add: function(t, e, i) {
                        this._commandList.push({
                            cmd: t,
                            el: e,
                            cmdArgs: i
                        })
                    },
                    isReady: function() {
                        return this._isReady
                    },
                    _check: function() {
                        t._protipClassInstance && (this._isReady = !0) && (!this._commandList.length || this._run()) && clearInterval(this._timer)
                    },
                    _run: function() {
                        var t = this._commandList.shift();
                        return t.el[t.cmd].apply(t.el, t.cmdArgs),
                        this._commandList.length && this._run(),
                        !0
                    }
                },
                e
            })
        }
        ).call(this, "undefined" != typeof global ? global : "undefined" != typeof self ? self : "undefined" != typeof window ? window : {})
    }
    , {}],
    3: [function(t, e, i) {
        (function(s) {
            !function(o, n) {
                "use strict";
                "function" == typeof define && define.amd ? define(["jquery", "./Constants", "./Item"], n) : "object" == typeof i ? e.exports = n("undefined" != typeof window ? window.jQuery : "undefined" != typeof s ? s.jQuery : null, t("./Constants"), t("./Item")) : o.ProtipClass = n(o.jQuery, o.ProtipConstants, o.ProtipItemClass)
            }(this, function(t, e, i) {
                "use strict";
                try {
                    window.MutationObserver._period = 100
                } catch (s) {
                    console.warn("Protip: MutationObserver polyfill haven't been loaded!"),
                    window.MutationObserver = window.MutationObserver || function() {
                        this.disconnect = this.observe = function() {}
                    }
                }
                var o = function(t) {
                    return this._Construct(t)
                };
                return t.extend(!0, o.prototype, {
                    _defaults: {
                        selector: e.DEFAULT_SELECTOR,
                        namespace: e.DEFAULT_NAMESPACE,
                        protipTemplate: e.TEMPLATE_PROTIP,
                        arrowTemplate: e.TEMPLATE_ARROW,
                        iconTemplate: e.TEMPLATE_ICON,
                        observer: !0,
                        offset: 0,
                        forceMinWidth: !0,
                        delayResize: 100,
                        defaults: {
                            trigger: e.TRIGGER_HOVER,
                            title: null,
                            inited: !1,
                            delayIn: 0,
                            delayOut: 0,
                            interactive: !1,
                            gravity: !0,
                            offsetTop: 0,
                            offsetLeft: 0,
                            position: e.POSITION_RIGHT,
                            placement: e.PLACEMENT_OUTSIDE,
                            classes: null,
                            arrow: !0,
                            width: 300,
                            identifier: !1,
                            icon: !1,
                            observer: !1,
                            target: e.SELECTOR_BODY,
                            skin: e.SKIN_DEFAULT,
                            size: e.SIZE_DEFAULT,
                            scheme: e.SCHEME_DEFAULT,
                            animate: !1,
                            autoHide: !1,
                            autoShow: !1,
                            mixin: null
                        }
                    },
                    _Construct: function(e) {
                        return this.settings = t.extend(!0, {}, this._defaults, e),
                        this._itemInstances = {},
                        this._observerInstance = void 0,
                        this._visibleBeforeResize = [],
                        this._task = {
                            delayIn: void 0,
                            delayOut: void 0,
                            resize: void 0
                        },
                        this._fetchElements(),
                        this._bind(),
                        this
                    },
                    destroy: function() {
                        this._unbind(),
                        t.each(this._itemInstances, t.proxy(function(t) {
                            this.destroyItemInstance(t)
                        }, this)),
                        this._itemInstances = void 0,
                        this.settings = void 0,
                        t._protipClassInstance = void 0
                    },
                    namespaced: function(t) {
                        return this.settings.namespace + t.charAt(0).toUpperCase() + t.slice(1)
                    },
                    destroyItemInstance: function(t) {
                        this._itemInstances[t].destroy()
                    },
                    onItemDestroyed: function(t) {
                        delete this._itemInstances[t]
                    },
                    createItemInstance: function(t, s) {
                        var o = this._generateId();
                        return this._itemInstances[o] = new i(o,t,this,s),
                        t.data(this.namespaced(e.PROP_IDENTIFIER), o),
                        this._itemInstances[o]
                    },
                    reloadItemInstance: function(t) {
                        var i = t.data(this.namespaced(e.PROP_IDENTIFIER));
                        this.destroyItemInstance(i),
                        this.createItemInstance(t)
                    },
                    getItemInstance: function(t, i) {
                        var s = t.data(this.namespaced(e.PROP_IDENTIFIER));
                        return this._isInited(t) ? this._itemInstances[s] : this.createItemInstance(t, i)
                    },
                    _fetchElements: function() {
                        setTimeout(function() {
                            t(this.settings.selector).each(t.proxy(function(e, i) {
                                this.getItemInstance(t(i))
                            }, this))
                        }
                        .bind(this))
                    },
                    _generateId: function() {
                        return (new Date).valueOf() + Math.floor(1e4 * Math.random()).toString()
                    },
                    _isInited: function(t) {
                        return !!t.data(this.namespaced(e.PROP_INITED))
                    },
                    _hideAll: function(e, i) {
                        t.each(this._itemInstances, t.proxy(function(t, s) {
                            s.isVisible() && this._visibleBeforeResize.push(s) && s.hide(e, i)
                        }, this))
                    },
                    _showAll: function(t, e) {
                        this._visibleBeforeResize.forEach(function(i) {
                            i.show(t, e)
                        })
                    },
                    _onAction: function(i) {
                        var s = t(i.currentTarget)
                          , o = this.getItemInstance(s);
                        i.type === e.EVENT_CLICK && o.data.trigger === e.TRIGGER_CLICK && i.preventDefault(),
                        o.actionHandler(i.type)
                    },
                    _onResize: function() {
                        !this._task.resize && this._hideAll(!0, !0),
                        this._task.resize && clearTimeout(this._task.resize),
                        this._task.resize = setTimeout(function() {
                            this._showAll(!0, !0),
                            this._task.resize = void 0,
                            this._visibleBeforeResize = []
                        }
                        .bind(this), this.settings.delayResize)
                    },
                    _onBodyClick: function(i) {
                        var s = t(i.target)
                          , o = s.closest("." + e.SELECTOR_PREFIX + e.SELECTOR_CONTAINER) || !1
                          , n = s.closest(e.DEFAULT_SELECTOR)
                          , h = (this._isInited(n) ? this.getItemInstance(n) : !1,
                        this._isInited(o) ? this.getItemInstance(o) : !1);
                        (!h || h && h.data.trigger !== e.TRIGGER_CLICK) && t.each(this._itemInstances, function(t, i) {
                            i.isVisible() && i.data.trigger === e.TRIGGER_CLICK && (!o || i.el.protip.get(0) !== o.get(0)) && (!n || i.el.source.get(0) !== n.get(0)) && i.hide()
                        })
                    },
                    _onCloseClick: function(i) {
                        var s = t(i.currentTarget).parents("." + e.SELECTOR_PREFIX + e.SELECTOR_CONTAINER).data(this.namespaced(e.PROP_IDENTIFIER));
                        this._itemInstances[s] && this._itemInstances[s].hide()
                    },
                    _mutationObserverCallback: function(i) {
                        i.forEach(function(i) {
                            for (var s, o = 0; o < i.addedNodes.length; o++)
                                if (s = t(i.addedNodes[o]),
                                !s.hasClass(e.SELECTOR_PREFIX + e.SELECTOR_CONTAINER)) {
                                    var n = s.parent().find(this.settings.selector);
                                    n.each(function(i, s) {
                                        if (s = t(s),
                                        !this._isInited(s)) {
                                            var o = this.getItemInstance(s);
                                            o.data.trigger === e.TRIGGER_STICKY && this.getItemInstance(s).show()
                                        }
                                    }
                                    .bind(this))
                                }
                            for (var o = 0; o < i.removedNodes.length; o++) {
                                var h = t(i.removedNodes[o]);
                                h.find(this.settings.selector).each(function(e, i) {
                                    this.getItemInstance(t(i)).destroy()
                                }
                                .bind(this)),
                                h.hasClass(this.settings.selector.replace(".", "")) && this.getItemInstance(h).destroy()
                            }
                        }
                        .bind(this))
                    },
                    _bind: function() {
                        var i = t(e.SELECTOR_BODY);
                        i.on(e.EVENT_CLICK, t.proxy(this._onBodyClick, this)).on(e.EVENT_MOUSEOVER, this.settings.selector, t.proxy(this._onAction, this)).on(e.EVENT_MOUSEOUT, this.settings.selector, t.proxy(this._onAction, this)).on(e.EVENT_CLICK, this.settings.selector, t.proxy(this._onAction, this)).on(e.EVENT_CLICK, e.SELECTOR_CLOSE, t.proxy(this._onCloseClick, this)),
                        t(window).on(e.EVENT_RESIZE, t.proxy(this._onResize, this)),
                        this.settings.observer && (this._observerInstance = new MutationObserver(this._mutationObserverCallback.bind(this)),
                        this._observerInstance.observe(i.get(0), {
                            attributes: !1,
                            childList: !0,
                            characterData: !1,
                            subtree: !0
                        }))
                    },
                    _unbind: function() {
                        t(e.SELECTOR_BODY).off(e.EVENT_CLICK, t.proxy(this._onBodyClick, this)).off(e.EVENT_MOUSEOVER, this.settings.selector, t.proxy(this._onAction, this)).off(e.EVENT_MOUSEOUT, this.settings.selector, t.proxy(this._onAction, this)).off(e.EVENT_CLICK, this.settings.selector, t.proxy(this._onAction, this)).off(e.EVENT_CLICK, e.SELECTOR_CLOSE, t.proxy(this._onCloseClick, this)),
                        t(window).off(e.EVENT_RESIZE, t.proxy(this._onResize, this)),
                        this.settings.observer && this._observerInstance.disconnect()
                    }
                }),
                o
            })
        }
        ).call(this, "undefined" != typeof global ? global : "undefined" != typeof self ? self : "undefined" != typeof window ? window : {})
    }
    , {
        "./Constants": 4,
        "./Item": 7
    }],
    4: [function(t, e, i) {
        !function(t, s) {
            "function" == typeof define && define.amd ? define([], s) : "object" == typeof i ? e.exports = s() : t.ProtipConstants = s()
        }(this, function() {
            "use strict";
            var t = {
                PLACEMENT_CENTER: "center",
                PLACEMENT_INSIDE: "inside",
                PLACEMENT_OUTSIDE: "outside",
                PLACEMENT_BORDER: "border",
                POSITION_TOP_LEFT: "top-left",
                POSITION_TOP: "top",
                POSITION_TOP_RIGHT: "top-right",
                POSITION_RIGHT_TOP: "right-top",
                POSITION_RIGHT: "right",
                POSITION_RIGHT_BOTTOM: "right-bottom",
                POSITION_BOTTOM_LEFT: "bottom-left",
                POSITION_BOTTOM: "bottom",
                POSITION_BOTTOM_RIGHT: "bottom-right",
                POSITION_LEFT_TOP: "left-top",
                POSITION_LEFT: "left",
                POSITION_LEFT_BOTTOM: "left-bottom",
                POSITION_CORNER_LEFT_TOP: "top-left-corner",
                POSITION_CORNER_RIGHT_TOP: "top-right-corner",
                POSITION_CORNER_LEFT_BOTTOM: "bottom-left-corner",
                POSITION_CORNER_RIGHT_BOTTOM: "bottom-right-corner",
                TRIGGER_CLICK: "click",
                TRIGGER_CLICK2: "click2",
                TRIGGER_HOVER: "hover",
                TRIGGER_STICKY: "sticky",
                PROP_TRIGGER: "trigger",
                PROP_TITLE: "title",
                PROP_STICKY: "sticky",
                PROP_INITED: "inited",
                PROP_DELAY_IN: "delayIn",
                PROP_DELAY_OUT: "delayOut",
                PROP_GRAVITY: "gravity",
                PROP_OFFSET: "offset",
                PROP_OFFSET_TOP: "offsetTop",
                PROP_OFFSET_LEFT: "offsetLeft",
                PROP_POSITION: "position",
                PROP_CLASS: "class",
                PROP_ARROW: "arrow",
                PROP_WIDTH: "width",
                PROP_IDENTIFIER: "identifier",
                PROP_ICON: "icon",
                PROP_AUTOSHOW: "autoShow",
                PROP_TARGET: "target",
                EVENT_MOUSEOVER: "mouseover",
                EVENT_MOUSEOUT: "mouseout",
                EVENT_MOUSEENTER: "mouseenter",
                EVENT_MOUSELEAVE: "mouseleave",
                EVENT_CLICK: "click",
                EVENT_RESIZE: "resize",
                EVENT_PROTIP_SHOW: "protipshow",
                EVENT_PROTIP_HIDE: "protiphide",
                EVENT_PROTIP_READY: "protipready",
                DEFAULT_SELECTOR: ".protip",
                DEFAULT_NAMESPACE: "pt",
                DEFAULT_DELAY_OUT: 100,
                SELECTOR_PREFIX: "protip-",
                SELECTOR_BODY: "body",
                SELECTOR_ARROW: "arrow",
                SELECTOR_CONTAINER: "container",
                SELECTOR_SHOW: "protip-show",
                SELECTOR_CLOSE: ".protip-close",
                SELECTOR_SKIN_PREFIX: "protip-skin-",
                SELECTOR_SIZE_PREFIX: "--size-",
                SELECTOR_SCHEME_PREFIX: "--scheme-",
                SELECTOR_ANIMATE: "animated",
                SELECTOR_TARGET: ".protip-target",
                SELECTOR_MIXIN_PREFIX: "protip-mixin--",
                SELECTOR_OPEN: "protip-open",
                TEMPLATE_PROTIP: '<div class="{classes}" data-pt-identifier="{identifier}" style="{widthType}:{width}px">{arrow}{icon}<div class="protip-content">{content}</div></div>',
                TEMPLATE_ICON: '<i class="icon-{icon}"></i>',
                ATTR_WIDTH: "width",
                ATTR_MAX_WIDTH: "max-width",
                SKIN_DEFAULT: "default",
                SIZE_DEFAULT: "normal",
                SCHEME_DEFAULT: "pro",
                PSEUDO_NEXT: "next",
                PSEUDO_PREV: "prev",
                PSEUDO_THIS: "this"
            };
            return t.TEMPLATE_ARROW = '<span class="' + t.SELECTOR_PREFIX + t.SELECTOR_ARROW + '"></span>',
            t
        })
    }
    , {}],
    5: [function(t, e, i) {
        (function(s) {
            !function(o, n) {
                "use strict";
                "function" == typeof define && define.amd ? define(["jquery", "./Constants"], n) : "object" == typeof i ? e.exports = n("undefined" != typeof window ? window.jQuery : "undefined" != typeof s ? s.jQuery : null, t("./Constants")) : o.ProtipGravityParser = n(o.jQuery, o.ProtipConstants)
            }(this, function(t, e) {
                "use strict";
                var i = function(t, e) {
                    return this._Construct(t, e)
                };
                return t.extend(!0, i.prototype, {
                    _Construct: function(t, i) {
                        return this._positionsList = [{
                            lvl: 1,
                            key: i,
                            top: 0,
                            left: 0
                        }, {
                            lvl: 3,
                            key: e.POSITION_CORNER_LEFT_TOP,
                            top: 0,
                            left: 0
                        }, {
                            lvl: 2,
                            key: e.POSITION_TOP_LEFT,
                            top: 0,
                            left: 0
                        }, {
                            lvl: 1,
                            key: e.POSITION_TOP,
                            top: 0,
                            left: 0
                        }, {
                            lvl: 2,
                            key: e.POSITION_TOP_RIGHT,
                            top: 0,
                            left: 0
                        }, {
                            lvl: 3,
                            key: e.POSITION_CORNER_RIGHT_TOP,
                            top: 0,
                            left: 0
                        }, {
                            lvl: 2,
                            key: e.POSITION_RIGHT_TOP,
                            top: 0,
                            left: 0
                        }, {
                            lvl: 1,
                            key: e.POSITION_RIGHT,
                            top: 0,
                            left: 0
                        }, {
                            lvl: 2,
                            key: e.POSITION_RIGHT_BOTTOM,
                            top: 0,
                            left: 0
                        }, {
                            lvl: 2,
                            key: e.POSITION_BOTTOM_LEFT,
                            top: 0,
                            left: 0
                        }, {
                            lvl: 1,
                            key: e.POSITION_BOTTOM,
                            top: 0,
                            left: 0
                        }, {
                            lvl: 2,
                            key: e.POSITION_BOTTOM_RIGHT,
                            top: 0,
                            left: 0
                        }, {
                            lvl: 3,
                            key: e.POSITION_CORNER_RIGHT_BOTTOM,
                            top: 0,
                            left: 0
                        }, {
                            lvl: 2,
                            key: e.POSITION_LEFT_TOP,
                            top: 0,
                            left: 0
                        }, {
                            lvl: 1,
                            key: e.POSITION_LEFT,
                            top: 0,
                            left: 0
                        }, {
                            lvl: 2,
                            key: e.POSITION_LEFT_BOTTOM,
                            top: 0,
                            left: 0
                        }, {
                            lvl: 3,
                            key: e.POSITION_CORNER_LEFT_BOTTOM,
                            top: 0,
                            left: 0
                        }],
                        this._input = t,
                        this._finals = [],
                        this._parse(),
                        this._finals
                    },
                    _parse: function() {
                        if (this._input === !0 || 3 === this._input)
                            this._finals = this._positionsList;
                        else if (isNaN(this._input)) {
                            var t = []
                              , e = !1;
                            this._finals = this._input.split(";").map(function(i) {
                                if (i = i.trim(),
                                "..." === i)
                                    e = !0;
                                else if (i) {
                                    var s = i.split(" ").map(function(t) {
                                        return t.trim()
                                    });
                                    return t.push(s[0]),
                                    {
                                        lvl: 1,
                                        key: s[0],
                                        left: parseInt(s[1], 10) || 0,
                                        top: parseInt(s[2], 10) || 0
                                    }
                                }
                            }).filter(function(t) {
                                return !!t
                            }),
                            e && this._positionsList.forEach(function(e) {
                                -1 === t.indexOf(e.key) && this._finals.push(e)
                            }
                            .bind(this))
                        } else
                            this._finals = this._positionsList.filter(function(t) {
                                return t.lvl <= this._input
                            }
                            .bind(this))
                    }
                }),
                i
            })
        }
        ).call(this, "undefined" != typeof global ? global : "undefined" != typeof self ? self : "undefined" != typeof window ? window : {})
    }
    , {
        "./Constants": 4
    }],
    6: [function(t, e, i) {
        (function(s) {
            !function(o, n) {
                "use strict";
                "function" == typeof define && define.amd ? define(["jquery", "./Constants", "./GravityParser", "./PositionCalculator"], n) : "object" == typeof i ? e.exports = n("undefined" != typeof window ? window.jQuery : "undefined" != typeof s ? s.jQuery : null, t("./Constants"), t("./GravityParser"), t("./PositionCalculator")) : o.ProtipGravityTester = n(o.jQuery, o.ProtipConstants, o.ProtipGravityParser, o.ProtipPositionCalculator)
            }(this, function(t, e, i, s) {
                "use strict";
                var o = function(t) {
                    return this._Construct(t)
                };
                return t.extend(!0, o.prototype, {
                    _Construct: function(t) {
                        this._item = t,
                        this._result = void 0,
                        this._setWindowDimensions(),
                        this._positionList = new i(this._item.data.gravity,this._item.data.position);
                        var e;
                        for (e = 0; e < this._positionList.length && !this._test(this._positionList[e]); e++)
                            ;
                        return this._item.data.position = this._positionList[0].key,
                        this._result || new s(this._item)
                    },
                    _test: function(t) {
                        this._setProtipMinWidth();
                        var e = new s(this._item,t.key,t);
                        return this._item.el.protip.css(e),
                        this._setProtipDimensions(),
                        this._topOk() && this._rightOk() && this._bottomOk() && this._leftOk() ? (e.position = t.key,
                        this._result = e,
                        !0) : !1
                    },
                    _topOk: function() {
                        return this._dimensions.offset.top - this._windowDimensions.scrollTop > 0
                    },
                    _rightOk: function() {
                        return this._dimensions.offset.left + this._dimensions.width < this._windowDimensions.width
                    },
                    _bottomOk: function() {
                        return this._dimensions.offset.top - this._windowDimensions.scrollTop + this._dimensions.height < this._windowDimensions.height
                    },
                    _leftOk: function() {
                        return this._dimensions.offset.left > 0
                    },
                    _setProtipMinWidth: function() {
                        if (this._item.classInstance.settings.forceMinWidth) {
                            this._item.el.protip.css({
                                position: "fixed",
                                left: 0,
                                top: 0,
                                minWidth: 0
                            });
                            var t = this._item.el.protip.outerWidth() + 1;
                            this._item.el.protip.css({
                                position: "",
                                left: "",
                                top: "",
                                minWidth: t + "px"
                            })
                        }
                    },
                    _setProtipDimensions: function() {
                        this._dimensions = {
                            width: this._item.el.protip.outerWidth() || 0,
                            height: this._item.el.protip.outerHeight() || 0,
                            offset: this._item.el.protip.offset()
                        }
                    },
                    _setWindowDimensions: function() {
                        var t = window
                          , e = document
                          , i = e.documentElement
                          , s = e.getElementsByTagName("body")[0]
                          , o = t.innerWidth || i.clientWidth || s.clientWidth
                          , n = t.innerHeight || i.clientHeight || s.clientHeight;
                        this._windowDimensions = {
                            width: parseInt(o),
                            height: parseInt(n),
                            scrollTop: window.pageYOffset || document.documentElement.scrollTop || document.getElementsByTagName("body")[0].scrollTop || 0
                        }
                    }
                }),
                o
            })
        }
        ).call(this, "undefined" != typeof global ? global : "undefined" != typeof self ? self : "undefined" != typeof window ? window : {})
    }
    , {
        "./Constants": 4,
        "./GravityParser": 5,
        "./PositionCalculator": 9
    }],
    7: [function(t, e, i) {
        (function(s) {
            !function(o, n) {
                "use strict";
                "function" == typeof define && define.amd ? define(["jquery", "./Constants", "./GravityTester", "./PositionCalculator"], n) : "object" == typeof i ? e.exports = n("undefined" != typeof window ? window.jQuery : "undefined" != typeof s ? s.jQuery : null, t("./Constants"), t("./GravityTester"), t("./PositionCalculator")) : o.ProtipItemClass = n(o.jQuery, o.ProtipConstants, o.ProtipGravityTester, o.ProtipPositionCalculator)
            }(this, function(t, e, i, s) {
                "use strict";
                function o(t, e) {
                    return t.replace(/\{([\w\.]*)}/g, function(t, i) {
                        for (var s = i.split("."), o = e[s.shift()], n = 0, h = s.length; h > n; n++)
                            o = o[s[n]];
                        return "undefined" != typeof o && null !== o ? o : ""
                    })
                }
                var n = function(t, e, i, s) {
                    return this._Construct(t, e, i, s)
                };
                return t.extend(!0, n.prototype, {
                    _Construct: function(t, i, s, o) {
                        return this._override = o || {},
                        this._override.identifier = t,
                        this.el = {},
                        this.el.source = i,
                        this.data = {},
                        this.classInstance = s,
                        this._isVisible = !1,
                        this._task = {
                            delayIn: void 0,
                            delayOut: void 0
                        },
                        this._fetchData(),
                        this._prepareInternals(),
                        this._appendProtip(),
                        this._initSticky(),
                        this._initAutoShow(),
                        this._bind(),
                        this.el.source.addClass(this.classInstance.settings.selector.replace(".", "")).data(this._namespaced(e.PROP_INITED), !0),
                        setTimeout(function() {
                            this.el.source.trigger(e.EVENT_PROTIP_READY, this)
                        }
                        .bind(this), 10),
                        this
                    },
                    actionHandler: function(t) {
                        if (this.data.trigger === e.TRIGGER_STICKY)
                            ;
                        else if (t !== e.EVENT_CLICK || this.data.trigger !== e.TRIGGER_CLICK && this.data.trigger !== e.TRIGGER_CLICK2) {
                            if (this.data.trigger !== e.TRIGGER_CLICK && this.data.trigger !== e.TRIGGER_CLICK2)
                                switch (t) {
                                case e.EVENT_MOUSEOUT:
                                    this.hide();
                                    break;
                                case e.EVENT_MOUSEOVER:
                                    this.show()
                                }
                        } else
                            this.toggle()
                    },
                    destroy: function() {
                        this.hide(!0),
                        this._unbind(),
                        this.el.protip.remove(),
                        this.el.source.data(this._namespaced(e.PROP_INITED), !1).data(this._namespaced(e.PROP_IDENTIFIER), !1).removeData(),
                        this.classInstance.onItemDestroyed(this.data.identifier),
                        t.each(this._task, function(t, e) {
                            clearTimeout(e)
                        })
                    },
                    isVisible: function() {
                        return this._isVisible
                    },
                    toggle: function() {
                        this._isVisible ? this.hide() : this.show()
                    },
                    show: function(t, o) {
                        if (this.data.title) {
                            if (this._task.delayOut && clearTimeout(this._task.delayOut),
                            this._task.delayIn && clearTimeout(this._task.delayIn),
                            this._task.autoHide && clearTimeout(this._task.autoHide),
                            !t && this.data.delayIn)
                                return void (this._task.delayIn = setTimeout(function() {
                                    this.show(!0)
                                }
                                .bind(this), this.data.delayIn));
                            this.data.autoHide !== !1 && (this._task.autoHide = setTimeout(function() {
                                this.hide(!0)
                            }
                            .bind(this), this.data.autoHide));
                            var n;
                            this.data.gravity ? (n = new i(this),
                            delete n.position) : n = new s(this),
                            this.el.source.addClass(e.SELECTOR_OPEN),
                            !o && this.el.source.trigger(e.EVENT_PROTIP_SHOW, this),
                            this.el.protip.css(n).addClass(e.SELECTOR_SHOW),
                            this.data.animate && this.el.protip.addClass(e.SELECTOR_ANIMATE).addClass(this.data.animate || this.classInstance.settings.animate),
                            this._isVisible = !0
                        }
                    },
                    applyPosition: function(t) {
                        this.el.protip.attr("data-" + e.DEFAULT_NAMESPACE + "-" + e.PROP_POSITION, t)
                    },
                    hide: function(t, i) {
                        return this._task.delayOut && clearTimeout(this._task.delayOut),
                        this._task.delayIn && clearTimeout(this._task.delayIn),
                        this._task.autoHide && clearTimeout(this._task.autoHide),
                        !t && this.data.delayOut ? void (this._task.delayOut = setTimeout(function() {
                            this.hide(!0)
                        }
                        .bind(this), this.data.delayOut)) : (this.el.source.removeClass(e.SELECTOR_OPEN),
                        !i && this.el.source.trigger(e.EVENT_PROTIP_HIDE, this),
                        this.el.protip.removeClass(e.SELECTOR_SHOW).removeClass(e.SELECTOR_ANIMATE).removeClass(this.data.animate),
                        void (this._isVisible = !1))
                    },
                    getArrowOffset: function() {
                        return {
                            width: this.el.protipArrow.outerWidth() || 0,
                            height: this.el.protipArrow.outerHeight() || 0
                        }
                    },
                    _fetchData: function() {
                        t.each(this.classInstance.settings.defaults, t.proxy(function(t) {
                            this.data[t] = this.el.source.data(this._namespaced(t))
                        }, this)),
                        this.data = t.extend({}, this.classInstance.settings.defaults, this.data),
                        this.data = t.extend({}, this.data, this._override),
                        t.each(this.data, t.proxy(function(t, e) {
                            this.el.source.data(this._namespaced(t), e)
                        }, this))
                    },
                    _prepareInternals: function() {
                        this._setTarget(),
                        this._detectTitle(),
                        this._checkInteractive()
                    },
                    _checkInteractive: function() {
                        this.data.interactive && (this.data.delayOut = this.data.delayOut || e.DEFAULT_DELAY_OUT)
                    },
                    _initSticky: function() {
                        this.data.trigger === e.TRIGGER_STICKY && this.show()
                    },
                    _initAutoShow: function() {
                        this.data.autoShow && this.show()
                    },
                    _appendProtip: function() {
                        this.el.protip = o(this.classInstance.settings.protipTemplate, {
                            classes: this._getClassList(),
                            widthType: this._getWidthType(),
                            width: this._getWidth(),
                            content: this.data.title,
                            icon: this._getIconTemplate(),
                            arrow: this.data.arrow ? e.TEMPLATE_ARROW : "",
                            identifier: this.data.identifier
                        }),
                        this.el.protip = t(this.el.protip),
                        this.el.protipArrow = this.el.protip.find("." + e.SELECTOR_PREFIX + e.SELECTOR_ARROW),
                        this.el.target.append(this.el.protip)
                    },
                    _getClassList: function() {
                        var t = []
                          , i = this.data.skin
                          , s = this.data.size
                          , o = this.data.scheme;
                        return t.push(e.SELECTOR_PREFIX + e.SELECTOR_CONTAINER),
                        t.push(e.SELECTOR_SKIN_PREFIX + i),
                        t.push(e.SELECTOR_SKIN_PREFIX + i + e.SELECTOR_SIZE_PREFIX + s),
                        t.push(e.SELECTOR_SKIN_PREFIX + i + e.SELECTOR_SCHEME_PREFIX + o),
                        this.data.classes && t.push(this.data.classes),
                        this.data.mixin && t.push(this._parseMixins()),
                        t.join(" ")
                    },
                    _parseMixins: function() {
                        var t = [];
                        return this.data.mixin && this.data.mixin.split(" ").forEach(function(i) {
                            i && t.push(e.SELECTOR_MIXIN_PREFIX + i)
                        }, this),
                        t.join(" ")
                    },
                    _getWidthType: function() {
                        return isNaN(this.data.width) ? e.ATTR_WIDTH : e.ATTR_MAX_WIDTH
                    },
                    _getWidth: function() {
                        return parseInt(this.data.width, 10)
                    },
                    _getIconTemplate: function() {
                        return this.data.icon ? o(this.classInstance.settings.iconTemplate, {
                            icon: this.data.icon
                        }) : ""
                    },
                    _detectTitle: function() {
                        if (!this.data.title || "#" !== this.data.title.charAt(0) && "." !== this.data.title.charAt(0)) {
                            if (this.data.title && ":" === this.data.title.charAt(0)) {
                                var i = this.data.title.substring(1);
                                switch (i) {
                                case e.PSEUDO_NEXT:
                                    this.data.title = this.el.source.next().html();
                                    break;
                                case e.PSEUDO_PREV:
                                    this.data.title = this.el.source.prev().html();
                                    break;
                                case e.PSEUDO_THIS:
                                    this.data.title = this.el.source.html()
                                }
                            }
                        } else
                            this.data.titleSource = this.data.titleSource || this.data.title,
                            this.data.title = t(this.data.title).html();
                        this.data.title && this.data.title.indexOf("<a ") + 1 && (this.data.interactive = !0)
                    },
                    _setTarget: function() {
                        var i = this._getData(e.PROP_TARGET);
                        i = i === !0 ? this.el.source : i === e.SELECTOR_BODY && this.el.source.closest(e.SELECTOR_TARGET).length ? this.el.source.closest(e.SELECTOR_TARGET) : t(i ? i : e.SELECTOR_BODY),
                        "static" === i.css("position") && i.css({
                            position: "relative"
                        }),
                        this.el.target = i
                    },
                    _getData: function(t) {
                        return this.el.source.data(this._namespaced(t))
                    },
                    _namespaced: function(t) {
                        return this.classInstance.namespaced(t)
                    },
                    _onProtipMouseenter: function() {
                        clearTimeout(this._task.delayOut)
                    },
                    _onProtipMouseleave: function() {
                        this.data.trigger === e.TRIGGER_HOVER && this.hide()
                    },
                    _bind: function() {
                        this.data.interactive && this.el.protip.on(e.EVENT_MOUSEENTER, t.proxy(this._onProtipMouseenter, this)).on(e.EVENT_MOUSELEAVE, t.proxy(this._onProtipMouseleave, this)),
                        this.data.observer && (this._observerInstance = new MutationObserver(function() {
                            this.classInstance.reloadItemInstance(this.el.source)
                        }
                        .bind(this)),
                        this._observerInstance.observe(this.el.source.get(0), {
                            attributes: !0,
                            childList: !1,
                            characterData: !1,
                            subtree: !1
                        }))
                    },
                    _unbind: function() {
                        this.data.interactive && this.el.protip.off(e.EVENT_MOUSEENTER, t.proxy(this._onProtipMouseenter, this)).off(e.EVENT_MOUSELEAVE, t.proxy(this._onProtipMouseleave, this)),
                        this.data.observer && this._observerInstance.disconnect()
                    }
                }),
                n
            })
        }
        ).call(this, "undefined" != typeof global ? global : "undefined" != typeof self ? self : "undefined" != typeof window ? window : {})
    }
    , {
        "./Constants": 4,
        "./GravityTester": 6,
        "./PositionCalculator": 9
    }],
    8: [function(t, e, i) {
        (function(s) {
            !function(o, n) {
                "use strict";
                "function" == typeof define && define.amd ? define(["jquery", "./Class", "./Buffer", "./Constants"], n) : "object" == typeof i ? e.exports = n("undefined" != typeof window ? window.jQuery : "undefined" != typeof s ? s.jQuery : null, t("./Class"), t("./Buffer"), t("./Constants")) : n(o.jQuery, o.ProtipClass, o.ProtipBuffer, o.ProtipContants)
            }(this, function(t, e, i, s) {
                "use strict";
                t = t.extend(t, {
                    _protipClassInstance: void 0,
                    _protipBuffer: new i,
                    protip: function(t) {
                        return this._protipClassInstance || (this._protipClassInstance = new e(t),
                        this.protip.C = s),
                        this._protipClassInstance
                    }
                }),
                t.fn.extend({
                    protipDestroy: function() {
                        return t._protipBuffer.isReady() ? this.each(function(e, i) {
                            i = t(i),
                            t._protipClassInstance.getItemInstance(i).destroy()
                        }) : this
                    },
                    protipSet: function(e) {
                        return t._protipBuffer.isReady() ? this.each(function(i, s) {
                            s = t(s),
                            t._protipClassInstance.getItemInstance(s).destroy(),
                            t._protipClassInstance.getItemInstance(s, e)
                        }) : (t._protipBuffer.add("protipSet", this, arguments),
                        this)
                    },
                    protipShow: function(e) {
                        return t._protipBuffer.isReady() ? this.each(function(i, s) {
                            s = t(s),
                            t._protipClassInstance.getItemInstance(s).destroy(),
                            t._protipClassInstance.getItemInstance(s, e).show(!0)
                        }) : (t._protipBuffer.add("protipShow", this, arguments),
                        this)
                    },
                    protipHide: function() {
                        return t._protipBuffer.isReady() ? this.each(function(e, i) {
                            t._protipClassInstance.getItemInstance(t(i)).hide(!0)
                        }) : (t._protipBuffer.add("protipHide", this, arguments),
                        this)
                    },
                    protipToggle: function() {
                        if (t._protipBuffer.isReady()) {
                            var e;
                            return this.each(function(i, s) {
                                e = t._protipClassInstance.getItemInstance(t(s)),
                                e = e.isVisible() ? e.hide(!0) : e.show(!0)
                            }
                            .bind(this))
                        }
                        return t._protipBuffer.add("protipToggle", this, arguments),
                        this
                    },
                    protipHideInside: function() {
                        return t._protipBuffer.isReady() ? this.each(function(e, i) {
                            t(i).find(t._protipClassInstance.settings.selector).each(function(e, i) {
                                t._protipClassInstance.getItemInstance(t(i)).hide(!0)
                            })
                        }) : (t._protipBuffer.add("protipHideInside", this, arguments),
                        this)
                    },
                    protipShowInside: function() {
                        return t._protipBuffer.isReady() ? this.each(function(e, i) {
                            t(i).find(t._protipClassInstance.settings.selector).each(function(e, i) {
                                t._protipClassInstance.getItemInstance(t(i)).show(!0)
                            })
                        }) : (t._protipBuffer.add("protipShowInside", this, arguments),
                        this)
                    },
                    protipToggleInside: function() {
                        if (t._protipBuffer.isReady()) {
                            var e;
                            return this.each(function(i, s) {
                                t(s).find(t._protipClassInstance.settings.selector).each(function(i, s) {
                                    e = t._protipClassInstance.getItemInstance(t(s)),
                                    e = e.isVisible() ? e.hide(!0) : e.show(!0)
                                })
                            })
                        }
                        return t._protipBuffer.add("protipToggleInside", this, arguments),
                        this
                    }
                })
            })
        }
        ).call(this, "undefined" != typeof global ? global : "undefined" != typeof self ? self : "undefined" != typeof window ? window : {})
    }
    , {
        "./Buffer": 2,
        "./Class": 3,
        "./Constants": 4
    }],
    9: [function(t, e, i) {
        (function(s) {
            !function(o, n) {
                "use strict";
                "function" == typeof define && define.amd ? define(["jquery", "./Constants"], n) : "object" == typeof i ? e.exports = n("undefined" != typeof window ? window.jQuery : "undefined" != typeof s ? s.jQuery : null, t("./Constants")) : o.ProtipPositionCalculator = n(o.jQuery, o.ProtipConstants)
            }(this, function(t, e) {
                "use strict";
                var i = function(t, e, i) {
                    return this._Construct(t, e, i)
                };
                return t.extend(!0, i.prototype, {
                    _Construct: function(t, e, i) {
                        return this._itemInstance = t,
                        this._protip = this._getProto(this._itemInstance.el.protip),
                        this._source = this._getProto(this._itemInstance.el.source),
                        this._target = this._getProto(this._itemInstance.el.target),
                        this._position = e || this._itemInstance.data.position,
                        this._placement = this._itemInstance.data.placement,
                        this._offset = i || {
                            top: this._itemInstance.data.offsetTop,
                            left: this._itemInstance.data.offsetLeft
                        },
                        this._getPosition()
                    },
                    _getProto: function(t) {
                        var e = {
                            el: void 0,
                            width: void 0,
                            height: void 0,
                            offset: void 0
                        };
                        return e.el = t,
                        e.width = t.outerWidth() || 0,
                        e.height = t.outerHeight() || 0,
                        e.offset = t.offset(),
                        e
                    },
                    _getPosition: function() {
                        this._itemInstance.applyPosition(this._position);
                        var t = {
                            left: 0,
                            top: 0
                        }
                          , i = this._itemInstance.getArrowOffset()
                          , s = this._itemInstance.classInstance.settings.offset
                          , o = document.body.scrollLeft || 0
                          , n = document.body.scrollTop || 0;
                        if (o = window.pageXOffset === o ? 0 : this._target.el.get(0) !== document.body ? 0 : o,
                        n = window.pageYOffset === n ? 0 : this._target.el.get(0) !== document.body ? 0 : n,
                        this._placement !== e.PLACEMENT_CENTER)
                            switch (this._position) {
                            case e.POSITION_TOP:
                                this._offset.top += -1 * (s + i.height),
                                t.left = this._source.offset.left + this._source.width / 2 - this._protip.width / 2 - this._target.offset.left + this._offset.left + o,
                                t.top = this._source.offset.top - this._protip.height - this._target.offset.top + this._offset.top + n,
                                this._placement === e.PLACEMENT_INSIDE && (t.top += this._protip.height),
                                this._placement === e.PLACEMENT_BORDER && (t.top += this._protip.height / 2);
                                break;
                            case e.POSITION_TOP_LEFT:
                                this._offset.top += -1 * (s + i.height),
                                t.left = this._source.offset.left - this._target.offset.left + this._offset.left + o,
                                t.top = this._source.offset.top - this._protip.height - this._target.offset.top + this._offset.top + n,
                                this._placement === e.PLACEMENT_INSIDE && (t.top += this._protip.height),
                                this._placement === e.PLACEMENT_BORDER && (t.top += this._protip.height / 2);
                                break;
                            case e.POSITION_TOP_RIGHT:
                                this._offset.top += -1 * (s + i.height),
                                t.left = this._source.offset.left + this._source.width - this._protip.width - this._target.offset.left + this._offset.left + o,
                                t.top = this._source.offset.top - this._protip.height - this._target.offset.top + this._offset.top + n,
                                this._placement === e.PLACEMENT_INSIDE && (t.top += this._protip.height),
                                this._placement === e.PLACEMENT_BORDER && (t.top += this._protip.height / 2);
                                break;
                            case e.POSITION_RIGHT:
                                this._offset.left += s + i.width,
                                t.left = this._source.offset.left + this._source.width - this._target.offset.left + this._offset.left + o,
                                t.top = this._source.offset.top + this._source.height / 2 - this._protip.height / 2 - this._target.offset.top + this._offset.top + n,
                                this._placement === e.PLACEMENT_INSIDE && (t.left -= this._protip.width),
                                this._placement === e.PLACEMENT_BORDER && (t.left -= this._protip.width / 2);
                                break;
                            case e.POSITION_RIGHT_TOP:
                                this._offset.left += s + i.width,
                                t.left = this._source.offset.left + this._source.width - this._target.offset.left + this._offset.left + o,
                                t.top = this._source.offset.top - this._target.offset.top + this._offset.top + n,
                                this._placement === e.PLACEMENT_INSIDE && (t.left -= this._protip.width),
                                this._placement === e.PLACEMENT_BORDER && (t.left -= this._protip.width / 2);
                                break;
                            case e.POSITION_RIGHT_BOTTOM:
                                this._offset.left += s + i.width,
                                t.left = this._source.offset.left + this._source.width - this._target.offset.left + this._offset.left + o,
                                t.top = this._source.offset.top + this._source.height - this._protip.height - this._target.offset.top + this._offset.top + n,
                                this._placement === e.PLACEMENT_INSIDE && (t.left -= this._protip.width),
                                this._placement === e.PLACEMENT_BORDER && (t.left -= this._protip.width / 2);
                                break;
                            case e.POSITION_BOTTOM:
                                this._offset.top += s + i.height,
                                t.left = this._source.offset.left + this._source.width / 2 - this._protip.width / 2 - this._target.offset.left + this._offset.left + o,
                                t.top = this._source.offset.top + this._source.height - this._target.offset.top + this._offset.top + n,
                                this._placement === e.PLACEMENT_INSIDE && (t.top -= this._protip.height),
                                this._placement === e.PLACEMENT_BORDER && (t.top -= this._protip.height / 2);
                                break;
                            case e.POSITION_BOTTOM_LEFT:
                                this._offset.top += s + i.height,
                                t.left = this._source.offset.left - this._target.offset.left + this._offset.left + o,
                                t.top = this._source.offset.top + this._source.height - this._target.offset.top + this._offset.top + n,
                                this._placement === e.PLACEMENT_INSIDE && (t.top -= this._protip.height),
                                this._placement === e.PLACEMENT_BORDER && (t.top -= this._protip.height / 2);
                                break;
                            case e.POSITION_BOTTOM_RIGHT:
                                this._offset.top += s + i.height,
                                t.left = this._source.offset.left + this._source.width - this._protip.width - this._target.offset.left + this._offset.left + o,
                                t.top = this._source.offset.top + this._source.height - this._target.offset.top + this._offset.top + n,
                                this._placement === e.PLACEMENT_INSIDE && (t.top -= this._protip.height),
                                this._placement === e.PLACEMENT_BORDER && (t.top -= this._protip.height / 2);
                                break;
                            case e.POSITION_LEFT:
                                this._offset.left += -1 * (s + i.width),
                                t.left = this._source.offset.left - this._protip.width - this._target.offset.left + this._offset.left + o,
                                t.top = this._source.offset.top + this._source.height / 2 - this._protip.height / 2 - this._target.offset.top + this._offset.top + n,
                                this._placement === e.PLACEMENT_INSIDE && (t.left += this._protip.width),
                                this._placement === e.PLACEMENT_BORDER && (t.left += this._protip.width / 2);
                                break;
                            case e.POSITION_LEFT_TOP:
                                this._offset.left += -1 * (s + i.width),
                                t.left = this._source.offset.left - this._protip.width - this._target.offset.left + this._offset.left + o,
                                t.top = this._source.offset.top - this._target.offset.top + this._offset.top + n,
                                this._placement === e.PLACEMENT_INSIDE && (t.left += this._protip.width),
                                this._placement === e.PLACEMENT_BORDER && (t.left += this._protip.width / 2);
                                break;
                            case e.POSITION_LEFT_BOTTOM:
                                this._offset.left += -1 * (s + i.width),
                                t.left = this._source.offset.left - this._protip.width - this._target.offset.left + this._offset.left + o,
                                t.top = this._source.offset.top + this._source.height - this._protip.height - this._target.offset.top + this._offset.top + n,
                                this._placement === e.PLACEMENT_INSIDE && (t.left += this._protip.width),
                                this._placement === e.PLACEMENT_BORDER && (t.left += this._protip.width / 2);
                                break;
                            case e.POSITION_CORNER_LEFT_TOP:
                                this._offset.top += -1 * (s + i.height),
                                t.left = this._source.offset.left - this._protip.width - this._target.offset.left + this._offset.left + o,
                                t.top = this._source.offset.top - this._protip.height - this._target.offset.top + this._offset.top + n,
                                this._placement === e.PLACEMENT_INSIDE && (t.left += this._protip.width),
                                this._placement === e.PLACEMENT_INSIDE && (t.top += this._protip.height),
                                this._placement === e.PLACEMENT_BORDER && (t.left += this._protip.width / 2),
                                this._placement === e.PLACEMENT_BORDER && (t.top += this._protip.height / 2);
                                break;
                            case e.POSITION_CORNER_LEFT_BOTTOM:
                                this._offset.top += s + i.height,
                                t.left = this._source.offset.left - this._protip.width - this._target.offset.left + this._offset.left + o,
                                t.top = this._source.offset.top + this._source.height - this._target.offset.top + this._offset.top + n,
                                this._placement === e.PLACEMENT_INSIDE && (t.left += this._protip.width),
                                this._placement === e.PLACEMENT_INSIDE && (t.top -= this._protip.height),
                                this._placement === e.PLACEMENT_BORDER && (t.left += this._protip.width / 2),
                                this._placement === e.PLACEMENT_BORDER && (t.top -= this._protip.height / 2);
                                break;
                            case e.POSITION_CORNER_RIGHT_BOTTOM:
                                this._offset.top += s + i.height,
                                t.left = this._source.offset.left + this._source.width - this._target.offset.left + this._offset.left + o,
                                t.top = this._source.offset.top + this._source.height - this._target.offset.top + this._offset.top + n,
                                this._placement === e.PLACEMENT_INSIDE && (t.left -= this._protip.width),
                                this._placement === e.PLACEMENT_INSIDE && (t.top -= this._protip.height),
                                this._placement === e.PLACEMENT_BORDER && (t.left -= this._protip.width / 2),
                                this._placement === e.PLACEMENT_BORDER && (t.top -= this._protip.height / 2);
                                break;
                            case e.POSITION_CORNER_RIGHT_TOP:
                                this._offset.top += -1 * (s + i.height),
                                t.left = this._source.offset.left + this._source.width - this._target.offset.left + this._offset.left + o,
                                t.top = this._source.offset.top - this._protip.height - this._target.offset.top + this._offset.top + n,
                                this._placement === e.PLACEMENT_INSIDE && (t.left -= this._protip.width),
                                this._placement === e.PLACEMENT_INSIDE && (t.top += this._protip.height),
                                this._placement === e.PLACEMENT_BORDER && (t.left -= this._protip.width / 2),
                                this._placement === e.PLACEMENT_BORDER && (t.top += this._protip.height / 2)
                            }
                        else
                            t.left = this._source.offset.left + this._source.width / 2 - this._protip.width / 2 - this._target.offset.left + this._offset.left + o,
                            t.top = this._source.offset.top + this._source.height / 2 - this._protip.height / 2 - this._target.offset.top + this._offset.top + n;
                        return t.left = t.left + "px",
                        t.top = t.top + "px",
                        t
                    }
                }),
                i
            })
        }
        ).call(this, "undefined" != typeof global ? global : "undefined" != typeof self ? self : "undefined" != typeof window ? window : {})
    }
    , {
        "./Constants": 4
    }]
}, {}, [1]);
;var SOCKET;
var USERID;
var NICK = NICK || null;
var EXTRA = EXTRA || {};
var ONLINE = false;
var LOWER = null;
var INFO = null;
var COUNTDOWN = null;
var TYPING = new Map();
var TYPING_LAST = 0;
var BOTTOM = false;
var PAGINATING = false;
var HOVERING = false;
var PAUSED = false;
var PAUSED_CHECK = null;
var ACTIVITY = new Map();
var ACTIVITY_CALLBACKS = [];
var ONLINE_CALLBACKS = [];
var CHAT_OBSERVER_SCROLL;
var CHAT_OBSERVER_EXACT;
var CHAT_ERROR = false;
var CHAT_WIDTH = 200;
var CHAT_SCROLLING = false;
var CHAT_SCROLLING_DIR = 0;
var CHAT_CURRENT = 0;
var CHAT_MESSAGES = new Map();
var SESSION_FIXED = SESSION_FIXED || false;
var SESSION_ITEM = SESSION_ITEM || 0;
var SESSION_LATEST = SESSION_LATEST || 1;
var CHAT_PAGINATION_LIMIT = 40;
var CHAT_PAGINATION_FIRST = null;
var CHAT_PAGINATION_LAST = null;
var CHAT_PAGINATION_TOP = false;
var CHAT_PAGINATION_BOT = false;
var CHAT_PLACEHOLDER_TOP = false;
var CHAT_PLACEHOLDER_BOT = false;
var CHAT_DATE_FORMAT = new Intl.DateTimeFormat(['pt-BR', 'pt'],{
    dateStyle: 'long'
});
var CHAT_TIME_FORMAT = new Intl.DateTimeFormat(['pt-BR', 'pt'],{
    timeStyle: 'short'
});
function checkTyping(remove) {
    var now = Date.now();
    var typed = [];
    var other = 0;
    for (let[uid,arr] of TYPING) {
        if (now > arr[0] + 1000 || remove == uid) {
            TYPING.delete(uid);
            $('.users-list .userid-' + uid).removeClass('user-typing');
        } else if (uid != USERID && arr[1]) {
            if (typed.length <= 3) {
                typed.push(arr[1]);
            } else {
                other++;
            }
        }
    }
    if (typed.length > 0) {
        var plural = typed.length > 1 ? true : false;
        var last = typed.pop();
        $('.chat-typing-list').html(typed.join(', ') + (other > 0 ? (', ' + last + ' e mais ' + (other > 1 ? other : 'um')) : ((typed.length > 0 ? ' e ' : '') + last)) + (plural ? ' estão' : ' está') + ' escrevendo...');
    } else {
        $('.chat-typing-list').html('');
    }
}
function escapeString(str) {
    if (typeof str !== 'undefined' && str !== null && str !== '') {
        return str.replace(/<(?:.|\n)*?>/gm, '');
    } else {
        return '';
    }
}
function replaceUrl(str) {
    var exp = /(\b(https?|ftp|file):\/\/([-A-Z0-9+&@#%?=~_|!:,.;]*)([-A-Z0-9+&@#%?\/=~_|!:,.;]*)[-A-Z0-9+&@#\/%=~_|])/ig;
    str = str.replace(exp, "<a href=\"$1\" target=\"_blank\" class=\"custom-popup\" rel=\"nofollow noopener noreferrer\">$1</a>");
    return str.replace(/>(https?|ftp|file):\/\//ig, '>');
}
function scrollMessages(force, slow) {
    if (((BOTTOM && !PAUSED) || force) && !SCROLLING && !PAGINATING) {
        var node = $(".chat-messages").get(0);
        if (!node)
            return;
        scrollToBottom(node, function() {
            checkBottom(node);
        }, 0, (slow ? 1000 : 0));
    }
}
function notify(msg, body) {
    var data = {
        icon: 'https://biblos360.com.br/apple-touch-icon.png',
        lang: 'pt-BR'
    };
    if (typeof body !== 'undefined' && body !== null && body !== '') {
        data['body'] = body
    }
    if ("Notification"in window && Notification.permission === "granted") {
        return new Notification(msg,data);
    }
}
function soundAlert() {
    let src = '/chime.mp3';
    let audio = new Audio(src);
    var promise = audio.play();
    if (promise !== undefined) {
        promise.then(_ => {}
        ).catch(error => {}
        );
    }
}
function runCountdown(total) {
    if (total) {
        if (total >= 0) {
            var s = Math.floor((total / 1000) % 60);
            var m = Math.floor((total / 1000 / 60) % 60);
            var h = Math.floor((total / (1000 * 60 * 60)) % 24);
            var t = '';
            if (h) {
                t = t + h.toString().padStart(2, '0') + ':';
            }
            t = t + m.toString().padStart(2, '0') + ':' + s.toString().padStart(2, '0');
            $('.chat-timer').html(t).show();
            COUNTDOWN = window.setTimeout(runCountdown, 1000, total - 1000);
        } else {
            clearTimeout(COUNTDOWN);
            COUNTDOWN = null;
            $('.chat-timer').fadeOut(200, function() {
                $(this).html('');
            });
        }
    } else {
        clearTimeout(COUNTDOWN);
        COUNTDOWN = null;
        $('.chat-timer').fadeOut(200, function() {
            $(this).html('');
        });
    }
}
function showLower() {
    if (!LOWER) {
        $('.chat-lower').fadeOut(200, function() {
            $(this).html('');
        });
    } else {
        var msg = '<div class="chat-lower-main">' + escapeString(LOWER.main) + '</div>';
        if (LOWER.sub) {
            msg = msg + '<div class="chat-lower-sub">' + escapeString(LOWER.sub) + '</div>';
        }
        $(".chat-lower").fadeOut(200, function() {
            $(this).html(msg).fadeIn(600);
        });
    }
}
$(window).on("resized", function(e, resized_to) {
    updateChatLocation(resized_to);
    scrollMessages();
});
function updateChatLocation(resized_to) {
    if (is_mobile || resized_to == 'mobile') {
        $('.chat-box').appendTo($(".chat-mobile").get(0));
    } else if (is_tablet || resized_to == 'tablet') {
        $('.chat-box').appendTo($(".chat-tablet").get(0));
    } else if (is_desktop || resized_to == 'desktop') {
        $('.chat-box').appendTo($(".chat-desktop").get(0));
    }
    CHAT_WIDTH = $('.chat-box').width();
}
function removeLivePlayer() {
    if ($('#liveiframe').length > 0) {
        unloadLiveWatcher('#liveiframe', updateActivity);
        $('#liveiframe').remove();
        if ($('body').hasClass('virtual-chat-removed')) {
            $('body').removeClass('virtual-chat-removed').addClass('virtual-chat-remove');
        }
        if ($('body').hasClass('virtual-users-removed')) {
            $('body').removeClass('virtual-users-removed').addClass('virtual-users-remove');
        }
    }
}
function removeVideoPlayer() {
    $.colorbox.close();
}
function loadLivePlayer(src, title) {
    if (!$('#liveoffline').is(':visible')) {
        if (src && $('#liveplayer').length > 0 && !$('#liveconf').is(':visible')) {
            $('#liveonline').show();
            if ($('#liveplayer > iframe').length === 0 || ($('#liveplayer > iframe').length > 0 && $('#liveplayer > iframe').first().attr('src') !== src)) {
                removeLivePlayer();
                removeVideoPlayer();
                $('#liveplayer').prepend('<iframe width="100%" id="liveiframe" src="' + src + '" frameborder="0" title="' + h(title) + '" allow="autoplay; fullscreen; encrypted-media" webkitAllowFullScreen mozallowfullscreen allowfullscreen></iframe>');
                if ($(".main-box").length > 0) {
                    $(".main-box").animate({
                        scrollTop: 0
                    }, "fast");
                } else {
                    $("html").animate({
                        scrollTop: 0
                    }, "fast");
                }
                if ($('#liveplayer > iframe').length > 0) {
                    loadLiveWatcher('#liveiframe');
                }
                if ($('body').hasClass('virtual-chat-remove')) {
                    $('body').removeClass('virtual-chat-remove').addClass('virtual-chat-removed');
                }
                if ($('body').hasClass('virtual-users-remove')) {
                    $('body').removeClass('virtual-users-remove').addClass('virtual-users-removed');
                }
            }
            $('#liveplayer').data('src', src);
            $('#liveplayer').data('title', title);
            $('#liveiframe').load(function() {
                if ($(this).attr('src').includes(___base_url___)) {
                    $('#liveiframe').contents().find('.confurl').unbind('click').on('click', function(e) {
                        e.preventDefault();
                        loadConference($(this).attr('href'));
                        return false;
                    });
                }
            });
        } else {
            $('#liveonline').hide();
        }
    }
}
function loadLiveWatcher(selector, callback, item) {}
function unloadLiveWatcher(selector, callback, item) {}
function systemMessage(message, classname) {
    CHAT_ERROR = true;
    $('.chat-messages').append($('<li class="chat-message-system chat-message-error ' + (classname ? classname : '') + '">').html(message.replace(/\n/g, '<br>')));
    scrollMessages();
}
function chatData(data) {
    data.userclass = "";
    data.rowclass = "";
    data.msgclass = "";
    data.replyclass = "";
    data.usericon = "";
    if (data.ts) {
        data.date = new Date(data.ts * 1000);
    } else {
        data.date = null;
    }
    if (data.reply_hidden == 1) {
        data.replyclass += "chat-reply-hidden ";
    }
    if (data.highlight) {
        data.rowclass += "chat-highlight ";
    }
    if (data.hidden) {
        data.rowclass += "chat-hidden ";
    }
    if (data.marked) {
        data.rowclass += "chat-marked ";
    }
    if (data.favorited) {
        data.rowclass += "chat-favorited ";
    }
    if (data.level >= 1) {
        data.extra.uf = data.extra.equipe ? data.extra.equipe : 'Biblos360';
        if (data.level == 3) {
            data.usericon = "fas fa-fw fa-crown";
            data.userclass += "chat-admin ";
        } else if (data.level == 2) {
            data.usericon = "fas fa-fw fa-crown";
            data.userclass += "chat-monitor ";
        } else if (data.level == 1) {
            data.userclass += "chat-volunteer ";
        }
    } else {
        if (data.extra.extid) {
            data.userclass += "chat-insc ";
        } else {
            data.userclass += "chat-pub ";
        }
    }
    if (data.extra.turma) {
        if (data.extra.turma != data.extra.equipe) {
            data.userclass += "chat-turma-" + escapeString(data.extra.turma.toLowerCase()) + " ";
        } else if (data.extra.equipe) {
            data.userclass += "chat-equipe ";
        }
    }
    data.sub = data.extra.uf ? data.extra.uf : '';
    if (data.userid === USERID) {
        data.rowclass += "chat-own ";
    } else {
        if (data.message.indexOf('?') !== -1) {
            data.msgclass += "chat-question ";
        }
        if (NICK) {
            var nick_regex = new RegExp('\\b(' + NICK + ')\\b','gi');
            if (nick_regex.test(data.message) || (data.reply_nick && nick_regex.test(data.reply_nick))) {
                data.rowclass += "chat-mention ";
            }
        }
    }
    if (data.source !== '') {
        data.sub = data.source.toUpperCase();
    }
    if (data.extra.sexo === 1) {
        data.userclass += "chat-male ";
    } else if (data.extra.sexo === 2) {
        data.userclass += "chat-female ";
    }
    if (data.extra.parceiro) {
        data.userclass += "chat-parceiro ";
    }
    return data;
}
function chatMessageReplyTooltip(data) {
    return true;
}
function chatMessageOperations(data) {
    var msg = '<span class="chat-operations">';
    msg += '<a href="#" class="chat-reply" data-pt-title="Responder a ' + h(escapeString(data.nick)) + '" data-pt-position="left"><i class="fas fa-reply"></i></a>';
    if ((USERID && data.userid === USERID) || (EXTRA.level && SESSION_FIXED)) {
        msg += '<a href="#" class="chat-remove" data-pt-title="Remover mensagem" data-pt-scheme="pro" data-pt-classes="chat-remove-tooltip" data-pt-icon="fas fa-exclamation-circle"><i class="fas fa-trash-alt"></i></a>';
        msg += '<a href="#" class="chat-restore" data-pt-title="Restaurar mensagem"><i class="fas fa-undo-alt"></i></a>';
    }
    msg += '</span>';
    return msg;
}
function chatMessageTime(data) {
    return '';
}
function chatMessageQuote(data) {
    return '';
}
function chatDisabled() {
    $('.chat-join-form').hide();
    $('.chat-messages').addClass('chat-messages-hidden');
    $('.chat-message-input').hide();
    $('.chat-overlay-container.chat-replying').toggle();
    $('.chat-disabled').show();
    $('.chat-main').fadeIn(600);
}
function chatEnabled() {
    if (!NICK) {
        $('.chat-join-form').show();
    }
    $('.chat-messages').removeClass('chat-messages-hidden');
    $('.chat-message-input').show();
    $('.chat-overlay-container.chat-replying').toggle();
    $('.chat-disabled').hide();
    $('.chat-main').fadeIn(600);
}
function chatMessage(data, prepend) {
    var msg = '';
    var tooltip = '';
    if (data.replyid && chatMessageReplyTooltip(data) === true) {
        tooltip = ' data-pt-title="' + h('<div class="chat-quote"><a href="#" class="chat-replied ' + data.replyclass + '" data-replyid="' + data.replyid + '"><div class="chat-quote-nick"><i class="fas fa-chevron-up"></i> Respondendo a ' + escapeString(data.reply_nick) + '</div><div class="chat-quote-message">' + (data.reply_message_html ? data.reply_message_html : escapeString(data.reply_message)) + '</div></a></div>') + '" data-pt-scheme="dark" data-pt-target="true" data-pt-position="top-left" data-pt-arrow="false" data-pt-gravity="false"';
    }
    msg += '<li class="chat-message ' + data.rowclass + '" data-msgid="' + data.msgid.toString() + '" data-userid="' + (data.userid ? data.userid.toString() : '') + '" data-ts="' + data.ts + '" data-groupid="' + (data.groupid ? data.groupid.toString() : '') + '"' + (tooltip ? tooltip : '') + '>';
    msg += chatMessageOperations(data);
    msg += '<span class="chat-sender ' + data.userclass + '">';
    if (data.source === '') {
        if (data.extra.turma && data.extra.turma.length == 1) {
            msg += '<span class="chat-label"><span class="chat-turma">' + escapeString(data.extra.turma) + '</span></span>';
        } else if (data.usericon) {
            msg += '<span class="chat-label"><span class="chat-turma chat-icon"><i class="' + data.usericon + '"></i></span></span>';
        }
        msg += '<span class="chat-nick">' + h(escapeString(data.nick)) + '</span>';
    } else {
        msg += '<span class="chat-nick">' + h(escapeString(data.nick)) + '</span>';
    }
    if (data.extra.parceiro && data.level <= 1) {
        msg += '<span class="chat-extra-parceiro" title="Parceiro do Biblos360"><i class="fas fa-star"></i></span>';
    }
    if (data.sub) {
        msg += '<span class="chat-extra ' + (data.source ? 'chat-' + data.source : '') + '">' + h(escapeString(data.sub)) + '</span> ';
    }
    msg += chatMessageTime(data);
    msg += '</span>';
    if (data.replyid) {
        msg += '<span class="chat-quote"><a href="#" class="chat-replied ' + data.replyclass + '" data-replyid="' + data.replyid.toString() + '"><span class="chat-quote-nick"><i class="fas fa-at"></i>' + h(escapeString(data.reply_nick)) + '</span>';
        msg += chatMessageQuote(data);
        msg += '</a></span>';
    }
    if (data.hidden) {
        msg += '<span class="chat-hidden-msg">Mensagem excluída (clique para mostrar)</span>';
    }
    msg += '<span class="chat-msg ' + data.msgclass + '">' + (data.message_html ? data.message_html : nl2br(h(replaceUrl(escapeString(data.message))))) + '</span>';
    msg += '</li>';
    return msg;
}
function headerMessage(curr, prev, prepend) {
    if (!curr || intval(curr.dataset.msgid) == 0)
        return;
    var cd = new Date(curr.dataset.ts * 1000);
    var cid = intval(curr.dataset.msgid);
    var rowclass = '';
    var label = '';
    var header = false;
    if (today(cd)) {
        label = 'Hoje';
    } else if (yesterday(cd)) {
        label = 'Ontem';
    } else {
        label = CHAT_DATE_FORMAT.format(cd);
    }
    if (cid == getMessagesValue(SESSION_FIXED ? SESSION_ITEM : 0, 'last')) {
        rowclass += 'chat-message-unread ';
        header = true;
        clearUnreadHeader();
    }
    if (prev) {
        var pd = new Date(prev.dataset.ts * 1000);
        var pid = intval(prev.dataset.msgid);
        if (pid > 0 && cid > pid && !same_day(cd, pd)) {
            rowclass += 'chat-message-dated ';
            header = true;
        }
    }
    if (!header)
        return;
    return '<li class="chat-message-system ' + rowclass + '"><span><span class="chat-message-line"></span><span class="chat-message-label">' + label + '</span><span class="chat-message-line"></span><span class="chat-message-arrow"></span><span class="chat-message-new">NOVO</span></span></span></li>';
}
function insertMessage(data, prepend) {
    var li = $(chatMessage(chatData(data, prepend))).get(0);
    var he;
    var curr;
    var prev;
    if (prepend) {
        curr = CHAT_PAGINATION_FIRST;
        prev = li;
    } else {
        curr = li;
        prev = CHAT_PAGINATION_LAST;
    }
    he = $(headerMessage(curr, prev, prepend)).get(0);
    if (curr && prev && !he) {
        if (intval(curr.dataset.groupid) > 0 && intval(prev.dataset.userid) && intval(curr.dataset.userid) == intval(prev.dataset.userid)) {
            if (intval(curr.dataset.groupid) == intval(prev.dataset.msgid) || intval(curr.dataset.groupid) == intval(prev.dataset.groupid)) {
                $(curr).addClass("chat-grouped");
            }
        }
    }
    var node = $('.chat-messages').get(0);
    if (prepend) {
        $(li).insertAfter($(node).children('.chat-message-top'));
        if (he)
            $(he).insertAfter(li);
    } else {
        $(li).insertBefore($(node).children('.chat-message-bot'));
        if (he)
            $(he).insertBefore(li);
    }
    if (!CHAT_PAGINATION_FIRST || li.dataset.msgid < intval(CHAT_PAGINATION_FIRST.dataset.msgid)) {
        CHAT_PAGINATION_FIRST = li;
        CHAT_OBSERVER_SCROLL.observe(li);
    }
    if (!CHAT_PAGINATION_LAST || li.dataset.msgid > intval(CHAT_PAGINATION_LAST.dataset.msgid)) {
        CHAT_PAGINATION_LAST = li;
        CHAT_OBSERVER_SCROLL.observe(li);
    }
    CHAT_OBSERVER_EXACT.observe(li);
    if (he)
        CHAT_OBSERVER_EXACT.observe(he);
    $(li).find('.timeago').timeago();
    if (CHAT_ERROR) {
        $(node).children('.chat-message-error').remove();
        CHAT_ERROR = false;
    }
}
function checkPaused() {
    var changed = false;
    if (HOVERING) {
        changed = PAUSED ? false : true;
        PAUSED = true;
    } else {
        if (BOTTOM) {
            changed = PAUSED ? true : false;
            PAUSED = false;
        } else {
            changed = PAUSED ? false : true;
            PAUSED = true;
        }
    }
    if (!PAUSED || !BOTTOM) {
        clearInterval(PAUSED_CHECK);
        PAUSED_CHECK = null;
    }
    if (changed) {
        if (!PAUSED) {
            $('.chat-paused').hide();
        } else {
            $('.chat-paused').show();
        }
        if (!PAUSED && !BOTTOM) {
            scrollMessages();
        }
    }
}
function loadMessagesOldest(callback) {
    var cb = function(messages, node) {
        PAUSED = true;
        $('.chat-paused').show();
        checkBottom(node);
        if (typeof callback === 'function') {
            callback(messages, node);
        }
    }
    loadMessages(null, true, false, true, cb);
}
function loadMessagesNewest(callback, instant) {
    var cb = function(messages, node) {
        PAUSED = false;
        if (typeof callback === 'function') {
            callback(messages, node);
        }
        scrollMessages(true, instant ? false : true);
    }
    loadMessages(null, true, true, true, cb);
}
function highlightNode(msg, classname) {
    if (!msg)
        return;
    if (typeof classname == 'undefined') {
        classname = 'chat-highlight';
    } else if (!classname) {
        return;
    }
    $(msg).removeClass(classname);
    $(msg).get(0).offsetWidth;
    $(msg).addClass(classname);
}
function messageNode(msgid, node) {
    if (intval(msgid) === 0)
        return;
    node = node || $('.chat-messages');
    return $(node).children(".chat-message[data-msgid='" + msgid + "']").first().get(0);
}
function loadMessage(msgid, highlight, callback) {
    msgid = intval(msgid);
    if (msgid === 0)
        return false;
    var cb = function(messages, node) {
        var msg = messageNode(msgid);
        highlightNode(msg, highlight);
        if (messages) {
            if (msgid < CHAT_CURRENT) {
                node.scrollTop = node.scrollHeight;
            } else {
                node.scrollTop = 0;
            }
        }
        scrollToElement(msg, node, function() {
            checkBottom(node);
        }, 150, 0, 600);
        if (typeof callback === 'function') {
            callback(messages, node);
        }
    }
    loadMessages(msgid, false, false, true, cb);
}
function loadMessages(msgid, exact, latest, clear, callback) {
    if (CHAT_PAGINATION_TOP === true && CHAT_PAGINATION_BOT === true && !clear)
        return;
    if (PAGINATING)
        return;
    if (typeof callback != 'function') {
        callback = function() {}
    }
    var msgid = intval(msgid);
    var prepend = (msgid < 0) ? true : false;
    var node = $('.chat-messages').get(0);
    if (clear) {
        if (msgid > 0) {
            if (messageNode(msgid)) {
                return callback(null, node);
            }
            if (CHAT_PAGINATION_FIRST && msgid < intval(CHAT_PAGINATION_FIRST.dataset.msgid)) {
                CHAT_SCROLLING_DIR = -1;
            } else if (CHAT_PAGINATION_LAST && msgid > intval(CHAT_PAGINATION_LAST.dataset.msgid)) {
                CHAT_SCROLLING_DIR = 1;
            } else if (latest) {
                CHAT_SCROLLING_DIR = 1;
            } else {
                CHAT_SCROLLING_DIR = -1;
            }
        } else {
            CHAT_SCROLLING_DIR = 1;
        }
        if (msgid == 0) {
            if (!latest && CHAT_PAGINATION_TOP === true) {
                return callback(null, node);
            } else if (latest && CHAT_PAGINATION_BOT === true) {
                return callback(null, node);
            }
        }
        $('.chat-messages').children().not(".chat-message-top").not(".chat-message-bot").not(".chat-disabled").not(".chat-message-fixed").not(".chat-message-placeholder").remove();
        CHAT_PAGINATION_TOP = false;
        CHAT_PAGINATION_BOT = false;
        CHAT_PAGINATION_FIRST = null;
        CHAT_PAGINATION_LAST = null;
    }
    PAGINATING = true;
    $(node).children('.chat-message-fixed').hide();
    if (msgid != 0) {
        if (clear) {
            loadPlaceholders(node, true);
            loadPlaceholders(node, false);
        } else {
            loadPlaceholders(node, prepend);
        }
    } else {
        loadPlaceholders(node, latest);
    }
    SOCKET.emit('messages', (SESSION_FIXED ? SESSION_ITEM : 0), msgid, exact, (latest ? SESSION_LATEST : 0), function(messages) {
        var node = $('.chat-messages').get(0);
        var offset = node.scrollHeight;
        if (prepend) {
            messages = messages.reverse();
        }
        messages.forEach(function(data, index) {
            insertMessage(data, prepend);
        });
        if (msgid == 0) {
            if (latest) {
                CHAT_PAGINATION_BOT = true;
            } else {
                CHAT_PAGINATION_TOP = true;
            }
        }
        if (messages.length < CHAT_PAGINATION_LIMIT) {
            if (latest || clear) {
                CHAT_PAGINATION_TOP = true;
                CHAT_PAGINATION_BOT = true;
                if (messages.length == 0) {
                    systemMessage('Nenhuma mensagem');
                }
            } else if (prepend) {
                CHAT_PAGINATION_TOP = true;
            } else {
                CHAT_PAGINATION_BOT = true;
            }
        } else {
            if (!exact && msgid > 0) {
                var index = messages.findIndex(function(m) {
                    return m.msgid === msgid
                });
                if (index == 0) {
                    CHAT_PAGINATION_TOP = true;
                } else if (index == CHAT_PAGINATION_LIMIT - 1) {
                    CHAT_PAGINATION_BOT = true;
                }
            }
        }
        if (CHAT_PAGINATION_TOP) {
            $(node).children('.chat-message-fixed').show();
        }
        unloadPlaceholders(node, prepend);
        if (prepend) {
            node.scrollTop += node.scrollHeight - offset;
        }
        checkScrollbar(node);
        PAGINATING = false;
        if (typeof callback == 'function') {
            callback(messages, node);
        }
    });
}
function unloadPlaceholders(node, prepend) {
    if (CHAT_PAGINATION_TOP === true && CHAT_PLACEHOLDER_TOP) {
        $(node).children('.chat-message-top').prevAll('.chat-message-placeholder').remove();
        CHAT_PLACEHOLDER_TOP = false;
    }
    if (CHAT_PAGINATION_BOT === true && CHAT_PLACEHOLDER_BOT) {
        $(node).children('.chat-message-bot').nextAll('.chat-message-placeholder').remove();
        CHAT_PLACEHOLDER_BOT = false;
    }
    if (node.scrollHeight === node.clientHeight) {
        $(node).children('.chat-message-placeholder').remove();
        CHAT_PLACEHOLDER_TOP = false;
        CHAT_PLACEHOLDER_BOT = false;
    }
}
function loadPlaceholders(node, prepend) {
    if (prepend && (CHAT_PLACEHOLDER_TOP || CHAT_PAGINATION_TOP === true))
        return;
    if (!prepend && (CHAT_PLACEHOLDER_BOT || CHAT_PAGINATION_BOT === true))
        return;
    var placeholder = $('<li class="chat-message-placeholder"></li>');
    for (var i = 5; i >= 0; i--) {
        for (var j = randomInt(1, 6); j >= 0; j--) {
            placeholder.append('<div style="width: ' + (randomInt(10, 50)) + '%"></div>');
        }
        if (prepend) {
            $(node).prepend(placeholder);
        } else {
            $(node).append(placeholder);
        }
        placeholder = placeholder.clone();
        placeholder.empty();
    }
    if (prepend) {
        CHAT_PLACEHOLDER_TOP = true;
    } else {
        CHAT_PLACEHOLDER_BOT = true;
    }
}
function checkScrolling(node) {
    if (CHAT_SCROLLING) {
        CHAT_SCROLLING = false;
        checkBottom(node);
    }
}
function checkScrollbar(node) {
    if (CHAT_PAGINATION_BOT === true && CHAT_PAGINATION_TOP === true)
        return;
    if (!CHAT_PAGINATION_FIRST && !CHAT_PAGINATION_LAST)
        return;
    if (CHAT_PAGINATION_TOP !== true && $(node).children('.chat-message-top').first().data('visible')) {
        CHAT_SCROLLING_DIR = -1;
        loadMessagesScrolled();
    } else if (CHAT_PAGINATION_BOT !== true && $(node).children('.chat-message-bot').first().data('visible')) {
        CHAT_SCROLLING_DIR = 1;
        loadMessagesScrolled();
    }
}
function loadPaginationFirst(msgid) {
    if (!msgid || (msgid > 0 && CHAT_PAGINATION_FIRST && msgid == intval(CHAT_PAGINATION_FIRST.dataset.msgid))) {
        var first = $(".chat-messages").children('.chat-message-top').next(".chat-message");
        if (first.length > 0) {
            first.removeClass('chat-grouped');
            CHAT_PAGINATION_FIRST = first.get(0);
        } else {
            CHAT_PAGINATION_FIRST = null;
        }
    }
}
function loadPaginationLast(msgid) {
    if (!msgid || (msgid > 0 && CHAT_PAGINATION_LAST && msgid == intval(CHAT_PAGINATION_LAST.dataset.msgid))) {
        var last = $(".chat-messages").children('.chat-message-bot').prev(".chat-message");
        if (last.length > 0) {
            CHAT_PAGINATION_LAST = last.get(0);
        } else {
            CHAT_PAGINATION_LAST = null;
        }
    }
}
function clearUnreadHeader() {
    $('.chat-message-unread').each(function() {
        $(this).removeClass('chat-message-unread');
        if ($(this).attr("class").split(/\s+/).length <= 1) {
            $(this).remove();
        }
    });
}
function updateUnreadGroupCount(item) {
    if (!item)
        return;
    $(".chat-unread[data-items]").each(function() {
        var items = $(this).data('items');
        var unread = 0;
        var replies = 0;
        if (items.includes(item)) {
            for (var i in items) {
                unread += getMessagesValue(items[i], 'unread');
                replies += getMessagesValue(items[i], 'replies');
            }
            $(this).toggleClass('chat-unread-zero', unread === 0).toggleClass('chat-replies', replies > 0).toggleClass('chat-unread-one', unread === 1).filter(':not(.chat-unread-extra)').text((replies > 0 ? '@' : '') + unread);
        }
    });
}
function updateUnreadCount(item) {
    if (!item)
        return;
    var unread = getMessagesValue(item, 'unread');
    var replies = getMessagesValue(item, 'replies');
    $(".chat-unread[data-item='" + item + "']").toggleClass('chat-unread-zero', unread === 0).toggleClass('chat-replies', replies > 0).toggleClass('chat-unread-one', unread === 1).filter(':not(.chat-unread-extra)').text((replies > 0 ? '@' : '') + unread);
    $(".chat-unwatched[data-item='" + item + "']").toggleClass('chat-watched', unread >= 0);
}
function updateMessageCount(item) {
    if (!item)
        return;
    var count = getMessagesValue(item, 'count');
    $(".chat-count[data-item='" + item + "']").toggleClass('chat-count-zero', count === 0).toggleClass('chat-count-one', count === 1).filter(':not(.chat-count-extra)').text(count);
}
function readItem(item) {
    var m = getMessages(item);
    if (m) {
        SOCKET.emit('read', item);
        if (SESSION_FIXED && SESSION_ITEM == item && getMessagesValue(item, 'last') > 0) {
            setMessagesValue(item, 'last', 0);
        }
    }
}
function unreadItem(item, msgid) {
    var m = getMessages(item);
    if (m) {
        SOCKET.emit('unread', item, msgid);
        if (SESSION_FIXED && SESSION_ITEM == item && !getMessagesValue(item, 'last')) {
            setMessagesValue(item, 'last', msgid);
        }
    }
}
function checkBottom(node, force) {
    if (PAGINATING || SCROLLING)
        return;
    var changed = false;
    if (CHAT_PAGINATION_BOT === true && Math.abs(Math.round(node.scrollHeight - node.scrollTop) - Math.round(node.clientHeight)) <= 5) {
        changed = (BOTTOM === false ? true : false);
        BOTTOM = true;
        if ((force || changed) && CHAT_PAGINATION_BOT === true && getMessagesValue(SESSION_FIXED ? SESSION_ITEM : 0, 'last') !== null) {
            readItem(SESSION_FIXED ? SESSION_ITEM : 0);
        }
        $('.chat-bottom').hide();
    } else {
        changed = (BOTTOM === true ? true : false);
        BOTTOM = false;
        if (changed) {
            $('.chat-bottom').show();
        }
    }
    checkPaused();
}
function updateActivity(items) {
    if (typeof items == 'undefined' || !items || items.length == 0) {
        return;
    }
    items.forEach(function(dict) {
        ACTIVITY.set(dict.item, dict);
        ACTIVITY_CALLBACKS.forEach(function(callback) {
            callback(dict);
        });
    });
}
function sendChatMessage(message, replyid, item, fixed) {
    if (!SOCKET || !message)
        return;
    if (message == 'loremp') {
        message = new LoremIpsum().paragraph(30, 100);
    } else if (message == 'lorem') {
        message = new LoremIpsum().sentence(5, 20);
    }
    checkTyping(USERID);
    $(".chat-message-input").val("");
    $(".chat-replyid").val("");
    closeOverlay();
    SOCKET.emit('message', message, replyid, '', item, fixed, function(message, error) {
        loadMessagesNewest(function() {
            if (!message) {
                systemMessage(error);
            }
        }, true);
    });
}
function closeOverlayAdmin() {}
function closeOverlay() {
    $('.chat-overlay').html('<i class="fas fa-spinner fa-pulse"></i>');
    $('.chat-overlay-container').removeClass('chat-replying').hide();
    $('.chat-message-form').removeClass('chat-replying');
    $('.chat-replyid').val('');
    $('.chat-messages .chat-highlight-reply').removeClass('chat-highlight-reply');
    closeOverlayAdmin();
}
function getMessages(item) {
    if (!item)
        return;
    if (!CHAT_MESSAGES.has(item)) {
        CHAT_MESSAGES.set(item, {
            item: item,
            count: 0,
            unread: 0,
            replies: 0,
            last: 0
        });
    }
    return CHAT_MESSAGES.get(item);
}
function setMessages(item, dict) {
    if (!item)
        return;
    CHAT_MESSAGES.set(item, dict);
}
function setMessagesValue(item, key, value) {
    if (!item)
        return;
    var m = getMessages(item);
    m[key] = value;
    setMessages(item, m);
}
function getMessagesValue(item, key) {
    if (!item)
        return;
    var m = getMessages(item);
    return m[key];
}
function chatObserverExact(entries, observer) {
    var item = SESSION_FIXED ? SESSION_ITEM : 0;
    entries.forEach(entry => {
        entry.target.dataset.visible = entry.isIntersecting;
        if (entry.isIntersecting && !entry.target.dataset.viewed) {
            entry.target.dataset.viewed = true;
        }
        var msgid = intval(entry.target.dataset.msgid);
        if (msgid > 0) {
            if (entry.isIntersecting) {
                CHAT_CURRENT = msgid;
            }
        } else {
            if (entry.target.classList.contains('chat-message-top') || entry.target.classList.contains('chat-message-bot')) {
                if (CHAT_PLACEHOLDER_TOP && CHAT_SCROLLING_DIR < 0 && CHAT_PAGINATION_TOP !== true && entry.isIntersecting) {
                    loadMessagesScrolled();
                }
                if (CHAT_PLACEHOLDER_BOT && CHAT_SCROLLING_DIR > 0 && CHAT_PAGINATION_BOT !== true && entry.isIntersecting) {
                    loadMessagesScrolled();
                }
            }
        }
    }
    );
}
function chatObserverScroll(entries, observer) {}
function loadMessagesScrolled(callback) {
    if (CHAT_PAGINATION_TOP === true && CHAT_PAGINATION_BOT === true)
        return;
    if (CHAT_SCROLLING_DIR === 0)
        return;
    if (PAGINATING)
        return;
    var prev;
    if (CHAT_SCROLLING_DIR < 0) {
        prev = CHAT_PAGINATION_FIRST;
    } else {
        prev = CHAT_PAGINATION_LAST;
    }
    if (!prev)
        return;
    var msgid = (intval(prev.dataset.msgid) + (1 * CHAT_SCROLLING_DIR)) * CHAT_SCROLLING_DIR;
    if (CHAT_SCROLLING_DIR < 0) {
        if (CHAT_PAGINATION_TOP == msgid || CHAT_PAGINATION_TOP === true)
            return;
        CHAT_PAGINATION_TOP = msgid;
    } else if (CHAT_SCROLLING_DIR > 0) {
        if (CHAT_PAGINATION_BOT == msgid || CHAT_PAGINATION_BOT === true)
            return;
        CHAT_PAGINATION_BOT = msgid;
    }
    var cb = function(messages, node) {
        checkBottom(node);
        if (typeof callback === 'function') {
            callback(messages, node);
        }
    }
    if (CHAT_SCROLLING_DIR < 0 && CHAT_PAGINATION_TOP === true) {
        cb(null, $('.chat-messages').get(0));
    } else if (CHAT_SCROLLING_DIR > 0 && CHAT_PAGINATION_BOT === true) {
        cb(null, $('.chat-messages').get(0));
    } else {
        loadMessages(msgid, true, false, false, cb);
    }
}
function joinedChat(data) {
    systemMessage('Você entrou no chat como "' + escapeString(NICK) + '".\nSe está errado, é só recarregar a página e entrar novamente.');
    $('.chat-message-input').focus();
}
function joinChat() {
    if (!NICK) {
        NICK = $(".chat-nick-input").val();
        if ($(".chat-nick-uf").val()) {
            EXTRA.uf = $(".chat-nick-uf").val().toUpperCase();
        }
        if (!NICK || !EXTRA.uf) {
            return false;
        }
    }
    SOCKET.emit('join', NICK, EXTRA, USERID, SESSION_ITEM, SESSION_FIXED, $('#liveplayer').length, function(data, activity) {
        if (data === -1) {
            $(".chat-blocked").show();
            return;
        }
        if (!USERID) {
            $(".chat-join-form").hide();
            $(".chat-nick-error").hide();
            $(".chat-blocked").hide();
            $(".chat-timeout").hide();
            $('.chat-messages').show();
            $(".chat-message-form").show();
            $(".chat-box").addClass('joined');
        }
        USERID = data.userid;
        NICK = data.nick;
        $(".chat-nick-input").val(NICK);
        if (SESSION_FIXED) {
            SOCKET.emit('update-unread-count', SESSION_ITEM, function(data) {
                if (data) {
                    setMessages(SESSION_ITEM, data);
                }
                if (!CHAT_CURRENT) {
                    if (!data || data.unread == data.count) {
                        loadMessagesOldest();
                    } else if (data && data.last > 0) {
                        loadMessage(data.last, false);
                    } else {
                        loadMessagesNewest();
                    }
                } else {
                    CHAT_SCROLLING_DIR = 1;
                    CHAT_PAGINATION_BOT = false;
                    loadMessagesScrolled();
                }
            });
        } else {
            SOCKET.emit('update-unread-count');
            if (!CHAT_CURRENT) {
                loadMessagesNewest();
            } else {
                CHAT_SCROLLING_DIR = 1;
                CHAT_PAGINATION_BOT = false;
                loadMessagesScrolled();
            }
        }
        updateActivity(activity);
        joinedChat(data);
    });
}
function checkBuffer(node) {
    if (PAGINATING || SCROLLING)
        return;
    var limit = 5 * CHAT_PAGINATION_LIMIT;
    var len = $(node).children('.chat-message').length;
    if (len <= limit)
        return;
    var offset = node.scrollHeight;
    if (!BOTTOM && CHAT_SCROLLING_DIR < 0) {
        var remove = $(node).children('.chat-message-bot').prevAll().not(".chat-message-top").not('.chat-message-placeholder').slice(0, len - limit);
        if (remove.length > 0) {
            $(remove).remove();
            loadPaginationLast();
            CHAT_PAGINATION_BOT = false;
            loadPlaceholders(node, false);
        }
    } else if (BOTTOM) {
        var remove = $(node).children('.chat-message-top').nextAll().not(".chat-message-bot").not('.chat-message-placeholder').slice(0, len - limit);
        if (remove.length > 0) {
            $(remove).remove();
            loadPaginationFirst();
            CHAT_PAGINATION_TOP = false;
            loadPlaceholders(node, true);
        }
    }
}
$(document).ready(function() {
    if ($('.chat-messages').length) {
        CHAT_OBSERVER_EXACT = new IntersectionObserver(chatObserverExact,{
            root: $('.chat-messages').get(0),
            rootMargin: '0px',
            threshold: 1.0
        });
        CHAT_OBSERVER_SCROLL = new IntersectionObserver(chatObserverScroll,{
            root: $('.chat-messages').get(0),
            rootMargin: '200px 0px 200px 0px',
            threshold: 0
        });
        CHAT_OBSERVER_EXACT.observe($('.chat-messages').children(".chat-message-top").get(0));
        CHAT_OBSERVER_EXACT.observe($('.chat-messages').children(".chat-message-bot").get(0));
        CHAT_OBSERVER_SCROLL.observe($('.chat-messages').children(".chat-message-top").get(0));
        CHAT_OBSERVER_SCROLL.observe($('.chat-messages').children(".chat-message-bot").get(0));
    }
    $('.chat-messages').scroll(function() {
        CHAT_SCROLLING = true;
        if (this.old) {
            if (this.scrollTop > this.old) {
                CHAT_SCROLLING_DIR = 1;
            } else {
                CHAT_SCROLLING_DIR = -1;
            }
        } else {
            CHAT_SCROLLING_DIR = 0;
        }
        this.old = this.scrollTop;
    });
    updateChatLocation();
    setInterval(checkBuffer, 5000, $('.chat-messages').get(0));
    setInterval(checkTyping, 1000, $('.users-list').get(0));
    setInterval(checkScrolling, 300, $('.chat-messages').get(0));
    $('.money').maskMoney({
        prefix: '',
        allowNegative: false,
        thousands: '.',
        decimal: ',',
        affixesStay: false
    });
    $("form#donation").submit(function(e) {
        var valor = $(this).find("input.valor").first();
        if (valor.val() == '') {
            alert('Por favor, informe um valor para a sua doação.');
            return false;
        }
    });
    $('.track-click').die('click');
    $(".chat-message-form").submit(function(e) {
        e.preventDefault();
        sendChatMessage($('.chat-message-input').val(), $('.chat-replyid').val(), SESSION_ITEM, SESSION_FIXED);
        return false;
    });
    $(".chat-message-input").not('.chat-message-forum').keypress(function(e) {
        if (e.which == 13 && !e.shiftKey) {
            $(this).closest("form").submit();
            e.preventDefault();
        }
    });
    $('.chat-messages').on("mouseenter", "li.chat-message", function(e) {
        $(this).protipShow({
            width: (CHAT_WIDTH >= 260 ? CHAT_WIDTH - 60 : 200)
        });
    });
    $('.chat-messages').on("mouseleave", "li.chat-message", function(e) {
        $(this).protipHide();
    });
    $('.chat-messages').on("mouseenter", "a.chat-reply", function(e) {
        $(this).protipShow();
    });
    $('.chat-messages').on("mouseleave", "a.chat-reply", function(e) {
        $(this).protipHide();
    });
    $('.chat-messages').on('click', '.chat-hidden-msg', function(e) {
        e.preventDefault();
        $(this).hide();
        $(this).next('.chat-msg').css('display', 'block');
        return false;
    });
    $('.chat-messages').on('click', 'a.chat-reply', function(e) {
        e.preventDefault();
        var msg = $(this).parents('.chat-message');
        var msgid = msg.data('msgid');
        $(msg).addClass('chat-highlight-reply');
        $(msg).protipHide().protipHideInside();
        $('.chat-replyid').val(msgid);
        $('.chat-message-input:visible').focus();
        $('.chat-overlay').html('<i class="fas fa-reply"></i> Respondendo a <strong>' + $(msg).find('.chat-nick').text() + '</strong>');
        $('.chat-overlay-container').addClass('chat-replying').show();
        $('.chat-message-form').addClass('chat-replying');
        if (!msg.get(0).visible) {
            scrollToElement(msg.get(0), ".chat-messages", function() {
                checkBottom($('.chat-messages').get(0));
            }, 0, 0, 0);
        }
        return false;
    });
    $('.chat-messages').on('click', 'a.chat-replied', function(e) {
        e.preventDefault();
        $(this).parents('.chat-message').protipHide().protipHideInside();
        $('.chat-highlight').removeClass('chat-highlight');
        loadMessage($(this).data('replyid'));
        return false;
    });
    $('.chat-messages').on("mouseenter", "a.chat-remove", function(e) {
        $(this).protipShow();
    });
    $('.chat-messages').on("mouseleave", "a.chat-remove", function(e) {
        $(this).protipHide();
    });
    $('.chat-messages').on("mouseenter", "a.chat-restore", function(e) {
        $(this).protipShow();
    });
    $('.chat-messages').on("mouseleave", "a.chat-restore", function(e) {
        $(this).protipHide();
    });
    $('.chat-messages').on("click", 'a.chat-remove', function(e) {
        e.preventDefault();
        if (SOCKET) {
            SOCKET.emit('message-remove', $(this).parents(".chat-message").data('msgid'));
        }
        $(this).protipHide();
        return false;
    });
    $('.chat-messages').on("click", 'a.chat-restore', function(e) {
        e.preventDefault();
        if (SOCKET) {
            SOCKET.emit('message-restore', $(this).parents(".chat-message").data('msgid'));
        }
        $(this).protipHide();
        return false;
    });
    $('body').on('click', 'a.chat-overlay-close', function(e) {
        e.preventDefault();
        closeOverlay();
        return false;
    });
    $('.chat-bottom').on('click', 'a', function(e) {
        e.preventDefault();
        clearInterval(PAUSED_CHECK);
        PAUSED_CHECK = null;
        var last = getMessagesValue(SESSION_FIXED ? SESSION_ITEM : 0, 'last');
        if (last > 0) {
            loadMessage(last, false);
        } else {
            loadMessagesNewest();
        }
        return false;
    });
    $(".chat-join-form").submit(function(e) {
        e.preventDefault();
        if (intval($('.chat-join-form').data('step')) == 0) {
            $('.chat-join-form').data('step', "1");
            $('.chat-nick-join').hide();
            $('.chat-messages').hide();
            return $('.chat-nick-field').fadeIn(600, function() {
                $('.chat-nick-input:visible').focus();
            });
        }
        joinChat();
        return false;
    });
    $(".chat-message-input").on('keydown', function(e) {
        var keyCode = e.keyCode == 0 ? e.charCode : e.keyCode;
        var ignoreKeys = [8, 9, 13, 16, 17, 18, 19, 20, 27, 33, 34, 35, 36, 37, 38, 39, 40, 45, 46, 91, 92, 93, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 144, 145];
        if (!ignoreKeys.includes(keyCode) && !e.ctrlKey && !e.metaKey && !e.altKey && Date.now() > TYPING_LAST + 500) {
            SOCKET.emit('typing', SESSION_ITEM, SESSION_FIXED);
            TYPING_LAST = Date.now();
        }
    });
    if ($('.chat-main').length != 0) {
        try {
            // Use current domain for Socket.IO connection
            const socketServer = $('.chat-main').data('chat-server') || window.location.origin;
            SOCKET = io(socketServer, {
                'sync disconnect on unload': true,
                'query': {
                    ev: $('.chat-main').data('chat-ev') == 'pub' ? '' : $('.chat-main').data('chat-ev')
                }
            });
            SOCKET.on("user-typing", function(data) {
                if (SESSION_FIXED && SESSION_ITEM != data.item)
                    return;
                if (!SESSION_FIXED && data.item != 0)
                    return;
                if (data.userid == USERID && $('.chat-message-input').val() == '') {
                    TYPING.delete(data.userid);
                } else {
                    if (!TYPING.has(data.userid)) {
                        $('.users-list .userid-' + data.userid).addClass('user-typing');
                    }
                    TYPING.set(data.userid, [Date.now(), data.nick]);
                }
            });
            SOCKET.on("user-count", function(count) {
                if (count) {
                    var total = count.online;
                    if (count.insc > 0 || count.staff > 0) {
                        total = count.insc + count.staff;
                    }
                    $(".chat-user-count").toggleClass('user-count-zero', total === 0).toggleClass('user-count-one', total === 1).filter(':not(.user-count-extra)').text(total);
                }
            });
            SOCKET.on("message", function(data) {
                var current = ((SESSION_FIXED && SESSION_ITEM == data.item) || (!SESSION_FIXED && data.item == 0));
                if (data.item > 0) {
                    var m = getMessages(data.item);
                    m.count += 1;
                    setMessages(data.item, m);
                    updateMessageCount(data.item);
                    if (SESSION_FIXED && SESSION_ITEM == data.item) {
                        if ((!BOTTOM || PAUSED) && data.userid != USERID) {
                            unreadItem(data.item, data.msgid);
                        }
                    } else if (!SESSION_FIXED) {
                        unreadItem(data.item, data.msgid);
                    }
                }
                if (current) {
                    checkTyping(data.userid);
                    if (CHAT_PAGINATION_BOT === true) {
                        insertMessage(data);
                        scrollMessages();
                        if (data.item == 0 && data.level >= 2 && data.userid != USERID && NICK) {
                            var nick_regex = new RegExp('\\b(' + NICK + ')\\b','gi');
                            if (nick_regex.test(data.message) || (data.reply_nick && nick_regex.test(data.reply_nick))) {
                                notify(escapeString(data.nick) + ' mencionou você no chat', escapeString(data.message));
                            }
                        }
                    }
                    if (PAUSED && !SCROLLING) {
                        $('.chat-bottom').show();
                    }
                }
            });
            SOCKET.on("message-hidden", function(msgid) {
                var msg = $(".chat-message[data-msgid='" + msgid.toString() + "']").first();
                if (msg.length > 0) {
                    $(".chat-message[data-msgid='" + msgid + "']").addClass('chat-hidden');
                    $(".chat-messages").each(function() {
                        if (intval(msg.data('groupid')) > 0) {
                            $(this).find(".chat-message[data-groupid='" + msg.data('groupid').toString() + "']").first().removeClass('chat-grouped');
                        } else {
                            $(this).find(".chat-message[data-groupid='" + msgid.toString() + "']").first().removeClass('chat-grouped');
                        }
                    });
                }
                SOCKET.emit('update-message-count');
                SOCKET.emit('update-unread-count');
                scrollMessages();
            });
            SOCKET.on("message-removed", function(msgid) {
                var msg = $(".chat-message[data-msgid='" + msgid.toString() + "']").first();
                if (msg.length > 0) {
                    $(".chat-message[data-msgid='" + msgid + "']").remove();
                    $(".chat-messages").each(function() {
                        if (intval(msg.data('groupid')) > 0) {
                            $(this).find(".chat-message[data-groupid='" + msg.data('groupid').toString() + "']").first().removeClass('chat-grouped');
                        } else {
                            $(this).find(".chat-message[data-groupid='" + msgid.toString() + "']").first().removeClass('chat-grouped');
                        }
                    });
                    loadPaginationFirst(msgid);
                    loadPaginationLast(msgid);
                }
                SOCKET.emit('update-message-count');
                SOCKET.emit('update-unread-count');
                scrollMessages();
            });
            SOCKET.on("message-restored", function(msgid) {
                var msg = $(".chat-message[data-msgid='" + msgid.toString() + "']").first();
                if (msg.length > 0) {
                    $(".chat-message[data-msgid='" + msgid + "']").removeClass('chat-hidden').show();
                }
                SOCKET.emit('update-message-count');
                SOCKET.emit('update-unread-count');
                scrollMessages();
            });
            function format_info(message) {
                if (!message)
                    return '';
                var arr = message.split("\n");
                for (var i = 0; i < arr.length; i++) {
                    arr[i] = '<span class="desktop_inline tablet_inline mobile_block">' + arr[i].replace(/ \· /, '</span><span class="desktop_inline tablet_inline"> &middot; </span>') + '</span>';
                    if (i == 0) {
                        arr[i] = '<div class="bold fs13 mb5">' + arr[i] + '</div>';
                    } else {
                        arr[i] = '<div>' + arr[i] + '</div>';
                    }
                }
                return arr.join("\n");
            }
            SOCKET.on("info", function(message) {
                if (message && message.length !== 0) {
                    INFO = message;
                    $('#liveoffline-info').fadeOut(200, function() {
                        $('#liveoffline-info').html(format_info(message)).fadeIn(600);
                    });
                    if (!ONLINE) {
                        $('#liveoffline').fadeIn(600);
                    }
                } else {
                    if (INFO !== null) {
                        $('#liveoffline').fadeOut(200, function() {
                            $('#liveoffline-info').data('info', '');
                            $('#liveoffline-info').html('');
                        });
                    } else if (!ONLINE && $('#liveoffline-info').length && $('#liveoffline-info').data('info').length !== 0) {
                        $('#liveoffline-info').html(format_info($('#liveoffline-info').data('info')));
                        $('#liveoffline').fadeIn(600);
                    }
                    INFO = '';
                }
                if ($('#info-message').length > 0) {
                    if (message && message.length !== 0) {
                        $("#info-message").fadeOut(200, function() {
                            $(this).html(message).fadeIn(600);
                        });
                    } else {
                        $("#info-message").fadeIn(600);
                    }
                }
            });
            SOCKET.on("online", function(data) {
                var changed = ONLINE ? false : true;
                ONLINE = true;
                ONLINE_CALLBACKS.forEach(function(callback) {
                    callback(changed);
                });
                $('.live-offline').hide();
                $('#liveoffline').hide();
                $('#liveoffline-info').html('');
                $('#liveoffline-info').data('info', '');
                $('.live-online').fadeIn(600);
            });
            SOCKET.on("offline", function() {
                var changed = ONLINE ? true : false;
                ONLINE = false;
                ONLINE_CALLBACKS.forEach(function(callback) {
                    callback(changed);
                });
                $('.live-online').hide();
                if (changed) {
                    removeLivePlayer();
                    $('#liveonline').hide();
                    SOCKET.emit('update-info');
                }
                $('.live-offline').fadeIn(600);
            });
            SOCKET.on("disabled", chatDisabled);
            SOCKET.on("enabled", chatEnabled);
            SOCKET.on("set-anonymous-cookie", function(cookieData) {
                // Criar cookie anônimo no navegador
                document.cookie = cookieData.name + "=" + cookieData.value + "; expires=" + cookieData.expires.toUTCString() + "; path=/; SameSite=Lax";
                console.log("🍪 Cookie anônimo definido:", cookieData.name);
            });
            SOCKET.on("show", function(css) {
                if (!(css instanceof Array)) {
                    css = new Array(css);
                }
                for (var i = css.length - 1; i >= 0; i--) {
                    css[i] = '.live-hidden-' + css[i];
                }
                ;$(css.join(',')).fadeIn(600);
            });
            SOCKET.on("hide", function(css) {
                if (!(css instanceof Array)) {
                    css = new Array(css);
                }
                for (var i = css.length - 1; i >= 0; i--) {
                    css[i] = '.live-hidden-' + css[i];
                }
                ;$(css.join(',')).fadeOut(200);
            });
            SOCKET.on("lower", function(data) {
                LOWER = data;
                showLower();
            });
            SOCKET.on("timer", function(timer, seconds) {
                clearTimeout(COUNTDOWN);
                COUNTDOWN = null;
                if (!timer) {
                    $('.chat-timer').fadeOut(200, function() {
                        $(this).html('');
                    });
                } else {
                    if (!seconds) {
                        seconds = (timer - Date.now()) / 1000;
                    }
                    runCountdown(seconds * 1000);
                    $(".chat-timer").fadeIn(600);
                }
            });
            SOCKET.on("video-add", function(html) {
                $('#live-hidden-videos .clear').remove();
                $('#live-hidden-videos').fadeIn(600);
                var html = $(html).hide();
                $('#live-hidden-videos').append(html);
                $('#live-hidden-videos').append('<div class="clear">&nbsp;</div>');
                html.fadeIn(600);
            });
            SOCKET.on("video-rem", function(ids) {
                if (!(ids instanceof Array)) {
                    ids = new Array(ids);
                }
                for (var i = ids.length - 1; i >= 0; i--) {
                    $('#video-item-' + ids[i]).fadeOut(200, function() {
                        $(this).remove();
                        if ($('#live-hidden-videos .video').length == 0) {
                            $('#live-hidden-videos').fadeOut(200);
                        }
                    });
                }
                ;
            });
            SOCKET.on("gallery-add", function(html) {
                $('#live-hidden-galleries .clear').remove();
                $('#live-hidden-galleries').fadeIn(600);
                var html = $(html).hide();
                $('#live-hidden-galleries').append(html);
                $('#live-hidden-galleries').append('<div class="clear">&nbsp;</div>');
                html.fadeIn(600);
            });
            SOCKET.on("gallery-rem", function(ids) {
                if (!(ids instanceof Array)) {
                    ids = new Array(ids);
                }
                for (var i = ids.length - 1; i >= 0; i--) {
                    $('#gallery-item-' + ids[i]).fadeOut(200, function() {
                        $(this).remove();
                        if ($('#live-hidden-galleries .galeria').length == 0) {
                            $('#live-hidden-galleries').fadeOut(200);
                        }
                    });
                }
                ;
            });
            SOCKET.on('unread-count', function(arr) {
                arr.forEach(function(data) {
                    setMessages(data.item, data);
                    updateUnreadCount(data.item);
                    updateUnreadGroupCount(data.item);
                    updateMessageCount(data.item);
                });
            });
            SOCKET.on('message-count', function(arr) {
                arr.forEach(function(data) {
                    setMessagesValue(data.item, 'count', data.count);
                    updateMessageCount(data.item);
                });
            });
            SOCKET.on("connect", function() {
                $('.chat-loading').hide();
                if (USERID || NICK) {
                    joinChat();
                } else {
                    loadMessagesNewest();
                }
                SOCKET.emit('update-online');
                SOCKET.emit('update-disabled');
                SOCKET.emit('update-show');
                SOCKET.emit('update-info');
                SOCKET.emit('timers');
                SOCKET.emit('lowers');
                SOCKET.emit('update-message-count');
            });
            SOCKET.on("reload", function() {
                window.location.reload(true);
            });
        } catch (error) {
            console.error(error);
            if (!$('body').hasClass('virtual-ead') && $('#liveplayer').data('src')) {
                ONLINE = true;
                ONLINE_CALLBACKS.forEach(function(callback) {
                    callback(true);
                });
                $('.live-offline').hide();
                $('#liveoffline').hide();
                $('#liveoffline-info').html('');
                $('#liveoffline-info').data('info', '');
                $('.live-online').fadeIn(600);
                loadLivePlayer($('#liveplayer').data('src'), $('#liveplayer').data('title'));
            }
            if (ONLINE) {
                $('.chat-loading').html('<div class="chat-error">Não foi possível conectar<br>Tente novamente mais tarde</div>');
            } else {
                $('.chat-loading').html('<div class="chat-error">Não foi possível conectar<br>Tente novamente mais tarde</div>');
                $('.chat-join-form').hide();
            }
            $('.liveconnection-info').html('Seu progresso não será salvo, por favor tente mais tarde');
            $('#liveconnection').fadeIn();
        }
    } else {
        $('.chat-loading').hide();
    }
});
;var VIRTUAL;
var VIRTUAL_FORUM;
var VIRTUAL_EAD;
var VIRTUAL_EDUCATIONAL;
var VIRTUAL_CHAT;
var VIRTUAL_CHAT_ADMIN;
var VIRTUAL_CONFS;
var VIRTUAL_DELAY = 0;
var FIXED_LIVE_URL = false;
var EV;
var EV_CATEGORY = EV_CATEGORY || null;
var SESSIONS = SESSIONS || null;
var SESSIONS_UPDATED = new Date();
var SALAS = ['sala', 'turma', 'grupo', 'projeto', 'atendimento', 'oracao', 'rede', 'professor', 'equipe', 'reuniao', 'breakout'];
var SALAS_TIMER = ['turma', 'grupo', 'projeto', 'atendimento', 'oracao', 'rede', 'breakout'];
var SALAS_LIMIT = ['professor'];
var SALAS_UNIFIED = false;
var SALAS_ACTIVE = false;
var USER_COUNT = {
    total: 0,
    online: 0,
    offline: 0,
    insc: 0,
    staff: 0,
    sala: 0,
    professor: 0,
    turma: 0,
    grupo: 0,
    projeto: 0,
    atendimento: 0,
    oracao: 0,
    rede: 0,
    equipe: 0,
    reuniao: 0,
    breakout: 0
};
var USERS = {};
var POPUPS = 0;
var POPUPS_CHECK = null;
var SCHEDULE_CHECK = null;
var SCHEDULE_CALLBACKS = [];
var DROPBOX = new Map();
var DROPBOX_DATA_CALLBACKS = [];
var SCHEDULE_DATA_CALLBACKS = [];
function openedPopup(opened) {
    if (opened && !opened.closed) {
        POPUPS += 1;
        if (POPUPS_CHECK === null) {
            POPUPS_CHECK = setInterval(checkPopups, 1000);
        }
    }
}
function closedPopup(opened) {
    if (opened && opened.closed) {
        POPUPS -= 1;
        if (POPUPS <= 0) {
            POPUPS = 0;
            clearInterval(POPUPS_CHECK);
            POPUPS_CHECK = null;
        }
        return true;
    }
    return false;
}
function checkPopups() {}
function removePopups() {}
function loadExtra() {
    if (EV) {
        $.ajaxSetup({
            cache: false
        });
        $.get("/vr/" + EV + "/extra", function(data) {
            if (data) {
                var updated = false;
                Object.keys(data).forEach(function(key) {
                    if (key == 'nick') {
                        if (NICK != data[key]) {
                            updated = true;
                            NICK = data[key];
                        }
                    } else {
                        if ((!EXTRA[key] && data[key]) || (EXTRA[key] && EXTRA[key].toString() !== data[key].toString())) {
                            updated = true;
                            EXTRA[key] = data[key];
                        }
                    }
                });
                if (SOCKET && updated) {
                    SOCKET.emit('extra', NICK, EXTRA);
                    SOCKET.emit('update-conf');
                }
            }
        }, 'json');
    }
}
function checkCookie() {
    if (!document.cookie.split(';').some(function(item) {
        return item.trim().indexOf('biblos360_site_inscrito=') == 0;
    })) {
        window.location = '/vr/expirar';
    }
}
function checkTime() {
    $.ajaxSetup({
        cache: false
    });
    $.get("/vr/timestamp", function(data) {
        if (data) {
            if (intval(Date.now() / 1000) < intval(data) - 5 * 60 || intval(Date.now() / 1000) > intval(data) + 5 * 60) {
                window.location = '/vr/sincronizar';
            }
        }
    });
}
function isFullScreen() {
    if (window.navigator.standalone || (document.fullscreenElement && document.fullscreenElement !== null) || (document.fullScreenElement && document.fullScreenElement !== null) || (document.mozFullScreen || document.webkitIsFullScreen || document.msFullscreenElement) || (!window.screenTop && !window.screenY)) {
        return true;
    } else {
        return false;
    }
}
function isMacintosh() {
    return navigator.platform.indexOf('Mac') > -1;
}
function userData(data) {
    data.sort = sortData(data);
    data.sortgrupo = sortData(data, 'grupo');
    data.sortrede = sortData(data, 'rede');
    data.sortbreakout = sortBreakoutData(data);
    data.usericon = "fas fa-fw fa-user";
    data.userclass = "";
    data.rowclass = "";
    if (!data.userid) {
        data.rowclass += "chat-offline ";
    } else {
        data.rowclass += "chat-online ";
    }
    if (data.extra.sexo === 1) {
        data.userclass += "chat-male ";
    } else if (data.extra.sexo === 2) {
        data.userclass += "chat-female ";
    }
    if (data.level >= 1) {
        data.extra.uf = data.extra.equipe ? data.extra.equipe : 'Biblos360';
        if (data.level == 3) {
            data.usericon = "fas fa-fw fa-crown";
            data.userclass += "chat-admin ";
        } else if (data.level == 2) {
            data.usericon = "fas fa-fw fa-crown";
            data.userclass += "chat-monitor ";
        } else if (data.level == 1) {
            data.userclass += "chat-volunteer ";
        }
    } else {
        if (data.extra.extid) {
            data.userclass += "chat-insc ";
        } else {
            data.userclass += "chat-pub ";
        }
    }
    if (data.extra.turma) {
        if (data.extra.turma != data.extra.equipe) {
            data.userclass += "chat-turma-" + escapeString(data.extra.turma.toLowerCase()) + " ";
        } else if (data.extra.equipe) {
            data.userclass += "chat-equipe ";
        }
    }
    if (data.extra.parceiro) {
        data.userclass += "chat-parceiro ";
    }
    data.sub = data.extra.uf ? data.extra.uf : '';
    data.rowclass += (data.userid ? ('userid-' + data.userid.toString() + ' ') : '');
    data.rowclass += (data.extra.extid ? ('extid-' + data.extra.extid.toString() + ' ') : '');
    data.rowclass += (data.extra.checkin ? 'user-checked ' : '');
    data.rowclass += (data.extra.vote ? 'user-voted ' : '');
    data.rowclass += (data.extra.watcher ? 'user-' + data.extra.watcher + ' ' : '');
    data.rowclass += (data.extra.evaluation == 1 ? 'user-evaluating ' : (data.extra.evaluation == 2 ? 'user-evaluated ' : ''));
    data.rowclass += (data.extra.review == 1 ? 'user-reviewing ' : (data.extra.review == 2 ? 'user-reviewed ' : ''));
    data.rowclass += (data.extra.popup == 1 ? 'user-popuping ' : (data.extra.popup == 2 ? 'user-popupped ' : ''));
    return data;
}
function userMessage(data) {
    var msg = '';
    msg += '<li class="' + data.rowclass + ' protip-target" data-sort="' + (data.sort ? data.sort : '') + '" data-sortgrupo="' + (data.sortgrupo ? data.sortgrupo : '') + '" data-sortrede="' + (data.sortrede ? data.sortrede : '') + '" data-sortbreakout="' + (data.sortbreakout ? data.sortbreakout : '') + '" data-userid="' + (data.userid ? data.userid : '') + '" data-extid="' + (data.extra.extid ? data.extra.extid : '') + '" data-conf="' + (data.extra.conf ? data.extra.conf : '') + '" data-breakout="' + (data.extra.breakout ? data.extra.breakout : '') + '">';
    msg += '<span class="chat-user ' + data.userclass + '">';
    msg += '<span class="chat-label ' + (data.extra.breakout > 0 ? (data.extra.breakout % 2 == 0 ? ' chat-breakout-even' : ' chat-breakout-odd') : '') + '">';
    if (data.userid) {
        msg += '<span class="chat-watcher" data-watcher="' + data.extra.watcher + '" data-watcher-item="' + data.extra.watcher_item + '">';
        msg += '<span class="chat-watcher-live"><i class="fas fa-video"></i></span>';
        msg += '<span class="chat-watcher-video"><i class="fas fa-play"></i></span>';
        msg += '<span class="chat-watcher-conf"><i class="fas fa-comments"></i></span>';
        msg += '<span class="chat-watcher-forum"><i class="fas fa-comments-alt"></i></span>';
        msg += '</span>';
    }
    if (data.extra.turma && data.extra.turma.length == 1) {
        msg += '<span class="chat-turma">' + escapeString(data.extra.turma) + '</span>';
    } else {
        msg += '<span class="chat-turma chat-icon"><i class="' + data.usericon + '"></i></span>';
    }
    if (data.extra.grupo) {
        msg += '<span class="chat-grupo">' + escapeString(data.extra.grupo) + '</span>';
    }
    if (data.extra.rede) {
        msg += '<span class="chat-rede">' + escapeString(data.extra.rede) + '</span>';
    }
    if (data.extra.breakout) {
        msg += '<span class="chat-breakout">' + data.extra.breakout + '</span>';
    }
    msg += '</span>';
    msg += '<a href="#" class="users-action"><span class="chat-nick">' + h(escapeString(data.nick)) + '</span></a>';
    if (data.extra.parceiro && data.level <= 1) {
        msg += '<span class="chat-extra-parceiro" title="Parceiro do Biblos360"><i class="fas fa-star"></i></span>';
    }
    if (data.sub) {
        msg += '<span class="chat-extra">' + h(data.sub) + '</span>';
    }
    msg += '<span class="chat-extra-watcher">' + h(data.extra.watcher_item && data.extra.watcher_item > 0 ? data.extra.watcher_item : '') + '</span>';
    if (data.userid) {
        msg += '<span class="chat-checks">';
        msg += '<span class="chat-check chat-checkin-check chat-vote-check chat-evaluation-check chat-review-check chat-popup-check"><i class="fas fa-check"></i></span>';
        msg += '</span>';
        msg += '<span class="chat-typing"><span></span><span></span><span></span></span>';
    }
    msg += '</span>';
    msg += '</li>';
    return msg;
}
function sortData(data, extra) {
    var sort = "";
    extra = extra || 'turma';
    if (data.level == 3) {
        if (!data.extra[extra]) {
            sort += '0';
        } else {
            sort += '2';
        }
    } else if (data.level == 2) {
        if (!data.extra[extra]) {
            sort += '1';
        } else {
            sort += '2';
        }
    } else if (data.level == 1) {
        sort += '2';
    } else {
        sort += '2';
    }
    if (extra == 'turma') {
        if (data.extra.turma && data.extra.turma.length == 1) {
            sort += '0' + escapeString(data.extra.turma.toLowerCase());
        } else {
            sort += '1';
        }
    } else {
        if (data.extra[extra]) {
            sort += data.extra[extra].toString().padStart(3, "0");
        } else {
            sort += ''.padStart(3, "0");
        }
    }
    if (data.level >= 2) {
        sort += '0';
    } else {
        sort += '1';
    }
    sort += escapeString(data.nick);
    return sort;
}
function sortBreakoutData(data) {
    var sort = "";
    sort += data.extra.breakout.toString().padStart(3, "0");
    sort += escapeString(data.nick);
    return sort;
}
function updateUsersCount(offline) {
    if (offline) {
        USER_COUNT.offline = $('.users-list li.chat-offline').length;
        USER_COUNT.total = USER_COUNT.offline + USER_COUNT.online;
    }
    for (const c in USER_COUNT) {
        $(".user-count-" + c).addClass('user-count').toggleClass('user-count-zero', USER_COUNT[c] === 0).toggleClass('user-count-one', USER_COUNT[c] === 1).filter(':not(.user-count-extra)').text(USER_COUNT[c]);
    }
}
function updateUsers(data, sort) {
    var offline = false;
    if (data.userid) {
        $('.users-list .userid-' + data.userid).remove();
        if (data.extra.extid && $('.users-list .extid-' + data.extra.extid + '.chat-offline').length > 0) {
            $('.users-list .extid-' + data.extra.extid + '.chat-offline').remove();
            offline = true;
        }
    } else if (data.extra.extid) {
        if ($('.users-list .extid-' + data.extra.extid + ':not(.chat-offline)').length > 0) {
            return;
        }
        $('.users-list .extid-' + data.extra.extid).remove();
        offline = true;
    } else {
        return;
    }
    if (SALAS_UNIFIED) {
        updateUsersUnified(data, sort);
    } else {
        updateUsersDivided(data, sort);
    }
    updateUsersCount(offline);
}
function updateUsersUnified(data, sort) {
    $(data.rowclass).remove();
    $('.users-list-sala').append(userMessage(userData(data)));
    if (sort) {
        sortUsers('sala');
    }
}
function updateUsersDivided(data, sort) {
    var user = $(userMessage(userData(data)));
    if (data.userid) {
        if (data.extra.conf) {
            user.appendTo($('.users-list-' + data.extra.conf));
        } else {
            user.appendTo($('.users-list-sala'));
        }
        if (sort) {
            sortUsers(data.extra.conf ? data.extra.conf : 'sala');
        }
    } else if (data.extra.extid) {
        user.appendTo($('.users-list-offline'));
        if (sort) {
            sortUsers('offline');
        }
    }
}
function sortUsers(list) {
    if (SALAS_UNIFIED) {
        var lists = ['sala'];
    } else {
        if (list) {
            var lists = [list];
        } else {
            var lists = SALAS;
        }
    }
    var ul = $('.users-list');
    var sd = 'sort';
    if (ul.hasClass('users-label-grupo')) {
        sd = 'sortgrupo'
    } else if (ul.hasClass('users-label-rede')) {
        sd = 'sortrede';
    }
    var collator = new Intl.Collator('pt-BR');
    for (var i = lists.length - 1; i >= 0; i--) {
        var wrapper = $('.users-list-' + lists[i]);
        var users = wrapper.children();
        [].sort.call(users, function(a, b) {
            if (lists[i] == 'breakout') {
                return collator.compare($(a).data('sortbreakout'), $(b).data('sortbreakout')) >= 0 ? 1 : -1;
            } else if (lists[i] == 'grupo' || lists[i] == 'projeto' || lists[i] == 'atendimento') {
                return collator.compare($(a).data('sortgrupo'), $(b).data('sortgrupo')) >= 0 ? 1 : -1;
            } else if (lists[i] == 'rede' || lists[i] == 'oracao') {
                return collator.compare($(a).data('sortrede'), $(b).data('sortrede')) >= 0 ? 1 : -1;
            } else {
                return collator.compare($(a).data(sd), $(b).data(sd)) >= 0 ? 1 : -1;
            }
        });
        users.each(function() {
            wrapper.append(this);
        });
    }
}
function showConference(data, only_buttons, update) {
    var none = true;
    for (const [conf,val] of Object.entries(data)) {
        if (!SALAS.includes(conf)) {
            continue;
        }
        var button = true;
        if (val) {
            if (conf == 'equipe' && !EXTRA.level) {
                button = false;
            }
            if ((conf == 'grupo' || conf == 'projeto' || conf == 'atendimento') && !EXTRA.grupo) {
                button = false;
            }
            if ((conf == 'rede' || conf == 'oracao') && !EXTRA.rede) {
                button = false;
            }
            if (conf == 'turma' && !EXTRA.turma) {
                button = false;
            }
            if (conf == 'professor' && data['professor_limit']) {
                data['professor_limit'] = data['professor_limit'].replace(/\s*,\s*/ig, ',').toLowerCase();
                if (data['professor_limit'].match(/^\d+(,\d+)*$/)) {
                    if (!EXTRA.extid || !data['professor_limit'].split(',').includes(EXTRA.extid.toString())) {
                        button = false;
                    }
                } else {
                    if (!EXTRA.turma || !data['professor_limit'].split(',').includes(EXTRA.turma.toLowerCase())) {
                        if (!EXTRA.level || !data['professor_limit'].split(',').includes(EXTRA.equipe.toLowerCase())) {
                            button = false;
                        }
                    }
                }
            }
            if (button) {
                none = false;
                setTimeout(delayedConference, (!update ? VIRTUAL_DELAY * 1000 : 0), conf);
            } else {
                $('.confs .live-hidden-conf-' + conf).fadeOut(200);
            }
            if (!only_buttons) {
                $('.users-list .live-hidden-conf-' + conf).fadeIn(600);
            }
        } else {
            $('.live-hidden-conf-' + conf).fadeOut(200);
            closeConference(conf);
        }
    }
    if (none) {
        SALAS_ACTIVE = false;
        $('.confs').fadeOut(200);
    }
    VIRTUAL_CONFS = data;
}
function delayedConference(conf) {
    if (!VIRTUAL_CONFS || VIRTUAL_CONFS[conf]) {
        $('.confs .live-hidden-conf-' + conf).fadeIn(600);
        SALAS_ACTIVE = true;
        $('.confs').fadeIn(600);
    }
}
function closeConference(conf) {
    if (!conf || conf == EXTRA.conf) {
        soundAlert();
        notify("Fechando em 10 segundos...");
        setTimeout(closeColorbox, 10000);
    }
}
function closeColorbox() {
    $.colorbox.close();
}
function resizeColorbox() {
    $.colorbox.resize({
        width: '90%',
        height: '90%'
    });
}
function loadSessions() {
    if (EV && (!SESSIONS || !today(SESSIONS_UPDATED))) {
        $.ajaxSetup({
            cache: false
        });
        $.get("/vr/" + EV + "/sessoes", function(data) {
            if (data) {
                SESSIONS = data;
            } else {
                SESSIONS = {};
            }
            SESSIONS_UPDATED = new Date();
            updateSchedule();
        }, 'json');
    } else if (SESSIONS) {
        updateSchedule();
    }
}
function loadUsers() {
    if (EV && EV != 'pub' && !VIRTUAL_EAD) {
        USERS = {};
        $.ajaxSetup({
            cache: false
        });
        $.get("/vr/" + EV + "/participantes", function(arr) {
            if (arr && arr.length > 0) {
                arr.forEach(function(data) {
                    USERS[data.id] = {
                        room: 'ev:' + EV,
                        nick: data.nick,
                        level: data.level,
                        extra: {
                            extid: data.id,
                            equipe: data.equipe,
                            sexo: data.sexo,
                            uf: data.uf,
                            parceiro: data.parceiro,
                            turma: data.turma,
                            grupo: data.grupo,
                            rede: data.rede,
                            watcher: null,
                            watcher_item: null,
                            conf: null,
                            checkin: 0,
                            breakout: 0,
                            evaluation: 0,
                            review: 0,
                            popup: 0,
                            vote: 0
                        }
                    };
                });
                for (const id in USERS) {
                    updateUsers(USERS[id], false);
                }
                sortUsers('offline');
                $('.live-hidden-offline').fadeIn(600);
            }
        }, 'json');
    }
}
function updateSchedule() {
    if (SESSION_FIXED)
        return;
    clearTimeout(SCHEDULE_CHECK);
    SCHEDULE_CHECK = null;
    if (!SESSIONS || !SOCKET) {
        SCHEDULE_CHECK = setTimeout(updateSchedule, 1000);
        return;
    }
    var now = Date.now();
    var next;
    var before = SESSION_ITEM;
    var after;
    var live_url;
    var live_title;
    var live_ends;
    $.each(SESSIONS, function(item, sess) {
        if (!sess)
            return;
        if (sess['multiday'] > 0)
            return;
        if (sess['live'] == 0)
            return;
        var starts_at = intval(sess['starts_at_timestamp'] * 1000);
        var ends_at = intval(sess['ends_at_timestamp'] * 1000);
        if (sess['live_url'] && now >= starts_at - 60 * 60 * 1000 && (!live_ends || now > live_ends)) {
            if (ONLINE || (!ONLINE && now < ends_at)) {
                live_url = sess['live_url'];
                live_title = sess['title'];
                live_ends = ends_at;
            }
        }
    });
    $.each(SESSIONS, function(item, sess) {
        if (!sess)
            return;
        if (sess['multiday'] > 0)
            return;
        if (sess['live'] == 0 && sess['conf'] == 0 && sess['talk'] == 0)
            return;
        var starts_at = intval(sess['starts_at_timestamp'] * 1000);
        var ends_at = intval(sess['ends_at_timestamp'] * 1000);
        if (now >= starts_at && now < ends_at) {
            after = intval(sess['item']);
            next = ends_at;
            return false;
        }
    });
    if (!next) {
        $.each(SESSIONS, function(item, sess) {
            if (!sess)
                return;
            if (sess['multiday'] > 0)
                return;
            if (sess['live'] == 0 && sess['conf'] == 0 && sess['talk'] == 0)
                return;
            var starts_at = intval(sess['starts_at_timestamp'] * 1000);
            var ends_at = intval(sess['ends_at_timestamp'] * 1000);
            if (now < starts_at && (!next || starts_at < next)) {
                next = starts_at;
                if (sess['live_url'] && !live_ends) {
                    live_url = sess['live_url'];
                    live_title = sess['title'];
                }
            }
        });
    }
    SESSION_ITEM = after ? after : 0;
    if (live_url && !FIXED_LIVE_URL) {
        $('#liveplayer').data('src', live_url);
        $('#liveplayer').data('title', live_title);
        if (ONLINE) {
            loadLivePlayer(live_url, live_title);
        }
    }
    if (next) {
        SCHEDULE_CHECK = setTimeout(updateSchedule, (next - now + 1000));
    }
    SCHEDULE_CALLBACKS.forEach(function(callback) {
        callback(after, before);
    });
}
function updateScheduleFiles() {
    var max_shown = 4;
    var re_ext = /(?:\.([^.]+))?$/;
    var re_src = /\.(pdf|docx)$/i;
    $(".virtual-session-item-files ul").hide();
    $(".virtual-session-item-files a[data-folder='true']").each(function() {
        var n = $(this).data('name');
        var a = $(this).data('label');
        var ul = $(this).closest('ul');
        var p = n.split('/').map(function(pn) {
            return pn.trim();
        });
        $(this).parent().addClass('dropbox-source').hide();
        $(ul).find('.dropbox-loaded').remove();
        DROPBOX.forEach( (dict, path) => {
            var filename = path.replace(/^.*[\\\/]/, '');
            if (p.every( (pn, i) => {
                return (pn == dict.folders[i]) || (pn == '*' && dict.folders.length == 0);
            }
            )) {
                var e = re_ext.exec(filename)[1];
                var found = false;
                if (['pdf', 'docx', 'doc', 'xlsx', 'xls', 'pptx', 'ppt'].includes(e) && ((e != 'pdf' && DROPBOX.has(path.replace('.' + e, '.pdf'))) || (e != 'docx' && e != 'pdf' && DROPBOX.has(path.replace('.' + e, '.docx')) && !DROPBOX.has(path.replace('.' + e, '.pdf'))))) {
                    found = true;
                }
                if (!found) {
                    $(ul).append('<li class="welcome-tooltip-item-files dropbox-loaded"><a href="#virtual-download" data-label="' + j(a) + '" data-name="' + j(path) + '" data-folder="false" data-pt-title="Após clicar aqui, verifique os downloads do seu navegador, pois pode ser que já foi baixado rapidamente sem você perceber" data-pt-icon="fas fa-info-circle" class="tooltip"><img src="/img/dropbox/' + dropbox_file_icon(e) + '.gif" style="width: 14px !important; height: 14px !important; max-width: 14px !important; vertical-align: -3px; margin: 0 6px 0 2px; float: left"><span style="display: block; overflow: hidden">' + (a ? '<strong>' + h(a) + ':</strong> ' : '') + h(filename) + '</span></a></li>');
                }
            }
        }
        );
    });
    $(".virtual-session-item-files a[data-name]").each(function() {
        var n = $(this).data('name');
        var e = re_ext.exec(n)[1];
        DROPBOX.forEach( (dict, path) => {
            var filename = path.replace(/^.*[\\\/]/, '');
            if (path == n || filename == n) {
                $(this).attr('href', dict.href);
                $(this).removeClass('scroll').removeClass('notfound');
                $(this).removeData('name').removeAttr('data-name');
                $(this).removeData('folder').removeAttr('data-folder');
                $(this).removeData('label').removeAttr('data-label');
                if (e == 'pdf' || e == 'docx') {
                    ['pdf', 'docx', 'doc', 'xlsx', 'xls', 'pptx', 'ppt'].forEach(ext => {
                        if (e == ext)
                            return;
                        var v = n.replace(re_src, '.' + ext);
                        if (DROPBOX.has(v)) {
                            $(this).parent().append('<a href="' + DROPBOX.get(v).href + '" class="nowrap"><img src="/img/dropbox/' + dropbox_file_icon(ext) + '.gif" style="width: 14px !important; height: 14px !important; max-width: 14px !important; vertical-align: -3px; margin: 0 6px 0 2px; float: left"><span style="display: block; overflow: hidden">' + ext + '</span></a>');
                        }
                    }
                    );
                }
            }
        }
        );
    });
    $(".virtual-session-item-files ul").each(function() {
        $(this).find(".virtual-session-item-files-more").remove();
        var c = $(this).children().not('.virtual-session-item-files-more').not('.dropbox-source').length;
        if (c > max_shown) {
            $(this).children().not('.dropbox-source').each(function(index) {
                if (index > max_shown - 1) {
                    $(this).hide();
                } else {
                    $(this).show();
                }
            });
            $(this).append('<li class="virtual-session-item-files-more"><a href="#">mostrar mais ' + (c - max_shown) + ' arquivo' + ((c - max_shown) > 1 ? 's' : '') + '</a></li>');
        } else {
            $(this).children().not('.dropbox-source').show();
        }
    });
    $(".virtual-session-item-files .spinner").remove();
    $(".virtual-session-item-files ul").show();
}
function loadDropbox() {
    if (EV) {
        $.ajaxSetup({
            cache: false
        });
        $.get("/vr/" + EV + "/dropbox", function(data) {
            if (data) {
                DROPBOX = new Map();
                $(data).find('.dropbox_file a').each(function() {
                    var key = ($(this).data('folders') ? $(this).data('folders') + '/' : '') + $(this).text();
                    DROPBOX.set(key, {
                        href: $(this).attr('href'),
                        folders: $(this).data('folders').split('/').filter(n => n),
                        filename: $(this).attr('download')
                    });
                });
            }
            DROPBOX_DATA_CALLBACKS.forEach(function(callback) {
                callback(data);
            });
        }, 'html');
    }
}
function loadSchedule() {
    if (EV) {
        $.ajaxSetup({
            cache: false
        });
        $.get("/vr/" + EV + "/programa", function(data) {
            data = data.trim();
            SCHEDULE_DATA_CALLBACKS.forEach(function(callback) {
                callback(data);
            });
        }, 'html');
    }
}
function getSessionIcon(item, category) {
    if (category == 'live')
        return 'fas fa-video';
    if (category == 'talk')
        return 'fas fa-chair';
    if (category == 'video')
        return 'fas fa-play';
    if (category == 'rec')
        return 'fas fa-play';
    if (category == 'conf')
        return 'fas fa-comments';
    if (category == 'forum')
        return 'fas fa-comment-alt';
    return '';
}
function getSessionTitle(item, category) {
    var title = '';
    var sess = false;
    if (item && SESSIONS && SESSIONS[item]) {
        sess = SESSIONS[item];
    }
    if (sess) {
        title += '<div class="mb5">' + sess['title'] + '</div>';
        if (sess['subtitle'] && sess['subtitle'].length > 0) {
            title += '<div style="opacity: 0.6; font-size: 0.8em; text-transform: uppercase">' + sess['subtitle'] + '</div>';
        }
    } else if (item && item > 0) {
        title += '<div class="mb5">SESSÃO ' + item.toString() + '</div>';
    }
    return title;
}
function joinedChat(data) {
    if ((VIRTUAL_CHAT || VIRTUAL_FORUM) && !VIRTUAL_CHAT_ADMIN) {
        $(".chat-message-input").focus();
    }
    if (!VIRTUAL_FORUM) {
        SOCKET.emit('users');
    }
}
function chatMessageReplyTooltip(data) {
    return VIRTUAL_FORUM ? false : true;
}
function chatMessageTime(data) {
    if (!data.ts)
        return '';
    var msg = '';
    var s = data.date.toLocaleDateString();
    var t = CHAT_DATE_FORMAT.format(data.date) + ' às ' + CHAT_TIME_FORMAT.format(data.date);
    var c = 'tooltip';
    var p = ' data-pt-title="' + t + '" data-pt-position="top" data-pt-delay-in="600"';
    if (VIRTUAL_FORUM) {
        if (today(data.date)) {
            if (Date.now() - data.date.getTime() < 60000) {
                c += ' timeago';
            }
            s = 'Hoje às ' + CHAT_TIME_FORMAT.format(data.date);
        } else if (yesterday(data.date)) {
            s = 'Ontem às ' + CHAT_TIME_FORMAT.format(data.date);
        }
    } else if (VIRTUAL_CHAT_ADMIN) {
        s = '<i class="fas fa-clock"></i>';
    } else {
        s = CHAT_TIME_FORMAT.format(data.date);
        c = '';
        p = '';
    }
    msg += '<time class="chat-ts ' + c + '" datetime="' + data.date.toISOString() + '" ' + p + '>' + s + '</time>';
    return msg;
}
function chatMessageQuote(data) {
    var msg = '';
    if (VIRTUAL_FORUM) {
        msg += '<span class="chat-quote-message">' + (data.reply_message_html ? data.reply_message_html : h(replaceUrl(escapeString(data.reply_message)))) + '</span>';
    }
    return msg;
}
function chatDisabled() {
    if (VIRTUAL_FORUM) {
        chatEnabled();
    } else {
        $('.chat-join-form').hide();
        $('.chat-messages').addClass('chat-messages-hidden');
        $('.chat-message-input').hide();
        $('.chat-overlay-container.chat-replying').toggle();
        $('.chat-disabled').show();
        $('.chat-main').fadeIn(600);
    }
}
TEST_MESSAGES = null;
function testMessages() {
    if (TEST_MESSAGES) {
        clearInterval(TEST_MESSAGES);
        TEST_MESSAGES = null;
    } else {
        TEST_MESSAGES = setInterval(function() {
            $('.chat-message-input:visible').val(new LoremIpsum().sentence(5, 30));
            $('.chat-message-form:visible').submit();
        }, 2000);
    }
}
function onlineUpdated(changed) {
    loadSessions();
}
function dropboxDataUpdated(data) {
    updateScheduleFiles();
}
function scheduleDataUpdated(data) {
    loadSessions();
}
function updateMarkdown() {
    var md = window.markdownit({
        breaks: true,
        linkify: true
    }).disable(['code', 'fence', 'heading', 'html_block', 'table', 'html_inline']);
    $('.markdown').not('.markdowned').each(function() {
        $(this).addClass('markdowned').html(md.render($(this).text()));
    });
}
ONLINE_CALLBACKS.push(onlineUpdated);
DROPBOX_DATA_CALLBACKS.push(dropboxDataUpdated);
SCHEDULE_DATA_CALLBACKS.push(scheduleDataUpdated);
$(document).ready(function() {
    checkTime();
    EV = $('#ev').val();
    VIRTUAL = $('body').hasClass('virtual');
    VIRTUAL_FORUM = $('body').hasClass('virtual-forum');
    VIRTUAL_EAD = $('body').hasClass('virtual-ead');
    VIRTUAL_CONTINUOUS = $('body').hasClass('virtual-continuous');
    VIRTUAL_EDUCATIONAL = $('body').hasClass('virtual-educational');
    VIRTUAL_CHAT = $('body').hasClass('virtual-chat');
    VIRTUAL_CHAT_ADMIN = $('body').hasClass('virtual-chat-admin');
    updateMarkdown();
    autosize($('textarea.autoresize'));
    $.protip({
        selector: '.tooltip',
        iconTemplate: '<i class="{icon}"></i>',
        defaults: {
            position: 'top',
            scheme: 'black',
            size: 'small',
            mixin: 'css-bold css-no-transition'
        }
    });
    if (isMacintosh()) {
        $('.mac').show();
        $('.win').hide();
    } else {
        $('.mac').hide();
        $('.win').show();
    }
    $('body').on('click', 'a.scroll.tooltip', function(e) {
        $(this).protipHide();
    });
    $('body').on('click', 'a.scrolltop.tooltip', function(e) {
        $(this).protipHide();
    });
    $('body').on('click', '.virtual-session-item-files-more a', function(e) {
        e.preventDefault();
        $(this).closest('ul').children().not('.dropbox-source').show();
        $(this).remove();
        return false;
    });
    $('body').on('click', '.virtual-session-key-header a', function(e) {
        e.preventDefault();
        var wrapper = $(this).parents('.virtual-session-wrapper');
        wrapper.toggleClass('virtual-session-collapsed').toggleClass('virtual-session-expanded');
        return false;
    });
    $('body').on('click', '.virtual-session-expand', function(e) {
        e.preventDefault();
        $(this).parents('.virtual-session-wrapper').toggleClass('virtual-session-collapsed').toggleClass('virtual-session-expanded');
        return false;
    });
    $('body').on('click', '.chat-leave a', function(e) {
        e.preventDefault();
        if (window.opener) {
            window.close();
        } else {
            window.location = $(this).attr('href');
        }
        return false;
    });
    $('body').on('click', '.chat-toggle-on a.sidebar-expand', function(e) {
        e.preventDefault();
        $('.chat-toggle-on').css('display', 'none');
        $('.chat-toggle-off').css('display', 'inline-block');
        $('#virtual-container #virtual-sidebar-chat-toggle').css('display', 'none');
        $('#virtual-container #virtual-sidebar-chat').css('display', 'block');
        return false;
    });
    $('body').on('click', '.chat-toggle-off a.chat-hide', function(e) {
        e.preventDefault();
        $('.chat-toggle-on').css('display', 'inline-block');
        $('.chat-toggle-off').css('display', 'none');
        $('#virtual-container #virtual-sidebar-chat').css('display', 'none');
        $('#virtual-container #virtual-sidebar-chat-toggle').css('display', 'block');
        return false;
    });
    $('body').on('click', '.chat-toggle-off a.chat-popup', function(e) {
        e.preventDefault();
        $('.chat-toggle-on').css('display', 'inline-block');
        $('.chat-toggle-off').css('display', 'none');
        $('#virtual-container #virtual-sidebar-chat').css('display', 'none');
        $('#virtual-container #virtual-sidebar-chat-toggle').css('display', 'block');
        return false;
    });
    $('body').on('click', '.users-toggle-on a.sidebar-expand', function(e) {
        e.preventDefault();
        $('.users-toggle-on').css('display', 'none');
        $('.users-toggle-off').css('display', 'inline-block');
        $('#virtual-container #virtual-sidebar-users-toggle').css('display', 'none');
        $('#virtual-container #virtual-sidebar-users').css('display', 'block');
        return false;
    });
    $('body').on('click', '.users-toggle-off a.users-hide', function(e) {
        e.preventDefault();
        $('.users-toggle-on').css('display', 'inline-block');
        $('.users-toggle-off').css('display', 'none');
        $('#virtual-container #virtual-sidebar-users').css('display', 'none');
        $('#virtual-container #virtual-sidebar-users-toggle').css('display', 'block');
        return false;
    });
    $('body').on('click', '.actions-toggle-on a.sidebar-expand', function(e) {
        e.preventDefault();
        $('.actions-toggle-on').css('display', 'none');
        $('.actions-toggle-off').css('display', 'inline-block');
        $('#virtual-container #virtual-sidebar-actions').css('display', 'block');
        $('#virtual-container #virtual-sidebar-actions-toggle').css('display', 'none');
        return false;
    });
    $('body').on('click', '.actions-toggle-off a.actions-hide', function(e) {
        e.preventDefault();
        $('.actions-toggle-on').css('display', 'inline-block');
        $('.actions-toggle-off').css('display', 'none');
        $('#virtual-container #virtual-sidebar-actions').css('display', 'none');
        $('#virtual-container #virtual-sidebar-actions-toggle').css('display', 'block');
        return false;
    });
    $(window).on('resize', resizeColorbox);
    if (SOCKET) {
        SOCKET.on("user-checked", function(uid, eid) {
            $(eid ? '.extid-' + eid : '.userid-' + uid).addClass('user-checked');
        });
        SOCKET.on("user-evaluating", function(uid, eid) {
            $(eid ? '.extid-' + eid : '.userid-' + uid).removeClass('user-evaluated').addClass('user-evaluating');
        });
        SOCKET.on("user-evaluated", function(uid, eid) {
            $(eid ? '.extid-' + eid : '.userid-' + uid).removeClass('user-evaluating').addClass('user-evaluated');
        });
        SOCKET.on("user-reviewing", function(uid, eid) {
            $(eid ? '.extid-' + eid : '.userid-' + uid).removeClass('user-reviewed').addClass('user-reviewing');
        });
        SOCKET.on("user-reviewed", function(uid, eid) {
            $(eid ? '.extid-' + eid : '.userid-' + uid).removeClass('user-reviewing').addClass('user-reviewed');
        });
        SOCKET.on("user-popuping", function(uid, eid) {
            $(eid ? '.extid-' + eid : '.userid-' + uid).removeClass('user-popupped').addClass('user-popuping');
        });
        SOCKET.on("user-popupped", function(uid, eid) {
            $(eid ? '.extid-' + eid : '.userid-' + uid).removeClass('user-popuping').addClass('user-popupped');
        });
        SOCKET.on("user-voted", function(uid, eid, val) {
            $(eid ? '.extid-' + eid : '.userid-' + uid).addClass('user-voted');
        });
        SOCKET.on("vote", function(data) {
            if (!data) {
                $('.user-voted').removeClass('user-voted');
            }
        });
        SOCKET.on("popup", function(data) {
            if (!data) {
                $('.user-popuping').removeClass('user-popuping');
                $('.user-popupped').removeClass('user-popupped');
            }
        });
        SOCKET.on("review", function(data) {
            if (!data) {
                $('.user-reviewing').removeClass('user-reviewing');
                $('.user-reviewed').removeClass('user-reviewed');
            }
        });
        SOCKET.on("evaluation", function(data) {
            if (!data) {
                $('.user-evaluating').removeClass('user-evaluating');
                $('.user-evaluated').removeClass('user-evaluated');
            }
        });
        SOCKET.on("checkin", function(data) {
            if (!data) {
                $('.user-checked').removeClass('user-checked');
            }
        });
        SOCKET.on("user-count", function(count) {
            if (count) {
                for (const c in count) {
                    USER_COUNT[c] = count[c];
                }
                ;USER_COUNT.total = USER_COUNT.offline + USER_COUNT.online;
            }
            updateUsersCount();
        });
        SOCKET.on("user-moved", function(data) {
            if (USERID == data.userid || (data.extra.extid && EXTRA.extid == data.extra.extid)) {
                EXTRA.conf = data.extra.conf;
                if (data.extra.conf == 'breakout') {
                    EXTRA.breakout = data.extra.breakout;
                } else {
                    EXTRA.breakout = 0;
                }
            }
            updateUsers(data, true);
        });
        SOCKET.on("user-left", function(data) {
            $('.userid-' + data.userid).remove();
            if (data.extra.extid && USERS[data.extra.extid]) {
                updateUsers(USERS[data.extra.extid], true);
            }
        });
        SOCKET.on("user-blocked", function(data) {
            if (USERID == data.userid || (data.extra.extid && EXTRA.extid == data.extra.extid)) {
                window.location = '/vr/expirar';
            }
        });
        SOCKET.on("user-joined", function(data, stream) {
            updateUsers(data, true);
        });
        SOCKET.on("user-rejoined", function(data, stream) {
            updateUsers(data, true);
        });
        SOCKET.on("user-extra", function(data) {
            updateUsers(data, true);
        });
        SOCKET.on("user-list", function(arr) {
            if ($('.users-list').length == 0)
                return;
            $('.users-list li').remove();
            arr.forEach(function(data) {
                updateUsers(data, false);
            });
            sortUsers();
            setTimeout(loadUsers, 2000);
        });
        SOCKET.on("conf", function(data, update) {
            showConference(data, false, update);
        })
        SOCKET.on("delay", function(data, update) {
            VIRTUAL_DELAY = intval(data);
        });
        SOCKET.on("connect", function() {
            checkCookie();
            SOCKET.emit('update-delay');
            SOCKET.emit('update-conf');
            SOCKET.emit('update-user-count');
        });
        SOCKET.on("logout", function() {
            window.location = '/vr/expirar';
        });
        SOCKET.on("leave", function() {
            window.location = '/vr/desconectar';
        });
        SOCKET.on("refresh", function() {
            loadExtra();
        });
    } else {
        loadSessions();
        $('.users-list > ul').hide();
        updateUsersCount();
    }
});
