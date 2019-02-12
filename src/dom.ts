/**
 * Fork of [dts-dom](https://github.com/RyanCavanaugh/dts-dom) with some additional features.
 *
 * dts-dom is licensed as follows:
 *
 * """
 *   Apache License
 *   Version 2.0, January 2004
 *   http://www.apache.org/licenses/
 *   TERMS AND CONDITIONS FOR USE, REPRODUCTION, AND DISTRIBUTION
 *   1. Definitions.
 *   "License" shall mean the terms and conditions for use, reproduction, and distribution as defined by Sections 1 through 9 of this document.
 *   "Licensor" shall mean the copyright owner or entity authorized by the copyright owner that is granting the License.
 *   "Legal Entity" shall mean the union of the acting entity and all other entities that control, are controlled by, or are under common control with that entity. For the purposes of this definition, "control" means (i) the power, direct or indirect, to cause the direction or management of such entity, whether by contract or otherwise, or (ii) ownership of fifty percent (50%) or more of the outstanding shares, or (iii) beneficial ownership of such entity.
 *   "You" (or "Your") shall mean an individual or Legal Entity exercising permissions granted by this License.
 *   "Source" form shall mean the preferred form for making modifications, including but not limited to software source code, documentation source, and configuration files.
 *   "Object" form shall mean any form resulting from mechanical transformation or translation of a Source form, including but not limited to compiled object code, generated documentation, and conversions to other media types.
 *   "Work" shall mean the work of authorship, whether in Source or Object form, made available under the License, as indicated by a copyright notice that is included in or attached to the work (an example is provided in the Appendix below).
 *   "Derivative Works" shall mean any work, whether in Source or Object form, that is based on (or derived from) the Work and for which the editorial revisions, annotations, elaborations, or other modifications represent, as a whole, an original work of authorship. For the purposes of this License, Derivative Works shall not include works that remain separable from, or merely link (or bind by name) to the interfaces of, the Work and Derivative Works thereof.
 *   "Contribution" shall mean any work of authorship, including the original version of the Work and any modifications or additions to that Work or Derivative Works thereof, that is intentionally submitted to Licensor for inclusion in the Work by the copyright owner or by an individual or Legal Entity authorized to submit on behalf of the copyright owner. For the purposes of this definition, "submitted" means any form of electronic, verbal, or written communication sent to the Licensor or its representatives, including but not limited to communication on electronic mailing lists, source code control systems, and issue tracking systems that are managed by, or on behalf of, the Licensor for the purpose of discussing and improving the Work, but excluding communication that is conspicuously marked or otherwise designated in writing by the copyright owner as "Not a Contribution."
 *   "Contributor" shall mean Licensor and any individual or Legal Entity on behalf of whom a Contribution has been received by Licensor and subsequently incorporated within the Work.
 *   2. Grant of Copyright License. Subject to the terms and conditions of this License, each Contributor hereby grants to You a perpetual, worldwide, non-exclusive, no-charge, royalty-free, irrevocable copyright license to reproduce, prepare Derivative Works of, publicly display, publicly perform, sublicense, and distribute the Work and such Derivative Works in Source or Object form.
 *   3. Grant of Patent License. Subject to the terms and conditions of this License, each Contributor hereby grants to You a perpetual, worldwide, non-exclusive, no-charge, royalty-free, irrevocable (except as stated in this section) patent license to make, have made, use, offer to sell, sell, import, and otherwise transfer the Work, where such license applies only to those patent claims licensable by such Contributor that are necessarily infringed by their Contribution(s) alone or by combination of their Contribution(s) with the Work to which such Contribution(s) was submitted. If You institute patent litigation against any entity (including a cross-claim or counterclaim in a lawsuit) alleging that the Work or a Contribution incorporated within the Work constitutes direct or contributory patent infringement, then any patent licenses granted to You under this License for that Work shall terminate as of the date such litigation is filed.
 *   4. Redistribution. You may reproduce and distribute copies of the Work or Derivative Works thereof in any medium, with or without modifications, and in Source or Object form, provided that You meet the following conditions:
 *   You must give any other recipients of the Work or Derivative Works a copy of this License; and
 *   You must cause any modified files to carry prominent notices stating that You changed the files; and
 *   You must retain, in the Source form of any Derivative Works that You distribute, all copyright, patent, trademark, and attribution notices from the Source form of the Work, excluding those notices that do not pertain to any part of the Derivative Works; and
 *   If the Work includes a "NOTICE" text file as part of its distribution, then any Derivative Works that You distribute must include a readable copy of the attribution notices contained within such NOTICE file, excluding those notices that do not pertain to any part of the Derivative Works, in at least one of the following places: within a NOTICE text file distributed as part of the Derivative Works; within the Source form or documentation, if provided along with the Derivative Works; or, within a display generated by the Derivative Works, if and wherever such third-party notices normally appear. The contents of the NOTICE file are for informational purposes only and do not modify the License. You may add Your own attribution notices within Derivative Works that You distribute, alongside or as an addendum to the NOTICE text from the Work, provided that such additional attribution notices cannot be construed as modifying the License. You may add Your own copyright statement to Your modifications and may provide additional or different license terms and conditions for use, reproduction, or distribution of Your modifications, or for any such Derivative Works as a whole, provided Your use, reproduction, and distribution of the Work otherwise complies with the conditions stated in this License.
 *   5. Submission of Contributions. Unless You explicitly state otherwise, any Contribution intentionally submitted for inclusion in the Work by You to the Licensor shall be under the terms and conditions of this License, without any additional terms or conditions. Notwithstanding the above, nothing herein shall supersede or modify the terms of any separate license agreement you may have executed with Licensor regarding such Contributions.
 *   6. Trademarks. This License does not grant permission to use the trade names, trademarks, service marks, or product names of the Licensor, except as required for reasonable and customary use in describing the origin of the Work and reproducing the content of the NOTICE file.
 *   7. Disclaimer of Warranty. Unless required by applicable law or agreed to in writing, Licensor provides the Work (and each Contributor provides its Contributions) on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied, including, without limitation, any warranties or conditions of TITLE, NON-INFRINGEMENT, MERCHANTABILITY, or FITNESS FOR A PARTICULAR PURPOSE. You are solely responsible for determining the appropriateness of using or redistributing the Work and assume any risks associated with Your exercise of permissions under this License.
 *   8. Limitation of Liability. In no event and under no legal theory, whether in tort (including negligence), contract, or otherwise, unless required by applicable law (such as deliberate and grossly negligent acts) or agreed to in writing, shall any Contributor be liable to You for damages, including any direct, indirect, special, incidental, or consequential damages of any character arising as a result of this License or out of the use or inability to use the Work (including but not limited to damages for loss of goodwill, work stoppage, computer failure or malfunction, or any and all other commercial damages or losses), even if such Contributor has been advised of the possibility of such damages.
 *   9. Accepting Warranty or Additional Liability. While redistributing the Work or Derivative Works thereof, You may choose to offer, and charge a fee for, acceptance of support, warranty, indemnity, or other liability obligations and/or rights consistent with this License. However, in accepting such obligations, You may act only on Your own behalf and on Your sole responsibility, not on behalf of any other Contributor, and only if You agree to indemnify, defend, and hold each Contributor harmless for any liability incurred by, or claims asserted against, such Contributor by reason of your accepting any such warranty or additional liability.
 *   END OF TERMS AND CONDITIONS
 * """
 */

const brRegex = /\r?\n/g;

export interface DeclarationBase {
  jsDocComment?: JsDocCommentDeclaration;
  comment?: CommentDeclaration;
  flags?: DeclarationFlags;
  namespace?: NamespaceDeclaration;
}

export interface NamedDeclarationBase extends DeclarationBase {
  name: string;
}

export interface CommentDeclaration {
  kind: 'comment';
  comment: string;
  flags: CommentFlags;
}

export interface JsDocCommentDeclaration {
  kind: 'jsdoc-comment';
  jsDocComment: string;
  flags: CommentFlags;
}

export interface EnumMemberDeclaration extends DeclarationBase {
  kind: 'enum-value';
  name: string;
  value?: string | number;
}

export interface EnumDeclaration extends DeclarationBase {
  kind: 'enum';
  name: string;
  members: EnumMemberDeclaration[];
  constant: boolean;
}

export interface PropertyDeclaration extends DeclarationBase {
  kind: 'property';
  name: string;
  type: Type;
}

export interface Parameter {
  kind: 'parameter';
  name: string;
  type: Type;
  flags?: ParameterFlags;
}

export interface TypeParameter {
  kind: 'type-parameter';
  name: string;
  baseType?: ObjectTypeReference | TypeParameter;
}

export interface IndexSignature extends DeclarationBase {
  kind: 'index-signature';
  name: string;
  indexType: 'string' | 'number';
  valueType: Type;
}

export interface CallSignature extends DeclarationBase {
  kind: 'call-signature';
  parameters: Parameter[];
  returnType: Type;
  typeParameters: TypeParameter[];
}

export interface MethodDeclaration extends DeclarationBase {
  kind: 'method';
  name: string;
  parameters: Parameter[];
  returnType: Type;
  typeParameters: TypeParameter[];
}

export interface FunctionDeclaration extends DeclarationBase {
  kind: 'function';
  name: string;
  parameters: Parameter[];
  returnType: Type;
  typeParameters: TypeParameter[];
}

export interface ConstructorDeclaration extends DeclarationBase {
  kind: 'constructor';
  parameters: Parameter[];
}

export interface ClassDeclaration extends DeclarationBase {
  kind: 'class';
  name: string;
  members: ClassMember[];
  implements: InterfaceDeclaration[];
  typeParameters: TypeParameter[];
  baseType?: ObjectTypeReference;
}

export interface InterfaceDeclaration extends DeclarationBase {
  kind: 'interface';
  name: string;
  members: ObjectTypeMember[];
  baseTypes?: ObjectTypeReference[];
}

export interface ImportAllDeclaration extends DeclarationBase {
  kind: 'importAll';
  name: string;
  from: string;
}

export interface ImportNamedDeclaration extends DeclarationBase {
  kind: 'importNamed';
  names: Array<{ name: string; as?: string; }>;
  from: string;
}

export interface ImportDefaultDeclaration extends DeclarationBase {
  kind: 'importDefault';
  name: string;
  from: string;
}

export interface ImportEqualsDeclaration extends DeclarationBase {
  kind: 'import=';
  name: string;
  from: string;
}

export interface ImportDeclaration extends DeclarationBase {
  kind: 'import';
  from: string;
}

export interface NamespaceDeclaration extends DeclarationBase {
  kind: 'namespace';
  name: string;
  members: NamespaceMember[];
}

export interface ConstDeclaration extends DeclarationBase {
  kind: 'const';
  name: string;
  type: Type;
}

export interface VariableDeclaration extends DeclarationBase {
  kind: 'var';
  name: string;
  type: Type;
}

export interface ExportEqualsDeclaration extends DeclarationBase {
  kind: 'export=';
  target: string;
}

export interface ExportDefaultDeclaration extends DeclarationBase {
  kind: 'exportDefault';
  name: string;
}

export interface ExportNameDeclaration extends DeclarationBase {
  kind: 'exportName';
  name: string;
  as?: string;
}

export interface ModuleDeclaration extends DeclarationBase {
  kind: 'module';
  name: string;
  members: ModuleMember[];
}

export interface ObjectType {
  kind: 'object';
  members: ObjectTypeMember[];
}

export interface UnionType {
  kind: 'union';
  members: Type[];
}

export interface IntersectionType {
  kind: 'intersection';
  members: Type[];
}

export interface FunctionType {
  kind: 'function-type';
  parameters: Parameter[];
  returnType: Type;
}

export interface TypeAliasDeclaration extends DeclarationBase {
  kind: 'alias';
  name: string;
  type: Type;
  typeParameters: TypeParameter[];
}

export interface ArrayTypeReference {
  kind: 'array';
  type: Type;
}

export interface NamedTypeReference {
  kind: 'name';
  name: string;
  typeParameters: TypeParameter[];
}

export interface TypeofReference {
  kind: 'typeof';
  type: NamedTypeReference;
}

export interface StringLiteral {
  kind: 'string-literal';
  value: string;
}

export interface NumberLiteral {
  kind: 'number-literal';
  value: number;
}

export interface TripleSlashReferencePathDirective {
  kind: 'triple-slash-reference-path';
  path: string;
}

export interface TripleSlashReferenceTypesDirective {
  kind: 'triple-slash-reference-types';
  types: string;
}

export interface TripleSlashReferenceNoDefaultLibDirective {
  kind: 'triple-slash-reference-no-default-lib';
  value: boolean;
}

export interface TripleSlashAmdModuleDirective {
  kind: 'triple-slash-amd-module';
  name?: string;
}

export type PrimitiveType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'any'
  | 'void'
  | 'object'
  | 'null'
  | 'undefined'
  | 'true'
  | 'false'
  | StringLiteral
  | NumberLiteral;

export type ThisType = 'this';

export type TripleSlashDirective =
  | TripleSlashReferencePathDirective
  | TripleSlashReferenceTypesDirective
  | TripleSlashReferenceNoDefaultLibDirective
  | TripleSlashAmdModuleDirective;

export type TypeReference =
  | TopLevelDeclaration
  | NamedTypeReference
  | ArrayTypeReference
  | PrimitiveType;

export type ObjectTypeReference = ClassDeclaration | InterfaceDeclaration;
export type ObjectTypeMember =
  | PropertyDeclaration
  | MethodDeclaration
  | IndexSignature
  | CallSignature;
export type ClassMember =
  | PropertyDeclaration
  | MethodDeclaration
  | IndexSignature
  | ConstructorDeclaration;

export type Type =
  | TypeReference
  | UnionType
  | IntersectionType
  | PrimitiveType
  | ObjectType
  | TypeofReference
  | FunctionType
  | TypeParameter
  | ThisType;

export type Import =
  | ImportAllDeclaration
  | ImportDefaultDeclaration
  | ImportNamedDeclaration
  | ImportEqualsDeclaration
  | ImportDeclaration;

export type NamespaceMember =
  | InterfaceDeclaration
  | TypeAliasDeclaration
  | ClassDeclaration
  | NamespaceDeclaration
  | ConstDeclaration
  | VariableDeclaration
  | FunctionDeclaration
  | CommentDeclaration
  | JsDocCommentDeclaration;
export type ModuleMember =
  | InterfaceDeclaration
  | TypeAliasDeclaration
  | ClassDeclaration
  | NamespaceDeclaration
  | ConstDeclaration
  | VariableDeclaration
  | FunctionDeclaration
  | Import
  | ExportEqualsDeclaration
  | ExportDefaultDeclaration;
export type TopLevelDeclaration =
  | NamespaceMember
  | ExportEqualsDeclaration
  | ExportDefaultDeclaration
  | ExportNameDeclaration
  | ModuleDeclaration
  | EnumDeclaration
  | Import;

export enum DeclarationFlags {
  None = 0,
  Private = 1 << 0,
  Protected = 1 << 1,
  Static = 1 << 2,
  Optional = 1 << 3,
  Export = 1 << 4,
  Abstract = 1 << 5,
  ExportDefault = 1 << 6,
  ReadOnly = 1 << 7,
}

export enum ParameterFlags {
  None = 0,
  Optional = 1 << 0,
  Rest = 1 << 1,
}

export enum CommentFlags {
  Wrap = 0,
  Plain = 1 << 0,
}

export const config = {
  indentSpace: 2,
  outputEol: '\r\n',
};

export const util = {
  getFullName(type: NamedDeclarationBase) {
    return type.namespace
      ? `${util.getFullName(type.namespace)}.${type.name}`
      : type.name;
  },

  typeToDeclaration(name: string, d: Type, flags: DeclarationFlags = DeclarationFlags.None) {
    let type: DeclarationBase;
    if (util.isFunctionType(d)) {
      type = create.function(name, d.parameters, d.returnType);
    } else if (util.isTopLevelDeclaration(d)) {
      d.flags = (d.flags || DeclarationFlags.None) | flags;
      return d;
    } else {
      type = create.const(name, d);
    }
    type.flags = flags;
    return type;
  },

  isNamedDeclarationBase(node): node is NamedDeclarationBase {
    return typeof (node as NamedDeclarationBase).name === 'string';
  },

  isTypeofReference(node): node is TypeofReference {
    return (node as TypeofReference).kind === 'typeof';
  },

  isFunctionType(node): node is FunctionType {
    return (node as FunctionType).kind === 'function-type';
  },

  isInterfaceDeclaration(node): node is InterfaceDeclaration {
    return (node as InterfaceDeclaration).kind === 'interface';
  },

  isNamespaceDeclaration(node): node is NamespaceDeclaration {
    return (node as NamespaceDeclaration).kind === 'namespace';
  },

  isClassDeclaration(node): node is ClassDeclaration {
    return (node as ClassDeclaration).kind === 'class';
  },

  isObjectType(node): node is ObjectType {
    return (node as ObjectType).kind === 'object';
  },

  isNamedTypeReference(node): node is NamedTypeReference {
    return (node as NamedTypeReference).kind === 'name';
  },

  isConstructorDeclaration(node): node is ConstructorDeclaration {
    return (node as ConstructorDeclaration).kind === 'constructor';
  },

  isImport(node): node is Import {
    return util.isImportAllDeclaration(node) ||
      util.isImportDeclaration(node) ||
      util.isImportNamedDeclaration(node) ||
      util.isImportDefaultDeclaration(node) ||
      util.isImportEqualsDeclaration(node);
  },

  isImportAllDeclaration(node): node is ImportAllDeclaration {
    return (node as ImportAllDeclaration).kind === 'importAll';
  },

  isImportDefaultDeclaration(node): node is ImportDefaultDeclaration {
    return (node as ImportDefaultDeclaration).kind === 'importDefault';
  },

  isImportNamedDeclaration(node): node is ImportNamedDeclaration {
    return (node as ImportNamedDeclaration).kind === 'importNamed';
  },

  isImportEqualsDeclaration(node): node is ImportEqualsDeclaration {
    return (node as ImportEqualsDeclaration).kind === 'import=';
  },

  isImportDeclaration(node): node is ImportDeclaration {
    return (node as ImportDeclaration).kind === 'import';
  },

  isCallSignature(node): node is CallSignature {
    return (node as CallSignature).kind === 'call-signature';
  },

  isConstDeclaration(node): node is ConstDeclaration {
    return (node as ConstDeclaration).kind === 'const';
  },

  isFunctionDeclaration(node): node is FunctionDeclaration {
    return (node as FunctionDeclaration).kind === 'function';
  },

  isNamespaceMember(node): node is NamespaceMember {
    return util.isFunctionDeclaration(node) ||
      util.isConstDeclaration(node) ||
      util.isClassDeclaration(node) ||
      util.isNamespaceDeclaration(node) ||
      util.isInterfaceDeclaration(node) ||
      util.isCommentDeclaration(node)||
      util.isJsDocCommentDeclaration(node)||
      util.isTypeAliasDeclaration(node)||
      util.isVariableDeclaration(node);
  },

  isCommentDeclaration(node): node is CommentDeclaration {
    return (node as CommentDeclaration).kind === 'comment';
  },

  isJsDocCommentDeclaration(node): node is JsDocCommentDeclaration {
    return (node as JsDocCommentDeclaration).kind === 'jsdoc-comment';
  },

  isTypeAliasDeclaration(node): node is TypeAliasDeclaration {
    return (node as TypeAliasDeclaration).kind === 'alias';
  },

  isVariableDeclaration(node): node is VariableDeclaration {
    return (node as VariableDeclaration).kind === 'var';
  },

  isExportEqualsDeclaration(node): node is ExportEqualsDeclaration {
    return (node as ExportEqualsDeclaration).kind === 'export=';
  },

  isExportDefaultDeclaration(node): node is ExportDefaultDeclaration {
    return (node as ExportDefaultDeclaration).kind === 'exportDefault';
  },

  isExportNameDeclaration(node): node is ExportNameDeclaration {
    return (node as ExportNameDeclaration).kind === 'exportName';
  },

  isModuleDeclaration(node): node is ModuleDeclaration {
    return (node as ModuleDeclaration).kind === 'module';
  },

  isEnumDeclaration(node): node is EnumDeclaration {
    return (node as EnumDeclaration).kind === 'enum' ;
  },

  isTopLevelDeclaration(node): node is TopLevelDeclaration {
    return util.isImport(node) ||
      util.isNamespaceDeclaration(node) ||
      util.isExportEqualsDeclaration(node) ||
      util.isExportDefaultDeclaration(node) ||
      util.isExportNameDeclaration(node) ||
      util.isModuleDeclaration(node) ||
      util.isEnumDeclaration(node);
  },

  isCanBeExportDefault(node) {
    return util.isFunctionDeclaration(node) || util.isClassDeclaration(node);
  },
};

export const create = {
  comment(comment: string, flags = CommentFlags.Wrap): CommentDeclaration {
    return {
      kind: 'comment',
      comment,
      flags,
    };
  },

  jsDocComment(jsDocComment: string, flags = CommentFlags.Wrap): JsDocCommentDeclaration {
    return {
      kind: 'jsdoc-comment',
      jsDocComment,
      flags,
    };
  },

  interface(name: string, flags = DeclarationFlags.None): InterfaceDeclaration {
    return {
      name,
      baseTypes: [],
      kind: 'interface',
      members: [],
      flags,
    };
  },

  class(name: string, flags = DeclarationFlags.None): ClassDeclaration {
    return {
      kind: 'class',
      name,
      members: [],
      implements: [],
      typeParameters: [],
      flags,
    };
  },

  typeParameter(
    name: string,
    baseType?: ObjectTypeReference | TypeParameter,
  ): TypeParameter {
    return {
      kind: 'type-parameter',
      name,
      baseType,
    };
  },

  enum(
    name: string,
    constant: boolean = false,
    flags = DeclarationFlags.None,
  ): EnumDeclaration {
    return {
      kind: 'enum',
      name,
      constant,
      members: [],
      flags,
    };
  },

  enumValue(name: string, value?: string | number): EnumMemberDeclaration {
    return {
      kind: 'enum-value',
      name,
      value,
    };
  },

  property(
    name: string,
    type: Type,
    flags = DeclarationFlags.None,
  ): PropertyDeclaration {
    return {
      kind: 'property',
      name,
      type,
      flags,
    };
  },

  method(
    name: string,
    parameters: Parameter[],
    returnType: Type,
    flags = DeclarationFlags.None,
  ): MethodDeclaration {
    return {
      kind: 'method',
      typeParameters: [],
      name,
      parameters,
      returnType,
      flags,
    };
  },

  callSignature(parameters: Parameter[], returnType: Type): CallSignature {
    return {
      kind: 'call-signature',
      typeParameters: [],
      parameters,
      returnType,
    };
  },

  function(
    name: string,
    parameters: Parameter[],
    returnType: Type,
    flags = DeclarationFlags.None,
  ): FunctionDeclaration {
    return {
      kind: 'function',
      typeParameters: [],
      name,
      parameters,
      returnType,
      flags,
    };
  },

  functionType(parameters: Parameter[], returnType: Type): FunctionType {
    return {
      kind: 'function-type',
      parameters,
      returnType,
    };
  },

  parameter(name: string, type: Type, flags = ParameterFlags.None): Parameter {
    return {
      kind: 'parameter',
      name,
      type,
      flags,
    };
  },

  constructor(
    parameters: Parameter[],
    flags = DeclarationFlags.None,
  ): ConstructorDeclaration {
    return {
      kind: 'constructor',
      parameters,
      flags,
    };
  },

  const(
    name: string,
    type: Type,
    flags = DeclarationFlags.None,
  ): ConstDeclaration {
    return {
      kind: 'const',
      name,
      type,
      flags,
    };
  },

  variable(name: string, type: Type): VariableDeclaration {
    return {
      kind: 'var',
      name,
      type,
    };
  },

  alias(
    name: string,
    type: Type,
    flags = DeclarationFlags.None,
  ): TypeAliasDeclaration {
    return {
      kind: 'alias',
      name,
      type,
      typeParameters: [],
      flags,
    };
  },

  namespace(name: string): NamespaceDeclaration {
    return {
      kind: 'namespace',
      name,
      members: [],
    };
  },

  objectType(members: ObjectTypeMember[]): ObjectType {
    return {
      kind: 'object',
      members,
    };
  },

  indexSignature(
    name: string,
    indexType: 'string' | 'number',
    valueType: Type,
  ): IndexSignature {
    return {
      kind: 'index-signature',
      name,
      indexType,
      valueType,
    };
  },

  array(type: Type): ArrayTypeReference {
    return {
      kind: 'array',
      type,
    };
  },

  namedTypeReference(name: string | NamedDeclarationBase): NamedTypeReference {
    const isNamedDeclaration = util.isNamedDeclarationBase(name);
    return {
      kind: 'name',
      name: !isNamedDeclaration
        ? name
        : util.getFullName(<NamedDeclarationBase>name),
      typeParameters: [],
    };
  },

  exportEquals(target: string): ExportEqualsDeclaration {
    return {
      kind: 'export=',
      target,
    };
  },

  exportDefault(name: string): ExportDefaultDeclaration {
    return {
      kind: 'exportDefault',
      name,
    };
  },

  exportName(name: string, as?: string): ExportNameDeclaration {
    return {
      kind: 'exportName',
      name,
      as,
    };
  },

  module(name: string): ModuleDeclaration {
    return {
      kind: 'module',
      name,
      members: [],
    };
  },

  importAll(name: string, from: string): ImportAllDeclaration {
    return {
      kind: 'importAll',
      name,
      from,
    };
  },

  importDefault(name: string, from: string): ImportDefaultDeclaration {
    return {
      kind: 'importDefault',
      name,
      from,
    };
  },

  importNamed(names: Array<{ name: string; as?: string }>, from: string): ImportNamedDeclaration {
    return {
      kind: 'importNamed',
      names,
      from,
    };
  },

  importEquals(name: string, from: string): ImportEqualsDeclaration {
    return {
      kind: 'import=',
      name,
      from,
    };
  },

  import(from: string): ImportDeclaration {
    return {
      kind: 'import',
      from,
    };
  },

  union(members: Type[]): UnionType {
    return {
      kind: 'union',
      members,
    };
  },

  intersection(members: Type[]): IntersectionType {
    return {
      kind: 'intersection',
      members,
    };
  },

  typeof(type: NamedTypeReference): TypeofReference {
    return {
      kind: 'typeof',
      type,
    };
  },

  tripleSlashReferencePathDirective(
    path: string,
  ): TripleSlashReferencePathDirective {
    return {
      kind: 'triple-slash-reference-path',
      path,
    };
  },

  tripleSlashReferenceTypesDirective(
    types: string,
  ): TripleSlashReferenceTypesDirective {
    return {
      kind: 'triple-slash-reference-types',
      types,
    };
  },

  tripleSlashReferenceNoDefaultLibDirective(
    value: boolean = true,
  ): TripleSlashReferenceNoDefaultLibDirective {
    return {
      kind: 'triple-slash-reference-no-default-lib',
      value,
    };
  },

  tripleSlashAmdModuleDirective(name?: string): TripleSlashAmdModuleDirective {
    return {
      kind: 'triple-slash-amd-module',
      name,
    };
  },
};

export const type = {
  array(type: Type): ArrayTypeReference {
    return {
      kind: 'array',
      type,
    };
  },
  stringLiteral(string: string): PrimitiveType {
    return {
      kind: 'string-literal',
      value: string,
    };
  },
  numberLiteral(number: number): PrimitiveType {
    return {
      kind: 'number-literal',
      value: number,
    };
  },
  string:  'string' as PrimitiveType,
  number:  'number' as PrimitiveType,
  boolean:  'boolean' as PrimitiveType,
  any:  'any' as PrimitiveType,
  void:  'void' as PrimitiveType,
  object:  'object' as PrimitiveType,
  null:  'null' as PrimitiveType,
  undefined:  'undefined' as PrimitiveType,
  true:  'true' as PrimitiveType,
  false:  'false' as PrimitiveType,
  this:  'this' as ThisType,
};

export const reservedWords = [
  'abstract',
  'await',
  'boolean',
  'break',
  'byte',
  'case',
  'catch',
  'char',
  'class',
  'const',
  'continue',
  'debugger',
  'default',
  'delete',
  'do',
  'double',
  'else',
  'enum',
  'export',
  'extends',
  'false',
  'final',
  'finally',
  'float',
  'for',
  'function',
  'goto',
  'if',
  'implements',
  'import',
  'in',
  'instanceof',
  'int',
  'interface',
  'let',
  'long',
  'native',
  'new',
  'null',
  'package',
  'private',
  'protected',
  'public',
  'return',
  'short',
  'static',
  'super',
  'switch',
  'synchronized',
  'this',
  'throw',
  'throws',
  'transient',
  'true',
  'try',
  'typeof',
  'var',
  'void',
  'volatile',
  'while',
  'with',
  'yield',
];

/** IdentifierName can be written as unquoted property names, but may be reserved words. */
export function isIdentifierName(s: string) {
  return /^[$A-Z_][0-9A-Z_$]*$/i.test(s);
}

/** Identifiers are e.g. legal variable names. They may not be reserved words */
export function isIdentifier(s: string) {
  return isIdentifierName(s) && reservedWords.indexOf(s) < 0;
}

function quoteIfNeeded(s: string) {
  if (isIdentifierName(s)) {
    return s;
  } else {
    // JSON.stringify handles escaping quotes for us. Handy!
    return JSON.stringify(s);
  }
}

export enum ContextFlags {
  None = 0,
  Module = 1 << 0,
  InAmbientNamespace = 1 << 1,
}

export function never(_x: never, err: string): never {
  throw new Error(err);
}

export interface EmitOptions {
  rootFlags?: ContextFlags;
  tripleSlashDirectives?: TripleSlashDirective[];
  indent?: number;
}

export function getWriter(
  rootDecl: any,
  {
    rootFlags = ContextFlags.None,
    tripleSlashDirectives = [],
    indent = 0,
  }: EmitOptions = {},
) {
  let output = '';
  let indentLevel = indent;

  const isModuleWithModuleFlag =
    rootDecl.kind === 'module' && rootFlags === ContextFlags.Module;
  // For a module root declaration we must omit the module flag.
  const contextStack: ContextFlags[] = isModuleWithModuleFlag
    ? []
    : [ rootFlags ];

  tripleSlashDirectives.forEach(writeTripleSlashDirective);

  return {
    writeAlias,
    writeClass,
    writeClassMember,
    writeConst,
    writeConstructorDeclaration,
    writeDeclaration,
    writeDelimited,
    writeEnum,
    writeEnumValue,
    writeExportDefault,
    writeExportEquals,
    writeExportName,
    writeFunction,
    writeFunctionType,
    writeImport,
    writeImportAll,
    writeImportDefault,
    writeImportNamed,
    writeInterface,
    writeMethodDeclaration,
    writeModule,
    writeNamespace,
    writeParameter,
    writeReference,
    writeTripleSlashDirective,
    writeTypeParameters,
    writeUnionReference,
    writeVar,
    get output() {
      return output;
    },
  };

  function getContextFlags() {
    return contextStack.reduce((a, b) => a | b, ContextFlags.None);
  }

  function tab() {
    const indentSpace = new Array(config.indentSpace + 1).join(' ');
    for (let i = 0; i < indentLevel; i++) {
      output = output + indentSpace;
    }
  }

  function print(s: string) {
    output = output + s;
  }

  function start(s: string) {
    tab();
    print(s);
  }

  function classFlagsToString(
    flags: DeclarationFlags | undefined = DeclarationFlags.None,
  ): string {
    let out = '';

    if (flags && flags & DeclarationFlags.Abstract) {
      out += 'abstract ';
    }

    return out;
  }

  function memberFlagsToString(
    flags: DeclarationFlags | undefined = DeclarationFlags.None,
  ): string {
    let out = '';

    if (flags & DeclarationFlags.Private) {
      out += 'private ';
    } else if (flags & DeclarationFlags.Protected) {
      out += 'protected ';
    }

    if (flags & DeclarationFlags.Static) {
      out += 'static ';
    }

    if (flags & DeclarationFlags.Abstract) {
      out += 'abstract ';
    }

    if (flags & DeclarationFlags.ReadOnly) {
      out += 'readonly ';
    }

    return out;
  }

  function startWithDeclareOrExport(
    s: string,
    flags: DeclarationFlags | undefined = DeclarationFlags.None,
    noDeclare?: boolean,
  ) {
    if (flags & DeclarationFlags.Export) {
      start(`export ${s}`);
    } else if (getContextFlags() & ContextFlags.InAmbientNamespace) {
      // Already in an all-export context
      start(s);
    } else if (flags & DeclarationFlags.ExportDefault) {
      start(`export default ${s}`);
    } else if (getContextFlags() & ContextFlags.Module) {
      start(s);
    } else if (noDeclare) {
      start(s);
    } else {
      start(`declare ${s}`);
    }
  }

  function newline() {
    output = output + config.outputEol;
  }

  function needsParens(d: Type) {
    if (typeof d === 'string') {
      return false;
    }
    switch (d.kind) {
      case 'array':
      case 'alias':
      case 'interface':
      case 'class':
      case 'union':
        return true;
      default:
        return false;
    }
  }

  function printDeclarationComments(decl: DeclarationBase) {
    if (decl.comment) {
      writeComment(decl.comment);
    }

    if (decl.jsDocComment) {
      writeJsDocComment(decl.jsDocComment);
    }
  }

  function hasFlag<T extends number>(
    haystack: T | undefined,
    needle: T,
  ): boolean;
  function hasFlag(haystack: number | undefined, needle: number) {
    if (haystack === undefined) {
      return false;
    }
    return !!(needle & haystack);
  }

  function printObjectTypeMembers(members: ObjectTypeMember[]) {
    print('{');
    if (members.length) {
      newline();
      indentLevel++;
      for (const member of members) {
        printMember(member);
      }
      indentLevel--;
      tab();
    }
    print('}');

    function printMember(member: ObjectTypeMember) {
      switch (member.kind) {
        case 'index-signature':
          printDeclarationComments(member);
          tab();
          print(`[${member.name}: `);
          writeReference(member.indexType);
          print(']: ');
          writeReference(member.valueType);
          print(';');
          newline();
          return;
        case 'call-signature': {
          printDeclarationComments(member);
          tab();
          writeTypeParameters(member.typeParameters);
          print('(');
          writeDelimited(member.parameters, ', ', writeParameter);
          print('): ');
          writeReference(member.returnType);
          print(';');
          newline();
          return;
        }
        case 'method':
          printDeclarationComments(member);
          tab();
          print(quoteIfNeeded(member.name));
          if (hasFlag(member.flags, DeclarationFlags.Optional)) print('?');
          writeTypeParameters(member.typeParameters);
          print('(');
          writeDelimited(member.parameters, ', ', writeParameter);
          print('): ');
          writeReference(member.returnType);
          print(';');
          newline();
          return;
        case 'property':
          printDeclarationComments(member);
          tab();
          if (hasFlag(member.flags, DeclarationFlags.ReadOnly)) {
            print('readonly ');
          }
          print(quoteIfNeeded(member.name));
          if (hasFlag(member.flags, DeclarationFlags.Optional)) print('?');
          print(': ');
          writeReference(member.type);
          print(';');
          newline();
          return;
        default: break;
      }
      never(member, `Unknown member kind ${(member as ObjectTypeMember).kind}`);
    }
  }

  function writeUnionReference(d: Type) {
    if (typeof d !== 'string' && d.kind === 'function-type') {
      print('(');
      writeReference(d);
      print(')');
    } else {
      writeReference(d);
    }
  }

  function writeReference(d: Type) {
    if (typeof d === 'string') {
      print(d);
    } else {
      const e = d;
      switch (e.kind) {
        case 'type-parameter':
        case 'class':
        case 'interface':
        case 'alias':
          print(util.getFullName(e));
          break;

        case 'name':
          print(e.name);
          writeTypeParameters(e.typeParameters);
          break;

        case 'array':
          if (needsParens(e.type)) print('(');
          writeReference(e.type);
          if (needsParens(e.type)) print(')');
          print('[]');
          break;

        case 'object':
          printObjectTypeMembers(e.members);
          break;

        case 'string-literal':
          print(JSON.stringify(e.value));
          break;

        case 'number-literal':
          if (isNaN(e.value)) print('typeof NaN');
          else if (!isFinite(e.value)) print('typeof Infinity');
          else print(e.value.toString());
          break;

        case 'function-type':
          writeFunctionType(e);
          break;

        case 'union':
          writeDelimited(e.members, ' | ', writeUnionReference);
          break;

        case 'intersection':
          writeDelimited(e.members, ' & ', writeUnionReference);
          break;

        case 'typeof':
          print('typeof ');
          writeReference(e.type);
          break;

        default:
          throw new Error(`Unknown kind ${d.kind}`);
      }
    }
  }

  function writeTypeParameters(params: TypeParameter[]) {
    if (params.length === 0) return;

    print('<');

    let first = true;

    for (const p of params) {
      if (!first) print(', ');

      writeReference(p);

      if (p.baseType) {
        print(' extends ');

        if (p.baseType.kind === 'type-parameter') print(p.baseType.name);
        else writeReference(p.baseType);
      }

      first = false;
    }

    print('>');
  }

  function writeInterface(d: InterfaceDeclaration) {
    printDeclarationComments(d);
    startWithDeclareOrExport(`interface ${d.name} `, d.flags, true);
    if (d.baseTypes && d.baseTypes.length) {
      print('extends ');
      writeDelimited<ObjectTypeReference>(d.baseTypes, ', ', writeReference);
    }
    printObjectTypeMembers(d.members);
    newline();
  }

  function writeFunctionType(f: FunctionType) {
    print('(');
    writeDelimited(f.parameters, ', ', writeParameter);
    print(')');
    print(' => ');
    writeReference(f.returnType);
  }

  function writeFunction(f: FunctionDeclaration) {
    printDeclarationComments(f);
    if (!isIdentifier(f.name)) {
      start(`/* Illegal function name '${f.name}' can't be used here`);
      newline();
    }

    startWithDeclareOrExport(`function ${f.name}`, f.flags);
    writeTypeParameters(f.typeParameters);
    print('(');
    writeDelimited(f.parameters, ', ', writeParameter);
    print('): ');
    writeReference(f.returnType);
    print(';');
    newline();

    if (!isIdentifier(f.name)) {
      start('*/');
      newline();
    }
  }

  function writeParameter(p: Parameter) {
    const flags = p.flags || DeclarationFlags.None;
    print(
      `${flags & ParameterFlags.Rest ? '...' : ''}${p.name}${
        flags & ParameterFlags.Optional ? '?' : ''
      }: `,
    );
    writeReference(p.type);
  }

  function writeDelimited<T>(arr: T[], sep: string, printer: (x: T) => void) {
    let first = true;
    for (const el of arr) {
      if (!first) {
        print(sep);
      }
      printer(el);
      first = false;
    }
  }

  function writeClass(c: ClassDeclaration) {
    printDeclarationComments(c);
    startWithDeclareOrExport(
      `${classFlagsToString(c.flags)}class ${c.name}`,
      c.flags,
    );
    writeTypeParameters(c.typeParameters);
    if (c.baseType) {
      print(' extends ');
      writeReference(c.baseType);
    }
    if (c.implements && c.implements.length) {
      print(' implements ');
      let first = true;
      for (const impl of c.implements) {
        if (!first) print(', ');
        writeReference(impl);
        first = false;
      }
    }
    print(' {');
    newline();
    indentLevel++;
    for (const member of c.members) {
      writeClassMember(member);
    }
    indentLevel--;
    start('}');
    newline();
  }

  function writeClassMember(c: ClassMember) {
    switch (c.kind) {
      case 'property':
        return writePropertyDeclaration(c);
      case 'method':
        return writeMethodDeclaration(c);
      case 'constructor':
        return writeConstructorDeclaration(c);
      default: break;
    }
  }

  function writeConstructorDeclaration(ctor: ConstructorDeclaration) {
    printDeclarationComments(ctor);
    start('constructor(');
    writeDelimited(ctor.parameters, ', ', writeParameter);
    print(');');
    newline();
  }

  function writePropertyDeclaration(p: PropertyDeclaration) {
    printDeclarationComments(p);
    start(`${memberFlagsToString(p.flags)}${quoteIfNeeded(p.name)}: `);
    writeReference(p.type);
    print(';');
    newline();
  }

  function writeMethodDeclaration(m: MethodDeclaration) {
    printDeclarationComments(m);
    start(`${memberFlagsToString(m.flags)}${quoteIfNeeded(m.name)}`);
    writeTypeParameters(m.typeParameters);
    print('(');
    writeDelimited(m.parameters, ', ', writeParameter);
    print('): ');
    writeReference(m.returnType);
    print(';');
    newline();
  }

  function writeNamespace(ns: NamespaceDeclaration) {
    printDeclarationComments(ns);
    startWithDeclareOrExport(`namespace ${ns.name} {`, ns.flags);
    contextStack.push(ContextFlags.InAmbientNamespace);
    newline();
    indentLevel++;
    for (const member of ns.members) {
      writeDeclaration(member);
    }
    indentLevel--;
    start('}');
    contextStack.pop();
    newline();
  }

  function writeConst(c: ConstDeclaration) {
    printDeclarationComments(c);
    startWithDeclareOrExport(`const ${c.name}: `, c.flags);
    writeReference(c.type);
    print(';');
    newline();
  }

  function writeVar(c: VariableDeclaration) {
    printDeclarationComments(c);
    startWithDeclareOrExport(`var ${c.name}: `, c.flags);
    writeReference(c.type);
    print(';');
    newline();
  }

  function writeAlias(a: TypeAliasDeclaration) {
    printDeclarationComments(a);
    startWithDeclareOrExport(`type ${a.name}`, a.flags);
    writeTypeParameters(a.typeParameters);
    print(' = ');
    writeReference(a.type);
    print(';');
    newline();
  }

  function writeExportEquals(e: ExportEqualsDeclaration) {
    start(`export = ${e.target};`);
    newline();
  }

  function writeExportDefault(e: ExportDefaultDeclaration) {
    start(`export default ${e.name};`);
    newline();
  }

  function writeExportName(e: ExportNameDeclaration) {
    start(`export { ${e.name}`);
    if (e.as) {
      print(` as ${e.as}`);
    }
    print(' };');
    newline();
  }

  function writeModule(m: ModuleDeclaration) {
    printDeclarationComments(m);
    startWithDeclareOrExport(`module '${m.name}' {`, m.flags);
    contextStack.push(ContextFlags.Module);
    newline();
    indentLevel++;
    for (const member of m.members) {
      writeDeclaration(member);
      newline();
    }
    indentLevel--;
    start('}');
    contextStack.pop();
    newline();
  }

  function writeImportAll(i: ImportAllDeclaration) {
    start(`import * as ${i.name} from '${i.from}';`);
    newline();
  }

  function writeImportDefault(i: ImportDefaultDeclaration) {
    start(`import ${i.name} from '${i.from}';`);
    newline();
  }

  function writeImportNamed(i: ImportNamedDeclaration) {
    start('import { ');
    print(i.names.map(obj => (`${obj.name}${ (obj.as && obj.as !== obj.name) ? ` as ${obj.as}` : '' }`)).join(', '));
    print(` } from '${i.from}';`);
    newline();
  }

  function writeImportEquals(i: ImportEqualsDeclaration) {
    start(`import ${i.name} = require('${i.from}');`);
    newline();
  }

  function writeImport(i: ImportDeclaration) {
    start(`import '${i.from}';`);
    newline();
  }

  function writeEnum(e: EnumDeclaration) {
    printDeclarationComments(e);
    startWithDeclareOrExport(
      `${e.constant ? 'const ' : ''}enum ${e.name} {`,
      e.flags,
    );
    newline();
    indentLevel++;
    for (const member of e.members) {
      writeEnumValue(member);
    }
    indentLevel--;
    start('}');
    newline();
  }

  function writeEnumValue(e: EnumMemberDeclaration) {
    printDeclarationComments(e);
    start(e.name);

    if (e.value) {
      if (typeof e.value === 'string') {
        print(` = "${e.value}"`);
      } else {
        print(` = ${e.value}`);
      }
    }

    print(',');
    newline();
  }

  function writeTripleSlashDirective(t: TripleSlashDirective) {
    const type =
      t.kind === 'triple-slash-amd-module' ? 'amd-module' : 'reference';
    start(`/// <${type}`);

    switch (t.kind) {
      case 'triple-slash-reference-path':
        print(` path="${t.path}"`);
        break;
      case 'triple-slash-reference-types':
        print(` types="${t.types}"`);
        break;
      case 'triple-slash-reference-no-default-lib':
        print(` no-default-lib="${t.value}"`);
        break;
      case 'triple-slash-amd-module':
        if (t.name) {
          print(` name="${t.name}"`);
        }
        break;
      default:
        never(
          t,
          `Unknown triple slash directive kind ${
            (t as TripleSlashDirective).kind
          }`,
        );
    }

    print(' />');
    newline();
  }

  function writeComment(d: CommentDeclaration) {
    if (d.flags & CommentFlags.Plain) {
      start(d.comment);
    } else {
      start(`// ${d.comment}`);
    }

    newline();
  }

  function writeJsDocComment(d: JsDocCommentDeclaration) {
    if (d.flags & CommentFlags.Plain) {
      let lineIndex = 0;
      for (const line of d.jsDocComment.split(brRegex)) {
        start(line.replace(/^ */, lineIndex === 0 ? '' : ' '));
        newline();
        lineIndex++;
      }
    } else {
      start('/**');
      newline();
      for (const line of d.jsDocComment.split(brRegex)) {
        start(` * ${line}`);
        newline();
      }
      start(' */');
      newline();
    }
  }

  function writeDeclaration(d: TopLevelDeclaration) {
    if (typeof d === 'string') {
      return print(d);
    } else {
      switch (d.kind) {
        case 'interface':
          return writeInterface(d);
        case 'function':
          return writeFunction(d);
        case 'class':
          return writeClass(d);
        case 'namespace':
          return writeNamespace(d);
        case 'const':
          return writeConst(d);
        case 'var':
          return writeVar(d);
        case 'alias':
          return writeAlias(d);
        case 'export=':
          return writeExportEquals(d);
        case 'exportDefault':
          return writeExportDefault(d);
        case 'exportName':
          return writeExportName(d);
        case 'module':
          return writeModule(d);
        case 'importAll':
          return writeImportAll(d);
        case 'importDefault':
          return writeImportDefault(d);
        case 'importNamed':
          return writeImportNamed(d);
        case 'import=':
          return writeImportEquals(d);
        case 'import':
          return writeImport(d);
        case 'enum':
          return writeEnum(d);
        case 'comment':
          return writeComment(d);
        case 'jsdoc-comment':
          return writeJsDocComment(d);

        default:
          return never(
            d,
            `Unknown declaration kind ${(d as TopLevelDeclaration).kind}`,
          );
      }
    }
  }
}

export function emit(
  rootDecl: TopLevelDeclaration | TopLevelDeclaration[],
  options: EmitOptions = {},
): string {
  if (Array.isArray(rootDecl)) {
    return rootDecl.map(decl => emit(decl, options)).join('');
  }

  const writer = getWriter(rootDecl, options);
  writer.writeDeclaration(rootDecl);
  return writer.output;
}
