import { CONDITIONAL, CONFIG_ID, CREATE_REACTIVE_VALUE, GET_VALUE, HYDRATE } from "../../constant";

import {
  acorn,
  is_partial,
  ReactiveNode,
  walk,
} from "../ast";

import Transformer from "../Transformer";
import { print } from "../../utils/shortcode";

let node: ReactiveNode;
// let code: Code;

function transform_jsx(_node: ReactiveNode, jsx: acorn.CallExpression) {
  // print(node)
  node = _node;

  const [literal, attributes, ...children] = jsx.arguments as [acorn.Literal, any, acorn.AnyNode];

  print(jsx.start)


  if (node.tag_name == literal.value) {

    Transformer.replace({
      start: jsx.start,
      end: attributes.end + 1
    },
      `${CONFIG_ID}.${HYDRATE} = (h) => (`
    );

    for (const child of children) {
      transform_factory(child)
    }

  }


  // const [, children] = destructure_factory(jsx);

  // for (const child of children) {
  //   transform_factory(child)
  // }

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


      Transformer.insert(h_node.start, `\n${CONFIG_ID}.${CONDITIONAL}(`)

      const deps = new Set<string>();

      walk(h_node.left, {
        Identifier(id) {
          if (node.state.has(id.name)) {
            deps.add(id.name);
            Transformer.wrap(id, `${CONFIG_ID}.${GET_VALUE}(`, ')')
          }
        }
      })

      const deps_string = [...deps].join(',')

      Transformer.insert(h_node.left.end, `,[${deps_string}]`)

      // const condition = transform_condition(Transformer.node(h_node.left));


      const operator_start = Transformer.index_from(h_node.left.end, h_node.operator);

      Transformer.replace({
        start: operator_start,
        end: operator_start + h_node.operator.length
      }, ',')

      if (is_factory(h_node.right)) {
        Transformer.insert(h_node.right.start, '() =>')
        transform_factory(h_node.right);
      }

      Transformer.insert(h_node.end, ')');

      break;
    }

    case 'ConditionalExpression': {
      // bool ? consequent : alternate

      Transformer.insert(h_node.start - 1, `\n${CONFIG_ID}.${CONDITIONAL}(`)

      const deps = new Set<string>();

      walk(h_node.test, {
        Identifier(id) {
          if (node.state.has(id.name)) {
            deps.add(id.name);
            Transformer.wrap(id, `${CONFIG_ID}.${GET_VALUE}(`, ')')
          }
        }
      })

      const deps_string = [...deps].join(',')

      Transformer.insert(h_node.test.end, `,[${deps_string}]`)

      const consequent_start = Transformer.index_from(h_node.test.end, '?');
      const alternate_start = Transformer.index_from(h_node.consequent.end, ':');

      // print(Transformer.slice(consequent_start, consequent_start + 1))

      Transformer.replace({ start: consequent_start, end: consequent_start + 1 }, ',')

      if (is_factory(h_node.consequent)) {
        Transformer.insert(h_node.consequent.start, '() =>')
        transform_factory(h_node.consequent);
      }


      Transformer.replace({ start: alternate_start, end: alternate_start + 1 }, ',')

      if (is_factory(h_node.alternate)) {
        Transformer.insert(h_node.alternate.start, '() =>')
        transform_factory(h_node.alternate);
      }

      Transformer.insert(h_node.end, ')')
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