const GrantCode = require('../model/GrantCode');
const Application = require('../model/Application');
const AccessToken = require('../model/AccessToken');
const Users = require('../model/User');

const server = require('../common/OAuth2')

var express = require('express');
var router = express.Router();
const ensure = require('connect-ensure-login');
const passport = require('passport');
const url = require('url');

router.get('/dialog/oauth2', ensure.ensureLoggedIn('/login'), server.authorize(function (applicationID, redirectURI, done) {
	Application.findOne({
		oauth_id: applicationID
	}, function (error, application) {
		if (application) {
			var match = false,
				uri = url.parse(redirectURI || '');

			for (var i = 0; i < application.domains.length; i++) {
				if (uri.host == application.domains[i] || (uri.protocol == application.domains[i] && uri.protocol != 'http' && uri.protocol != 'https')) {
					match = true;
					break;
				}
			}
			if (match && redirectURI && redirectURI.length > 0) {
				done(null, application, redirectURI);
			} else {
				done(new Error("You must supply a redirect_uri that is a domain or url scheme owned by your app."), false);
			}
		} else if (!error) {
			done(new Error("There is no app with the client_id you supplied."), false);
		} else {
			done(error);
		}
	});
}), function (req, res, next) {
	GrantCode.findOne({
		user: req.user,
		application: req.oauth2.client
	}).exec(function (error, grantCode) {
		if (grantCode == '' || !grantCode) {
			// var scopeMap = {
			// 	// ... display strings for all scope variables ...
			// 	view_account: 'view your account',
			// 	edit_account: 'view and edit your account',
			// };
			res.render('oauth', {
				pageName: "OAuth2Server Authorized",
				transaction_id: req.oauth2.transactionID,
				currentURL: req.originalUrl,
				response_type: req.query.response_type,
				errors: req.flash('error'),
				// scope: req.oauth2.req.scope,
				application: req.oauth2.client,
				user: req.user,
				// map: scopeMap
			});
		} else if (!error) {
			server.decision({
				loadTransaction: false
			}, (req, done) => {
				done(null, {
					allow: true
				});
			})(req, res, next);
		} else {
			done(error);
		}
	});

});

router.post('/oauth2/decision', function (req, res, next) {

	console.log(`user in finish 1: ${JSON.stringify(req.user)}`)

	if (req.user) {
		next();
	} else {

		passport.authenticate('local', {
			session: true
		}, function (error, user, info) {
			console.log(`user in finish 2: ${JSON.stringify(user)}`)
			if (user) {
				req.user = user;
				next();
			} else if (!error) {
				req.flash('error', 'Your email or password was incorrect. Try again.');
				res.redirect(req.body['auth_url'])
			}
		})(req, res, next);
	}
}, server.decision(function (req, done) {
	done(null
		// ,{scope: req.oauth2.req.scope}
	);
}));

router.post('/oauth2/access_token', function (req, res, next) {
	var appID = req.body['client_id'];
	var appSecret = req.body['client_secret'];
	Application.findOne({
		oauth_id: appID,
		oauth_secret: appSecret
	}, function (error, application) {
		if (application) {
			req.clientApp = application;
			next();
		} else if (!error) {
			error = new Error("There was no application with the Application ID and Secret you provided.");
			next(error);
		} else {
			next(error);
		}
	});

}, server.token(), server.errorHandler());

router.get('/api/me',
	passport.authenticate('bearer', {
		session: true
	}),
	function (req, res, next) {
		res.json({
			email: req.user.email,
			firstname: req.user.firstname,
			lastname: req.user.lastname,
			displayname: req.user.firstname + " " + req.user.lastname,
			info: "from api/me"
		});
		// })

	}
);

router.get('/oauth2/profile',
	passport.authenticate('bearer', {
		session: true
	}),
	function (req, res, next) {
		let access_token = req.query.access_token;
		AccessToken
			.findOne({
				token: access_token
			}).populate('user')
			.populate('application')
			.exec(function (error, token) {
				let applicationOwner = token.application.owner;
				let user = token.user._id;
				return res.json({
					isOwner: JSON.stringify(user, null, 4) === JSON.stringify(applicationOwner, null, 4),
					email: req.user.email,
					firstname: req.user.firstname,
					lastname: req.user.lastname,
					displayname: req.user.firstname + " " + req.user.lastname,
					info: "from oauth2/profile"
				})
			})
	})

module.exports = router;