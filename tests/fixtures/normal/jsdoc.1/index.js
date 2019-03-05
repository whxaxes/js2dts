const LOG_LEVELS = {
  none: 0,
  info: 1,
  warn: 2,
  error: 3,
};

/** @typedef {typeof LOG_LEVELS} LOG_KEYS */

/**
 * @typedef {Object} CheckOption
 * @property {String} CheckOption.cwd
 * @property {Boolean} [CheckOption.fix]
 * @property {keyof LOG_KEYS} [CheckOption.exitLevel]
 * @property {keyof LOG_LEVELS} [CheckOption.exitLevel2]
 * @property {Array<String>} [CheckOption.root]
 * @property {Array<String>} [CheckOption.defaultIndex]
 * @property {CheckOption['cwd']} [CheckOption.preset]
 * @property {'error' | 'info' | 'warn' | 'none'} [CheckOption.pattern]
 * @property {String | Array<String>} [CheckOption.ignore]
 */

/**
 * @param {CheckOption} opt
 */
exports.test = opt => {
  return opt;
}
