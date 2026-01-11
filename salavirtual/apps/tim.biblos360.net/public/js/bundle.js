// ARQUIVO BLOQUEADO PARA EDIÇÃO

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
  
(Content truncated due to size limit. Use page ranges or line ranges to read remaining content)