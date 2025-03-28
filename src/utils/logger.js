// src/utils/logger.js
import { createLogger, format, transports } from "winston";
import "winston-mongodb";
import path from "path";
import config from "../config/config.js";

const { combine, timestamp, errors, json, printf } = format;

// Custom log format
const customFormat = printf(({ level, message, timestamp, file, method, projectID }) => {
    return `${timestamp} | Level: ${level.toUpperCase()} | ProjectID: ${projectID} | File: ${file} | Method: ${method} | Message: ${message}`;
});

// Create logger instance
const logger = createLogger({
    level: "silly",
    exitOnError: false,
    format: combine(timestamp(), errors({ stack: true }), json(), customFormat),
    transports: [
        new transports.Console(),
        new transports.MongoDB({
            db: config.mongoURI,
            collection: "logs",
            level: "silly",
            tryReconnect: true,
            options: { serverSelectionTimeoutMS: 5000 },
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
    silly: "silly",
};

// Log function
const logMessage = (level, message, file, method) => {
    logger.log({
        level,
        message,
        file: path.basename(file),
        method,
        projectID: config.projectID,
    });
};

export { logger, logMessage, LOG_LEVELS };
