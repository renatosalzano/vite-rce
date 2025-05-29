import { CONFIG_ID } from "../../constant";
import { acorn, is_node, ReactiveNode } from "../ast";
import Transformer from "../Transformer";


export function transform_object($node: ReactiveNode, object: acorn.ObjectExpression) {

  for (const property of object.properties) {

    if (property.type == 'Property' && property.value) {

      if (
        property.key.type == 'Identifier'
        && property.value.type == 'Identifier'
        && property.key.name == property.value.name
        && $node.state.has(property.key.name)
      ) {

        Transformer.insert(property.key.end, `:${CONFIG_ID}(${property.key.name})`)
        continue
      }

      if (property.value) {

        if (property.value.type == 'ObjectExpression') {
          transform_object($node, property.value)
        } else {

          each_identifier(property.value, (node) => {
            if ($node.state.has(node.name)) {
              Transformer.wrap(node, `${CONFIG_ID}(`, ')')
            }
          })
        }

      }

    }
  }
}

function each_identifier(node: acorn.AnyNode, callback: (node: acorn.Identifier) => void) {

  if (!is_node(node)) return;

  if (node.type == 'Identifier') {
    callback(node)
  }

  for (const k in node) {

    if (is_node(node[k])) {
      each_identifier(node[k], callback)
    }

  }
}