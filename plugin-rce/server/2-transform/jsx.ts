import {
  acorn,
  walk,
  FunctionNode,
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

  // print(children)

  // print(code.slice(node.jsx.start, node.jsx.end))

  // walk(node.jsx, {

  //   CallExpression(node) {

  //     if (is_map(node)) {

  //       const condition = code.node_string((node.callee as acorn.MemberExpression).object);

  //       code.insert(node.start, `\nh('$for',${condition},()=>`);
  //       code.insert(node.end, ')');

  //     }
  //   },

  //   LogicalExpression(node) {

  //     const condition = code.node_string(node.left);

  //     code.insert(node.start, `\nh('$if',${condition},()=>`);
  //     code.insert(node.end, ')');

  //   },

  //   ConditionalExpression(node) {
  //     const condition = code.node_string(node.test);

  //     code.insert(node.start, `\nh('$ternary',${condition},()=>`);
  //     code.insert(node.end, ')');
  //   }
  // })
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
        const condition = code.node_string((node.callee as acorn.MemberExpression).object);
        code.insert(node.start, `\nh('$for',${condition},(h)=>`);
        code.insert(node.end, ')');

        print((node.arguments[0] as acorn.Function).body)
        print(code.node_string(node))

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