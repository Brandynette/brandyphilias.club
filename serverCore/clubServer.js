const https = require('https');

let handleRequest = (request, response) => {
    response.writeHead(200, {
        'Content-type': 'text-plain'
    });
    response.write('hello website on node.js server'),
    response.end();
};

http.createServer(handleRequest).listen(65501);

//server ready send notification to discord server
//POST/channels/{channel.id}/webhooks
///{
///  "type": 1,
///  "id": "ItsOver1€",
///    "avatar":"https://discordapp.com/api/webhooks/856065916629942272/9cGk-A18YsG2u-R2LRCD4sHE6K-OsWJ5Jb59vhPbw_pxXwcXbEa44nAdd6tWT1ceZiFR0"
///}