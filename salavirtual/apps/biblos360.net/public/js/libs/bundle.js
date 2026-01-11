/* modernizr 3.6.0 (Custom Build) | MIT *
 * https://modernizr.com/download/?-touchevents-mq-printshiv-setclasses !*/
!function(e, t, n) {
    function o(e) {
        var t = d.className
          , n = Modernizr._config.classPrefix || "";
        if (m && (t = t.baseVal),
        Modernizr._config.enableJSClass) {
            var o = new RegExp("(^|\\s)" + n + "no-js(\\s|$)");
            t = t.replace(o, "$1" + n + "js$2")
        }
        Modernizr._config.enableClasses && (t += " " + n + e.join(" " + n),
        m ? d.className.baseVal = t : d.className = t)
    }
    function r(e, t) {
        return typeof e === t
    }
    function a() {
        var e, t, n, o, a, i, s;
        for (var l in u)
            if (u.hasOwnProperty(l)) {
                if (e = [],
                t = u[l],
                t.name && (e.push(t.name.toLowerCase()),
                t.options && t.options.aliases && t.options.aliases.length))
                    for (n = 0; n < t.options.aliases.length; n++)
                        e.push(t.options.aliases[n].toLowerCase());
                for (o = r(t.fn, "function") ? t.fn() : t.fn,
                a = 0; a < e.length; a++)
                    i = e[a],
                    s = i.split("."),
                    1 === s.length ? Modernizr[s[0]] = o : (!Modernizr[s[0]] || Modernizr[s[0]]instanceof Boolean || (Modernizr[s[0]] = new Boolean(Modernizr[s[0]])),
                    Modernizr[s[0]][s[1]] = o),
                    c.push((o ? "" : "no-") + s.join("-"))
            }
    }
    function i() {
        return "function" != typeof t.createElement ? t.createElement(arguments[0]) : m ? t.createElementNS.call(t, "http://www.w3.org/2000/svg", arguments[0]) : t.createElement.apply(t, arguments)
    }
    function s() {
        var e = t.body;
        return e || (e = i(m ? "svg" : "body"),
        e.fake = !0),
        e
    }
    function l(e, n, o, r) {
        var a, l, c, u, f = "modernizr", m = i("div"), p = s();
        if (parseInt(o, 10))
            for (; o--; )
                c = i("div"),
                c.id = r ? r[o] : f + (o + 1),
                m.appendChild(c);
        return a = i("style"),
        a.type = "text/css",
        a.id = "s" + f,
        (p.fake ? p : m).appendChild(a),
        p.appendChild(m),
        a.styleSheet ? a.styleSheet.cssText = e : a.appendChild(t.createTextNode(e)),
        m.id = f,
        p.fake && (p.style.background = "",
        p.style.overflow = "hidden",
        u = d.style.overflow,
        d.style.overflow = "hidden",
        d.appendChild(p)),
        l = n(m, e),
        p.fake ? (p.parentNode.removeChild(p),
        d.style.overflow = u,
        d.offsetHeight) : m.parentNode.removeChild(m),
        !!l
    }
    var c = []
      , u = []
      , f = {
        _version: "3.6.0",
        _config: {
            classPrefix: "",
            enableClasses: !0,
            enableJSClass: !0,
            usePrefixes: !0
        },
        _q: [],
        on: function(e, t) {
            var n = this;
            setTimeout(function() {
                t(n[e])
            }, 0)
        },
        addTest: function(e, t, n) {
            u.push({
                name: e,
                fn: t,
                options: n
            })
        },
        addAsyncTest: function(e) {
            u.push({
                name: null,
                fn: e
            })
        }
    }
      , Modernizr = function() {};
    Modernizr.prototype = f,
    Modernizr = new Modernizr;
    var d = t.documentElement
      , m = "svg" === d.nodeName.toLowerCase();
    m || !function(e, t) {
        function n(e, t) {
            var n = e.createElement("p")
              , o = e.getElementsByTagName("head")[0] || e.documentElement;
            return n.innerHTML = "x<style>" + t + "</style>",
            o.insertBefore(n.lastChild, o.firstChild)
        }
        function o() {
            var e = w.elements;
            return "string" == typeof e ? e.split(" ") : e
        }
        function r(e, t) {
            var n = w.elements;
            "string" != typeof n && (n = n.join(" ")),
            "string" != typeof e && (e = e.join(" ")),
            w.elements = n + " " + e,
            c(t)
        }
        function a(e) {
            var t = T[e[S]];
            return t || (t = {},
            C++,
            e[S] = C,
            T[C] = t),
            t
        }
        function i(e, n, o) {
            if (n || (n = t),
            v)
                return n.createElement(e);
            o || (o = a(n));
            var r;
            return r = o.cache[e] ? o.cache[e].cloneNode() : b.test(e) ? (o.cache[e] = o.createElem(e)).cloneNode() : o.createElem(e),
            !r.canHaveChildren || E.test(e) || r.tagUrn ? r : o.frag.appendChild(r)
        }
        function s(e, n) {
            if (e || (e = t),
            v)
                return e.createDocumentFragment();
            n = n || a(e);
            for (var r = n.frag.cloneNode(), i = 0, s = o(), l = s.length; l > i; i++)
                r.createElement(s[i]);
            return r
        }
        function l(e, t) {
            t.cache || (t.cache = {},
            t.createElem = e.createElement,
            t.createFrag = e.createDocumentFragment,
            t.frag = t.createFrag()),
            e.createElement = function(n) {
                return w.shivMethods ? i(n, e, t) : t.createElem(n)
            }
            ,
            e.createDocumentFragment = Function("h,f", "return function(){var n=f.cloneNode(),c=n.createElement;h.shivMethods&&(" + o().join().replace(/[\w\-:]+/g, function(e) {
                return t.createElem(e),
                t.frag.createElement(e),
                'c("' + e + '")'
            }) + ");return n}")(w, t.frag)
        }
        function c(e) {
            e || (e = t);
            var o = a(e);
            return !w.shivCSS || h || o.hasCSS || (o.hasCSS = !!n(e, "article,aside,dialog,figcaption,figure,footer,header,hgroup,main,nav,section{display:block}mark{background:#FF0;color:#000}template{display:none}")),
            v || l(e, o),
            e
        }
        function u(e) {
            for (var t, n = e.getElementsByTagName("*"), r = n.length, a = RegExp("^(?:" + o().join("|") + ")$", "i"), i = []; r--; )
                t = n[r],
                a.test(t.nodeName) && i.push(t.applyElement(f(t)));
            return i
        }
        function f(e) {
            for (var t, n = e.attributes, o = n.length, r = e.ownerDocument.createElement(x + ":" + e.nodeName); o--; )
                t = n[o],
                t.specified && r.setAttribute(t.nodeName, t.nodeValue);
            return r.style.cssText = e.style.cssText,
            r
        }
        function d(e) {
            for (var t, n = e.split("{"), r = n.length, a = RegExp("(^|[\\s,>+~])(" + o().join("|") + ")(?=[[\\s,>+~#.:]|$)", "gi"), i = "$1" + x + "\\:$2"; r--; )
                t = n[r] = n[r].split("}"),
                t[t.length - 1] = t[t.length - 1].replace(a, i),
                n[r] = t.join("}");
            return n.join("{")
        }
        function m(e) {
            for (var t = e.length; t--; )
                e[t].removeNode()
        }
        function p(e) {
            function t() {
                clearTimeout(i._removeSheetTimer),
                o && o.removeNode(!0),
                o = null
            }
            var o, r, i = a(e), s = e.namespaces, l = e.parentWindow;
            return !_ || e.printShived ? e : ("undefined" == typeof s[x] && s.add(x),
            l.attachEvent("onbeforeprint", function() {
                t();
                for (var a, i, s, l = e.styleSheets, c = [], f = l.length, m = Array(f); f--; )
                    m[f] = l[f];
                for (; s = m.pop(); )
                    if (!s.disabled && N.test(s.media)) {
                        try {
                            a = s.imports,
                            i = a.length
                        } catch (p) {
                            i = 0
                        }
                        for (f = 0; i > f; f++)
                            m.push(a[f]);
                        try {
                            c.push(s.cssText)
                        } catch (p) {}
                    }
                c = d(c.reverse().join("")),
                r = u(e),
                o = n(e, c)
            }),
            l.attachEvent("onafterprint", function() {
                m(r),
                clearTimeout(i._removeSheetTimer),
                i._removeSheetTimer = setTimeout(t, 500)
            }),
            e.printShived = !0,
            e)
        }
        var h, v, g = "3.7.3", y = e.html5 || {}, E = /^<|^(?:button|map|select|textarea|object|iframe|option|optgroup)$/i, b = /^(?:a|b|code|div|fieldset|h1|h2|h3|h4|h5|h6|i|label|li|ol|p|q|span|strong|style|table|tbody|td|th|tr|ul)$/i, S = "_html5shiv", C = 0, T = {};
        !function() {
            try {
                var e = t.createElement("a");
                e.innerHTML = "<xyz></xyz>",
                h = "hidden"in e,
                v = 1 == e.childNodes.length || function() {
                    t.createElement("a");
                    var e = t.createDocumentFragment();
                    return "undefined" == typeof e.cloneNode || "undefined" == typeof e.createDocumentFragment || "undefined" == typeof e.createElement
                }()
            } catch (n) {
                h = !0,
                v = !0
            }
        }();
        var w = {
            elements: y.elements || "abbr article aside audio bdi canvas data datalist details dialog figcaption figure footer header hgroup main mark meter nav output picture progress section summary template time video",
            version: g,
            shivCSS: y.shivCSS !== !1,
            supportsUnknownElements: v,
            shivMethods: y.shivMethods !== !1,
            type: "default",
            shivDocument: c,
            createElement: i,
            createDocumentFragment: s,
            addElements: r
        };
        e.html5 = w,
        c(t);
        var N = /^$|\b(?:all|print)\b/
          , x = "html5shiv"
          , _ = !v && function() {
            var n = t.documentElement;
            return !("undefined" == typeof t.namespaces || "undefined" == typeof t.parentWindow || "undefined" == typeof n.applyElement || "undefined" == typeof n.removeNode || "undefined" == typeof e.attachEvent)
        }();
        w.type += " print",
        w.shivPrint = p,
        p(t),
        "object" == typeof module && module.exports && (module.exports = w)
    }("undefined" != typeof e ? e : this, t);
    var p = f._config.usePrefixes ? " -webkit- -moz- -o- -ms- ".split(" ") : ["", ""];
    f._prefixes = p;
    var h = function() {
        var t = e.matchMedia || e.msMatchMedia;
        return t ? function(e) {
            var n = t(e);
            return n && n.matches || !1
        }
        : function(t) {
            var n = !1;
            return l("@media " + t + " { #modernizr { position: absolute; } }", function(t) {
                n = "absolute" == (e.getComputedStyle ? e.getComputedStyle(t, null) : t.currentStyle).position
            }),
            n
        }
    }();
    f.mq = h;
    var v = f.testStyles = l;
    Modernizr.addTest("touchevents", function() {
        var n;
        if ("ontouchstart"in e || e.DocumentTouch && t instanceof DocumentTouch)
            n = !0;
        else {
            var o = ["@media (", p.join("touch-enabled),("), "heartz", ")", "{#modernizr{top:9px;position:absolute}}"].join("");
            v(o, function(e) {
                n = 9 === e.offsetTop
            })
        }
        return n
    }),
    a(),
    o(c),
    delete f.addTest,
    delete f.addAsyncTest;
    for (var g = 0; g < Modernizr._q.length; g++)
        Modernizr._q[g]();
    e.Modernizr = Modernizr
}(window, document);
;/* jQuery v1.7.2 jquery.com | jquery.org/license */
(function(a, b) {
    function cy(a) {
        return f.isWindow(a) ? a : a.nodeType === 9 ? a.defaultView || a.parentWindow : !1
    }
    function cu(a) {
        if (!cj[a]) {
            var b = c.body
              , d = f("<" + a + ">").appendTo(b)
              , e = d.css("display");
            d.remove();
            if (e === "none" || e === "") {
                ck || (ck = c.createElement("iframe"),
                ck.frameBorder = ck.width = ck.height = 0),
                b.appendChild(ck);
                if (!cl || !ck.createElement)
                    cl = (ck.contentWindow || ck.contentDocument).document,
                    cl.write((f.support.boxModel ? "<!doctype html>" : "") + "<html><body>"),
                    cl.close();
                d = cl.createElement(a),
                cl.body.appendChild(d),
                e = f.css(d, "display"),
                b.removeChild(ck)
            }
            cj[a] = e
        }
        return cj[a]
    }
    function ct(a, b) {
        var c = {};
        f.each(cp.concat.apply([], cp.slice(0, b)), function() {
            c[this] = a
        });
        return c
    }
    function cs() {
        cq = b
    }
    function cr() {
        setTimeout(cs, 0);
        return cq = f.now()
    }
    function ci() {
        try {
            return new a.ActiveXObject("Microsoft.XMLHTTP")
        } catch (b) {}
    }
    function ch() {
        try {
            return new a.XMLHttpRequest
        } catch (b) {}
    }
    function cb(a, c) {
        a.dataFilter && (c = a.dataFilter(c, a.dataType));
        var d = a.dataTypes, e = {}, g, h, i = d.length, j, k = d[0], l, m, n, o, p;
        for (g = 1; g < i; g++) {
            if (g === 1)
                for (h in a.converters)
                    typeof h == "string" && (e[h.toLowerCase()] = a.converters[h]);
            l = k,
            k = d[g];
            if (k === "*")
                k = l;
            else if (l !== "*" && l !== k) {
                m = l + " " + k,
                n = e[m] || e["* " + k];
                if (!n) {
                    p = b;
                    for (o in e) {
                        j = o.split(" ");
                        if (j[0] === l || j[0] === "*") {
                            p = e[j[1] + " " + k];
                            if (p) {
                                o = e[o],
                                o === !0 ? n = p : p === !0 && (n = o);
                                break
                            }
                        }
                    }
                }
                !n && !p && f.error("No conversion from " + m.replace(" ", " to ")),
                n !== !0 && (c = n ? n(c) : p(o(c)))
            }
        }
        return c
    }
    function ca(a, c, d) {
        var e = a.contents, f = a.dataTypes, g = a.responseFields, h, i, j, k;
        for (i in g)
            i in d && (c[g[i]] = d[i]);
        while (f[0] === "*")
            f.shift(),
            h === b && (h = a.mimeType || c.getResponseHeader("content-type"));
        if (h)
            for (i in e)
                if (e[i] && e[i].test(h)) {
                    f.unshift(i);
                    break
                }
        if (f[0]in d)
            j = f[0];
        else {
            for (i in d) {
                if (!f[0] || a.converters[i + " " + f[0]]) {
                    j = i;
                    break
                }
                k || (k = i)
            }
            j = j || k
        }
        if (j) {
            j !== f[0] && f.unshift(j);
            return d[j]
        }
    }
    function b_(a, b, c, d) {
        if (f.isArray(b))
            f.each(b, function(b, e) {
                c || bD.test(a) ? d(a, e) : b_(a + "[" + (typeof e == "object" ? b : "") + "]", e, c, d)
            });
        else if (!c && f.type(b) === "object")
            for (var e in b)
                b_(a + "[" + e + "]", b[e], c, d);
        else
            d(a, b)
    }
    function b$(a, c) {
        var d, e, g = f.ajaxSettings.flatOptions || {};
        for (d in c)
            c[d] !== b && ((g[d] ? a : e || (e = {}))[d] = c[d]);
        e && f.extend(!0, a, e)
    }
    function bZ(a, c, d, e, f, g) {
        f = f || c.dataTypes[0],
        g = g || {},
        g[f] = !0;
        var h = a[f], i = 0, j = h ? h.length : 0, k = a === bS, l;
        for (; i < j && (k || !l); i++)
            l = h[i](c, d, e),
            typeof l == "string" && (!k || g[l] ? l = b : (c.dataTypes.unshift(l),
            l = bZ(a, c, d, e, l, g)));
        (k || !l) && !g["*"] && (l = bZ(a, c, d, e, "*", g));
        return l
    }
    function bY(a) {
        return function(b, c) {
            typeof b != "string" && (c = b,
            b = "*");
            if (f.isFunction(c)) {
                var d = b.toLowerCase().split(bO), e = 0, g = d.length, h, i, j;
                for (; e < g; e++)
                    h = d[e],
                    j = /^\+/.test(h),
                    j && (h = h.substr(1) || "*"),
                    i = a[h] = a[h] || [],
                    i[j ? "unshift" : "push"](c)
            }
        }
    }
    function bB(a, b, c) {
        var d = b === "width" ? a.offsetWidth : a.offsetHeight
          , e = b === "width" ? 1 : 0
          , g = 4;
        if (d > 0) {
            if (c !== "border")
                for (; e < g; e += 2)
                    c || (d -= parseFloat(f.css(a, "padding" + bx[e])) || 0),
                    c === "margin" ? d += parseFloat(f.css(a, c + bx[e])) || 0 : d -= parseFloat(f.css(a, "border" + bx[e] + "Width")) || 0;
            return d + "px"
        }
        d = by(a, b);
        if (d < 0 || d == null)
            d = a.style[b];
        if (bt.test(d))
            return d;
        d = parseFloat(d) || 0;
        if (c)
            for (; e < g; e += 2)
                d += parseFloat(f.css(a, "padding" + bx[e])) || 0,
                c !== "padding" && (d += parseFloat(f.css(a, "border" + bx[e] + "Width")) || 0),
                c === "margin" && (d += parseFloat(f.css(a, c + bx[e])) || 0);
        return d + "px"
    }
    function bo(a) {
        var b = c.createElement("div");
        bh.appendChild(b),
        b.innerHTML = a.outerHTML;
        return b.firstChild
    }
    function bn(a) {
        var b = (a.nodeName || "").toLowerCase();
        b === "input" ? bm(a) : b !== "script" && typeof a.getElementsByTagName != "undefined" && f.grep(a.getElementsByTagName("input"), bm)
    }
    function bm(a) {
        if (a.type === "checkbox" || a.type === "radio")
            a.defaultChecked = a.checked
    }
    function bl(a) {
        return typeof a.getElementsByTagName != "undefined" ? a.getElementsByTagName("*") : typeof a.querySelectorAll != "undefined" ? a.querySelectorAll("*") : []
    }
    function bk(a, b) {
        var c;
        b.nodeType === 1 && (b.clearAttributes && b.clearAttributes(),
        b.mergeAttributes && b.mergeAttributes(a),
        c = b.nodeName.toLowerCase(),
        c === "object" ? b.outerHTML = a.outerHTML : c !== "input" || a.type !== "checkbox" && a.type !== "radio" ? c === "option" ? b.selected = a.defaultSelected : c === "input" || c === "textarea" ? b.defaultValue = a.defaultValue : c === "script" && b.text !== a.text && (b.text = a.text) : (a.checked && (b.defaultChecked = b.checked = a.checked),
        b.value !== a.value && (b.value = a.value)),
        b.removeAttribute(f.expando),
        b.removeAttribute("_submit_attached"),
        b.removeAttribute("_change_attached"))
    }
    function bj(a, b) {
        if (b.nodeType === 1 && !!f.hasData(a)) {
            var c, d, e, g = f._data(a), h = f._data(b, g), i = g.events;
            if (i) {
                delete h.handle,
                h.events = {};
                for (c in i)
                    for (d = 0,
                    e = i[c].length; d < e; d++)
                        f.event.add(b, c, i[c][d])
            }
            h.data && (h.data = f.extend({}, h.data))
        }
    }
    function bi(a, b) {
        return f.nodeName(a, "table") ? a.getElementsByTagName("tbody")[0] || a.appendChild(a.ownerDocument.createElement("tbody")) : a
    }
    function U(a) {
        var b = V.split("|")
          , c = a.createDocumentFragment();
        if (c.createElement)
            while (b.length)
                c.createElement(b.pop());
        return c
    }
    function T(a, b, c) {
        b = b || 0;
        if (f.isFunction(b))
            return f.grep(a, function(a, d) {
                var e = !!b.call(a, d, a);
                return e === c
            });
        if (b.nodeType)
            return f.grep(a, function(a, d) {
                return a === b === c
            });
        if (typeof b == "string") {
            var d = f.grep(a, function(a) {
                return a.nodeType === 1
            });
            if (O.test(b))
                return f.filter(b, d, !c);
            b = f.filter(b, d)
        }
        return f.grep(a, function(a, d) {
            return f.inArray(a, b) >= 0 === c
        })
    }
    function S(a) {
        return !a || !a.parentNode || a.parentNode.nodeType === 11
    }
    function K() {
        return !0
    }
    function J() {
        return !1
    }
    function n(a, b, c) {
        var d = b + "defer"
          , e = b + "queue"
          , g = b + "mark"
          , h = f._data(a, d);
        h && (c === "queue" || !f._data(a, e)) && (c === "mark" || !f._data(a, g)) && setTimeout(function() {
            !f._data(a, e) && !f._data(a, g) && (f.removeData(a, d, !0),
            h.fire())
        }, 0)
    }
    function m(a) {
        for (var b in a) {
            if (b === "data" && f.isEmptyObject(a[b]))
                continue;
            if (b !== "toJSON")
                return !1
        }
        return !0
    }
    function l(a, c, d) {
        if (d === b && a.nodeType === 1) {
            var e = "data-" + c.replace(k, "-$1").toLowerCase();
            d = a.getAttribute(e);
            if (typeof d == "string") {
                try {
                    d = d === "true" ? !0 : d === "false" ? !1 : d === "null" ? null : f.isNumeric(d) ? +d : j.test(d) ? f.parseJSON(d) : d
                } catch (g) {}
                f.data(a, c, d)
            } else
                d = b
        }
        return d
    }
    function h(a) {
        var b = g[a] = {}, c, d;
        a = a.split(/\s+/);
        for (c = 0,
        d = a.length; c < d; c++)
            b[a[c]] = !0;
        return b
    }
    var c = a.document
      , d = a.navigator
      , e = a.location
      , f = function() {
        function J() {
            if (!e.isReady) {
                try {
                    c.documentElement.doScroll("left")
                } catch (a) {
                    setTimeout(J, 1);
                    return
                }
                e.ready()
            }
        }
        var e = function(a, b) {
            return new e.fn.init(a,b,h)
        }, f = a.jQuery, g = a.$, h, i = /^(?:[^#<]*(<[\w\W]+>)[^>]*$|#([\w\-]*)$)/, j = /\S/, k = /^\s+/, l = /\s+$/, m = /^<(\w+)\s*\/?>(?:<\/\1>)?$/, n = /^[\],:{}\s]*$/, o = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, p = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, q = /(?:^|:|,)(?:\s*\[)+/g, r = /(webkit)[ \/]([\w.]+)/, s = /(opera)(?:.*version)?[ \/]([\w.]+)/, t = /(msie) ([\w.]+)/, u = /(mozilla)(?:.*? rv:([\w.]+))?/, v = /-([a-z]|[0-9])/ig, w = /^-ms-/, x = function(a, b) {
            return (b + "").toUpperCase()
        }, y = d.userAgent, z, A, B, C = Object.prototype.toString, D = Object.prototype.hasOwnProperty, E = Array.prototype.push, F = Array.prototype.slice, G = String.prototype.trim, H = Array.prototype.indexOf, I = {};
        e.fn = e.prototype = {
            constructor: e,
            init: function(a, d, f) {
                var g, h, j, k;
                if (!a)
                    return this;
                if (a.nodeType) {
                    this.context = this[0] = a,
                    this.length = 1;
                    return this
                }
                if (a === "body" && !d && c.body) {
                    this.context = c,
                    this[0] = c.body,
                    this.selector = a,
                    this.length = 1;
                    return this
                }
                if (typeof a == "string") {
                    a.charAt(0) !== "<" || a.charAt(a.length - 1) !== ">" || a.length < 3 ? g = i.exec(a) : g = [null, a, null];
                    if (g && (g[1] || !d)) {
                        if (g[1]) {
                            d = d instanceof e ? d[0] : d,
                            k = d ? d.ownerDocument || d : c,
                            j = m.exec(a),
                            j ? e.isPlainObject(d) ? (a = [c.createElement(j[1])],
                            e.fn.attr.call(a, d, !0)) : a = [k.createElement(j[1])] : (j = e.buildFragment([g[1]], [k]),
                            a = (j.cacheable ? e.clone(j.fragment) : j.fragment).childNodes);
                            return e.merge(this, a)
                        }
                        h = c.getElementById(g[2]);
                        if (h && h.parentNode) {
                            if (h.id !== g[2])
                                return f.find(a);
                            this.length = 1,
                            this[0] = h
                        }
                        this.context = c,
                        this.selector = a;
                        return this
                    }
                    return !d || d.jquery ? (d || f).find(a) : this.constructor(d).find(a)
                }
                if (e.isFunction(a))
                    return f.ready(a);
                a.selector !== b && (this.selector = a.selector,
                this.context = a.context);
                return e.makeArray(a, this)
            },
            selector: "",
            jquery: "1.7.2",
            length: 0,
            size: function() {
                return this.length
            },
            toArray: function() {
                return F.call(this, 0)
            },
            get: function(a) {
                return a == null ? this.toArray() : a < 0 ? this[this.length + a] : this[a]
            },
            pushStack: function(a, b, c) {
                var d = this.constructor();
                e.isArray(a) ? E.apply(d, a) : e.merge(d, a),
                d.prevObject = this,
                d.context = this.context,
                b === "find" ? d.selector = this.selector + (this.selector ? " " : "") + c : b && (d.selector = this.selector + "." + b + "(" + c + ")");
                return d
            },
            each: function(a, b) {
                return e.each(this, a, b)
            },
            ready: function(a) {
                e.bindReady(),
                A.add(a);
                return this
            },
            eq: function(a) {
                a = +a;
                return a === -1 ? this.slice(a) : this.slice(a, a + 1)
            },
            first: function() {
                return this.eq(0)
            },
            last: function() {
                return this.eq(-1)
            },
            slice: function() {
                return this.pushStack(F.apply(this, arguments), "slice", F.call(arguments).join(","))
            },
            map: function(a) {
                return this.pushStack(e.map(this, function(b, c) {
                    return a.call(b, c, b)
                }))
            },
            end: function() {
                return this.prevObject || this.constructor(null)
            },
            push: E,
            sort: [].sort,
            splice: [].splice
        },
        e.fn.init.prototype = e.fn,
        e.extend = e.fn.extend = function() {
            var a, c, d, f, g, h, i = arguments[0] || {}, j = 1, k = arguments.length, l = !1;
            typeof i == "boolean" && (l = i,
            i = arguments[1] || {},
            j = 2),
            typeof i != "object" && !e.isFunction(i) && (i = {}),
            k === j && (i = this,
            --j);
            for (; j < k; j++)
                if ((a = arguments[j]) != null)
                    for (c in a) {
                        d = i[c],
                        f = a[c];
                        if (i === f)
                            continue;
                        l && f && (e.isPlainObject(f) || (g = e.isArray(f))) ? (g ? (g = !1,
                        h = d && e.isArray(d) ? d : []) : h = d && e.isPlainObject(d) ? d : {},
                        i[c] = e.extend(l, h, f)) : f !== b && (i[c] = f)
                    }
            return i
        }
        ,
        e.extend({
            noConflict: function(b) {
                a.$ === e && (a.$ = g),
                b && a.jQuery === e && (a.jQuery = f);
                return e
            },
            isReady: !1,
            readyWait: 1,
            holdReady: function(a) {
                a ? e.readyWait++ : e.ready(!0)
            },
            ready: function(a) {
                if (a === !0 && !--e.readyWait || a !== !0 && !e.isReady) {
                    if (!c.body)
                        return setTimeout(e.ready, 1);
                    e.isReady = !0;
                    if (a !== !0 && --e.readyWait > 0)
                        return;
                    A.fireWith(c, [e]),
                    e.fn.trigger && e(c).trigger("ready").off("ready")
                }
            },
            bindReady: function() {
                if (!A) {
                    A = e.Callbacks("once memory");
                    if (c.readyState === "complete")
                        return setTimeout(e.ready, 1);
                    if (c.addEventListener)
                        c.addEventListener("DOMContentLoaded", B, !1),
                        a.addEventListener("load", e.ready, !1);
                    else if (c.attachEvent) {
                        c.attachEvent("onreadystatechange", B),
                        a.attachEvent("onload", e.ready);
                        var b = !1;
                        try {
                            b = a.frameElement == null
                        } catch (d) {}
                        c.documentElement.doScroll && b && J()
                    }
                }
            },
            isFunction: function(a) {
                return e.type(a) === "function"
            },
            isArray: Array.isArray || function(a) {
                return e.type(a) === "array"
            }
            ,
            isWindow: function(a) {
                return a != null && a == a.window
            },
            isNumeric: function(a) {
                return !isNaN(parseFloat(a)) && isFinite(a)
            },
            type: function(a) {
                return a == null ? String(a) : I[C.call(a)] || "object"
            },
            isPlainObject: function(a) {
                if (!a || e.type(a) !== "object" || a.nodeType || e.isWindow(a))
                    return !1;
                try {
                    if (a.constructor && !D.call(a, "constructor") && !D.call(a.constructor.prototype, "isPrototypeOf"))
                        return !1
                } catch (c) {
                    return !1
                }
                var d;
                for (d in a)
                    ;
                return d === b || D.call(a, d)
            },
            isEmptyObject: function(a) {
                for (var b in a)
                    return !1;
                return !0
            },
            error: function(a) {
                throw new Error(a)
            },
            parseJSON: function(b) {
                if (typeof b != "string" || !b)
                    return null;
                b = e.trim(b);
                if (a.JSON && a.JSON.parse)
                    return a.JSON.parse(b);
                if (n.test(b.replace(o, "@").replace(p, "]").replace(q, "")))
                    return (new Function("return " + b))();
                e.error("Invalid JSON: " + b)
            },
            parseXML: function(c) {
                if (typeof c != "string" || !c)
                    return null;
                var d, f;
                try {
                    a.DOMParser ? (f = new DOMParser,
                    d = f.parseFromString(c, "text/xml")) : (d = new ActiveXObject("Microsoft.XMLDOM"),
                    d.async = "false",
                    d.loadXML(c))
                } catch (g) {
                    d = b
                }
                (!d || !d.documentElement || d.getElementsByTagName("parsererror").length) && e.error("Invalid XML: " + c);
                return d
            },
            noop: function() {},
            globalEval: function(b) {
                b && j.test(b) && (a.execScript || function(b) {
                    a.eval.call(a, b)
                }
                )(b)
            },
            camelCase: function(a) {
                return a.replace(w, "ms-").replace(v, x)
            },
            nodeName: function(a, b) {
                return a.nodeName && a.nodeName.toUpperCase() === b.toUpperCase()
            },
            each: function(a, c, d) {
                var f, g = 0, h = a.length, i = h === b || e.isFunction(a);
                if (d) {
                    if (i) {
                        for (f in a)
                            if (c.apply(a[f], d) === !1)
                                break
                    } else
                        for (; g < h; )
                            if (c.apply(a[g++], d) === !1)
                                break
                } else if (i) {
                    for (f in a)
                        if (c.call(a[f], f, a[f]) === !1)
                            break
                } else
                    for (; g < h; )
                        if (c.call(a[g], g, a[g++]) === !1)
                            break;
                return a
            },
            trim: G ? function(a) {
                return a == null ? "" : G.call(a)
            }
            : function(a) {
                return a == null ? "" : (a + "").replace(k, "").replace(l, "")
            }
            ,
            makeArray: function(a, b) {
                var c = b || [];
                if (a != null) {
                    var d = e.type(a);
                    a.length == null || d === "string" || d === "function" || d === "regexp" || e.isWindow(a) ? E.call(c, a) : e.merge(c, a)
                }
                return c
            },
            inArray: function(a, b, c) {
                var d;
                if (b) {
                    if (H)
                        return H.call(b, a, c);
                    d = b.length,
                    c = c ? c < 0 ? Math.max(0, d + c) : c : 0;
                    for (; c < d; c++)
                        if (c in b && b[c] === a)
                            return c
                }
                return -1
            },
            merge: function(a, c) {
                var d = a.length
                  , e = 0;
                if (typeof c.length == "number")
                    for (var f = c.length; e < f; e++)
                        a[d++] = c[e];
                else
                    while (c[e] !== b)
                        a[d++] = c[e++];
                a.length = d;
                return a
            },
            grep: function(a, b, c) {
                var d = [], e;
                c = !!c;
                for (var f = 0, g = a.length; f < g; f++)
                    e = !!b(a[f], f),
                    c !== e && d.push(a[f]);
                return d
            },
            map: function(a, c, d) {
                var f, g, h = [], i = 0, j = a.length, k = a instanceof e || j !== b && typeof j == "number" && (j > 0 && a[0] && a[j - 1] || j === 0 || e.isArray(a));
                if (k)
                    for (; i < j; i++)
                        f = c(a[i], i, d),
                        f != null && (h[h.length] = f);
                else
                    for (g in a)
                        f = c(a[g], g, d),
                        f != null && (h[h.length] = f);
                return h.concat.apply([], h)
            },
            guid: 1,
            proxy: function(a, c) {
                if (typeof c == "string") {
                    var d = a[c];
                    c = a,
                    a = d
                }
                if (!e.isFunction(a))
                    return b;
                var f = F.call(arguments, 2)
                  , g = function() {
                    return a.apply(c, f.concat(F.call(arguments)))
                };
                g.guid = a.guid = a.guid || g.guid || e.guid++;
                return g
            },
            access: function(a, c, d, f, g, h, i) {
                var j, k = d == null, l = 0, m = a.length;
                if (d && typeof d == "object") {
                    for (l in d)
                        e.access(a, c, l, d[l], 1, h, f);
                    g = 1
                } else if (f !== b) {
                    j = i === b && e.isFunction(f),
                    k && (j ? (j = c,
                    c = function(a, b, c) {
                        return j.call(e(a), c)
                    }
                    ) : (c.call(a, f),
                    c = null));
                    if (c)
                        for (; l < m; l++)
                            c(a[l], d, j ? f.call(a[l], l, c(a[l], d)) : f, i);
                    g = 1
                }
                return g ? a : k ? c.call(a) : m ? c(a[0], d) : h
            },
            now: function() {
                return (new Date).getTime()
            },
            uaMatch: function(a) {
                a = a.toLowerCase();
                var b = r.exec(a) || s.exec(a) || t.exec(a) || a.indexOf("compatible") < 0 && u.exec(a) || [];
                return {
                    browser: b[1] || "",
                    version: b[2] || "0"
                }
            },
            sub: function() {
                function a(b, c) {
                    return new a.fn.init(b,c)
                }
                e.extend(!0, a, this),
                a.superclass = this,
                a.fn = a.prototype = this(),
                a.fn.constructor = a,
                a.sub = this.sub,
                a.fn.init = function(d, f) {
                    f && f instanceof e && !(f instanceof a) && (f = a(f));
                    return e.fn.init.call(this, d, f, b)
                }
                ,
                a.fn.init.prototype = a.fn;
                var b = a(c);
                return a
            },
            browser: {}
        }),
        e.each("Boolean Number String Function Array Date RegExp Object".split(" "), function(a, b) {
            I["[object " + b + "]"] = b.toLowerCase()
        }),
        z = e.uaMatch(y),
        z.browser && (e.browser[z.browser] = !0,
        e.browser.version = z.version),
        e.browser.webkit && (e.browser.safari = !0),
        j.test(" ") && (k = /^[\s\xA0]+/,
        l = /[\s\xA0]+$/),
        h = e(c),
        c.addEventListener ? B = function() {
            c.removeEventListener("DOMContentLoaded", B, !1),
            e.ready()
        }
        : c.attachEvent && (B = function() {
            c.readyState === "complete" && (c.detachEvent("onreadystatechange", B),
            e.ready())
        }
        );
        return e
    }()
      , g = {};
    f.Callbacks = function(a) {
        a = a ? g[a] || h(a) : {};
        var c = [], d = [], e, i, j, k, l, m, n = function(b) {
            var d, e, g, h, i;
            for (d = 0,
            e = b.length; d < e; d++)
                g = b[d],
                h = f.type(g),
                h === "array" ? n(g) : h === "function" && (!a.unique || !p.has(g)) && c.push(g)
        }, o = function(b, f) {
            f = f || [],
            e = !a.memory || [b, f],
            i = !0,
            j = !0,
            m = k || 0,
            k = 0,
            l = c.length;
            for (; c && m < l; m++)
                if (c[m].apply(b, f) === !1 && a.stopOnFalse) {
                    e = !0;
                    break
                }
            j = !1,
            c && (a.once ? e === !0 ? p.disable() : c = [] : d && d.length && (e = d.shift(),
            p.fireWith(e[0], e[1])))
        }, p = {
            add: function() {
                if (c) {
                    var a = c.length;
                    n(arguments),
                    j ? l = c.length : e && e !== !0 && (k = a,
                    o(e[0], e[1]))
                }
                return this
            },
            remove: function() {
                if (c) {
                    var b = arguments
                      , d = 0
                      , e = b.length;
                    for (; d < e; d++)
                        for (var f = 0; f < c.length; f++)
                            if (b[d] === c[f]) {
                                j && f <= l && (l--,
                                f <= m && m--),
                                c.splice(f--, 1);
                                if (a.unique)
                                    break
                            }
                }
                return this
            },
            has: function(a) {
                if (c) {
                    var b = 0
                      , d = c.length;
                    for (; b < d; b++)
                        if (a === c[b])
                            return !0
                }
                return !1
            },
            empty: function() {
                c = [];
                return this
            },
            disable: function() {
                c = d = e = b;
                return this
            },
            disabled: function() {
                return !c
            },
            lock: function() {
                d = b,
                (!e || e === !0) && p.disable();
                return this
            },
            locked: function() {
                return !d
            },
            fireWith: function(b, c) {
                d && (j ? a.once || d.push([b, c]) : (!a.once || !e) && o(b, c));
                return this
            },
            fire: function() {
                p.fireWith(this, arguments);
                return this
            },
            fired: function() {
                return !!i
            }
        };
        return p
    }
    ;
    var i = [].slice;
    f.extend({
        Deferred: function(a) {
            var b = f.Callbacks("once memory"), c = f.Callbacks("once memory"), d = f.Callbacks("memory"), e = "pending", g = {
                resolve: b,
                reject: c,
                notify: d
            }, h = {
                done: b.add,
                fail: c.add,
                progress: d.add,
                state: function() {
                    return e
                },
                isResolved: b.fired,
                isRejected: c.fired,
                then: function(a, b, c) {
                    i.done(a).fail(b).progress(c);
                    return this
                },
                always: function() {
                    i.done.apply(i, arguments).fail.apply(i, arguments);
                    return this
                },
                pipe: function(a, b, c) {
                    return f.Deferred(function(d) {
                        f.each({
                            done: [a, "resolve"],
                            fail: [b, "reject"],
                            progress: [c, "notify"]
                        }, function(a, b) {
                            var c = b[0], e = b[1], g;
                            f.isFunction(c) ? i[a](function() {
                                g = c.apply(this, arguments),
                                g && f.isFunction(g.promise) ? g.promise().then(d.resolve, d.reject, d.notify) : d[e + "With"](this === i ? d : this, [g])
                            }) : i[a](d[e])
                        })
                    }).promise()
                },
                promise: function(a) {
                    if (a == null)
                        a = h;
                    else
                        for (var b in h)
                            a[b] = h[b];
                    return a
                }
            }, i = h.promise({}), j;
            for (j in g)
                i[j] = g[j].fire,
                i[j + "With"] = g[j].fireWith;
            i.done(function() {
                e = "resolved"
            }, c.disable, d.lock).fail(function() {
                e = "rejected"
            }, b.disable, d.lock),
            a && a.call(i, i);
            return i
        },
        when: function(a) {
            function m(a) {
                return function(b) {
                    e[a] = arguments.length > 1 ? i.call(arguments, 0) : b,
                    j.notifyWith(k, e)
                }
            }
            function l(a) {
                return function(c) {
                    b[a] = arguments.length > 1 ? i.call(arguments, 0) : c,
                    --g || j.resolveWith(j, b)
                }
            }
            var b = i.call(arguments, 0)
              , c = 0
              , d = b.length
              , e = Array(d)
              , g = d
              , h = d
              , j = d <= 1 && a && f.isFunction(a.promise) ? a : f.Deferred()
              , k = j.promise();
            if (d > 1) {
                for (; c < d; c++)
                    b[c] && b[c].promise && f.isFunction(b[c].promise) ? b[c].promise().then(l(c), j.reject, m(c)) : --g;
                g || j.resolveWith(j, b)
            } else
                j !== a && j.resolveWith(j, d ? [a] : []);
            return k
        }
    }),
    f.support = function() {
        var b, d, e, g, h, i, j, k, l, m, n, o, p = c.createElement("div"), q = c.documentElement;
        p.setAttribute("className", "t"),
        p.innerHTML = "   <link/><table></table><a href='/a' style='top:1px;float:left;opacity:.55;'>a</a><input type='checkbox'/>",
        d = p.getElementsByTagName("*"),
        e = p.getElementsByTagName("a")[0];
        if (!d || !d.length || !e)
            return {};
        g = c.createElement("select"),
        h = g.appendChild(c.createElement("option")),
        i = p.getElementsByTagName("input")[0],
        b = {
            leadingWhitespace: p.firstChild.nodeType === 3,
            tbody: !p.getElementsByTagName("tbody").length,
            htmlSerialize: !!p.getElementsByTagName("link").length,
            style: /top/.test(e.getAttribute("style")),
            hrefNormalized: e.getAttribute("href") === "/a",
            opacity: /^0.55/.test(e.style.opacity),
            cssFloat: !!e.style.cssFloat,
            checkOn: i.value === "on",
            optSelected: h.selected,
            getSetAttribute: p.className !== "t",
            enctype: !!c.createElement("form").enctype,
            html5Clone: c.createElement("nav").cloneNode(!0).outerHTML !== "<:nav></:nav>",
            submitBubbles: !0,
            changeBubbles: !0,
            focusinBubbles: !1,
            deleteExpando: !0,
            noCloneEvent: !0,
            inlineBlockNeedsLayout: !1,
            shrinkWrapBlocks: !1,
            reliableMarginRight: !0,
            pixelMargin: !0
        },
        f.boxModel = b.boxModel = c.compatMode === "CSS1Compat",
        i.checked = !0,
        b.noCloneChecked = i.cloneNode(!0).checked,
        g.disabled = !0,
        b.optDisabled = !h.disabled;
        try {
            delete p.test
        } catch (r) {
            b.deleteExpando = !1
        }
        !p.addEventListener && p.attachEvent && p.fireEvent && (p.attachEvent("onclick", function() {
            b.noCloneEvent = !1
        }),
        p.cloneNode(!0).fireEvent("onclick")),
        i = c.createElement("input"),
        i.value = "t",
        i.setAttribute("type", "radio"),
        b.radioValue = i.value === "t",
        i.setAttribute("checked", "checked"),
        i.setAttribute("name", "t"),
        p.appendChild(i),
        j = c.createDocumentFragment(),
        j.appendChild(p.lastChild),
        b.checkClone = j.cloneNode(!0).cloneNode(!0).lastChild.checked,
        b.appendChecked = i.checked,
        j.removeChild(i),
        j.appendChild(p);
        if (p.attachEvent)
            for (n in {
                submit: 1,
                change: 1,
                focusin: 1
            })
                m = "on" + n,
                o = m in p,
                o || (p.setAttribute(m, "return;"),
                o = typeof p[m] == "function"),
                b[n + "Bubbles"] = o;
        j.removeChild(p),
        j = g = h = p = i = null,
        f(function() {
            var d, e, g, h, i, j, l, m, n, q, r, s, t, u = c.getElementsByTagName("body")[0];
            !u || (m = 1,
            t = "padding:0;margin:0;border:",
            r = "position:absolute;top:0;left:0;width:1px;height:1px;",
            s = t + "0;visibility:hidden;",
            n = "style='" + r + t + "5px solid #000;",
            q = "<div " + n + "display:block;'><div style='" + t + "0;display:block;overflow:hidden;'></div></div>" + "<table " + n + "' cellpadding='0' cellspacing='0'>" + "<tr><td></td></tr></table>",
            d = c.createElement("div"),
            d.style.cssText = s + "width:0;height:0;position:static;top:0;margin-top:" + m + "px",
            u.insertBefore(d, u.firstChild),
            p = c.createElement("div"),
            d.appendChild(p),
            p.innerHTML = "<table><tr><td style='" + t + "0;display:none'></td><td>t</td></tr></table>",
            k = p.getElementsByTagName("td"),
            o = k[0].offsetHeight === 0,
            k[0].style.display = "",
            k[1].style.display = "none",
            b.reliableHiddenOffsets = o && k[0].offsetHeight === 0,
            a.getComputedStyle && (p.innerHTML = "",
            l = c.createElement("div"),
            l.style.width = "0",
            l.style.marginRight = "0",
            p.style.width = "2px",
            p.appendChild(l),
            b.reliableMarginRight = (parseInt((a.getComputedStyle(l, null) || {
                marginRight: 0
            }).marginRight, 10) || 0) === 0),
            typeof p.style.zoom != "undefined" && (p.innerHTML = "",
            p.style.width = p.style.padding = "1px",
            p.style.border = 0,
            p.style.overflow = "hidden",
            p.style.display = "inline",
            p.style.zoom = 1,
            b.inlineBlockNeedsLayout = p.offsetWidth === 3,
            p.style.display = "block",
            p.style.overflow = "visible",
            p.innerHTML = "<div style='width:5px;'></div>",
            b.shrinkWrapBlocks = p.offsetWidth !== 3),
            p.style.cssText = r + s,
            p.innerHTML = q,
            e = p.firstChild,
            g = e.firstChild,
            i = e.nextSibling.firstChild.firstChild,
            j = {
                doesNotAddBorder: g.offsetTop !== 5,
                doesAddBorderForTableAndCells: i.offsetTop === 5
            },
            g.style.position = "fixed",
            g.style.top = "20px",
            j.fixedPosition = g.offsetTop === 20 || g.offsetTop === 15,
            g.style.position = g.style.top = "",
            e.style.overflow = "hidden",
            e.style.position = "relative",
            j.subtractsBorderForOverflowNotVisible = g.offsetTop === -5,
            j.doesNotIncludeMarginInBodyOffset = u.offsetTop !== m,
            a.getComputedStyle && (p.style.marginTop = "1%",
            b.pixelMargin = (a.getComputedStyle(p, null) || {
                marginTop: 0
            }).marginTop !== "1%"),
            typeof d.style.zoom != "undefined" && (d.style.zoom = 1),
            u.removeChild(d),
            l = p = d = null,
            f.extend(b, j))
        });
        return b
    }();
    var j = /^(?:\{.*\}|\[.*\])$/
      , k = /([A-Z])/g;
    f.extend({
        cache: {},
        uuid: 0,
        expando: "jQuery" + (f.fn.jquery + Math.random()).replace(/\D/g, ""),
        noData: {
            embed: !0,
            object: "clsid:D27CDB6E-AE6D-11cf-96B8-444553540000",
            applet: !0
        },
        hasData: function(a) {
            a = a.nodeType ? f.cache[a[f.expando]] : a[f.expando];
            return !!a && !m(a)
        },
        data: function(a, c, d, e) {
            if (!!f.acceptData(a)) {
                var g, h, i, j = f.expando, k = typeof c == "string", l = a.nodeType, m = l ? f.cache : a, n = l ? a[j] : a[j] && j, o = c === "events";
                if ((!n || !m[n] || !o && !e && !m[n].data) && k && d === b)
                    return;
                n || (l ? a[j] = n = ++f.uuid : n = j),
                m[n] || (m[n] = {},
                l || (m[n].toJSON = f.noop));
                if (typeof c == "object" || typeof c == "function")
                    e ? m[n] = f.extend(m[n], c) : m[n].data = f.extend(m[n].data, c);
                g = h = m[n],
                e || (h.data || (h.data = {}),
                h = h.data),
                d !== b && (h[f.camelCase(c)] = d);
                if (o && !h[c])
                    return g.events;
                k ? (i = h[c],
                i == null && (i = h[f.camelCase(c)])) : i = h;
                return i
            }
        },
        removeData: function(a, b, c) {
            if (!!f.acceptData(a)) {
                var d, e, g, h = f.expando, i = a.nodeType, j = i ? f.cache : a, k = i ? a[h] : h;
                if (!j[k])
                    return;
                if (b) {
                    d = c ? j[k] : j[k].data;
                    if (d) {
                        f.isArray(b) || (b in d ? b = [b] : (b = f.camelCase(b),
                        b in d ? b = [b] : b = b.split(" ")));
                        for (e = 0,
                        g = b.length; e < g; e++)
                            delete d[b[e]];
                        if (!(c ? m : f.isEmptyObject)(d))
                            return
                    }
                }
                if (!c) {
                    delete j[k].data;
                    if (!m(j[k]))
                        return
                }
                f.support.deleteExpando || !j.setInterval ? delete j[k] : j[k] = null,
                i && (f.support.deleteExpando ? delete a[h] : a.removeAttribute ? a.removeAttribute(h) : a[h] = null)
            }
        },
        _data: function(a, b, c) {
            return f.data(a, b, c, !0)
        },
        acceptData: function(a) {
            if (a.nodeName) {
                var b = f.noData[a.nodeName.toLowerCase()];
                if (b)
                    return b !== !0 && a.getAttribute("classid") === b
            }
            return !0
        }
    }),
    f.fn.extend({
        data: function(a, c) {
            var d, e, g, h, i, j = this[0], k = 0, m = null;
            if (a === b) {
                if (this.length) {
                    m = f.data(j);
                    if (j.nodeType === 1 && !f._data(j, "parsedAttrs")) {
                        g = j.attributes;
                        for (i = g.length; k < i; k++)
                            h = g[k].name,
                            h.indexOf("data-") === 0 && (h = f.camelCase(h.substring(5)),
                            l(j, h, m[h]));
                        f._data(j, "parsedAttrs", !0)
                    }
                }
                return m
            }
            if (typeof a == "object")
                return this.each(function() {
                    f.data(this, a)
                });
            d = a.split(".", 2),
            d[1] = d[1] ? "." + d[1] : "",
            e = d[1] + "!";
            return f.access(this, function(c) {
                if (c === b) {
                    m = this.triggerHandler("getData" + e, [d[0]]),
                    m === b && j && (m = f.data(j, a),
                    m = l(j, a, m));
                    return m === b && d[1] ? this.data(d[0]) : m
                }
                d[1] = c,
                this.each(function() {
                    var b = f(this);
                    b.triggerHandler("setData" + e, d),
                    f.data(this, a, c),
                    b.triggerHandler("changeData" + e, d)
                })
            }, null, c, arguments.length > 1, null, !1)
        },
        removeData: function(a) {
            return this.each(function() {
                f.removeData(this, a)
            })
        }
    }),
    f.extend({
        _mark: function(a, b) {
            a && (b = (b || "fx") + "mark",
            f._data(a, b, (f._data(a, b) || 0) + 1))
        },
        _unmark: function(a, b, c) {
            a !== !0 && (c = b,
            b = a,
            a = !1);
            if (b) {
                c = c || "fx";
                var d = c + "mark"
                  , e = a ? 0 : (f._data(b, d) || 1) - 1;
                e ? f._data(b, d, e) : (f.removeData(b, d, !0),
                n(b, c, "mark"))
            }
        },
        queue: function(a, b, c) {
            var d;
            if (a) {
                b = (b || "fx") + "queue",
                d = f._data(a, b),
                c && (!d || f.isArray(c) ? d = f._data(a, b, f.makeArray(c)) : d.push(c));
                return d || []
            }
        },
        dequeue: function(a, b) {
            b = b || "fx";
            var c = f.queue(a, b)
              , d = c.shift()
              , e = {};
            d === "inprogress" && (d = c.shift()),
            d && (b === "fx" && c.unshift("inprogress"),
            f._data(a, b + ".run", e),
            d.call(a, function() {
                f.dequeue(a, b)
            }, e)),
            c.length || (f.removeData(a, b + "queue " + b + ".run", !0),
            n(a, b, "queue"))
        }
    }),
    f.fn.extend({
        queue: function(a, c) {
            var d = 2;
            typeof a != "string" && (c = a,
            a = "fx",
            d--);
            if (arguments.length < d)
                return f.queue(this[0], a);
            return c === b ? this : this.each(function() {
                var b = f.queue(this, a, c);
                a === "fx" && b[0] !== "inprogress" && f.dequeue(this, a)
            })
        },
        dequeue: function(a) {
            return this.each(function() {
                f.dequeue(this, a)
            })
        },
        delay: function(a, b) {
            a = f.fx ? f.fx.speeds[a] || a : a,
            b = b || "fx";
            return this.queue(b, function(b, c) {
                var d = setTimeout(b, a);
                c.stop = function() {
                    clearTimeout(d)
                }
            })
        },
        clearQueue: function(a) {
            return this.queue(a || "fx", [])
        },
        promise: function(a, c) {
            function m() {
                --h || d.resolveWith(e, [e])
            }
            typeof a != "string" && (c = a,
            a = b),
            a = a || "fx";
            var d = f.Deferred(), e = this, g = e.length, h = 1, i = a + "defer", j = a + "queue", k = a + "mark", l;
            while (g--)
                if (l = f.data(e[g], i, b, !0) || (f.data(e[g], j, b, !0) || f.data(e[g], k, b, !0)) && f.data(e[g], i, f.Callbacks("once memory"), !0))
                    h++,
                    l.add(m);
            m();
            return d.promise(c)
        }
    });
    var o = /[\n\t\r]/g, p = /\s+/, q = /\r/g, r = /^(?:button|input)$/i, s = /^(?:button|input|object|select|textarea)$/i, t = /^a(?:rea)?$/i, u = /^(?:autofocus|autoplay|async|checked|controls|defer|disabled|hidden|loop|multiple|open|readonly|required|scoped|selected)$/i, v = f.support.getSetAttribute, w, x, y;
    f.fn.extend({
        attr: function(a, b) {
            return f.access(this, f.attr, a, b, arguments.length > 1)
        },
        removeAttr: function(a) {
            return this.each(function() {
                f.removeAttr(this, a)
            })
        },
        prop: function(a, b) {
            return f.access(this, f.prop, a, b, arguments.length > 1)
        },
        removeProp: function(a) {
            a = f.propFix[a] || a;
            return this.each(function() {
                try {
                    this[a] = b,
                    delete this[a]
                } catch (c) {}
            })
        },
        addClass: function(a) {
            var b, c, d, e, g, h, i;
            if (f.isFunction(a))
                return this.each(function(b) {
                    f(this).addClass(a.call(this, b, this.className))
                });
            if (a && typeof a == "string") {
                b = a.split(p);
                for (c = 0,
                d = this.length; c < d; c++) {
                    e = this[c];
                    if (e.nodeType === 1)
                        if (!e.className && b.length === 1)
                            e.className = a;
                        else {
                            g = " " + e.className + " ";
                            for (h = 0,
                            i = b.length; h < i; h++)
                                ~g.indexOf(" " + b[h] + " ") || (g += b[h] + " ");
                            e.className = f.trim(g)
                        }
                }
            }
            return this
        },
        removeClass: function(a) {
            var c, d, e, g, h, i, j;
            if (f.isFunction(a))
                return this.each(function(b) {
                    f(this).removeClass(a.call(this, b, this.className))
                });
            if (a && typeof a == "string" || a === b) {
                c = (a || "").split(p);
                for (d = 0,
                e = this.length; d < e; d++) {
                    g = this[d];
                    if (g.nodeType === 1 && g.className)
                        if (a) {
                            h = (" " + g.className + " ").replace(o, " ");
                            for (i = 0,
                            j = c.length; i < j; i++)
                                h = h.replace(" " + c[i] + " ", " ");
                            g.className = f.trim(h)
                        } else
                            g.className = ""
                }
            }
            return this
        },
        toggleClass: function(a, b) {
            var c = typeof a
              , d = typeof b == "boolean";
            if (f.isFunction(a))
                return this.each(function(c) {
                    f(this).toggleClass(a.call(this, c, this.className, b), b)
                });
            return this.each(function() {
                if (c === "string") {
                    var e, g = 0, h = f(this), i = b, j = a.split(p);
                    while (e = j[g++])
                        i = d ? i : !h.hasClass(e),
                        h[i ? "addClass" : "removeClass"](e)
                } else if (c === "undefined" || c === "boolean")
                    this.className && f._data(this, "__className__", this.className),
                    this.className = this.className || a === !1 ? "" : f._data(this, "__className__") || ""
            })
        },
        hasClass: function(a) {
            var b = " " + a + " "
              , c = 0
              , d = this.length;
            for (; c < d; c++)
                if (this[c].nodeType === 1 && (" " + this[c].className + " ").replace(o, " ").indexOf(b) > -1)
                    return !0;
            return !1
        },
        val: function(a) {
            var c, d, e, g = this[0];
            {
                if (!!arguments.length) {
                    e = f.isFunction(a);
                    return this.each(function(d) {
                        var g = f(this), h;
                        if (this.nodeType === 1) {
                            e ? h = a.call(this, d, g.val()) : h = a,
                            h == null ? h = "" : typeof h == "number" ? h += "" : f.isArray(h) && (h = f.map(h, function(a) {
                                return a == null ? "" : a + ""
                            })),
                            c = f.valHooks[this.type] || f.valHooks[this.nodeName.toLowerCase()];
                            if (!c || !("set"in c) || c.set(this, h, "value") === b)
                                this.value = h
                        }
                    })
                }
                if (g) {
                    c = f.valHooks[g.type] || f.valHooks[g.nodeName.toLowerCase()];
                    if (c && "get"in c && (d = c.get(g, "value")) !== b)
                        return d;
                    d = g.value;
                    return typeof d == "string" ? d.replace(q, "") : d == null ? "" : d
                }
            }
        }
    }),
    f.extend({
        valHooks: {
            option: {
                get: function(a) {
                    var b = a.attributes.value;
                    return !b || b.specified ? a.value : a.text
                }
            },
            select: {
                get: function(a) {
                    var b, c, d, e, g = a.selectedIndex, h = [], i = a.options, j = a.type === "select-one";
                    if (g < 0)
                        return null;
                    c = j ? g : 0,
                    d = j ? g + 1 : i.length;
                    for (; c < d; c++) {
                        e = i[c];
                        if (e.selected && (f.support.optDisabled ? !e.disabled : e.getAttribute("disabled") === null) && (!e.parentNode.disabled || !f.nodeName(e.parentNode, "optgroup"))) {
                            b = f(e).val();
                            if (j)
                                return b;
                            h.push(b)
                        }
                    }
                    if (j && !h.length && i.length)
                        return f(i[g]).val();
                    return h
                },
                set: function(a, b) {
                    var c = f.makeArray(b);
                    f(a).find("option").each(function() {
                        this.selected = f.inArray(f(this).val(), c) >= 0
                    }),
                    c.length || (a.selectedIndex = -1);
                    return c
                }
            }
        },
        attrFn: {
            val: !0,
            css: !0,
            html: !0,
            text: !0,
            data: !0,
            width: !0,
            height: !0,
            offset: !0
        },
        attr: function(a, c, d, e) {
            var g, h, i, j = a.nodeType;
            if (!!a && j !== 3 && j !== 8 && j !== 2) {
                if (e && c in f.attrFn)
                    return f(a)[c](d);
                if (typeof a.getAttribute == "undefined")
                    return f.prop(a, c, d);
                i = j !== 1 || !f.isXMLDoc(a),
                i && (c = c.toLowerCase(),
                h = f.attrHooks[c] || (u.test(c) ? x : w));
                if (d !== b) {
                    if (d === null) {
                        f.removeAttr(a, c);
                        return
                    }
                    if (h && "set"in h && i && (g = h.set(a, d, c)) !== b)
                        return g;
                    a.setAttribute(c, "" + d);
                    return d
                }
                if (h && "get"in h && i && (g = h.get(a, c)) !== null)
                    return g;
                g = a.getAttribute(c);
                return g === null ? b : g
            }
        },
        removeAttr: function(a, b) {
            var c, d, e, g, h, i = 0;
            if (b && a.nodeType === 1) {
                d = b.toLowerCase().split(p),
                g = d.length;
                for (; i < g; i++)
                    e = d[i],
                    e && (c = f.propFix[e] || e,
                    h = u.test(e),
                    h || f.attr(a, e, ""),
                    a.removeAttribute(v ? e : c),
                    h && c in a && (a[c] = !1))
            }
        },
        attrHooks: {
            type: {
                set: function(a, b) {
                    if (r.test(a.nodeName) && a.parentNode)
                        f.error("type property can't be changed");
                    else if (!f.support.radioValue && b === "radio" && f.nodeName(a, "input")) {
                        var c = a.value;
                        a.setAttribute("type", b),
                        c && (a.value = c);
                        return b
                    }
                }
            },
            value: {
                get: function(a, b) {
                    if (w && f.nodeName(a, "button"))
                        return w.get(a, b);
                    return b in a ? a.value : null
                },
                set: function(a, b, c) {
                    if (w && f.nodeName(a, "button"))
                        return w.set(a, b, c);
                    a.value = b
                }
            }
        },
        propFix: {
            tabindex: "tabIndex",
            readonly: "readOnly",
            "for": "htmlFor",
            "class": "className",
            maxlength: "maxLength",
            cellspacing: "cellSpacing",
            cellpadding: "cellPadding",
            rowspan: "rowSpan",
            colspan: "colSpan",
            usemap: "useMap",
            frameborder: "frameBorder",
            contenteditable: "contentEditable"
        },
        prop: function(a, c, d) {
            var e, g, h, i = a.nodeType;
            if (!!a && i !== 3 && i !== 8 && i !== 2) {
                h = i !== 1 || !f.isXMLDoc(a),
                h && (c = f.propFix[c] || c,
                g = f.propHooks[c]);
                return d !== b ? g && "set"in g && (e = g.set(a, d, c)) !== b ? e : a[c] = d : g && "get"in g && (e = g.get(a, c)) !== null ? e : a[c]
            }
        },
        propHooks: {
            tabIndex: {
                get: function(a) {
                    var c = a.getAttributeNode("tabindex");
                    return c && c.specified ? parseInt(c.value, 10) : s.test(a.nodeName) || t.test(a.nodeName) && a.href ? 0 : b
                }
            }
        }
    }),
    f.attrHooks.tabindex = f.propHooks.tabIndex,
    x = {
        get: function(a, c) {
            var d, e = f.prop(a, c);
            return e === !0 || typeof e != "boolean" && (d = a.getAttributeNode(c)) && d.nodeValue !== !1 ? c.toLowerCase() : b
        },
        set: function(a, b, c) {
            var d;
            b === !1 ? f.removeAttr(a, c) : (d = f.propFix[c] || c,
            d in a && (a[d] = !0),
            a.setAttribute(c, c.toLowerCase()));
            return c
        }
    },
    v || (y = {
        name: !0,
        id: !0,
        coords: !0
    },
    w = f.valHooks.button = {
        get: function(a, c) {
            var d;
            d = a.getAttributeNode(c);
            return d && (y[c] ? d.nodeValue !== "" : d.specified) ? d.nodeValue : b
        },
        set: function(a, b, d) {
            var e = a.getAttributeNode(d);
            e || (e = c.createAttribute(d),
            a.setAttributeNode(e));
            return e.nodeValue = b + ""
        }
    },
    f.attrHooks.tabindex.set = w.set,
    f.each(["width", "height"], function(a, b) {
        f.attrHooks[b] = f.extend(f.attrHooks[b], {
            set: function(a, c) {
                if (c === "") {
                    a.setAttribute(b, "auto");
                    return c
                }
            }
        })
    }),
    f.attrHooks.contenteditable = {
        get: w.get,
        set: function(a, b, c) {
            b === "" && (b = "false"),
            w.set(a, b, c)
        }
    }),
    f.support.hrefNormalized || f.each(["href", "src", "width", "height"], function(a, c) {
        f.attrHooks[c] = f.extend(f.attrHooks[c], {
            get: function(a) {
                var d = a.getAttribute(c, 2);
                return d === null ? b : d
            }
        })
    }),
    f.support.style || (f.attrHooks.style = {
        get: function(a) {
            return a.style.cssText.toLowerCase() || b
        },
        set: function(a, b) {
            return a.style.cssText = "" + b
        }
    }),
    f.support.optSelected || (f.propHooks.selected = f.extend(f.propHooks.selected, {
        get: function(a) {
            var b = a.parentNode;
            b && (b.selectedIndex,
            b.parentNode && b.parentNode.selectedIndex);
            return null
        }
    })),
    f.support.enctype || (f.propFix.enctype = "encoding"),
    f.support.checkOn || f.each(["radio", "checkbox"], function() {
        f.valHooks[this] = {
            get: function(a) {
                return a.getAttribute("value") === null ? "on" : a.value
            }
        }
    }),
    f.each(["radio", "checkbox"], function() {
        f.valHooks[this] = f.extend(f.valHooks[this], {
            set: function(a, b) {
                if (f.isArray(b))
                    return a.checked = f.inArray(f(a).val(), b) >= 0
            }
        })
    });
    var z = /^(?:textarea|input|select)$/i
      , A = /^([^\.]*)?(?:\.(.+))?$/
      , B = /(?:^|\s)hover(\.\S+)?\b/
      , C = /^key/
      , D = /^(?:mouse|contextmenu)|click/
      , E = /^(?:focusinfocus|focusoutblur)$/
      , F = /^(\w*)(?:#([\w\-]+))?(?:\.([\w\-]+))?$/
      , G = function(a) {
        var b = F.exec(a);
        b && (b[1] = (b[1] || "").toLowerCase(),
        b[3] = b[3] && new RegExp("(?:^|\\s)" + b[3] + "(?:\\s|$)"));
        return b
    }
      , H = function(a, b) {
        var c = a.attributes || {};
        return (!b[1] || a.nodeName.toLowerCase() === b[1]) && (!b[2] || (c.id || {}).value === b[2]) && (!b[3] || b[3].test((c["class"] || {}).value))
    }
      , I = function(a) {
        return f.event.special.hover ? a : a.replace(B, "mouseenter$1 mouseleave$1")
    };
    f.event = {
        add: function(a, c, d, e, g) {
            var h, i, j, k, l, m, n, o, p, q, r, s;
            if (!(a.nodeType === 3 || a.nodeType === 8 || !c || !d || !(h = f._data(a)))) {
                d.handler && (p = d,
                d = p.handler,
                g = p.selector),
                d.guid || (d.guid = f.guid++),
                j = h.events,
                j || (h.events = j = {}),
                i = h.handle,
                i || (h.handle = i = function(a) {
                    return typeof f != "undefined" && (!a || f.event.triggered !== a.type) ? f.event.dispatch.apply(i.elem, arguments) : b
                }
                ,
                i.elem = a),
                c = f.trim(I(c)).split(" ");
                for (k = 0; k < c.length; k++) {
                    l = A.exec(c[k]) || [],
                    m = l[1],
                    n = (l[2] || "").split(".").sort(),
                    s = f.event.special[m] || {},
                    m = (g ? s.delegateType : s.bindType) || m,
                    s = f.event.special[m] || {},
                    o = f.extend({
                        type: m,
                        origType: l[1],
                        data: e,
                        handler: d,
                        guid: d.guid,
                        selector: g,
                        quick: g && G(g),
                        namespace: n.join(".")
                    }, p),
                    r = j[m];
                    if (!r) {
                        r = j[m] = [],
                        r.delegateCount = 0;
                        if (!s.setup || s.setup.call(a, e, n, i) === !1)
                            a.addEventListener ? a.addEventListener(m, i, !1) : a.attachEvent && a.attachEvent("on" + m, i)
                    }
                    s.add && (s.add.call(a, o),
                    o.handler.guid || (o.handler.guid = d.guid)),
                    g ? r.splice(r.delegateCount++, 0, o) : r.push(o),
                    f.event.global[m] = !0
                }
                a = null
            }
        },
        global: {},
        remove: function(a, b, c, d, e) {
            var g = f.hasData(a) && f._data(a), h, i, j, k, l, m, n, o, p, q, r, s;
            if (!!g && !!(o = g.events)) {
                b = f.trim(I(b || "")).split(" ");
                for (h = 0; h < b.length; h++) {
                    i = A.exec(b[h]) || [],
                    j = k = i[1],
                    l = i[2];
                    if (!j) {
                        for (j in o)
                            f.event.remove(a, j + b[h], c, d, !0);
                        continue
                    }
                    p = f.event.special[j] || {},
                    j = (d ? p.delegateType : p.bindType) || j,
                    r = o[j] || [],
                    m = r.length,
                    l = l ? new RegExp("(^|\\.)" + l.split(".").sort().join("\\.(?:.*\\.)?") + "(\\.|$)") : null;
                    for (n = 0; n < r.length; n++)
                        s = r[n],
                        (e || k === s.origType) && (!c || c.guid === s.guid) && (!l || l.test(s.namespace)) && (!d || d === s.selector || d === "**" && s.selector) && (r.splice(n--, 1),
                        s.selector && r.delegateCount--,
                        p.remove && p.remove.call(a, s));
                    r.length === 0 && m !== r.length && ((!p.teardown || p.teardown.call(a, l) === !1) && f.removeEvent(a, j, g.handle),
                    delete o[j])
                }
                f.isEmptyObject(o) && (q = g.handle,
                q && (q.elem = null),
                f.removeData(a, ["events", "handle"], !0))
            }
        },
        customEvent: {
            getData: !0,
            setData: !0,
            changeData: !0
        },
        trigger: function(c, d, e, g) {
            if (!e || e.nodeType !== 3 && e.nodeType !== 8) {
                var h = c.type || c, i = [], j, k, l, m, n, o, p, q, r, s;
                if (E.test(h + f.event.triggered))
                    return;
                h.indexOf("!") >= 0 && (h = h.slice(0, -1),
                k = !0),
                h.indexOf(".") >= 0 && (i = h.split("."),
                h = i.shift(),
                i.sort());
                if ((!e || f.event.customEvent[h]) && !f.event.global[h])
                    return;
                c = typeof c == "object" ? c[f.expando] ? c : new f.Event(h,c) : new f.Event(h),
                c.type = h,
                c.isTrigger = !0,
                c.exclusive = k,
                c.namespace = i.join("."),
                c.namespace_re = c.namespace ? new RegExp("(^|\\.)" + i.join("\\.(?:.*\\.)?") + "(\\.|$)") : null,
                o = h.indexOf(":") < 0 ? "on" + h : "";
                if (!e) {
                    j = f.cache;
                    for (l in j)
                        j[l].events && j[l].events[h] && f.event.trigger(c, d, j[l].handle.elem, !0);
                    return
                }
                c.result = b,
                c.target || (c.target = e),
                d = d != null ? f.makeArray(d) : [],
                d.unshift(c),
                p = f.event.special[h] || {};
                if (p.trigger && p.trigger.apply(e, d) === !1)
                    return;
                r = [[e, p.bindType || h]];
                if (!g && !p.noBubble && !f.isWindow(e)) {
                    s = p.delegateType || h,
                    m = E.test(s + h) ? e : e.parentNode,
                    n = null;
                    for (; m; m = m.parentNode)
                        r.push([m, s]),
                        n = m;
                    n && n === e.ownerDocument && r.push([n.defaultView || n.parentWindow || a, s])
                }
                for (l = 0; l < r.length && !c.isPropagationStopped(); l++)
                    m = r[l][0],
                    c.type = r[l][1],
                    q = (f._data(m, "events") || {})[c.type] && f._data(m, "handle"),
                    q && q.apply(m, d),
                    q = o && m[o],
                    q && f.acceptData(m) && q.apply(m, d) === !1 && c.preventDefault();
                c.type = h,
                !g && !c.isDefaultPrevented() && (!p._default || p._default.apply(e.ownerDocument, d) === !1) && (h !== "click" || !f.nodeName(e, "a")) && f.acceptData(e) && o && e[h] && (h !== "focus" && h !== "blur" || c.target.offsetWidth !== 0) && !f.isWindow(e) && (n = e[o],
                n && (e[o] = null),
                f.event.triggered = h,
                e[h](),
                f.event.triggered = b,
                n && (e[o] = n));
                return c.result
            }
        },
        dispatch: function(c) {
            c = f.event.fix(c || a.event);
            var d = (f._data(this, "events") || {})[c.type] || [], e = d.delegateCount, g = [].slice.call(arguments, 0), h = !c.exclusive && !c.namespace, i = f.event.special[c.type] || {}, j = [], k, l, m, n, o, p, q, r, s, t, u;
            g[0] = c,
            c.delegateTarget = this;
            if (!i.preDispatch || i.preDispatch.call(this, c) !== !1) {
                if (e && (!c.button || c.type !== "click")) {
                    n = f(this),
                    n.context = this.ownerDocument || this;
                    for (m = c.target; m != this; m = m.parentNode || this)
                        if (m.disabled !== !0) {
                            p = {},
                            r = [],
                            n[0] = m;
                            for (k = 0; k < e; k++)
                                s = d[k],
                                t = s.selector,
                                p[t] === b && (p[t] = s.quick ? H(m, s.quick) : n.is(t)),
                                p[t] && r.push(s);
                            r.length && j.push({
                                elem: m,
                                matches: r
                            })
                        }
                }
                d.length > e && j.push({
                    elem: this,
                    matches: d.slice(e)
                });
                for (k = 0; k < j.length && !c.isPropagationStopped(); k++) {
                    q = j[k],
                    c.currentTarget = q.elem;
                    for (l = 0; l < q.matches.length && !c.isImmediatePropagationStopped(); l++) {
                        s = q.matches[l];
                        if (h || !c.namespace && !s.namespace || c.namespace_re && c.namespace_re.test(s.namespace))
                            c.data = s.data,
                            c.handleObj = s,
                            o = ((f.event.special[s.origType] || {}).handle || s.handler).apply(q.elem, g),
                            o !== b && (c.result = o,
                            o === !1 && (c.preventDefault(),
                            c.stopPropagation()))
                    }
                }
                i.postDispatch && i.postDispatch.call(this, c);
                return c.result
            }
        },
        props: "attrChange attrName relatedNode srcElement altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" "),
        fixHooks: {},
        keyHooks: {
            props: "char charCode key keyCode".split(" "),
            filter: function(a, b) {
                a.which == null && (a.which = b.charCode != null ? b.charCode : b.keyCode);
                return a
            }
        },
        mouseHooks: {
            props: "button buttons clientX clientY fromElement offsetX offsetY pageX pageY screenX screenY toElement".split(" "),
            filter: function(a, d) {
                var e, f, g, h = d.button, i = d.fromElement;
                a.pageX == null && d.clientX != null && (e = a.target.ownerDocument || c,
                f = e.documentElement,
                g = e.body,
                a.pageX = d.clientX + (f && f.scrollLeft || g && g.scrollLeft || 0) - (f && f.clientLeft || g && g.clientLeft || 0),
                a.pageY = d.clientY + (f && f.scrollTop || g && g.scrollTop || 0) - (f && f.clientTop || g && g.clientTop || 0)),
                !a.relatedTarget && i && (a.relatedTarget = i === a.target ? d.toElement : i),
                !a.which && h !== b && (a.which = h & 1 ? 1 : h & 2 ? 3 : h & 4 ? 2 : 0);
                return a
            }
        },
        fix: function(a) {
            if (a[f.expando])
                return a;
            var d, e, g = a, h = f.event.fixHooks[a.type] || {}, i = h.props ? this.props.concat(h.props) : this.props;
            a = f.Event(g);
            for (d = i.length; d; )
                e = i[--d],
                a[e] = g[e];
            a.target || (a.target = g.srcElement || c),
            a.target.nodeType === 3 && (a.target = a.target.parentNode),
            a.metaKey === b && (a.metaKey = a.ctrlKey);
            return h.filter ? h.filter(a, g) : a
        },
        special: {
            ready: {
                setup: f.bindReady
            },
            load: {
                noBubble: !0
            },
            focus: {
                delegateType: "focusin"
            },
            blur: {
                delegateType: "focusout"
            },
            beforeunload: {
                setup: function(a, b, c) {
                    f.isWindow(this) && (this.onbeforeunload = c)
                },
                teardown: function(a, b) {
                    this.onbeforeunload === b && (this.onbeforeunload = null)
                }
            }
        },
        simulate: function(a, b, c, d) {
            var e = f.extend(new f.Event, c, {
                type: a,
                isSimulated: !0,
                originalEvent: {}
            });
            d ? f.event.trigger(e, null, b) : f.event.dispatch.call(b, e),
            e.isDefaultPrevented() && c.preventDefault()
        }
    },
    f.event.handle = f.event.dispatch,
    f.removeEvent = c.removeEventListener ? function(a, b, c) {
        a.removeEventListener && a.removeEventListener(b, c, !1)
    }
    : function(a, b, c) {
        a.detachEvent && a.detachEvent("on" + b, c)
    }
    ,
    f.Event = function(a, b) {
        if (!(this instanceof f.Event))
            return new f.Event(a,b);
        a && a.type ? (this.originalEvent = a,
        this.type = a.type,
        this.isDefaultPrevented = a.defaultPrevented || a.returnValue === !1 || a.getPreventDefault && a.getPreventDefault() ? K : J) : this.type = a,
        b && f.extend(this, b),
        this.timeStamp = a && a.timeStamp || f.now(),
        this[f.expando] = !0
    }
    ,
    f.Event.prototype = {
        preventDefault: function() {
            this.isDefaultPrevented = K;
            var a = this.originalEvent;
            !a || (a.preventDefault ? a.preventDefault() : a.returnValue = !1)
        },
        stopPropagation: function() {
            this.isPropagationStopped = K;
            var a = this.originalEvent;
            !a || (a.stopPropagation && a.stopPropagation(),
            a.cancelBubble = !0)
        },
        stopImmediatePropagation: function() {
            this.isImmediatePropagationStopped = K,
            this.stopPropagation()
        },
        isDefaultPrevented: J,
        isPropagationStopped: J,
        isImmediatePropagationStopped: J
    },
    f.each({
        mouseenter: "mouseover",
        mouseleave: "mouseout"
    }, function(a, b) {
        f.event.special[a] = {
            delegateType: b,
            bindType: b,
            handle: function(a) {
                var c = this, d = a.relatedTarget, e = a.handleObj, g = e.selector, h;
                if (!d || d !== c && !f.contains(c, d))
                    a.type = e.origType,
                    h = e.handler.apply(this, arguments),
                    a.type = b;
                return h
            }
        }
    }),
    f.support.submitBubbles || (f.event.special.submit = {
        setup: function() {
            if (f.nodeName(this, "form"))
                return !1;
            f.event.add(this, "click._submit keypress._submit", function(a) {
                var c = a.target
                  , d = f.nodeName(c, "input") || f.nodeName(c, "button") ? c.form : b;
                d && !d._submit_attached && (f.event.add(d, "submit._submit", function(a) {
                    a._submit_bubble = !0
                }),
                d._submit_attached = !0)
            })
        },
        postDispatch: function(a) {
            a._submit_bubble && (delete a._submit_bubble,
            this.parentNode && !a.isTrigger && f.event.simulate("submit", this.parentNode, a, !0))
        },
        teardown: function() {
            if (f.nodeName(this, "form"))
                return !1;
            f.event.remove(this, "._submit")
        }
    }),
    f.support.changeBubbles || (f.event.special.change = {
        setup: function() {
            if (z.test(this.nodeName)) {
                if (this.type === "checkbox" || this.type === "radio")
                    f.event.add(this, "propertychange._change", function(a) {
                        a.originalEvent.propertyName === "checked" && (this._just_changed = !0)
                    }),
                    f.event.add(this, "click._change", function(a) {
                        this._just_changed && !a.isTrigger && (this._just_changed = !1,
                        f.event.simulate("change", this, a, !0))
                    });
                return !1
            }
            f.event.add(this, "beforeactivate._change", function(a) {
                var b = a.target;
                z.test(b.nodeName) && !b._change_attached && (f.event.add(b, "change._change", function(a) {
                    this.parentNode && !a.isSimulated && !a.isTrigger && f.event.simulate("change", this.parentNode, a, !0)
                }),
                b._change_attached = !0)
            })
        },
        handle: function(a) {
            var b = a.target;
            if (this !== b || a.isSimulated || a.isTrigger || b.type !== "radio" && b.type !== "checkbox")
                return a.handleObj.handler.apply(this, arguments)
        },
        teardown: function() {
            f.event.remove(this, "._change");
            return z.test(this.nodeName)
        }
    }),
    f.support.focusinBubbles || f.each({
        focus: "focusin",
        blur: "focusout"
    }, function(a, b) {
        var d = 0
          , e = function(a) {
            f.event.simulate(b, a.target, f.event.fix(a), !0)
        };
        f.event.special[b] = {
            setup: function() {
                d++ === 0 && c.addEventListener(a, e, !0)
            },
            teardown: function() {
                --d === 0 && c.removeEventListener(a, e, !0)
            }
        }
    }),
    f.fn.extend({
        on: function(a, c, d, e, g) {
            var h, i;
            if (typeof a == "object") {
                typeof c != "string" && (d = d || c,
                c = b);
                for (i in a)
                    this.on(i, c, d, a[i], g);
                return this
            }
            d == null && e == null ? (e = c,
            d = c = b) : e == null && (typeof c == "string" ? (e = d,
            d = b) : (e = d,
            d = c,
            c = b));
            if (e === !1)
                e = J;
            else if (!e)
                return this;
            g === 1 && (h = e,
            e = function(a) {
                f().off(a);
                return h.apply(this, arguments)
            }
            ,
            e.guid = h.guid || (h.guid = f.guid++));
            return this.each(function() {
                f.event.add(this, a, e, d, c)
            })
        },
        one: function(a, b, c, d) {
            return this.on(a, b, c, d, 1)
        },
        off: function(a, c, d) {
            if (a && a.preventDefault && a.handleObj) {
                var e = a.handleObj;
                f(a.delegateTarget).off(e.namespace ? e.origType + "." + e.namespace : e.origType, e.selector, e.handler);
                return this
            }
            if (typeof a == "object") {
                for (var g in a)
                    this.off(g, c, a[g]);
                return this
            }
            if (c === !1 || typeof c == "function")
                d = c,
                c = b;
            d === !1 && (d = J);
            return this.each(function() {
                f.event.remove(this, a, d, c)
            })
        },
        bind: function(a, b, c) {
            return this.on(a, null, b, c)
        },
        unbind: function(a, b) {
            return this.off(a, null, b)
        },
        live: function(a, b, c) {
            f(this.context).on(a, this.selector, b, c);
            return this
        },
        die: function(a, b) {
            f(this.context).off(a, this.selector || "**", b);
            return this
        },
        delegate: function(a, b, c, d) {
            return this.on(b, a, c, d)
        },
        undelegate: function(a, b, c) {
            return arguments.length == 1 ? this.off(a, "**") : this.off(b, a, c)
        },
        trigger: function(a, b) {
            return this.each(function() {
                f.event.trigger(a, b, this)
            })
        },
        triggerHandler: function(a, b) {
            if (this[0])
                return f.event.trigger(a, b, this[0], !0)
        },
        toggle: function(a) {
            var b = arguments
              , c = a.guid || f.guid++
              , d = 0
              , e = function(c) {
                var e = (f._data(this, "lastToggle" + a.guid) || 0) % d;
                f._data(this, "lastToggle" + a.guid, e + 1),
                c.preventDefault();
                return b[e].apply(this, arguments) || !1
            };
            e.guid = c;
            while (d < b.length)
                b[d++].guid = c;
            return this.click(e)
        },
        hover: function(a, b) {
            return this.mouseenter(a).mouseleave(b || a)
        }
    }),
    f.each("blur focus focusin focusout load resize scroll unload click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup error contextmenu".split(" "), function(a, b) {
        f.fn[b] = function(a, c) {
            c == null && (c = a,
            a = null);
            return arguments.length > 0 ? this.on(b, null, a, c) : this.trigger(b)
        }
        ,
        f.attrFn && (f.attrFn[b] = !0),
        C.test(b) && (f.event.fixHooks[b] = f.event.keyHooks),
        D.test(b) && (f.event.fixHooks[b] = f.event.mouseHooks)
    }),
    function() {
        function x(a, b, c, e, f, g) {
            for (var h = 0, i = e.length; h < i; h++) {
                var j = e[h];
                if (j) {
                    var k = !1;
                    j = j[a];
                    while (j) {
                        if (j[d] === c) {
                            k = e[j.sizset];
                            break
                        }
                        if (j.nodeType === 1) {
                            g || (j[d] = c,
                            j.sizset = h);
                            if (typeof b != "string") {
                                if (j === b) {
                                    k = !0;
                                    break
                                }
                            } else if (m.filter(b, [j]).length > 0) {
                                k = j;
                                break
                            }
                        }
                        j = j[a]
                    }
                    e[h] = k
                }
            }
        }
        function w(a, b, c, e, f, g) {
            for (var h = 0, i = e.length; h < i; h++) {
                var j = e[h];
                if (j) {
                    var k = !1;
                    j = j[a];
                    while (j) {
                        if (j[d] === c) {
                            k = e[j.sizset];
                            break
                        }
                        j.nodeType === 1 && !g && (j[d] = c,
                        j.sizset = h);
                        if (j.nodeName.toLowerCase() === b) {
                            k = j;
                            break
                        }
                        j = j[a]
                    }
                    e[h] = k
                }
            }
        }
        var a = /((?:\((?:\([^()]+\)|[^()]+)+\)|\[(?:\[[^\[\]]*\]|['"][^'"]*['"]|[^\[\]'"]+)+\]|\\.|[^ >+~,(\[\\]+)+|[>+~])(\s*,\s*)?((?:.|\r|\n)*)/g
          , d = "sizcache" + (Math.random() + "").replace(".", "")
          , e = 0
          , g = Object.prototype.toString
          , h = !1
          , i = !0
          , j = /\\/g
          , k = /\r\n/g
          , l = /\W/;
        [0, 0].sort(function() {
            i = !1;
            return 0
        });
        var m = function(b, d, e, f) {
            e = e || [],
            d = d || c;
            var h = d;
            if (d.nodeType !== 1 && d.nodeType !== 9)
                return [];
            if (!b || typeof b != "string")
                return e;
            var i, j, k, l, n, q, r, t, u = !0, v = m.isXML(d), w = [], x = b;
            do {
                a.exec(""),
                i = a.exec(x);
                if (i) {
                    x = i[3],
                    w.push(i[1]);
                    if (i[2]) {
                        l = i[3];
                        break
                    }
                }
            } while (i);
            if (w.length > 1 && p.exec(b))
                if (w.length === 2 && o.relative[w[0]])
                    j = y(w[0] + w[1], d, f);
                else {
                    j = o.relative[w[0]] ? [d] : m(w.shift(), d);
                    while (w.length)
                        b = w.shift(),
                        o.relative[b] && (b += w.shift()),
                        j = y(b, j, f)
                }
            else {
                !f && w.length > 1 && d.nodeType === 9 && !v && o.match.ID.test(w[0]) && !o.match.ID.test(w[w.length - 1]) && (n = m.find(w.shift(), d, v),
                d = n.expr ? m.filter(n.expr, n.set)[0] : n.set[0]);
                if (d) {
                    n = f ? {
                        expr: w.pop(),
                        set: s(f)
                    } : m.find(w.pop(), w.length === 1 && (w[0] === "~" || w[0] === "+") && d.parentNode ? d.parentNode : d, v),
                    j = n.expr ? m.filter(n.expr, n.set) : n.set,
                    w.length > 0 ? k = s(j) : u = !1;
                    while (w.length)
                        q = w.pop(),
                        r = q,
                        o.relative[q] ? r = w.pop() : q = "",
                        r == null && (r = d),
                        o.relative[q](k, r, v)
                } else
                    k = w = []
            }
            k || (k = j),
            k || m.error(q || b);
            if (g.call(k) === "[object Array]")
                if (!u)
                    e.push.apply(e, k);
                else if (d && d.nodeType === 1)
                    for (t = 0; k[t] != null; t++)
                        k[t] && (k[t] === !0 || k[t].nodeType === 1 && m.contains(d, k[t])) && e.push(j[t]);
                else
                    for (t = 0; k[t] != null; t++)
                        k[t] && k[t].nodeType === 1 && e.push(j[t]);
            else
                s(k, e);
            l && (m(l, h, e, f),
            m.uniqueSort(e));
            return e
        };
        m.uniqueSort = function(a) {
            if (u) {
                h = i,
                a.sort(u);
                if (h)
                    for (var b = 1; b < a.length; b++)
                        a[b] === a[b - 1] && a.splice(b--, 1)
            }
            return a
        }
        ,
        m.matches = function(a, b) {
            return m(a, null, null, b)
        }
        ,
        m.matchesSelector = function(a, b) {
            return m(b, null, null, [a]).length > 0
        }
        ,
        m.find = function(a, b, c) {
            var d, e, f, g, h, i;
            if (!a)
                return [];
            for (e = 0,
            f = o.order.length; e < f; e++) {
                h = o.order[e];
                if (g = o.leftMatch[h].exec(a)) {
                    i = g[1],
                    g.splice(1, 1);
                    if (i.substr(i.length - 1) !== "\\") {
                        g[1] = (g[1] || "").replace(j, ""),
                        d = o.find[h](g, b, c);
                        if (d != null) {
                            a = a.replace(o.match[h], "");
                            break
                        }
                    }
                }
            }
            d || (d = typeof b.getElementsByTagName != "undefined" ? b.getElementsByTagName("*") : []);
            return {
                set: d,
                expr: a
            }
        }
        ,
        m.filter = function(a, c, d, e) {
            var f, g, h, i, j, k, l, n, p, q = a, r = [], s = c, t = c && c[0] && m.isXML(c[0]);
            while (a && c.length) {
                for (h in o.filter)
                    if ((f = o.leftMatch[h].exec(a)) != null && f[2]) {
                        k = o.filter[h],
                        l = f[1],
                        g = !1,
                        f.splice(1, 1);
                        if (l.substr(l.length - 1) === "\\")
                            continue;
                        s === r && (r = []);
                        if (o.preFilter[h]) {
                            f = o.preFilter[h](f, s, d, r, e, t);
                            if (!f)
                                g = i = !0;
                            else if (f === !0)
                                continue
                        }
                        if (f)
                            for (n = 0; (j = s[n]) != null; n++)
                                j && (i = k(j, f, n, s),
                                p = e ^ i,
                                d && i != null ? p ? g = !0 : s[n] = !1 : p && (r.push(j),
                                g = !0));
                        if (i !== b) {
                            d || (s = r),
                            a = a.replace(o.match[h], "");
                            if (!g)
                                return [];
                            break
                        }
                    }
                if (a === q)
                    if (g == null)
                        m.error(a);
                    else
                        break;
                q = a
            }
            return s
        }
        ,
        m.error = function(a) {
            throw new Error("Syntax error, unrecognized expression: " + a)
        }
        ;
        var n = m.getText = function(a) {
            var b, c, d = a.nodeType, e = "";
            if (d) {
                if (d === 1 || d === 9 || d === 11) {
                    if (typeof a.textContent == "string")
                        return a.textContent;
                    if (typeof a.innerText == "string")
                        return a.innerText.replace(k, "");
                    for (a = a.firstChild; a; a = a.nextSibling)
                        e += n(a)
                } else if (d === 3 || d === 4)
                    return a.nodeValue
            } else
                for (b = 0; c = a[b]; b++)
                    c.nodeType !== 8 && (e += n(c));
            return e
        }
          , o = m.selectors = {
            order: ["ID", "NAME", "TAG"],
            match: {
                ID: /#((?:[\w\u00c0-\uFFFF\-]|\\.)+)/,
                CLASS: /\.((?:[\w\u00c0-\uFFFF\-]|\\.)+)/,
                NAME: /\[name=['"]*((?:[\w\u00c0-\uFFFF\-]|\\.)+)['"]*\]/,
                ATTR: /\[\s*((?:[\w\u00c0-\uFFFF\-]|\\.)+)\s*(?:(\S?=)\s*(?:(['"])(.*?)\3|(#?(?:[\w\u00c0-\uFFFF\-]|\\.)*)|)|)\s*\]/,
                TAG: /^((?:[\w\u00c0-\uFFFF\*\-]|\\.)+)/,
                CHILD: /:(only|nth|last|first)-child(?:\(\s*(even|odd|(?:[+\-]?\d+|(?:[+\-]?\d*)?n\s*(?:[+\-]\s*\d+)?))\s*\))?/,
                POS: /:(nth|eq|gt|lt|first|last|even|odd)(?:\((\d*)\))?(?=[^\-]|$)/,
                PSEUDO: /:((?:[\w\u00c0-\uFFFF\-]|\\.)+)(?:\((['"]?)((?:\([^\)]+\)|[^\(\)]*)+)\2\))?/
            },
            leftMatch: {},
            attrMap: {
                "class": "className",
                "for": "htmlFor"
            },
            attrHandle: {
                href: function(a) {
                    return a.getAttribute("href")
                },
                type: function(a) {
                    return a.getAttribute("type")
                }
            },
            relative: {
                "+": function(a, b) {
                    var c = typeof b == "string"
                      , d = c && !l.test(b)
                      , e = c && !d;
                    d && (b = b.toLowerCase());
                    for (var f = 0, g = a.length, h; f < g; f++)
                        if (h = a[f]) {
                            while ((h = h.previousSibling) && h.nodeType !== 1)
                                ;
                            a[f] = e || h && h.nodeName.toLowerCase() === b ? h || !1 : h === b
                        }
                    e && m.filter(b, a, !0)
                },
                ">": function(a, b) {
                    var c, d = typeof b == "string", e = 0, f = a.length;
                    if (d && !l.test(b)) {
                        b = b.toLowerCase();
                        for (; e < f; e++) {
                            c = a[e];
                            if (c) {
                                var g = c.parentNode;
                                a[e] = g.nodeName.toLowerCase() === b ? g : !1
                            }
                        }
                    } else {
                        for (; e < f; e++)
                            c = a[e],
                            c && (a[e] = d ? c.parentNode : c.parentNode === b);
                        d && m.filter(b, a, !0)
                    }
                },
                "": function(a, b, c) {
                    var d, f = e++, g = x;
                    typeof b == "string" && !l.test(b) && (b = b.toLowerCase(),
                    d = b,
                    g = w),
                    g("parentNode", b, f, a, d, c)
                },
                "~": function(a, b, c) {
                    var d, f = e++, g = x;
                    typeof b == "string" && !l.test(b) && (b = b.toLowerCase(),
                    d = b,
                    g = w),
                    g("previousSibling", b, f, a, d, c)
                }
            },
            find: {
                ID: function(a, b, c) {
                    if (typeof b.getElementById != "undefined" && !c) {
                        var d = b.getElementById(a[1]);
                        return d && d.parentNode ? [d] : []
                    }
                },
                NAME: function(a, b) {
                    if (typeof b.getElementsByName != "undefined") {
                        var c = []
                          , d = b.getElementsByName(a[1]);
                        for (var e = 0, f = d.length; e < f; e++)
                            d[e].getAttribute("name") === a[1] && c.push(d[e]);
                        return c.length === 0 ? null : c
                    }
                },
                TAG: function(a, b) {
                    if (typeof b.getElementsByTagName != "undefined")
                        return b.getElementsByTagName(a[1])
                }
            },
            preFilter: {
                CLASS: function(a, b, c, d, e, f) {
                    a = " " + a[1].replace(j, "") + " ";
                    if (f)
                        return a;
                    for (var g = 0, h; (h = b[g]) != null; g++)
                        h && (e ^ (h.className && (" " + h.className + " ").replace(/[\t\n\r]/g, " ").indexOf(a) >= 0) ? c || d.push(h) : c && (b[g] = !1));
                    return !1
                },
                ID: function(a) {
                    return a[1].replace(j, "")
                },
                TAG: function(a, b) {
                    return a[1].replace(j, "").toLowerCase()
                },
                CHILD: function(a) {
                    if (a[1] === "nth") {
                        a[2] || m.error(a[0]),
                        a[2] = a[2].replace(/^\+|\s*/g, "");
                        var b = /(-?)(\d*)(?:n([+\-]?\d*))?/.exec(a[2] === "even" && "2n" || a[2] === "odd" && "2n+1" || !/\D/.test(a[2]) && "0n+" + a[2] || a[2]);
                        a[2] = b[1] + (b[2] || 1) - 0,
                        a[3] = b[3] - 0
                    } else
                        a[2] && m.error(a[0]);
                    a[0] = e++;
                    return a
                },
                ATTR: function(a, b, c, d, e, f) {
                    var g = a[1] = a[1].replace(j, "");
                    !f && o.attrMap[g] && (a[1] = o.attrMap[g]),
                    a[4] = (a[4] || a[5] || "").replace(j, ""),
                    a[2] === "~=" && (a[4] = " " + a[4] + " ");
                    return a
                },
                PSEUDO: function(b, c, d, e, f) {
                    if (b[1] === "not")
                        if ((a.exec(b[3]) || "").length > 1 || /^\w/.test(b[3]))
                            b[3] = m(b[3], null, null, c);
                        else {
                            var g = m.filter(b[3], c, d, !0 ^ f);
                            d || e.push.apply(e, g);
                            return !1
                        }
                    else if (o.match.POS.test(b[0]) || o.match.CHILD.test(b[0]))
                        return !0;
                    return b
                },
                POS: function(a) {
                    a.unshift(!0);
                    return a
                }
            },
            filters: {
                enabled: function(a) {
                    return a.disabled === !1 && a.type !== "hidden"
                },
                disabled: function(a) {
                    return a.disabled === !0
                },
                checked: function(a) {
                    return a.checked === !0
                },
                selected: function(a) {
                    a.parentNode && a.parentNode.selectedIndex;
                    return a.selected === !0
                },
                parent: function(a) {
                    return !!a.firstChild
                },
                empty: function(a) {
                    return !a.firstChild
                },
                has: function(a, b, c) {
                    return !!m(c[3], a).length
                },
                header: function(a) {
                    return /h\d/i.test(a.nodeName)
                },
                text: function(a) {
                    var b = a.getAttribute("type")
                      , c = a.type;
                    return a.nodeName.toLowerCase() === "input" && "text" === c && (b === c || b === null)
                },
                radio: function(a) {
                    return a.nodeName.toLowerCase() === "input" && "radio" === a.type
                },
                checkbox: function(a) {
                    return a.nodeName.toLowerCase() === "input" && "checkbox" === a.type
                },
                file: function(a) {
                    return a.nodeName.toLowerCase() === "input" && "file" === a.type
                },
                password: function(a) {
                    return a.nodeName.toLowerCase() === "input" && "password" === a.type
                },
                submit: function(a) {
                    var b = a.nodeName.toLowerCase();
                    return (b === "input" || b === "button") && "submit" === a.type
                },
                image: function(a) {
                    return a.nodeName.toLowerCase() === "input" && "image" === a.type
                },
                reset: function(a) {
                    var b = a.nodeName.toLowerCase();
                    return (b === "input" || b === "button") && "reset" === a.type
                },
                button: function(a) {
                    var b = a.nodeName.toLowerCase();
                    return b === "input" && "button" === a.type || b === "button"
                },
                input: function(a) {
                    return /input|select|textarea|button/i.test(a.nodeName)
                },
                focus: function(a) {
                    return a === a.ownerDocument.activeElement
                }
            },
            setFilters: {
                first: function(a, b) {
                    return b === 0
                },
                last: function(a, b, c, d) {
                    return b === d.length - 1
                },
                even: function(a, b) {
                    return b % 2 === 0
                },
                odd: function(a, b) {
                    return b % 2 === 1
                },
                lt: function(a, b, c) {
                    return b < c[3] - 0
                },
                gt: function(a, b, c) {
                    return b > c[3] - 0
                },
                nth: function(a, b, c) {
                    return c[3] - 0 === b
                },
                eq: function(a, b, c) {
                    return c[3] - 0 === b
                }
            },
            filter: {
                PSEUDO: function(a, b, c, d) {
                    var e = b[1]
                      , f = o.filters[e];
                    if (f)
                        return f(a, c, b, d);
                    if (e === "contains")
                        return (a.textContent || a.innerText || n([a]) || "").indexOf(b[3]) >= 0;
                    if (e === "not") {
                        var g = b[3];
                        for (var h = 0, i = g.length; h < i; h++)
                            if (g[h] === a)
                                return !1;
                        return !0
                    }
                    m.error(e)
                },
                CHILD: function(a, b) {
                    var c, e, f, g, h, i, j, k = b[1], l = a;
                    switch (k) {
                    case "only":
                    case "first":
                        while (l = l.previousSibling)
                            if (l.nodeType === 1)
                                return !1;
                        if (k === "first")
                            return !0;
                        l = a;
                    case "last":
                        while (l = l.nextSibling)
                            if (l.nodeType === 1)
                                return !1;
                        return !0;
                    case "nth":
                        c = b[2],
                        e = b[3];
                        if (c === 1 && e === 0)
                            return !0;
                        f = b[0],
                        g = a.parentNode;
                        if (g && (g[d] !== f || !a.nodeIndex)) {
                            i = 0;
                            for (l = g.firstChild; l; l = l.nextSibling)
                                l.nodeType === 1 && (l.nodeIndex = ++i);
                            g[d] = f
                        }
                        j = a.nodeIndex - e;
                        return c === 0 ? j === 0 : j % c === 0 && j / c >= 0
                    }
                },
                ID: function(a, b) {
                    return a.nodeType === 1 && a.getAttribute("id") === b
                },
                TAG: function(a, b) {
                    return b === "*" && a.nodeType === 1 || !!a.nodeName && a.nodeName.toLowerCase() === b
                },
                CLASS: function(a, b) {
                    return (" " + (a.className || a.getAttribute("class")) + " ").indexOf(b) > -1
                },
                ATTR: function(a, b) {
                    var c = b[1]
                      , d = m.attr ? m.attr(a, c) : o.attrHandle[c] ? o.attrHandle[c](a) : a[c] != null ? a[c] : a.getAttribute(c)
                      , e = d + ""
                      , f = b[2]
                      , g = b[4];
                    return d == null ? f === "!=" : !f && m.attr ? d != null : f === "=" ? e === g : f === "*=" ? e.indexOf(g) >= 0 : f === "~=" ? (" " + e + " ").indexOf(g) >= 0 : g ? f === "!=" ? e !== g : f === "^=" ? e.indexOf(g) === 0 : f === "$=" ? e.substr(e.length - g.length) === g : f === "|=" ? e === g || e.substr(0, g.length + 1) === g + "-" : !1 : e && d !== !1
                },
                POS: function(a, b, c, d) {
                    var e = b[2]
                      , f = o.setFilters[e];
                    if (f)
                        return f(a, c, b, d)
                }
            }
        }
          , p = o.match.POS
          , q = function(a, b) {
            return "\\" + (b - 0 + 1)
        };
        for (var r in o.match)
            o.match[r] = new RegExp(o.match[r].source + /(?![^\[]*\])(?![^\(]*\))/.source),
            o.leftMatch[r] = new RegExp(/(^(?:.|\r|\n)*?)/.source + o.match[r].source.replace(/\\(\d+)/g, q));
        o.match.globalPOS = p;
        var s = function(a, b) {
            a = Array.prototype.slice.call(a, 0);
            if (b) {
                b.push.apply(b, a);
                return b
            }
            return a
        };
        try {
            Array.prototype.slice.call(c.documentElement.childNodes, 0)[0].nodeType
        } catch (t) {
            s = function(a, b) {
                var c = 0
                  , d = b || [];
                if (g.call(a) === "[object Array]")
                    Array.prototype.push.apply(d, a);
                else if (typeof a.length == "number")
                    for (var e = a.length; c < e; c++)
                        d.push(a[c]);
                else
                    for (; a[c]; c++)
                        d.push(a[c]);
                return d
            }
        }
        var u, v;
        c.documentElement.compareDocumentPosition ? u = function(a, b) {
            if (a === b) {
                h = !0;
                return 0
            }
            if (!a.compareDocumentPosition || !b.compareDocumentPosition)
                return a.compareDocumentPosition ? -1 : 1;
            return a.compareDocumentPosition(b) & 4 ? -1 : 1
        }
        : (u = function(a, b) {
            if (a === b) {
                h = !0;
                return 0
            }
            if (a.sourceIndex && b.sourceIndex)
                return a.sourceIndex - b.sourceIndex;
            var c, d, e = [], f = [], g = a.parentNode, i = b.parentNode, j = g;
            if (g === i)
                return v(a, b);
            if (!g)
                return -1;
            if (!i)
                return 1;
            while (j)
                e.unshift(j),
                j = j.parentNode;
            j = i;
            while (j)
                f.unshift(j),
                j = j.parentNode;
            c = e.length,
            d = f.length;
            for (var k = 0; k < c && k < d; k++)
                if (e[k] !== f[k])
                    return v(e[k], f[k]);
            return k === c ? v(a, f[k], -1) : v(e[k], b, 1)
        }
        ,
        v = function(a, b, c) {
            if (a === b)
                return c;
            var d = a.nextSibling;
            while (d) {
                if (d === b)
                    return -1;
                d = d.nextSibling
            }
            return 1
        }
        ),
        function() {
            var a = c.createElement("div")
              , d = "script" + (new Date).getTime()
              , e = c.documentElement;
            a.innerHTML = "<a name='" + d + "'/>",
            e.insertBefore(a, e.firstChild),
            c.getElementById(d) && (o.find.ID = function(a, c, d) {
                if (typeof c.getElementById != "undefined" && !d) {
                    var e = c.getElementById(a[1]);
                    return e ? e.id === a[1] || typeof e.getAttributeNode != "undefined" && e.getAttributeNode("id").nodeValue === a[1] ? [e] : b : []
                }
            }
            ,
            o.filter.ID = function(a, b) {
                var c = typeof a.getAttributeNode != "undefined" && a.getAttributeNode("id");
                return a.nodeType === 1 && c && c.nodeValue === b
            }
            ),
            e.removeChild(a),
            e = a = null
        }(),
        function() {
            var a = c.createElement("div");
            a.appendChild(c.createComment("")),
            a.getElementsByTagName("*").length > 0 && (o.find.TAG = function(a, b) {
                var c = b.getElementsByTagName(a[1]);
                if (a[1] === "*") {
                    var d = [];
                    for (var e = 0; c[e]; e++)
                        c[e].nodeType === 1 && d.push(c[e]);
                    c = d
                }
                return c
            }
            ),
            a.innerHTML = "<a href='#'></a>",
            a.firstChild && typeof a.firstChild.getAttribute != "undefined" && a.firstChild.getAttribute("href") !== "#" && (o.attrHandle.href = function(a) {
                return a.getAttribute("href", 2)
            }
            ),
            a = null
        }(),
        c.querySelectorAll && function() {
            var a = m
              , b = c.createElement("div")
              , d = "__sizzle__";
            b.innerHTML = "<p class='TEST'></p>";
            if (!b.querySelectorAll || b.querySelectorAll(".TEST").length !== 0) {
                m = function(b, e, f, g) {
                    e = e || c;
                    if (!g && !m.isXML(e)) {
                        var h = /^(\w+$)|^\.([\w\-]+$)|^#([\w\-]+$)/.exec(b);
                        if (h && (e.nodeType === 1 || e.nodeType === 9)) {
                            if (h[1])
                                return s(e.getElementsByTagName(b), f);
                            if (h[2] && o.find.CLASS && e.getElementsByClassName)
                                return s(e.getElementsByClassName(h[2]), f)
                        }
                        if (e.nodeType === 9) {
                            if (b === "body" && e.body)
                                return s([e.body], f);
                            if (h && h[3]) {
                                var i = e.getElementById(h[3]);
                                if (!i || !i.parentNode)
                                    return s([], f);
                                if (i.id === h[3])
                                    return s([i], f)
                            }
                            try {
                                return s(e.querySelectorAll(b), f)
                            } catch (j) {}
                        } else if (e.nodeType === 1 && e.nodeName.toLowerCase() !== "object") {
                            var k = e
                              , l = e.getAttribute("id")
                              , n = l || d
                              , p = e.parentNode
                              , q = /^\s*[+~]/.test(b);
                            l ? n = n.replace(/'/g, "\\$&") : e.setAttribute("id", n),
                            q && p && (e = e.parentNode);
                            try {
                                if (!q || p)
                                    return s(e.querySelectorAll("[id='" + n + "'] " + b), f)
                            } catch (r) {} finally {
                                l || k.removeAttribute("id")
                            }
                        }
                    }
                    return a(b, e, f, g)
                }
                ;
                for (var e in a)
                    m[e] = a[e];
                b = null
            }
        }(),
        function() {
            var a = c.documentElement
              , b = a.matchesSelector || a.mozMatchesSelector || a.webkitMatchesSelector || a.msMatchesSelector;
            if (b) {
                var d = !b.call(c.createElement("div"), "div")
                  , e = !1;
                try {
                    b.call(c.documentElement, "[test!='']:sizzle")
                } catch (f) {
                    e = !0
                }
                m.matchesSelector = function(a, c) {
                    c = c.replace(/\=\s*([^'"\]]*)\s*\]/g, "='$1']");
                    if (!m.isXML(a))
                        try {
                            if (e || !o.match.PSEUDO.test(c) && !/!=/.test(c)) {
                                var f = b.call(a, c);
                                if (f || !d || a.document && a.document.nodeType !== 11)
                                    return f
                            }
                        } catch (g) {}
                    return m(c, null, null, [a]).length > 0
                }
            }
        }(),
        function() {
            var a = c.createElement("div");
            a.innerHTML = "<div class='test e'></div><div class='test'></div>";
            if (!!a.getElementsByClassName && a.getElementsByClassName("e").length !== 0) {
                a.lastChild.className = "e";
                if (a.getElementsByClassName("e").length === 1)
                    return;
                o.order.splice(1, 0, "CLASS"),
                o.find.CLASS = function(a, b, c) {
                    if (typeof b.getElementsByClassName != "undefined" && !c)
                        return b.getElementsByClassName(a[1])
                }
                ,
                a = null
            }
        }(),
        c.documentElement.contains ? m.contains = function(a, b) {
            return a !== b && (a.contains ? a.contains(b) : !0)
        }
        : c.documentElement.compareDocumentPosition ? m.contains = function(a, b) {
            return !!(a.compareDocumentPosition(b) & 16)
        }
        : m.contains = function() {
            return !1
        }
        ,
        m.isXML = function(a) {
            var b = (a ? a.ownerDocument || a : 0).documentElement;
            return b ? b.nodeName !== "HTML" : !1
        }
        ;
        var y = function(a, b, c) {
            var d, e = [], f = "", g = b.nodeType ? [b] : b;
            while (d = o.match.PSEUDO.exec(a))
                f += d[0],
                a = a.replace(o.match.PSEUDO, "");
            a = o.relative[a] ? a + "*" : a;
            for (var h = 0, i = g.length; h < i; h++)
                m(a, g[h], e, c);
            return m.filter(f, e)
        };
        m.attr = f.attr,
        m.selectors.attrMap = {},
        f.find = m,
        f.expr = m.selectors,
        f.expr[":"] = f.expr.filters,
        f.unique = m.uniqueSort,
        f.text = m.getText,
        f.isXMLDoc = m.isXML,
        f.contains = m.contains
    }();
    var L = /Until$/
      , M = /^(?:parents|prevUntil|prevAll)/
      , N = /,/
      , O = /^.[^:#\[\.,]*$/
      , P = Array.prototype.slice
      , Q = f.expr.match.globalPOS
      , R = {
        children: !0,
        contents: !0,
        next: !0,
        prev: !0
    };
    f.fn.extend({
        find: function(a) {
            var b = this, c, d;
            if (typeof a != "string")
                return f(a).filter(function() {
                    for (c = 0,
                    d = b.length; c < d; c++)
                        if (f.contains(b[c], this))
                            return !0
                });
            var e = this.pushStack("", "find", a), g, h, i;
            for (c = 0,
            d = this.length; c < d; c++) {
                g = e.length,
                f.find(a, this[c], e);
                if (c > 0)
                    for (h = g; h < e.length; h++)
                        for (i = 0; i < g; i++)
                            if (e[i] === e[h]) {
                                e.splice(h--, 1);
                                break
                            }
            }
            return e
        },
        has: function(a) {
            var b = f(a);
            return this.filter(function() {
                for (var a = 0, c = b.length; a < c; a++)
                    if (f.contains(this, b[a]))
                        return !0
            })
        },
        not: function(a) {
            return this.pushStack(T(this, a, !1), "not", a)
        },
        filter: function(a) {
            return this.pushStack(T(this, a, !0), "filter", a)
        },
        is: function(a) {
            return !!a && (typeof a == "string" ? Q.test(a) ? f(a, this.context).index(this[0]) >= 0 : f.filter(a, this).length > 0 : this.filter(a).length > 0)
        },
        closest: function(a, b) {
            var c = [], d, e, g = this[0];
            if (f.isArray(a)) {
                var h = 1;
                while (g && g.ownerDocument && g !== b) {
                    for (d = 0; d < a.length; d++)
                        f(g).is(a[d]) && c.push({
                            selector: a[d],
                            elem: g,
                            level: h
                        });
                    g = g.parentNode,
                    h++
                }
                return c
            }
            var i = Q.test(a) || typeof a != "string" ? f(a, b || this.context) : 0;
            for (d = 0,
            e = this.length; d < e; d++) {
                g = this[d];
                while (g) {
                    if (i ? i.index(g) > -1 : f.find.matchesSelector(g, a)) {
                        c.push(g);
                        break
                    }
                    g = g.parentNode;
                    if (!g || !g.ownerDocument || g === b || g.nodeType === 11)
                        break
                }
            }
            c = c.length > 1 ? f.unique(c) : c;
            return this.pushStack(c, "closest", a)
        },
        index: function(a) {
            if (!a)
                return this[0] && this[0].parentNode ? this.prevAll().length : -1;
            if (typeof a == "string")
                return f.inArray(this[0], f(a));
            return f.inArray(a.jquery ? a[0] : a, this)
        },
        add: function(a, b) {
            var c = typeof a == "string" ? f(a, b) : f.makeArray(a && a.nodeType ? [a] : a)
              , d = f.merge(this.get(), c);
            return this.pushStack(S(c[0]) || S(d[0]) ? d : f.unique(d))
        },
        andSelf: function() {
            return this.add(this.prevObject)
        }
    }),
    f.each({
        parent: function(a) {
            var b = a.parentNode;
            return b && b.nodeType !== 11 ? b : null
        },
        parents: function(a) {
            return f.dir(a, "parentNode")
        },
        parentsUntil: function(a, b, c) {
            return f.dir(a, "parentNode", c)
        },
        next: function(a) {
            return f.nth(a, 2, "nextSibling")
        },
        prev: function(a) {
            return f.nth(a, 2, "previousSibling")
        },
        nextAll: function(a) {
            return f.dir(a, "nextSibling")
        },
        prevAll: function(a) {
            return f.dir(a, "previousSibling")
        },
        nextUntil: function(a, b, c) {
            return f.dir(a, "nextSibling", c)
        },
        prevUntil: function(a, b, c) {
            return f.dir(a, "previousSibling", c)
        },
        siblings: function(a) {
            return f.sibling((a.parentNode || {}).firstChild, a)
        },
        children: function(a) {
            return f.sibling(a.firstChild)
        },
        contents: function(a) {
            return f.nodeName(a, "iframe") ? a.contentDocument || a.contentWindow.document : f.makeArray(a.childNodes)
        }
    }, function(a, b) {
        f.fn[a] = function(c, d) {
            var e = f.map(this, b, c);
            L.test(a) || (d = c),
            d && typeof d == "string" && (e = f.filter(d, e)),
            e = this.length > 1 && !R[a] ? f.unique(e) : e,
            (this.length > 1 || N.test(d)) && M.test(a) && (e = e.reverse());
            return this.pushStack(e, a, P.call(arguments).join(","))
        }
    }),
    f.extend({
        filter: function(a, b, c) {
            c && (a = ":not(" + a + ")");
            return b.length === 1 ? f.find.matchesSelector(b[0], a) ? [b[0]] : [] : f.find.matches(a, b)
        },
        dir: function(a, c, d) {
            var e = []
              , g = a[c];
            while (g && g.nodeType !== 9 && (d === b || g.nodeType !== 1 || !f(g).is(d)))
                g.nodeType === 1 && e.push(g),
                g = g[c];
            return e
        },
        nth: function(a, b, c, d) {
            b = b || 1;
            var e = 0;
            for (; a; a = a[c])
                if (a.nodeType === 1 && ++e === b)
                    break;
            return a
        },
        sibling: function(a, b) {
            var c = [];
            for (; a; a = a.nextSibling)
                a.nodeType === 1 && a !== b && c.push(a);
            return c
        }
    });
    var V = "abbr|article|aside|audio|bdi|canvas|data|datalist|details|figcaption|figure|footer|header|hgroup|mark|meter|nav|output|progress|section|summary|time|video"
      , W = / jQuery\d+="(?:\d+|null)"/g
      , X = /^\s+/
      , Y = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig
      , Z = /<([\w:]+)/
      , $ = /<tbody/i
      , _ = /<|&#?\w+;/
      , ba = /<(?:script|style)/i
      , bb = /<(?:script|object|embed|option|style)/i
      , bc = new RegExp("<(?:" + V + ")[\\s/>]","i")
      , bd = /checked\s*(?:[^=]|=\s*.checked.)/i
      , be = /\/(java|ecma)script/i
      , bf = /^\s*<!(?:\[CDATA\[|\-\-)/
      , bg = {
        option: [1, "<select multiple='multiple'>", "</select>"],
        legend: [1, "<fieldset>", "</fieldset>"],
        thead: [1, "<table>", "</table>"],
        tr: [2, "<table><tbody>", "</tbody></table>"],
        td: [3, "<table><tbody><tr>", "</tr></tbody></table>"],
        col: [2, "<table><tbody></tbody><colgroup>", "</colgroup></table>"],
        area: [1, "<map>", "</map>"],
        _default: [0, "", ""]
    }
      , bh = U(c);
    bg.optgroup = bg.option,
    bg.tbody = bg.tfoot = bg.colgroup = bg.caption = bg.thead,
    bg.th = bg.td,
    f.support.htmlSerialize || (bg._default = [1, "div<div>", "</div>"]),
    f.fn.extend({
        text: function(a) {
            return f.access(this, function(a) {
                return a === b ? f.text(this) : this.empty().append((this[0] && this[0].ownerDocument || c).createTextNode(a))
            }, null, a, arguments.length)
        },
        wrapAll: function(a) {
            if (f.isFunction(a))
                return this.each(function(b) {
                    f(this).wrapAll(a.call(this, b))
                });
            if (this[0]) {
                var b = f(a, this[0].ownerDocument).eq(0).clone(!0);
                this[0].parentNode && b.insertBefore(this[0]),
                b.map(function() {
                    var a = this;
                    while (a.firstChild && a.firstChild.nodeType === 1)
                        a = a.firstChild;
                    return a
                }).append(this)
            }
            return this
        },
        wrapInner: function(a) {
            if (f.isFunction(a))
                return this.each(function(b) {
                    f(this).wrapInner(a.call(this, b))
                });
            return this.each(function() {
                var b = f(this)
                  , c = b.contents();
                c.length ? c.wrapAll(a) : b.append(a)
            })
        },
        wrap: function(a) {
            var b = f.isFunction(a);
            return this.each(function(c) {
                f(this).wrapAll(b ? a.call(this, c) : a)
            })
        },
        unwrap: function() {
            return this.parent().each(function() {
                f.nodeName(this, "body") || f(this).replaceWith(this.childNodes)
            }).end()
        },
        append: function() {
            return this.domManip(arguments, !0, function(a) {
                this.nodeType === 1 && this.appendChild(a)
            })
        },
        prepend: function() {
            return this.domManip(arguments, !0, function(a) {
                this.nodeType === 1 && this.insertBefore(a, this.firstChild)
            })
        },
        before: function() {
            if (this[0] && this[0].parentNode)
                return this.domManip(arguments, !1, function(a) {
                    this.parentNode.insertBefore(a, this)
                });
            if (arguments.length) {
                var a = f.clean(arguments);
                a.push.apply(a, this.toArray());
                return this.pushStack(a, "before", arguments)
            }
        },
        after: function() {
            if (this[0] && this[0].parentNode)
                return this.domManip(arguments, !1, function(a) {
                    this.parentNode.insertBefore(a, this.nextSibling)
                });
            if (arguments.length) {
                var a = this.pushStack(this, "after", arguments);
                a.push.apply(a, f.clean(arguments));
                return a
            }
        },
        remove: function(a, b) {
            for (var c = 0, d; (d = this[c]) != null; c++)
                if (!a || f.filter(a, [d]).length)
                    !b && d.nodeType === 1 && (f.cleanData(d.getElementsByTagName("*")),
                    f.cleanData([d])),
                    d.parentNode && d.parentNode.removeChild(d);
            return this
        },
        empty: function() {
            for (var a = 0, b; (b = this[a]) != null; a++) {
                b.nodeType === 1 && f.cleanData(b.getElementsByTagName("*"));
                while (b.firstChild)
                    b.removeChild(b.firstChild)
            }
            return this
        },
        clone: function(a, b) {
            a = a == null ? !1 : a,
            b = b == null ? a : b;
            return this.map(function() {
                return f.clone(this, a, b)
            })
        },
        html: function(a) {
            return f.access(this, function(a) {
                var c = this[0] || {}
                  , d = 0
                  , e = this.length;
                if (a === b)
                    return c.nodeType === 1 ? c.innerHTML.replace(W, "") : null;
                if (typeof a == "string" && !ba.test(a) && (f.support.leadingWhitespace || !X.test(a)) && !bg[(Z.exec(a) || ["", ""])[1].toLowerCase()]) {
                    a = a.replace(Y, "<$1></$2>");
                    try {
                        for (; d < e; d++)
                            c = this[d] || {},
                            c.nodeType === 1 && (f.cleanData(c.getElementsByTagName("*")),
                            c.innerHTML = a);
                        c = 0
                    } catch (g) {}
                }
                c && this.empty().append(a)
            }, null, a, arguments.length)
        },
        replaceWith: function(a) {
            if (this[0] && this[0].parentNode) {
                if (f.isFunction(a))
                    return this.each(function(b) {
                        var c = f(this)
                          , d = c.html();
                        c.replaceWith(a.call(this, b, d))
                    });
                typeof a != "string" && (a = f(a).detach());
                return this.each(function() {
                    var b = this.nextSibling
                      , c = this.parentNode;
                    f(this).remove(),
                    b ? f(b).before(a) : f(c).append(a)
                })
            }
            return this.length ? this.pushStack(f(f.isFunction(a) ? a() : a), "replaceWith", a) : this
        },
        detach: function(a) {
            return this.remove(a, !0)
        },
        domManip: function(a, c, d) {
            var e, g, h, i, j = a[0], k = [];
            if (!f.support.checkClone && arguments.length === 3 && typeof j == "string" && bd.test(j))
                return this.each(function() {
                    f(this).domManip(a, c, d, !0)
                });
            if (f.isFunction(j))
                return this.each(function(e) {
                    var g = f(this);
                    a[0] = j.call(this, e, c ? g.html() : b),
                    g.domManip(a, c, d)
                });
            if (this[0]) {
                i = j && j.parentNode,
                f.support.parentNode && i && i.nodeType === 11 && i.childNodes.length === this.length ? e = {
                    fragment: i
                } : e = f.buildFragment(a, this, k),
                h = e.fragment,
                h.childNodes.length === 1 ? g = h = h.firstChild : g = h.firstChild;
                if (g) {
                    c = c && f.nodeName(g, "tr");
                    for (var l = 0, m = this.length, n = m - 1; l < m; l++)
                        d.call(c ? bi(this[l], g) : this[l], e.cacheable || m > 1 && l < n ? f.clone(h, !0, !0) : h)
                }
                k.length && f.each(k, function(a, b) {
                    b.src ? f.ajax({
                        type: "GET",
                        global: !1,
                        url: b.src,
                        async: !1,
                        dataType: "script"
                    }) : f.globalEval((b.text || b.textContent || b.innerHTML || "").replace(bf, "/*$0*/")),
                    b.parentNode && b.parentNode.removeChild(b)
                })
            }
            return this
        }
    }),
    f.buildFragment = function(a, b, d) {
        var e, g, h, i, j = a[0];
        b && b[0] && (i = b[0].ownerDocument || b[0]),
        i.createDocumentFragment || (i = c),
        a.length === 1 && typeof j == "string" && j.length < 512 && i === c && j.charAt(0) === "<" && !bb.test(j) && (f.support.checkClone || !bd.test(j)) && (f.support.html5Clone || !bc.test(j)) && (g = !0,
        h = f.fragments[j],
        h && h !== 1 && (e = h)),
        e || (e = i.createDocumentFragment(),
        f.clean(a, i, e, d)),
        g && (f.fragments[j] = h ? e : 1);
        return {
            fragment: e,
            cacheable: g
        }
    }
    ,
    f.fragments = {},
    f.each({
        appendTo: "append",
        prependTo: "prepend",
        insertBefore: "before",
        insertAfter: "after",
        replaceAll: "replaceWith"
    }, function(a, b) {
        f.fn[a] = function(c) {
            var d = []
              , e = f(c)
              , g = this.length === 1 && this[0].parentNode;
            if (g && g.nodeType === 11 && g.childNodes.length === 1 && e.length === 1) {
                e[b](this[0]);
                return this
            }
            for (var h = 0, i = e.length; h < i; h++) {
                var j = (h > 0 ? this.clone(!0) : this).get();
                f(e[h])[b](j),
                d = d.concat(j)
            }
            return this.pushStack(d, a, e.selector)
        }
    }),
    f.extend({
        clone: function(a, b, c) {
            var d, e, g, h = f.support.html5Clone || f.isXMLDoc(a) || !bc.test("<" + a.nodeName + ">") ? a.cloneNode(!0) : bo(a);
            if ((!f.support.noCloneEvent || !f.support.noCloneChecked) && (a.nodeType === 1 || a.nodeType === 11) && !f.isXMLDoc(a)) {
                bk(a, h),
                d = bl(a),
                e = bl(h);
                for (g = 0; d[g]; ++g)
                    e[g] && bk(d[g], e[g])
            }
            if (b) {
                bj(a, h);
                if (c) {
                    d = bl(a),
                    e = bl(h);
                    for (g = 0; d[g]; ++g)
                        bj(d[g], e[g])
                }
            }
            d = e = null;
            return h
        },
        clean: function(a, b, d, e) {
            var g, h, i, j = [];
            b = b || c,
            typeof b.createElement == "undefined" && (b = b.ownerDocument || b[0] && b[0].ownerDocument || c);
            for (var k = 0, l; (l = a[k]) != null; k++) {
                typeof l == "number" && (l += "");
                if (!l)
                    continue;
                if (typeof l == "string")
                    if (!_.test(l))
                        l = b.createTextNode(l);
                    else {
                        l = l.replace(Y, "<$1></$2>");
                        var m = (Z.exec(l) || ["", ""])[1].toLowerCase(), n = bg[m] || bg._default, o = n[0], p = b.createElement("div"), q = bh.childNodes, r;
                        b === c ? bh.appendChild(p) : U(b).appendChild(p),
                        p.innerHTML = n[1] + l + n[2];
                        while (o--)
                            p = p.lastChild;
                        if (!f.support.tbody) {
                            var s = $.test(l)
                              , t = m === "table" && !s ? p.firstChild && p.firstChild.childNodes : n[1] === "<table>" && !s ? p.childNodes : [];
                            for (i = t.length - 1; i >= 0; --i)
                                f.nodeName(t[i], "tbody") && !t[i].childNodes.length && t[i].parentNode.removeChild(t[i])
                        }
                        !f.support.leadingWhitespace && X.test(l) && p.insertBefore(b.createTextNode(X.exec(l)[0]), p.firstChild),
                        l = p.childNodes,
                        p && (p.parentNode.removeChild(p),
                        q.length > 0 && (r = q[q.length - 1],
                        r && r.parentNode && r.parentNode.removeChild(r)))
                    }
                var u;
                if (!f.support.appendChecked)
                    if (l[0] && typeof (u = l.length) == "number")
                        for (i = 0; i < u; i++)
                            bn(l[i]);
                    else
                        bn(l);
                l.nodeType ? j.push(l) : j = f.merge(j, l)
            }
            if (d) {
                g = function(a) {
                    return !a.type || be.test(a.type)
                }
                ;
                for (k = 0; j[k]; k++) {
                    h = j[k];
                    if (e && f.nodeName(h, "script") && (!h.type || be.test(h.type)))
                        e.push(h.parentNode ? h.parentNode.removeChild(h) : h);
                    else {
                        if (h.nodeType === 1) {
                            var v = f.grep(h.getElementsByTagName("script"), g);
                            j.splice.apply(j, [k + 1, 0].concat(v))
                        }
                        d.appendChild(h)
                    }
                }
            }
            return j
        },
        cleanData: function(a) {
            var b, c, d = f.cache, e = f.event.special, g = f.support.deleteExpando;
            for (var h = 0, i; (i = a[h]) != null; h++) {
                if (i.nodeName && f.noData[i.nodeName.toLowerCase()])
                    continue;
                c = i[f.expando];
                if (c) {
                    b = d[c];
                    if (b && b.events) {
                        for (var j in b.events)
                            e[j] ? f.event.remove(i, j) : f.removeEvent(i, j, b.handle);
                        b.handle && (b.handle.elem = null)
                    }
                    g ? delete i[f.expando] : i.removeAttribute && i.removeAttribute(f.expando),
                    delete d[c]
                }
            }
        }
    });
    var bp = /alpha\([^)]*\)/i, bq = /opacity=([^)]*)/, br = /([A-Z]|^ms)/g, bs = /^[\-+]?(?:\d*\.)?\d+$/i, bt = /^-?(?:\d*\.)?\d+(?!px)[^\d\s]+$/i, bu = /^([\-+])=([\-+.\de]+)/, bv = /^margin/, bw = {
        position: "absolute",
        visibility: "hidden",
        display: "block"
    }, bx = ["Top", "Right", "Bottom", "Left"], by, bz, bA;
    f.fn.css = function(a, c) {
        return f.access(this, function(a, c, d) {
            return d !== b ? f.style(a, c, d) : f.css(a, c)
        }, a, c, arguments.length > 1)
    }
    ,
    f.extend({
        cssHooks: {
            opacity: {
                get: function(a, b) {
                    if (b) {
                        var c = by(a, "opacity");
                        return c === "" ? "1" : c
                    }
                    return a.style.opacity
                }
            }
        },
        cssNumber: {
            fillOpacity: !0,
            fontWeight: !0,
            lineHeight: !0,
            opacity: !0,
            orphans: !0,
            widows: !0,
            zIndex: !0,
            zoom: !0
        },
        cssProps: {
            "float": f.support.cssFloat ? "cssFloat" : "styleFloat"
        },
        style: function(a, c, d, e) {
            if (!!a && a.nodeType !== 3 && a.nodeType !== 8 && !!a.style) {
                var g, h, i = f.camelCase(c), j = a.style, k = f.cssHooks[i];
                c = f.cssProps[i] || i;
                if (d === b) {
                    if (k && "get"in k && (g = k.get(a, !1, e)) !== b)
                        return g;
                    return j[c]
                }
                h = typeof d,
                h === "string" && (g = bu.exec(d)) && (d = +(g[1] + 1) * +g[2] + parseFloat(f.css(a, c)),
                h = "number");
                if (d == null || h === "number" && isNaN(d))
                    return;
                h === "number" && !f.cssNumber[i] && (d += "px");
                if (!k || !("set"in k) || (d = k.set(a, d)) !== b)
                    try {
                        j[c] = d
                    } catch (l) {}
            }
        },
        css: function(a, c, d) {
            var e, g;
            c = f.camelCase(c),
            g = f.cssHooks[c],
            c = f.cssProps[c] || c,
            c === "cssFloat" && (c = "float");
            if (g && "get"in g && (e = g.get(a, !0, d)) !== b)
                return e;
            if (by)
                return by(a, c)
        },
        swap: function(a, b, c) {
            var d = {}, e, f;
            for (f in b)
                d[f] = a.style[f],
                a.style[f] = b[f];
            e = c.call(a);
            for (f in b)
                a.style[f] = d[f];
            return e
        }
    }),
    f.curCSS = f.css,
    c.defaultView && c.defaultView.getComputedStyle && (bz = function(a, b) {
        var c, d, e, g, h = a.style;
        b = b.replace(br, "-$1").toLowerCase(),
        (d = a.ownerDocument.defaultView) && (e = d.getComputedStyle(a, null)) && (c = e.getPropertyValue(b),
        c === "" && !f.contains(a.ownerDocument.documentElement, a) && (c = f.style(a, b))),
        !f.support.pixelMargin && e && bv.test(b) && bt.test(c) && (g = h.width,
        h.width = c,
        c = e.width,
        h.width = g);
        return c
    }
    ),
    c.documentElement.currentStyle && (bA = function(a, b) {
        var c, d, e, f = a.currentStyle && a.currentStyle[b], g = a.style;
        f == null && g && (e = g[b]) && (f = e),
        bt.test(f) && (c = g.left,
        d = a.runtimeStyle && a.runtimeStyle.left,
        d && (a.runtimeStyle.left = a.currentStyle.left),
        g.left = b === "fontSize" ? "1em" : f,
        f = g.pixelLeft + "px",
        g.left = c,
        d && (a.runtimeStyle.left = d));
        return f === "" ? "auto" : f
    }
    ),
    by = bz || bA,
    f.each(["height", "width"], function(a, b) {
        f.cssHooks[b] = {
            get: function(a, c, d) {
                if (c)
                    return a.offsetWidth !== 0 ? bB(a, b, d) : f.swap(a, bw, function() {
                        return bB(a, b, d)
                    })
            },
            set: function(a, b) {
                return bs.test(b) ? b + "px" : b
            }
        }
    }),
    f.support.opacity || (f.cssHooks.opacity = {
        get: function(a, b) {
            return bq.test((b && a.currentStyle ? a.currentStyle.filter : a.style.filter) || "") ? parseFloat(RegExp.$1) / 100 + "" : b ? "1" : ""
        },
        set: function(a, b) {
            var c = a.style
              , d = a.currentStyle
              , e = f.isNumeric(b) ? "alpha(opacity=" + b * 100 + ")" : ""
              , g = d && d.filter || c.filter || "";
            c.zoom = 1;
            if (b >= 1 && f.trim(g.replace(bp, "")) === "") {
                c.removeAttribute("filter");
                if (d && !d.filter)
                    return
            }
            c.filter = bp.test(g) ? g.replace(bp, e) : g + " " + e
        }
    }),
    f(function() {
        f.support.reliableMarginRight || (f.cssHooks.marginRight = {
            get: function(a, b) {
                return f.swap(a, {
                    display: "inline-block"
                }, function() {
                    return b ? by(a, "margin-right") : a.style.marginRight
                })
            }
        })
    }),
    f.expr && f.expr.filters && (f.expr.filters.hidden = function(a) {
        var b = a.offsetWidth
          , c = a.offsetHeight;
        return b === 0 && c === 0 || !f.support.reliableHiddenOffsets && (a.style && a.style.display || f.css(a, "display")) === "none"
    }
    ,
    f.expr.filters.visible = function(a) {
        return !f.expr.filters.hidden(a)
    }
    ),
    f.each({
        margin: "",
        padding: "",
        border: "Width"
    }, function(a, b) {
        f.cssHooks[a + b] = {
            expand: function(c) {
                var d, e = typeof c == "string" ? c.split(" ") : [c], f = {};
                for (d = 0; d < 4; d++)
                    f[a + bx[d] + b] = e[d] || e[d - 2] || e[0];
                return f
            }
        }
    });
    var bC = /%20/g, bD = /\[\]$/, bE = /\r?\n/g, bF = /#.*$/, bG = /^(.*?):[ \t]*([^\r\n]*)\r?$/mg, bH = /^(?:color|date|datetime|datetime-local|email|hidden|month|number|password|range|search|tel|text|time|url|week)$/i, bI = /^(?:about|app|app\-storage|.+\-extension|file|res|widget):$/, bJ = /^(?:GET|HEAD)$/, bK = /^\/\//, bL = /\?/, bM = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, bN = /^(?:select|textarea)/i, bO = /\s+/, bP = /([?&])_=[^&]*/, bQ = /^([\w\+\.\-]+:)(?:\/\/([^\/?#:]*)(?::(\d+))?)?/, bR = f.fn.load, bS = {}, bT = {}, bU, bV, bW = ["*/"] + ["*"];
    try {
        bU = e.href
    } catch (bX) {
        bU = c.createElement("a"),
        bU.href = "",
        bU = bU.href
    }
    bV = bQ.exec(bU.toLowerCase()) || [],
    f.fn.extend({
        load: function(a, c, d) {
            if (typeof a != "string" && bR)
                return bR.apply(this, arguments);
            if (!this.length)
                return this;
            var e = a.indexOf(" ");
            if (e >= 0) {
                var g = a.slice(e, a.length);
                a = a.slice(0, e)
            }
            var h = "GET";
            c && (f.isFunction(c) ? (d = c,
            c = b) : typeof c == "object" && (c = f.param(c, f.ajaxSettings.traditional),
            h = "POST"));
            var i = this;
            f.ajax({
                url: a,
                type: h,
                dataType: "html",
                data: c,
                complete: function(a, b, c) {
                    c = a.responseText,
                    a.isResolved() && (a.done(function(a) {
                        c = a
                    }),
                    i.html(g ? f("<div>").append(c.replace(bM, "")).find(g) : c)),
                    d && i.each(d, [c, b, a])
                }
            });
            return this
        },
        serialize: function() {
            return f.param(this.serializeArray())
        },
        serializeArray: function() {
            return this.map(function() {
                return this.elements ? f.makeArray(this.elements) : this
            }).filter(function() {
                return this.name && !this.disabled && (this.checked || bN.test(this.nodeName) || bH.test(this.type))
            }).map(function(a, b) {
                var c = f(this).val();
                return c == null ? null : f.isArray(c) ? f.map(c, function(a, c) {
                    return {
                        name: b.name,
                        value: a.replace(bE, "\r\n")
                    }
                }) : {
                    name: b.name,
                    value: c.replace(bE, "\r\n")
                }
            }).get()
        }
    }),
    f.each("ajaxStart ajaxStop ajaxComplete ajaxError ajaxSuccess ajaxSend".split(" "), function(a, b) {
        f.fn[b] = function(a) {
            return this.on(b, a)
        }
    }),
    f.each(["get", "post"], function(a, c) {
        f[c] = function(a, d, e, g) {
            f.isFunction(d) && (g = g || e,
            e = d,
            d = b);
            return f.ajax({
                type: c,
                url: a,
                data: d,
                success: e,
                dataType: g
            })
        }
    }),
    f.extend({
        getScript: function(a, c) {
            return f.get(a, b, c, "script")
        },
        getJSON: function(a, b, c) {
            return f.get(a, b, c, "json")
        },
        ajaxSetup: function(a, b) {
            b ? b$(a, f.ajaxSettings) : (b = a,
            a = f.ajaxSettings),
            b$(a, b);
            return a
        },
        ajaxSettings: {
            url: bU,
            isLocal: bI.test(bV[1]),
            global: !0,
            type: "GET",
            contentType: "application/x-www-form-urlencoded; charset=UTF-8",
            processData: !0,
            async: !0,
            accepts: {
                xml: "application/xml, text/xml",
                html: "text/html",
                text: "text/plain",
                json: "application/json, text/javascript",
                "*": bW
            },
            contents: {
                xml: /xml/,
                html: /html/,
                json: /json/
            },
            responseFields: {
                xml: "responseXML",
                text: "responseText"
            },
            converters: {
                "* text": a.String,
                "text html": !0,
                "text json": f.parseJSON,
                "text xml": f.parseXML
            },
            flatOptions: {
                context: !0,
                url: !0
            }
        },
        ajaxPrefilter: bY(bS),
        ajaxTransport: bY(bT),
        ajax: function(a, c) {
            function w(a, c, l, m) {
                if (s !== 2) {
                    s = 2,
                    q && clearTimeout(q),
                    p = b,
                    n = m || "",
                    v.readyState = a > 0 ? 4 : 0;
                    var o, r, u, w = c, x = l ? ca(d, v, l) : b, y, z;
                    if (a >= 200 && a < 300 || a === 304) {
                        if (d.ifModified) {
                            if (y = v.getResponseHeader("Last-Modified"))
                                f.lastModified[k] = y;
                            if (z = v.getResponseHeader("Etag"))
                                f.etag[k] = z
                        }
                        if (a === 304)
                            w = "notmodified",
                            o = !0;
                        else
                            try {
                                r = cb(d, x),
                                w = "success",
                                o = !0
                            } catch (A) {
                                w = "parsererror",
                                u = A
                            }
                    } else {
                        u = w;
                        if (!w || a)
                            w = "error",
                            a < 0 && (a = 0)
                    }
                    v.status = a,
                    v.statusText = "" + (c || w),
                    o ? h.resolveWith(e, [r, w, v]) : h.rejectWith(e, [v, w, u]),
                    v.statusCode(j),
                    j = b,
                    t && g.trigger("ajax" + (o ? "Success" : "Error"), [v, d, o ? r : u]),
                    i.fireWith(e, [v, w]),
                    t && (g.trigger("ajaxComplete", [v, d]),
                    --f.active || f.event.trigger("ajaxStop"))
                }
            }
            typeof a == "object" && (c = a,
            a = b),
            c = c || {};
            var d = f.ajaxSetup({}, c), e = d.context || d, g = e !== d && (e.nodeType || e instanceof f) ? f(e) : f.event, h = f.Deferred(), i = f.Callbacks("once memory"), j = d.statusCode || {}, k, l = {}, m = {}, n, o, p, q, r, s = 0, t, u, v = {
                readyState: 0,
                setRequestHeader: function(a, b) {
                    if (!s) {
                        var c = a.toLowerCase();
                        a = m[c] = m[c] || a,
                        l[a] = b
                    }
                    return this
                },
                getAllResponseHeaders: function() {
                    return s === 2 ? n : null
                },
                getResponseHeader: function(a) {
                    var c;
                    if (s === 2) {
                        if (!o) {
                            o = {};
                            while (c = bG.exec(n))
                                o[c[1].toLowerCase()] = c[2]
                        }
                        c = o[a.toLowerCase()]
                    }
                    return c === b ? null : c
                },
                overrideMimeType: function(a) {
                    s || (d.mimeType = a);
                    return this
                },
                abort: function(a) {
                    a = a || "abort",
                    p && p.abort(a),
                    w(0, a);
                    return this
                }
            };
            h.promise(v),
            v.success = v.done,
            v.error = v.fail,
            v.complete = i.add,
            v.statusCode = function(a) {
                if (a) {
                    var b;
                    if (s < 2)
                        for (b in a)
                            j[b] = [j[b], a[b]];
                    else
                        b = a[v.status],
                        v.then(b, b)
                }
                return this
            }
            ,
            d.url = ((a || d.url) + "").replace(bF, "").replace(bK, bV[1] + "//"),
            d.dataTypes = f.trim(d.dataType || "*").toLowerCase().split(bO),
            d.crossDomain == null && (r = bQ.exec(d.url.toLowerCase()),
            d.crossDomain = !(!r || r[1] == bV[1] && r[2] == bV[2] && (r[3] || (r[1] === "http:" ? 80 : 443)) == (bV[3] || (bV[1] === "http:" ? 80 : 443)))),
            d.data && d.processData && typeof d.data != "string" && (d.data = f.param(d.data, d.traditional)),
            bZ(bS, d, c, v);
            if (s === 2)
                return !1;
            t = d.global,
            d.type = d.type.toUpperCase(),
            d.hasContent = !bJ.test(d.type),
            t && f.active++ === 0 && f.event.trigger("ajaxStart");
            if (!d.hasContent) {
                d.data && (d.url += (bL.test(d.url) ? "&" : "?") + d.data,
                delete d.data),
                k = d.url;
                if (d.cache === !1) {
                    var x = f.now()
                      , y = d.url.replace(bP, "$1_=" + x);
                    d.url = y + (y === d.url ? (bL.test(d.url) ? "&" : "?") + "_=" + x : "")
                }
            }
            (d.data && d.hasContent && d.contentType !== !1 || c.contentType) && v.setRequestHeader("Content-Type", d.contentType),
            d.ifModified && (k = k || d.url,
            f.lastModified[k] && v.setRequestHeader("If-Modified-Since", f.lastModified[k]),
            f.etag[k] && v.setRequestHeader("If-None-Match", f.etag[k])),
            v.setRequestHeader("Accept", d.dataTypes[0] && d.accepts[d.dataTypes[0]] ? d.accepts[d.dataTypes[0]] + (d.dataTypes[0] !== "*" ? ", " + bW + "; q=0.01" : "") : d.accepts["*"]);
            for (u in d.headers)
                v.setRequestHeader(u, d.headers[u]);
            if (d.beforeSend && (d.beforeSend.call(e, v, d) === !1 || s === 2)) {
                v.abort();
                return !1
            }
            for (u in {
                success: 1,
                error: 1,
                complete: 1
            })
                v[u](d[u]);
            p = bZ(bT, d, c, v);
            if (!p)
                w(-1, "No Transport");
            else {
                v.readyState = 1,
                t && g.trigger("ajaxSend", [v, d]),
                d.async && d.timeout > 0 && (q = setTimeout(function() {
                    v.abort("timeout")
                }, d.timeout));
                try {
                    s = 1,
                    p.send(l, w)
                } catch (z) {
                    if (s < 2)
                        w(-1, z);
                    else
                        throw z
                }
            }
            return v
        },
        param: function(a, c) {
            var d = []
              , e = function(a, b) {
                b = f.isFunction(b) ? b() : b,
                d[d.length] = encodeURIComponent(a) + "=" + encodeURIComponent(b)
            };
            c === b && (c = f.ajaxSettings.traditional);
            if (f.isArray(a) || a.jquery && !f.isPlainObject(a))
                f.each(a, function() {
                    e(this.name, this.value)
                });
            else
                for (var g in a)
                    b_(g, a[g], c, e);
            return d.join("&").replace(bC, "+")
        }
    }),
    f.extend({
        active: 0,
        lastModified: {},
        etag: {}
    });
    var cc = f.now()
      , cd = /(\=)\?(&|$)|\?\?/i;
    f.ajaxSetup({
        jsonp: "callback",
        jsonpCallback: function() {
            return f.expando + "_" + cc++
        }
    }),
    f.ajaxPrefilter("json jsonp", function(b, c, d) {
        var e = typeof b.data == "string" && /^application\/x\-www\-form\-urlencoded/.test(b.contentType);
        if (b.dataTypes[0] === "jsonp" || b.jsonp !== !1 && (cd.test(b.url) || e && cd.test(b.data))) {
            var g, h = b.jsonpCallback = f.isFunction(b.jsonpCallback) ? b.jsonpCallback() : b.jsonpCallback, i = a[h], j = b.url, k = b.data, l = "$1" + h + "$2";
            b.jsonp !== !1 && (j = j.replace(cd, l),
            b.url === j && (e && (k = k.replace(cd, l)),
            b.data === k && (j += (/\?/.test(j) ? "&" : "?") + b.jsonp + "=" + h))),
            b.url = j,
            b.data = k,
            a[h] = function(a) {
                g = [a]
            }
            ,
            d.always(function() {
                a[h] = i,
                g && f.isFunction(i) && a[h](g[0])
            }),
            b.converters["script json"] = function() {
                g || f.error(h + " was not called");
                return g[0]
            }
            ,
            b.dataTypes[0] = "json";
            return "script"
        }
    }),
    f.ajaxSetup({
        accepts: {
            script: "text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"
        },
        contents: {
            script: /javascript|ecmascript/
        },
        converters: {
            "text script": function(a) {
                f.globalEval(a);
                return a
            }
        }
    }),
    f.ajaxPrefilter("script", function(a) {
        a.cache === b && (a.cache = !1),
        a.crossDomain && (a.type = "GET",
        a.global = !1)
    }),
    f.ajaxTransport("script", function(a) {
        if (a.crossDomain) {
            var d, e = c.head || c.getElementsByTagName("head")[0] || c.documentElement;
            return {
                send: function(f, g) {
                    d = c.createElement("script"),
                    d.async = "async",
                    a.scriptCharset && (d.charset = a.scriptCharset),
                    d.src = a.url,
                    d.onload = d.onreadystatechange = function(a, c) {
                        if (c || !d.readyState || /loaded|complete/.test(d.readyState))
                            d.onload = d.onreadystatechange = null,
                            e && d.parentNode && e.removeChild(d),
                            d = b,
                            c || g(200, "success")
                    }
                    ,
                    e.insertBefore(d, e.firstChild)
                },
                abort: function() {
                    d && d.onload(0, 1)
                }
            }
        }
    });
    var ce = a.ActiveXObject ? function() {
        for (var a in cg)
            cg[a](0, 1)
    }
    : !1, cf = 0, cg;
    f.ajaxSettings.xhr = a.ActiveXObject ? function() {
        return !this.isLocal && ch() || ci()
    }
    : ch,
    function(a) {
        f.extend(f.support, {
            ajax: !!a,
            cors: !!a && "withCredentials"in a
        })
    }(f.ajaxSettings.xhr()),
    f.support.ajax && f.ajaxTransport(function(c) {
        if (!c.crossDomain || f.support.cors) {
            var d;
            return {
                send: function(e, g) {
                    var h = c.xhr(), i, j;
                    c.username ? h.open(c.type, c.url, c.async, c.username, c.password) : h.open(c.type, c.url, c.async);
                    if (c.xhrFields)
                        for (j in c.xhrFields)
                            h[j] = c.xhrFields[j];
                    c.mimeType && h.overrideMimeType && h.overrideMimeType(c.mimeType),
                    !c.crossDomain && !e["X-Requested-With"] && (e["X-Requested-With"] = "XMLHttpRequest");
                    try {
                        for (j in e)
                            h.setRequestHeader(j, e[j])
                    } catch (k) {}
                    h.send(c.hasContent && c.data || null),
                    d = function(a, e) {
                        var j, k, l, m, n;
                        try {
                            if (d && (e || h.readyState === 4)) {
                                d = b,
                                i && (h.onreadystatechange = f.noop,
                                ce && delete cg[i]);
                                if (e)
                                    h.readyState !== 4 && h.abort();
                                else {
                                    j = h.status,
                                    l = h.getAllResponseHeaders(),
                                    m = {},
                                    n = h.responseXML,
                                    n && n.documentElement && (m.xml = n);
                                    try {
                                        m.text = h.responseText
                                    } catch (a) {}
                                    try {
                                        k = h.statusText
                                    } catch (o) {
                                        k = ""
                                    }
                                    !j && c.isLocal && !c.crossDomain ? j = m.text ? 200 : 404 : j === 1223 && (j = 204)
                                }
                            }
                        } catch (p) {
                            e || g(-1, p)
                        }
                        m && g(j, k, m, l)
                    }
                    ,
                    !c.async || h.readyState === 4 ? d() : (i = ++cf,
                    ce && (cg || (cg = {},
                    f(a).unload(ce)),
                    cg[i] = d),
                    h.onreadystatechange = d)
                },
                abort: function() {
                    d && d(0, 1)
                }
            }
        }
    });
    var cj = {}, ck, cl, cm = /^(?:toggle|show|hide)$/, cn = /^([+\-]=)?([\d+.\-]+)([a-z%]*)$/i, co, cp = [["height", "marginTop", "marginBottom", "paddingTop", "paddingBottom"], ["width", "marginLeft", "marginRight", "paddingLeft", "paddingRight"], ["opacity"]], cq;
    f.fn.extend({
        show: function(a, b, c) {
            var d, e;
            if (a || a === 0)
                return this.animate(ct("show", 3), a, b, c);
            for (var g = 0, h = this.length; g < h; g++)
                d = this[g],
                d.style && (e = d.style.display,
                !f._data(d, "olddisplay") && e === "none" && (e = d.style.display = ""),
                (e === "" && f.css(d, "display") === "none" || !f.contains(d.ownerDocument.documentElement, d)) && f._data(d, "olddisplay", cu(d.nodeName)));
            for (g = 0; g < h; g++) {
                d = this[g];
                if (d.style) {
                    e = d.style.display;
                    if (e === "" || e === "none")
                        d.style.display = f._data(d, "olddisplay") || ""
                }
            }
            return this
        },
        hide: function(a, b, c) {
            if (a || a === 0)
                return this.animate(ct("hide", 3), a, b, c);
            var d, e, g = 0, h = this.length;
            for (; g < h; g++)
                d = this[g],
                d.style && (e = f.css(d, "display"),
                e !== "none" && !f._data(d, "olddisplay") && f._data(d, "olddisplay", e));
            for (g = 0; g < h; g++)
                this[g].style && (this[g].style.display = "none");
            return this
        },
        _toggle: f.fn.toggle,
        toggle: function(a, b, c) {
            var d = typeof a == "boolean";
            f.isFunction(a) && f.isFunction(b) ? this._toggle.apply(this, arguments) : a == null || d ? this.each(function() {
                var b = d ? a : f(this).is(":hidden");
                f(this)[b ? "show" : "hide"]()
            }) : this.animate(ct("toggle", 3), a, b, c);
            return this
        },
        fadeTo: function(a, b, c, d) {
            return this.filter(":hidden").css("opacity", 0).show().end().animate({
                opacity: b
            }, a, c, d)
        },
        animate: function(a, b, c, d) {
            function g() {
                e.queue === !1 && f._mark(this);
                var b = f.extend({}, e), c = this.nodeType === 1, d = c && f(this).is(":hidden"), g, h, i, j, k, l, m, n, o, p, q;
                b.animatedProperties = {};
                for (i in a) {
                    g = f.camelCase(i),
                    i !== g && (a[g] = a[i],
                    delete a[i]);
                    if ((k = f.cssHooks[g]) && "expand"in k) {
                        l = k.expand(a[g]),
                        delete a[g];
                        for (i in l)
                            i in a || (a[i] = l[i])
                    }
                }
                for (g in a) {
                    h = a[g],
                    f.isArray(h) ? (b.animatedProperties[g] = h[1],
                    h = a[g] = h[0]) : b.animatedProperties[g] = b.specialEasing && b.specialEasing[g] || b.easing || "swing";
                    if (h === "hide" && d || h === "show" && !d)
                        return b.complete.call(this);
                    c && (g === "height" || g === "width") && (b.overflow = [this.style.overflow, this.style.overflowX, this.style.overflowY],
                    f.css(this, "display") === "inline" && f.css(this, "float") === "none" && (!f.support.inlineBlockNeedsLayout || cu(this.nodeName) === "inline" ? this.style.display = "inline-block" : this.style.zoom = 1))
                }
                b.overflow != null && (this.style.overflow = "hidden");
                for (i in a)
                    j = new f.fx(this,b,i),
                    h = a[i],
                    cm.test(h) ? (q = f._data(this, "toggle" + i) || (h === "toggle" ? d ? "show" : "hide" : 0),
                    q ? (f._data(this, "toggle" + i, q === "show" ? "hide" : "show"),
                    j[q]()) : j[h]()) : (m = cn.exec(h),
                    n = j.cur(),
                    m ? (o = parseFloat(m[2]),
                    p = m[3] || (f.cssNumber[i] ? "" : "px"),
                    p !== "px" && (f.style(this, i, (o || 1) + p),
                    n = (o || 1) / j.cur() * n,
                    f.style(this, i, n + p)),
                    m[1] && (o = (m[1] === "-=" ? -1 : 1) * o + n),
                    j.custom(n, o, p)) : j.custom(n, h, ""));
                return !0
            }
            var e = f.speed(b, c, d);
            if (f.isEmptyObject(a))
                return this.each(e.complete, [!1]);
            a = f.extend({}, a);
            return e.queue === !1 ? this.each(g) : this.queue(e.queue, g)
        },
        stop: function(a, c, d) {
            typeof a != "string" && (d = c,
            c = a,
            a = b),
            c && a !== !1 && this.queue(a || "fx", []);
            return this.each(function() {
                function h(a, b, c) {
                    var e = b[c];
                    f.removeData(a, c, !0),
                    e.stop(d)
                }
                var b, c = !1, e = f.timers, g = f._data(this);
                d || f._unmark(!0, this);
                if (a == null)
                    for (b in g)
                        g[b] && g[b].stop && b.indexOf(".run") === b.length - 4 && h(this, g, b);
                else
                    g[b = a + ".run"] && g[b].stop && h(this, g, b);
                for (b = e.length; b--; )
                    e[b].elem === this && (a == null || e[b].queue === a) && (d ? e[b](!0) : e[b].saveState(),
                    c = !0,
                    e.splice(b, 1));
                (!d || !c) && f.dequeue(this, a)
            })
        }
    }),
    f.each({
        slideDown: ct("show", 1),
        slideUp: ct("hide", 1),
        slideToggle: ct("toggle", 1),
        fadeIn: {
            opacity: "show"
        },
        fadeOut: {
            opacity: "hide"
        },
        fadeToggle: {
            opacity: "toggle"
        }
    }, function(a, b) {
        f.fn[a] = function(a, c, d) {
            return this.animate(b, a, c, d)
        }
    }),
    f.extend({
        speed: function(a, b, c) {
            var d = a && typeof a == "object" ? f.extend({}, a) : {
                complete: c || !c && b || f.isFunction(a) && a,
                duration: a,
                easing: c && b || b && !f.isFunction(b) && b
            };
            d.duration = f.fx.off ? 0 : typeof d.duration == "number" ? d.duration : d.duration in f.fx.speeds ? f.fx.speeds[d.duration] : f.fx.speeds._default;
            if (d.queue == null || d.queue === !0)
                d.queue = "fx";
            d.old = d.complete,
            d.complete = function(a) {
                f.isFunction(d.old) && d.old.call(this),
                d.queue ? f.dequeue(this, d.queue) : a !== !1 && f._unmark(this)
            }
            ;
            return d
        },
        easing: {
            linear: function(a) {
                return a
            },
            swing: function(a) {
                return -Math.cos(a * Math.PI) / 2 + .5
            }
        },
        timers: [],
        fx: function(a, b, c) {
            this.options = b,
            this.elem = a,
            this.prop = c,
            b.orig = b.orig || {}
        }
    }),
    f.fx.prototype = {
        update: function() {
            this.options.step && this.options.step.call(this.elem, this.now, this),
            (f.fx.step[this.prop] || f.fx.step._default)(this)
        },
        cur: function() {
            if (this.elem[this.prop] != null && (!this.elem.style || this.elem.style[this.prop] == null))
                return this.elem[this.prop];
            var a, b = f.css(this.elem, this.prop);
            return isNaN(a = parseFloat(b)) ? !b || b === "auto" ? 0 : b : a
        },
        custom: function(a, c, d) {
            function h(a) {
                return e.step(a)
            }
            var e = this
              , g = f.fx;
            this.startTime = cq || cr(),
            this.end = c,
            this.now = this.start = a,
            this.pos = this.state = 0,
            this.unit = d || this.unit || (f.cssNumber[this.prop] ? "" : "px"),
            h.queue = this.options.queue,
            h.elem = this.elem,
            h.saveState = function() {
                f._data(e.elem, "fxshow" + e.prop) === b && (e.options.hide ? f._data(e.elem, "fxshow" + e.prop, e.start) : e.options.show && f._data(e.elem, "fxshow" + e.prop, e.end))
            }
            ,
            h() && f.timers.push(h) && !co && (co = setInterval(g.tick, g.interval))
        },
        show: function() {
            var a = f._data(this.elem, "fxshow" + this.prop);
            this.options.orig[this.prop] = a || f.style(this.elem, this.prop),
            this.options.show = !0,
            a !== b ? this.custom(this.cur(), a) : this.custom(this.prop === "width" || this.prop === "height" ? 1 : 0, this.cur()),
            f(this.elem).show()
        },
        hide: function() {
            this.options.orig[this.prop] = f._data(this.elem, "fxshow" + this.prop) || f.style(this.elem, this.prop),
            this.options.hide = !0,
            this.custom(this.cur(), 0)
        },
        step: function(a) {
            var b, c, d, e = cq || cr(), g = !0, h = this.elem, i = this.options;
            if (a || e >= i.duration + this.startTime) {
                this.now = this.end,
                this.pos = this.state = 1,
                this.update(),
                i.animatedProperties[this.prop] = !0;
                for (b in i.animatedProperties)
                    i.animatedProperties[b] !== !0 && (g = !1);
                if (g) {
                    i.overflow != null && !f.support.shrinkWrapBlocks && f.each(["", "X", "Y"], function(a, b) {
                        h.style["overflow" + b] = i.overflow[a]
                    }),
                    i.hide && f(h).hide();
                    if (i.hide || i.show)
                        for (b in i.animatedProperties)
                            f.style(h, b, i.orig[b]),
                            f.removeData(h, "fxshow" + b, !0),
                            f.removeData(h, "toggle" + b, !0);
                    d = i.complete,
                    d && (i.complete = !1,
                    d.call(h))
                }
                return !1
            }
            i.duration == Infinity ? this.now = e : (c = e - this.startTime,
            this.state = c / i.duration,
            this.pos = f.easing[i.animatedProperties[this.prop]](this.state, c, 0, 1, i.duration),
            this.now = this.start + (this.end - this.start) * this.pos),
            this.update();
            return !0
        }
    },
    f.extend(f.fx, {
        tick: function() {
            var a, b = f.timers, c = 0;
            for (; c < b.length; c++)
                a = b[c],
                !a() && b[c] === a && b.splice(c--, 1);
            b.length || f.fx.stop()
        },
        interval: 13,
        stop: function() {
            clearInterval(co),
            co = null
        },
        speeds: {
            slow: 600,
            fast: 200,
            _default: 400
        },
        step: {
            opacity: function(a) {
                f.style(a.elem, "opacity", a.now)
            },
            _default: function(a) {
                a.elem.style && a.elem.style[a.prop] != null ? a.elem.style[a.prop] = a.now + a.unit : a.elem[a.prop] = a.now
            }
        }
    }),
    f.each(cp.concat.apply([], cp), function(a, b) {
        b.indexOf("margin") && (f.fx.step[b] = function(a) {
            f.style(a.elem, b, Math.max(0, a.now) + a.unit)
        }
        )
    }),
    f.expr && f.expr.filters && (f.expr.filters.animated = function(a) {
        return f.grep(f.timers, function(b) {
            return a === b.elem
        }).length
    }
    );
    var cv, cw = /^t(?:able|d|h)$/i, cx = /^(?:body|html)$/i;
    "getBoundingClientRect"in c.documentElement ? cv = function(a, b, c, d) {
        try {
            d = a.getBoundingClientRect()
        } catch (e) {}
        if (!d || !f.contains(c, a))
            return d ? {
                top: d.top,
                left: d.left
            } : {
                top: 0,
                left: 0
            };
        var g = b.body
          , h = cy(b)
          , i = c.clientTop || g.clientTop || 0
          , j = c.clientLeft || g.clientLeft || 0
          , k = h.pageYOffset || f.support.boxModel && c.scrollTop || g.scrollTop
          , l = h.pageXOffset || f.support.boxModel && c.scrollLeft || g.scrollLeft
          , m = d.top + k - i
          , n = d.left + l - j;
        return {
            top: m,
            left: n
        }
    }
    : cv = function(a, b, c) {
        var d, e = a.offsetParent, g = a, h = b.body, i = b.defaultView, j = i ? i.getComputedStyle(a, null) : a.currentStyle, k = a.offsetTop, l = a.offsetLeft;
        while ((a = a.parentNode) && a !== h && a !== c) {
            if (f.support.fixedPosition && j.position === "fixed")
                break;
            d = i ? i.getComputedStyle(a, null) : a.currentStyle,
            k -= a.scrollTop,
            l -= a.scrollLeft,
            a === e && (k += a.offsetTop,
            l += a.offsetLeft,
            f.support.doesNotAddBorder && (!f.support.doesAddBorderForTableAndCells || !cw.test(a.nodeName)) && (k += parseFloat(d.borderTopWidth) || 0,
            l += parseFloat(d.borderLeftWidth) || 0),
            g = e,
            e = a.offsetParent),
            f.support.subtractsBorderForOverflowNotVisible && d.overflow !== "visible" && (k += parseFloat(d.borderTopWidth) || 0,
            l += parseFloat(d.borderLeftWidth) || 0),
            j = d
        }
        if (j.position === "relative" || j.position === "static")
            k += h.offsetTop,
            l += h.offsetLeft;
        f.support.fixedPosition && j.position === "fixed" && (k += Math.max(c.scrollTop, h.scrollTop),
        l += Math.max(c.scrollLeft, h.scrollLeft));
        return {
            top: k,
            left: l
        }
    }
    ,
    f.fn.offset = function(a) {
        if (arguments.length)
            return a === b ? this : this.each(function(b) {
                f.offset.setOffset(this, a, b)
            });
        var c = this[0]
          , d = c && c.ownerDocument;
        if (!d)
            return null;
        if (c === d.body)
            return f.offset.bodyOffset(c);
        return cv(c, d, d.documentElement)
    }
    ,
    f.offset = {
        bodyOffset: function(a) {
            var b = a.offsetTop
              , c = a.offsetLeft;
            f.support.doesNotIncludeMarginInBodyOffset && (b += parseFloat(f.css(a, "marginTop")) || 0,
            c += parseFloat(f.css(a, "marginLeft")) || 0);
            return {
                top: b,
                left: c
            }
        },
        setOffset: function(a, b, c) {
            var d = f.css(a, "position");
            d === "static" && (a.style.position = "relative");
            var e = f(a), g = e.offset(), h = f.css(a, "top"), i = f.css(a, "left"), j = (d === "absolute" || d === "fixed") && f.inArray("auto", [h, i]) > -1, k = {}, l = {}, m, n;
            j ? (l = e.position(),
            m = l.top,
            n = l.left) : (m = parseFloat(h) || 0,
            n = parseFloat(i) || 0),
            f.isFunction(b) && (b = b.call(a, c, g)),
            b.top != null && (k.top = b.top - g.top + m),
            b.left != null && (k.left = b.left - g.left + n),
            "using"in b ? b.using.call(a, k) : e.css(k)
        }
    },
    f.fn.extend({
        position: function() {
            if (!this[0])
                return null;
            var a = this[0]
              , b = this.offsetParent()
              , c = this.offset()
              , d = cx.test(b[0].nodeName) ? {
                top: 0,
                left: 0
            } : b.offset();
            c.top -= parseFloat(f.css(a, "marginTop")) || 0,
            c.left -= parseFloat(f.css(a, "marginLeft")) || 0,
            d.top += parseFloat(f.css(b[0], "borderTopWidth")) || 0,
            d.left += parseFloat(f.css(b[0], "borderLeftWidth")) || 0;
            return {
                top: c.top - d.top,
                left: c.left - d.left
            }
        },
        offsetParent: function() {
            return this.map(function() {
                var a = this.offsetParent || c.body;
                while (a && !cx.test(a.nodeName) && f.css(a, "position") === "static")
                    a = a.offsetParent;
                return a
            })
        }
    }),
    f.each({
        scrollLeft: "pageXOffset",
        scrollTop: "pageYOffset"
    }, function(a, c) {
        var d = /Y/.test(c);
        f.fn[a] = function(e) {
            return f.access(this, function(a, e, g) {
                var h = cy(a);
                if (g === b)
                    return h ? c in h ? h[c] : f.support.boxModel && h.document.documentElement[e] || h.document.body[e] : a[e];
                h ? h.scrollTo(d ? f(h).scrollLeft() : g, d ? g : f(h).scrollTop()) : a[e] = g
            }, a, e, arguments.length, null)
        }
    }),
    f.each({
        Height: "height",
        Width: "width"
    }, function(a, c) {
        var d = "client" + a
          , e = "scroll" + a
          , g = "offset" + a;
        f.fn["inner" + a] = function() {
            var a = this[0];
            return a ? a.style ? parseFloat(f.css(a, c, "padding")) : this[c]() : null
        }
        ,
        f.fn["outer" + a] = function(a) {
            var b = this[0];
            return b ? b.style ? parseFloat(f.css(b, c, a ? "margin" : "border")) : this[c]() : null
        }
        ,
        f.fn[c] = function(a) {
            return f.access(this, function(a, c, h) {
                var i, j, k, l;
                if (f.isWindow(a)) {
                    i = a.document,
                    j = i.documentElement[d];
                    return f.support.boxModel && j || i.body && i.body[d] || j
                }
                if (a.nodeType === 9) {
                    i = a.documentElement;
                    if (i[d] >= i[e])
                        return i[d];
                    return Math.max(a.body[e], i[e], a.body[g], i[g])
                }
                if (h === b) {
                    k = f.css(a, c),
                    l = parseFloat(k);
                    return f.isNumeric(l) ? l : k
                }
                f(a).css(c, h)
            }, c, a, arguments.length, null)
        }
    }),
    a.jQuery = a.$ = f,
    typeof define == "function" && define.amd && define.amd.jQuery && define("jquery", [], function() {
        return f
    })
}
)(window);
;/*
 Colorbox 1.6.4
 license: MIT
 http://www.jacklmoore.com/colorbox
*/
(function($, document, window) {
    var defaults = {
        html: false,
        photo: false,
        iframe: false,
        inline: false,
        transition: "elastic",
        speed: 300,
        fadeOut: 300,
        width: false,
        initialWidth: "600",
        innerWidth: false,
        maxWidth: false,
        height: false,
        initialHeight: "450",
        innerHeight: false,
        maxHeight: false,
        scalePhotos: true,
        scrolling: true,
        opacity: 0.9,
        preloading: true,
        className: false,
        overlayClose: true,
        escKey: true,
        arrowKey: true,
        top: false,
        bottom: false,
        left: false,
        right: false,
        fixed: false,
        data: undefined,
        closeButton: true,
        fastIframe: true,
        open: false,
        reposition: true,
        loop: true,
        slideshow: false,
        slideshowAuto: true,
        slideshowSpeed: 2500,
        slideshowStart: "start slideshow",
        slideshowStop: "stop slideshow",
        photoRegex: /\.(gif|png|jp(e|g|eg)|bmp|ico|webp|jxr|svg)((#|\?).*)?$/i,
        retinaImage: false,
        retinaUrl: false,
        retinaSuffix: '@2x.$1',
        current: "image {current} of {total}",
        previous: "previous",
        next: "next",
        close: "close",
        xhrError: "This content failed to load.",
        imgError: "This image failed to load.",
        returnFocus: true,
        trapFocus: true,
        onOpen: false,
        onLoad: false,
        onComplete: false,
        onCleanup: false,
        onClosed: false,
        rel: function() {
            return this.rel;
        },
        href: function() {
            return $(this).attr('href');
        },
        title: function() {
            return this.title;
        },
        createImg: function() {
            var img = new Image();
            var attrs = $(this).data('cbox-img-attrs');
            if (typeof attrs === 'object') {
                $.each(attrs, function(key, val) {
                    img[key] = val;
                });
            }
            return img;
        },
        createIframe: function() {
            var iframe = document.createElement('iframe');
            var attrs = $(this).data('cbox-iframe-attrs');
            if (typeof attrs === 'object') {
                $.each(attrs, function(key, val) {
                    iframe[key] = val;
                });
            }
            if ('frameBorder'in iframe) {
                iframe.frameBorder = 0;
            }
            if ('allowTransparency'in iframe) {
                iframe.allowTransparency = "true";
            }
            iframe.name = (new Date()).getTime();
            iframe.allowFullscreen = true;
            return iframe;
        }
    }, colorbox = 'colorbox', prefix = 'cbox', boxElement = prefix + 'Element', event_open = prefix + '_open', event_load = prefix + '_load', event_complete = prefix + '_complete', event_cleanup = prefix + '_cleanup', event_closed = prefix + '_closed', event_purge = prefix + '_purge', $overlay, $box, $wrap, $content, $topBorder, $leftBorder, $rightBorder, $bottomBorder, $related, $window, $loaded, $loadingBay, $loadingOverlay, $title, $current, $slideshow, $next, $prev, $close, $groupControls, $events = $('<a/>'), settings, interfaceHeight, interfaceWidth, loadedHeight, loadedWidth, index, photo, open, active, closing, loadingTimer, publicMethod, div = "div", requests = 0, previousCSS = {}, init;
    function $tag(tag, id, css) {
        var element = document.createElement(tag);
        if (id) {
            element.id = prefix + id;
        }
        if (css) {
            element.style.cssText = css;
        }
        return $(element);
    }
    function winheight() {
        return window.innerHeight ? window.innerHeight : $(window).height();
    }
    function Settings(element, options) {
        if (options !== Object(options)) {
            options = {};
        }
        this.cache = {};
        this.el = element;
        this.value = function(key) {
            var dataAttr;
            if (this.cache[key] === undefined) {
                dataAttr = $(this.el).attr('data-cbox-' + key);
                if (dataAttr !== undefined) {
                    this.cache[key] = dataAttr;
                } else if (options[key] !== undefined) {
                    this.cache[key] = options[key];
                } else if (defaults[key] !== undefined) {
                    this.cache[key] = defaults[key];
                }
            }
            return this.cache[key];
        }
        ;
        this.get = function(key) {
            var value = this.value(key);
            return $.isFunction(value) ? value.call(this.el, this) : value;
        }
        ;
    }
    function getIndex(increment) {
        var max = $related.length
          , newIndex = (index + increment) % max;
        return (newIndex < 0) ? max + newIndex : newIndex;
    }
    function setSize(size, dimension) {
        return Math.round((/%/.test(size) ? ((dimension === 'x' ? $window.width() : winheight()) / 100) : 1) * parseInt(size, 10));
    }
    function isImage(settings, url) {
        return settings.get('photo') || settings.get('photoRegex').test(url);
    }
    function retinaUrl(settings, url) {
        return settings.get('retinaUrl') && window.devicePixelRatio > 1 ? url.replace(settings.get('photoRegex'), settings.get('retinaSuffix')) : url;
    }
    function trapFocus(e) {
        if ('contains'in $box[0] && !$box[0].contains(e.target) && e.target !== $overlay[0]) {
            e.stopPropagation();
            $box.focus();
        }
    }
    function setClass(str) {
        if (setClass.str !== str) {
            $box.add($overlay).removeClass(setClass.str).addClass(str);
            setClass.str = str;
        }
    }
    function getRelated(rel) {
        index = 0;
        if (rel && rel !== false && rel !== 'nofollow') {
            $related = $('.' + boxElement).filter(function() {
                var options = $.data(this, colorbox);
                var settings = new Settings(this,options);
                return (settings.get('rel') === rel);
            });
            index = $related.index(settings.el);
            if (index === -1) {
                $related = $related.add(settings.el);
                index = $related.length - 1;
            }
        } else {
            $related = $(settings.el);
        }
    }
    function trigger(event) {
        $(document).trigger(event);
        $events.triggerHandler(event);
    }
    var slideshow = (function() {
        var active, className = prefix + "Slideshow_", click = "click." + prefix, timeOut;
        function clear() {
            clearTimeout(timeOut);
        }
        function set() {
            if (settings.get('loop') || $related[index + 1]) {
                clear();
                timeOut = setTimeout(publicMethod.next, settings.get('slideshowSpeed'));
            }
        }
        function start() {
            $slideshow.html(settings.get('slideshowStop')).unbind(click).one(click, stop);
            $events.bind(event_complete, set).bind(event_load, clear);
            $box.removeClass(className + "off").addClass(className + "on");
        }
        function stop() {
            clear();
            $events.unbind(event_complete, set).unbind(event_load, clear);
            $slideshow.html(settings.get('slideshowStart')).unbind(click).one(click, function() {
                publicMethod.next();
                start();
            });
            $box.removeClass(className + "on").addClass(className + "off");
        }
        function reset() {
            active = false;
            $slideshow.hide();
            clear();
            $events.unbind(event_complete, set).unbind(event_load, clear);
            $box.removeClass(className + "off " + className + "on");
        }
        return function() {
            if (active) {
                if (!settings.get('slideshow')) {
                    $events.unbind(event_cleanup, reset);
                    reset();
                }
            } else {
                if (settings.get('slideshow') && $related[1]) {
                    active = true;
                    $events.one(event_cleanup, reset);
                    if (settings.get('slideshowAuto')) {
                        start();
                    } else {
                        stop();
                    }
                    $slideshow.show();
                }
            }
        }
        ;
    }());
    function launch(element) {
        var options;
        if (!closing) {
            options = $(element).data(colorbox);
            settings = new Settings(element,options);
            getRelated(settings.get('rel'));
            if (!open) {
                open = active = true;
                setClass(settings.get('className'));
                $box.css({
                    visibility: 'hidden',
                    display: 'block',
                    opacity: ''
                });
                $loaded = $tag(div, 'LoadedContent', 'width:0; height:0; overflow:hidden; visibility:hidden');
                $content.css({
                    width: '',
                    height: ''
                }).append($loaded);
                interfaceHeight = $topBorder.height() + $bottomBorder.height() + $content.outerHeight(true) - $content.height();
                interfaceWidth = $leftBorder.width() + $rightBorder.width() + $content.outerWidth(true) - $content.width();
                loadedHeight = $loaded.outerHeight(true);
                loadedWidth = $loaded.outerWidth(true);
                var initialWidth = setSize(settings.get('initialWidth'), 'x');
                var initialHeight = setSize(settings.get('initialHeight'), 'y');
                var maxWidth = settings.get('maxWidth');
                var maxHeight = settings.get('maxHeight');
                settings.w = Math.max((maxWidth !== false ? Math.min(initialWidth, setSize(maxWidth, 'x')) : initialWidth) - loadedWidth - interfaceWidth, 0);
                settings.h = Math.max((maxHeight !== false ? Math.min(initialHeight, setSize(maxHeight, 'y')) : initialHeight) - loadedHeight - interfaceHeight, 0);
                $loaded.css({
                    width: '',
                    height: settings.h
                });
                publicMethod.position();
                trigger(event_open);
                settings.get('onOpen');
                $groupControls.add($title).hide();
                $box.focus();
                if (settings.get('trapFocus')) {
                    if (document.addEventListener) {
                        document.addEventListener('focus', trapFocus, true);
                        $events.one(event_closed, function() {
                            document.removeEventListener('focus', trapFocus, true);
                        });
                    }
                }
                if (settings.get('returnFocus')) {
                    $events.one(event_closed, function() {
                        $(settings.el).focus();
                    });
                }
            }
            var opacity = parseFloat(settings.get('opacity'));
            $overlay.css({
                opacity: opacity === opacity ? opacity : '',
                cursor: settings.get('overlayClose') ? 'pointer' : '',
                visibility: 'visible'
            }).show();
            if (settings.get('closeButton')) {
                $close.html(settings.get('close')).appendTo($content);
            } else {
                $close.appendTo('<div/>');
            }
            load();
        }
    }
    function appendHTML() {
        if (!$box) {
            init = false;
            $window = $(window);
            $box = $tag(div).attr({
                id: colorbox,
                'class': $.support.opacity === false ? prefix + 'IE' : '',
                role: 'dialog',
                tabindex: '-1'
            }).hide();
            $overlay = $tag(div, "Overlay").hide();
            $loadingOverlay = $([$tag(div, "LoadingOverlay")[0], $tag(div, "LoadingGraphic")[0]]);
            $wrap = $tag(div, "Wrapper");
            $content = $tag(div, "Content").append($title = $tag(div, "Title"), $current = $tag(div, "Current"), $prev = $('<button type="button"/>').attr({
                id: prefix + 'Previous'
            }), $next = $('<button type="button"/>').attr({
                id: prefix + 'Next'
            }), $slideshow = $('<button type="button"/>').attr({
                id: prefix + 'Slideshow'
            }), $loadingOverlay);
            $close = $('<button type="button"/>').attr({
                id: prefix + 'Close'
            });
            $wrap.append($tag(div).append($tag(div, "TopLeft"), $topBorder = $tag(div, "TopCenter"), $tag(div, "TopRight")), $tag(div, false, 'clear:left').append($leftBorder = $tag(div, "MiddleLeft"), $content, $rightBorder = $tag(div, "MiddleRight")), $tag(div, false, 'clear:left').append($tag(div, "BottomLeft"), $bottomBorder = $tag(div, "BottomCenter"), $tag(div, "BottomRight"))).find('div div').css({
                'float': 'left'
            });
            $loadingBay = $tag(div, false, 'position:absolute; width:9999px; visibility:hidden; display:none; max-width:none;');
            $groupControls = $next.add($prev).add($current).add($slideshow);
        }
        if (document.body && !$box.parent().length) {
            $(document.body).append($overlay, $box.append($wrap, $loadingBay));
        }
    }
    function addBindings() {
        function clickHandler(e) {
            if (!(e.which > 1 || e.shiftKey || e.altKey || e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                launch(this);
            }
        }
        if ($box) {
            if (!init) {
                init = true;
                $next.click(function() {
                    publicMethod.next();
                });
                $prev.click(function() {
                    publicMethod.prev();
                });
                $close.click(function() {
                    publicMethod.close();
                });
                $overlay.click(function() {
                    if (settings.get('overlayClose')) {
                        publicMethod.close();
                    }
                });
                $(document).bind('keydown.' + prefix, function(e) {
                    var key = e.keyCode;
                    if (open && settings.get('escKey') && key === 27) {
                        e.preventDefault();
                        publicMethod.close();
                    }
                    if (open && settings.get('arrowKey') && $related[1] && !e.altKey) {
                        if (key === 37) {
                            e.preventDefault();
                            $prev.click();
                        } else if (key === 39) {
                            e.preventDefault();
                            $next.click();
                        }
                    }
                });
                if ($.isFunction($.fn.on)) {
                    $(document).on('click.' + prefix, '.' + boxElement, clickHandler);
                } else {
                    $('.' + boxElement).live('click.' + prefix, clickHandler);
                }
            }
            return true;
        }
        return false;
    }
    if ($[colorbox]) {
        return;
    }
    $(appendHTML);
    publicMethod = $.fn[colorbox] = $[colorbox] = function(options, callback) {
        var settings;
        var $obj = this;
        options = options || {};
        if ($.isFunction($obj)) {
            $obj = $('<a/>');
            options.open = true;
        }
        if (!$obj[0]) {
            return $obj;
        }
        appendHTML();
        if (addBindings()) {
            if (callback) {
                options.onComplete = callback;
            }
            $obj.each(function() {
                var old = $.data(this, colorbox) || {};
                $.data(this, colorbox, $.extend(old, options));
            }).addClass(boxElement);
            settings = new Settings($obj[0],options);
            if (settings.get('open')) {
                launch($obj[0]);
            }
        }
        return $obj;
    }
    ;
    publicMethod.position = function(speed, loadedCallback) {
        var css, top = 0, left = 0, offset = $box.offset(), scrollTop, scrollLeft;
        $window.unbind('resize.' + prefix);
        $box.css({
            top: -9e4,
            left: -9e4
        });
        scrollTop = $window.scrollTop();
        scrollLeft = $window.scrollLeft();
        if (settings.get('fixed')) {
            offset.top -= scrollTop;
            offset.left -= scrollLeft;
            $box.css({
                position: 'fixed'
            });
        } else {
            top = scrollTop;
            left = scrollLeft;
            $box.css({
                position: 'absolute'
            });
        }
        if (settings.get('right') !== false) {
            left += Math.max($window.width() - settings.w - loadedWidth - interfaceWidth - setSize(settings.get('right'), 'x'), 0);
        } else if (settings.get('left') !== false) {
            left += setSize(settings.get('left'), 'x');
        } else {
            left += Math.round(Math.max($window.width() - settings.w - loadedWidth - interfaceWidth, 0) / 2);
        }
        if (settings.get('bottom') !== false) {
            top += Math.max(winheight() - settings.h - loadedHeight - interfaceHeight - setSize(settings.get('bottom'), 'y'), 0);
        } else if (settings.get('top') !== false) {
            top += setSize(settings.get('top'), 'y');
        } else {
            top += Math.round(Math.max(winheight() - settings.h - loadedHeight - interfaceHeight, 0) / 2);
        }
        $box.css({
            top: offset.top,
            left: offset.left,
            visibility: 'visible'
        });
        $wrap[0].style.width = $wrap[0].style.height = "9999px";
        function modalDimensions() {
            $topBorder[0].style.width = $bottomBorder[0].style.width = $content[0].style.width = (parseInt($box[0].style.width, 10) - interfaceWidth) + 'px';
            $content[0].style.height = $leftBorder[0].style.height = $rightBorder[0].style.height = (parseInt($box[0].style.height, 10) - interfaceHeight) + 'px';
        }
        css = {
            width: settings.w + loadedWidth + interfaceWidth,
            height: settings.h + loadedHeight + interfaceHeight,
            top: top,
            left: left
        };
        if (speed) {
            var tempSpeed = 0;
            $.each(css, function(i) {
                if (css[i] !== previousCSS[i]) {
                    tempSpeed = speed;
                    return;
                }
            });
            speed = tempSpeed;
        }
        previousCSS = css;
        if (!speed) {
            $box.css(css);
        }
        $box.dequeue().animate(css, {
            duration: speed || 0,
            complete: function() {
                modalDimensions();
                active = false;
                $wrap[0].style.width = (settings.w + loadedWidth + interfaceWidth) + "px";
                $wrap[0].style.height = (settings.h + loadedHeight + interfaceHeight) + "px";
                if (settings.get('reposition')) {
                    setTimeout(function() {
                        $window.bind('resize.' + prefix, publicMethod.position);
                    }, 1);
                }
                if ($.isFunction(loadedCallback)) {
                    loadedCallback();
                }
            },
            step: modalDimensions
        });
    }
    ;
    publicMethod.resize = function(options) {
        var scrolltop;
        if (open) {
            options = options || {};
            if (options.width) {
                settings.w = setSize(options.width, 'x') - loadedWidth - interfaceWidth;
            }
            if (options.innerWidth) {
                settings.w = setSize(options.innerWidth, 'x');
            }
            $loaded.css({
                width: settings.w
            });
            if (options.height) {
                settings.h = setSize(options.height, 'y') - loadedHeight - interfaceHeight;
            }
            if (options.innerHeight) {
                settings.h = setSize(options.innerHeight, 'y');
            }
            if (!options.innerHeight && !options.height) {
                scrolltop = $loaded.scrollTop();
                $loaded.css({
                    height: "auto"
                });
                settings.h = $loaded.height();
            }
            $loaded.css({
                height: settings.h
            });
            if (scrolltop) {
                $loaded.scrollTop(scrolltop);
            }
            publicMethod.position(settings.get('transition') === "none" ? 0 : settings.get('speed'));
        }
    }
    ;
    publicMethod.prep = function(object) {
        if (!open) {
            return;
        }
        var callback, speed = settings.get('transition') === "none" ? 0 : settings.get('speed');
        $loaded.remove();
        $loaded = $tag(div, 'LoadedContent').append(object);
        function getWidth() {
            settings.w = settings.w || $loaded.width();
            settings.w = settings.mw && settings.mw < settings.w ? settings.mw : settings.w;
            return settings.w;
        }
        function getHeight() {
            settings.h = settings.h || $loaded.height();
            settings.h = settings.mh && settings.mh < settings.h ? settings.mh : settings.h;
            return settings.h;
        }
        $loaded.hide().appendTo($loadingBay.show()).css({
            width: getWidth(),
            overflow: settings.get('scrolling') ? 'auto' : 'hidden'
        }).css({
            height: getHeight()
        }).prependTo($content);
        $loadingBay.hide();
        $(photo).css({
            'float': 'none'
        });
        setClass(settings.get('className'));
        callback = function() {
            var total = $related.length, iframe, complete;
            if (!open) {
                return;
            }
            function removeFilter() {
                if ($.support.opacity === false) {
                    $box[0].style.removeAttribute('filter');
                }
            }
            complete = function() {
                clearTimeout(loadingTimer);
                $loadingOverlay.hide();
                trigger(event_complete);
                settings.get('onComplete');
            }
            ;
            $title.html(settings.get('title')).show();
            $loaded.show();
            if (total > 1) {
                if (typeof settings.get('current') === "string") {
                    $current.html(settings.get('current').replace('{current}', index + 1).replace('{total}', total)).show();
                }
                $next[(settings.get('loop') || index < total - 1) ? "show" : "hide"]().html(settings.get('next'));
                $prev[(settings.get('loop') || index) ? "show" : "hide"]().html(settings.get('previous'));
                slideshow();
                if (settings.get('preloading')) {
                    $.each([getIndex(-1), getIndex(1)], function() {
                        var img, i = $related[this], settings = new Settings(i,$.data(i, colorbox)), src = settings.get('href');
                        if (src && isImage(settings, src)) {
                            src = retinaUrl(settings, src);
                            img = document.createElement('img');
                            img.src = src;
                        }
                    });
                }
            } else {
                $groupControls.hide();
            }
            if (settings.get('iframe')) {
                iframe = settings.get('createIframe');
                if (!settings.get('scrolling')) {
                    iframe.scrolling = "no";
                }
                $(iframe).attr({
                    src: settings.get('href'),
                    'class': prefix + 'Iframe'
                }).one('load', complete).appendTo($loaded);
                $events.one(event_purge, function() {
                    iframe.src = "//about:blank";
                });
                if (settings.get('fastIframe')) {
                    $(iframe).trigger('load');
                }
            } else {
                complete();
            }
            if (settings.get('transition') === 'fade') {
                $box.fadeTo(speed, 1, removeFilter);
            } else {
                removeFilter();
            }
        }
        ;
        if (settings.get('transition') === 'fade') {
            $box.fadeTo(speed, 0, function() {
                publicMethod.position(0, callback);
            });
        } else {
            publicMethod.position(speed, callback);
        }
    }
    ;
    function load() {
        var href, setResize, prep = publicMethod.prep, $inline, request = ++requests;
        active = true;
        photo = false;
        trigger(event_purge);
        trigger(event_load);
        settings.get('onLoad');
        settings.h = settings.get('height') ? setSize(settings.get('height'), 'y') - loadedHeight - interfaceHeight : settings.get('innerHeight') && setSize(settings.get('innerHeight'), 'y');
        settings.w = settings.get('width') ? setSize(settings.get('width'), 'x') - loadedWidth - interfaceWidth : settings.get('innerWidth') && setSize(settings.get('innerWidth'), 'x');
        settings.mw = settings.w;
        settings.mh = settings.h;
        if (settings.get('maxWidth')) {
            settings.mw = setSize(settings.get('maxWidth'), 'x') - loadedWidth - interfaceWidth;
            settings.mw = settings.w && settings.w < settings.mw ? settings.w : settings.mw;
        }
        if (settings.get('maxHeight')) {
            settings.mh = setSize(settings.get('maxHeight'), 'y') - loadedHeight - interfaceHeight;
            settings.mh = settings.h && settings.h < settings.mh ? settings.h : settings.mh;
        }
        href = settings.get('href');
        loadingTimer = setTimeout(function() {
            $loadingOverlay.show();
        }, 100);
        if (settings.get('inline')) {
            var $target = $(href).eq(0);
            $inline = $('<div>').hide().insertBefore($target);
            $events.one(event_purge, function() {
                $inline.replaceWith($target);
            });
            prep($target);
        } else if (settings.get('iframe')) {
            prep(" ");
        } else if (settings.get('html')) {
            prep(settings.get('html'));
        } else if (isImage(settings, href)) {
            href = retinaUrl(settings, href);
            photo = settings.get('createImg');
            $(photo).addClass(prefix + 'Photo').bind('error.' + prefix, function() {
                prep($tag(div, 'Error').html(settings.get('imgError')));
            }).one('load', function() {
                if (request !== requests) {
                    return;
                }
                setTimeout(function() {
                    var percent;
                    if (settings.get('retinaImage') && window.devicePixelRatio > 1) {
                        photo.height = photo.height / window.devicePixelRatio;
                        photo.width = photo.width / window.devicePixelRatio;
                    }
                    if (settings.get('scalePhotos')) {
                        setResize = function() {
                            photo.height -= photo.height * percent;
                            photo.width -= photo.width * percent;
                        }
                        ;
                        if (settings.mw && photo.width > settings.mw) {
                            percent = (photo.width - settings.mw) / photo.width;
                            setResize();
                        }
                        if (settings.mh && photo.height > settings.mh) {
                            percent = (photo.height - settings.mh) / photo.height;
                            setResize();
                        }
                    }
                    if (settings.h) {
                        photo.style.marginTop = Math.max(settings.mh - photo.height, 0) / 2 + 'px';
                    }
                    if ($related[1] && (settings.get('loop') || $related[index + 1])) {
                        photo.style.cursor = 'pointer';
                        $(photo).bind('click.' + prefix, function() {
                            publicMethod.next();
                        });
                    }
                    photo.style.width = photo.width + 'px';
                    photo.style.height = photo.height + 'px';
                    prep(photo);
                }, 1);
            });
            photo.src = href;
        } else if (href) {
            $loadingBay.load(href, settings.get('data'), function(data, status) {
                if (request === requests) {
                    prep(status === 'error' ? $tag(div, 'Error').html(settings.get('xhrError')) : $(this).contents());
                }
            });
        }
    }
    publicMethod.next = function() {
        if (!active && $related[1] && (settings.get('loop') || $related[index + 1])) {
            index = getIndex(1);
            launch($related[index]);
        }
    }
    ;
    publicMethod.prev = function() {
        if (!active && $related[1] && (settings.get('loop') || index)) {
            index = getIndex(-1);
            launch($related[index]);
        }
    }
    ;
    publicMethod.close = function() {
        if (open && !closing) {
            closing = true;
            open = false;
            trigger(event_cleanup);
            settings.get('onCleanup');
            $window.unbind('.' + prefix);
            $overlay.fadeTo(settings.get('fadeOut') || 0, 0);
            $box.stop().fadeTo(settings.get('fadeOut') || 0, 0, function() {
                $box.hide();
                $overlay.hide();
                trigger(event_purge);
                $loaded.remove();
                setTimeout(function() {
                    closing = false;
                    trigger(event_closed);
                    settings.get('onClosed');
                }, 1);
            });
        }
    }
    ;
    publicMethod.remove = function() {
        if (!$box) {
            return;
        }
        $box.stop();
        $[colorbox].close();
        $box.stop(false, true).remove();
        $overlay.remove();
        closing = false;
        $box = null;
        $('.' + boxElement).removeData(colorbox).removeClass(boxElement);
        $(document).unbind('click.' + prefix).unbind('keydown.' + prefix);
    }
    ;
    publicMethod.element = function() {
        return $(settings.el);
    }
    ;
    publicMethod.settings = defaults;
}(jQuery, document, window));
;jQuery.extend(jQuery.colorbox.settings, {
    current: "Imagem {current} de {total}",
    previous: "Anterior",
    next: "Próxima",
    close: "Fechar",
    slideshowStart: "iniciar apresentação de slides",
    slideshowStop: "parar apresentação de slides",
    xhrError: "Erro ao carregar o conteúdo.",
    imgError: "Erro ao carregar a imagem."
});
;(function(factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery'], factory);
    } else if (typeof module === 'object' && typeof module.exports === 'object') {
        factory(require('jquery'));
    } else {
        factory(jQuery);
    }
}(function($) {
    $.timeago = function(timestamp) {
        if (timestamp instanceof Date) {
            return inWords(timestamp);
        } else if (typeof timestamp === "string") {
            return inWords($.timeago.parse(timestamp));
        } else if (typeof timestamp === "number") {
            return inWords(new Date(timestamp));
        } else {
            return inWords($.timeago.datetime(timestamp));
        }
    }
    ;
    var $t = $.timeago;
    $.extend($.timeago, {
        settings: {
            refreshMillis: 60000,
            allowPast: true,
            allowFuture: false,
            localeTitle: false,
            cutoff: 0,
            autoDispose: true,
            strings: {
                prefixAgo: null,
                prefixFromNow: null,
                suffixAgo: "ago",
                suffixFromNow: "from now",
                inPast: "any moment now",
                seconds: "less than a minute",
                minute: "about a minute",
                minutes: "%d minutes",
                hour: "about an hour",
                hours: "about %d hours",
                day: "a day",
                days: "%d days",
                month: "about a month",
                months: "%d months",
                year: "about a year",
                years: "%d years",
                wordSeparator: " ",
                numbers: []
            }
        },
        inWords: function(distanceMillis) {
            if (!this.settings.allowPast && !this.settings.allowFuture) {
                throw 'timeago allowPast and allowFuture settings can not both be set to false.';
            }
            var $l = this.settings.strings;
            var prefix = $l.prefixAgo;
            var suffix = $l.suffixAgo;
            if (this.settings.allowFuture) {
                if (distanceMillis < 0) {
                    prefix = $l.prefixFromNow;
                    suffix = $l.suffixFromNow;
                }
            }
            if (!this.settings.allowPast && distanceMillis >= 0) {
                return this.settings.strings.inPast;
            }
            var seconds = Math.abs(distanceMillis) / 1000;
            var minutes = seconds / 60;
            var hours = minutes / 60;
            var days = hours / 24;
            var years = days / 365;
            function substitute(stringOrFunction, number) {
                var string = $.isFunction(stringOrFunction) ? stringOrFunction(number, distanceMillis) : stringOrFunction;
                var value = ($l.numbers && $l.numbers[number]) || number;
                return string.replace(/%d/i, value);
            }
            var words = seconds < 45 && substitute($l.seconds, Math.round(seconds)) || seconds < 90 && substitute($l.minute, 1) || minutes < 45 && substitute($l.minutes, Math.round(minutes)) || minutes < 90 && substitute($l.hour, 1) || hours < 24 && substitute($l.hours, Math.round(hours)) || hours < 42 && substitute($l.day, 1) || days < 30 && substitute($l.days, Math.round(days)) || days < 45 && substitute($l.month, 1) || days < 365 && substitute($l.months, Math.round(days / 30)) || years < 1.5 && substitute($l.year, 1) || substitute($l.years, Math.round(years));
            var separator = $l.wordSeparator || "";
            if ($l.wordSeparator === undefined) {
                separator = " ";
            }
            return $.trim([prefix, words, suffix].join(separator));
        },
        parse: function(iso8601) {
            var s = $.trim(iso8601);
            s = s.replace(/\.\d+/, "");
            s = s.replace(/-/, "/").replace(/-/, "/");
            s = s.replace(/T/, " ").replace(/Z/, " UTC");
            s = s.replace(/([\+\-]\d\d)\:?(\d\d)/, " $1$2");
            s = s.replace(/([\+\-]\d\d)$/, " $100");
            return new Date(s);
        },
        datetime: function(elem) {
            var iso8601 = $t.isTime(elem) ? $(elem).attr("datetime") : $(elem).attr("title");
            return $t.parse(iso8601);
        },
        isTime: function(elem) {
            return $(elem).get(0).tagName.toLowerCase() === "time";
        }
    });
    var functions = {
        init: function() {
            functions.dispose.call(this);
            var refresh_el = $.proxy(refresh, this);
            refresh_el();
            var $s = $t.settings;
            if ($s.refreshMillis > 0) {
                this._timeagoInterval = setInterval(refresh_el, $s.refreshMillis);
            }
        },
        update: function(timestamp) {
            var date = (timestamp instanceof Date) ? timestamp : $t.parse(timestamp);
            $(this).data('timeago', {
                datetime: date
            });
            if ($t.settings.localeTitle) {
                $(this).attr("title", date.toLocaleString());
            }
            refresh.apply(this);
        },
        updateFromDOM: function() {
            $(this).data('timeago', {
                datetime: $t.parse($t.isTime(this) ? $(this).attr("datetime") : $(this).attr("title"))
            });
            refresh.apply(this);
        },
        dispose: function() {
            if (this._timeagoInterval) {
                window.clearInterval(this._timeagoInterval);
                this._timeagoInterval = null;
            }
        }
    };
    $.fn.timeago = function(action, options) {
        var fn = action ? functions[action] : functions.init;
        if (!fn) {
            throw new Error("Unknown function name '" + action + "' for timeago");
        }
        this.each(function() {
            fn.call(this, options);
        });
        return this;
    }
    ;
    function refresh() {
        var $s = $t.settings;
        if ($s.autoDispose && !$.contains(document.documentElement, this)) {
            $(this).timeago("dispose");
            return this;
        }
        var data = prepareData(this);
        if (!isNaN(data.datetime)) {
            if ($s.cutoff === 0 || Math.abs(distance(data.datetime)) < $s.cutoff) {
                $(this).text(inWords(data.datetime));
            } else {
                if ($(this).attr('title').length > 0) {
                    $(this).text($(this).attr('title'));
                }
            }
        }
        return this;
    }
    function prepareData(element) {
        element = $(element);
        if (!element.data("timeago")) {
            element.data("timeago", {
                datetime: $t.datetime(element)
            });
            var text = $.trim(element.text());
            if ($t.settings.localeTitle) {
                element.attr("title", element.data('timeago').datetime.toLocaleString());
            } else if (text.length > 0 && !($t.isTime(element) && element.attr("title"))) {
                element.attr("title", text);
            }
        }
        return element.data("timeago");
    }
    function inWords(date) {
        return $t.inWords(distance(date));
    }
    function distance(date) {
        return (new Date().getTime() - date.getTime());
    }
    document.createElement("abbr");
    document.createElement("time");
}));
;(function(factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery'], factory);
    } else if (typeof module === 'object' && typeof module.exports === 'object') {
        factory(require('jquery'));
    } else {
        factory(jQuery);
    }
}(function(jQuery) {
    jQuery.timeago.settings.strings = {
        prefixAgo: "há",
        prefixFromNow: "em",
        suffixAgo: null,
        suffixFromNow: null,
        seconds: "alguns segundos",
        minute: "um minuto",
        minutes: "%d minutos",
        hour: "uma hora",
        hours: "%d horas",
        day: "um dia",
        days: "%d dias",
        month: "um mês",
        months: "%d meses",
        year: "um ano",
        years: "%d anos"
    };
}));
;(function($) {
    $.fn.animatescroll = function(options) {
        var opts = $.extend({}, $.fn.animatescroll.defaults, options);
        if (typeof opts.onScrollStart == 'function') {
            opts.onScrollStart.call(this);
        }
        if (opts.element == "html,body") {
            var offset = this.offset().top - opts.padding;
        } else {
            var offset = this.offset().top - this.offsetParent().offset().top + this.offsetParent().scrollTop() - opts.padding;
        }
        $(opts.element).stop().animate({
            scrollTop: offset
        }, opts.scrollSpeed, opts.easing);
        setTimeout(function() {
            if (typeof opts.onScrollEnd == 'function') {
                opts.onScrollEnd.call(this);
            }
        }, opts.scrollSpeed);
    }
    ;
    $.fn.animatescroll.defaults = {
        easing: "swing",
        scrollSpeed: 800,
        padding: 0,
        element: "html,body"
    };
}(jQuery));
;/*
 * @preserve
 *
 * Readmore.js jQuery plugin
 * Author: @jed_foster
 * Project home: http://jedfoster.github.io/Readmore.js
 * Licensed under the MIT license
 *
 * Debounce function from http://davidwalsh.name/javascript-debounce-function
 */
!function(t) {
    "function" == typeof define && define.amd ? define(["jquery"], t) : "object" == typeof exports ? module.exports = t(require("jquery")) : t(jQuery)
}(function(t) {
    "use strict";
    function e(t, e, i) {
        var o;
        return function() {
            var n = this
              , a = arguments
              , s = function() {
                o = null,
                i || t.apply(n, a)
            }
              , r = i && !o;
            clearTimeout(o),
            o = setTimeout(s, e),
            r && t.apply(n, a)
        }
    }
    function i(t) {
        var e = ++h;
        return String(null == t ? "rmjs-" : t) + e
    }
    function o(t) {
        var e = t.clone().css({
            height: "auto",
            width: t.width(),
            maxHeight: "none",
            overflow: "hidden"
        }).insertAfter(t)
          , i = e.outerHeight()
          , o = parseInt(e.css({
            maxHeight: ""
        }).css("max-height").replace(/[^-\d\.]/g, ""), 10)
          , n = t.data("defaultHeight");
        e.remove();
        var a = o || t.data("collapsedHeight") || n;
        t.data({
            expandedHeight: i,
            maxHeight: o,
            collapsedHeight: a
        }).css({
            maxHeight: "none"
        })
    }
    function n(t) {
        if (!d[t.selector]) {
            var e = " ";
            t.embedCSS && "" !== t.blockCSS && (e += t.selector + " + [data-readmore-toggle], " + t.selector + "[data-readmore]{" + t.blockCSS + "}"),
            e += t.selector + "[data-readmore]{transition: height " + t.speed + "ms;overflow: hidden;}",
            function(t, e) {
                var i = t.createElement("style");
                i.type = "text/css",
                i.styleSheet ? i.styleSheet.cssText = e : i.appendChild(t.createTextNode(e)),
                t.getElementsByTagName("head")[0].appendChild(i)
            }(document, e),
            d[t.selector] = !0
        }
    }
    function a(e, i) {
        this.element = e,
        this.options = t.extend({}, r, i),
        n(this.options),
        this._defaults = r,
        this._name = s,
        this.init(),
        window.addEventListener ? (window.addEventListener("load", c),
        window.addEventListener("resize", c)) : (window.attachEvent("load", c),
        window.attachEvent("resize", c))
    }
    var s = "readmore"
      , r = {
        speed: 100,
        collapsedHeight: 200,
        heightMargin: 16,
        moreLink: '<a href="#">Read More</a>',
        lessLink: '<a href="#">Close</a>',
        embedCSS: !0,
        blockCSS: "display: block; width: 100%;",
        startOpen: !1,
        blockProcessed: function() {},
        beforeToggle: function() {},
        afterToggle: function() {}
    }
      , d = {}
      , h = 0
      , c = e(function() {
        t("[data-readmore]").each(function() {
            var e = t(this)
              , i = "true" === e.attr("aria-expanded");
            o(e),
            e.css({
                height: e.data(i ? "expandedHeight" : "collapsedHeight")
            })
        })
    }, 100);
    a.prototype = {
        init: function() {
            var e = t(this.element);
            e.data({
                defaultHeight: this.options.collapsedHeight,
                heightMargin: this.options.heightMargin
            }),
            o(e);
            var n = e.data("collapsedHeight")
              , a = e.data("heightMargin");
            if (e.outerHeight(!0) <= n + a)
                return this.options.blockProcessed && "function" == typeof this.options.blockProcessed && this.options.blockProcessed(e, !1),
                !0;
            var s = e.attr("id") || i()
              , r = this.options.startOpen ? this.options.lessLink : this.options.moreLink;
            e.attr({
                "data-readmore": "",
                "aria-expanded": this.options.startOpen,
                "aria-role": "presentation",
                id: s
            }),
            e.after(t(r).on("click", function(t) {
                return function(i) {
                    t.toggle(this, e[0], i)
                }
            }(this)).attr({
                "data-readmore-toggle": s,
                "aria-controls": s
            })),
            this.options.startOpen || e.css({
                height: n
            }),
            this.options.blockProcessed && "function" == typeof this.options.blockProcessed && this.options.blockProcessed(e, !0)
        },
        toggle: function(e, i, o) {
            o && o.preventDefault(),
            e || (e = t('[aria-controls="' + this.element.id + '"]')[0]),
            i || (i = this.element);
            var n = t(i)
              , a = ""
              , s = ""
              , r = !1
              , d = n.data("collapsedHeight");
            n.height() <= d ? (a = n.data("expandedHeight") + "px",
            s = "lessLink",
            r = !0) : (a = d,
            s = "moreLink"),
            this.options.beforeToggle && "function" == typeof this.options.beforeToggle && this.options.beforeToggle(e, n, !r),
            n.css({
                height: a
            }),
            n.on("transitionend", function(i) {
                return function() {
                    i.options.afterToggle && "function" == typeof i.options.afterToggle && i.options.afterToggle(e, n, r),
                    t(this).attr({
                        "aria-expanded": r
                    }).off("transitionend")
                }
            }(this)),
            t(e).replaceWith(t(this.options[s]).on("click", function(t) {
                return function(e) {
                    t.toggle(this, i, e)
                }
            }(this)).attr({
                "data-readmore-toggle": n.attr("id"),
                "aria-controls": n.attr("id")
            }))
        },
        destroy: function() {
            t(this.element).each(function() {
                var e = t(this);
                e.attr({
                    "data-readmore": null,
                    "aria-expanded": null,
                    "aria-role": null
                }).css({
                    maxHeight: "",
                    height: ""
                }).next("[data-readmore-toggle]").remove(),
                e.removeData()
            })
        }
    },
    t.fn.readmore = function(e) {
        var i = arguments
          , o = this.selector;
        return e = e || {},
        "object" == typeof e ? this.each(function() {
            if (t.data(this, "plugin_" + s)) {
                var i = t.data(this, "plugin_" + s);
                i.destroy.apply(i)
            }
            e.selector = o,
            t.data(this, "plugin_" + s, new a(this,e))
        }) : "string" == typeof e && "_" !== e[0] && "init" !== e ? this.each(function() {
            var o = t.data(this, "plugin_" + s);
            o instanceof a && "function" == typeof o[e] && o[e].apply(o, Array.prototype.slice.call(i, 1))
        }) : void 0
    }
});
;/*
 * clipboard.js v1.5.10
 * https://zenorocha.github.io/clipboard.js
 *
 * Licensed MIT © Zeno Rocha
 */
!function(t) {
    if ("object" == typeof exports && "undefined" != typeof module)
        module.exports = t();
    else if ("function" == typeof define && define.amd)
        define([], t);
    else {
        var e;
        e = "undefined" != typeof window ? window : "undefined" != typeof global ? global : "undefined" != typeof self ? self : this,
        e.Clipboard = t()
    }
}(function() {
    var t, e, n;
    return function t(e, n, o) {
        function i(c, a) {
            if (!n[c]) {
                if (!e[c]) {
                    var s = "function" == typeof require && require;
                    if (!a && s)
                        return s(c, !0);
                    if (r)
                        return r(c, !0);
                    var l = new Error("Cannot find module '" + c + "'");
                    throw l.code = "MODULE_NOT_FOUND",
                    l
                }
                var u = n[c] = {
                    exports: {}
                };
                e[c][0].call(u.exports, function(t) {
                    var n = e[c][1][t];
                    return i(n ? n : t)
                }, u, u.exports, t, e, n, o)
            }
            return n[c].exports
        }
        for (var r = "function" == typeof require && require, c = 0; c < o.length; c++)
            i(o[c]);
        return i
    }({
        1: [function(t, e, n) {
            var o = t("matches-selector");
            e.exports = function(t, e, n) {
                for (var i = n ? t : t.parentNode; i && i !== document; ) {
                    if (o(i, e))
                        return i;
                    i = i.parentNode
                }
            }
        }
        , {
            "matches-selector": 5
        }],
        2: [function(t, e, n) {
            function o(t, e, n, o, r) {
                var c = i.apply(this, arguments);
                return t.addEventListener(n, c, r),
                {
                    destroy: function() {
                        t.removeEventListener(n, c, r)
                    }
                }
            }
            function i(t, e, n, o) {
                return function(n) {
                    n.delegateTarget = r(n.target, e, !0),
                    n.delegateTarget && o.call(t, n)
                }
            }
            var r = t("closest");
            e.exports = o
        }
        , {
            closest: 1
        }],
        3: [function(t, e, n) {
            n.node = function(t) {
                return void 0 !== t && t instanceof HTMLElement && 1 === t.nodeType
            }
            ,
            n.nodeList = function(t) {
                var e = Object.prototype.toString.call(t);
                return void 0 !== t && ("[object NodeList]" === e || "[object HTMLCollection]" === e) && "length"in t && (0 === t.length || n.node(t[0]))
            }
            ,
            n.string = function(t) {
                return "string" == typeof t || t instanceof String
            }
            ,
            n.fn = function(t) {
                var e = Object.prototype.toString.call(t);
                return "[object Function]" === e
            }
        }
        , {}],
        4: [function(t, e, n) {
            function o(t, e, n) {
                if (!t && !e && !n)
                    throw new Error("Missing required arguments");
                if (!a.string(e))
                    throw new TypeError("Second argument must be a String");
                if (!a.fn(n))
                    throw new TypeError("Third argument must be a Function");
                if (a.node(t))
                    return i(t, e, n);
                if (a.nodeList(t))
                    return r(t, e, n);
                if (a.string(t))
                    return c(t, e, n);
                throw new TypeError("First argument must be a String, HTMLElement, HTMLCollection, or NodeList")
            }
            function i(t, e, n) {
                return t.addEventListener(e, n),
                {
                    destroy: function() {
                        t.removeEventListener(e, n)
                    }
                }
            }
            function r(t, e, n) {
                return Array.prototype.forEach.call(t, function(t) {
                    t.addEventListener(e, n)
                }),
                {
                    destroy: function() {
                        Array.prototype.forEach.call(t, function(t) {
                            t.removeEventListener(e, n)
                        })
                    }
                }
            }
            function c(t, e, n) {
                return s(document.body, t, e, n)
            }
            var a = t("./is")
              , s = t("delegate");
            e.exports = o
        }
        , {
            "./is": 3,
            delegate: 2
        }],
        5: [function(t, e, n) {
            function o(t, e) {
                if (r)
                    return r.call(t, e);
                for (var n = t.parentNode.querySelectorAll(e), o = 0; o < n.length; ++o)
                    if (n[o] == t)
                        return !0;
                return !1
            }
            var i = Element.prototype
              , r = i.matchesSelector || i.webkitMatchesSelector || i.mozMatchesSelector || i.msMatchesSelector || i.oMatchesSelector;
            e.exports = o
        }
        , {}],
        6: [function(t, e, n) {
            function o(t) {
                var e;
                if ("INPUT" === t.nodeName || "TEXTAREA" === t.nodeName)
                    t.focus(),
                    t.setSelectionRange(0, t.value.length),
                    e = t.value;
                else {
                    t.hasAttribute("contenteditable") && t.focus();
                    var n = window.getSelection()
                      , o = document.createRange();
                    o.selectNodeContents(t),
                    n.removeAllRanges(),
                    n.addRange(o),
                    e = n.toString()
                }
                return e
            }
            e.exports = o
        }
        , {}],
        7: [function(t, e, n) {
            function o() {}
            o.prototype = {
                on: function(t, e, n) {
                    var o = this.e || (this.e = {});
                    return (o[t] || (o[t] = [])).push({
                        fn: e,
                        ctx: n
                    }),
                    this
                },
                once: function(t, e, n) {
                    function o() {
                        i.off(t, o),
                        e.apply(n, arguments)
                    }
                    var i = this;
                    return o._ = e,
                    this.on(t, o, n)
                },
                emit: function(t) {
                    var e = [].slice.call(arguments, 1)
                      , n = ((this.e || (this.e = {}))[t] || []).slice()
                      , o = 0
                      , i = n.length;
                    for (o; i > o; o++)
                        n[o].fn.apply(n[o].ctx, e);
                    return this
                },
                off: function(t, e) {
                    var n = this.e || (this.e = {})
                      , o = n[t]
                      , i = [];
                    if (o && e)
                        for (var r = 0, c = o.length; c > r; r++)
                            o[r].fn !== e && o[r].fn._ !== e && i.push(o[r]);
                    return i.length ? n[t] = i : delete n[t],
                    this
                }
            },
            e.exports = o
        }
        , {}],
        8: [function(e, n, o) {
            !function(i, r) {
                if ("function" == typeof t && t.amd)
                    t(["module", "select"], r);
                else if ("undefined" != typeof o)
                    r(n, e("select"));
                else {
                    var c = {
                        exports: {}
                    };
                    r(c, i.select),
                    i.clipboardAction = c.exports
                }
            }(this, function(t, e) {
                "use strict";
                function n(t) {
                    return t && t.__esModule ? t : {
                        "default": t
                    }
                }
                function o(t, e) {
                    if (!(t instanceof e))
                        throw new TypeError("Cannot call a class as a function")
                }
                var i = n(e)
                  , r = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(t) {
                    return typeof t
                }
                : function(t) {
                    return t && "function" == typeof Symbol && t.constructor === Symbol ? "symbol" : typeof t
                }
                  , c = function() {
                    function t(t, e) {
                        for (var n = 0; n < e.length; n++) {
                            var o = e[n];
                            o.enumerable = o.enumerable || !1,
                            o.configurable = !0,
                            "value"in o && (o.writable = !0),
                            Object.defineProperty(t, o.key, o)
                        }
                    }
                    return function(e, n, o) {
                        return n && t(e.prototype, n),
                        o && t(e, o),
                        e
                    }
                }()
                  , a = function() {
                    function t(e) {
                        o(this, t),
                        this.resolveOptions(e),
                        this.initSelection()
                    }
                    return t.prototype.resolveOptions = function t() {
                        var e = arguments.length <= 0 || void 0 === arguments[0] ? {} : arguments[0];
                        this.action = e.action,
                        this.emitter = e.emitter,
                        this.target = e.target,
                        this.text = e.text,
                        this.trigger = e.trigger,
                        this.selectedText = ""
                    }
                    ,
                    t.prototype.initSelection = function t() {
                        this.text ? this.selectFake() : this.target && this.selectTarget()
                    }
                    ,
                    t.prototype.selectFake = function t() {
                        var e = this
                          , n = "rtl" == document.documentElement.getAttribute("dir");
                        this.removeFake(),
                        this.fakeHandler = document.body.addEventListener("click", function() {
                            return e.removeFake()
                        }),
                        this.fakeElem = document.createElement("textarea"),
                        this.fakeElem.style.fontSize = "12pt",
                        this.fakeElem.style.border = "0",
                        this.fakeElem.style.padding = "0",
                        this.fakeElem.style.margin = "0",
                        this.fakeElem.style.position = "fixed",
                        this.fakeElem.style[n ? "right" : "left"] = "-9999px",
                        this.fakeElem.style.top = (window.pageYOffset || document.documentElement.scrollTop) + "px",
                        this.fakeElem.setAttribute("readonly", ""),
                        this.fakeElem.value = this.text,
                        document.body.appendChild(this.fakeElem),
                        this.selectedText = (0,
                        i.default)(this.fakeElem),
                        this.copyText()
                    }
                    ,
                    t.prototype.removeFake = function t() {
                        this.fakeHandler && (document.body.removeEventListener("click"),
                        this.fakeHandler = null),
                        this.fakeElem && (document.body.removeChild(this.fakeElem),
                        this.fakeElem = null)
                    }
                    ,
                    t.prototype.selectTarget = function t() {
                        this.selectedText = (0,
                        i.default)(this.target),
                        this.copyText()
                    }
                    ,
                    t.prototype.copyText = function t() {
                        var e = void 0;
                        try {
                            e = document.execCommand(this.action)
                        } catch (n) {
                            e = !1
                        }
                        this.handleResult(e)
                    }
                    ,
                    t.prototype.handleResult = function t(e) {
                        e ? this.emitter.emit("success", {
                            action: this.action,
                            text: this.selectedText,
                            trigger: this.trigger,
                            clearSelection: this.clearSelection.bind(this)
                        }) : this.emitter.emit("error", {
                            action: this.action,
                            trigger: this.trigger,
                            clearSelection: this.clearSelection.bind(this)
                        })
                    }
                    ,
                    t.prototype.clearSelection = function t() {
                        this.target && this.target.blur(),
                        window.getSelection().removeAllRanges()
                    }
                    ,
                    t.prototype.destroy = function t() {
                        this.removeFake()
                    }
                    ,
                    c(t, [{
                        key: "action",
                        set: function t() {
                            var e = arguments.length <= 0 || void 0 === arguments[0] ? "copy" : arguments[0];
                            if (this._action = e,
                            "copy" !== this._action && "cut" !== this._action)
                                throw new Error('Invalid "action" value, use either "copy" or "cut"')
                        },
                        get: function t() {
                            return this._action
                        }
                    }, {
                        key: "target",
                        set: function t(e) {
                            if (void 0 !== e) {
                                if (!e || "object" !== ("undefined" == typeof e ? "undefined" : r(e)) || 1 !== e.nodeType)
                                    throw new Error('Invalid "target" value, use a valid Element');
                                if ("copy" === this.action && e.hasAttribute("disabled"))
                                    throw new Error('Invalid "target" attribute. Please use "readonly" instead of "disabled" attribute');
                                if ("cut" === this.action && (e.hasAttribute("readonly") || e.hasAttribute("disabled")))
                                    throw new Error('Invalid "target" attribute. You can\'t cut text from elements with "readonly" or "disabled" attributes');
                                this._target = e
                            }
                        },
                        get: function t() {
                            return this._target
                        }
                    }]),
                    t
                }();
                t.exports = a
            })
        }
        , {
            select: 6
        }],
        9: [function(e, n, o) {
            !function(i, r) {
                if ("function" == typeof t && t.amd)
                    t(["module", "./clipboard-action", "tiny-emitter", "good-listener"], r);
                else if ("undefined" != typeof o)
                    r(n, e("./clipboard-action"), e("tiny-emitter"), e("good-listener"));
                else {
                    var c = {
                        exports: {}
                    };
                    r(c, i.clipboardAction, i.tinyEmitter, i.goodListener),
                    i.clipboard = c.exports
                }
            }(this, function(t, e, n, o) {
                "use strict";
                function i(t) {
                    return t && t.__esModule ? t : {
                        "default": t
                    }
                }
                function r(t, e) {
                    if (!(t instanceof e))
                        throw new TypeError("Cannot call a class as a function")
                }
                function c(t, e) {
                    if (!t)
                        throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
                    return !e || "object" != typeof e && "function" != typeof e ? t : e
                }
                function a(t, e) {
                    if ("function" != typeof e && null !== e)
                        throw new TypeError("Super expression must either be null or a function, not " + typeof e);
                    t.prototype = Object.create(e && e.prototype, {
                        constructor: {
                            value: t,
                            enumerable: !1,
                            writable: !0,
                            configurable: !0
                        }
                    }),
                    e && (Object.setPrototypeOf ? Object.setPrototypeOf(t, e) : t.__proto__ = e)
                }
                function s(t, e) {
                    var n = "data-clipboard-" + t;
                    if (e.hasAttribute(n))
                        return e.getAttribute(n)
                }
                var l = i(e)
                  , u = i(n)
                  , f = i(o)
                  , d = function(t) {
                    function e(n, o) {
                        r(this, e);
                        var i = c(this, t.call(this));
                        return i.resolveOptions(o),
                        i.listenClick(n),
                        i
                    }
                    return a(e, t),
                    e.prototype.resolveOptions = function t() {
                        var e = arguments.length <= 0 || void 0 === arguments[0] ? {} : arguments[0];
                        this.action = "function" == typeof e.action ? e.action : this.defaultAction,
                        this.target = "function" == typeof e.target ? e.target : this.defaultTarget,
                        this.text = "function" == typeof e.text ? e.text : this.defaultText
                    }
                    ,
                    e.prototype.listenClick = function t(e) {
                        var n = this;
                        this.listener = (0,
                        f.default)(e, "click", function(t) {
                            return n.onClick(t)
                        })
                    }
                    ,
                    e.prototype.onClick = function t(e) {
                        var n = e.delegateTarget || e.currentTarget;
                        this.clipboardAction && (this.clipboardAction = null),
                        this.clipboardAction = new l.default({
                            action: this.action(n),
                            target: this.target(n),
                            text: this.text(n),
                            trigger: n,
                            emitter: this
                        })
                    }
                    ,
                    e.prototype.defaultAction = function t(e) {
                        return s("action", e)
                    }
                    ,
                    e.prototype.defaultTarget = function t(e) {
                        var n = s("target", e);
                        return n ? document.querySelector(n) : void 0
                    }
                    ,
                    e.prototype.defaultText = function t(e) {
                        return s("text", e)
                    }
                    ,
                    e.prototype.destroy = function t() {
                        this.listener.destroy(),
                        this.clipboardAction && (this.clipboardAction.destroy(),
                        this.clipboardAction = null)
                    }
                    ,
                    e
                }(u.default);
                t.exports = d
            })
        }
        , {
            "./clipboard-action": 8,
            "good-listener": 4,
            "tiny-emitter": 7
        }]
    }, {}, [9])(9)
});
;!function(i) {
    "use strict";
    "function" == typeof define && define.amd ? define(["jquery"], i) : "undefined" != typeof exports ? module.exports = i(require("jquery")) : i(jQuery)
}(function(i) {
    "use strict";
    var e = window.Slick || {};
    (e = function() {
        var e = 0;
        return function(t, o) {
            var s, n = this;
            n.defaults = {
                accessibility: !0,
                adaptiveHeight: !1,
                appendArrows: i(t),
                appendDots: i(t),
                arrows: !0,
                asNavFor: null,
                prevArrow: '<button class="slick-prev" aria-label="Previous" type="button">Previous</button>',
                nextArrow: '<button class="slick-next" aria-label="Next" type="button">Next</button>',
                autoplay: !1,
                autoplaySpeed: 3e3,
                centerMode: !1,
                centerPadding: "50px",
                cssEase: "ease",
                customPaging: function(e, t) {
                    return i('<button type="button" />').text(t + 1)
                },
                dots: !1,
                dotsClass: "slick-dots",
                draggable: !0,
                easing: "linear",
                edgeFriction: .35,
                fade: !1,
                focusOnSelect: !1,
                focusOnChange: !1,
                infinite: !0,
                initialSlide: 0,
                lazyLoad: "ondemand",
                mobileFirst: !1,
                pauseOnHover: !0,
                pauseOnFocus: !0,
                pauseOnDotsHover: !1,
                respondTo: "window",
                responsive: null,
                rows: 1,
                rtl: !1,
                slide: "",
                slidesPerRow: 1,
                slidesToShow: 1,
                slidesToScroll: 1,
                speed: 500,
                swipe: !0,
                swipeToSlide: !1,
                touchMove: !0,
                touchThreshold: 5,
                useCSS: !0,
                useTransform: !0,
                variableWidth: !1,
                vertical: !1,
                verticalSwiping: !1,
                waitForAnimate: !0,
                zIndex: 1e3
            },
            n.initials = {
                animating: !1,
                dragging: !1,
                autoPlayTimer: null,
                currentDirection: 0,
                currentLeft: null,
                currentSlide: 0,
                direction: 1,
                $dots: null,
                listWidth: null,
                listHeight: null,
                loadIndex: 0,
                $nextArrow: null,
                $prevArrow: null,
                scrolling: !1,
                slideCount: null,
                slideWidth: null,
                $slideTrack: null,
                $slides: null,
                sliding: !1,
                slideOffset: 0,
                swipeLeft: null,
                swiping: !1,
                $list: null,
                touchObject: {},
                transformsEnabled: !1,
                unslicked: !1
            },
            i.extend(n, n.initials),
            n.activeBreakpoint = null,
            n.animType = null,
            n.animProp = null,
            n.breakpoints = [],
            n.breakpointSettings = [],
            n.cssTransitions = !1,
            n.focussed = !1,
            n.interrupted = !1,
            n.hidden = "hidden",
            n.paused = !0,
            n.positionProp = null,
            n.respondTo = null,
            n.rowCount = 1,
            n.shouldClick = !0,
            n.$slider = i(t),
            n.$slidesCache = null,
            n.transformType = null,
            n.transitionType = null,
            n.visibilityChange = "visibilitychange",
            n.windowWidth = 0,
            n.windowTimer = null,
            s = i(t).data("slick") || {},
            n.options = i.extend({}, n.defaults, o, s),
            n.currentSlide = n.options.initialSlide,
            n.originalSettings = n.options,
            void 0 !== document.mozHidden ? (n.hidden = "mozHidden",
            n.visibilityChange = "mozvisibilitychange") : void 0 !== document.webkitHidden && (n.hidden = "webkitHidden",
            n.visibilityChange = "webkitvisibilitychange"),
            n.autoPlay = i.proxy(n.autoPlay, n),
            n.autoPlayClear = i.proxy(n.autoPlayClear, n),
            n.autoPlayIterator = i.proxy(n.autoPlayIterator, n),
            n.changeSlide = i.proxy(n.changeSlide, n),
            n.clickHandler = i.proxy(n.clickHandler, n),
            n.selectHandler = i.proxy(n.selectHandler, n),
            n.setPosition = i.proxy(n.setPosition, n),
            n.swipeHandler = i.proxy(n.swipeHandler, n),
            n.dragHandler = i.proxy(n.dragHandler, n),
            n.keyHandler = i.proxy(n.keyHandler, n),
            n.instanceUid = e++,
            n.htmlExpr = /^(?:\s*(<[\w\W]+>)[^>]*)$/,
            n.registerBreakpoints(),
            n.init(!0)
        }
    }()).prototype.activateADA = function() {
        this.$slideTrack.find(".slick-active").attr({
            "aria-hidden": "false"
        }).find("a, input, button, select").attr({
            tabindex: "0"
        })
    }
    ,
    e.prototype.addSlide = e.prototype.slickAdd = function(e, t, o) {
        var s = this;
        if ("boolean" == typeof t)
            o = t,
            t = null;
        else if (t < 0 || t >= s.slideCount)
            return !1;
        s.unload(),
        "number" == typeof t ? 0 === t && 0 === s.$slides.length ? i(e).appendTo(s.$slideTrack) : o ? i(e).insertBefore(s.$slides.eq(t)) : i(e).insertAfter(s.$slides.eq(t)) : !0 === o ? i(e).prependTo(s.$slideTrack) : i(e).appendTo(s.$slideTrack),
        s.$slides = s.$slideTrack.children(this.options.slide),
        s.$slideTrack.children(this.options.slide).detach(),
        s.$slideTrack.append(s.$slides),
        s.$slides.each(function(e, t) {
            i(t).attr("data-slick-index", e)
        }),
        s.$slidesCache = s.$slides,
        s.reinit()
    }
    ,
    e.prototype.animateHeight = function() {
        var i = this;
        if (1 === i.options.slidesToShow && !0 === i.options.adaptiveHeight && !1 === i.options.vertical) {
            var e = i.$slides.eq(i.currentSlide).outerHeight(!0);
            i.$list.animate({
                height: e
            }, i.options.speed)
        }
    }
    ,
    e.prototype.animateSlide = function(e, t) {
        var o = {}
          , s = this;
        s.animateHeight(),
        !0 === s.options.rtl && !1 === s.options.vertical && (e = -e),
        !1 === s.transformsEnabled ? !1 === s.options.vertical ? s.$slideTrack.animate({
            left: e
        }, s.options.speed, s.options.easing, t) : s.$slideTrack.animate({
            top: e
        }, s.options.speed, s.options.easing, t) : !1 === s.cssTransitions ? (!0 === s.options.rtl && (s.currentLeft = -s.currentLeft),
        i({
            animStart: s.currentLeft
        }).animate({
            animStart: e
        }, {
            duration: s.options.speed,
            easing: s.options.easing,
            step: function(i) {
                i = Math.ceil(i),
                !1 === s.options.vertical ? (o[s.animType] = "translate(" + i + "px, 0px)",
                s.$slideTrack.css(o)) : (o[s.animType] = "translate(0px," + i + "px)",
                s.$slideTrack.css(o))
            },
            complete: function() {
                t && t.call()
            }
        })) : (s.applyTransition(),
        e = Math.ceil(e),
        !1 === s.options.vertical ? o[s.animType] = "translate3d(" + e + "px, 0px, 0px)" : o[s.animType] = "translate3d(0px," + e + "px, 0px)",
        s.$slideTrack.css(o),
        t && setTimeout(function() {
            s.disableTransition(),
            t.call()
        }, s.options.speed))
    }
    ,
    e.prototype.getNavTarget = function() {
        var e = this
          , t = e.options.asNavFor;
        return t && null !== t && (t = i(t).not(e.$slider)),
        t
    }
    ,
    e.prototype.asNavFor = function(e) {
        var t = this.getNavTarget();
        null !== t && "object" == typeof t && t.each(function() {
            var t = i(this).slick("getSlick");
            t.unslicked || t.slideHandler(e, !0)
        })
    }
    ,
    e.prototype.applyTransition = function(i) {
        var e = this
          , t = {};
        !1 === e.options.fade ? t[e.transitionType] = e.transformType + " " + e.options.speed + "ms " + e.options.cssEase : t[e.transitionType] = "opacity " + e.options.speed + "ms " + e.options.cssEase,
        !1 === e.options.fade ? e.$slideTrack.css(t) : e.$slides.eq(i).css(t)
    }
    ,
    e.prototype.autoPlay = function() {
        var i = this;
        i.autoPlayClear(),
        i.slideCount > i.options.slidesToShow && (i.autoPlayTimer = setInterval(i.autoPlayIterator, i.options.autoplaySpeed))
    }
    ,
    e.prototype.autoPlayClear = function() {
        var i = this;
        i.autoPlayTimer && clearInterval(i.autoPlayTimer)
    }
    ,
    e.prototype.autoPlayIterator = function() {
        var i = this
          , e = i.currentSlide + i.options.slidesToScroll;
        i.paused || i.interrupted || i.focussed || (!1 === i.options.infinite && (1 === i.direction && i.currentSlide + 1 === i.slideCount - 1 ? i.direction = 0 : 0 === i.direction && (e = i.currentSlide - i.options.slidesToScroll,
        i.currentSlide - 1 == 0 && (i.direction = 1))),
        i.slideHandler(e))
    }
    ,
    e.prototype.buildArrows = function() {
        var e = this;
        !0 === e.options.arrows && (e.$prevArrow = i(e.options.prevArrow).addClass("slick-arrow"),
        e.$nextArrow = i(e.options.nextArrow).addClass("slick-arrow"),
        e.slideCount > e.options.slidesToShow ? (e.$prevArrow.removeClass("slick-hidden").removeAttr("aria-hidden tabindex"),
        e.$nextArrow.removeClass("slick-hidden").removeAttr("aria-hidden tabindex"),
        e.htmlExpr.test(e.options.prevArrow) && e.$prevArrow.prependTo(e.options.appendArrows),
        e.htmlExpr.test(e.options.nextArrow) && e.$nextArrow.appendTo(e.options.appendArrows),
        !0 !== e.options.infinite && e.$prevArrow.addClass("slick-disabled").attr("aria-disabled", "true")) : e.$prevArrow.add(e.$nextArrow).addClass("slick-hidden").attr({
            "aria-disabled": "true",
            tabindex: "-1"
        }))
    }
    ,
    e.prototype.buildDots = function() {
        var e, t, o = this;
        if (!0 === o.options.dots) {
            for (o.$slider.addClass("slick-dotted"),
            t = i("<ul />").addClass(o.options.dotsClass),
            e = 0; e <= o.getDotCount(); e += 1)
                t.append(i("<li />").append(o.options.customPaging.call(this, o, e)));
            o.$dots = t.appendTo(o.options.appendDots),
            o.$dots.find("li").first().addClass("slick-active")
        }
    }
    ,
    e.prototype.buildOut = function() {
        var e = this;
        e.$slides = e.$slider.children(e.options.slide + ":not(.slick-cloned)").addClass("slick-slide"),
        e.slideCount = e.$slides.length,
        e.$slides.each(function(e, t) {
            i(t).attr("data-slick-index", e).data("originalStyling", i(t).attr("style") || "")
        }),
        e.$slider.addClass("slick-slider"),
        e.$slideTrack = 0 === e.slideCount ? i('<div class="slick-track"/>').appendTo(e.$slider) : e.$slides.wrapAll('<div class="slick-track"/>').parent(),
        e.$list = e.$slideTrack.wrap('<div class="slick-list"/>').parent(),
        e.$slideTrack.css("opacity", 0),
        !0 !== e.options.centerMode && !0 !== e.options.swipeToSlide || (e.options.slidesToScroll = 1),
        i("img[data-lazy]", e.$slider).not("[src]").addClass("slick-loading"),
        e.setupInfinite(),
        e.buildArrows(),
        e.buildDots(),
        e.updateDots(),
        e.setSlideClasses("number" == typeof e.currentSlide ? e.currentSlide : 0),
        !0 === e.options.draggable && e.$list.addClass("draggable")
    }
    ,
    e.prototype.buildRows = function() {
        var i, e, t, o, s, n, r, l = this;
        if (o = document.createDocumentFragment(),
        n = l.$slider.children(),
        l.options.rows > 1) {
            for (r = l.options.slidesPerRow * l.options.rows,
            s = Math.ceil(n.length / r),
            i = 0; i < s; i++) {
                var d = document.createElement("div");
                for (e = 0; e < l.options.rows; e++) {
                    var a = document.createElement("div");
                    for (t = 0; t < l.options.slidesPerRow; t++) {
                        var c = i * r + (e * l.options.slidesPerRow + t);
                        n.get(c) && a.appendChild(n.get(c))
                    }
                    d.appendChild(a)
                }
                o.appendChild(d)
            }
            l.$slider.empty().append(o),
            l.$slider.children().children().children().css({
                width: 100 / l.options.slidesPerRow + "%",
                display: "inline-block"
            })
        }
    }
    ,
    e.prototype.checkResponsive = function(e, t) {
        var o, s, n, r = this, l = !1, d = r.$slider.width(), a = window.innerWidth || i(window).width();
        if ("window" === r.respondTo ? n = a : "slider" === r.respondTo ? n = d : "min" === r.respondTo && (n = Math.min(a, d)),
        r.options.responsive && r.options.responsive.length && null !== r.options.responsive) {
            s = null;
            for (o in r.breakpoints)
                r.breakpoints.hasOwnProperty(o) && (!1 === r.originalSettings.mobileFirst ? n < r.breakpoints[o] && (s = r.breakpoints[o]) : n > r.breakpoints[o] && (s = r.breakpoints[o]));
            null !== s ? null !== r.activeBreakpoint ? (s !== r.activeBreakpoint || t) && (r.activeBreakpoint = s,
            "unslick" === r.breakpointSettings[s] ? r.unslick(s) : (r.options = i.extend({}, r.originalSettings, r.breakpointSettings[s]),
            !0 === e && (r.currentSlide = r.options.initialSlide),
            r.refresh(e)),
            l = s) : (r.activeBreakpoint = s,
            "unslick" === r.breakpointSettings[s] ? r.unslick(s) : (r.options = i.extend({}, r.originalSettings, r.breakpointSettings[s]),
            !0 === e && (r.currentSlide = r.options.initialSlide),
            r.refresh(e)),
            l = s) : null !== r.activeBreakpoint && (r.activeBreakpoint = null,
            r.options = r.originalSettings,
            !0 === e && (r.currentSlide = r.options.initialSlide),
            r.refresh(e),
            l = s),
            e || !1 === l || r.$slider.trigger("breakpoint", [r, l])
        }
    }
    ,
    e.prototype.changeSlide = function(e, t) {
        var o, s, n, r = this, l = i(e.currentTarget);
        switch (l.is("a") && e.preventDefault(),
        l.is("li") || (l = l.closest("li")),
        n = r.slideCount % r.options.slidesToScroll != 0,
        o = n ? 0 : (r.slideCount - r.currentSlide) % r.options.slidesToScroll,
        e.data.message) {
        case "previous":
            s = 0 === o ? r.options.slidesToScroll : r.options.slidesToShow - o,
            r.slideCount > r.options.slidesToShow && r.slideHandler(r.currentSlide - s, !1, t);
            break;
        case "next":
            s = 0 === o ? r.options.slidesToScroll : o,
            r.slideCount > r.options.slidesToShow && r.slideHandler(r.currentSlide + s, !1, t);
            break;
        case "index":
            var d = 0 === e.data.index ? 0 : e.data.index || l.index() * r.options.slidesToScroll;
            r.slideHandler(r.checkNavigable(d), !1, t),
            l.children().trigger("focus");
            break;
        default:
            return
        }
    }
    ,
    e.prototype.checkNavigable = function(i) {
        var e, t;
        if (e = this.getNavigableIndexes(),
        t = 0,
        i > e[e.length - 1])
            i = e[e.length - 1];
        else
            for (var o in e) {
                if (i < e[o]) {
                    i = t;
                    break
                }
                t = e[o]
            }
        return i
    }
    ,
    e.prototype.cleanUpEvents = function() {
        var e = this;
        e.options.dots && null !== e.$dots && (i("li", e.$dots).off("click.slick", e.changeSlide).off("mouseenter.slick", i.proxy(e.interrupt, e, !0)).off("mouseleave.slick", i.proxy(e.interrupt, e, !1)),
        !0 === e.options.accessibility && e.$dots.off("keydown.slick", e.keyHandler)),
        e.$slider.off("focus.slick blur.slick"),
        !0 === e.options.arrows && e.slideCount > e.options.slidesToShow && (e.$prevArrow && e.$prevArrow.off("click.slick", e.changeSlide),
        e.$nextArrow && e.$nextArrow.off("click.slick", e.changeSlide),
        !0 === e.options.accessibility && (e.$prevArrow && e.$prevArrow.off("keydown.slick", e.keyHandler),
        e.$nextArrow && e.$nextArrow.off("keydown.slick", e.keyHandler))),
        e.$list.off("touchstart.slick mousedown.slick", e.swipeHandler),
        e.$list.off("touchmove.slick mousemove.slick", e.swipeHandler),
        e.$list.off("touchend.slick mouseup.slick", e.swipeHandler),
        e.$list.off("touchcancel.slick mouseleave.slick", e.swipeHandler),
        e.$list.off("click.slick", e.clickHandler),
        i(document).off(e.visibilityChange, e.visibility),
        e.cleanUpSlideEvents(),
        !0 === e.options.accessibility && e.$list.off("keydown.slick", e.keyHandler),
        !0 === e.options.focusOnSelect && i(e.$slideTrack).children().off("click.slick", e.selectHandler),
        i(window).off("orientationchange.slick.slick-" + e.instanceUid, e.orientationChange),
        i(window).off("resize.slick.slick-" + e.instanceUid, e.resize),
        i("[draggable!=true]", e.$slideTrack).off("dragstart", e.preventDefault),
        i(window).off("load.slick.slick-" + e.instanceUid, e.setPosition)
    }
    ,
    e.prototype.cleanUpSlideEvents = function() {
        var e = this;
        e.$list.off("mouseenter.slick", i.proxy(e.interrupt, e, !0)),
        e.$list.off("mouseleave.slick", i.proxy(e.interrupt, e, !1))
    }
    ,
    e.prototype.cleanUpRows = function() {
        var i, e = this;
        e.options.rows > 1 && ((i = e.$slides.children().children()).removeAttr("style"),
        e.$slider.empty().append(i))
    }
    ,
    e.prototype.clickHandler = function(i) {
        !1 === this.shouldClick && (i.stopImmediatePropagation(),
        i.stopPropagation(),
        i.preventDefault())
    }
    ,
    e.prototype.destroy = function(e) {
        var t = this;
        t.autoPlayClear(),
        t.touchObject = {},
        t.cleanUpEvents(),
        i(".slick-cloned", t.$slider).detach(),
        t.$dots && t.$dots.remove(),
        t.$prevArrow && t.$prevArrow.length && (t.$prevArrow.removeClass("slick-disabled slick-arrow slick-hidden").removeAttr("aria-hidden aria-disabled tabindex").css("display", ""),
        t.htmlExpr.test(t.options.prevArrow) && t.$prevArrow.remove()),
        t.$nextArrow && t.$nextArrow.length && (t.$nextArrow.removeClass("slick-disabled slick-arrow slick-hidden").removeAttr("aria-hidden aria-disabled tabindex").css("display", ""),
        t.htmlExpr.test(t.options.nextArrow) && t.$nextArrow.remove()),
        t.$slides && (t.$slides.removeClass("slick-slide slick-active slick-center slick-visible slick-current").removeAttr("aria-hidden").removeAttr("data-slick-index").each(function() {
            i(this).attr("style", i(this).data("originalStyling"))
        }),
        t.$slideTrack.children(this.options.slide).detach(),
        t.$slideTrack.detach(),
        t.$list.detach(),
        t.$slider.append(t.$slides)),
        t.cleanUpRows(),
        t.$slider.removeClass("slick-slider"),
        t.$slider.removeClass("slick-initialized"),
        t.$slider.removeClass("slick-dotted"),
        t.unslicked = !0,
        e || t.$slider.trigger("destroy", [t])
    }
    ,
    e.prototype.disableTransition = function(i) {
        var e = this
          , t = {};
        t[e.transitionType] = "",
        !1 === e.options.fade ? e.$slideTrack.css(t) : e.$slides.eq(i).css(t)
    }
    ,
    e.prototype.fadeSlide = function(i, e) {
        var t = this;
        !1 === t.cssTransitions ? (t.$slides.eq(i).css({
            zIndex: t.options.zIndex
        }),
        t.$slides.eq(i).animate({
            opacity: 1
        }, t.options.speed, t.options.easing, e)) : (t.applyTransition(i),
        t.$slides.eq(i).css({
            opacity: 1,
            zIndex: t.options.zIndex
        }),
        e && setTimeout(function() {
            t.disableTransition(i),
            e.call()
        }, t.options.speed))
    }
    ,
    e.prototype.fadeSlideOut = function(i) {
        var e = this;
        !1 === e.cssTransitions ? e.$slides.eq(i).animate({
            opacity: 0,
            zIndex: e.options.zIndex - 2
        }, e.options.speed, e.options.easing) : (e.applyTransition(i),
        e.$slides.eq(i).css({
            opacity: 0,
            zIndex: e.options.zIndex - 2
        }))
    }
    ,
    e.prototype.filterSlides = e.prototype.slickFilter = function(i) {
        var e = this;
        null !== i && (e.$slidesCache = e.$slides,
        e.unload(),
        e.$slideTrack.children(this.options.slide).detach(),
        e.$slidesCache.filter(i).appendTo(e.$slideTrack),
        e.reinit())
    }
    ,
    e.prototype.focusHandler = function() {
        var e = this;
        e.$slider.off("focus.slick blur.slick").on("focus.slick blur.slick", "*", function(t) {
            t.stopImmediatePropagation();
            var o = i(this);
            setTimeout(function() {
                e.options.pauseOnFocus && (e.focussed = o.is(":focus"),
                e.autoPlay())
            }, 0)
        })
    }
    ,
    e.prototype.getCurrent = e.prototype.slickCurrentSlide = function() {
        return this.currentSlide
    }
    ,
    e.prototype.getDotCount = function() {
        var i = this
          , e = 0
          , t = 0
          , o = 0;
        if (!0 === i.options.infinite)
            if (i.slideCount <= i.options.slidesToShow)
                ++o;
            else
                for (; e < i.slideCount; )
                    ++o,
                    e = t + i.options.slidesToScroll,
                    t += i.options.slidesToScroll <= i.options.slidesToShow ? i.options.slidesToScroll : i.options.slidesToShow;
        else if (!0 === i.options.centerMode)
            o = i.slideCount;
        else if (i.options.asNavFor)
            for (; e < i.slideCount; )
                ++o,
                e = t + i.options.slidesToScroll,
                t += i.options.slidesToScroll <= i.options.slidesToShow ? i.options.slidesToScroll : i.options.slidesToShow;
        else
            o = 1 + Math.ceil((i.slideCount - i.options.slidesToShow) / i.options.slidesToScroll);
        return o - 1
    }
    ,
    e.prototype.getLeft = function(i) {
        var e, t, o, s, n = this, r = 0;
        return n.slideOffset = 0,
        t = n.$slides.first().outerHeight(!0),
        !0 === n.options.infinite ? (n.slideCount > n.options.slidesToShow && (n.slideOffset = n.slideWidth * n.options.slidesToShow * -1,
        s = -1,
        !0 === n.options.vertical && !0 === n.options.centerMode && (2 === n.options.slidesToShow ? s = -1.5 : 1 === n.options.slidesToShow && (s = -2)),
        r = t * n.options.slidesToShow * s),
        n.slideCount % n.options.slidesToScroll != 0 && i + n.options.slidesToScroll > n.slideCount && n.slideCount > n.options.slidesToShow && (i > n.slideCount ? (n.slideOffset = (n.options.slidesToShow - (i - n.slideCount)) * n.slideWidth * -1,
        r = (n.options.slidesToShow - (i - n.slideCount)) * t * -1) : (n.slideOffset = n.slideCount % n.options.slidesToScroll * n.slideWidth * -1,
        r = n.slideCount % n.options.slidesToScroll * t * -1))) : i + n.options.slidesToShow > n.slideCount && (n.slideOffset = (i + n.options.slidesToShow - n.slideCount) * n.slideWidth,
        r = (i + n.options.slidesToShow - n.slideCount) * t),
        n.slideCount <= n.options.slidesToShow && (n.slideOffset = 0,
        r = 0),
        !0 === n.options.centerMode && n.slideCount <= n.options.slidesToShow ? n.slideOffset = n.slideWidth * Math.floor(n.options.slidesToShow) / 2 - n.slideWidth * n.slideCount / 2 : !0 === n.options.centerMode && !0 === n.options.infinite ? n.slideOffset += n.slideWidth * Math.floor(n.options.slidesToShow / 2) - n.slideWidth : !0 === n.options.centerMode && (n.slideOffset = 0,
        n.slideOffset += n.slideWidth * Math.floor(n.options.slidesToShow / 2)),
        e = !1 === n.options.vertical ? i * n.slideWidth * -1 + n.slideOffset : i * t * -1 + r,
        !0 === n.options.variableWidth && (o = n.slideCount <= n.options.slidesToShow || !1 === n.options.infinite ? n.$slideTrack.children(".slick-slide").eq(i) : n.$slideTrack.children(".slick-slide").eq(i + n.options.slidesToShow),
        e = !0 === n.options.rtl ? o[0] ? -1 * (n.$slideTrack.width() - o[0].offsetLeft - o.width()) : 0 : o[0] ? -1 * o[0].offsetLeft : 0,
        !0 === n.options.centerMode && (o = n.slideCount <= n.options.slidesToShow || !1 === n.options.infinite ? n.$slideTrack.children(".slick-slide").eq(i) : n.$slideTrack.children(".slick-slide").eq(i + n.options.slidesToShow + 1),
        e = !0 === n.options.rtl ? o[0] ? -1 * (n.$slideTrack.width() - o[0].offsetLeft - o.width()) : 0 : o[0] ? -1 * o[0].offsetLeft : 0,
        e += (n.$list.width() - o.outerWidth()) / 2)),
        e
    }
    ,
    e.prototype.getOption = e.prototype.slickGetOption = function(i) {
        return this.options[i]
    }
    ,
    e.prototype.getNavigableIndexes = function() {
        var i, e = this, t = 0, o = 0, s = [];
        for (!1 === e.options.infinite ? i = e.slideCount : (t = -1 * e.options.slidesToScroll,
        o = -1 * e.options.slidesToScroll,
        i = 2 * e.slideCount); t < i; )
            s.push(t),
            t = o + e.options.slidesToScroll,
            o += e.options.slidesToScroll <= e.options.slidesToShow ? e.options.slidesToScroll : e.options.slidesToShow;
        return s
    }
    ,
    e.prototype.getSlick = function() {
        return this
    }
    ,
    e.prototype.getSlideCount = function() {
        var e, t, o = this;
        return t = !0 === o.options.centerMode ? o.slideWidth * Math.floor(o.options.slidesToShow / 2) : 0,
        !0 === o.options.swipeToSlide ? (o.$slideTrack.find(".slick-slide").each(function(s, n) {
            if (n.offsetLeft - t + i(n).outerWidth() / 2 > -1 * o.swipeLeft)
                return e = n,
                !1
        }),
        Math.abs(i(e).attr("data-slick-index") - o.currentSlide) || 1) : o.options.slidesToScroll
    }
    ,
    e.prototype.goTo = e.prototype.slickGoTo = function(i, e) {
        this.changeSlide({
            data: {
                message: "index",
                index: parseInt(i)
            }
        }, e)
    }
    ,
    e.prototype.init = function(e) {
        var t = this;
        i(t.$slider).hasClass("slick-initialized") || (i(t.$slider).addClass("slick-initialized"),
        t.buildRows(),
        t.buildOut(),
        t.setProps(),
        t.startLoad(),
        t.loadSlider(),
        t.initializeEvents(),
        t.updateArrows(),
        t.updateDots(),
        t.checkResponsive(!0),
        t.focusHandler()),
        e && t.$slider.trigger("init", [t]),
        !0 === t.options.accessibility && t.initADA(),
        t.options.autoplay && (t.paused = !1,
        t.autoPlay())
    }
    ,
    e.prototype.initADA = function() {
        var e = this
          , t = Math.ceil(e.slideCount / e.options.slidesToShow)
          , o = e.getNavigableIndexes().filter(function(i) {
            return i >= 0 && i < e.slideCount
        });
        e.$slides.add(e.$slideTrack.find(".slick-cloned")).attr({
            "aria-hidden": "true",
            tabindex: "-1"
        }).find("a, input, button, select").attr({
            tabindex: "-1"
        }),
        null !== e.$dots && (e.$slides.not(e.$slideTrack.find(".slick-cloned")).each(function(t) {
            var s = o.indexOf(t);
            i(this).attr({
                role: "tabpanel",
                id: "slick-slide" + e.instanceUid + t,
                tabindex: -1
            }),
            -1 !== s && i(this).attr({
                "aria-describedby": "slick-slide-control" + e.instanceUid + s
            })
        }),
        e.$dots.attr("role", "tablist").find("li").each(function(s) {
            var n = o[s];
            i(this).attr({
                role: "presentation"
            }),
            i(this).find("button").first().attr({
                role: "tab",
                id: "slick-slide-control" + e.instanceUid + s,
                "aria-controls": "slick-slide" + e.instanceUid + n,
                "aria-label": s + 1 + " of " + t,
                "aria-selected": null,
                tabindex: "-1"
            })
        }).eq(e.currentSlide).find("button").attr({
            "aria-selected": "true",
            tabindex: "0"
        }).end());
        for (var s = e.currentSlide, n = s + e.options.slidesToShow; s < n; s++)
            e.$slides.eq(s).attr("tabindex", 0);
        e.activateADA()
    }
    ,
    e.prototype.initArrowEvents = function() {
        var i = this;
        !0 === i.options.arrows && i.slideCount > i.options.slidesToShow && (i.$prevArrow.off("click.slick").on("click.slick", {
            message: "previous"
        }, i.changeSlide),
        i.$nextArrow.off("click.slick").on("click.slick", {
            message: "next"
        }, i.changeSlide),
        !0 === i.options.accessibility && (i.$prevArrow.on("keydown.slick", i.keyHandler),
        i.$nextArrow.on("keydown.slick", i.keyHandler)))
    }
    ,
    e.prototype.initDotEvents = function() {
        var e = this;
        !0 === e.options.dots && (i("li", e.$dots).on("click.slick", {
            message: "index"
        }, e.changeSlide),
        !0 === e.options.accessibility && e.$dots.on("keydown.slick", e.keyHandler)),
        !0 === e.options.dots && !0 === e.options.pauseOnDotsHover && i("li", e.$dots).on("mouseenter.slick", i.proxy(e.interrupt, e, !0)).on("mouseleave.slick", i.proxy(e.interrupt, e, !1))
    }
    ,
    e.prototype.initSlideEvents = function() {
        var e = this;
        e.options.pauseOnHover && (e.$list.on("mouseenter.slick", i.proxy(e.interrupt, e, !0)),
        e.$list.on("mouseleave.slick", i.proxy(e.interrupt, e, !1)))
    }
    ,
    e.prototype.initializeEvents = function() {
        var e = this;
        e.initArrowEvents(),
        e.initDotEvents(),
        e.initSlideEvents(),
        e.$list.on("touchstart.slick mousedown.slick", {
            action: "start"
        }, e.swipeHandler),
        e.$list.on("touchmove.slick mousemove.slick", {
            action: "move"
        }, e.swipeHandler),
        e.$list.on("touchend.slick mouseup.slick", {
            action: "end"
        }, e.swipeHandler),
        e.$list.on("touchcancel.slick mouseleave.slick", {
            action: "end"
        }, e.swipeHandler),
        e.$list.on("click.slick", e.clickHandler),
        i(document).on(e.visibilityChange, i.proxy(e.visibility, e)),
        !0 === e.options.accessibility && e.$list.on("keydown.slick", e.keyHandler),
        !0 === e.options.focusOnSelect && i(e.$slideTrack).children().on("click.slick", e.selectHandler),
        i(window).on("orientationchange.slick.slick-" + e.instanceUid, i.proxy(e.orientationChange, e)),
        i(window).on("resize.slick.slick-" + e.instanceUid, i.proxy(e.resize, e)),
        i("[draggable!=true]", e.$slideTrack).on("dragstart", e.preventDefault),
        i(window).on("load.slick.slick-" + e.instanceUid, e.setPosition),
        i(e.setPosition)
    }
    ,
    e.prototype.initUI = function() {
        var i = this;
        !0 === i.options.arrows && i.slideCount > i.options.slidesToShow && (i.$prevArrow.show(),
        i.$nextArrow.show()),
        !0 === i.options.dots && i.slideCount > i.options.slidesToShow && i.$dots.show()
    }
    ,
    e.prototype.keyHandler = function(i) {
        var e = this;
        i.target.tagName.match("TEXTAREA|INPUT|SELECT") || (37 === i.keyCode && !0 === e.options.accessibility ? e.changeSlide({
            data: {
                message: !0 === e.options.rtl ? "next" : "previous"
            }
        }) : 39 === i.keyCode && !0 === e.options.accessibility && e.changeSlide({
            data: {
                message: !0 === e.options.rtl ? "previous" : "next"
            }
        }))
    }
    ,
    e.prototype.lazyLoad = function() {
        function e(e) {
            i("img[data-lazy]", e).each(function() {
                var e = i(this)
                  , t = i(this).attr("data-lazy")
                  , o = i(this).attr("data-srcset")
                  , s = i(this).attr("data-sizes") || n.$slider.attr("data-sizes")
                  , r = document.createElement("img");
                r.onload = function() {
                    e.animate({
                        opacity: 0
                    }, 100, function() {
                        o && (e.attr("srcset", o),
                        s && e.attr("sizes", s)),
                        e.attr("src", t).animate({
                            opacity: 1
                        }, 200, function() {
                            e.removeAttr("data-lazy data-srcset data-sizes").removeClass("slick-loading")
                        }),
                        n.$slider.trigger("lazyLoaded", [n, e, t])
                    })
                }
                ,
                r.onerror = function() {
                    e.removeAttr("data-lazy").removeClass("slick-loading").addClass("slick-lazyload-error"),
                    n.$slider.trigger("lazyLoadError", [n, e, t])
                }
                ,
                r.src = t
            })
        }
        var t, o, s, n = this;
        if (!0 === n.options.centerMode ? !0 === n.options.infinite ? s = (o = n.currentSlide + (n.options.slidesToShow / 2 + 1)) + n.options.slidesToShow + 2 : (o = Math.max(0, n.currentSlide - (n.options.slidesToShow / 2 + 1)),
        s = n.options.slidesToShow / 2 + 1 + 2 + n.currentSlide) : (o = n.options.infinite ? n.options.slidesToShow + n.currentSlide : n.currentSlide,
        s = Math.ceil(o + n.options.slidesToShow),
        !0 === n.options.fade && (o > 0 && o--,
        s <= n.slideCount && s++)),
        t = n.$slider.find(".slick-slide").slice(o, s),
        "anticipated" === n.options.lazyLoad)
            for (var r = o - 1, l = s, d = n.$slider.find(".slick-slide"), a = 0; a < n.options.slidesToScroll; a++)
                r < 0 && (r = n.slideCount - 1),
                t = (t = t.add(d.eq(r))).add(d.eq(l)),
                r--,
                l++;
        e(t),
        n.slideCount <= n.options.slidesToShow ? e(n.$slider.find(".slick-slide")) : n.currentSlide >= n.slideCount - n.options.slidesToShow ? e(n.$slider.find(".slick-cloned").slice(0, n.options.slidesToShow)) : 0 === n.currentSlide && e(n.$slider.find(".slick-cloned").slice(-1 * n.options.slidesToShow))
    }
    ,
    e.prototype.loadSlider = function() {
        var i = this;
        i.setPosition(),
        i.$slideTrack.css({
            opacity: 1
        }),
        i.$slider.removeClass("slick-loading"),
        i.initUI(),
        "progressive" === i.options.lazyLoad && i.progressiveLazyLoad()
    }
    ,
    e.prototype.next = e.prototype.slickNext = function() {
        this.changeSlide({
            data: {
                message: "next"
            }
        })
    }
    ,
    e.prototype.orientationChange = function() {
        var i = this;
        i.checkResponsive(),
        i.setPosition()
    }
    ,
    e.prototype.pause = e.prototype.slickPause = function() {
        var i = this;
        i.autoPlayClear(),
        i.paused = !0
    }
    ,
    e.prototype.play = e.prototype.slickPlay = function() {
        var i = this;
        i.autoPlay(),
        i.options.autoplay = !0,
        i.paused = !1,
        i.focussed = !1,
        i.interrupted = !1
    }
    ,
    e.prototype.postSlide = function(e) {
        var t = this;
        t.unslicked || (t.$slider.trigger("afterChange", [t, e]),
        t.animating = !1,
        t.slideCount > t.options.slidesToShow && t.setPosition(),
        t.swipeLeft = null,
        t.options.autoplay && t.autoPlay(),
        !0 === t.options.accessibility && (t.initADA(),
        t.options.focusOnChange && i(t.$slides.get(t.currentSlide)).attr("tabindex", 0).focus()))
    }
    ,
    e.prototype.prev = e.prototype.slickPrev = function() {
        this.changeSlide({
            data: {
                message: "previous"
            }
        })
    }
    ,
    e.prototype.preventDefault = function(i) {
        i.preventDefault()
    }
    ,
    e.prototype.progressiveLazyLoad = function(e) {
        e = e || 1;
        var t, o, s, n, r, l = this, d = i("img[data-lazy]", l.$slider);
        d.length ? (t = d.first(),
        o = t.attr("data-lazy"),
        s = t.attr("data-srcset"),
        n = t.attr("data-sizes") || l.$slider.attr("data-sizes"),
        (r = document.createElement("img")).onload = function() {
            s && (t.attr("srcset", s),
            n && t.attr("sizes", n)),
            t.attr("src", o).removeAttr("data-lazy data-srcset data-sizes").removeClass("slick-loading"),
            !0 === l.options.adaptiveHeight && l.setPosition(),
            l.$slider.trigger("lazyLoaded", [l, t, o]),
            l.progressiveLazyLoad()
        }
        ,
        r.onerror = function() {
            e < 3 ? setTimeout(function() {
                l.progressiveLazyLoad(e + 1)
            }, 500) : (t.removeAttr("data-lazy").removeClass("slick-loading").addClass("slick-lazyload-error"),
            l.$slider.trigger("lazyLoadError", [l, t, o]),
            l.progressiveLazyLoad())
        }
        ,
        r.src = o) : l.$slider.trigger("allImagesLoaded", [l])
    }
    ,
    e.prototype.refresh = function(e) {
        var t, o, s = this;
        o = s.slideCount - s.options.slidesToShow,
        !s.options.infinite && s.currentSlide > o && (s.currentSlide = o),
        s.slideCount <= s.options.slidesToShow && (s.currentSlide = 0),
        t = s.currentSlide,
        s.destroy(!0),
        i.extend(s, s.initials, {
            currentSlide: t
        }),
        s.init(),
        e || s.changeSlide({
            data: {
                message: "index",
                index: t
            }
        }, !1)
    }
    ,
    e.prototype.registerBreakpoints = function() {
        var e, t, o, s = this, n = s.options.responsive || null;
        if ("array" === i.type(n) && n.length) {
            s.respondTo = s.options.respondTo || "window";
            for (e in n)
                if (o = s.breakpoints.length - 1,
                n.hasOwnProperty(e)) {
                    for (t = n[e].breakpoint; o >= 0; )
                        s.breakpoints[o] && s.breakpoints[o] === t && s.breakpoints.splice(o, 1),
                        o--;
                    s.breakpoints.push(t),
                    s.breakpointSettings[t] = n[e].settings
                }
            s.breakpoints.sort(function(i, e) {
                return s.options.mobileFirst ? i - e : e - i
            })
        }
    }
    ,
    e.prototype.reinit = function() {
        var e = this;
        e.$slides = e.$slideTrack.children(e.options.slide).addClass("slick-slide"),
        e.slideCount = e.$slides.length,
        e.currentSlide >= e.slideCount && 0 !== e.currentSlide && (e.currentSlide = e.currentSlide - e.options.slidesToScroll),
        e.slideCount <= e.options.slidesToShow && (e.currentSlide = 0),
        e.registerBreakpoints(),
        e.setProps(),
        e.setupInfinite(),
        e.buildArrows(),
        e.updateArrows(),
        e.initArrowEvents(),
        e.buildDots(),
        e.updateDots(),
        e.initDotEvents(),
        e.cleanUpSlideEvents(),
        e.initSlideEvents(),
        e.checkResponsive(!1, !0),
        !0 === e.options.focusOnSelect && i(e.$slideTrack).children().on("click.slick", e.selectHandler),
        e.setSlideClasses("number" == typeof e.currentSlide ? e.currentSlide : 0),
        e.setPosition(),
        e.focusHandler(),
        e.paused = !e.options.autoplay,
        e.autoPlay(),
        e.$slider.trigger("reInit", [e])
    }
    ,
    e.prototype.resize = function() {
        var e = this;
        i(window).width() !== e.windowWidth && (clearTimeout(e.windowDelay),
        e.windowDelay = window.setTimeout(function() {
            e.windowWidth = i(window).width(),
            e.checkResponsive(),
            e.unslicked || e.setPosition()
        }, 50))
    }
    ,
    e.prototype.removeSlide = e.prototype.slickRemove = function(i, e, t) {
        var o = this;
        if (i = "boolean" == typeof i ? !0 === (e = i) ? 0 : o.slideCount - 1 : !0 === e ? --i : i,
        o.slideCount < 1 || i < 0 || i > o.slideCount - 1)
            return !1;
        o.unload(),
        !0 === t ? o.$slideTrack.children().remove() : o.$slideTrack.children(this.options.slide).eq(i).remove(),
        o.$slides = o.$slideTrack.children(this.options.slide),
        o.$slideTrack.children(this.options.slide).detach(),
        o.$slideTrack.append(o.$slides),
        o.$slidesCache = o.$slides,
        o.reinit()
    }
    ,
    e.prototype.setCSS = function(i) {
        var e, t, o = this, s = {};
        !0 === o.options.rtl && (i = -i),
        e = "left" == o.positionProp ? Math.ceil(i) + "px" : "0px",
        t = "top" == o.positionProp ? Math.ceil(i) + "px" : "0px",
        s[o.positionProp] = i,
        !1 === o.transformsEnabled ? o.$slideTrack.css(s) : (s = {},
        !1 === o.cssTransitions ? (s[o.animType] = "translate(" + e + ", " + t + ")",
        o.$slideTrack.css(s)) : (s[o.animType] = "translate3d(" + e + ", " + t + ", 0px)",
        o.$slideTrack.css(s)))
    }
    ,
    e.prototype.setDimensions = function() {
        var i = this;
        !1 === i.options.vertical ? !0 === i.options.centerMode && i.$list.css({
            padding: "0px " + i.options.centerPadding
        }) : (i.$list.height(i.$slides.first().outerHeight(!0) * i.options.slidesToShow),
        !0 === i.options.centerMode && i.$list.css({
            padding: i.options.centerPadding + " 0px"
        })),
        i.listWidth = i.$list.width(),
        i.listHeight = i.$list.height(),
        !1 === i.options.vertical && !1 === i.options.variableWidth ? (i.slideWidth = Math.ceil(i.listWidth / i.options.slidesToShow),
        i.$slideTrack.width(Math.ceil(i.slideWidth * i.$slideTrack.children(".slick-slide").length))) : !0 === i.options.variableWidth ? i.$slideTrack.width(5e3 * i.slideCount) : (i.slideWidth = Math.ceil(i.listWidth),
        i.$slideTrack.height(Math.ceil(i.$slides.first().outerHeight(!0) * i.$slideTrack.children(".slick-slide").length)));
        var e = i.$slides.first().outerWidth(!0) - i.$slides.first().width();
        !1 === i.options.variableWidth && i.$slideTrack.children(".slick-slide").width(i.slideWidth - e)
    }
    ,
    e.prototype.setFade = function() {
        var e, t = this;
        t.$slides.each(function(o, s) {
            e = t.slideWidth * o * -1,
            !0 === t.options.rtl ? i(s).css({
                position: "relative",
                right: e,
                top: 0,
                zIndex: t.options.zIndex - 2,
                opacity: 0
            }) : i(s).css({
                position: "relative",
                left: e,
                top: 0,
                zIndex: t.options.zIndex - 2,
                opacity: 0
            })
        }),
        t.$slides.eq(t.currentSlide).css({
            zIndex: t.options.zIndex - 1,
            opacity: 1
        })
    }
    ,
    e.prototype.setHeight = function() {
        var i = this;
        if (1 === i.options.slidesToShow && !0 === i.options.adaptiveHeight && !1 === i.options.vertical) {
            var e = i.$slides.eq(i.currentSlide).outerHeight(!0);
            i.$list.css("height", e)
        }
    }
    ,
    e.prototype.setOption = e.prototype.slickSetOption = function() {
        var e, t, o, s, n, r = this, l = !1;
        if ("object" === i.type(arguments[0]) ? (o = arguments[0],
        l = arguments[1],
        n = "multiple") : "string" === i.type(arguments[0]) && (o = arguments[0],
        s = arguments[1],
        l = arguments[2],
        "responsive" === arguments[0] && "array" === i.type(arguments[1]) ? n = "responsive" : void 0 !== arguments[1] && (n = "single")),
        "single" === n)
            r.options[o] = s;
        else if ("multiple" === n)
            i.each(o, function(i, e) {
                r.options[i] = e
            });
        else if ("responsive" === n)
            for (t in s)
                if ("array" !== i.type(r.options.responsive))
                    r.options.responsive = [s[t]];
                else {
                    for (e = r.options.responsive.length - 1; e >= 0; )
                        r.options.responsive[e].breakpoint === s[t].breakpoint && r.options.responsive.splice(e, 1),
                        e--;
                    r.options.responsive.push(s[t])
                }
        l && (r.unload(),
        r.reinit())
    }
    ,
    e.prototype.setPosition = function() {
        var i = this;
        i.setDimensions(),
        i.setHeight(),
        !1 === i.options.fade ? i.setCSS(i.getLeft(i.currentSlide)) : i.setFade(),
        i.$slider.trigger("setPosition", [i])
    }
    ,
    e.prototype.setProps = function() {
        var i = this
          , e = document.body.style;
        i.positionProp = !0 === i.options.vertical ? "top" : "left",
        "top" === i.positionProp ? i.$slider.addClass("slick-vertical") : i.$slider.removeClass("slick-vertical"),
        void 0 === e.WebkitTransition && void 0 === e.MozTransition && void 0 === e.msTransition || !0 === i.options.useCSS && (i.cssTransitions = !0),
        i.options.fade && ("number" == typeof i.options.zIndex ? i.options.zIndex < 3 && (i.options.zIndex = 3) : i.options.zIndex = i.defaults.zIndex),
        void 0 !== e.OTransform && (i.animType = "OTransform",
        i.transformType = "-o-transform",
        i.transitionType = "OTransition",
        void 0 === e.perspectiveProperty && void 0 === e.webkitPerspective && (i.animType = !1)),
        void 0 !== e.MozTransform && (i.animType = "MozTransform",
        i.transformType = "-moz-transform",
        i.transitionType = "MozTransition",
        void 0 === e.perspectiveProperty && void 0 === e.MozPerspective && (i.animType = !1)),
        void 0 !== e.webkitTransform && (i.animType = "webkitTransform",
        i.transformType = "-webkit-transform",
        i.transitionType = "webkitTransition",
        void 0 === e.perspectiveProperty && void 0 === e.webkitPerspective && (i.animType = !1)),
        void 0 !== e.msTransform && (i.animType = "msTransform",
        i.transformType = "-ms-transform",
        i.transitionType = "msTransition",
        void 0 === e.msTransform && (i.animType = !1)),
        void 0 !== e.transform && !1 !== i.animType && (i.animType = "transform",
        i.transformType = "transform",
        i.transitionType = "transition"),
        i.transformsEnabled = i.options.useTransform && null !== i.animType && !1 !== i.animType
    }
    ,
    e.prototype.setSlideClasses = function(i) {
        var e, t, o, s, n = this;
        if (t = n.$slider.find(".slick-slide").removeClass("slick-active slick-center slick-current").attr("aria-hidden", "true"),
        n.$slides.eq(i).addClass("slick-current"),
        !0 === n.options.centerMode) {
            var r = n.options.slidesToShow % 2 == 0 ? 1 : 0;
            e = Math.floor(n.options.slidesToShow / 2),
            !0 === n.options.infinite && (i >= e && i <= n.slideCount - 1 - e ? n.$slides.slice(i - e + r, i + e + 1).addClass("slick-active").attr("aria-hidden", "false") : (o = n.options.slidesToShow + i,
            t.slice(o - e + 1 + r, o + e + 2).addClass("slick-active").attr("aria-hidden", "false")),
            0 === i ? t.eq(t.length - 1 - n.options.slidesToShow).addClass("slick-center") : i === n.slideCount - 1 && t.eq(n.options.slidesToShow).addClass("slick-center")),
            n.$slides.eq(i).addClass("slick-center")
        } else
            i >= 0 && i <= n.slideCount - n.options.slidesToShow ? n.$slides.slice(i, i + n.options.slidesToShow).addClass("slick-active").attr("aria-hidden", "false") : t.length <= n.options.slidesToShow ? t.addClass("slick-active").attr("aria-hidden", "false") : (s = n.slideCount % n.options.slidesToShow,
            o = !0 === n.options.infinite ? n.options.slidesToShow + i : i,
            n.options.slidesToShow == n.options.slidesToScroll && n.slideCount - i < n.options.slidesToShow ? t.slice(o - (n.options.slidesToShow - s), o + s).addClass("slick-active").attr("aria-hidden", "false") : t.slice(o, o + n.options.slidesToShow).addClass("slick-active").attr("aria-hidden", "false"));
        "ondemand" !== n.options.lazyLoad && "anticipated" !== n.options.lazyLoad || n.lazyLoad()
    }
    ,
    e.prototype.setupInfinite = function() {
        var e, t, o, s = this;
        if (!0 === s.options.fade && (s.options.centerMode = !1),
        !0 === s.options.infinite && !1 === s.options.fade && (t = null,
        s.slideCount > s.options.slidesToShow)) {
            for (o = !0 === s.options.centerMode ? s.options.slidesToShow + 1 : s.options.slidesToShow,
            e = s.slideCount; e > s.slideCount - o; e -= 1)
                t = e - 1,
                i(s.$slides[t]).clone(!0).attr("id", "").attr("data-slick-index", t - s.slideCount).prependTo(s.$slideTrack).addClass("slick-cloned");
            for (e = 0; e < o + s.slideCount; e += 1)
                t = e,
                i(s.$slides[t]).clone(!0).attr("id", "").attr("data-slick-index", t + s.slideCount).appendTo(s.$slideTrack).addClass("slick-cloned");
            s.$slideTrack.find(".slick-cloned").find("[id]").each(function() {
                i(this).attr("id", "")
            })
        }
    }
    ,
    e.prototype.interrupt = function(i) {
        var e = this;
        i || e.autoPlay(),
        e.interrupted = i
    }
    ,
    e.prototype.selectHandler = function(e) {
        var t = this
          , o = i(e.target).is(".slick-slide") ? i(e.target) : i(e.target).parents(".slick-slide")
          , s = parseInt(o.attr("data-slick-index"));
        s || (s = 0),
        t.slideCount <= t.options.slidesToShow ? t.slideHandler(s, !1, !0) : t.slideHandler(s)
    }
    ,
    e.prototype.slideHandler = function(i, e, t) {
        var o, s, n, r, l, d = null, a = this;
        if (e = e || !1,
        !(!0 === a.animating && !0 === a.options.waitForAnimate || !0 === a.options.fade && a.currentSlide === i))
            if (!1 === e && a.asNavFor(i),
            o = i,
            d = a.getLeft(o),
            r = a.getLeft(a.currentSlide),
            a.currentLeft = null === a.swipeLeft ? r : a.swipeLeft,
            !1 === a.options.infinite && !1 === a.options.centerMode && (i < 0 || i > a.getDotCount() * a.options.slidesToScroll))
                !1 === a.options.fade && (o = a.currentSlide,
                !0 !== t ? a.animateSlide(r, function() {
                    a.postSlide(o)
                }) : a.postSlide(o));
            else if (!1 === a.options.infinite && !0 === a.options.centerMode && (i < 0 || i > a.slideCount - a.options.slidesToScroll))
                !1 === a.options.fade && (o = a.currentSlide,
                !0 !== t ? a.animateSlide(r, function() {
                    a.postSlide(o)
                }) : a.postSlide(o));
            else {
                if (a.options.autoplay && clearInterval(a.autoPlayTimer),
                s = o < 0 ? a.slideCount % a.options.slidesToScroll != 0 ? a.slideCount - a.slideCount % a.options.slidesToScroll : a.slideCount + o : o >= a.slideCount ? a.slideCount % a.options.slidesToScroll != 0 ? 0 : o - a.slideCount : o,
                a.animating = !0,
                a.$slider.trigger("beforeChange", [a, a.currentSlide, s]),
                n = a.currentSlide,
                a.currentSlide = s,
                a.setSlideClasses(a.currentSlide),
                a.options.asNavFor && (l = (l = a.getNavTarget()).slick("getSlick")).slideCount <= l.options.slidesToShow && l.setSlideClasses(a.currentSlide),
                a.updateDots(),
                a.updateArrows(),
                !0 === a.options.fade)
                    return !0 !== t ? (a.fadeSlideOut(n),
                    a.fadeSlide(s, function() {
                        a.postSlide(s)
                    })) : a.postSlide(s),
                    void a.animateHeight();
                !0 !== t ? a.animateSlide(d, function() {
                    a.postSlide(s)
                }) : a.postSlide(s)
            }
    }
    ,
    e.prototype.startLoad = function() {
        var i = this;
        !0 === i.options.arrows && i.slideCount > i.options.slidesToShow && (i.$prevArrow.hide(),
        i.$nextArrow.hide()),
        !0 === i.options.dots && i.slideCount > i.options.slidesToShow && i.$dots.hide(),
        i.$slider.addClass("slick-loading")
    }
    ,
    e.prototype.swipeDirection = function() {
        var i, e, t, o, s = this;
        return i = s.touchObject.startX - s.touchObject.curX,
        e = s.touchObject.startY - s.touchObject.curY,
        t = Math.atan2(e, i),
        (o = Math.round(180 * t / Math.PI)) < 0 && (o = 360 - Math.abs(o)),
        o <= 45 && o >= 0 ? !1 === s.options.rtl ? "left" : "right" : o <= 360 && o >= 315 ? !1 === s.options.rtl ? "left" : "right" : o >= 135 && o <= 225 ? !1 === s.options.rtl ? "right" : "left" : !0 === s.options.verticalSwiping ? o >= 35 && o <= 135 ? "down" : "up" : "vertical"
    }
    ,
    e.prototype.swipeEnd = function(i) {
        var e, t, o = this;
        if (o.dragging = !1,
        o.swiping = !1,
        o.scrolling)
            return o.scrolling = !1,
            !1;
        if (o.interrupted = !1,
        o.shouldClick = !(o.touchObject.swipeLength > 10),
        void 0 === o.touchObject.curX)
            return !1;
        if (!0 === o.touchObject.edgeHit && o.$slider.trigger("edge", [o, o.swipeDirection()]),
        o.touchObject.swipeLength >= o.touchObject.minSwipe) {
            switch (t = o.swipeDirection()) {
            case "left":
            case "down":
                e = o.options.swipeToSlide ? o.checkNavigable(o.currentSlide + o.getSlideCount()) : o.currentSlide + o.getSlideCount(),
                o.currentDirection = 0;
                break;
            case "right":
            case "up":
                e = o.options.swipeToSlide ? o.checkNavigable(o.currentSlide - o.getSlideCount()) : o.currentSlide - o.getSlideCount(),
                o.currentDirection = 1
            }
            "vertical" != t && (o.slideHandler(e),
            o.touchObject = {},
            o.$slider.trigger("swipe", [o, t]))
        } else
            o.touchObject.startX !== o.touchObject.curX && (o.slideHandler(o.currentSlide),
            o.touchObject = {})
    }
    ,
    e.prototype.swipeHandler = function(i) {
        var e = this;
        if (!(!1 === e.options.swipe || "ontouchend"in document && !1 === e.options.swipe || !1 === e.options.draggable && -1 !== i.type.indexOf("mouse")))
            switch (e.touchObject.fingerCount = i.originalEvent && void 0 !== i.originalEvent.touches ? i.originalEvent.touches.length : 1,
            e.touchObject.minSwipe = e.listWidth / e.options.touchThreshold,
            !0 === e.options.verticalSwiping && (e.touchObject.minSwipe = e.listHeight / e.options.touchThreshold),
            i.data.action) {
            case "start":
                e.swipeStart(i);
                break;
            case "move":
                e.swipeMove(i);
                break;
            case "end":
                e.swipeEnd(i)
            }
    }
    ,
    e.prototype.swipeMove = function(i) {
        var e, t, o, s, n, r, l = this;
        return n = void 0 !== i.originalEvent ? i.originalEvent.touches : null,
        !(!l.dragging || l.scrolling || n && 1 !== n.length) && (e = l.getLeft(l.currentSlide),
        l.touchObject.curX = void 0 !== n ? n[0].pageX : i.clientX,
        l.touchObject.curY = void 0 !== n ? n[0].pageY : i.clientY,
        l.touchObject.swipeLength = Math.round(Math.sqrt(Math.pow(l.touchObject.curX - l.touchObject.startX, 2))),
        r = Math.round(Math.sqrt(Math.pow(l.touchObject.curY - l.touchObject.startY, 2))),
        !l.options.verticalSwiping && !l.swiping && r > 4 ? (l.scrolling = !0,
        !1) : (!0 === l.options.verticalSwiping && (l.touchObject.swipeLength = r),
        t = l.swipeDirection(),
        void 0 !== i.originalEvent && l.touchObject.swipeLength > 4 && (l.swiping = !0,
        i.preventDefault()),
        s = (!1 === l.options.rtl ? 1 : -1) * (l.touchObject.curX > l.touchObject.startX ? 1 : -1),
        !0 === l.options.verticalSwiping && (s = l.touchObject.curY > l.touchObject.startY ? 1 : -1),
        o = l.touchObject.swipeLength,
        l.touchObject.edgeHit = !1,
        !1 === l.options.infinite && (0 === l.currentSlide && "right" === t || l.currentSlide >= l.getDotCount() && "left" === t) && (o = l.touchObject.swipeLength * l.options.edgeFriction,
        l.touchObject.edgeHit = !0),
        !1 === l.options.vertical ? l.swipeLeft = e + o * s : l.swipeLeft = e + o * (l.$list.height() / l.listWidth) * s,
        !0 === l.options.verticalSwiping && (l.swipeLeft = e + o * s),
        !0 !== l.options.fade && !1 !== l.options.touchMove && (!0 === l.animating ? (l.swipeLeft = null,
        !1) : void l.setCSS(l.swipeLeft))))
    }
    ,
    e.prototype.swipeStart = function(i) {
        var e, t = this;
        if (t.interrupted = !0,
        1 !== t.touchObject.fingerCount || t.slideCount <= t.options.slidesToShow)
            return t.touchObject = {},
            !1;
        void 0 !== i.originalEvent && void 0 !== i.originalEvent.touches && (e = i.originalEvent.touches[0]),
        t.touchObject.startX = t.touchObject.curX = void 0 !== e ? e.pageX : i.clientX,
        t.touchObject.startY = t.touchObject.curY = void 0 !== e ? e.pageY : i.clientY,
        t.dragging = !0
    }
    ,
    e.prototype.unfilterSlides = e.prototype.slickUnfilter = function() {
        var i = this;
        null !== i.$slidesCache && (i.unload(),
        i.$slideTrack.children(this.options.slide).detach(),
        i.$slidesCache.appendTo(i.$slideTrack),
        i.reinit())
    }
    ,
    e.prototype.unload = function() {
        var e = this;
        i(".slick-cloned", e.$slider).remove(),
        e.$dots && e.$dots.remove(),
        e.$prevArrow && e.htmlExpr.test(e.options.prevArrow) && e.$prevArrow.remove(),
        e.$nextArrow && e.htmlExpr.test(e.options.nextArrow) && e.$nextArrow.remove(),
        e.$slides.removeClass("slick-slide slick-active slick-visible slick-current").attr("aria-hidden", "true").css("width", "")
    }
    ,
    e.prototype.unslick = function(i) {
        var e = this;
        e.$slider.trigger("unslick", [e, i]),
        e.destroy()
    }
    ,
    e.prototype.updateArrows = function() {
        var i = this;
        Math.floor(i.options.slidesToShow / 2),
        !0 === i.options.arrows && i.slideCount > i.options.slidesToShow && !i.options.infinite && (i.$prevArrow.removeClass("slick-disabled").attr("aria-disabled", "false"),
        i.$nextArrow.removeClass("slick-disabled").attr("aria-disabled", "false"),
        0 === i.currentSlide ? (i.$prevArrow.addClass("slick-disabled").attr("aria-disabled", "true"),
        i.$nextArrow.removeClass("slick-disabled").attr("aria-disabled", "false")) : i.currentSlide >= i.slideCount - i.options.slidesToShow && !1 === i.options.centerMode ? (i.$nextArrow.addClass("slick-disabled").attr("aria-disabled", "true"),
        i.$prevArrow.removeClass("slick-disabled").attr("aria-disabled", "false")) : i.currentSlide >= i.slideCount - 1 && !0 === i.options.centerMode && (i.$nextArrow.addClass("slick-disabled").attr("aria-disabled", "true"),
        i.$prevArrow.removeClass("slick-disabled").attr("aria-disabled", "false")))
    }
    ,
    e.prototype.updateDots = function() {
        var i = this;
        null !== i.$dots && (i.$dots.find("li").removeClass("slick-active").end(),
        i.$dots.find("li").eq(Math.floor(i.currentSlide / i.options.slidesToScroll)).addClass("slick-active"))
    }
    ,
    e.prototype.visibility = function() {
        var i = this;
        i.options.autoplay && (document[i.hidden] ? i.interrupted = !0 : i.interrupted = !1)
    }
    ,
    i.fn.slick = function() {
        var i, t, o = this, s = arguments[0], n = Array.prototype.slice.call(arguments, 1), r = o.length;
        for (i = 0; i < r; i++)
            if ("object" == typeof s || void 0 === s ? o[i].slick = new e(o[i],s) : t = o[i].slick[s].apply(o[i].slick, n),
            void 0 !== t)
                return t;
        return o
    }
});
;$(document).ready(function() {
    $(document).on('click', function(e) {
        if (!$(e.target).closest('ul.sub').length) {
            clear_nav_selection();
        }
    });
    $('#header nav ul.primary > li > a').on('hover', function(e) {
        if (!$('#mobile-nav a.menu').hasClass('activated')) {
            clear_nav_selection();
        }
    });
    $('#header nav ul.primary > li > a').on('click', function(e) {
        var siblings = $(this).siblings('ul.sub');
        if (siblings.length == 0)
            return;
        e.preventDefault();
        var list_item = $(this).parent('li');
        var is_curr = list_item.hasClass('nav-curr');
        clear_nav_selection();
        if (!is_curr) {
            if ($('#mobile-nav a.menu').hasClass('activated')) {
                $('html, body').animate({
                    scrollTop: $(this).offset().top
                }, 300);
            }
            list_item.addClass('nav-curr');
            siblings.show(150);
        }
        return false;
    });
    $('#mobile-nav a.menu').on('click', function(e) {
        e.preventDefault();
        if ($(this).hasClass('activated')) {
            clear_nav_selection();
            $(this).removeClass('activated');
            $(this).attr('aria-expanded', false);
            $('#header #nav').css('display', '');
        } else {
            $(this).addClass('activated');
            $(this).attr('aria-expanded', true);
            $('#header #nav').show(200);
        }
        return false;
    });
    function clear_nav_selection() {
        $('#header #nav .nav-curr').removeClass('nav-curr');
        $('#header #nav ul.sub:visible').css('display', '');
    }
    $(window).on('resized', function(e, resized_to) {
        clear_nav_selection();
    });
});
;var POSITIONS_UNSTR = POSITIONS_UNSTR || null;
var POSITIONS_RATE = 1.0;
var VIMEOPLAYER;
var YOUTUBEPLAYER;
function query_string(param) {
    var arr = {};
    location.search.substr(1).split("&").forEach(function(item) {
        let tmp = item.split("=");
        arr[tmp[0]] = decodeURIComponent(tmp[1]);
    });
    if (param)
        return param in arr ? arr[param] : null;
    return arr;
}
function checkVimeoChapter() {
    VIMEOPLAYER.getCurrentChapter().then(function(current) {
        if (!current || current.title.match(/^(intervalo|problema técnico|falha técnica|problema de conexão|avaliação|exercício|exercício em grupo|exercício nos grupos|compartilhar|compartilhar nos grupos|divisão|divisão em grupos|divisão nos grupos|encerrado)$/i)) {
            VIMEOPLAYER.getChapters().then(function(chapters) {
                chapters.some(function(chapter) {
                    if (!current || chapter.index > current.index) {
                        VIMEOPLAYER.setCurrentTime(chapter.startTime + 1);
                        return true;
                    } else if (current && current.index == chapters.length) {
                        VIMEOPLAYER.getDuration().then(function(duration) {
                            VIMEOPLAYER.setCurrentTime(duration);
                        });
                    }
                });
            });
        }
    });
}
function loadVimeoPlayerPositions(node, callback) {
    if (typeof Vimeo == 'undefined')
        return;
    var key = node.data('position-key');
    var video_id = node.data('position-video-id');
    var playlist_id = node.data('position-playlist-id');
    var duration = node.data('position-duration');
    VIMEOPLAYER = new Vimeo.Player(node);
    if (key) {
        if (typeof callback != "function") {
            callback = function(data) {
                VIMEOPLAYER.getChapters().then(function(chapters) {
                    if (chapters.length > 0) {
                        VIMEOPLAYER.on('chapterchange', function(data) {
                            checkVimeoChapter();
                        });
                        VIMEOPLAYER.on('seeked', function(data) {
                            checkVimeoChapter();
                        });
                    }
                    VIMEOPLAYER.getDuration().then(function(duration) {
                        if (intval(duration) > 0 && data && data.length == 1 && data[0][1] > 0) {
                            if (intval(data[0][2]) == 0 || (intval(data[0][1]) / intval(data[0][2])) < 0.95) {
                                VIMEOPLAYER.setCurrentTime(data[0][1]);
                            }
                        } else if (chapters.length > 0) {
                            checkVimeoChapter();
                        }
                    });
                });
            }
        }
        VIMEOPLAYER.ready().then(function() {
            loadVideoPosition(key, callback);
            VIMEOPLAYER.getPlaybackRate().then(function(playbackRate) {
                POSITIONS_RATE = playbackRate;
            });
        });
        VIMEOPLAYER.on('ended', function(data) {
            loadNextAutoplay();
        });
        VIMEOPLAYER.on('playbackratechange', function(data) {
            POSITIONS_RATE = data.playbackRate;
        });
        var last_seek = Date.now();
        VIMEOPLAYER.on('seeked', function(data) {
            if (Date.now() > last_seek + (5 * 1000)) {
                if (typeof duration != 'undefined') {
                    duration = intval(duration);
                } else {
                    duration = data.duration;
                }
                saveVideoPosition(key, data.seconds, duration, video_id, playlist_id);
                last_seek = Date.now();
            }
        });
        var last_pos = Date.now();
        VIMEOPLAYER.on('timeupdate', function(data) {
            if (Date.now() > last_pos + (15 * 1000)) {
                if (typeof duration != 'undefined') {
                    duration = intval(duration);
                } else {
                    duration = data.duration;
                }
                saveVideoPosition(key, data.seconds, duration, video_id, playlist_id);
                last_pos = Date.now();
            }
        });
    }
}
function loadYouTubePlayerPositions(node, callback) {
    if (typeof YT == 'undefined')
        return;
    var key = node.data('position-key');
    var video_id = node.data('position-video-id');
    var playlist_id = node.data('position-playlist-id');
    var duration = node.data('position-duration');
    var last_secs = -1;
    YOUTUBEPLAYER = new YT.Player(node.attr('id'));
    YOUTUBEPLAYER.addEventListener('onStateChange', function(event) {
        clearInterval(node.data('youtube_interval'));
        node.data('youtube_interval', null);
        if (event.data == YT.PlayerState.PLAYING) {
            node.data('youtube_interval', setInterval(function() {
                if (node.is(':visible')) {
                    var duration = YOUTUBEPLAYER.getDuration();
                    var seconds = YOUTUBEPLAYER.getCurrentTime();
                    var percent = (duration > 0 ? seconds / duration : null);
                    node.trigger('onYouTubeTimeUpdate', {
                        duration: duration,
                        seconds: seconds,
                        percent: percent
                    });
                    if (last_secs != -1 && Math.abs(seconds - last_secs - 1) > 0.5) {
                        node.trigger('onYouTubeSeek', {
                            duration: duration,
                            seconds: seconds,
                            percent: percent
                        });
                    }
                    last_secs = seconds;
                } else {
                    clearInterval(node.data('youtube_interval'));
                    node.data('youtube_interval', null);
                }
            }, 1000));
        }
        if (event.data == YT.PlayerState.ENDED) {
            loadNextAutoplay();
        }
    });
    YOUTUBEPLAYER.addEventListener('onPlaybackRateChange', function(playbackRate) {
        POSITIONS_RATE = playbackRate.data;
    });
    if (key) {
        if (typeof callback != "function") {
            callback = function(data) {
                if (data && data.length == 1 && data[0][1] > 0) {
                    if (intval(data[0][2]) == 0 || (intval(data[0][1]) / intval(data[0][2])) < 0.95) {
                        YOUTUBEPLAYER.seekTo(data[0][1], true);
                    }
                }
            }
        }
        YOUTUBEPLAYER.addEventListener('onReady', function(event) {
            loadVideoPosition(key, callback);
            POSITIONS_RATE = YOUTUBEPLAYER.getPlaybackRate();
        });
        var last_seek = Date.now();
        node.on('onYouTubeSeek', function(event, data) {
            if (Date.now() > last_seek + (5 * 1000)) {
                if (typeof duration != 'undefined') {
                    duration = intval(duration);
                } else {
                    duration = data.duration;
                }
                saveVideoPosition(key, data.seconds, duration, video_id, playlist_id);
                last_seek = Date.now();
            }
        });
        var last_pos = Date.now();
        node.on('onYouTubeTimeUpdate', function(event, data) {
            if (Date.now() > last_pos + (15 * 1000)) {
                if (typeof duration != 'undefined') {
                    duration = intval(duration);
                } else {
                    duration = data.duration;
                }
                saveVideoPosition(key, data.seconds, duration, video_id, playlist_id);
                last_pos = Date.now();
            }
        });
    }
}
function loadNextAutoplay() {
    if ($('.video-related-autoplay').hasClass('autoplay-on')) {
        var curr = $('.video-related .video.current').first().get(0);
        if (curr) {
            var next = $(curr).parent().next().find('a').attr('href');
        } else {
            var next = $('.video-related .video').first().find('a').attr('href');
        }
        if (next) {
            $('.video-autoplay').fadeIn();
            $('.video-related-autoplay').removeClass('autoplay-on').removeClass('autoplay-off').addClass('autoplay-changing');
            setTimeout(function() {
                if ($('.video-related-autoplay').hasClass('autoplay-changing')) {
                    window.location = next;
                }
            }, 5000);
        }
    }
}
function loadVideoPlayerPositions(node, callback) {
    var key = node.data('position-key');
    if (!key)
        return;
    if (node.attr('src').match(/vimeo/i)) {
        $.loadVimeoIframeApi(function() {
            loadVimeoPlayerPositions(node, callback)
        });
    } else if (node.attr('src').match(/youtu\.?be/i)) {
        $.loadYouTubeIframeApi(function() {
            loadYouTubePlayerPositions(node, callback)
        });
    } else {}
}
function saveVideoPosition(key, seconds, duration, video_id, playlist_id) {
    if (!POSITIONS_UNSTR)
        return;
    if (!key)
        return;
    seconds = intval(seconds);
    if (!seconds || seconds <= 0)
        return;
    duration = intval(duration);
    if (!duration || duration <= 0)
        duration = 0;
    var params = {
        seconds: seconds,
        duration: duration,
        video_id: video_id,
        playlist_id: playlist_id,
        rate: POSITIONS_RATE
    }
    Object.assign(params, query_string());
    $.post("/videos/pos/" + POSITIONS_UNSTR + "/" + key, params).done(function(data) {
        updateVideoProgress(key, seconds, duration);
    });
}
function loadCurrentPlayerPosition(callback) {
    var node = $('.video-box > iframe');
    if (!node || node.length == 0)
        return;
    loadVideoPlayerPositions(node, callback);
}
function loadCurrentVideoPositions(nodes, callback) {
    if (typeof nodes == 'undefined' || !nodes) {
        nodes = document;
    }
    var videos = [];
    $(nodes).find(".video-position[data-position-key!='']").each(function() {
        videos.push($(this).data('position-key'));
    });
    loadVideoPosition(videos, callback);
}
function loadVideoPosition(videos, callback) {
    if (!POSITIONS_UNSTR)
        return;
    if (!videos)
        return;
    if (typeof videos != 'object') {
        videos = [videos];
    }
    videos = Object.values(videos);
    if (videos.length == 0)
        return;
    var d = new Date();
    var cache = d.getUTCFullYear().toString() + d.getUTCMonth().toString() + d.getUTCDate().toString();
    cache += d.getUTCHours().toString();
    cache += (5 * Math.round(d.getUTCMinutes() / 5)).toString();
    for (var i = 0; i < Math.ceil(videos.length / 20); i++) {
        var chunk = videos.slice(i * 20, (i + 1) * 20);
        $.get("/videos/pos/" + POSITIONS_UNSTR + "/" + chunk.join(',') + '?_=' + cache, function(data) {
            if (data && data.length > 0) {
                data.forEach(function(video) {
                    updateVideoProgress(video[0], video[1], video[2]);
                });
            }
            if (typeof callback == 'function') {
                callback(data);
            }
        }, 'json');
    }
}
function updateVideoProgress(key, seconds, duration) {
    $(".video-position[data-position-key='" + key + "']").each(function() {
        if (!duration || duration <= 0) {
            duration = intval($(this).data('position-duration'));
        }
        if (duration && duration > 0) {
            var perc = (2.5 * Math.round(((seconds > duration ? duration : seconds) / duration * 100) / 2.5));
            $(this).removeClass('video-progress-zero');
            if (perc < 100) {
                $(this).addClass('video-progress-partial');
            } else {
                $(this).removeClass('video-progress-partial').addClass('video-progress-total');
            }
            $(this).find('.video-progress').width(perc.toString() + '%');
        } else {
            $(this).addClass('video-progress-zero');
        }
    });
}
$(document).on('click', '.video-zoomable', function(e) {
    e.preventDefault();
    var width = window.innerWidth - 80;
    var height = width * (9 / 16);
    if (height > window.innerHeight - 80) {
        width = width * (window.innerHeight - 80) / height;
        height = window.innerHeight - 80;
    }
    var pos = $(this).closest('.video-position');
    var id = Date.now().toString();
    var position_key = '';
    var position_video_id = '';
    var position_playlist_id = '';
    var cb = null;
    if (pos.length > 0) {
        position_key = pos.data('position-key');
        position_video_id = pos.data('position-video-id');
        position_playlist_id = pos.data('position-playlist-id');
        cb = function() {
            loadVideoPlayerPositions($('#' + id).first());
        }
        ;
    }
    $.colorbox({
        html: '<iframe id="' + id + '" frameborder="0" src="' + $(this).attr('href') + '" class="cboxIframe" data-position-key="' + position_key + '" data-position-video-id="' + position_video_id + '" data-position-playlist-id="' + position_playlist_id + '" allow="autoplay; fullscreen; encrypted-media" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>',
        width: width,
        height: height,
        opacity: 0.85,
        onComplete: cb
    });
    return false;
});
$(document).on('click', '.video-embed a:not(.video-zoomable)', function(e) {
    e.preventDefault();
    var embed = $(this).closest('.video-embed');
    var pos = $(this).closest('.video-position');
    var id = Date.now().toString();
    var position_key = '';
    var position_video_id = '';
    var position_playlist_id = '';
    if (pos.length > 0) {
        position_key = pos.data('position-key');
        position_video_id = pos.data('position-video-id');
        position_playlist_id = pos.data('position-playlist-id');
    }
    embed.replaceWith('<iframe id="' + id + '" width="' + embed.width() + '" height="' + embed.height() + '" src="' + $(this).attr('href') + '" data-position-key="' + position_key + '" data-position-video-id="' + position_video_id + '" data-position-playlist-id="' + position_playlist_id + '" allow="autoplay; encrypted-media" frameborder="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>');
    if (position_key != '') {
        loadVideoPlayerPositions($('#' + id).first());
    }
    return false;
});
VIMEOIFRAME_API = 0;
VIMEOIFRAME_CALLBACKS = [];
function onVimeoIframeAPIReady() {
    VIMEOIFRAME_API = 2;
    VIMEOIFRAME_CALLBACKS.forEach(function(callback) {
        callback();
    });
}
$.loadVimeoIframeApi = function(callback) {
    if (VIMEOIFRAME_API == 2) {
        callback();
    } else if (VIMEOIFRAME_API == 1) {
        VIMEOIFRAME_CALLBACKS.push(callback);
    } else {
        VIMEOIFRAME_API = 1;
        VIMEOIFRAME_CALLBACKS.push(callback);
        $.ajax({
            url: 'https://player.vimeo.com/api/player.js',
            dataType: 'script',
            success: onVimeoIframeAPIReady,
            async: true
        });
    }
}
YOUTUBEIFRAME_API = 0;
YOUTUBEIFRAME_CALLBACKS = [];
function onYouTubeIframeAPIReady() {
    YOUTUBEIFRAME_API = 2;
    YOUTUBEIFRAME_CALLBACKS.forEach(function(callback) {
        callback();
    });
}
$.loadYouTubeIframeApi = function(callback) {
    if (YOUTUBEIFRAME_API == 2) {
        callback();
    } else if (YOUTUBEIFRAME_API == 1) {
        YOUTUBEIFRAME_CALLBACKS.push(callback);
    } else {
        YOUTUBEIFRAME_API = 1;
        YOUTUBEIFRAME_CALLBACKS.push(callback);
        $.ajax({
            url: 'https://www.youtube.com/iframe_api',
            dataType: 'script',
            async: true
        });
    }
}
$(window).on('paginated', function(e, items) {
    loadCurrentVideoPositions(items);
});
$(document).ready(function() {
    if (!POSITIONS_UNSTR) {
        $.get("/logado", function(data) {
            if (data.un_str) {
                POSITIONS_UNSTR = data.un_str;
            } else if (data.anonymous) {
                POSITIONS_UNSTR = data.anonymous;
            }
            if (data.autoplay) {
                $('.video-related-autoplay').addClass('autoplay-on').show();
            } else {
                $('.video-related-autoplay').addClass('autoplay-off').show();
            }
            loadCurrentPlayerPosition();
            loadCurrentVideoPositions();
        }, 'json');
    } else {
        $('.video-related-autoplay').addClass('autoplay-on').show();
    }
    $('.video-related-autoplay').on('click', 'a', function(e) {
        e.preventDefault();
        var autoplay = $(this).closest('.video-related-autoplay');
        var off = autoplay.hasClass('autoplay-off');
        $('.video-related-autoplay').removeClass('autoplay-changing');
        if (off) {
            $('.video-related-autoplay').removeClass('autoplay-off').addClass('autoplay-on');
        } else {
            $('.video-related-autoplay').removeClass('autoplay-on').addClass('autoplay-off');
        }
        $.post("/videos/autoplay", {
            autoplay: (off ? 1 : 0)
        });
        return false;
    });
});
;window.dataLayer = window.dataLayer || [];
function gtag() {
    var data = {
        'event': 'gtag',
        'eventMeta': {}
    }
    if (typeof arguments[1] !== 'undefined') {
        data['eventAction'] = arguments[1];
    }
    if (typeof arguments[2] !== 'undefined' && typeof arguments[2] === 'object') {
        for (const [key,value] of Object.entries(arguments[2])) {
            if (key == 'event_category') {
                data['eventCategory'] = value;
            } else if (key == 'event_label') {
                data['eventLabel'] = value;
            } else if (key == 'value') {
                data['eventValue'] = value;
            } else if (key == 'non_interaction') {
                data['non_interaction'] = value;
            } else if (key == 'edu_pid') {
                data['edu_pid'] = value;
            } else if (key == 'edu_pagetype') {
                data['edu_pagetype'] = value;
            } else {
                data['eventMeta'][key] = value;
            }
        }
    }
    if (typeof window.dataLayerProxy !== 'undefined') {
        window.dataLayerProxy.push(data);
    } else {
        window.dataLayer.push(data);
    }
}
var is_mobile = false;
var is_tablet = false;
var is_desktop = false;
var is_touch = Modernizr.touchevents;
var SCROLLING = false;
function checkSize() {
    if (Modernizr.mq('(max-width: 767px)') && !is_mobile) {
        is_mobile = true;
        is_tablet = false;
        is_desktop = false;
        $(window).trigger('resized', ['mobile']);
    } else if (Modernizr.mq('(min-width: 768px) and (max-width: 959px)') && !is_tablet) {
        is_mobile = false;
        is_tablet = true;
        is_desktop = false;
        $(window).trigger('resized', ['tablet']);
    } else if (Modernizr.mq('(min-width: 960px)') && !is_desktop) {
        is_mobile = false;
        is_tablet = false;
        is_desktop = true;
        $(window).trigger('resized', ['desktop']);
    }
}
checkSize();
function intval(str) {
    return isNaN(parseInt(str, 10)) ? 0 : parseInt(str, 10);
}
$.extend($.expr[':'], {
    external: function(a, i, m) {
        if (!a.href) {
            return false;
        }
        return a.hostname && a.hostname.indexOf(window.location.hostname) == -1;
    }
});
$.extend($.expr[':'], {
    path: function(a, i, m) {
        if (!a.href) {
            return false;
        }
        var s = window.location.href.split('/');
        while (s.length > 0) {
            if (a.href === s.join('/'))
                return true;
            s.pop();
        }
        return false;
    }
});
$.extend($.expr[':'], {
    current: function(a, i, m) {
        if (!a.href) {
            return false;
        }
        return a.href === window.location.href;
    }
});
$.fn.flash = function(duration) {
    duration = duration || 1000;
    return $(this).fadeOut(duration).fadeIn(duration, function() {
        $(this).flash(duration)
    });
}
$.loadScript = function(url, callback) {
    $.ajax({
        url: url,
        dataType: 'script',
        success: callback,
        async: true
    });
}
function delay_redirect(to) {}
function delayed_redirect(url) {
    setTimeout(function() {
        window.location = url;
    }, 3000);
    return false;
}
function randomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
}
function scrollToElement(obj, box, callback, offset, closer, speed) {
    if (!obj || !box)
        return;
    if (typeof offset == 'undefined') {
        offset = 120;
    }
    if (typeof closer == 'undefined') {
        closer = 0;
    }
    if (typeof speed == 'undefined') {
        speed = 600;
    }
    var offset_top = $(obj).offset().top - $(obj).offsetParent().offset().top + $(obj).offsetParent().scrollTop() - offset;
    if ((closer == 0 || offset_top < 0 || offset_top > ($(box).height() / (closer > 0 ? closer : 1)))) {
        SCROLLING = true;
        $(obj).animatescroll({
            element: box,
            padding: offset,
            scrollSpeed: speed,
            onScrollEnd: function() {
                SCROLLING = false;
                if (typeof callback === "function") {
                    callback($(obj).get(0));
                }
            }
        });
    } else if (typeof callback === "function") {
        callback($(obj).get(0));
    }
    return true;
}
function scrollToSelector(selector, container, callback, offset, closer, speed) {
    if (SCROLLING)
        return;
    var box = $(container);
    if (box.length == 0) {
        return false;
    }
    var obj = $(container).find(selector);
    if (obj.length == 0) {
        return false;
    }
    box = box.first().get(0);
    obj = obj.first().get(0);
    return scrollToElement(obj, box, function(obj) {
        if (typeof callback === "function") {
            callback(obj, container, selector);
        }
    }, offset, closer, speed);
}
function scrollToTop(container, callback, offset, speed) {
    if (SCROLLING)
        return;
    var box = $(container).get(0);
    if (!box)
        return false;
    if (typeof offset == 'undefined') {
        offset = 0;
    }
    if (typeof speed == 'undefined') {
        speed = 600;
    }
    if (speed > 0) {
        SCROLLING = true;
        $(box).animate({
            scrollTop: 0 - offset
        }, speed, function() {
            SCROLLING = false;
            if (typeof callback === "function") {
                callback(container);
            }
        });
    } else {
        box.scrollTop = 0 - offset;
        if (typeof callback === "function") {
            callback(container);
        }
    }
    return true;
}
function scrollToBottom(container, callback, offset, speed) {
    if (SCROLLING)
        return;
    var box = $(container).get(0);
    if (!box)
        return;
    if (typeof offset == 'undefined') {
        offset = 0;
    }
    if (typeof speed == 'undefined') {
        speed = 600;
    }
    if (speed > 0) {
        SCROLLING = true;
        $(box).animate({
            scrollTop: box.scrollHeight - box.clientHeight - offset
        }, speed, function() {
            SCROLLING = false;
            if (offset == 0 && Math.abs(Math.round(box.scrollHeight - box.scrollTop) - Math.round(box.clientHeight)) > 2) {
                scrollToBottom(container, callback, offset, speed / 2);
            } else {
                if (typeof callback === "function") {
                    callback(container);
                }
            }
        });
    } else {
        box.scrollTop = box.scrollHeight - box.clientHeight - offset;
        if (typeof callback === "function") {
            callback(container);
        }
    }
    return true;
}
function updateTableOfContents() {
    if ($('#toc').length > 0) {
        var headers = new Array();
        var $toc = $('#toc');
        var $ul = $toc.find('ul');
        $ul.empty();
        $('.content h2').not('.hidetoc').each(function() {
            headers.push($(this));
        });
        if (headers.length > 0) {
            $.each(headers, function(k, $h) {
                if ($h.text().trim().length > 0) {
                    $h.attr('id', 'toc-' + k.toString());
                    if ($h.is(':visible')) {
                        $ul.append('<li><a href="#toc-' + k.toString() + '" class="scroll" data-top="10">' + $h.text() + '</a></li>');
                    }
                }
            });
        }
        if ($ul.children('li').length > 2) {
            $toc.fadeIn('slow');
        } else {
            $toc.hide();
        }
    }
}
$(document).on('click', 'a.video-zoomable', function() {
    if ($(this).data('video-label')) {}
    if ($(this).data('video-source')) {}
});
$(document).on('click', '.video-embed a:not(.video-zoomable)', function() {
    if ($(this).data('video-label')) {}
    if ($(this).data('video-source')) {}
});
$(document).on('click', '.video-download a', function() {
    if ($(this).data('video-label')) {
        return delay_redirect(this.href);
    }
});
$(document).on('click', '#jp_container .track', function() {
    var label = $(this).data('track-label');
    if (label === undefined) {
        label = this.href.replace(/.*\/|\.[^.]*$/g, '');
    }
});
$(document).on('click', '.track-click', function() {
    var category = $(this).data('track-category');
    var action = $(this).data('track-action');
    var label = $(this).data('track-label');
    if (category === undefined) {
        return true;
    }
    if (action === undefined) {
        action = 'Click';
    }
    if (label === undefined) {
        label = this.href.replace(/.*\/|\.[^.]*$/g, '');
    }
    gtag('event', action, {
        'event_category': category,
        'event_label': label
    });
    return delay_redirect(this.href);
});
$(document).on('click', '.chat-click', function() {
    if (olark) {
        olark('api.box.expand');
        return false;
    }
});
$(document).on('click', 'button', function() {
    if ($(this).data('redirect')) {
        $(this).prop('disabled', true);
        window.location.href = $(this).data('redirect');
        return false;
    }
});
$(document).on('click', 'a.scroll', function(e) {
    e.preventDefault();
    var container = $(this).data('container') || 'html,body';
    var offset = (typeof $(this).data('top') != 'undefined' ? parseInt($(this).data('top'), 10) : 120);
    scrollToSelector($(this).attr('href'), container, null, offset, 0);
    return false;
});
$(document).on('click', 'a.scrolltop', function(e) {
    e.preventDefault();
    scrollToTop('html,body');
    return false;
});
$('body').on('click', '.zoomable', function(e) {
    e.preventDefault();
    $.colorbox({
        href: $(this).attr('href'),
        photo: true,
        maxWidth: '97%',
        maxHeight: '95%',
        opacity: 0.85,
        scrolling: false,
        imgError: 'Falha ao carregar a foto.'
    });
    return false;
});
$('body').on('click', 'a.colorboxed', function(e) {
    e.preventDefault();
    var href = $(this).attr('href');
    var opts = {
        photo: false,
        fixed: true,
        initialWidth: '60%',
        initialHeight: '60%',
        maxWidth: '90%',
        maxHeight: '90%',
        overlayClose: true,
        escKey: true,
        opacity: 0.85,
        scrolling: true,
        closeButton: true
    };
    var width = $(this).data('width') || '60%';
    var height = $(this).data('height') || false;
    if (width) {
        opts['width'] = width;
    }
    if (height) {
        opts['height'] = height;
    }
    if (href.startsWith('#')) {
        opts['html'] = $(href).html();
    } else {
        opts['href'] = href;
    }
    $.colorbox(opts);
    return false;
});
$(document).on('change', '.video-filter', function(e) {
    e.preventDefault();
    var url = $(this).val();
    if (url != '') {
        $(this).val('');
        window.location = url;
    } else {
        window.location = ___base_url___ + '/videos';
    }
    return false;
});
$(document).on('click', 'img.cboxPhoto', function(e) {
    e.preventDefault();
    $.colorbox.close();
    return false;
});
$(document).on('click', '.zoomable-iframe', function(e) {
    e.preventDefault();
    var width = window.innerWidth - 80;
    var height = width * (9 / 16);
    if (height > window.innerHeight - 80) {
        width = width * (window.innerHeight - 80) / height;
        height = window.innerHeight - 80;
    }
    $.colorbox({
        href: $(this).attr('href'),
        iframe: true,
        width: width,
        height: height,
        opacity: 0.85
    });
    return false;
});
$(document).on('click', '.toggle-action', function(e) {
    e.preventDefault();
    var title = $(this).data('pt-title');
    if (title) {
        if (title.match(/mostrar/i)) {
            title = title.replace(/mostrar/i, 'Ocultar');
        } else if (title.match(/ocultar/i)) {
            title = title.replace(/ocultar/i, 'Mostrar');
        }
        $(this).protipSet({
            title: title
        });
    }
    $(this).siblings('.toggle-collapsed, .toggle-collapsed-block, .toggle-expanded, .toggle-expanded-block').toggle();
    $(this).find('.toggle-collapsed, .toggle-collapsed-block, .toggle-expanded, .toggle-expanded-block').toggle();
    $(this).parents('.toggle-base').nextUntil('.toggle-base').toggle();
    return false;
});
function h(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
function j(str) {
    return String(str).replace(/'/g, '\\\'');
}
function nl2br(str, is_xhtml) {
    var breakTag = (is_xhtml) ? '<br ' + '/>' : '<br>';
    return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2');
}
function today(somedate) {
    const today = new Date();
    return somedate.getDate() == today.getDate() && somedate.getMonth() == today.getMonth() && somedate.getFullYear() == today.getFullYear();
}
function yesterday(somedate) {
    const yesterday = new Date(Date.now() - 1 * 24 * 60 * 60000);
    return somedate.getDate() == yesterday.getDate() && somedate.getMonth() == yesterday.getMonth() && somedate.getFullYear() == yesterday.getFullYear();
}
function same_day(one, two) {
    return one.getDate() == two.getDate() && one.getMonth() == two.getMonth() && one.getFullYear() == two.getFullYear();
}
function dropbox_file_icon(extension) {
    var icon = 'page_white';
    if (['mp4', 'mov', 'avi', 'mkv', 'mpg', 'm4v'].includes(extension)) {
        icon += '_film';
    } else if (['m4a', 'mp3'].includes(extension)) {
        icon += '_sound';
    } else if (['xls', 'xlsx'].includes(extension)) {
        icon += '_excel';
    } else if (['doc', 'docx'].includes(extension)) {
        icon += '_word';
    } else if (['pdf'].includes(extension)) {
        icon += '_acrobat';
    } else if (['txt'].includes(extension)) {
        icon += '_text';
    } else if (['ppt', 'pptx'].includes(extension)) {
        icon += '_powerpoint';
    } else if (['jpg', 'png', 'jpeg', 'tiff', 'gif'].includes(extension)) {
        icon += '_picture';
    }
    return icon;
}
$(document).ready(function() {
    updateTableOfContents();
    $(window).on('resize', checkSize);
    if (window.opener) {
        $('body').addClass('popuped');
    } else {
        $('body').removeClass('popuped');
    }
    try {
        if (window.self !== window.top) {
            $('body').addClass('iframe');
        } else {
            $('body').removeClass('iframe');
        }
    } catch (e) {
        $('body').addClass('iframe');
    }
    jQuery.timeago.settings.cutoff = 5 * 60 * 60;
    $("time.timeago").timeago();
    if (/MSIE|Trident/.test(window.navigator.userAgent)) {
        $('.msie').show();
    }
    $('.print-action').on('click', function(ev) {
        ev.preventDefault();
        window.print();
        return false;
    });
    $('.reload-action').on('click', function(ev) {
        ev.preventDefault();
        window.location.reload();
        return false;
    });
    $('a:path').parent().addClass('active');
    $('a:current').parent().addClass('current');
    if (document.location.hostname.indexOf('biblos360.com.br') == 0) {
        $('a:external').not('a:has(img)').not('.noext').addClass('ext');
    }
    $('.faq-question').each(function() {
        var question = $(this).html();
        $(this).nextUntil('.faq-question, .faq-end, h1, h2, h3, h4, h5, div, hr, section').addClass('faq-answer').hide();
        $(this).html('<a href="#" class="faq-question-link"><div class="faq-question-icon"><i class="fas fa-chevron-right"></i><i class="fas fa-chevron-down"></i></div><div class="faq-question-block">' + question + '</div></a>');
    });
    $(document).on('click', '.faq-question-link', function(e) {
        e.preventDefault();
        $(this).toggleClass('faq-expanded');
        $(this).parent().nextUntil('.faq-question, .faq-end, h1, h2, h3, h4, h5, div, hr, section').toggle(100);
        return false;
    });
    $('.flashing').each(function() {
        $(this).flash($(this).data('speed'));
    });
    $('.filter').on('click', function(ev) {
        ev.preventDefault();
        var filter = $(this).data('filter');
        var match = $(this).data('match');
        var focus = $(this).data('focus');
        $(this).addClass('selected').siblings('.filter,.filter-style').removeClass('selected');
        var els = $(this).parents('.filter-root').find(match);
        var first;
        els.hide().css('opacity', 0);
        els.each(function() {
            if (!filter || $(this).is(filter)) {
                if (!first) {
                    if (focus) {
                        first = $(this).find(focus).get(0);
                    } else {
                        first = $(this).get(0);
                    }
                }
                $(this).show().animate({
                    opacity: 1.0
                }, 500);
            } else {
                $(this).hide().css('opacity', 0);
            }
        });
        if (first) {
            first.focus();
        }
        return false;
    });
    $('body').on('click', '.filter-show', function(ev) {
        ev.preventDefault();
        $(this).hide();
        $(this).parents('.filter-root').find('.filter,.filter-style,.filter-hide,.filter-extra').not('.filter-show').show().first().focus();
        return false;
    });
    $('body').on('click', '.filter-hide', function(ev) {
        ev.preventDefault();
        $(this).hide();
        $(this).parents('.filter-root').find('.filter-show').show().focus();
        return false;
    });
    $('form').not(".chat-join-form").not(".chat-message-form").not('#donation').submit(function() {
        return $('input[type=submit]', this).prop('disabled', true);
    });
    var clipboard = new Clipboard('.clipboard');
    clipboard.on('success', function(e) {
        var done = e.trigger.dataset.clipboardDone || '.clipboard-done';
        var error = e.trigger.dataset.clipboardError || '.clipboard-error';
        $(done).show();
        $(error).hide();
        return false;
    });
    clipboard.on('error', function(e) {
        var done = e.trigger.dataset.clipboardDone || '.clipboard-done';
        var error = e.trigger.dataset.clipboardError || '.clipboard-error';
        $(done).hide();
        $(error).show();
    });
    $('.readmore').readmore({
        collapsedHeight: 150,
        moreLink: '<a href="#" class="readmore-more">Leia mais...</a>',
        lessLink: '<a href="#" class="readmore-less"></a>'
    });
    $('.readmore-small').readmore({
        collapsedHeight: 75,
        moreLink: '<a href="#" class="readmore-small-more">Leia mais...</a>',
        lessLink: '<a href="#" class="readmore-small-less"></a>'
    });
    $('.more-toggle').each(function(obj) {
        $(this).data('more', $(this).html());
        $(this).html('<a href="#">mais...</a>');
    });
    $(document).on('click', '.more-toggle a', function(e) {
        e.preventDefault();
        $(this).parent().html($(this).parent().data('more'));
        return false;
    });
    if (typeof delayed_redirect_url !== 'undefined' && delayed_redirect_url !== undefined && delayed_redirect_url) {
        delayed_redirect(delayed_redirect_url);
    }
    var video_slick = {
        infinite: false,
        speed: 600,
        slidesToShow: 4,
        slidesToScroll: 4,
        prevArrow: '<button type="button" class="slick-prev"><i class="fas fa-chevron-left"></i></button>',
        nextArrow: '<button type="button" class="slick-next"><i class="fas fa-chevron-right"></i></button>',
        slide: '.video-item',
        waitForAnimate: false,
        adaptiveHeight: true,
        responsive: [{
            breakpoint: 768,
            settings: "unslick"
        }]
    };
    var playlist_slick = {
        infinite: false,
        speed: 600,
        slidesToShow: 6,
        slidesToScroll: 6,
        prevArrow: '<button type="button" class="slick-prev"><i class="fas fa-chevron-left"></i></button>',
        nextArrow: '<button type="button" class="slick-next"><i class="fas fa-chevron-right"></i></button>',
        slide: '.playlist-item',
        waitForAnimate: false,
        adaptiveHeight: true,
        responsive: [{
            breakpoint: 768,
            settings: "unslick"
        }]
    };
    var setupSlick = function() {
        $('.video-slick:not(.slick-initialized)').slick(video_slick);
        $('.playlist-slick:not(.slick-initialized)').slick(playlist_slick);
    };
    setupSlick();
    scrollRelated();
    $(window).on('resized', function() {
        if (is_tablet || is_desktop) {
            setupSlick();
        }
        scrollRelated();
    });
    $(window).on('paginated', function() {
        if (is_tablet || is_desktop) {
            setupSlick();
        }
    });
    function scrollRelated() {
        $('.video-related.keep-current').each(function() {
            $(this).scrollTop(0);
            var curr = $(this).find('.video.current');
            if (curr.length > 0) {
                $(this).scrollTop(curr.position().top - 60);
            }
        });
    }
    function swap_thumb(thumb, url) {
        if (url) {
            var img = new Image();
            img.onload = function() {
                $(thumb).css('background-image', 'url(' + this.src + ')');
            }
            img.src = url;
        }
    }
});
window.log = function() {
    log.history = log.history || [];
    log.history.push(arguments);
    arguments.callee = arguments.callee.caller;
    if (this.console)
        console.log(Array.prototype.slice.call(arguments));
}
;
(function(b) {
    function c() {}
    for (var d = "assert,count,debug,dir,dirxml,error,exception,group,groupCollapsed,groupEnd,info,log,markTimeline,profile,profileEnd,time,timeEnd,trace,warn".split(","), a; a = d.pop(); )
        b[a] = b[a] || c
}
)(window.console = window.console || {});
