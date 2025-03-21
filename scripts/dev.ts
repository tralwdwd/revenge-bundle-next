import { join } from 'path'
import watcher from '@parcel/watcher'
import chalk from 'chalk'
import build from './build'

const cwdify = (path: string) => join(process.cwd(), path)

const Sources = ['src', 'lib', 'plugins'].map(cwdify)
const ExitTriggers = ['scripts', 'package.json', 'bun.lock'].map(cwdify)

function debounce<F extends (...args: any[]) => any>(func: F, timeout: number) {
    let timer: NodeJS.Timer
    return (...args: Parameters<F>) =>
        new Promise(rs => {
            clearTimeout(timer)
            timer = setTimeout(() => {
                rs(func(...args))
            }, timeout)
        })
}

const buildDevWithDebounceAndCatchErrors = debounce(async () => {
    try {
        return await build(true)
    } catch (e) {
        console.error(e)
    }
}, 250)

watcher.subscribe(process.cwd(), async (err, events) => {
    if (err) return console.error(err)

    if (events.some(it => ExitTriggers.some(se => it.path.startsWith(se)))) {
        console.error(chalk.redBright('\u26A0 Scripts or packages has changed, exiting!'))
        process.exit()
    }

    if (events.some(it => Sources.some(src => it.path.startsWith(src)))) await buildDevWithDebounceAndCatchErrors()
})

const server = Bun.serve({
    fetch(req, srv) {
        console.debug(chalk.gray(`\u{1F79B} Receiving request from ${srv.requestIP(req)!.address}`))
        return new Response(Bun.file('./dist/revenge.bundle'))
    },
    port: 4040,
})

console.info(chalk.cyanBright(`\u24D8 Serving on port ${server.port}`))

await buildDevWithDebounceAndCatchErrors()
