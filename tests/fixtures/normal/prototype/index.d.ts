/**
 * Router Class
 * @param {Object} opt option
 * @param {String} opt.path path
 */
declare class Router {
  constructor(opt: _Prototype.T100);
  go(): string;
  get(url: any): any;
  /**
   * @param {String} url url
   */
  post(url: string): string;
  head(url: any): any;
  static url(url: any): any;
  opt: any;
  params: any;
}
declare const _Prototype: Router & _Prototype.T101;
declare namespace _Prototype {
  export interface T100 {
    path: string;
  }
  export interface T101 {
    go(): string;
  }
}
export = _Prototype;
