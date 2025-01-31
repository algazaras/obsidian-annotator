import typescript from '@rollup/plugin-typescript';
import {nodeResolve} from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import copy from 'rollup-plugin-copy'
import fs from 'fs';
import folderZipString from './rollup-folder-zip-string';
import nodePolyfills from 'rollup-plugin-polyfill-node';
import analyze from 'rollup-plugin-analyzer';
import { terser } from "rollup-plugin-terser";
import replace from "rollup-plugin-replace";

const banner = 
`/*
@preserve
THIS IS A GENERATED/BUNDLED FILE BY ROLLUP
if you want to view the source visit the plugins github repository
*/
`;

const vault_plugin_dir = fs.existsSync('./.vault_plugin_dir') ? 
                         fs.readFileSync('./.vault_plugin_dir').toString() : 
                         '.';

export default {
  input: 'src/main.tsx',
  output: {
    dir: vault_plugin_dir,
    sourcemap: 'inline',
    sourcemapExcludeSources: true,
    format: 'cjs',
    exports: 'default',
    banner,
  },
  external: ['obsidian'],
  plugins: [
    typescript(),
    nodeResolve({browser: true}),
    replace({
      'process.env.NODE_ENV': JSON.stringify('production')
    }),
    commonjs(),
    nodePolyfills(),
    ...(vault_plugin_dir != '.' ? [copy({
      targets: [
        { src: 'manifest.json', dest: vault_plugin_dir }
      ]
    })] : []),
    terser({
      output: {
        comments: function (node, comment) {
          var text = comment.value;
          var type = comment.type;
          if (type == "comment2") {
            // multiline comment
            return /@preserve|@license|@cc_on/i.test(text);
          }
        },
      },
    }),
    folderZipString(),
    analyze({summaryOnly: true})
  ]
};