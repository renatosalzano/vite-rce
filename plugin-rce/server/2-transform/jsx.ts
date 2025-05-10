import { CONFIG_ID, CREATE_REACTIVE_VALUE, GET_VALUE } from "../../constant";

import {
  acorn,
  is_partial,
  ReactiveNode,
} from "../ast";

import Transformer from "../Transformer";
import { print } from "../../utils/shortcode";

let node: ReactiveNode;
// let code: Code;

function transform_jsx(_node: ReactiveNode, jsx: acorn.CallExpression) {
  // print(node)
  node = _node;

  const [, children] = destructure_factory(jsx);

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
        const partial_props = Transformer.slice(props.start, props.end);

        Transformer.replace(h_node, `${partial_caller}(${partial_props})`);

      } else if (is_factory(h_node)) {

        const [, children] = destructure_factory(h_node);

        for (const child of children) {
          transform_factory(child)
        }

        break;


      } else if (is_map(h_node)) {
        // print(node)
        const array = Transformer.node((h_node.callee as acorn.MemberExpression).object);

        // const map_callback = code.node_string(node.arguments[0]);

        // console.log(code.node_string(node.callee))
        Transformer.replace(h_node.callee, `\nh('$for', ${array},`);

        switch (h_node.arguments[0].type) {
          case 'FunctionExpression':
          case 'ArrowFunctionExpression': {

            const params_start = Transformer.index_from(h_node.arguments[0].start, '(');
            Transformer.insert(params_start, 'h,')

          }
        }
        // code.insert(node.start, `\nh('$for', ${array}, (h)=>`);
        Transformer.insert(h_node.end, ')');

        transform_factory((h_node.arguments[0] as acorn.Function).body);
      }
      break;
    }
    case "LogicalExpression": {

      // left operator right 

      const condition = transform_condition(Transformer.node(h_node.left));

      if (!is_factory(h_node.right) && !is_map(h_node.right)) {

        Transformer.replace(
          h_node.left,
          condition
        )

        return;
      }

      const operator_end = Transformer
        .index_from(h_node.left.end, h_node.operator)
        + h_node.operator.length;

      Transformer.insert(h_node.start, `\nh('$if',${condition},(h)=>`);
      Transformer.replace({
        start: h_node.left.start,
        end: operator_end
      }, '');

      transform_factory(h_node.right);

      Transformer.insert(h_node.end, ')');

      break;
    }

    case 'ConditionalExpression': {
      // bool ? consequent : alternate

      const condition = transform_condition(Transformer.node(h_node.test));

      if (
        !is_factory(h_node.consequent)
        && !is_map(h_node.consequent)
        && !is_factory(h_node.alternate)
        && !is_map(h_node.alternate)
      ) {

        Transformer.replace(h_node.test, condition);

        if (transform_condition.transformed) {

          Transformer.insert(
            h_node.consequent.start,
            `${CONFIG_ID}.${CREATE_REACTIVE_VALUE}(`
          )

          Transformer.insert(
            h_node.consequent.end,
            ')'
          )

          Transformer.insert(
            h_node.alternate.start,
            `${CONFIG_ID}.${CREATE_REACTIVE_VALUE}(`
          )

          Transformer.insert(
            h_node.alternate.end,
            ')'
          )
        }
        print('is transformed', transform_condition.transformed)
        return;
      }

      const consequent_start = Transformer.index_from(h_node.test.end, '?');
      const alternate_start = Transformer.index_from(h_node.consequent.end, ':');

      Transformer.replace({
        start: h_node.start,
        end: consequent_start
      }, '');



      Transformer.insert(consequent_start, `\nh('$if', ${condition}, (h) =>`);

      transform_factory(h_node.consequent)

      Transformer.insert(h_node.consequent.end, '),')

      Transformer.replace(
        { start: alternate_start, end: alternate_start + 1 },
        `\nh('$if', !(${condition}), (h) =>`
      )

      transform_factory(h_node.alternate);

      Transformer.insert(h_node.alternate.end, ')')


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

  if (!node?.arguments) {
    print(node);
    return [null, []]
  }

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