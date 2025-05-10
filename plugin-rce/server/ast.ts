import * as acorn from "acorn";
import { AnyNode } from "acorn";
import { HOOK_START } from "../constant";
// import { simple, ancestor, recursive } from 'acorn-walk';

export { acorn }

export interface FunctionNode extends acorn.Function {
  tag_name?: string;
  caller_id?: string;
  type: 'FunctionDeclaration' | 'custom_element' | 'partial' | 'hook';
  stateless?: boolean;
  arrow?: boolean;
  params_start?: number;
  return_start?: number;
  jsx?: acorn.CallExpression;
  props?: Set<string>;
  props_type?: 'ObjectPattern' | 'Identifier';
  state?: Set<string>;
  hook_var?: Set<string>;
  reactive_keys_reg?: RegExp
}

export function is_factory(node: acorn.AnyNode): node is acorn.CallExpression {
  return node.type == 'CallExpression'
    && node.callee.type == 'Identifier'
    && node.callee.name == 'h';
}

export function is_partial(node: acorn.CallExpression) {
  return node.arguments[0]
    && node.arguments[0].type == 'Identifier';
}

export function is_hook(node: acorn.AnyNode): node is acorn.Identifier {
  return node.type == 'Identifier'
    && node.name.startsWith(HOOK_START);
}

export function is_block_statement(node: acorn.Function['body']): node is acorn.BlockStatement {
  return node.type == 'BlockStatement';
}

export function is_identifier(node: acorn.Node): node is acorn.Identifier {
  return node.type == 'Identifier';
}

export function is_object_pattern(node: acorn.Node): node is acorn.ObjectPattern {
  return node.type == 'ObjectPattern';
}

export function has_return(node: acorn.BlockStatement) {
  return node.body.at(-1)?.type == 'ReturnStatement';
}

export function get_tag_name(node: acorn.CallExpression) {

  const { callee } = node;

  if (callee.type == 'Identifier' && callee.name == 'h') {
    const tag_name = node.arguments?.[0];

    if (tag_name.type == 'Literal') {
      return tag_name.value as string
    }
  }
}

export type ReactiveNode = acorn.BlockStatement & {
  props: Set<string>;
  props_string: string;
  state: Set<string>;
  reactive_keys_reg: RegExp;
}

export function reactive_node(node: any, props?: Set<string>, props_string?: string): ReactiveNode {
  node.state = new Set<string>();
  if (props) node.props = props;
  if (props_string) node.props_string = props_string;
  return node;
}

export function return_keys(node, output = new Set<string>()) {

  // print(node)
  switch (node.type) {
    case 'Identifier': {
      output.add(node.name);
      break;
    };
    case 'AssignmentPattern': {

      if (node.right?.type == 'Identifier') {
        // alias
        output.add(node.right.name);
      } else {
        output.add(node.left.name);
      }
      break;
    };
    case 'ObjectPattern': {
      // console.log(node.properties)
      for (const property of node.properties) {
        if (property.value.type == 'Identifier') {
          // alias key
          output.add(property.value.name);
        } else {
          output.add(property.key.name);
        }
      };
      break;
    };
    case 'ArrayPattern': {
      for (const element of node.elements) {
        // output.push(property.key.name);
        return_keys(element, output);
      };
      break;
    }
  }

  return output;
}

type AggregateType = {
  Expression: acorn.Expression,
  Statement: acorn.Statement,
  Function: acorn.Function,
  Class: acorn.Class,
  Pattern: acorn.Pattern,
  ForInit: acorn.VariableDeclaration | acorn.Expression
}

type Visitors = {
  [type in acorn.AnyNode["type"]]?: (node: Extract<acorn.AnyNode, { type: type }>) => void
} & {
  [type in keyof AggregateType]?: (node: AggregateType[type]) => void
}


export function walk(node: AnyNode, visitors: Visitors) {
  if (!node || typeof node.type !== 'string') {
    return; // Esci se il nodo non è valido
  }

  const type = node.type as (keyof Visitors);

  // Chiama il visitatore specifico per il tipo di nodo, se esiste
  if (visitors[type] && typeof visitors[type] === 'function') {
    (visitors[type] as (node: AnyNode) => void)(node);
  }

  if (visitors.Function && typeof visitors.Function === 'function' &&
    (node.type === 'FunctionDeclaration' || node.type === 'ArrowFunctionExpression' || node.type === 'FunctionExpression')) {
    visitors.Function(node as FunctionNode);
  }

  // Continua la visita per i nodi figli (se presenti)
  for (const key in node) {
    if (node.hasOwnProperty(key) && typeof node[key] === 'object' && node[key] !== null) {
      if (Array.isArray(node[key])) {
        for (const childNode of node[key]) {
          walk(childNode, visitors);
        }
      } else {
        walk(node[key], visitors);
      }
    }
  }
}
