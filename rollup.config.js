// import { babel, getBabelOutputPlugin } from '@rollup/plugin-babel'
import babel from 'rollup-plugin-babel'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'

export default {
  input: 'src/index.js',
  output: {
    file: 'dist/fakevue.js',
    format: 'umd',
    name: 'fakeVue',
    exports: 'auto',
    sourcemap: true,
  },
  plugins: [
    resolve(),
    babel({ runtimeHelpers: true,exclude: 'node_modules/**' }),
    // getBabelOutputPlugin({
    //   // allowAllFormats: true,
    //   presets: ['@babel/preset-env'],
    //   plugins: [['@babel/plugin-transform-runtime']]
    // }),
    commonjs()
  ]
}