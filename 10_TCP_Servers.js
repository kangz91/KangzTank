/*
The transmission control protocol (TCP) is noe of the funcdamental protocols of the Internet. It sits on top of the Internet protocol (IP) and provides a transport mechanism for the application layer, HTTP, for instance, works on top of TCP, as do many other connection-oriented applications such as iRC, SMTP, and IMAP.

Node has a first-class HTTP server implementation in the form of a pseudo-class in 'http.server', which descends from the TCP server pseudo-class in 'net.Server'. This means that everything described in this chapter applies to the Node HTTP server as well.


[CREATING A TCP SERVER]

You can create a TCP server using the 'net' module like this:

	require('net').createServer(function(socket) {
		// new connection

		socket.on('data', function(data) {
			// got data
		});
		socket.on('end', function(data) {
			// connection closed
		})
		socket.write('Some string');
	}).listen(3000);

	// require('net').createServer(function(socket) {
	// 	// new connection

	// 	socket.on('data', function(data) {
	// 		console.log(data.toString());
	// 		socket.write('OK_'+data);
	// 	});
	// 	socket.on('end', function(data) {
	// 		console.log('connection closed');
	// 	})
	// 	socket.write('Some string');
	// }).listen(3000);


	// const net = require('net');
	// const server = net.createServer((c) => {
	//   	// 'connection' listener
	// 	console.log('client connected');
	// 	c.on('end', () => {
	// 		console.log('client disconnected');
	// 	});
	// 	c.write('hello\r\n');
	// 	c.pipe(c);
	// });
	// server.on('error', (err) => {
	// 	throw err;
	// });
	// server.listen(3000, () => {
	// 	console.log('server bound');
	// });


Because the server object is also an event emitter, and you can listen to events during its lifecycle, 'net.Server' emits the following events:
	- 'listening' : When the server is listening on the specified port and address.
	- 'connection' : When a new connection is established. The callback to this function will receive the corresponding 'socket' object. You can also bind to this event by passing a function to 'net.createServer()'.
	- 'close' : When the server is closed, that is, it's not bound to that port any more.
	- 'error' : When an error occurs at the server level. An error event happens, for instance, when you try to bind to an occupied port or to a port you don't have permission to bind to.

	var server = require('net').createServer();
	var port = 3000;

	server.on('listening', function(){
		console.log('Server is listening on port', port);
	});
	// The callback to this function will receive the corresponding 'socket' object.
	server.on('connection', function(socket){
		console.log('Server has a new connection');
		socket.end();
		server.close();
	});
	server.on('close', function(){
		console.log('Server is now closed');
	});
	server.on('error', function(err){
		console.log('Error occurred: ', err.message);
	});
	server.listen(port);


	=> telnet localhost 3000


<Using the Socket Object>
When you get a "connection" event you are also handed the 'socket' objext as the first argument of the callback function. This 'socket' object is both aread and a write stream, which means that it emits 'data' events when it gets a package of data and emits the 'end' event when that connection is closed.
'net.socket' emits the following events:
	- 'close'
	- 'connect'
	- 'data'
	- 'drain'
	- 'end'
	- 'error'
	- 'lookup'
	- 'timeout'


Because the 'socket' object is also a wirtable stream, that means you can write buffers or strings to the socket by using 'socket.write()'. You can tell the socket that it should terminate the connection after all data has been written by calling 'socket.end()'.

	var server = require('net').createServer(function(socket) {
		console.log('new connection');
		socket.setEncoding('utf8');
		socket.write("Hello! You can start typing. Type 'quit' to exit.\n");
		socket.on('data', function(data) {
			console.log('got: ', data.toString());
			if (data.trim().toLowerCase() === 'quit') {
				socket.write('Bye bye!');
				return socket.end();
			}
			socket.write(data);
		});

		socket.on('end', function() {
			console.log('Client connection ended');
		});
	}).listen(3000);



Because the 'socket object is a readable stream, you can control the flow by calling 'socket.pause()' and 'socket.resume()', or even pipe it into a writable stream.

	require('net').createServer(function(socket) {
		var fs = require('fs');
		var ws = fs.createWriteStream('data_t');
		socket.pipe(ws);
	}).listen(3000);

You can type as much as you want, pressing '<enter>' at least once to flush to the server.

	require('net').createServer(function(socket) {
		var fs = require('fs');
		var rs = fs.createReadStream('data_t');
		rs.pipe(socket, {end:false});
	}).listen(3000);

You can also accomplish the reverse, whereby you pipe a readable stream into the socket.
The connection will also be immediately closed. That's because pips weill by default also end the destination when the socket end. If you want to keep the connection open, you should pass '{end:false}' into the second argument of the 'pipe()' command.



<Understanding Idle Sockets>
By defualt, when a new connection is set u[ between two pears, it is kept open until one of them closes it or until the underlying link is lost. However, in Node you can set TCP connections to time out because of inactivity. You can automatically close the connection when no fraffic is being sent or received for some time. You can activate and define the timeout by calling 'setTimeout(milliseconds)' on the connection. You can also listen for the 'timeout' event on the 'socket' object.

	var timeout = 60000 ;; 1 minute
		socket.setTimeout(timeout);
		socket.on('timeout', function(){
		socket.write('idle timeout, disconnecting, bye!');
		socket.end();
	})

Or, you can use this shorter form by passing the event listener in the second argument of 'socket.setTimeout()';

	socket.setTimeout(60000, function() {
		socket.end('idle timeout, disconnecting, bye!');
	});


<Setting Up Keep-Alive>
In Node, a 'net.Socket' can implement a keoop=alive mechanism to prevent timeousts from occurring on the network or on the peer. Node does that by sending an empty TCP packet with the 'ACK' flag turened ton to trigger an empty replay form the other side. This activity will keep the connection alive on both peers.

You can enable the keep-alive functionality by:

	socket.setKeepAlive(true);

You can also specify the delay between the last packet received and the next keep-alive packet. You do so on the second argument to the 'socket.keepAlive()' call like this:

	socket.setKeepAlive(true, 10000); // 10 seconds.


<Using Delay or No Delay>
The kernel buffers the data before sending the TCP packets, and it uses 'Nagle's algorithm' to determine when to actually send the data. This algorithm is used to redudce the number of packers that are sent across the network when an application sends small chunks of data. Depending on the application, this feature may turn out to be quite useful, but it introduces some delay in sending the data, which may add up to overall latency in your application.
If you want to turn this off and force data to be sent immediately after each 'write' commnd, use this:

	socket.setNoDelay(true);

Of course, you can always revert this setting like this:

	socket.setNoDelay(false);


<Listening for Client Connections>
As you saw, after the server is created, you can bind it to a specific TCP port like this:

	var port = 4001;
	var host = '0.0.0.0';
	server.listen(port, host);

The second argument (host) is optional. If it's omitted, the server will accept connections directed to any IP addres:
	
	server.listen(port);


<Closing the Server>
This method closes the server, preventing it from accpting new connnections. This function is asynchronous, and the server will emeit the 'close' event when it closes:

	var server = ...;
	server.close();
	server.on('close', function() {
		console.log('server closed!');
	});


<Handling Errors>
When handling a socket on the client or the server you can (and should) handle errors by listening to the 'error' event like this:

	require('net').createServer(function(socket) {
		socket.on('error', funciton(error) {
			// do something
		});
	});

If you fail to catch an error, Node will handle an uncaught exception and terminate the current process.

NOTE: You can choose to catch uncaught exeptions - preventing your Node process from being terminated - by doing something like this:
	process.on('uncaughtExeption', fucntion(err) {
		// do something
	});
However, this practice is generally not a good idea because when an exceptions happens and you don't handle it properly, your application may get into an unknown state, which may later introduce more and stranger errors. Also, errors can lead to more errors, making it harder to understand the root cause. If you do this, you will also probably leak memory or resources (like file descriptors) because errors were not handled when they should have been.
In general, you should use this event only to report everything you can about your applications and then shut down your process.



*/




	// require('net').createServer(function(socket) {
	// 	var fs = require('fs');
	// 	var rs = fs.createReadStream('data_t');
	// 	rs.pipe(socket, {end:false});
	// }).listen(3000);


	// require('net').createServer(function(socket) {
	// 	var fs = require('fs');
	// 	var ws = fs.createWriteStream('data_t');
	// 	socket.pipe(ws);
	// }).listen(3000);


	// var server = require('net').createServer();
	// var port = 3000;
	// server.on('listening', function(){
	// 	console.log('Server is listening on port', port);
	// });
	// // The callback to this function will receive the corresponding 'socket' object.
	// server.on('connection', function(socket){
	// 	console.log('Server has a new connection');
	// 	socket.end();
	// 	server.close();
	// });
	// server.on('close', function(){
	// 	console.log('Server is now closed');
	// });
	// server.on('error', function(err){
	// 	console.log('Error occurred: ', err.message);
	// });
	// server.listen(port);


	// var server = require('net').createServer(function(socket) {
	// 	console.log('new connection');
	// 	socket.setEncoding('utf8');
	// 	socket.write("Hello! You can start typing. Type 'quit' to exit.\n");
	// 	socket.on('data', function(data) {
	// 		console.log('got: ', data.toString());
	// 		if (data.trim().toLowerCase() === 'quit') {
	// 			socket.write('Bye bye!');
	// 			return socket.end();
	// 		}
	// 		socket.write(data);
	// 	});

	// 	socket.on('end', function() {
	// 		console.log('Client connection ended');
	// 	});
	// }).listen(3000);

	// A Not shortened server creating way
	var server = require('net').createServer();
	server.on('connection', function(socket){
		console.log('Server has a new connection');
		socket.setEncoding('utf8');
		socket.write("Hello! You can start typing. Type 'quit' to exit.\n");

		socket.on('data', function(data) {
			console.log('got: ', data.toString());
			if (data.trim().toLowerCase() === 'quit') {
				socket.write('Bye bye!');
				return socket.end();
			}
			socket.write(data);
		});

		socket.on('end', function() {
			console.log('Client connection ended');
		});

		process.stdout.resume();
		process.stdout.pipe(socket);
	});
	server.listen(3000);