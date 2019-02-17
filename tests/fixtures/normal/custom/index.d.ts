import * as events from 'events';
import { EventEmitter } from 'events';
import * as globby from 'globby';
import * as http from 'http';
import { Server } from 'http';
/**
 * my test class
 */
declare class MyTest extends EventEmitter {
  opt: _Custom.T100;
  /**
   * test class
   * 
   * @param {Object} options test
   * @param {String} options.name test
   */
  constructor(options: _Custom.T100);
  /**
   * test class
   * 
   * @param {Object} opt test
   * @param {String} opt.name test
   */
  static getInstance(opt: _Custom.T100): MyTest;
  getCount(): number;
}
interface T101 {
  MyTest: typeof MyTest;
  glob: typeof globby;
  test: typeof _Test;
  http: typeof http;
  Server: typeof Server;
  events: typeof events;
}
declare namespace _Test {
  // tests/fixtures/normal/custom/test.js
  export const a: number;
  export const b: string;
  export function c(): number;
}
declare const _Custom: typeof MyTest & T101;
declare namespace _Custom {
  export interface T100 {
    name: string;
  }
}
export = _Custom;
