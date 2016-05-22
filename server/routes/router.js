var quandi = require("../controllers/quandl.js");
var express = require("express");
var router = express.Router();

/// main route //////
router.get("/", function(req, res) {
	res.render("index");
})

router.post("/api/stock/:ref", function(req, res){
	quandi.getStockData(req.params.ref, function(rsp){
		res.json(rsp)
	})
	
})

module.exports = router;