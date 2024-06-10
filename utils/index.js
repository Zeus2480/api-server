const jwt = require('jsonwebtoken');
const { ServerConfig } = require('../config');

function verifyToken(token) {
    return jwt.verify(token, ServerConfig.SECRET_KEY_ID);
}

const ErrorResponse = {
    error: null,
    status: null,
    success: false
};

const SuccessResponse = {
    data: null,
    status: null,
    success: true
};

module.exports = {
    verifyToken,
    ErrorResponse,
    SuccessResponse
};
