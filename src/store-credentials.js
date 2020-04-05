const fs = require('fs');
const ga = require("./google-auth");
const readline = require('readline');

const SCOPES = ['https://www.googleapis.com/auth/youtube'];

async function StoreCredentials(useExistedCodeFile) {
    let credentials = ga.getCredentials('../.google-credentials', 'alexbg.home');
    await ga.requestToken(SCOPES, credentials,
        async (authUrl) => { 
            fs.writeFileSync(`${credentials.folder}/authUrl.txt`, authUrl);

            const codeFilePath = `${credentials.folder}/code.txt`;
            if(useExistedCodeFile == false)
                fs.writeFileSync(codeFilePath, '');
            return new Promise((resolve) => {
                if(useExistedCodeFile) {
                    var data = fs.readFileSync(codeFilePath, 'utf8');
                    if(data.length && data.length > 0) {
                        fs.unwatchFile(codeFilePath);
                        resolve(data);
                    }                   
                } else {
                    var watcher = fs.watchFile(codeFilePath, (curr, prev) => {
                        var data = fs.readFileSync(codeFilePath, 'utf8');
                        if(data.length && data.length > 0) {
                            fs.unwatchFile(codeFilePath);
                            resolve(data);
                        }
                    });
                }
            });
        }
    ).then(
        token => {
            return new Promise((resolve, reject) => {
                fs.writeFile(credentials.tokenPath, JSON.stringify(token), (error) => {
                    if (error) 
                        return reject(error);
                    resolve(token);
                    console.log(`Access Token saved to file: ${credentials.tokenPath}`);
                });
            });
        },
    ).catch(error => console.error(error));
}

StoreCredentials(false);
