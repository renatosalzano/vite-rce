import { type FunctionNode, return_keys } from "../acorn";
import { Code } from "../";
import parse_body from "./parse_body";
import { parse_jsx } from "./parse_jsx";

let component_id = '';

export function parse_custom_element(node: FunctionNode, code: Code) {

  node.props = parse_props(node.params);
  // print(props_keys)

  component_id = node.component_id;
  // print(code.slice(node.start, node.body.start))

  const _props_keys = [...node.props].join(',')

  code.insert(
    0,
    `let ${component_id} = createConfig('${node.tag_name}');\n`
  )



  if (node.stateless) {

    // const replace = `(${component_id}.props(${_props_keys}), ${code.slice(node.body.start, node.body.end)})`
    code.insert(node.body.start, `(${component_id}.props(${_props_keys}), ${component_id}.render = (h) =>`)
    code.insert(node.body.end, ')')

  } else {
    let index = code.find_index(node.body.start, "{");
    code.insert(index, `\n${component_id}.props(${_props_keys});\n`);
    code.insert(node.jsx.start, `${component_id}.render = (h) =>`);
  }

  if (!node.stateless) {
    parse_body(component_id, node, code)
  }

  node.return_deps = (code: string) => {
    const reg = new RegExp([...node.state, ...node.props].join('|'), 'g');
    const match = code.match(reg);
    return match ?? [];
  }

  // console.log(node.jsx.arguments[0])

  // code.replace(node.jsx.arguments[0], component_id)

  // code.insert(-1, `console.log(${node.component_id});\n`)
  code.insert(-1, `${component_id}.register(${node.caller_id});\n`);
  // code.insert(-1, `${component_id}.register('${node.tag_name}');\n`)

  parse_jsx(node, code)

}

function parse_props(params) {

  if (params.length > 1) {
    // throw error
  }

  const props_node = params[0];
  const props_keys = new Set<string>();

  if (props_node.type == 'Identifier' || props_node.type == 'ObjectPattern') {
    return_keys(props_node, props_keys);
  } else {
    // throw error
  }

  return props_keys;
}


