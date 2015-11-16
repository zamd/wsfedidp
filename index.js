var express = require('express'),
app = express(),
fs = require('fs'),
https = require('https'),
simpleIdp = require('./simpleIdp');

var wsFedOptions = {
  useClientCertAuth: true,
  validationCallback: validateCert,
  
  issuer: 'http://zamd.net',
  cert:    fs.readFileSync('./certs/localhost.pem'),
  key:     fs.readFileSync('./certs/localhost.key'),
  getPostURL: 
  function (wtrealm, wreply, req, callback) 
    {
     return callback( null, 'https://zulfiqar.eu.auth0.com/login/callback')
    }
  };
                
app.use('/wsfed',simpleIdp.WSFed(wsFedOptions));

function validateCert(clientCert,done){	
		//TODO: authorize/validate certificate here...
		done(null,
    {
      displayName: clientCert.subject.CN
    });
}

var sslOptions = {
  key: fs.readFileSync('./certs/localhost.key'),
  cert: fs.readFileSync('./certs/localhost.pem'),
  ca: fs.readFileSync('./certs/InteliticsCA.pem'),
  requestCert: true,
  rejectUnauthorized: false
};

https.createServer(sslOptions,app).listen(5000);