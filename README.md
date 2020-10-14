# Overview
WSFedIdp is basic WSFederation based Idp with client certificate authentication. 
It's based on [passportjs](https://github.com/jaredhanson/passport) and Auth0 [wsfed node module]( https://github.com/auth0/node-wsfed). 
This Idp sample also exposes standard WSFederation metadata endpoint on **/wsfed/FederationMetadata/2007-06/FederationMetadata.xml**.

The metadata endpoint can be used to connect this Idp with Auth0 using the standard ADFS connector in Auth0, enabling a handy scenario where corporate employees can sign into full echosystem of Auth0 enabled services by using their Smart cards.

Setup
===================
Clone the repo to your local machine

```
git clone https://github.com/zamd/wsfedidp.git
```

To get the sample running in your demo environment, you would need following 3 certificates. 

 1. A self-signed root certificate authority **FabrikamRootCA**
 2. An SSL *Server auth* certificate issued by FabrikamRootCA 
 3. An SSL *Client auth* certificate issued by FabrikamRootCA

I used openssl to generate certificates which works on both Windows & Mac. 

Setting up certificates
---------------------------

When running the commands below - they will pick up default values from **openssl.cnfg** file. You can chnage the default values in **openssl.cnfg** to suit your scenario. 
I have used 'Fabrikam Ltd' as the 'Organization Name' and 'Jon Smith' as employee.

#### Generate a root CA certificate ####
```
openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout FabrikamRootCA.key -out FabrikamRootCA.cer -config openssl.cnfg -extensions v3_ca -sha256
```

#### Generate a new RSA key pair for Idp website ####
```
openssl genrsa -out fabrikam.net.key 2048
```
Create a new Certificate Signing Request (CSR), using idp website key, to be sent to FabrikamRootCA to sign & issue a website SSL certificate 
#### Cerficate Signing Request (CSR) ####
In the following step, make sure to enter 'Common Name' same as the domain name. For example, **fabrikam.net**
```
openssl req -new -key fabrikam.net.key -out fabrikam.net.csr -config openssl.cnfg -extensions server_cert -days 365 -sha256
```
Sign the CSR using the FabrikamRootCA key to generate website certificate

```
openssl x509 -req -in fabrikam.net.csr -CA FabrikamRootCA.cer -CAkey FabrikamRootCA.key -CAcreateserial  -out fabrikam.net.cer -extfile openssl.cnfg -extensions server_cert -sha256
```
Now repeat the same steps to generate an SSL client certificate for jon@fabrikam.net

```
openssl genrsa -out jon.key 2048
```
#### Cerficate Signing Request (CSR) ####
In the following step, enter employee name (Jon Smith) as the 'Common Name'
```
openssl req -new -key jon.key -out jon.csr -config openssl.cnfg -extensions usr_cert -days 365 -sha256
```
#### Generate a user certificate ####
```
openssl x509 -req -in jon.csr -CA FabrikamRootCA.cer -CAkey FabrikamRootCA.key -CAcreateserial  -out jon.cer -extfile openssl.cnfg -extensions usr_cert -sha256
```
#### PKCS12 ####
Convert jon.key & jon.cer into pkcs12 (pfx) format by running following command. Choose a password to protect the private key. You would need this password when importing the certficate later on.

```
openssl pkcs12 -export -out jon.pfx -inkey jon.key -in jon.cer -certfile FabrikamRootCA.cer
```
Import the pfx file into your personal certificate store (login in Mac keychain).
On Mac, you can run following command. Substitue `<PWD>` with your private key password.
```
security import jon.pfx -k ~/Library/Keychains/login.keychain -P <PWD>
```
Import the CA certificate (**FabrikamRootCA.cer**) into Trusted Root Certificate Authorities (System Roots on Mac) folder in your cert store. 

If you are on MAC, you can also use following command to import CA certificate into 'trusted root certificate store'. **Thanks Sandrino(@sandrinodimattia)**

```
sudo security add-trusted-cert -d -r trustRoot -k "/Library/Keychains/System.keychain" ./FabrikamRootCA.cer
```

Running & Testing Idp
---------------------------
- Add a entry in your hostfile, mapping **fabrikam.net** to **127.0.0.1**
- Ping **fabrikam.net** to make sure it's resolving to **127.0.0.1**
- In your working (cloned) directory do:
```
npm install
```
- Followed by:
```
node .
```
- Open a browser and retrieve federation metadata document by typing following url and save it to a local file. You would need to import this into Auth0 as part connection settings.
```
https://fabrikam.net:4443/wsfed/FederationMetadata/2007-06/FederationMetadata.xml
```

Setting up Auth0
---------------------------
- Login to Auth0 (or Sign up for trial) and open **Apps/Api** page from the left-hand menu

![Auth0 Dashboard](https://github.com/zamd/wsfedidp/blob/master/images/auth0dash.PNG)

- Create a new app or select the existing "Default App" and switch to "Quick Start" tab
- Select **Regular Web Application** and then choose **Node.js** type and download the Seed Application

![Auth0 Seed Project](https://github.com/zamd/wsfedidp/blob/master/images/auth0seedproject.PNG)

- From the left-menu, Click on Connections --> Enterprise and add a new connection for **ADFS**


![Auth0 Enterprise connections](https://github.com/zamd/wsfedidp/blob/master/images/auth0adfscon.PNG)

- Specify details for the new connection and upload your Idp's Federation Metadata file into you connection settings

![connections settings](https://github.com/zamd/wsfedidp/blob/master/images/auth0adfsconset.PNG)

- Click Continue on the next page

![connections settings](https://github.com/zamd/wsfedidp/blob/master/images/auth0adfsconset2.PNG)

- Copy the Endpoint URL from **Connect ADFS with Auth0** page and set it as the **auth0CallbackUrl** value in [settings.json](/config/settings.json) file in your Idp directory

![connections settings](https://github.com/zamd/wsfedidp/blob/master/images/auth0adfsconset3.PNG)

- Enable this new connection for your app in **app settings**

![connections settings](https://github.com/zamd/wsfedidp/blob/master/images/auth0connectionenabledapp.PNG)

- On the Settings tab, add **http://localhost:3000/callback** to 'Allowed Callback URLs' textbox

Running the application
-----------------------------
- Stop & restart the Idp
```
node .
```
- Unzip the **seed project** zip file
- Configure your ClientID, Secret & Auth0_Domain in .env file
- Start the seed application
```
npm install
```
```
npm start
```
- Browse to **http://localhost:3000** to run authentication flow

![connections settings](https://github.com/zamd/wsfedidp/blob/master/images/auth0fedworking.PNG)
- Login to **Fabrikam.net**
![connections settings](https://github.com/zamd/wsfedidp/blob/master/images/auth0fedworking2.PNG)
- Select the user authentication certficate 
![connections settings](https://github.com/zamd/wsfedidp/blob/master/images/auth0fedworking3.PNG)

Request Flow
===================

The following diagram captures the authentication request flow between sample application, WSFed Idp & Auth0...

![Authentication request flow](https://github.com/zamd/wsfedidp/blob/master/images/requestflow.png)
