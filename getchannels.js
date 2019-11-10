const fs = require('fs');
const ga = require("./google-auth");
const {google} = require('googleapis');
const readline = require('readline');

const SCOPES = ['https://www.googleapis.com/auth/youtube.readonly'];
const CLIENT_SECRET_PATH = './.credentials/client_secret.json';
const TOKEN_PATH = './.credentials/youtube-nodejs-token.json';

// async function StoreCredentials() {
//     await ga.requestCredentials(
//         SCOPES,
//         fs.readFileSync(CLIENT_SECRET_PATH),
//         async (authUrl) => {
//             const rl = readline.createInterface({
//                 input: process.stdin,
//                 output: process.stdout
//             });

//             console.log('Authorize this app by visiting this url: ', authUrl);
            
//             var input = new Promise(resolve => {
//                 rl.question('Enter the code from that page here: ', (code) => {
//                     resolve(code);
//                 });       
//             );
//             Promise.
//         }
//     ).then(
//         token => {
//             fs.writeFile(TOKEN_PATH, JSON.stringify(token), (error) => {
//                 if (err) throw err;    
//                 console.log('Token stored to ' + TOKEN_PATH);
//             });
//         },
//         error => {
//             throw error;
//         }        
//     );
// }

// StoreCredentials();


let auth = ga.getOauth2Client(
    SCOPES,
    fs.readFileSync(CLIENT_SECRET_PATH),
    fs.readFileSync(TOKEN_PATH)
);

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
