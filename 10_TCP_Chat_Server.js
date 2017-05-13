/*

[BUILDING A SIMPLE TCP CHAT SERVER]

Now you should be prepared to  start building a TCP-based chat server. You can start by instantiating the server, logging some important events, and tehn binding the server to port 3000:

	var net = require('net');
	var server = net.createServer();
	var sockets = [];									// to store all the connections to broadcast
	
	server.on('connection', function(socket) {
		console.log('got a new connection');

		sockets.push(socket);							// to collect the connenction

		socket.on('data', function(data) {
			console.log('got data: ', data);

			sockets.forEach(function(otherSocket) {		// to broadcast
				if (otherSocket !== socket) {
					otherSocket.write(data);
				}
			});
		});

		socket.on('close', function() {					// to remove the connection when it gets closed,
			console.log('connection closed');
			var index = sockets.indexOf(socket);
			sockets.splice(index, 1);
		});
	});
	server.on('error', function(err) {
		console.log('Server error: ', err.message);
	});
	server.on('close', function() {
		console.log('Server closed');
	});
	server.listen(3000);


[SUMMARY]
A TCP server will emit certain events during its lifecycle, namely, listening' events when you set it to listen on a certain port, 'close' events when it gets closed, and 'error' events when an error occurs. You can also listen for 'connection' events, which occur when a new client connects. This connection event will serve you a socket object that is both a readable stream and a writable stream. You can use this object to listen for data, send data, end the connection, and even pipe the connection data into another stream. You can also do the oposite, piping a readable stream into the connection.

The 'socket' object allows you to control its flow by using 'socket.pause()' and 'socket.resume()'. It also allows you to tweak some of its parameters. For example, you can close the connection when it's been idle for some time, frequently send a keep-alive packet, or turn on or off Nagle's algorithm.

You can also create a TCP server that handle many connections and can use it for clients to communicate with each other in some form, as in the example of the chat server you created here.
*/


	var net = require('net');
	var server = net.createServer();
	var sockets = [];									// to store all the connections to broadcast
	
	server.on('connection', function(socket) {
		console.log('got a new connection');
		socket.setEncoding('utf8');

		sockets.push(socket);							// to collect the connenction

		socket.on('data', function(data) {
			console.log('got data: ', data);

			sockets.forEach(function(otherSocket) {		// to broadcast
				if (otherSocket !== socket) {
					otherSocket.write(data);
				}
			});
		});

		socket.on('close', function() {					// to remove the connection when it gets closed,
			console.log('connection closed');
			var index = sockets.indexOf(socket);
			sockets.splice(index, 1);
		});
	});
	server.on('error', function(err) {
		console.log('Server error: ', err.message);
	});
	server.on('close', function() {
		console.log('Server closed');
	});
	server.listen(3000);