import { Code } from "..";
import { FunctionNode } from "../ast";
import { CONFIG_ID } from "../../constant";;
import transform_body from "./function_body";
// import { print } from "../../utils/shortcode";

function parse_hook(node: FunctionNode, code: Code) {
  // code.replace(node, `function ${node.caller_id}(_c) {
  //   const h = ${code.slice(node.start, node.end)}
  //   return h;
  // }`)

  if (node.arrow) {

    code.insert(
      node.start - 1,
      `(${CONFIG_ID}) => `
    )

  } else {

    code.insert(
      node.start - 1,
      `\nconst ${node.caller_id} = (${CONFIG_ID}) => `
    )

  }


  transform_body(node, code);
  // print(code.slice(node.start, node.end))
}

export default parse_hook;