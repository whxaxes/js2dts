import { EventEmitter } from 'events';
/**
 * Router Class
 * @param {Object} opt option
 * @param {String} opt.path path
 */
declare class Router extends EventEmitter {
  constructor(opt: _Prototype1.T100);
  get(url: any): any;
  /**
   * @param {String} url url
   */
  post(url: string): string;
  head(url: any): any;
  bbb(url: any): any;
  static aaa(): number;
  ddd(): number;
  eee(): number;
  ccc(): number;
  static url(url: any): any;
  opt: any;
  params: any;
}
declare const _Prototype1: Router;
declare namespace _Prototype1 {
  export interface T100 {
    path: string;
  }
}
export = _Prototype1;
