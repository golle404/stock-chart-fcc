"use strict"

module.exports.Model = function(change){
	this.data = {};
	this.change = change;
	var count = 0;

	this.removeData = function(code){
		this.data[code]	= null;
		this.change()
	}
	this.appendData = function(data){
		var code = data.dataset.dataset_code;
		this.data[code] = data.dataset;
		this.data[code].cid = count;
		count++;
		count = count % 8;
		this.change()
	}
}