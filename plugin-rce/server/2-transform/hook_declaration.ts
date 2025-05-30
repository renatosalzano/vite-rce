import { CONFIG_ID } from "../../constant";
import { print } from "../../utils/shortcode";
import { acorn, reactive_node, return_keys, walk } from "../ast";
import Transformer from "../Transformer";
import transform_body from "./body";

type Props = {
  id: string,
  fn_node: acorn.Function,
  is_var?: boolean
}

export function transform_hook_declaration({ id, fn_node, is_var }: Props) {

  print('transform;y', id)

  if (!is_var) {
    Transformer.replace({ start: fn_node.start, end: fn_node.id.end }, `const ${id} = (${CONFIG_ID}) =>`);
    Transformer.insert(fn_node.body.start - 1, '=>')
  } else {
    Transformer.insert(fn_node.start, `(${CONFIG_ID}) =>`)
  }

  const $node = reactive_node(fn_node.body)

  const keys = new Set<string>()

  for (const param of fn_node.params) {

    for (const key of return_keys(param)) {
      $node.features.set(key, 'hook')
    }
    // print(return_keys(param, keys))
  }

  print(keys)


  transform_body($node)

}

