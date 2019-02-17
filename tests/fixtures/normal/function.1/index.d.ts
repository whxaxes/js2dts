interface T100 {
  test: () => number;
  test2: _Function1.T101;
}
/**
 * super function
 * 
 * @param {String} bbb 123123
 */
declare function superName(bbb: string, ccc?: () => number): string;
declare const _Function1: typeof superName & T100;
declare namespace _Function1 {
  export interface T101 {
    abc: number;
  }
}
export = _Function1;
