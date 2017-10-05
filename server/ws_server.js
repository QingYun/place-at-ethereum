const WSServer = require('websocket').server;

module.exports = (server) => {
  wss = new WSServer({
    httpServer: server
  });

  wss.on('request', (req) => {
    console.log(req.origin);
    const connection = req.accept('place-watcher-protocol', req.origin);
    connection.sendUTF('hello websocket')
  });
}