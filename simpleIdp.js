var express = require('express'),
	app = express(),
	router = express.Router(),
	passport = require('passport'),
	wsfed = require('wsfed');

var ClientCredAuth = require('passport-client-cert').Strategy;

exports.WSFed = function(options){
	if (options.useClientCertAuth){
		router.use(passport.initialize());
		passport.use(new ClientCredAuth(options.validationCallback));		
	}
	router.use('/FederationMetadata/2007-06/FederationMetadata.xml',
			wsfed.metadata({
				  issuer:options.issuer, 
				  cert: options.cert
			}));
				
	router.use('/',
				passport.authenticate('client-cert',{session: false}),
				wsfed.auth(options)
	);

	return router;
}

exports.SamlP = function(options){

}