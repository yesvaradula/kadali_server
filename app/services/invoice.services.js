// const { now } = require('sequelize/dist/lib/utils');

const db = require("../models");
const { getPercentagesForNew, getPercentagesForOld } = require("./daycounter");
const invoice = db.invoice;
const Op = db.Sequelize.Op;

const productService = require("../services/product.services");

const PRTYPES = {
	NEW: "new",
	OLD: "used",
	ANTIQUE: "antique",
	DAMAGE: "damage",
};

exports.updateInvoice = (req) => {
	const sql = `UPDATE invoice SET 
		to_name = '${req.body.toName}', 
		to_address = '${req.body.address}',
		to_phone = '${req.body.companyPhone}',
		contactname = '${req.body.contactName}',
		contactphone = '${req.body.contactPhone}',
		art_phone = '${req.body.artPhone}',
		art_director_name = '${req.body.artDirector}',
		content_type = '${req.body.contentType}',
		prop_receiver = '${req.body.receiver}',
		gst = '${req.body.gst}',		 
		totalCost = '${req.body.totalCost}',		 
		discount = '${req.body.discount}',
		gstpercentage = '${req.body.gstpercentage}',
		finalamount = '${req.body.finalamount}',
		herodirector = '${req.body.isWhat}',
		name = '${req.body.isWhatName}',
		vendoraddress = '${req.body.vendoraddress}',
		payableamount = '${req.body.payableamount}',
		prop_receiver_name = '${req.body.receiverName}'
		WHERE invoice_id = '${req.body.invoice_id}'
	`;
	return db.sequelize.query(sql, {
		type: db.sequelize.QueryTypes.UPDATE,
	});
};

const getFirstLetter = (words) => {
	let matches = words.match(/\b(\w)/g);
	return matches.join("").toUpperCase();
};

exports.findInvoiceById = (invid) => {
	const sqlCheck = `SELECT count(invoice_id) AS Ids
						FROM invoice WHERE invoice_id LIKE '%${invid}%'`;
	return db.sequelize.query(sqlCheck, {
		type: db.sequelize.QueryTypes.SELECT,
	});
};

exports.addNewInvoice = async (req) => {
	let invoiceStatus = 1;
	let itype = "draft";
	console.log(req.body);
	if (req.body.payment_type === 4) {
		invoiceStatus = 2;
		itype = "invoice"; // As advanced is paid.
	}

	const sql = `INSERT INTO invoice(
		invoice_id, type, to_name, to_address, to_phone,
		contactname, contactphone, art_phone,
		art_director_name, content_type, prop_receiver, pickupDate,
		startDate, endDate, gst, invoice_payment, totalCost,
		invoice_status, discount, gstpercentage, finalamount,
		herodirector, name, vendoraddress, payableamount, prop_receiver_name, isblocked)
	VALUES(
		'${req.body.invoice_id}', '${itype}', '${req.body.toName}', '${req.body.address}', '${req.body.companyPhone}',
		'${req.body.contactName}', '${req.body.contactPhone}', '${req.body.artPhone}',
		'${req.body.artDirector}', '${req.body.contentType}', '${req.body.receiver}',
		'${req.body.pickedon}',
		'${req.body.startDate}', '${req.body.endDate}', '${req.body.gst}', '${req.body.payment_type}', '${req.body.totalCost}',
		'${invoiceStatus}', '${req.body.discount}', '${req.body.gstpercentage}', '${req.body.finalamount}',
		'${req.body.isWhat}', '${req.body.isWhatName}', 
		'${req.body.vendoraddress}', '${req.body.payableamount}', '${req.body.receiver_name}', 
		'${req.body.isBlocked}'
	); `;

	return db.sequelize.query(sql, {
		type: db.sequelize.QueryTypes.INSERT,
	});
	0;
};

exports.clearScannedItem = (req) => {
	const sql = `UPDATE scanned_items SET status =0 WHERE id = '${req.body.scannedItemId}' `;
	return db.sequelize.query(sql, {
		type: db.sequelize.QueryTypes.UPDATE,
	});
};

exports.addPayment = (req) => {
	const sql = `INSERT INTO invoice_payments(
		invoice_id, payment_type, amount, method, transaction_id, cheque_no, bank)
	VALUES(
		'${req.body.invoice_id}',
		'${req.body.payment_type}',
		'${req.body.amt}',
		'${req.body.method}',
		'${req.body.transId}',
		'${req.body.chequeno}',
		'${req.body.bank}'
	); `;

	return db.sequelize.query(sql, {
		type: db.sequelize.QueryTypes.INSERT,
	});
};

exports.changePaymentType = (ptype, id) => {
	const sql = `UPDATE invoice SET invoice_payment = ${ptype} WHERE invoice_id = '${id}' `;
	return db.sequelize.query(sql, {
		type: db.sequelize.QueryTypes.UPDATE,
	});
};

exports.addAddress = (req) => {
	const sql = `UPDATE invoice
	SET
	to_name = '${req.body.toName}', to_address = '${req.body.address}',
		to_phone = '${req.body.city}', gst = '${req.body.gst}'
					WHERE invoice_id = '${req.params.id}' `;
	return db.sequelize.query(sql, {
		type: db.sequelize.QueryTypes.UPDATE,
	});
};

exports.addDraft = (req) => {
	const sql = `INSERT INTO invoice_products(invoice_id, code, days, cost, pickupDate, startDate, endDate, quantity, isBlocked)
	VALUES(
		'${req.body.invoice_id}', '${req.body.code}', '${req.body.days}', '${req.body.cost}',
		'${req.body.pickedon}', '${req.body.startDate}', '${req.body.endDate}', '${req.body.quantity}', '${req.body.isBlocked}'
	); `;
	return db.sequelize.query(sql, {
		type: db.sequelize.QueryTypes.INSERT,
	});
};

exports.getBlockedInvoice = (end) => {
	try {
		const sql = `SELECT i.invoice_id AS invoice,
		COUNT(p.code) AS totalProducts,
		i.createdOn AS CreatedOn,
		i.startDate AS startDate,
		i.endDate AS endDate,
		i.contactName, i.contactPhone,
		i.name, i.herodirector, i.totalCost,
		i.finalamount, i.gstpercentage, i.discount,
		i.payableamount, i.to_name, i.to_phone, i.prop_receiver_name
				FROM invoice i, invoice_products p
				WHERE type = 'draft' AND i.isBlocked = 1
				AND i.invoice_id = p.invoice_id
				AND i.status = 1 AND p.status = 1
				GROUP BY i.invoice_id ORDER BY i.id DESC LIMIT 0, ${end} `;
		return db.sequelize.query(sql, {
			type: db.sequelize.QueryTypes.SELECT,
		});
	} catch (e) {
		console.log(e.getMessage());
	}
};

exports.getDrafts = (end) => {
	try {
		const sql = `SELECT i.invoice_id AS invoice,
		COUNT(p.code) AS totalProducts,
		i.createdOn AS CreatedOn,
		i.startDate AS startDate,
		i.endDate AS endDate,
		i.contactName, i.contactPhone,
		i.name, i.herodirector, i.totalCost,
		i.finalamount, i.gstpercentage, i.discount,
		i.payableamount, i.to_name, i.to_phone, i.prop_receiver_name
				FROM invoice i, invoice_products p
				WHERE type = 'draft' AND i.isBlocked = 0
				AND i.invoice_id = p.invoice_id
				AND i.status = 1 AND p.status = 1
				GROUP BY i.invoice_id ORDER BY i.id DESC LIMIT 0, ${end} `;
		return db.sequelize.query(sql, {
			type: db.sequelize.QueryTypes.SELECT,
		});
	} catch (e) {
		console.log(e.getMessage());
	}
};

exports.markInvoiceAsPrint = (id) => {
	const sql = `UPDATE invoice 
				SET isPrinted = 1
				WHERE invoice_id = '${id}' `;
	return db.sequelize.query(sql, {
		type: db.sequelize.QueryTypes.UPDATE,
	});
};

exports.getAddressOfInvoice = (id) => {
	const sql = `SELECT
	i.to_name, i.to_address, i.to_city, i.gst
				FROM invoice i
				WHERE i.invoice_id = '${id}' `;
	return db.sequelize.query(sql, {
		type: db.sequelize.QueryTypes.SELECT,
	});
};

exports.getInvoicePayments = (invoiceId) => {
	const sql = `SELECT
	i.amount, i.method, i.transaction_id, i.cheque_no,
		i.bank, i.paid_on, p.value AS paidby
				FROM invoice_payments i, invoice_payments_types p
	WHERE
	i.payment_type = p.id AND
	i.invoice_id = '${invoiceId}' 
	ORDER BY i.id DESC
	`;
	return db.sequelize.query(sql, {
		type: db.sequelize.QueryTypes.SELECT,
	});
};

exports.getReturnDetails = (id, isDamaged, isPending) => {
	let sql = "";
	if (isPending == "pending") {
		sql = `SELECT
			i.invoice_id,
			p.id AS product_id,
			p.name AS product_name,
			p.category AS product_category,
			p.model AS product_model,
			p.createdAt AS created_on,
			p.updatedAt AS updated_on,
			p.code AS product_code,
			p.brand AS product_brand,
			p.prtype AS product_type,
			ip.quantity AS quantity,
			i.type AS invoice_type,
			ip.days AS rent_days,
			i.startDate AS rents_start_on,
			p.subcategory AS product_subcategory,
			p.image AS product_image,
			i.to_name, i.to_address, 
			i.invoice_status,
			i.startDate AS startDate,
			i.endDate AS endDate,
			i.contactName, i.contactPhone,
			i.art_director_name, i.content_type, i.prop_receiver, i.art_phone,
			ip.startDate AS pStartDate, ip.endDate AS pEndDate,
			i.paid_on, i.transaction_id, i.payment_method,
			i.name, i.herodirector, i.totalCost,
			i.finalamount, i.gstpercentage, i.discount, i.gst,
			i.herodirector AS isWhat, i.name AS isWhatName,
			i.payableamount, i.vendoraddress, i.gst,
			i.prop_receiver_name, 
			ip.is_damaged, ip.damaged_type, ip.damage_cost
			FROM invoice i, products p, 
			invoice_products ip
			WHERE 
			i.invoice_id = '${id}' AND 
			ip.rstatus = 'NR' AND 
			i.invoice_id = ip.invoice_id AND				
			p.code = ip.code
		`;
	} else {
		sql = `SELECT
			i.invoice_id,
			p.id AS product_id,
			p.name AS product_name,
			p.category AS product_category,
			p.model AS product_model,
			p.createdAt AS created_on,
			p.updatedAt AS updated_on,
			p.code AS product_code,
			p.brand AS product_brand,
			p.prtype AS product_type,
			ip.quantity AS quantity,
			i.type AS invoice_type,
			ip.days AS rent_days,
			i.startDate AS rents_start_on,
			p.subcategory AS product_subcategory,
			p.image AS product_image,
			i.to_name, i.to_address, 
			i.invoice_status,
			i.startDate AS startDate,
			i.endDate AS endDate,
			i.contactName, i.contactPhone,
			i.art_director_name, i.content_type, i.prop_receiver, i.art_phone,
			ip.startDate AS pStartDate, ip.endDate AS pEndDate,
			i.paid_on, i.transaction_id, i.payment_method,
			i.name, i.herodirector, i.totalCost,
			i.finalamount, i.gstpercentage, i.discount, i.gst,
			i.herodirector AS isWhat, i.name AS isWhatName,
			i.payableamount, i.vendoraddress, i.gst,
			i.prop_receiver_name, 			
			i.serial_no,
			ip.is_damaged, ip.damaged_type, ip.damage_cost
			FROM invoice i, products p, 
			invoice_products ip
			WHERE 
			i.invoice_id = '${id}' AND 
			ip.rstatus = 'R' AND 
			ip.is_damaged = ${isDamaged} AND
			i.invoice_id = ip.invoice_id AND				
			( ip.code = p.code )
		`;
	}

	return db.sequelize.query(sql, {
		type: db.sequelize.QueryTypes.SELECT,
	});
};

exports.getDetails = (id) => {
	const sql = `SELECT
				i.invoice_id,
				p.id AS product_id,
				p.name AS product_name,
				p.category AS product_category,
				p.model AS product_model,
				p.createdAt AS created_on,
				p.updatedAt AS updated_on,
				p.code AS product_code,
				p.brand AS product_brand,
				p.prtype AS product_type,
				ip.cost AS cost,
				ip.quantity AS quantity,
				i.type AS invoice_type,
				ip.days AS rent_days,
				i.startDate AS rents_start_on,
				p.subcategory AS product_subcategory,
				p.image AS product_image,
				i.to_name, i.to_address, i.to_phone, i.gst,
				ist.value AS is_value,
				ipt.value AS ip_value,
				i.invoice_status,
				i.startDate AS startDate,
				i.endDate AS endDate,
				i.contactName, i.contactPhone,
				i.art_director_name, i.content_type, i.prop_receiver, i.art_phone,
				ip.startDate AS pStartDate, ip.endDate AS pEndDate,
				i.paid_on, i.transaction_id, i.payment_method,
				i.name, i.herodirector, i.totalCost,
				i.finalamount, i.gstpercentage, i.discount, i.gst,
				i.herodirector AS isWhat, i.name AS isWhatName,
				i.payableamount, i.vendoraddress, i.gst,
				i.prop_receiver_name,
				i.serial_no
				FROM invoice i, products p, invoice_products ip, invoice_status ist, invoice_payments_types ipt
				WHERE i.invoice_id = '${id}'
				AND p.code = ip.code 
				AND i.invoice_id = ip.invoice_id
				AND ist.id = i.invoice_status
				AND ipt.id = i.invoice_payment
				AND i.status = 1 AND ip.status = 1`;
	return db.sequelize.query(sql, {
		type: db.sequelize.QueryTypes.SELECT,
	});
};

exports.getInvoiceAmounts = (id) => {
	const sql = `SELECT
					i.totalCost,
					i.finalamount, i.gstpercentage, i.discount,					
					i.payableamount
				FROM invoice i
				WHERE i.invoice_id = '${id}'
	`;
	return db.sequelize.query(sql, {
		type: db.sequelize.QueryTypes.SELECT,
	});
};

exports.deleteInvoice = async (id) => {
	const sql = `UPDATE invoice SET status = 0
				WHERE invoice_id = '${id}'`;
	return db.sequelize.query(sql, {
		type: db.sequelize.QueryTypes.UPDATE,
	});
};

exports.removeItem = async (id, code, price) => {
	let p = await this.getInvoiceAmounts(id);
	let { totalCost, finalamount, gstpercentage, discount, payableamount } = p[0];

	totalCost = parseFloat(totalCost - price);
	finalamount = totalCost;
	payableamount = totalCost;

	if (discount) {
		let d = parseFloat(totalCost * (discount / 100));
		finalamount = parseFloat(totalCost - d);
		payableamount = finalamount;
	}

	if (gstpercentage > 0) {
		let gst = parseFloat(finalamount * (gstpercentage / 100));
		payableamount = parseFloat(finalamount + gst);
	}

	const sql = `UPDATE invoice SET 
					totalCost = ${totalCost.toFixed(2)},
					finalamount = ${finalamount.toFixed(2)},
					payableamount = ${payableamount.toFixed(2)}
				WHERE invoice_id = '${id}'
				`;

	await db.sequelize.query(sql, {
		type: db.sequelize.QueryTypes.UPDATE,
	});

	const sqlD = `UPDATE invoice_products
					SET status = 0
				WHERE code = '${code}'
				AND invoice_id = '${id}'`;

	return db.sequelize.query(sqlD, {
		type: db.sequelize.QueryTypes.DELETE,
	});
};

exports.invoicePayment = (req) => {
	let d = new Date();
	let nd =
		d.getFullYear() +
		"-" +
		(d.getMonth() + 1) +
		"-" +
		d.getDate() +
		" " +
		d.getHours() +
		":" +
		d.getMinutes() +
		":" +
		d.getSeconds();
	const sql = `UPDATE invoice 
				SET payment_method = '${req.body.payMethod}',
		transaction_id = '${req.body.transId}',
		invoice_payment = 2,
		paid_on = '${nd}'
				WHERE invoice_id = '${req.params.id}' `;
	return db.sequelize.query(sql, {
		type: db.sequelize.QueryTypes.UPDATE,
	});
};

exports.markIt = (id) => {
	const sql = `UPDATE invoice SET type = 'invoice' WHERE invoice_id = '${id}' `;
	return db.sequelize.query(sql, {
		type: db.sequelize.QueryTypes.UPDATE,
	});
};

exports.markAsPaid = (id) => {
	const sql = `UPDATE invoice SET type = 'paid', invoice_payment = 2 WHERE invoice_id = '${id}' `;
	return db.sequelize.query(sql, {
		type: db.sequelize.QueryTypes.UPDATE,
	});
};

exports.markStatusChange = (id, statusId) => {
	const sql = `UPDATE invoice SET invoice_status = ${statusId} WHERE invoice_id = '${id}' `;
	return db.sequelize.query(sql, {
		type: db.sequelize.QueryTypes.UPDATE,
	});
};

exports.getPrintedList = (to) => {
	const sql = `SELECT i.invoice_id AS invoice,
				COUNT(p.code) AS totalProducts,
				SUM(p.cost) AS totalCost,
				i.startDate AS CreatedOn,
				i.to_name, i.to_address, i.to_phone,
				ist.value AS is_value,
				ipt.value AS ip_value,
				i.prop_receiver_name,
				i.paid_on, i.transaction_id, i.payment_method, i.payableamount
				FROM invoice i,
		invoice_products p,
			invoice_status ist,
				invoice_payments_types ipt
				WHERE type = 'paid' 
				AND i.invoice_id = p.invoice_id
				AND i.status = 1 AND p.status = 1
				AND ist.id = i.invoice_status
				AND ipt.id = i.invoice_payment
				AND i.isPrinted = 1
				GROUP BY i.invoice_id ORDER BY i.id DESC LIMIT 0, ${to} `;

	return db.sequelize.query(sql, {
		type: db.sequelize.QueryTypes.SELECT,
	});
};

exports.getInvoiceList = (to) => {
	const sql = `SELECT i.invoice_id AS invoice,
		COUNT(p.code) AS totalProducts,
		SUM(p.cost) AS totalCost,
		i.startDate AS CreatedOn,
		i.pickupDate, 
		i.to_name, i.to_address, i.to_phone,
		ist.value AS is_value,
		ipt.value AS ip_value,
		i.prop_receiver_name,
		i.payableamount
				FROM invoice i,
		invoice_products p,
			invoice_status ist,
				invoice_payments_types ipt
				WHERE type = 'invoice' 
				AND i.invoice_id = p.invoice_id
				AND i.status = 1 AND p.status = 1
				AND ist.id = i.invoice_status
				AND ipt.id = i.invoice_payment
				AND i.invoice_payment <> 2
				GROUP BY i.invoice_id ORDER BY i.id DESC LIMIT 0, ${to} `;

	return db.sequelize.query(sql, {
		type: db.sequelize.QueryTypes.SELECT,
	});
};

exports.searchInvoices = (ss, to) => {
	ss = ss.toLowerCase();
	const sql = `SELECT i.invoice_id AS invoice,
				COUNT(p.code) AS totalProducts,
				SUM(p.cost) AS totalCost,
				i.startDate AS CreatedOn,
				i.to_name, i.to_address, i.to_phone,
				ist.value AS is_value,
				ipt.value AS ip_value,
				i.prop_receiver_name,
				i.paid_on, i.transaction_id, i.payment_method, i.payableamount
				FROM invoice i,
		invoice_products p,
			invoice_status ist,
				invoice_payments_types ipt
				WHERE i.invoice_id = p.invoice_id
				AND i.status = 1 AND p.status = 1
				AND ist.id = i.invoice_status
				AND ipt.id = i.invoice_payment
				AND p.rstatus = 'NR'
				AND type != 'draft' 
				AND (
					LOWER(i.invoice_id) LIKE '%${ss}%'
					OR
					LOWER(to_name) LIKE '%${ss}%'
					OR 
					LOWER(art_director_name) LIKE '%${ss}%'
					OR 
					LOWER(prop_receiver_name) LIKE '%${ss}%'
				)
				GROUP BY i.invoice_id ORDER BY i.id DESC LIMIT 0, ${to} `;

	return db.sequelize.query(sql, {
		type: db.sequelize.QueryTypes.SELECT,
	});
};

exports.getImagesOfInvoice = (id) => {
	const sql = `SELECT IP.quantity, P.code, P.image, I.startDate, I.type
				FROM invoice I, products P, invoice_products IP
				WHERE I.invoice_id = '${id}'
					AND I.invoice_id = IP.invoice_id
					AND IP.code = P.code`;
	return db.sequelize.query(sql, {
		type: db.sequelize.QueryTypes.SELECT,
	});
};

exports.getImagesOfInvoiceByType = (id, iType) => {
	// -- AND I.isBlocked - 0
	const where = `I.invoice_id = '${id}'
					AND I.invoice_id = IP.invoice_id					
					AND IP.code = P.code`;
	let select = `SELECT IP.quantity, P.code, P.image, I.startDate, I.type`;

	let sql = `${select} 
				FROM invoice I, products P, invoice_products IP 
			   	WHERE ${where}`;

	switch (iType) {
		case "pending": {
			sql = `${select}  
					FROM invoice I, products P, invoice_products IP					
					WHERE ${where} AND 
					IP.rstatus = 'NR' AND
					IP.is_damaged = 0 AND
					I.invoice_id = IP.invoice_id AND
					P.code = IP.code`;
			break;
		}
		case "returned": {
			sql = `${select}  
					FROM invoice I, products P, invoice_products IP					
					WHERE ${where} AND 
					IP.rstatus = 'R' AND
					IP.is_damaged = 0 AND
					I.invoice_id = IP.invoice_id AND
					P.code = IP.code`;
			break;
		}

		case "damaged": {
			sql = `${select}  
					FROM invoice I, products P, invoice_products IP					
					WHERE ${where} AND 
					IP.rstatus = 'R' AND
					IP.is_damaged = 1 AND
					I.invoice_id = IP.invoice_id AND
					P.code = IP.code`;
			break;
		}
		default: {
			break;
		}
	}

	return db.sequelize.query(sql, {
		type: db.sequelize.QueryTypes.SELECT,
	});
};

exports.getPaidInvoiceList = (to) => {
	const sql = `SELECT
	i.invoice_id AS invoice,
		COUNT(p.code) AS totalProducts,
			SUM(p.cost) AS totalCost,
				i.startDate AS CreatedOn,
					i.to_name, i.to_address, i.to_phone,
					ist.value AS is_value,
						ipt.value AS ip_value,
							i.prop_receiver_name,
							i.paid_on, i.transaction_id, i.payment_method, i.payableamount
	FROM 
					invoice i,
		invoice_products p,
			invoice_status ist,
				invoice_payments_types ipt
				WHERE type = 'paid' 
				AND i.invoice_id = p.invoice_id
				AND i.status = 1 AND p.status = 1
				AND ist.id = i.invoice_status
				AND ipt.id = i.invoice_payment
				GROUP BY i.invoice_id ORDER BY i.id DESC LIMIT 0, ${to} `;

	return db.sequelize.query(sql, {
		type: db.sequelize.QueryTypes.SELECT,
	});
};

exports.validateReturnProduct = (id, pid) => {
	const sql = `SELECT id, quantity
					FROM invoice_products ip 
					WHERE code = '${pid}'
					AND invoice_id = '${id}'
		`;
	return db.sequelize.query(sql, {
		type: db.sequelize.QueryTypes.SELECT,
	});
};

exports.addReturnProducts = async (product, retDate, invoice_id) => {
	const sql = `INSERT INTO return_products
		(invoice_id, code, quantity, returned_date, is_damaged, damage_cost, damaged_type)
	VALUES(
		'${invoice_id}', '${product.code}', '${product.rquantity}',
		'${retDate}', '${product.isDamaged}', '${product.damaged_cost}',
		'${product.damaged_type}'
	)`;

	return db.sequelize.query(sql, {
		type: db.sequelize.QueryTypes.INSERT,
	});
};

exports.updateProducts = async (product, recievedData) => {
	// console.log(product)
	let q = product.quantity - recievedData.rquantity;

	if (recievedData.isDamaged) {
		let s = `UPDATE products SET quantity = ${q} WHERE id = ${product.id}`;
		db.sequelize.query(s, {
			type: db.sequelize.QueryTypes.UPDATE,
		});

		if (recievedData.damaged_type === "partial") {
			let p = await productService.getProductDetails(`${product.code}-D`);
			if (p.length > 0) {
				let quantity =
					parseInt(p[0].quantity) + parseInt(recievedData.rquantity);
				let s = `UPDATE products 
					SET 
					is_damaged = 1,
					is_fully_damaged = 0,
					quantity = ${quantity} 
					WHERE id = '${p[0].id}'`;
				db.sequelize.query(s, {
					type: db.sequelize.QueryTypes.UPDATE,
				});
			} else {
				let sql = `INSERT INTO products (name, code, image, category, 
					brand, cost, price, quantity, is_damaged, is_fully_damaged,
					alert, model, subcategory, unit, prtype, nickname, godawan)
					VALUES ('${product.name}', '${product.code}-D', 
					'${product.image}', '${product.category}',
					'${product.brand}', '${product.cost}', '${product.price}', 
					'${recievedData.rquantity}', 1, 0,
					'${product.alert}', '${product.model}', '${product.subcategory}', 
					'${product.unit}', 'damage', '${product.nickname}', '${product.godawan}');
				`;
				db.sequelize.query(sql, {
					type: db.sequelize.QueryTypes.UPDATE,
				});
			}
		}

		if (recievedData.damaged_type === "full") {
			let p = await productService.getProductDetails(
				`${product.code}-FULL_DAMAGED`
			);
			if (p.length > 0) {
				let quantity =
					parseInt(p[0].quantity) + parseInt(recievedData.rquantity);
				let s = `UPDATE products 
					SET 
					is_damaged = 1,
					is_fully_damaged = 1,
					quantity = ${quantity} 
					WHERE id = '${p[0].id}'`;
				db.sequelize.query(s, {
					type: db.sequelize.QueryTypes.UPDATE,
				});
			} else {
				let sql = `INSERT INTO products (name, code, image, category, 
					brand, cost, price, quantity, is_damaged, is_fully_damaged,
					alert, model, subcategory, unit, prtype, nickname, godawan, status)
					VALUES ('${product.name}', '${product.code}-FULL_DAMAGED', 
					'${product.image}', '${product.category}',
					'${product.brand}', '0', '${product.price}', 
					'${recievedData.rquantity}', 1, 1,
					'${product.alert}', '${product.model}', '${product.subcategory}', 
					'${product.unit}', 'damage', '${product.nickname}', '${product.godawan}', 0);
				`;

				db.sequelize.query(sql, {
					type: db.sequelize.QueryTypes.UPDATE,
				});
			}
		}
	}
};

exports.archieve = async (req) => {
	console.log(req.body);

	let field =
		req.body.iType === "pending"
			? `is_pending_archieved = ${req.body.archieve}`
			: req.body.iType === "returned"
			? `is_received_archieved = ${req.body.archieve}`
			: `is_damaged_archieved = ${req.body.archieve}`;

	let sql = `UPDATE invoice SET ${field} WHERE invoice_id = '${req.body.invoice}' `;

	db.sequelize.query(sql, {
		type: db.sequelize.QueryTypes.UPDATE,
	});
};

exports.returnList = async (req) => {
	let sql = "";
	if (req.body.type === "pending") {
		sql = `SELECT i.invoice_id AS invoice,
		COUNT(p.code) AS totalProducts,
			SUM(p.cost) AS totalCost,
				i.startDate AS CreatedOn,
					i.to_name, i.to_address, i.to_phone,
					ist.value AS is_value,
						ipt.value AS ip_value,
							i.prop_receiver_name,
							i.content_type,
							i.contactname,
							i.payableamount
				FROM invoice i, invoice_products p, invoice_status ist,
				invoice_payments_types ipt
				WHERE i.invoice_id = p.invoice_id
				AND i.status = 1 AND p.status = 1
				AND ist.id = i.invoice_status
				AND ipt.id = i.invoice_payment
				AND p.rstatus = 'NR'
				AND i.isBlocked = 0
				AND i.type != 'draft'
				AND i.is_pending_archieved = ${req.body?.is_archieved ?? 0}
				GROUP BY i.invoice_id ORDER BY i.id DESC LIMIT 0, 100 `;
	} else {
		let cond = req.body.type === "damaged" ? 1 : 0;
		let r =
			req.body.type === "damaged"
				? " i.is_damaged_archieved"
				: " i.is_received_archieved";
		sql = `SELECT
					rp.invoice_id AS invoice,
					SUM(rp.quantity) AS totalProducts,
						i.to_name,
						i.to_address,
						i.content_type,
						i.contactname,
						rp.returned_date
				FROM
					invoice i,
				return_products rp
				WHERE
				rp.invoice_id = i.invoice_id 
				AND ${r} = ${req.body?.is_archieved ?? 0}
				AND rp.is_damaged = ${cond} 
				GROUP BY rp.invoice_id 
				ORDER BY rp.id DESC
				LIMIT 0, 100`;
	}

	return await db.sequelize.query(sql, {
		type: db.sequelize.QueryTypes.SELECT,
	});
};

exports.updateEndDates = async (p, product, retDate, invoice_id) => {
	const sql = `SELECT id, startDate, quantity, days FROM invoice_products WHERE
	invoice_id = '${invoice_id}' AND rstatus = 'NR' AND code = '${product.original_code}'`;

	console.log(sql);
	const results = await db.sequelize.query(sql, {
		type: db.sequelize.QueryTypes.SELECT,
	});

	let t = new Date(retDate);
	let cost = 0;
	let d = t.getTime() - results[0].startDate.getTime();
	d = Math.ceil(d / (1000 * 3600 * 24)) + 1;

	// console.log("Days - ", d)
	// console.log(results);
	// // console.log(p)

	switch (p[0].prtype) {
		case PRTYPES.ANTIQUE:
		case PRTYPES.NEW: {
			cost = (
				((parseInt(p[0].price) * getPercentagesForNew(parseInt(d))) / 100) *
				parseInt(results[0].quantity)
			).toFixed(2);
			break;
		}
		case PRTYPES.DAMAGE:
		case PRTYPES.OLD: {
			cost = (
				((parseInt(p[0].price) * getPercentagesForOld(parseInt(d))) / 100) *
				parseInt(results[0].quantity)
			).toFixed(2);
			break;
		}
	}

	if (product.rquantity < results[0].quantity) {
		// add new record in invoice and less the number.
		let ss = new Date(results[0].startDate);
		let s = ss.getFullYear() + "-" + (ss.getMonth() + 1) + "-" + ss.getDate();
		let q = product.rquantity;

		switch (p[0].prtype) {
			case PRTYPES.ANTIQUE:
			case PRTYPES.NEW: {
				cost = (
					((parseInt(p[0].price) * getPercentagesForNew(parseInt(d))) / 100) *
					parseInt(q)
				).toFixed(2);
				break;
			}
			case PRTYPES.DAMAGE:
			case PRTYPES.OLD: {
				cost = (
					((parseInt(p[0].price) * getPercentagesForOld(parseInt(d))) / 100) *
					parseInt(q)
				).toFixed(2);
				break;
			}
		}

		const chk = `SELECT id, quantity FROM invoice_products 
					 WHERE
					 endDate = '${retDate}'
						AND is_damaged = ${product.isDamaged}
						AND damaged_type = '${product.damaged_type}'
						AND invoice_id = '${invoice_id}'
						AND code = '${product.code}'
						AND status = 1
					 `;
		const chkR = await db.sequelize.query(chk, {
			type: db.sequelize.QueryTypes.SELECT,
		});

		let insSql;
		if (chkR.length) {
			let quan = Number(chkR[0].quantity) + Number(product.rquantity);
			insSql = `UPDATE invoice_products SET
			 quantity = ${quan}
			WHERE id = ${chkR[0].id}`;
		} else {
			insSql = `INSERT INTO invoice_products
			(endDate, days, cost, invoice_id, code,
				startDate, quantity, rstatus, is_damaged, damage_cost, damaged_type)
			VALUES(
				'${retDate}', ${d}, ${cost}, '${invoice_id}', '${product.code}',
				'${s}', ${q}, 'R', ${product.isDamaged}, ${product.damaged_cost},
				'${product.damaged_type}'
			)`;
		}

		await db.sequelize.query(insSql, {
			type: db.sequelize.QueryTypes.UPDATE,
		});

		// update the old quantity and cost
		let quantity = results[0].quantity - q;

		switch (p[0].prtype) {
			case PRTYPES.ANTIQUE:
			case PRTYPES.NEW: {
				cost = (
					((parseInt(p[0].price) * getPercentagesForNew(parseInt(d))) / 100) *
					parseInt(quantity)
				).toFixed(2);
				break;
			}
			case PRTYPES.DAMAGE:
			case PRTYPES.OLD: {
				cost = (
					((parseInt(p[0].price) * getPercentagesForOld(parseInt(d))) / 100) *
					parseInt(quantity)
				).toFixed(2);
				break;
			}
		}

		const updSql = `UPDATE invoice_products
			SET
			quantity = ${quantity},
			cost = ${cost}
			WHERE
			rstatus = 'NR' AND
			code = '${product.original_code}'`;

		await db.sequelize.query(updSql, {
			type: db.sequelize.QueryTypes.UPDATE,
		});
	} else {
		// update invoice records. ,
		const updSql = `UPDATE invoice_products
			SET
			endDate = '${retDate}',
				days = ${d},
			cost = ${cost}, rstatus = 'R',
				is_damaged = ${product.isDamaged},
			damage_cost = ${product.damaged_cost},
			damaged_type = '${product.damaged_type}',
				code = '${product.code}'
			WHERE
			invoice_id = '${invoice_id}' AND
			rstatus = 'NR' AND
			code = '${product.original_code}'`;

		await db.sequelize.query(updSql, {
			type: db.sequelize.QueryTypes.UPDATE,
		});
	}

	// update price, finalprice and payableamount in invoice.

	const invSql = `SELECT id, gstpercentage, discount FROM invoice 
					WHERE  invoice_id = '${invoice_id}'`;

	const invResults = await db.sequelize.query(invSql, {
		type: db.sequelize.QueryTypes.SELECT,
	});

	let totalCost = 0;
	let finalamount = 0;
	let payableamount = 0;

	// get total cost. ( sum of all products in invoice)

	const sumSql = `SELECT
			SUM(cost) AS C
			FROM
			invoice_products
			WHERE
			invoice_id = '${invoice_id}'
					GROUP BY
			invoice_id`;

	const sumResults = await db.sequelize.query(sumSql, {
		type: db.sequelize.QueryTypes.SELECT,
	});

	totalCost = parseFloat(sumResults[0].C).toFixed(2);

	let discountAmt = totalCost * (invResults[0].discount / 100);
	finalamount = totalCost - discountAmt;

	let gstAmt = finalamount * (invResults[0].gstpercentage / 100);
	payableamount = finalamount + gstAmt;

	const updSql = `UPDATE invoice
			SET
			totalCost = '${totalCost}',
				finalamount = '${finalamount}',
				payableamount = '${payableamount}'
			WHERE
			id = '${invResults[0].id}'`;

	return await db.sequelize.query(updSql, {
		type: db.sequelize.QueryTypes.UPDATE,
	});
};
