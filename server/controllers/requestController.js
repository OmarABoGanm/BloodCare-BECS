const service=require('../services/requestService');
exports.create=async(req,res,next)=>{try{res.status(201).json({success:true,message:'Blood request created',data:await service.create(req.body)});}catch(e){next(e);}};
exports.list=async(req,res,next)=>{try{res.json({success:true,data:await service.list(req.query)});}catch(e){next(e);}};
exports.get=async(req,res,next)=>{try{const item=await service.get(req.params.id);if(!item)return res.status(404).json({success:false,message:'Blood request not found',errors:[]});res.json({success:true,data:item});}catch(e){next(e);}};
exports.updateStatus=async(req,res,next)=>{try{const item=await service.updateStatus(req.params.id,req.body.status);if(!item)return res.status(404).json({success:false,message:'Blood request not found',errors:[]});res.json({success:true,message:'Blood request status updated',data:item});}catch(e){next(e);}};
