import { CONFIG_ID } from "../../constant";
import { Code } from "../";
import { FunctionNode } from "../ast";


function transform_partial(node: FunctionNode, code: Code) {

  const params_start = code.find_index(node.id.end, '(');

  code.insert(params_start, `${CONFIG_ID},`)
  code.insert(node.jsx.start, `() =>`)
  // transform_jsx(node, code)

}




export default transform_partial;