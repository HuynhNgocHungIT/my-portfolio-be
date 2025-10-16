require("dotenv").config();

module.exports = {
  development: {
    username: process.env.DB_USERNAME || "my_portfolio_db_0r2j_user",
    password: process.env.DB_PASSWORD || "iYH1CCu9N7eGdvLjGkUqiSBQpAKBdz0S",
    database: process.env.DB_NAME || "my_portfolio_db_0r2j",
    host:
      process.env.DB_HOST ||
      "dpg-d3nm211gv73c73cesk3g-a.singapore-postgres.render.com",
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
        rejectUnauthorized: false,
      },
    },
  },
  test: {
    username: process.env.DB_USERNAME || "my_portfolio_db_0r2j_user",
    password: process.env.DB_PASSWORD || "iYH1CCu9N7eGdvLjGkUqiSBQpAKBdz0S",
    database: process.env.DB_NAME || "my_portfolio_db_0r2j",
    host:
      process.env.DB_HOST ||
      "dpg-d3nm211gv73c73cesk3g-a.singapore-postgres.render.com",
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
        rejectUnauthorized: false,
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
