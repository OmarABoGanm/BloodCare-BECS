const service = require('../services/emergencyAllocationService');
exports.simulate = async (req,res,next) => { try { res.status(201).json({ success:true, message:'Emergency allocation simulated; inventory was not changed', data:await service.simulate(req.body) }); } catch(e) { next(e); } };
exports.confirm = async (req,res,next) => { try { res.json({ success:true, message:'Emergency allocation confirmed and inventory updated', data:await service.confirm(req.body.simulationId) }); } catch(e) { next(e); } };
exports.list = async (req,res,next) => { try { res.json({ success:true, data:await service.list() }); } catch(e) { next(e); } };
exports.get = async (req,res,next) => { try { const item=await service.get(req.params.id); if(!item)return res.status(404).json({success:false,message:'Emergency event not found',errors:[]}); res.json({success:true,data:item}); } catch(e) { next(e); } };
