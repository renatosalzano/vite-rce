import * as acorn from "acorn";
import { Expression, SpreadElement, ObjectExpression, AnyNode } from "acorn";
import { simple } from 'acorn-walk';

export interface FunctionNode extends acorn.Function {
  tag_name?: string;
  caller_id?: string;
  component_id?: string;
  type: 'FunctionDeclaration' | 'custom_element' | 'partial' | 'hook'
  stateless?: boolean;
  arrow?: boolean;
  jsx?: FactoryNode;
  props?: Set<string>;
  state?: Set<string>;
  return_deps?: (code: string) => string[]
}

export type FunctionBody = acorn.BlockStatement | acorn.Expression;
export type Node = acorn.Node;
export type FactoryNode = acorn.CallExpression;
export type {
  Expression,
  SpreadElement,
  ObjectExpression,
  AnyNode
}

function return_keys(node, output = new Set<string>()) {

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


export {
  acorn,
  return_keys,
  simple as walk
}
