function notFound(req, res) { res.status(404).json({ success: false, message: 'Resource not found', errors: [] }); }
function errorHandler(err, req, res, next) { const status = err.status || (err.name === 'ValidationError' || err.name === 'CastError' ? 400 : 500); const message = status === 500 && process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message; res.status(status).json({ success: false, message, errors: err.errors ? Object.values(err.errors).map((e) => e.message) : [] }); }
module.exports = { notFound, errorHandler };
