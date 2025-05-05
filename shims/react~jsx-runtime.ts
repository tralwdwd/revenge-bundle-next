import { ReactJsxRuntime } from '@revenge-mod/react'
import { getProxyTarget, isProxy } from '@revenge-mod/utils/proxy'

import type { ElementType } from 'react'

const { jsx: _jsx, jsxs: _jsxs, Fragment } = ReactJsxRuntime

const jsx = ((type, ...args) =>
    _jsx(isProxy(type as object) ? (getProxyTarget(type as object) as ElementType) : type, ...args)) as typeof _jsx
const jsxs = ((type, ...args) =>
    _jsxs(isProxy(type as object) ? (getProxyTarget(type as object) as ElementType) : type, ...args)) as typeof _jsxs

export { jsx, jsxs, Fragment }
