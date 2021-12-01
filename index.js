const { OAuth2Client } = require('google-auth-library');
const http = require('http');
const url = require('url');
const open = require('open');
const serverDestroy = require('server-destroy');
const fs = require('fs');

const GoogleAuth = {

    options: {
        scope: [
            'https://www.googleapis.com/auth/userinfo.email'
        ],
        domainRoot: 'http://localhost',
        port: 3000,
        callbackPath: '/auth/callback',
        credPath: './google_client_secret.json',
        // tokenPath: './google_token.json',
        client: null,
    },

    setOptions(options = {}) {
        Object.assign(this.options, options);
    },

    async getClient() {

        const options = this.options;

        // Initialize
        const redirect_url = options.domainRoot + ':' + options.port + options.callbackPath;
        const url_root = 'http://localhost' + ':' + options.port;
        const keys = require(options.credPath);
        const tokenPath = options.tokenPath;
        const scope = options.scope;
        const access_type = 'offline';
        const callbackPath = options.callbackPath;

        // Initialize Client
        let sub_key = keys.web || keys.installed;
        this.client = new OAuth2Client(
            sub_key.client_id,
            sub_key.client_secret,
            redirect_url
        );

        const self = this;

        console.log('client initialized');

        // Generate New Token
        return new Promise((resolve, reject) => {

            // Generate the url that will be used for the consent dialog.
            const authorizeUrl = this.client.generateAuthUrl({ access_type, scope });

            // Open Server to Receive Callback
            console.log('launching server..');
            const server = http.createServer(async (req, res) => {
                try {
                    if (req.url.indexOf(callbackPath) > -1) {
                        console.log('response received..');
                        // acquire the code from the querystring, and close the web server.
                        const qs = new url.URL(req.url, url_root).searchParams;
                        const code = qs.get('code');
                        res.end('authentication successful. please close this browser window.');
                        server.destroy();

                        // Now that we have the code, use that to acquire tokens.
                        const r = await this.client.getToken(code);

                        // Save Tokens
                        console.log('token obtained.');
                        self.tokens = r.tokens;
                        if(tokenPath) {
                          fs.writeFileSync(tokenPath, JSON.stringify(r.tokens, null, 4));
                        }

                        // Make sure to set the credentials on the OAuth2 client.
                        this.client.setCredentials(r.tokens);

                        // Return client and tokens to the user
                        console.log('returning client..');
                        resolve(this.client);
                    }
                }
                catch (e) {
                    reject(e);
                }
            }).listen(3000, () => {
                // open the browser to the authorize url to start the workflow
                console.log('launching browser..');
                open(authorizeUrl, { wait: false }).then(cp => cp.unref());
            });
            serverDestroy(server);
        });

    },

    setScope(scope) {
        this.options.scope = scope;
    },

    setCredPath(credPath) {
        this.options.credPath = credPath;
    },

    setDomainRoot(domainRoot) {
        this.options.domainRoot = domainRoot;
    },

    setPort(port) {
        this.options.port = port;
    },

};

module.exports = GoogleAuth;

