const express = require('express');
const { generateSlug } = require('random-word-slugs');
const { ECSClient, RunTaskCommand } = require('@aws-sdk/client-ecs');
const { Server } = require('socket.io');
const Redis = require('ioredis');
const cors = require('cors');

require('dotenv').config();

const app = express();
const PORT = 9000;

app.use(cors());
app.use(express.json());

const accessKeyId = process.env.ACCESS_KEY_ID;
const secretAccessKey = process.env.SECRET_KEY_ID;
const cluster = process.env.CLUSTER;
const task = process.env.TASK;
const subnet1 = process.env.SUBNET1;
const subnet2 = process.env.SUBNET2;
const subnet3 = process.env.SUBNET3;
const securityGroup = process.env.SECURITY_GROUP;
const redisURI = process.env.REDIS_URI;

const subscriber = new Redis(redisURI);
const io = new Server({ cors: '*' });

io.on('connection', (socket) => {
    socket.on('subscribe', (channel) => {
        socket.join(channel);
        // socket.emit('message', `Joined ${channel}`);
    });
});

io.listen(9002, () => console.log('Socket Server running on port 9002'));

const ecsClient = new ECSClient({
    credentials: {
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey,
    },
    region: 'ap-south-1', // Specify your region if required
});

const config = {
    CLUSTER: cluster,
    TASK: task,
};

app.post('/project', async (req, res) => {
    const { gitURL } = req.body;
    const projectSlug = generateSlug();

    const command = new RunTaskCommand({
        cluster: config.CLUSTER,
        taskDefinition: config.TASK,
        launchType: 'FARGATE',
        count: 1,
        networkConfiguration: {
            awsvpcConfiguration: {
                assignPublicIp: 'ENABLED',
                subnets: [subnet1, subnet2, subnet3],
                securityGroups: [securityGroup],
            },
        },
        overrides: {
            containerOverrides: [{
                name: 'builder-image',
                environment: [
                    {
                        name: 'GIT_REPOSITORY__URL',
                        value: gitURL,
                    },
                    {
                        name: 'secretAccessKey',
                        value: secretAccessKey,
                    },
                    {
                        name: 'accessKeyId',
                        value: accessKeyId,
                    },
                    {
                        name: 'PROJECT_ID',
                        value: projectSlug,
                    },
                    {
                        name: 'REDIS_URI',
                        value: redisURI,
                    },
                ],
            }],
        },
    });

    console.log(command);
    await ecsClient.send(command);
    return res.json({
        status: 'queue',
        projectSlug,
    });
});

async function initRedisSubscribe() {
    subscriber.psubscribe('logs:*');
    subscriber.on('pmessage', (pattern, channel, message) => {
        console.log(`Pattern: ${pattern}, Channel: ${channel}, Message: ${message}`);
        io.to(channel).emit('message', message);
    });
}

initRedisSubscribe();
app.listen(PORT, () => console.log(`API server running on port ${PORT}`));
