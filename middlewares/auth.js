const { verifyToken } = require('../utils');
const { StatusCodes } = require('http-status-codes');
const { ErrorResponse } = require('../utils');

function authenticateToken(req, res, next) {
    // console.log(req)
    const token = req.headers['authorization'].split(' ')[1];
    // console.log(token)
    if (!token) {
        ErrorResponse.error = { message: 'No token provided' };
        ErrorResponse.status = StatusCodes.UNAUTHORIZED
        return res.status(StatusCodes.UNAUTHORIZED).json(ErrorResponse);
    }
    try {
        const decoded = verifyToken(token);
        req.user = decoded;
        next();
    } catch (error) {
        ErrorResponse.error = { message: 'Failed to authenticate token' };
        ErrorResponse.status = StatusCodes.UNAUTHORIZED
        return res.status(StatusCodes.UNAUTHORIZED).json(ErrorResponse);
    }
}
module.exports = {
    authenticateToken
};