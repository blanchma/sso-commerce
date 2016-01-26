(function(undefined) {
    var css = ".sl-sr-only {position: absolute;width: 1px;height: 1px;margin: -1px;padding: 0;overflow: hidden;clip: rect(0, 0, 0, 0);border: 0;}.sl-sr-only-focusable:active,.sl-sr-only-focusable:focus {position: static;width: auto;height: auto;margin: 0;overflow: visible;clip: auto;}.sl-close {float: right;font-size: 21px;font-weight: bold;line-height: 1;color: #000000;text-shadow: 0 1px 0 #ffffff;opacity: 0.2;filter: alpha(opacity=20);}.sl-close:hover,.sl-close:focus {color: #000000;text-decoration: none;cursor: pointer;opacity: 0.5;filter: alpha(opacity=50);}button.sl-close {padding: 0;cursor: pointer;background: transparent;border: 0;-webkit-appearance: none;}.sl-modal-open {overflow: hidden;}.sl-modal {display: none;overflow: hidden;position: fixed;top: 0;right: 0;bottom: 0;left: 0;z-index: 9999999 !important;-webkit-overflow-scrolling: touch;outline: 0;}.sl-modal.sl-fade .sl-modal-dialog {-webkit-transform: translate3d(0, -25%, 0);transform: translate3d(0, -25%, 0);-webkit-transition: -webkit-transform 0.3s ease-out;-moz-transition: -moz-transform 0.3s ease-out;-o-transition: -o-transform 0.3s ease-out;transition: transform 0.3s ease-out;}.sl-modal.in .sl-modal-dialog {-webkit-transform: translate3d(0, 0, 0);transform: translate3d(0, 0, 0);}.modal-open .sl-modal {overflow-x: hidden;overflow-y: auto;}.sl-modal-dialog {position: relative;width: auto;margin: 10px;}.sl-modal-content {position: relative;background-color: #ffffff;border: 1px solid #999999;border: 1px solid rgba(0, 0, 0, 0.2);border-radius: 6px;-webkit-box-shadow: 0 3px 9px rgba(0, 0, 0, 0.5);box-shadow: 0 3px 9px rgba(0, 0, 0, 0.5);background-clip: padding-box;outline: 0;}.modal-backdrop {position: fixed;top: 0;right: 0;bottom: 0;left: 0;z-index: 99989;background-color: #000000;}.modal-backdrop.sl-fade {opacity: 0;filter: alpha(opacity=0);}.modal-backdrop.in {opacity: 0.5;filter: alpha(opacity=50);}.sl-modal-header {padding: 15px;border-bottom: 1px solid #e5e5e5;min-height: 16.42857143px;}.sl-modal-header .sl-close {margin-top: -2px;}.sl-modal-title {margin: 0;line-height: 1.42857143;font-size: 16px;font-weight: bold;text-align: left;}.sl-modal-body {position: relative;padding: 15px;}.modal-scrollbar-measure {position: absolute;top: -9999px;width: 50px;height: 50px;overflow: scroll;}@media (min-width: 600px) {.sl-modal-dialog {width: 600px;margin: 30px auto;}.sl-modal-content {-webkit-box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);}.sl-modal-sm {width: 300px;}}@media (min-width: 992px) {.sl-modal-lg {width: 900px;}}.center-block {display: block;margin-left: auto;margin-right: auto;}@-ms-viewport {width: device-width;}@media (max-width: 599px) {.sl-hidden-xs {display: none !important;}}@media (min-width: 600px) and (max-width: 991px) {.sl-hidden-sm {display: none !important;}}@media (min-width: 992px) and (max-width: 1199px) {.sl-hidden-md {display: none !important;}}@media (min-width: 1200px) {.sl-hidden-lg {display: none !important;}}#sl-dialog-login, #sl-dialog-register {font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;font-size: 14px;line-height: 1.42857143;color: #333333;}.sl-btn-social {-moz-user-select: none;border: 1px solid transparent !important;border-radius: 4px !important;cursor: pointer !important;font-size: 16px !important;font-weight: normal !important;vertical-align: middle !important;white-space: nowrap !important;margin-bottom: 20px !important;position: relative !important;text-align: left !important;overflow: hidden !important;text-overflow: ellipsis !important;line-height: 1.33 !important;display: block !important;text-decoration: none !important;padding: 10px 12px 10px 60px !important;}.sl-btn-social :first-child {position: absolute !important;left: 0 !important;top: 0 !important;bottom: 0 !important;width: 42px !important;text-align: center !important;}.sl-btn-email {color: #fff !important;background-color: #696969 !important;}.sl-btn-email:hover, .sl-btn-email:focus, .sl-btn-email:active, .sl-btn-email.active, .open .dropdown-toggle.sl-btn-email {color: #fff !important;background-color: #555555 !important;}.sl-btn-email:active, .sl-btn-email.active, .open .dropdown-toggle.sl-btn-email {background-image: none !important;}.sl-btn-facebook {color: #fff !important;background-color: #3b5998 !important;}.sl-btn-facebook:hover, .sl-btn-facebook:focus, .sl-btn-facebook:active, .sl-btn-facebook.active, .open .dropdown-toggle.sl-btn-facebook {color: #fff !important;background-color: #30487b !important;}.sl-btn-facebook:active, .sl-btn-facebook.active, .open .dropdown-toggle.sl-btn-facebook {background-image: none !important;}.sl-btn-google-plus {color: #fff !important;background-color: #dd4b39 !important;}.sl-btn-google-plus:hover, .sl-btn-google-plus:focus, .sl-btn-google-plus:active, .sl-btn-google-plus.active, .open .dropdown-toggle.sl-btn-google-plus {color: #fff !important;background-color: #ca3523 !important;}.sl-btn-google-plus:active, .sl-btn-google-plus.active, .open .dropdown-toggle.sl-btn-google-plus {background-image: none !important;}.sl-btn-twitter {color: #fff !important;background-color: #2ba9e1 !important;}.sl-btn-twitter:hover, .sl-btn-twitter:focus, .sl-btn-twitter:active, .sl-btn-twitter.active, .open .dropdown-toggle.sl-btn-twitter {color: #fff !important;background-color: #1c92c7 !important;}.sl-btn-twitter:active, .sl-btn-twitter.active, .open .dropdown-toggle.sl-btn-twitter {background-image: none !important;}.sl-btn-instagram {color: #fff !important;background-color: #517fa4 !important;}.sl-btn-instagram:hover, .sl-btn-instagram:focus, .sl-btn-instagram:active, .sl-btn-instagram.active, .open .dropdown-toggle.sl-btn-instagram {color: #fff !important;background-color: #446a89 !important;}.sl-btn-instagram:active, .sl-btn-instagram.active, .open .dropdown-toggle.sl-btn-instagram {background-image: none !important;}.sl-social-icon {background-repeat: no-repeat !important;}.sl-social-icon.sl-email-icon {background-image: url('//sl.mingidea.com/social-login/assets/email-40.png');border-right: 1px solid #555555 !important;}.sl-social-icon.sl-facebook-icon {background-image: url('//sl.mingidea.com/social-login/assets/facebook-40.png');border-right: 1px solid #30487b !important;}.sl-social-icon.sl-google-plus-icon {background-image: url('//sl.mingidea.com/social-login/assets/google-plus-40.png');border-right: 1px solid #ca3523 !important;}.sl-social-icon.sl-twitter-icon {background-image: url('//sl.mingidea.com/social-login/assets/twitter-40.png');border-right: 1px solid #1c92c7 !important;}.sl-social-icon.sl-instagram-icon {background-image: url('//sl.mingidea.com/social-login/assets/instagram-40.png');border-right: 1px solid #446a89 !important;}";

    var initBootstrap = function() {
        function f(a, c) {
            return this.each(function() {
                var d = $(this),
                    e = d.data("bs.modal"),
                    g = $.extend({}, b.DEFAULTS, d.data(), "object" == typeof a && a);
                e || d.data("bs.modal", e = new b(this, g));
                if ("string" == typeof a) e[a](c);
                else g.show && e.show(c)
            })
        }
        var b = function(a, c) {
            this.options = c;
            this.$body = $(document.body);
            this.$element = $(a);
            this.$backdrop = this.isShown = null;
            this.scrollbarWidth = 0;
            this.options.remote && this.$element.find(".modal-content").load(this.options.remote, $.proxy(function() {
                    this.$element.trigger("loaded.bs.modal")
                },
                this))
        };
        b.VERSION = "3.2.0";
        b.DEFAULTS = {
            backdrop: !0,
            keyboard: !0,
            show: !0
        };
        b.prototype.toggle = function(a) {
            return this.isShown ? this.hide() : this.show(a)
        };
        b.prototype.show = function(a) {
            var c = this,
                d = $.Event("show.bs.modal", {
                    relatedTarget: a
                });
            this.$element.trigger(d);
            this.isShown || d.isDefaultPrevented() || (this.isShown = !0, this.checkScrollbar(), this.$body.addClass("modal-open"), this.setScrollbar(), this.escape(), this.$element.on("click.dismiss.bs.modal", '[data-dismiss="modal"]', $.proxy(this.hide, this)), this.backdrop(function() {
                var d =
                    $.support.transition && c.$element.hasClass("fade");
                c.$element.parent().length || c.$element.appendTo(c.$body);
                c.$element.show().scrollTop(0);
                d && c.$element[0].offsetWidth;
                c.$element.addClass("in").attr("aria-hidden", !1);
                c.enforceFocus();
                var b = $.Event("shown.bs.modal", {
                    relatedTarget: a
                });
                d ? c.$element.find(".modal-dialog").one("bsTransitionEnd", function() {
                    c.$element.trigger("focus").trigger(b)
                }).emulateTransitionEnd(300) : c.$element.trigger("focus").trigger(b)
            }))
        };
        b.prototype.hide = function(a) {
            a && a.preventDefault();
            a = $.Event("hide.bs.modal");
            this.$element.trigger(a);
            this.isShown && !a.isDefaultPrevented() && (this.isShown = !1, this.$body.removeClass("modal-open"), this.resetScrollbar(), this.escape(), $(document).off("focusin.bs.modal"), this.$element.removeClass("in").attr("aria-hidden", !0).off("click.dismiss.bs.modal"), $.support.transition && this.$element.hasClass("fade") ? this.$element.one("bsTransitionEnd", $.proxy(this.hideModal, this)).emulateTransitionEnd(300) : this.hideModal())
        };
        b.prototype.enforceFocus = function() {
            $(document).off("focusin.bs.modal").on("focusin.bs.modal",
                $.proxy(function(a) {
                    this.$element[0] === a.target || this.$element.has(a.target).length || this.$element.trigger("focus")
                }, this))
        };
        b.prototype.escape = function() {
            if (this.isShown && this.options.keyboard) this.$element.on("keyup.dismiss.bs.modal", $.proxy(function(a) {
                27 == a.which && this.hide()
            }, this));
            else this.isShown || this.$element.off("keyup.dismiss.bs.modal")
        };
        b.prototype.hideModal = function() {
            var a = this;
            this.$element.hide();
            this.backdrop(function() {
                a.$element.trigger("hidden.bs.modal")
            })
        };
        b.prototype.removeBackdrop =
            function() {
                this.$backdrop && this.$backdrop.remove();
                this.$backdrop = null
            };
        b.prototype.backdrop = function(a) {
            var c = this,
                d = this.$element.hasClass("fade") ? "fade" : "";
            if (this.isShown && this.options.backdrop) {
                var b = $.support.transition && d;
                this.$backdrop = $('<div class="modal-backdrop ' + d + '" />').appendTo(this.$body);
                this.$element.on("click.dismiss.bs.modal", $.proxy(function(a) {
                    a.target === a.currentTarget && ("static" == this.options.backdrop ? this.$element[0].focus.call(this.$element[0]) : this.hide.call(this))
                }, this));
                b && this.$backdrop[0].offsetWidth;
                this.$backdrop.addClass("in");
                a && (b ? this.$backdrop.one("bsTransitionEnd", a).emulateTransitionEnd(150) : a())
            } else !this.isShown && this.$backdrop ? (this.$backdrop.removeClass("in"), d = function() {
                c.removeBackdrop();
                a && a()
            }, $.support.transition && this.$element.hasClass("fade") ? this.$backdrop.one("bsTransitionEnd", d).emulateTransitionEnd(150) : d()) : a && a()
        };
        b.prototype.checkScrollbar = function() {
            document.body.clientWidth >= window.innerWidth || (this.scrollbarWidth = this.scrollbarWidth ||
                this.measureScrollbar())
        };
        b.prototype.setScrollbar = function() {
            var a = parseInt(this.$body.css("padding-right") || 0, 10);
            this.scrollbarWidth && this.$body.css("padding-right", a + this.scrollbarWidth)
        };
        b.prototype.resetScrollbar = function() {
            this.$body.css("padding-right", "")
        };
        b.prototype.measureScrollbar = function() {
            var a = document.createElement("div");
            a.className = "modal-scrollbar-measure";
            this.$body.append(a);
            var c = a.offsetWidth - a.clientWidth;
            this.$body[0].removeChild(a);
            return c
        };
        var h = $.fn.modal;
        $.fn.modal =
            f;
        $.fn.modal.Constructor = b;
        $.fn.modal.noConflict = function() {
            $.fn.modal = h;
            return this
        };
        $(document).on("click.bs.modal.data-api", '[data-toggle="modal"]', function(a) {
            var c = $(this),
                b = c.attr("href"),
                e = $(c.attr("data-target") || b && b.replace(/.*(?=#[^\s]+$)/, "")),
                b = e.data("bs.modal") ? "toggle" : $.extend({
                    remote: !/#/.test(b) && b
                }, e.data(), c.data());
            c.is("a") && a.preventDefault();
            e.one("show.bs.modal", function(a) {
                if (!a.isDefaultPrevented()) e.one("hidden.bs.modal", function() {
                    c.is(":visible") && c.trigger("focus")
                })
            });
            f.call(e, b, this)
        })
    };


    var loginDialogHtml = '<div class="sl-modal sl-fade" id="sl-dialog-login"><!--[if lte IE 8]><div class="sl-modal-dialog" style="width: 600px;"><![endif]--><div class="sl-modal-dialog" ><div class="sl-modal-content"><div class="sl-modal-header"><button type="button" class="sl-close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="sl-sr-only">Close</span></button><div class="sl-modal-title">Sign In</div></div><div class="sl-modal-body"><div style="display: inline-block; width: 260px;margin-right: 15px;float: left;"><a href="https://sl.mingidea.com/social-login/facebook/login?storeId=495&storeUrl=" class="sl-btn-social sl-btn-facebook" title="Sign In With Facebook"><span class="sl-social-icon sl-facebook-icon"></span>Sign in with Facebook</a><a href="https://sl.mingidea.com/social-login/google/login?storeId=495&storeUrl=" class="sl-btn-social sl-btn-google-plus" title="Sign In with Google+"><span class="sl-social-icon sl-google-plus-icon"></span>Sign in with Google+</a><a href="https://sl.mingidea.com/social-login/twitter/login?storeId=495&storeUrl=" class="sl-btn-social sl-btn-twitter" title="Sign In with Twitter"><span class="sl-social-icon sl-twitter-icon"></span>Sign in with Twitter</a><a href="https://sl.mingidea.com/social-login/instagram/login?storeId=495&storeUrl=" class="sl-btn-social sl-btn-instagram" title="Sign In with Instagram"><span class="sl-social-icon sl-instagram-icon"></span>Sign in with Instagram</a></div><img src="//sl.mingidea.com/social-login/assets/or_v.png" class="sl-hidden-xs" style="float: left;margin-right: 15px;"><!--[if !IE]><!--><img src="//sl.mingidea.com/social-login/assets/or_h.png" class="sl-hidden-sm sl-hidden-md sl-hidden-lg" style="margin-bottom: 20px;float: left;width: 260px;margin-right: 60px;"><!--<![endif]--><div style="display:inline-block;width: 230px;vertical-align: top;float: left;"><form action="/login.php?action=check_login" id="customer_login" method="post"><label style="display: block !important;font-size: 16px !important;text-align: left !important;">Email Address</label><input type="email" name="login_email" style="width: 100% !important;height: 30px !important;line-height: 30px !important;border: 1px solid #e3e3e3 !important;margin: 0 0 15px 0 !important;border-radius: 0 !important;box-shadow: none !important;padding: 5px !important;font-size: 16px !important;background-color: #FFFFFF !important;-webkit-box-sizing: content-box !important;box-sizing: content-box !important;"><br><label style="display: block !important;font-size: 16px !important;text-align: left !important;">Password</label><input type="password" name="login_pass" style="width: 100% !important;height: 30px !important;line-height: 30px !important;border: 1px solid #e3e3e3 !important;margin: 0 0 15px 0 !important;border-radius: 0 !important;box-shadow: none !important;padding: 5px !important;font-size: 16px !important;background-color: #FFFFFF !important;-webkit-box-sizing: content-box !important;box-sizing: content-box !important;"><br><input type="submit" value="Sign In" style="font: inherit !important;display: block !important;height: auto !important;border: 0 !important;color: #FFFFFF !important;text-align: center !important;padding: 10px 0 !important;width: 100px !important;border-radius: 4px !important;cursor: pointer !important;font-size: 14px !important;margin-bottom: 15px !important;background-color: #00abcb !important;text-transform: none !important;letter-spacing: 1px !important"><p><a target="_blank" href="/login.php?action=create_account" class="sl-link" style="text-decoration: none !important;color: #555555 !important;">Create an account with Email</a><br/><a target="_blank" href="/login.php?action=reset_password" style="text-decoration: none !important;color: #555555 !important;">Forgot your password ?</a></p></form></div><div style="clear: both;"></div></div></div></div></div>';
    var registerDialogHtml = '<div class="sl-modal sl-fade" id="sl-dialog-register"><div class="sl-modal-dialog" style="width: 410px"><div class="sl-modal-content"><div class="sl-modal-header"><button type="button" class="sl-close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="sl-sr-only">Close</span></button><div class="sl-modal-title">Create an Account</div></div><div class="sl-modal-body"><a href="/login.php?action=create_account" class="sl-btn-social sl-btn-email" title="Create An Account With Email"><span class="sl-social-icon sl-email-icon"></span>Create An Account With Email</a><a href="https://sl.mingidea.com/social-login/facebook/login?storeId=495&storeUrl=" class="sl-btn-social sl-btn-facebook" title="Sign In With Facebook"><span class="sl-social-icon sl-facebook-icon"></span>Sign in with Facebook</a><a href="https://sl.mingidea.com/social-login/google/login?storeId=495&storeUrl=" class="sl-btn-social sl-btn-google-plus" title="Sign In With Google+"><span class="sl-social-icon sl-google-plus-icon"></span>Sign in with Google+</a><a href="https://sl.mingidea.com/social-login/twitter/login?storeId=495&storeUrl=" class="sl-btn-social sl-btn-twitter" title="Sign In With Twitter"><span class="sl-social-icon sl-twitter-icon"></span>Sign in with Twitter</a><a href="https://sl.mingidea.com/social-login/instagram/login?storeId=495&storeUrl=" class="sl-btn-social sl-btn-instagram" title="Sign In With Instagram"><span class="sl-social-icon sl-instagram-icon"></span>Sign in with Instagram</a></div></div></div></div>';
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
                if ("/login.php" === a || "login.php" ===
                    a) {
                    if (-1 === b.indexOf("action=")) return onLoginClick(), setLoginRedirectUrl(), !1;
                    if (-1 < b.indexOf("action=create_account") && !$(this).hasClass("sl-link")) return onRegisterClick(), setLoginRedirectUrl(), !1
                }
            })
        },
        setLoginRedirectUrl = function() {
            var a = location.pathname; - 1 < a.indexOf("/") && (a = a.substr(1, a.length));
            a = storeUrl + "/login.php?from=" + encodeURIComponent(a);
            try {
                var b;
                window.XMLHttpRequest ? b = new XMLHttpRequest : window.ActiveXObject && (b = new ActiveXObject("Microsoft.XMLHTTP"));
                b.open("GET", a);
                b.send(null)
            } catch (c) {}
        };
    var $, loginDialog, registerDialog, isSupportsPostMessage = window.postMessage && window.addEventListener,
        storeUrl = location.protocol + "//" + location.host,
        openWindow = function(a) {
            window.open(a, "Social Login", "left=" + (screen.width / 2 - 280) + ",top=" + (screen.height / 2 - 200) + ",width=560,height=400,status=yes,toolbar=no,menubar=no,location=no")
        },
        initDialog = function() {
            var a = $("body");
            a.append(loginDialogHtml);
            a.append(registerDialogHtml);
            loginDialog = $("#sl-dialog-login").modal({
                backdrop: "static",
                keyboard: !0,
                show: !1
            });
            registerDialog = $("#sl-dialog-register").modal({
                backdrop: "static",
                keyboard: !0,
                show: !1
            });
            $(".sl-btn-social").click(function() {
                var a = $(this),
                    c = a.attr("href");
                if (a.hasClass("sl-btn-email")) return window.location.href = c, !1;
                a = c + encodeURI(storeUrl);
                isSupportsPostMessage ? openWindow(a) : window.location.href = a;
                return !1
            })
        },
        onLoginClick = function(a) {
            loginDialog.modal("show");
            return !1
        },
        onRegisterClick = function() {
            registerDialog.modal("show");
            return !1
        },
        post = function(a, b) {
            console.log('post')
            console.log(a)
            console.log(b)
            var c = document.createElement("form");
            c.setAttribute("method",
                "post");
            c.setAttribute("action", a);
            for (var d in b) {
                var e = b[d],
                    f = document.createElement("input");
                f.setAttribute("type", "hidden");
                f.setAttribute("name", d);
                f.setAttribute("value", e);
                c.appendChild(f)
            }
            document.body.appendChild(c);
            c.submit()
        },
        onReceiveMessage = function(a) {
            a = a.data;
            console.log('onReceiveMessage');
            console.log(a);
            if ("social-login" == a.source) {
                var b = a.action;
                "post" === b ? post(a.url, a.parameters) : "redirect" === b ? window.location.href = a.url : "alert" === b && alert(a.content)
            }
        },
        loadCss = function() {
            $("head").append('<style type="text/css">' + css + "</style>")
        },
        start = function() {
            $ = jQuery;
            initJquery();
            initBootstrap();
            $(document).ready(function() {
                loadCss();
                hookLoginAndRegisterLink();
                initDialog();
                isLoginPage() ? loginDialog.modal("show") : isCheckoutPageAndNeedLogin() && (setLoginRedirectUrl(), loginDialog.modal("show"))
            })
        };

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
