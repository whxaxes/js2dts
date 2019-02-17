declare namespace _Ndir_1 {
  // tests/fixtures/plugin/ndir/lib/ndir.js
  /**
   * dir Walker Class.
   * 
   * @constructor
   * @param {String} root    Root path.
   * @param {Function(dirpath, files)} [onDir]   The `dir` event callback.
   * @param {Function} [onEnd]   The `end` event callback.
   * @param {Function} [onError] The `error` event callback.
   * @public
   */
  export class Walk_1 {
    constructor(root: string, onDir: any, onEnd: (...args: any[]) => any, onError: (...args: any[]) => any);
    dirs: string[];
  }
  export const Walk: typeof Walk_1;
  /**
   * Walking dir base on `Event`.
   * 
   * @param  {String} dir     Start walking path.
   * @param  {Function(dir)} [onDir]   When a dir walk through, `emit('dir', dirpath, files)`.
   * @param  {Function} [onEnd]   When a dir walk over, `emit('end')`.
   * @param  {Function} [onError] When stat a path error, `emit('error', err, path)`.
   * @return {Walk} dir walker instance.
   * @public
   */
  export function walk(dir: string, onDir: any, onEnd?: (...args: any[]) => any, onError?: (...args: any[]) => any): Walk_1;
  /**
   * Copy file, auto create tofile dir if dir not exists.
   * 
   * @param {String} fromfile, Source file path.
   * @param {String} tofile, Target file path.
   * @param {Function} callback
   * @public
   */
  export function copyfile(fromfile: string, tofile: string, callback: (...args: any[]) => any): any;
  /**
   * mkdir if dir not exists, equal mkdir -p /path/foo/bar
   *
   * @param {String} dir
   * @param {Number} [mode] file mode, default is 0777.
   * @param {Function} [callback]
   * @public
   */
  export function mkdir(dir: string, mode?: number, callback?: (...args: any[]) => any): void;
  export function mkdirp(dir: string, mode?: number, callback?: (...args: any[]) => any): void;
  /**
   * Read stream data line by line.
   * 
   * @constructor
   * @param {String|ReadStream} file File path or data stream object.
   */
  export class LineReader {
    constructor(file: any);
    readstream: any;
    remainBuffers: any[];
  }
  /**
   * Line data reader
   * 
   * @example
   * ```
   * var ndir = require('ndir');
   * ndir.createLineReader('/tmp/access.log')
   * .on('line', function (line) {
   *   console.log(line.toString());
   * })
   * .on('end', function () {
   *   console.log('end');
   * })
   * .on('error', function (err) {
   *   console.error(err);
   * });
   * ```
   * 
   * @param {String|ReadStream} file, file path or a `ReadStream` object.
   */
  export function createLineReader(file: any): LineReader;
}
declare const _Ndir: typeof _Ndir_1;
export = _Ndir;
