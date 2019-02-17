const {rollup} = require('rollup');
const typescript = require('rollup-plugin-typescript2');
const resolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
const {terser} = require('rollup-plugin-terser');

const inputOptions = {
    input: 'src/index.ts',
    plugins: [
        resolve({main: true, module: true}),
        commonjs({include: 'node_modules/**'}),
        typescript(),
        terser()
    ]
};

const build = async () => {
    const bundle = await rollup(inputOptions);

    bundle.write({format: 'cjs', file: 'cjs/index.js', sourcemap: true});
    bundle.write({format: 'es', file: 'es/index.js', sourcemap: true});
};

build();
