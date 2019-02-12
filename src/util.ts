import * as ts from 'typescript';
import * as path from 'path';
let uniqId = 100;

// get name for anonymous type
export function getAnonymousName() {
  return `T${uniqId++}`;
}

export function formatName(name: string) {
  name = name
    .replace(/[\/._-][a-z]/gi, s => s.substring(1).toUpperCase())
    .replace(/\/|\./g, '');
  return name[0].toUpperCase() + name.substring(1);
}

export function getTypeArguments(node: ts.TypeNode) {
  return (node as ts.NodeWithTypeArguments).typeArguments;
}

export function getSymbol(node: ts.Node): ts.Symbol | undefined {
  return (node as any).symbol;
}

export function getJSDoc(node: ts.Node): ts.JSDoc[] | undefined {
  return (node as any).jsDoc;
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
      ? node.text
      : ts.isStringLiteral(node) ? node.text : '';
  }
  return '';
}

// find js doc tag
export function findJsDocTag(node: ts.Node, name: string) {
  const jsDocTags = ts.getJSDocTags(node);
  return jsDocTags.find(tag => getText(tag.tagName) === name);
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
