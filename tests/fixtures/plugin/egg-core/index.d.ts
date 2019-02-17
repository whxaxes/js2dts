import * as koa from 'koa';
import { EventEmitter } from 'events';
declare class Timing {
  constructor();
  start(name: any): _EggCore.T101;
  end(name: any): any;
  toJSON(): any;
}
/**
 * BaseContextClass is a base class that can be extended,
 * it's instantiated in context level,
 * {@link Helper}, {@link Service} is extending it.
 */
declare class BaseContextClass {
  ctx: any;
  app: any;
  config: any;
  service: any;
  /**
   * @constructor
   * @param {Context} ctx - context instance
   * @since 1.0.0
   */
  constructor(ctx: any);
}
declare class Lifecycle extends EventEmitter {
  options: _EggCore.T102;
  readyTimeout: number;
  /**
   * @param {object} options - options
   * @param {String} options.baseDir - the directory of application
   * @param {EggCore} options.app - Application instance
   * @param {Logger} options.logger - logger
   */
  constructor(options: _EggCore.T102);
  app: any;
  logger: any;
  timing: any;
  legacyReadyCallback(name: any, opt: any): any;
  addBootHook(hook: any): void;
  addFunctionAsBootHook(hook: any): void;
  /**
   * init boots and trigger config did config
   */
  init(): void;
  registerBeforeStart(scope: any): void;
  registerBeforeClose(fn: any): void;
  close(): Promise<void>;
  triggerConfigWillLoad(): void;
  triggerConfigDidLoad(): void;
  triggerDidLoad(): void;
  triggerWillReady(): void;
  triggerDidReady(err: any): void;
  triggerServerDidReady(): void;
}
/**
 * Load files from directory to target object.
 * @since 1.0.0
 */
declare class FileLoader {
  options: _EggCore.T105 & _EggCore.T104;
  /**
   * @constructor
   * @param {Object} options - options
   * @param {String|Array} options.directory - directories to be loaded
   * @param {Object} options.target - attach the target object from loaded files
   * @param {String} options.match - match the files when load, support glob, default to all js files
   * @param {String} options.ignore - ignore the files when load, support glob
   * @param {Function} options.initializer - custom file exports, receive two parameters, first is the inject object(if not js file, will be content buffer), second is an `options` object that contain `path`
   * @param {Boolean} options.call - determine whether invoke when exports is function
   * @param {Boolean} options.override - determine whether override the property when get the same name
   * @param {Object} options.inject - an object that be the argument when invoke the function
   * @param {Function} options.filter - a function that filter the exports which can be loaded
   * @param {String|Function} options.caseStyle - set property's case when converting a filepath to property list.
   */
  constructor(options: _EggCore.T104);
  /**
   * attach items to target object. Mapping the directory to properties.
   * `app/controller/group/repository.js` => `target.group.repository`
   * @return {Object} target
   * @since 1.0.0
   */
  load(): any;
  /**
   * Parse files from given directories, then return an items list, each item contains properties and exports.
   *
   * For example, parse `app/controller/group/repository.js`
   *
   * ```
   * module.exports = app => {
   *   return class RepositoryController extends app.Controller {};
   * }
   * ```
   *
   * It returns a item
   *
   * ```
   * {
   *   properties: [ 'group', 'repository' ],
   *   exports: app => { ... },
   * }
   * ```
   *
   * `Properties` is an array that contains the directory of a filepath.
   *
   * `Exports` depends on type, if exports is a function, it will be called. if initializer is specified, it will be called with exports for customizing.
   * @return {Array} items
   * @since 1.0.0
   */
  parse(): any[];
}
/**
 * Same as {@link FileLoader}, but it will attach file to `inject[fieldClass]`. The exports will be lazy loaded, such as `ctx.group.repository`.
 * @extends FileLoader
 * @since 1.0.0
 */
declare class ContextLoader extends FileLoader {
  /**
   * @constructor
   * @param {Object} options - options same as {@link FileLoader}
   * @param {String} options.fieldClass - determine the field name of inject object.
   */
  constructor(options: _EggCore.T106);
}
declare class EggLoader {
  options: _EggCore.T103;
  app: any;
  lifecycle: any;
  timing: any;
  pkg: any;
  eggPaths: any[];
  serverEnv: string;
  appInfo: any;
  serverScope: any;
  /**
   * @constructor
   * @param {Object} options - options
   * @param {String} options.baseDir - the directory of application
   * @param {EggCore} options.app - Application instance
   * @param {Logger} options.logger - logger
   * @param {Object} [options.plugins] - custom plugins
   * @since 1.0.0
   */
  constructor(options: _EggCore.T103);
  /**
   * Get home directory
   * @return {String} home directory
   * @since 3.4.0
   */
  getHomedir(): string;
  /**
   * Get app info
   * @return {AppInfo} appInfo
   * @since 1.0.0
   */
  getAppInfo(): any;
  /**
   * Load single file, will invoke when export is function
   *
   * @param {String} filepath - fullpath
   * @param {Array} arguments - pass rest arguments into the function when invoke
   * @return {Object} exports
   * @example
   * ```js
   * app.loader.loadFile(path.join(app.options.baseDir, 'config/router.js'));
   * ```
   * @since 1.0.0
   */
  loadFile(filepath: string, ...inject: any[]): any;
  /**
   * Get all loadUnit
   *
   * loadUnit is a directory that can be loaded by EggLoader, it has the same structure.
   * loadUnit has a path and a type(app, framework, plugin).
   *
   * The order of the loadUnits:
   *
   * 1. plugin
   * 2. framework
   * 3. app
   *
   * @return {Array} loadUnits
   * @since 1.0.0
   */
  getLoadUnits(): any[];
  /**
   * Load files using {@link FileLoader}, inject to {@link Application}
   * @param {String|Array} directory - see {@link FileLoader}
   * @param {String} property - see {@link FileLoader}
   * @param {Object} opt - see {@link FileLoader}
   * @since 1.0.0
   */
  loadToApp(directory: string | any[], property: string, opt: any): void;
  /**
   * Load files using {@link ContextLoader}
   * @param {String|Array} directory - see {@link ContextLoader}
   * @param {String} property - see {@link ContextLoader}
   * @param {Object} opt - see {@link ContextLoader}
   * @since 1.0.0
   */
  loadToContext(directory: string | any[], property: string, opt: any): void;
  /**
   * @member {FileLoader} EggLoader#FileLoader
   * @since 1.0.0
   */
  FileLoader: typeof FileLoader;
  /**
   * @member {ContextLoader} EggLoader#ContextLoader
   * @since 1.0.0
   */
  ContextLoader: typeof ContextLoader;
  getTypeFiles(filename: any): string[];
  resolveModule(filepath: any): string;
}
declare class EggCore extends koa {
  timing: Timing;
  BaseContextClass: typeof BaseContextClass;
  Controller: typeof BaseContextClass;
  Service: typeof BaseContextClass;
  lifecycle: Lifecycle;
  loader: EggLoader;
  /**
   * @constructor
   * @param {Object} options - options
   * @param {String} [options.baseDir=process.cwd()] - the directory of application
   * @param {String} [options.type=application|agent] - whether it's running in app worker or agent worker
   * @param {Object} [options.plugins] - custom plugins
   * @since 1.0.0
   */
  constructor(options?: _EggCore.T100);
  /**
   * override koa's app.use, support generator function
   * @param {Function} fn - middleware
   * @return {Application} app
   * @since 1.0.0
   */
  use(fn: (...args: any[]) => any): any;
  /**
   * Whether `application` or `agent`
   * @member {String}
   * @since 1.0.0
   */
  type: string;
  /**
   * The current directory of application
   * @member {String}
   * @see {@link AppInfo#baseDir}
   * @since 1.0.0
   */
  baseDir: string;
  /**
   * Alias to {@link https://npmjs.com/package/depd}
   * @member {Function}
   * @since 1.0.0
   */
  deprecate: any;
  /**
   * The name of application
   * @member {String}
   * @see {@link AppInfo#name}
   * @since 1.0.0
   */
  name: any;
  /**
   * Retrieve enabled plugins
   * @member {Object}
   * @since 1.0.0
   */
  plugins: any;
  /**
   * The configuration of application
   * @member {Config}
   * @since 1.0.0
   */
  config: any;
  /**
   * Execute scope after loaded and before app start.
   *
   * Notice:
   * This method is now NOT recommanded and reguarded as a deprecated one,
   * For plugin development, we should use `didLoad` instead.
   * For application development, we should use `willReady` instead.
   *
   * @see https://eggjs.org/en/advanced/loader.html#beforestart
   *
   * @param  {Function|GeneratorFunction|AsyncFunction} scope function will execute before app start
   */
  beforeStart(scope: any): void;
  /**
   * register an callback function that will be invoked when application is ready.
   * @see https://github.com/node-modules/ready
   * @since 1.0.0
   * @param {boolean|Error|Function} flagOrFunction -
   * @return {Promise|null} return promise when argument is undefined
   * @example
   * const app = new Application(...);
   * app.ready(err => {
   *   if (err) throw err;
   *   console.log('done');
   * });
   */
  ready(flagOrFunction: boolean | ((...args: any[]) => any) | Error): Promise<any>;
  /**
   * If a client starts asynchronously, you can register `readyCallback`,
   * then the application will wait for the callback to ready
   *
   * It will log when the callback is not invoked after 10s
   *
   * Recommend to use {@link EggCore#beforeStart}
   * @since 1.0.0
   *
   * @param {String} name - readyCallback task name
   * @param {object} opts -
   *   - {Number} [timeout=10000] - emit `ready_timeout` when it doesn't finish but reach the timeout
   *   - {Boolean} [isWeakDep=false] - whether it's a weak dependency
   * @return {Function} - a callback
   * @example
   * const done = app.readyCallback('mysql');
   * mysql.ready(done);
   */
  readyCallback(name: string, opts: any): (...args: any[]) => any;
  /**
   * Register a function that will be called when app close.
   *
   * Notice:
   * This method is now NOT recommanded directly used,
   * Developers SHOULDN'T use app.beforeClose directly now,
   * but in the form of class to implement beforeClose instead.
   *
   * @see https://eggjs.org/en/advanced/loader.html#beforeclose
   *
   * @param {Function} fn - the function that can be generator function or async function.
   */
  beforeClose(fn: (...args: any[]) => any): void;
  /**
   * Close all, it will close
   * - callbacks registered by beforeClose
   * - emit `close` event
   * - remove add listeners
   *
   * If error is thrown when it's closing, the promise will reject.
   * It will also reject after following call.
   * @return {Promise} promise
   * @since 1.0.0
   */
  close(): Promise<any>;
  /**
   * get router
   * @member {Router} EggCore#router
   * @since 1.0.0
   */
  router: any;
  /**
   * Alias to {@link Router#url}
   * @param {String} name - Router name
   * @param {Object} params - more parameters
   * @return {String} url
   */
  url(name: string, params: any): string;
  del(...args: any[]): this;
  /**
   * Convert a generator function to a promisable one.
   *
   * Notice: for other kinds of functions, it directly returns you what it is.
   *
   * @param  {Function} fn The inputted function.
   * @return {AsyncFunction} An async promise-based function.
   * @example
   ```javascript
   const fn = function* (arg) {
   return arg;
   };
   const wrapped = app.toAsyncFunction(fn);
   wrapped(true).then((value) => console.log(value));
   ```
   */
  toAsyncFunction(fn: (...args: any[]) => any): any;
  /**
   * Convert an object with generator functions to a Promisable one.
   * @param  {Mixed} obj The inputted object.
   * @return {Promise} A Promisable result.
   * @example
   ```javascript
   const fn = function* (arg) {
   return arg;
   };
   const arr = [ fn(1), fn(2) ];
   const promise = app.toPromise(arr);
   promise.then(res => console.log(res));
   ```
   */
  toPromise(obj: any): Promise<any>;
}
declare const _EggCore: _EggCore.T108;
declare namespace _EggCore {
  export interface T100 {
    baseDir?: string;
    type?: string;
    plugins?: any;
  }
  export interface T101 {
    name: any;
    start: number;
    end: any;
    duration: any;
    pid: number;
    index: any;
  }
  export interface T102 {
    baseDir: string;
    app: any;
    logger: any;
  }
  export interface T103 {
    baseDir: string;
    app: any;
    logger: any;
    plugins?: any;
  }
  export interface T104 {
    directory: string | any[];
    target: any;
    match: string;
    ignore: string;
    initializer: (...args: any[]) => any;
    call: boolean;
    override: boolean;
    inject: any;
    filter: (...args: any[]) => any;
    caseStyle: string | ((...args: any[]) => any);
  }
  export interface T105 {
    directory: any;
    target: any;
    match: any;
    ignore: any;
    lowercaseFirst: boolean;
    caseStyle: string;
    initializer: any;
    call: boolean;
    override: boolean;
    inject: any;
    filter: any;
  }
  export interface T106 {
    fieldClass: string;
  }
  export interface T107 {
    extensions: any;
    loadFile(filepath: any): any;
    methods: string[];
    callFn(fn: any, args: any, ctx: any): Promise<any>;
    middleware(fn: any): any;
    getCalleeFromStack(withLine: any, stackIndex: any): any;
    getResolvedFilename(filepath: any, baseDir: any): any;
  }
  export interface T108 {
    EggCore: typeof EggCore;
    EggLoader: typeof EggLoader;
    BaseContextClass: typeof BaseContextClass;
    utils: _EggCore.T107;
  }
}
export = _EggCore;
