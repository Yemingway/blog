var express = require('express');
var router = express.Router();

 /*GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: '主页' });
});

router.get('/reg',function(req,res){
	res.render('reg',{title:'注册'})
});
module.exports = router;
