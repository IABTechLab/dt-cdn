/**
 * Script to build the iframe with embedded code inside.
 * Also generates debug versions of iframe and IPT redirect file
 * */

var fs = require('fs');

var redirectBuffer = null,
  iframeBuffer = null,
  scriptFullBuffer = null,
  scriptMinBuffer = null;

const DEBUG_IDAPI_SETTING = 'configGeneral.urls.digitrustIdService = "../misc/faked_id_service_v1.json" //http://local.digitru.st/misc/faked_id_service_v1.json'
const DEBUG_SCRIPT_TAG = "<script src='./digitrust_iframe.js'></script>"
const PROD_V2_SCRIPT_TAG = "<script src='./digitrust_iframe.min.js'></script>"
const DEBUG_V1_SCRIPT_TAG = "<script src='./digitrust.js'></script>"
const PROD_V1_SCRIPT_TAG = "<script src='./digitrust.min.js'></script>"
const PROD_REDIR_SCRIPT_TAG = "<script src='./digitrust.min.js'></script>"
const DEBUG_REDIR_SCRIPT_TAG = "<script src='./digitrust.js'></script>"

const outputFile = {
  EMBEDDED: 'dt-embed.html',
  REF: 'dt.html',
  DEBUG: 'dt_debug.html',
  REDIR: 'redirect.html',
  DEBUG_REDIR: 'redirect_debug.html'
};

const replaceTokens = {
  SCRIPTREF: "<script src='./digitrust.min.js'></script>",
  CONFIG_DEBUG: '/* TOKEN ADDITIONAL SETTINGS */'
}


function writeEmbedScriptAll() {
  fs.readFile('./dist/digitrust_iframe.min.js', 'utf8', function (err, contents) {
    scriptMinBuffer = contents;
    checkComplete(scriptMinBuffer, scriptFullBuffer, iframeBuffer, true, PROD_V2_SCRIPT_TAG);
  });
  fs.readFile('./dist/digitrust_iframe.js', 'utf8', function (err, contents) {
    scriptFullBuffer = contents;
    checkComplete(scriptMinBuffer, scriptFullBuffer, iframeBuffer, true, PROD_V2_SCRIPT_TAG);
  });
  fs.readFile('./pages/dt.html', 'utf8', function (err, contents) {
    iframeBuffer = contents;
    checkComplete(scriptMinBuffer, scriptFullBuffer, iframeBuffer, true, PROD_V2_SCRIPT_TAG);
  });

  fs.readFile('./pages/redirect.html', 'utf8', function (err, contents) {
    redirectBuffer = contents;
    writeRedirectFiles(redirectBuffer);
  });
}


function writeV1FrameFiles() {
  scriptMinBuffer = " /* DIGITRUST IFRAME */"
  scriptFullBuffer = "IGNORE";

  fs.readFile('./pages/dt.html', 'utf8', function (err, contents) {
    iframeBuffer = contents;
    checkComplete(scriptMinBuffer, scriptFullBuffer, iframeBuffer, false, PROD_V1_SCRIPT_TAG);
  });

  fs.readFile('./pages/redirect.html', 'utf8', function (err, contents) {
    redirectBuffer = contents;
    writeRedirectFiles(redirectBuffer);
  });
}




/**
 * Tests that all needed contents are loaded.
 * If so, proceeds with writing the files
 * @param {any} scripts
 * @param {any} markup
 */
function checkComplete(scriptMin, scriptFull, markup, writeEmbed, prodScriptRef){
  if (scriptMin == null
    || scriptFull == null
    || markup == null) {
    return;
  }

  var debugMarkup = formatDebugFile(markup, writeEmbed);
  var embedMarkup = formatEmbedFile(markup, scriptMin);
  var refMarkup = formatScriptRef(markup, prodScriptRef);
  var fileRef;
  
  var files = [
    { file: './dist/' + outputFile.REF, data: refMarkup },
    { file: './dist/' + outputFile.DEBUG, data: debugMarkup }
  ];

  if (writeEmbed) {
    files.push({ file: './dist/' + outputFile.EMBEDDED, data: embedMarkup });
  }


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

function writeRedirectFiles(buffer) {
  var fileRef;
  var files = [
    { file: './dist/' + outputFile.REDIR },
    { file: './dist/' + outputFile.DEBUG_REDIR}
  ];

  for (let i = 0; i < files.length; i++) {
    fileRef = files[i].file;
    if (fs.existsSync(fileRef)) {
      fs.unlinkSync(fileRef);
    }
  }

  fs.writeFile('./dist/' + outputFile.REDIR, buffer, function (err, data) {
    if (err) {
      console.log(err);
      return;
    }
  });

  var debugBuffer = buffer.replace(PROD_REDIR_SCRIPT_TAG, DEBUG_REDIR_SCRIPT_TAG);
  fs.writeFile('./dist/' + outputFile.DEBUG_REDIR, debugBuffer, function (err, data) {
    if (err) {
      console.log(err);
      return;
    }
  });

}


/**
 * Format the source into the debug iFrame
 * @param {any} markup
 */
function formatDebugFile(markup, writeEmbed) {
  var result;
  if (writeEmbed) {
    result = markup.replace(replaceTokens.SCRIPTREF, DEBUG_SCRIPT_TAG).replace(replaceTokens.CONFIG_DEBUG, DEBUG_IDAPI_SETTING);
  }
  else {
    result = markup.replace(replaceTokens.SCRIPTREF, DEBUG_V1_SCRIPT_TAG).replace(replaceTokens.CONFIG_DEBUG, DEBUG_IDAPI_SETTING);    
  }
  
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
 * Format the source into the prod iFrame
 * @param {any} markup
 */
function formatScriptRef(markup, scriptTag) {
  var result = markup.replace(replaceTokens.SCRIPTREF, scriptTag);
  return result;
}

function buildDebugFrameV1() {
  writeV1FrameFiles();
}


module.exports = {
  buildDebugFrameV1: buildDebugFrameV1,
  buildEmbedAll: writeEmbedScriptAll
};

