var express = require('express'),
app = express(),
fs = require('fs'),
https = require('https'),
nconf = require('nconf'),
simpleIdp = require('./simpleIdp');

var settings = nconf.file({file: './config/settings.json'}).get();

var wsFedOptions = {
  useClientCertAuth: true,
  validationCallback: validateCert,  
  issuer: settings.issuerName,
  cert:   fs.readFileSync(settings.sslCert),
  key:     fs.readFileSync(settings.sslCertKey),
  getPostURL: function (wtrealm, wreply, req, callback){
      return callback( null, settings.auth0CallbackUrl);
    }
  };
                
app.use('/wsfed',simpleIdp.WSFed(wsFedOptions));

var sslOptions = {
  cert: fs.readFileSync(settings.sslCert),
  key: fs.readFileSync(settings.sslCertKey),
  ca: fs.readFileSync(settings.caCert),
  
  requestCert: true,
  rejectUnauthorized: false
};

var server =
https.createServer(sslOptions,app)
     .listen(settings.sslPort || 4443,function(){
    console.log("Started on port %j ...", server.address().port);
});


function validateCert(clientCert,done){	
		//TODO: authorize/validate certificate here...
		done(null,
    {
      displayName: clientCert.subject.CN
    });
}