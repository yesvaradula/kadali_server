const dbConfig = require('../config/db.config.js');
const Sequelize = require('sequelize');
let sequelize = '';
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
	});

} catch (e) {
	console.log(e);
}
const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.users = require('./user.model')(sequelize, Sequelize);
db.products = require('./product.model')(sequelize, Sequelize);
db.category = require('./category.model')(sequelize, Sequelize);
db.invoice = require('./invoice.model')(sequelize, Sequelize);

module.exports = db;
