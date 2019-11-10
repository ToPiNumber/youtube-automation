const {google} = require('googleapis');
const OAuth2 = google.auth.OAuth2;

module.exports = {
    requestCredentials: function(scopes, clientSecretJson, onProcessAuthURL) {
        let credentials = JSON.parse(clientSecretJson);
        let clientSecret = credentials.installed.client_secret;
        let clientId = credentials.installed.client_id;
        let redirectUrl = credentials.installed.redirect_uris[0];
        let oauth2Client = new OAuth2(clientId, clientSecret, redirectUrl);
        let authUrl = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: scopes
        });

        let code = onProcessAuthURL(authUrl);
        return new Promise((resolve, reject) => {
            oauth2Client.getToken(code, (err, token) => {
                if (err) 
                    reject(err); 
                else 
                    resolve(token);
            });
        });
    },

    getOauth2Client: function(scopes, clientSecretJson, tokenJson) {
        let credentials = JSON.parse(clientSecretJson);
        let clientSecret = credentials.installed.client_secret;
        let clientId = credentials.installed.client_id;
        let redirectUrl = credentials.installed.redirect_uris[0];
        let oauth2Client = new OAuth2(clientId, clientSecret, redirectUrl);
        oauth2Client.credentials = JSON.parse(tokenJson);
    }
};