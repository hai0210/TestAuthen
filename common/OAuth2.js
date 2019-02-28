var oauth2orize = require('oauth2orize');
const GrantCode = require('../model/GrantCode');
const Application = require('../model/Application');
const AccessToken = require('../model/AccessToken');
var server = oauth2orize.createServer();

server.grant(oauth2orize.grant.code({
	// scopeSeparator: [' ', ',']
}, function (application, redirectURI, user, ares, done) {
	GrantCode.findOne({
		user: user,
		application: application
	}).exec(function (error, grantCode) {
		if (grantCode == '' || !grantCode) {
			var grant = new GrantCode({
				application: application,
				user: user,
				// scope: ares.scope
			});
			grant.save(function (error) {
				done(error, error ? null : grant.code);
			});
		} else if (!error) {
			done(error, error ? null : grantCode.code);
		} else {
			done(error);
		}
	});

}));

server.exchange(oauth2orize.exchange.code({
	userProperty: 'clientApp'
}, function (application, code, redirectURI, done) {
	GrantCode.findOne({
		code: code
	}, function (error, grant) {
		if (grant && grant.active && grant.application == application.id) {
			var token = new AccessToken({
				application: grant.application,
				user: grant.user,
				grant: grant,
				// scope: grant.scope
			});
			token.save(function (error) {
				done(error, error ? null : token.token, null, error ? null : {
					token_type: 'standard'
				});
			});
		} else {
			done(error, false);
		}
	});
}));
server.serializeClient(function (application, done) {
	done(null, application.id);
});
server.deserializeClient(function (id, done) {
	Application.findById(id, function (error, application) {
		done(error, error ? null : application);
	});
});

module.exports = server;