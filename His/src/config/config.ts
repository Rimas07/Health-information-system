/* eslint-disable prettier/prettier */

export default () => {
   

    const config = {
        server: {
            port: process.env.PORT || 3000,// main port HIS APP, PROXY WILL RUN ON PORT 30001

        },
        database: {
            connectionString: process.env.DB_CONNECTION_STRING || 'mongodb://host.docker.internal:27017/master',// MNG CONNECT
        },
        security: {
            encryptionSecretKey: process.env.ENCRYPTION_KEY,// encryption key from env
            jwtExpiresIn: process.env.JWT_EXPIRES_IN || '15min',// fix token from 1h to 15 min
        },
        rabbitmq: {
            url: process.env.RABBITMQ_URL || 'amqp://hisapp:hisapp123@localhost:5672',
            queue: process.env.RABBITMQ_QUEUE || 'audit-queue',
        },
    };

   

    return config;
};