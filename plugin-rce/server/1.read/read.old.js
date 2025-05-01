
import { transformWithEsbuild } from "vite";
import { parseHTML } from "linkedom";
import { print } from "../../utils/shortcode";
import { Acorn, walk } from "../acorn";


const custom_element_tagname = new Set();


async function read(id, code) {

  const ast = Acorn.parse(code, {
    sourceType: 'module',
    ecmaVersion: 'latest',
    locations: true
  });

  const output = {
    elements: new Map(),
    partials: new Map()
  }

  const results = new WeakMap();
  const nodes = new Set();

  Object.freeze(ast)

  walk(ast, {
    Function(node) {
      switch (node.body.type) {
        case "BlockStatement":

          // print(node.body)
          if (node.body.body.length == 0) return;

          let counter = 0;

          walk(node.body, {
            ReturnStatement(ret_node) {

              if (!is_JSX(ret_node)) return;

              counter++;

              const tag_name = ret_node.argument?.openingElement?.name?.name;

              if (is_custom_element(tag_name)) {

                if (counter > 1) {
                  // TODO DONT BUILD
                  print('error custom element must have one return;r')
                }

                node.tag_name = tag_name;
                node.type = 'custom_element'
                node.jsx = ret_node?.argument?.children || [];

                results.set(node, 'custom_element');
                nodes.add(node);

                // const test = code.slice(ret.argument.start, ret.argument.end);

              } else {

                node.type = 'partial';
                results.set(node, 'partial');
                nodes.add(node);

              }

            }
          })

          break;
        case "JSXElement":
        case "JSXFragment":

          print('ARROW HERE')
          print(node.body?.openingElement?.name?.name)

          const tag_name = node.body?.openingElement?.name?.name;

          if (is_custom_element(tag_name)) {
            results.set(node, 'custom_element_stateless');
            node.tag_name = tag_name;
            node.type = 'custom_element';
            node.stateless = true;
            node.jsx = node?.children || [];

          } else {
            node.type = 'partial';
            results.set(node, 'partial');
          }

          nodes.add(node);

          break;

      }

    }
  });

  return nodes;
}


function is_custom_element(tag_name) {
  if (!tag_name) return false;

  if (/^[a-z][a-z0-9]*(?:-[a-z0-9]+)+$/.test(tag_name)) {

    if (custom_element_tagname.has(tag_name)) {
      print(`duplicate custome element ${tag_name};r`);
    } else {
      custom_element_tagname.add(tag_name);
    }

    return true;
  }

  return false;
}


function is_JSX(node) {
  if (!node.argument) return false;
  return (
    node.argument.type == 'JSXElement'
    || node.argument.type == 'JSXFragment'
  )
}


export default read;
