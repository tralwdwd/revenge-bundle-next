import { _mInited, _mMetadatas } from '../metro/_internal'

import type { If, LogicalOr } from '@revenge-mod/utils/types'
import type { Metro } from '../../types/metro'

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
 * // function createFilterGenerator<Arguments, WithExports>(filter, keyFor): ...
 * // * Arguments: The arguments for the filter function.
 * // * WithExports: Whether the filter function also filters exports.
 *
 * const custom = createFilterGenerator<[arg1: number, arg2: string], false>(
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
    filter: (args: A, id: Metro.ModuleID, exports?: Metro.ModuleExports) => boolean,
    keyFor: (args: A) => string,
): (...args: any[]) => Filter {
    return (...args: A) => {
        const f = (id: Metro.ModuleID, exports?: Metro.ModuleExports) => filter(args, id, exports)
        f.key = keyFor(args)
        return f
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
    (props, _, exports) => props.every(prop => exports[prop]),
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

/**
 * Filter modules by their dependency map.
 *
 * @param deps The dependency map to check for, can be a sparse array or have `undefined` for "any dependency". **Order and size matters!**
 *
 * @example
 * ```ts
 * const Logger = await findModule(byDependencies([4, undefined, 2]))
 * // or
 * const Logger = await findModule(byDependencies([4, , 2]))
 * ```
 */
export const byDependencies = createFilterGenerator<[Array<Metro.ModuleID | undefined>]>(
    ([deps], id) => {
        const actDeps = _mMetadatas.get(id)![0]
        if (actDeps.length === deps.length)
            for (let i = 0; i < deps.length; i++) {
                const cmp = deps[i]
                if (Number.isInteger(cmp) && actDeps[i] !== cmp) return false
            }
        else return false

        return true
    },
    deps => `revenge.deps(${deps.join(',')})`,
)

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
export function every<F1 extends Filter, F2 extends Filter>(
    f1: F1,
    f2: F2,
): Filter<FilterResult<F1> & FilterResult<F2>, LogicalOr<IsFilterWithExports<F1>, IsFilterWithExports<F2>>>

export function every<F1 extends Filter, F2 extends Filter, F3 extends Filter>(
    f1: F1,
    f2: F2,
    f3: F3,
): Filter<
    FilterResult<F1> & FilterResult<F2> & FilterResult<F3>,
    LogicalOr<LogicalOr<IsFilterWithExports<F1>, IsFilterWithExports<F2>>, IsFilterWithExports<F3>>
>

export function every(...filters: Filter[]): Filter {
    const f = (id: Metro.ModuleID, exports?: Metro.ModuleExports) => {
        for (const filter of filters) if (!filter(id, exports)) return false
        return true
    }

    f.key = `revenge.every(${filters.map(filter => filter.key).join(',')})`

    return f
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
export function some<F1 extends Filter, F2 extends Filter>(
    f1: F1,
    f2: F2,
): Filter<FilterResult<F1> | FilterResult<F2>, IsFilterWithExports<F1> | IsFilterWithExports<F2>>

export function some<F1 extends Filter, F2 extends Filter, F3 extends Filter>(
    f1: F1,
    f2: F2,
    f3: F3,
): Filter<
    FilterResult<F1> | FilterResult<F2> | FilterResult<F3>,
    IsFilterWithExports<F1> | IsFilterWithExports<F2> | IsFilterWithExports<F3>
>

export function some(...filters: Filter[]): Filter {
    const f = (id: Metro.ModuleID, exports?: Metro.ModuleExports) => {
        for (const filter of filters) if (filter(id, exports)) return true
        return false
    }

    f.key = `revenge.some(${filters.map(filter => filter.key).join(',')})`

    return f
}

/**
 * Filter modules depending on their initialized state.
 *
 * @param initializedFilter The filter to use for initialized modules.
 * @param uninitializedFilter The filter to use for uninitialized modules.
 */
export function moduleStateAware<IF extends Filter>(
    initializedFilter: IF,
    uninitializedFilter: Filter<any, false>,
): Filter<FilterResult<IF>, false> {
    const f = (id: Metro.ModuleID, exports?: Metro.ModuleExports) => {
        if (_mInited.has(id)) return initializedFilter(id, exports)
        return uninitializedFilter(id)
    }

    f.key = `revenge.moduleStateAware(${initializedFilter.key},${uninitializedFilter.key})`

    return f
}
