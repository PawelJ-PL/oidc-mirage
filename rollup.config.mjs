import typescript from '@rollup/plugin-typescript'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'

const config = [
    {
        input: 'src/index.ts',
        output: {
            dir: 'dist',
            format: 'cjs',
            sourcemap: true,
            preserveModules: true,
            preserveModulesRoot: 'src',
        },
        plugins: [json(), commonjs(), typescript({ module: 'ESNext' }), nodeResolve({ preferBuiltins: true })],
    },
]
export default config
