import ts from 'typescript';
import path from 'path';
import fs from 'fs';
import * as util from './util';
import * as dom from './dom';
import { isEqual } from 'lodash';
let uniqId = 100;

interface Declaration {
  import: dom.Import[];
  export: dom.TopLevelDeclaration[];
  fragment: dom.NamespaceMember[];
}

interface ImportCacheElement {
  default?: string;
  list: string[];
  from: string;
  realPath: string;
}

interface CreateOptions {
  dist?: string;
  flags?: CreateDtsFlags;
}

// runtime env
interface Env {
  file: string;
  dist: string;
  flags: CreateDtsFlags;
  program: ts.Program;
  checker: ts.TypeChecker;
  sourceFile: ts.SourceFile;
  declaration: Declaration;
  importCache: { [key: string]: ImportCacheElement };
  declarationList: ts.Node[];
  exportDefaultName: string;
  exportNsName: string;
  exportInterface?: dom.InterfaceDeclaration;
  exportNamespace: dom.NamespaceDeclaration;
  cacheDeclarationList: ts.Node[];
  interfaceList: dom.InterfaceDeclaration[];
  deps: { [key: string]: { env: Env; namespace: dom.NamespaceDeclaration } };
  ambientModNames: string[];
  toString: () => string;
  write: () => string;
}

let env: Env;
const envStack: Env[] = [];
const envCache: { [key: string]: Env } = {};
const SyntaxKind = ts.SyntaxKind;
const nodeModulesRoot = path.resolve(process.cwd(), './node_modules');
const typeRoot = path.resolve(nodeModulesRoot, './@types/');

// get typedom flags
export enum GetTypeDomFlags {
  None = 0,
  TypeLiteralInline = 1 << 0,
}

// the flags using to create dts
export enum CreateDtsFlags {
  None = 0,
  IgnorePrivate = 1 << 0,
}

// default build flags
export const defaultBuildFlags = ts.NodeBuilderFlags.AllowNodeModulesRelativePaths
 | ts.NodeBuilderFlags.GenerateNamesForShadowedTypeParams
 | ts.NodeBuilderFlags.NoTruncation
 | ts.NodeBuilderFlags.UseTypeOfFunction;

export interface ExportListObj {
  name: string;
  node: ts.Node;
  originalNode: ts.Node;
}

// get name for anonymous type
export function getAnonymousName() {
  return `T${uniqId++}`;
}

// get type dom from typeNode
export function getTypeDom(typeNode?: ts.TypeNode, flags: GetTypeDomFlags = GetTypeDomFlags.None) {
  if (!typeNode) return;

  switch (typeNode.kind) {
    case SyntaxKind.StringKeyword:
    case SyntaxKind.StringLiteral:
      return dom.type.string;
    case SyntaxKind.NumberKeyword:
    case SyntaxKind.NumericLiteral:
      return dom.type.number;
    case SyntaxKind.LiteralType:
      return getLiteralTypeDom(typeNode as ts.LiteralTypeNode);
    case SyntaxKind.BooleanKeyword:
    case SyntaxKind.TrueKeyword:
    case SyntaxKind.FalseKeyword:
      return dom.type.boolean;
    case SyntaxKind.VoidKeyword:
      return dom.type.void;
    case SyntaxKind.ObjectKeyword:
      return dom.type.object;
    case SyntaxKind.ThisKeyword:
      return dom.type.this;
    case SyntaxKind.TypeQuery:
      return getTypeQueryTypeDom(typeNode as ts.TypeQueryNode);
    case SyntaxKind.ArrayType:
      return getArrayTypeDom(typeNode as ts.ArrayTypeNode);
    case SyntaxKind.TypeLiteral:
      return getTypeLiteralTypeDom(typeNode as ts.TypeLiteralNode, flags);
    case SyntaxKind.TypeReference:
      return getReferenceTypeDom(typeNode as ts.TypeReferenceNode);
    case SyntaxKind.UnionType:
      return getUnionTypeDom(typeNode as ts.UnionTypeNode);
    case SyntaxKind.IntersectionType:
      return getIntersectionTypeDom(typeNode as ts.IntersectionTypeNode);
    case SyntaxKind.FunctionType:
    case SyntaxKind.ConstructorType:
      return getFunctionTypeDom(typeNode as ts.FunctionTypeNode);
    case SyntaxKind.ImportType:
      return getImportTypeDom(typeNode as ts.ImportTypeNode);
    case SyntaxKind.AnyKeyword:
    case SyntaxKind.NullKeyword:
    case SyntaxKind.UndefinedKeyword:
    default:
      return dom.type.any;
  }
}

export function getLiteralTypeDom(typeNode: ts.LiteralTypeNode) {
  return getTypeDom(typeNode.literal as ts.TypeNode);
}

export function getFunctionTypeDom(typeNode: ts.FunctionTypeNode) {
  return dom.create.functionType(
    getFunctionParametersTypeDom(typeNode.parameters),
    getTypeDom(typeNode.type) || dom.type.void,
  );
}

export function getTypeQueryTypeDom(typeNode: ts.TypeQueryNode) {
  const returnTypeDom = getReferenceTypeDomFromEntity(typeNode.exprName);
  return returnTypeDom ? dom.create.typeof(returnTypeDom) : dom.type.any;
}

export function getTypeLiteralTypeDom(typeNode: ts.TypeLiteralNode, flags: GetTypeDomFlags = GetTypeDomFlags.None) {
  const members = typeNode.members;
  const interfaceMembers: dom.ObjectTypeMember[] = [];
  members.forEach(member => {
    if (!member.name) return;
    const name = util.getText(member.name);
    const typeDom = getPropTypeDomByNode(name, member);
    addJsDocToTypeDom(typeDom, member.name);
    interfaceMembers.push(typeDom as dom.ObjectTypeMember);
  });

  if (flags & GetTypeDomFlags.TypeLiteralInline) {
    return dom.create.objectType(interfaceMembers);
  } else {
    let interfaceDeclare = env.interfaceList.find(obj => isEqual(obj.members, interfaceMembers));
    if (!interfaceDeclare) {
      interfaceDeclare = createInterfaceInNs(getAnonymousName());
      interfaceDeclare.members = interfaceMembers;
      env.interfaceList.push(interfaceDeclare);
    }

    return dom.create.namedTypeReference(interfaceDeclare);
  }
}

export function getIntersectionTypeDom(typeNode: ts.IntersectionTypeNode) {
  return dom.create.intersection(typeNode.types.map(node => getTypeDom(node)));
}

export function getUnionTypeDom(typeNode: ts.UnionTypeNode) {
  return dom.create.union(typeNode.types.map(node => getTypeDom(node)));
}

// create deps in top env
export function createDepsByFile(file: string) {
  // add all deps to top env
  const topEnv = envStack[0] || env;
  const deps = topEnv.deps[file];
  if (deps) {
    return deps;
  }

  // create new env
  const customEnv = create(file);

  // add declaration to namespace
  const namespace = dom.create.namespace(getAnonymousName());
  namespace.members.push(dom.create.comment(path.relative(process.cwd(), file)));
  customEnv.declaration.fragment.forEach(decl => {
    decl.flags = dom.DeclarationFlags.Export;
    (decl as dom.DeclarationBase).namespace = namespace;
    namespace.members.push(decl);
  });
  topEnv.declaration.fragment.push(namespace);

  // compose import statement
  Object.keys(customEnv.importCache).forEach(k => {
    const customImportObj = customEnv.importCache[k];
    if (customImportObj.list.length) {
      customImportObj.list.forEach(name => {
        collectImportModule(customImportObj.from, name, customImportObj.realPath, topEnv);
      });
    } else {
      collectImportModule(customImportObj.from, undefined, customImportObj.realPath, topEnv);
    }
  });

  return topEnv.deps[file] = { env: customEnv, namespace };
}

// get import type dom
export function getImportTypeDom(typeNode: ts.ImportTypeNode) {
  if (ts.isLiteralTypeNode(typeNode.argument) && ts.isStringLiteral(typeNode.argument.literal)) {
    const importPath = typeNode.argument.literal.text;
    const modName = getModNameByPath(importPath);
    let exportName: string | undefined;
    if (modName) {
      exportName = collectImportModule(modName, undefined, importPath);
    } else {
      const filePath = util.resolveUrl(importPath);
      if (filePath && path.extname(filePath) === '.js') {
        const { env, namespace } = createDepsByFile(filePath);
        exportName = `${namespace.name}.${env.exportDefaultName}`;
      }
    }

    if (exportName) {
      const referenceType = dom.create.namedTypeReference(exportName);
      if (typeNode.isTypeOf) {
        return dom.create.typeof(referenceType);
      }

      return referenceType;
    }
  }

  return dom.type.any;
}

export function getReturnTypeFromDeclaration(declaration: ts.SignatureDeclaration) {
  if (declaration.type) {
    return declaration.type;
  }

  const signature = env.checker.getSignatureFromDeclaration(declaration);
  if (!signature) {
    return;
  }

  const type = env.checker.getReturnTypeOfSignature(signature!);
  return env.checker.typeToTypeNode(type, undefined, defaultBuildFlags);
}

export function getClassLikeTypeDom(node: ts.ClassLikeDeclaration) {
  const classDeclaration = dom.create.class(util.getText(node.name));
  addJsDocToTypeDom(classDeclaration, node);

  if (node.heritageClauses) {
    // inherit
    node.heritageClauses.forEach(clause => {
      if (clause.types.length && clause.token === ts.SyntaxKind.ExtendsKeyword) {
        const expr = clause.types[0].expression;
        let typeNode;
        if (ts.isIdentifier(expr)) {
          typeNode = getTypeNodeAtLocation(expr);
        } else if (ts.isPropertyAccessExpression(expr)) {
          typeNode = getTypeNodeAtLocation(expr.name);
        }

        if (typeNode && ts.isTypeQueryNode(typeNode)) {
          const reference = getReferenceTypeDomFromEntity(typeNode.exprName);
          if (reference) classDeclaration.baseType = dom.create.class(reference.name);
        }
      }
    });
  }

  eachPropertiesTypeDom<ts.ClassElement>(node.members, (name, member) => {
    const cache = new Map();
    const addProp = (t: dom.ClassMember) => {
      const name = dom.util.isConstructorDeclaration(t) ? t.kind : t.name;
      if (cache.has(name)) return;
      cache.set(name, true);
      classDeclaration.members.push(t);
    };

    if (ts.isConstructorDeclaration(member)) {
      // constructor
      const constructorTypeDom = dom.create.constructor(getFunctionParametersTypeDom(member.parameters));
      addJsDocToTypeDom(constructorTypeDom, member);
      if (member.body && member.body.statements.length) {
        // check statement in constructor
        findAssignToThis(member.body.statements)
          .forEach(({ name, node }) => {
            addProp(getPropTypeDomByNode(name, node));
          });
      }

      addProp(constructorTypeDom);
      return;
    }

    // skip without property name
    if (!name) {
      return;
    }

    const typeDom = getPropTypeDomByNode(name, member);
    addJsDocToTypeDom(typeDom, member);
    addProp(typeDom);
  });

  return classDeclaration;
}

// find assign result type
interface FindAssignResult {
  init?: boolean;
  obj?: ts.Expression;
  key: ts.Identifier;
  value?: ts.Expression;
  node: ts.Node;
}

// find xxx.xxx =, let xxx =, xxx =
export function findAssign(statements: ts.NodeArray<ts.Statement>, cb: (obj: FindAssignResult) => void) {
  statements.forEach(statement => {
    if (
      ts.isExpressionStatement(statement) &&
      ts.isBinaryExpression(statement.expression)
    ) {
      if (
        ts.isPropertyAccessExpression(statement.expression.left) &&
        ts.isIdentifier(statement.expression.left.name)
      ) {
        // xxx.xxx = xx
        cb({
          obj: statement.expression.left.expression,
          key: statement.expression.left.name,
          value: statement.expression.right,
          node: statement,
        });
      } else if (ts.isIdentifier(statement.expression.left)) {
        // xxx = xx
        cb({
          key: statement.expression.left,
          value: statement.expression.right,
          node: statement,
        });
      } else if (
        ts.isElementAccessExpression(statement.expression.left) &&
        ts.isStringLiteral(statement.expression.left.argumentExpression)
      ) {
        // xxx['sss'] = xxx
        cb({
          obj: statement.expression.left.expression,
          key: ts.createIdentifier(statement.expression.left.argumentExpression.text),
          value: statement.expression.right,
          node: statement,
        });
      }
    } else if (ts.isVariableStatement(statement)) {
      // const xxx = xx
      statement.declarationList.declarations.forEach(declare => {
        if (ts.isIdentifier(declare.name)) {
          cb({
            init: true,
            key: declare.name,
            value: declare.initializer,
            node: declare,
          });
        }
      });
    } else if (ts.isIfStatement(statement)) {
      const checkIfStatement = (el: ts.IfStatement) => {
        if (ts.isBlock(el.thenStatement)) {
          findAssign(el.thenStatement.statements, cb);
        }

        if (el.elseStatement) {
          if (ts.isIfStatement(el.elseStatement)) {
            checkIfStatement(el.elseStatement);
          } else if (ts.isBlock(el.elseStatement)) {
            findAssign(el.elseStatement.statements, cb);
          }
        }
      };

      checkIfStatement(statement);
    }
  });
}

// find export node from sourcefile.
export function findExportNode(sourceFile: ts.SourceFile) {
  const exportNodeList: ExportListObj[] = [];
  let exportDefaultNode: ts.Node | undefined;

  findAssignByName(sourceFile.statements, [
    'exports',
    'module',
    'module.exports',
  ], ({ name, key, value, node }) => {
    const addExportNode = () => {
      const name = util.getText(key);
      const index = exportNodeList.findIndex(n => n.name === name);
      if (index >= 0) {
        // remove duplicate node
        exportNodeList.splice(index, 1);
      }

      exportNodeList.push({
        name: util.getText(key),
        node: value!,
        originalNode: node,
      });
    };

    if (name === 'exports') {
      // exports.xxx = {}
      addExportNode();
    } else if (name === 'module' && util.getText(key) === 'exports') {
      // module.exports = {}
      exportDefaultNode = value;
    } else if (name === 'module.exports') {
      // module.exports.xxx = {}
      addExportNode();
    }
  });

  return {
    exportDefaultNode,
    exportNodeList,
  };
}

// find this.xxx =
export function findAssignToThis(statements: ts.NodeArray<ts.Statement>) {
  const assignList: Array<{ name: string; node?: ts.TypeNode }> = [];
  findAssignByName(statements, 'this', ({ key, node }) => {
    const propName = util.getText(key);
    if (checkIsPrivate(node, propName)) {
      return;
    }

    assignList.push({
      name: propName,
      node: getTypeNodeAtLocation(key),
    });
  });
  return assignList;
}

// find assign by name
type FindAssignNameType = string | RegExp;
interface FindAssignNameResult extends FindAssignResult {
  obj: ts.Expression;
  name: string;
  value: ts.Expression;
}

export function findAssignByName(
  statements: ts.NodeArray<ts.Statement>,
  name: FindAssignNameType | FindAssignNameType[],
  cb?: (result: FindAssignNameResult) => void | boolean,
) {
  // cache the variable of name
  const variableList = Array.isArray(name) ? name : [ name ];
  const variableObj: { [key: string]: FindAssignNameResult[] } = {};
  const nameAlias = {};
  const getRealName = name => {
    const realName = nameAlias[name] || name;
    const hitTarget = !!variableList.find(variable => {
      return (typeof variable === 'string')
        ? variable === realName
        : variable.test(realName);
    });
    return hitTarget ? realName : undefined;
  };

  findAssign(statements, ({ obj, key, value, node }) => {
    if (!obj || !value) {
      // const xx = name
      if (value) {
        const realName = getRealName(value.getText().trim());
        if (realName) {
          nameAlias[util.getText(key)] = realName;
        }
      }

      return;
    }

    const realName = getRealName(obj.getText().trim());
    if (realName) {
      const result = { name: realName, obj, key, value, node };
      const cbResult = cb ? cb(result) : true;
      if (cbResult !== false) {
        variableObj[realName] = variableObj[realName] || [];
        variableObj[realName].push(result);
      }
    }
  });

  return variableObj;
}

export function addJsDocToTypeDom(typeDom: dom.DeclarationBase, originalNode: ts.Node) {
  let jsDoc = getJSDocPlain(originalNode);
  if (!jsDoc) {
    const symbol = util.getSymbol(originalNode);
    if (symbol && symbol.valueDeclaration) {
      jsDoc = getJSDocPlain(symbol.valueDeclaration);
    }
  }
  typeDom.jsDocComment = jsDoc
    ? dom.create.jsDocComment(jsDoc, dom.CommentFlags.Plain)
    : undefined;
}

export function eachPropertiesTypeDom<T extends ts.ClassElement | ts.ObjectLiteralElement>(
  nodeList: ts.NodeArray<T>,
  callback: (propName: string, d: T, propList: string[]) => void,
) {
  const propertyNameList: string[] = [];
  nodeList.forEach(member => {
    const propertyName = util.getText(member.name);
    if (propertyNameList.includes(propertyName)) {
      return;
    }

    if (checkIsPrivate(member, propertyName)) {
      return;
    }

    propertyNameList.push(propertyName);

    callback(propertyName, member, propertyNameList);
  });
}

// get property type dom by ts.Node
export function getPropTypeDomByNode(name: string, node?: ts.Node, flags: dom.DeclarationFlags = dom.DeclarationFlags.None) {
  let typeDom: dom.ClassMember | undefined;
  // check optional
  const checkOptional = (type?: ts.TypeNode, node?: ts.Node) => {
    if (
      (type && type.kind === SyntaxKind.UndefinedKeyword) ||
      (node && util.hasQuestionToken(node))
    ) {
      flags |= dom.DeclarationFlags.Optional;
    }
  };

  if (!node || ts.isTypeNode(node)) {
    checkOptional(node);

    // type node
    const d = getTypeDom(node) || dom.type.any;
    if (dom.util.isFunctionType(d)) {
      typeDom = dom.create.method(name, d.parameters, d.returnType, flags);
    } else {
      typeDom = dom.create.property(name, d, flags);
    }
  } else {
    // not type node
    if (util.modifierHas(node, SyntaxKind.StaticKeyword)) {
      flags |= dom.DeclarationFlags.Static;
    }

    if (name !== '...') {
      if (ts.isMethodDeclaration(node) || ts.isMethodSignature(node)) {
        // method property
        const typeNode = getReturnTypeFromDeclaration(node);
        typeDom = dom.create.method(
          name,
          getFunctionParametersTypeDom(node.parameters),
          typeNode ? getTypeDom(typeNode) : dom.type.any,
          flags,
        );
      } else if (ts.isGetAccessorDeclaration(node) || ts.isGetAccessor(node)) {
        // getter
        const typeNode = getTypeNodeAtLocation(node);
        checkOptional(typeNode, node);
        typeDom = dom.create.property(name, getTypeDom(typeNode) || dom.type.any, flags);
      } else if (ts.isPropertyDeclaration(node) || ts.isPropertySignature(node)) {
        // property declaration
        checkOptional(node.type, node);
        typeDom = dom.create.property(name, getTypeDom(node.type) || dom.type.any, flags);
      }
    }
  }

  typeDom = typeDom || dom.create.property(name, dom.type.any, flags);
  return typeDom;
}

// get reference module by symbol
export function getReferenceModule(symbol: ts.Symbol) {
  if (!symbol) return false;
  const symbolDeclaration = symbol.valueDeclaration || symbol.declarations[0];
  if (!symbolDeclaration) return false;
  const declarationFile = symbolDeclaration.getSourceFile().fileName;
  const isFromLib = declarationFile.startsWith(path.join(nodeModulesRoot, 'typescript/lib/lib.'));
  const isFromNodeModule = declarationFile.startsWith(nodeModulesRoot);
  if (isFromLib) {
    // build-in module
    return;
  } else if (declarationFile === env.sourceFile.fileName) {
    // current module
    return symbolDeclaration;
  } else if (!isFromNodeModule) {
    // custom module
    return symbolDeclaration;
  }

  // find in global modules
  let declaration: ts.Node = symbolDeclaration;
  while (declaration && !ts.isSourceFile(declaration)) {
    if (util.isDeclareModule(declaration)) {
      // declare module "xxx" {}
      return declaration;
    }

    declaration = declaration.parent;
  }

  return symbolDeclaration.getSourceFile();
}

export function getExportsBySymbol(node: ts.Node) {
  const symbol = util.getSymbol(node);
  if (symbol && symbol.exports) {
    return symbol.exports.get(ts.InternalSymbolName.ExportEquals);
  }
}

// get reference typeDom by name
export function getReferenceTypeDomFromEntity(node: ts.EntityName) {
  let interfaceName = util.getText(node);
  const symbol = util.getSymbol(node);
  if (!symbol) return;

  const checkAssignEqual = (node: ts.Node, name: string) => {
    const symbol = util.getSymbol(node)!;
    const exportAssignment = symbol.exports!.get(ts.InternalSymbolName.ExportEquals);
    return exportAssignment &&
      util.getText((exportAssignment.valueDeclaration as ts.ExportAssignment).expression) === name;
  };

  const referenceModule = getReferenceModule(symbol);
  if (referenceModule === false) {
    return;
  }

  if (referenceModule) {
    if (util.isDeclareModule(referenceModule)) {
      const modName = util.getText(referenceModule.name);
      if (checkAssignEqual(referenceModule, interfaceName)) {
        interfaceName = collectImportModule(modName);
      } else {
        collectImportModule(modName, interfaceName);
      }
    } else if (ts.isSourceFile(referenceModule)) {
      const modName = getModNameByPath(referenceModule.fileName);
      if (modName) {
        if (checkAssignEqual(referenceModule, interfaceName)) {
          interfaceName = collectImportModule(modName, undefined, referenceModule.fileName);
        } else {
          collectImportModule(modName, interfaceName, referenceModule.fileName);
        }
      } else {
        return;
      }
    } else {
      // function/class without name
      if (ts.isClassLike(referenceModule) || ts.isFunctionLike(referenceModule)) {
        if (!referenceModule.name) {
          const name = getAnonymousName();
          referenceModule.name = ts.createIdentifier(name);
          interfaceName = name;
        }
      }

      addDeclarations(referenceModule);
    }
  }

  return dom.create.namedTypeReference(interfaceName);
}

export function getReferenceTypeDom(typeNode: ts.TypeReferenceNode) {
  const ref = getReferenceTypeDomFromEntity(typeNode.typeName);
  if (!ref) return dom.type.any;
  // generic
  const typeArguments = util.getTypeArguments(typeNode);
  if (typeArguments && typeArguments.length) {
    ref.typeParameters = typeArguments.map(type => getTypeDom(type) || dom.type.any);
  }
  return ref;
}

export function getArrayTypeDom(typeNode: ts.ArrayTypeNode) {
  return dom.create.array(getTypeDom(typeNode.elementType));
}

export function addDeclarations(node: ts.Declaration) {
  if (!env.cacheDeclarationList.includes(node)) {
    env.cacheDeclarationList.push(node);
    env.declarationList.push(node);
  }
}

export function getFunctionParametersTypeDom(parameters: ts.NodeArray<ts.ParameterDeclaration>) {
  const params: dom.Parameter[] = parameters.map(param => {
    let type = param.type;
    if (!type) {
      type = getTypeNodeAtLocation(param);
    }

    let flags = (param.initializer || util.hasQuestionToken(param))
      ? dom.ParameterFlags.Optional
      : dom.ParameterFlags.None;

    if (param.dotDotDotToken) {
      // ...args
      flags |= dom.ParameterFlags.Rest;
    }

    return dom.create.parameter(
      util.getText(param.name) || getAnonymousName(),
      getTypeDom(type) || dom.type.any,
      flags,
    );
  });

  return params;
}

// check whether has @private tag in jsDoc or variable name start with _
export function checkIsPrivate(node: ts.Node, name?: string) {
  if (env.flags & CreateDtsFlags.IgnorePrivate) {
    return true;
  }

  return !!util.findJsDocTag(node, 'private') ||
    (name && name.startsWith('_'));
}

// try to find definition of function prototype
export function tryParseFunctionAsClass(node: ts.FunctionDeclaration) {
  const block = node.parent;
  const fnName = util.getText(node.name);

  // try to find @constructor in jsDoc comment
  const isConstructor = util.findJsDocTag(node, 'constructor');
  let isPrototypeClass = !!isConstructor;

  // find prototype assignment
  if (ts.isBlock(block) || ts.isSourceFile(block)) {
    const classDeclare = dom.create.class(fnName);
    const prototypeExpression = `${fnName}.prototype`;
    findAssignByName(block.statements, [ prototypeExpression, fnName ], ({ name, key, value, node }) => {
      const propName = util.getText(key);
      const keyIsPrototype = propName === 'prototype';
      const isStaticProp = name === fnName && !keyIsPrototype;
      const isPrototypeAssignment = name === fnName && keyIsPrototype;
      if (isPrototypeAssignment || name === prototypeExpression) {
        isPrototypeClass = true;
      }

      if (isPrototypeAssignment) {
        // xxx.prototype = {}
        const typeNode = getTypeNodeAtLocation(value);
        const typeDom = getTypeDom(typeNode, GetTypeDomFlags.TypeLiteralInline);
        const cleanAssignment = () => {
          classDeclare.members.length = 0;
          classDeclare.baseType = undefined;
        };

        if (dom.util.isObjectType(typeDom)) {
          // xxx.prototype = {}
          cleanAssignment();
          typeDom.members.forEach(member => classDeclare.members.push(member as dom.ClassMember));
        } else if (dom.util.isNamedTypeReference(typeDom)) {
          // xxx.prototype = new XXX();
          cleanAssignment();
          classDeclare.baseType = dom.create.class(typeDom.name);
        }
      } else {
        // xxx.prototype.xx =, xxx.xx =
        if (checkIsPrivate(node, propName)) {
          return;
        }

        const typeNode = getTypeNodeAtLocation(value);
        const typeDom = getPropTypeDomByNode(propName, typeNode);
        if (isStaticProp) typeDom.flags = dom.DeclarationFlags.Static;
        addJsDocToTypeDom(typeDom, node);
        classDeclare.members.push(typeDom);
      }
    });

    if (isPrototypeClass) {
      if (node.body && node.body.statements.length) {
        // find this assignment in constructor
        findAssignToThis(node.body.statements).forEach(({ name, node }) => {
          classDeclare.members.unshift(getPropTypeDomByNode(name, node));
        });
      }

      // treat function as constructor
      classDeclare.members.unshift(dom.create.constructor(getFunctionParametersTypeDom(node.parameters)));
      return classDeclare;
    }
  }
}

export function getFunctionLikeTypeDom(node: ts.FunctionLike, fnName?: string) {
  let typeDom;

  if (ts.isFunctionDeclaration(node)) {
    typeDom = tryParseFunctionAsClass(node);
  }

  if (!typeDom) {
    const signature = env.checker.getSignatureFromDeclaration(node)!;
    const returnType = env.checker.getReturnTypeOfSignature(signature);
    const returnTypeNode = env.checker.typeToTypeNode(returnType, undefined, defaultBuildFlags);
    const parameterDom = getFunctionParametersTypeDom(node.parameters);
    const returnTypeDom = getTypeDom(returnTypeNode) || dom.type.any;

    if (ts.isFunctionDeclaration(node) || ts.isFunctionExpression(node) || ts.isArrowFunction(node)) {
      typeDom = dom.create.function(
        fnName || util.getText(node.name),
        parameterDom,
        returnTypeDom,
      );
    }
  }

  if (typeDom) {
    addJsDocToTypeDom(typeDom, node);
  }

  return typeDom;
}

export function getModNameByPath(fileName: string) {
  if (env.ambientModNames.includes(fileName)) {
    return fileName;
  }

  const extname = '.d.ts';
  fileName = util.normalizeDtsUrl(fileName);

  if (!fileName.endsWith(extname) || !fs.existsSync(fileName)) {
    return;
  }

  const dir = path.dirname(fileName);
  const basename = path.basename(fileName, extname);
  if (fileName.startsWith(nodeModulesRoot)) {
    const modRoot = fileName.startsWith(typeRoot) ? typeRoot : nodeModulesRoot;
    const pkgPath = path.resolve(dir, './package.json');
    const pkgInfo = fs.existsSync(pkgPath) ? JSON.parse(fs.readFileSync(pkgPath).toString()) : {};
    const typesUrl = util.normalizeDtsUrl(path.resolve(dir, pkgInfo.types || './index.d.ts'));
    let modName = dir.substring(modRoot.length + 1);

    if (fileName !== typesUrl) {
      modName = `${modName}/${basename}`;
    }

    return modName;
  } else {
    const from = path.relative(path.dirname(env.dist), path.join(dir, basename));
    return from.startsWith('.') ? from : `./${from}`;
  }
}

// collect import modules
function collectImportModule(
  name: string,
  exportName?: string,
  realPath?: string,
  collectEnv: Env = env,
) {
  realPath = realPath || name;
  const importObj = collectEnv.importCache[realPath] = collectEnv.importCache[realPath] || {
    default: undefined,
    list: [],
    realPath,
    from: name,
  } as ImportCacheElement;

  if (exportName && !importObj.list.includes(exportName)) {
    importObj.list.push(exportName);
  } else if (!exportName) {
    if (!importObj.default) {
      importObj.default = name
        .replace(/\/(\w)/g, (_, k: string) => k.toUpperCase())
        .replace(/\/|\./g, '');
    }

    exportName = importObj.default;
  }

  return exportName;
}

export function getTypeNodeAtLocation(node: ts.Node, flag?: ts.NodeBuilderFlags) {
  const type = env.checker.getTypeAtLocation(node);
  return env.checker.typeToTypeNode(type, undefined, flag || defaultBuildFlags);
}

export function getJSDocPlain(node: ts.Node) {
  const jsDocs = util.getJSDoc(node);
  const jsDoc = jsDocs && jsDocs[0];
  return jsDoc
    ? node.getFullText().substring(jsDoc.pos - node.pos, jsDoc.end - node.pos)
    : undefined;
}

export function getVariableDeclarationTypeDom(node: ts.VariableDeclaration) {
  const typeNode = getTypeNodeAtLocation(node.name);
  const typeDom = getTypeDom(typeNode);
  return dom.create.const(util.getText(node.name), typeDom);
}

export function createInterfaceInNs(name: string, namespace: dom.NamespaceDeclaration = env.exportNamespace) {
  const interfaceType = dom.create.interface(name);
  interfaceType.namespace = namespace;
  interfaceType.flags = dom.DeclarationFlags.Export;
  namespace.members.push(interfaceType);
  return interfaceType;
}

// prepare env
function prepareEnv(file: string, options?: CreateOptions) {
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

  const exportDefaultName = getAnonymousName();
  const checker = program.getTypeChecker();
  const sourceFile = program.getSourceFile(file)!;
  const ambientMods = checker.getAmbientModules();
  const ambientModNames = ambientMods.map(mod => mod.escapedName.toString().replace(/^"|"$/g, ''));

  // if options is undefined, use topEnv instead
  const topEnv = envStack[0];
  options = options || topEnv || {};

  // init env object
  env = {
    file,
    dist: options.dist || `${path.dirname(file)}/${path.basename(file, path.extname(file))}.d.ts`,
    flags: options.flags === undefined ? CreateDtsFlags.None : options.flags,
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
    importCache: {},
    declarationList: [],
    cacheDeclarationList: [],
    interfaceList: [],
    exportDefaultName,
    exportNsName: getAnonymousName(),
    exportInterface: undefined,
    exportNamespace: dom.create.namespace(exportDefaultName),

    // get string
    toString() {
      return [
        dom.emit(this.declaration.import),
        dom.emit(this.declaration.export),
        dom.emit(this.declaration.fragment),
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

// end env
function endEnv() {
  const response = env;

  // restore env
  env = envStack.pop()!;

  return response;
}

// create dts for file
export function create(file: string, options?: CreateOptions) {
  // check cache
  const cacheEnv = envCache[file];
  if (cacheEnv) {
    return cacheEnv;
  }

  // start program
  prepareEnv(file, options);

  const declaration = env.declaration;
  if (!env.sourceFile) {
    declaration.fragment.push(dom.create.comment('source file create fail'));
    return endEnv();
  }

  // check node
  const { exportDefaultNode, exportNodeList } = findExportNode(env.sourceFile);
  if (!exportDefaultNode && !exportNodeList.length) {
    declaration.fragment.push(dom.create.comment('cannot find export module'));
    return endEnv();
  }

  // export list
  if (exportNodeList.length) {
    env.exportInterface = createInterfaceInNs(env.exportNsName);
    exportNodeList.map(({ name, node, originalNode }) => {
      const typeNode = getTypeNodeAtLocation(node);
      const typeDom = getTypeDom(typeNode) || dom.type.any;
      const memberDom: dom.ObjectTypeMember = dom.create.property(name, typeDom);
      addJsDocToTypeDom(memberDom, originalNode);
      env.exportInterface!.members.push(memberDom);
    });
  }

  // export default
  if (exportDefaultNode) {
    const typeNode = getTypeNodeAtLocation(exportDefaultNode);
    let typeDom = getTypeDom(typeNode) || dom.type.any;

    if (env.exportInterface) {
      typeDom = dom.create.intersection([
        typeDom,
        dom.create.namedTypeReference(env.exportInterface),
      ]);
    }

    declaration.fragment.push(dom.create.const(env.exportDefaultName, typeDom));
  } else if (exportNodeList.length) {
    declaration.fragment.push(dom.create.const(
      env.exportDefaultName,
      dom.create.namedTypeReference(env.exportInterface!),
    ));
  }

  // add export=
  declaration.export.push(dom.create.exportEquals(env.exportDefaultName));

  // add export namespace
  declaration.fragment.push(env.exportNamespace);

  // add declaration list
  let i = 0;
  while (i < env.declarationList.length) {
    const declare = env.declarationList[i]!;
    if (ts.isClassLike(declare)) {
      const classDeclaration = getClassLikeTypeDom(declare);
      declaration.fragment.push(classDeclaration);
    } else if (ts.isFunctionLike(declare)) {
      const functionDeclaration = getFunctionLikeTypeDom(declare)!;
      declaration.fragment.push(functionDeclaration);
    } else if (ts.isVariableDeclaration(declare)) {
      const varDeclaration = getVariableDeclarationTypeDom(declare);
      declaration.fragment.push(varDeclaration);
    }
    i++;
  }

  // add import list
  Object.keys(env.importCache).forEach(k => {
    const obj = env.importCache[k];

    // import * as xx
    if (obj.default) {
      declaration.import.push(dom.create.importAll(obj.default, obj.from));
    }

    // import { xx } from 'xx';
    if (obj.list.length) {
      declaration.import.push(dom.create.importNamed(obj.list.map(name => ({ name })), obj.from));
    }
  });

  return endEnv();
}
