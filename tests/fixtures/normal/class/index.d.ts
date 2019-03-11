import { EventEmitter } from 'events';
/**
 * my test class
 */
declare class MyTest extends EventEmitter {
  opt: _Class.T100;
  /**
   * test class
   * 
   * @param {Object} options test
   * @param {String} options.name test
   */
  constructor(options: _Class.T100);
  /**
   * test class
   * 
   * @param {Object} opt test
   * @param {String} opt.name test
   */
  static getInstance(opt: _Class.T100): MyTest;
  getCount(): number;
}
declare const _Class: typeof MyTest;
declare namespace _Class {
  export interface T100 {
    name: string;
  }
}
export = _Class;
