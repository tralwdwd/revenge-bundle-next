export function allSettled(promises: Promise<any>[]): Promise<PromiseSettledResult<any>[]> {
    const mapped = promises.map(p =>
        p
            ?.then(
                value =>
                    ({
                        status: 'fulfilled',
                        value,
                    }) as const,
            )
            .catch(
                reason =>
                    ({
                        status: 'rejected',
                        reason,
                    }) as const,
            ),
    )

    return Promise.all(mapped)
}
