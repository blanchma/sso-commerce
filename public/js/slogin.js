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
          location.href = 'http://localhost:9393/register?back=' + encodeURI(location.href);
          return true;

        },
        onLoginClick = function() {
          location.href = 'http://localhost:9393/login?back=' + encodeURI(location.href);
          return true;
        },

    start = function() {
        $ = jQuery;
        initJquery();
        $(document).ready(function() {
            hookLoginAndRegisterLink();
            isLoginPage() ? redirectToLogin() : isCheckoutPageAndNeedLogin() && redirectToLogin()
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
    //isSupportsPostMessage && window.addEventListener("message", onReceiveMessage, !1);
    "undefined" === typeof jQuery ? loadJQueryAndStart() : start();

})();
