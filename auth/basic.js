var passport = require('passport');
var BasicStrategy = require('passport-http').BasicStrategy;

var authenticate = function(username, password, callback){
	if(username === 'foo' && password === 'bar'){
		callback(null, {
			username :"foo",
			displayName:"The Foo"
		});
	}else{
	return callback(null, false);
	}
	
	return callback({
	message:"something went wrong"
	});
};

passport.use(new BasicStrategy(authenticate));

exports.isAuthenticated = passport.authenticate("basic", {session:false});