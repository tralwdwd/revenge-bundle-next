import watcher from '@parcel/watcher'
import { debounce } from '@revenge-mod/utils/callbacks'
import chalk from 'chalk'
import { join } from 'path'
import build from './build'

const cwdify = (path: string) => join(process.cwd(), path)
const Sources = ['src', 'lib', 'plugins'].map(cwdify)
const ExitTriggers = ['scripts', 'package.json', 'bun.lock'].map(cwdify)

const buildDevWithDebounceAndCatchErrors = debounce(async () => {
    needRebuild = false

    try {
        return await build(true)
    } catch (e) {
        console.error(e)
    }
}, 250)

let needRebuild = true

watcher.subscribe(process.cwd(), async (err, events) => {
    if (err) return console.error(err)

    if (events.some(it => ExitTriggers.some(se => it.path.startsWith(se)))) {
        console.error(chalk.redBright('\u26A0 Scripts or packages has changed, exiting!'))
        process.exit()
    }

    needRebuild ||= events.some(it => Sources.some(src => it.path.startsWith(src)))
})

const server = Bun.serve({
    async fetch(req, srv) {
        if (needRebuild) await buildDevWithDebounceAndCatchErrors()
        console.debug(chalk.gray(`\u{1F79B} Receiving request from ${srv.requestIP(req)!.address}`))
        return new Response(Bun.file('./dist/revenge.bundle'))
    },
    port: 4040,
})

console.info(chalk.cyanBright(`\u24D8 Serving on port ${server.port}`))
