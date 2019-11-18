const fs = require('fs');
const {google} = require('googleapis');
const OAuth2 = google.auth.OAuth2;

const CLIENT_SECRET_FILENAME = 'client_secret.json';
const TOKEN_FILENAME = 'token.json';
const APIKEY_FILENAME = 'apikey';

module.exports = {
    refreshTokenIfNeed: async function(oauth2Client, credentials) {
        if(credentials.token.refresh_token && credentials.token.expiry_date && credentials.token.expiry_date < Date.now()) {
            var token = await oauth2Client.refreshToken(credentials.token.refresh_token);
            credentials.token.access_token = token.access_token;
            credentials.token.expiry_date = token.access_token;
            oauth2Client.setCredentials(credentials.token);
        }
    },

    createOauth2Client: function(credentials) {
        let clientSecret = credentials.clientSecret.installed.client_secret;
        let clientId = credentials.clientSecret.installed.client_id;
        let redirectUrl = credentials.clientSecret.installed.redirect_uris[0];
        let oauth2Client = new OAuth2(clientId, clientSecret, redirectUrl);
        if(credentials.token) {
            oauth2Client.setCredentials(credentials.token);
            this.refreshTokenIfNeed(oauth2Client, credentials);
        }

        if(credentials.apiKey)
            oauth2Client.apiKey = credentials.apiKey;

        return oauth2Client;
    },

    requestToken: function(scopes, credentials, onProcessAuthURL) {
        oauth2Client = this.createOauth2Client(credentials);
        let authUrl = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: scopes
        });

        return onProcessAuthURL(authUrl)
        .then(code => {
            return new Promise((resolve, reject) => {
                oauth2Client.getToken(code, (err, token) => {
                    if (err) 
                        reject(err); 
                    else 
                        resolve(token);
                });
            });
        });
    },

    getCredentials: function(credentialsFolder, account) {
        const accountFolder = `${credentialsFolder}/${account}`;
        if(!fs.existsSync(accountFolder))
            throw { message: "Account folder doesn't exist", path: accountFolder };

        const clientSecretPath = accountFolder + '/' + CLIENT_SECRET_FILENAME;
        if(!fs.existsSync(clientSecretPath))
            throw { message: `Can't find ${CLIENT_SECRET_FILENAME}`, path: clientSecretPath };

        let result = { 
            folder: accountFolder,
            tokenPath: accountFolder + '/' + TOKEN_FILENAME,
            apiKeyPath: accountFolder + '/' + APIKEY_FILENAME,
            clientSecret: JSON.parse(fs.readFileSync(clientSecretPath, 'utf8')) 
        };

        if(fs.existsSync(result.tokenPath))
            result.token = JSON.parse(fs.readFileSync(result.tokenPath, 'utf8'));

        if(fs.existsSync(result.apiKeyPath))
            result.apiKey = fs.readFileSync(result.apiKeyPath, 'utf8');
    
        return result;
    },
};