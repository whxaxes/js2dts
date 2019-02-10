'use strict';

const utils = require('../utils/utils');
const parser = require('./parser');
const forTagRE = /^(\w+)(?:\s*,\s*(\w+))?\s+in\s([\s\S]+)$/;
const functionRE = /^\s*([\w.]+)\(/;
const conditionRE = /([\s\S]+(?= if )) if ([\s\S]+(?= else )|[\s\S]+)(?: else ([\s\S]+))?/;

module.exports = {
  variable(el) {
    processExpression(el.text, el);

    if (functionRE.test(el.text)) {
      el.method = RegExp.$1;
    }
  },

  // a hook for custom comment processor
  comment(el) {
    el.text = '';
  },

  // a hook for custom text processor
  text() {},

  for(el) {
    if (!forTagRE.test(el.text)) {
      utils.throw('parse error, for expression invalid', el);
    }

    el.value = RegExp.$1;
    el.index = RegExp.$2;
    processExpression(RegExp.$3, el);
  },

  if(el) {
    if (!el.text) {
      utils.throw('parse error, if condition invalid', el);
    }

    processExpression(el.text, el);
  },

  else(el) {
    const ifEl = getIfEl(el);
    ifEl.elseBlock = el;
  },

  elseif(el) {
    if (!el.text) {
      utils.throw('parse error, elseif condition invalid', el);
    }

    if (el.parent && el.parent.else) {
      utils.throw('parse error, else behind elseif', el);
    }

    const ifEl = getIfEl(el);
    ifEl.elseifBlock = ifEl.elseifBlock || [];
    ifEl.elseifBlock.push(el);
    processExpression(el.text, el);
  },

  elif(el) {
    this.elseif(el);
  },

  set(el) {
    if (!el.text) {
      utils.throw('parse error, set expression invalid', el);
    }

    const index = el.text.indexOf('=');
    el.key = el.text.slice(0, index).trim();
    el.isUnary = true;
    processExpression(el.text.slice(index + 1), el);
  },

  raw() {},

  filter(el) {
    if (!el.text) {
      return utils.throw('parse error, filter function not found', el);
    }

    processExpression(`_$o._$r | ${el.text}`, el);
  },

  import(el) {
    if (!el.text) {
      return utils.throw('parse error, import url not found', el);
    }

    const expArr = el.text.split(' as ');
    processExpression(expArr[0], el);
    el.item = expArr[1] && expArr[1].trim();
    el.isUnary = true;
  },

  macro(el) {
    if (!el.text) {
      return utils.throw('parse error, macro name was needed', el);
    }

    el.isAlone = true;
    const result = parser.parseMacroExpr(el.text);
    el._ast.macro.set(result.methodName, el);
    el.genRender = result.genRender;
  },

  extends(el) {
    if (!el.text) {
      utils.throw('parse error, extends url invalid', el);
    }

    el.isUnary = el.isAlone = true;
    processExpression(el.text, el);
    el._ast.extends = el;
  },

  block(el) {
    if (!el.text) {
      utils.throw('parse error, block name invalid', el);
    }

    el.name = el.text;
    el._ast.blocks = el._ast.blocks || new Map();
    el._ast.blocks.set(el.name, el);
  },

  include(el) {
    if (!el.text) {
      utils.throw('parse error, include url invalid', el);
    }

    el.isUnary = true;
    try {
      el.attrFunc = parser.parseAttr(el.text, '_url');
    } catch (e) {
      utils.throw(e.message, el);
    }
  },

  custom(el, extra) {
    el.isCustom = true;
    el.render = extra.render;
    el.isUnary = extra.unary;
    if (el.text && !extra.noAttr) {
      try {
        el.attrFunc = parser.parseAttr(el.text, extra.attrName);
      } catch (e) {
        utils.throw(e.message, el);
      }
    }
  },
};

function getIfEl(el) {
  const ifEl = el.parent ? (el.parent.ifBlock || el.parent) : null;
  if (!ifEl) {
    utils.throw('parse error, if block not found', el);
  }
  el.ifBlock = el.parent = ifEl;
  el.isAlone = true;
  return ifEl;
}

function processExpression(expr, el) {
  if (expr.indexOf(' if ') >= 0) {
    expr = expr.replace(
      conditionRE,
      (all, res, cond, res2) => `${cond}?${res}:${res2 || '""'}`
    );
  }

  try {
    Object.assign(el, parser.parseCommonExpr(expr));
  } catch (e) {
    utils.throw(e.message, el);
  }
}
