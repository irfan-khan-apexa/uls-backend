const { createLogger, format, transports } = require("winston");
require("winston-mongodb");
const path = require("path");
require("dotenv").config();

const { combine, timestamp, errors, json, printf } = format;

const MONGO_URI = process.env.MONGO_URI;
const PROJECT_ID = process.env.PROJECT_ID;

const customFormat = printf(({ level, message, timestamp, file, method, projectID }) => {
    return `${timestamp} | Level: ${level.toUpperCase()} | ProjectID: ${projectID} | File: ${file} | Method: ${method} | Message: ${message}`;
});

const logger = createLogger({
    level: "silly", exitOnError: false,
    // format: combine(timestamp(), errors({ stack: true }), json(), customFormat),
    transports: [
        new transports.Console(),
        new transports.MongoDB({
            db: MONGO_URI,
            collection: "logs",
            level: "silly",
            tryReconnect: true, // Ensure reconnection on failure
            options: { serverSelectionTimeoutMS: 5000 }, // Remove deprecated options
            // format: combine(timestamp(), errors({ stack: true }), json()),
        }),
    ],
});

// Log Levels
const LOG_LEVELS = {
    error: "error",
    warn: "warn",
    info: "info",
    http: "http",
    verbose: "verbose",
    debug: "debug",
    silly: "silly"
};

// Log function
const logMessage = (level, message, file, method) => {
    logger.log({
        level,
        message,
        file: path.basename(file),
        method,
        projectID: PROJECT_ID,
    });
};

module.exports = { logger, logMessage, LOG_LEVELS };
