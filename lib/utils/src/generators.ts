/**
 * Get the next value from a generator, optionally skipping a number of values.
 *
 * @param generator The generator to get the value from.
 * @param skip The number of values to skip before getting the next value. Think of it as the generator being turned into an array, what index of the array do you want to return?
 * @returns The next value from the generator.
 *
 * @example
 * ```ts
 * const generator = function* () {
 *    yield 1
 *    yield 2
 *    yield 3
 * }
 *
 * const arr = [...generator()] // [1, 2, 3]
 *
 * yielded(generator()) === arr[0]
 * yielded(generator(), 1) === arr[1]
 * yielded(generator(), 2) === arr[2]
 */
export function yielded<T>(generator: Generator<T>, skip = 0): T {
    if (skip)
        for (let i = 0; i < skip; i++)
            if (generator.next().done)
                throw new Error(
                    `Generator has no more values to drop (dropped ${i + 1} out of ${skip})`,
                )

    return generator.next().value
}
