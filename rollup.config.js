import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';

export default {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/informator.umd.js',
      format: 'umd',
      name: 'informator',
      sourcemap: true,
    },
    {
      file: 'dist/informator.umd.min.js',
      format: 'umd',
      name: 'informator',
      sourcemap: true,
      plugins: [terser()],
    },
  ],
  plugins: [
    typescript(), // Will use tsconfig.json by default
    resolve(),
    commonjs(),
  ],
};
