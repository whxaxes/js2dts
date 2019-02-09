import * as ts from 'typescript';

export function getTypeArguments(node: ts.TypeNode): ts.TypeNode[] | undefined {
  return (node as any).typeArguments;
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
