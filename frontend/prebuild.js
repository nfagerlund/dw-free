// Perform any prebuild actions that need to happen before the main asset build.

// *Ideally* this zone should be pretty barren, because anything that creates
// files we depend on should already be handled as of `yarn install`. But not
// everything is that well behaved, especially with older libraries, so we have
// this prebuild step as a backstop.
const buildModernizr = require('./builders/modernizr');

buildModernizr();
