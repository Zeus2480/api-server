const { PrismaClient } = require('@prisma/client');
const { generateSlug } = require('random-word-slugs');
const { ECSClient, RunTaskCommand } = require('@aws-sdk/client-ecs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto-js');
const { StatusCodes } = require("http-status-codes");
const { ServerConfig } = require('../config');
const prisma = new PrismaClient();

const AppError = require('../utils/app-error');

const ecsClient = new ECSClient({
    credentials: {
        accessKeyId: ServerConfig.ACCESS_KEY_ID,
        secretAccessKey: ServerConfig.SECRET_KEY_ID,
    },
    region: 'ap-south-1'
});

const ENCRYPTION_KEY = ServerConfig.ENCRYPTION_KEY;

function encrypt(text) {
    return crypto.AES.encrypt(text, ENCRYPTION_KEY).toString();
}

function decrypt(text) {
    const bytes = crypto.AES.decrypt(text, ENCRYPTION_KEY);
    return bytes.toString(crypto.enc.Utf8);
}

async function registerUser(data) {
    const user = await prisma.user.findUnique({
        where: { email: data.email }
    });

    if (user) {
        throw new AppError('User already exists', StatusCodes.OK);
    }
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const newUser = await prisma.user.create({
        data: {
            email: data.email,
            password: hashedPassword,
            firstName: data.firstName,
            lastName: data.lastName
        },
    });
    const token = jwt.sign({ userId: newUser.id }, ServerConfig.SECRET_KEY_ID);
    let resp = {
        newUser, token
    }
    return resp;
}

async function authenticateUser(data) {
    const user = await prisma.user.findUnique({
        where: { email: data.email }
    });
    if (!user || !(await bcrypt.compare(data.password, user.password))) {
        throw new AppError('Invalid credentials', StatusCodes.OK);
    }
    const token = jwt.sign({ userId: user.id }, ServerConfig.SECRET_KEY_ID);
    return token;
}

async function getProjects(user) {
    const projects = await prisma.project.findMany({
        where: { userId: user.userId },
        include: {
            deployments: true
        }
    })
    return projects;
}
async function getProject(user, id) {
    const projects = await prisma.project.findUnique({
        where: {
            userId: user.userId,
            id, id
        },
        include: {
            deployments: {
                include: {
                    logs: {
                        orderBy: {
                            createdAt: 'desc',
                        },
                    }
                },
            },
        }
    })
    return projects;
}

async function createProject(user, data) {
    const existingUser = await prisma.user.findUnique({
        where: { id: user.userId }
    });

    if (!existingUser) {
        throw new AppError('User does not exist', StatusCodes.OK);
    }

    const projectSlug = generateSlug();

    const project = await prisma.project.create({
        data: {
            name: projectSlug,
            gitURL: data.gitURL,
            subDomain: projectSlug,
            userId: user.userId
        }
    });
    if (data.envVariables && data.envVariables.length > 0) {
        const envVarsToStore = data.envVariables.map(envVar => ({
            projectId: project.id,
            key: envVar.key,
            value: encrypt(envVar.value)
        }));

        await prisma.envVar.createMany({
            data: envVarsToStore
        });
    }

    const projectEnvVars = await prisma.envVar.findMany({
        where: { projectId: project.id }
    });

    const deployment = await prisma.deployment.create({
        data: {
            projectId: project.id,
            status: 'QUEUED'
        }
    });

    const command = new RunTaskCommand({
        cluster: ServerConfig.CLUSTER,
        taskDefinition: ServerConfig.TASK,
        launchType: 'FARGATE',
        count: 1,
        networkConfiguration: {
            awsvpcConfiguration: {
                assignPublicIp: 'ENABLED',
                subnets: [ServerConfig.SUBNET1, ServerConfig.SUBNET2, ServerConfig.SUBNET3],
                securityGroups: [ServerConfig.SECURITY_GROUP]
            }
        },
        overrides: {
            containerOverrides: [{
                name: 'builder-image',
                environment: [
                    { name: 'GIT_REPOSITORY__URL', value: data.gitURL },
                    { name: 'secretAccessKey', value: ServerConfig.SECRET_KEY_ID },
                    { name: 'accessKeyId', value: ServerConfig.ACCESS_KEY_ID },
                    { name: 'PROJECT_ID', value: project.id },
                    { name: 'DEPLOYMENT_ID', value: deployment.id },
                    { name: 'REDIS_URI', value: ServerConfig.REDIS_URI },
                    ...projectEnvVars.map(env => ({ name: env.key, value: decrypt(env.value) }))
                ]
            }]
        }
    });

    await ecsClient.send(command);
    await prisma.deployment.updateMany({
        where: { projectId: project.id, status: 'QUEUED' },
        data: { status: 'IN_PROGRESS' }
    });
    let p = await prisma.project.findUnique({
        where: {
            id: project.id
        },
        include: {
            deployments: {
                include: {
                    logs: {
                        orderBy: {
                            createdAt: 'desc',
                        },
                    }
                },
            },
        }
    })
    return p;
}


async function addEnvVar(user, projectId, data) {
    const encryptedValue = encrypt(data.value);
    const envVar = await prisma.envVar.create({
        data: {
            projectId,
            key: data.key,
            value: encryptedValue
        }
    });
    return envVar;
}

async function getDeploymentLogs(user, deploymentId) {
    const logs = await prisma.log.findMany({
        where: { deploymentId },
        orderBy: { createdAt: 'asc' }
    });
    return logs;
}
async function me(user) {
    try {

        const me = await prisma.user.findUnique({
            where: { id: user.userId },
        });
        if (me) {
            delete me.password;
        }
        return me;
    } catch (err) {
        throw new Error(err)
    }
}

module.exports = {
    registerUser,
    authenticateUser,
    createProject,
    addEnvVar,
    getDeploymentLogs,
    getProject,
    getProjects,
    me

};
