// services/deployment-service.js
const { PrismaClient, DeploymentStatus } = require('@prisma/client');
const prisma = new PrismaClient();
const { logMessage } = require('../middlewares/logging-middleware');

async function updateDeploymentStatus(deploymentId, status) {
    try {
        await prisma.deployment.update({
            where: { id: deploymentId },
            data: { status },
        });
        await logMessage(deploymentId, `Deployment status updated to ${status}`);
    } catch (error) {
        console.error('Error updating deployment status:', error);
    }
}

async function logDeploymentMessage(deploymentId, message) {
    try {
        await logMessage(deploymentId, message);
    } catch (error) {
        console.error('Error logging deployment message:', error);
    }
}

module.exports = {
    updateDeploymentStatus,
    logDeploymentMessage,
};
