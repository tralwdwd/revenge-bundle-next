import RevengeIcon from '~assets/RevengeIcon'
// TODO(PalmDevs): switch to external fetches
import Data from './data.json'
import type { AssetId } from '@revenge-mod/assets/types'

export const Badges = {
    revenge_team: {
        label: 'Revenge Team',
        description: 'This user is a member of the Revenge team.',
        getAsset: () => RevengeIcon,
        bnw: true,
        showDialog: true,
    },
} satisfies Record<string, Badge>

export const UsersWithBadges = Data as Record<string, BadgeId[]>

export type Badge = {
    label: string
    getAsset: () => AssetId
    description: string
    /**
     * Black and white icon
     * @default false
     */
    bnw?: boolean
    showDialog?: boolean
}

export type BadgeId = keyof typeof Badges
