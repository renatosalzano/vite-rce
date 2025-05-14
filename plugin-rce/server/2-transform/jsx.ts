import { CONDITIONAL, CONFIG_ID, CREATE_REACTIVE_VALUE, GET_VALUE, HYDRATE, LIST } from "../../constant";

import {
  acorn,
  is_identifier,
  is_member_expression,
  is_partial,
  ReactiveNode,
  walk,
} from "../ast";

import Transformer from "../Transformer";
import { print } from "../../utils/shortcode";

let $node: ReactiveNode;
// let code: Code;

function transform_jsx(_node: ReactiveNode, jsx: acorn.CallExpression) {
  // print(node)
  $node = _node;

  const [_literal, _attributes, ...children] = jsx.arguments as [acorn.Literal, any, acorn.AnyNode];

  Transformer.insert(jsx.start, `${CONFIG_ID}.${HYDRATE} = (h) =>`)

  for (const child of children) {
    transform_factory(child)
  }

}


// function transform_condition(condition: string) {

//   transform_condition.transformed = false;

//   return condition.replace(
//     $node.reactive_keys_reg,
//     (match) => {
//       transform_condition.transformed = true;
//       return `${CONFIG_ID}.${GET_VALUE}(${match})`
//     }
//   )
// }

// transform_condition.transformed = false;


function transform_factory(h_node: acorn.AnyNode) {

  switch (h_node.type) {
    case "CallExpression": {

      if (is_partial(h_node)) {

        const [caller, props] = destructure_partial(h_node);

        const partial_caller = caller.name;
        const partial_props = Transformer.slice(props.start, props.end);

        Transformer.replace(h_node, `${partial_caller}(${partial_props})`);

      } else if (is_factory(h_node)) {

        const [attributes, children] = destructure_factory(h_node);

        // print(attributes)
        if (attributes) {

          for (const property of attributes) {
            transform_factory(property.value)
          }

        }


        for (const child of children) {
          transform_factory(child)
        }

        break;


      } else if (is_map(h_node)) {

        Transformer.insert(h_node.start, `$.${LIST}(()=>`)

        const me = h_node.callee as acorn.MemberExpression;

        const deps = new Set<string>();

        walk(me.object, {
          Identifier(id) {
            if ($node.state.has(id.name)) {
              deps.add(id.name);
              Transformer.wrap(id, `${CONFIG_ID}(`, ')')
            }
          }
        })

        const deps_string = [...deps].join(',')

        Transformer.insert(h_node.end, `, [${deps_string}]`)

        // const map_callback = code.node_string(node.arguments[0]);

        // console.log(code.node_string(node.callee))
        // Transformer.replace(h_node.callee, `$.${LIST}(${array},`);

        // switch (h_node.arguments[0].type) {
        //   case 'FunctionExpression':
        //   case 'ArrowFunctionExpression': {

        //     const params_start = Transformer.index_from(h_node.arguments[0].start, '(');
        //     // Transformer.insert(params_start, 'h,')

        //   }
        // }

        Transformer.insert(h_node.end, ')');

        transform_factory((h_node.arguments[0] as acorn.Function).body);
      }
      break;
    }
    case "LogicalExpression": {

      // left operator right

      Transformer.insert(h_node.start, `\n${CONFIG_ID}.${CONDITIONAL}(()=>`)

      const deps = new Set<string>();

      walk(h_node.left, {
        Identifier(id) {
          if ($node.state.has(id.name)) {
            deps.add(id.name);
            Transformer.wrap(id, `${CONFIG_ID}(`, ')')
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
        // Transformer.insert(h_node.right.start, '(h) =>')
        transform_factory(h_node.right);
      }

      Transformer.insert(h_node.end, ')');

      break;
    }

    case 'ConditionalExpression': {

      // bool ? consequent : alternate

      conditional_expr(
        h_node,
        (node) => {
          if (is_factory(node)) {
            transform_factory(node);
          }
        }
      )


      break;
    }
  }

}


function logical_expr(node: acorn.LogicalExpression) {

}

function conditional_expr(
  node: acorn.ConditionalExpression,
  callback: (node: acorn.AnyNode) => void,
) {

  Transformer.insert(node.start - 1, `\n${CONFIG_ID}.${CONDITIONAL}(()=>`)

  const deps = new Set<string>();

  walk(node.test, {
    Identifier(id) {
      if ($node.state.has(id.name)) {
        deps.add(id.name);
        Transformer.wrap(id, `${CONFIG_ID}(`, ')')
      }
    }
  })

  const deps_string = [...deps].join(',')

  Transformer.insert(node.test.end, `,[${deps_string}]`)

  const consequent_start = Transformer.index_from(node.test.end, '?');
  const alternate_start = Transformer.index_from(node.consequent.end, ':');

  // print(Transformer.slice(consequent_start, consequent_start + 1))

  Transformer.replace({ start: consequent_start, end: consequent_start + 1 }, ',')

  callback(node.consequent);
  // if (is_factory(node.consequent)) {
  //   // Transformer.insert(h_node.consequent.start, '(h) =>')
  //   transform_factory(node.consequent);
  // }


  Transformer.replace({ start: alternate_start, end: alternate_start + 1 }, ',')

  callback(node.alternate);

  // if (is_factory(node.alternate)) {
  //   // Transformer.insert(h_node.alternate.start, '(h) =>')
  //   transform_factory(node.alternate);
  // }

  Transformer.insert(node.end, ')')
}


function destructure_partial(node: acorn.CallExpression) {
  const [caller, props] = node.arguments;
  return [caller, props] as [
    acorn.Identifier,
    acorn.AnyNode
  ]
}

function destructure_factory(node: acorn.CallExpression): [null | acorn.Property[], acorn.AnyNode[]] {

  if (!node?.arguments) {
    print(node);
    return [null, []]
  }

  const [, attributes, ...children] = node.arguments as any;

  return [
    attributes.type == 'ObjectExpression' ? attributes.properties : null,
    children
  ] as [
      null | acorn.Property[],
      acorn.AnyNode[]
    ]
}


function is_factory(node: acorn.AnyNode) {
  return node.type == 'CallExpression' && node.callee.type == 'Identifier' && node.callee.name == 'h';
}


function is_map(node: acorn.CallExpression) {

  if (is_member_expression(node.callee)) {

    if (is_identifier(node.callee.property)) {
      return node.callee.property.name == 'map';
    }

  }


  return false;
}

export default transform_jsx;