
/**
 * @member Config#development
 * @property {Array} watchDirs - dirs needed watch, when files under these change, application will reload, use relative path
 * @property {Array} ignoreDirs - dirs don't need watch, including subdirectories, use relative path
 * @property {Boolean} fastReady - don't wait all plugins ready, default is false.
 * @property {Boolean} reloadOnDebug - whether reload on debug, default is true.
 * @property {Boolean} overrideDefault - whether override default watchDirs, default is false.
 * @property {Array|String} reloadPattern - whether to reload, use https://github.com/sindresorhus/multimatch
 */
export const development = {
  watchDirs: [],
  ignoreDirs: [],
  fastReady: false,
  reloadOnDebug: true,
  overrideDefault: false,
  reloadPattern: undefined,
}

export const abb = () => {}

export default function myFn() {
  return require('chokidar');
}

exports.other = 123123;

exports.otherFn = myFn;
