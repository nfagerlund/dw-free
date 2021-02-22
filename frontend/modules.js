// This is where we map modern components from npm modules to wherever we want
// them to live in the static build directory.

// Use broccoli-funnel objects to specify where things ought to go, then export
// all those funnels as an array.

// Most of the time you'll probably want to use `resolve('module-name')` to
// reach into an npm module's `dist` directory or something.

import Funnel from 'broccoli-funnel';
import { resolve } from 'path';

let modernizr = new Funnel(
  './dist/modernizr', {
    files: ['custom.modernizr.js'],
    destDir: 'js/foundation/vendor',
  }
);

export default [
  modernizr,
];
