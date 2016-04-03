var Net = require('net');
var SocketEventHandler = require('./SocketEventHandler.js');

var HOST = '0.0.0.0';
var PORT = 3001;

SocketEventHandler.handleMongooseConnection();

var Server = Net.createServer(function (socket) {
    
    SocketEventHandler.handleNewConnection(socket);
    SocketEventHandler.handleSetKeepAlive(socket, 20);
    
    var options = {
        socket: socket
    }
    
    socket.on('data', function (data) {
        options.data = data;
        SocketEventHandler.handleData(options);
    });
       
    //fecha a conexão de fato
    socket.on('close', function () {
        
        options.type = "closed";
        
        SocketEventHandler.handleSocketDestroy(options);
    });
    
    //fecha a conexão de fato
    socket.on('end', function () {
        
        options.type = "ended"
        
        SocketEventHandler.handleSocketDestroy(options);
    });
    
    socket.on('error', function () {
        
        options.type = "failed"
        
        SocketEventHandler.handleSocketDestroy(options);
    });
});

Server.listen(PORT, HOST, function () {
    console.log("Server Listening on " + HOST + ":" + PORT);
});