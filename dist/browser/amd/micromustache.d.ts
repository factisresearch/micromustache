declare module "topath" {
    export type PropNames = string[];
    /**
     * @ignore
     */
    export class Cache<T> {
        private size;
        private map;
        private cachedKeys;
        private oldestIndex;
        constructor(size: number);
        reset(): void;
        get(key: string): T;
        set(key: string, value: T): void;
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
    declare function toPath(varName: string): PropNames;
    declare namespace toPath {
        var cached: typeof toPathCached;
    }
    export default toPath;
    /**
     * This is just a faster version of `toPath()`
     */
    function toPathCached(varName: string): PropNames;
}
declare module "get" {
    import { PropNames } from "topath";
    export type Scope = {} | Function;
    /**
     * Similar to lodash `_.get()`
     *
     * Differences with JavaScript:
     * No support for keys that include `[` or `]`.
     * No support for keys that include `'` or `"` or `.
     * `foo[bar]` is allowed while JavaScript treats `bar` as a variable and tries
     * to lookup its value or throws a `ReferenceError` if there is no variable
     * called `bar`.
     * If it cannot find a value in the specified path, it may return undefined or
     * throw an error depending on the value of the `propExists` param.
     * @param scope an object to resolve value from
     * @param varNameOrPropNames the variable name string or an array of property
     * names (as returned by `toPath()`)
     * @param propExists claiming that the varName is exists in the scope.
     * It defaults to false which means we don't throw an error (like Mustachejs).
     * @throws `SyntaxError` if the varName string cannot be parsed
     * @throws `ReferenceError` if the scope does not contain the requested key
     * but the `propExists` is set to a truthy value
     * @returns the value or undefined. If path or scope are undefined or scope is
     * null the result is always undefined.
     */
    export function get(scope: Scope, varNameOrPropNames: PropNames | string, propExists?: boolean): any;
}
declare module "tokenize" {
    export interface ITokens {
        /** An array of constant strings */
        readonly strings: string[];
        /** An array of variable names */
        readonly varNames: string[];
    }
    /**
     * An array of two strings specifying the opening and closing tags that mark
     * the start and end of a variable name in the template.
     * It defaults to `['{{', '}}']`
     */
    export type TokenizeOptions = [string, string];
    /**
     * Parse a template and returns the tokens in an object.
     *
     * @throws `TypeError` if there's an issue with its inputs
     * @throws `SyntaxError` if there's an issue with the template
     *
     * @param template the template
     * @param openSym the string that marks the start of a variable name
     * @param closeSym the string that marks the start of a variable name
     * @returns the resulting tokens as an object that has strings and variable names
     */
    export function tokenize(template: string, options?: TokenizeOptions): ITokens;
}
declare module "renderer" {
    import { Scope } from "get";
    import { ITokens } from "tokenize";
    /**
     * The options passed to Renderer's constructor
     */
    export interface IRendererOptions {
        /**
         * When set to a truthy value, rendering literally puts a 'null' or
         * 'undefined' for values that are `null` or `undefined`.
         * By default it swallows those values to be compatible with Mustache.
         */
        readonly explicit?: boolean;
        /**
         * When set to a truthy value, we throw a ReferenceError for invalid varNames.
         * Invalid varNames are the ones that do not exist in the scope.
         * In that case the value for the varNames will be assumed an empty string.
         * By default we throw a ReferenceError to be compatible with how JavaScript
         * threats such invalid reference.
         * If a value does not exist in the scope, two things can happen:
         * - if `propsExist` is truthy, the value will be assumed empty string
         * - if `propsExist` is falsy, a ReferenceError will be thrown
         */
        readonly propsExist?: boolean;
        /** when set to a truthy value, validates the variable names */
        readonly validateVarNames?: boolean;
    }
    /**
     * The callback for resolving a value (synchronous)
     * @param scope the scope object that was passed to .render() function
     * @param path variable name before being parsed.
     * @example a template that is `Hi {{a.b.c}}!` leads to `'a.b.c'` as path
     * @returns the value to be interpolated.
     */
    export type ResolveFn = (varName: string, scope?: Scope) => any;
    /**
     * Same as `ResolveFn` but for asynchronous functions
     */
    export type ResolveFnAsync = (varName: string, scope?: Scope) => Promise<any>;
    /**
     * This class does the heavy lifting of interpolation (putting the actual values
     * in the template).
     * This is created by the `.compile()` method and is used under the hood by
     * `.render()`, `renderFn()` and `renderFnAsync()` functions.
     */
    export class Renderer {
        private readonly tokens;
        private readonly options;
        /**
         * Another cache that holds the parsed values for `toPath()` one per varName
         */
        private toPathCache;
        /**
         * Creates a new Renderer instance. This is called internally by the compiler.
         * @param tokens - the result of the `.tokenize()` function
         * @param options - some options for customizing the rendering process
         * @throws `TypeError` if the token is invalid
         */
        constructor(tokens: ITokens, options?: IRendererOptions);
        /**
         * This function is called internally for filling in the `toPathCache` cache.
         * If the `validateVarNames` option for the constructor is set to a truthy
         * value, this function is called immediately which leads to a validation as
         * well because it throws an error if it cannot parse variable names.
         */
        private cacheParsedPaths;
        /**
         * Replaces every {{varName}} inside the template with values from the scope
         * parameter.
         *
         * @param template The template containing one or more {{varName}} as
         * placeholders for values from the `scope` parameter.
         * @param scope An object containing values for variable names from the the
         * template. If it's omitted, we default to an empty object.
         */
        render: (scope?: Scope) => string;
        /**
         * Same as [[render]] but accepts a resolver function which will be
         * responsible for returning a value for every varName.
         */
        renderFn: (resolveFn: ResolveFn, scope?: Scope) => string;
        /**
         * Same as [[render]] but accepts a resolver function which will be responsible
         * for returning promise that resolves to a value for every varName.
         */
        renderFnAsync: (resolveFnAsync: ResolveFnAsync, scope?: Scope) => Promise<string>;
        private resolveVarNames;
        /**
         * Puts the resolved `values` into the rest of the template (`strings`) and
         * returns the final result that'll be returned from `render()`, `renderFn()`
         * and `renderFnAsync()` functions.
         */
        private stringify;
    }
}
declare module "compile" {
    import { Renderer, IRendererOptions } from "renderer";
    import { TokenizeOptions } from "tokenize";
    /**
     * The options that customize the tokenization of the template and the renderer
     * object that is returned
     */
    export interface ICompileOptions extends IRendererOptions {
        /**
         * The string symbols that mark the opening and closing of a variable name in
         * the template.
         * It defaults to `['{{', '}}']`
         */
        readonly tags?: TokenizeOptions;
    }
    /**
     * Compiles a template and returns an object with functions that render it.
     * Compilation makes repeated render calls more optimized by parsing the
     * template only once and reusing the results.
     * As a result, rendering gets 3-5x faster.
     * Caching is stored in the resulting object, so if you free up all the
     * references to that object, the caches will be garbage collected.
     *
     * @param template same as the template parameter to .render()
     * @param options some options for customizing the compilation
     * @throws `TypeError` if the template is not a string
     * @throws `TypeError` if the options is set but is not an object
     * @throws any error that [[tokenize]] or [[Renderer.constructor]] may throw
     * @returns an object with some methods that can do the actual rendering
     */
    export function compile(template: string, options?: ICompileOptions): Renderer;
}
declare module "render" {
    import { ResolveFn, ResolveFnAsync } from "renderer";
    import { Scope } from "get";
    import { ICompileOptions } from "compile";
    /**
     * Replaces every {{varName}} inside the template with values from the scope
     * parameter.
     *
     * @param template The template containing one or more {{varName}} as
     * placeholders for values from the `scope` parameter.
     * @param scope An object containing values for variable names from the the
     * template. If it's omitted, we default to an empty object.
     * Since functions are objects in javascript, the `scope` can technically be a
     * function too but it won't be called. It'll be treated as an object and its
     * properties will be used for the lookup.
     * @param options same options as the [[compile]] function
     * @throws any error that [[compile]] or [[Renderer.render]] may throw
     * @returns Template where its variable names replaced with
     * corresponding values.
     */
    export function render(template: string, scope?: Scope, options?: ICompileOptions): string;
    /**
     * Same as [[render]] but accepts a resolver function which will be responsible
     * for returning a value for every varName.
     * @throws any error that [[compile]] or [[Renderer.renderFn]] may throw
     */
    export function renderFn(template: string, resolveFn: ResolveFn, scope?: Scope, options?: ICompileOptions): string;
    /**
     * Same as [[renderFn]] but only works with asynchronous resolver functions
     * (a function that returns a promise instead of the value).
     * @throws any error that [[compile]] or [[Renderer.renderFnAsync]] may throw
     */
    export function renderFnAsync(template: string, resolveFnAsync: ResolveFnAsync, scope?: Scope, options?: ICompileOptions): Promise<string>;
}
declare module "index" {
    export * from "get";
    export * from "renderer";
    export * from "tokenize";
    export * from "compile";
    export * from "render";
}
