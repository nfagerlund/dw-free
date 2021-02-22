import { WatchedDir } from 'broccoli-source';
import Funnel from 'broccoli-funnel';
import merge from 'broccoli-merge-trees';
import Terser from 'broccoli-terser-sourcemap';
import CleanCSS from 'broccoli-clean-css';
import Fiber from 'fibers';
import { execSync } from 'child_process';

import CompileScssMulti from './compile-scss-multi.js';
import modules from './modules.js';

export default () => {
  // TODO: This is tied to LJ::get_all_directories. If that gets simplified, so can this.
  let myDirs = execSync("find -L $LJHOME -type d -path *htdocs")
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
      terser: {
        compress: true,
        mangle: true,
        sourceMap: false, // concat_res makes sourcemaps useless
      },
      hiddenSourceMap: true, // concat_res makes sourcemaps useless
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

  return merge([imgDir, jsDir, stcDir, scssFinal, ...modules], {
    annotation: 'Final merge',
    overwrite: true,
  });
}
