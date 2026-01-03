const dbConfig = require("../config/db.config.js");
const Sequelize = require("sequelize");
let sequelize = "";
try {
  sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
    host: dbConfig.HOST,
    port: dbConfig.PORT,
    dialect: dbConfig.dialect,
    operatorsAliases: false,
    pool: {
      max: dbConfig.pool.max,
      min: dbConfig.pool.min,
      acquire: dbConfig.pool.acquire,
      idle: dbConfig.pool.idle,
    },
    hooks: {
      afterConnect: (connection, config) => {
        // Disable ONLY_FULL_GROUP_BY for all new connections
        return new Promise((resolve, reject) => {
          connection.query(
            "SET SESSION sql_mode='STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION'",
            (err) => {
              if (err) reject(err);
              else resolve();
            }
          );
        });
      },
    },
  });

  // Test the connection
  sequelize
    .authenticate()
    .then(() => {
      console.log("Database connection established successfully");
    })
    .catch((err) => {
      console.log("Unable to connect to the database:", err);
    });
} catch (e) {
  console.log(e);
}
const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.users = require("./user.model")(sequelize, Sequelize);
db.products = require("./product.model")(sequelize, Sequelize);
db.category = require("./category.model")(sequelize, Sequelize);
db.invoice = require("./invoice.model")(sequelize, Sequelize);

module.exports = db;
