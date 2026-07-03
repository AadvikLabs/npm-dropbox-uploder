const boxService = require('./src/services/boxService');
const boxAuth = require('./src/config/boxAuth');
const uploadRoutes = require('./src/routes/uploadRoutes');

module.exports = {
    boxService,
    getBoxClient: boxAuth.getBoxClient,
    uploadRoutes
};
