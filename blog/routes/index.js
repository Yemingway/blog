var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var User = require('../models/user.js')

/*GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: '主页' });
});

router.get('/reg', function (req, res) {
  res.render('reg', { title: '注册' })
});
router.post('/reg', function (req, res) {
  var password = req.body.password,
    name = req.body.name,
    password_re = req.body['password-repeat'];
   
  //check password
  if (password != password_re) {
    req.flash('error', '两次输入的密码不一致!');
    return res.redirect('/reg');
  }

  var tempUser = new User({
    name: name,
    password: password,
    email: req.body.email
  });

  User.get(tempUser.name, function (err, user) {
    if (err) {
      req.flash('error', err);
      res.redirect('/reg');
    }
    if (user) {
      res.locals.error = '用户已经存在';
      //req.flash('error', '用户已经存在');
    }
    tempUser.save(function (err, user) {
      if (err) {
        res.render('error', 'error');
        res.redirect('/reg');
      }
      req.session.user = user;
      req.flash('success', '注册成功');
      res.redirect('/');
    });
  });

});
router.get('/login', function (req, res) {
  res.render('login', { title: '登录' });
});
router.post('/login', function (req, res) {
});
router.get('/post', function (req, res) {
  res.render('post', { title: '发表' });
});
router.post('/post', function (req, res) {
});
router.get('/logout', function (req, res) {
});
module.exports = router;
