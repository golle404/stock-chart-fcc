"use strict"
var Graph = require("./graph.js").Graph;

module.exports.View = function(_listener){

	var listener = _listener;
	var graph = new Graph();
	var form, input, codeList, status, templateHTML;
	var nodes = []

	this.init = function(){
		codeList = document.getElementById('code-list');
		templateHTML = document.getElementById('item-template').innerHTML;
		codeList.innerHTML = "";
		form = document.getElementById('stock-form');
		input = document.getElementById('stock-input');
		status = document.getElementById('status');
		form.addEventListener("submit", formSubmit);
		graph.init();
	}
	var formSubmit = function(e){
		e.preventDefault();
		listener("FORM_SUBMITED", input.value.toUpperCase());
		form.reset();
	}
	var handleClick = function(code, e){
		listener("REMOVE_DATA", code);
	}
	this.render = function(data){
		//console.log("render", data)
		for(var c in data){
			var d = data[c];
			var node;
			if(document.getElementById(c)){
				node = document.getElementById(c)
				if(!d){
					codeList.removeChild(node)
				}				
			}else if(d){
				var html = templateHTML;
				html = html.replace("{code}", c);
				html = html.replace("{name}", d.name);
				node = document.createElement("li")
				node.innerHTML = html;
				node.id = c;
				node.classList.add("stock-item", "stock-"+d.cid)
				codeList.appendChild(node);		
				node.addEventListener("click", handleClick.bind(this, c));
			}
		}
		graph.render(data)
	}
	this.setStatus = function(st, errCode){
		status.classList.remove("loading");
		switch(st){
			case "LOADING":
				status.classList.remove("flash", "error");
				status.classList.add("loading");
				status.innerHTML = "loading data";
				break;
			case "LOADED":
				status.innerHTML = "data loaded";
				status.classList.add("flash", "loaded");
				break;
			case "ERROR":
				var msg = "Error loading data"
				if(errCode === "QECx02"){
					msg += " - wrong code"
				}else if(errCode == "srv"){
					msg += " - server error"
				}
				status.innerHTML = msg;
				status.classList.add("flash", "error");
				break;
			default:
				return;
		}
	}

}