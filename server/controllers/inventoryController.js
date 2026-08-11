const service = require('../services/inventoryService');
exports.list = async (req,res,next) => { try { res.json({ success:true, data: await service.list() }); } catch(e){ next(e); } };
exports.get = async (req,res,next) => { try { const item=await service.get(req.params.bloodType); if(!item) return res.status(404).json({success:false,message:'Inventory record not found',errors:[]}); res.json({success:true,data:item}); } catch(e){next(e);} };
