import { acorn, type FunctionNode, return_keys, walk } from "../ast";
import { CONFIG_ID, HOOK_START, STATE } from "../../constant";
import { Code } from "..";
import { print } from "../../utils/shortcode";

function transform_body(fn_node: FunctionNode, code: Code) {

  fn_node.state = new Set<string>();
  const methods = new Set<string>();

  function parse_method(caller: string, fnode: acorn.Function) {

    const reactive_keys = new Set<string>()

    walk(fnode as acorn.AnyNode, {
      Identifier(node) {
        if (fn_node.state.has(node.name)) {
          code.insert(node.start, '_')
          reactive_keys.add(node.name);
          // methods.add(caller)
        }
      }
    });

    if (reactive_keys.size == 0) return;

    const getter_keys = [...reactive_keys].map(k => `_${k}`).join(',');
    const keys = [...reactive_keys].join(',');

    if (fnode.body.type == 'BlockStatement') {

      const [node_start, node_end] = [fnode.body.body[0].start - 1, fnode.body.body.at(-1).end + 1]
      // const index_start = code.find_index(fnode.body.start, '{');
      // const index_end = code.find_index(fnode.body.end, '{');
      code.insert(node_start, `let [${getter_keys}] = $.get(${keys});\n`);
      code.insert(node_end, `\n $.set([${keys}], [${getter_keys}]);\n`);
    }

    print(reactive_keys)

  }

  if (fn_node.body.type != 'BlockStatement') return;

  for (const node of fn_node.body.body) {

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
                  // const state_keys = [...state].map(s => `'${s}'`).join(',');

                  // print(code.node_string(_node.init))

                  // code.insert(_node.init.start, `${id}.`)
                  // code.replace(_node.init, `${CONFIG_ID}(${code.node_string(_node.init)},${state_keys})`)

                  code.replace(_node.init.callee, '$.state')

                  // code.insert(_node.init.start, `${id}.set(`);
                  // code.insert(_node.init.end, `,[${[...state].map(s => `'${s}'`).join(',')}])`);
                  // code.insert(_node.init.end, `)`);

                  state.forEach((key, index) => {
                    fn_node.state.add(key);
                  })
                  // code.insert(node.end, `${id}.set(${substring})`)
                  break;
                }

              }
              // END STATE

              if (is_hook(_node.init)) {

                const hook_keys = return_keys(_node.id);

                hook_keys.forEach((key, index) => {
                  fn_node.state.add(key);
                })

                code.insert(
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
                parse_method(_node.id.name, _node.init)
              }

              break;
            }
          }

        }
        break;
      }

      case 'FunctionDeclaration': {

        parse_method(node.id.name, node);
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