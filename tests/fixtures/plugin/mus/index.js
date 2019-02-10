'use strict';
const fs = require('fs');
const path = require('path');
const constant = require('./compile/constant');
const ast = require('./compile/ast');
const utils = require('./utils/utils');
const compile = require('./compile/compile');
const globalFilters = require('./utils/filters');
const parser = require('./compile/parser');
const processor = require('./compile/processor');

class Mus {
  constructor(options) {
    this.customTags = new Map();
    this.filters = Object.assign({}, globalFilters);
    this.configure(options);
  }

  get Mus() {
    return Mus;
  }

  get Compiler() {
    return compile.Compiler;
  }

  get utils() {
    return {
      utils,
      parser,
      processor,
      constant,
    };
  }

  configure(options = {}) {
    const noCache = options.hasOwnProperty('noCache') ? options.noCache : false;
    this.autoescape = options.hasOwnProperty('autoescape')
      ? options.autoescape
      : true;
    this.filters = Object.assign(this.filters, options.filters);
    this.cacheStore = noCache ? null : new Map();
    this.baseDir = options.baseDir || __dirname;
    this.ext = options.ext || 'tpl';
    this.options = options;
    this.relativeHook = options.relativeHook || function() {};
  }

  render(url, args) {
    const filePath = this.resolveUrl(url);
    return compile(this.getAstByUrl(filePath), args, this);
  }

  renderString(html, args) {
    return compile(this.getAst(html), args, this);
  }

  resolveUrl(filePath) {
    const cb = () => {
      if (!path.extname(filePath)) {
        filePath += `.${this.ext}`;
      }

      return path.isAbsolute(filePath)
        ? filePath
        : path.resolve(this.baseDir, filePath);
    };

    if (this.cacheStore) {
      return utils.cache(filePath, cb, this.cacheStore);
    } else {
      return cb();
    }
  }

  getAstByUrl(filePath) {
    return this.getAst(null, filePath);
  }

  readFile(filePath) {
    if (!fs.existsSync(filePath)) {
      throw new Error(`${filePath} not found!`);
    }

    return fs.readFileSync(filePath).toString();
  }

  /**
   * 
   * @param {String} html 
   * @param {String} fileUrl 
   * @returns {ReturnType<typeof ast>}
   */
  getAst(html, fileUrl) {
    const cb = () => {
      html = html || this.readFile(fileUrl);
      return ast(html, this.options, fileUrl, this);
    };

    if (this.cacheStore) {
      return utils.cache(`ast_${fileUrl || html}`, cb, this.cacheStore);
    } else {
      return cb();
    }
  }

  setFilter(name, cb) {
    this.filters[name] = cb;
  }

  setTag(name, tagOptions) {
    if (!tagOptions || !tagOptions.render) {
      throw new Error('render function must exist!');
    }

    if (processor.hasOwnProperty(name)) {
      throw new Error(`can't create build-in tag(${name})`);
    }

    this.customTags.set(name, tagOptions);
  }
}

module.exports = new Mus();
