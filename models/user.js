//create use modle and create save, read and write methods

var mongodb = require('./db');
var crypto = require('crypto');

function User(user) {
	this.name = user.name;
	this.password = user.password;
	this.email = user.email;
}

User.prototype.save = function (callback) {
	var md5 = crypto.createHash('md5'),
		email_MD5 = md5.update(this.email.toLowerCase()).digest('hex'),
		head = "https://secure.gravatar.com/avatar/" + email_MD5 + "?s=48",
		user = {
			name: this.name,
			password: this.password,
			email: this.email,
			head: head
		};
	
	//open db
	mongodb.open(function (err, db) {
		if (err) {
			return callback(err);
		}
		//read user records
		db.collection('users', function (err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			//add this records to users
			collection.insert(user, { safe: true }, function (err, user) {
				if (err) {
					callback(err);
				}
				callback(null, user[0]);
			});
		});
	});
}

User.get = function (name, callback) {
	//open db
	mongodb.open(function (err, db) {
		if (err) {
			mongodb.close();
			return callback(err);
		}
		//read users
		db.collection('users', function (err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			collection.findOne({ name: name }, function (err, user) {
				mongodb.close();
				if (err) {
					callback(err);
				}
				callback(null, user);
			});
		});
	});
};

module.exports = User;