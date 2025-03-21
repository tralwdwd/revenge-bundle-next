/**
 * This patch prevents objects from being made immutable.
 */

// Retain reference to the functions so the actual functions can be used later
import '@revenge-mod/utils/functions'

Object.freeze = Object.seal = Object.preventExtensions = o => o
