import { Stats } from 'fs';
declare const T0: {
  test: number;
  aaaa: string;
  test2: () => string;
  test3: () => number;
  test4(abc: string): Promise<string>;

  /**
  * test
  * @returns {Promise<string>}
  */
  test5(): Promise<string>;
  test6(): typeof testFn;
  test7(str: any): TestClass;
  test8(): Stats;
} & typeof T1;
declare namespace T1 {
  export function test9(): string;
}
declare class TestClass extends BaseClass {
  n: any;
  ccc: number;
  constructor(n: any);
  test2(): number;
}
declare class BaseClass {
  test(): string;
}
declare function testFn(bb?: number): number;
export = T0;
