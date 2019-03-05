const LOG_LEVELS = {
  none: 0,
  info: 1,
  warn: 2,
  error: 3,
};

/**
 * @typedef {Object} CheckOption
 * @property {String} CheckOption.cwd
 * @property {Boolean} [CheckOption.fix]
 * @property {keyof LOG_LEVELS} [CheckOption.exitLevel]
 * @property {Array<String>} [CheckOption.root]
 * @property {Array<String>} [CheckOption.defaultIndex]
 * @property {String} [CheckOption.preset]
 * @property {'error' | 'info' | 'warn' | 'none'} [CheckOption.pattern]
 * @property {String | Array<String>} [CheckOption.ignore]
 */

/**
 * @param {CheckOption} opt
 */
exports.test = opt => {
  return opt;
}
