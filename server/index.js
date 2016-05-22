var path = require("path");
var express = require('express');
var bodyParser = require("body-parser");
var morgan = require("morgan");
var favicon = require('serve-favicon');

var app = express();

var http = require('http').Server(app);

var io = require('socket.io')(http);

var router = require("./routes/router.js");

//init codes
var codes = ["MSFT", "AAPL"];
app.use(morgan('dev')); 


app.use("/", router);

// using jade as template engine
app.set('views', path.join(__dirname, '/views'));
app.set("view engine", "jade");

app.use(favicon(path.join(__dirname, '../public/favicon.ico')));
// static routes
app.use(express.static(path.join(__dirname, '../public')));




var port = process.env.PORT || 3333;
//http.listen(3333, "127.0.0.1");
http.listen(port,function(){
	console.log("Server running at port " + port);
})

//socket
io.on('connection', function(socket){
	console.log('a user connected');

	io.emit("init", codes)

	socket.on("data-added", function(code){
		codes.push(code);
		io.emit("data-added", code)
	})
	socket.on("data-removed", function(code){
		removeCode(code);
		io.emit("data-removed", code)
	})
	socket.on("error-code", function(code){
		removeCode(code);
	})
});

function removeCode(code){
	var id = codes.indexOf(code)
	if(id !== -1){
		codes.splice(codes.indexOf(code),1)	
	}
}