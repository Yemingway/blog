var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var User = require('../models/user.js');
var Post = require('../models/post.js');
var Comment = require('../models/comment.js');

/*GET home page. */
router.get('/', function (req, res) {
  Post.get(null, null, null, false, function (err, posts) {
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
router.get('/upload', checkLogin);
router.get('/upload', function (req, res) {
  res.render('upload', {
    title: '发表',
    user: req.session.user,
    success: req.flash('success').toString(),
    error: req.flash('error').toString()
  });
});

router.post('/upload', checkLogin);
router.post('/upload', function (req, res) {
  req.flash('success', '上传成功');
  res.redirect('/upload');
});

router.get('/u/:name', function (req, res) {
  User.get(req.params.name, function (err, user) {
    if (!user) {
      req.flash('error', '用户不存在！');
      res.redirect('/');
    }
    Post.get(user.name, null, null, false, function (err, posts) {
      if (err) {
        req.flash('error', err);
        return res.redirect('/');
      }
      res.render('user', {
        posts: posts,
        title: user.name,
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
      });
    });
  });
});

router.get('/u/:name/:day/:title', function (req, res) {
  Post.get(req.params.name, req.params.title, req.params.day, false, function (err, posts) {
    if (err) {
      req.flash('error', err);
      return res.redirect('/');
    }
    res.render('article', {
      post: posts[0],
      title: req.params.name,
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });
});
router.post('/u/:name/:day/:title', function (req, res) {
  var date = new Date(),
    time = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " +
      date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes());
  var comment = {
    name: req.body.name,
    email: req.body.email,
    website: req.body.website,
    time: time,
    content: req.body.content
  };
  newComment = new Comment(req.params.name, req.params.day, req.params.title, comment);
  newComment.save(function (err) {
    if (err) {
      req.flash('error', err);
      return res.redirect('back');
    }
    req.flash('success', '留言成功！');
    res.redirect('back');
  });
});
router.get('/edit/:name/:day/:title', checkLogin);
router.get('/edit/:name/:day/:title', function (req, res) {
  var currentUser = req.session.user;
  Post.get(currentUser.name, req.params.title, req.params.day, true, function (err, posts) {
    if (err) {
      req.flash('error', err);
      return res.redirect('back');
    }
    res.render('edit', {
      title: '编辑',
      post: posts[0],
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });
});
router.get('/remove/:name/:day/:title', checkLogin);
router.get('/remove/:name/:day/:title', function (req, res) {
  var currentUser = req.session.user;
  Post.delete(currentUser.name, req.params.title, req.params.day,
    function (err) {
      if (err) {
        req.flash('error', err);
        return res.redirect('back');
      }
      req.flash('success', '删除成功!');
      res.redirect('/');
    });
});
router.post('/edit/:name/:day/:title', checkLogin);
router.post('/edit/:name/:day/:title', function (req, res) {
  var currentUser = req.session.user;
  Post.update(req.params.name, req.params.title,
    req.params.day, req.body.post,
    function (err) {
      var url = encodeURI('/u/' + currentUser.name
        + '/' + req.params.day + '/' + req.params.title);
      if (err) {
        req.flash('error', err);
        return res.redirect(url);
      }
      req.flash('success', '保存成功！');
      res.redirect(url);
    });
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
