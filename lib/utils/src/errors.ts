export function getErrorStack(e: unknown) {
    return e instanceof Error ? e.stack : String(e)
}
