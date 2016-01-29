(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
;(function(root) {
  /**
   * Constructs a new cross storage client given the url to a hub. By default,
   * an iframe is created within the document body that points to the url. It
   * also accepts an options object, which may include a timeout, frameId, and
   * promise. The timeout, in milliseconds, is applied to each request and
   * defaults to 5000ms. The options object may also include a frameId,
   * identifying an existing frame on which to install its listeners. If the
   * promise key is supplied the constructor for a Promise, that Promise library
   * will be used instead of the default window.Promise.
   *
   * @example
   * var storage = new CrossStorageClient('https://store.example.com/hub.html');
   *
   * @example
   * var storage = new CrossStorageClient('https://store.example.com/hub.html', {
   *   timeout: 5000,
   *   frameId: 'storageFrame'
   * });
   *
   * @constructor
   *
   * @param {string} url    The url to a cross storage hub
   * @param {object} [opts] An optional object containing additional options,
   *                        including timeout, frameId, and promise
   *
   * @property {string}   _id        A UUID v4 id
   * @property {function} _promise   The Promise object to use
   * @property {string}   _frameId   The id of the iFrame pointing to the hub url
   * @property {string}   _origin    The hub's origin
   * @property {object}   _requests  Mapping of request ids to callbacks
   * @property {bool}     _connected Whether or not it has connected
   * @property {bool}     _closed    Whether or not the client has closed
   * @property {int}      _count     Number of requests sent
   * @property {function} _listener  The listener added to the window
   * @property {Window}   _hub       The hub window
   */
  function CrossStorageClient(url, opts) {
    opts = opts || {};

    this._id        = CrossStorageClient._generateUUID();
    this._promise   = opts.promise || Promise;
    this._frameId   = opts.frameId || 'CrossStorageClient-' + this._id;
    this._origin    = CrossStorageClient._getOrigin(url);
    this._requests  = {};
    this._connected = false;
    this._closed    = false;
    this._count     = 0;
    this._timeout   = opts.timeout || 5000;
    this._listener  = null;

    this._installListener();

    var frame;
    if (opts.frameId) {
      frame = document.getElementById(opts.frameId);
    }

    // If using a passed iframe, poll the hub for a ready message
    if (frame) {
      this._poll();
    }

    // Create the frame if not found or specified
    frame = frame || this._createFrame(url);
    this._hub = frame.contentWindow;
  }

  /**
   * The styles to be applied to the generated iFrame. Defines a set of properties
   * that hide the element by positioning it outside of the visible area, and
   * by modifying its display.
   *
   * @member {Object}
   */
  CrossStorageClient.frameStyle = {
    display:  'none',
    position: 'absolute',
    top:      '-999px',
    left:     '-999px'
  };

  /**
   * Returns the origin of an url, with cross browser support. Accommodates
   * the lack of location.origin in IE, as well as the discrepancies in the
   * inclusion of the port when using the default port for a protocol, e.g.
   * 443 over https. Defaults to the origin of window.location if passed a
   * relative path.
   *
   * @param   {string} url The url to a cross storage hub
   * @returns {string} The origin of the url
   */
  CrossStorageClient._getOrigin = function(url) {
    var uri, protocol, origin;

    uri = document.createElement('a');
    uri.href = url;

    if (!uri.host) {
      uri = window.location;
    }

    if (!uri.protocol || uri.protocol === ':') {
      protocol = window.location.protocol;
    } else {
      protocol = uri.protocol;
    }

    origin = protocol + '//' + uri.host;
    origin = origin.replace(/:80$|:443$/, '');

    return origin;
  };

  /**
   * UUID v4 generation, taken from: http://stackoverflow.com/questions/
   * 105034/how-to-create-a-guid-uuid-in-javascript/2117523#2117523
   *
   * @returns {string} A UUID v4 string
   */
  CrossStorageClient._generateUUID = function() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16|0, v = c == 'x' ? r : (r&0x3|0x8);

      return v.toString(16);
    });
  };

  /**
   * Returns a promise that is fulfilled when a connection has been established
   * with the cross storage hub. Its use is required to avoid sending any
   * requests prior to initialization being complete.
   *
   * @returns {Promise} A promise that is resolved on connect
   */
  CrossStorageClient.prototype.onConnect = function() {
    var client = this;

    if (this._connected) {
      return this._promise.resolve();
    } else if (this._closed) {
      return this._promise.reject(new Error('CrossStorageClient has closed'));
    }

    // Queue connect requests for client re-use
    if (!this._requests.connect) {
      this._requests.connect = [];
    }

    return new this._promise(function(resolve, reject) {
      var timeout = setTimeout(function() {
        reject(new Error('CrossStorageClient could not connect'));
      }, client._timeout);

      client._requests.connect.push(function(err) {
        clearTimeout(timeout);
        if (err) return reject(err);

        resolve();
      });
    });
  };

  /**
   * Sets a key to the specified value, optionally accepting a ttl to passively
   * expire the key after a number of milliseconds. Returns a promise that is
   * fulfilled on success, or rejected if any errors setting the key occurred,
   * or the request timed out.
   *
   * @param   {string}  key   The key to set
   * @param   {*}       value The value to assign
   * @param   {int}     ttl   Time to live in milliseconds
   * @returns {Promise} A promise that is settled on hub response or timeout
   */
  CrossStorageClient.prototype.set = function(key, value, ttl) {
    return this._request('set', {
      key:   key,
      value: value,
      ttl:   ttl
    });
  };

  /**
   * Accepts one or more keys for which to retrieve their values. Returns a
   * promise that is settled on hub response or timeout. On success, it is
   * fulfilled with the value of the key if only passed a single argument.
   * Otherwise it's resolved with an array of values. On failure, it is rejected
   * with the corresponding error message.
   *
   * @param   {...string} key The key to retrieve
   * @returns {Promise}   A promise that is settled on hub response or timeout
   */
  CrossStorageClient.prototype.get = function(key) {
    var args = Array.prototype.slice.call(arguments);

    return this._request('get', {keys: args});
  };

  /**
   * Accepts one or more keys for deletion. Returns a promise that is settled on
   * hub response or timeout.
   *
   * @param   {...string} key The key to delete
   * @returns {Promise}   A promise that is settled on hub response or timeout
   */
  CrossStorageClient.prototype.del = function() {
    var args = Array.prototype.slice.call(arguments);

    return this._request('del', {keys: args});
  };

  /**
   * Returns a promise that, when resolved, indicates that all localStorage
   * data has been cleared.
   *
   * @returns {Promise} A promise that is settled on hub response or timeout
   */
  CrossStorageClient.prototype.clear = function() {
    return this._request('clear');
  };

  /**
   * Returns a promise that, when resolved, passes an array of all keys
   * currently in storage.
   *
   * @returns {Promise} A promise that is settled on hub response or timeout
   */
  CrossStorageClient.prototype.getKeys = function() {
    return this._request('getKeys');
  };

  /**
   * Deletes the iframe and sets the connected state to false. The client can
   * no longer be used after being invoked.
   */
  CrossStorageClient.prototype.close = function() {
    var frame = document.getElementById(this._frameId);
    if (frame) {
      frame.parentNode.removeChild(frame);
    }

    // Support IE8 with detachEvent
    if (window.removeEventListener) {
      window.removeEventListener('message', this._listener, false);
    } else {
      window.detachEvent('onmessage', this._listener);
    }

    this._connected = false;
    this._closed = true;
  };

  /**
   * Installs the necessary listener for the window message event. When a message
   * is received, the client's _connected status is changed to true, and the
   * onConnect promise is fulfilled. Given a response message, the callback
   * corresponding to its request is invoked. If response.error holds a truthy
   * value, the promise associated with the original request is rejected with
   * the error. Otherwise the promise is fulfilled and passed response.result.
   *
   * @private
   */
  CrossStorageClient.prototype._installListener = function() {
    var client = this;

    this._listener = function(message) {
      var i, origin, error, response;

      // Ignore invalid messages or those after the client has closed
      if (client._closed || !message.data || typeof message.data !== 'string') {
        return;
      }

      // postMessage returns the string "null" as the origin for "file://"
      origin = (message.origin === 'null') ? 'file://' : message.origin;

      // Ignore messages not from the correct origin
      if (origin !== client._origin) return;

      // LocalStorage isn't available in the hub
      if (message.data === 'cross-storage:unavailable') {
        if (!client._closed) client.close();
        if (!client._requests.connect) return;

        error = new Error('Closing client. Could not access localStorage in hub.');
        for (i = 0; i < client._requests.connect.length; i++) {
          client._requests.connect[i](error);
        }

        return;
      }

      // Handle initial connection
      if (message.data.indexOf('cross-storage:') !== -1 && !client._connected) {
        client._connected = true;
        if (!client._requests.connect) return;

        for (i = 0; i < client._requests.connect.length; i++) {
          client._requests.connect[i](error);
        }
        delete client._requests.connect;
      }

      if (message.data === 'cross-storage:ready') return;

      // All other messages
      try {
        response = JSON.parse(message.data);
      } catch(e) {
        return;
      }

      if (!response.id) return;

      if (client._requests[response.id]) {
        client._requests[response.id](response.error, response.result);
      }
    };

    // Support IE8 with attachEvent
    if (window.addEventListener) {
      window.addEventListener('message', this._listener, false);
    } else {
      window.attachEvent('onmessage', this._listener);
    }
  };

  /**
   * Invoked when a frame id was passed to the client, rather than allowing
   * the client to create its own iframe. Polls the hub for a ready event to
   * establish a connected state.
   */
  CrossStorageClient.prototype._poll = function() {
    var client, interval, targetOrigin;

    client = this;

    // postMessage requires that the target origin be set to "*" for "file://"
    targetOrigin = (client._origin === 'file://') ? '*' : client._origin;

    interval = setInterval(function() {
      if (client._connected) return clearInterval(interval);
      if (!client._hub) return;

      client._hub.postMessage('cross-storage:poll', targetOrigin);
    }, 1000);
  };

  /**
   * Creates a new iFrame containing the hub. Applies the necessary styles to
   * hide the element from view, prior to adding it to the document body.
   * Returns the created element.
   *
   * @private
   *
   * @param  {string}            url The url to the hub
   * returns {HTMLIFrameElement} The iFrame element itself
   */
  CrossStorageClient.prototype._createFrame = function(url) {
    var frame, key;

    frame = window.document.createElement('iframe');
    frame.id = this._frameId;

    // Style the iframe
    for (key in CrossStorageClient.frameStyle) {
      if (CrossStorageClient.frameStyle.hasOwnProperty(key)) {
        frame.style[key] = CrossStorageClient.frameStyle[key];
      }
    }

    window.document.body.appendChild(frame);
    frame.src = url;

    return frame;
  };

  /**
   * Sends a message containing the given method and params to the hub. Stores
   * a callback in the _requests object for later invocation on message, or
   * deletion on timeout. Returns a promise that is settled in either instance.
   *
   * @private
   *
   * @param   {string}  method The method to invoke
   * @param   {*}       params The arguments to pass
   * @returns {Promise} A promise that is settled on hub response or timeout
   */
  CrossStorageClient.prototype._request = function(method, params) {
    var req, client;

    if (this._closed) {
      return this._promise.reject(new Error('CrossStorageClient has closed'));
    }

    client = this;
    client._count++;

    req = {
      id:     this._id + ':' + client._count,
      method: 'cross-storage:' + method,
      params: params
    };

    return new this._promise(function(resolve, reject) {
      var timeout, originalToJSON, targetOrigin;

      // Timeout if a response isn't received after 4s
      timeout = setTimeout(function() {
        if (!client._requests[req.id]) return;

        delete client._requests[req.id];
        reject(new Error('Timeout: could not perform ' + req.method));
      }, client._timeout);

      // Add request callback
      client._requests[req.id] = function(err, result) {
        clearTimeout(timeout);
        if (err) return reject(new Error(err));
        resolve(result);
      };

      // In case we have a broken Array.prototype.toJSON, e.g. because of
      // old versions of prototype
      if (Array.prototype.toJSON) {
        originalToJSON = Array.prototype.toJSON;
        Array.prototype.toJSON = null;
      }

      // postMessage requires that the target origin be set to "*" for "file://"
      targetOrigin = (client._origin === 'file://') ? '*' : client._origin;

      // Send serialized message
      client._hub.postMessage(JSON.stringify(req), targetOrigin);

      // Restore original toJSON
      if (originalToJSON) {
        Array.prototype.toJSON = originalToJSON;
      }
    });
  };

  /**
   * Export for various environments.
   */
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = CrossStorageClient;
  } else if (typeof exports !== 'undefined') {
    exports.CrossStorageClient = CrossStorageClient;
  } else if (typeof define === 'function' && define.amd) {
    define([], function() {
      return CrossStorageClient;
    });
  } else {
    root.CrossStorageClient = CrossStorageClient;
  }
}(this));

},{}],2:[function(require,module,exports){
;(function(root) {
  var CrossStorageHub = {};

  /**
   * Accepts an array of objects with two keys: origin and allow. The value
   * of origin is expected to be a RegExp, and allow, an array of strings.
   * The cross storage hub is then initialized to accept requests from any of
   * the matching origins, allowing access to the associated lists of methods.
   * Methods may include any of: get, set, del, getKeys and clear. A 'ready'
   * message is sent to the parent window once complete.
   *
   * @example
   * // Subdomain can get, but only root domain can set and del
   * CrossStorageHub.init([
   *   {origin: /\.example.com$/,        allow: ['get']},
   *   {origin: /:(www\.)?example.com$/, allow: ['get', 'set', 'del']}
   * ]);
   *
   * @param {array} permissions An array of objects with origin and allow
   */
  CrossStorageHub.init = function(permissions) {
    var available = true;

    // Return if localStorage is unavailable, or third party
    // access is disabled
    try {
      if (!window.localStorage) available = false;
    } catch (e) {
      available = false;
    }

    if (!available) {
      try {
        return window.parent.postMessage('cross-storage:unavailable', '*');
      } catch (e) {
        return;
      }
    }

    CrossStorageHub._permissions = permissions || [];
    CrossStorageHub._installListener();
    window.parent.postMessage('cross-storage:ready', '*');
  };

  /**
   * Installs the necessary listener for the window message event. Accommodates
   * IE8 and up.
   *
   * @private
   */
  CrossStorageHub._installListener = function() {
    var listener = CrossStorageHub._listener;
    if (window.addEventListener) {
      window.addEventListener('message', listener, false);
    } else {
      window.attachEvent('onmessage', listener);
    }
  };

  /**
   * The message handler for all requests posted to the window. It ignores any
   * messages having an origin that does not match the originally supplied
   * pattern. Given a JSON object with one of get, set, del or getKeys as the
   * method, the function performs the requested action and returns its result.
   *
   * @param {MessageEvent} message A message to be processed
   */
  CrossStorageHub._listener = function(message) {
    var origin, targetOrigin, request, method, error, result, response;

    // postMessage returns the string "null" as the origin for "file://"
    origin = (message.origin === 'null') ? 'file://' : message.origin;

    // Handle polling for a ready message
    if (message.data === 'cross-storage:poll') {
      return window.parent.postMessage('cross-storage:ready', message.origin);
    }

    // Ignore the ready message when viewing the hub directly
    if (message.data === 'cross-storage:ready') return;

    request = JSON.parse(message.data);
    method = request.method.split('cross-storage:')[1];

    if (!method) {
      return;
    } else if (!CrossStorageHub._permitted(origin, method)) {
      error = 'Invalid permissions for ' + method;
    } else {
      try {
        result = CrossStorageHub['_' + method](request.params);
      } catch (err) {
        error = err.message;
      }
    }

    response = JSON.stringify({
      id: request.id,
      error: error,
      result: result
    });

    // postMessage requires that the target origin be set to "*" for "file://"
    targetOrigin = (origin === 'file://') ? '*' : origin;

    window.parent.postMessage(response, targetOrigin);
  };

  /**
   * Returns a boolean indicating whether or not the requested method is
   * permitted for the given origin. The argument passed to method is expected
   * to be one of 'get', 'set', 'del' or 'getKeys'.
   *
   * @param   {string} origin The origin for which to determine permissions
   * @param   {string} method Requested action
   * @returns {bool}   Whether or not the request is permitted
   */
  CrossStorageHub._permitted = function(origin, method) {
    var available, i, entry, match;

    available = ['get', 'set', 'del', 'clear', 'getKeys'];
    if (!CrossStorageHub._inArray(method, available)) {
      return false;
    }

    for (i = 0; i < CrossStorageHub._permissions.length; i++) {
      entry = CrossStorageHub._permissions[i];
      if (!(entry.origin instanceof RegExp) || !(entry.allow instanceof Array)) {
        continue;
      }

      match = entry.origin.test(origin);
      if (match && CrossStorageHub._inArray(method, entry.allow)) {
        return true;
      }
    }

    return false;
  };

  /**
   * Sets a key to the specified value. If a ttl is provided, an expiration
   * timestamp is added to the object to be stored, prior to serialization.
   *
   * @param {object} params An object with key, value and optional ttl
   */
  CrossStorageHub._set = function(params) {
    var ttl, item;

    ttl = params.ttl;
    if (ttl && parseInt(ttl, 10) !== ttl) {
      throw new Error('ttl must be a number');
    }

    item = {value:  params.value};
    if (ttl) {
      item.expire = CrossStorageHub._now() + ttl;
    }

    window.localStorage.setItem(params.key, JSON.stringify(item));
  };

  /**
   * Accepts an object with an array of keys for which to retrieve their values.
   * Returns a single value if only one key was supplied, otherwise it returns
   * an array. Any keys not set, or expired, result in a null element in the
   * resulting array.
   *
   * @param   {object} params An object with an array of keys
   * @returns {*|*[]}  Either a single value, or an array
   */
  CrossStorageHub._get = function(params) {
    var storage, result, i, item, key;

    storage = window.localStorage;
    result = [];

    for (i = 0; i < params.keys.length; i++) {
      key = params.keys[i];
      item = JSON.parse(storage.getItem(key));

      if (item === null) {
        result.push(null);
      } else if (item.expire && item.expire < CrossStorageHub._now()) {
        storage.removeItem(key);
        result.push(null);
      } else {
        result.push(item.value);
      }
    }

    return (result.length > 1) ? result : result[0];
  };

  /**
   * Deletes all keys specified in the array found at params.keys.
   *
   * @param {object} params An object with an array of keys
   */
  CrossStorageHub._del = function(params) {
    for (var i = 0; i < params.keys.length; i++) {
      window.localStorage.removeItem(params.keys[i]);
    }
  };

  /**
   * Clears localStorage.
   */
  CrossStorageHub._clear = function() {
    window.localStorage.clear();
  };

  /**
   * Returns an array of all keys stored in localStorage.
   *
   * @returns {string[]} The array of keys
   */
  CrossStorageHub._getKeys = function(params) {
    var i, length, keys;

    keys = [];
    length = window.localStorage.length;

    for (i = 0; i < length; i++) {
      keys.push(window.localStorage.key(i));
    }

    return keys;
  };

  /**
   * Returns whether or not a value is present in the array. Consists of an
   * alternative to extending the array prototype for indexOf, since it's
   * unavailable for IE8.
   *
   * @param   {*}    value The value to find
   * @parma   {[]*}  array The array in which to search
   * @returns {bool} Whether or not the value was found
   */
  CrossStorageHub._inArray = function(value, array) {
    for (var i = 0; i < array.length; i++) {
      if (value === array[i]) return true;
    }

    return false;
  };

  /**
   * A cross-browser version of Date.now compatible with IE8 that avoids
   * modifying the Date object.
   *
   * @return {int} The current timestamp in milliseconds
   */
  CrossStorageHub._now = function() {
    if (typeof Date.now === 'function') {
      return Date.now();
    }

    return new Date().getTime();
  };

  /**
   * Export for various environments.
   */
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = CrossStorageHub;
  } else if (typeof exports !== 'undefined') {
    exports.CrossStorageHub = CrossStorageHub;
  } else if (typeof define === 'function' && define.amd) {
    define([], function() {
      return CrossStorageHub;
    });
  } else {
    root.CrossStorageHub = CrossStorageHub;
  }
}(this));

},{}],3:[function(require,module,exports){
module.exports = {
  CrossStorageClient: require('./client.js'),
  CrossStorageHub:    require('./hub.js')
};

},{"./client.js":1,"./hub.js":2}],4:[function(require,module,exports){
// browserify main.js | uglifyjs > bundle.js

var CrossStorageClient = require('cross-storage').CrossStorageClient;

(function(undefined) {

    var storage = null;
    var css = ".avion-sr-only {position: absolute;width: 1px;height: 1px;margin: -1px;padding: 0;overflow: hidden;clip: rect(0, 0, 0, 0);border: 0;}.avion-sr-only-focusable:active,.avion-sr-only-focusable:focus {position: static;width: auto;height: auto;margin: 0;overflow: visible;clip: auto;}.avion-close {float: right;font-size: 21px;font-weight: bold;line-height: 1;color: #000000;text-shadow: 0 1px 0 #ffffff;opacity: 0.2;filter: alpha(opacity=20);}.avion-close:hover,.avion-close:focus {color: #000000;text-decoration: none;cursor: pointer;opacity: 0.5;filter: alpha(opacity=50);}button.avion-close {padding: 0;cursor: pointer;background: transparent;border: 0;-webkit-appearance: none;}.avion-modal-open {overflow: hidden;}.avion-modal {display: none;overflow: hidden;position: fixed;top: 0;right: 0;bottom: 0;left: 0;z-index: 9999999 !important;-webkit-overflow-scrolling: touch;outline: 0;}.avion-modal.avion-fade .avion-modal-dialog {-webkit-transform: translate3d(0, -25%, 0);transform: translate3d(0, -25%, 0);-webkit-transition: -webkit-transform 0.3s ease-out;-moz-transition: -moz-transform 0.3s ease-out;-o-transition: -o-transform 0.3s ease-out;transition: transform 0.3s ease-out;}.avion-modal.in .avion-modal-dialog {-webkit-transform: translate3d(0, 0, 0);transform: translate3d(0, 0, 0);}.modal-open .avion-modal {overflow-x: hidden;overflow-y: auto;}.avion-modal-dialog {position: relative;width: auto;margin: 10px;}.avion-modal-content {position: relative;background-color: #ffffff;border: 1px solid #999999;border: 1px solid rgba(0, 0, 0, 0.2);border-radius: 6px;-webkit-box-shadow: 0 3px 9px rgba(0, 0, 0, 0.5);box-shadow: 0 3px 9px rgba(0, 0, 0, 0.5);background-clip: padding-box;outline: 0;}.modal-backdrop {position: fixed;top: 0;right: 0;bottom: 0;left: 0;z-index: 99989;background-color: #000000;}.modal-backdrop.avion-fade {opacity: 0;filter: alpha(opacity=0);}.modal-backdrop.in {opacity: 0.5;filter: alpha(opacity=50);}.avion-modal-header {padding: 15px;border-bottom: 1px solid #e5e5e5;min-height: 16.42857143px;}.avion-modal-header .avion-close {margin-top: -2px;}.avion-modal-title {margin: 0;line-height: 1.42857143;font-size: 16px;font-weight: bold;text-align: left;}.avion-modal-body {position: relative;padding: 15px;}.modal-scrollbar-measure {position: absolute;top: -9999px;width: 50px;height: 50px;overflow: scroll;}@media (min-width: 300px) {.avion-modal-dialog {width: 300px;margin: 30px auto;}.avion-modal-content {-webkit-box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);}.avion-modal-sm {width: 300px;}}@media (min-width: 992px) {.avion-modal-lg {width: 900px;}}.center-block {display: block;margin-left: auto;margin-right: auto;}@-ms-viewport {width: device-width;}@media (max-width: 599px) {.avion-hidden-xs {display: none !important;}}@media (min-width: 600px) and (max-width: 991px) {.avion-hidden-sm {display: none !important;}}@media (min-width: 992px) and (max-width: 1199px) {.avion-hidden-md {display: none !important;}}@media (min-width: 1200px) {.avion-hidden-lg {display: none !important;}}#avion-dialog-login, #avion-dialog-register {font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;font-size: 14px;line-height: 1.42857143;color: #333333;}.avion-btn-social {-moz-user-select: none;border: 1px solid transparent !important;border-radius: 4px !important;cursor: pointer !important;font-size: 16px !important;font-weight: normal !important;vertical-align: middle !important;white-space: nowrap !important;margin-bottom: 20px !important;position: relative !important;text-align: left !important;overflow: hidden !important;text-overflow: ellipsis !important;line-height: 1.33 !important;display: block !important;text-decoration: none !important;padding: 10px 12px 10px 60px !important;}.avion-btn-social :first-child {position: absolute !important;left: 0 !important;top: 0 !important;bottom: 0 !important;width: 42px !important;text-align: center !important;}.avion-btn-email {color: #fff !important;background-color: #696969 !important;}.avion-btn-email:hover, .avion-btn-email:focus, .avion-btn-email:active, .avion-btn-email.active, .open .dropdown-toggle.avion-btn-email {color: #fff !important;background-color: #555555 !important;}.avion-btn-email:active, .avion-btn-email.active, .open .dropdown-toggle.avion-btn-email {background-image: none !important;}.avion-btn-facebook {color: #fff !important;background-color: #3b5998 !important;}.avion-btn-facebook:hover, .avion-btn-facebook:focus, .avion-btn-facebook:active, .avion-btn-facebook.active, .open .dropdown-toggle.avion-btn-facebook {color: #fff !important;background-color: #30487b !important;}.avion-btn-facebook:active, .avion-btn-facebook.active, .open .dropdown-toggle.avion-btn-facebook {background-image: none !important;}.avion-btn-google-plus {color: #fff !important;background-color: #dd4b39 !important;}.avion-btn-google-plus:hover, .avion-btn-google-plus:focus, .avion-btn-google-plus:active, .avion-btn-google-plus.active, .open .dropdown-toggle.avion-btn-google-plus {color: #fff !important;background-color: #ca3523 !important;}.avion-btn-google-plus:active, .avion-btn-google-plus.active, .open .dropdown-toggle.avion-btn-google-plus {background-image: none !important;}.avion-btn-twitter {color: #fff !important;background-color: #2ba9e1 !important;}.avion-btn-twitter:hover, .avion-btn-twitter:focus, .avion-btn-twitter:active, .avion-btn-twitter.active, .open .dropdown-toggle.avion-btn-twitter {color: #fff !important;background-color: #1c92c7 !important;}.avion-btn-twitter:active, .avion-btn-twitter.active, .open .dropdown-toggle.avion-btn-twitter {background-image: none !important;}.avion-btn-instagram {color: #fff !important;background-color: #517fa4 !important;}.avion-btn-instagram:hover, .avion-btn-instagram:focus, .avion-btn-instagram:active, .avion-btn-instagram.active, .open .dropdown-toggle.avion-btn-instagram {color: #fff !important;background-color: #446a89 !important;}.avion-btn-instagram:active, .avion-btn-instagram.active, .open .dropdown-toggle.avion-btn-instagram {background-image: none !important;}.avion-social-icon {background-repeat: no-repeat !important;}.avion-social-icon.avion-email-icon {background-image: url('//sl.mingidea.com/social-login/assets/email-40.png');border-right: 1px solid #555555 !important;}.avion-social-icon.avion-facebook-icon {background-image: url('//sl.mingidea.com/social-login/assets/facebook-40.png');border-right: 1px solid #30487b !important;}.avion-social-icon.avion-google-plus-icon {background-image: url('//sl.mingidea.com/social-login/assets/google-plus-40.png');border-right: 1px solid #ca3523 !important;}.avion-social-icon.avion-twitter-icon {background-image: url('//sl.mingidea.com/social-login/assets/twitter-40.png');border-right: 1px solid #1c92c7 !important;}.avion-social-icon.avion-instagram-icon {background-image: url('//sl.mingidea.com/social-login/assets/instagram-40.png');border-right: 1px solid #446a89 !important;}";
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
            }));

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
    };
    var loginDialogHtml = '<div class="avion-modal avion-fade" id="avion-dialog-login"> <div class="avion-modal-dialog"> <div class="avion-modal-content"> <div class="avion-modal-header"> <button type="button" class="avion-close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="avion-sr-only">Close</span> </button> <div class="avion-modal-title">Sign In with Avi-on</div></div><div class="avion-modal-body"> <div style="display:inline-block;width: 230px;vertical-align: top;float: left;margin-left:10px;"> <form id="avion_login" method="post"> <label style="display: block !important;font-size: 16px !important;text-align: left !important;">Email Address</label> <input type="email" id="login_email" name="email" style="width: 100% !important;height: 30px !important;line-height: 30px !important;border: 1px solid #e3e3e3 !important;margin: 0 0 15px 0 !important;border-radius: 0 !important;box-shadow: none !important;padding: 5px !important;font-size: 16px !important;background-color: #FFFFFF !important;-webkit-box-sizing: content-box !important;box-sizing: content-box !important;"> <br><label style="display: block !important;font-size: 16px !important;text-align: left !important;">Password</label> <input type="password" name="password" style="width: 100% !important;height: 30px !important;line-height: 30px !important;border: 1px solid #e3e3e3 !important;margin: 0 0 15px 0 !important;border-radius: 0 !important;box-shadow: none !important;padding: 5px !important;font-size: 16px !important;background-color: #FFFFFF !important;-webkit-box-sizing: content-box !important;box-sizing: content-box !important;"> <br><input type="submit" value="Sign In" style="font: inherit !important;display: block !important;height: auto !important;border: 0 !important;color: #FFFFFF !important;text-align: center !important;padding: 10px 0 !important;width: 100px !important;border-radius: 4px !important;cursor: pointer !important;font-size: 14px !important;margin-bottom: 15px !important;background-color: #00abcb !important;text-transform: none !important;letter-spacing: 1px !important"> <p><a target="_blank" href="/login.php?action=create_account" class="avion-link" style="text-decoration: none !important;color: #555555 !important;">Create an account with Email</a> <br/><a target="_blank" href="/login.php?action=reset_password" style="text-decoration: none !important;color: #555555 !important;">Forgot your password ?</a> </p></form> </div><div style="clear: both;"></div></div></div></div></div>';
    var registerDialogHtml = '<div class="avion-modal avion-fade" id="avion-dialog-register"><div class="avion-modal-dialog" style="width: 410px"><div class="avion-modal-content"><div class="avion-modal-header"><button type="button" class="avion-close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="avion-sr-only">Close</span></button><div class="avion-modal-title">Create an Account</div></div><div class="avion-modal-body"><a href="/login.php?action=create_account" class="avion-btn-social avion-btn-email" title="Create An Account With Email"><span class="avion-social-icon avion-email-icon"></span>Create An Account With Email</a><a href="https://sl.mingidea.com/social-login/facebook/login?storeId=495&storeUrl=" class="avion-btn-social avion-btn-facebook" title="Sign In With Facebook"><span class="avion-social-icon avion-facebook-icon"></span>Sign in with Facebook</a></div></div></div></div>';
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
        loggedIn = null, userEmail = null,
        isLoggedIn = function(when) {

          if(loggedIn !== null) {
            return loggedIn;
          } else {
            storage.onConnect().then(function() {
              return storage.get('email');
            }).then(function(value) {
              console.log('value');
              console.log(value);
              if (value !== null) { loggedIn = true; userEmail = value; } else { loggedIn = false }
              storage.close();
            });
            return false;
          }
        },
        hookLoginAndRegisterLink = function() {
            $("body").delegate("a", "click", function(a) {
                a = this.pathname;
                var b = this.search;
                if ("/login.php" === a || "login.php" ===
                    a) {
                    if (-1 === b.indexOf("action=")) return onLoginClick(), setLoginRedirectUrl(), !1;
                    if (-1 < b.indexOf("action=create_account") && !$(this).hasClass("avion-link")) return onRegisterClick(), setLoginRedirectUrl(), !1
                }
            })
        },
        setLoginRedirectUrl = function() {
            // var a = location.pathname; - 1 < a.indexOf("/") && (a = a.substr(1, a.length));
            // a = storeUrl + "/login.php?from=" + encodeURIComponent(a);
            // try {
            //     var b;
            //     window.XMLHttpRequest ? b = new XMLHttpRequest : window.ActiveXObject && (b = new ActiveXObject("Microsoft.XMLHTTP"));
            //     b.open("GET", a);
            //     b.send(null)
            // } catch (c) {}
        };
    var $, loginDialog, registerDialog, isSupportsPostMessage = window.postMessage && window.addEventListener,
        storeUrl = location.protocol + "//" + location.host,
        initDialog = function() {
            var a = $("body");
            a.append(loginDialogHtml);
            a.append(registerDialogHtml);
            loginDialog = $("#avion-dialog-login").modal({
                backdrop: "static",
                keyboard: !0,
                show: !1
            });
            registerDialog = $("#avion-dialog-register").modal({
                backdrop: "static",
                keyboard: !0,
                show: !1
            });
            $("#avion_login").submit(function(evt) {
              console.log("submit");
              evt.preventDefault();
              //var data = {email: this.email.value, password: this.password.value};
              var data = {email: 'admin@avi-on.com', password: 'admin123456'};
              $.post({ url : 'https://dev.avi-on.com/api/sessions', crossDomain: true, data: data }, function(response) {
                console.log('success');
                console.log(response);
                signIn('matiasn_b@hotmail.com','aristoteles1');
              });
              return false;
            });


        },
        onLoginClick = function(a) {
            loginDialog.modal("show");
            if ( isLoggedIn('initDialog') ) {
              $("#login_email").val(userEmail);
            } else {

            }

            return !1
        },
        onRegisterClick = function() {
            registerDialog.modal("show");
            return !1
        },
        signIn = function(email, pwd) {
          console.log('signIn: ' + email + ', ' + pwd);
          post('/login.php?action=check_login', {login_email: email, login_pass: pwd});
        },
        post = function(a, b) {
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
                storage = new CrossStorageClient('http://localhost:9393/hub', {
                   timeout: 5000
                });
                setTimeout(function() { isLoggedIn() }, 1000);


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

},{"cross-storage":3}]},{},[4]);
