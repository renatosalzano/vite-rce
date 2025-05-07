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


function transform_condition(condition: string) {
  return condition.replace(
    node.reactive_keys_reg,
    (match) => {
      console.log('match', match);
      return `$.get_value(${match})`
    }
  )
}


function transform_factory(h_node: acorn.AnyNode) {

  switch (h_node.type) {
    case "CallExpression": {

      if (is_factory(h_node)) {
        const [, children] = destructure_factory(h_node);

        for (const child of children) {
          transform_factory(child)
        }

        break;

      } else if (is_map(h_node)) {
        // print(node)
        const array = code.node_string((h_node.callee as acorn.MemberExpression).object);

        // const map_callback = code.node_string(node.arguments[0]);

        // console.log(code.node_string(node.callee))
        code.replace(h_node.callee, `\nh('$for', ${array},`);

        switch (h_node.arguments[0].type) {
          case 'FunctionExpression':
          case 'ArrowFunctionExpression': {

            const params_start = code.find_index(h_node.arguments[0].start, '(');
            code.insert(params_start, 'h,')

          }
        }
        // code.insert(node.start, `\nh('$for', ${array}, (h)=>`);
        code.insert(h_node.end, ')');

        transform_factory((h_node.arguments[0] as acorn.Function).body);
      }
      break;
    }
    case "LogicalExpression":

      const condition = transform_condition(code.node_string(h_node.left));

      code.insert(h_node.start, `\nh('$if',${condition},(c, h)=>`);
      code.replace(h_node.left, 'c');
      code.insert(h_node.end, ')');

      break;

    case 'ConditionalExpression': {
      const condition = transform_condition(code.node_string(h_node.test));

      print(condition)

      code.insert(h_node.start, `\nh('$ternary',${condition},(c, h)=>`);
      code.replace(h_node.test, 'c');
      code.insert(h_node.end, ')');
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