const Redis = require('ioredis');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function initRedisSubscribe() {
    const REDIS_URI = process.env.REDIS_URI;
    const subscriber = new Redis(REDIS_URI);

    subscriber.psubscribe('logs:*', (err, count) => {
        if (err) {
            console.error('Failed to subscribe: %s', err.message);
        } else {
            console.log(`Subscribed successfully! This client is currently subscribed to ${count} channels.`);
        }
    });

    subscriber.on('pmessage', async (pattern, channel, message) => {
        console.log(pattern)
        if (pattern !== 'logs:*') return;
        const parsedMessage = JSON.parse(message);
        const logMessage = parsedMessage.log;
        const [, deploymentId, projectId] = channel.split(':');
        console.log(deploymentId)
        console.log(projectId)
        try {
            const deployment = await prisma.deployment.findUnique({
                where: {
                    id: deploymentId,
                },
            });

            if (!deployment) {
                console.error(`Deployment with ID ${deploymentId} not found.`);
                return;
            }
            await prisma.log.create({
                data: {
                    deploymentId,
                    message: logMessage,
                },
            });
            console.log('Log saved to database.');
        } catch (error) {
            console.error('Error saving log to database:', error);
        }
    });

    subscriber.psubscribe('status:*', (err, count) => {
        if (err) {
            console.error('Failed to subscribe: %s', err.message);
        } else {
            console.log(`Subscribed successfully! This client is currently subscribed to ${count} channels.`);
        }
    });

    subscriber.on('pmessage', async (pattern, channel, message) => {
        if (pattern !== 'status:*') return;
        const parsedMessage = JSON.parse(message);
        const status = parsedMessage.status;
        const [, deploymentId] = channel.split(':');
        try {
            // Update deployment status
            await prisma.deployment.update({
                where: { id: deploymentId },
                data: { status }
            });
            console.log('Deployment status updated to', status);
        } catch (error) {
            console.error('Error updating deployment status:', error);
        }
    });
}

module.exports = {
    initRedisSubscribe,
};
