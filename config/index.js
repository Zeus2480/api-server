require('dotenv').config();

const ServerConfig = {
    PORT: process.env.PORT || 9000,
    ACCESS_KEY_ID: process.env.ACCESS_KEY_ID,
    SECRET_KEY_ID: process.env.SECRET_KEY_ID,
    CLUSTER: process.env.CLUSTER,
    TASK: process.env.TASK,
    SUBNET1: process.env.SUBNET1,
    SUBNET2: process.env.SUBNET2,
    SUBNET3: process.env.SUBNET3,
    SECURITY_GROUP: process.env.SECURITY_GROUP,
    REDIS_URI: process.env.REDIS_URI,
    ENCRYPTION_KEY:process.env.ENCRYPTION_KEY
};

const Logger = {
    info: (message, meta) => console.info(message, meta),
    error: (message, meta) => console.error(message, meta)
};

module.exports = { ServerConfig, Logger };
