import { acorn, walk, type FunctionNode } from '../ast';
// import { walk } from 'zimmerframe';
// import { Node } from 'estree';
import { HOOK_START } from "../../constant";
import { print } from '../../utils/shortcode';
import { Code } from '..';


let TAG_NAMES: Set<string>;
let NODES: Set<FunctionNode>;


function read(id: string, code: Code) {

  TAG_NAMES = new Set();
  NODES = new Set();

  const ast = acorn.parse(code.source, {
    sourceType: 'module',
    ecmaVersion: 'latest',
    locations: true
  });

  walk(ast, {

    FunctionDeclaration(node: FunctionNode) {
      // print(node.id?.name + ';r')
      if (node.id?.type == 'Identifier' && node.id.name.startsWith(HOOK_START)) {
        node.type = 'hook';
        node.caller_id = node.id.name;

        NODES.add(node);
      } else {

        read_function(node, code)
      }
    },

    VariableDeclaration(node) {
      for (const var_node of node.declarations) {

        if (!var_node.init) continue;

        switch (var_node.init.type) {
          case "ArrowFunctionExpression":
          case "FunctionExpression":

            if (var_node.id.type == 'Identifier' && var_node.id.name.startsWith(HOOK_START)) {

              const hook_node: any = var_node.init;
              hook_node.type = 'hook';
              hook_node.arrow = true;
              hook_node.caller_id = var_node.id.name;
              hook_node.start = var_node.init.start;

              NODES.add(hook_node);
              continue;
            }

            if (var_node.init.body.type == 'CallExpression') {

              const tag_name = get_tag_name(var_node.init.body);

              if (tag_name && is_custom_element(tag_name)) {
                const fn_node = var_node.init as unknown as FunctionNode;
                fn_node.tag_name = tag_name;
                fn_node.start = node.start;
                fn_node.end = node.end;
                fn_node.stateless = true;
                fn_node.arrow = true;
                fn_node.type = 'custom_element';
                fn_node.jsx = var_node.init.body;
                // print(var_node.id)

                if (var_node.id.type == 'Identifier') {
                  fn_node.caller_id = var_node.id.name;
                } else {
                  // throw error
                }

                NODES.add(fn_node)
              }
              break;

            }

            const fn_node = var_node.init as any;
            fn_node.id = var_node.id;
            fn_node.arrow = true;
            fn_node.start = node.start;

            read_function(fn_node, code);
        }
      }
    }
  })

  return NODES;
}


function read_function(node: FunctionNode, code: Code) {

  if (
    node.body.type != 'BlockStatement'
    || node.body.body.length == 0
  ) return;

  let counter = 0;
  let is_ce = false;

  walk(node.body, {
    ReturnStatement(ret_node) {

      // print(code.slice(ret_node.start, ret_node.end))

      counter++;

      if (ret_node.argument && ret_node.argument.type == 'CallExpression') {

        const tag_name = get_tag_name(ret_node.argument);

        if (tag_name && is_custom_element(tag_name)) {
          is_ce = true;
          node.tag_name = tag_name;
          node.type = 'custom_element';
          node.jsx = ret_node.argument;
          node.return_start = ret_node.start;

          if (node.id?.type == 'Identifier') {
            node.caller_id = node.id.name;
          } else {
            // throw error
          }

          NODES.add(node);
        };

      }

      if (counter > 1 && is_ce) {
        throw `custom element must be one return`
      }

    }

  })

}


function get_tag_name(node: acorn.CallExpression) {

  const { callee } = node;

  if (callee.type == 'Identifier' && callee.name == 'h') {
    const tag_name = node.arguments?.[0];

    if (tag_name.type == 'Literal') {
      return tag_name.value as string
    }
  }
}


function is_custom_element(tag_name?: string) {
  if (!tag_name) return;

  if (/^[a-z][a-z0-9]*(?:-[a-z0-9]+)+$/.test(tag_name)) {

    if (TAG_NAMES.has(tag_name)) {
      print(`duplicate custome element ${tag_name};r`);
    } else {
      TAG_NAMES.add(tag_name);
    }

    return true;
  }
}

export default read;