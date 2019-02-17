import { CreateDtsFlags, CreateOptions, PlainObj, ExportFlags } from './';
import ts from 'typescript';
import * as dom from './dom';
import path from 'path';
import fs from 'fs';

export interface Declaration {
  import: dom.Import[];
  export: dom.TopLevelDeclaration[];
  fragment: dom.NamespaceMember[];
}

export interface ImportCacheElement {
  default?: string;
  list: Array<{ name: string; as?: string }>;
  from: string;
  realPath: string;
}

// runtime env
export interface Env {
  file: string;
  dist: string;
  uniqId: number;
  flags: CreateDtsFlags;
  program: ts.Program;
  checker: ts.TypeChecker;
  sourceFile: ts.SourceFile;
  declaration: Declaration;
  importCache: { [key: string]: ImportCacheElement };
  declareCache: Array<{ node: ts.Declaration, name: string }>;
  publicNames: PlainObj<number>;
  exportDefaultName?: string;
  exportNamespace?: dom.NamespaceDeclaration;
  interfaceList: dom.InterfaceDeclaration[];
  deps: { [key: string]: { env: Env; namespace: dom.NamespaceDeclaration } };
  ambientModNames: string[];
  exportFlags: ExportFlags;
  toString: () => string;
  write: () => string;
}

export let env: Env;
let envCache: { [key: string]: Env } = {};
const envStack: Env[] = [];

export function getTopEnv() {
  return envStack.length ? envStack[0] : env;
}

// get opt from topEnv
function getTopEnvOpt<T extends keyof Env = keyof Env>(key: T, def: Env[T]) {
  return envStack.length ? envStack[0][key] : def;
}

// get env from cache
export function getEnv(file: string) {
  return envCache[file];
}

// create env
export function createEnv(file: string, options: CreateOptions = {}) {
  const program = ts.createProgram([ file ], {
    target: ts.ScriptTarget.ES2017,
    module: ts.ModuleKind.CommonJS,
    allowJs: true,
    noErrorTruncation: true,
  });

  // save env
  if (env) {
    envStack.push(env);
  }

  const checker = program.getTypeChecker();
  const sourceFile = program.getSourceFile(file)!;
  const ambientMods = checker.getAmbientModules();
  const ambientModNames = ambientMods.map(mod => mod.escapedName.toString().replace(/^"|"$/g, ''));

  // init env object
  env = {
    file,
    dist: options.dist || `${path.dirname(file)}/${path.basename(file, path.extname(file))}.d.ts`,
    deps: {},
    program,
    checker,
    sourceFile,
    declaration: {
      import: [],
      fragment: [],
      export: [],
    },
    ambientModNames,
    declareCache: [],
    interfaceList: [],
    exportFlags: ExportFlags.None,

    // common obj in env tree
    uniqId: getTopEnvOpt('uniqId', 100),
    flags: getTopEnvOpt('flags', (options.flags || CreateDtsFlags.None)),
    publicNames: getTopEnvOpt('publicNames', {}),
    importCache: getTopEnvOpt('importCache', {}),

    // get string
    toString() {
      return [
        dom.emit(this.declaration.import),
        dom.emit(this.declaration.fragment),
        dom.emit(this.declaration.export),
      ].join('');
    },

    // write file
    write() {
      const content = this.toString();
      fs.writeFileSync(this.dist, content);
      return content;
    },
  };

  // cache env
  envCache[file] = env;
}

export function popEnv() {
  const response = env;

  // restore env
  env = envStack.pop()!;

  if (!envStack.length) {
    // clean cache
    envCache = {};
  }

  return response;
}
