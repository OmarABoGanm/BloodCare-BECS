const { validationResult } = require('express-validator');
module.exports = (req, res, next) => { const result = validationResult(req); if (!result.isEmpty()) return res.status(400).json({ success: false, message: 'Validation failed', errors: result.array().map((e) => e.msg) }); next(); };
