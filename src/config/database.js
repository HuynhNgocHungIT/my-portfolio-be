const { Sequelize } = require("sequelize");
require("dotenv").config();

// Database configuration for different environments
const config = {
  development: {
    username: process.env.DB_USERNAME || "postgres",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "my_portfolio_db_0r2j",
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 5432,
    dialect: "postgres",
    logging: process.env.NODE_ENV === "development" ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true,
    },
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false, // bắt buộc để Render không báo lỗi SSL
      },
    },
  },
  test: {
    username: process.env.DB_USERNAME || "postgres",
    password: process.env.DB_PASSWORD || "",
    database: process.env.TEST_DB_NAME || "my_portfolio_db_0r2j",
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 5432,
    dialect: "postgres",
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true,
    },
     dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false, // bắt buộc để Render không báo lỗi SSL
      },
    },
  },
  production: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: "postgres",
    logging: false,
    pool: {
      max: 20,
      min: 0,
      acquire: 60000,
      idle: 10000,
    },
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true,
    },
    dialectOptions: {
      ssl:
        process.env.DB_SSL === "true"
          ? {
              require: true,
              rejectUnauthorized: false,
            }
          : false,
    },
  },
};

// Get current environment configuration
const env = process.env.NODE_ENV || "development";
const currentConfig = config[env];
// Create Sequelize instance
const sequelize = new Sequelize(
  currentConfig.database,
  currentConfig.username,
  currentConfig.password,
  currentConfig
);

// Test database connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log(`✅ Database connection established successfully (${env})`);
    console.log(
      `📊 Connected to: ${currentConfig.host}:${currentConfig.port}/${currentConfig.database}`
    );
    return true;
  } catch (error) {
    console.error("❌ Unable to connect to the database:", error.message);
    return false;
  }
};

// Initialize database (sync models)
const initializeDatabase = async (force = false) => {
  try {
    // Import all models here when they are created
    const models = require("../models");

    await sequelize.sync({ force });
    console.log(`✅ Database synchronized successfully (force: ${force})`);
    return true;
  } catch (error) {
    console.error("❌ Database synchronization failed:", error.message);
    return false;
  }
};

// Close database connection
const closeConnection = async () => {
  try {
    await sequelize.close();
    console.log("✅ Database connection closed successfully");
  } catch (error) {
    console.error("❌ Error closing database connection:", error.message);
  }
};

module.exports = {
  sequelize,
  config,
  testConnection,
  initializeDatabase,
  closeConnection,
};
