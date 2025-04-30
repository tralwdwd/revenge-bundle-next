export * from './lookup'
export * from './wait'
export * from './find'

/**
 * Maybe the default export matched instead of the namespace, because you're using `options.returnNamespace`.
 */
export type MaybeDefaultExportMatched<T> = T | { default: T }
