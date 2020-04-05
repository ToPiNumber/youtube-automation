
const fs = require("fs");
const settings = require('./settings');


function generateChannelUrls(subscriptions) {
    let result = [];
    subscriptions.forEach(s => {
        let kind = s.snippet.resourceId.kind;
        switch(kind){
        case "youtube#channel":
            result.push({
                name : s.snippet.title,
                url : `https://www.youtube.com/channel/${s.snippet.resourceId.channelId}`
            });
            break;
        default:
            throw { message: `ERROR: Unknown subscription kind: ${kind}` };
        }
    });
    return result;
}

function main() {
    let path = `./output/${settings.exportFromAccount}/subscriptions.json`;
    let str = fs.readFileSync(path);
    let subscriptions = JSON.parse(str);
    let urls = generateChannelUrls(subscriptions);
    let urlsPath =  `./output/${settings.exportFromAccount}/urls.json`;
    fs.writeFileSync(urlsPath, JSON.stringify(urls, null, 4));
}

main();
    