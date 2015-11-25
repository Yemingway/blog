var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var User = require('../models/user.js')
var Post = require('../models/post.js')

/*GET home page. */
router.get('/', function (req, res) {
  Post.get(null, function (err, posts) {
    if (err) {
      posts = null;
    }
    res.render('index', {
      title: '主页',
      user: req.session.user,
      posts: posts,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });

});

router.get('/reg', checkNotLogin);
router.get('/reg', function (req, res) {
  res.render('reg', {
    title: '注册',
    user: req.session.user,
    success: req.flash('success').toString(),
    error: req.flash('error').toString()
  })
});

router.post('/reg', checkNotLogin);
router.post('/reg', function (req, res) {
  var password = req.body.password,
    name = req.body.name,
    password_re = req.body['password-repeat'];
   
  //check password
  if (password != password_re) {
    req.flash('error', '两次输入的密码不一致!');
    return res.redirect('/reg');
  }
  //生成密码的 md5 值
  var md5 = crypto.createHash('md5'),
    md5password = md5.update(req.body.password).digest('hex');
  var tempUser = new User({
    name: name,
    password: md5password,
    email: req.body.email
  });

  User.get(tempUser.name, function (err, user) {
    if (err) {
      req.flash('error', err);
      return res.redirect('/');
    }
    if (user) {
      req.flash('error', '用户已经存在');
      return res.redirect('/reg');
    }
    tempUser.save(function (err, user) {
      if (err) {
        res.render('error', err);
        return res.redirect('/reg');
      }
      req.session.user = user;
      req.flash('success', '注册成功');
      res.redirect('/');
    });
  });
});

router.get('/login', checkNotLogin);
router.get('/login', function (req, res) {
  res.render('login', {
    title: '登录',
    user: req.session.user,
    success: req.flash('success').toString(),
    error: req.flash('error').toString()
  });
});

router.post('/login', checkNotLogin);
router.post('/login', function (req, res) {
  var md5 = crypto.createHash('md5'),
    password = md5.update(req.body.password).digest('hex');
  User.get(req.body.name, function (err, user) {
    if (err) {
      req.flash('error', err);
      return res.redirect('/login');
    }
    if (!user) {
      req.flash('error', '用户名或者密码错误！');
      return res.redirect('/login');
    }
    if (password != user.password) {
      req.flash('error', '密码不正确！');
      return res.redirect('/login');
    }
    req.flash('success', '登陆成功！');
    req.session.user = user;
    res.redirect('/');
  });
});

router.get('/post', checkLogin);
router.get('/post', function (req, res) {
  res.render('post', {
    title: '发表',
    user: req.session.user,
    success: req.flash('success').toString(),
    error: req.flash('error').toString()
  });
});

router.post('/post', checkLogin);
router.post('/post', function (req, res) {
  var currentUser = req.session.user,
    post = new Post(currentUser.name, req.body.title, req.body.post);
  post.save(function (err) {
    if (err) {
      req.flash('error', err);
      return res.redirect('/');
    }
    req.flash('success', '发表成功');
    return res.redirect('/');
  });
});

router.get('/logout', checkLogin);
router.get('/logout', function (req, res) {
  req.flash('success', '登出成功！');
  req.session.user = null;
  res.redirect('/');
});

function checkLogin(req, res, next) {
  if (!req.session.user) {
    req.flash('error', '用户未登录！');
    res.redirect('/login');
  }
  next();
}

function checkNotLogin(req, res, next) {
  if (req.session.user) {
    req.flash('error', '用户已经登录！');
    res.redirect('/');
  }
  next();
}
module.exports = router;
