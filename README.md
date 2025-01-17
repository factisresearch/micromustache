[![Build Status](https://travis-ci.org/userpixel/micromustache.svg?branch=master)](https://travis-ci.org/userpixel/micromustache)
[![GitHub issues](https://img.shields.io/github/issues/userpixel/micromustache.svg)](https://github.com/userpixel/micromustache/issues)
[![Version](https://img.shields.io/npm/v/micromustache.svg?style=flat-square)](http://npm.im/micromustache)
[![Downloads](https://img.shields.io/npm/dm/micromustache.svg?style=flat-square)](http://npm-stat.com/charts.html?package=micromustache&from=2017-01-01)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
[![MIT License](https://img.shields.io/npm/l/callifexists.svg?style=flat-square)](http://opensource.org/licenses/MIT)
[![Known Vulnerabilities](https://snyk.io/test/github/userpixel/micromustache/badge.svg)](https://snyk.io/test/github/userpixel/micromustache)

# micromustache

![Logo](https://raw.github.com/userpixel/micromustache/master/logo.png)

A **secure**, fast and lightweight template engine with some handy additions.

**Think of it as a sweet spot between plain text interpolation and [mustache.js](https://github.com/janl/mustache.js); Certainly not as logic-ful as [Handlebars](http://handlebarsjs.com/)! Sometimes a stricter syntax is the right boundary to reduce potential errors and improve performance.**

* 🏃 **2x-3x** faster than MustacheJS
* 🔒 **Secure**. Works in CSP environments (no usage of `eval()` or `new Function()`). Published only with 2FA. [No regexp](https://medium.com/@liran.tal/node-js-pitfalls-how-a-regex-can-bring-your-system-down-cbf1dc6c4e02).
* 🎈 **Lightweight** No dependencies, less than 400 lines of source code, small API surface, easy to pick up
* 🐁 **Small memory footprint** sane caching strategy, no memory leak
* 🏳 **No dependencies**
* ✏ **Bracket notation** support `a[1]['foo']` accessors (mustache.js syntax of `a.1.foo` is still supported).
* 🚩 **Meaningful errors** in case of template syntax errors to make it easy to spot and fix. All functions test their input contracts and throw meaningful errors to improve developer experience (DX)
* ⚡ **TypeScript** types included out of the box and updated with every version of the library
* 🐇 Works in node (CommonJS) and Browser (AMD)
* 🛠 Well tested (full test coverage over 120+ tests). Also tested to produce the same results as [Mustache.js](https://github.com/janl/mustache.js/).
* 📖 Full JSDoc documentation
* [CLI](./bin/README.md) for quickly doing interpolations without having to write a program

If variable interpolation is all you need, *micromustache* is a [drop-in replacement](src/mustachejs.spec.js) for MustacheJS (see its differences with [Mustache.js](https://github.com/userpixel/micromustache/wiki/Differences-with-Mustache.js))

[Try it in your browser!](https://npm.runkit.com/micromustache)

# Getting started

Install:

```bash
$ npm i micromustache
```

Use:

```javascript
const { render } = require('micromustache')
console.log(render('Hello {{name}}!', { name: 'world' }))
// Hello world!
```

Why not just use EcmaScript [template literals](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals)?

Template literals work great when the template and the variables are in the same scope but not so well when the template is in another scope or is not known ahead of time. For example, suppose you had a function like this:

```javascript
function greet(name) {
  return `Hi ${name}!`
}
```

After your function became successful and you got rich 🤑 you may decide to dominate the world and expand to new markets which speak other languages. You need to internationalize it. Adding one more language is easy:

```javascript
function greet(name, lang) {
  // Note the lang parameter that contains a language code
  return lang === 'sv' ? `Hej ${name}!` : `Hi ${name}!`
}
```

But how about a bunch of them?

```javascript
function greet(name, lang) {
  switch (lang) {
    case 'sv': return `Hej ${name}!`
    case 'es': return `Hola ${name}!`
    default:
    case 'en': return `Hi ${name}!`
  }
}
```

That doesn't scale well as you dominate country after country and need to support more languages! Besides, that's just one string! The main problem is that the content (the text) is coupled to the code (the variable interpolation). **Template engines** help you to move the content out of the function and let something else deal with that concern.

```javascript
const { render } = require('micromustache')
// A very simplified i18n database
const db = {
  en: {
    greeting: 'Hi {{name}}!',
    // ...
  },
  sv: {
    greeting: 'Hej {{name}}!',
    // ...
  },
  // ...
}

function greet(name, lang) {
  return render(db[lang].greeting, { name } )
}
```

Now it's better! 😎 All the templates are together and they are easy to update and translate. By default, we use the popular syntax that encloses variable names between double curly braces (`{{` and `}}`) but you can customize _micromustache_ if you prefer something else.
Just like template literals, you can of course reference deep nested objects:

```javascript
const { render } = require('micromustache')
const scope = {
  fruits: [
    { name: 'Apple', color: 'red' },
    { name: 'Banana', color: 'yellow' },
  ]
}
console.log(render('I like {{fruits[1].color}}!', scope))
// I like Bababa!
```

*It worth to note that Mustache and Handlebars don't support `fruits[1].color` syntax and rather expect you to write it as `fruits.1.color`.*

The real power of micromustache comes from letting you resolve a variable name using your own functions! To pass a resolver function, you can use `renderFn()` instead of `render()`:

```javascript
const { renderFn } = require('micromustache')
// Just converts the variable name to upper case
const up = str => str.toUpperCase()

console.log(renderFn('My name is {{Alex}}!', up))
// My name is ALEX!
```

The resolver gets the scope as its second parameter. If you want to lookup a value, there's a `get()` function as well:

```javascript
const { renderFn, get } = require('micromustache')

// Looks up the value and converts it to stars
function star(varName, scope) {
  // varName comes from the template and is 'password' here
  // scope is { password: 'abc' }
  const value = get(scope, varName) // value is 'abc'
  return '*'.repeat(value.length)
}

console.log(renderFn('My password is {{password}}!', star, { password: 'abc' }))
// My password is ***!
```

If you want to resolve a value asynchronously, we got you covered using the `renderFnAsync()` instead of `renderFn()`. For example the following code uses [node-fetch](https://www.npmjs.com/package/node-fetch) to resolve a url.

```javascript
const { renderFnAsync } = require('micromustache')
const fetch = require('node-fetch')

async function taskTitleFromUrl(url) {
  const response = await fetch(url)
  const obj = await response.json()
  return obj.title
}

console.log(await renderFnAsync('Got {{https://jsonplaceholder.typicode.com/todos/1}}!', fetch))
// Got delectus aut autem!
```

If you find yourself working on a particular template too often, you can `compile()` it once and cache the result so the future renders will be much faster. The compiler returns an object with `render()`, `renderFn()` and `renderFnAsync()` methods. The only difference is that they don't get the template and only need a scope:

```javascript
const { compile } = require('micromustache')
const compiled = compile('Hello {{name}}! I am {{age}} years old!')
console.log(compiled.render({ name: 'world', age: 42 }))
// Hello world! I'm 42
// The methods are bound so you can use the destructed version for brevity
const { render } = compile
console.log(render({ name: 'world', age: 42 }))
// Hello world! I'm 42
```

*If the `compiled` variable above is garbage collected, the cache is freed (unlike some other template engines that dearly keep hold of the compiled result in their cache which may leads to memory leaks or **out of memory errors** over longer usage).*

Using the options you can do all sorts of fancy stuff. For example, here is an imitation of the **C#** string interpolation syntax:

```javascript
const { render } = require('micromustache')
const $ = scope => strings => render(strings[0], scope, { tags: ['{', '}'] })

const name = 'Michael'
console.log($({ name })`Hello {name}!`)
// Hello Michael!
```

# API

## `render(template, scope, options)`

Replaces every {{varName}} inside the template with values from the scope parameter.

###### Params

* `template` The template string containing zero or more `{{varName}}` as placeholders for looking up values from the `scope` parameter.
* `scope?: object` An object containing values for variable names from the the template. If it's omitted, we default to an empty object. Since functions are objects in javascript, the `scope` can technically be a function too but it won't be called. It'll be treated as an object and its properties will be used for the lookup.
* `options?: object` see below 👇

###### Returns

The template string where its variable names replaced with corresponding values

###### Throws

* `TypeError` if the `template` is not a string, `scope` is not an object, or `options` is invalid
* `SyntaxError` if the template does not comply with the syntax

## `renderFn(template, resolveFn, scope, options)`

Same as render but accepts a function that allows you to resolve the variable name to a value as you choose. _Tip: you may do some extra processing and use the `get()` function underneath but that's up to you._

###### New params

* `resolveFn: (varName, scope) => any` a function that takes a variable name and resolves it to a value. The value can be a number, string or boolean. If it is not, it'll be "stringified".

## `renderFnAsync(template, resolveFnAsync, scope, options)`

Same as `renderFn()` but expects a resolver function that always returns a promise.

###### New params

* `resolveFnAsync: (varName, scope) => Promise<any>` a function that takes a variable name and returns a promise that resolves to a value. The value can be a number, string or boolean. If it is not, it'll be "stringified".

###### Returns

A promise that resolves to the final output once all the `resolveFnAsync` functions are resolved

## `compile(template, options)`

Compiles a template and returns an object that has the render functions. This drammatically improves the interpolation speed (2x-3x) compared to `render()`.

###### Params

* `template` same template that is passed to `render()`
* `options?: object` see below 👇

###### Returns

An object with 3 methods:
* `render(scope)` same as the `render()` function above but without the `template` parameter
* `renderFn(resolveFn, scope)` same as the `renderFn()` function above but without the `template` parameter
* `renderFnAsync(resolveFnAsync, scope)` same as the `renderFnAsync()` function above but without the `template` parameter

###### Throws

* `TypeError` if the `template` is not a string or `options` is invalid.
* `SyntaxError` if the template does not comply with the syntax.

## `get(scope, varName, propExists)`

A useful utility function that is used internally to lookup a variable name as a path to a property in an object.

###### Params

* `scope` same as the `scope` parameter to the `render()` function above.
* `varName: string | string[]` a string like `a.b.c` or `a['b'].c`. It can also be a path array like `['a', 'b', 'c']` (same as [lodash's get()](https://lodash.com/docs/4.17.11#get)). _Tip: the array version is a whole lot faster because we skips parsing it._
* `propExists?: boolean = false` see the meaning of this param under the `options` below.


> Differences with JavaScript:
> * No support for keys that include `[` or `]`. ex. `a['[']`
> * No support for keys that include `'` or `"`. ex. `a['"']`
> * `foo[bar]` is allowed and treated as `foo['bar']` (this behaviour is similar to how lodash `get()` works). But JavaScript treats `bar` as a variable and tries to lookup its value or throws a `ReferenceError` if there is no variable called `bar`.

###### Returns

The value or `undefined`.
If the scope is `undefined` or `null` the result is always `undefined`.

###### Throws

* `ReferenceError` if it cannot find a value in the specified path and `propExists` is set.


## `options`

All the functions that can take an option, expect it as an object with these properties:

* `explicit?: boolean = false` When set to a truthy value, rendering literally puts a `'null'` or `'undefined'` for values that are `null` or `undefined`. By default it swallows those values to be compatible with Mustache.
* `propsExist?: boolean = false` When set to a truthy value, we throw a `ReferenceError` for invalid varNames. Invalid varNames are the ones that do not exist in the scope. In that case the value for the varNames will be assumed an empty string. By default we throw a `ReferenceError` to be compatible with how JavaScript threats such invalid reference.
If a value does not exist in the scope, two things can happen:
  - if `propsExist` is truthy, the value will be resolved to an empty string
  - if `propsExist` is falsy, a `ReferenceError` will be thrown
* `validateVarNames?: boolean = false` When set to a truthy value, validates the variable names
* `tags?: string[2] = ['{{', '}}']` The string symbols that mark the opening and closing of a variable name in the template.

[Full API docs](https://userpixel.github.io/micromustache) _(beta)_

# FAQ

[On wiki](https://github.com/userpixel/micromustache/wiki/FAQ)

# Known issues

[On wiki](https://github.com/userpixel/micromustache/wiki/Known-issues)

---

_Made in Sweden 🇸🇪 by [@alexewerlof](https://mobile.twitter.com/alexewerlof)_

<a href="https://opencollective.com/micromustache" target="_blank">
  <img src="https://opencollective.com/micromustache/donate/button@2x.png?color=white" width=300 />
</a>
