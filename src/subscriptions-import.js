const fs = require("fs");
const ga = require("./google-auth");
const settings = require('./settings');
const {google} = require('googleapis');

function getSubscriptions(auth, nextPageToken, subscriptions = []) { 
    let youtube = google.youtube('v3');
    return new Promise((resolve, reject) => {
        youtube.subscriptions.list({
                auth: auth,
                part: 'snippet,contentDetails',
                mine: true,
                maxResults: 5,
                pageToken: nextPageToken,
            }, 
            function(err, response) {
                if (err) 
                    return reject({ message: 'API: ' + err });

                let items = response.data.items;
                if (items.length == 0)
                    return reject({ message:'No channel found.' });
                                    
                subscriptions.push.apply(subscriptions, items);
                resolve({ nextPageToken: response.data.nextPageToken, subscriptions: subscriptions });
            }
        );
    })
    .then(result => {
        if(result.nextPageToken)
            return getSubscriptions(auth, result.nextPageToken, result.subscriptions);
        return result;
    });
}

function getChannelIDs(subscriptions) {
    let result = [];
    subscriptions.forEach(s => {
        let kind = s.snippet.resourceId.kind;
        switch(kind) {
            case "youtube#channel":
                result.push({
                    title: s.snippet.title,
                    id: s.snippet.resourceId.channelId
                });
                break;
            default:
                throw { message: `ERROR: Unknown subscription kind: ${kind}` };
        }
    });
    return result;
}

function importSubscriptions(auth, existingSubscriptions) {
    let youtube = google.youtube('v3');
    return new Promise((resolve, reject) => {
        let str = fs.readFileSync(`./output/${settings.exportFromAccount}/subscriptions.json`);
        let subscriptions = JSON.parse(str);
        let IDs = getChannelIDs(subscriptions);
        let existingIDs = getChannelIDs(existingSubscriptions);
        
        let promises = [];
        IDs.forEach(e => {
            if(existingIDs.find(existing => existing.id == e.id)) {
                console.log(`SKIPPED: Subscription already exists: "${e.title}" id=${e.id}`);
                return;
            }

            existingIDs.push(e);
            promises.push(
                new Promise((resolve, reject) => {
                    youtube.subscriptions.insert({
                        auth: auth,
                        part: 'id,snippet',
                        snippet: {
                            resourceId: { kind: 'youtube#channel', channelId: e.id }
                        }
                    },
                    function(err, response) {
                        if (err) 
                            return reject({ message: 'API ERROR: ' + err });
                        resolve(response);
                    })
                })
            );
        });
        
        Promise.all(promises)
        .then(result => resolve(result))
        .catch(error => reject(error));
    });
}

async function main() {    
    var credentials = ga.getCredentials('../.google-credentials', settings.importToAccount);
    ga.createOauth2Client(credentials)    
    .then(auth => {
        return new Promise((resolve, reject) => {
            getSubscriptions(auth, undefined)
            .then(subscriptions => {
                resolve({ auth: auth, existingSubscriptions: subscriptions.subscriptions});
            })
            //.catch(error => reject(error));
            .catch(resolve({ auth: auth, existingSubscriptions: []}));
        });
    })
    .then(({auth, existingSubscriptions}) => {
        return importSubscriptions(auth, existingSubscriptions);
    })
    .catch(error => {
        console.log(error);
    });
}

main();