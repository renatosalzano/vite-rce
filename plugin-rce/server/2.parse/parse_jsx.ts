import {
  Node,
  FunctionNode,
  FactoryNode,
  AnyNode,
  Expression,
  ObjectExpression,
  walk,
} from "../acorn";

import { print } from "../../utils/shortcode";
import { Code } from "../";

let node: FunctionNode;
let code: Code;

function destructure_factory(node: FactoryNode) {
  const [, attributes, ...children] = node.arguments as any;

  return [
    attributes.type == 'ObjectExpression' ? attributes : null,
    children
  ] as [
      null | ObjectExpression,
      AnyNode[]
    ]
}

export function parse_jsx(_node: FunctionNode, _code: Code) {
  // print(node)
  node = _node;
  code = _code;

  const [, children] = destructure_factory(node.jsx);

  // print(children)

  // print(code.slice(node.jsx.start, node.jsx.end))

  for (const child of children) {
    parse_node(child)
  }
}


function parse_node(node: AnyNode) {

  switch (node.type) {
    case "CallExpression":
      const [, children] = destructure_factory(node);

      for (const child of children) {
        parse_node(child)
      }
      break;
    case "LogicalExpression":
      const left = code.slice(node.left.start, node.left.end);
      code.replace(node, code.slice(node.right.start, node.right.end - 1) + `, {render: ${left}})`)
      print()
  }

}


function is_factory(node: AnyNode) {
  return node.type == 'CallExpression' && node.callee.type == 'Identifier' && node.callee.name == 'h';
}


