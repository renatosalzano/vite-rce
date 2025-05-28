import { CONFIG_ID } from "../../constant";
import { acorn, is_node, ReactiveNode, walk } from "../ast";
import Transformer from "../Transformer";




export function transform_object($node: ReactiveNode, object: acorn.ObjectExpression) {



  for (const property of object.properties) {

    if (property.type == 'Property' && property.value) {

      // if ($node.state.has(property.key.))

      if (property.value) {

        switch (property.value.type) {
          case 'ObjectExpression':
            transform_object($node, property.value)
            break
          default:

            each_identifier(property.value, (node) => {
              if ($node.state.has(node.name)) {
                console.log(Transformer.node(node))
              }
            })

          // console.log(Transformer.node(property.value))
          // console.log(property.value)
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