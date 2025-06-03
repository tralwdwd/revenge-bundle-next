export type Nullish = null | undefined
export type If<T, Then, Else> = T extends true ? Then : Else
export type AnyObject = Record<any, any>
export type LogicalOr<T1, T2> = T1 extends true
    ? true
    : T2 extends true
      ? true
      : false
export type DeepPartial<T> = {
    [K in keyof T]?: T[K] extends AnyObject ? DeepPartial<T[K]> : T[K]
}
