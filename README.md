# js2dts

[![NPM version][npm-image]][npm-url]
[![Package Quality](http://npm.packagequality.com/shield/js2dts.svg)](http://packagequality.com/#?package=js2dts)
[![Build Status][travis-image]][travis-url]
[![Appveyor status][appveyor-image]][appveyor-url]
[![Test coverage][codecov-image]][codecov-url]
[![NPM download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/js2dts.svg?style=flat-square
[npm-url]: https://npmjs.org/package/js2dts
[travis-url]: https://travis-ci.org/whxaxes/js2dts
[travis-image]: http://img.shields.io/travis/whxaxes/js2dts.svg
[appveyor-url]: https://ci.appveyor.com/project/whxaxes/js2dts/branch/master
[appveyor-image]: https://ci.appveyor.com/api/projects/status/github/whxaxes/js2dts?branch=master&svg=true
[codecov-image]: https://codecov.io/gh/whxaxes/js2dts/branch/master/graph/badge.svg
[codecov-url]: https://codecov.io/gh/whxaxes/js2dts
[download-image]: https://img.shields.io/npm/dm/js2dts.svg?style=flat-square
[download-url]: https://npmjs.org/package/js2dts

Generate dts for javascript


> TS has support generating d.ts for js by flags(`allowJs` and `declarations`) in [version 3.7](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-7.html#--declaration-and---allowjs) . So this project will not maintain anymore.


## Install

```
npm i js2dts -g
```

or

```
yarn global add js2dts
```

## Usage

```
Usage: j2d [options] <file>

Options:
  -v, --version      output the version number
  -d, --dist [path]  Create dts to giving path (default to the same dir as file)
  -t, --terminal     Output the result to terminal instead of writing file to disk
  --no-prefix        The generated code will has no prefix
  --ignore-private   Private properties are also being export
  -h, --help         output usage information
```

Example

```bash
$ j2d ./test.js
```

or

```bash
$ js2dts ./test.js
```

## Example

source code

```js
// function/index.js
module.exports = superName;

/**
 * super function
 *
 * @param {String} bbb 123123
 */
function superName(bbb, ccc = module.exports.test) {
  return '123123';
}

module.exports.test = () => 123123;
module.exports.test2 = {
  abc: 123,
};
```

output dts

```typescript
// function/index.d.ts
interface T104 {
  test: () => number;
  test2: _Function.T105;
}
/**
 * super function
 *
 * @param {String} bbb 123123
 */
declare function superName(bbb: string, ccc?: () => number): string;
declare const _Function: typeof superName & T104;
declare namespace _Function {
  export interface T105 {
    abc: number;
  }
}
export = _Function;
```

More example: [tests/fixtures/**/*.d.ts](https://github.com/whxaxes/js2dts/tree/master/tests/fixtures)

