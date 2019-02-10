'use strict';
const utils = require('../utils/utils');

// match obj.test || obj.test.test
const objectRE = /^\w+(?:\.[\w\-'"]+)*$/;
const otherRE = /^(true|false|null|NaN|undefined|\d+)$/;
const scopeOpen = '{([';
const scopeClose = '})]';
const scopeOpt = scopeOpen + scopeClose;
const operators = scopeOpt + '%+-<>!?*/:=&|,; \r\n';
const regFlags = 'igmy';
const optMapping = {
  not: '!',
  or: '||',
  and: '&&',
};

exports.constant = require('./constant');

exports.parseSpaceAttr = function(expr, cb) {
  const result = exports.splitOperator(expr);
  const fragments = result.fragments;
  let key = '';
  let str = '';
  let _str = '';
  let i = 0;
  const setValue = (s, _s) => {
    cb(key.trim(), s.trim(), (_s || _str).trim());
    key = '';
  };

  while (i < fragments.length) {
    const frag = fragments[i];

    // split key and value by equal sign
    if (frag.expr === '=') {
      str = str.trim();
      const lastSepIndex = str.lastIndexOf(' ');
      if (lastSepIndex < 0) {
        key = _str;
      } else {
        _str = _str.trim();
        const _index = _str.lastIndexOf(' ');
        setValue(str.substring(0, lastSepIndex), _str.substring(0, _index));
        key = _str.substring(_index + 1);
      }
      _str = str = '';
    } else {
      str += (frag.type === 'prop')
        ? `_$o.${frag.expr}`
        : frag.expr;
      _str += frag.expr;
    }

    i++;
  }

  setValue(str);
};

exports.parseNormalAttr = function(d, expr, cb) {
  if (!expr) {
    return;
  }

  if (d === ' ') {
    return exports.parseSpaceAttr(expr, cb);
  }

  let i = 0;
  let key;
  let str = '';
  let _str = '';
  const result = exports.splitOperator(expr);
  const fragments = result.fragments;
  const scopeQueue = [];
  const setValue = () => {
    cb(key, str.trim(), _str.trim());
    _str = str = key = '';
  };

  while (i < fragments.length) {
    const frag = fragments[i];
    let closeIndex;

    // comma maybe in object or array
    if (scopeOpen.includes(frag.expr)) {
      scopeQueue.push(frag.expr);
    } else if (scopeQueue.length && (closeIndex = scopeClose.indexOf(frag.expr)) >= 0) {
      const last = scopeQueue[scopeQueue.length - 1];
      if (last === scopeOpen.charAt(closeIndex)) {
        scopeQueue.pop();
      }
    }

    if (!scopeQueue.length && frag.expr === '=') {
      key = _str.trim();
      _str = str = '';
    } else if (!scopeQueue.length && frag.expr === d) {
      setValue();
    } else {
      str += frag.type === 'prop'
        ? `_$o.${frag.expr}`
        : frag.expr;
      _str += frag.expr;
    }

    i++;
  }

  setValue();
};

// parse attribute on tag
exports.parseAttr = function(expr, attrName = 'default') {
  let functionStr = '';
  exports.parseNormalAttr(' ', expr, (key, value) => {
    functionStr += `_$s['${key || attrName}'] = ${value};`;
  });
  functionStr = `_$s = _$s || {}; ${functionStr} return _$s`;
  return new Function('_$o', '_$s', functionStr);
};

// parse macro expression
exports.parseMacroExpr = function(expr) {
  const startIndex = expr.indexOf('(');
  const endIndex = expr.lastIndexOf(')');
  const hasArgs = startIndex > 0;
  const methodName = hasArgs ? expr.substring(0, startIndex) : expr;
  const argsString = hasArgs ? expr.substring(startIndex + 1, endIndex).trim() : null;
  let setScope = '';
  let argIndex = 0;
  exports.parseNormalAttr(',', argsString, (key, value, base) => {
    if (!key) {
      key = base;
      value = null;
    }
    setScope += `_$o['${key}']=arguments.length>=${argIndex + 1}?`;
    setScope += `arguments[${argIndex}]:${value || '""'};`;
    argIndex++;
  });

  const funcStr = `return function(){${setScope}return _$p(_$o);}`;
  const genRender = new Function('_$o', '_$p', funcStr);
  return {
    methodName: methodName.trim(),
    genRender,
  };
};

exports.parseCommonExpr = function(expr) {
  if (!(expr = expr.trim())) {
    throw new Error('parse error, expression invalid');
  }

  const result = exports.splitOperator(expr);
  const fragments = result.fragments;
  let item;
  let safe = false;
  let filterStart = false;
  let filterName = '';
  let filterArgs = '';
  let funcStr = '';

  function wrapFilter() {
    if (!filterName) {
      return;
    }

    funcStr = `_$f('${filterName}')(${funcStr}`;
    filterArgs = filterArgs.trim();
    if (!filterArgs) {
      funcStr += ')';
    } else {
      const l = filterArgs.indexOf('(');
      const r = filterArgs.lastIndexOf(')');
      if (l < 0 || r < 0) {
        throw new Error(`filter invalid: ${filterArgs}`);
      }
      const argString = filterArgs.substring(l + 1, r).trim();
      funcStr += argString ? `,${argString})` : ')';
    }

    filterName = filterArgs = '';
  }

  // compose the fragments
  while ((item = fragments.shift())) {
    if (item.expr === '|') {
      filterStart = true;
      wrapFilter();
      continue;
    }

    const isProp = item.type === 'prop';
    if (!filterStart || filterName) {
      const added = (isProp ? '_$o.' : '') + item.expr;
      if (filterName) {
        filterArgs += added;
      } else {
        funcStr += added;
      }
    } else if (isProp) {
      if (item.expr === 'safe') {
        safe = true;
      } else {
        filterName = item.expr;
      }
    }
  }

  if (filterStart) {
    wrapFilter();
  }

  // create render function
  funcStr = `var result = ${utils.nlEscape(`${funcStr}`)};`;
  funcStr += 'return (result === undefined || result === null) ? "" : result;';

  return {
    safe,
    render: new Function('_$o', '_$f', funcStr),
  };
};

// split expression by operator
exports.splitOperator = function(expr) {
  let quot = null;
  let regexpStart = false;
  let regEsc = false;
  let i = 0;
  let savor = '';
  let lastEl;
  let lastOpt;
  let last;
  const fragments = [];

  while (i < expr.length) {
    const char = expr.charAt(i);
    i++;

    if (char === '\'' || char === '"') {
      if (quot === char) {
        collect(savor + char, 'str');
        quot = null;
        savor = '';
        continue;
      } else if (!quot) {
        quot = char;
      }
    } else if (!quot) {
      if (regexpStart && (char !== '/' || regEsc)) {
        // handle \/ in regexp
        regEsc = char === '\\' && !regEsc;
        last.expr += char;
        continue;
      } else if (operators.includes(char)) {
        if (char === '/') {
          if (regexpStart) {
            regexpStart = false;
            last.expr += char;
            // collect regexp's flag
            let flag;
            while (regFlags.includes(flag = expr.charAt(i))) {
              last.expr += flag;
              i++;
            }
            regEsc = false;
            continue;
          } else if (savor === 'r') {
            regexpStart = true;
            collect(char, 'reg');
            savor = '';
            continue;
          }
        }

        if (savor) {
          if (optMapping.hasOwnProperty(savor)) {
            collectOpt(optMapping[savor]);
          } else {
            collect(savor);
          }
        }

        collectOpt(char);
        savor = '';
        continue;
      }
    }

    savor += char;

    if (savor && i === expr.length) {
      collect(savor);
    }
  }

  // collect operator
  function collectOpt(char) {
    if (char === '\r') {
      return;
    }

    char = char === '\n' ? ' ' : char;
    // merge the same operator
    if (last && last.unit === char && !scopeOpt.includes(char)) {
      last.expr += char;
    } else {
      const optEl = {
        expr: char,
        unit: char,
        type: 'opt',
      };

      // mark def type, like 'key' in '{ key: value }',
      // which is no need to prepend '_$o'
      let isDef = char === ':' && lastOpt && (lastOpt.expr === '{' || lastOpt.expr === ',');
      isDef = isDef && lastEl && lastEl.type === 'prop';
      if (isDef) {
        lastEl.type = 'def';
      }

      if (char !== ' ') {
        lastOpt = optEl;
      }

      fragments.push(last = optEl);
    }
  }

  // collect property | base type | string
  function collect(str, type) {
    if (!type) {
      if (otherRE.test(str)) {
        // base type, null|undefined etc.
        type = 'base';
      } else if (objectRE.test(str)) {
        // simple property
        type = 'prop';
      }
    }

    fragments.push(last = lastEl = {
      expr: str,
      type,
    });
  }

  return {
    fragments,
  };
};
