(function(undefined) {

    var isLoginPage = function() {
            var a = location.pathname;
            return ("/login.php" === a || "login.php" === a) && -1 === location.search.indexOf("action=")
        },
        isCheckoutPageAndNeedLogin = function() {
            var a = location.pathname;
            if ("/checkout.php" === a || "checkout.php" === a)
                if ((a = $("#CheckoutStepAccountDetails")) && a.is(":visible") || 0 < $("input[name='login_email']:visible").length) return !0;
            return !1
        },
        hookLoginAndRegisterLink = function() {
            $("body").delegate("a", "click", function(a) {
                a = this.pathname;
                var b = this.search;
                if ("/login.php" === a || "login.php" === a) {
                    if (-1 === b.indexOf("action=")) return onLoginClick(), !1;
                    if (-1 < b.indexOf("action=create_account")) return onRegisterClick(), !1
                }
            })
        },
        onRegisterClick = function() {
          location.href = 'https://sso-commerce.herokuapp.com/register?back=' + encodeURI(location.href);
          return true;
        },
        onLoginClick = function() {
          location.href = 'https://sso-commerce.herokuapp.com/login?back=' + encodeURI(location.href);
          return true;
        },
        post = function(url, data) {
            console.log('post')
            console.log(url)
            console.log(data)
            var _form = document.createElement("form");
            _form.setAttribute("method",
                "post");
            _form.setAttribute("action", url);
            for (var arg in data) {
                var value = data[arg],
                    _attr = document.createElement("input");
                _attr.setAttribute("type", "hidden");
                _attr.setAttribute("name", arg);
                _attr.setAttribute("value", value);
                _form.appendChild(_attr)
            }
            document.body.appendChild(c);
            _form.submit()
        },
        isSupportsPostMessage = window.postMessage && window.addEventListener,
        onReceiveMessage = function(_event) {
            event = _event.data;
            console.log('onReceiveMessage');
            console.log(event);

            var origin = _event.origin || _event.originalEvent.origin; // For Chrome, the origin property is in the event.originalEvent object.
            console.log('origin: ' + origin);
            if (origin !== "https://sso-commerce.herokuapp.com")
              return;

            if ("sso-commerce" == event.source) {
                var action = event.action;
                "post" === action ? post(event.url, event.parameters) : "redirect" === action ? window.location.href = event.url : "alert" === action && alert(event.content)
            }
        }

    start = function() {
        $ = jQuery;
        initJquery();
        $(document).ready(function() {
            hookLoginAndRegisterLink();
            if ( isLoginPage() || isCheckoutPageAndNeedLogin() )
              onLoginClick();
        })
    }

    function initJquery() {
        $.fn.on || ($.fn.on = function(a, b, c, d) {
            var e = arguments.length;
            return 3 < e ? this.delegate(b, a, c, d) : 2 < e ? "string" === typeof b ? this.delegate(b, a, c) : this.bind(a, b, c) : this.bind(a, b)
        });
        $.fn.off || ($.fn.off = function(a, b, c) {
            var d = arguments.length;
            return "string" === typeof b ? 2 < d ? this.undelegate(b, a, c) : 1 < d ? this.undelegate(b, a) : this.undelegate() : 1 < d ? this.unbind(a, b) : 0 < d ? this.unbind(a) : this.unbind()
        })
    }
    var startAfterJQueryLoaded = function() {
            "undefined" === typeof jQuery ? setTimeout(startAfterJQueryLoaded, 100) : start()
        },
        loadJQueryAndStart = function() {
            if (document.body) {
                var a = document.createElement("script");
                a.setAttribute("src", "https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js");
                document.body.appendChild(a);
                startAfterJQueryLoaded()
            } else setTimeout(loadJQueryAndStart, 100)
        };
    isSupportsPostMessage && window.addEventListener("message", onReceiveMessage, !1);
    "undefined" === typeof jQuery ? loadJQueryAndStart() : start();

})();
