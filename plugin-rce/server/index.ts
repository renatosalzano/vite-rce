import { transformWithEsbuild } from 'vite';
import { writeFile } from 'fs/promises';
import { extname, parse, resolve } from 'path';
import { CONFIG_ID, HYDRATE } from '../constant.ts';
import { acorn, get_tag_name, has_return, is_block_statement, is_factory, is_hook, is_identifier, reactive_node, walk } from './ast.ts';
import parse_body_return from './1-parse/body_return.ts';
import parse_props from './1-parse/props.ts';
import transform_jsx from './2-transform/jsx.ts';
import transform_partial from './2-transform/partial.ts';
import Transformer from './Transformer.ts';
import { transform_hook_declaration } from './2-transform/hook_declaration.ts';
import { print } from '../utils/shortcode';
import transform_custom_element from './2-transform/custom_element.ts';
import { is_custom_element } from './utils.ts';


async function transform(id: string, source_code: string) {

  try {

    const loader: any = extname(id).slice(1);

    source_code = (await transformWithEsbuild(source_code, 'code.js', {
      loader,
      jsx: 'transform',
      jsxFactory: 'h',
      jsxFragment: '$.fragment'
    })).code;

    // print(code)
    writeFile(resolve(__dirname, `../.local/esbuild_${parse(id).name}.js`), source_code, 'utf-8');

    new Transformer(source_code);

    Transformer.insert(0, `import { create, register } from '@rce/dev';\n`)

    const ast = acorn.parse(source_code, {
      sourceType: 'module',
      ecmaVersion: 'latest',
      locations: true
    });

    walk(ast, {

      FunctionDeclaration(node) {
        // print(node.id?.name + ';r')
        if (is_hook(node.id) && is_block_statement(node.body)) {

          if (has_return(node.body)) {

            transform_hook_declaration({
              id: node.id.name,
              fn_node: node
            });

          } else {
            // invalid || usless hook
            Transformer.replace(node, '');

          }

        } else {

          //#region CE STATELESS

          const {
            type,
            tag_name,
            jsx_node
          } = parse_body_return(node.body);

          if (type) {
            const { props, props_string } = parse_props(node.params);

            const $node = reactive_node(node.body, {
              caller_name: node.id.name,
              tag_name,
              props,
              props_string
            });

            if (type == 'custom_element') {

              transform_custom_element($node, jsx_node);
            }
          }

          // read_function(node, code)
        }
      },

      VariableDeclaration(node) {

        for (const var_node of node.declarations) {

          if (!var_node.init) continue;

          // print(code.node_string(var_node.init))

          switch (var_node.init.type) {
            case "ArrowFunctionExpression":
            case "FunctionExpression":

              if (is_hook(var_node.id)) {

                if (is_block_statement(var_node.init.body) && has_return(var_node.init.body)) {

                  transform_hook_declaration({
                    id: var_node.id.name,
                    fn_node: var_node.init,
                    is_var: true
                  });

                } else {
                  print('invalid hook;r', var_node.id.name)

                  Transformer.replace(node, '');
                }

                continue;
              }


              if (is_factory(var_node.init.body)) {

                // statless component

                const tag_name = get_tag_name(var_node.init.body);

                if (tag_name && is_custom_element(tag_name)) {

                  print('tranform custom element;y', tag_name);

                  const { props, props_string } = parse_props(var_node.init.params);

                  Transformer.wrap(
                    var_node.init.body,
                    `{\n const ${CONFIG_ID} = create(${props_string});\n return ${CONFIG_ID}.${HYDRATE} = (h) =>`,
                    `, ${CONFIG_ID}\n}`
                  )

                  const $node = reactive_node({}, { props });

                  transform_jsx($node, var_node.init.body);

                } else {
                  // COMPONENT
                }

                break;
              }

              if (is_block_statement(var_node.init.body)) {

                // read_function_body(var_node.init.body);
                const {
                  type,
                  tag_name,
                  jsx_node
                } = parse_body_return(var_node.init.body);

                const id = var_node.id as acorn.Node;

                if (type && is_identifier(id)) {

                  const { props, props_string } = parse_props(var_node.init.params);

                  const node = reactive_node(var_node.init.body, {
                    caller_name: id.name,
                    tag_name,
                    props,
                    props_string
                  });

                  if (type == 'custom_element') {

                    transform_custom_element(node, jsx_node);

                  } else {

                    // COMPONENT

                  }

                }

              }

          }
        }
      }
    })

    const transformed_code = Transformer.commit();

    writeFile(resolve(__dirname, `../.local/${parse(id).name}_transformed.js`), transformed_code, 'utf-8')

    const dev_code = await transformWithEsbuild(transformed_code, 'code.js', {
      loader: 'js'
    })

    writeFile(resolve(__dirname, `../.local/${parse(id).name}.js`), dev_code.code, 'utf-8')
    return transformed_code
    return source_code;

  } catch (err) {
    console.log(err);

  }
}

export default transform;