import { getCurrentStack } from '@revenge-mod/utils/errors'
import { proxify } from '@revenge-mod/utils/proxy'
import { cache } from '../caches'
import { _inits, _metas, _paths, _uninits } from '../metro/_internal'
import {
    getInitializedModuleExports,
    isModuleInitialized,
} from '../metro/utils'
import { exportsFromFilterResultFlag, runFilter } from './_internal'
import type { If } from '@revenge-mod/utils/types'
import type { MaybeDefaultExportMatched, Metro } from '../types'
import type { RunFilterReturnExportsOptions } from './_internal'
import type { Filter, FilterResult } from './filters'

interface LookupModulesOptionsWithAll<O extends boolean> {
    /**
     * Whether to include all modules in the lookup, including blacklisted ones.
     *
     * **This overrides {@link BaseLookupModulesOptions.initialized} and {@link BaseLookupModulesOptions.uninitialized}.**
     */
    all: O
}

interface LookupModulesOptionsWithInitializedUninitialized<U extends boolean> {
    /**
     * Whether to include initialized modules in the lookup.
     *
     * @default true
     */
    initialized?: boolean
    /**
     * Whether to include uninitialized modules in the lookup.
     *
     * Set {@link BaseLookupModulesOptions.initialize} `true` to initialize uninitialized modules.
     *
     * @default false
     */
    uninitialized?: U
}

export type LookupModulesOptions<
    ReturnNamespace extends boolean = boolean,
    Uninitialized extends boolean = boolean,
    All extends boolean = boolean,
    Initialize extends boolean = boolean,
> = RunFilterReturnExportsOptions<ReturnNamespace> & {
    /**
     * Whether to use cached lookup results.
     */
    cached?: boolean
    /**
     * Whether to initialize matching uninitialized modules.
     *
     * **This will initialize any modules that match the exportsless filter and may cause unintended side effects.**
     */
    initialize?: Initialize
} & If<
        All,
        LookupModulesOptionsWithAll<All> & {
            [K in keyof LookupModulesOptionsWithInitializedUninitialized<Uninitialized>]?: never
        },
        LookupModulesOptionsWithInitializedUninitialized<Uninitialized> & {
            [K in keyof LookupModulesOptionsWithAll<All>]?: never
        }
    >

export type LookupModulesResult<
    F extends Filter,
    O extends LookupModulesOptions,
> = [
    exports: O extends LookupModulesOptions<boolean, boolean, false, true>
        ? LookupFilterResult<F, O>
        : LookupFilterResult<F, O> | undefined,
    id: Metro.ModuleID,
]

type LookupFilterResult<
    F extends Filter,
    O extends LookupModulesOptions,
> = O extends RunFilterReturnExportsOptions<true>
    ? MaybeDefaultExportMatched<FilterResult<F>>
    : FilterResult<F>

const NotFoundResult: [] = []

type LookupNotFoundResult = typeof NotFoundResult

/**
 * Lookup modules.
 *
 * You can lookup uninitialized modules by passing `options.uninitialized` when filtering via exportsless filters (eg. `byDependencies`).
 * Use the `moduleStateAware` helper to filter dynamically based on whether the module is initialized or not.
 *
 * @param filter The filter to use.
 * @param options The options to use for the lookup.
 * @returns A generator that yields the module exports that match the filter.
 *
 * @example
 * ```ts
 * const lookup = lookupModules(byProps('x'))
 * // Log all module exports that has exports.x
 * for (const exports of lookup) console.log(exports)
 * ```
 */
export function lookupModules<F extends Filter>(
    filter: F,
): Generator<LookupModulesResult<F, object>, undefined>

export function lookupModules<
    F extends O extends LookupModulesOptions<boolean, true>
        ? Filter<any, false>
        : Filter,
    const O extends LookupModulesOptions,
>(filter: F, options: O): Generator<LookupModulesResult<F, O>, undefined>

export function* lookupModules(filter: Filter, options?: LookupModulesOptions) {
    let notFound = true
    let cached: Set<Metro.ModuleID> | undefined

    const init = options?.initialize ?? true
    const notInit = !init

    if (options?.cached ?? true) {
        const reg = cache[filter.key]
        // Return early if previous lookup was a full lookup and no modules were found
        if (reg === null) return

        if (reg) {
            cached = new Set()

            for (const sId in reg) {
                const flag = reg[sId]
                const id = Number(sId)
                let exports: Metro.ModuleExports | undefined

                if (isModuleInitialized(id))
                    exports = getInitializedModuleExports(id)
                else {
                    if (notInit) continue
                    exports = __r(id)
                }

                cached.add(id)

                yield [exportsFromFilterResultFlag(flag, exports, options), id]
            }
        }
    }

    // Full lookup
    if (options?.all) {
        for (const id of _metas.keys()) {
            if (cached?.has(id)) continue

            const exports = getInitializedModuleExports(id)
            const flag = runFilter(filter, id, exports, options)
            if (flag) {
                notFound = false
                yield [exportsFromFilterResultFlag(flag, exports, options), id]
            }
        }

        if (notFound) cache[filter.key] = null // Full lookup, and still not found!
    }
    // Partial lookup
    else {
        if (options?.initialized ?? true)
            for (const id of _inits) {
                if (cached?.has(id)) continue

                const exports = getInitializedModuleExports(id)
                const flag = runFilter(filter, id, exports, options)
                if (flag) {
                    notFound = false
                    yield [
                        exportsFromFilterResultFlag(flag, exports, options),
                        id,
                    ]
                }
            }

        if (options?.uninitialized)
            for (const id of _uninits) {
                if (cached?.has(id)) continue

                const flag = runFilter(filter, id, undefined, options)
                if (flag) {
                    notFound = false

                    yield [
                        init
                            ? exportsFromFilterResultFlag(
                                  flag,
                                  getInitializedModuleExports(id),
                                  options,
                              )
                            : undefined,
                        id,
                    ]
                }
            }
    }

    if (__BUILD_FLAG_DEBUG_MODULE_LOOKUPS__)
        if (notFound) warnDeveloperAboutNoFilterMatch(filter)
}

/**
 * Lookup a module. Skipping creating a `Generator`.
 *
 * @see {@link lookupModules} for more documentation.
 *
 * @param filter The filter to use.
 * @param options The options to use for the lookup.
 * @returns The first module exports that match the filter.
 *
 * @example
 * ```ts
 * const React = lookupModule(byProps<typeof import('react')>('createElement'))
 * ```
 */
export function lookupModule<F extends Filter>(
    filter: F,
): LookupModulesResult<F, object> | LookupNotFoundResult

export function lookupModule<
    F extends O extends LookupModulesOptions<boolean, true>
        ? Filter<any, false>
        : Filter,
    const O extends LookupModulesOptions,
>(filter: F, options: O): LookupModulesResult<F, O> | LookupNotFoundResult

export function lookupModule(filter: Filter, options?: LookupModulesOptions) {
    const init = options?.initialize ?? true
    const notInit = !init

    if (options?.cached ?? true) {
        const reg = cache[filter.key]
        // Return early if previous lookup was a full lookup and no modules were found
        if (reg === null) return NotFoundResult

        if (reg)
            for (const sId in reg) {
                const flag = reg[sId]
                const id = Number(sId)
                let exports: Metro.ModuleExports

                if (isModuleInitialized(id))
                    exports = getInitializedModuleExports(id)
                else {
                    if (notInit) continue
                    exports = __r(id)
                }

                return [exportsFromFilterResultFlag(flag, exports, options), id]
            }
    }

    // Full lookup
    if (options?.all) {
        for (const id of _metas.keys()) {
            const exports = getInitializedModuleExports(id)
            const flag = runFilter(filter, id, exports, options)
            if (flag)
                return [exportsFromFilterResultFlag(flag, exports, options), id]
        }

        if (__BUILD_FLAG_DEBUG_MODULE_LOOKUPS__)
            warnDeveloperAboutNoFilterMatch(filter)

        cache[filter.key] = null // Full lookup, and still not found!

        return NotFoundResult
    }
    // Partial lookup
    else {
        if (options?.initialized ?? true)
            for (const id of _inits) {
                const exports = getInitializedModuleExports(id)
                const flag = runFilter(filter, id, exports, options)
                if (flag)
                    return [
                        exportsFromFilterResultFlag(flag, exports, options),
                        id,
                    ]
            }

        if (options?.uninitialized)
            for (const id of _uninits) {
                const flag = runFilter(filter, id, undefined, options)
                if (flag)
                    return [
                        init
                            ? exportsFromFilterResultFlag(
                                  flag,
                                  getInitializedModuleExports(id),
                                  options,
                              )
                            : undefined,
                        id,
                    ]
            }
    }

    if (__BUILD_FLAG_DEBUG_MODULE_LOOKUPS__)
        warnDeveloperAboutNoFilterMatch(filter)

    return NotFoundResult
}

/**
 * Lookup an initialized module by its imported path.
 *
 * Think of it as if you are doing a `import * as exports from path`, the app must have already initialized the module or this will return `undefined`.
 *
 * @param path The path to lookup the module by.
 * @returns The module exports if the module is initialized, or `undefined` if the module is not found or not initialized.
 *
 * @example
 * ```ts
 * const [{ default: Logger }] = lookupModuleByImportedPath<{ default: typeof DiscordModules.Logger }>('modules/debug/Logger.tsx')
 * ```
 */
export function lookupModuleByImportedPath<T = any>(
    path: string,
): [exports: T, id: Metro.ModuleID] | [] {
    const id = _paths.get(path)
    if (id == null) return NotFoundResult

    return [getInitializedModuleExports(id), id]
}

const __blacklistedFunctions = __BUILD_FLAG_DEBUG_MODULE_LOOKUPS__
    ? proxify(
          () => [
              require('./get').getModule,
              require('@revenge-mod/utils/discord')
                  .lookupGeneratedIconComponent,
          ],
          { hint: [] },
      )
    : []

/**
 * Warns the developer that no module was found for the given filter.
 * This is useful for debugging purposes, especially when using filters that are expected to match a module.
 */
function warnDeveloperAboutNoFilterMatch(filter: Filter) {
    const stack = getCurrentStack()
    for (const func of __blacklistedFunctions)
        if (stack.includes(func.name)) return

    nativeLoggingHook(
        `\u001b[31mNo module found for filter: ${filter.key}\n${stack}\u001b[0m`,
        2,
    )
}
