const fs = require("fs");
const ga = require("./google-auth");
const settings = require('./settings');
const {google} = require('googleapis');

function importSubscriptions(auth) {
    let youtube = google.youtube('v3');
    return new Promise((resolve, reject) => {
        youtube.subscriptions.insert({

        },
        function(err, response) {
            if (err) 
                return reject({ message: 'The API returned an error: ' + err });

        })
    });
}

async function main() {    
    var credentials = ga.getCredentials('../.google-credentials', settings.importToAccount);
    ga.createOauth2Client(credentials)
    .then(auth => {
        importSubscriptions(auth);
    })
}

main();