// src/config/database.js
const { DataSource } = require("typeorm");

const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432"),
    username: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "password",
    database: process.env.DB_NAME || "railway_management",
    entities: [__dirname + "/../models/*.js"],
    synchronize: true,
    logging: true,
});

const initializeDatabase = async () => {
    try {
        await AppDataSource.initialize();
        console.log("Database connected successfully!");
    } catch (error) {
        console.error("Database connection failed:", error);
        // Instead of process.exit(1), throw error so tests fail gracefully:
        throw error;
    }
};

module.exports = { AppDataSource, initializeDatabase };
