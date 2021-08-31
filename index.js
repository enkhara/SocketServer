const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');

require('dotenv').config();

app.use(cors(), express.static(path.join(__dirname, 'public')));

const server = require('http').createServer(app);
const port = process.env.PORT || 3002;
// Routing

const io = require('socket.io')(server, {
	cors: {
		origin: process.env.SOCKET_SERVER_REACT_APP,
		methods: ['GET', 'POST', 'OPTIONS'],
		allowedHeaders: ['Authorization'],
		credentials: true,
	},
});
// app.use(function (req, res, next) {
// 	res.set('Access-Control-Allow-Origin', '*');
// 	res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
// 	res.set(
// 		'Access-Control-Allow-Headers',
// 		'Origin, X-Requested-With, Content-Type, Accept'
// 	);
// 	next(createError(404));
// });
app.use(express.static(path.join(__dirname, 'public')));

server.listen(port, () => {
	console.log('Server listening at port %d', port);
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
console.log('user array', users);
io.on('connection', (socket) => {
	//when connect
	console.log('a user connected', users);

	//take userId and socketID from user
	socket.on('addUser', (userId) => {
		addUser(userId, socket.id);
		io.emit('getUsers', users);
		console.log('linea 46 users', users);
	});

	//send and get message
	//socket.on ==> get
	//io.emit ==> send
	socket.on('sendMessage', ({ senderId, receiverId, text }) => {
		console.log('receiverId linea 52', receiverId);
		const user = getUser(receiverId);
		console.log('user linea 54', user);
		console.log('socketId linea 56', user.socketId);
		io.to(user.socketId).emit('getMessage', {
			senderId,
			text,
		});
	});

	//when disconnect
	socket.on('disconnect', () => {
		console.log('a user disconnected');
		removeUser(socket.id);
		io.emit('getUsers', users);
	});
});
