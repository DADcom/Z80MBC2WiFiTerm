// Node.js WebSocket server script
const http = require('http');
const WebSocketServer = require('websocket').server;
const server = http.createServer();
server.listen(81);
const wsServer = new WebSocketServer({
    httpServer: server
});
wsServer.on('connect', function(request) {
    
   request.send("\r\n   Z80-MBC2 - A040618\r\n   IOS - I/O Subsystem - S220718-R260119\r\n   \r\n   IOS: Z80 clock set at 8MHz\r\n   IOS: Found RTC DS3231 Module (08/06/20 06:02:12)\r\n   IOS: RTC DS3231 temperature sensor: 25C\r\n   IOS: Found GPE Option\r\n   IOS: CP/M Autoexec is ON\r\n");
 
    console.log("Connected");
});
wsServer.on('request', function(request) {

    const connection = request.accept(null, request.origin);
    connection.on('message', function(message) { 

     if(message.utf8Data != ''){
        console.log('Received Message:', message.utf8Data);
        console.log('Received Message:', message);
        if (message.utf8Data.indexOf("\r") > 0) connection.send(message.utf8Data+'\n');
        else { 

            switch(message.utf8Data.charAt(0)){
                case '\u001b' : 
                    console.log("Escape");
                    break;
                
                case '\r':
                    console.log("CR");
                    connection.send(message.utf8Data+'\n');
                    break;
                    case '\b':
                    console.log("BS");
                    connection.send(message.utf8Data+' '+"\b");
                    break;
                default:
                    connection.send(message.utf8Data);
            }
        }
      }else {
      connection.sendBytes(Buffer.from(""));
    }
    });
    connection.on('close', function(reasonCode, description) {
        console.log('Client has disconnected.');
    });
    
});