const https = require('https');
const fs =require('fs');

//makes http into https
const options = {
    key: fs.filehandle.sync('key.pem'),
    cert: fs.filehandle.sync('cert.pem')
    // fs.readFile VS fs.readFileSync === security VS serverload
};
https.createServer(options, function (rq, res) {
    res.writeHead(200); //ie 300 404
    res.end("Hello WorldJ from my js.node!");

}).listen(65536); //wat? LOL! (Math.random()*max) let max = 65536
/*
let handleRequest = (request, response) => {
    response.writeHead(200, {
        'Content-type': 'text-plain'
    });
    response.write('hello website on node.js server'),
    response.end();
};

http.createServer(handleRequest).listen(65501);
*/