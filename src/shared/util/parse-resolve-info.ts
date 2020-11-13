import * as assert from 'assert';
import {
  getNamedType,
  isCompositeType,
  GraphQLObjectType,
  GraphQLUnionType,
  GraphQLResolveInfo,
  GraphQLField,
  GraphQLCompositeType,
  GraphQLInterfaceType,
  GraphQLNamedType,
  ASTNode,
  FieldNode,
  SelectionNode,
  FragmentSpreadNode,
  InlineFragmentNode,
  NamedTypeNode,
} from 'graphql';
import { getArgumentValues } from 'graphql/execution/values';

export interface FieldsByTypeName {
  [str: string]: {
    [str: string]: ResolveTree;
  };
}

export interface ResolveTree {
  name: string;
  alias: string;
  args: {
    [str: string]: unknown;
  };
  fieldsByTypeName: FieldsByTypeName;
}

function getArgVal(resolveInfo: GraphQLResolveInfo, argument: any) {
  if (argument.kind === 'Variable') {
    return resolveInfo.variableValues[argument.name.value];
  } else if (argument.kind === 'BooleanValue') {
    return argument.value;
  }
}

function argNameIsIf(arg: any): boolean {
  return arg && arg.name ? arg.name.value === 'if' : false;
}

function skipField(
  resolveInfo: GraphQLResolveInfo,
  { directives = [] }: SelectionNode,
) {
  let skip = false;
  directives.forEach((directive) => {
    const directiveName = directive.name.value;
    if (Array.isArray(directive.arguments)) {
      const ifArgumentAst = directive.arguments.find(argNameIsIf);
      if (ifArgumentAst) {
        const argumentValueAst = ifArgumentAst.value;
        if (directiveName === 'skip') {
          skip = skip || getArgVal(resolveInfo, argumentValueAst);
        } else if (directiveName === 'include') {
          skip = skip || !getArgVal(resolveInfo, argumentValueAst);
        }
      }
    }
  });
  return skip;
}

export interface ParseOptions {
  keepRoot?: boolean;
  deep?: boolean;
  forceParse?: boolean;
}

export function parseResolveInfo(
  resolveInfo: GraphQLResolveInfo,
): ResolveTree | null;
export function parseResolveInfo(
  resolveInfo: GraphQLResolveInfo,
  forceParse: true,
): ResolveTree;
export function parseResolveInfo(
  resolveInfo: GraphQLResolveInfo,
  options: ParseOptions,
): ResolveTree | FieldsByTypeName | null | void;
export function parseResolveInfo(
  resolveInfo: GraphQLResolveInfo,
  inOptions: ParseOptions | true = {},
): ResolveTree | FieldsByTypeName | null | void {
  const fieldNodes: ReadonlyArray<FieldNode> =
    // @ts-ignore Property 'fieldASTs' does not exist on type 'GraphQLResolveInfo'.
    resolveInfo.fieldNodes || resolveInfo.fieldASTs;
  const options = inOptions === true ? {} : inOptions;
  const forceParse = inOptions === true || inOptions.forceParse;

  const { parentType } = resolveInfo;
  if (!fieldNodes) {
    throw new Error('No fieldNodes provided!');
  }
  if (options.keepRoot == null) {
    options.keepRoot = false;
  }
  if (options.deep == null) {
    options.deep = true;
  }
  const tree = fieldTreeFromAST(
    fieldNodes,
    resolveInfo,
    undefined,
    options,
    parentType,
  );
  if (!options.keepRoot) {
    const typeKey = firstKey(tree);
    if (!typeKey) {
      if (forceParse) {
        throw new Error(
          `GraphQL schema issue: simplified parseResolveInfo failed (tree had no keys); perhaps you need to use the keepRoot option?`,
        );
      }
      return null;
    }
    const fields = tree[typeKey];
    const fieldKey = firstKey(fields);
    if (!fieldKey) {
      if (forceParse) {
        throw new Error(
          `GraphQL schema issue: simplified parseResolveInfo failed (could not get key from fields); perhaps you need to use the keepRoot option?`,
        );
      }
      return null;
    }
    return fields[fieldKey];
  }
  return tree;
}

function getFieldFromAST<TContext>(
  ast: ASTNode,
  parentType: GraphQLCompositeType,
): GraphQLField<GraphQLCompositeType, TContext> | undefined {
  if (ast.kind === 'Field') {
    const fieldNode: FieldNode = ast;
    const fieldName = fieldNode.name.value;
    if (!(parentType instanceof GraphQLUnionType)) {
      const type: GraphQLObjectType | GraphQLInterfaceType = parentType;
      return type.getFields()[fieldName];
    } else {
      // TODO: Handle GraphQLUnionType
    }
  }
  return undefined;
}

let iNum = 1;
function fieldTreeFromAST<T extends SelectionNode>(
  inASTs: ReadonlyArray<T> | T,
  resolveInfo: GraphQLResolveInfo,
  initTree: FieldsByTypeName = {},
  options: ParseOptions = {},
  parentType: GraphQLCompositeType,
  depth = '',
): FieldsByTypeName {
  const instance = iNum++;
  const { variableValues } = resolveInfo;
  const fragments = resolveInfo.fragments || {};
  const asts: ReadonlyArray<T> = Array.isArray(inASTs) ? inASTs : [inASTs];
  if (!initTree[parentType.name]) {
    initTree[parentType.name] = {};
  }
  const outerDepth = depth;
  return asts.reduce((tree, selectionVal: SelectionNode, idx) => {
    const depth = null;

    if (skipField(resolveInfo, selectionVal)) {
    } else if (selectionVal.kind === 'Field') {
      const val: FieldNode = selectionVal;
      const name = val.name.value;
      const isReserved = name[0] === '_' && name[1] === '_' && name !== '__id';
      if (isReserved) {
      } else {
        const alias: string =
          val.alias && val.alias.value ? val.alias.value : name;
        const field = getFieldFromAST(val, parentType);
        if (field == null) {
          return tree;
        }
        const fieldGqlTypeOrUndefined = getNamedType(field.type);
        if (!fieldGqlTypeOrUndefined) {
          return tree;
        }
        const fieldGqlType: GraphQLNamedType = fieldGqlTypeOrUndefined;
        const args = getArgumentValues(field, val, variableValues) || {};
        if (parentType.name && !tree[parentType.name][alias]) {
          const newTreeRoot: ResolveTree = {
            name,
            alias,
            args,
            fieldsByTypeName: isCompositeType(fieldGqlType)
              ? {
                  [fieldGqlType.name]: {},
                }
              : {},
          };
          tree[parentType.name][alias] = newTreeRoot;
        }
        const selectionSet = val.selectionSet;
        if (
          selectionSet != null &&
          options.deep &&
          isCompositeType(fieldGqlType)
        ) {
          const newParentType: GraphQLCompositeType = fieldGqlType;
          fieldTreeFromAST(
            selectionSet.selections,
            resolveInfo,
            tree[parentType.name][alias].fieldsByTypeName,
            options,
            newParentType,
            `${depth}  `,
          );
        }
      }
    } else if (selectionVal.kind === 'FragmentSpread' && options.deep) {
      const val: FragmentSpreadNode = selectionVal;
      const name = val.name && val.name.value;
      const fragment = fragments[name];
      assert(fragment, 'unknown fragment "' + name + '"');
      let fragmentType: GraphQLNamedType | null | undefined = parentType;
      if (fragment.typeCondition) {
        fragmentType = getType(resolveInfo, fragment.typeCondition);
      }
      if (fragmentType && isCompositeType(fragmentType)) {
        const newParentType: GraphQLCompositeType = fragmentType;
        fieldTreeFromAST(
          fragment.selectionSet.selections,
          resolveInfo,
          tree,
          options,
          newParentType,
          `${depth}  `,
        );
      }
    } else if (selectionVal.kind === 'InlineFragment' && options.deep) {
      const val: InlineFragmentNode = selectionVal;
      const fragment = val;
      let fragmentType: GraphQLNamedType | null | undefined = parentType;
      if (fragment.typeCondition) {
        fragmentType = getType(resolveInfo, fragment.typeCondition);
      }
      if (fragmentType && isCompositeType(fragmentType)) {
        const newParentType: GraphQLCompositeType = fragmentType;
        fieldTreeFromAST(
          fragment.selectionSet.selections,
          resolveInfo,
          tree,
          options,
          newParentType,
          `${depth}  `,
        );
      }
    }
    return tree;
  }, initTree);
}

const hasOwnProperty = Object.prototype.hasOwnProperty;
function firstKey(obj: object) {
  for (const key in obj) {
    if (hasOwnProperty.call(obj, key)) {
      return key;
    }
  }
}

function getType(
  resolveInfo: GraphQLResolveInfo,
  typeCondition: NamedTypeNode,
) {
  const { schema } = resolveInfo;
  const { kind, name } = typeCondition;
  if (kind === 'NamedType') {
    const typeName = name.value;
    return schema.getType(typeName);
  }
}
