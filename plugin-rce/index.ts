import { readdirSync, readFileSync, statSync } from "fs";
import { writeFile } from "fs/promises";
import { build } from "esbuild";
import { basename, dirname, join, posix, relative, resolve } from "path";
import {
  createFilter,
  normalizePath,
  type Plugin,
  type ViteDevServer
} from "vite"
import transform from "./server";
import { print } from "./utils/shortcode";

type Config = {
  components: { [key: string]: Function }
}

function viteRCE(config: Config): Plugin {

  const src = 'src';

  let src_dir = src;
  let command = '';
  let imports: string[] = [];
  let client_code: string;

  let dev_server: ViteDevServer

  const is_src_file = createFilter(
    `${src}/**/*.{jsx,tsx}`,
    'node_modules/**'
  );

  const dev = createFilter(
    `plugin-rce/client/**/*`,
    'node_modules/**'
  );

  return {
    name: 'vite:plugin-rce',
    enforce: 'pre',

    // config
    config() {
      return {
        // esbuild: {
        //   jsx: "automatic",
        //   jsxDev: false,
        //   jsxFactory: 'h',
        //   jsxImportSource: "@rce"
        // },
        server: {
          watch: {
            // Specifica la cartella da monitorare 
            paths: [`${src}/**/*`, 'plugin-rce/client/**/*'],
            ignored: ['node_modules/**']
          }
        },
        // resolve: {
        //   alias: {
        //     '@rce/constant': resolve(__dirname, './constant.ts')
        //   }
        // }
      }
    },

    configResolved(config) {
      src_dir = join(config.root, src_dir);
      command = config.command;

      print(command)
    },

    // vite dev server

    configureServer(server) {
      dev_server = server;

      // server.middlewares.use('/@rce/client.js', async function name(req, res, next) {
      //   // print('requested client.js'.y())
      //   let code = readFileSync(join(__dirname, '/client.js'), 'utf-8');
      //   res.writeHead(200, { 'content-type': 'application/javascript' });
      //   res.write(code);
      //   res.end();
      // })

      server.watcher.on('change', (path) => {
        if (dev(path)) {
          // console.log(`File ${path} changed`);
          // build()
          dev_server.restart()
        }
      });
    },

    async buildStart() {

      // console.log("RESULT", result)

      try {

        // lib build

        const result = await build({
          entryPoints: ['plugin-rce/client/build.ts'],
          bundle: true,
          write: false,
          format: 'esm',
          platform: 'node',
          packages: 'external',
        });

        client_code = result.outputFiles[0].text;

        writeFile(resolve(__dirname, `./.local/build.js`), client_code, 'utf-8');

      } catch (err) {
        print(err);
      }




      const source = readdirSync(
        src_dir,
        { recursive: true, withFileTypes: true }
      );

      for (const file of source) {

        if (file.isFile()) {
          // const path = resolve(file.path, file.name)
          // console.log(file);

          if (command == 'build') {
            console.log(file.name)
          }

          if (dev_server) {

            const path = resolve((file.parentPath || file.path), file.name);

            if (is_src_file(path)) {
              dev_server.transformRequest(path)
            }
          };
        } else {

        }
      };
    },

    // build-time
    // 1.
    resolveId(id, importer) {

      print(id, importer)

      if (id.startsWith('@rce') && is_src_file(importer)) {
        if (id == '@rce/dev') {
          return { id: '/rce/dev' }
        }
        return { id: '@rce/client/lib.ts' }
      }

      if (id.startsWith('@rce')) {
        return { id }
      }

      if (importer.startsWith('@rce')) {
        print(posix.join(importer, id))
        return { id }
        // return { id: join(importer, id) }
      }
    },
    // 2. load code from id
    load(id) {

      if (id == '/rce/dev') {
        return client_code;
      }

      if (id == '@rce/client/lib.ts') {
        const code = readFileSync(resolve(__dirname, './client/lib.ts'), 'utf-8');
        return code;
      }

      if (id.startsWith('@rce')) {
        const path = './client/index.ts'
        print('load;y', path)
        let code = readFileSync(resolve(__dirname, path), 'utf-8');
        return code

      }
    },
    // 3.
    async transform(code, id) {
      if (is_src_file(id)) {
        // filter only jsx/tsx file
        print('transform;y', id);
        // parser(id, code)
        imports.push(normalizePath(relative(process.cwd(), id)))
        code = await transform(id, code)
        return {
          code
        };
      }

      if (id == '/rce/client') {
        return {
          code
        }
      }
    },

    transformIndexHtml: {
      handler() {

        return [
          {
            tag: 'script',
            attrs: {
              type: "module",
            },
            children: imports.map(path => `import '/${path}'`).join(';\n'),
            injectTo: 'head'
          }
        ]
      }
    }

  }
}


export default viteRCE;