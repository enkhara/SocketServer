const express = require('express');
const app = express();
const path = require('path');
const server = require('http').createServer(app);
//const io = require('socket.io')(server);
const port = process.env.PORT || 3002;

server.listen(port, () => {
	console.log('Server listening at port %d', port);
});

// Routing
app.use(express.static(path.join(__dirname, 'public')));

const io = require('socket.io')(server, {
	cors: {
		origin: 'http://localhost:3000',
	},
});

let users = [];

const addUser = (userId, socketId) => {
	!users.some((user) => user.userId === userId) &&
		users.push({ userId, socketId });
};

const removeUser = (socketId) => {
	users = users.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
	return users.find((user) => user.userId === userId);
};

io.on('connection', (socket) => {
	//when connect
	console.log('a user connected');

	//take userId and socketID from user
	socket.on('addUser', (userId) => {
		addUser(userId, socket.id);
		io.emit('getUsers', users);
	});

	//send and get message
	//socket.on ==> get
	//io.emit ==> send
	socket.on('sendMessage', ({ senderId, receiverId, text }) => {
		console.log(receiverId);
		const user = getUser(receiverId);
		console.log(user);
		io.to(user.socketId).emit('getMessage', {
			senderId,
			text,
		});
	});

	//when disconnect
	socket.on('disconnect', () => {
		console.log('a user disconnceted');
		removeUser(socket.id);
		io.emit('getUsers', users);
	});
});
