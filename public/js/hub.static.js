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
var CrossStorageHub    = require('cross-storage').CrossStorageHub;

CrossStorageHub.init([
  {origin: /localhost:9393$/, allow: ['get', 'set', 'del', 'getKeys', 'clear']},
  {origin: /store-fs7zl9.mybigcommerce.com$/, allow: ['get', 'set', 'del', 'getKeys', 'clear']}
]);

},{"cross-storage":3}]},{},[4]);