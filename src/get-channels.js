const fs = require("fs");
const ga = require("./google-auth");
const {google} = require('googleapis');

async function main() {
    let credentials = ga.getCredentials('../.google-credentials', 'alex.bg.3.0');
    let auth = ga.createOauth2Client(credentials);

    var code = fs.readFileSync(credentials.folder + "/authCode", "utf8");
    await auth.getToken(code)
    .then(token => { auth.credentials = token; return auth; })
    .then(auth => {
        var youtube = google.youtube('v3');
        youtube.subscriptions.list({
                auth: auth,
                part: 'snippet,contentDetails',
                mine: true
            }, 
            function(err, response) {
                if (err) {
                    console.log('The API returned an error: ' + err);
                    return;
                }
                var channels = response.data.items;
                if (channels.length == 0)
                    console.log('No channel found.');
                else 
                    console.log('This channel\'s ID is %s. Its title is \'%s\', and it has %s views.',
                        channels[0].id,
                        channels[0].snippet.title,
                    );
            }
        );
    })
    .catch(error => console.error(error));
}
main();