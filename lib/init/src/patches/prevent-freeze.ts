/**
 * This patch prevents objects from being made immutable.
 */

// Retain reference to the functions so the actual functions can be used later
import '@revenge-mod/utils/functions'

// Discord only uses Object.freeze
Object.freeze = (o: any) => o
