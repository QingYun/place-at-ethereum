const WSServer = require('websocket').server;

module.exports = (server, canvas) => {
  wss = new WSServer({
    httpServer: server
  });

  wss.on('request', (req) => {
    // TODO: origin filtering
    const connection = req.accept('place-watcher-protocol', req.origin);
    connection.sendUTF(JSON.stringify({ 
      action: 'INIT_CANVAS',
      payload: {
        canvas: canvas.getPoints(),
      },
    }));
  });

  canvas.onColorChange((x, y, color) => {
    wss.connections.forEach(c => c.sendUTF(JSON.stringify({
      action: 'UPDATE_PIXEL',
      payload: {
        x, y, 
        attr: { color, },
      },
    })))
  });

  canvas.onResize((oldSize, newSize) => {
    wws.connections.forEach(c => c.sendUTF(JSON.stringify({
      action: 'RESIZE_CANVAS',
      payload: {
        size: newSize,
      },
    })));
  });

}