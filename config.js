import dotenv from "dotenv";

dotenv.config();

const config = {
    mongoURI: process.env.MONGO_URI || "mongodb://localhost:27017/logging_db", // Local MongoDB
    environment: process.env.NODE_ENV || "development",
    PROJECT_ID: process.env.PROJECT_ID
};

export default config;
