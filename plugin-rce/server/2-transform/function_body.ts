import { acorn, type FunctionNode, type FunctionBody, return_keys, walk, recursive, ancestor, AnyNode } from "../acorn";
import { Code } from "..";
import { HOOK_START, STATE, CONFIG_ID } from "../constant";
import { print } from "../../utils/shortcode";

function transform_body(fn_node: FunctionNode, code: Code) {

  fn_node.state = [];
  const methods = new Set<string>();

  function parse_method(caller: string, node: AnyNode) {

    walk(node, {
      Identifier(id_node) {
        const state_index = fn_node.state.indexOf(id_node.name);
        if (state_index != -1) {
          // code.replace(id_node, `${CONFIG_ID}[${state_index}]`);
          methods.add(caller);
        }
      }
    })

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
                    if (fn_node.state.indexOf(index) == -1) {
                      fn_node.state.push(key)
                    }
                  })
                  // code.insert(node.end, `${id}.set(${substring})`)
                  break;
                }

              }
              // END STATE

              if (is_hook(_node.init)) {

                const hook_keys = return_keys(_node.id);

                hook_keys.forEach((key, index) => {
                  if (fn_node.state.indexOf(index) == -1) {
                    fn_node.state.push(key)
                  }
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

  // print(methods)

  code.insert(fn_node.return_start, `${CONFIG_ID}.methods = new Set([${[...methods].join(',')}]);\n`)

  // code.insert(fn_node.return_start, `${id}.methods({ add, minus });\n`);
  // code.insert(fn_node.return_start, `${CONFIG_ID}.batch = () => ({${[...fn_node.state].join(',')}});\n`);


  // walk(fn_node.body, {
  //   VariableDeclaration(node) {

  //     for (const var_node of node.declarations) {
  //       switch (var_node.init?.type) {
  //         case 'CallExpression': {
  //           // STATE
  //           if (node.kind == 'let') {

  //             if (is_state(var_node.init)) {

  //               if (var_node.init.arguments.length > 1) {
  //                 throw '$state must have 1 argument'
  //               }

  //               const state = return_keys(var_node.id);

  //               // const keys = [...state].join(',');

  //               // print(code.slice(var_node.init.start, var_node.init.end))
  //               // const substring = code.slice(var_node.init.start, var_node.init.end);

  //               // code.replace(
  //               //   var_node.init,
  //               //   `${id}.set(${substring},[${[...state].map(s => `'${s}'`).join(',')}])`
  //               // )
  //               code.insert(var_node.init.start, `${id}.set(`);
  //               code.insert(var_node.init.end, `,[${[...state].map(s => `'${s}'`).join(',')}])`)

  //               state.forEach(s => { fn_node.state.add(s) })

  //               // code.insert(node.end, `${id}.set(${substring})`)

  //               continue;
  //             }

  //             if (is_hook(var_node.init)) {

  //               code.insert(
  //                 var_node.init.callee.end,
  //                 `(${id})`
  //               )

  //               continue;
  //             }

  //           }
  //         }
  //       }
  //     }
  //   },

  //   Function(node) {

  //     let state_match = new Set<string>();

  //     // esbuild rename shadowed Identifiers

  //     // const params = new Set<string>();
  //     // for (const param of node.params) {
  //     //   return_keys(param, params)
  //     // }


  //     walk(node.body, {

  //       Identifier(id_node) {
  //         if (/* !params.has(id_node.name) &&  */fn_node.state.has(id_node.name)) {
  //           state_match.add(id_node.name);
  //         }
  //       }
  //     });

  //     if (state_match.size) {
  //       console.log(state_match)
  //       console.log(code.slice(node.start, node.end))

  //       if (node.body.type == 'BlockStatement') {

  //         console.log(node.id.name)
  //       }
  //     }

  //   }
  // })



}





function is_state(node: acorn.CallExpression) {
  return node.callee.type == 'Identifier' && node.callee.name == STATE;
}


function is_hook(node: acorn.CallExpression) {
  return node.callee.type == 'Identifier' && node.callee.name.startsWith(HOOK_START);
}


export default transform_body;