import { transform } from '@swc/core'
import { $, main } from 'bun'
import chalk from 'chalk'
import { type OutputChunk, type RolldownPlugin, rolldown } from 'rolldown'
import { aliasPlugin } from 'rolldown/experimental'

import pkg from '../package.json'

// If this file is being run directly, build the project
if (main === import.meta.filename) build()

export default async function build(dev = false, log = true) {
    const start = performance.now()

    const bundle = await rolldown({
        input: 'src/index.ts',
        platform: 'neutral',
        experimental: {
            strictExecutionOrder: true,
        },
        resolve: {
            tsconfigFilename: 'tsconfig.json',
        },
        treeshake: true,
        keepNames: true,
        moduleTypes: {
            '.webp': 'dataurl',
        },
        define: {
            __BUILD_VERSION__: JSON.stringify(pkg.version),
            __BUILD_COMMIT__: JSON.stringify((await $`git rev-parse HEAD`.text()).substring(0, 7)),
            __BUILD_ENV__: JSON.stringify(dev ? 'development' : 'production'),
            __BUILD_FLAG_INIT_DISABLE_PATCH_LOG_PROMISE_REJECTIONS__: String(!dev),
        },
        plugins: [
            swcPlugin(),
            aliasPlugin({
                entries: [
                    {
                        find: 'react/jsx-runtime',
                        replacement: './shims/react~jsx-runtime.ts',
                    },
                ],
            }),
            hermesCPlugin({
                flags: [
                    dev ? '-Og' : '-O',
                    '-eager',
                    '-finline',
                    '-fno-static-require',
                    '-Wno-direct-eval',
                    '-Wno-undefined-variable',
                ],
                afterComplete() {
                    if (log) console.debug(chalk.gray('\u{1F5CE} Bytecode compilation finished'))
                },
            }),
        ],
    })

    await bundle.write({
        file: 'dist/revenge.js',
        format: 'iife',
        footer: '//# sourceURL=Revenge',
        inlineDynamicImports: true,
    })

    if (log)
        console.info(
            chalk.greenBright(
                `\u{1F5CE} Compiled successfully! ${chalk.gray(`(took ${(performance.now() - start).toFixed(2)}ms)`)}`,
            ),
        )
}

function swcPlugin() {
    return {
        name: 'swc',
        transform: {
            filter: {
                id: /\.[cm]?[jt]sx?$/,
            },
            handler(code) {
                return transform(code, {
                    jsc: {
                        transform: {
                            react: {
                                runtime: 'automatic',
                            },
                        },
                        parser: {
                            syntax: 'typescript',
                            tsx: true,
                        },
                    },
                    env: {
                        // https://github.com/discord/hermes/blob/main/doc/Features.md
                        targets: 'fully supports es6',
                        include: [
                            'transform-async-generator-functions',
                            'transform-block-scoping',
                            'transform-classes',
                            'transform-duplicate-named-capturing-groups-regex',
                            'transform-named-capturing-groups-regex',
                        ],
                        exclude: [
                            // Async functions are supported, only async arrow functions aren't
                            // Source: https://github.com/facebook/hermes/issues/1395
                            'transform-async-to-generator',
                            'transform-exponentiation-operator',
                            'transform-logical-assignment-operators',
                            'transform-nullish-coalescing-operator',
                            'transform-numeric-separator',
                            'transform-object-rest-spread',
                            'transform-optional-catch-binding',
                            'transform-optional-chaining',
                            'transform-parameters',
                            'transform-template-literals',
                        ],
                    },
                })
            },
        },
    } satisfies RolldownPlugin
}

function hermesCPlugin({ afterComplete, flags }: { flags?: string[]; afterComplete?: () => void } = {}) {
    const paths = {
        win32: 'hermesc.exe',
        darwin: 'darwin/hermesc',
        linux: 'linux/hermesc',
    }

    if (!(process.platform in paths)) throw new Error(`Unsupported platform: ${process.platform}`)

    const binPath = paths[process.platform as keyof typeof paths]

    return {
        name: 'hermesc',
        generateBundle(_, bundle) {
            const file = bundle['revenge.js'] as OutputChunk
            if (!file || !file.code) throw new Error('No code to compile')

            const cmd = Bun.spawnSync(
                [
                    `./node_modules/@unbound-mod/hermesc/${process.platform}/${binPath}`,
                    '-emit-binary',
                    ...(flags ?? []),
                ],
                {
                    stdin: new Blob([file.code]),
                    stdout: 'pipe',
                },
            )

            const buf = cmd.stdout
            if (!buf.length) throw new Error('No output from hermesc')

            this.emitFile({
                type: 'asset',
                fileName: `${file.fileName.split('.')[0]!}.bundle`,
                source: buf,
            })

            if (afterComplete) afterComplete()
        },
    } satisfies RolldownPlugin
}
