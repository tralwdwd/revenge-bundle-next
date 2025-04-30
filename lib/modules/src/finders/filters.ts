import { _mInited } from '../metro/_internal'

import { getModuleDependencies, initializedModuleHasBadExports, isModuleInitialized } from '../metro'

import type { If, LogicalOr } from '@revenge-mod/utils/types'
import type { Metro } from '../../types'

export type FilterResult<F> = F extends Filter<infer R, boolean> ? R : never

export type IsFilterWithExports<F> = F extends Filter<any, infer WE> ? WE : never

export type Filter<_Inferable = any, WithExports extends boolean = boolean> = If<
    WithExports,
    (id: Metro.ModuleID, exports: Metro.ModuleExports) => boolean,
    (id: Metro.ModuleID, exports?: undefined) => boolean
> & {
    key: string
}

/**
 * Create a filter generator.
 *
 * @param filter The function that filters the modules.
 * @param keyFor The function that generates the key for the filter.
 * @returns A function that generates a filter with the specified arguments.
 *
 * @example
 * ```ts
 * const custom = createFilterGenerator<[arg1: number, arg2: string]>(
 *   ([arg1, arg2], id, exports) => {
 *     // filter logic
 *     return true
 *   },
 *   ([arg1, arg2]) => `revenge.custom(${arg1}, ${arg2})`
 * )
 * ```
 *
 * @see {@link byProps} for an example on custom-typed filters.
 */
export function createFilterGenerator<A extends any[]>(
    filter: (args: A, id: Metro.ModuleID, exports: Metro.ModuleExports) => boolean,
    keyFor: (args: A) => string,
): (...args: A) => Filter<object, true>

export function createFilterGenerator<A extends any[]>(
    filter: (args: A, id: Metro.ModuleID) => boolean,
    keyFor: (args: A) => string,
): (...args: A) => Filter<object, false>

export function createFilterGenerator<A extends any[]>(
    f: (args: A, id: Metro.ModuleID, exports?: Metro.ModuleExports) => boolean,
    keyFor: (args: A) => string,
): (...args: any[]) => Filter {
    return (...args: A) => {
        const filter = (id: Metro.ModuleID, exports?: Metro.ModuleExports) => f(args, id, exports)
        filter.key = keyFor(args)
        return filter
    }
}

export type ByProps = <T extends Record<string, any> = Record<string, any>>(
    prop: keyof T,
    ...props: Array<keyof T>
) => Filter<T, true>

/**
 * Filter modules by their exports having all of the specified properties.
 *
 * @param prop The property to check for.
 * @param props The rest of the properties to check for (optional).
 *
 * @example
 * ```ts
 * const React = await findModule(byProps<typeof import('react')>('createElement'))
 * // const React: typeof import('react')
 * ```
 */
export const byProps = createFilterGenerator<Parameters<ByProps>>(
    (props, _, exports) =>
        (typeof exports === 'object' || typeof exports === 'function') && props.every(prop => prop in exports),
    props => `revenge.props(${props.join(',')})`,
) as ByProps

export type ByName = <T extends string | object>(
    name: T extends string ? T : T extends { name: string } ? T['name'] : string,
) => Filter<T extends string ? { name: T } : T & { name: typeof name }, true>

/**
 * Filter modules by their exports having the specified name.
 *
 * Usually used for function components or classes.
 *
 * @param name The name to check for.
 *
 * @example Auto-typing as object
 * ```ts
 * const SomeComponent = await findModule(byName('SomeComponent'))
 * // const SomeComponent: { name: 'SomeComponent' }
 * ```
 *
 * @example Typing as function component
 * ```ts
 * type MyComponent = React.FC<{ foo: string }>
 *
 * const MyComponent = await findModule(byName<MyComponent>('MyComponent'))
 * // const MyComponent: MyComponent & { name: 'MyComponent' }
 * ```
 *
 * @example Typing as class
 * ```
 * interface SomeClass {
 *    someMethod(): void
 * }
 *
 * const SomeClass = await findModule(byName<{ new(param: string): SomeClass }>('SomeClass'))
 * // const SomeClass: { new(): SomeClass, name: 'SomeClass' }
 */
export const byName = createFilterGenerator<Parameters<ByName>>(
    ([name], _, exports) => exports.name === name,
    ([name]) => `revenge.name(${name})`,
) as ByName

export type ComparableDependencyMap = Array<Metro.ModuleID | undefined | ComparableDependencyMap> & {
    loose?: boolean
}

/**
 * Filter modules by their dependency map.
 *
 * @param deps The dependency map to check for, can be a sparse array or have `undefined` to be any dependency ("dynamic"). **Order and size matters!**
 * @see {@link looseDeps} to make comparisons less strict.
 *
 * @example
 * ```ts
 * const Logger = await findModule(byDependencies([4, undefined, 2]))
 * // or
 * const Logger = await findModule(byDependencies([4, , 2]))
 * // or with relative dependencies
 * // If Logger's module ID is 20, [19, ..., ..., 2] would match:
 * const Logger = await findModule(byDependencies([-1, , 2]))
 * // or with nested dependencies
 * // The last dependency would need to have zero dependencies:
 * const Logger = await findModule(byDependencies([4, , []]))
 * ```
 */
export const byDependencies = createFilterGenerator<[deps: ComparableDependencyMap]>(
    ([deps], id) => compareDeps(id, deps, deps.loose),
    deps => `revenge.deps(${depsToKey(deps)})`,
)

/**
 * Make this set of comparable dependencies as loose, to be used with {@link byDependencies}.
 *
 * Making a dependency loose skips the exact length check, but the order of the set dependencies still matters.
 * If you mark an index as dynamic, the same index must also be present in the other map during comparison to pass.
 *
 * @param deps The dependency map to make loose. This permanently modifies the array.
 * @returns The modified dependency map.
 */
export function looseDeps(deps: ComparableDependencyMap) {
    deps.loose = true
    return deps
}

const RootRelativeDepBit = 1 << 31

/**
 * Marks this dependency to compare relatively to the root module ID, instead of the module ID of the module being compared.
 * Useless for single-depth comparisons, but useful for nested comparisons.
 *
 * @param id The dependency ID to mark as root relative.
 */
export function rootRelativeDep(id: Metro.ModuleID) {
    return id | RootRelativeDepBit
}

function compareDeps(rootOf: Metro.ModuleID, compare: ComparableDependencyMap, loose = false): boolean {
    const stack: Array<[of: Metro.ModuleID, deps: Metro.ModuleID[], compare: ComparableDependencyMap, loose: boolean]> =
        []
    stack.push([rootOf, getModuleDependencies(rootOf)!, compare, loose])

    while (stack.length) {
        const [of, deps, compare, loose] = stack.pop()!
        if (loose ? deps.length < compare.length : deps.length !== compare.length) return false

        for (let i = 0; i < compare.length; i++) {
            const orig = deps[i]
            const cmp = compare[i]
            if (cmp === undefined) continue

            if (Array.isArray(cmp)) {
                const dependencies = getModuleDependencies(orig)
                if (!dependencies) return false
                stack.push([orig, dependencies, cmp, cmp.loose ?? false])
            } else if (
                cmp < 0
                    ? -cmp & RootRelativeDepBit
                        ? // Root relative dependency
                          rootOf + (-cmp & ~RootRelativeDepBit) !== orig
                        : // Relative dependency
                          of + cmp !== orig
                    : // Absolute dependency
                      cmp !== orig
            )
                return false
        }
    }

    return true
}

function depsToKey(deps: ComparableDependencyMap): string {
    let key = ''

    for (const dep of deps)
        if (dep === undefined) key += ','
        else if (Array.isArray(dep)) {
            if (dep.loose) key += '#'
            key += `[${depsToKey(dep)}],`
        } else key += `${-dep & RootRelativeDepBit ? `r${dep}` : dep},`

    return key.substring(0, key.length - 1)
}

export type Every = {
    <F1 extends Filter, F2 extends Filter>(
        f1: F1,
        f2: F2,
    ): Filter<FilterResult<F1> & FilterResult<F2>, LogicalOr<IsFilterWithExports<F1>, IsFilterWithExports<F2>>>
    <F1 extends Filter, F2 extends Filter, F3 extends Filter>(
        f1: F1,
        f2: F2,
        f3: F3,
    ): Filter<
        FilterResult<F1> & FilterResult<F2> & FilterResult<F3>,
        LogicalOr<LogicalOr<IsFilterWithExports<F1>, IsFilterWithExports<F2>>, IsFilterWithExports<F3>>
    >
    (...filters: Filter[]): Filter
}

/**
 * Combines multiple filters into one, returning true if **every** filter matches.
 *
 * @param filters The filters to combine.
 *
 * @example
 * ```ts
 * const SomeModule = await findModule(every(
 *    byProps('x', 'name'),
 *    byName('SomeName'),
 *    byDependencies([1, 485, , 2]),
 * ))
 * ```
 */
export const every = createFilterGenerator<[...filters: Filter[]]>(
    (filters, id, exports) => {
        for (const filter of filters) {
            if (filter(id, exports)) continue
            return false
        }

        return true
    },
    filters => `revenge.every(${filtersToKey(filters)})`,
) as Every

export type Some = {
    <F1 extends Filter, F2 extends Filter>(
        f1: F1,
        f2: F2,
    ): Filter<FilterResult<F1> | FilterResult<F2>, IsFilterWithExports<F1> | IsFilterWithExports<F2>>
    <F1 extends Filter, F2 extends Filter, F3 extends Filter>(
        f1: F1,
        f2: F2,
        f3: F3,
    ): Filter<
        FilterResult<F1> | FilterResult<F2> | FilterResult<F3>,
        IsFilterWithExports<F1> | IsFilterWithExports<F2> | IsFilterWithExports<F3>
    >
    (...filters: Filter[]): Filter
}

/**
 * Combines multiple filters into one, returning true if **some** filters match.
 *
 * @param filters The filters to combine.
 *
 * @example
 * ```ts
 * const SomeModule = await findModule(some(
 *   byProps('x', 'name'),
 *   byName('SomeName'),
 *   byDependencies([1, 485, , 2]),
 * ))
 * ```
 */
export const some = createFilterGenerator<[...filters: Filter[]]>(
    (filters, id, exports) => {
        for (const filter of filters) if (filter(id, exports)) return true
        return false
    },
    filters => `revenge.some(${filtersToKey(filters)})`,
) as Some

function filtersToKey(filters: Filter[]): string {
    let s = ''
    for (const filter of filters) s += `${filter.key},`
    return s.substring(0, s.length - 1)
}

export type ModuleStateAware = <IF extends Filter>(
    initializedFilter: IF,
    uninitializedFilter: Filter<any, false>,
) => Filter<FilterResult<IF>, false>

/**
 * Filter modules depending on their initialized state. **Initialized modules with bad exports are skipped.**
 *
 * @param initializedFilter The filter to use for initialized modules.
 * @param uninitializedFilter The filter to use for uninitialized modules.
 *
 * @example
 * ```ts
 * // will filter byProps('x') for initialized modules
 * // and byDependencies([1, 485, , 2]) for uninitialized modules
 * const SomeModule = await findModule(moduleStateAware(
 *   byProps('x'),
 *   byDependencies([1, 485, , 2]),
 * ))
 * ```
 */
export const moduleStateAware = createFilterGenerator<Parameters<ModuleStateAware>>(
    ([initializedFilter, uninitializedFilter], id, exports) => {
        if (isModuleInitialized(id)) {
            if (!initializedModuleHasBadExports(id)) return initializedFilter(id, exports)
            return false
        }

        return uninitializedFilter(id)
    },
    ([f1, f2]) => `revenge.moduleStateAware(${f1.key},${f2.key})`,
) as ModuleStateAware

export type PreferExports = <WEF extends Filter>(
    withExportsFilter: WEF,
    exportslessFilter: Filter<any, false>,
) => Filter<FilterResult<WEF>, false>

/**
 * Filter modules depending on if their exports are available and filterable.
 *
 * @see {@link isModuleExportsBad} for more information on what is considered bad module exports.
 *
 * @see {@link moduleStateAware} for an alternative that filters based on the module's initialized state.
 *
 * @param withExportsFilter The filter to use for modules with proper exports.
 * @param exportslessFilter The filter to use for modules without proper exports (uninitialized or bad).
 *
 * @example
 * ```ts
 * // will filter byProps('x') for modules with proper exports
 * // and byDependencies([1, 485, , 2]) for without proper exports (uninitialized or bad)
 * const SomeModule = await findModule(preferExports(
 *   byProps('x'),
 *   byDependencies([1, 485, , 2]),
 * ))
 * ```
 */
export const preferExports = createFilterGenerator<Parameters<PreferExports>>(
    ([withExportsFilter, exportslessFilter], id, exports) => {
        if (_mInited.has(id)) return withExportsFilter(id, exports)
        return exportslessFilter(id)
    },
    ([f1, f2]) => `revenge.preferExports(${f1.key},${f2.key})`,
) as PreferExports
