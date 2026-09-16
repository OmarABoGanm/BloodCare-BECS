function notFound(req, res) { res.status(404).json({ success: false, message: 'Resource not found', errors: [] }); }
function errorHandler(err,req,res,next){const status=err.code===11000?409:err.status||(err.name==='ValidationError'||err.name==='CastError'?400:500);const message=err.code===11000?'Record already exists.':status===500?'Internal server error':err.name==='ValidationError'?'Invalid record.':err.name==='CastError'?'Invalid identifier.':err.message;res.status(status).json({success:false,message,errors:[]});}
module.exports = { notFound, errorHandler };
