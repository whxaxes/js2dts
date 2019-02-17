import { Stats } from 'fs';
interface T100 {
  test9: () => string;
}
declare function testFn(bb?: number): number;
declare class BaseClass {
  test(): string;
}
declare class TestClass extends BaseClass {
  n: any;
  ccc: number;
  constructor(n: any);
  test2(): number;
}
declare const _Object: _Object.T101 & T100;
declare namespace _Object {
  export interface T101 {
    test: number;
    aaaa: string;
    test2: () => string;
    test3: () => number;
    test4(abc?: string): Promise<string>;
    /**
     * test
     * @returns {Promise<string>}
     */
    test5(): Promise<string>;
    test6(): typeof testFn;
    test7(str: any): TestClass;
    test8(): Stats;
  }
}
export = _Object;
