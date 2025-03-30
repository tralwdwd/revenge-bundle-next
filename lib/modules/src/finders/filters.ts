import { _mMetadatas } from '../metro/_internal'
import type { Metro } from '../../types/metro'

export type FilterResult<F> = F extends Filter<infer R> ? R : never

export interface Filter<_Inferable> {
    (exports: Metro.ModuleExports, id: Metro.ModuleID): boolean
    key: string
}

export function createFilterGenerator<A extends any[]>(
    filter: (args: A, exps: Metro.ModuleExports, id: Metro.ModuleID) => boolean,
    keyFor: (args: A) => string,
) {
    return (...args: A) => {
        const f = (exps: Metro.ModuleExports, id: Metro.ModuleID) => filter(args, exps, id)
        f.key = keyFor(args)
        // biome-ignore lint/complexity/noBannedTypes: So it doesn't turn into `any` when you combine it with other typed filters
        return f as Filter<{}>
    }
}

export type ByProps = <T extends Record<string, any> = Record<string, any>>(
    prop: keyof T,
    ...props: Array<keyof T>
) => Filter<T>

/**
 * Filter modules by their exports having all of the specified properties.
 *
 * @param prop The property to check for.
 * @param props The rest of the properties to check for (optional).
 *
 * @example
 * ```ts
 * const React = await find(byProps<typeof import('react')>('createElement'))
 * // const React: typeof import('react')
 * ```
 */
export const byProps = createFilterGenerator<Parameters<ByProps>>(
    (props, exports) => props.every(prop => exports[prop]),
    props => `revenge.props(${props.join(',')})`,
) as ByProps

export type ByName = <T extends string | object>(
    name: T extends string ? T : T extends { name: string } ? T['name'] : string,
) => Filter<T extends string ? { name: T } : T & { name: typeof name }>

/**
 * Filter modules by their exports having the specified name.
 *
 * Usually used for function components or classes.
 *
 * @param name The name to check for.
 *
 * @example Auto-typing as object
 * ```ts
 * const SomeComponent = await find(byName('SomeComponent'))
 * // const SomeComponent: { name: 'SomeComponent' }
 * ```
 *
 * @example Typing as function component
 * ```ts
 * type MyComponent = React.FC<{ foo: string }>
 *
 * const MyComponent = await find(byName<MyComponent>('MyComponent'))
 * // const MyComponent: MyComponent & { name: 'MyComponent' }
 * ```
 *
 * @example Typing as class
 * ```
 * interface SomeClass {
 *    someMethod(): void
 * }
 *
 * const SomeClass = await find(byName<{ new(param: string): SomeClass }>('SomeClass'))
 * // const SomeClass: { new(): SomeClass, name: 'SomeClass' }
 */
export const byName = createFilterGenerator<Parameters<ByName>>(
    ([name], exports) => exports.name === name,
    ([name]) => `revenge.name(${name})`,
) as ByName

/**
 * Filter modules by their dependency map.
 *
 * @param deps The dependency map to check for, can be a sparse array or have `undefined` for "any dependency". **Order and size matters!**
 *
 * @example
 * ```ts
 * const Logger = await find(byDependencies([4, undefined, 2]))
 * // or
 * const Logger = await find(byDependencies([4, , 2]))
 * ```
 */
export const byDependencies = createFilterGenerator<[Array<Metro.ModuleID | undefined>]>(
    ([deps], _, id) => {
        const actDeps = _mMetadatas.get(id)![0]
        if (actDeps.length === deps.length)
            for (let i = 0; i < deps.length; i++) {
                const cmp = deps[i]
                if (Number.isInteger(cmp) && actDeps[i] !== cmp) return false
            }

        return true
    },
    deps => `revenge.deps(${deps.join(',')})`,
)

/**
 * Combines multiple filters into one.
 *
 * @param filters The filters to combine.
 *
 * @example
 * ```ts
 * const SomeModule = await find(combine(
 *    byProps('x', 'name'),
 *    byName('SomeName'),
 *    byDependencies([1, 485, , 2]),
 * ))
 */
export function combine<F1 extends Filter<any>, F2 extends Filter<any>>(
    f1: F1,
    f2: F2,
): Filter<FilterResult<F1> & FilterResult<F2>>

export function combine<F1 extends Filter<any>, F2 extends Filter<any>, F3 extends Filter<any>>(
    f1: F1,
    f2: F2,
    f3: F3,
): Filter<FilterResult<F1> & FilterResult<F2> & FilterResult<F3>>

export function combine<F1 extends Filter<any>, F2 extends Filter<any>, F3 extends Filter<any>, F4 extends Filter<any>>(
    f1: F1,
    f2: F2,
    f3: F3,
    f4: F4,
): Filter<FilterResult<F1> & FilterResult<F2> & FilterResult<F3> & FilterResult<F4>>

export function combine<
    F1 extends Filter<any>,
    F2 extends Filter<any>,
    F3 extends Filter<any>,
    F4 extends Filter<any>,
    F5 extends Filter<any>,
>(
    f1: F1,
    f2: F2,
    f3: F3,
    f4: F4,
    f5: F5,
): Filter<FilterResult<F1> & FilterResult<F2> & FilterResult<F3> & FilterResult<F4> & FilterResult<F5>>

export function combine(...filters: Filter<any>[]): Filter<any> {
    const cf: Filter<any> = (exports, id) => {
        for (const filter of filters) if (!filter(exports, id)) return false
        return true
    }

    cf.key = `revenge.combine(${filters.map(filter => filter.key).join(',')})`

    return cf
}
