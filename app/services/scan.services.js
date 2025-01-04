const db = require('../models');
const products = db.products;
const Op = db.Sequelize.Op;

exports.checkCompanyName = (company) => {
	let sql = `SELECT count(id) as isExisting FROM scanned_items WHERE status = 1 
    AND lower(company) = '${company}'`;
	return db.sequelize.query(sql, {
		type: db.sequelize.QueryTypes.SELECT,
	});
};
