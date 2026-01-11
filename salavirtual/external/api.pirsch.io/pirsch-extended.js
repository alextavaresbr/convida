(() => {
    function D(t) {
        let i = document.querySelector(t);
        if (!i) throw `Pirsch script ${t} tag not found!`;
        return i
    }

    function s(t, i) {
        let e = "";
        return t.length > 0 && (i < t.length ? e = t[i] : e = t[t.length - 1]), e
    }

    function O(t) {
        let i = {};
        for (let e of t.attributes) e.name.startsWith("data-tag-") ? i[e.name.substring(9).replaceAll("-", " ")] = e.value || "1" : e.name.startsWith("data-tag") && e.value && e.value.split(",").forEach(n => {
            n = n.trim().replaceAll("-", " "), n && (i[n] = "1")
        });
        return i
    }

    function Q(t) {
        return localStorage.getItem("disable_pirsch") || nt(t) || !rt(t) || at(t)
    }

    function L(t) {
        return t ? t = location.href.replace(location.hostname, t) : t = location.href, t
    }

    function R(t, i, e) {
        t || (t = location.href), i || (i = ""), e || (e = "");
        let n = new URL(t);
        return n.pathname = i + n.pathname + e, n.toString()
    }

    function T(t, i) {
        let e = document.title;
        return t || (t = ""), i || (i = ""), t + e + i
    }

    function I(t) {
        let i = document.referrer;
        return t && (i = i.replace(location.hostname, t)), i
    }

    function nt(t) {
        return !t.hasAttribute("data-dev") && (/^localhost(.*)$|^127(\.[0-9]{1,3}){3}$/is.test(location.hostname) || location.protocol === "file:") ? (console.info("Pirsch is ignored on localhost. Add the data-dev attribute to enable it."), !0) : !1
    }

    function rt(t) {
        try {
            let i = t.getAttribute("data-include"),
                e = i ? i.split(",") : [];
            if (e.length) {
                let n = !1;
                for (let o = 0; o < e.length; o++)
                    if (new RegExp(e[o]).test(location.pathname)) {
                        n = !0;
                        break
                    } if (!n) return !1
            }
        } catch (i) {
            console.error(i)
        }
        return !0
    }

    function at(t) {
        try {
            let i = t.getAttribute("data-exclude"),
                e = i ? i.split(",") : [];
            for (let n = 0; n < e.length; n++)
                if (new RegExp(e[n]).test(location.pathname)) return !0
        } catch (i) {
            console.error(i)
        }
        return !1
    }

    function $(t) {
        if (history.pushState && !t.disableHistory) {
            let i = history.pushState;
            history.pushState = function(e, n, o) {
                i.apply(this, [e, n, o]), N(t)
            }, window.addEventListener("popstate", () => N(t))
        }
        document.body ? N(t) : window.addEventListener("DOMContentLoaded", () => N(t))
    }

    function N(t) {
        let {
            script: i,
            domains: e,
            rewrite: n,
            pathPrefix: o,
            pathSuffix: u,
            titlePrefix: l,
            titleSuffix: f,
            identificationCode: c,
            endpoint: m,
            disableQueryParams: g,
            disableReferrer: x,
            disableResolution: P
        } = t;
        F({
            script: i,
            hostname: n,
            pathPrefix: e.length ? "" : s(o, 0),
            pathSuffix: e.length ? "" : s(u, 0),
            titlePrefix: e.length ? "" : s(l, 0),
            titleSuffix: e.length ? "" : s(f, 0),
            identificationCode: c,
            endpoint: m,
            disableQueryParams: g,
            disableReferrer: x,
            disableResolution: P
        });
        for (let d = 0; d < e.length; d++) {
            let [v, w] = e[d].split(":");
            F({
                script: i,
                hostname: v,
                pathPrefix: s(o, d),
                pathSuffix: s(u, d),
                titlePrefix: s(l, d),
                titleSuffix: s(f, d),
                identificationCode: w,
                endpoint: m,
                disableQueryParams: g,
                disableReferrer: x,
                disableResolution: P
            })
        }
    }

    function F(t) {
        let {
            script: i,
            hostname: e,
            pathPrefix: n,
            pathSuffix: o,
            titlePrefix: u,
            titleSuffix: l,
            identificationCode: f,
            endpoint: c,
            disableQueryParams: m,
            disableReferrer: g,
            disableResolution: x
        } = t, P = I(e);
        e = L(e), e = R(e, n, o), m && (e = e.includes("?") ? e.split("?")[0] : e);
        let d = O(i),
            v = c + "?nc=" + new Date().getTime() + "&code=" + f + "&url=" + encodeURIComponent(e.substring(0, 1800)) + "&t=" + encodeURIComponent(T(u, l)) + "&ref=" + (g ? "" : encodeURIComponent(P)) + "&w=" + (x ? "" : screen.width) + "&h=" + (x ? "" : screen.height) + (Object.keys(d).length ? "&" + Object.entries(d).map(([A, b]) => `tag_${A.replaceAll("-"," ")}=${b||1}`).join("&") : ""),
            w = new XMLHttpRequest;
        w.open("GET", v), w.send()
    }

    function M() {
        window.pirsch = function(t, i) {
            return console.log(`Pirsch event: ${t}${i?" "+JSON.stringify(i):""}`), Promise.resolve(null)
        }
    }

    function V(t) {
        let {
            script: i,
            domains: e,
            rewrite: n,
            pathPrefix: o,
            pathSuffix: u,
            titlePrefix: l,
            titleSuffix: f,
            identificationCode: c,
            endpoint: m,
            disableQueryParams: g,
            disableReferrer: x,
            disableResolution: P
        } = t;
        window.pirsch = function(d, v) {
            return typeof d != "string" || !d ? Promise.reject("The event name for Pirsch is invalid (must be a non-empty string)! Usage: pirsch('event name', {duration: 42, meta: {key: 'value'}})") : new Promise((w, A) => {
                let b = v && v.meta ? v.meta : {};
                for (let h in b) b.hasOwnProperty(h) && (b[h] = String(b[h]));
                j({
                    script: i,
                    hostname: n,
                    pathPrefix: e.length ? "" : s(o, 0),
                    pathSuffix: e.length ? "" : s(u, 0),
                    titlePrefix: e.length ? "" : s(l, 0),
                    titleSuffix: e.length ? "" : s(f, 0),
                    identificationCode: c,
                    endpoint: m,
                    disableQueryParams: g,
                    disableReferrer: x,
                    disableResolution: P,
                    name: d,
                    options: v,
                    meta: b,
                    non_interactive: t.non_interactive,
                    resolve: w,
                    reject: A
                });
                for (let h = 0; h < e.length; h++) {
                    let [y, C] = e[h].split(":");
                    j({
                        script: i,
                        hostname: y,
                        pathPrefix: s(o, h),
                        pathSuffix: s(u, h),
                        titlePrefix: s(l, h),
                        titleSuffix: s(f, h),
                        identificationCode: C,
                        endpoint: m,
                        disableQueryParams: g,
                        disableReferrer: x,
                        disableResolution: P,
                        name: d,
                        options: v,
                        meta: b,
                        non_interactive: t.non_interactive,
                        resolve: w,
                        reject: A
                    })
                }
            })
        }
    }

    function j(t) {
        let {
            script: i,
            hostname: e,
            pathPrefix: n,
            pathSuffix: o,
            titlePrefix: u,
            titleSuffix: l,
            identificationCode: f,
            endpoint: c,
            disableQueryParams: m,
            disableReferrer: g,
            disableResolution: x,
            name: P,
            options: d,
            meta: v,
            non_interactive: w,
            resolve: A,
            reject: b
        } = t, h = I(e), y = O(i);
        e = L(e), e = R(e, n, o), m && (e = e.includes("?") ? e.split("?")[0] : e), navigator.sendBeacon(c, JSON.stringify({
            identification_code: f,
            url: e.substring(0, 1800),
            title: T(u, l),
            referrer: g ? "" : encodeURIComponent(h),
            screen_width: x ? 0 : screen.width,
            screen_height: x ? 0 : screen.height,
            tags: y,
            event_name: P,
            event_duration: d && d.duration && typeof d.duration == "number" ? d.duration : 0,
            event_meta: v,
            non_interactive: w
        })) ? A() : b("error queuing event request")
    }

    function B(t) {
        let {
            script: i,
            domains: e,
            rewrite: n,
            pathPrefix: o,
            pathSuffix: u,
            identificationCode: l,
            endpoint: f,
            disableQueryParams: c
        } = t, m = Number.parseInt(i.getAttribute("data-interval-ms"), 10) || 6e4, g = setInterval(() => {
            ot({
                domains: e,
                rewrite: n,
                pathPrefix: o,
                pathSuffix: u,
                identificationCode: l,
                endpoint: f,
                disableQueryParams: c
            })
        }, m);
        window.pirschClearSession = () => {
            clearInterval(g)
        }
    }

    function ot(t) {
        let {
            domains: i,
            rewrite: e,
            pathPrefix: n,
            pathSuffix: o,
            identificationCode: u,
            endpoint: l,
            disableQueryParams: f
        } = t;
        z({
            hostname: e,
            pathPrefix: i.length ? "" : s(n, 0),
            pathSuffix: i.length ? "" : s(o, 0),
            identificationCode: u,
            endpoint: l,
            disableQueryParams: f
        });
        for (let c = 0; c < i.length; c++) {
            let [m, g] = i[c].split(":");
            z({
                hostname: m,
                pathPrefix: s(n, c),
                pathSuffix: s(o, c),
                identificationCode: g,
                endpoint: l,
                disableQueryParams: f
            })
        }
    }

    function z(t) {
        let {
            hostname: i,
            pathPrefix: e,
            pathSuffix: n,
            identificationCode: o,
            endpoint: u,
            disableQueryParams: l
        } = t;
        i = L(i), i = R(i, e, n), l && (i = i.includes("?") ? i.split("?")[0] : i);
        let f = u + "?nc=" + new Date().getTime() + "&code=" + o + "&url=" + encodeURIComponent(i.substring(0, 1800)),
            c = new XMLHttpRequest;
        c.open("POST", f), c.send()
    }(function() {
        "use strict";
        M();
        let t = D("#pirschextendedjs");
        if (Q(t)) return;
        let i = ["7z", "avi", "csv", "docx", "exe", "gz", "key", "midi", "mov", "mp3", "mp4", "mpeg", "pdf", "pkg", "pps", "ppt", "pptx", "rar", "rtf", "txt", "wav", "wma", "wmv", "xlsx", "zip"].concat(t.getAttribute("data-download-extensions")?.split(",") || []),
            e = t.getAttribute("data-hit-endpoint") || "https://api.pirsch.io/hit",
            n = t.getAttribute("data-event-endpoint") || "https://api.pirsch.io/event",
            o = t.getAttribute("data-session-endpoint") || "https://api.pirsch.io/session",
            u = t.getAttribute("data-code") || "not-set",
            l = t.getAttribute("data-domain") ? t.getAttribute("data-domain").split(",") || [] : [],
            f = t.hasAttribute("data-disable-page-views"),
            c = t.hasAttribute("data-disable-query"),
            m = t.hasAttribute("data-disable-referrer"),
            g = t.hasAttribute("data-disable-resolution"),
            x = t.hasAttribute("data-disable-history"),
            P = t.hasAttribute("data-disable-outbound-links"),
            d = t.hasAttribute("data-disable-downloads"),
            v = t.hasAttribute("data-enable-sessions"),
            w = t.getAttribute("data-dev"),
            A = t.getAttribute("data-path-prefix") ? t.getAttribute("data-path-prefix").split(",") || [] : [],
            b = t.getAttribute("data-path-suffix") ? t.getAttribute("data-path-suffix").split(",") || [] : [],
            h = t.getAttribute("data-title-prefix") ? t.getAttribute("data-title-prefix").split(",") || [] : [],
            y = t.getAttribute("data-title-suffix") ? t.getAttribute("data-title-suffix").split(",") || [] : [],
            C = t.getAttribute("data-outbound-link-event-name") || "Outbound Link Click",
            _ = t.getAttribute("data-download-event-name") || "File Download",
            J = t.getAttribute("data-not-found-event-name") || "404 Page Not Found";
        f || $({
            script: t,
            domains: l,
            rewrite: w,
            pathPrefix: A,
            pathSuffix: b,
            titlePrefix: h,
            titleSuffix: y,
            identificationCode: u,
            endpoint: e,
            disableQueryParams: c,
            disableReferrer: m,
            disableResolution: g,
            disableHistory: x
        }), v && B({
            script: t,
            domains: l,
            rewrite: w,
            pathPrefix: A,
            pathSuffix: b,
            titlePrefix: h,
            titleSuffix: y,
            identificationCode: u,
            endpoint: o,
            disableQueryParams: c
        }), V({
            script: t,
            domains: l,
            rewrite: w,
            pathPrefix: A,
            pathSuffix: b,
            titlePrefix: h,
            titleSuffix: y,
            identificationCode: u,
            endpoint: n,
            disableQueryParams: c,
            disableReferrer: m,
            disableResolution: g
        }), window.pirschInit = function() {
            q("[data-pirsch-event]"), q("[pirsch-event]"), X(), G(), it()
        }, document.addEventListener("DOMContentLoaded", pirschInit);

        function q(a) {
            let r = document.querySelectorAll(a);
            for (let S of r) S.addEventListener("click", () => {
                H(S)
            }), S.addEventListener("auxclick", () => {
                H(S)
            })
        }

        function H(a) {
            let r = a.getAttribute("pirsch-event") ?? a.getAttribute("data-pirsch-event");
            if (!r) {
                console.error("Pirsch event attribute name can not be empty!", a);
                return
            }
            let S = {},
                E;
            for (let p of a.attributes) p.name.startsWith("data-pirsch-meta-") ? S[p.name.substring(17)] = p.value : p.name.startsWith("pirsch-meta-") ? S[p.name.substring(12)] = p.value : (p.name.startsWith("data-pirsch-duration") || p.name.startsWith("pirsch-duration")) && (E = Number.parseInt(p.value, 10) ?? 0);
            pirsch(r, {
                meta: S,
                duration: E
            })
        }

        function X() {
            let a = document.querySelectorAll("[class*='pirsch-event=']");
            for (let r of a) r.addEventListener("click", () => {
                U(r)
            }), r.addEventListener("auxclick", () => {
                U(r)
            })
        }

        function U(a) {
            let r = "",
                S = {},
                E;
            for (let p of a.classList)
                if (p.startsWith("pirsch-event=")) {
                    if (r = p.substring(13).replaceAll("+", " "), !r) {
                        console.error("Pirsch event class name can not be empty!", a);
                        return
                    }
                } else if (p.startsWith("pirsch-meta-")) {
                let W = p.substring(12);
                if (W) {
                    let k = W.split("=");
                    k.length === 2 && k[1] !== "" && (S[k[0]] = k[1].replaceAll("+", " "))
                }
            } else p.startsWith("pirsch-duration=") && (E = Number.parseInt(p.substring(16)) ?? 0);
            pirsch(r, {
                meta: S,
                duration: E
            })
        }

        function G() {
            let a = document.getElementsByTagName("a");
            for (let r of a) !r.hasAttribute("pirsch-ignore") && !r.hasAttribute("data-pirsch-ignore") && !r.classList.contains("pirsch-ignore") && (Z(r.href) ? d || Y(r) : P || K(r))
        }

        function K(a) {
            let r = tt(a.href);
            r !== null && r.hostname !== location.hostname && (a.addEventListener("click", () => pirsch(C, {
                meta: {
                    url: r.href
                }
            })), a.addEventListener("auxclick", () => pirsch(C, {
                meta: {
                    url: r.href
                }
            })))
        }

        function Y(a) {
            let r = et(a.href);
            a.addEventListener("click", () => pirsch(_, {
                meta: {
                    file: r
                }
            })), a.addEventListener("auxclick", () => pirsch(_, {
                meta: {
                    file: r
                }
            }))
        }

        function Z(a) {
            let r = a.split(".").pop().toLowerCase();
            return i.includes(r)
        }

        function tt(a) {
            try {
                return new URL(a)
            } catch {
                return null
            }
        }

        function et(a) {
            try {
                return a.toLowerCase().startsWith("http") ? new URL(a).pathname : a ?? "(empty)"
            } catch {
                return "(error)"
            }
        }

        function it() {
            window.pirschNotFound = function() {
                pirsch(J, {
                    meta: {
                        path: location.pathname
                    }
                })
            }
        }
    })();
})();