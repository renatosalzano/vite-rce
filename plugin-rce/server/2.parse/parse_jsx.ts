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
    case "CallExpression": {

      if (is_factory(node)) {
        const [, children] = destructure_factory(node);

        for (const child of children) {
          parse_node(child)
        }

        break;

      } else if (is_map(node)) {
        // print(node)
        if (node.arguments[0].type == 'ArrowFunctionExpression' || node.arguments[0].type == 'FunctionExpression') {
          // const dep = node.obj
          // const dep = (node.callee as any).object.name;
          // code.replace(node, code.slice(node.arguments[0].body.start, node.arguments[0].body.end - 1) + `,{map: ${dep}})`)
          // print(code.slice(node.arguments[0].body.start, node.arguments[0].body.end - 1))
          // print(code.slice(node.start, node.end))
          code.insert(node.start, `h('$for', ()=>`);
          code.insert(node.end, ')')

          parse_node(node.arguments[0]);
        }

      }
      break;
    }
    case "LogicalExpression":
      // print(node.operator)

      const op_index = code.find_index(node.start, node.operator[0], true);

      code.insert(node.start, `h('$if',`);
      code.replace({ start: op_index, end: op_index + node.operator.length }, ',');
      code.insert(node.end, ')');

      parse_node(node.right);
      break;

    case 'ConditionalExpression': {
      code.insert(node.start, `h('$ternary',`);
      code.insert(node.end, ')');

      parse_node(node.consequent);
      parse_node(node.alternate);
      break;
    }
  }

}


function is_factory(node: AnyNode) {
  return node.type == 'CallExpression' && node.callee.type == 'Identifier' && node.callee.name == 'h';
}


function is_map(node: AnyNode) {
  return node.type == 'CallExpression'
    && node.callee.type == 'MemberExpression'
    && node.callee.property.type == 'Identifier'
    && node.callee.property.name == 'map'
}

