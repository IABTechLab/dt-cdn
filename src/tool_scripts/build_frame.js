/**
 * Script to build the iframe with embedded code inside.
 * */

var fs = require('fs');

var markupBuffer = null,
  scriptBuffer = null;

const EMBED_COMMENT = '/* SCRIPT CONTENTS HERE */';
const OUTPUT_FILE = 'dt-embed.html';


fs.readFile('./dist/digitrust_iframe.min.js', 'utf8', function (err, contents) {
  scriptBuffer = contents;
  checkComplete(scriptBuffer, markupBuffer);
});
fs.readFile('./pages/dt_debug.html', 'utf8', function (err, contents) {
  markupBuffer = contents;
  checkComplete(scriptBuffer, markupBuffer);
});



function checkComplete(scripts, markup){
  if (scripts == null || markup == null) {
    return;
  }

  let pos = markup.indexOf(EMBED_COMMENT);
  var newData = markup.replace(EMBED_COMMENT, scripts);

  var outputFile = './dist/' + OUTPUT_FILE;
  if (fs.existsSync(outputFile)) {
    fs.unlinkSync(outputFile);
  }

  fs.writeFile(outputFile, newData, function (err, data) {
    if (err) {
      console.log(err);
      return;
    }
    console.log("Successfully Written to File.");
  });

}

// console.log(scriptBuffer);

