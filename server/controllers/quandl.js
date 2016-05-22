var config = require("../config/quandl-config.js");
var request = require("request");
var moment = require("moment");

module.exports.getStockData = function(ref, done){
	var endDate = moment().format("YYYY-MM-DD");
	var startDate = moment().subtract(1, "Y").format("YYYY-MM-DD");
	var url = config.baseURL + ref;
	url += ".json?order=asc&exclude_column_names=true&column_index=4"
	url += "&start_date=" + startDate + "&end_date=" + endDate
	url += "&api_key=" + config.apiKey;
	request.get(url, function(err, rsp, body){
		if(err){
			console.log(err, rsp)
			done({server_error: err});
		}else{
			done({body:body, ref:ref})	
		}
		
	})
}