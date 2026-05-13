const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const morgan = require("morgan");
const dotenv = require("dotenv");
const connectdb = require("./config/connectdb");
const securityHeaders = require('./middleware/securityHeaders');

const envPaths = [
    process.resourcesPath && path.join(process.resourcesPath, '.env'),
    path.resolve(__dirname, '.env'),
].filter(Boolean);

for (const p of envPaths) {
    if (fs.existsSync(p)) {
        dotenv.config({ path: p });
        break;
    }
}

let dbConnectionPromise;

const resolveCorsOptions = () => {
    const configuredOrigins = (process.env.CLIENT_ORIGIN || '')
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean);

    if (configuredOrigins.length === 0) {
        return { origin: true };
    }

    return {
        origin(origin, callback) {
            if (!origin || configuredOrigins.includes(origin)) {
                callback(null, true);
                return;
            }

            callback(new Error('CORS origin not allowed.'));
        },
    };
};

const createApp = () => {
    const app = express();

    app.disable('x-powered-by');
    app.set('trust proxy', 1);
    app.use(morgan('dev'));
    app.use(securityHeaders);
    app.use(express.json({ limit: '100kb' }));
    app.use(cors(resolveCorsOptions()));

    app.use('/api/v1/users', require('./routers/userRoute'));
    app.use('/api/v1/transactions', require('./routers/transactionRoute'));

    app.use((req, res) => {
        res.status(404).json({ success: false, message: 'Route not found.' });
    });

    return app;
};

const ensureDbConnection = async () => {
    if (!dbConnectionPromise) {
        dbConnectionPromise = connectdb();
    }

    return dbConnectionPromise;
};

const startServer = async ({ port = process.env.PORT || 5000 } = {}) => {
    await ensureDbConnection();

    const app = createApp();

    return new Promise((resolve) => {
        const server = app.listen(port, () => {
            console.log(`Server running on port ${port}`);
            resolve({ app, server, port });
        });
    });
};

if (require.main === module) {
    startServer();
}

module.exports = { createApp, startServer };
