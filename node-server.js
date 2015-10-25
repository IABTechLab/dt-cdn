var connect = require('connect');
var serveStatic = require('serve-static');

function setHeaders(res, path) {
  res.setHeader('P3P', 'CP="IDC DSP COR ADM DEVi TAIi PSA PSD IVAi IVDi CONi HIS OUR IND CNT"')
}

connect().use(
    serveStatic(
        __dirname,
        {
            'setHeaders': setHeaders
        }
    )
).listen(8080);