export interface CheckOption {
  cwd: string;
  fix?: boolean;
  exitLevel?: any;
  root?: string[];
  defaultIndex?: string[];
  preset?: string;
  pattern?: string | string | string | string;
  ignore?: string | string[];
}
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
export function test(opt: CheckOption): CheckOption;
