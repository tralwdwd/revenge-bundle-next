import { _mUninited } from '@revenge-mod/modules/_/metro'

if (_mUninited.has(0)) throw new Error('Cannot import this file before index (module 0) is required')
