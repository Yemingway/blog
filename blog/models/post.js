var mongodb = require('./db');
var markdown = require('markdown').markdown;

function Post(name, title, post, tags, head, reprint) {
	this.name = name;
	this.title = title;
	this.post = post;
	this.tags = tags;
	this.head = head;
	this.reprint = reprint;
}

module.exports = Post;

//Just like public method and related with the property, need to write it in protorype.
Post.prototype.save = function (callback) {
	var date = new Date();
	//存储各种时间格式，方便以后扩展
	var time = {
		date: date,
		year: date.getFullYear(),
		month: date.getFullYear() + "-" + (date.getMonth() + 1),
		day: date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate(),
		minute: date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " +
		date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes())
	}
	//要存入数据库的文档
	var post = {
		name: this.name,
		time: time,
		title: this.title,
		post: this.post,
		comments: [],
		tags: this.tags,
		pv: 0,
		head: this.head,
		reprint: {}
	};

	mongodb.open(function (err, db) {
		if (err) {
			return callback(err);
		}
		db.collection('posts', function (err, collection) {
			if (err) {
				db.close();
				return callback(err);
			}
			collection.insert(post, {
				safe: true
			}, function (err) {
				mongodb.close();
				if (err) {
					return callback(err);
				}
				callback(null);
			});
		});
	})
}

//Just like static method.
//get all user's articles if name is null
//get one user's articles if name is not null.
Post.get = function (name, title, day, isEdit, callback) {
	mongodb.open(function (err, db) {
		if (err) {
			return callback(err);
		}
		db.collection('posts', function (err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			var query = {};
			if (name) {
				query['name'] = name;
			}
			if (title) {
				query['title'] = title;
			}
			if (day) {
				query['time.day'] = day;
			}
			collection.find(query).sort({ time: -1 }).toArray(function (err, docs) {
				if (err) {
					mongodb.close();
					return callback(err);
				}
				if (!isEdit) {
					//解析markdown为html
					docs.forEach(function (doc) {
						if (doc && name && title && day) {
							collection.update(query, { $inc: { 'pv': 1 } }, function (err) {
								mongodb.close();
								if (err) {
									return callback(err);
								}
							});
						}
						else {
							mongodb.close();
						}
						doc.post = markdown.toHTML(doc.post);
						doc.comments.forEach(function (comment) {
							comment.content = markdown.toHTML(comment.content);
						});
					});
				}
				else {
					mongodb.close();
				}
				callback(null, docs);
			});
		});
	});
}
Post.getArchive = function (name, callback) {
	mongodb.open(function (err, db) {
		if (err) {
			db.close();
			return callback(err);
		}
		db.collection("posts", function (err, collection) {
			if (err) {
				db.close();
				return callback(err);
			}
			collection.find({ 'name': name }, { 'name': 1, 'title': 1, 'time': 1 }).sort({ time: -1 }).toArray(function (err, docs) {
				db.close();
				if (err) {
					return callback(err);
				}
				callback(null, docs);
			});
		});
	});
}
Post.getTen = function (name, page, callback) {
	mongodb.open(function (err, db) {
		if (err) {
			mongodb.close();
			return callback(err);
		}
		db.collection('posts', function (err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			var query = {};
			if (name) {
				query['name'] = name;
			}
			collection.count(query, function (err, total) {
				collection.find(query, { limit: 10, skip: (page - 1) * 10 }).sort({ time: -1 }).toArray(function (err, docs) {
					mongodb.close();
					if (err) {
						return callback(err);
					}
					docs.forEach(function (doc) {
						doc.post = markdown.toHTML(doc.post);
					});
					callback(null, docs, total);
				});
			});
		});
	});
}
Post.delete = function (name, title, day, callback) {
	mongodb.open(function (err, db) {
		if (err) {
			return callback(err);
		}
		db.collection('posts', function (err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			var deleteItem = {};
			if (name) {
				deleteItem['name'] = name;
			}
			if (title) {
				deleteItem['title'] = title;
			}
			if (day) {
				deleteItem['time.day'] = day;
			}
			collection.remove(deleteItem, { w: 1 }, function (err) {
				mongodb.close();
				if (err) {
					return callback(err);
				}
				callback(null);
			});
		});
	});
}

Post.update = function (name, title, day, post, tags, callback) {
	mongodb.open(function (err, db) {
		if (err) {
			return callback(err);
		}
		db.collection('posts', function (err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			collection.update(
				{
					'title': title,
					'name': name,
					'time.day': day
				},
				{
					$set: { 'post': post, 'tags': tags }
				},
				function (err) {
					mongodb.close();
                    if (err) {
						return callback(err);
					}
					callback(null);
				});
		});
	});
}

Post.getTags = function (callback) {
	mongodb.open(function (err, db) {
		if (err) {
			return callback(err);
		}
		db.collection('posts', function (err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			collection.distinct(
				'tags', function (err, tags) {
					mongodb.close();
					if (err) {
						return callback(err);
					}
					callback(null, tags);
				});
		});
	});
}
Post.getArticleByTag = function (tag, callback) {
	mongodb.open(function (err, db) {
		if (err) {
			return callback(err);
		}
		db.collection('posts', function (err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			collection.find(
				{
					'tags': tag
				},
				{
					'name': 1,
					'title': 1,
					'time': 1
				}).sort(
					{
						time: -1
					}).toArray(function (err, docs) {
						mongodb.close();
						if (err) {
							return callback(err);
						}
						callback(null, docs);
					});
		});
	});
}

Post.search = function (keyword, callback) {
	mongodb.open(function (err, db) {
		if (err) {
			return callback(err);
		}
		db.collection('posts', function (err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			var tempTag = new RegExp(keyword, "i");
			collection.find(
				{
					'title': tempTag
				},
				{
					'name': 1,
					'title': 1,
					'time': 1
				}).sort(
					{
						time: -1
					}).toArray(function (err, docs) {
						mongodb.close();
						if (err) {
							return callback(err);
						}
						callback(null, docs);
					});
		});
	});
}

Post.reprint = function (fromname, title, day, toname, callback) {
	mongodb.open(function (err, db) {
		if (err) {
			return callback(err);
		}
		db.collection('posts', function (err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			var query = {};
			query['name'] = fromname;
			query['title'] = title;
			query['time.day'] = day;
			collection.findOne(query,
				function (err, doc) {
					if (doc) {
						var date = new Date();
						var time = {
							date: date,
							year: date.getFullYear(),
							month: date.getFullYear() + "-" + (date.getMonth() + 1),
							day: date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate(),
							minute: date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " +
							date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes())
						}
						var post = {
							name: toname,
							time: time,
							title: title,
							post: doc.post,
							comments: [],
							tags: doc.tags,
							pv: 0,
							head: doc.head,
							reprint: {
								reprintfrom: {
									name: fromname,
									time: doc.time,
									title: title
								}
							}
						};
						collection.insert(post, { safe: true }, function (err) {
							if (err) {
								return callback(err);
							}
							collection.update({ 'name': fromname, 'title': title, 'time.day': day }, { $push: { 'reprint.reprintto': { 'name': toname, 'title': title, 'time': time } } }
								, function (err) {
									mongodb.close();
									if (err) {
										return callback(err);
									}
									return callback(null);
								});
						});

					}
				});
		});
	});
}
