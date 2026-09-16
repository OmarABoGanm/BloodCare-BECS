const service=require('../services/exportService');
function download(res,result){res.set({'Content-Type':result.contentType,'Content-Disposition':`attachment; filename="${result.filename}"`,'Cache-Control':'no-store'}).send(result.content);}
exports.metadata=async(req,res,next)=>{try{download(res,await service.becsMetadata(req.query.format||'csv'));}catch(e){next(e);}};
exports.audit=async(req,res,next)=>{try{download(res,await service.auditTrail(req.query,req.query.format||'csv'));}catch(e){next(e);}};
