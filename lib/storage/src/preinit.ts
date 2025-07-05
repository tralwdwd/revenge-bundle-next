import { pEmitter } from '@revenge-mod/plugins/_'

pEmitter.on('register', (plugin, options) => {
    plugin._s = options.storage
})
