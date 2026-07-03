const BoxSDK = require('box-node-sdk');
const express = require('express');
const dotenv = require('dotenv');
const open = require('open');
const path = require('path');

dotenv.config();

const app = express();
const port = 3000;

const sdk = new BoxSDK({
    clientID: process.env.BOX_CLIENT_ID,
    clientSecret: process.env.BOX_CLIENT_SECRET
});

if (!process.env.BOX_CLIENT_ID || !process.env.BOX_CLIENT_SECRET) {
    console.error('Error: Please set BOX_CLIENT_ID and BOX_CLIENT_SECRET in your .env file first.');
    process.exit(1);
}

const authorizeUrl = sdk.getAuthorizeURL({
    response_type: 'code',
    // redirect_uri is optional if only one is configured in the Box dev console
});

app.get('/callback', async (req, res) => {
    const code = req.query.code;
    if (!code) {
        return res.send('No code received.');
    }

    try {
        const tokenInfo = await sdk.getTokensAuthorizationCodeGrant(code);
        console.log('\n--- SUCCESS! ---');
        console.log('Copy this Refresh Token to your .env file:');
        console.log('BOX_REFRESH_TOKEN=' + tokenInfo.refreshToken);
        console.log('----------------\n');
        
        res.send('<h1>Authorization Successful!</h1><p>You can close this window and check your terminal.</p>');
        setTimeout(() => process.exit(0), 2000);
    } catch (err) {
        console.error('Error exchanging code for tokens:', err.message);
        res.status(500).send('Error exchanging code: ' + err.message);
    }
});

app.listen(port, () => {
    console.log(`\n1. Opening browser for Box authorization...`);
    console.log(`2. If it doesn't open automatically, visit: ${authorizeUrl}`);
    open(authorizeUrl);
});
