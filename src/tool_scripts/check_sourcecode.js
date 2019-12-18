/**
 * Checks the source code for disallowed calls
 * */

var fs = require('fs');
var path = require('path');

// Disallowed method calls
var illegalCalls = [
  'console.'
];




function checkFileForDisallowedCalls(filename) {
  var i, loc, check, err;
  var sec, lineCnt;

  var buffer = fs.readFileSync(filename, 'utf8');

  for (i = 0; i < illegalCalls.length; i++) {
    check = illegalCalls[i];
    loc = buffer.indexOf(check);
    if (loc > -1) {
      sec = buffer.substr(0, loc);
      lineCnt = sec.split(/\n/).length;
      err = 'Found disallowed call in file ' + filename + ' at position ' + loc + ' line ' + lineCnt + '\n'
        + ' call to ' + check + '\n';
      throw err;
    }
  }

  /*
  fs.readFile('filename', 'utf8', function (err, contents) {
    iframeBuffer = contents;
    checkComplete(scriptMinBuffer, scriptFullBuffer, iframeBuffer);
  });

  fs.readFile('./pages/redirect.html', 'utf8', function (err, contents) {
    redirectBuffer = contents;
    writeRedirectFiles(redirectBuffer);
  });
  */
}

function walkContents(folder, foundFiles) {
  var files = fs.readdirSync(folder);
  files.forEach(function (file) {
    var filePath = path.join(folder, file);
    if (fs.statSync(filePath).isDirectory()) {
      walkContents(filePath, foundFiles);
    }
    else {
      foundFiles.push(filePath);
    }
  })
}


function checkDisallowedCalls() {
  var fileList = [];
  walkContents('./src/modules', fileList);
  console.log('Checking source code for disallowed statements')

  fileList.forEach(function (file) {
    if (file.indexOf('.js') < file.length - 3) {
      return;
    }
    if (file.indexOf('logger.js') == -1) {
      checkFileForDisallowedCalls(file);
    }
  })


}

module.exports = {
  checkDisallowedCalls: checkDisallowedCalls
};

