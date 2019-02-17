declare const http: _MockMate.T100;
declare const https: _MockMate.T100;
declare const _MockMate: _MockMate.T101;
declare namespace _MockMate {
  export interface T100 {
    request: (url: any, data: any, headers: any, delay?: number) => any;
    requestError: (url: string | RegExp, reqError: string | Error, resError: string | Error, delay?: number) => void;
  }
  export interface T101 {
    (...args: any[]): any;
    isMocked: any;
    /**
     * Mock async function error.
     * @param {Object} mod, module object
     * @param {String} method, mock module object method name.
     * @param {String|Error} error, error string message or error instance.
     * @param {Object} props, error properties
     * @param {Number} timeout, mock async callback timeout, default is 0.
     * @return {mm} this - mm
     */
    error: (mod: any, method: string, error: string | Error, props: any, timeout: number) => any;
    /**
     * mock return callback(null, data1, data2).
     *
     * @param {Object} mod, module object
     * @param {String} method, mock module object method name.
     * @param {Array} datas, return datas array.
     * @param {Number} timeout, mock async callback timeout, default is 10.
     * @return {mm} this - mm
     */
    datas: (mod: any, method: string, datas: any[], timeout: number) => any;
    /**
     * mock return callback(null, data).
     *
     * @param {Object} mod, module object
     * @param {String} method, mock module object method name.
     * @param {Object} data, return data.
     * @param {Number} timeout, mock async callback timeout, default is 0.
     * @return {mm} this - mm
     */
    data: (mod: any, method: string, data: any, timeout: number) => any;
    /**
     * mock return callback(null, null).
     *
     * @param {Object} mod, module object
     * @param {String} method, mock module object method name.
     * @param {Number} [timeout], mock async callback timeout, default is 0.
     * @return {mm} this - mm
     */
    empty: (mod: any, method: string, timeout?: number) => any;
    /**
     * mock function sync throw error
     *
     * @param {Object} mod, module object
     * @param {String} method, mock module object method name.
     * @param {String|Error} error, error string message or error instance.
     * @param {Object} [props], error properties
     */
    syncError: (mod: any, method: string, error: string | Error, props?: any) => void;
    /**
     * mock function sync return data
     *
     * @param {Object} mod, module object
     * @param {String} method, mock module object method name.
     * @param {Object} data, return data.
     */
    syncData: (mod: any, method: string, data: any) => void;
    /**
     * mock function sync return nothing
     *
     * @param {Object} mod, module object
     * @param {String} method, mock module object method name.
     */
    syncEmpty: (mod: any, method: string) => void;
    http: typeof http;
    https: typeof https;
    /**
     * mock child_process spawn
     * @param {Integer} code exit code
     * @param {String} stdout stdout
     * @param {String} stderr stderr
     * @param {Integer} timeout stdout/stderr/close event emit timeout
     */
    spawn: (code: any, stdout: string, stderr: string, timeout: any) => void;
    /**
     * remove all mock effects.
     * @return {mm} this - mm
     */
    restore: () => any;
  }
}
export = _MockMate;
