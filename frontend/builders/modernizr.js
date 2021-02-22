const modernizr = require('modernizr');
const fs = require('fs');
const dist = __dirname + '/../dist';

module.exports = function() {
  modernizr.build({
    minify: true,
    enableJSClass: true,
    enableClasses: true,
    classPrefix: "",
    options: [
      'html5shiv',
      'addTest',
    ],
    "feature-detects": [
      "css/transforms",
      "css/transitions",
      "css/flexbox",
      "css/fontface",
      "css/generatedcontent",
      "touchevents",
    ],
  }, output => {
    // Hack: alias (bad, deprecated) touchevents feature to its old name.
    output += "\n; Modernizr.addTest('touch', Modernizr.touchevents);"
    fs.mkdirSync(`${dist}/modernizr`, { recursive: true });
    fs.writeFileSync(`${dist}/modernizr/custom.modernizr.js`, output);
  });
};
