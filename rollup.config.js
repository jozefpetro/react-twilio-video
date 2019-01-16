const nodeResolve = require('rollup-plugin-node-resolve')
const babel = require('rollup-plugin-babel')
const prettier = require('rollup-plugin-prettier')
const commonJS = require('rollup-plugin-commonjs')
const json = require('rollup-plugin-json')
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
    json(),
    prettier(prettierConfig)
  ],
  external: ['styled-components', 'twilio-video'],
  globals: { 'styled-components': 'styled' }
}
