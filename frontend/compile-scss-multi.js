// This plugin takes ONE inputPath of scss files, plus optionally some extra
// include paths. Its output includes every SCSS file that isn't a "_partial" as
// a separate output file

// This copies some logic from the broccoli-sass-source-maps library, but does
// different stuff with it. (That plugin expects that you want to compile ONE
// omnibus CSS file for your app, and we don't.)

import MultiFilter from 'broccoli-multifilter';
import sass from 'sass';
import walkSync from 'walk-sync';
import RSVP from 'rsvp';
import path from 'path';
import fs from 'fs';
const writeFile = RSVP.denodeify(fs.writeFile);

class CompileScssMulti extends MultiFilter {
  constructor(inputNodes, options) {
    super(inputNodes, options);
    options = options || {};

    this.extraIncludePaths = options.includePaths || [];

    this.renderSass = RSVP.denodeify(sass.render);
    this.sassOptions = {
      importer: options.importer,
      functions: options.functions,
      indentedSyntax: options.indentedSyntax,
      omitSourceMapUrl: options.omitSourceMapUrl,
      outputStyle: options.outputStyle,
      precision: options.precision,
      sourceComments: options.sourceComments,
      fiber: options.fiber
    };
  }

  async build() {
    // Ignoring more than one inputPath.
    let inputPath = this.inputPaths[0];
    // Exclude _partial.scss
    let inputFiles = walkSync(inputPath).filter( inFile => path.extname(inFile) === '.scss' && path.basename(inFile).slice(0,1) !== '_' );

    return this.buildAndCache(
      inputFiles,
      async (relativePath, outputDirectory) => {
        let fullInputPath = path.join(inputPath, relativePath);
        let fullOutputPath = path.join(outputDirectory, relativePath.replace(/\.scss$/, '.css'));

        // Make sure there's somewhere to put it
        fs.mkdirSync(path.dirname(fullOutputPath), { recursive: true });

        let sassOptions = {
          file: fullInputPath,
          outFile: fullOutputPath,
          includePaths: [
            ...this.inputPaths,
            ...this.extraIncludePaths
          ],
        };
        Object.assign(sassOptions, this.sassOptions);
        let result = await this.renderSass(sassOptions);

        // actually write it
        await writeFile(fullOutputPath, result.css);

        // Dependencies and caching only affect watch mode, but sure, why not.
        return {
          dependencies: [
            fullInputPath,
            ...result.stats.includedFiles
          ]
        };
      }
    );
  }
}

export default CompileScssMulti;
