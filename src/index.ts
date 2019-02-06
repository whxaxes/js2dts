import ts from 'typescript';
import path from 'path';
import fs from 'fs';
import * as dom from './dom';
import { isEqual } from 'lodash';
let uniqId = 0;
let checker: ts.TypeChecker;
let sourceFile: ts.SourceFile | undefined;
let fragments: dom.TopLevelDeclaration[] = [];
let importMap: { [key: string]: { default?: string, list: string[] } } = {};
let declarationList: ts.Node[] = [];
const cacheDeclarationList: ts.Node[] = [];
const interfaceList: dom.InterfaceDeclaration[] = [];
const SyntaxKind = ts.SyntaxKind;
const nodeModulesRoot = path.resolve(process.cwd(), './node_modules');
const typeRoot = path.resolve(nodeModulesRoot, './@types/');

// no need to wrap jsdoc with comments
dom.config.wrapJsDocComments = false;

// default build flags
const defaultBuildFlags = ts.NodeBuilderFlags.AllowNodeModulesRelativePaths
 | ts.NodeBuilderFlags.GenerateNamesForShadowedTypeParams
 | ts.NodeBuilderFlags.NoTruncation
 | ts.NodeBuilderFlags.UseTypeOfFunction;

interface ExportListObj {
  name: string;
  node: ts.Node;
  originalNode: ts.Node;
}

// get name for anonymous type
export function getAnonymousName() {
  return `T${uniqId++}`;
}

// each ast node
export function eachSourceFile(node: ts.Node, cb: (n: ts.Node) => any) {
  if (!ts.isSourceFile(node)) {
    const result = cb(node);
    if (result === false) {
      return;
    }
  }

  node.forEachChild((sub: ts.Node) => {
    eachSourceFile(sub, cb);
  });
}

// check kind in node.modifiers.
export function modifierHas(node: ts.Node, kind) {
  return node.modifiers && node.modifiers.find(mod => kind === mod.kind);
}

// find export node from sourcefile.
export function findExportNode(sourceFile: ts.SourceFile) {
  const exportNodeList: ExportListObj[] = [];
  let exportDefaultNode: ts.Node | undefined;

  eachSourceFile(sourceFile, node => {
    if (node.parent !== sourceFile) {
      return;
    }

    // each node in root scope
    if (
      ts.isExpressionStatement(node) &&
      ts.isBinaryExpression(node.expression) &&
      ts.isPropertyAccessExpression(node.expression.left)
    ) {
      const obj = node.expression.left.expression;
      const prop = node.expression.left.name;
      const addExportNode = () => {
        const name = getText(prop);
        const index = exportNodeList.findIndex(n => n.name === name);
        if (index >= 0) {
          // remove duplicate node
          exportNodeList.splice(index, 1);
        }

        exportNodeList.push({
          name: getText(prop),
          node: (node.expression as ts.BinaryExpression).right,
          originalNode: node,
        });
      };

      if (ts.isIdentifier(obj)) {
        if (getText(obj) === 'exports') {
          // exports.xxx = {}
          addExportNode();
        } else if (getText(obj) === 'module' && getText(prop) === 'exports') {
          // module.exports = {}
          exportDefaultNode = node.expression.right;
        }
      } else if (
        ts.isPropertyAccessExpression(obj) &&
        getText(obj.expression) === 'module' && getText(obj.name) === 'exports' &&
        ts.isIdentifier(prop)
      ) {
        // module.exports.xxx = {}
        addExportNode();
      }
    }
  });

  return {
    exportDefaultNode,
    exportNodeList,
  };
}

export function getText(node?: ts.Node) {
  return node && ts.isIdentifier(node) ? node.text : '';
}

export function getFunctionName(fn: ts.FunctionLike) {
  return getText(fn.name);
}

export function isFunctionTypeDom(fn: dom.Type): fn is dom.FunctionType {
  const fm = fn as dom.FunctionType;
  return fm.kind === 'function-type';
}

// get type dom from typeNode
export function getTypeDom(typeNode?: ts.TypeNode) {
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
      return dom.type.boolean;
    case SyntaxKind.TrueKeyword:
      return dom.type.true;
    case SyntaxKind.FalseKeyword:
      return dom.type.false;
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
      return getTypeLiteralTypeDom(typeNode as ts.TypeLiteralNode);
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
  const literal = typeNode.literal;
  return getTypeDom(literal as ts.TypeNode);
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

export function getSymbol(node: ts.Node): ts.Symbol | undefined {
  return (node as any).symbol;
}

export function getJSDoc(node: ts.Node): ts.JSDoc[] | undefined {
  return (node as any).jsDoc;
}

export function getTypeLiteralTypeDom(typeNode: ts.TypeLiteralNode) {
  const members = typeNode.members;
  const interfaceMembers: dom.ObjectTypeMember[] = [];
  members.forEach(member => {
    if (!member.name) return;
    const name = getText(member.name);
    const { typeDom } = getPropertyTypeDom(name, member);
    if (typeDom) {
      addJsDocToTypeDom(typeDom, member.name);
      interfaceMembers.push(typeDom as dom.ObjectTypeMember);
    }
  });

  let interfaceName: string | undefined;
  const existInterface = interfaceList.find(obj => isEqual(obj.members, interfaceMembers));
  if (!existInterface) {
    interfaceName = getAnonymousName();
    const interfaceDeclare = dom.create.interface(interfaceName);
    interfaceDeclare.members = interfaceMembers;
    fragments.push(interfaceDeclare);
    interfaceList.push(interfaceDeclare);
  } else {
    interfaceName = existInterface.name;
  }

  return dom.create.namedTypeReference(interfaceName);
}

export function getIntersectionTypeDom(typeNode: ts.IntersectionTypeNode) {
  return dom.create.intersection(typeNode.types.map(node => getTypeDom(node)));
}

export function getUnionTypeDom(typeNode: ts.UnionTypeNode) {
  return dom.create.union(typeNode.types.map(node => getTypeDom(node)));
}

export function getReferenceModule(symbol: ts.Symbol) {
  if (!symbol || !symbol.valueDeclaration) return;
  const valueDeclaration = symbol.valueDeclaration;
  const declarationFile = valueDeclaration.getSourceFile().fileName;
  const isFromLib = declarationFile.startsWith(path.dirname(require.resolve('typescript')));
  const isFromNodeModule = declarationFile.startsWith(nodeModulesRoot);
  if (isFromLib) {
    // build-in module
    return;
  } else if (declarationFile === sourceFile!.fileName) {
    // current module
    return valueDeclaration;
  } else if (!isFromNodeModule) {
    // custom module
    return valueDeclaration;
  }

  const modules = checker.getAmbientModules();
  const names = modules.map(mod => mod.escapedName.toString().replace(/^"|"$/g, ''));

  let index;
  let declaration: ts.Node = valueDeclaration;
  while (declaration && !ts.isSourceFile(declaration)) {
    const name = (declaration as any).name;
    if (name && ts.isStringLiteral(name)) {
      index = names.indexOf(name.text);
      if (index >= 0) break;
    }

    declaration = declaration.parent;
  }

  if (index >= 0) {
    return names[index];
  }

  return valueDeclaration.getSourceFile();
}

export function getImportTypeDom(typeNode: ts.ImportTypeNode) {
  if (SyntaxKind.LiteralType === typeNode.argument.kind) {
    const args = typeNode.argument as ts.LiteralTypeNode;
    if (ts.isStringLiteral(args.literal)) {
      const modName = getModNameByPath(args.literal.text);
      const exportName = collectModuleName(modName);
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

  const signature = checker.getSignatureFromDeclaration(declaration);
  if (!signature) {
    return;
  }

  const type = checker.getReturnTypeOfSignature(signature!);
  return checker.typeToTypeNode(type, undefined, defaultBuildFlags);
}

export function getClassLikeTypeDom(node: ts.ClassLikeDeclaration) {
  const classDeclaration = dom.create.class(getText(node.name));
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
        member.body.statements.forEach(statement => {
          if (
            ts.isExpressionStatement(statement) &&
            ts.isBinaryExpression(statement.expression) &&
            ts.isPropertyAccessExpression(statement.expression.left) &&
            statement.expression.left.expression.kind === SyntaxKind.ThisKeyword &&
            ts.isIdentifier(statement.expression.left.name)
          ) {
            const property = statement.expression.left.name;
            const typeNode = getTypeNodeAtLocation(property);
            addProp(dom.create.property(getText(property), getTypeDom(typeNode) || dom.type.any));
          }
        });
      }

      addProp(constructorTypeDom);
      return;
    }

    // skip without property name
    if (!name) {
      return;
    }

    const { typeDom } = getPropertyTypeDom(name, member);
    if (!typeDom) {
      return;
    }

    addJsDocToTypeDom(typeDom, member);
    addProp(typeDom);
  });

  return classDeclaration;
}

export function addJsDocToTypeDom(typeDom: dom.DeclarationBase, originalNode: ts.Node) {
  let jsDoc = getJSDocPlain(originalNode);
  if (!jsDoc) {
    const symbol = getSymbol(originalNode);
    if (symbol && symbol.valueDeclaration) {
      jsDoc = getJSDocPlain(symbol.valueDeclaration);
    }
  }
  typeDom.jsDocComment = jsDoc;
}

export function eachPropertiesTypeDom<T extends ts.ClassElement | ts.ObjectLiteralElement>(
  nodeList: ts.NodeArray<T>,
  callback: (propName: string, d: T, propList: string[]) => void,
) {
  const propertyNameList: string[] = [];
  nodeList.forEach(member => {
    const propertyName = getText(member.name);
    if (propertyNameList.includes(propertyName)) {
      return;
    }

    propertyNameList.push(propertyName);

    callback(propertyName, member, propertyNameList);
  });
}

export function getPropertyTypeDom(name: string, node: ts.Node) {
  let flag;
  if (modifierHas(node, SyntaxKind.StaticKeyword)) {
    flag = dom.DeclarationFlags.Static;
  }

  // check optional
  const checkOptional = (type?: ts.TypeNode) => {
    if (type && type.kind === SyntaxKind.UndefinedKeyword) {
      flag |= dom.DeclarationFlags.Optional;
    }
  };

  let typeDom: dom.ClassMember | undefined;
  if (name !== '...') {
    if (ts.isMethodDeclaration(node) || ts.isMethodSignature(node)) {
      // method property
      const typeNode = getReturnTypeFromDeclaration(node);
      typeDom = dom.create.method(
        name,
        getFunctionParametersTypeDom(node.parameters),
        typeNode ? getTypeDom(typeNode) : dom.type.any,
        flag,
      );
    } else if (ts.isGetAccessorDeclaration(node) || ts.isGetAccessor(node)) {
      // getter
      const typeNode = getTypeNodeAtLocation(node);
      checkOptional(typeNode);
      typeDom = dom.create.property(name, getTypeDom(typeNode), flag);
    } else if (ts.isPropertyDeclaration(node) || ts.isPropertySignature(node)) {
      // property declaration
      checkOptional(node.type);
      typeDom = dom.create.property(name, getTypeDom(node.type), flag);
    }
  }

  return {
    typeDom,
    flag,
  };
}

export function getReferenceTypeDomFromEntity(node: ts.EntityName) {
  let interfaceName = getText(node);
  const symbol = getSymbol(node);
  if (!symbol) return;

  const referenceModule = getReferenceModule(symbol);
  if (referenceModule) {
    if (typeof referenceModule === 'string') {
      collectModuleName(referenceModule, interfaceName);
    } else if (ts.isSourceFile(referenceModule)) {
      const modName = getModNameByPath(referenceModule.fileName);
      collectModuleName(modName, interfaceName);
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
  const typeArguments: ts.TypeNode[] = (typeNode as any).typeArguments;
  if (typeArguments && typeArguments.length) {
    ref.typeParameters = typeArguments.map(type => getTypeDom(type) || dom.type.any);
  }
  return ref;
}

export function getArrayTypeDom(typeNode: ts.ArrayTypeNode) {
  return dom.create.array(getTypeDom(typeNode.elementType));
}

export function addDeclarations(node: ts.Declaration) {
  if (!cacheDeclarationList.includes(node)) {
    cacheDeclarationList.push(node);
    declarationList.push(node);
  }
}

export function getFunctionParametersTypeDom(parameters: ts.NodeArray<ts.ParameterDeclaration>) {
  const params: dom.Parameter[] = parameters.map(param => {
    let type = param.type;
    if (!type) {
      type = getTypeNodeAtLocation(param);
    }

    return dom.create.parameter(
      getText(param.name),
      getTypeDom(type) || dom.type.any,
      param.initializer ? dom.ParameterFlags.Optional : undefined,
    );
  });

  return params;
}

export function getFunctionLikeTypeDom(node: ts.FunctionLike, fnName?: string) {
  const signature = checker.getSignatureFromDeclaration(node)!;
  const returnType = checker.getReturnTypeOfSignature(signature);
  const returnTypeNode = checker.typeToTypeNode(returnType, undefined, defaultBuildFlags);
  const parameterDom = getFunctionParametersTypeDom(node.parameters);
  const returnTypeDom = getTypeDom(returnTypeNode) || dom.type.any;
  let typeDom;
  if (ts.isFunctionDeclaration(node) || ts.isFunctionExpression(node) || ts.isArrowFunction(node)) {
    typeDom = dom.create.function(
      fnName || getText(node.name),
      parameterDom,
      returnTypeDom,
    );
  }

  if (typeDom) {
    addJsDocToTypeDom(typeDom, node);
  }

  return typeDom;
}

// get base name
export function getBaseName(fileName: string) {
  const exts = [ '.d.ts', '.ts', '.js' ];
  for (const ext of exts) {
    if (fileName.endsWith(ext)) {
      return path.basename(fileName, ext);
    }
  }
  return path.basename(fileName);
}

export function getModNameByPath(fileName: string) {
  const extname = path.extname(fileName);
  fileName = extname ? fileName : `${fileName}.d.ts`;
  const dir = path.dirname(fileName);
  const basename = getBaseName(fileName);

  if (fileName.startsWith(nodeModulesRoot)) {
    const modRoot = fileName.startsWith(typeRoot) ? typeRoot : nodeModulesRoot;
    const pkgPath = path.resolve(dir, './package.json');
    const pkgInfo = fs.existsSync(pkgPath) ? JSON.parse(fs.readFileSync(pkgPath).toString()) : {};
    let modName = dir.substring(modRoot.length + 1);

    if (fileName !== path.resolve(dir, pkgInfo.types || './index.d.ts')) {
      modName = `${modName}/${basename}`;
    }

    return modName;
  } else {
    const sourceFileDir = path.dirname(sourceFile!.fileName);
    return path.relative(sourceFileDir, fileName);
  }
}

// collect import modules
function collectModuleName(name: string, exportName?: string) {
  const exportObj = importMap[name] = importMap[name] || { default: undefined, list: [] };
  if (exportName && !exportObj.list.includes(exportName)) {
    exportObj.list.push(exportName);
  } else if (!exportName) {
    if (!exportObj.default) {
      exportObj.default = name;
    }

    exportName = exportObj.default;
  }
  return exportName;
}

export function getTypeNodeAtLocation(node: ts.Node, flag?: ts.NodeBuilderFlags) {
  const type = checker.getTypeAtLocation(node);
  return checker.typeToTypeNode(type, undefined, flag || defaultBuildFlags);
}

export function getJSDocPlain(node: ts.Node) {
  const jsDocs = getJSDoc(node);
  const jsDoc = jsDocs && jsDocs[0];
  return jsDoc
    ? node.getFullText().substring(jsDoc.pos - node.pos, jsDoc.end - node.pos)
    : undefined;
}

export function getVariableDeclarationTypeDom(node: ts.VariableDeclaration) {
  const typeNode = getTypeNodeAtLocation(node.name);
  const typeDom = getTypeDom(typeNode);
  return dom.create.const(getText(node.name), typeDom);
}

// reset variable
export function reset() {
  uniqId = 100;
  fragments = [];
  importMap = {};
  declarationList = [];
  cacheDeclarationList.length = 0;
  interfaceList.length = 0;
}

// create dts for file
export function create(file: string) {
  const program = ts.createProgram([ file ], {
    target: ts.ScriptTarget.ES2017,
    module: ts.ModuleKind.CommonJS,
    allowJs: true,
    noErrorTruncation: true,
  });

  // cache checker and sourceFile
  checker = program.getTypeChecker();
  sourceFile = program.getSourceFile(file);
  if (!sourceFile) {
    return;
  }

  // reset variable
  reset();

  // check node
  const { exportDefaultNode, exportNodeList } = findExportNode(sourceFile);
  let exportDefaultName: string | undefined;
  let exportNsName: string | undefined;

  // export default
  if (exportDefaultNode) {
    exportDefaultName = getAnonymousName();
    const typeNode = getTypeNodeAtLocation(exportDefaultNode);
    let typeDom = getTypeDom(typeNode) || dom.type.any;

    if (exportNodeList.length) {
      exportNsName = getAnonymousName();
      typeDom = dom.create.intersection([
        typeDom,
        dom.create.namedTypeReference(exportNsName),
      ]);
    }

    fragments.push(dom.create.const(exportDefaultName, typeDom));
  }

  // export list
  if (exportNodeList.length) {
    exportNsName = exportNsName || getAnonymousName();
    const ns = dom.create.interface(exportNsName);
    exportNodeList.map(({ name, node, originalNode }) => {
      const typeNode = getTypeNodeAtLocation(node);
      const typeDom = getTypeDom(typeNode) || dom.type.any;
      const memberDom: dom.ObjectTypeMember = dom.create.property(name, typeDom);
      addJsDocToTypeDom(memberDom, originalNode);
      ns.members.push(memberDom);
    });
    fragments.push(ns);

    if (!exportDefaultName) {
      exportDefaultName = getAnonymousName();
      fragments.push(dom.create.const(
        exportDefaultName,
        dom.create.namedTypeReference(exportNsName),
      ));
    }
  }

  // declaration list
  while (declarationList.length) {
    const declaration = declarationList.pop()!;
    if (ts.isClassLike(declaration)) {
      const classDeclaration = getClassLikeTypeDom(declaration);
      fragments.push(classDeclaration);
    } else if (ts.isFunctionLike(declaration)) {
      const functionDeclaration = getFunctionLikeTypeDom(declaration)!;
      fragments.push(functionDeclaration);
    } else if (ts.isVariableDeclaration(declaration)) {
      const varDeclaration = getVariableDeclarationTypeDom(declaration);
      fragments.push(varDeclaration);
    }
  }

  // import list
  Object.keys(importMap).forEach(k => {
    const obj = importMap[k];

    // import { xx } from 'xx';
    if (obj.list.length) {
      fragments.unshift(dom.create.importNamed(obj.list.map(name => ({ name })), k));
    }

    // import * as xx
    if (obj.default) {
      fragments.unshift(dom.create.importAll(obj.default, k));
    }
  });

  // export =
  if (exportDefaultName) {
    fragments.push(dom.create.exportEquals(exportDefaultName));
  }

  return {
    fragments,

    toString() {
      return this.fragments.map(dts => dom.emit(dts)).join('');
    },
  };
}
