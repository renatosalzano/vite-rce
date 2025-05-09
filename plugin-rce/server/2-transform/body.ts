import { acorn, type ReactiveNode, return_keys, walk } from "../ast";
import { CONFIG_ID, HOOK_START, STATE } from "../../constant";
import Transformer from "../Transformer";

function transform_body($node: ReactiveNode) {

  function parse_method(node: acorn.Function) {

    const reactive_keys = new Set<string>()

    walk(node as acorn.AnyNode, {
      Identifier(node) {
        if ($node.state.has(node.name)) {

          Transformer.insert(node.start, '_');
          reactive_keys.add(node.name);
          // methods.add(caller)
        }
      }
    });

    if (reactive_keys.size == 0) return;

    const getter_keys = [...reactive_keys].map(k => `_${k}`).join(',');
    const keys = [...reactive_keys].join(',');

    if (node.body.type == 'BlockStatement') {

      const [node_start, node_end] = [node.body.body[0].start - 1, node.body.body.at(-1).end + 1]
      // const index_start = code.find_index(fnode.body.start, '{');
      // const index_end = code.find_index(fnode.body.end, '{');
      Transformer.insert(node_start, `\tlet [${getter_keys}] = $.get(${keys});\n`);
      Transformer.insert(node_end, `\n\t$.set([${keys}], [${getter_keys}]);\n`);
    }

  }

  for (const node of $node.body) {

    switch (node.type) {

      case 'VariableDeclaration': {

        for (const _node of node.declarations) {

          // print(_node.init.type)

          switch (_node.init?.type) {

            case 'CallExpression': {

              // STATE

              if (node.kind == 'let') {

                if (is_state(_node.init)) {

                  if (_node.init.arguments.length > 1) {
                    throw '$state must have 1 argument'
                  }

                  const state = return_keys(_node.id);

                  Transformer.replace(_node.init.callee, '$.state')

                  state.forEach((key) => {
                    $node.state.add(key);
                  })
                  break;
                }

              }
              // END STATE

              if (is_hook(_node.init)) {

                const hook_keys = return_keys(_node.id);

                hook_keys.forEach((key) => {
                  $node.state.add(key);
                })

                Transformer.insert(
                  _node.init.callee.end,
                  `(${CONFIG_ID})`
                )

                break;
              }
              break;
            }

            case 'ArrowFunctionExpression':
            case 'FunctionExpression': {

              if (_node.id.type == 'Identifier') {
                parse_method(_node.init)
              }

              break;
            }
          }

        }
        break;
      }

      case 'FunctionDeclaration': {

        parse_method(node);
        break;
      }
    }


  }
}

function is_state(node: acorn.CallExpression) {
  return node.callee.type == 'Identifier' && node.callee.name == STATE;
}


function is_hook(node: acorn.CallExpression) {
  return node.callee.type == 'Identifier' && node.callee.name.startsWith(HOOK_START);
}

export default transform_body;