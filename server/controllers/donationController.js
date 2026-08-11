const service=require('../services/donationService');
exports.create=async(req,res,next)=>{try{res.status(201).json({success:true,message:'Donation registered',data:await service.create(req.body)});}catch(e){next(e);}};
exports.list=async(req,res,next)=>{try{res.json({success:true,data:await service.list()});}catch(e){next(e);}};
