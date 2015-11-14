var express = require('express'),
	https = require('https'),
	fs = require('fs'),
	passport = require('passport'),
	wsfed = require('wsfed');
	
var ClientCredAuth = require('passport-client-cert').Strategy;

var app = express();
app.use(passport.initialize());
passport.use(new ClientCredAuth(validateCert));

app.get('/wsfed',
        passport.authenticate('client-cert',{session: false}),
        wsfed.auth({
        issuer: 'http://zamd.net',
        cert:    fs.readFileSync('./certs/localhost.pem'),
        key:     fs.readFileSync('./certs/localhost.key'),
        getPostURL: function (wtrealm, wreply, req, callback) { 
                      return callback( null, 'https://zulfiqar.eu.auth0.com/login/callback')
                    }
        }));


function validateCert(clientCert,done){	
		//TODO: authorize/validate certificate here...
		done(null,
    {
      displayName: clientCert.subject.CN
    });
}

var opts = {
  key: fs.readFileSync('./certs/localhost.key'),
  cert: fs.readFileSync('./certs/localhost.pem'),
  ca: fs.readFileSync('./certs/InteliticsCA.pem'),
  requestCert: true,
  rejectUnauthorized: false
};

https.createServer(opts,app).listen(5000);