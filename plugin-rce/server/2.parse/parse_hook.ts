import { Code } from "../";
import { FunctionNode } from "../acorn";
import { print } from "../../utils/shortcode";
import parse_body from "./parse_body";

function parse_hook(node: FunctionNode, code: Code) {
  // code.replace(node, `function ${node.caller_id}(_c) {
  //   const h = ${code.slice(node.start, node.end)}
  //   return h;
  // }`)

  if (node.arrow) {

    code.insert(
      node.start - 1,
      `(_c) => `
    )

  } else {

    code.insert(
      node.start - 1,
      `\nconst ${node.caller_id} = (_c) => `
    )

  }



  parse_body('_c', node, code);
  // print(code.slice(node.start, node.end))
}

export default parse_hook;