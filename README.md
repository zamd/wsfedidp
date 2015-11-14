# Node WSFed Idp
wsfedIdp is basic WSFederation based Idp with client certificate authentication. 
It's based on [passportjs](https://github.com/jaredhanson/passport) and Auth0 [wsfed node module]( https://github.com/auth0/node-wsfed). 
This Idp sample also exposes standard WSFederation metadata endpoint on **/wsfed/FederationMetadata/2007-06/FederationMetadata.xml** 

This metadata endpoint can be used to connect this Idp with Auth0 serivce using the standard ADFS connector in Auth0 enabling a handy scenario where corporate employees can sign into full echosystem of Auth0 enabled services by using their Smart cards.

The following diagram captures the authentication request flow.

![Authentication request flow](https://github.com/zamd/wsfedidp/docs/requestflow.png)