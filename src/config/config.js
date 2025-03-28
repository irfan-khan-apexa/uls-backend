// src/config/config.js
import dotenv from "dotenv";

dotenv.config(); // Load environment variables

const config = {
    mongoURI: process.env.MONGO_URI || "mongodb://localhost:27017/logging_db", // Fallback for local
    environment: process.env.NODE_ENV || "development",
    projectID: process.env.PROJECT_ID || "default_project_id",
    port: process.env.PORT || 5000,
};

export default config;
