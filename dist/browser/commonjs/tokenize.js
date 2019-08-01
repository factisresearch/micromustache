"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var defaultTokenizeOptions = ['{{', '}}'];
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
function tokenize(template, options) {
    if (options === void 0) { options = defaultTokenizeOptions; }
    if (!Array.isArray(options) || options.length !== 2) {
        throw Error('Tags should be an array with exactly two strings. Got ' + options);
    }
    var openSym = options[0], closeSym = options[1];
    if (typeof openSym !== 'string' ||
        typeof closeSym !== 'string' ||
        openSym.length === 0 ||
        closeSym.length === 0 ||
        openSym === closeSym) {
        throw new TypeError('The tags array should have two distinct non-empty strings. Got ' +
            options.join(', '));
    }
    var openSymLen = openSym.length;
    var closeSymLen = closeSym.length;
    var openIndex;
    var closeIndex = 0;
    var varName;
    var strings = [];
    var varNames = [];
    var currentIndex = 0;
    while (currentIndex < template.length) {
        openIndex = template.indexOf(openSym, currentIndex);
        if (openIndex === -1) {
            break;
        }
        closeIndex = template.indexOf(closeSym, openIndex);
        if (closeIndex === -1) {
            throw new SyntaxError('Missing ' + closeSym + ' in the template expression ' + template);
        }
        varName = template.substring(openIndex + openSymLen, closeIndex).trim();
        if (varName.length === 0) {
            throw new SyntaxError('Unexpected token ' + closeSym);
        }
        if (varName.includes(openSym)) {
            throw new SyntaxError('Variable names cannot have ' + openSym + ' ' + varName);
        }
        varNames.push(varName);
        closeIndex += closeSymLen;
        strings.push(template.substring(currentIndex, openIndex));
        currentIndex = closeIndex;
    }
    strings.push(template.substring(closeIndex));
    return { strings: strings, varNames: varNames };
}
exports.tokenize = tokenize;
//# sourceMappingURL=tokenize.js.map