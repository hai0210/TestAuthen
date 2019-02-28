# wvn-oauth2 server

wvn-oauth2 is an OAuth2 Server in [Node.js](https://nodejs.org) based on [OAuth2orize](https://github.com/jaredhanson/oauth2orize). 

## Prerequisite
- [MongoDB](https://www.mongodb.com/)
- [Node.js](https://nodejs.org) (v10.15.0 or up).

## Installation
### Without docker
```bash
git clone https://github.com/WaverleySoftware/wvn_RnD.git
cd wvn_RnD/Personal/huytruong/OAuth2server
npm install
```
For wvn-rnd team. Please contact me to add new application to test your application or if you needed my guide.
    
#### Configuration
Add .env to wvn-oauth2 folder and its should look like this: 

```bash
#clone this file and rename to .env after the first deployment
#enter values for the deployed environment
#
#Example variable
#
# --------------------------------------------
# REQUIRED: BASIC APP SETTINGS
# --------------------------------------------
NODE_ENV=development
APP_DEBUG=false
HOST_DOMAIN=http://localhost
PORT=

# --------------------------------------------
# REQUIRED: DATABASE SETTINGS
# --------------------------------------------
DB_CONNECTION=mongodb
MONGODB_URI=mongodb://localhost:27017/wvn-oauth2
DB_USERNAME=
DB_PASSWORD=

# --------------------------------------------
# REQUIRED: OUTGOING MAIL SERVER SETTINGS
# --------------------------------------------
MAILER=gmail
#SMTP
SMTP_HOST=
SMTP_PORT=
STMP_USERNAME=
SMTP_PASWWORD=

#GMAIL
GMAIL_USERNAME= 
GMAIL_PASSWORD=

#MAIL CONFIGURATION
MAIL_ENCRYPTION=
MAIL_FROM_ADDR=
MAIL_FROM_NAME=
MAIL_REPLYTO_ADDR=
MAIL_REPLYTO_NAME=
```

### <a name="docker"></a>With Docker
First get wvn-oauth2-server and build it with docker
```bash
git clone https://github.com/WaverleySoftware/wvn_RnD.git
cd wvn_RnD/Personal/huytruong/OAuth2server
docker build -t wvn-oauth2-server .
```
Create your enviroment files.

E.g: my-env-file 
```
# --------------------------------------------
# REQUIRED: BASIC APP SETTINGS
# --------------------------------------------
NODE_ENV=development
APP_DEBUG=false
HOST_DOMAIN=http://localhost
PORT=

# --------------------------------------------
# REQUIRED: DATABASE SETTINGS
# --------------------------------------------
DB_HOST=localhost
DB_PORT=27017

# --------------------------------------------
# REQUIRED: OUTGOING MAIL SERVER SETTINGS
# --------------------------------------------
MAILER=gmail
#SMTP
SMTP_HOST=
SMTP_PORT=
STMP_USERNAME=
SMTP_PASWWORD=

#GMAIL
GMAIL_USERNAME=wvn.test.oauth2@gmail.com
GMAIL_PASSWORD=Waverley@2019

#MAIL CONFIGURATION
MAIL_ENCRYPTION=
MAIL_FROM_ADDR=wvn.test.oauth2@gmail.com
MAIL_FROM_NAME=WVN-OAUTH2-TEST
MAIL_REPLYTO_ADDR=
MAIL_REPLYTO_NAME=
```
Then run this application with following command
```bash
docker run --name wvn-oauth2-server --env-file=my-env-file --network=host -i wvn-oauth2-server
```

## Features
* Authorization Code grant types
* Access Tokens
* Single Sign On (SSO)
* Register, Login, Reset password, View/Edit user profile
* Simple UI for above features

## API Information
Your application should access to authentication point:
```
http://your-wvn-oauth2-server.com/v1/dialog/oauth2
```
This is access token point where your application exchange grant code for access token 
```
http://your-wvn-oauth2-server.com/v1/oauth2/access_token
```
This is where your application get user profile when it have an access token
```
http://your-wvn-oauth2-server.com/v1/api/me
```

# wvn-oauth2 example client
TBD {
    Implement on client,
    Strategy,
    how to login, how to logout
}


