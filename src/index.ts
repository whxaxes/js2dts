import ts from 'typescript';
import fs from 'fs';
import path from 'path';
import * as dom from 'dts-dom';

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
export function findExportNode(code: string) {
  const sourceFile = ts.createSourceFile('file.ts', code, ts.ScriptTarget.ES2017, true);
  const cache: Map<ts.__String, ts.Node> = new Map();
  const exportNodeList: ts.Node[] = [];
  let exportDefaultNode: ts.Node | undefined;

  eachSourceFile(sourceFile, node => {
    if (node.parent !== sourceFile) {
      return;
    }

    // each node in root scope
    if (modifierHas(node, ts.SyntaxKind.ExportKeyword)) {
      if (modifierHas(node, ts.SyntaxKind.DefaultKeyword)) {
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
    } else if (ts.isVariableStatement(node)) {
      // cache variable statement
      for (const declaration of node.declarationList.declarations) {
        if (ts.isIdentifier(declaration.name) && declaration.initializer) {
          cache.set(declaration.name.escapedText, declaration.initializer);
        }
      }
    } else if ((ts.isFunctionDeclaration(node) || ts.isClassDeclaration(node)) && node.name) {
      // cache function declaration and class declaration
      cache.set(node.name.escapedText, node);
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
      } else if (ts.isIdentifier(node.expression.left)) {
        // let exportData;
        // exportData = {};
        // export exportData
        cache.set(node.expression.left.escapedText, node.expression.right);
      }
    }
  });

  while (exportDefaultNode && ts.isIdentifier(exportDefaultNode) && cache.size) {
    const mid = cache.get(exportDefaultNode.escapedText);
    cache.delete(exportDefaultNode.escapedText);
    exportDefaultNode = mid;
  }

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

export function guessType(exp: ts.Node) {
  if (ts.isStringLiteral(exp) || ts.isNoSubstitutionTemplateLiteral(exp)) {
    // string
    return dom.type.string;
  } else if (ts.isNumericLiteral(exp)) {
    // number
    return dom.type.number;
  } else if (ts.isIdentifier(exp)) {
    // declaration
    return findDeclarationType(exp.parent, exp);
  } else if (ts.isBinaryExpression(exp)) {
    // a + b + c
    return dom.type.any;
  } else if (isFunctionType(exp)) {
    // function type
    return createFunctionType(exp);
  } else if (ts.isCallExpression(exp)) {
    // call expression
    if (ts.isIdentifier(exp.expression)) {
      const type = findDeclarationType(exp.expression.parent, exp.expression);
      if (type && isFunctionTypeDom(type)) {
        return type.returnType;
      }
    }
  }
}

export function isFunctionTypeDom(fn: dom.Type): fn is dom.FunctionType {
  const fm = fn as dom.FunctionType;
  return fm.kind === 'function-type';
}

export function createFunctionType(fn: ts.FunctionDeclaration) {
  return dom.create.functionType(
    getFunctionParameters(fn.parameters),
    guessReturnType(fn),
  );
}

// find declaration type
export function findDeclarationType(exp: ts.Node, idx: ts.Identifier): dom.Type | undefined {
  if (!exp) return;

  if (ts.isBlock(exp) || ts.isSourceFile(exp)) {
    let declareType;

    // find type from declaration
    for (const statement of exp.statements) {
      if (ts.isVariableStatement(statement)) {
        for (const declaration of statement.declarationList.declarations) {
          // check whether the declaration name is the same.
          if (getText(declaration.name) === getText(idx) && declaration.initializer) {
            declareType = guessType(declaration.initializer) || dom.type.any;
          }
        }
      } else if (ts.isFunctionDeclaration(statement) && getText(statement.name) === getText(idx)) {
        declareType = createFunctionType(statement);
      }
    }

    // type can be override
    if (declareType) {
      return declareType;
    }
  } else if (isFunctionType(exp)) {
    // find type from param
    const params = getFunctionParameters(exp.parameters);
    for (const param of params) {
      if (param.name === getText(idx)) {
        return param.type;
      }
    }
  }

  return findDeclarationType(exp.parent, idx);
}

// is function
export function isFunctionType(fn: ts.Node): fn is ts.FunctionDeclaration {
  return ts.isFunctionDeclaration(fn) || ts.isArrowFunction(fn) || ts.isConstructorDeclaration(fn);
}

export function guessReturnType(fn: ts.FunctionLike) {
  const typeList: dom.Type[] = [];
  if (isFunctionType(fn) && fn.body) {
    fn.body.forEachChild(statement => {
      if (ts.isReturnStatement(statement) && statement.expression) {
        const returnType = guessType(statement.expression);
        if (returnType && !typeList.includes(returnType)) {
          typeList.push(returnType);
        }
      }
    });
  }

  if (!typeList.length) {
    return dom.type.void;
  } else if (typeList.length > 3) {
    return dom.type.any;
  } else {
    // string | number | etc.
    return dom.create.union(typeList);
  }
}

export function getFunctionParameters(parameters: ts.NodeArray<ts.ParameterDeclaration>) {
  const params: dom.Parameter[] = [];

  parameters.forEach(param => {
    let paramType;
    let flag;
    if (param.initializer) {
      const type = guessType(param.initializer);
      if (type) {
        flag = dom.ParameterFlags.Optional;
        paramType = type;
      }
    }

    const p = dom.create.parameter(
      getText(param.name),
      paramType || dom.type.any,
      flag,
    );

    params.push(p);
  });

  return params;
}

export function generate(file: string) {
  const baseName = path.basename(file, path.extname(file));
  const code = fs.readFileSync(file, {
    encoding: 'utf-8',
  });

  const { exportDefaultNode } = findExportNode(code);
  if (exportDefaultNode) {
    if (ts.isFunctionLike(exportDefaultNode)) {
      const fn = dom.create.function(
        getFunctionName(exportDefaultNode) || baseName,
        getFunctionParameters(exportDefaultNode.parameters),
        guessReturnType(exportDefaultNode),
      );

      console.info(dom.emit(fn));
    }
  }
  // const d = dom.create.function('abc', [], dom.type.string);
  // console.info(dom.emit(d));
  return code;
}
