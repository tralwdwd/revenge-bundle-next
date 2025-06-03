export function createLogger(tag: string) {
    return {
        log: (message: string) => console.log(`[${tag}] ${message}`),
        warn: (message: string) => console.warn(`[${tag}] ${message}`),
        error: (message: string) => console.error(`[${tag}] ${message}`),
        wtf: (message: string) =>
            console.error(`\u001b[31m[${tag}] ${message}\u001b[0m`),
    } satisfies BasicLogger
}

export interface BasicLogger {
    /**
     * Log a message to the console.
     */
    log(...args: unknown[]): void
    /**
     * Log a warning message to the console.
     *
     * On Android, this will print to logcat with the `WARN` level.
     */
    warn(...args: unknown[]): void
    /**
     * Log an error message to the console.
     *
     * On Android, this will print to logcat with the `ERROR` level.
     */
    error(...args: unknown[]): void
    /**
     * [*What a Terrible Failure!*](https://developer.android.com/reference/android/util/Log#wtf(java.lang.String,%20java.lang.String))
     *
     * Log an error message to the console in red (ANSI)
     *
     * On Android, this will print to logcat with the `ERROR` level.
     */
    wtf(...args: unknown[]): void
}
