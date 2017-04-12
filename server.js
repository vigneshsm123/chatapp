var express = require('express');
var app = express();
var port  = process.env.PORT || 3030;
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var router = express.Router();
var appRoutes = require('./app/routes/api')(router);
var path = require('path');
var http = require('http');
var server = require('http').Server(app);
var io = require('socket.io')(server);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(__dirname+'/public'));
app.use('/bower_components', express.static(path.join(__dirname, 'bower_components')));
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/api',appRoutes);

mongoose.connect('mongodb://ds159330.mlab.com:59330/my_centraldb',function(err){
    if(err)         //check connection
        console.log('Not connected to mongodb');
     else
        console.log('Connected to mongodb');
});

app.get('/',function(req, res){
    res.sendFile(path.join(__dirname+'/public/app/modules/index.html'));
})

var users = [];
var imageFiles = [];
io.on('connection', function(socket) {
    var username = '';
    socket.on('request-users', function(){
        socket.emit('users', {users: users});
    });
    socket.on('add-user', function(data){
        //add user 
        if(users.indexOf(data.username) == -1){
            io.emit('add-user', { username: data.username});
            username = data.username;
            users.push(data.username);
        }
        else {
            io.emit('prompt-username', {
                message: 'user has already exist'
            });
        }
    });
    socket.on('disconnect', function() {
        console.log(username + ' has disconnected');
        users.splice(users.indexOf(username), 1);
        io.emit('remove-user', {username: username});
    });
    socket.on('message', function(data){
        io.emit('message', {username: username, message: data.message});
    });
});

server.listen(port, function(){
     console.log('Running the sever on '+ port);
});

// app.listen(port,function(){
//     console.log('Running the sever on '+ port);
// });