import { acorn, type FunctionNode, type FunctionBody, return_keys, walk } from "../acorn";
import { Code } from "../";
import { HOOK_START, STATE } from "../constant";

function parse_body(id: string, fn_node: FunctionNode, code: Code) {

  fn_node.state = new Set<string>()

  walk(fn_node.body, {
    VariableDeclaration(node) {
      for (const var_node of node.declarations) {
        switch (var_node.init?.type) {
          case 'CallExpression': {
            // STATE
            if (node.kind == 'let') {

              if (is_state(var_node.init)) {

                if (var_node.init.arguments.length > 1) {
                  throw '$state must have 1 argument'
                }

                const state = return_keys(var_node.id);

                // const keys = [...state].join(',');

                // print(code.slice(var_node.init.start, var_node.init.end))
                const substring = code.slice(var_node.init.start, var_node.init.end);

                code.replace(
                  var_node.init,
                  `${id}.set(${substring},[${[...state].map(s => `'${s}'`).join(',')}])`
                )

                state.forEach(s => { fn_node.state.add(s) })

                // code.insert(node.end, `${id}.set(${substring})`)

                continue;
              }

              if (is_hook(var_node.init)) {

                code.insert(
                  var_node.init.callee.end,
                  `(${id})`
                )

                continue;
              }

            }
          }
        }
      }
    },

    Function(node) {

      let state_match = new Set<string>()

      walk(node, {
        Identifier(id_node) {

          if (fn_node.state.has(id_node.name)) state_match.add(id_node.name)
        }
      })

      if (node.body.type == 'BlockStatement') {
        code.insert(node.body.end - 1, `${id}.batch({ ${[...state_match].join(',')} });`)
      }
    }
  })
}


function is_state(node: acorn.CallExpression) {
  return node.callee.type == 'Identifier' && node.callee.name == STATE;
}

function is_hook(node: acorn.CallExpression) {
  return node.callee.type == 'Identifier' && node.callee.name.startsWith(HOOK_START);
}

export default parse_body;