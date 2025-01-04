const scans = require('../services/scan.services');

exports.checkCompanyName = async (req, res) => {
	let results = await scans.checkCompanyName(req.params.name.toLowerCase());
	return res.send({ existing: !!results[0].isExisting }).status(200);
};
