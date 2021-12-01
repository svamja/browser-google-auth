# Browser-based Google Auth using NodeJS

A simple google authentication workflow that launches 
browser and return auth token, in the NodeJS script.

## How to use

    const BrowserGoogleAuth = require('browser-google-auth');
    const credPath = __dirname + '/.google_credentials.json'; // required
    const tokenPath =  __dirname + '/.google_token.json'; // optional
    const scope = [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/drive',
    ];
    BrowserGoogleAuth.setOptions({ tokenPath, credPath, scope });
    let auth = await BrowserGoogleAuth.getClient();


## Callback URL

Add below callback URL through Google Console

    http://localhost:3000/auth/callback

or change it using option parameters { domainRoot, port, callbackPath }




