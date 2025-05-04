import { type FunctionNode, return_keys } from "../acorn";
import { Code } from "..";
import transform_body from "./function_body";
import transform_jsx from "./jsx";

let component_id = '';

function transform_custom_element(node: FunctionNode, code: Code) {

  parse_props(node);
  // print(props_keys)

  component_id = node.component_id;
  // print(code.slice(node.start, node.body.start))

  console.log(node.props)

  const props = [...node.props].join(',');

  code.insert(0, `let ${component_id};\n`);

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
  const create_config = `\n${component_id} = createConfig('${node.tag_name}', ${config_props});`;

  if (node.stateless) {

    // const replace = `(${component_id}.props(${_props_keys}), ${code.slice(node.body.start, node.body.end)})`
    code.insert(node.body.start, create_config)
    code.insert(node.jsx.start, `\nreturn (${component_id}.render = (h) =>`);
    code.insert(node.body.end, `,${component_id})}`)

  } else {
    let index = code.find_index(node.body.start, "{");
    code.insert(index, create_config);
    code.insert(node.jsx.start, `(${component_id}.render = (h) =>`);
    code.insert(node.jsx.end, `,${component_id})`)
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

  transform_body(component_id, node, code);

  transform_jsx(node, code);

  code.insert(-1, `defineElement('${node.tag_name}', ${node.caller_id});\n`);
}

function parse_props(node: FunctionNode) {

  if (node.params.length > 1) {
    // throw error
    throw 'props must be 1 argument'
  }

  const props_node = node.params[0];
  const props_keys = new Set<string>();

  if (props_node.type == 'Identifier' || props_node.type == 'ObjectPattern') {
    node.props_type = props_node.type;
    return_keys(props_node, props_keys);
  } else {
    // throw error
  }

  node.props = props_keys;
}

export default transform_custom_element;