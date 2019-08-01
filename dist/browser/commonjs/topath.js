"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * The number of different varNames that will be cached.
 * If a varName is cached, the actual parsing algorithm will not be called
 * which significantly improves performance.
 * However, this cache is size-limited to prevent degrading the user's software
 * over a period of time.
 * If the cache is full, we start removing older varNames one at a time.
 */
var cacheSize = 100;
var quoteChars = '\'"`';
/**
 * @ignore
 */
var Cache = /** @class */ (function () {
    function Cache(size) {
        this.size = size;
        this.reset();
    }
    Cache.prototype.reset = function () {
        this.oldestIndex = 0;
        this.map = {};
        this.cachedKeys = new Array(this.size);
    };
    Cache.prototype.get = function (key) {
        return this.map[key];
    };
    Cache.prototype.set = function (key, value) {
        this.map[key] = value;
        var oldestKey = this.cachedKeys[this.oldestIndex];
        if (oldestKey !== undefined) {
            delete this.map[oldestKey];
        }
        this.cachedKeys[this.oldestIndex] = key;
        this.oldestIndex++;
        this.oldestIndex %= this.size;
    };
    return Cache;
}());
exports.Cache = Cache;
var cache = new Cache(cacheSize);
/**
 * Removes the quotes from a string and returns it.
 * @param propName an string with quotations
 * @throws `SyntaxError` if the quotation symbols don't match or one is missing
 * @returns the input with its quotes removed
 */
function propBetweenBrackets(propName) {
    // in our algorithms key is always a string and never only a string of spaces
    var firstChar = propName.charAt(0);
    var lastChar = propName.substr(-1);
    if (quoteChars.includes(firstChar) || quoteChars.includes(lastChar)) {
        if (propName.length < 2 || firstChar !== lastChar) {
            throw new SyntaxError('Mismatching string quotation: ' + propName);
        }
        return propName.substring(1, propName.length - 1);
    }
    if (propName.includes('[')) {
        throw new SyntaxError('Missing ] in varName ' + propName);
    }
    // Normalize leading plus from numerical indices
    if (firstChar === '+') {
        return propName.substr(1);
    }
    return propName;
}
function pushPropName(propNames, propName, preDot) {
    var pName = propName.trim();
    if (pName === '') {
        return propNames;
    }
    if (pName.startsWith('.')) {
        if (preDot) {
            pName = pName.substr(1).trim();
            if (pName === '') {
                return propNames;
            }
        }
        else {
            throw new SyntaxError('Unexpected . at the start of "' + propName + '"');
        }
    }
    else if (preDot) {
        throw new SyntaxError('Missing . at the start of "' + propName + '"');
    }
    if (pName.endsWith('.')) {
        throw new SyntaxError('Unexpected "." at the end of "' + propName + '"');
    }
    var propNameParts = pName.split('.');
    for (var _i = 0, propNameParts_1 = propNameParts; _i < propNameParts_1.length; _i++) {
        var propNamePart = propNameParts_1[_i];
        var trimmedPropName = propNamePart.trim();
        if (trimmedPropName === '') {
            throw new SyntaxError('Empty prop name when parsing "' + propName + '"');
        }
        propNames.push(trimmedPropName);
    }
    return propNames;
}
/**
 * Breaks a variable name to an array of strings that can be used to get a
 * particular value from an object
 * @param varName - the variable name as it occurs in the template.
 * For example `a["b"].c`
 * @throws `TypeError` if the varName is not a string
 * @throws `SyntaxError` if the varName syntax has a problem
 * @returns - an array of property names that can be used to get a particular
 * value.
 * For example `['a', 'b', 'c']`
 */
function toPath(varName) {
    if (typeof varName !== 'string') {
        throw new TypeError('Expected string but Got ' + varName);
    }
    var openBracketIndex;
    var closeBracketIndex = 0;
    var beforeBracket;
    var propName;
    var preDot = false;
    var propNames = [];
    for (var currentIndex = 0; currentIndex < varName.length; currentIndex = closeBracketIndex) {
        openBracketIndex = varName.indexOf('[', currentIndex);
        if (openBracketIndex === -1) {
            break;
        }
        closeBracketIndex = varName.indexOf(']', openBracketIndex);
        if (closeBracketIndex === -1) {
            throw new SyntaxError('Missing ] in varName ' + varName);
        }
        propName = varName.substring(openBracketIndex + 1, closeBracketIndex).trim();
        if (propName.length === 0) {
            throw new SyntaxError('Unexpected token ]');
        }
        closeBracketIndex++;
        beforeBracket = varName.substring(currentIndex, openBracketIndex);
        pushPropName(propNames, beforeBracket, preDot);
        propNames.push(propBetweenBrackets(propName));
        preDot = true;
    }
    var rest = varName.substring(closeBracketIndex);
    return pushPropName(propNames, rest, preDot);
}
exports.toPath = toPath;
/**
 * This is just a faster version of `toPath()`
 */
function toPathCached(varName) {
    var result = cache.get(varName);
    if (result === undefined) {
        result = toPath(varName);
        cache.set(varName, result);
    }
    return result;
}
toPath.cached = toPathCached;
//# sourceMappingURL=topath.js.map