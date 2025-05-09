import { CONFIG_ID } from "../../constant";
import { print } from "../../utils/shortcode";
import { acorn, reactive_node, walk } from "../ast";
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

  const node = reactive_node(fn_node.body)
  // transform_body()
  transform_body(node)

}

