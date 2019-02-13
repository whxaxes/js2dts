import * as ts from 'typescript';
import * as path from 'path';
let uniqId = 100;

// get name for anonymous type
export function getAnonymousName() {
  return `T${uniqId++}`;
}

export function formatName(name: string) {
  name = name
    .replace(/[\/\\._-][a-z]/gi, s => s.substring(1).toUpperCase())
    .replace(/\/|\\|\./g, '');
  return name[0].toUpperCase() + name.substring(1);
}

export function getTypeArguments(node: ts.TypeNode) {
  return (node as ts.NodeWithTypeArguments).typeArguments;
}

export function getSymbol(node: ts.Node): ts.Symbol | undefined {
  return (node as any).symbol;
}

export function getDeclarationBySymbol(symbol: ts.Symbol) {
  return symbol.valueDeclaration || (symbol.declarations && symbol.declarations[0]);
}

export function getJSDocProp(node: ts.Node): ts.JSDoc[] | undefined {
  return (node as any).jsDoc;
}

export function getJSDoc(node: ts.Node): ts.JSDoc | undefined {
  const jsDocs = getJSDocs(node);
  return jsDocs ? jsDocs[jsDocs.length - 1] : undefined;
}

export function getDeclarationMayHasJSDoc(node: ts.Node): ts.Node {
  if (!getJSDocProp(node)) {
    const symbol = getSymbol(node);
    const declaration = symbol && getDeclarationBySymbol(symbol);
    if (declaration) {
      if (ts.isPropertyAccessExpression(declaration)) {
        return declaration.parent.parent;
      }

      return declaration;
    }
  }

  return node;
}

export function getJSDocs(node: ts.Node): ts.JSDoc[] | undefined {
  const decl = getDeclarationMayHasJSDoc(node);
  if (!decl) return;

  const jsDocs = getJSDocProp(decl);
  if (!jsDocs) {
    const tags = ts.getJSDocTags(decl);
    const jsDocArray: ts.JSDoc[] = [];
    tags.forEach(tag => {
      if (ts.isJSDoc(tag.parent) && !jsDocArray.includes(tag.parent)) {
        jsDocArray.push(tag.parent);
      }
    });
    return jsDocArray;
  }

  return jsDocs;
}

export function hasQuestionToken(node: ts.Node) {
  return (node as any).questionToken !== undefined;
}

export function isDeclareModule(node: ts.Node): node is ts.ModuleDeclaration {
  return ts.isModuleDeclaration(node) && ts.isStringLiteral(node.name);
}

export function getText(node?: ts.Node) {
  if (node) {
    return ts.isIdentifier(node)
      ? node.text.replace(/^("|')|("|')$/g, '')
      : ts.isStringLiteral(node) ? node.text : '';
  }
  return '';
}

// find js doc tag
export function findJsDocTag(node: ts.Node, name: string) {
  const jsDocTags = ts.isJSDoc(node)
    ? node.tags
    : ts.getJSDocTags(getDeclarationMayHasJSDoc(node));

  return jsDocTags && jsDocTags.find(tag => getText(tag.tagName) === name);
}

// normalize d.ts url
export function normalizeDtsUrl(file: string) {
  const ext = path.extname(file);
  file += ext ? '' : '.d.ts';
  return file;
}

// resolve url
export function resolveUrl(url: string) {
  try {
    return require.resolve(url);
  } catch (e) {
    return;
  }
}

// check kind in node.modifiers.
export function modifierHas(node: ts.Node, kind) {
  return node.modifiers && node.modifiers.find(mod => kind === mod.kind);
}

// find assign result type
export interface AssignElement {
  init?: boolean;
  obj?: ts.Expression;
  key: ts.Identifier;
  value?: ts.Expression;
  node: ts.Node;
}

export interface ExportObj {
  node: ts.Node;
  originalNode: ts.Node;
}

// find exports from sourcefile
export function findExports(source: ts.SourceFile) {
  let exportEqual: ExportObj | undefined;
  const exportList: Map<string, ExportObj> = new Map();
  const checker = getAssignChecker([
    'exports',
    'module',
    'module.exports',
  ]);

  const addExportNode = (name: string, value: ts.Node, node: ts.Node) => {
    exportList.set(name, {
      node: value!,
      originalNode: node,
    });
  };

  source.statements.forEach(statement => {
    const isExport = modifierHas(statement, ts.SyntaxKind.ExportKeyword);
    if (ts.isExportAssignment(statement)) {
      if (statement.isExportEquals) {
        // export = {}
        exportEqual = {
          node: statement.expression,
          originalNode: statement,
        };
      } else {
        // export default {}
        addExportNode('default', statement.expression, statement);
      }

      return;
    } else if (isExport && (ts.isFunctionDeclaration(statement) || ts.isClassDeclaration(statement))) {
      if (modifierHas(statement, ts.SyntaxKind.DefaultKeyword)) {
        // export default function() {} | export default class xx {}
        addExportNode('default', statement, statement);
      } else {
        // export function xxx() {} | export class xx {}
        addExportNode(getText(statement.name), statement, statement);
      }

      return;
    } else if (ts.isExportDeclaration(statement) && statement.exportClause) {
      // export { xxxx };
      statement.exportClause.elements.forEach(spec => {
        addExportNode(getText(spec.name), spec.propertyName || spec.name, statement);
      });

      return;
    }

    getAssignResultFromStatement(statement).forEach(result => {
      const newResult = checker.check(result);
      if (isExport) {
        // export const xxx = {};
        addExportNode(getText(result.key), result.value!, result.node);
      }

      if (!newResult) return;
      if (newResult.name === 'exports' || newResult.name === 'module.exports') {
        // exports.xxx = {} | module.exports.xxx = {}
        addExportNode(getText(newResult.key), newResult.value, newResult.node);
      } else if (newResult.name === 'module' && getText(newResult.key) === 'exports') {
        // module.exports = {}
        exportEqual = {
          node: newResult.value!,
          originalNode: newResult.node,
        };
      }
    });
  });

  return {
    exportEqual,
    exportList,
  };
}

export function findAssign(statements: ts.NodeArray<ts.Statement>, cb: (result: AssignElement) => void) {
  statements.forEach(statement => {
    getAssignResultFromStatement(statement).forEach(cb);
  });
}

export function findAssignByName(statements, name: FindAssignNameType | FindAssignNameType[], cb: (result: AssignNameElement) => void) {
  const checker = getAssignChecker(name);
  return findAssign(statements, result => {
    const newResult = checker.check(result);
    if (newResult) cb(newResult);
  });
}

type FindAssignNameType = string | RegExp;
interface AssignNameElement extends AssignElement {
  obj: ts.Expression;
  name: string;
  value: ts.Expression;
}

export function getAssignChecker(name: FindAssignNameType | FindAssignNameType[]) {
  // cache the variable of name
  const variableList = Array.isArray(name) ? name : [ name ];
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

  return {
    check(el: AssignElement): AssignNameElement | undefined {
      const { obj, key, value, node } = el;
      if (!obj || !value) {
        // const xx = name
        if (value) {
          const realName = getRealName(value.getText().trim());
          if (realName) {
            nameAlias[getText(key)] = realName;
          }
        }

        return;
      }

      const realName = getRealName(obj.getText().trim());
      if (realName) {
        return { name: realName, obj, key, value, node };
      }
    },
  };
}

export function getAssignResultFromStatement(statement: ts.Statement, assignList: AssignElement[] = []) {
  const checkValue = (node?: ts.Expression) => {
    if (node && ts.isBinaryExpression(node)) {
      checkBinary(node);
      return checkValue(node.right);
    } else {
      return node;
    }
  };

  // check binary expression
  const checkBinary = (node: ts.BinaryExpression) => {
    if (
      ts.isPropertyAccessExpression(node.left) &&
      ts.isIdentifier(node.left.name)
    ) {
      // xxx.xxx = xx
      assignList.push({
        obj: node.left.expression,
        key: node.left.name,
        value: checkValue(node.right),
        node: statement,
      });
    } else if (ts.isIdentifier(node.left)) {
      // xxx = xx
      assignList.push({
        key: node.left,
        value: checkValue(node.right),
        node: statement,
      });
    } else if (
      ts.isElementAccessExpression(node.left) &&
      ts.isStringLiteral(node.left.argumentExpression)
    ) {
      // xxx['sss'] = xxx
      assignList.push({
        obj: node.left.expression,
        key: ts.createIdentifier(node.left.argumentExpression.text),
        value: checkValue(node.right),
        node: statement,
      });
    }
  };

  const eachStatement = (statements: ts.NodeArray<ts.Statement>) => {
    statements.forEach(statement => getAssignResultFromStatement(statement, assignList));
  };

  const checkIfStatement = (el: ts.IfStatement) => {
    if (ts.isBlock(el.thenStatement)) {
      eachStatement(el.thenStatement.statements);
    }

    if (el.elseStatement) {
      if (ts.isIfStatement(el.elseStatement)) {
        checkIfStatement(el.elseStatement);
      } else if (ts.isBlock(el.elseStatement)) {
        eachStatement(el.elseStatement.statements);
      }
    }
  };

  if (ts.isExpressionStatement(statement) && ts.isBinaryExpression(statement.expression)) {
    // xxx = xxx
    checkBinary(statement.expression);
  } else if (ts.isVariableStatement(statement)) {
    // const xxx = xx
    statement.declarationList.declarations.forEach(declare => {
      if (ts.isIdentifier(declare.name)) {
        assignList.push({
          init: true,
          key: declare.name,
          value: checkValue(declare.initializer),
          node: declare,
        });
      }
    });
  } else if (ts.isIfStatement(statement)) {
    // if () { xxx = xxx }
    checkIfStatement(statement);
  }

  return assignList;
}
