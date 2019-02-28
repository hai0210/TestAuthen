const passport = require('passport');
const PassportLocalStrategy = require('passport-local');
const PassportOAuthBearer = require('passport-http-bearer');
const User = require('../model/User');
const AccessToken = require('../model/AccessToken')

var authStrategy = new PassportLocalStrategy({
	usernameField: 'email',
	passwordField: 'password',
	passReqToCallback: true,
}, function (req, email, password, done) {
	User.authenticate(email, password, function (error, user) {
		// You can write any kind of message you'd like.
		// The message will be displayed on the next page the user visits.
		// We're currently not displaying any success message for logging in.

		if (error) {
			req.flash('error', `Credential Error: Username or password is incorrect please check it and try again`)
			return done(error);
		}
		if (!user) {
			req.flash('error', `Credential Error: Username or password is incorrect please check it and try again`)
			return done(null, false);
		}
		if (!user.userStatus) {
			req.flash('error', 'Status error: Your account is not active. Please verify it or contact the admin for more detail')
			return done(null, false);
		}
		return done(null, user);

	})
});

var accessTokenStrategy = new PassportOAuthBearer(function (token, done) {
	AccessToken.findOne({
		token: token
	}).populate('user').populate('grant').exec(function (error, token) {
		if (token && token.active && token.grant.active && token.user) {
			done(null, token.user, {
				scope: token.scope
			});
		} else if (!error) {
			done(null, false);
		} else {
			done(error);
		}
	});
});


var authSerializer = function (user, done) {
	done(null, {
		email: user.email,
		_id: user.id,
		firstname: user.firstname,
		lastname: user.lastname,
		fullname: user.firstname + " " + user.lastname,
		superUser: user.superUser,
		active: user.active,
	});
};

var authDeserializer = function (id, done) {
	User.findById(id, function (error, user) {
		done(error, user);
	});
};

passport.use(authStrategy);
passport.use(accessTokenStrategy);
passport.serializeUser(authSerializer);
passport.deserializeUser(authDeserializer);