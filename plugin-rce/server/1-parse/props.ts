import { acorn, is_identifier, is_object_pattern, return_keys } from "../ast";

function parse_props(params: acorn.Node[]) {

  if (params.length > 1) {
    // throw error
    throw 'props must be 1 argument'
  }

  const props = new Set<string>();
  let type: 'Identifier' | 'ObjectPattern'

  if (params[0]) {

    type = params[0].type as any;

    if (is_identifier(params[0])) {

      const { name } = params[0];
      props.add(name);
    } else if (is_object_pattern(params[0])) {

      return_keys(params[0], props);
    } else {

      throw 'props must be object type'
    }

  } else {
    type = 'Identifier';
    props.add('null');
  }

  const props_keys = [...props].join(',');

  return {
    props,
    props_string: type == 'Identifier'
      ? props_keys
      : `{ ${props_keys} }`
  }

}

export default parse_props;