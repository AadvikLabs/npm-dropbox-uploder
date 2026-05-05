const BoxSDK = require('box-node-sdk').default;
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config();

const sdk = new BoxSDK({
    clientID: process.env.BOX_CLIENT_ID,
    clientSecret: process.env.BOX_CLIENT_SECRET
});

const getBoxClient = (refreshToken) => {
    // Token Store to save the latest refresh token back to .env
    const tokenStore = {
        read: function(callback) {
            callback(null, null); // We let the initial call use the .env value
        },
        write: function(tokenInfo, callback) {
            try {
                const envPath = path.join(process.cwd(), '.env');
                let envContent = fs.readFileSync(envPath, 'utf8');
                
                // Regex to find and replace the BOX_REFRESH_TOKEN line
                const regex = /^BOX_REFRESH_TOKEN=.*$/m;
                const newLine = `BOX_REFRESH_TOKEN=${tokenInfo.refreshToken}`;
                
                if (regex.test(envContent)) {
                    envContent = envContent.replace(regex, newLine);
                } else {
                    envContent += `\n${newLine}`;
                }
                
                fs.writeFileSync(envPath, envContent);
                console.log('🔄 BOX_REFRESH_TOKEN updated in .env');
                callback();
            } catch (err) {
                console.error('Error saving token to .env:', err.message);
                callback(err);
            }
        },
        clear: function(callback) { callback(); }
    };

    return sdk.getPersistentClient({
        accessToken: 'initial-placeholder', 
        refreshToken: refreshToken,
        accessTokenTTLMS: 1,
        acquiredAtMS: 1
    }, tokenStore);
};

module.exports = {
    getBoxClient
};
