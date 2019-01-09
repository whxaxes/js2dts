import ts from 'typescript';

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

export function generate(code: string) {
  return code;
}
