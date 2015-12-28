var socket = io.connect();
socket.on('message', function(e){
    console.log('[message]: ' + JSON.stringify(e));
});
