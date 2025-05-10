import { acorn, get_tag_name, is_factory } from "../ast";
import { is_custom_element } from "../utils";

function parse_body_return(body: acorn.BlockStatement) {

  let type: 'custom_element' | 'component'
  let tag_name: string
  let jsx_node: acorn.CallExpression

  let return_count = 0;

  for (const node of body.body) {

    if (node.type == 'ReturnStatement') {

      return_count++;

      if (is_factory(node.argument)) {

        tag_name = get_tag_name(node.argument);

        if (tag_name && is_custom_element(tag_name)) {
          type = 'custom_element'
        } else {
          type = 'component'
        }

        jsx_node = node.argument

      }
    }
  }

  if (type && return_count > 1) {
    throw 'must have one jsx return'
  }

  return {
    type,
    tag_name,
    jsx_node
  }
}

export default parse_body_return;