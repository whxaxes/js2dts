import { EventEmitter as EventEmitter_1 } from 'events';
declare class Compiler {
  ast: any;
  scope: _Mus.T101;
  ecomp: any;
  constructor(T100: _Mus.T102);
  compile(ast?: any, scope?: _Mus.T101): any;
  processAst(root: any, scope: any): string;
  processVariable(el: any, scope: any): any;
  processImport(el: any, scope: any): void;
  processInclude(el: any, scope: any): any;
  processCustom(el: any, scope: any): string;
  processBlock(el: any, scope: any): any;
  processFor(el: any, scope: any): string;
  processIf(el: any, scope: any): string;
}
declare namespace _Constant {
  // tests/fixtures/plugin/mus/compile/constant.js
  export const EventEmitter: typeof EventEmitter_1;
  export const TYPE_TAG: number;
  export const TYPE_TEXT: number;
  export const TYPE_VAR: number;
  export const TYPE_COM: number;
}
declare namespace _Parser {
  // tests/fixtures/plugin/mus/compile/parser.js
  export const constant: typeof _Constant;
  export function parseSpaceAttr(expr: any, cb: any): void;
  export function parseNormalAttr(d: any, expr: any, cb: any): void;
  export function parseAttr(expr: any, attrName?: string): (...args: any[]) => any;
  export interface T104 {
    methodName: any;
    genRender: (...args: any[]) => any;
  }
  export function parseMacroExpr(expr: any): T104;
  export interface T105 {
    safe: boolean;
    render: (...args: any[]) => any;
  }
  export function parseCommonExpr(expr: any): T105;
  export interface T106 {
    fragments: any[];
  }
  export function splitOperator(expr: any): T106;
}
declare class Ast {
  root: any;
  parent: any;
  macro: Map<any, any>;
  extends: any;
  scanIndex: number;
  endIndex: any;
  template: string;
  fileUrl: string;
  blockStart: string;
  blockEnd: string;
  variableStart: string;
  variableEnd: string;
  compress: boolean;
  processor: any;
  commentStart: string;
  commentEnd: string;
  startRegexp: any;
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
  constructor(html: string, options: _Mus.T106, fileUrl: string);
  parse(str: any): void;
  optimize(list?: any): any[];
  genNode(type: any, expr: any): any;
  advance(str: any, index: any): any;
  genCollector(): any;
  closeTag(tagName: any): any;
}
declare class Mus {
  customTags: Map<any, any>;
  filters: any;
  constructor(options: any);
  Mus: typeof Mus;
  Compiler: typeof Compiler;
  utils: _Mus.T105;
  configure(options?: _Mus.T101): void;
  render(url: any, args: any): any;
  renderString(html: any, args: any): any;
  resolveUrl(filePath: any): any;
  getAstByUrl(filePath: any): Ast;
  readFile(filePath: any): string;
  /**
   * 
   * @param {String} html 
   * @param {String} fileUrl 
   * @returns {ReturnType<typeof ast>}
   */
  getAst(html: string, fileUrl: string): Ast;
  setFilter(name: any, cb: any): void;
  setTag(name: any, tagOptions: any): void;
}
declare const _Mus: Mus;
declare namespace _Mus {
  export interface T101 {
    [key: string]: any;
  }
  export interface T102 {
    ast: any;
    scope?: _Mus.T101;
    ecomp: any;
  }
  export interface T103 {
    forEach(obj: any, cb: any): void;
    nl2br(str: any): any;
    escape(str: any): string;
    nlEscape(str: any): any;
    simpleSet(obj: any, keyPath: any, value: any): void;
    throw(errMsg: any, el: any): any;
    warn(msg: any, el: any): void;
    stripScope(str: any): any;
    regular(expr: any, flag: any): RegExp;
    range(start: any, end: any, ...args: any[]): any[];
    cache(key: any, value: any, c?: Map<any, any>): any;
    reStringFormat(str: any): any;
  }
  export interface T104 {
    variable(el: any): void;
    comment(el: any): void;
    text(): void;
    for(el: any): void;
    if(el: any): void;
    else(el: any): void;
    elseif(el: any): void;
    elif(el: any): void;
    set(el: any): void;
    raw(): void;
    filter(el: any): any;
    import(el: any): any;
    macro(el: any): any;
    extends(el: any): void;
    block(el: any): void;
    include(el: any): void;
    custom(el: any, extra: any): void;
  }
  export interface T105 {
    utils: _Mus.T103;
    parser: typeof _Parser;
    processor: _Mus.T104;
    constant: typeof _Constant;
  }
  export interface T106 {
    blockStart: string;
    blockEnd: string;
    variableStart: string;
    variableEnd: string;
    compress: boolean;
  }
}
export = _Mus;
