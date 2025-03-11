(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Sortable = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict';

var fillIn = require('mout/object/fillIn');
var indexOf = require('mout/array/indexOf');

/**
 * Create a new Sortable
 *
 * @param {Element} el
 * @param {Object} options
 *
 * @return {Sortable}
 */
var Sortable = function(el, options) {
	if (!(this instanceof Sortable)) {
		return new Sortable(el, options);
	}

	this.el = el;
	this.options = fillIn(options || {}, Sortable.defaults);
	this._build();
	this._setEvents();
};

/**
 * Default options
 */
Sortable.defaults = {
	handle: '',
	placeholderClass: 'sortable-placeholder'
};

/**
 * Build required elements
 */
Sortable.prototype._build = function() {
	var placeholder = document.createElement('li');
	placeholder.classList.add(this.options.placeholderClass);
	this.placeholder = placeholder;
};

/**
 * Set required events
 */
Sortable.prototype._setEvents = function() {
	var self = this;
	var allowDrag = false;

	/**
	 * Use mousedown to check if handle is being pressed
	 */
	self.el.addEventListener('mousedown', function(e) {
		if (!self.options.handle) allowDrag = true;

		if (self.options.handle && e.target.matches(self.options.handle)) {
			allowDrag = true;
		}
	});

	/**
	 * Start dragging an element in the sortable
	 */
	self.el.addEventListener('dragstart', function(e) {
		if (!allowDrag) {
			e.preventDefault();
			return;
		}

		e.stopPropagation();

		allowDrag = false;
		self.dragging = true;
		self.dragEl = e.target;

		// needed for drag to work in FF
		e.dataTransfer.setData('text', '');

		// delay needed cause the dragImage won't be created properly otherwise
		setTimeout(function() {
			var rect = e.target.getBoundingClientRect();
			self.placeholder.style.height = (rect.bottom - rect.top) + 'px';
			self.el.insertBefore(self.placeholder, e.target);
			e.target.style.display = 'none';
		}, 1);
	});

	/**
	 * This fires when the order potentially changes
	 */
	self.el.addEventListener('dragenter', function(e) {
		if (!self.dragging || e.target === self.placeholder) return;

		e.stopPropagation();

		var item = self.getItem(e.target);
		if (!item) return;

		var placeholderIndex = indexOf(self.el.children, self.placeholder);
		var itemIndex = indexOf(self.el.children, item);

		var before = placeholderIndex === -1 || placeholderIndex > itemIndex;
		self.el.insertBefore(self.placeholder, before ? item : item.nextSibling);
	});

	/**
	 * Dragend should be attached to the body in case it happens outside the element
	 */
	document.body.addEventListener('dragend', function(e) {
		if (!self.dragging) return;

		e.stopPropagation();

		self.dragging = false;
		self.el.insertBefore(self.dragEl, self.placeholder);
		self.dragEl.style.display = 'block';
		self.el.removeChild(self.placeholder);
		self.placeholder.style.height = '';
	});
};

/**
 * Get the item which is being dragged, relative to given element
 *
 * @param {Element} el
 */
Sortable.prototype.getItem = function(el) {
	var children = this.el.children;
	var index;

	while (el.parentNode) {
		index = indexOf(children, el);
		if (index !== -1 && el !== this.placeholder) {
			return el;
		}
		el = el.parentNode;
	}
};

module.exports = Sortable;

},{"mout/array/indexOf":3,"mout/object/fillIn":5}],2:[function(require,module,exports){


    /**
     * Array forEach
     */
    function forEach(arr, callback, thisObj) {
        if (arr == null) {
            return;
        }
        var i = -1,
            len = arr.length;
        while (++i < len) {
            // we iterate over sparse items since there is no way to make it
            // work properly on IE 7-8. see #64
            if ( callback.call(thisObj, arr[i], i, arr) === false ) {
                break;
            }
        }
    }

    module.exports = forEach;



},{}],3:[function(require,module,exports){


    /**
     * Array.indexOf
     */
    function indexOf(arr, item, fromIndex) {
        fromIndex = fromIndex || 0;
        if (arr == null) {
            return -1;
        }

        var len = arr.length,
            i = fromIndex < 0 ? len + fromIndex : fromIndex;
        while (i < len) {
            // we iterate over sparse items since there is no way to make it
            // work properly on IE 7-8. see #64
            if (arr[i] === item) {
                return i;
            }

            i++;
        }

        return -1;
    }

    module.exports = indexOf;


},{}],4:[function(require,module,exports){


    /**
     * Create slice of source array or array-like object
     */
    function slice(arr, start, end){
        var len = arr.length;

        if (start == null) {
            start = 0;
        } else if (start < 0) {
            start = Math.max(len + start, 0);
        } else {
            start = Math.min(start, len);
        }

        if (end == null) {
            end = len;
        } else if (end < 0) {
            end = Math.max(len + end, 0);
        } else {
            end = Math.min(end, len);
        }

        var result = [];
        while (start < end) {
            result.push(arr[start++]);
        }

        return result;
    }

    module.exports = slice;



},{}],5:[function(require,module,exports){
var forEach = require('../array/forEach');
var slice = require('../array/slice');
var forOwn = require('./forOwn');

    /**
     * Copy missing properties in the obj from the defaults.
     */
    function fillIn(obj, var_defaults){
        forEach(slice(arguments, 1), function(base){
            forOwn(base, function(val, key){
                if (obj[key] == null) {
                    obj[key] = val;
                }
            });
        });
        return obj;
    }

    module.exports = fillIn;



},{"../array/forEach":2,"../array/slice":4,"./forOwn":7}],6:[function(require,module,exports){
var hasOwn = require('./hasOwn');

    var _hasDontEnumBug,
        _dontEnums;

    function checkDontEnum(){
        _dontEnums = [
                'toString',
                'toLocaleString',
                'valueOf',
                'hasOwnProperty',
                'isPrototypeOf',
                'propertyIsEnumerable',
                'constructor'
            ];

        _hasDontEnumBug = true;

        for (var key in {'toString': null}) {
            _hasDontEnumBug = false;
        }
    }

    /**
     * Similar to Array/forEach but works over object properties and fixes Don't
     * Enum bug on IE.
     * based on: http://whattheheadsaid.com/2010/10/a-safer-object-keys-compatibility-implementation
     */
    function forIn(obj, fn, thisObj){
        var key, i = 0;
        // no need to check if argument is a real object that way we can use
        // it for arrays, functions, date, etc.

        //post-pone check till needed
        if (_hasDontEnumBug == null) checkDontEnum();

        for (key in obj) {
            if (exec(fn, obj, key, thisObj) === false) {
                break;
            }
        }


        if (_hasDontEnumBug) {
            var ctor = obj.constructor,
                isProto = !!ctor && obj === ctor.prototype;

            while (key = _dontEnums[i++]) {
                // For constructor, if it is a prototype object the constructor
                // is always non-enumerable unless defined otherwise (and
                // enumerated above).  For non-prototype objects, it will have
                // to be defined on this object, since it cannot be defined on
                // any prototype objects.
                //
                // For other [[DontEnum]] properties, check if the value is
                // different than Object prototype value.
                if (
                    (key !== 'constructor' ||
                        (!isProto && hasOwn(obj, key))) &&
                    obj[key] !== Object.prototype[key]
                ) {
                    if (exec(fn, obj, key, thisObj) === false) {
                        break;
                    }
                }
            }
        }
    }

    function exec(fn, obj, key, thisObj){
        return fn.call(thisObj, obj[key], key, obj);
    }

    module.exports = forIn;



},{"./hasOwn":8}],7:[function(require,module,exports){
var hasOwn = require('./hasOwn');
var forIn = require('./forIn');

    /**
     * Similar to Array/forEach but works over object properties and fixes Don't
     * Enum bug on IE.
     * based on: http://whattheheadsaid.com/2010/10/a-safer-object-keys-compatibility-implementation
     */
    function forOwn(obj, fn, thisObj){
        forIn(obj, function(val, key){
            if (hasOwn(obj, key)) {
                return fn.call(thisObj, obj[key], key, obj);
            }
        });
    }

    module.exports = forOwn;



},{"./forIn":6,"./hasOwn":8}],8:[function(require,module,exports){


    /**
     * Safer Object.hasOwnProperty
     */
     function hasOwn(obj, prop){
         return Object.prototype.hasOwnProperty.call(obj, prop);
     }

     module.exports = hasOwn;



},{}]},{},[1])(1)
});
