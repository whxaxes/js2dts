export interface T100 {
  a: string;
  b?: string;
  cc?: Array<string | number>;
  dd?: number | Array<number | string[]>;
}
export interface T101 {
  [key: string]: any;
}
export interface FnObj {
  a: string;
  b?: {
    c: number;
    d(): T101;
    e: Promise<string>;
    f: boolean | string;
    g?: boolean[];
    h?: Array<Array<boolean | string>>;
    i?: {
      a?: string;
    };
  };
}
declare class MyTest_1 {
  constructor();
  /**
   * 1111
   * @param {Object} opt 
   * @param {String} opt.a 123
   * @param {String} [opt.b] 123
   * @param {Array<String|Number>} [opt.cc] 123
   * @param {Array<Array<String>|Number>|Number} [opt.dd] 123
   */
  fn(opt: T100): T100;
  fn3(): void;
  fn4(): IterableIterator<string>;
  fn5(): Promise<T100>;
  /**
   * @typedef FnObj
   * @property {String} FnObj.a asd
   * @property {Object} [FnObj.b] asd
   * @property {Number} FnObj.b.c asd
   * @property {() => {}} FnObj.b.d asd
   * @property {Promise<String>} FnObj.b.e asd
   * @property {Boolean|String} FnObj.b.f asd
   * @property {Array<Boolean>} [FnObj.b.g] asd
   * @property {Array<Array<boolean|String>>} [FnObj.b.h] asd
   * @property {Object} [FnObj.b.i] asd
   * @property {String} [FnObj.b.i.a] asd
   */

  /**
   * @param {FnObj} opt 123
   */
  fn6(opt: FnObj): FnObj;
}
export const MyTest: typeof MyTest_1;
/** @type {{ [key: string]: string }} */
export const bbb: T101;
