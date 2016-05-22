"use strict";
var nanoajax = require("nanoajax");

var io = require('socket.io-client');

var Model = require("./model.js").Model;
var View = require("./view.js").View;

var model = new Model(changeHandler)
var view = new View(listener);

var socket = io.connect();

view.init();
init();

function init(){
	socket.on("init", function(codes){
		socket.off("init")
		for(var i=0; i<codes.length; i++){
			loadStockData(codes[i])	
		}
	})
	socket.on("data-added", function(code){
		//console.log("added", code)
		loadStockData(code)
	})
	socket.on("data-removed", function(code){
		//console.log("rem", code)
		model.removeData(code)
	})
}

function loadStockData(code){
	view.setStatus("LOADING");
	nanoajax.ajax({url:"/api/stock/" + code, method:"POST"}, stockDataLoaded.bind(this));
}

function stockDataLoaded(rspCode, rsp){
	if(rspCode === 200){
		var d = JSON.parse(JSON.parse(rsp).body)
		if(d.quandl_error){
			view.setStatus("ERROR", d.quandl_error.code)	
			socket.emit("error-code", JSON.parse(rsp).ref);
		}else{
			model.appendData(d)
			view.setStatus("LOADED")
		}
	}else{
		console.log("error", rspCode)
		view.setStatus("ERROR", "srv")
	}
}

function changeHandler(){
	view.render(model.data)
	//console.log(model.codes)
}

function listener(type, payload){
	switch (type){
		case "DATA_LOADED":
			view.appendData(payload);
		break;
		case "FORM_SUBMITED":
			socket.emit("data-added", payload);
		break;
		case "REMOVE_DATA":
			socket.emit("data-removed", payload);
		break;
		default: 
			return
	}
}