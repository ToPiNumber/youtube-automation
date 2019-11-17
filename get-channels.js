const ga = require("./google-auth");
const {google} = require('googleapis');

let credentials = ga.getCredentials('../.google-credentials', 'alex.bg.3.0');
let auth = ga.createOauth2Client(credentials);
var youtube = google.youtube('v3');
youtube.channels.list({
        auth: auth,
        part: 'snippet,contentDetails,statistics',
        forUsername: 'GoogleDevelopers'
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
                channels[0].statistics.viewCount
            );
    }
);
