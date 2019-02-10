'use strict';
const underline = require('node-underline');
const entityMap = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '`': '&#x60;',
  '=': '&#x3D;',
};
const regexEscapeRE = /[-.*+?^${}()|[\]\/\\]/g;
const nlRE = /\r?\n/g;
const scopeRE = /_\$o\./g;
const entityRE = new RegExp(`[${Object.keys(entityMap).join('')}]`, 'g');
const cache = new Map();

module.exports = {
  forEach(obj, cb) {
    const type = Object.prototype.toString.apply(obj);
    if (type === '[object Array]') {
      const len = obj.length;
      let i = 0;
      while (i < len) {
        cb(obj[i], i, i, len);
        i++;
      }
    } else if (type === '[object Object]') {
      const len = Object.keys(obj).length;
      let i = 0;
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          cb(obj[key], key, i, len);
        }
        i++;
      }
    } else {
      // do nothing
    }
  },

  nl2br(str) {
    return (str && str.replace)
      ? str.replace(nlRE, '<br/>')
      : str;
  },

  escape(str) {
    return String(str).replace(entityRE, s => entityMap[s]);
  },

  nlEscape(str) {
    return str.replace(nlRE, '\\n');
  },

  simpleSet(obj, keyPath, value) {
    const objList = keyPath.split('.');
    if (objList.length > 1) {
      let key;
      while ((key = objList.shift())) {
        if (objList.length) {
          obj = obj[key] = obj[key] || {};
        } else {
          obj[key] = value;
        }
      }
    } else {
      obj[keyPath] = value;
    }
  },

  _genLocation(el) {
    const ast = el._ast;
    const index = el._index;
    const ul = underline(ast.template, {
      start: index,
      end: index + el._len,
      margin: 4,
    });
    const fileUrl = `${ast.fileUrl ? ast.fileUrl : 'Template String'}:${ul.lineNumber}:${ul.columnNumber}`;
    return ['', fileUrl, '', ul.text].join('\n');
  },

  throw(errMsg, el) {
    const error = new Error(this.stripScope(errMsg));
    if (el && el._ast) {
      error.stack = this._genLocation(el) + '\n\n' + error.stack;
    }
    throw error;
  },

  warn(msg, el) {
    msg = 'WARNING: ' + msg;
    if (el && el._ast) {
      msg = this._genLocation(el) + '\n\n' + msg + '\n';
    }
    process.stdout.write('\x1B[33m' + msg + '\x1B[0m\n');
  },

  stripScope(str) {
    return str.replace(scopeRE, '');
  },

  regular(expr, flag) {
    return new RegExp(expr, flag);
  },

  range(start, end) {
    if (arguments.length === 1) {
      end = start;
      start = 0;
    }
    let len = end - start;
    const arr = new Array(len);
    while (len--) {
      arr[len] = start + len;
    }
    return arr;
  },

  cache(key, value, c = cache) {
    if (c.has(key)) {
      return c.get(key);
    }

    const isFunction = typeof value === 'function';
    const result = isFunction ? value() : value;
    if (result !== null && result !== undefined) {
      c.set(key, result);
    }
    return result;
  },

  reStringFormat(str) {
    return str.replace(regexEscapeRE, '\\$&');
  },
};
