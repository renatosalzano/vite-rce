import { acorn, type ReactiveNode } from "../ast";
import { CONFIG_ID, HYDRATE } from "../../constant";
import transform_jsx from "./jsx";
import Transformer from "../Transformer";
import transform_body from "./body";

function transform_custom_element(node: ReactiveNode, tag_name: string, jsx_node: acorn.CallExpression) {

  Transformer.insert(
    node.start + 1,
    `\n const ${CONFIG_ID} = create(${node.props_string}, '${tag_name}');`
  )

  transform_body(node);
  transform_jsx(node, jsx_node);

  Transformer.wrap(jsx_node, `${CONFIG_ID}.${HYDRATE} = (h) =>`, `, ${CONFIG_ID}`);
  Transformer.insert(-1, `register();\n`)
}

export default transform_custom_element;