const nodeResolve = require('rollup-plugin-node-resolve')
const babel = require('rollup-plugin-babel')
const prettier = require('rollup-plugin-prettier')
const commonJS = require('rollup-plugin-commonjs')
const prettierConfig = require('./prettier.config')

module.exports = {
  input: 'src/index.js',
  output: {
    file: 'bundle.js',
    format: 'cjs'
  },
  plugins: [
    nodeResolve(),
    babel({ exclude: 'node_modules/**' }),
    commonJS({ include: 'node_modules/**' }),
    prettier(prettierConfig)
  ],
  external: ['styled-components'],
  globals: { 'styled-components': 'styled' }
}
