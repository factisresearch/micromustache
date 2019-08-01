"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var get_1 = require("./get");
var topath_1 = require("./topath");
var defaultRendererOptions = {};
/**
 * This class does the heavy lifting of interpolation (putting the actual values
 * in the template).
 * This is created by the `.compile()` method and is used under the hood by
 * `.render()`, `renderFn()` and `renderFnAsync()` functions.
 */
var Renderer = /** @class */ (function () {
    /**
     * Creates a new Renderer instance. This is called internally by the compiler.
     * @param tokens - the result of the `.tokenize()` function
     * @param options - some options for customizing the rendering process
     * @throws `TypeError` if the token is invalid
     */
    function Renderer(tokens, options) {
        var _this = this;
        if (options === void 0) { options = defaultRendererOptions; }
        this.tokens = tokens;
        this.options = options;
        /**
         * Replaces every {{varName}} inside the template with values from the scope
         * parameter.
         *
         * @param template The template containing one or more {{varName}} as
         * placeholders for values from the `scope` parameter.
         * @param scope An object containing values for variable names from the the
         * template. If it's omitted, we default to an empty object.
         */
        this.render = function (scope) {
            if (scope === void 0) { scope = {}; }
            var varNames = _this.tokens.varNames;
            var length = varNames.length;
            _this.cacheParsedPaths();
            var values = new Array(length);
            for (var i = 0; i < length; i++) {
                values[i] = get_1.get(scope, _this.toPathCache[i], _this.options.propsExist);
            }
            return _this.stringify(values);
        };
        /**
         * Same as [[render]] but accepts a resolver function which will be
         * responsible for returning a value for every varName.
         */
        this.renderFn = function (resolveFn, scope) {
            if (scope === void 0) { scope = {}; }
            var values = _this.resolveVarNames(resolveFn, scope);
            return _this.stringify(values);
        };
        /**
         * Same as [[render]] but accepts a resolver function which will be responsible
         * for returning promise that resolves to a value for every varName.
         */
        this.renderFnAsync = function (resolveFnAsync, scope) {
            if (scope === void 0) { scope = {}; }
            return Promise.all(_this.resolveVarNames(resolveFnAsync, scope)).then(function (values) { return _this.stringify(values); });
        };
        if (tokens === null ||
            typeof tokens !== 'object' ||
            !Array.isArray(tokens.strings) ||
            !Array.isArray(tokens.varNames) ||
            tokens.strings.length !== tokens.varNames.length + 1) {
            throw new TypeError('Invalid tokens object ' + tokens);
        }
        if (options.validateVarNames) {
            // trying to initialize toPathCache parses them which is also validation
            this.cacheParsedPaths();
        }
    }
    /**
     * This function is called internally for filling in the `toPathCache` cache.
     * If the `validateVarNames` option for the constructor is set to a truthy
     * value, this function is called immediately which leads to a validation as
     * well because it throws an error if it cannot parse variable names.
     */
    Renderer.prototype.cacheParsedPaths = function () {
        var varNames = this.tokens.varNames;
        if (this.toPathCache === undefined) {
            this.toPathCache = new Array(varNames.length);
            for (var i = 0; i < varNames.length; i++) {
                this.toPathCache[i] = topath_1.toPath.cached(varNames[i]);
            }
        }
    };
    Renderer.prototype.resolveVarNames = function (resolveFn, scope) {
        if (scope === void 0) { scope = {}; }
        var varNames = this.tokens.varNames;
        if (typeof resolveFn !== 'function') {
            throw new TypeError('Expected a resolver function but got ' + resolveFn);
        }
        var length = varNames.length;
        var values = new Array(length);
        for (var i = 0; i < length; i++) {
            values[i] = resolveFn(varNames[i], scope);
        }
        return values;
    };
    /**
     * Puts the resolved `values` into the rest of the template (`strings`) and
     * returns the final result that'll be returned from `render()`, `renderFn()`
     * and `renderFnAsync()` functions.
     */
    Renderer.prototype.stringify = function (values) {
        var strings = this.tokens.strings;
        var explicit = this.options.explicit;
        var ret = '';
        var length = values.length;
        for (var i = 0; i < length; i++) {
            ret += strings[i];
            var value = values[i];
            if (explicit || (value !== null && value !== undefined)) {
                ret += value;
            }
        }
        ret += strings[length];
        return ret;
    };
    return Renderer;
}());
exports.Renderer = Renderer;
//# sourceMappingURL=renderer.js.map