// middlewares/logging-middleware.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function logMessage(deploymentId, message) {
    try {
        await prisma.log.create({
            data: {
                deploymentId,
                message,
            },
        });
    } catch (error) {
        console.error('Error logging message:', error);
    }
}

module.exports = {
    logMessage,
};
