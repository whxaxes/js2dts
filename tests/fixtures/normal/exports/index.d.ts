export interface T100 {
  watchDirs: any[];
  ignoreDirs: any[];
  fastReady: boolean;
  reloadOnDebug: boolean;
  overrideDefault: boolean;
  reloadPattern?: any;
}
/**
 * @member Config#development
 * @property {Array} watchDirs - dirs needed watch, when files under these change, application will reload, use relative path
 * @property {Array} ignoreDirs - dirs don't need watch, including subdirectories, use relative path
 * @property {Boolean} fastReady - don't wait all plugins ready, default is false.
 * @property {Boolean} reloadOnDebug - whether reload on debug, default is true.
 * @property {Boolean} overrideDefault - whether override default watchDirs, default is false.
 * @property {Array|String} reloadPattern - whether to reload, use https://github.com/sindresorhus/multimatch
 */
export const development: T100;
export const test: number;
export const blabla: string;
export const xxx: number;
export function a(): number;
export function b(): number;
export function c(): () => number;
