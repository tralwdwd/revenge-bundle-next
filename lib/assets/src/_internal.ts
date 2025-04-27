import type { Asset } from '.'

export const _assets: Map<string, [first: Asset, all: Record<Asset['type'], Asset>]> = new Map()
