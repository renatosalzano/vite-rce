import { acorn, FeatureTypes, is_identifier, type ReactiveNode, return_keys, walk } from "../ast";
import { CONFIG_ID, HOOK_REF, HOOK_START, STATE } from "../../constant";
import Transformer from "../Transformer";
import { transform_object } from "./object";

function transform_body($node: ReactiveNode) {

  function parse_features_keys(node: acorn.AnyNode, type: FeatureTypes) {

    walk(node, {
      Identifier(id) {

        if (id.name == CONFIG_ID) {
          throw '$ is reserved keyword';
        }

        $node.features.set(id.name, type)

      }
    })
  }

  function parse_method(node: acorn.Function) {

    const features_keys = new Set<string>()

    walk(node as acorn.AnyNode, {
      Identifier(node) {

        if ($node.features.has(node.name)) {

          Transformer.insert(node.start, '_');
          features_keys.add(node.name);
          // methods.add(caller)
        }

      }
    });

    if (features_keys.size == 0) return;

    const getter_keys = [...features_keys].map(k => `_${k}`).join(',');
    const keys = [...features_keys].join(',');

    if (node.body.type == 'BlockStatement') {

      Transformer.insert(node.body.start + 1, `\nlet [${getter_keys}] = $([${keys}]);\n`);
      Transformer.insert(node.body.end - 1, `\n$.set([${keys}], [${getter_keys}]);\n`);
    } else {

      console.log('TODO')
    }

  }

  for (const node of $node.body) {

    switch (node.type) {

      case 'VariableDeclaration': {

        for (const _node of node.declarations) {

          // print(_node.init.type)

          switch (_node.init?.type) {

            case 'CallExpression': {

              // #region STATE

              if (node.kind == 'let') {

                if (is_state(_node.init)) {

                  if (_node.init.arguments.length > 1) {
                    throw '$state must have 1 argument'
                  }

                  parse_features_keys(_node.id, 'state')

                  Transformer.replace(_node.init.callee, '$.state')

                  // state.forEach((key) => {
                  //   $node.state.add(key);
                  // })
                  break;
                }

              }
              // #region REF

              if (is_ref(_node.init)) {

                // parse_state_keys(_node.id)

                parse_features_keys(_node.id, 'ref')

                Transformer.replace(_node.init.callee, '$.ref')

                break;
              }

              if (is_hook(_node.init)) {

                parse_features_keys(_node.id, 'hook')

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

            case 'ObjectExpression': {

              transform_object($node, _node.init)
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

  // $node.reactive_keys_reg = $node.state.size == 0
  //   ? undefined
  //   : new RegExp([...$node.state].join('|'), 'g');

}



function is_state(node: acorn.CallExpression) {
  return node.callee.type == 'Identifier' && node.callee.name == STATE;
}


function is_hook(node: acorn.CallExpression) {
  return node.callee.type == 'Identifier' && node.callee.name.startsWith(HOOK_START);
}


function is_ref(node: acorn.CallExpression) {
  return node.callee.type == 'Identifier' && node.callee.name == HOOK_REF;
}

export default transform_body;