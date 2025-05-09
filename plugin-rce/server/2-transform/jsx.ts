import {
  acorn,
  walk,
  FunctionNode,
  return_keys,
  is_partial,
} from "../ast";

import { CONFIG_ID, CREATE_REACTIVE_VALUE, GET_VALUE } from "../../constant";

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

  transform_condition.transformed = false;

  return condition.replace(
    node.reactive_keys_reg,
    (match) => {
      transform_condition.transformed = true;
      return `${CONFIG_ID}.${GET_VALUE}(${match})`
    }
  )
}

transform_condition.transformed = false;


function transform_factory(h_node: acorn.AnyNode) {

  switch (h_node.type) {
    case "CallExpression": {

      if (is_partial(h_node)) {

        const [caller, props] = destructure_partial(h_node);

        const partial_caller = caller.name;
        const partial_props = code.slice(props.start, props.end);

        code.replace(h_node, `${partial_caller}(${partial_props})`);

      } else if (is_factory(h_node)) {

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
    case "LogicalExpression": {

      // left operator right 

      const condition = transform_condition(code.node_string(h_node.left));

      if (!is_factory(h_node.right) && !is_map(h_node.right)) {

        code.replace(
          h_node.left,
          condition
        )

        return;
      }

      const operator_end = code
        .find_index(h_node.left.end, h_node.operator[0], true)
        + h_node.operator.length;

      code.insert(h_node.start, `\nh('$if',${condition},(h)=>`);
      code.replace({
        start: h_node.left.start,
        end: operator_end
      }, '');

      transform_factory(h_node.right);

      code.insert(h_node.end, ')');

      break;
    }

    case 'ConditionalExpression': {
      // bool ? consequent : alternate

      const condition = transform_condition(code.node_string(h_node.test));

      if (
        !is_factory(h_node.consequent)
        && !is_map(h_node.consequent)
        && !is_factory(h_node.alternate)
        && !is_map(h_node.alternate)
      ) {

        code.replace(h_node.test, condition);

        if (transform_condition.transformed) {

          code.insert(
            h_node.consequent.start,
            `${CONFIG_ID}.${CREATE_REACTIVE_VALUE}(`
          )

          code.insert(
            h_node.consequent.end,
            ')'
          )

          code.insert(
            h_node.alternate.start,
            `${CONFIG_ID}.${CREATE_REACTIVE_VALUE}(`
          )

          code.insert(
            h_node.alternate.end,
            ')'
          )
        }
        print('is transformed', transform_condition.transformed)
        return;
      }

      const consequent_start = code.find_index(h_node.test.end, '?');
      const alternate_start = code.find_index(h_node.consequent.end, ':', true);

      code.replace({
        start: h_node.start,
        end: consequent_start
      }, '');



      code.insert(consequent_start, `\nh('$if', ${condition}, (h) =>`);

      transform_factory(h_node.consequent)

      code.insert(h_node.consequent.end, '),')

      code.replace(
        { start: alternate_start, end: alternate_start + 1 },
        `\nh('$if', !(${condition}), (h) =>`
      )

      transform_factory(h_node.alternate);

      code.insert(h_node.alternate.end, ')')


      // code.insert(h_node.start, `\nh('$if', ${condition}, (c, h) =>`);
      // code.replace(h_node.test, 'c');
      // code.insert(h_node.end, ')');

      // transform_factory(h_node.consequent);
      // transform_factory(h_node.alternate);
      break;
    }
  }

}


function destructure_partial(node: acorn.CallExpression) {
  const [caller, props] = node.arguments;
  return [caller, props] as [
    acorn.Identifier,
    acorn.AnyNode
  ]
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