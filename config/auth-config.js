var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;
var FacebookStrategy = require("passport-facebook").Strategy;
var User = require("../models/user");

var facebookConfig = {
	clientID : "1612644192321533",
	clientSecret : "3aeb919643c6c21029c3cbe7deafabfa",
	callbackURL : "http://localhost:3000/facebook/callback",
	profileFields: ['email'],
	passReqToCallback: true
}

var localRegisterInit = function(req, email, password, callback){
	User.findOne({"local.email" :email},function(err, existingUser){
	if(err){
	return callback(err);
	}
	if(existingUser){
		return callback(null, false);
	}
	
	var user = (req.user) ? req.user : new User();
	//var newUser = new User();
	user.local.email =email;
	user.local.password =user.hashPassword(password);
	
	user.save(function(err){
		if(err){
			throw err;
		}
		return callback(null, user);
	});
});
};



var localLoginInit = function(req, email, password, callback){
	User.findOne({"local.email" :email},function(err, user){
	if(err){
	return callback(err);
	}
	if(!user|| !user.validatePassword(password)){
		return callback(null, false);
	}
	return callback(null, user);
});
};






var localOptions ={
	usernameField: "emailAddress",
	passReqToCallback :true
}

var facebookInit = function(req, token, refreshToken, profile, callback){
	User.findOne({"facebook.id":profile.id}, function(err,existingUser){
		if(err){
			return callback(err);
		}
		if(existingUser){
			return callback(null, existingUser);
		}
		
		var user = (req.user) ? req.user : new User();
	
		
		user.facebook.id = profile.id;
		user.facebook.token =token;
		user.facebook.email = profile.emails[0].value;
		
		user.save(function(err){
		if(err){
			throw err;
		}
		return callback(null, user);
		});
	});
};

passport.use("local-register", new LocalStrategy(localOptions, localRegisterInit));
passport.use("local-login", new LocalStrategy(localOptions, localLoginInit));
passport.use(new FacebookStrategy(facebookConfig, facebookInit));

passport.serializeUser(function(user, callback){
	callback(null, user.id);
});

passport.deserializeUser(function(id, callback){
	User.findById(id,function(err, user){
		callback(err, user);
	});
});


module.exports = {
local:{
register : passport.authenticate("local-register", {
		successRedirect : "/profile",
		failureRedirect : "/register"
	}),
	connect : passport.authenticate("local-register", {
		successRedirect : "/profile",
		failureRedirect : "/connect/local"
	}),
	login: passport.authenticate("local-login", {
		successRedirect : "/profile",
		failureRedirect : "/login"
	}),
	disconnect: function(req,res,next){
		var user = req.user;
		user.local.email = undefined;
		user.local.password = undefined;
		
		user.save(function(err){
			next();
		});
		}
	},
facebook:{
	login: passport.authenticate("facebook",{scope:["email"]}),
	callback:passport.authenticate("facebook",{
		successRedirect : "/profile",
		failureRedirect : "/"
	}),
	connect: passport.authorize("facebook",{scope:["email"]}),
	connectCallback:passport.authorize("facebook",{
		successRedirect : "/profile",
		failureRedirect : "/profile"
	}),
	disconnect: function(req,res,next){
		var user = req.user;
		user.facebook.id = undefined;
		user.facebook.email = undefined;
		user.facebook.token = undefined;
		
		user.save(function(err){
			next();
		});
	}
	
	
	
	}


};