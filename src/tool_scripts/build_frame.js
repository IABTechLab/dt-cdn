/**
 * Script to build the iframe with embedded code inside.
 * */

var fs = require('fs');

var markupBuffer = null,
  iframeBuffer = null,
  scriptFullBuffer = null,
  scriptMinBuffer = null;

const DEBUG_IDAPI_SETTING = 'configGeneral.urls.digitrustIdService = "../misc/faked_id_service_v1.json" //http://local.digitru.st/misc/faked_id_service_v1.json'
const DEBUG_SCRIPT_TAG = "<script src='./digitrust_iframe.js'></script>"
const PROD_SCRIPT_TAG = "<script src='./digitrust_iframe.min.js'></script>"

const outputFile = {
  EMBEDDED: 'dt-embed.html',
  REF: 'dt.html',
  DEBUG: 'dt_debug.html'
};

const replaceTokens = {
  SCRIPTREF: "<script src='./digitrust.min.js'></script>",
  CONFIG_DEBUG: '/* TOKEN ADDITIONAL SETTINGS */'
}


fs.readFile('./dist/digitrust_iframe.min.js', 'utf8', function (err, contents) {
  scriptMinBuffer = contents;
  checkComplete(scriptMinBuffer, scriptFullBuffer, iframeBuffer);
});
fs.readFile('./dist/digitrust_iframe.js', 'utf8', function (err, contents) {
  scriptFullBuffer = contents;
  checkComplete(scriptMinBuffer, scriptFullBuffer, iframeBuffer);
});
fs.readFile('./pages/dt.html', 'utf8', function (err, contents) {
  iframeBuffer = contents;
  checkComplete(scriptMinBuffer, scriptFullBuffer, iframeBuffer);
});


/**
 * Tests that all needed contents are loaded.
 * If so, proceeds with writing the files
 * @param {any} scripts
 * @param {any} markup
 */
function checkComplete(scriptMin, scriptFull, markup){
  if (scriptMin == null
    || scriptFull == null
    || markup == null) {
    return;
  }

  var debugMarkup = formatDebugFile(markup);
  var embedMarkup = formatEmbedFile(markup, scriptMin);
  var refMarkup = formatScriptRef(markup);
  var fileRef;
  
  var files = [
    { file: './dist/' + outputFile.REF, data: refMarkup },
    { file: './dist/' + outputFile.EMBEDDED, data: embedMarkup },
    { file: './dist/' + outputFile.DEBUG, data: debugMarkup }
  ];


  for (let i = 0; i < files.length; i++) {
    fileRef = files[i].file;
    if (fs.existsSync(fileRef)) {
      fs.unlinkSync(fileRef);
    }

    fs.writeFile(fileRef, files[i].data, function (err, data) {
      if (err) {
        console.log(err);
        return;
      }
    });
  }
}


/**
 * Format the source into the debug iFrame
 * @param {any} markup
 */
function formatDebugFile(markup) {
  var result = markup.replace(replaceTokens.SCRIPTREF, DEBUG_SCRIPT_TAG).replace(replaceTokens.CONFIG_DEBUG, DEBUG_IDAPI_SETTING);
  return result;
}

/**
 * Format the source into the debug iFrame
 * @param {any} markup
 */
function formatEmbedFile(markup, embedScript) {
  var result = markup.replace(replaceTokens.SCRIPTREF, "<script>\n" + embedScript + "\n</script>\n");
  return result;
}

/**
 * Format the source into the debug iFrame
 * @param {any} markup
 */
function formatScriptRef(markup) {
  var result = markup.replace(replaceTokens.SCRIPTREF, PROD_SCRIPT_TAG);
  return result;
}

