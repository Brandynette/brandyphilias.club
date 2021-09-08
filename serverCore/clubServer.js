const http = require('http');
const https = require('https');

const fs = require('fs/promises');


//makes http into https
const options = {
    key: fs.filehandle.sync('key.pem'),
    cert: fs.filehandle.sync('cert.pem')
    // fs.readFile VS fs.readFileSync === security VS serverload
};

const requestListener = function (req, res) {
  res.writeHead(200);
  res.end('Hello, World!');
}

const http.server = http.createServer(requestListener);
const https.server = https.createServer(requestListener);

server.listen(8080);