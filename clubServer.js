const https = require('https');

let handleRequest = (request, response) => {
    response.writeHead(200, {
        'Content-type': 'text-plain'
    });
    response.write('hello website on node.js server'),
    response.end();
};

http.createServer(handleRequest).listen(65501);