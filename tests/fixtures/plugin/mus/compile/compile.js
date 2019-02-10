'use strict';

const utils = require('../utils/utils');
const constant = require('./constant');
let mus;

class Compiler {
  constructor({ ast, scope = {}, ecomp }) {
    this.ast = ast;
    this.scope = scope;

    // add global function
    scope.range = scope.hasOwnProperty('range') ? scope.range : utils.range;
    scope.regular = scope.hasOwnProperty('regular') ? scope.regular : utils.regular;

    // compiler which extends this
    this.ecomp = ecomp;
  }

  compile(ast = this.ast, scope = this.scope) {
    if (ast.extends) {
      const fileUrl = computed(ast.extends, scope);
      const absoluteUrl = mus.resolveUrl(fileUrl);
      mus.relativeHook(absoluteUrl);

      return new Compiler({
        ast: mus.getAstByUrl(absoluteUrl),
        scope: Object.assign({}, scope),
        ecomp: this,
      }).compile();
    } else {
      return this.processAst(ast.root, scope);
    }
  }

  processAst(root, scope) {
    if (!root || !root.length) {
      return '';
    }

    let html = '';
    let i = 0;
    while (i < root.length) {
      const el = root[i];
      if (el.type === constant.TYPE_TEXT) {
        // text handling
        html += el.text;
      } else if (el.type === constant.TYPE_VAR) {
        // variable handling
        html += this.processVariable(el, scope);
      } else if (el.type === constant.TYPE_TAG) {
        // block handling
        if (el.for) {
          html += this.processFor(el, scope);
        } else if (el.if) {
          html += this.processIf(el, scope);
        } else if (el.set) {
          scope[el.key] = computed(el, scope);
        } else if (el.block) {
          html += this.processBlock(el, scope);
        } else if (el.include) {
          html += this.processInclude(el, scope);
        } else if (el.import) {
          this.processImport(el, scope);
        } else if (el.filter) {
          scope._$r = this.processAst(el.children, scope);
          html += computed(el, scope);
        } else if (el.isCustom) {
          html += this.processCustom(el, scope);
        } else if (el.raw) {
          html += this.processAst(el.children);
        }
      }

      i++;
    }
    return html;
  }

  processVariable(el, scope) {
    if (el.method && this.ast.macro && this.ast.macro.has(el.method)) {
      const macroEl = this.ast.macro.get(el.method);
      utils.simpleSet(scope, el.method, macroEl.genRender(
        Object.assign({}, scope), // use new scope
        scope => (this.processAst(macroEl.children, scope))
      ));
    }

    const result = computed(el, scope);
    return (el.safe || !mus.autoescape) ? result : utils.escape(result);
  }

  processImport(el, scope) {
    const fileUrl = computed(el, scope);
    const absoluteUrl = mus.resolveUrl(fileUrl);
    mus.relativeHook(absoluteUrl);
    const ast = mus.getAstByUrl(absoluteUrl);

    if (ast.macro.size) {
      // copy macro to current ast
      const prefix = el.item ? `${el.item}.` : '';
      ast.macro.forEach((macroEl, key) => {
        this.ast.macro.set(`${prefix}${key}`, macroEl);
      });
    } else {
      utils.warn('you are importing a non-macro template!', el);
    }
  }

  processInclude(el, scope) {
    const attr = el.attrFunc(scope);
    const fileUrl = attr._url;
    if (!fileUrl) {
      utils.throw('include url invalid!', el);
    }
    return include(fileUrl, Object.assign({}, this.scope, attr));
  }

  processCustom(el, scope) {
    const attr = el.attrFunc ? el.attrFunc(scope) : {};
    const result = el.render(
      attr,
      Object.assign({}, scope),
      {
        el,
        fileUrl: el._ast.fileUrl,
        include,
        compile: this.processAst.bind(this),
      }
    );
    return (typeof result === 'string') ? result : '';
  }

  processBlock(el, scope) {
    const extendBlock = this.ecomp
      && this.ecomp.ast.blocks
      && this.ecomp.ast.blocks.get(el.name);

    if (extendBlock) {
      return this.ecomp.processAst(extendBlock.children, scope);
    } else {
      return this.processAst(el.children, scope);
    }
  }

  processFor(el, scope) {
    let html = '';
    let loopScope;
    const result = computed(el, scope);
    utils.forEach(result, (value, key, index, len) => {
      loopScope = loopScope || Object.assign({}, scope);
      loopScope[el.value] = value;
      loopScope.loop = {
        index: index + 1,
        index0: index,
        length: len,
      };

      if (el.index) {
        loopScope[el.index] = key;
      }

      html += this.processAst(el.children, loopScope);
    });
    return html;
  }

  processIf(el, scope) {
    // check if
    if (computed(el, scope)) {
      return this.processAst(el.children, scope);
    } else {
      // check else if
      if (el.elseifBlock) {
        let j = 0;
        while (j < el.elseifBlock.length) {
          const elseifBlock = el.elseifBlock[j];
          if (computed(elseifBlock, scope)) {
            return this.processAst(elseifBlock.children, scope);
          }

          j++;
        }
      }

      // check else
      if (el.elseBlock) {
        return this.processAst(el.elseBlock.children, scope);
      }
    }

    return '';
  }
}

function include(url, scope) {
  const absoluteUrl = mus.resolveUrl(url);
  mus.relativeHook(absoluteUrl);
  const includeAst = mus.getAstByUrl(absoluteUrl);
  return new Compiler({
    ast: includeAst,
    scope,
  }).compile();
}

function processFilter(filterName) {
  const filter = mus.filters[filterName];

  if (!filter) {
    throw new Error(`unknown filter ${filterName}`);
  }

  return filter;
}

function computed(obj, scope, el) {
  let result;

  try {
    result = obj.render(scope, processFilter);
  } catch (e) {
    // only catch the not defined error
    const msg = e.message;
    if (msg.indexOf('is not defined') >= 0 || msg.indexOf('Cannot read property') >= 0) {
      result = '';
    } else {
      utils.throw(e.message, el || obj);
    }
  }

  return result;
}

module.exports = function(ast, scope, musObj) {
  mus = musObj;
  const html = new Compiler({ ast, scope }).compile();
  mus = null;
  return html;
};

module.exports.Compiler = Compiler;
