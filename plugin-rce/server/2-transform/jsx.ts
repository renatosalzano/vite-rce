import {
  acorn,
  walk,
  FunctionNode,
  return_keys,
} from "../acorn";

import { print } from "../../utils/shortcode";
import { Code } from "..";

let node: FunctionNode;
let code: Code;

function transform_jsx(_node: FunctionNode, _code: Code) {
  // print(node)
  node = _node;
  code = _code;

  const [, children] = destructure_factory(node.jsx);

  for (const child of children) {
    transform_factory(child)
  }

}


function transform_factory(node: acorn.AnyNode) {

  switch (node.type) {
    case "CallExpression": {

      if (is_factory(node)) {
        const [, children] = destructure_factory(node);

        for (const child of children) {
          transform_factory(child)
        }

        break;

      } else if (is_map(node)) {
        // print(node)
        const array = code.node_string((node.callee as acorn.MemberExpression).object);

        // const map_callback = code.node_string(node.arguments[0]);

        // console.log(code.node_string(node.callee))
        code.replace(node.callee, `\nh('$for', ${array},`);

        let params = 'h';

        switch (node.arguments[0].type) {
          case 'FunctionExpression':
          case 'ArrowFunctionExpression': {

            const params_start = code.find_index(node.arguments[0].start, '(');
            code.insert(params_start, 'h,')

          }
        }
        // code.insert(node.start, `\nh('$for', ${array}, (h)=>`);
        code.insert(node.end, ')');

        transform_factory((node.arguments[0] as acorn.Function).body);
      }
      break;
    }
    case "LogicalExpression":
      // print(node.operator)

      const condition = code.node_string(node.left);
      code.insert(node.start, `\nh('$if',${condition},(h)=>`);
      code.insert(node.end, ')');
      break;

    case 'ConditionalExpression': {
      const condition = code.node_string(node.test);

      code.insert(node.start, `\nh('$ternary',${condition},(h)=>`);
      code.insert(node.end, ')');
      break;
    }
  }

}


function destructure_factory(node: acorn.CallExpression) {
  const [, attributes, ...children] = node.arguments as any;

  return [
    attributes.type == 'ObjectExpression' ? attributes : null,
    children
  ] as [
      null | acorn.ObjectExpression,
      acorn.AnyNode[]
    ]
}


function is_factory(node: acorn.AnyNode) {
  return node.type == 'CallExpression' && node.callee.type == 'Identifier' && node.callee.name == 'h';
}


function is_map(node: acorn.AnyNode) {
  return node.type == 'CallExpression'
    && node.callee.type == 'MemberExpression'
    && node.callee.property.type == 'Identifier'
    && node.callee.property.name == 'map'
}

export default transform_jsx;