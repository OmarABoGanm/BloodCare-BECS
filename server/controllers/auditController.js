const service=require('../services/auditService');
exports.list=async(req,res,next)=>{try{res.json({success:true,data:await service.list(req.query)});}catch(e){next(e);}};
exports.get=async(req,res,next)=>{try{const item=await service.get(req.params.id);if(!item)return res.status(404).json({success:false,message:'Audit record not found',errors:[]});res.json({success:true,data:item});}catch(e){next(e);}};
