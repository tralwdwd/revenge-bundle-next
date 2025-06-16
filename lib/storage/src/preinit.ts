import { _emitter } from '@revenge-mod/plugins/_'

_emitter.on('register', (plugin, options) => (plugin._s = options.storage))
