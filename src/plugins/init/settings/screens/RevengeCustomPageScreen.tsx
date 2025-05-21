import { React } from '@revenge-mod/react'

import type { StackScreenProps } from '@react-navigation/stack'
import type { ReactNavigationParamList } from '@revenge-mod/externals/react-navigation'

import type { MobileSetting, UserSettingsSections } from '../constants'

export default function RevengeCustomPageScreen({
    route,
    navigation,
}: StackScreenProps<
    ReactNavigationParamList,
    (typeof UserSettingsSections)[(typeof MobileSetting)['REVENGE_CUSTOM_PAGE']]
>) {
    const { render: PageComponent, options } = route.params

    React.useEffect(() => {
        if (options) navigation.setOptions(options)
    }, [])

    return <PageComponent />
}
