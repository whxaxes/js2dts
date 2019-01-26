import ts from 'typescript';
import path from 'path';
import fs from 'fs';
import * as dom from './dom';
let checker: ts.TypeChecker;
let sourceFile: ts.SourceFile | undefined;
const declarationList: ts.Node[] = [];
const declarationDts: dom.TopLevelDeclaration[] = [];
const importMap: { [key: string]: { default?: string, list: string[] } } = {};
const SyntaxKind = ts.SyntaxKind;
const nodeModulesRoot = path.resolve(process.cwd(), './node_modules');
const typeRoot = path.resolve(nodeModulesRoot, './@types/');

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
  const exportNodeList: ts.Node[] = [];
  let exportDefaultNode: ts.Node | undefined;

  eachSourceFile(sourceFile, node => {
    if (node.parent !== sourceFile) {
      return;
    }

    // each node in root scope
    if (modifierHas(node, SyntaxKind.ExportKeyword)) {
      if (modifierHas(node, SyntaxKind.DefaultKeyword)) {
        // export default
        exportDefaultNode = node;
      } else {
        // export variable
        if (ts.isVariableStatement(node)) {
          node.declarationList.declarations.forEach(declare =>
            exportNodeList.push(declare),
          );
        } else {
          exportNodeList.push(node);
        }
      }
    } else if (ts.isExportAssignment(node)) {
      // export default {}
      exportDefaultNode = node.expression;
    } else if (ts.isExpressionStatement(node) && ts.isBinaryExpression(node.expression)) {
      if (ts.isPropertyAccessExpression(node.expression.left)) {
        const obj = node.expression.left.expression;
        const prop = node.expression.left.name;
        if (ts.isIdentifier(obj)) {
          if (obj.escapedText === 'exports') {
            // exports.xxx = {}
            exportNodeList.push(node.expression);
          } else if (
            obj.escapedText === 'module' &&
            ts.isIdentifier(prop) &&
            prop.escapedText === 'exports'
          ) {
            // module.exports = {}
            exportDefaultNode = node.expression.right;
          }
        }
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

  // checker.getTypeFromTypeNode

  switch (typeNode.kind) {
    case SyntaxKind.StringKeyword:
      return dom.type.string;
    case SyntaxKind.NumberKeyword:
      return dom.type.number;
    case SyntaxKind.BooleanKeyword:
      return dom.type.boolean;
    case SyntaxKind.TrueKeyword:
      return dom.type.true;
    case SyntaxKind.FalseKeyword:
      return dom.type.false;
    case SyntaxKind.NullKeyword:
      return dom.type.null;
    case SyntaxKind.UndefinedKeyword:
      return dom.type.undefined;
    case SyntaxKind.VoidKeyword:
      return dom.type.void;
    case SyntaxKind.ObjectKeyword:
      return dom.type.object;
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
    default:
      return dom.type.any;
  }
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

export function getTypeLiteralTypeDom(typeNode: ts.TypeLiteralNode) {
  const members = typeNode.members;
  const memberList: any[] = [];
  members.forEach(member => {
    const name = getText(member.name);
    const { typeDom } = getPropertyTypeDom(name, member);
    if (typeDom) memberList.push(typeDom);
  });
  return dom.create.objectType(memberList);
}

export function getIntersectionTypeDom(typeNode: ts.IntersectionTypeNode) {
  return dom.create.intersection(typeNode.types.map(node => getTypeDom(node)));
}

export function getUnionTypeDom(typeNode: ts.UnionTypeNode) {
  return dom.create.union(typeNode.types.map(node => getTypeDom(node)));
}

export function getReferenceModule(symbol: ts.Symbol) {
  if (!symbol) return;
  const valueDeclaration = symbol.valueDeclaration;
  const declarationFile = valueDeclaration.getSourceFile().fileName;
  if (declarationFile === sourceFile!.fileName) {
    // current module
    return valueDeclaration;
  } else if (declarationFile.startsWith(path.dirname(require.resolve('typescript')))) {
    // build-in module
    return;
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
  const type = checker.getReturnTypeOfSignature(signature!);
  return checker.typeToTypeNode(type);
}

// export function tryAddMemberForDeclaration()

export function getClassLikeTypeDom(node: ts.ClassLikeDeclaration) {
  const classDeclaration = dom.create.class(getText(node.name));
  if (node.heritageClauses) {
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
      classDeclaration.members.push(
        dom.create.constructor(getFunctionParametersTypeDom(member.parameters)),
      );

      return;
    }

    // skip without property name
    if (!name) {
      return;
    }

    const { typeDom } = getPropertyTypeDom(name, member);
    if (typeDom) {
      classDeclaration.members.push(typeDom);
    }
  });

  return classDeclaration;
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

  let typeDom;
  if (ts.isMethodDeclaration(node) || ts.isMethodSignature(node)) {
    // method property
    const typeNode = getReturnTypeFromDeclaration(node);
    typeDom = dom.create.method(
      name,
      getFunctionParametersTypeDom(node.parameters),
      getTypeDom(typeNode),
      flag,
    );
  } else if (ts.isGetAccessorDeclaration(node) || ts.isGetAccessor(node)) {
    const typeNode = getTypeNodeAtLocation(node);
    typeDom = dom.create.property(name, getTypeDom(typeNode), flag);
  } else if (ts.isPropertyDeclaration(node) || ts.isPropertySignature(node)) {
    typeDom = dom.create.property(name, getTypeDom(node.type), flag);
  }

  return {
    typeDom,
    flag,
  };
}

export function getPropertyList(node: ts.ObjectLiteralExpression) {
  const propertyList: any[] = [];
  eachPropertiesTypeDom<ts.ObjectLiteralElement>(node.properties, (name, member) => {
    if (!name) return;

    const { typeDom, flag } = getPropertyTypeDom(name, member);
    if (typeDom) {
      propertyList.push(typeDom);
    } else if (ts.isPropertyAssignment(member)) {
      const typeNode = getTypeNodeAtLocation(member);
      const prop = dom.create.property(name, getTypeDom(typeNode), flag);
      propertyList.push(prop);
    }
  });
  return propertyList;
}

export function getReferenceTypeDomFromEntity(node: ts.EntityName) {
  const interfaceName = getText(node);
  const symbol = (node as any).symbol;
  if (!symbol) return;

  const referenceModule = getReferenceModule(symbol);
  if (referenceModule) {
    if (typeof referenceModule === 'string') {
      collectModuleName(referenceModule, interfaceName);
    } else if (ts.isSourceFile(referenceModule)) {
      const modName = getModNameByPath(referenceModule.fileName);
      collectModuleName(modName, interfaceName);
    } else {
      addDeclarations(referenceModule);
    }
  }

  return dom.create.namedTypeReference(interfaceName);
}

export function getReferenceTypeDom(typeNode: ts.TypeReferenceNode) {
  const ref = getReferenceTypeDomFromEntity(typeNode.typeName);
  if (!ref) return dom.type.any;
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
  if (!declarationList.includes(node)) {
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
  const returnTypeNode = checker.typeToTypeNode(returnType, undefined, ts.NodeBuilderFlags.AllowNodeModulesRelativePaths);
  const parameterDom = getFunctionParametersTypeDom(node.parameters);
  const returnTypeDom = getTypeDom(returnTypeNode) || dom.type.any;
  if (ts.isFunctionDeclaration(node) || ts.isFunctionExpression(node) || ts.isArrowFunction(node)) {
    return dom.create.function(
      fnName || getText(node.name),
      parameterDom,
      returnTypeDom,
    );
  }
}

export function getModNameByPath(fileName: string) {
  const extname = path.extname(fileName);
  fileName = extname ? fileName : `${fileName}.d.ts`;
  const dir = path.dirname(fileName);
  const basename = path.basename(fileName, '.d.ts');

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

export function getTypeNodeAtLocation(node: ts.Node, flag: ts.NodeBuilderFlags = ts.NodeBuilderFlags.AllowNodeModulesRelativePaths) {
  const type = checker.getTypeAtLocation(node);
  return checker.typeToTypeNode(type, undefined, flag);
}

export function getVariableDeclarationTypeDom(node: ts.VariableDeclaration) {
  const typeNode = getTypeNodeAtLocation(node.name);
  const typeDom = getTypeDom(typeNode);
  return dom.create.const(getText(node.name), typeDom);
}

export function generate(file: string) {
  const defaultExportName = 'ExportDefaultElement';
  const program = ts.createProgram([ file ], {
    target: ts.ScriptTarget.ES2017,
    module: ts.ModuleKind.CommonJS,
    allowJs: true,
  });

  // cache checker and sourceFile
  checker = program.getTypeChecker();
  sourceFile = program.getSourceFile(file);
  if (!sourceFile) {
    return;
  }

  declarationDts.length = 0;

  // check node
  const { exportDefaultNode } = findExportNode(sourceFile);
  let exportDefaultName: string | undefined;
  if (exportDefaultNode) {
    if (ts.isIdentifier(exportDefaultNode)) {
      const symbol = checker.getSymbolAtLocation(exportDefaultNode)!;
      if (symbol.valueDeclaration.getSourceFile().fileName !== sourceFile.fileName) {
        // not the same module
      } else {
        symbol.declarations.forEach(addDeclarations);
      }

      exportDefaultName = exportDefaultNode.getText();
    } else if (ts.isClassLike(exportDefaultNode)) {
      addDeclarations(exportDefaultNode);
      exportDefaultName = getText(exportDefaultNode.name);
    } else if (ts.isFunctionLike(exportDefaultNode)) {
      exportDefaultNode.name = getText(exportDefaultNode.name)
        ? exportDefaultNode.name
        : ts.createIdentifier(defaultExportName);

      addDeclarations(exportDefaultNode);
      exportDefaultName = getText(exportDefaultNode.name);
    } else if (ts.isObjectLiteralExpression(exportDefaultNode)) {
      const propList = getPropertyList(exportDefaultNode);
      const interfaceTypeDom = dom.create.interface(defaultExportName);
      interfaceTypeDom.members = propList;
      exportDefaultName = defaultExportName;
      declarationDts.push(interfaceTypeDom);
    }
  }

  // declaration list
  while (declarationList.length) {
    const declaration = declarationList.pop()!;
    if (ts.isClassLike(declaration)) {
      const classDeclaration = getClassLikeTypeDom(declaration);
      declarationDts.push(classDeclaration);
    } else if (ts.isFunctionLike(declaration)) {
      const functionDeclaration = getFunctionLikeTypeDom(declaration)!;
      declarationDts.push(functionDeclaration);
    } else if (ts.isVariableDeclaration(declaration)) {
      const varDeclaration = getVariableDeclarationTypeDom(declaration);
      declarationDts.push(varDeclaration);
    }
  }

  // import list
  Object.keys(importMap).forEach(k => {
    const obj = importMap[k];

    // import { xx } from 'xx';
    if (obj.list.length) {
      declarationDts.unshift(dom.create.importNamed(obj.list.map(name => ({ name })), k));
    }

    // import * as xx
    if (obj.default) {
      declarationDts.unshift(dom.create.importAll(obj.default, k));
    }
  });

  // export =
  if (exportDefaultName) {
    declarationDts.push(dom.create.exportEquals(exportDefaultName));
  }

  return declarationDts
    .map(dts => dom.emit(dts))
    .join('');
}
