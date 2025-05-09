import { type FunctionNode, return_keys } from "../acorn";
import { CONFIG_ID, HYDRATE } from "../../constant";
import transform_body from "./function_body";
import transform_jsx from "./jsx";
import { Code } from "..";

function transform_custom_element(node: FunctionNode, code: Code) {

  parse_props(node);
  // print(props_keys)
  // print(code.slice(node.start, node.body.start))

  const props = [...node.props].join(',');

  // code.insert(0, `let ${config_ID};\n`);

  if (node.arrow) {

    let params = node.params?.[0] ? code.node_string(node.params[0]) : '';

    // console.log(code.slice(node.start, node.body.start))
    // console.log(`function ${node.caller_id}(${params})`)

    code.replace(
      { start: node.start, end: node.body.start },
      node.stateless
        ? `function ${node.caller_id}(${params}) {`
        : `function ${node.caller_id}(${params})`
    )
  }

  const config_props = node.props_type == 'ObjectPattern' ? `{${props}}` : props;
  const create_config = `\nconst ${CONFIG_ID} = createConfig('${node.tag_name}', ${config_props});`;

  if (node.stateless) {

    // const replace = `(${component_id}.props(${_props_keys}), ${code.slice(node.body.start, node.body.end)})`
    code.insert(node.body.start, create_config)
    code.insert(node.jsx.start, `\nreturn (${CONFIG_ID}.${HYDRATE} = (h) =>`);
    code.insert(node.body.end, `,${CONFIG_ID})}`)

  } else {
    let index = code.find_index(node.body.start, "{");
    code.insert(index, create_config);
    code.insert(node.jsx.start, `(${CONFIG_ID}.${HYDRATE} = (h) =>`);
    code.insert(node.jsx.end, `,${CONFIG_ID})`)
  }

  // node.return_deps = (code: string) => {
  //   const reg = new RegExp([...node.state, ...node.props].join('|'), 'g');
  //   const match = code.match(reg);
  //   return match ?? [];
  // }

  // console.log(node.jsx.arguments[0])

  // code.replace(node.jsx.arguments[0], component_id)

  // code.insert(-1, `console.log(${node.component_id});\n`)
  // code.insert(-1, `${component_id}.register('${node.tag_name}');\n`)

  transform_body(node, code);

  node.reactive_keys_reg = node.state.size == 0
    ? undefined
    : new RegExp([...node.state].join('|'), 'g');

  transform_jsx(node, code);

  code.insert(-1, `defineElement('${node.tag_name}', ${node.caller_id});\n`);
}

function parse_props(node: FunctionNode) {

  if (node.params.length > 1) {
    // throw error
    throw 'props must be 1 argument'
  }

  node.props = new Set<string>();

  const props_node = node.params[0];

  if (props_node) {

    if (props_node.type == 'Identifier' || props_node.type == 'ObjectPattern') {
      node.props_type = props_node.type;
      return_keys(props_node, node.props);
    } else {
      // throw error
    }

  }

}

export default transform_custom_element;