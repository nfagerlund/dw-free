// This is where we map modern components we bring in via npm modules to
// wherever we want them to live in the static build directory. Use
// broccoli-funnel objects to specify where things ought to go, then export them
// all as an array.

import Funnel from 'broccoli-funnel';

let modernizr = new Funnel(
  './dist/modernizr', {
    files: ['custom.modernizr.js'],
    destDir: 'js/foundation/vendor',
  }
);

export default [
  modernizr,
];
