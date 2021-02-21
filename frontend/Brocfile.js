const { WatchedDir } = require('broccoli-source');
const Funnel = require('broccoli-funnel');
const merge = require('broccoli-merge-trees');
const Terser = require('broccoli-terser-sourcemap');
const CleanCSS = require('broccoli-clean-css');
const Fiber = require('fibers');

import CompileScssMulti from './compile-scss-multi';
import { execSync } from 'child_process';

export default () => {
  // TODO: This is tied to LJ::get_all_directories. If that gets simplified, so can this.
  let myDirs = execSync("find $LJHOME -type d -path *htdocs")
    .toString().split("\n").filter(s => s !== '');
  let htdocs = merge(myDirs.map( dir => new WatchedDir(dir) ), {overwrite: true});
  // DW_DEV must be set to "1" on dev servers.
  let isProduction = parseInt(process.env.DW_DEV) !== 1;

  // Images: whatever
  let imgDir = new Funnel(htdocs, {
    srcDir: 'img',
    destDir: 'img',
    annotation: 'Image dir (copy)',
  });

  // Classic JavaScript stuff
  let jsDir = new Funnel(htdocs, {
    srcDir: 'js',
    destDir: 'js',
    annotation: 'JS dir (copy)',
  });

  // JS compression for prod:
  if (isProduction) {
    jsDir = new Terser(jsDir, {
      annotation: 'JS dir (compress)',
      hiddenSourceMap: true, // until we stop w/ concat_res, they're useless.
    });
  }

  // Vanilla CSS PLUS some maybe weird stuff like old RTE? just set it down over
  // there, don't jostle it too hard.
  let stcDir = new Funnel(htdocs, {
    srcDir: 'stc',
    destDir: 'stc',
    annotation: 'stc dir (copy)',
  });

  // CSS compression for prod:
  if (isProduction) {
    let compressed = new CleanCSS(stcDir, {
      annotation: 'cleaned CSS from stc dir',
    });
    stcDir = merge([stcDir, compressed], {
      annotation: 'stc dir (with cleaned CSS)',
      overwrite: true,
    });
  }

  // SCSS: start w/ an isolated working directory, so the include paths work out
  // more easily. Then compile to CSS, then move things to the expected final
  // location.
  let scssDir = new Funnel(htdocs, {
    srcDir: 'scss',
    destDir: '.',
    annotation: 'SCSS dir (copy to root)',
  });
  let sassOptions = {
    fiber: Fiber, // slightly faster.
    annotation: 'SCSS dir (convert all)',
  };
  if (process.env.NODE_ENV === 'production') {
    sassOptions.outputStyle = 'compressed';
  }
  let scssOutput = new CompileScssMulti([scssDir], sassOptions);
  let scssFinal = new Funnel(scssOutput, {
    srcDir: '.',
    destDir: 'stc/css',
    annotation: 'SCSS dir (copy to stc/css)',
  });

  return merge([imgDir, jsDir, stcDir, scssFinal], {
    annotation: 'Final merge',
    overwrite: true,
  });
}
