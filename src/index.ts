import ts from 'typescript';
import { UnionType } from 'typescript';
import path from 'path';
import fs from 'fs';
import * as util from './util';
import * as dom from './dom';
import { isEqual } from 'lodash';
import * as envMod from './env';
import { env } from './env';

export { dom, util };

export interface PlainObj<T = any> {
  [key: string]: T;
}

export interface CreateOptions {
  dist?: string;
  flags?: CreateDtsFlags;
}

export enum ExportFlags {
  None = 0,
  ExportEqual = 1 << 0,
  Export = 1 << 1,
}

const NODE_MODULES = 'node_modules';
const TYPE_ROOT = '@types/';
const DTS_EXT = '.d.ts';
const SyntaxKind = ts.SyntaxKind;
const nodeModulesRoot = util.formatUrl(path.resolve(process.cwd(), `./${NODE_MODULES}`));
const fromLibRE = /typescript\/lib\/lib(\.\w+)*\.d\.ts$/;

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
  return `T${env.uniqId++}`;
}

// get type dom from node
export function getTypeDom(node?: ts.Node, flags: GetTypeDomFlags = GetTypeDomFlags.None) {
  if (!node) return;

  switch (node.kind) {
    case SyntaxKind.StringKeyword:
    case SyntaxKind.StringLiteral:
      return dom.type.string;
    case SyntaxKind.NumberKeyword:
    case SyntaxKind.NumericLiteral:
      return dom.type.number;
    case SyntaxKind.LiteralType:
      return getLiteralTypeDom(node as ts.LiteralTypeNode);
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
      return getTypeQueryTypeDom(node as ts.TypeQueryNode);
    case SyntaxKind.ArrayType:
      return getArrayTypeDom(node as ts.ArrayTypeNode);
    case SyntaxKind.TypeLiteral:
      return getTypeLiteralTypeDom(node as ts.TypeLiteralNode, flags);
    case SyntaxKind.TypeReference:
      return getReferenceTypeDom(node as ts.TypeReferenceNode);
    case SyntaxKind.UnionType:
      return getUnionTypeDom(node as ts.UnionTypeNode);
    case SyntaxKind.IntersectionType:
      return getIntersectionTypeDom(node as ts.IntersectionTypeNode);
    case SyntaxKind.FunctionType:
    case SyntaxKind.ConstructorType:
      return getFunctionTypeDom(node as ts.FunctionTypeNode);
    case SyntaxKind.ImportType:
      return getImportTypeDom(node as ts.ImportTypeNode);
    case SyntaxKind.ParenthesizedType:
      return getTypeDom((node as ts.ParenthesizedTypeNode).type);
    case SyntaxKind.TypeOperator:
      return getOperatorTypeDom(node as ts.TypeOperatorNode);
    case SyntaxKind.AnyKeyword:
    case SyntaxKind.NullKeyword:
    case SyntaxKind.UndefinedKeyword:
    default:
      return dom.type.any;
  }
}

// get type dom from type
export function getTypeDomFromType(type: ts.Type) {
  if (type.flags & ts.TypeFlags.String) {
    return dom.type.string;
  } else if (type.flags & ts.TypeFlags.Number) {
    return dom.type.number;
  } else if (type.flags & ts.TypeFlags.Boolean) {
    return dom.type.boolean;
  } else if (type.flags & ts.TypeFlags.NumberLiteral) {
    return (<ts.NumberLiteralType> type).value;
  } else if (type.flags & ts.TypeFlags.StringLiteral) {
    return JSON.stringify((<ts.StringLiteralType> type).value);
  } else if (type.flags & ts.TypeFlags.Any) {
    return dom.type.any;
  } else if (type.flags & ts.TypeFlags.Null) {
    return dom.type.null;
  } else if (type.flags & ts.TypeFlags.Undefined) {
    return dom.type.undefined;
  } else if (type.flags & ts.TypeFlags.Void) {
    return dom.type.void;
  } else if (type.flags & ts.TypeFlags.Union) {
    return dom.create.union((<UnionType> type).types.map(t => getTypeDomFromType(t)));
  } else if (type.flags & ts.TypeFlags.Intersection) {
    return dom.create.intersection((<ts.IntersectionType> type).types.map(t => getTypeDomFromType(t)));
  }

  const typeNode = env.checker.typeToTypeNode(type, undefined, defaultBuildFlags);
  return getTypeDom(typeNode) || dom.type.any;
}

export function getOperatorTypeDom(node: ts.TypeOperatorNode) {
  if (node.operator === SyntaxKind.KeyOfKeyword) {
    const refer = getTypeDom(node.type);
    return refer === dom.type.any ? refer : dom.create.keyof(refer);
  }
  return dom.type.any;
}

export function getCallSignatureDeclarationTypeDom(node: ts.CallSignatureDeclaration) {
  return dom.create.callSignature(
    getFunctionParametersTypeDom(node.parameters),
    getTypeDom(node.type) || dom.type.void,
  );
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
  const referTypeDom = getReferenceTypeDomFromEntity(typeNode.exprName);
  return referTypeDom ? dom.create.typeof(referTypeDom) : dom.type.any;
}

export function getJSDocTypeLiteralTypeDom(node: ts.JSDocTypeLiteral) {
  const decl = dom.create.objectType([]);
  const tags = node.jsDocPropertyTags;
  (tags || []).forEach(tag => {
    if (tag.typeExpression) {
      const typeNode = tag.typeExpression.type;
      const propName = util.getText(tag.name);
      let propTypeDom: dom.ClassMember;
      if (ts.isJSDocTypeLiteral(typeNode)) {
        // jsdoc typedef
        propTypeDom = dom.create.property(propName, getJSDocTypeLiteralTypeDom(typeNode));
      } else {
        const type = env.checker.getTypeFromTypeNode(typeNode);
        // convert type dom by type.
        const typeDom = getTypeDomFromType(type);
        propTypeDom = dom.create.property(propName, typeDom);
      }

      if (tag.isBracketed) {
        // [xxxx]
        propTypeDom.flags! |= dom.DeclarationFlags.Optional;
      }

      addMemberToObj(decl, propTypeDom);
    }
  });
  return decl;
}

export function getTypeLiteralTypeDom(typeNode: ts.TypeLiteralNode, flags: GetTypeDomFlags = GetTypeDomFlags.None) {
  const members = typeNode.members;
  const objectType = dom.create.objectType([]);
  members.forEach(member => {
    if (!member.name) {
      if (ts.isCallSignatureDeclaration(member)) {
        const typeDom = getCallSignatureDeclarationTypeDom(member);
        addMemberToObj(objectType, typeDom, { dropDuplicate: true });
      }
      return;
    }

    const name = util.getText(member.name);
    if (checkIsPrivate(member.name, name)) {
      return;
    }

    const typeDom = getPropTypeDomByNode(name, member);
    addJsDocToTypeDom(typeDom, member.name);
    addMemberToObj(objectType, typeDom, { dropDuplicate: true });
  });

  // return plain object type if it has no member
  if (!objectType.members.length) {
    objectType.members.push(dom.create.indexSignature('key', 'string', dom.type.any));
  }

  if (flags & GetTypeDomFlags.TypeLiteralInline) {
    return objectType;
  } else {
    const interfaceDeclare = createInterfaceWithCache(objectType.members);
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
  const topEnv = envMod.getTopEnv();
  const deps = topEnv.deps[file];
  if (deps) {
    return deps;
  }

  // create new env
  const customEnv = create(file);

  // add declaration to namespace
  const namespace = dom.create.namespace(customEnv.exportDefaultName!);
  namespace.members.push(dom.create.comment(path.relative(process.cwd(), file)));
  customEnv.declaration.fragment.forEach(decl => {
    decl.flags = dom.DeclarationFlags.Export;
    (decl as dom.DeclarationBase).namespace = namespace;
    namespace.members.push(decl);
  });
  topEnv.declaration.fragment.push(namespace);

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
        exportName = createDepsByFile(filePath).namespace.name;
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

export function createClassDeclaration(node: ts.ClassLikeDeclaration, className?: string) {
  className = createNameByDecl(node, className);
  const classDeclaration = dom.create.class(className);
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
    if (ts.isConstructorDeclaration(member)) {
      // constructor
      const constructorTypeDom = dom.create.constructor(getFunctionParametersTypeDom(member.parameters));
      addJsDocToTypeDom(constructorTypeDom, member);
      if (member.body && member.body.statements.length) {
        // check statement in constructor
        findAssignToThis(member.body.statements)
          .forEach(({ name, node }) => {
            addMemberToObj(classDeclaration, getPropTypeDomByNode(name, node), { dropDuplicate: true });
          });
      }

      addMemberToObj(classDeclaration, constructorTypeDom);
      return;
    }

    // skip without property name
    if (!name) {
      return;
    }

    const typeDom = getPropTypeDomByNode(name, member);
    addJsDocToTypeDom(typeDom, member);
    addMemberToObj(classDeclaration, typeDom, { dropDuplicate: true });
  });

  return classDeclaration;
}

// find this.xxx =
export function findAssignToThis(statements: ts.NodeArray<ts.Statement>) {
  const assignList: Array<{ name: string; node?: ts.TypeNode }> = [];
  util.findAssignByName(statements, 'this', ({ key, node }) => {
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

export function addJsDocToTypeDom(typeDom: dom.DeclarationBase, originalNode: ts.Node) {
  const jsDocs = util.getJSDocs(originalNode);
  typeDom.jsDocComment = jsDocs
    ? jsDocs.map(doc => dom.create.jsDocComment(doc.getText()))
    : undefined;
}

export function eachPropertiesTypeDom<T extends ts.ClassElement | ts.ObjectLiteralElement>(
  nodeList: ts.NodeArray<T>,
  callback: (propName: string, d: T) => void,
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
    callback(propertyName, member);
  });
  return propertyNameList;
}

// get property type dom by ts.Node
export function getPropTypeDomByNode(name: string, node?: ts.Node, flags: dom.DeclarationFlags = dom.DeclarationFlags.None) {
  let typeDom: dom.ClassMember | undefined;
  // check optional
  const checkOptional = (type?: ts.Node, node?: ts.Node) => {
    if (
      (type && type.kind === SyntaxKind.UndefinedKeyword) ||
      (node && util.hasQuestionToken(node))
    ) {
      flags |= dom.DeclarationFlags.Optional;
    }
  };

  if (name === '...' || !node) {
    // ignore ...
    return dom.create.property(name, dom.type.any, flags);
  }

  if (util.modifierHas(node, SyntaxKind.StaticKeyword)) {
    flags |= dom.DeclarationFlags.Static;
  }

  if (ts.isTypeNode(node) || ts.isToken(node)) {
    checkOptional(node);
    const d = getTypeDom(node) || dom.type.any;
    if (dom.util.isFunctionType(d)) {
      typeDom = dom.create.method(name, d.parameters, d.returnType, flags);
    } else {
      typeDom = dom.create.property(name, d, flags);
    }
  } else if (ts.isMethodDeclaration(node) || ts.isMethodSignature(node)) {
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

  typeDom = typeDom || dom.create.property(name, dom.type.any, flags);
  return typeDom;
}

// get reference module by symbol
export function getReferenceModule(symbol: ts.Symbol) {
  const symbolDeclaration = util.getDeclarationBySymbol(symbol);
  if (!symbolDeclaration) return false;
  const declarationFile = symbolDeclaration.getSourceFile().fileName;
  const isFromLib = declarationFile.match(fromLibRE);
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

// get reference typeDom by name
export function getReferenceTypeDomFromEntity(node: ts.EntityName) {
  let referType: dom.ReferTypes | undefined;
  let referenceModule: ts.Declaration | false | undefined;
  const symbol = env.checker.getSymbolAtLocation(node) || util.getSymbol(node);
  if (!symbol) {
    const decl = util.tryFindDeclarationByName(node.getSourceFile(), node);
    if (!decl) return;
    referenceModule = decl;
  } else {
    referenceModule = getReferenceModule(symbol);
    if (referenceModule === false) {
      // ignore false
      return;
    }
  }

  let interfaceName = util.getText(node);
  const checkAssignEqual = (node: ts.Node, name: string) => {
    const symbol = util.getSymbol(node)!;
    if (!symbol || !symbol.exports) return false;
    const exportAssignment = symbol.exports.get(ts.InternalSymbolName.ExportEquals);
    return exportAssignment &&
      util.getText((exportAssignment.valueDeclaration as ts.ExportAssignment).expression) === name;
  };

  if (referenceModule) {
    if (util.isDeclareModule(referenceModule)) {
      // import from ambient modules
      referType = dom.ReferTypes.ambient;
      const modName = util.getText(referenceModule.name);
      interfaceName = collectImportModule(modName, checkAssignEqual(referenceModule, interfaceName) ? undefined : interfaceName);
    } else if (ts.isSourceFile(referenceModule)) {
      // import from other jsFile
      referType = dom.ReferTypes.custom;
      const modName = getModNameByPath(referenceModule.fileName);
      if (modName) {
        interfaceName = collectImportModule(
          modName,
          checkAssignEqual(referenceModule, interfaceName) ? undefined : interfaceName,
          referenceModule.fileName,
        );
      } else {
        return;
      }
    } else {
      // declaration
      referType = dom.ReferTypes.declaration;
      const cache = env.declareCache.find(({ node }) => node === referenceModule);
      if (!cache) {
        interfaceName = getDeclName(interfaceName);
        env.declareCache.push({ node: referenceModule, name: interfaceName });
        const decl = createDeclarationTypeDom(interfaceName, referenceModule);
        if (decl) env.declaration.fragment.push(decl);
      } else {
        interfaceName = cache.name;
      }
    }
  } else {
    referType = dom.ReferTypes.lib;
  }

  return dom.create.namedTypeReference(interfaceName, referType);
}

export function createDeclarationTypeDom(name: string, node: ts.Declaration) {
  let decl: dom.NamespaceMember | undefined;
  if (ts.isClassLike(node)) {
    decl = createClassDeclaration(node, name);
  } else if (ts.isFunctionLike(node)) {
    decl = createFunctionDeclaration(node, name);
  } else if (ts.isVariableDeclaration(node)) {
    decl = createVariableDeclaration(node, name);
  } else if (ts.isPropertyAccessExpression(node)) {
    decl = createDeclByPropertyAccess(node, name);
  } else if (ts.isJSDocTypedefTag(node)) {
    decl = createDeclByTypedefTag(node, name);
  } else {
    return;
  }
  return decl;
}

export function createDeclByPropertyAccess(node: ts.PropertyAccessExpression, name?: string) {
  name = createNameByDecl(node, name);
  return dom.create.const(name, getPropertyAccessTypeDom(node));
}

export function createNameByDecl(decl: ts.NamedDeclaration, name?: string) {
  return name || (decl.name ? getDeclName(util.getText(decl.name)) : getAnonymousName());
}

export function createDeclByTypedefTag(node: ts.JSDocTypedefTag, name?: string) {
  if (!node.typeExpression) {
    return;
  }

  name = createNameByDecl(node, name);

  // env.checker.getExportSymbolOfSymbol()
  if (ts.isJSDocTypeLiteral(node.typeExpression)) {
    const { members } = getJSDocTypeLiteralTypeDom(node.typeExpression);
    createInterfaceWithCache(members, name);
    return;
  } else {
    return dom.create.alias(name, getTypeDom(node.typeExpression.type));
  }
}

export function getPropertyAccessTypeDom(node: ts.PropertyAccessExpression) {
  const symbol = env.checker.getSymbolAtLocation(node.name);
  if (symbol && symbol.exports) {
    const members: dom.ObjectTypeMember[] = [];
    symbol.exports.forEach(obj => {
      const declaration = util.getDeclarationBySymbol(obj);
      members.push(dom.create.property(
        obj.getName(),
        getTypeDom(declaration && getTypeNodeAtLocation(declaration)) || dom.type.any,
      ));
    });
    return createInterfaceWithCache(members);
  } else {
    const typeNode = getTypeNodeAtLocation((node.parent as ts.BinaryExpression).right);
    return getTypeDom(typeNode) || dom.type.any;
  }
}

export function getReferenceTypeDom(typeNode: ts.TypeReferenceNode) {
  const ref = getReferenceTypeDomFromEntity(typeNode.typeName);
  if (!ref) return dom.type.any;

  // generic
  const typeArguments = util.getTypeArguments(typeNode);
  if (typeArguments && typeArguments.length) {
    ref.typeParameters = typeArguments.map(type => getTypeDom(type) || dom.type.any);
  }

  return transformBuildInRefer(ref) || ref;
}

export function transformBuildInRefer(ref: dom.NamedTypeReference) {
  if (ref.referType !== dom.ReferTypes.lib) {
    return;
  }

  // build-in interface
  switch (ref.name) {
    case 'String':
      return dom.type.string;
    case 'Number':
      return dom.type.number;
    case 'Boolean':
      return dom.type.boolean;
    case 'Function':
      return dom.create.functionType([
        dom.create.parameter(
          'args',
          dom.type.array(dom.type.any),
          dom.ParameterFlags.Rest,
        ),
      ], dom.type.any);
    case 'Array':
      return dom.type.array(ref.typeParameters[0] || dom.type.any);
    default:
      break;
  }
}

export function getArrayTypeDom(typeNode: ts.ArrayTypeNode) {
  return dom.create.array(getTypeDom(typeNode.elementType));
}

export function getFunctionParametersTypeDom(parameters: ts.NodeArray<ts.ParameterDeclaration>) {
  const nameCache: PlainObj<number> = {};
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

    // prevent duplicate
    let name = util.getText(param.name) || getAnonymousName();
    if (nameCache[name] === undefined) {
      nameCache[name] = 0;
    } else {
      nameCache[name]++;
      name = `${name}_${nameCache[name]}`;
    }

    return dom.create.parameter(
      name,
      getTypeDom(type) || dom.type.any,
      flags,
    );
  });

  return params;
}

// check whether has @private tag in jsDoc or variable name start with _
export function checkIsPrivate(obj: ts.Node, name?: string) {
  if (env.flags & CreateDtsFlags.IgnorePrivate) {
    return true;
  }

  return !!util.findJsDocTag(obj, 'private') ||
    (name && name.startsWith('_'));
}

// add member to obj
export function addMemberToObj(
  obj: dom.ClassDeclaration | dom.InterfaceDeclaration | dom.ObjectType,
  member: dom.ClassMember | dom.ObjectTypeMember,
  opt: { preInsert?: boolean; dropDuplicate?: boolean; } = {},
) {
  const declaration = obj as dom.ClassDeclaration;
  if ((member as dom.PropertyDeclaration).name) {
    const index = declaration.members.findIndex(m => {
      return (m as dom.PropertyDeclaration).name === (member as dom.PropertyDeclaration).name;
    });

    if (index >= 0) {
      if (opt.dropDuplicate) {
        return;
      }

      obj.members.splice(index, 1);
    }
  }

  if (opt.preInsert) {
    declaration.members.unshift(member as dom.ClassMember);
  } else {
    declaration.members.push(member as dom.ClassMember);
  }
}

// try to find definition of function prototype
export function tryCreateFunctionAsClass(fnName: string, node: ts.FunctionDeclaration) {
  const block = node.parent;

  // try to find @constructor in jsDoc comment
  const isConstructor = util.findJsDocTag(node, 'constructor');
  let isPrototypeClass = !!isConstructor;

  // find prototype assignment
  if (ts.isBlock(block) || ts.isSourceFile(block)) {
    const classDeclare = dom.create.class(fnName);
    const originalName = util.getText(node.name);
    const prototypeExpression = `${originalName}.prototype`;
    util.findAssignByName(block.statements, [ prototypeExpression, originalName ], ({ name, key, value, node }) => {
      const propName = util.getText(key);
      const keyIsPrototype = propName === 'prototype';
      const isStaticProp = name === originalName && !keyIsPrototype;
      const isPrototypeAssignment = name === originalName && keyIsPrototype;
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
          typeDom.members.forEach(member => addMemberToObj(classDeclare, member));
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
        addMemberToObj(classDeclare, typeDom);
      }
    });

    if (isPrototypeClass) {
      if (node.body && node.body.statements.length) {
        // find this assignment in constructor
        findAssignToThis(node.body.statements).forEach(({ name, node }) => {
          addMemberToObj(classDeclare, getPropTypeDomByNode(name, node));
        });
      }

      // treat function as constructor
      addMemberToObj(classDeclare, dom.create.constructor(getFunctionParametersTypeDom(node.parameters)), {
        preInsert: true,
      });

      return classDeclare;
    }
  }
}

export function createFunctionDeclaration(node: ts.FunctionLike, fnName?: string) {
  let typeDom;

  fnName = createNameByDecl(node, fnName);

  if (ts.isFunctionDeclaration(node)) {
    typeDom = tryCreateFunctionAsClass(fnName, node);
  }

  if (!typeDom) {
    const signature = env.checker.getSignatureFromDeclaration(node)!;
    const returnType = env.checker.getReturnTypeOfSignature(signature);
    const returnTypeNode = env.checker.typeToTypeNode(returnType, undefined, defaultBuildFlags);
    typeDom = dom.create.function(
      fnName,
      getFunctionParametersTypeDom(node.parameters),
      getTypeDom(returnTypeNode) || dom.type.any,
    );
  }

  addJsDocToTypeDom(typeDom, node);
  return typeDom;
}

// try get package info by file url
function tryGetPackageInfo(fileUrl: string) {
  let pkgPath;
  let currentDir = path.dirname(fileUrl);
  while (!fs.existsSync(pkgPath = path.resolve(currentDir, './package.json'))) {
    currentDir = path.dirname(currentDir);
    if (currentDir === '/' || currentDir.endsWith(NODE_MODULES)) {
      pkgPath = null;
      break;
    }
  }

  if (pkgPath) {
    const pkgInfo = JSON.parse(fs.readFileSync(pkgPath).toString());
    return {
      dir: currentDir,
      pkgInfo,
    };
  }

  return;
}

export function getModNameByPath(fileName: string) {
  if (env.ambientModNames.includes(fileName)) {
    return fileName;
  }

  fileName = util.normalizeDtsUrl(fileName);

  if (!fileName.endsWith(DTS_EXT) || !fs.existsSync(fileName)) {
    return;
  }

  const result = tryGetPackageInfo(fileName)! || {};
  const basename = path.basename(fileName, DTS_EXT);
  if (fileName.startsWith(nodeModulesRoot)) {
    if (!result.pkgInfo || !result.pkgInfo.name) return;

    const name = result.pkgInfo.name;
    const modName = name.startsWith(TYPE_ROOT) ? name.substring(TYPE_ROOT.length) : name;
    const modPath = fileName.substring(result.dir.length + 1);
    if (
      (result.pkgInfo.main && path.basename(result.pkgInfo.main, '.js') === path.basename(modPath, '.d.ts')) ||
      (!result.pkgInfo.main && modPath === 'index.d.ts') ||
      result.pkgInfo.types === modPath
    ) {
      return modName;
    }

    return `${modName}/${modPath.substring(0, modPath.length - DTS_EXT.length)}`;
  } else {
    const dir = path.dirname(fileName);
    const from = util.formatUrl(path.relative(path.dirname(env.dist), path.join(dir, basename)));
    return from.startsWith('.') ? from : `./${from}`;
  }
}

// collect import modules
function collectImportModule(
  name: string,
  exportName?: string,
  realPath?: string,
) {
  realPath = realPath || name;
  const importObj = env.importCache[realPath] = env.importCache[realPath] || {
    default: undefined,
    list: [],
    realPath,
    from: name,
  } as envMod.ImportCacheElement;

  if (exportName) {
    let existImportObj = importObj.list.find(({ name }) => name === exportName);
    if (!existImportObj) {
      existImportObj = { name: exportName, as: getDeclName(exportName) };
      importObj.list.push(existImportObj);
    }
    return existImportObj.as!;
  } else {
    if (!importObj.default) {
      importObj.default = getDeclName(util.formatName(name));
    }

    return importObj.default!;
  }
}

export function getTypeNodeAtLocation(node: ts.Node, flag?: ts.NodeBuilderFlags) {
  const type = env.checker.getTypeAtLocation(node);
  return env.checker.typeToTypeNode(type, undefined, flag || defaultBuildFlags);
}

export function createVariableDeclaration(node: ts.VariableDeclaration, name?: string) {
  name = createNameByDecl(node, name);
  const typeNode = getTypeNodeAtLocation(node.name);
  const typeDom = getTypeDom(typeNode);
  return dom.create.const(name, typeDom);
}

// get decl name
export function getDeclName(name: string): string {
  if (env.publicNames[name] === undefined) {
    env.publicNames[name] = 0;
    return name;
  } else {
    env.publicNames[name]++;
    return getDeclName(`${name}_${env.publicNames[name]}`);
  }
}

export function createInterfaceWithCache(members: dom.ObjectTypeMember[], name?: string) {
  const interfaceDeclare = env.interfaceList.find(obj => isEqual(obj.members, members));
  if (interfaceDeclare) {
    return interfaceDeclare;
  }
  const nsi = createExportInterface(name || getAnonymousName());
  nsi.members = members;
  env.interfaceList.push(nsi);
  return nsi;
}

export function createExportInterface(name: string) {
  const interfaceType = dom.create.interface(name);
  if (env.exportFlags & ExportFlags.ExportEqual) {
    interfaceType.namespace = env.exportNamespace;
    env.exportNamespace!.members.push(interfaceType);
  } else {
    env.declaration.fragment.push(interfaceType);
  }
  interfaceType.flags = dom.DeclarationFlags.Export;
  return interfaceType;
}

export function createExportNameByFile(file: string) {
  let name = path.basename(file, path.extname(file));
  const pkgInfoPath = path.resolve(path.dirname(file), 'package.json');
  if (fs.existsSync(pkgInfoPath)) {
    const pkgInfo = JSON.parse(fs.readFileSync(pkgInfoPath).toString());
    name = pkgInfo.name || name;
  }

  if (name === 'index') {
    name = path.basename(path.dirname(file));
  }

  // add _ for prevent duplicate with global declaration
  return getDeclName(`_${util.formatName(name, true)}`);
}

// create dts for file
export function create(file: string, options?: CreateOptions) {
  // check cache
  const cacheEnv = envMod.getEnv(file);
  if (cacheEnv) {
    return cacheEnv;
  }

  // start program
  envMod.createEnv(file, options);

  const declaration = env.declaration;
  if (!env.sourceFile) {
    declaration.fragment.push(dom.create.comment('source file create fail'));
    return envMod.popEnv();
  }

  // check node
  const { exportEqual, exportList } = util.findExports(env.sourceFile);
  if (!exportEqual && !exportList.size) {
    declaration.fragment.push(dom.create.comment('cannot find export module'));
    return envMod.popEnv();
  }

  env.exportFlags = exportEqual
    ? ExportFlags.ExportEqual
    : ExportFlags.Export;

  let exportInterface: dom.InterfaceDeclaration | undefined;
  env.exportDefaultName = createExportNameByFile(env.file);
  env.exportNamespace = dom.create.namespace(env.exportDefaultName);

  // export list
  if (exportList.size) {
    // add export name to publicNames
    if (!exportEqual) {
      exportList.forEach((_, name) => getDeclName(name));
    }

    exportList.forEach(({ node, originalNode }, name) => {
      if (checkIsPrivate(node, name)) {
        return;
      }

      const typeNode = getTypeNodeAtLocation(node);
      let typeDom = getTypeDom(typeNode) || dom.type.any;
      if (env.exportFlags & ExportFlags.Export) {
        if (name === 'default') {
          const name = getDeclName(dom.util.isNamedDeclarationBase(typeDom)
            ? typeDom.name
            : util.getText(node) || getAnonymousName());

          typeDom = dom.util.typeToDeclaration(name, typeDom);
          if (dom.util.isCanBeExportDefault(typeDom)) {
            typeDom.flags = dom.DeclarationFlags.ExportDefault;
          } else {
            if (dom.util.isConstDeclaration(typeDom)) {
              // make export default simplify
              const name = dom.util.isTypeofReference(typeDom.type)
                ? typeDom.type.type.name
                : (
                  dom.util.isNamedTypeReference(typeDom.type)
                    ? typeDom.type.name
                    : undefined
                );

              const tds = name ? env.declaration.fragment.filter(member => (
                dom.util.isNamedDeclarationBase(member) && name === member.name
              )) : undefined;

              if (tds && tds.length === 1 && dom.util.isCanBeExportDefault(tds[0])) {
                tds[0].flags! |= dom.DeclarationFlags.ExportDefault;
                return;
              }
            }

            env.declaration.export.push(dom.create.exportDefault(name));
          }
        } else {
          typeDom = dom.util.typeToDeclaration(name, typeDom, dom.DeclarationFlags.Export);
        }
        addJsDocToTypeDom(typeDom, originalNode);
        env.declaration.fragment.push(typeDom);
      } else {
        if (!exportInterface) {
          exportInterface = dom.create.interface(getAnonymousName());
          env.declaration.fragment.push(exportInterface);
        }

        const memberDom: dom.ObjectTypeMember = dom.create.property(name, typeDom);
        addJsDocToTypeDom(memberDom, originalNode);
        exportInterface.members.push(memberDom);
      }
    });
  }

  // export default
  if (exportEqual) {
    const typeNode = getTypeNodeAtLocation(exportEqual.node);
    let typeDom = getTypeDom(typeNode) || dom.type.any;
    typeDom = exportInterface ? dom.create.intersection([ typeDom, exportInterface ]) : typeDom;
    typeDom = dom.create.const(env.exportDefaultName, typeDom);
    declaration.fragment.push(typeDom);

    // add export=
    declaration.export.push(dom.create.exportEquals(env.exportDefaultName));
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
      declaration.import.push(dom.create.importNamed(obj.list, obj.from));
    }
  });

  // add export namespace
  if (env.exportNamespace && env.exportNamespace.members.length) {
    declaration.fragment.push(env.exportNamespace);
  }

  return envMod.popEnv();
}
