const { WatchedDir } = require('broccoli-source');
const Funnel = require('broccoli-funnel');
const merge = require('broccoli-merge-trees');
const uglify = require('broccoli-uglify-sourcemap');
const CleanCSS = require('broccoli-clean-css');
const Fiber = require('fibers');

import CompileScssMulti from './compile-scss-multi';
import { execSync } from 'child_process';

export default () => {
  // TODO: This is an artifact of how LJ::get_all_directories works, so if that ever gets simplified, so can this.
  let myDirs = execSync("find $LJHOME -type d -path *htdocs").toString().split("\n");
  let htdocs = merge(myDirs.map( dir => new WatchedDir(dir) ), {overwrite: true});
  // DW_DEV is "1" (as string) or undefined. 1 is the only "yes" value.
  let isProduction = parseInt(process.env.DW_DEV) !== 1;

  // Images: whatever
  let imgDir = new Funnel(htdocs, {
    srcDir: 'img',
    destDir: 'img',
    annotation: 'Image dir (copy)',
  });

  // Vanilla ES5 JS: send it through the ES5 uglifier, if in prod.
  let jsDir = new Funnel(htdocs, {
    srcDir: 'js',
    destDir: 'js',
    annotation: 'JS dir (copy)',
  });

  if (isProduction) {
    jsDir = uglify(jsDir, {
      annotation: 'JS dir (uglify)',
      hiddenSourceMap: true, // until we stop w/ concat_res, they're useless.
    });
  }

  // Vanilla CSS PLUS some maybe weird stuff? just set it down over there, don't jostle it too hard.
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
