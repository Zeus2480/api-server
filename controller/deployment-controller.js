// controllers/deployment-controller.js
const { StatusCodes } = require('http-status-codes');
const { updateDeploymentStatus, logDeploymentMessage } = require('../services/deployment-service');
const { SuccessResponse, ErrorResponse } = require('../utils');

async function setDeploymentStatus(req, res) {
    const { deploymentId } = req.params;
    const { status } = req.body;
    try {
        await updateDeploymentStatus(deploymentId, status);
        SuccessResponse.message = 'Deployment status updated successfully';
        return res.status(StatusCodes.OK).json(SuccessResponse);
    } catch (error) {
        ErrorResponse.error = error;
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
    }
}

async function logMessage(req, res) {
    const { deploymentId } = req.params;
    const { message } = req.body;
    try {
        await logDeploymentMessage(deploymentId, message);
        SuccessResponse.message = 'Log message recorded successfully';
        return res.status(StatusCodes.OK).json(SuccessResponse);
    } catch (error) {
        ErrorResponse.error = error;
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
    }
}

module.exports = {
    setDeploymentStatus,
    logMessage,
};
