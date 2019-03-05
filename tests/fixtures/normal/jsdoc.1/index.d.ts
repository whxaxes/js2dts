export interface CheckOption {
  cwd: string;
  fix?: boolean;
  exitLevel?: "none" | "info" | "warn" | "error";
  exitLevel2?: "none" | "info" | "warn" | "error";
  root?: string[];
  defaultIndex?: string[];
  preset?: string;
  pattern?: "none" | "info" | "warn" | "error";
  ignore?: string | string[];
}
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
export function test(opt: CheckOption): CheckOption;
