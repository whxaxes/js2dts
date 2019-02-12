import ts from 'typescript';
import * as dom from './dom';
import * as program from './';
import * as util from './util';

export function getTypeDomFromType(type: ts.Type) {
  if (type.flags & ts.TypeFlags.StringLike) {
    return dom.type.string;
  } else if (type.flags & ts.TypeFlags.NumberLike) {
    return dom.type.number;
  } else if (type.flags & ts.TypeFlags.BooleanLike) {
    return dom.type.boolean;
  } else if (type.flags & ts.TypeFlags.VoidLike) {
    return dom.type.void;
  } else if (type.flags & ts.TypeFlags.Literal) {
    // const t = type as ts.LiteralType;
    return dom.type.any;
  } else if (type.flags & ts.TypeFlags.Object) {
    return getTypeDomFromObjectType(type as ts.ObjectType);
  } else {
    return dom.type.any;
  }
}

export function getPropertyTypeDom(name: string, type: ts.Type) {
  return dom.create.property(name, getTypeDomFromType(type));
}

export function getCallSignatureDeclarationTypeDom(node: ts.Signature) {
  const returnType = program.env.checker.getReturnTypeOfSignature(node);
  return dom.create.callSignature(
    getFunctionParametersTypeDom(node),
    getTypeDomFromType(returnType),
  );
}

export function getTypeBySymbol(symbol: ts.Symbol) {
  return program.env.checker.getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration);
}

export function getFunctionParametersTypeDom(node: ts.Signature) {
  const parameters = node.getParameters();
  const nameCache: program.PlainObj<number> = {};
  const params: dom.Parameter[] = parameters.map(param => {
    const type = program.env.checker.getTypeOfSymbolAtLocation(param, node.declaration!);
    const paramsName = param.getName();

    // prevent duplicate
    let name = paramsName || util.getAnonymousName();
    if (nameCache[name] === undefined) {
      nameCache[name] = 0;
    } else {
      nameCache[name]++;
      name = `${name}_${nameCache[name]}`;
    }

    return dom.create.parameter(
      name,
      getTypeDomFromType(type) || dom.type.any,
    );
  });

  return params;
}

export function getTypeDomFromObjectType(type: ts.ObjectType) {
  if (type.objectFlags & ts.ObjectFlags.Reference) {
    const t = <ts.TypeReference>type;
    const referName = t.target.symbol.getName();
    const typeArguments = t.typeArguments;
    const named = dom.create.namedTypeReference(referName);
    if (typeArguments) {
      typeArguments.forEach(type => {
        named.typeParameters.push(getTypeDomFromType(type) as any);
      });
    }
    return named;
  } else if (type.objectFlags & ts.ObjectFlags.Anonymous) {
    const properties = type.getProperties();
    const callSignatures = type.getCallSignatures();
    const members: dom.ObjectTypeMember[] = [];
    if (callSignatures) {
      callSignatures.forEach(prop => {
        members.push(getCallSignatureDeclarationTypeDom(prop));
      });
    }

    properties.forEach(prop => {
      const type = program.env.checker.getTypeOfSymbolAtLocation(prop, prop.valueDeclaration);
      if (type.symbol && type.symbol.getName() === ts.InternalSymbolName.Function) {
        const declaration = type.symbol.declarations[0];
        const ftype = program.env.checker.getTypeAtLocation(declaration);
        console.info(ftype);
      }
      members.push(getPropertyTypeDom(prop.getName(), type));
    });

    return dom.create.objectType(members);
  }

  return dom.type.any;
}
