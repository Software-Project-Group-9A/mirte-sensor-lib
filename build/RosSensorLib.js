(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
(function (global){(function (){
/**
 * Lodash (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright JS Foundation and other contributors <https://js.foundation/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */

/** Used as the size to enable large array optimizations. */
var LARGE_ARRAY_SIZE = 200;

/** Used to stand-in for `undefined` hash values. */
var HASH_UNDEFINED = '__lodash_hash_undefined__';

/** Used to compose bitmasks for value comparisons. */
var COMPARE_PARTIAL_FLAG = 1,
    COMPARE_UNORDERED_FLAG = 2;

/** Used as references for various `Number` constants. */
var MAX_SAFE_INTEGER = 9007199254740991;

/** `Object#toString` result references. */
var argsTag = '[object Arguments]',
    arrayTag = '[object Array]',
    asyncTag = '[object AsyncFunction]',
    boolTag = '[object Boolean]',
    dateTag = '[object Date]',
    errorTag = '[object Error]',
    funcTag = '[object Function]',
    genTag = '[object GeneratorFunction]',
    mapTag = '[object Map]',
    numberTag = '[object Number]',
    nullTag = '[object Null]',
    objectTag = '[object Object]',
    promiseTag = '[object Promise]',
    proxyTag = '[object Proxy]',
    regexpTag = '[object RegExp]',
    setTag = '[object Set]',
    stringTag = '[object String]',
    symbolTag = '[object Symbol]',
    undefinedTag = '[object Undefined]',
    weakMapTag = '[object WeakMap]';

var arrayBufferTag = '[object ArrayBuffer]',
    dataViewTag = '[object DataView]',
    float32Tag = '[object Float32Array]',
    float64Tag = '[object Float64Array]',
    int8Tag = '[object Int8Array]',
    int16Tag = '[object Int16Array]',
    int32Tag = '[object Int32Array]',
    uint8Tag = '[object Uint8Array]',
    uint8ClampedTag = '[object Uint8ClampedArray]',
    uint16Tag = '[object Uint16Array]',
    uint32Tag = '[object Uint32Array]';

/**
 * Used to match `RegExp`
 * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
 */
var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;

/** Used to detect host constructors (Safari). */
var reIsHostCtor = /^\[object .+?Constructor\]$/;

/** Used to detect unsigned integer values. */
var reIsUint = /^(?:0|[1-9]\d*)$/;

/** Used to identify `toStringTag` values of typed arrays. */
var typedArrayTags = {};
typedArrayTags[float32Tag] = typedArrayTags[float64Tag] =
typedArrayTags[int8Tag] = typedArrayTags[int16Tag] =
typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] =
typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] =
typedArrayTags[uint32Tag] = true;
typedArrayTags[argsTag] = typedArrayTags[arrayTag] =
typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] =
typedArrayTags[dataViewTag] = typedArrayTags[dateTag] =
typedArrayTags[errorTag] = typedArrayTags[funcTag] =
typedArrayTags[mapTag] = typedArrayTags[numberTag] =
typedArrayTags[objectTag] = typedArrayTags[regexpTag] =
typedArrayTags[setTag] = typedArrayTags[stringTag] =
typedArrayTags[weakMapTag] = false;

/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = freeGlobal || freeSelf || Function('return this')();

/** Detect free variable `exports`. */
var freeExports = typeof exports == 'object' && exports && !exports.nodeType && exports;

/** Detect free variable `module`. */
var freeModule = freeExports && typeof module == 'object' && module && !module.nodeType && module;

/** Detect the popular CommonJS extension `module.exports`. */
var moduleExports = freeModule && freeModule.exports === freeExports;

/** Detect free variable `process` from Node.js. */
var freeProcess = moduleExports && freeGlobal.process;

/** Used to access faster Node.js helpers. */
var nodeUtil = (function() {
  try {
    return freeProcess && freeProcess.binding && freeProcess.binding('util');
  } catch (e) {}
}());

/* Node.js helper references. */
var nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray;

/**
 * A specialized version of `_.filter` for arrays without support for
 * iteratee shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} predicate The function invoked per iteration.
 * @returns {Array} Returns the new filtered array.
 */
function arrayFilter(array, predicate) {
  var index = -1,
      length = array == null ? 0 : array.length,
      resIndex = 0,
      result = [];

  while (++index < length) {
    var value = array[index];
    if (predicate(value, index, array)) {
      result[resIndex++] = value;
    }
  }
  return result;
}

/**
 * Appends the elements of `values` to `array`.
 *
 * @private
 * @param {Array} array The array to modify.
 * @param {Array} values The values to append.
 * @returns {Array} Returns `array`.
 */
function arrayPush(array, values) {
  var index = -1,
      length = values.length,
      offset = array.length;

  while (++index < length) {
    array[offset + index] = values[index];
  }
  return array;
}

/**
 * A specialized version of `_.some` for arrays without support for iteratee
 * shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} predicate The function invoked per iteration.
 * @returns {boolean} Returns `true` if any element passes the predicate check,
 *  else `false`.
 */
function arraySome(array, predicate) {
  var index = -1,
      length = array == null ? 0 : array.length;

  while (++index < length) {
    if (predicate(array[index], index, array)) {
      return true;
    }
  }
  return false;
}

/**
 * The base implementation of `_.times` without support for iteratee shorthands
 * or max array length checks.
 *
 * @private
 * @param {number} n The number of times to invoke `iteratee`.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the array of results.
 */
function baseTimes(n, iteratee) {
  var index = -1,
      result = Array(n);

  while (++index < n) {
    result[index] = iteratee(index);
  }
  return result;
}

/**
 * The base implementation of `_.unary` without support for storing metadata.
 *
 * @private
 * @param {Function} func The function to cap arguments for.
 * @returns {Function} Returns the new capped function.
 */
function baseUnary(func) {
  return function(value) {
    return func(value);
  };
}

/**
 * Checks if a `cache` value for `key` exists.
 *
 * @private
 * @param {Object} cache The cache to query.
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function cacheHas(cache, key) {
  return cache.has(key);
}

/**
 * Gets the value at `key` of `object`.
 *
 * @private
 * @param {Object} [object] The object to query.
 * @param {string} key The key of the property to get.
 * @returns {*} Returns the property value.
 */
function getValue(object, key) {
  return object == null ? undefined : object[key];
}

/**
 * Converts `map` to its key-value pairs.
 *
 * @private
 * @param {Object} map The map to convert.
 * @returns {Array} Returns the key-value pairs.
 */
function mapToArray(map) {
  var index = -1,
      result = Array(map.size);

  map.forEach(function(value, key) {
    result[++index] = [key, value];
  });
  return result;
}

/**
 * Creates a unary function that invokes `func` with its argument transformed.
 *
 * @private
 * @param {Function} func The function to wrap.
 * @param {Function} transform The argument transform.
 * @returns {Function} Returns the new function.
 */
function overArg(func, transform) {
  return function(arg) {
    return func(transform(arg));
  };
}

/**
 * Converts `set` to an array of its values.
 *
 * @private
 * @param {Object} set The set to convert.
 * @returns {Array} Returns the values.
 */
function setToArray(set) {
  var index = -1,
      result = Array(set.size);

  set.forEach(function(value) {
    result[++index] = value;
  });
  return result;
}

/** Used for built-in method references. */
var arrayProto = Array.prototype,
    funcProto = Function.prototype,
    objectProto = Object.prototype;

/** Used to detect overreaching core-js shims. */
var coreJsData = root['__core-js_shared__'];

/** Used to resolve the decompiled source of functions. */
var funcToString = funcProto.toString;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/** Used to detect methods masquerading as native. */
var maskSrcKey = (function() {
  var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || '');
  return uid ? ('Symbol(src)_1.' + uid) : '';
}());

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var nativeObjectToString = objectProto.toString;

/** Used to detect if a method is native. */
var reIsNative = RegExp('^' +
  funcToString.call(hasOwnProperty).replace(reRegExpChar, '\\$&')
  .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
);

/** Built-in value references. */
var Buffer = moduleExports ? root.Buffer : undefined,
    Symbol = root.Symbol,
    Uint8Array = root.Uint8Array,
    propertyIsEnumerable = objectProto.propertyIsEnumerable,
    splice = arrayProto.splice,
    symToStringTag = Symbol ? Symbol.toStringTag : undefined;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeGetSymbols = Object.getOwnPropertySymbols,
    nativeIsBuffer = Buffer ? Buffer.isBuffer : undefined,
    nativeKeys = overArg(Object.keys, Object);

/* Built-in method references that are verified to be native. */
var DataView = getNative(root, 'DataView'),
    Map = getNative(root, 'Map'),
    Promise = getNative(root, 'Promise'),
    Set = getNative(root, 'Set'),
    WeakMap = getNative(root, 'WeakMap'),
    nativeCreate = getNative(Object, 'create');

/** Used to detect maps, sets, and weakmaps. */
var dataViewCtorString = toSource(DataView),
    mapCtorString = toSource(Map),
    promiseCtorString = toSource(Promise),
    setCtorString = toSource(Set),
    weakMapCtorString = toSource(WeakMap);

/** Used to convert symbols to primitives and strings. */
var symbolProto = Symbol ? Symbol.prototype : undefined,
    symbolValueOf = symbolProto ? symbolProto.valueOf : undefined;

/**
 * Creates a hash object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function Hash(entries) {
  var index = -1,
      length = entries == null ? 0 : entries.length;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

/**
 * Removes all key-value entries from the hash.
 *
 * @private
 * @name clear
 * @memberOf Hash
 */
function hashClear() {
  this.__data__ = nativeCreate ? nativeCreate(null) : {};
  this.size = 0;
}

/**
 * Removes `key` and its value from the hash.
 *
 * @private
 * @name delete
 * @memberOf Hash
 * @param {Object} hash The hash to modify.
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function hashDelete(key) {
  var result = this.has(key) && delete this.__data__[key];
  this.size -= result ? 1 : 0;
  return result;
}

/**
 * Gets the hash value for `key`.
 *
 * @private
 * @name get
 * @memberOf Hash
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function hashGet(key) {
  var data = this.__data__;
  if (nativeCreate) {
    var result = data[key];
    return result === HASH_UNDEFINED ? undefined : result;
  }
  return hasOwnProperty.call(data, key) ? data[key] : undefined;
}

/**
 * Checks if a hash value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf Hash
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function hashHas(key) {
  var data = this.__data__;
  return nativeCreate ? (data[key] !== undefined) : hasOwnProperty.call(data, key);
}

/**
 * Sets the hash `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf Hash
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the hash instance.
 */
function hashSet(key, value) {
  var data = this.__data__;
  this.size += this.has(key) ? 0 : 1;
  data[key] = (nativeCreate && value === undefined) ? HASH_UNDEFINED : value;
  return this;
}

// Add methods to `Hash`.
Hash.prototype.clear = hashClear;
Hash.prototype['delete'] = hashDelete;
Hash.prototype.get = hashGet;
Hash.prototype.has = hashHas;
Hash.prototype.set = hashSet;

/**
 * Creates an list cache object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function ListCache(entries) {
  var index = -1,
      length = entries == null ? 0 : entries.length;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

/**
 * Removes all key-value entries from the list cache.
 *
 * @private
 * @name clear
 * @memberOf ListCache
 */
function listCacheClear() {
  this.__data__ = [];
  this.size = 0;
}

/**
 * Removes `key` and its value from the list cache.
 *
 * @private
 * @name delete
 * @memberOf ListCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function listCacheDelete(key) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  if (index < 0) {
    return false;
  }
  var lastIndex = data.length - 1;
  if (index == lastIndex) {
    data.pop();
  } else {
    splice.call(data, index, 1);
  }
  --this.size;
  return true;
}

/**
 * Gets the list cache value for `key`.
 *
 * @private
 * @name get
 * @memberOf ListCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function listCacheGet(key) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  return index < 0 ? undefined : data[index][1];
}

/**
 * Checks if a list cache value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf ListCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function listCacheHas(key) {
  return assocIndexOf(this.__data__, key) > -1;
}

/**
 * Sets the list cache `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf ListCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the list cache instance.
 */
function listCacheSet(key, value) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  if (index < 0) {
    ++this.size;
    data.push([key, value]);
  } else {
    data[index][1] = value;
  }
  return this;
}

// Add methods to `ListCache`.
ListCache.prototype.clear = listCacheClear;
ListCache.prototype['delete'] = listCacheDelete;
ListCache.prototype.get = listCacheGet;
ListCache.prototype.has = listCacheHas;
ListCache.prototype.set = listCacheSet;

/**
 * Creates a map cache object to store key-value pairs.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function MapCache(entries) {
  var index = -1,
      length = entries == null ? 0 : entries.length;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

/**
 * Removes all key-value entries from the map.
 *
 * @private
 * @name clear
 * @memberOf MapCache
 */
function mapCacheClear() {
  this.size = 0;
  this.__data__ = {
    'hash': new Hash,
    'map': new (Map || ListCache),
    'string': new Hash
  };
}

/**
 * Removes `key` and its value from the map.
 *
 * @private
 * @name delete
 * @memberOf MapCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function mapCacheDelete(key) {
  var result = getMapData(this, key)['delete'](key);
  this.size -= result ? 1 : 0;
  return result;
}

/**
 * Gets the map value for `key`.
 *
 * @private
 * @name get
 * @memberOf MapCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function mapCacheGet(key) {
  return getMapData(this, key).get(key);
}

/**
 * Checks if a map value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf MapCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function mapCacheHas(key) {
  return getMapData(this, key).has(key);
}

/**
 * Sets the map `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf MapCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the map cache instance.
 */
function mapCacheSet(key, value) {
  var data = getMapData(this, key),
      size = data.size;

  data.set(key, value);
  this.size += data.size == size ? 0 : 1;
  return this;
}

// Add methods to `MapCache`.
MapCache.prototype.clear = mapCacheClear;
MapCache.prototype['delete'] = mapCacheDelete;
MapCache.prototype.get = mapCacheGet;
MapCache.prototype.has = mapCacheHas;
MapCache.prototype.set = mapCacheSet;

/**
 *
 * Creates an array cache object to store unique values.
 *
 * @private
 * @constructor
 * @param {Array} [values] The values to cache.
 */
function SetCache(values) {
  var index = -1,
      length = values == null ? 0 : values.length;

  this.__data__ = new MapCache;
  while (++index < length) {
    this.add(values[index]);
  }
}

/**
 * Adds `value` to the array cache.
 *
 * @private
 * @name add
 * @memberOf SetCache
 * @alias push
 * @param {*} value The value to cache.
 * @returns {Object} Returns the cache instance.
 */
function setCacheAdd(value) {
  this.__data__.set(value, HASH_UNDEFINED);
  return this;
}

/**
 * Checks if `value` is in the array cache.
 *
 * @private
 * @name has
 * @memberOf SetCache
 * @param {*} value The value to search for.
 * @returns {number} Returns `true` if `value` is found, else `false`.
 */
function setCacheHas(value) {
  return this.__data__.has(value);
}

// Add methods to `SetCache`.
SetCache.prototype.add = SetCache.prototype.push = setCacheAdd;
SetCache.prototype.has = setCacheHas;

/**
 * Creates a stack cache object to store key-value pairs.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function Stack(entries) {
  var data = this.__data__ = new ListCache(entries);
  this.size = data.size;
}

/**
 * Removes all key-value entries from the stack.
 *
 * @private
 * @name clear
 * @memberOf Stack
 */
function stackClear() {
  this.__data__ = new ListCache;
  this.size = 0;
}

/**
 * Removes `key` and its value from the stack.
 *
 * @private
 * @name delete
 * @memberOf Stack
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function stackDelete(key) {
  var data = this.__data__,
      result = data['delete'](key);

  this.size = data.size;
  return result;
}

/**
 * Gets the stack value for `key`.
 *
 * @private
 * @name get
 * @memberOf Stack
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function stackGet(key) {
  return this.__data__.get(key);
}

/**
 * Checks if a stack value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf Stack
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function stackHas(key) {
  return this.__data__.has(key);
}

/**
 * Sets the stack `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf Stack
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the stack cache instance.
 */
function stackSet(key, value) {
  var data = this.__data__;
  if (data instanceof ListCache) {
    var pairs = data.__data__;
    if (!Map || (pairs.length < LARGE_ARRAY_SIZE - 1)) {
      pairs.push([key, value]);
      this.size = ++data.size;
      return this;
    }
    data = this.__data__ = new MapCache(pairs);
  }
  data.set(key, value);
  this.size = data.size;
  return this;
}

// Add methods to `Stack`.
Stack.prototype.clear = stackClear;
Stack.prototype['delete'] = stackDelete;
Stack.prototype.get = stackGet;
Stack.prototype.has = stackHas;
Stack.prototype.set = stackSet;

/**
 * Creates an array of the enumerable property names of the array-like `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @param {boolean} inherited Specify returning inherited property names.
 * @returns {Array} Returns the array of property names.
 */
function arrayLikeKeys(value, inherited) {
  var isArr = isArray(value),
      isArg = !isArr && isArguments(value),
      isBuff = !isArr && !isArg && isBuffer(value),
      isType = !isArr && !isArg && !isBuff && isTypedArray(value),
      skipIndexes = isArr || isArg || isBuff || isType,
      result = skipIndexes ? baseTimes(value.length, String) : [],
      length = result.length;

  for (var key in value) {
    if ((inherited || hasOwnProperty.call(value, key)) &&
        !(skipIndexes && (
           // Safari 9 has enumerable `arguments.length` in strict mode.
           key == 'length' ||
           // Node.js 0.10 has enumerable non-index properties on buffers.
           (isBuff && (key == 'offset' || key == 'parent')) ||
           // PhantomJS 2 has enumerable non-index properties on typed arrays.
           (isType && (key == 'buffer' || key == 'byteLength' || key == 'byteOffset')) ||
           // Skip index properties.
           isIndex(key, length)
        ))) {
      result.push(key);
    }
  }
  return result;
}

/**
 * Gets the index at which the `key` is found in `array` of key-value pairs.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {*} key The key to search for.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function assocIndexOf(array, key) {
  var length = array.length;
  while (length--) {
    if (eq(array[length][0], key)) {
      return length;
    }
  }
  return -1;
}

/**
 * The base implementation of `getAllKeys` and `getAllKeysIn` which uses
 * `keysFunc` and `symbolsFunc` to get the enumerable property names and
 * symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Function} keysFunc The function to get the keys of `object`.
 * @param {Function} symbolsFunc The function to get the symbols of `object`.
 * @returns {Array} Returns the array of property names and symbols.
 */
function baseGetAllKeys(object, keysFunc, symbolsFunc) {
  var result = keysFunc(object);
  return isArray(object) ? result : arrayPush(result, symbolsFunc(object));
}

/**
 * The base implementation of `getTag` without fallbacks for buggy environments.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
function baseGetTag(value) {
  if (value == null) {
    return value === undefined ? undefinedTag : nullTag;
  }
  return (symToStringTag && symToStringTag in Object(value))
    ? getRawTag(value)
    : objectToString(value);
}

/**
 * The base implementation of `_.isArguments`.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
 */
function baseIsArguments(value) {
  return isObjectLike(value) && baseGetTag(value) == argsTag;
}

/**
 * The base implementation of `_.isEqual` which supports partial comparisons
 * and tracks traversed objects.
 *
 * @private
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @param {boolean} bitmask The bitmask flags.
 *  1 - Unordered comparison
 *  2 - Partial comparison
 * @param {Function} [customizer] The function to customize comparisons.
 * @param {Object} [stack] Tracks traversed `value` and `other` objects.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 */
function baseIsEqual(value, other, bitmask, customizer, stack) {
  if (value === other) {
    return true;
  }
  if (value == null || other == null || (!isObjectLike(value) && !isObjectLike(other))) {
    return value !== value && other !== other;
  }
  return baseIsEqualDeep(value, other, bitmask, customizer, baseIsEqual, stack);
}

/**
 * A specialized version of `baseIsEqual` for arrays and objects which performs
 * deep comparisons and tracks traversed objects enabling objects with circular
 * references to be compared.
 *
 * @private
 * @param {Object} object The object to compare.
 * @param {Object} other The other object to compare.
 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
 * @param {Function} customizer The function to customize comparisons.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Object} [stack] Tracks traversed `object` and `other` objects.
 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
 */
function baseIsEqualDeep(object, other, bitmask, customizer, equalFunc, stack) {
  var objIsArr = isArray(object),
      othIsArr = isArray(other),
      objTag = objIsArr ? arrayTag : getTag(object),
      othTag = othIsArr ? arrayTag : getTag(other);

  objTag = objTag == argsTag ? objectTag : objTag;
  othTag = othTag == argsTag ? objectTag : othTag;

  var objIsObj = objTag == objectTag,
      othIsObj = othTag == objectTag,
      isSameTag = objTag == othTag;

  if (isSameTag && isBuffer(object)) {
    if (!isBuffer(other)) {
      return false;
    }
    objIsArr = true;
    objIsObj = false;
  }
  if (isSameTag && !objIsObj) {
    stack || (stack = new Stack);
    return (objIsArr || isTypedArray(object))
      ? equalArrays(object, other, bitmask, customizer, equalFunc, stack)
      : equalByTag(object, other, objTag, bitmask, customizer, equalFunc, stack);
  }
  if (!(bitmask & COMPARE_PARTIAL_FLAG)) {
    var objIsWrapped = objIsObj && hasOwnProperty.call(object, '__wrapped__'),
        othIsWrapped = othIsObj && hasOwnProperty.call(other, '__wrapped__');

    if (objIsWrapped || othIsWrapped) {
      var objUnwrapped = objIsWrapped ? object.value() : object,
          othUnwrapped = othIsWrapped ? other.value() : other;

      stack || (stack = new Stack);
      return equalFunc(objUnwrapped, othUnwrapped, bitmask, customizer, stack);
    }
  }
  if (!isSameTag) {
    return false;
  }
  stack || (stack = new Stack);
  return equalObjects(object, other, bitmask, customizer, equalFunc, stack);
}

/**
 * The base implementation of `_.isNative` without bad shim checks.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a native function,
 *  else `false`.
 */
function baseIsNative(value) {
  if (!isObject(value) || isMasked(value)) {
    return false;
  }
  var pattern = isFunction(value) ? reIsNative : reIsHostCtor;
  return pattern.test(toSource(value));
}

/**
 * The base implementation of `_.isTypedArray` without Node.js optimizations.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
 */
function baseIsTypedArray(value) {
  return isObjectLike(value) &&
    isLength(value.length) && !!typedArrayTags[baseGetTag(value)];
}

/**
 * The base implementation of `_.keys` which doesn't treat sparse arrays as dense.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */
function baseKeys(object) {
  if (!isPrototype(object)) {
    return nativeKeys(object);
  }
  var result = [];
  for (var key in Object(object)) {
    if (hasOwnProperty.call(object, key) && key != 'constructor') {
      result.push(key);
    }
  }
  return result;
}

/**
 * A specialized version of `baseIsEqualDeep` for arrays with support for
 * partial deep comparisons.
 *
 * @private
 * @param {Array} array The array to compare.
 * @param {Array} other The other array to compare.
 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
 * @param {Function} customizer The function to customize comparisons.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Object} stack Tracks traversed `array` and `other` objects.
 * @returns {boolean} Returns `true` if the arrays are equivalent, else `false`.
 */
function equalArrays(array, other, bitmask, customizer, equalFunc, stack) {
  var isPartial = bitmask & COMPARE_PARTIAL_FLAG,
      arrLength = array.length,
      othLength = other.length;

  if (arrLength != othLength && !(isPartial && othLength > arrLength)) {
    return false;
  }
  // Assume cyclic values are equal.
  var stacked = stack.get(array);
  if (stacked && stack.get(other)) {
    return stacked == other;
  }
  var index = -1,
      result = true,
      seen = (bitmask & COMPARE_UNORDERED_FLAG) ? new SetCache : undefined;

  stack.set(array, other);
  stack.set(other, array);

  // Ignore non-index properties.
  while (++index < arrLength) {
    var arrValue = array[index],
        othValue = other[index];

    if (customizer) {
      var compared = isPartial
        ? customizer(othValue, arrValue, index, other, array, stack)
        : customizer(arrValue, othValue, index, array, other, stack);
    }
    if (compared !== undefined) {
      if (compared) {
        continue;
      }
      result = false;
      break;
    }
    // Recursively compare arrays (susceptible to call stack limits).
    if (seen) {
      if (!arraySome(other, function(othValue, othIndex) {
            if (!cacheHas(seen, othIndex) &&
                (arrValue === othValue || equalFunc(arrValue, othValue, bitmask, customizer, stack))) {
              return seen.push(othIndex);
            }
          })) {
        result = false;
        break;
      }
    } else if (!(
          arrValue === othValue ||
            equalFunc(arrValue, othValue, bitmask, customizer, stack)
        )) {
      result = false;
      break;
    }
  }
  stack['delete'](array);
  stack['delete'](other);
  return result;
}

/**
 * A specialized version of `baseIsEqualDeep` for comparing objects of
 * the same `toStringTag`.
 *
 * **Note:** This function only supports comparing values with tags of
 * `Boolean`, `Date`, `Error`, `Number`, `RegExp`, or `String`.
 *
 * @private
 * @param {Object} object The object to compare.
 * @param {Object} other The other object to compare.
 * @param {string} tag The `toStringTag` of the objects to compare.
 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
 * @param {Function} customizer The function to customize comparisons.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Object} stack Tracks traversed `object` and `other` objects.
 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
 */
function equalByTag(object, other, tag, bitmask, customizer, equalFunc, stack) {
  switch (tag) {
    case dataViewTag:
      if ((object.byteLength != other.byteLength) ||
          (object.byteOffset != other.byteOffset)) {
        return false;
      }
      object = object.buffer;
      other = other.buffer;

    case arrayBufferTag:
      if ((object.byteLength != other.byteLength) ||
          !equalFunc(new Uint8Array(object), new Uint8Array(other))) {
        return false;
      }
      return true;

    case boolTag:
    case dateTag:
    case numberTag:
      // Coerce booleans to `1` or `0` and dates to milliseconds.
      // Invalid dates are coerced to `NaN`.
      return eq(+object, +other);

    case errorTag:
      return object.name == other.name && object.message == other.message;

    case regexpTag:
    case stringTag:
      // Coerce regexes to strings and treat strings, primitives and objects,
      // as equal. See http://www.ecma-international.org/ecma-262/7.0/#sec-regexp.prototype.tostring
      // for more details.
      return object == (other + '');

    case mapTag:
      var convert = mapToArray;

    case setTag:
      var isPartial = bitmask & COMPARE_PARTIAL_FLAG;
      convert || (convert = setToArray);

      if (object.size != other.size && !isPartial) {
        return false;
      }
      // Assume cyclic values are equal.
      var stacked = stack.get(object);
      if (stacked) {
        return stacked == other;
      }
      bitmask |= COMPARE_UNORDERED_FLAG;

      // Recursively compare objects (susceptible to call stack limits).
      stack.set(object, other);
      var result = equalArrays(convert(object), convert(other), bitmask, customizer, equalFunc, stack);
      stack['delete'](object);
      return result;

    case symbolTag:
      if (symbolValueOf) {
        return symbolValueOf.call(object) == symbolValueOf.call(other);
      }
  }
  return false;
}

/**
 * A specialized version of `baseIsEqualDeep` for objects with support for
 * partial deep comparisons.
 *
 * @private
 * @param {Object} object The object to compare.
 * @param {Object} other The other object to compare.
 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
 * @param {Function} customizer The function to customize comparisons.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Object} stack Tracks traversed `object` and `other` objects.
 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
 */
function equalObjects(object, other, bitmask, customizer, equalFunc, stack) {
  var isPartial = bitmask & COMPARE_PARTIAL_FLAG,
      objProps = getAllKeys(object),
      objLength = objProps.length,
      othProps = getAllKeys(other),
      othLength = othProps.length;

  if (objLength != othLength && !isPartial) {
    return false;
  }
  var index = objLength;
  while (index--) {
    var key = objProps[index];
    if (!(isPartial ? key in other : hasOwnProperty.call(other, key))) {
      return false;
    }
  }
  // Assume cyclic values are equal.
  var stacked = stack.get(object);
  if (stacked && stack.get(other)) {
    return stacked == other;
  }
  var result = true;
  stack.set(object, other);
  stack.set(other, object);

  var skipCtor = isPartial;
  while (++index < objLength) {
    key = objProps[index];
    var objValue = object[key],
        othValue = other[key];

    if (customizer) {
      var compared = isPartial
        ? customizer(othValue, objValue, key, other, object, stack)
        : customizer(objValue, othValue, key, object, other, stack);
    }
    // Recursively compare objects (susceptible to call stack limits).
    if (!(compared === undefined
          ? (objValue === othValue || equalFunc(objValue, othValue, bitmask, customizer, stack))
          : compared
        )) {
      result = false;
      break;
    }
    skipCtor || (skipCtor = key == 'constructor');
  }
  if (result && !skipCtor) {
    var objCtor = object.constructor,
        othCtor = other.constructor;

    // Non `Object` object instances with different constructors are not equal.
    if (objCtor != othCtor &&
        ('constructor' in object && 'constructor' in other) &&
        !(typeof objCtor == 'function' && objCtor instanceof objCtor &&
          typeof othCtor == 'function' && othCtor instanceof othCtor)) {
      result = false;
    }
  }
  stack['delete'](object);
  stack['delete'](other);
  return result;
}

/**
 * Creates an array of own enumerable property names and symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names and symbols.
 */
function getAllKeys(object) {
  return baseGetAllKeys(object, keys, getSymbols);
}

/**
 * Gets the data for `map`.
 *
 * @private
 * @param {Object} map The map to query.
 * @param {string} key The reference key.
 * @returns {*} Returns the map data.
 */
function getMapData(map, key) {
  var data = map.__data__;
  return isKeyable(key)
    ? data[typeof key == 'string' ? 'string' : 'hash']
    : data.map;
}

/**
 * Gets the native function at `key` of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {string} key The key of the method to get.
 * @returns {*} Returns the function if it's native, else `undefined`.
 */
function getNative(object, key) {
  var value = getValue(object, key);
  return baseIsNative(value) ? value : undefined;
}

/**
 * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the raw `toStringTag`.
 */
function getRawTag(value) {
  var isOwn = hasOwnProperty.call(value, symToStringTag),
      tag = value[symToStringTag];

  try {
    value[symToStringTag] = undefined;
    var unmasked = true;
  } catch (e) {}

  var result = nativeObjectToString.call(value);
  if (unmasked) {
    if (isOwn) {
      value[symToStringTag] = tag;
    } else {
      delete value[symToStringTag];
    }
  }
  return result;
}

/**
 * Creates an array of the own enumerable symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of symbols.
 */
var getSymbols = !nativeGetSymbols ? stubArray : function(object) {
  if (object == null) {
    return [];
  }
  object = Object(object);
  return arrayFilter(nativeGetSymbols(object), function(symbol) {
    return propertyIsEnumerable.call(object, symbol);
  });
};

/**
 * Gets the `toStringTag` of `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
var getTag = baseGetTag;

// Fallback for data views, maps, sets, and weak maps in IE 11 and promises in Node.js < 6.
if ((DataView && getTag(new DataView(new ArrayBuffer(1))) != dataViewTag) ||
    (Map && getTag(new Map) != mapTag) ||
    (Promise && getTag(Promise.resolve()) != promiseTag) ||
    (Set && getTag(new Set) != setTag) ||
    (WeakMap && getTag(new WeakMap) != weakMapTag)) {
  getTag = function(value) {
    var result = baseGetTag(value),
        Ctor = result == objectTag ? value.constructor : undefined,
        ctorString = Ctor ? toSource(Ctor) : '';

    if (ctorString) {
      switch (ctorString) {
        case dataViewCtorString: return dataViewTag;
        case mapCtorString: return mapTag;
        case promiseCtorString: return promiseTag;
        case setCtorString: return setTag;
        case weakMapCtorString: return weakMapTag;
      }
    }
    return result;
  };
}

/**
 * Checks if `value` is a valid array-like index.
 *
 * @private
 * @param {*} value The value to check.
 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
 */
function isIndex(value, length) {
  length = length == null ? MAX_SAFE_INTEGER : length;
  return !!length &&
    (typeof value == 'number' || reIsUint.test(value)) &&
    (value > -1 && value % 1 == 0 && value < length);
}

/**
 * Checks if `value` is suitable for use as unique object key.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
 */
function isKeyable(value) {
  var type = typeof value;
  return (type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean')
    ? (value !== '__proto__')
    : (value === null);
}

/**
 * Checks if `func` has its source masked.
 *
 * @private
 * @param {Function} func The function to check.
 * @returns {boolean} Returns `true` if `func` is masked, else `false`.
 */
function isMasked(func) {
  return !!maskSrcKey && (maskSrcKey in func);
}

/**
 * Checks if `value` is likely a prototype object.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
 */
function isPrototype(value) {
  var Ctor = value && value.constructor,
      proto = (typeof Ctor == 'function' && Ctor.prototype) || objectProto;

  return value === proto;
}

/**
 * Converts `value` to a string using `Object.prototype.toString`.
 *
 * @private
 * @param {*} value The value to convert.
 * @returns {string} Returns the converted string.
 */
function objectToString(value) {
  return nativeObjectToString.call(value);
}

/**
 * Converts `func` to its source code.
 *
 * @private
 * @param {Function} func The function to convert.
 * @returns {string} Returns the source code.
 */
function toSource(func) {
  if (func != null) {
    try {
      return funcToString.call(func);
    } catch (e) {}
    try {
      return (func + '');
    } catch (e) {}
  }
  return '';
}

/**
 * Performs a
 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * comparison between two values to determine if they are equivalent.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 * @example
 *
 * var object = { 'a': 1 };
 * var other = { 'a': 1 };
 *
 * _.eq(object, object);
 * // => true
 *
 * _.eq(object, other);
 * // => false
 *
 * _.eq('a', 'a');
 * // => true
 *
 * _.eq('a', Object('a'));
 * // => false
 *
 * _.eq(NaN, NaN);
 * // => true
 */
function eq(value, other) {
  return value === other || (value !== value && other !== other);
}

/**
 * Checks if `value` is likely an `arguments` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
 *  else `false`.
 * @example
 *
 * _.isArguments(function() { return arguments; }());
 * // => true
 *
 * _.isArguments([1, 2, 3]);
 * // => false
 */
var isArguments = baseIsArguments(function() { return arguments; }()) ? baseIsArguments : function(value) {
  return isObjectLike(value) && hasOwnProperty.call(value, 'callee') &&
    !propertyIsEnumerable.call(value, 'callee');
};

/**
 * Checks if `value` is classified as an `Array` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array, else `false`.
 * @example
 *
 * _.isArray([1, 2, 3]);
 * // => true
 *
 * _.isArray(document.body.children);
 * // => false
 *
 * _.isArray('abc');
 * // => false
 *
 * _.isArray(_.noop);
 * // => false
 */
var isArray = Array.isArray;

/**
 * Checks if `value` is array-like. A value is considered array-like if it's
 * not a function and has a `value.length` that's an integer greater than or
 * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
 * @example
 *
 * _.isArrayLike([1, 2, 3]);
 * // => true
 *
 * _.isArrayLike(document.body.children);
 * // => true
 *
 * _.isArrayLike('abc');
 * // => true
 *
 * _.isArrayLike(_.noop);
 * // => false
 */
function isArrayLike(value) {
  return value != null && isLength(value.length) && !isFunction(value);
}

/**
 * Checks if `value` is a buffer.
 *
 * @static
 * @memberOf _
 * @since 4.3.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a buffer, else `false`.
 * @example
 *
 * _.isBuffer(new Buffer(2));
 * // => true
 *
 * _.isBuffer(new Uint8Array(2));
 * // => false
 */
var isBuffer = nativeIsBuffer || stubFalse;

/**
 * Performs a deep comparison between two values to determine if they are
 * equivalent.
 *
 * **Note:** This method supports comparing arrays, array buffers, booleans,
 * date objects, error objects, maps, numbers, `Object` objects, regexes,
 * sets, strings, symbols, and typed arrays. `Object` objects are compared
 * by their own, not inherited, enumerable properties. Functions and DOM
 * nodes are compared by strict equality, i.e. `===`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 * @example
 *
 * var object = { 'a': 1 };
 * var other = { 'a': 1 };
 *
 * _.isEqual(object, other);
 * // => true
 *
 * object === other;
 * // => false
 */
function isEqual(value, other) {
  return baseIsEqual(value, other);
}

/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a function, else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 *
 * _.isFunction(/abc/);
 * // => false
 */
function isFunction(value) {
  if (!isObject(value)) {
    return false;
  }
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in Safari 9 which returns 'object' for typed arrays and other constructors.
  var tag = baseGetTag(value);
  return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
}

/**
 * Checks if `value` is a valid array-like length.
 *
 * **Note:** This method is loosely based on
 * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
 * @example
 *
 * _.isLength(3);
 * // => true
 *
 * _.isLength(Number.MIN_VALUE);
 * // => false
 *
 * _.isLength(Infinity);
 * // => false
 *
 * _.isLength('3');
 * // => false
 */
function isLength(value) {
  return typeof value == 'number' &&
    value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject(value) {
  var type = typeof value;
  return value != null && (type == 'object' || type == 'function');
}

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return value != null && typeof value == 'object';
}

/**
 * Checks if `value` is classified as a typed array.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
 * @example
 *
 * _.isTypedArray(new Uint8Array);
 * // => true
 *
 * _.isTypedArray([]);
 * // => false
 */
var isTypedArray = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray;

/**
 * Creates an array of the own enumerable property names of `object`.
 *
 * **Note:** Non-object values are coerced to objects. See the
 * [ES spec](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
 * for more details.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.keys(new Foo);
 * // => ['a', 'b'] (iteration order is not guaranteed)
 *
 * _.keys('hi');
 * // => ['0', '1']
 */
function keys(object) {
  return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object);
}

/**
 * This method returns a new empty array.
 *
 * @static
 * @memberOf _
 * @since 4.13.0
 * @category Util
 * @returns {Array} Returns the new empty array.
 * @example
 *
 * var arrays = _.times(2, _.stubArray);
 *
 * console.log(arrays);
 * // => [[], []]
 *
 * console.log(arrays[0] === arrays[1]);
 * // => false
 */
function stubArray() {
  return [];
}

/**
 * This method returns `false`.
 *
 * @static
 * @memberOf _
 * @since 4.13.0
 * @category Util
 * @returns {boolean} Returns `false`.
 * @example
 *
 * _.times(2, _.stubFalse);
 * // => [false, false]
 */
function stubFalse() {
  return false;
}

module.exports = isEqual;

}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],2:[function(require,module,exports){
(function (global){(function (){
/**
 * If you use roslib in a browser, all the classes will be exported to a global
 * variable called SENSORLIB.
 *
 * If you use nodejs, this is the variable you get when you require('roslib')
 */
const SENSORLIB = this.SENSORLIB || {
  REVISION: '0.0.1',
};

// Add sensors components
Object.assign(SENSORLIB, require('./sensors'));
// Add errors
Object.assign(SENSORLIB, require('./error'));
// Add actuator components
Object.assign(SENSORLIB, require('./actuators'));
// Add util
Object.assign(SENSORLIB, require('./util'));

global.SENSORLIB = SENSORLIB;

}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./actuators":7,"./error":10,"./sensors":23,"./util":26}],3:[function(require,module,exports){
const Subscriber = require('./Subscriber.js');
const NotSupportedError = require('../error/NotSupportedError');

/**
 * FlashlightSubscriber subscribes to a ROS topic and turns the flashlight on on command.
 * Used source: https://codepen.io/adamrifai/pen/YLxjKa
 *
 * The data should be from a topic with message type
 * ROS std_msgs/Bool message.
 */
class FlashlightSubscriber extends Subscriber {
  /**
   * Creates a new TextSubscriber.
    * @param {ROSLIB.Ros} ros ROS instance to publish to
    * @param {ROSLIB.Topic} topicName name for the topic to subscribe to
   */
  constructor(ros, topicName) {
    super(ros, topicName);
    this.topic.messageType = 'std_msgs/Bool';

    // Test browser support
    const SUPPORTS_MEDIA_DEVICES = 'mediaDevices' in navigator;

    if (SUPPORTS_MEDIA_DEVICES) {
      // Get the environment camera (usually the second one)
      navigator.mediaDevices.enumerateDevices().then((devices) => {
        const cameras = devices.filter((device) => device.kind === 'videoinput');

        if (cameras.length === 0) {
          throw Error('No camera found on this device');
        }

        const camera = cameras[cameras.length - 1];
        navigator.mediaDevices.getUserMedia({
          video: {
            deviceId: camera.deviceId,
            facingMode: ['user', 'environment'],
            height: {ideal: 1080},
            width: {ideal: 1920},
          },
        }).then((stream) => {
          this.track = stream.getVideoTracks()[0];

          // Create image capture object and get camera capabilities
          this.imageCapture = new ImageCapture(this.track);
        });
      });
    } else {
      throw new NotSupportedError('Browser does not support this feature');
    }
  }

  /**
   * Callback that gets called when a message is received.
   * Displays received message in HTML.
   * @param {ROSLIB.Message} msg the received message
   */
  onMessage(msg) {
    // Create stream and get video track
    this.imageCapture.getPhotoCapabilities().then(() => {
      // turn torch on or off depending on msg
      this.track.applyConstraints({
        advanced: [{torch: msg.data}],
      });
    });

    // The light will be on as long the track exists
  }
}

module.exports = FlashlightSubscriber;

},{"../error/NotSupportedError":8,"./Subscriber.js":5}],4:[function(require,module,exports){
const Subscriber = require('./Subscriber');
const NotSupportedError = require('../error/NotSupportedError');

/**
 * ImageSubscriber subscribes to a ROS topic and displays any images published to that topic on a canvas.
 * These images can either be provided as an sensor_msgs/Image or sensor_msgs/CompressedImage ROS message.
 *
 * It is recommended to use compressed messages, as to minimalize the network strain. In theory, nearly any image format
 * is supported by ImageSubscriber, as long the image format is supported by the current browser. However, only the PNG,
 * JPEG, BMP, GIF and SVG formats have been tested so far.
 *
 * It is also possible to make use of uncompressed images, but support for different pixel data encodings is limited.
 * Currently, only the rgb8 (24-bit color) and rgba8 (24-bit color with alpha channel) encodings are supported.
 */
class ImageSubscriber extends Subscriber {
  /**
    * Creates a new ImageSubscriber, which will display the images published
    * to the provided topic on the provided canvas.
    * Both compressed (sensor_msgs/CompressedImage) and non-compressed images (sensor_msgs/Image) are supported.
    * @param {ROSLIB.Ros} ros ROS instance to publish to
    * @param {ROSLIB.Topic} topicName name for the topic to subscribe to
    * @param {HTMLCanvasElement} canvas canvas to draw published images on
    * @param {boolean} [compressed=true]  whether compressed images are published to the topic. True by default.
    */
  constructor(ros, topicName, canvas, compressed = true) {
    super(ros, topicName);

    if (!(canvas instanceof window.HTMLCanvasElement)) {
      throw new TypeError('canvas argument must be of type HTMLCanvasElement');
    }

    this.topic.messageType = 'sensor_msgs/CompressedImage';

    this.canvas = canvas;
    this.compressed = compressed;

    this.topic.messageType = this.getMessageType();
  }

  /**
   * Returns the messageType this subscriber expects to receieve.
   * @return {string} ROS messageType this subscriber expects to recieve
   */
  getMessageType() {
    return this.compressed ? 'sensor_msgs/CompressedImage' : 'sensor_msgs/Image';
  }

  /**
   * Callback for handling incomming published message.
   * @param {ROSLIB.Message} msg message of type sensor_msgs/Image or sensor_msgs/CompressedImage,
   * depending on whether this subscribed is using compressed images.
   */
  onMessage(msg) {
    let imageDataUrl;

    if (this.compressed) {
      imageDataUrl = ImageSubscriber.createImageDataUrl(msg.format, msg.data);
    } else {
      // setup canvas
      const imageCanvas = document.createElement('canvas');
      imageCanvas.width = msg.width;
      imageCanvas.height = msg.height;
      const ctx = imageCanvas.getContext('2d');

      // create RGBA image data from raw pixel data in msg
      const convertedData = ImageSubscriber.convertImageData(msg.data, msg.encoding, msg.width * msg.height);
      const imageData = new window.ImageData(convertedData, msg.width, msg.height);
      ctx.putImageData(imageData, 0, 0);

      // create new dataURL from canvas contents
      imageDataUrl = imageCanvas.toDataURL();
    }

    // draw image contained in dataURL to canvas
    this.drawImage(imageDataUrl);
  }

  /**
   * Creates a data URL encoding an image in the given format with the given image data.
   * @param {String} format format of the image (e.g. png, jpeg, etc)
   * @param {String} data data of the image, in base64 format
   * @return {String} data URL conaining image data
   */
  static createImageDataUrl(format, data) {
    return 'data:image/' + format + ';base64,' + data;
  }

  /**
   * Draws the image encoded in the provided dataURL to the canvas of this ImageSubscriber.
   * @param {string} dataURL dataURL containing image to draw to canvas.
   */
  drawImage(dataURL) {
    const canvas = this.canvas;
    const ctx = canvas.getContext('2d');
    const image = new window.Image();

    image.onload = function() {
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    };

    image.onerror = function() {
      throw Error('could not draw image');
    };

    image.src = dataURL;
  }

  /**
   * Converts pixel data encoded as a base64 to a byte array containing
   * the color channel values of each pixel.
   * Currently only supports rgb8 and rgba8 formats
   * @param {string} pixelData pixel data encoded as base64 string
   * @param {string} format format of pixel data. Any format besides rgb8 and rgba8 is not supported.
   * @param {number} pixels number of pixels described in pixelData
   * @return {Uint8ClampedArray} array containing pixel data in rgba format
   */
  static convertImageData(pixelData, format, pixels) {
    // check for unsupported encodings
    if (format !== 'rgb8' && format !== 'rgba8') {
      throw new NotSupportedError('Subscriber only supports uncompressed images in rgb8 or rgba8 format');
    }
    const hasAlphaChannel = (format === 'rgba8');
    // decode base64 encoded pixelData to string of bytes
    const binaryString = window.atob(pixelData);

    // fill imageData array, which contains pixel data in rgba encoding
    // each color channel is store as a byte (Uint8)
    const imageData = new Uint8ClampedArray(pixels * 4);

    let charIndex = 0;
    for (let i = 0; i < imageData.length; i++) {
      if (!hasAlphaChannel && i % 4 === 3) {
        imageData[i] = 255;
        continue;
      }

      imageData[i] = binaryString.charCodeAt(charIndex);
      charIndex++;
    }

    return imageData;
  }
}

module.exports = ImageSubscriber;

},{"../error/NotSupportedError":8,"./Subscriber":5}],5:[function(require,module,exports){
/**
 * Template for object that subscribes to a provided ROS topic.
 */
class Subscriber {
  /**
   * Creates a new subscriber that subscribes to the provided topic.
   * @param {ROSLIB.Ros} ros a ROS instance to publish to
   * @param {ROSLIB.Topic} topicName name for the topic to subscribe to
   * @throws TypeError if topic argument is not of type ROSLIB.Topic
   */
  constructor(ros, topicName) {
    if (!(ros instanceof ROSLIB.Ros)) {
      throw new TypeError('ros argument was not of type ROSLIB.Ros');
    }
    if (typeof(topicName) !== 'string') {
      throw new TypeError('topicName argument was not of type String');
    }

    /**
     * ros instance to publish to
     */
    this.ros = ros;

    /**
     * topicName to which to name the topic
     */
    this.topicName = topicName;

    /**
     * topic to publish to. The message type of the topic has to be set within every publisher
     */
    this.topic = new ROSLIB.Topic({
      ros: this.ros,
      name: this.topicName,
    });

    /**
     * start/stop status of subscriber
     */
    this.started = false;

    this.onMessage = this.onMessage.bind(this);
  }

  /**
   * Callback that gets called when a message is received.
   * @param {ROSLIB.Message} msg the received message
   */
  onMessage(msg) {
    throw Error('onMessage method not defined!');
  }

  /**
   * Start by subscribing to ros topic.
   */
  start() {
    if (this.started) {
      throw new Error('Subscriber already started');
    }
    this.topic.subscribe(this.onMessage);
    this.started = true;
  }

  /**
   * Stops the subscriber.
   */
  stop() {
    if (!this.started) {
      throw new Error('Subscriber did not start yet');
    }
    this.topic.unsubscribe(this.onMessage);
    this.started = false;
  }
}

module.exports = Subscriber;

},{}],6:[function(require,module,exports){
const Subscriber = require('./Subscriber.js');

/**
 * TextSubscriber subscribes to a ROS topic and displays the received messages
 * in an HTML element.
 *
 * The data should be from a topic with message type
 * ROS std_msgs/String message.
 */
class TextSubscriber extends Subscriber {
  /**
   * Creates a new TextSubscriber.
   * @param {ROSLIB.Ros} ros a ROS instance to publish to
   * @param {ROSLIB.Topic} topicName name for the topic to subscribe to
   * @param {HTMLElement} HTMLElement HTML element in which the messages will be displayed.
   */
  constructor(ros, topicName, HTMLElement) {
    super(ros, topicName);

    if (!(HTMLElement instanceof window.HTMLElement)) {
      throw new TypeError('HTMLElement argument was not of type HTMLElement');
    }

    this.topic.messageType = 'std_msgs/String';

    this.HTMLElement = HTMLElement;
  }

  /**
   * Callback that gets called when a message is received.
   * Displays received message in HTML.
   * @param {ROSLIB.Message} msg the received message
   */
  onMessage(msg) {
    this.HTMLElement.innerHTML = msg.data;
  }
}

module.exports = TextSubscriber;

},{"./Subscriber.js":5}],7:[function(require,module,exports){
/**
 * This file tells @function require what to import when requiring the entire sensors folder.
 *
 * Any module to be exported to the library should have an entry in the object below.
 */
module.exports = {
  FlashlightSubscriber: require('./FlashlightSubscriber'),
  ImageSubscriber: require('./ImageSubscriber'),
  TextSubscriber: require('./TextSubscriber'),
};

},{"./FlashlightSubscriber":3,"./ImageSubscriber":4,"./TextSubscriber":6}],8:[function(require,module,exports){
/**
 * Error thrown by the library to indicate some requested feature is not
 * supported by the current browser.
 */
class NotSupportedError extends Error {
  /**
   * Create a new NotSupportedError.
   * @param {string} message error message indicating what went wrong.
   */
  constructor(message) {
    super(message);

    this.name = 'NotSupportedError';
  }
}

module.exports = NotSupportedError;

},{}],9:[function(require,module,exports){
/**
 * Error thrown by the library to indicate some sensor is denied access
 * by the current browser.
 */
class PermissionDeniedError extends Error {
  /**
     * Create a new PermissionDeniedError.
     * @param {string} message error message indicating what went wrong.
     */
  constructor(message) {
    super(message);

    this.name = 'PermissionDeniedError';
  }
}

module.exports = PermissionDeniedError;


},{}],10:[function(require,module,exports){
module.exports = {
  NotSupportedError: require('./NotSupportedError'),
  PermissionDeniedError: require('./PermissionDeniedError'),
};

},{"./NotSupportedError":8,"./PermissionDeniedError":9}],11:[function(require,module,exports){
// Dependencies
const IntervalPublisher = require('./IntervalPublisher.js');
const NotSupportedError = require('../error/NotSupportedError');

/**
 * <p> <b> This feature is not fully suported over all browsers
 * To enable in Chrome, go to: chrome://flags/
 * There enable: "Generic Sensor Extra Classes" </b> </p>
 *
 *
 * AmbientLightPublisher publishes the amount of lux the
 * camera receives
 * By default it publishes data at the interval rate
 * from parrent class IntervalPublisher
 *
 * The data resulting from the interactions is published as a
 * ROS std_msgs/Int32 message.
 *
 * @see Uses the following example:
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/AmbientLightSensor}
 */
class AmbientLightPublisher extends IntervalPublisher {
  /**
   * Creates a new sensor publisher that publishes the amount of lux
   * the camera receives
   * @param {ROSLIB.Ros} ros a ROS instance to publish to
   * @param {String} topicName name for the topic to publish data to
   * @param {Number} hz frequency for the publishing interval
   */
  constructor(ros, topicName, hz = 1) {
    // check support for API
    if (!(window.AmbientLightSensor)) {
      throw new NotSupportedError('Unable to create AmbientLightSensor, ' +
          'AmbientLight API not supported');
    }
    super(ros, topicName, hz);
    this.topic.messageType = 'std_msgs/Int32';

    this.sensor = new AmbientLightSensor();
  }

  /**
   * Start the publishing of data to ROS with frequency of <freq> Hz.
   */
  start() {
    this.sensor.addEventListener('reading', (event) => {
      this.light = this.sensor.illuminance;
    });
    this.sensor.start();

    super.start();
  }

  /**
   * Stops the publishing of data to ROS.
   */
  stop() {
    super.stop();

    this.sensor.stop();

    this.sensor.removeEventListener('reading', (event) => {
      this.light = this.sensor.illuminance;
    });
  }

  /**
   * Puts the light level detected by the ambient light sensor
   * in a ROS message and publishes it. The light level is given in lux.
   */
  createSnapshot() {
    const AmbientLightMessage = new ROSLIB.Message({
      data: this.light,
    });
    this.msg = AmbientLightMessage;
    super.createSnapshot();
  }
}

module.exports = AmbientLightPublisher;

},{"../error/NotSupportedError":8,"./IntervalPublisher.js":19}],12:[function(require,module,exports){
const SensorPublisher = require('./SensorPublisher.js');

/**
 * ButtonPublisher publishes the state of an HTML button element.
 * This state is published every time the button changes state,
 * from pressed to unpressed, and vice versa.
 *
 * The data resulting from the button interactions is published as a
 * ROS std_msgs/Bool message. The boolean contained within this message
 * is set to true when the button is pressed, and false otherwise.
 */
class ButtonPublisher extends SensorPublisher {
  /**
   * Creates a new ButtonPublisher.
   * @param {ROSLIB.Ros} ros a ROS instance to publish to
   * @param {String} topicName name for the topic to publish data to
   * @param {HTMLButtonElement} button button of which to publish data
   */
  constructor(ros, topicName, button) {
    super(ros, topicName);

    if (!(button instanceof window.HTMLButtonElement)) {
      throw new TypeError('button argument was not of type HTMLButtonElement');
    }

    this.topic.messageType = 'std_msgs/Bool';

    /**
     * button of which to publish data
     */
    this.button = button;

    // Flag to check if button was already pressed
    let flag = false;

    /**
     * Callback for when button is pressed.
     * @param {Event} event event from callback
     */
    this.onMouseDown = function(event) {
      event.preventDefault();
      if (flag) {
        return;
      }
      flag = true;
      const msg = new ROSLIB.Message({
        data: true,
      });
      this.topic.publish(msg);
    }.bind(this);

    /**
     * Callback for when button is released.
     * @param {Event} event event from callback
     */
    this.onMouseUp = function(event) {
      event.preventDefault();
      if (!flag) {
        return;
      }
      flag = false;
      const msg = new ROSLIB.Message({
        data: false,
      });
      this.topic.publish(msg);
    }.bind(this);
  }

  /**
   * Start the publishing of data to ROS.
   */
  start() {
    this.button.addEventListener('mousedown', this.onMouseDown);
    this.button.addEventListener('touchstart', this.onMouseDown);
    this.button.addEventListener('mouseup', this.onMouseUp);
    this.button.addEventListener('mouseleave', this.onMouseUp);
    this.button.addEventListener('touchend', this.onMouseUp);
    this.button.addEventListener('touchcancel', this.onMouseUp);

    super.start();
  }

  /**
   * Stop the publishing of data to ROS.
   */
  stop() {
    super.stop();

    this.button.removeEventListener('mousedown', this.onMouseDown);
    this.button.removeEventListener('touchstart', this.onMouseDown);
    this.button.removeEventListener('mouseup', this.onMouseUp);
    this.button.removeEventListener('mouseleave', this.onMouseUp);
    this.button.removeEventListener('touchend', this.onMouseUp);
    this.button.removeEventListener('touchcancel', this.onMouseUp);
  }
}

module.exports = ButtonPublisher;

},{"./SensorPublisher.js":20}],13:[function(require,module,exports){
const IntervalPublisher = require('./IntervalPublisher');

/**
 * CameraPublisher publishes the frame of a video stream.
 * This state is published at a set interval,
 *
 * The data resulting from the button interactions is published as a
 * ROS sensor_msgs/Image Message message.
 * @see Uses the following example:
 * {@link http://wiki.ros.org/roslibjs/Tutorials/Publishing%20video%20and%20IMU%20data%20with%20roslibjs}
 */
class CameraPublisher extends IntervalPublisher {
  /**
     * Creates a new Camera publisher that publishes to the provided topic.
   * @param {ROSLIB.Ros} ros a ROS instance to publish to
     * @param {String} topicName name for the topic to publish data to
     * @param {HTMLVideoElement} camera the video element of which to publish the data from.
     * @param {HTMLCanvasElement} canvas a canvas element for making publishing video data possible
     * @param {Number} hz a standard frequency for this type of object.
     */
  constructor(ros, topicName, camera, canvas, hz = 10) {
    super(ros, topicName, hz);

    if (!(camera instanceof window.HTMLVideoElement)) {
      throw new TypeError('camera argument was not of type HTMLVideoElement');
    }
    if (!(canvas instanceof window.HTMLCanvasElement)) {
      throw new TypeError('canvas argument was not of type HTMLCanvasElement');
    }
    this.camera = camera;
    this.canvas = canvas;

    this.topic.messageType = 'sensor_msgs/CompressedImage';
  }

  /**
     * Start the publishing of camera data to ROS.
     *
     * @throws {Error} if no video source is available.
     */
  start() {
    // If there is no videostream available yet, do not publish data.
    if (!this.camera.srcObject) {
      throw new Error('No video source found.');
    }
    super.start();
  }

  /**
     * Create a snapshot of the current videostream.
     */
  createSnapshot() {
    // Creates a snapshot of the current videostream
    this.canvas.getContext('2d').drawImage(this.camera, 0, 0, this.canvas.width, this.canvas.height);

    // Converts the data to publishable data to ROS
    const data = this.canvas.toDataURL('image/jpeg');
    // Note: This message should publish to '/{name}/compressed', since the message contains compressed data
    const imageMessage = new ROSLIB.Message({
      format: 'jpeg',
      data: data.replace('data:image/jpeg;base64,', ''),
    });

    this.msg = imageMessage;
    super.createSnapshot();
  }

  /**
   * Deserializes a CameraPublisher stored in a config object, and returns the resulting publisher instance.
   * The returned instance is already started.
   * @param {ROSLIB.Ros} ros ros instance to which to resulting publisher will publish
   * @param {Object} config object with the following keys:
   * @param {string} config.name - name of the publisher to create
   * @param {number} config.frequency - name of the publisher to create
   * @param {string} config.cameraId - id of HTMLVideoElement with camera data
   * @param {string} config.canvasId - id of HTMLCanvasElement to use creating images from video
   * @return {CameraPublisher} CameraPublisher described in the provided config parameter
   */
  static readFromConfig(ros, config) {
    const camera = document.getElementById(config.cameraId);
    const canvas = document.getElementById(config.canvasId);

    const topicName = 'mirte/phone_camera/' + config.name;
    const publisher = new CameraPublisher(ros, topicName, camera, canvas);
    publisher.start();
    publisher.setPublishFrequency(config.frequency);

    return publisher;
  }
}


module.exports = CameraPublisher;

},{"./IntervalPublisher":19}],14:[function(require,module,exports){
const SensorPublisher = require('./SensorPublisher.js');

/**
 * CheckboxPublisher publishes the state of an HTML checkbox.
 * This state is published every time the checkbox changes state,
 * from checked to unchecked, and vice versa.
 *
 * The data resulting from the checkbox interactions is published as a
 * ROS std_msgs/Bool message. The boolean contained within this message
 * is set to true when the checkbox is checked, and false otherwise.
 */
class CheckboxPublisher extends SensorPublisher {
  /**
   * Creates a new checkboxPublisher.
   * @param {ROSLIB.Ros} ros a ROS instance to publish to
   * @param {String} topicName topic to which to publish checkbox data
   * @param {HTMLElement} checkbox checkbox of which to publish data
   */
  constructor(ros, topicName, checkbox) {
    super(ros, topicName);

    if (!(checkbox instanceof window.HTMLElement && checkbox.type && checkbox.type === 'checkbox')) {
      throw new TypeError('checkbox argument was not a HTML checkbox');
    }

    this.topic.messageType = 'std_msgs/Bool';

    /**
     * checkbox of which to publish data
     */
    this.checkbox = checkbox;

    /**
     * Callback for when checkbox state changes.
     * @param {Event} event event from callback
     */
    this.change = function(event) {
      if (event.target.checked) {
        this.publishBoolMsg(true);
      } else {
        this.publishBoolMsg(false);
      }
    }.bind(this);
  }

  /**
   * Start the publishing of data to ROS.
   */
  start() {
    this.checkbox.addEventListener('change', this.change);

    super.start();
  }

  /**
   * Stop the publishing of data to ROS.
   */
  stop() {
    super.stop();

    this.checkbox.removeEventListener('change', this.change);
  }

  /**
   * Creates and publishes a new ROS std_msgs/Bool message, containing the supplied boolean value.
   * @param {boolean} bool boolean to include in message
   */
  publishBoolMsg(bool) {
    const msg = new ROSLIB.Message({
      data: bool,
    });
    this.topic.publish(msg);
  }
}

module.exports = CheckboxPublisher;

},{"./SensorPublisher.js":20}],15:[function(require,module,exports){
// Dependencies
const PermissionDeniedError = require('../error/PermissionDeniedError.js');
const IntervalPublisher = require('./IntervalPublisher.js');

/**
 * CompassPublisher publishes the rotation as a compass
 * By default it publishes data at the interval rate
 * from parrent class IntervalPublisher
 *
 * The data resulting from the interactions is published as a
 * ROS std_msgs/Int32 message.
 *
 * @see Uses the following examples:
 * {@link https://dev.to/orkhanjafarovr/real-compass-on-mobile-browsers-with-javascript-3emi}
 * {@link https://answers.ros.org/question/65971/how-can-i-publish-an-integer-and-string-int16-string-using-roslibjs/}
 */
class CompassPublisher extends IntervalPublisher {
  /**
   * Creates a new sensor publisher that publishes to the provided topic.
   * @param {ROSLIB.Ros} ros a ROS instance to publish to
   * @param {String} topicName name for the topic to publish data to
   * @param {Number} hz a standard frequency for this type of object.
   */
  constructor(ros, topicName, hz = 10) {
    super(ros, topicName, hz);

    this.topic.messageType = 'std_msgs/Int32';

    // First need to detect first device orientation.
    this.orientationReady = false;
  }

  /**
   * Start the publishing of data to ROS with frequency of <freq> Hz.
   */
  start() {
    /*
    * Support for iOS
    * For DeviceOrientationEvent and DeviceMotionEvent to work on Safari on iOS 13 and up,
    * the user has to give permission through a user activation event.
    * Note: This will only work through either localhost or a secure connection (https).
    */
    if (!window.MSStream && /iPad|iPhone|iPod|Macintosh/.test(window.navigator.userAgent)) {
      // request permission for sensor use
      this.requestPermission();
    }
    // If user is not on iOS, sensor data can be read as normal.
    window.addEventListener('deviceorientationabsolute', (event) => {
      if (event.isTrusted) {
        this.onReadOrientation(event);
      }
    }, true);

    super.start();
  }

  /**
   * Stops the publishing of data to ROS.
   */
  stop() {
    super.stop();

    window.removeEventListener('deviceorientationabsolute', (event) => {
      if (event.isTrusted) {
        this.onReadOrientation(event);
      }
    }, true);
  }

  /**
   * Adds a button to the document to ask for permission to use IMU sensor on iOS.
   */
  requestPermission() {
    const permbutton = window.document.createElement('button');
    permbutton.innerHTML = 'Request Motion Sensor Permission';
    permbutton.addEventListener('click', () => {
      if (typeof(window.DeviceOrientationEvent.requestPermission()) === 'function' ||
      typeof(window.DeviceMotionEvent.requestPermission()) === 'function') {
        throw new Error('requestPermission for device orientation or device motion on iOS is not a function!');
      }

      // If permission is granted, Enable callback for deviceOrientationEvent and remove permissions button
      window.DeviceOrientationEvent.requestPermission().then((response) => {
        if (response==='granted') {
          permbutton.remove();
          return true;
        } else {
          throw new PermissionDeniedError('No permission granted for Device Orientation');
        }
      });
    });

    window.document.body.appendChild(permbutton);
  }

  /**
     * Callback for reading orientation data.
     * context of object that called callback.
     *
     * @param {DeviceOrientationEvent} event object containing sensor data.
     */
  onReadOrientation(event) {
    this.alpha = Math.round(Math.abs(event.alpha - 360));
    this.orientationReady = true;
  }

  /**
   * Puts the magnetic declination in a ROS message and publishes it
   */
  createSnapshot() {
    if (!this.orientationReady) {
      throw Error('Orientation is not read yet!');
    }

    const Compass = new ROSLIB.Message({
      data: this.alpha,
    });

    this.msg = Compass;
    super.createSnapshot();
  }

  /**
   * Deserializes a CompassPublisher stored in a config object,
   * and returns the resulting publisher instance.
   * The returned instance is already started.
   * @param {ROSLIB.Ros} ros ros instance to which to resulting publisher will publish
   * @param {Object} config object with the following keys:
   * @param {string} config.name - name of the publisher to create
   * @param {number} config.frequency - name of the publisher to create
   * @return {CompassPublisher} CompassPublisher described in the provided properties parameter
   */
  static readFromConfig(ros, config) {
    const topicName = 'mirte/phone_compass/' + config.name;
    const publisher = new CompassPublisher(ros, topicName);
    publisher.start();
    publisher.setPublishFrequency(config.frequency);

    return publisher;
  }
}

module.exports = CompassPublisher;

},{"../error/PermissionDeniedError.js":9,"./IntervalPublisher.js":19}],16:[function(require,module,exports){
// Dependencies
const IntervalPublisher = require('./IntervalPublisher.js');
const PermissionDeniedError = require('../error/PermissionDeniedError.js');
const NotSupportedError = require('../error/NotSupportedError');

/**
 * CoordinateCompassPublisher publishes the rotation as a compass to
 * a certain point in the world.
 * By default it publishes data at the interval rate
 * from parrent class IntervalPublisher
 *
 * The data resulting from the interactions is published as a
 * ROS std_msgs/Int32 message.
 *
 * @see Uses the following examples:
 * {@link https://dev.to/orkhanjafarovr/real-compass-on-mobile-browsers-with-javascript-3emi}
 * {@link https://answers.ros.org/question/65971/how-can-i-publish-an-integer-and-string-int16-string-using-roslibjs/}
 */
class CoordinateCompassPublisher extends IntervalPublisher {
  /**
   * Creates a new sensor publisher that publishes the angle
   * between the device and the provided Coordinates to the provided topic.
   * Will point to the North Pole (latitude 90, longitude 0) if not coordinates are specified.
   * @param {ROSLIB.Ros} ros a ROS instance to publish to
   * @param {String} topicName name for the topic to publish data to
   * @param {Number} latitude float that gives the latitude of point where to aim for
   * @param {Number} longitude float that gives the longitude of point where to aim for
   * @param {Number} hz a standard frequency for this type of object.
   */
  constructor(ros, topicName, latitude = 90, longitude = 0, hz = 10) {
    super(ros, topicName, hz);

    if (!((typeof latitude === 'number') && (typeof longitude === 'number'))) {
      throw new TypeError('Coordinates were not of type Number');
    }

    if (latitude > 90 || latitude < -90 || longitude > 180 || longitude < -180) {
      throw new Error('Range of given coordinates is invalid');
    }

    this.topic.messageType = 'std_msgs/Int32';

    // Sets, fields for compass
    this.compass = 0;
    this.lat = latitude;
    this.lng = longitude;

    // First need to detect first device orientation.
    this.orientationReady = false;
    this.gpsReady = false;

    // Id of geolocation watch callback
    this.watchId = -1;

    /*
    * Support for iOS
    * For DeviceOrientationEvent and DeviceMotionEvent to work on Safari on iOS 13 and up,
    * the user has to give permission through a user activation event.
    * Note: This will only work through either localhost or a secure connection (https).
    */
    if (!window.MSStream && /iPad|iPhone|iPod|Macintosh/.test(window.navigator.userAgent)) {
      this.requestPermission();
    }

    // check support for API
    if (!window.navigator.geolocation) {
      throw new NotSupportedError('Unable to create CoordinateCompassPublisher, ' +
        'Geolocation API not supported');
    }
  }

  /**
   * Start the publishing of data to ROS with frequency of <freq> Hz.
   */
  start() {
    window.addEventListener('deviceorientationabsolute', (event) => {
      if (event.isTrusted) {
        this.onReadOrientation(event);
      }
    }, true);

    this.watchId = window.navigator.geolocation.watchPosition(
        this.locationHandler.bind(this),
        (error) => {
          throw Error('failed to watch position');
        });

    super.start();
  }

  /**
   * Stops the publishing of data to ROS.
   */
  stop() {
    super.stop();

    window.navigator.geolocation.clearWatch(this.watchId);
  }

  /**
   * Adds a button to the document to ask for permission to use IMU sensor on iOS.
   */
  requestPermission() {
    const permbutton = window.document.createElement('button');
    permbutton.innerHTML = 'Request Motion Sensor Permission';
    permbutton.addEventListener('click', () => {
      if (typeof(window.DeviceOrientationEvent.requestPermission()) === 'function' ||
      typeof(window.DeviceMotionEvent.requestPermission()) === 'function') {
        throw new Error('requestPermission for device orientation or device motion on iOS is not a function!');
      }

      // If permission is granted, Enable callback for deviceOrientationEvent and remove permissions button
      window.DeviceOrientationEvent.requestPermission().then((response) => {
        if (response==='granted') {
          permbutton.remove();
          return true;
        } else {
          throw new PermissionDeniedError('No permission granted for Device Orientation');
        }
      });
    });

    window.document.body.appendChild(permbutton);
  }

  /**
   * Helper method for angle calculation
   * @param {Number} latitude from coordinates of Geolocation
   * @param {Number} longitude from coordinates of Geolocation
   * @return {Number} angle between current position and the North
   */
  calcDegreeToPoint(latitude, longitude) {
    if (latitude === this.lat && longitude === this.lng) {
      return 0;
    }


    // Copied code to calculate the degree
    // But works in a weird way
    // North = 180, East = -90, South = 0, West = 90
    const phiK = (this.lat * Math.PI) / 180.0;
    const lambdaK = (this.lng * Math.PI) / 180.0;
    const phi = (latitude * Math.PI) / 180.0;
    const lambda = (longitude * Math.PI) / 180.0;
    const psi =
      (180.0 / Math.PI) *
      Math.atan2(
          Math.sin(lambdaK - lambda),
          Math.cos(phi) * Math.tan(phiK) -
          Math.sin(phi) * Math.cos(lambdaK - lambda));
    // Round to shift out small changes
    let degree = Math.round(psi);
    // By this it becomes
    // North = 360, East = 90, South = 180, West = 270
    degree = degree + 180;
    // Since we work in range [0, 359]
    if (degree === 360) {
      degree = 0;
    }

    return degree;
  }

  /**
   * Gets the location and puts in variables
   *
   * Then calculates the degree and makes sure
   * it is between 0 and 360
   * @param {Geolocation} position
   */
  locationHandler(position) {
    const {latitude, longitude} = position.coords;
    this.compass = this.calcDegreeToPoint(latitude, longitude);

    this.gpsReady = true;
  }

  /**
     * Callback for reading orientation data.
     * context of object that called callback.
     *
     * @param {DeviceOrientationEvent} event object containing sensor data.
     */
  onReadOrientation(event) {
    this.alpha = Math.round(Math.abs(event.alpha - 360));
    this.orientationReady = true;
  }

  /**
   * difference between current rotation and aiming for
   * @return {Number} difference
   */
  accountForRotation() {
    // Does point to - current looking at
    let diff = this.compass - this.alpha;
    // If it is smaller then 0 it means alpha is bigger
    // We could turn left that amount of degrees but taking compass [0, 360[ we account for that
    // So ex. -10 (10 degrees left) becomes 350 (350 degrees right)
    if (diff < 0) {
      diff = 360 + diff;
    }
    return diff;
  }

  /**
   * Puts the declination in a ROS message and publishes it
   */
  createSnapshot() {
    if (!(this.orientationReady && this.gpsReady)) {
      throw Error('Orientation is not read yet!');
    }

    this.compass = this.accountForRotation();

    const CoordinateCompassMessage = new ROSLIB.Message({
      data: this.compass,
    });

    this.msg = CoordinateCompassMessage;
    super.createSnapshot();
  }

  /**
   * Deserializes a CoordinateCompassPublisher stored in a config object, and returns the resulting publisher instance.
   * The returned instance is already started.
   * @param {ROSLIB.Ros} ros ros instance to which to resulting publisher will publish
   * @param {Object} config object with the following keys:
   * @param {string} config.name - name of the publisher to create
   * @param {number} config.frequency - name of the publisher to create
   * @return {CoordinateCompassPublisher} CoordinateCompassPublisher described in the provided config parameter
   */
  static readFromConfig(ros, config) {
    const topicName = 'mirte/phone_coordinate_compass/' + config.name;
    const publisher = new CoordinateCompassPublisher(ros, topicName);

    publisher.start();
    publisher.setPublishFrequency(config.frequency);

    return publisher;
  }
}

module.exports = CoordinateCompassPublisher;

},{"../error/NotSupportedError":8,"../error/PermissionDeniedError.js":9,"./IntervalPublisher.js":19}],17:[function(require,module,exports){
const IntervalPublisher = require('./IntervalPublisher');
const NotSupportedError = require('../error/NotSupportedError');

/**
 * GPSPublisher publishes the geolocation data of the
 * current device.
 *
 * The user must make sure to give permission for access
 * to their geolocation.
 */
class GPSPublisher extends IntervalPublisher {
  /**
   * Creates a new GPSPublisher, which will publish the longitude and latitude
   * of the current device in the form of a sensor_msgs/NavSatFix message.
   * @param {ROSLIB.Ros} ros a ROS instance to publish to
   * @param {String} topicName name for the topic to publish data to
   * @param {number} hz frequency at which to publish GPS data, in Hertz.
   * If no frequency is specified, this will default to 1 Hz.
   * @throws {NotSupportedError} if the Geolocation API is not supported
   * by the current browser.
   */
  constructor(ros, topicName, hz = 1) {
    super(ros, topicName, hz);

    this.topic.messageType = GPSPublisher.messageType;

    /**
     * Id of geolocation watch callback
     */
    this.watchId = -1;

    /**
     * GeolocationPosition storing latest device position.
     * Is set to null when the latest position was already published.
     */
    this.position = undefined;

    // check support for API
    if (!window.navigator.geolocation) {
      throw new NotSupportedError('Unable to create GPSPublisher, ' +
        'Geolocation API not supported');
    }
  }

  /**
   * Returns the message type this publisher publishes its data.
   */
  static get messageType() {
    return 'sensor_msgs/NavSatFix';
  }

  /**
   * Start the publishing of data to ROS with frequency of <freq> Hz.
   */
  start() {
    // Callback for reading position data
    const successCallback = function(pos) {
      this.position = pos;
    }.bind(this);

    // Callback for handling errors. Will throw any error provided to it.
    const errorCallback = function(error) {
      throw error;
    };

    this.watchId = window.navigator.geolocation.watchPosition(
        successCallback,
        errorCallback);

    super.start();
  }

  /**
   * Stops the publishing of data to ROS.
   */
  stop() {
    super.stop();

    window.navigator.geolocation.clearWatch(this.watchId);
  }

  /**
   * Creates a new ROS.Message object, containing a
   * sensor_msgs/NavSatFix message.
   *
   * Only the longitude and latitude are contained in this
   * message.
   * @param {GeolocationCoordinates} coordinates coordinates to be
   * contained by the created message.
   * @return {ROSLIB.Message} sensor_msgs/NavSatFix message containing longitude
   * and latitude of supplied coordinates.
   */
  static createNavSatMessage(coordinates) {
    return new ROSLIB.Message({
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
      position_covariance_type: 0,
    });
  }

  /**
   * Creates a snapshot of the current position of the device, and publishes
   * this data as a sensor_msgs/NavSatFix message.
   */
  createSnapshot() {
    // position has not yet been set, do not publish
    if (!this.position) {
      return;
    }

    // create and publish message
    const coordinates = this.position.coords;
    const message = GPSPublisher.createNavSatMessage(coordinates);

    this.msg = message;
    super.createSnapshot();
  }

  /**
   * Deserializes a GPSPublisher stored in a config object, and returns the resulting publisher instance.
   * The returned instance is already started.
   * @param {ROSLIB.Ros} ros ros instance to which to resulting publisher will publish
   * @param {Object} config object with the following keys:
   * @param {string} config.name - name of the publisher to create
   * @param {number} config.frequency - name of the publisher to create
   * @return {GPSPublisher} GPSPublisher described in the provided properties parameter
   */
  static readFromConfig(ros, config) {
    const topicName = 'mirte/phone_gps/' + config.name;
    const publisher = new GPSPublisher(ros, topicName);
    publisher.start();
    publisher.setPublishFrequency(config.frequency);

    return publisher;
  }
}

module.exports = GPSPublisher;

},{"../error/NotSupportedError":8,"./IntervalPublisher":19}],18:[function(require,module,exports){
// Dependencies
const IntervalPublisher = require('./IntervalPublisher.js');
const PermissionDeniedError = require('../error/PermissionDeniedError.js');
const MathUtils = require('../util/MathUtils.js');

/**
 * Object that publishes IMU sensor data to the provided ROS topic.
 * @see Uses the following example:
 * {@link http://wiki.ros.org/roslibjs/Tutorials/Publishing%20video%20and%20IMU%20data%20with%20roslibjs}
 */
class IMUPublisher extends IntervalPublisher {
  /**
     * Creates a new sensor publisher that publishes to the provided topic.
     * @param {ROSLIB.Ros} ros a ROS instance to publish to
     * @param {String} topicName name for the topic to publish data to
     * @param {Number} hz a standard frequency for this type of object.
     */
  constructor(ros, topicName, hz = 5) {
    // Frequency 5 used by estimation, could be further researched in the future.
    super(ros, topicName, hz);

    this.topic.messageType = 'sensor_msgs/Imu';

    // Flags used to detect whether callbacks
    // have been invoked.
    this.orientationReady = false;
    this.motionReady = false;

    // Default values
    this.alpha = 0; // [0, 360)
    this.beta = 0; // [-180, 180)
    this.gamma = 0; // [-90, 90)

    this.valpha = 0;
    this.vbeta = 0;
    this.vgamma = 0;

    /*
    * Support for iOS
    * For DeviceOrientationEvent and DeviceMotionEvent to work on Safari on iOS 13 and up,
    * the user has to give permission through a user activation event.
    * Note: This will only work through either localhost or a secure connection (https).
    */
    if (!window.MSStream && /iPad|iPhone|iPod|Macintosh/.test(window.navigator.userAgent)) {
      this.requestPermission();
    }
  }

  /**
   * Start the publishing of data to ROS with frequency of <freq> Hz.
   */
  start() {
    // If user is not on iOS, sensor data can be read as normal.
    window.addEventListener('deviceorientation', (event) => {
      if (event.isTrusted) {
        this.onReadOrientation.bind(this)(event);
      }
    });
    if (window.DeviceMotionEvent) {
      window.addEventListener('devicemotion', (event) => {
        if (event.isTrusted) {
          this.onReadMotion.bind(this)(event);
        }
      });
    } else {
      window.alert('acceleration not supported!');
    }

    super.start();
  }

  /**
   * Stops the publishing of data to ROS.
   */
  stop() {
    super.stop();

    window.removeEventListener('deviceorientation', (event) => {
      if (event.isTrusted) {
        this.onReadOrientation.bind(this)(event);
      }
    });
    window.removeEventListener('devicemotion', (event) => {
      if (event.isTrusted) {
        this.onReadMotion.bind(this)(event);
      }
    });
  }

  /**
   * Adds a button to the document to ask for permission to use IMU sensor on iOS.
   */
  requestPermission() {
    const permbutton = window.document.createElement('button');
    permbutton.innerHTML = 'Request Motion Sensor Permission';
    permbutton.addEventListener('click', () => {
      if (typeof(window.DeviceOrientationEvent.requestPermission()) === 'function' ||
      typeof(window.DeviceMotionEvent.requestPermission()) === 'function') {
        throw new Error('requestPermission for device orientation or device motion on iOS is not a function!');
      }

      // If permission is granted, Enable callback for deviceOrientationEvent and remove permissions button
      window.DeviceOrientationEvent.requestPermission().then((response) => {
        if (response==='granted') {
          permbutton.remove();
          return true;
        } else {
          throw new PermissionDeniedError('No permission granted for Device Orientation');
        }
      });
    });

    window.document.body.appendChild(permbutton);
  }

  /**
     * Callback for reading orientation data.
     * @param {*} event object containing sensor data.
     */
  onReadOrientation(event) {
    this.alpha = parseFloat(event.alpha);
    this.beta = parseFloat(event.beta);
    this.gamma = parseFloat(event.gamma);
    this.orientationReady = true;
  }

  /**
     * Callback for reading motion data.
     * @param {*} event object containing sensor data.
     */
  onReadMotion(event) {
    const rotation = event.rotationRate;
    const acceleration = event.acceleration;

    // Read acceleration
    this.x = acceleration.x;
    this.y = acceleration.y;
    this.z = acceleration.z;

    // Read rotation
    this.valpha = rotation.alpha;
    this.vbeta = rotation.beta;
    this.vgamma = rotation.gamma;

    this.motionReady = true;
  }

  /**
     * Create snapshot creates snapshot of IMU data and publishes this as a
     * ROS message to this.
     * Resource used:
     * @see {@link http://wiki.ros.org/roslibjs/Tutorials/Publishing%20video%20and%20IMU%20data%20with%20roslibjs}
     */
  createSnapshot() {
    // Convert rotation into quaternion.
    const alphaRad = ((this.alpha + 360) / 360 * 2 * Math.PI) % (2 * Math.PI);
    const betaRad = ((this.beta + 360) / 360 * 2 * Math.PI) % (2 * Math.PI);
    const gammaRad = ((this.gamma + 360) / 360 * 2 * Math.PI) % (2 * Math.PI);

    // Create Quaternion based on device orientation
    const q = MathUtils.quatFromEuler(betaRad, gammaRad, alphaRad);

    // Create imuMessage in ROS's IMU-message format.
    // For definition of message type see following source:
    // http://docs.ros.org/en/lunar/api/sensor_msgs/html/msg/Imu.html
    const imuMessage = new ROSLIB.Message(
        {
          header: {
            frame_id: 'world',
          },
          orientation: {
            x: q.x,
            y: q.y,
            z: q.z,
            w: q.w,
          },
          // According to the definition of this message,
          // an undefined asset should have value -1 at index 0 of it's covariance matrix
          orientation_covariance: [this.orientationReady ? 0 : -1, 0, 0, 0, 0, 0, 0, 0, 0],
          angular_velocity: {
            x: this.vbeta,
            y: this.vgamma,
            z: this.valpha,
          },
          // Idem for acceleration and rotation.
          angular_velocity_covariance: [this.motionReady ? 0 : -1, 0, 0, 0, 0, 0, 0, 0, 0],
          linear_acceleration: {
            x: this.x,
            y: this.y,
            z: this.z,
          },
          linear_acceleration_covariance: [this.motionReady ? 0 : -1, 0, 0, 0, 0, 0, 0, 0, 0],
        }
    );

    // Publish message on designated topic.
    this.msg = imuMessage;
    super.createSnapshot();
  }

  /**
   * Deserializes a IMUPublisher stored in a config object, and returns the resulting publisher instance.
   * The returned instance is already started.
   * @param {ROSLIB.Ros} ros ros instance to which to resulting publisher will publish
   * @param {Object} config object with the following keys:
   * @param {string} config.name - name of the publisher to create
   * @param {number} config.frequency - name of the publisher to create
   * @return {IMUPublisher} IMUPublisher described in the provided properties parameter
   */
  static readFromConfig(ros, config) {
    const topicName = 'mirte/phone_imu/' + config.name;
    const publisher = new IMUPublisher(ros, topicName);
    publisher.start();
    publisher.setPublishFrequency(config.frequency);

    return publisher;
  }
}

module.exports = IMUPublisher;

},{"../error/PermissionDeniedError.js":9,"../util/MathUtils.js":24,"./IntervalPublisher.js":19}],19:[function(require,module,exports){
// Assumptions:
// A non-set timer is no problem.

const SensorPublisher = require('./SensorPublisher');

const isEqual = require('lodash.isequal');

/**
 * Parent class that can be extended by sensors that need
 * their messages to be published at regular intervals.
 * Usage requires provision of standard frequency for class in constructor
 * and implementation of createSnapshot function.
 */
class IntervalPublisher extends SensorPublisher {
  /**
     * Creates a new sensor publisher that publishes to
     * the provided topic with a Regular interval.
     * @param {ROSLIB.Ros} ros a ROS instance to publish to
     * @param {String} topicName name for the topic from ROS on which to publish data to
     * @param {Number} hz a standard frequency for this type of object.
     */
  constructor(ros, topicName, hz = 10) {
    super(ros, topicName);

    if (hz <= 0) {
      throw new Error('Cannot construct with frequency: ' + hz);
    }

    this.freq = hz;

    this.msg = null;
    this.alReadyPublishedMsg = null;
  }

  /**
     * Start the publishing of data to ROS with frequency of <freq> Hz.
     */
  start() {
    const delay = 1000/this.freq;
    const snapshotCallback = this.createSnapshot.bind(this);
    this.timer = setInterval(snapshotCallback, delay);

    super.start();
  }

  /**
     * Stops the publishing of data to ROS.
     */
  stop() {
    super.stop();

    clearInterval(this.timer);
  }

  /**
     * Captures sensor-data at current timeframe and
     * publishes this to the topic instantly.
     */
  createSnapshot() {
    if (!this.msg) {
      throw Error('createSnapshot has not been implemented correctly');
    }
    if (isEqual(this.msg, this.alReadyPublishedMsg)) {
      return;
    }

    this.topic.publish(this.msg);

    this.alReadyPublishedMsg = this.msg;
  }

  /**
  * Sets the maximum frequency at which new data can be published.
  * @param {Number} hz frequency to be used.
  */
  setPublishFrequency(hz) {
    if (hz <= 0) {
      throw new Error('Publisher cannot publish on frequency ' + hz +
        ' Hz, frequency remained ' + this.freq);
    }

    this.freq = hz;
    // Restart timer with new frequency
    if (this.started) {
      this.stop();
      this.start();
    }
  }
}

module.exports = IntervalPublisher;

},{"./SensorPublisher":20,"lodash.isequal":1}],20:[function(require,module,exports){
/**
 * Template for object that publishes sensor data to the provided ROS topic.
 */
class SensorPublisher {
  /**
   * Creates a new sensor publisher that publishes to the provided topic.
   * @param {ROSLIB.Ros} ros a ROS instance to publish to
   * @param {String} topicName name for the topic to publish data to
   * @throws TypeError if topic argument is not of type String
   */
  constructor(ros, topicName) {
    if (!(ros instanceof ROSLIB.Ros)) {
      throw new TypeError('ros argument was not of type ROSLIB.Ros');
    }
    if (typeof(topicName) !== 'string') {
      throw new TypeError('topicName argument was not of type String');
    }

    if (/\s/.test(topicName)) {
      throw new Error('topicName argument has space');
    }

    /**
     * ros instance to publish data to
     */
    {
      this.ros = ros;
    }

    /**
     * Topicname of the topic to publish to.
     */
    this.topicName = topicName;

    /**
     * topic to publish to. The message type of the topic has to be set within every publisher
     */
    this.topic = new ROSLIB.Topic({
      ros: this.ros,
      name: this.topicName,
    });

    /**
     * start/stop status of sensor
     */
    this.started = false;
  }

  /**
   * Start the publishing of data to ROS.
   */
  start() {
    if (this.started) {
      throw new Error('Publisher already started');
    }
    this.started = true;
  }

  /**
   * Stops the publishing of data to ROS.
   */
  stop() {
    if (!this.started) {
      throw new Error('Publisher did not start yet');
    }
    this.started = false;
  }

  /**
   * Should deserialize a SensorPublisher stored in a config object,
   * and returns the resulting publisher instance.
   * The returned instance should already started.
   * @param {ROSLIB.Ros} ros ros instance to which to resulting publisher will publish
   * @param {Object} config config object describing sensor to deserialize.
   */
  static readFromConfig(ros, config) {
    throw Error('readFromConfig method not defined!');
  }
}

module.exports = SensorPublisher;

},{}],21:[function(require,module,exports){
const IntervalPublisher = require('./IntervalPublisher.js');

/**
 * SliderPublisher publishes the state of an HTML slider element.
 * This state is published every time the slider is moved.
 *
 * The data resulting from the button interactions is published as a
 * ROS std_msgs/Int message. The int contained within this message
 * ranges from 0.0 to 1.0.
 */
class SliderPublisher extends IntervalPublisher {
  /**
   * Creates a new ButtonPublisher.
   * @param {ROSLIB.Ros} ros a ROS instance to publish to
   * @param {String} topicName name for the topic to publish data to
   * @param {HTMLInputElement} slider slider of which to publish data, must have type 'range'
   * @param {Number} hz a standard frequency for this type of object.
   */
  constructor(ros, topicName, slider, hz = 8) {
    super(ros, topicName, hz);

    if (!(slider instanceof window.HTMLInputElement)) {
      throw new TypeError('slider argument was not of type HTMLInputElement');
    }

    if (slider.type !== 'range') {
      throw new TypeError('slider argument does not have type range');
    }

    this.topic.messageType = 'std_msgs/Int32';

    /**
     * slider of which to publish data
     */
    this.slider = slider;
  }

  /**
     * Captures sensor-data at current timeframe and
     * publishes this to the topic instantly.
     */
  createSnapshot() {
    const sliderValue = parseInt(this.slider.value);

    const msg = new ROSLIB.Message({
      data: sliderValue,
    });
    this.msg = msg;
    super.createSnapshot();
  }
}

module.exports = SliderPublisher;

},{"./IntervalPublisher.js":19}],22:[function(require,module,exports){
const SensorPublisher = require('./SensorPublisher.js');

/**
 * TextPublisher publishes the text of an HTML input element.
 * By default it publishes data whenever the enter key is pressed, but
 * it can be configured sends the data every keypress.
 *
 * The data resulting from the text interactions is published as a
 * ROS std_msgs/String message.
 */
class TextPublisher extends SensorPublisher {
  /**
   * Creates a new TextPublisher.
   *
   * @param {ROSLIB.Ros} ros a ROS instance to publish to
   * @param {String} topicName name for the topic to publish data to
   * @param {HTMLInputElement} inputElement input element from which to publish data.
   * @param {Object} [options] configuration options.
   * @param {boolean} [options.onEnter=true] if true publishes on enter, else publishes every key press.
   * @param {boolean} [options.clearOnPublish=true] if false, does not clear the inputElement after publishing.
   */
  constructor(ros, topicName, inputElement, options) {
    super(ros, topicName);

    this.topic.messageType = 'std_msgs/String';

    // Set default options
    this.options = options === undefined ? {} : options;
    this.options.onEnter = this.options.onEnter === undefined ? true : this.options.onEnter;
    this.options.clearOnPublish = this.options.clearOnPublish === undefined ? true : this.options.clearOnPublish;

    if (!(inputElement instanceof window.HTMLInputElement)) {
      throw new TypeError('input element was not of type HTMLInputElement');
    }

    if (inputElement.getAttribute('type') !== null &&
      inputElement.getAttribute('type') !== 'text') {
      throw new TypeError('Input element has to have type attribute "text"');
    }

    /**
     * Input element of which to publish data
     */
    this.inputElement = inputElement;

    this.onInput = function() {
      this.publishMessage();
    }.bind(this);

    this.onKeyUp = function(event) {
      if (event.key === 'Enter') {
        this.publishMessage();
      }
    }.bind(this);
  }

  /**
   * TODO: should perhaps be it's own module, allong with other message objects
   * we might need in this project
   *
   * Creates a new ROS std_msgs/String message, containing the supplied text
   * value.
   * @param {boolean} str string containing the text
   * @return {ROSLIB.Message} a new ROS std_msgs/String message, containing the
   * supplied text value.
   */
  createStrMsg(str) {
    return new ROSLIB.Message({
      data: str,
    });
  }

  /**
   * Start the publishing of data to ROS.
   */
  start() {
    if (this.options.onEnter) {
      this.inputElement.addEventListener('keyup', this.onKeyUp);
    } else {
      this.inputElement.addEventListener('input', this.onInput);
    }

    super.start();
  }

  /**
   * Stop the publishing of data to ROS.
   */
  stop() {
    super.stop();

    if (this.options.onEnter) {
      this.inputElement.removeEventListener('keyup', this.onKeyUp);
    } else {
      this.inputElement.removeEventListener('input', this.onInput);
    }
  }

  /**
   * Reads text from inputElement and publishes it.
   */
  publishMessage() {
    const msg = new ROSLIB.Message({
      data: this.inputElement.value,
    });

    this.topic.publish(msg);

    if (this.options.clearOnPublish) {
      this.inputElement.value = '';
    }
  }
}

module.exports = TextPublisher;

},{"./SensorPublisher.js":20}],23:[function(require,module,exports){
/**
 * This file tells @function require what to import when requiring the entire sensors folder.
 *
 * Any module to be exported to the library should have an entry in the object below.
 */
module.exports = {
  AmbientLightPublisher: require('./AmbientLightPublisher'),
  ButtonPublisher: require('./ButtonPublisher'),
  CameraPublisher: require('./CameraPublisher'),
  CheckboxPublisher: require('./CheckboxPublisher'),
  CompassPublisher: require('./CompassPublisher'),
  CoordinateCompassPublisher: require('./CoordinateCompassPublisher'),
  GPSPublisher: require('./GPSPublisher'),
  IMUPublisher: require('./IMUPublisher'),
  SliderPublisher: require('./SliderPublisher'),
  TextPublisher: require('./TextPublisher'),
};

},{"./AmbientLightPublisher":11,"./ButtonPublisher":12,"./CameraPublisher":13,"./CheckboxPublisher":14,"./CompassPublisher":15,"./CoordinateCompassPublisher":16,"./GPSPublisher":17,"./IMUPublisher":18,"./SliderPublisher":21,"./TextPublisher":22}],24:[function(require,module,exports){
/**
 * This code was copied and modified from Three.js/src/math/Quaternion.js
 * The modification of this code is allowed by the MIT license claimed by the Three.js project.
 *
 *
 * Convert Euler angle notation rotation to Quaternion notation.
 * @param {number} x the Euler x coordinate
 * @param {number} y the Euler angle y coordinate
 * @param {number} z as Euler angle z coordinate
 * @return {*} object containing Quaternian coordinates.
 */
function quatFromEuler(x, y, z) {
  const cos = Math.cos;
  const sin = Math.sin;

  const c1 = cos( x / 2 );
  const c2 = cos( y / 2 );
  const c3 = cos( z / 2 );

  const s1 = sin( x / 2 );
  const s2 = sin( y / 2 );
  const s3 = sin( z / 2 );

  const _x = s1 * c2 * c3 + c1 * s2 * s3;
  const _y = c1 * s2 * c3 - s1 * c2 * s3;
  const _z = c1 * c2 * s3 + s1 * s2 * c3;
  const _w = c1 * c2 * c3 - s1 * s2 * s3;

  return {'x': _x, 'y': _y, 'z': _z, 'w': _w};
}

module.exports = {
  quatFromEuler: quatFromEuler,
};

},{}],25:[function(require,module,exports){
const ButtonPublisher = require('../sensors/ButtonPublisher');
const CheckboxPublisher = require('../sensors/CheckboxPublisher');
const ImageSubscriber = require('../actuators/ImageSubscriber');
const SliderPublisher = require('../sensors/SliderPublisher');
const TextPublisher = require('../sensors/TextPublisher');
const TextSubscriber = require('../actuators/TextSubscriber');

/**
 * Takes an HTML element, and creates the appropriate Publisher if possible.
 * The id of the element and type of element will determine the name of the topic.
 * In order to be able to publish an element, the following must be true:
 *  - The element must have an id
 *  - The element must be an HTML element
 *  - The element must be one of the following types:
 *    > HTMLButtonElement - published as ButtonPublisher, to topic mirte/phone_button/{id}
 *    > HTMLInputElement - published as SliderPublisher if type is set to 'range',
 *      and as TextPublisher if type is set to 'text', to topics mirte/phone_slider/{id}
 *      and mirte/phone_text_input/{id} respectively
 *    > HTMLCanvasElement - subscribed as ImageSubscriber, to topic mirte/phone_image_output/{id}
 *    > If none of the above are applicable, the element will be subscribed as a TextSubscriber
 *      to topic mirte/phone_text_output/{id}
 * Any resulting publisher or subscriber will be placed in the provided map, with its id as its key
 * @param {HTMLElement} element HTMLElement to attempt to publish
 * @param {ROSLIB.Ros} ros ros instance to which to publish/subscribe resulting publishers and subscribers
 * @param {Map} map Map in which to place any created publisher or subscriber
 */
function tryPublishElement(element, ros, map) {
  const instanceName = element.id;

  // do not publish elements without id
  if (instanceName.length < 1) {
    return;
  }

  if (!(element instanceof window.HTMLElement)) {
    throw new TypeError('element was not instance of HTMLElement');
  }

  // find appropriate action for element
  let mapEntry;
  switch (element.constructor.name) {
    case 'HTMLButtonElement':
      mapEntry = new ButtonPublisher(ros, 'mirte/phone_button/' + instanceName, element);
      break;
    case 'HTMLInputElement':
      if (element.type && element.type === 'range') {
        mapEntry = new SliderPublisher(ros, 'mirte/phone_slider/' + instanceName, element);
      } else if (element.type && element.type === 'text') {
        mapEntry = new TextPublisher(ros, 'mirte/phone_text_input/' + instanceName, element);
      } else if (element.type && element.type === 'checkbox') {
        mapEntry = new CheckboxPublisher(ros, 'mirte/phone_checkbox/' + instanceName, element);
      }
      break;
    case 'HTMLCanvasElement':
      mapEntry = new ImageSubscriber(ros, 'mirte/phone_image_output/' + instanceName, element);
      break;
    default:
      mapEntry = new TextSubscriber(ros, 'mirte/phone_text_output/' + instanceName, element);
  }

  // check for duplicate topic names
  const topicName = mapEntry.topic.name;
  if (map.has(topicName)) {
    throw new Error(`topic name ${topicName} already published`);
  }

  mapEntry.start();
  map.set(topicName, mapEntry);
}

/**
 * Recursively publishes all children of the provided parentElement.
 * In order to be publishable, a child element must have an id.
 * For more information on the publishing of these childnodes,
 * see the comments on the @function tryPublishElement function
 * @param {HTMLElement} parentElement element of which to publish child elements
 * @param {ROSLIB.Ros} ros ros instance to which to publish child elements
 * @param {Map} [map] map in which to place resulting publishers and subscribers.
 *  Will create an empty map if no map is given.
 * @return {Map} Map where each publisher is stored under it's respective topic name
 */
function publishChildElements(parentElement, ros, map) {
  // create default map
  map = map || new Map();

  if (!(ros instanceof ROSLIB.Ros)) {
    throw new TypeError('ros argument must be of type ROSLIB.Ros');
  }

  if (!(parentElement instanceof window.HTMLElement)) {
    throw new TypeError('parentElement argument must be of type HTMLElement');
  }

  if (!(map instanceof Map)) {
    throw new TypeError('map argument must be of type Map');
  }

  // check recursive base case
  if (parentElement.children === 0) {
    return map;
  }

  // depth-first search through all children for valid elements to publish
  for (let i = 0; i < parentElement.childElementCount; i++) {
    const childNode = parentElement.children[i];

    tryPublishElement(childNode, ros, map);
    publishChildElements(childNode, ros, map);
  }

  return map;
}

module.exports = {
  publishChildElements: publishChildElements,
  tryPublishElement: tryPublishElement,
};

},{"../actuators/ImageSubscriber":4,"../actuators/TextSubscriber":6,"../sensors/ButtonPublisher":12,"../sensors/CheckboxPublisher":14,"../sensors/SliderPublisher":21,"../sensors/TextPublisher":22}],26:[function(require,module,exports){
// assign all functions exported by util files to exports
Object.assign(module.exports, require('./mirteUtil'));
Object.assign(module.exports, require('./documentUtils'));
Object.assign(module.exports, require('./MathUtils'));

},{"./MathUtils":24,"./documentUtils":25,"./mirteUtil":27}],27:[function(require,module,exports){
const CameraPublisher = require('../sensors/CameraPublisher');
const CompassPublisher = require('../sensors/CompassPublisher');
const CoordinateCompassPublisher = require('../sensors/CoordinateCompassPublisher');
const GPSPublisher = require('../sensors/GPSPublisher');
const IMUPublisher = require('../sensors/IMUPublisher');

/**
 * Array containing deserializers for every type of sensor.
 * An deserializers is a function that takes a ros instance and a properties object,
 * and returns the corresponding SensorPublisher.
 */
const sensorDeserializers = {
  'phone_imu': IMUPublisher.readFromConfig,
  'phone_compass': CompassPublisher.readFromConfig,
  'phone_gps': GPSPublisher.readFromConfig,
  'phone_point_to_coordinate': CoordinateCompassPublisher.readFromConfig,
  'phone_camera': CameraPublisher.readFromConfig,
};

/**
 * Reads the mirte ROS parameters and publishes sensors as indicated
 * in the mirte parameters.
 * @param {Object} config object containing sensor configuration
 * @param {ROSLIB.Ros} ros ros instance to publish to
 * @return {Map} map containing all sensors with their respective publisher
 */
function readSensorsFromConfig(config, ros) {
  const sensorMap = new Map();

  // loop through all publishable sensor types, e.g. imu or compass
  // (see sensorDeserializers array)
  for (const sensorType of Object.keys(sensorDeserializers)) {
    const sensorInstances = config[sensorType];

    // check if no instances of the sensor type present in config
    if (!sensorInstances) {
      continue;
    }

    // loop through all instances, and publish them
    for (const instanceProperties of Object.values(sensorInstances)) {
      const sensorInitializer = sensorDeserializers[sensorType];
      const sensorPublisher = sensorInitializer(ros, instanceProperties);
      sensorMap.set(sensorPublisher.topic.name, sensorPublisher);
    }
  }
  return sensorMap;
}


module.exports = {
  readSensorsFromConfig: readSensorsFromConfig,
};

},{"../sensors/CameraPublisher":13,"../sensors/CompassPublisher":15,"../sensors/CoordinateCompassPublisher":16,"../sensors/GPSPublisher":17,"../sensors/IMUPublisher":18}]},{},[2]);
