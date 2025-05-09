import { transformWithEsbuild } from 'vite';
import { writeFile } from 'fs/promises';
import { extname, parse, resolve } from 'path';
import { CONFIG_ID } from '../constant.ts';
import { acorn } from './ast.ts';
import read from './1-read/read.ts';
import transform_custom_element from './2-transform/custom_element.ts';
import transform_hook from './2-transform/hook.ts';
import transform_jsx from './2-transform/jsx.ts';
import { print } from '../utils/shortcode';
import transform_partial from './2-transform/partial.ts';
import Transformer from './Transformer.ts';


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

    const code = new Code(source_code);

    const nodes = read(id, code);

    // TRANSFORM CODE


    code.insert(0, "import { createConfig, defineElement } from '@rce/dev';\n");


    for (const node of nodes) {
      switch (node.type) {
        case 'custom_element':
          print('transform custom element;y', node.caller_id)

          transform_custom_element(node, code);
          // code.insert(-1, `${node.component_id}.html(${node.caller_id}({}));\n`)
          break
        case 'partial': {

          print('transform partial;y', node.caller_id)

          transform_partial(node, code);

          break
        }
        case 'hook':
          transform_hook(node, code)
          break
      }
    }



    const res = code.commit();

    writeFile(resolve(__dirname, `../.local/${parse(id).name}.js`), Transformer.commit(), 'utf-8')
    return res;

  } catch (err) {
    console.log(err);

  }
}

type CodeChange = { start: number, end?: number, code: string };


export class Code {

  private changes: CodeChange[] = [];

  constructor(
    public source: string,
  ) {
  }

  private sorted_push(change: CodeChange) {

    // print(change)

    // print(change)
    if (this.changes.length == 0) {
      this.changes.push(change);
      return;
    }

    const changes = [...this.changes];
    let index = 0;

    for (const { start } of changes) {

      if (change.start < start) {
        this.changes.splice(index, 0, change);
        break;
      }

      if (index == changes.length - 1) {
        this.changes.push(change);
      }

      index++;
    }
  }

  replace({ start, end }: { start: number, end: number } | acorn.Node, code: string) {
    this.sorted_push({ start, end, code });
  }

  insert(at: number, code: string) {
    if (at == undefined) return;
    // print('INSERT', at, code)
    if (at == -1) {
      at = this.source.length;
    }
    this.sorted_push({ start: at, code });
  }

  find_index(from: number, char: string, exact = false) {
    for (let i = from; i < this.source.length - 1; i++) {
      if (this.source[i] == char) {
        return i + (exact ? 0 : 1);
      }
    }
  }

  commit() {

    let last_index = this.changes[0]?.start;
    const output = [this.slice(0, last_index)]

    let index = 0;
    for (const { start, end, code } of this.changes) {

      last_index = (start && end) ? end : start;
      index++;

      output.push(code + this.source.slice(last_index, this.changes[index]?.start))
    }



    // for (const [slice, replacer] of this.entries.entries()) {
    //   this.source = this.source.replace(slice, replacer)
    // }

    this.source = output.join('')

    return this.source;
  }

  slice(start: number, end: number) {
    return this.source.slice(start, end);
  }

  node_string(node: acorn.AnyNode) {
    return this.source.slice(node.start, node.end);
  }
}

export default transform;