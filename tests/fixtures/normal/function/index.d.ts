interface T100 {
  test: () => number;
  test2: _Function.T101;
}
declare const _Function: ((bbb: string) => string) & T100;
declare namespace _Function {
  export interface T101 {
    abc: number;
  }
}
export = _Function;
