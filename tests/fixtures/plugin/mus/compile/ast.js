'use strict';
const utils = require('../utils/utils');
const processor = require('./processor');
const constant = require('./constant');
const tagNameRE = /(end)?(\w+)/;
const spaceReg = /(>|)(?:\t| )*(?:\r?\n)+(?:\t| )*(<|)/;
let mus;

class Ast {
  /**
   * ast class
   * @param {String} html 
   * @param {Object} options 
   * @param {String} options.blockStart
   * @param {String} options.blockEnd
   * @param {String} options.variableStart
   * @param {String} options.variableEnd
   * @param {Boolean} options.compress
   * @param {String} fileUrl 
   */
  constructor(html, options, fileUrl) {
    options = options || {};
    this.root = [];
    this.parent = null;
    this.macro = new Map();
    this.extends = null;
    this.scanIndex = 0;
    this.endIndex = 0;
    this.template = html;
    this.fileUrl = fileUrl;
    this.blockStart = options.blockStart || '{%';
    this.blockEnd = options.blockEnd || '%}';
    this.variableStart = options.variableStart || '{{';
    this.variableEnd = options.variableEnd || '}}';
    this.compress = options.compress;
    this.processor = processor;
    this.commentStart = '{#';
    this.commentEnd = '#}';

    // support extending processor
    if (options.processor) {
      this.processor = Object.assign({}, processor, options.processor);
    }

    if (this.blockStart === this.variableStart) {
      throw new Error('blockStart should be different with variableStart!');
    }

    // create a regexp used to match leftStart
    this.startRegexp = utils.cache(
      `symbol_${this.blockStart}_${this.variableStart}_${this.commentStart}`,
      () => {
        // make sure can match the longest start string at first
        const str = [this.blockStart, this.variableStart, this.commentStart]
          .sort((a, b) => (a.length > b.length ? -1 : 1))
          .map(item => utils.reStringFormat(item))
          .join('|');
        return new RegExp(str);
      }
    );

    this.parse(html);
    this.optimize();
  }

  parse(str) {
    if (!str) {
      return;
    }

    const collector = this.genCollector();
    const parent = this.parent;
    const matches = str.match(this.startRegexp);
    const collectText = str => {
      const el = this.genNode(constant.TYPE_TEXT, str);
      this.processor.text(el);
      collector.push(el);
    };

    if (!matches) {
      // parse end
      parent && utils.warn(`${parent.tag} was not closed`, parent);
      return collectText(str);
    }

    let element;
    this.endIndex = matches.index;
    const leftStart = matches[0];
    const isTag = leftStart === this.blockStart;
    const isComment = leftStart === this.commentStart;
    collectText(str.substring(0, this.endIndex));

    // get blockEnd or the other
    const rightEnd = isTag ? this.blockEnd : isComment ? this.commentEnd : this.variableEnd;
    str = this.advance(str, this.endIndex);

    // get rightEnd index
    this.endIndex = str.indexOf(rightEnd);
    const expression = str.substring(leftStart.length, this.endIndex);

    if (isComment) {
      // comment
      element = this.genNode(constant.TYPE_COM, leftStart + expression + rightEnd);
      element.comment = true;
      this.processor.comment(element);
      this.endIndex = this.endIndex >= 0 ? this.endIndex + rightEnd.length : str.length;
    } else if (this.endIndex < 0 || expression.indexOf(leftStart) >= 0) {
      // text
      collectText(leftStart);
      this.endIndex = leftStart.length;
    } else {
      this.endIndex = this.endIndex + rightEnd.length;

      if (parent && parent.raw) {
        // raw
        if (isTag && expression.trim() === 'endraw') {
          this.closeTag('raw');
        } else {
          collectText(leftStart + expression + rightEnd);
        }
      } else if (isTag) {
        // tag
        const matches = expression.match(tagNameRE);
        const tagName = matches[0];
        const isCustom = mus && mus.customTags.has(tagName);
        const tagHandle = this.processor[tagName]
          || (isCustom ? this.processor.custom : null);

        if (tagHandle) {
          // create ast node
          element = this.genNode(
            constant.TYPE_TAG,
            expression.substring(matches.index + tagName.length).trim()
          );

          element[tagName] = true;
          element.tag = tagName;
          tagHandle.apply(
            this.processor,
            [element, isCustom ? mus.customTags.get(tagName) : null]
          );

          if (!element.isUnary) {
            this.parent = element;
          }
        } else if (matches[1]) {
          this.closeTag(matches[2]);
        } else {
          utils.throw(`unknown tag '${expression.trim()}'`, this.genNode(null));
        }
      } else {
        // variable
        element = this.genNode(constant.TYPE_VAR, expression);
        this.processor.variable(element);
      }
    }

    element && collector.push(element);
    this.parse(this.advance(str, this.endIndex));
  }

  optimize(list = this.root) {
    const newList = [];

    for (let i = 0; i < list.length; i++) {
      const node = list[i];
      const lastNode = newList[newList.length - 1];

      if (node.type === constant.TYPE_TEXT) {
        if (this.compress) {
          let text = node.text;
          let matches;
          let newText = '';

          // compress template
          while ((matches = text.match(spaceReg))) {
            const l = matches[1] || '';
            const r = matches[2] || '';
            const t = text.substring(0, matches.index);
            newText += t + l;

              // prevent comment in javascript or css
            if (t.indexOf('//') >= 0) {
              newText += '\n';
            }

            newText += r;
            text = text.substring(matches.index + matches[0].length);
          }

          node.text = newText + text;
        }

        if (lastNode && lastNode.type === constant.TYPE_TEXT) {
          lastNode.text += node.text;
        } else {
          newList.push(node);
        }
      } else {
        if (!node.isAlone) {
          newList.push(node);
        }

        if (node.children) {
          node.children = this.optimize(node.children);
        }
      }
    }

    if (list === this.root) {
      this.root = newList;
    }

    return newList;
  }

  genNode(type, expr) {
    return {
      type,
      parent: this.parent,
      text: expr,
      _index: this.scanIndex,
      _len: this.endIndex,
      _ast: this,
    };
  }

  advance(str, index) {
    this.scanIndex += index;
    return str.substring(index);
  }

  genCollector() {
    return this.parent
      ? (this.parent.children = this.parent.children || [])
      : this.root;
  }

  // close block
  // change current parent
  closeTag(tagName) {
    const p = this.parent;
    if (p) {
      this.parent = this.parent.parent;

      if (p.tag !== tagName) {
        if (!p.else && !p.elseif && !p.elif) {
          utils.warn(`${p.tag} was not closed`, p);
        }
        return this.closeTag(tagName);
      } else {
        return p;
      }
    }
  }
}

module.exports = function(html, options, fileUrl, musObj) {
  mus = musObj;
  const ast = new Ast(html, options, fileUrl);
  mus = null;
  return ast;
};
